"""Progress tracking: everything that reads or writes the database."""
import json
import random
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from . import srs
from .content import DOC_ORDER, SOURCE_KITS, SOURCE_TITLES, Content
from .db import as_utc, utcnow
from .models import (CardReview, CardState, DrillAttempt, LabItemCheck, LabProgress,
                     PageProgress, QuestionAttempt, QuizSession, ROLES, Setting, TerminalProgress,
                     TerminalTaskPass, User)
from .passwords import DUMMY_HASH, hash_password, verify_password

SETTINGS = {
    "track": {"default": "both", "type": str, "choices": ("ccnp", "ccna", "both")},
    "timezone": {"default": "UTC", "type": str},
    "new_cards_per_day": {"default": 20, "type": int, "min": 0, "max": 200},
    "exam_seconds_per_question": {"default": 72, "type": int, "min": 20, "max": 600},
}
QUIZ_FILTERS = ("all", "unseen", "missed")
EXAM_GRACE_SECONDS = 5
MAX_TERMINAL_STATE = 2_000_000
USERNAME_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{2,31}$")
MIN_PASSWORD = 8
MAX_PASSWORD = 128


class ServiceError(ValueError):
    """A request that can't be carried out (bad ids, finished quiz...)."""


# ---------------------------------------------------------------------------
# users
# ---------------------------------------------------------------------------

def _clean_username(username: str) -> str:
    name = (username or "").strip().lower()
    if not USERNAME_RE.match(name):
        raise ServiceError("Usernames are 3 to 32 characters: letters, digits, dots, dashes or "
                           "underscores, starting with a letter or digit.")
    return name


def _check_password(password: str):
    if not isinstance(password, str) or not MIN_PASSWORD <= len(password) <= MAX_PASSWORD:
        raise ServiceError("Passwords are %d to %d characters." % (MIN_PASSWORD, MAX_PASSWORD))


def authenticate(db: Session, username: str, password: str) -> User | None:
    user = db.scalars(select(User).where(User.username == (username or "").strip().lower())).first()
    if user is None or not user.password_hash:
        verify_password(password, DUMMY_HASH)
        return None
    if not verify_password(password, user.password_hash):
        return None
    user.last_login_at = utcnow()
    db.commit()
    return user


def list_users(db: Session) -> list:
    return list(db.scalars(select(User).order_by(User.username)))


def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise ServiceError("user not found")
    return user


def create_user(db: Session, username: str, password: str, role: str) -> User:
    name = _clean_username(username)
    _check_password(password)
    if role not in ROLES:
        raise ServiceError("unknown role")
    if db.scalars(select(User).where(User.username == name)).first() is not None:
        raise ServiceError("There's already a user called %s." % name)
    user = User(username=name, password_hash=hash_password(password), role=role)
    db.add(user)
    db.commit()
    return user


def set_password(db: Session, user: User, password: str):
    """Sets a new password and signs the user out everywhere else."""
    _check_password(password)
    user.password_hash = hash_password(password)
    user.session_version += 1
    db.commit()


def change_own_password(db: Session, user: User, current: str, new: str):
    if not verify_password(current, user.password_hash):
        raise ServiceError("Your current password isn't right.")
    set_password(db, user, new)


def set_role(db: Session, actor: User, user: User, role: str):
    if role not in ROLES:
        raise ServiceError("unknown role")
    if user.id == actor.id:
        # Keeps at least one admin: the only way to lose admin is another admin's choice.
        raise ServiceError("You can't change your own role.")
    user.role = role
    db.commit()


def delete_user(db: Session, actor: User, user: User):
    if user.id == actor.id:
        raise ServiceError("You can't delete your own account.")
    # The database cascades the delete to every progress row the user owns.
    db.execute(delete(User).where(User.id == user.id))
    db.commit()


def ensure_admin_password(db: Session, password: str) -> bool:
    """Gives the first admin APP_PASSWORD if it has no password yet. True when it set one."""
    admin = db.scalars(select(User).where(User.role == "admin").order_by(User.id)).first()
    if admin is None:
        admin = User(username="admin", role="admin")
        db.add(admin)
    elif admin.password_hash:
        return False
    admin.password_hash = hash_password(password)
    db.commit()
    return True


# ---------------------------------------------------------------------------
# settings and local time
# ---------------------------------------------------------------------------

