"""The CCNA / CCNP / Both switch: each page shows only the chosen track's material."""
import pytest

from app.content import get_content


@pytest.fixture
def track(client):
    def set_track(value):
        r = client.post("/api/settings", json={"track": value})
        assert r.status_code == 200 and r.json()["track"] == value
    yield set_track
    client.post("/api/settings", json={"track": "both"})


def test_track_setting_is_validated(client, track):
    assert client.post("/api/settings", json={"track": "ccie"}).status_code == 400
    track("ccnp")
    assert client.get("/settings").status_code == 200


def test_library_and_quiz_follow_the_track(client, track):
    track("ccnp")
    page = client.get("/read").text
    assert 'href="/read/ccnp"' in page and 'href="/read/ccna"' not in page and 'href="/read/tips"' not in page
    quiz = client.get("/quiz").text
    assert "CCNP Exam-Style Questions" in quiz and "CCNA Practice Bank" not in quiz
    # A CCNA page is still reachable by link from anywhere.
    assert client.get("/read/ccna/1-4").status_code == 200

    track("ccna")
    page = client.get("/read").text
    assert 'href="/read/ccna"' in page and 'href="/read/ccnp"' not in page
    assert "CCNA Practice Bank" in client.get("/quiz").text
    assert "CCNP Exam-Style Questions" not in client.get("/quiz").text

    track("both")
    page = client.get("/read").text
    assert 'href="/read/ccna"' in page and 'href="/read/ccnp"' in page


def test_flashcards_and_workbooks_follow_the_track(client, track):
    content = get_content()
    ccna_deck = next(d for d in content.decks if d["kit"] == "ccna")
    track("ccnp")
    assert ccna_deck["name"] not in client.get("/cards").text
    queue = client.get("/api/cards/queue").json()
    assert all(content.cards_by_id[c["id"]]["kit"] == "ccnp" for c in queue["cards"])
    assert 'href="/labs/lab1"' not in client.get("/labs").text
    track("ccna")
    assert ccna_deck["name"] in client.get("/cards").text
    queue = client.get("/api/cards/queue").json()
    assert queue["cards"] and all(content.cards_by_id[c["id"]]["kit"] == "ccna" for c in queue["cards"])
    assert 'href="/labs/lab1"' in client.get("/labs").text


def test_terminal_labs_and_search_follow_the_track(client, track):
    content = get_content()
    ccna_lab = next(l for l in content.terminal_labs if l["track"] == "ccna")
    ccnp_lab = next(l for l in content.terminal_labs if l["track"] == "ccnp")
    track("ccnp")
    index = client.get("/terminal").text
    assert 'href="/terminal/%s"' % ccnp_lab["id"] in index
    assert 'href="/terminal/%s"' % ccna_lab["id"] not in index
    assert 'href="/terminal/sandbox"' in index, "the sandbox belongs to every track"
    assert client.get("/terminal/%s" % ccna_lab["id"]).status_code == 200
    results = client.get("/search?q=native+vlan").text
    assert "/read/ccna/" not in results
    track("ccna")
    assert 'href="/terminal/%s"' % ccnp_lab["id"] not in client.get("/terminal").text
    assert "/read/ccna/" in client.get("/search?q=native+vlan").text


def test_dashboard_counts_only_the_track(client, track):
    from app import services
    from app.db import SessionLocal
    from app.models import User
    content = get_content()
    track("ccnp")
    with SessionLocal() as db:
        uid = db.query(User).filter_by(username="admin").one().id
        d = services.dashboard(db, uid, content, {"ccnp"})
    assert [r["id"] for r in d["reading"]] == ["ccnp"]
    assert [s["id"] for s in d["sources"]] == ["ccnp"]
    assert d["cards"]["total"] == len(content.cards_for({"ccnp"}))
    assert set(d["terminal"]["by_exam"]) <= {"ENCOR", "ENARSI"}
    assert client.get("/").status_code == 200
