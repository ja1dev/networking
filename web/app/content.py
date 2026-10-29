"""Read-only access to the study content built by build_content.py."""
import html
import json
import re
from functools import cached_property

import markdown

from . import config

DOC_ORDER = ["ccna", "ccnp", "tips", "devnet"]
DOC_BLURBS = {
    "ccna": "CCNA 200-301 v1.1: 24 chapters, from first principles up",
    "ccnp": "ENCOR 350-401 v1.2 + ENARSI 300-410 v1.1, with exam-style questions in every section",
    "tips": "How to work through the CCNA kit: the daily loop and the readiness checkpoints",
    "devnet": "Run every lab on Cisco's free DevNet sandboxes, no hardware needed",
}
SOURCE_TITLES = {"bank": "CCNA Practice Bank", "ccnp": "CCNP Exam-Style Questions"}


class Content:
    def __init__(self, path):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        self.docs = data["docs"]
        self.questions = data["questions"]
        self.bank_groups = data["bank_groups"]
        self.decks = data["decks"]
        self.cards = data["cards"]
        self.drills = data["drills"]
        self.labs_intro_html = data["labs"]["intro_html"]
        self.labs = data["labs"]["labs"]
        self.stats = data["stats"]
        self.cards_by_id = {c["id"]: c for c in self.cards}
        self.labs_by_id = {l["id"]: l for l in self.labs}
        self.drills_by_id = {d["id"]: d for d in self.drills["drills"]}
        self.deck_by_id = {d["id"]: d for d in self.decks}
        self.terminal_labs = load_terminal_labs(config.TERMINAL_LABS_PATH)
        self.terminal_by_id = {l["id"]: l for l in self.terminal_labs}

    # -- documents --------------------------------------------------------
    def doc(self, doc_id):
        return self.docs.get(doc_id)

    def page(self, doc_id, page_id):
        doc = self.docs.get(doc_id)
        return doc["pages"].get(page_id) if doc else None

    def chapter_of(self, doc_id, page_id):
        doc = self.docs[doc_id]
        cid = doc["pages"][page_id]["chapter"]
        return next(c for c in doc["chapters"] if c["id"] == cid)

    # -- questions --------------------------------------------------------
    def question_groups(self, source):
        """[(group_id, title, [question ids])] in document order."""
        if source == "bank":
            groups = [(g["id"], g["title"]) for g in self.bank_groups]
        else:
            groups = [(c["id"], c["title"]) for c in self.docs[source]["chapters"]]
        out = []
        for gid, title in groups:
            ids = [qid for qid, q in self.questions.items()
                   if q["source"] == source and q["group"] == gid]
            if ids:
                out.append((gid, title, ids))
        return out

    @cached_property
    def ccnp_parts(self):
        """CCNP chapter ids by exam, for the quiz builder's shortcuts."""
        parts = {"ENCOR": [], "ENARSI": []}
        for c in self.docs["ccnp"]["chapters"]:
            if not c["number"]:
                continue  # the part's own intro page has no questions
            if c["part"] and "ENCOR" in c["part"]:
                parts["ENCOR"].append(c["id"])
            elif c["part"] and "ENARSI" in c["part"]:
                parts["ENARSI"].append(c["id"])
        return parts

    def question_link(self, q):
        if q["source"] == "bank":
            return None
        return "/read/%s/%s#q-%s" % (q["source"], q["page_id"], q["id"])

    # -- search -----------------------------------------------------------
    @cached_property
    def _search_index(self):
        entries = []
        for doc_id in DOC_ORDER:
            doc = self.docs[doc_id]
            chapters = {c["id"]: c["title"] for c in doc["chapters"]}
            for pid in doc["order"]:
                p = doc["pages"][pid]
                entries.append({"url": "/read/%s/%s" % (doc_id, pid), "title": p["title"],
                                "crumb": "%s · %s" % (doc["title"], chapters[p["chapter"]]),
                                "text": p["text"]})
        for lab in self.labs:
            entries.append({"url": "/labs/%s" % lab["id"], "title": lab["title"],
                            "crumb": "Lab Workbook", "text": lab["text"]})
        for lab in self.terminal_labs:
            text = " ".join([lab["summary"], lab["intro"]] + [t["title"] + " " + t["text"] for t in lab["tasks"]])
            entries.append({"url": "/terminal/%s" % lab["id"], "title": lab["title"],
                            "crumb": "Terminal labs · " + lab["topic"], "text": re.sub(r"[`*|]", "", text)})
        for c in self.cards:
            text = re.sub(r"<[^>]+>", "", c["front_html"] + " — " + c["back_html"])
            entries.append({"url": "/cards/browse?deck=%s#card-%s" % (c["deck"], c["id"]),
                            "title": html.unescape(re.sub(r"<[^>]+>", "", c["front_html"])),
                            "crumb": "Flashcards · " + self.deck_by_id[c["deck"]]["name"],
                            "text": html.unescape(text)})
        for e in entries:
            e["lower"] = e["text"].lower()
            e["title_lower"] = e["title"].lower()
        return entries

    def search(self, query, limit=60):
        terms = [t for t in re.findall(r"[\w./:-]+", query.lower()) if t]
        if not terms:
            return []
        results = []
        for e in self._search_index:
            if not all(t in e["lower"] or t in e["title_lower"] for t in terms):
                continue
            score = sum(e["lower"].count(t) for t in terms)
            score += sum(25 for t in terms if t in e["title_lower"])
            if query.lower().strip() in e["lower"]:
                score += 15
            results.append((score, e))
        results.sort(key=lambda r: -r[0])
        return [{"url": e["url"], "title": e["title"], "crumb": e["crumb"],
                 "snippet": _snippet(e["text"], terms)} for _, e in results[:limit]]


def _snippet(text, terms, width=220):
    lower = text.lower()
    pos = min((lower.find(t) for t in terms if lower.find(t) >= 0), default=0)
    start = max(0, pos - width // 3)
    chunk = text[start:start + width]
    escaped = html.escape(chunk)
    pattern = "|".join(re.escape(html.escape(t)) for t in sorted(set(terms), key=len, reverse=True))
    escaped = re.sub("(%s)" % pattern, r"<mark>\1</mark>", escaped, flags=re.IGNORECASE)
    return ("…" if start else "") + escaped + ("…" if start + width < len(text) else "")


def _md(text, inline=False):
    out = markdown.markdown(text, extensions=["tables"])
    if inline and out.startswith("<p>") and out.endswith("</p>") and out.count("<p>") == 1:
        out = out[3:-4]
    return out


def load_terminal_labs(path):
    """The hand-written terminal labs, with their Markdown rendered for the page."""
    with open(path, encoding="utf-8") as f:
        labs = json.load(f)
    for lab in labs:
        lab["intro_html"] = _md(lab["intro"])
        for t in lab["tasks"]:
            t["text_html"] = _md(t["text"], inline=True)
            t["hint_html"] = _md(t["hint"], inline=True)
    return labs


_content = None


def get_content():
    global _content
    if _content is None:
        _content = Content(config.CONTENT_PATH)
    return _content