def get_settings(db: Session, uid: int) -> dict:
    stored = {s.key: s.value for s in db.scalars(select(Setting).where(Setting.user_id == uid))}
    out = {}
    for key, spec in SETTINGS.items():
        raw = stored.get(key)
        try:
            out[key] = spec["type"](raw) if raw is not None else spec["default"]
        except ValueError:
            out[key] = spec["default"]
    return out


def update_settings(db: Session, uid: int, values: dict) -> dict:
    for key, value in values.items():
        spec = SETTINGS.get(key)
        if spec is None:
            raise ServiceError("unknown setting %s" % key)
        if spec["type"] is int:
            try:
                value = int(value)
            except (TypeError, ValueError):
                raise ServiceError("%s must be a whole number" % key)
            if not spec["min"] <= value <= spec["max"]:
                raise ServiceError("%s must be between %d and %d" % (key, spec["min"], spec["max"]))
        if "choices" in spec and value not in spec["choices"]:
            raise ServiceError("%s must be one of %s" % (key, ", ".join(spec["choices"])))
        if key == "timezone":
            try:
                ZoneInfo(str(value))
            except (ZoneInfoNotFoundError, ValueError):
                raise ServiceError("unknown timezone %s" % value)
        row = db.get(Setting, (uid, key))
        if row is None:
            db.add(Setting(user_id=uid, key=key, value=str(value)))
        else:
            row.value = str(value)
    db.commit()
    return get_settings(db, uid)


def local_tz(db: Session, uid: int):
    return ZoneInfo(get_settings(db, uid)["timezone"])


def start_of_local_day(tz, now=None):
    now = (now or utcnow()).astimezone(tz)
    return now.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)


# ---------------------------------------------------------------------------
# reading
# ---------------------------------------------------------------------------

def page_progress(db: Session, uid: int, doc_id: str) -> dict:
    rows = db.scalars(select(PageProgress).where(PageProgress.user_id == uid, PageProgress.doc_id == doc_id))
    return {r.page_id: r for r in rows}


def _page_row(db: Session, uid: int, doc_id: str, page_id: str) -> PageProgress:
    row = db.get(PageProgress, (uid, doc_id, page_id))
    if row is None:
        row = PageProgress(user_id=uid, doc_id=doc_id, page_id=page_id, note="")
        db.add(row)
    return row


def visit_page(db: Session, uid: int, doc_id: str, page_id: str) -> PageProgress:
    row = _page_row(db, uid, doc_id, page_id)
    row.last_visited_at = utcnow()
    db.commit()
    return row


def set_page_complete(db: Session, uid: int, doc_id: str, page_id: str, done: bool):
    _page_row(db, uid, doc_id, page_id).completed_at = utcnow() if done else None
    db.commit()


def set_page_note(db: Session, uid: int, doc_id: str, page_id: str, note: str):
    _page_row(db, uid, doc_id, page_id).note = note
    db.commit()


def last_visited(db: Session, uid: int, doc_ids=None):
    query = select(PageProgress).where(PageProgress.user_id == uid, PageProgress.last_visited_at.is_not(None))
    if doc_ids is not None:
        query = query.where(PageProgress.doc_id.in_(doc_ids))
    return db.scalars(query
                      .order_by(PageProgress.last_visited_at.desc()).limit(1)).first()


# ---------------------------------------------------------------------------
# questions
# ---------------------------------------------------------------------------

def normalize_selection(q: dict, selected) -> list:
    letters = {o["letter"] for o in q["options"]}
    if not isinstance(selected, list) or not selected:
        raise ServiceError("select an answer")
    sel = sorted(set(str(s) for s in selected))
    if not set(sel) <= letters:
        raise ServiceError("unknown option")
    if len(sel) != len(q["answer"]):
        raise ServiceError("select exactly %d option(s)" % len(q["answer"]))
    return sel


def grade(q: dict, sel: list) -> bool:
    return sel == sorted(q["answer"])


def answer_payload(content: Content, q: dict) -> dict:
    return {"answer": q["answer"], "explanation_html": q["explanation_html"],
            "link": content.question_link(q)}


