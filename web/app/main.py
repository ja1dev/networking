"""NetLab: the interactive web edition of the CCNA and CCNP study kits."""
import hmac
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
from sqlalchemy import text
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware

from . import config, services
from .content import DOC_BLURBS, DOC_ORDER, SOURCE_TITLES, get_content
from .db import SessionLocal, as_utc, get_db, utcnow
from .services import ServiceError

log = logging.getLogger("netlab")


@asynccontextmanager
async def lifespan(_app):
    content = get_content()
    if not config.AUTH_ENABLED:
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
    DOC_ORDER=DOC_ORDER, SOURCE_TITLES=SOURCE_TITLES)


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


@app.middleware("http")
async def require_login(request: Request, call_next):
    path = request.url.path
    if (config.AUTH_ENABLED and not path.startswith(PUBLIC_PREFIXES)
            and not request.session.get("auth")):
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
    if not config.AUTH_ENABLED or request.session.get("auth"):
        return RedirectResponse(_safe_next(next), status_code=303)
    return templates.TemplateResponse(request, "login.html", {"next": _safe_next(next), "error": None})


@app.post("/login", response_class=HTMLResponse)
async def login_submit(request: Request):
    form = await request.form()
    nxt = _safe_next(str(form.get("next", "/")))
    ip = _client_ip(request)
    if _locked_out(ip):
        return templates.TemplateResponse(
            request, "login.html",
            {"next": nxt, "error": "Too many attempts. Wait 15 minutes and try again."},
            status_code=429)
    password = str(form.get("password", ""))
    if config.AUTH_ENABLED and hmac.compare_digest(password.encode(), config.APP_PASSWORD.encode()):
        _failures.pop(ip, None)
        request.session.clear()
        request.session["auth"] = True
        return RedirectResponse(nxt, status_code=303)
    _failures[ip].append(time.time())
    return templates.TemplateResponse(request, "login.html",
                                      {"next": nxt, "error": "That password isn't right."},
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
    return templates.TemplateResponse(request, name, dict(ctx, nav=nav))


def not_found():
    raise HTTPException(status_code=404)


@app.exception_handler(404)
async def _not_found(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse({"error": "not found"}, status_code=404)
    return templates.TemplateResponse(request, "404.html", {"nav": ""}, status_code=404)


# ---------------------------------------------------------------------------
# pages
# ---------------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db)):
    content = get_content()
    return render(request, "dashboard.html", "home", d=services.dashboard(db, content),
                  content=content)


@app.get("/read", response_class=HTMLResponse)
def library(request: Request, db: Session = Depends(get_db)):
    content = get_content()
    docs = []
    for doc_id in DOC_ORDER:
        doc = content.docs[doc_id]
        prog = services.page_progress(db, doc_id)
        done = sum(1 for p in doc["order"] if prog.get(p) and prog[p].completed_at)
        visited = [r for r in prog.values() if r.last_visited_at]
        last = max(visited, key=lambda r: as_utc(r.last_visited_at)) if visited else None
        docs.append({"id": doc_id, "title": doc["title"], "blurb": DOC_BLURBS[doc_id],
                     "done": done, "total": len(doc["order"]),
                     "chapters": sum(1 for c in doc["chapters"] if c["number"]),
                     "resume": doc["pages"][last.page_id] if last and last.page_id in doc["pages"] else None,
                     "first": doc["order"][0]})
    return render(request, "library.html", "read", docs=docs)


@app.get("/read/{doc_id}", response_class=HTMLResponse)
def doc_index(request: Request, doc_id: str, db: Session = Depends(get_db)):
    content = get_content()
    doc = content.doc(doc_id)
    if doc is None:
        not_found()
    prog = services.page_progress(db, doc_id)
    results = services.latest_results(db)
    chapters = []
    for c in doc["chapters"]:
        pages = [doc["pages"][p] for p in c["pages"]]
        qids = [q for p in pages for q in p["questions"]]
        answered = [results[q][0] for q in qids if q in results]
        chapters.append({"c": c, "pages": pages,
                         "done": sum(1 for p in pages if prog.get(p["id"]) and prog[p["id"]].completed_at),
                         "questions": len(qids), "answered": len(answered), "correct": sum(answered)})
    return render(request, "doc.html", "read", doc=doc, chapters=chapters,
                  done={pid for pid, r in prog.items() if r.completed_at},
                  total_done=sum(1 for pid, r in prog.items() if r.completed_at and pid in doc["pages"]))


@app.get("/read/{doc_id}/{page_id}", response_class=HTMLResponse)
def read_page(request: Request, doc_id: str, page_id: str, db: Session = Depends(get_db)):
    content = get_content()
    page = content.page(doc_id, page_id)
    if page is None:
        not_found()
    doc = content.docs[doc_id]
    row = services.visit_page(db, doc_id, page_id)
    prog = services.page_progress(db, doc_id)
    chapter = content.chapter_of(doc_id, page_id)
    status = services.page_question_status(db, page["questions"])
    return render(request, "page.html", "read", doc=doc, page=page, chapter=chapter,
                  row=row, done={pid for pid, r in prog.items() if r.completed_at},
                  prev=doc["pages"].get(page["prev"]) if page["prev"] else None,
                  next=doc["pages"].get(page["next"]) if page["next"] else None,
                  status=status, position=doc["order"].index(page_id) + 1)


@app.get("/quiz", response_class=HTMLResponse)
def quiz_builder(request: Request, source: str = "bank", group: str | None = None,
                 filter: str = "all", db: Session = Depends(get_db)):
    content = get_content()
    if source not in SOURCE_TITLES:
        source = "bank"
    results = services.latest_results(db)
    sources = {s: services.group_accuracy(content, results, s) for s in SOURCE_TITLES}
    return render(request, "quiz_builder.html", "quiz", sources=sources, source=source,
                  preselect=group, qfilter=filter if filter in services.QUIZ_FILTERS else "all",
                  parts=content.ccnp_parts, quizzes=services.recent_quizzes(db, 15),
                  settings=services.get_settings(db))


@app.get("/quiz/{quiz_id}", response_class=HTMLResponse)
def quiz_page(request: Request, quiz_id: int, db: Session = Depends(get_db)):
    try:
        quiz = services.get_quiz(db, quiz_id)
    except ServiceError:
        not_found()
    return render(request, "quiz.html", "quiz", quiz=quiz)


@app.get("/cards", response_class=HTMLResponse)
def cards_home(request: Request, db: Session = Depends(get_db)):
    content = get_content()
    counts = services.card_counts(db, content)
    settings = services.get_settings(db)
    tz = services.local_tz(db)
    new_left = max(0, settings["new_cards_per_day"] - services.new_cards_introduced_today(db, tz))
    return render(request, "cards.html", "cards", decks=content.decks, counts=counts,
                  new_left=new_left, settings=settings)


@app.get("/cards/study", response_class=HTMLResponse)
def cards_study(request: Request, deck: str | None = None, mode: str = "due"):
    content = get_content()
    if deck and deck not in content.deck_by_id:
        not_found()
    if mode not in ("due", "cram"):
        mode = "due"
    return render(request, "cards_study.html", "cards", deck=content.deck_by_id.get(deck), mode=mode,
                  cram_cards=[c for c in content.cards if not deck or c["deck"] == deck]
                  if mode == "cram" else None)


@app.get("/cards/browse", response_class=HTMLResponse)
def cards_browse(request: Request, deck: str | None = None, db: Session = Depends(get_db)):
    content = get_content()
    if deck and deck not in content.deck_by_id:
        not_found()
    states = services.card_states(db)
    cards = [c for c in content.cards if not deck or c["deck"] == deck]
    return render(request, "cards_browse.html", "cards", deck=content.deck_by_id.get(deck),
                  decks=content.decks, cards=cards, states=states, now=utcnow(), as_utc=as_utc)


@app.get("/subnetting", response_class=HTMLResponse)
def subnetting(request: Request, db: Session = Depends(get_db)):
    return render(request, "subnetting.html", "subnet", stats=services.drill_stats(db, days=30),
                  drill_count=len(get_content().drills["drills"]))


@app.get("/subnetting/drills", response_class=HTMLResponse)
def subnetting_drills(request: Request, db: Session = Depends(get_db)):
    content = get_content()
    return render(request, "drills.html", "subnet", drills=content.drills,
                  results=services.sheet_results(db))


@app.get("/subnetting/toolkit", response_class=HTMLResponse)
def subnetting_toolkit(request: Request):
    return render(request, "toolkit.html", "subnet", drills=get_content().drills)


@app.get("/labs", response_class=HTMLResponse)
def labs(request: Request, db: Session = Depends(get_db)):
    content = get_content()
    progress, checks = services.lab_status(db)
    return render(request, "labs.html", "labs", labs=content.labs, intro=content.labs_intro_html,
                  progress=progress, checks=checks)


@app.get("/labs/{lab_id}", response_class=HTMLResponse)
def lab_page(request: Request, lab_id: str, db: Session = Depends(get_db)):
    content = get_content()
    lab = content.labs_by_id.get(lab_id)
    if lab is None:
        not_found()
    progress, checks = services.lab_status(db)
    idx = content.labs.index(lab)
    return render(request, "lab.html", "labs", lab=lab, row=progress.get(lab_id),
                  checked=sorted(checks.get(lab_id, set())),
                  prev=content.labs[idx - 1] if idx else None,
                  next=content.labs[idx + 1] if idx + 1 < len(content.labs) else None)


@app.get("/terminal", response_class=HTMLResponse)
def terminal_labs(request: Request, db: Session = Depends(get_db)):
    return render(request, "terminal.html", "terminal", labs=get_content().terminal_labs,
                  progress=services.terminal_status(db))


@app.get("/terminal/{lab_id}", response_class=HTMLResponse)
def terminal_lab(request: Request, lab_id: str, db: Session = Depends(get_db)):
    content = get_content()
    lab = content.terminal_by_id.get(lab_id)
    if lab is None:
        not_found()
    row = services.terminal_status(db).get(lab_id)
    idx = content.terminal_labs.index(lab)
    spec = {k: lab[k] for k in ("id", "devices", "links", "initial", "height")}
    spec["tasks"] = [{"checks": t["checks"]} for t in lab["tasks"]]
    return render(request, "terminal_lab.html", "terminal", lab=lab, spec=spec, row=row,
                  saved=json.loads(row.state) if row and row.state else None,
                  prev=content.terminal_labs[idx - 1] if idx else None,
                  next=content.terminal_labs[idx + 1] if idx + 1 < len(content.terminal_labs) else None)


@app.get("/search", response_class=HTMLResponse)
def search(request: Request, q: str = ""):
    q = q.strip()[:200]
    results = get_content().search(q) if q else []
    return render(request, "search.html", "search", q=q, results=results)


@app.get("/settings", response_class=HTMLResponse)
def settings_page(request: Request, db: Session = Depends(get_db)):
    return render(request, "settings.html", "settings", settings=services.get_settings(db),
                  stats=get_content().stats)


# ---------------------------------------------------------------------------
# JSON API
# ---------------------------------------------------------------------------

class PageFlag(BaseModel):
    doc: str
    page: str
    completed: bool


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


class LabFlag(BaseModel):
    completed: bool


class LabNote(BaseModel):
    note: str = Field(max_length=20000)


def _require_page(doc: str, page: str):
    if get_content().page(doc, page) is None:
        raise ServiceError("unknown page")


@app.post("/api/pages/complete")
def api_page_complete(body: PageFlag, db: Session = Depends(get_db)):
    _require_page(body.doc, body.page)
    services.set_page_complete(db, body.doc, body.page, body.completed)
    return {"ok": True}


@app.put("/api/pages/note")
def api_page_note(body: PageNote, db: Session = Depends(get_db)):
    _require_page(body.doc, body.page)
    services.set_page_note(db, body.doc, body.page, body.note)
    return {"ok": True}


@app.post("/api/questions/{qid}/answer")
def api_answer(qid: str, body: Answer, db: Session = Depends(get_db)):
    return services.record_reader_answer(db, get_content(), qid, body.selected)


@app.post("/api/quiz")
def api_new_quiz(body: NewQuiz, db: Session = Depends(get_db)):
    quiz = services.create_quiz(db, get_content(), body.source, body.groups, body.filter,
                                body.count, body.mode)
    return {"id": quiz.id, "url": "/quiz/%d" % quiz.id}


@app.get("/api/quiz/{quiz_id}")
def api_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = services.get_quiz(db, quiz_id)
    return services.quiz_state(db, get_content(), quiz)


@app.post("/api/quiz/{quiz_id}/answer")
def api_quiz_answer(quiz_id: int, body: QuizAnswer, db: Session = Depends(get_db)):
    quiz = services.get_quiz(db, quiz_id)
    return services.answer_quiz(db, get_content(), quiz, body.question, body.selected)


@app.post("/api/quiz/{quiz_id}/finish")
def api_quiz_finish(quiz_id: int, db: Session = Depends(get_db)):
    quiz = services.finish_quiz(db, services.get_quiz(db, quiz_id))
    return services.quiz_state(db, get_content(), quiz)


@app.delete("/api/quiz/{quiz_id}")
def api_quiz_delete(quiz_id: int, db: Session = Depends(get_db)):
    services.get_quiz(db, quiz_id)
    services.delete_quiz(db, quiz_id)
    return {"ok": True}


@app.get("/api/cards/queue")
def api_card_queue(deck: str | None = None, db: Session = Depends(get_db)):
    return services.card_queue(db, get_content(), deck or None)


@app.post("/api/cards/{card_id}/review")
def api_card_review(card_id: str, body: Review, db: Session = Depends(get_db)):
    return services.review_card(db, get_content(), card_id, body.rating)


@app.post("/api/drills")
def api_drill(body: Drill, db: Session = Depends(get_db)):
    services.record_drill(db, get_content(), body.kind, body.correct, body.duration_ms, body.item_id)
    return {"ok": True}


@app.get("/api/drills/stats")
def api_drill_stats(db: Session = Depends(get_db)):
    return services.drill_stats(db, days=30)


@app.post("/api/labs/{lab_id}/items/{item_id}")
def api_lab_item(lab_id: str, item_id: str, body: Check, db: Session = Depends(get_db)):
    services.set_lab_item(db, get_content(), lab_id, item_id, body.checked)
    return {"ok": True}


@app.post("/api/labs/{lab_id}/complete")
def api_lab_complete(lab_id: str, body: LabFlag, db: Session = Depends(get_db)):
    services.set_lab_complete(db, get_content(), lab_id, body.completed)
    return {"ok": True}


@app.put("/api/labs/{lab_id}/note")
def api_lab_note(lab_id: str, body: LabNote, db: Session = Depends(get_db)):
    services.set_lab_note(db, get_content(), lab_id, body.note)
    return {"ok": True}


@app.put("/api/terminal/{lab_id}")
def api_terminal_save(lab_id: str, body: TerminalSave, db: Session = Depends(get_db)):
    return services.save_terminal(db, get_content(), lab_id, body.state, body.passing)


@app.delete("/api/terminal/{lab_id}")
def api_terminal_reset(lab_id: str, db: Session = Depends(get_db)):
    services.reset_terminal(db, get_content(), lab_id)
    return {"ok": True}


@app.post("/api/settings")
def api_settings(body: dict, db: Session = Depends(get_db)):
    return services.update_settings(db, body)
