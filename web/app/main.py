"""NetLab: the interactive web edition of the CCNA and CCNP study kits."""
import json
import logging
import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from starlette.middleware.sessions import SessionMiddleware

from . import config, services
from .content import DOC_BLURBS, DOC_ORDER, KIT_TITLES, SOURCE_NOUNS, SOURCE_TITLES, TRACKS, get_content, kits_for
from .db import SessionLocal, as_utc, get_db, utcnow
from .models import ROLES, User
from .services import ServiceError

log = logging.getLogger("netlab")


@asynccontextmanager
async def lifespan(_app):
    content = get_content()
    if config.AUTH_ENABLED:
        with SessionLocal() as db:
            if services.ensure_admin_password(db, config.APP_PASSWORD):
                log.info("the admin account's password was set from APP_PASSWORD")
    else:
        log.warning("APP_PASSWORD is not set: the site is open to anyone who can reach it.")
    log.info("content loaded: %s", content.stats)
    yield


app = FastAPI(title="NetLab", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
templates = Jinja2Templates(directory=config.APP_DIR + "/templates")
app.mount("/static", StaticFiles(directory=config.APP_DIR + "/static"), name="static")
for kit, path in config.MEDIA_DIRS.items():
    app.mount("/media/%s" % kit, StaticFiles(directory=path), name="media-" + kit)

PUBLIC_PREFIXES = ("/login", "/static/", "/healthz")
ASSET_VERSION = str(int(time.time()))


def pct(part, whole):
    return round(100 * part / whole) if whole else 0


templates.env.globals.update(
    pct=pct, ASSET_VERSION=ASSET_VERSION, AUTH_ENABLED=config.AUTH_ENABLED,
    DOC_ORDER=DOC_ORDER, SOURCE_TITLES=SOURCE_TITLES, SOURCE_NOUNS=SOURCE_NOUNS)


# ---------------------------------------------------------------------------
# auth
# ---------------------------------------------------------------------------

_failures: dict[str, deque] = defaultdict(deque)
MAX_FAILURES, FAILURE_WINDOW = 5, 15 * 60


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _locked_out(ip: str) -> bool:
    q = _failures[ip]
    while q and q[0] < time.time() - FAILURE_WINDOW:
        q.popleft()
    return len(q) >= MAX_FAILURES


def _load_user(uid, version) -> User | None:
    with SessionLocal() as db:
        if not config.AUTH_ENABLED:
            # No login locally: everything happens as the first admin.
            user = db.scalars(select(User).where(User.role == "admin").order_by(User.id)).first()
        else:
            user = db.get(User, uid) if isinstance(uid, int) else None
            if user is None or user.session_version != version or not user.password_hash:
                return None
        if user is not None:
            # Which kit(s) the person is studying shapes every page, so it travels with them.
            user.track = services.get_settings(db, user.id)["track"]
        return user


@app.middleware("http")
async def require_login(request: Request, call_next):
    path = request.url.path
    request.state.user = None
    if not path.startswith(PUBLIC_PREFIXES):
        request.state.user = await run_in_threadpool(
            _load_user, request.session.get("uid"), request.session.get("ver"))
    if request.state.user is None and not path.startswith(PUBLIC_PREFIXES):
        # Signed out, or the account was deleted or its password changed since this session began.
        request.session.clear()
        if path.startswith("/api/"):
            return JSONResponse({"error": "Your session has expired. Sign in again."}, status_code=401)
        nxt = path + ("?" + request.url.query if request.url.query else "")
        return RedirectResponse("/login?next=" + _safe_next(nxt), status_code=303)
    if path.startswith("/api/") and request.method != "GET":
        # Same-origin fetches send this header; a cross-site form can't.
        if request.headers.get("x-requested-with") != "fetch":
            return JSONResponse({"error": "bad request"}, status_code=400)
    return await call_next(request)


# Added after require_login so it wraps it: the session is decoded first.
app.add_middleware(SessionMiddleware, secret_key=config.SECRET_KEY, session_cookie="netlab",
                   max_age=config.SESSION_DAYS * 86400, same_site="lax",
                   https_only=config.SECURE_COOKIES)


def _safe_next(nxt: str | None) -> str:
    if not nxt or not nxt.startswith("/") or nxt.startswith("//"):
        return "/"
    return nxt


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request, next: str = "/"):
    if not config.AUTH_ENABLED or _load_user(request.session.get("uid"), request.session.get("ver")):
        return RedirectResponse(_safe_next(next), status_code=303)
    return templates.TemplateResponse(request, "login.html",
                                      {"next": _safe_next(next), "error": None, "username": ""})