def record_reader_answer(db: Session, uid: int, content: Content, qid: str, selected) -> dict:
    q = content.questions.get(qid)
    if q is None:
        raise ServiceError("unknown question")
    sel = normalize_selection(q, selected)
    correct = grade(q, sel)
    db.add(QuestionAttempt(user_id=uid, question_id=qid, selected=",".join(sel), correct=correct,
                           context="reader"))
    db.commit()
    return dict(answer_payload(content, q), correct=correct, selected=sel)


def latest_results(db: Session, uid: int) -> dict:
    """question id -> (correct on the latest attempt, attempt count).

    Unfinished exam answers don't count: the result isn't known yet.
    """
    rows = db.execute(
        select(QuestionAttempt.question_id, QuestionAttempt.correct, QuestionAttempt.context,
               QuizSession.finished_at)
        .outerjoin(QuizSession, QuestionAttempt.session_id == QuizSession.id)
        .where(QuestionAttempt.user_id == uid)
        .order_by(QuestionAttempt.created_at, QuestionAttempt.id))
    out = {}
    for qid, correct, context, finished in rows:
        if context == "exam" and finished is None:
            continue
        prev = out.get(qid)
        out[qid] = (correct, (prev[1] if prev else 0) + 1)
    return out


def page_question_status(db: Session, uid: int, qids: list) -> dict:
    results = latest_results(db, uid)
    return {qid: results[qid][0] for qid in qids if qid in results}


# ---------------------------------------------------------------------------
# quizzes
# ---------------------------------------------------------------------------

def create_quiz(db: Session, uid: int, content: Content, source: str, groups: list, qfilter: str,
                count: int, mode: str) -> QuizSession:
    if source not in SOURCE_TITLES:
        raise ServiceError("unknown question source")
    if qfilter not in QUIZ_FILTERS:
        raise ServiceError("unknown filter")
    if mode not in ("practice", "exam"):
        raise ServiceError("unknown mode")
    all_groups = content.question_groups(source)
    chosen = [g for g in all_groups if not groups or g[0] in groups]
    if groups and len(chosen) != len(set(groups)):
        raise ServiceError("unknown group")
    pool = [qid for _, _, ids in chosen for qid in ids]
    results = latest_results(db, uid)
    if qfilter == "unseen":
        pool = [q for q in pool if q not in results]
    elif qfilter == "missed":
        pool = [q for q in pool if q in results and not results[q][0]]
    if not pool:
        raise ServiceError({"unseen": "You've already answered every question in that selection.",
                            "missed": "Nothing missed in that selection: no wrong latest answers.",
                            }.get(qfilter, "No questions in that selection."))
    count = max(1, min(int(count), len(pool)))
    picked = random.sample(pool, count)
    chosen_ids = {g[0] for g in chosen}
    exams = {name: set(ids) & {g[0] for g in all_groups}
             for name, ids in content.ccnp_parts.items()} if source == "ccnp" else {}
    exam = next((name for name, ids in exams.items() if ids and chosen_ids == ids), None)
    if len(chosen) == len(all_groups):
        scope = "all topics"
    elif exam:
        scope = "all of " + exam
    elif len(chosen) == 1:
        scope = chosen[0][1]
    else:
        scope = "%d topics" % len(chosen)
    title = "%s · %s" % (SOURCE_TITLES[source], scope)
    if qfilter != "all":
        title += " (%s)" % qfilter
    limit = None
    if mode == "exam":
        limit = get_settings(db, uid)["exam_seconds_per_question"] * count
    quiz = QuizSession(user_id=uid, title=title, mode=mode, question_ids=picked, time_limit_seconds=limit)
    db.add(quiz)
    db.commit()
    return quiz


def get_quiz(db: Session, uid: int, quiz_id: int) -> QuizSession:
    quiz = db.get(QuizSession, quiz_id)
    if quiz is None or quiz.user_id != uid:
        raise ServiceError("quiz not found")
    if quiz.finished_at is None and quiz.mode == "exam" and quiz.time_limit_seconds:
        deadline = as_utc(quiz.created_at) + timedelta(seconds=quiz.time_limit_seconds)
        if utcnow() > deadline + timedelta(seconds=EXAM_GRACE_SECONDS):
            finish_quiz(db, quiz)
    return quiz


def _quiz_attempts(db: Session, quiz: QuizSession) -> dict:
    rows = db.scalars(select(QuestionAttempt).where(QuestionAttempt.session_id == quiz.id)
                      .order_by(QuestionAttempt.created_at, QuestionAttempt.id))
    return {a.question_id: a for a in rows}


