"""Spaced-repetition scheduling, modelled on Anki's SM-2 variant.

A card moves through: new -> learning (short steps in minutes) -> review
(intervals in days, growing by the card's ease) -> relearning after a lapse
-> back to review. Ratings: 1 Again, 2 Hard, 3 Good, 4 Easy.
"""
import math
from dataclasses import dataclass
from datetime import datetime, timedelta

LEARNING_STEPS_MIN = [1, 10]
RELEARNING_STEPS_MIN = [10]
GRADUATING_DAYS = 1.0
EASY_DAYS = 4.0
START_EASE = 2.5
MIN_EASE = 1.3
MAX_INTERVAL_DAYS = 365.0
LAPSE_FACTOR = 0.5
HARD_FACTOR = 1.2
EASY_BONUS = 1.3

AGAIN, HARD, GOOD, EASY = 1, 2, 3, 4
RATINGS = (AGAIN, HARD, GOOD, EASY)


@dataclass
class Schedule:
    state: str = "new"  # new | learning | review | relearning
    step: int = 0
    interval_days: float = 0.0
    ease: float = START_EASE
    reps: int = 0
    lapses: int = 0
    due_at: datetime | None = None


def _round(x):
    """Round half up (Python's round() sends 2.5 to 2)."""
    return math.floor(x + 0.5)


def _minutes(now, m):
    return now + timedelta(minutes=m)


def _days(now, d):
    return now + timedelta(days=d)


def next_schedule(cur: Schedule, rating: int, now: datetime) -> Schedule:
    if rating not in RATINGS:
        raise ValueError("rating must be 1-4")
    s = Schedule(cur.state, cur.step, cur.interval_days, cur.ease, cur.reps + 1, cur.lapses)

    if cur.state in ("new", "learning", "relearning"):
        relearning = cur.state == "relearning"
        steps = RELEARNING_STEPS_MIN if relearning else LEARNING_STEPS_MIN
        step = 0 if cur.state == "new" else cur.step
        s.state = "relearning" if relearning else "learning"
        if rating == AGAIN:
            s.step = 0
            s.due_at = _minutes(now, steps[0])
        elif rating == HARD:
            # Repeat the current step, a little longer than its nominal delay.
            s.step = step
            nxt = steps[step + 1] if step + 1 < len(steps) else steps[step] * 1.5
            s.due_at = _minutes(now, (steps[step] + nxt) / 2)
        elif rating == GOOD:
            if step + 1 < len(steps):
                s.step = step + 1
                s.due_at = _minutes(now, steps[step + 1])
            else:
                s.state, s.step = "review", 0
                s.interval_days = max(1.0, cur.interval_days) if relearning else GRADUATING_DAYS
                s.due_at = _days(now, s.interval_days)
        else:  # EASY graduates straight away
            s.state, s.step = "review", 0
            s.interval_days = (max(1.0, cur.interval_days) + 1) if relearning else EASY_DAYS
            s.due_at = _days(now, s.interval_days)
        return s

    # review
    ivl = max(cur.interval_days, 1.0)
    if rating == AGAIN:
        s.lapses += 1
        s.ease = max(MIN_EASE, cur.ease - 0.2)
        s.state, s.step = "relearning", 0
        s.interval_days = max(1.0, ivl * LAPSE_FACTOR)
        s.due_at = _minutes(now, RELEARNING_STEPS_MIN[0])
        return s
    # Each button always schedules further out than the one before it.
    hard = max(ivl + 1, _round(ivl * HARD_FACTOR))
    good = max(hard + 1, _round(ivl * cur.ease))
    easy = max(good + 1, _round(ivl * cur.ease * EASY_BONUS))
    if rating == HARD:
        s.ease = max(MIN_EASE, cur.ease - 0.15)
        new_ivl = hard
    elif rating == GOOD:
        new_ivl = good
    else:
        s.ease = cur.ease + 0.15
        new_ivl = easy
    s.interval_days = float(min(MAX_INTERVAL_DAYS, new_ivl))
    s.due_at = _days(now, s.interval_days)
    return s


def human_delay(now: datetime, due: datetime) -> str:
    secs = (due - now).total_seconds()
    if secs < 3600:
        return "%dm" % max(1, round(secs / 60))
    if secs < 86400:
        return "%dh" % round(secs / 3600)
    days = secs / 86400
    if days < 30:
        return "%dd" % round(days)
    if days < 365:
        return "%.1fmo" % (days / 30)
    return "%.1fy" % (days / 365)


def preview(cur: Schedule, now: datetime) -> dict:
    """The delay each rating button would schedule, for labelling the buttons."""
    return {r: human_delay(now, next_schedule(cur, r, now).due_at) for r in RATINGS}