@app.post("/login", response_class=HTMLResponse)
async def login_submit(request: Request):
    form = await request.form()
    nxt = _safe_next(str(form.get("next", "/")))
    username = str(form.get("username", ""))[:64]
    ip = _client_ip(request)
    if _locked_out(ip):
        return templates.TemplateResponse(
            request, "login.html",
            {"next": nxt, "username": username, "error": "Too many attempts. Wait 15 minutes and try again."},
            status_code=429)
    password = str(form.get("password", ""))[:services.MAX_PASSWORD]

    def check():
        with SessionLocal() as db:
            return services.authenticate(db, username, password)

    user = await run_in_threadpool(check) if config.AUTH_ENABLED else None
    if user is not None:
        _failures.pop(ip, None)
        request.session.clear()
        request.session["uid"], request.session["ver"] = user.id, user.session_version
        return RedirectResponse(nxt, status_code=303)
    _failures[ip].append(time.time())
    return templates.TemplateResponse(request, "login.html",
                                      {"next": nxt, "username": username,
                                       "error": "That username and password don't match."},
                                      status_code=401)


@app.post("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login" if config.AUTH_ENABLED else "/", status_code=303)


@app.get("/healthz")
def healthz():
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"ok": True, "content": get_content().stats}


@app.exception_handler(ServiceError)
async def _service_error(request: Request, exc: ServiceError):
    return JSONResponse({"error": str(exc)}, status_code=400)