def quiz_state(db: Session, content: Content, quiz: QuizSession) -> dict:
    attempts = _quiz_attempts(db, quiz)
    finished = quiz.finished_at is not None
    items = []
    for qid in quiz.question_ids:
        q = content.questions.get(qid)
        if q is None:
            # The question was removed from the markdown since the quiz began.
            continue
        a = attempts.get(qid)
        item = {"id": qid, "number": q["number"], "stem_html": q["stem_html"],
                "options": q["options"], "multi": len(q["answer"]),
                "group_title": q["group_title"], "page_title": q.get("page_title"),
                "selected": a.selected.split(",") if a else None}
        if finished:
            # Unanswered questions count as wrong and still show their answer in the review.
            item.update(answer_payload(content, q), correct=a.correct if a else False)
        elif a and quiz.mode == "practice":
            item.update(answer_payload(content, q), correct=a.correct)
        items.append(item)
    deadline = None
    if quiz.time_limit_seconds:
        deadline = (as_utc(quiz.created_at) + timedelta(seconds=quiz.time_limit_seconds)).isoformat()
    first = content.questions.get(quiz.question_ids[0]) if quiz.question_ids else None
    return {"id": quiz.id, "title": quiz.title, "mode": quiz.mode, "finished": finished,
            "source": first["source"] if first else "bank",
            "deadline": deadline, "now": utcnow().isoformat(), "score": quiz.score,
            "total": len(items), "questions": items}


def answer_quiz(db: Session, content: Content, quiz: QuizSession, qid: str, selected) -> dict:
    if quiz.finished_at is not None:
        raise ServiceError("this quiz is finished")
    if qid not in quiz.question_ids:
        raise ServiceError("question isn't part of this quiz")
    q = content.questions[qid]
    existing = db.scalars(select(QuestionAttempt).where(QuestionAttempt.session_id == quiz.id,
                                                        QuestionAttempt.question_id == qid)).first()
    if quiz.mode == "exam" and selected == []:
        # Deselecting in an exam takes the answer back.
        if existing is not None:
            db.delete(existing)
            db.commit()
        return {"saved": True, "selected": None}
    sel = normalize_selection(q, selected)
    correct = grade(q, sel)
    if quiz.mode == "practice":
        if existing is not None:
            raise ServiceError("already answered")
        db.add(QuestionAttempt(user_id=quiz.user_id, question_id=qid, session_id=quiz.id,
                               selected=",".join(sel), correct=correct, context="practice"))
        db.commit()
        return dict(answer_payload(content, q), correct=correct, selected=sel)
    # Exam: answers can change until the exam is submitted; nothing is revealed.
    if existing is None:
        db.add(QuestionAttempt(user_id=quiz.user_id, question_id=qid, session_id=quiz.id,
                               selected=",".join(sel), correct=correct, context="exam"))
    else:
        existing.selected, existing.correct, existing.created_at = ",".join(sel), correct, utcnow()
    db.commit()
    return {"saved": True, "selected": sel}


def finish_quiz(db: Session, quiz: QuizSession) -> QuizSession:
    if quiz.finished_at is None:
        attempts = _quiz_attempts(db, quiz)
        quiz.score = sum(1 for a in attempts.values() if a.correct)
        quiz.finished_at = utcnow()
        db.commit()
    return quiz


def recent_quizzes(db: Session, uid: int, limit=10, content: Content | None = None, kits=None):
    """The newest quizzes, optionally only those drawn from the given kits' question sources."""
    query = select(QuizSession).where(QuizSession.user_id == uid).order_by(QuizSession.created_at.desc())
    if kits is None:
        return list(db.scalars(query.limit(limit)))
    out = []
    for quiz in db.scalars(query):
        first = content.questions.get(quiz.question_ids[0]) if quiz.question_ids else None
        if first and SOURCE_KITS[first["source"]] in kits:
            out.append(quiz)
            if len(out) == limit:
                break
    return out


def delete_quiz(db: Session, quiz: QuizSession):
    db.execute(delete(QuestionAttempt).where(QuestionAttempt.session_id == quiz.id))
    db.execute(delete(QuizSession).where(QuizSession.id == quiz.id))
    db.commit()


