"""End-to-end through the HTTP API, against a migrated SQLite database."""
import pytest



PAGES = ["/", "/read", "/read/ccna", "/read/ccnp", "/read/tips", "/read/devnet", "/read/ccnp/1-3",
         "/read/ccna/12-1", "/quiz", "/quiz?source=ccnp", "/cards", "/cards/study",
         "/cards/study?mode=cram", "/cards/browse", "/subnetting", "/subnetting/drills",
         "/subnetting/toolkit", "/labs", "/labs/lab5", "/search?q=native+vlan", "/settings", "/healthz",
         "/terminal", "/terminal/sandbox", "/terminal/ospf"]


@pytest.mark.parametrize("url", PAGES)
def test_pages_render(client, url):
    assert client.get(url).status_code == 200


def test_every_reading_page_renders(client, content):
    for doc_id, doc in content["docs"].items():
        for pid in doc["order"]:
            r = client.get("/read/%s/%s" % (doc_id, pid))
            assert r.status_code == 200, (doc_id, pid)


def test_unknown_pages_404(client):
    assert client.get("/read/ccnp/nope").status_code == 404
    assert client.get("/labs/nope").status_code == 404
    assert client.get("/api/quiz/99999").status_code == 400


def test_posts_need_the_fetch_header(client):
    r = client.post("/api/questions/ccna-q1/answer", json={"selected": ["B"]},
                    headers={"X-Requested-With": ""})
    assert r.status_code == 400


def test_reader_answer_is_graded_server_side(client):
    r = client.post("/api/questions/ccna-q68/answer", json={"selected": ["C", "A"]})
    assert r.json()["correct"] is True and r.json()["answer"] == ["A", "C"]
    r = client.post("/api/questions/ccna-q68/answer", json={"selected": ["A"]})
    assert r.status_code == 400
    r = client.post("/api/questions/ccna-q1/answer", json={"selected": ["A"]})
    assert r.json()["correct"] is False


def test_practice_quiz_flow(client, content):
    r = client.post("/api/quiz", json={"source": "ccnp", "groups": ["ch6"], "count": 4, "mode": "practice"})
    qz = r.json()["id"]
    state = client.get("/api/quiz/%d" % qz).json()
    assert state["total"] == 4 and state["source"] == "ccnp"
    assert all("answer" not in q for q in state["questions"])
    for q in state["questions"]:
        assert content["questions"][q["id"]]["group"] == "ch6"
        right = content["questions"][q["id"]]["answer"]
        res = client.post("/api/quiz/%d/answer" % qz, json={"question": q["id"], "selected": right}).json()
        assert res["correct"] is True
    again = client.post("/api/quiz/%d/answer" % qz, json={"question": state["questions"][0]["id"],
                                                          "selected": ["A"]})
    assert again.status_code == 400
    done = client.post("/api/quiz/%d/finish" % qz).json()
    assert done["finished"] and done["score"] == 4
    assert client.get("/quiz/%d" % qz).status_code == 200


def test_exam_hides_answers_until_submitted(client, content):
    qz = client.post("/api/quiz", json={"source": "bank", "count": 3, "mode": "exam"}).json()["id"]
    state = client.get("/api/quiz/%d" % qz).json()
    assert state["deadline"] is not None
    q = state["questions"][0]
    res = client.post("/api/quiz/%d/answer" % qz, json={"question": q["id"], "selected": content["questions"][q["id"]]["answer"]}).json()
    assert res == {"saved": True, "selected": content["questions"][q["id"]]["answer"]}
    assert "answer" not in client.get("/api/quiz/%d" % qz).json()["questions"][0]
    # Changing your mind is allowed before submitting, including taking it back.
    client.post("/api/quiz/%d/answer" % qz, json={"question": q["id"], "selected": []})
    assert client.get("/api/quiz/%d" % qz).json()["questions"][0]["selected"] is None
    client.post("/api/quiz/%d/answer" % qz, json={"question": q["id"], "selected": content["questions"][q["id"]]["answer"]})
    final = client.post("/api/quiz/%d/finish" % qz).json()
    assert final["score"] == 1
    assert all("answer" in x for x in final["questions"])