@app.exception_handler(RequestValidationError)
async def _validation_error(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    if errors:
        e = errors[0]
        field = ".".join(str(x) for x in e.get("loc", ())[1:]) or "request"
        msg = "%s: %s" % (field, e.get("msg", "invalid"))
    else:
        msg = "invalid request"
    return JSONResponse({"error": msg}, status_code=422)


def render(request: Request, name: str, nav: str, **ctx):
    user = request.state.user
    track = user.track if user else "both"
    return templates.TemplateResponse(request, name, dict(
        ctx, nav=nav, user=user, AUTH_ENABLED=config.AUTH_ENABLED,
        track=track, TRACKS=TRACKS, kits=kits_for(track), KIT_TITLES=KIT_TITLES))


def kits(request: Request) -> set:
    """The kits the signed-in person is studying: {"ccnp"}, {"ccna"} or both."""
    return kits_for(request.state.user.track)


def current_user(request: Request) -> User:
    return request.state.user


def require_admin(request: Request) -> User:
    user = request.state.user
    if not user.is_admin:
        raise HTTPException(status_code=404)
    return user


def not_found():
    raise HTTPException(status_code=404)


@app.exception_handler(404)
async def _not_found(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse({"error": "not found"}, status_code=404)
    return templates.TemplateResponse(request, "404.html",
                                      {"nav": "", "user": getattr(request.state, "user", None)},
                                      status_code=404)


# ---------------------------------------------------------------------------
# pages
# ---------------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    content = get_content()
    return render(request, "dashboard.html", "home", d=services.dashboard(db, user.id, content, kits(request)),
                  content=content)


@app.get("/read", response_class=HTMLResponse)
def library(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    content = get_content()
    docs = []
    for doc_id in content.doc_ids(kits(request)):
        doc = content.docs[doc_id]
        prog = services.page_progress(db, user.id, doc_id)
        done = len(services.done_pages(db, user.id, content, doc_id, prog=prog))
        visited = [r for r in prog.values() if r.last_visited_at]
        last = max(visited, key=lambda r: as_utc(r.last_visited_at)) if visited else None
        docs.append({"id": doc_id, "kit": doc["kit"], "title": doc["title"], "blurb": DOC_BLURBS[doc_id],
                     "done": done, "total": len(doc["order"]),
                     "chapters": sum(1 for c in doc["chapters"] if c["number"]),
                     "resume": doc["pages"][last.page_id] if last and last.page_id in doc["pages"] else None,
                     "first": doc["order"][0]})
    return render(request, "library.html", "read", docs=docs)


@app.get("/read/{doc_id}", response_class=HTMLResponse)
def doc_index(request: Request, doc_id: str, db: Session = Depends(get_db),
              user: User = Depends(current_user)):
    content = get_content()
    doc = content.doc(doc_id)
    if doc is None:
        not_found()
    prog = services.page_progress(db, user.id, doc_id)
    results = services.latest_results(db, user.id)
    done = services.done_pages(db, user.id, content, doc_id, prog=prog, results=results)
    chapters = []
    for c in doc["chapters"]:
        pages = [doc["pages"][p] for p in c["pages"]]
        qids = [q for p in pages for q in p["questions"]]
        answered = [results[q][0] for q in qids if q in results]
        chapters.append({"c": c, "pages": pages,
                         "done": sum(1 for p in pages if p["id"] in done),
                         "questions": len(qids), "answered": len(answered), "correct": sum(answered)})
    return render(request, "doc.html", "read", doc=doc, chapters=chapters, done=done, total_done=len(done))


@app.get("/read/{doc_id}/{page_id}", response_class=HTMLResponse)
def read_page(request: Request, doc_id: str, page_id: str, db: Session = Depends(get_db),
              user: User = Depends(current_user)):
    content = get_content()
    page = content.page(doc_id, page_id)
    if page is None:
        not_found()
    doc = content.docs[doc_id]
    row = services.visit_page(db, user.id, doc_id, page_id)
    chapter = content.chapter_of(doc_id, page_id)
    status = services.page_question_status(db, user.id, page["questions"])
    done = services.done_pages(db, user.id, content, doc_id)
    return render(request, "page.html", "read", doc=doc, page=page, chapter=chapter,
                  row=row, done=done, page_done=page_id in done,
                  prev=doc["pages"].get(page["prev"]) if page["prev"] else None,
                  next=doc["pages"].get(page["next"]) if page["next"] else None,
                  status=status, position=doc["order"].index(page_id) + 1)


@app.get("/quiz", response_class=HTMLResponse)
def quiz_builder(request: Request, source: str = "", group: str | None = None,
                 filter: str = "all", db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    content = get_content()
    visible = content.sources(kits(request))
    if source not in visible:
        source = visible[0]
    results = services.latest_results(db, user.id)
    sources = {s: services.group_accuracy(content, results, s) for s in visible}
    return render(request, "quiz_builder.html", "quiz", sources=sources, source=source,
                  preselect=group, qfilter=filter if filter in services.QUIZ_FILTERS else "all",
                  parts=content.ccnp_parts, quizzes=services.recent_quizzes(db, user.id, 15, content, kits(request)),
                  settings=services.get_settings(db, user.id))


@app.get("/quiz/{quiz_id}", response_class=HTMLResponse)
def quiz_page(request: Request, quiz_id: int, db: Session = Depends(get_db),
              user: User = Depends(current_user)):
    try:
        quiz = services.get_quiz(db, user.id, quiz_id)
    except ServiceError:
        not_found()
    return render(request, "quiz.html", "quiz", quiz=quiz)


@app.get("/cards", response_class=HTMLResponse)
def cards_home(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    content = get_content()
    counts = services.card_counts(db, user.id, content)
    settings = services.get_settings(db, user.id)
    tz = services.local_tz(db, user.id)
    new_left = max(0, settings["new_cards_per_day"] - services.new_cards_introduced_today(db, user.id, tz))
    return render(request, "cards.html", "cards", decks=content.decks_for(kits(request)), counts=counts,
                  new_left=new_left, settings=settings)


@app.get("/cards/study", response_class=HTMLResponse)
def cards_study(request: Request, deck: str | None = None, mode: str = "due"):
    content = get_content()
    if deck and deck not in content.deck_by_id:
        not_found()
    if mode not in ("due", "cram"):
        mode = "due"
    pool = [c for c in content.cards if c["deck"] == deck] if deck else content.cards_for(kits(request))
    return render(request, "cards_study.html", "cards", deck=content.deck_by_id.get(deck), mode=mode,
                  cram_cards=pool if mode == "cram" else None)


@app.get("/cards/browse", response_class=HTMLResponse)
def cards_browse(request: Request, deck: str | None = None, db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    content = get_content()
    if deck and deck not in content.deck_by_id:
        not_found()
    states = services.card_states(db, user.id)
    cards = [c for c in content.cards if c["deck"] == deck] if deck else content.cards_for(kits(request))
    return render(request, "cards_browse.html", "cards", deck=content.deck_by_id.get(deck),
                  decks=content.decks_for(kits(request)), cards=cards, states=states, now=utcnow(), as_utc=as_utc)


@app.get("/subnetting", response_class=HTMLResponse)
def subnetting(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    return render(request, "subnetting.html", "subnet", stats=services.drill_stats(db, user.id, days=30),
                  drill_count=len(get_content().drills["drills"]))


@app.get("/subnetting/drills", response_class=HTMLResponse)
def subnetting_drills(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    content = get_content()
    return render(request, "drills.html", "subnet", drills=content.drills,
                  results=services.sheet_results(db, user.id))


@app.get("/subnetting/toolkit", response_class=HTMLResponse)
def subnetting_toolkit(request: Request):
    return render(request, "toolkit.html", "subnet", drills=get_content().drills)


@app.get("/labs", response_class=HTMLResponse)
def labs(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    content = get_content()
    progress, checks = services.lab_status(db, user.id)
    return render(request, "labs.html", "labs", labs=content.labs_for(kits(request)), intros=content.labs_intro_html,
                  progress=progress, checks=checks)


@app.get("/labs/{lab_id}", response_class=HTMLResponse)
def lab_page(request: Request, lab_id: str, db: Session = Depends(get_db),
             user: User = Depends(current_user)):
    content = get_content()
    lab = content.labs_by_id.get(lab_id)
    if lab is None:
        not_found()
    progress, checks = services.lab_status(db, user.id)
    # Previous/next stay inside the lab's own workbook.
    book = content.labs_for({lab["kit"]})
    idx = book.index(lab)
    return render(request, "lab.html", "labs", lab=lab, row=progress.get(lab_id),
                  checked=sorted(checks.get(lab_id, set())),
                  prev=book[idx - 1] if idx else None,
                  next=book[idx + 1] if idx + 1 < len(book) else None)


@app.get("/terminal", response_class=HTMLResponse)
def terminal_labs(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    return render(request, "terminal.html", "terminal", labs=get_content().terminal_for(kits(request)),
                  progress=services.terminal_status(db, user.id))


@app.get("/terminal/{lab_id}", response_class=HTMLResponse)
def terminal_lab(request: Request, lab_id: str, db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    content = get_content()
    lab = content.terminal_by_id.get(lab_id)
    if lab is None:
        not_found()
    row = services.terminal_status(db, user.id).get(lab_id)
    shown = content.terminal_for(kits(request))
    if lab not in shown:
        shown = content.terminal_labs  # opened by link from the other track
    idx = shown.index(lab)
    spec = {k: lab[k] for k in ("id", "devices", "links", "initial", "height")}
    spec["tasks"] = [{"checks": t["checks"]} for t in lab["tasks"]]
    return render(request, "terminal_lab.html", "terminal", lab=lab, spec=spec, row=row,
                  saved=json.loads(row.state) if row and row.state else None,
                  prev=shown[idx - 1] if idx else None,
                  next=shown[idx + 1] if idx + 1 < len(shown) else None)


@app.get("/users", response_class=HTMLResponse)
def users_page(request: Request, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return render(request, "users.html", "users", users=services.list_users(db), roles=ROLES,
                  min_password=services.MIN_PASSWORD)


@app.get("/search", response_class=HTMLResponse)
def search(request: Request, q: str = ""):
    q = q.strip()[:200]
    results = get_content().search(q, kits(request)) if q else []
    return render(request, "search.html", "search", q=q, results=results)


@app.get("/settings", response_class=HTMLResponse)
def settings_page(request: Request, db: Session = Depends(get_db), user: User = Depends(current_user)):
    return render(request, "settings.html", "settings", settings=services.get_settings(db, user.id),
                  min_password=services.MIN_PASSWORD, stats=get_content().stats)


# ---------------------------------------------------------------------------
# JSON API
# ---------------------------------------------------------------------------

class PageRef(BaseModel):
    doc: str
    page: str


class PageNote(BaseModel):
    doc: str
    page: str
    note: str = Field(max_length=20000)


class Answer(BaseModel):
    selected: list[str]


class QuizAnswer(BaseModel):
    question: str
    selected: list[str]


class NewQuiz(BaseModel):
    source: str
    groups: list[str] = []
    filter: str = "all"
    count: int = Field(20, ge=1, le=1000)
    mode: str = "practice"


class Review(BaseModel):
    rating: int = Field(ge=1, le=4)


class Drill(BaseModel):
    kind: str
    correct: bool
    duration_ms: int | None = None
    item_id: str | None = None


class Check(BaseModel):
    checked: bool


class TerminalSave(BaseModel):
    state: dict
    passing: list[int] = Field(default_factory=list, max_length=100)


class NewUser(BaseModel):
    username: str = Field(max_length=64)
    password: str = Field(max_length=services.MAX_PASSWORD)
    role: str = "user"


class NewPassword(BaseModel):
    password: str = Field(max_length=services.MAX_PASSWORD)


class OwnPassword(BaseModel):
    current: str = Field(max_length=services.MAX_PASSWORD)
    password: str = Field(max_length=services.MAX_PASSWORD)


class RoleChange(BaseModel):
    role: str


class LabFlag(BaseModel):
    completed: bool


class LabNote(BaseModel):
    note: str = Field(max_length=20000)


def _require_page(doc: str, page: str):
    if get_content().page(doc, page) is None:
        raise ServiceError("unknown page")


@app.post("/api/pages/read")
def api_page_read(body: PageRef, db: Session = Depends(get_db), user: User = Depends(current_user)):
    _require_page(body.doc, body.page)
    services.set_page_read(db, user.id, get_content(), body.doc, body.page)
    return {"ok": True}


@app.put("/api/pages/note")
def api_page_note(body: PageNote, db: Session = Depends(get_db), user: User = Depends(current_user)):
    _require_page(body.doc, body.page)
    services.set_page_note(db, user.id, body.doc, body.page, body.note)
    return {"ok": True}


@app.post("/api/questions/{qid}/answer")
def api_answer(qid: str, body: Answer, db: Session = Depends(get_db), user: User = Depends(current_user)):
    return services.record_reader_answer(db, user.id, get_content(), qid, body.selected)


@app.post("/api/quiz")
def api_new_quiz(body: NewQuiz, db: Session = Depends(get_db), user: User = Depends(current_user)):
    quiz = services.create_quiz(db, user.id, get_content(), body.source, body.groups, body.filter,
                                body.count, body.mode)
    return {"id": quiz.id, "url": "/quiz/%d" % quiz.id}


@app.get("/api/quiz/{quiz_id}")
def api_quiz(quiz_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    quiz = services.get_quiz(db, user.id, quiz_id)
    return services.quiz_state(db, get_content(), quiz)


@app.post("/api/quiz/{quiz_id}/answer")
def api_quiz_answer(quiz_id: int, body: QuizAnswer, db: Session = Depends(get_db),
                    user: User = Depends(current_user)):
    quiz = services.get_quiz(db, user.id, quiz_id)
    return services.answer_quiz(db, get_content(), quiz, body.question, body.selected)


@app.post("/api/quiz/{quiz_id}/finish")
def api_quiz_finish(quiz_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    quiz = services.finish_quiz(db, services.get_quiz(db, user.id, quiz_id))
    return services.quiz_state(db, get_content(), quiz)


@app.delete("/api/quiz/{quiz_id}")
def api_quiz_delete(quiz_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    services.delete_quiz(db, services.get_quiz(db, user.id, quiz_id))
    return {"ok": True}


@app.get("/api/cards/queue")
def api_card_queue(request: Request, deck: str | None = None, db: Session = Depends(get_db),
                   user: User = Depends(current_user)):
    return services.card_queue(db, user.id, get_content(), deck or None, kits(request))


@app.post("/api/cards/{card_id}/review")
def api_card_review(card_id: str, body: Review, db: Session = Depends(get_db),
                    user: User = Depends(current_user)):
    return services.review_card(db, user.id, get_content(), card_id, body.rating)


@app.post("/api/drills")
def api_drill(body: Drill, db: Session = Depends(get_db), user: User = Depends(current_user)):
    services.record_drill(db, user.id, get_content(), body.kind, body.correct, body.duration_ms, body.item_id)
    return {"ok": True}


@app.get("/api/drills/stats")
def api_drill_stats(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return services.drill_stats(db, user.id, days=30)


@app.post("/api/labs/{lab_id}/items/{item_id}")
def api_lab_item(lab_id: str, item_id: str, body: Check, db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    services.set_lab_item(db, user.id, get_content(), lab_id, item_id, body.checked)
    return {"ok": True}


@app.post("/api/labs/{lab_id}/complete")
def api_lab_complete(lab_id: str, body: LabFlag, db: Session = Depends(get_db),
                     user: User = Depends(current_user)):
    services.set_lab_complete(db, user.id, get_content(), lab_id, body.completed)
    return {"ok": True}


@app.put("/api/labs/{lab_id}/note")
def api_lab_note(lab_id: str, body: LabNote, db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    services.set_lab_note(db, user.id, get_content(), lab_id, body.note)
    return {"ok": True}


@app.put("/api/terminal/{lab_id}")
def api_terminal_save(lab_id: str, body: TerminalSave, db: Session = Depends(get_db),
                      user: User = Depends(current_user)):
    return services.save_terminal(db, user.id, get_content(), lab_id, body.state, body.passing)


@app.delete("/api/terminal/{lab_id}")
def api_terminal_reset(lab_id: str, db: Session = Depends(get_db), user: User = Depends(current_user)):
    services.reset_terminal(db, user.id, get_content(), lab_id)
    return {"ok": True}


@app.post("/api/settings")
def api_settings(body: dict, db: Session = Depends(get_db), user: User = Depends(current_user)):
    return services.update_settings(db, user.id, body)


def _user_json(u: User) -> dict:
    return {"id": u.id, "username": u.username, "role": u.role,
            "created_at": as_utc(u.created_at).isoformat(),
            "last_login_at": as_utc(u.last_login_at).isoformat() if u.last_login_at else None}


@app.post("/api/users")
def api_create_user(body: NewUser, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return _user_json(services.create_user(db, body.username, body.password, body.role))


@app.put("/api/users/{user_id}/password")
def api_reset_password(request: Request, user_id: int, body: NewPassword, db: Session = Depends(get_db),
                       admin: User = Depends(require_admin)):
    user = services.get_user(db, user_id)
    services.set_password(db, user, body.password)
    if user.id == admin.id:
        request.session["ver"] = user.session_version
    return {"ok": True}


@app.put("/api/users/{user_id}/role")
def api_set_role(user_id: int, body: RoleChange, db: Session = Depends(get_db),
                 admin: User = Depends(require_admin)):
    user = services.get_user(db, user_id)
    services.set_role(db, admin, user, body.role)
    return _user_json(user)


@app.delete("/api/users/{user_id}")
def api_delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    services.delete_user(db, admin, services.get_user(db, user_id))
    return {"ok": True}


@app.put("/api/account/password")
def api_own_password(request: Request, body: OwnPassword, db: Session = Depends(get_db),
                     user: User = Depends(current_user)):
    me = services.get_user(db, user.id)
    services.change_own_password(db, me, body.current, body.password)
    # Keep this session signed in; every other one ends.
    request.session["ver"] = me.session_version
    return {"ok": True}