def group_accuracy(content: Content, results: dict, source: str):
    """Per-topic stats from the latest answer to each question."""
    out = []
    for gid, title, ids in content.question_groups(source):
        answered = [results[q][0] for q in ids if q in results]
        out.append({"id": gid, "title": title, "total": len(ids), "answered": len(answered),
                    "correct": sum(answered),
                    "accuracy": (sum(answered) / len(answered)) if answered else None})
    return out


# ---------------------------------------------------------------------------
# flashcards
# ---------------------------------------------------------------------------

def _schedule_of(row: CardState | None) -> srs.Schedule:
    if row is None:
        return srs.Schedule()
    return srs.Schedule(row.state, row.step, row.interval_days, row.ease, row.reps, row.lapses,
                        as_utc(row.due_at))


def new_cards_introduced_today(db: Session, uid: int, tz) -> int:
    since = start_of_local_day(tz)
    return db.scalar(select(func.count(func.distinct(CardReview.card_id)))
                     .where(CardReview.user_id == uid, CardReview.state_before == "new",
                            CardReview.reviewed_at >= since)) or 0


def card_counts(db: Session, uid: int, content: Content) -> dict:
    """Per deck: new (never studied), learning due, review due, total."""
    now = utcnow()
    states = card_states(db, uid)
    per = defaultdict(lambda: {"new": 0, "learning": 0, "due": 0, "total": 0, "mature": 0})
    for c in content.cards:
        d = per[c["deck"]]
        d["total"] += 1
        row = states.get(c["id"])
        if row is None:
            d["new"] += 1
            continue
        if row.state == "review" and row.interval_days >= 21:
            d["mature"] += 1
        if as_utc(row.due_at) <= now:
            d["learning" if row.state != "review" else "due"] += 1
    return per


def card_queue(db: Session, uid: int, content: Content, deck: str | None, kits=("ccna", "ccnp")) -> dict:
    """Cards to study now: due learning + due reviews, then today's new cards."""
    if deck and deck not in content.deck_by_id:
        raise ServiceError("unknown deck")
    now = utcnow()
    tz = local_tz(db, uid)
    settings = get_settings(db, uid)
    cards = [c for c in content.cards if c["deck"] == deck] if deck else content.cards_for(kits)
    states = card_states(db, uid)
    # Learn ahead: learning steps due in the next 20 minutes count as due now.
    horizon = now + timedelta(minutes=20)
    due, learning, new = [], [], []
    for c in cards:
        row = states.get(c["id"])
        if row is None:
            new.append(c)
        elif row.state != "review" and as_utc(row.due_at) <= horizon:
            learning.append((as_utc(row.due_at), c))
        elif row.state == "review" and as_utc(row.due_at) <= now:
            due.append((as_utc(row.due_at), c))
    new_left = max(0, settings["new_cards_per_day"] - new_cards_introduced_today(db, uid, tz))
    learning.sort(key=lambda x: x[0])
    due.sort(key=lambda x: x[0])
    queue = [c for _, c in learning] + [c for _, c in due] + new[:new_left]
    return {
        "cards": [_card_payload(c, states.get(c["id"]), now) for c in queue],
        "counts": {"learning": len(learning), "due": len(due), "new": min(len(new), new_left),
                   "new_total": len(new), "new_limit_left": new_left},
    }


def _card_payload(card: dict, row: CardState | None, now: datetime) -> dict:
    sched = _schedule_of(row)
    return {"id": card["id"], "deck": card["deck"], "front_html": card["front_html"],
            "back_html": card["back_html"], "state": sched.state,
            "preview": srs.preview(sched, now)}


def review_card(db: Session, uid: int, content: Content, card_id: str, rating: int) -> dict:
    card = content.cards_by_id.get(card_id)
    if card is None:
        raise ServiceError("unknown card")
    now = utcnow()
    row = db.get(CardState, (uid, card_id))
    before = _schedule_of(row)
    try:
        nxt = srs.next_schedule(before, int(rating), now)
    except ValueError as e:
        raise ServiceError(str(e))
    if row is None:
        row = CardState(user_id=uid, card_id=card_id)
        db.add(row)
    row.state, row.step, row.interval_days, row.ease = nxt.state, nxt.step, nxt.interval_days, nxt.ease
    row.reps, row.lapses, row.due_at, row.last_reviewed_at = nxt.reps, nxt.lapses, nxt.due_at, now
    db.add(CardReview(user_id=uid, card_id=card_id, rating=int(rating), state_before=before.state,
                      interval_days=nxt.interval_days, reviewed_at=now))
    db.commit()
    return {"id": card_id, "state": nxt.state, "due_at": nxt.due_at.isoformat(),
            "due_in_seconds": (nxt.due_at - now).total_seconds(),
            "preview": srs.preview(nxt, now)}