def test_missed_filter_uses_latest_answer(client):
    client.post("/api/questions/ccna-q5/answer", json={"selected": ["A"]})
    qz = client.post("/api/quiz", json={"source": "bank", "groups": ["d1"], "filter": "missed", "count": 100}).json()["id"]
    ids = [q["id"] for q in client.get("/api/quiz/%d" % qz).json()["questions"]]
    assert "ccna-q5" in ids
    client.post("/api/questions/ccna-q5/answer", json={"selected": ["C"]})
    qz = client.post("/api/quiz", json={"source": "bank", "groups": ["d1"], "filter": "missed", "count": 100})
    if qz.status_code == 200:
        ids = [q["id"] for q in client.get("/api/quiz/%d" % qz.json()["id"]).json()["questions"]]
        assert "ccna-q5" not in ids


def test_bad_quiz_requests(client):
    assert client.post("/api/quiz", json={"source": "nope", "count": 5}).status_code == 400
    assert client.post("/api/quiz", json={"source": "bank", "groups": ["zz"], "count": 5}).status_code == 400
    assert client.post("/api/quiz", json={"source": "bank", "count": 0}).status_code == 422


def test_flashcard_review_cycle(client):
    queue = client.get("/api/cards/queue?deck=ospf").json()
    card = queue["cards"][0]
    assert card["state"] == "new" and set(card["preview"]) == {"1", "2", "3", "4"}
    r1 = client.post("/api/cards/%s/review" % card["id"], json={"rating": 3}).json()
    assert r1["state"] == "learning" and r1["due_in_seconds"] == 600
    r2 = client.post("/api/cards/%s/review" % card["id"], json={"rating": 3}).json()
    assert r2["state"] == "review"
    after = client.get("/api/cards/queue?deck=ospf").json()
    assert card["id"] not in [c["id"] for c in after["cards"]]
    assert after["counts"]["new_limit_left"] == queue["counts"]["new_limit_left"] - 1
    assert client.post("/api/cards/%s/review" % card["id"], json={"rating": 7}).status_code == 422
    assert client.get("/api/cards/queue?deck=nope").status_code == 400


def test_new_card_limit(client):
    client.post("/api/settings", json={"new_cards_per_day": 0})
    assert client.get("/api/cards/queue").json()["counts"]["new"] == 0
    client.post("/api/settings", json={"new_cards_per_day": 20})


def test_drills_labs_pages_settings(client):
    assert client.post("/api/drills", json={"kind": "full", "correct": True, "duration_ms": 25000}).json()["ok"]
    assert client.post("/api/drills", json={"kind": "sheet", "item_id": "drill-q1", "correct": True}).json()["ok"]
    assert client.post("/api/drills", json={"kind": "nope", "correct": True}).status_code == 400
    assert client.get("/api/drills/stats").json()["kinds"]["full"]["n"] >= 1
    assert client.post("/api/labs/lab3/items/lab3-i1", json={"checked": True}).json()["ok"]
    assert client.post("/api/labs/lab3/items/lab4-i1", json={"checked": True}).status_code == 400
    assert client.post("/api/labs/lab3/complete", json={"completed": True}).json()["ok"]
    assert client.put("/api/labs/lab3/note", json={"note": "vlan 10"}).json()["ok"]
    assert "vlan 10" in client.get("/labs/lab3").text
    assert client.post("/api/pages/read", json={"doc": "ccna", "page": "24-1"}).json()["ok"]
    assert client.put("/api/pages/note", json={"doc": "ccna", "page": "24-1", "note": "my note"}).json()["ok"]
    assert "my note" in client.get("/read/ccna/24-1").text
    assert client.post("/api/pages/read", json={"doc": "ccna", "page": "zz"}).status_code == 400
    assert client.post("/api/settings", json={"timezone": "Nowhere/Land"}).status_code == 400
    assert client.post("/api/settings", json={"exam_seconds_per_question": 5}).status_code == 400
    assert client.post("/api/settings", json={"timezone": "America/Toronto"}).json()["timezone"] == "America/Toronto"


def test_every_terminal_lab_renders(client, content):
    from markupsafe import escape

    from app.content import get_content
    for lab in get_content().terminal_labs:
        html = client.get("/terminal/" + lab["id"]).text
        assert 'id="term-spec"' in html and escape(lab["title"]) in html
        assert html.count('class="task"') == len(lab["tasks"])
    assert client.get("/terminal/nope").status_code == 404


