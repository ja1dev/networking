from datetime import datetime, timedelta, timezone

from app import srs

NOW = datetime(2026, 1, 1, tzinfo=timezone.utc)


def run(ratings, start=None):
    s = start or srs.Schedule()
    for r in ratings:
        s = srs.next_schedule(s, r, NOW)
    return s


def test_new_card_walks_the_learning_steps():
    s = run([3])
    assert s.state == "learning" and s.due_at == NOW + timedelta(minutes=10)
    s = run([3, 3])
    assert s.state == "review" and s.interval_days == 1


def test_easy_graduates_immediately():
    s = run([4])
    assert s.state == "review" and s.interval_days == 4


def test_again_resets_to_first_step():
    s = run([3, 1])
    assert s.state == "learning" and s.step == 0 and s.due_at == NOW + timedelta(minutes=1)


def test_review_buttons_are_strictly_increasing():
    for ivl in (1, 3, 10, 40, 200):
        for ease in (1.3, 2.5, 3.0):
            cur = srs.Schedule("review", 0, ivl, ease)
            out = [srs.next_schedule(cur, r, NOW).interval_days for r in (2, 3, 4)]
            capped = [min(x, srs.MAX_INTERVAL_DAYS) for x in out]
            assert out == capped
            # Strictly increasing until the cap flattens them.
            for a, b in zip(out, out[1:]):
                assert a < b or b == srs.MAX_INTERVAL_DAYS, (ivl, ease, out)


def test_lapse_relearns_and_halves_interval():
    cur = srs.Schedule("review", 0, 20, 2.5)
    s = srs.next_schedule(cur, 1, NOW)
    assert s.state == "relearning" and s.lapses == 1 and s.interval_days == 10
    assert abs(s.ease - 2.3) < 1e-9
    back = srs.next_schedule(s, 3, NOW)
    assert back.state == "review" and back.interval_days == 10


def test_ease_never_drops_below_floor():
    s = srs.Schedule("review", 0, 5, 1.3)
    for _ in range(5):
        s = srs.next_schedule(srs.Schedule("review", 0, 5, s.ease), 2, NOW)
    assert s.ease == srs.MIN_EASE


def test_interval_is_capped():
    s = srs.next_schedule(srs.Schedule("review", 0, 300, 3.0), 4, NOW)
    assert s.interval_days == srs.MAX_INTERVAL_DAYS