def card_states(db: Session, uid: int) -> dict:
    return {r.card_id: r for r in db.scalars(select(CardState).where(CardState.user_id == uid))}


# ---------------------------------------------------------------------------
# subnetting and labs
# ---------------------------------------------------------------------------

DRILL_KINDS = {"mask", "network", "hosts-range", "host-count", "prefix-for-hosts",
               "same-subnet", "wildcard", "full", "ipv6-compress", "ipv6-expand", "sheet"}


def record_drill(db: Session, uid: int, content: Content, kind: str, correct: bool, duration_ms,
                 item_id=None):
    if kind not in DRILL_KINDS:
        raise ServiceError("unknown drill kind")
    if item_id is not None and item_id not in content.drills_by_id:
        raise ServiceError("unknown drill")
    if duration_ms is not None:
        duration_ms = max(0, min(int(duration_ms), 3_600_000))
    db.add(DrillAttempt(user_id=uid, kind=kind, item_id=item_id, correct=bool(correct), duration_ms=duration_ms))
    db.commit()


def drill_stats(db: Session, uid: int, days=30) -> dict:
    since = utcnow() - timedelta(days=days)
    rows = db.execute(select(DrillAttempt.kind, DrillAttempt.correct, DrillAttempt.duration_ms)
                      .where(DrillAttempt.user_id == uid, DrillAttempt.created_at >= since,
                             DrillAttempt.item_id.is_(None)))
    per = defaultdict(lambda: {"n": 0, "correct": 0, "ms": []})
    for kind, correct, ms in rows:
        p = per[kind]
        p["n"] += 1
        p["correct"] += int(correct)
        if ms and correct:
            p["ms"].append(ms)
    out = {}
    for kind, p in per.items():
        out[kind] = {"n": p["n"], "accuracy": p["correct"] / p["n"],
                     "avg_seconds": (sum(p["ms"]) / len(p["ms"]) / 1000) if p["ms"] else None}
    total = sum(p["n"] for p in per.values())
    correct = sum(p["correct"] for p in per.values())
    times = [ms for p in per.values() for ms in p["ms"]]
    return {"kinds": out, "n": total, "accuracy": (correct / total) if total else None,
            "avg_seconds": (sum(times) / len(times) / 1000) if times else None}


def sheet_results(db: Session, uid: int) -> dict:
    """Latest self-graded result per worked drill from the drill sheet."""
    rows = db.execute(select(DrillAttempt.item_id, DrillAttempt.correct)
                      .where(DrillAttempt.user_id == uid, DrillAttempt.item_id.is_not(None))
                      .order_by(DrillAttempt.created_at, DrillAttempt.id))
    return {item: correct for item, correct in rows}


def lab_status(db: Session, uid: int) -> tuple[dict, dict]:
    progress = {r.lab_id: r for r in db.scalars(select(LabProgress).where(LabProgress.user_id == uid))}
    checks = defaultdict(set)
    for r in db.scalars(select(LabItemCheck).where(LabItemCheck.user_id == uid)):
        checks[r.lab_id].add(r.item_id)
    return progress, checks


def set_lab_item(db: Session, uid: int, content: Content, lab_id: str, item_id: str, checked: bool):
    lab = content.labs_by_id.get(lab_id)
    if lab is None or item_id not in lab["items"]:
        raise ServiceError("unknown lab item")
    row = db.get(LabItemCheck, (uid, item_id))
    if checked and row is None:
        db.add(LabItemCheck(user_id=uid, item_id=item_id, lab_id=lab_id))
    elif not checked and row is not None:
        db.delete(row)
    db.commit()


def _lab_row(db: Session, uid: int, lab_id: str) -> LabProgress:
    row = db.get(LabProgress, (uid, lab_id))
    if row is None:
        row = LabProgress(user_id=uid, lab_id=lab_id, note="")
        db.add(row)
    return row


