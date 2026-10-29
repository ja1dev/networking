"""The markdown -> content build: every question parsed, nothing left raw."""
import re


def test_counts_match_the_kits(content):
    s = content["stats"]
    assert s["ccna_bank"] == 152
    assert s["ccnp"] == 820
    assert s["ccna"] == 528
    assert s["drills"] == 60
    kit_cards = {k: sum(1 for c in content["cards"] if c["kit"] == k) for k in ("ccna", "ccnp")}
    assert kit_cards == {"ccna": 299, "ccnp": 575}
    assert s["cards"] == 874


def test_every_question_is_well_formed(content):
    for qid, q in content["questions"].items():
        letters = [o["letter"] for o in q["options"]]
        assert letters == [chr(65 + i) for i in range(len(letters))], qid
        assert 2 <= len(letters) <= 6, qid
        assert q["answer"] and set(q["answer"]) <= set(letters), qid
        assert q["stem_html"].strip() and q["explanation_html"].strip(), qid


def test_choose_two_questions_have_two_answers(content):
    for qid, q in content["questions"].items():
        if re.search(r"\(Choose two\.?\)", q["text"], re.I):
            assert len(q["answer"]) == 2, qid


def test_inline_and_multiline_option_formats(content):
    q1 = content["questions"]["ccna-q1"]
    assert [o["html"] for o in q1["options"]] == ["Router", "Switch", "Firewall", "Load balancer"]
    assert q1["answer"] == ["B"]
    q68 = content["questions"]["ccna-q68"]
    assert q68["answer"] == ["A", "C"]
    assert q68["options"][0]["html"] == "<code>standby 1 ip 10.1.1.1</code>"


def test_exhibits_stay_in_the_stem(content):
    q = content["questions"]["ccnp-1-3-q1"]
    assert "<pre><code>CORE1# show ip route 10.20.7.5" in q["stem_html"]
    assert q["answer"] == ["C"]


def test_pages_have_widgets_not_raw_blocks(content):
    for doc in content["docs"].values():
        for page in doc["pages"].values():
            assert "XXSLOT" not in page["html"]
            assert "<details>" not in page["html"], page["id"]
            for qid in page["questions"]:
                assert 'data-qid="%s"' % qid in page["html"]
            # Answers never ship inside the reading page.
            for qid in page["questions"]:
                assert content["questions"][qid]["explanation_html"] not in page["html"]


def test_ccnp_questions_link_back_to_their_section(content):
    for qid, q in content["questions"].items():
        if q["source"] == "ccnp":
            assert q["page_id"] in content["docs"]["ccnp"]["pages"], qid
            assert qid in content["docs"]["ccnp"]["pages"][q["page_id"]]["questions"]


def test_images_point_at_the_media_mounts(content):
    html = content["docs"]["ccnp"]["pages"]["1-3"]["html"]
    assert 'src="/media/ccnp/c01_tiers.png"' in html


def test_labs_have_checklists(content):
    labs = {l["id"]: l for l in content["labs"]["labs"]}
    assert len(labs["lab5"]["items"]) == 10  # Part A + Part B + verification
    for n in range(1, 18):
        assert labs["lab%d" % n]["items"], "lab%d has no checkable steps" % n
        for item in labs["lab%d" % n]["items"]:
            assert 'data-item="%s"' % item in labs["lab%d" % n]["html"]


def test_card_ids_are_unique_and_stable(content):
    ids = [c["id"] for c in content["cards"]]
    assert len(ids) == len(set(ids))
    decks = {k: [d for d in content["decks"] if d["kit"] == k] for k in ("ccna", "ccnp")}
    assert len(decks["ccna"]) == 15 and len(decks["ccnp"]) == 18
    # CCNA ids predate the CCNP deck and must not move, or existing review history is lost.
    assert decks["ccna"][0]["id"] == "network-fundamentals"
    assert all(d["id"].startswith("ccnp-") for d in decks["ccnp"])
    assert all(c["deck"] in {d["id"] for d in content["decks"] if d["kit"] == c["kit"]} for c in content["cards"])


def test_both_workbooks_load(content):
    labs = content["labs"]["labs"]
    ccna = [l for l in labs if l["kit"] == "ccna"]
    ccnp = [l for l in labs if l["kit"] == "ccnp"]
    assert len(ccna) == 19 and len(ccnp) == 22
    assert all(l["id"].startswith("ccnp-lab") for l in ccnp)
    assert all(len(l["items"]) >= 3 for l in ccnp), "every CCNP lab has something to tick"
    assert set(content["labs"]["intro_html"]) == {"ccna", "ccnp"}
    ids = [i for l in labs for i in l["items"]]
    assert len(ids) == len(set(ids)), "checklist item ids are unique across both workbooks"