def test_terminal_save_complete_reset(client):
    from app.content import get_content
    lab = get_content().terminal_by_id["vlans"]
    state = {"v": 1, "devices": {"SW1": {"cfg": {"hostname": "SW1"}, "startup": None, "rt": {}}}}
    r = client.put("/api/terminal/vlans", json={"state": state, "passing": [0, 2]})
    assert r.json() == {"completed": False, "newly_completed": False}
    html = client.get("/terminal/vlans").text
    assert '"hostname": "SW1"' in html
    assert "2 / 4 tasks passing" in client.get("/terminal").text
    everything = list(range(len(lab["tasks"])))
    assert client.put("/api/terminal/vlans", json={"state": state, "passing": everything}).json() == \
        {"completed": True, "newly_completed": True}
    assert client.put("/api/terminal/vlans", json={"state": state, "passing": everything}).json()["newly_completed"] is False
    assert "Terminal labs" in client.get("/").text
    assert client.delete("/api/terminal/vlans").json()["ok"]
    page = client.get("/terminal/vlans").text
    assert '<script type="application/json" id="term-saved">null</script>' in page
    listing = client.get("/terminal").text
    assert "0 / 4 tasks passing" in listing and "done" in listing, "a reset keeps the lab's completion"
    assert client.put("/api/terminal/vlans", json={"state": state, "passing": [99]}).status_code == 400
    assert client.put("/api/terminal/vlans", json={"state": {"devices": []}, "passing": []}).status_code == 400
    assert client.put("/api/terminal/nope", json={"state": state, "passing": []}).status_code == 400
    assert client.delete("/api/terminal/nope").status_code == 400
    big = {"devices": {"SW1": {"blob": "x" * 2_100_000}}}
    assert client.put("/api/terminal/vlans", json={"state": big, "passing": []}).status_code == 400


def test_dashboard_reflects_progress(client):
    html = client.get("/").text
    assert "Continue reading" in html
    assert "Weak spots" in html


def test_search(client):
    html = client.get("/search?q=ip+helper-address").text
    assert "<mark>" in html and "result" in html


def test_quiz_title_names_the_exam(client, content):
    from app.content import get_content
    enarsi = get_content().ccnp_parts["ENARSI"]
    qz = client.post("/api/quiz", json={"source": "ccnp", "groups": enarsi, "count": 2}).json()["id"]
    assert client.get("/api/quiz/%d" % qz).json()["title"].endswith("all of ENARSI")



def test_sections_complete_through_their_questions(client, content):
    from app import services
    from app.content import get_content
    from app.db import SessionLocal
    from app.models import User
    page = content["docs"]["ccnp"]["pages"]["1-2"]
    qids = page["questions"]
    assert len(qids) >= 2

    def done():
        with SessionLocal() as db:
            uid = db.query(User).filter_by(username="admin").one().id
            return "1-2" in services.done_pages(db, uid, get_content(), "ccnp")

    def answer(qid, right):
        q = content["questions"][qid]
        pick = q["answer"] if right else [next(o["letter"] for o in q["options"] if o["letter"] not in q["answer"])]
        if not right and len(q["answer"]) > 1:
            pick = [o["letter"] for o in q["options"] if o["letter"] not in q["answer"]][:len(q["answer"])]
        assert client.post("/api/questions/%s/answer" % qid, json={"selected": pick}).json()["correct"] is right

    assert not done()
    # A section with questions can't be ticked by hand.
    r = client.post("/api/pages/read", json={"doc": "ccnp", "page": "1-2"})
    assert r.status_code == 400 and "every question" in r.json()["error"]
    for qid in qids[:-1]:
        answer(qid, True)
    html = client.get("/read/ccnp/1-2").text
    assert "%d of %d questions answered correctly" % (len(qids) - 1, len(qids)) in html
    assert not done()
    answer(qids[-1], False)
    assert not done(), "a wrong answer doesn't complete the section"
    answer(qids[-1], True)
    assert done()
    assert "Section complete: all %d questions answered correctly." % len(qids) in client.get("/read/ccnp/1-2").text
    # The contents page ticks it, and the latest answer counts: getting one wrong again reopens it.
    contents = client.get("/read/ccnp").text
    row = contents[contents.index('href="/read/ccnp/1-2"'):]
    assert " done</span>" in row[:row.index("</li>")]
    answer(qids[0], False)
    assert not done()
    answer(qids[0], True)
    assert done()


def test_sections_without_questions_complete_when_read(client):
    html = client.get("/read/ccna/24-2").text
    assert "This section completes when you reach the end of it." in html
    assert client.post("/api/pages/read", json={"doc": "ccna", "page": "24-2"}).json()["ok"]
    assert "Section complete: read to the end." in client.get("/read/ccna/24-2").text