def set_lab_complete(db: Session, uid: int, content: Content, lab_id: str, done: bool):
    if lab_id not in content.labs_by_id:
        raise ServiceError("unknown lab")
    _lab_row(db, uid, lab_id).completed_at = utcnow() if done else None
    db.commit()


def set_lab_note(db: Session, uid: int, content: Content, lab_id: str, note: str):
    if lab_id not in content.labs_by_id:
        raise ServiceError("unknown lab")
    _lab_row(db, uid, lab_id).note = note
    db.commit()


# ---------------------------------------------------------------------------
# terminal labs
# ---------------------------------------------------------------------------

def terminal_status(db: Session, uid: int) -> dict:
    return {r.lab_id: r for r in db.scalars(select(TerminalProgress).where(TerminalProgress.user_id == uid))}


def _terminal_lab(content: Content, lab_id: str) -> dict:
    lab = content.terminal_by_id.get(lab_id)
    if lab is None:
        raise ServiceError("unknown terminal lab")
    return lab


def save_terminal(db: Session, uid: int, content: Content, lab_id: str, state: dict,
                  passing: list) -> dict:
    """Store the simulated network and which tasks pass; record first passes and completion."""
    lab = _terminal_lab(content, lab_id)
    total = len(lab["tasks"])
    passing = sorted(set(passing))
    if any(i < 0 or i >= total for i in passing):
        raise ServiceError("task number out of range")
    if not isinstance(state.get("devices"), dict):
        raise ServiceError("lab state has no devices")
    text = json.dumps(state, separators=(",", ":"))
    if len(text) > MAX_TERMINAL_STATE:
        raise ServiceError("lab state is too large to save")
    now = utcnow()
    row = db.get(TerminalProgress, (uid, lab_id))
    if row is None:
        row = TerminalProgress(user_id=uid, lab_id=lab_id)
        db.add(row)
    row.state, row.passing, row.updated_at = text, passing, now
    for i in passing:
        if db.get(TerminalTaskPass, (uid, lab_id, i)) is None:
            db.add(TerminalTaskPass(user_id=uid, lab_id=lab_id, task_no=i, passed_at=now))
    newly_completed = bool(total) and len(passing) == total and row.completed_at is None
    if newly_completed:
        row.completed_at = now
    db.commit()
    return {"completed": row.completed_at is not None, "newly_completed": newly_completed}


def reset_terminal(db: Session, uid: int, content: Content, lab_id: str):
    """Back to the lab's starting network. Completion and first-pass history are kept."""
    _terminal_lab(content, lab_id)
    row = db.get(TerminalProgress, (uid, lab_id))
    if row is not None:
        row.state, row.passing, row.updated_at = "", [], utcnow()
        db.commit()


# ---------------------------------------------------------------------------
# dashboard
# ---------------------------------------------------------------------------

def activity_by_day(db: Session, uid: int, tz, days=112) -> Counter:
    since = utcnow() - timedelta(days=days + 1)
    stamps = []
    for model, column in ((QuestionAttempt, QuestionAttempt.created_at), (CardReview, CardReview.reviewed_at),
                          (DrillAttempt, DrillAttempt.created_at), (PageProgress, PageProgress.completed_at),
                          (LabItemCheck, LabItemCheck.checked_at), (TerminalTaskPass, TerminalTaskPass.passed_at)):
        stamps += db.scalars(select(column).where(model.user_id == uid, column >= since))
    return Counter(as_utc(s).astimezone(tz).date() for s in stamps)


def streak(activity: Counter, today) -> int:
    day = today if activity.get(today) else today - timedelta(days=1)
    n = 0
    while activity.get(day):
        n += 1
        day -= timedelta(days=1)
    return n


def heatmap(activity: Counter, today, weeks=16) -> list:
    """Columns of 7 days (Mon..Sun) ending with the current week."""
    end = today + timedelta(days=6 - today.weekday())
    start = end - timedelta(days=weeks * 7 - 1)
    cols = []
    for w in range(weeks):
        col = []
        for d in range(7):
            day = start + timedelta(days=w * 7 + d)
            n = activity.get(day, 0)
            level = 0 if n == 0 else 1 if n < 10 else 2 if n < 30 else 3 if n < 60 else 4
            col.append({"date": day.isoformat(), "count": n, "level": level,
                        "future": day > today})
        cols.append(col)
    return cols


def dashboard(db: Session, uid: int, content: Content, kits=("ccna", "ccnp")) -> dict:
    tz = local_tz(db, uid)
    today = utcnow().astimezone(tz).date()
    reading = []
    for doc_id in content.doc_ids(kits):
        doc = content.docs[doc_id]
        prog = page_progress(db, uid, doc_id)
        done = sum(1 for pid in doc["order"] if prog.get(pid) and prog[pid].completed_at)
        reading.append({"id": doc_id, "kit": doc["kit"], "title": doc["title"], "done": done,
                        "total": len(doc["order"])})
    results = latest_results(db, uid)
    sources = []
    weak = []
    for source in content.sources(kits):
        groups = group_accuracy(content, results, source)
        answered = sum(g["answered"] for g in groups)
        correct = sum(g["correct"] for g in groups)
        sources.append({"id": source, "kit": SOURCE_KITS[source], "title": SOURCE_TITLES[source],
                        "total": sum(g["total"] for g in groups), "answered": answered,
                        "accuracy": (correct / answered) if answered else None})
        for g in groups:
            if g["answered"] >= 3 and g["accuracy"] < 0.85:
                weak.append(dict(g, source=source))
    weak.sort(key=lambda g: g["accuracy"])
    shown_decks = {d["id"] for d in content.decks_for(kits)}
    counts = {k: v for k, v in card_counts(db, uid, content).items() if k in shown_decks}
    settings = get_settings(db, uid)
    new_left = max(0, settings["new_cards_per_day"] - new_cards_introduced_today(db, uid, tz))
    total_new = sum(d["new"] for d in counts.values())
    since = start_of_local_day(tz)
    reviews_today = db.scalar(select(func.count(CardReview.id))
                              .where(CardReview.user_id == uid, CardReview.reviewed_at >= since)) or 0
    month = utcnow() - timedelta(days=30)
    recall = db.execute(select(CardReview.rating).where(CardReview.user_id == uid, CardReview.reviewed_at >= month,
                                                        CardReview.state_before == "review")).all()
    retention = (sum(1 for (r,) in recall if r > 1) / len(recall)) if recall else None
    cards = {"due": sum(d["due"] + d["learning"] for d in counts.values()),
             "new_today": min(new_left, total_new),
             "studied": sum(d["total"] - d["new"] for d in counts.values()),
             "mature": sum(d["mature"] for d in counts.values()),
             "total": len(content.cards_for(kits)), "reviews_today": reviews_today,
             "retention": retention}
    progress, checks = lab_status(db, uid)
    workbook = content.labs_for(kits)
    labs_done = sum(1 for l in workbook if progress.get(l["id"]) and progress[l["id"]].completed_at)
    terminal = terminal_status(db, uid)
    graded = [l for l in content.terminal_for(kits) if l["tasks"]]
    by_exam = {}
    for l in graded:
        e = by_exam.setdefault(l["exam"] or "Other", {"done": 0, "total": 0})
        e["total"] += 1
        e["done"] += bool(terminal.get(l["id"]) and terminal[l["id"]].completed_at)
    activity = activity_by_day(db, uid, tz)
    lv = last_visited(db, uid, {d for d in content.doc_ids(kits)})
    resume = None
    if lv and content.page(lv.doc_id, lv.page_id):
        resume = {"doc": lv.doc_id, "doc_title": content.docs[lv.doc_id]["title"],
                  "page": content.page(lv.doc_id, lv.page_id)}
    return {
        "reading": reading, "sources": sources, "weak": weak[:6], "cards": cards,
        "subnetting": drill_stats(db, uid, days=7),
        "labs": {"done": labs_done, "total": sum(1 for l in workbook if l["items"]),
                 "items_checked": sum(len(v) for k, v in checks.items() if k in {l["id"] for l in workbook})},
        "terminal": {"done": sum(1 for l in graded if terminal.get(l["id"]) and terminal[l["id"]].completed_at),
                     "total": len(graded), "by_exam": by_exam},
        "streak": streak(activity, today), "today_count": activity.get(today, 0),
        "heatmap": heatmap(activity, today), "resume": resume,
        "quizzes": recent_quizzes(db, uid, 5, content, kits),
        "tz_is_default": db.get(Setting, (uid, "timezone")) is None,
    }
