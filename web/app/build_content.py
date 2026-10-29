"""Turn the study kits' markdown into the structured content the web app serves.

The markdown in ccna/docs and ccnp/docs stays the single source of truth; this
script reads it and writes app/data/content.json, which holds:

  * docs      -- every readable document, split into chapters and pages, with
                 each exam-style question replaced by an interactive widget
  * questions -- every multiple-choice question (CCNA bank + CCNP guide) with
                 its options, answer letters and explanation
  * cards     -- the flashcard deck, one entry per Q/A pair
  * drills    -- the subnetting drill sheet's worked problems
  * labs      -- the lab workbook, with task and verification lists made checkable

It fails loudly when a question block can't be parsed, so a malformed edit to
the markdown stops the Docker build instead of silently dropping a question.

Usage: python -m app.build_content [output.json]
"""
import hashlib
import html
import json
import os
import re
import sys

import markdown

from .diagrams import DiagramError, prepare as prepare_diagram

APP_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(APP_DIR))
DEFAULT_OUT = os.path.join(APP_DIR, "data", "content.json")

# Readable documents. page_level 2 gives one page per "## section"; page_level 1
# gives one page per "# chapter", for docs whose sections are too short to stand
# alone.
DOCS = [
    {"id": "ccna", "kit": "ccna", "file": "ccna/docs/CCNA_Study_Guide.md",
     "title": "CCNA Study Guide", "page_level": 2},
    {"id": "ccnp", "kit": "ccnp", "file": "ccnp/docs/CCNP_Study_Guide.md",
     "title": "CCNP Enterprise Study Guide", "page_level": 2},
    {"id": "tips", "kit": "ccna", "file": "ccna/docs/CCNA_Study_Tips.md",
     "title": "CCNA Study Tips", "page_level": 2},
    {"id": "devnet", "kit": "ccna", "file": "ccna/docs/CCNA_DevNet_Labs.md",
     "title": "DevNet Lab Companion", "page_level": 1},
]
BANK_FILE = "ccna/docs/CCNA_Practice_Questions.md"
DRILLS_FILE = "ccna/docs/CCNA_Subnetting_Drills.md"
# Each kit's flashcard deck and lab workbook. Kits are the two tracks a reader can switch between.
CARDS_FILES = {"ccna": "ccna/docs/CCNA_Flashcards.md", "ccnp": "ccnp/docs/CCNP_Flashcards.md"}
LABS_FILES = {"ccna": "ccna/docs/CCNA_Lab_Workbook.md", "ccnp": "ccnp/docs/CCNP_Lab_Workbook.md"}

# The bank and drill sheet are fixed sets; a mismatch means a question block stopped parsing.
# The guides grow, so each is instead checked against its own count of "**Qn.**" lines.
EXPECTED = {"ccna_bank": 152, "drills": 60}

Q_START = re.compile(r"^\*\*Q(\d+)\.\*\*\s*(.*)$")
FENCE = re.compile(r"^\s*(```|~~~)")
DETAILS_OPEN = re.compile(r"^\s*<details>\s*(?:<summary>(.*?)</summary>)?\s*$")
SUMMARY_ONLY = re.compile(r"^\s*<summary>(.*?)</summary>\s*$")
ANSWER_LETTERS = re.compile(
    r"^\*\*(?:Answers?:\s*)?([A-F](?:\s*(?:,|and|&)\s*[A-F])*)(?=[.\s*])")
OPTION_BULLET = re.compile(r"^\s*-\s+\*\*([A-F])\.\*\*\s+(.*)$")
OPTION_PLAIN = re.compile(r"^([A-F])\.\s+(.*)$")
INLINE_OPTION_SPLIT = re.compile(r"\s{2,}(?=[B-F]\.\s)")
EXAM_HEADER = re.compile(r"^\*\*📝\s*Exam-style questions\s*[—-]\s*(.+?)\*\*\s*$")
LOOSE_Q = re.compile(r"^\s*\*\*\s*Q\s*\d+\s*[.:)]")
DIAGRAM_FENCE = re.compile(r"^```diagram\s*$")
PLACEHOLDER = "XXSLOT%05dXX"
PLACEHOLDER_P = re.compile(r"<p>XXSLOT(\d{5})XX</p>|XXSLOT(\d{5})XX")


SCRIPT = re.compile(r"<script\b[^>]*>.*?</script>", re.S)


class ContentError(Exception):
    pass


# ---------------------------------------------------------------------------
# markdown helpers
# ---------------------------------------------------------------------------

_md = markdown.Markdown(extensions=["tables", "fenced_code", "sane_lists", "toc"],
                        extension_configs={"toc": {"permalink": False}})


def read_lines(rel_path):
    with open(os.path.join(REPO_ROOT, rel_path), encoding="utf-8") as f:
        return f.read().replace("\r\n", "\n").split("\n")


def render(text, kit):
    """Markdown -> HTML, with image paths pointed at the kit's media mount."""
    _md.reset()
    out = _md.convert(text)
    out = re.sub(r'<img alt="([^"]*)" src="images/([^"]+)"\s*/?>',
                 lambda m: '<img alt="%s" src="/media/%s/%s" loading="lazy">'
                 % (m.group(1), kit, m.group(2)), out)
    out = out.replace("<table>", '<div class="table-wrap"><table>')
    out = out.replace("</table>", "</table></div>")
    return out


def render_inline(text, kit):
    """Render a one-paragraph snippet without its wrapping <p>."""
    out = render(text, kit).strip()
    m = re.fullmatch(r"<p>(.*)</p>", out, flags=re.DOTALL)
    return m.group(1) if m else out


def plain_text(fragment):
    text = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def slugify(text):
    text = re.sub(r"[^\w\s-]", "", text.lower(), flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text).strip("-")
    return re.sub(r"[^a-z0-9-]", "", text) or "page"


def clean_title(text):
    """Heading text without leading emoji or markdown emphasis."""
    text = re.sub(r"^[^\w`(]+", "", text.strip())
    return text.replace("**", "").replace("`", "").strip()


def fence_aware(lines):
    """Yield (index, line, in_fence) with in_fence true for lines inside code."""
    in_fence = False
    for i, line in enumerate(lines):
        if FENCE.match(line):
            yield i, line, True
            in_fence = not in_fence
            continue
        yield i, line, in_fence


def split_headings(lines, level):
    """Split lines on headings of exactly `level`, ignoring code fences.

    Returns (preamble_lines, [(heading_text, body_lines), ...]).
    """
    prefix = "#" * level + " "
    pre, parts, cur = [], [], None
    for _, line, in_fence in fence_aware(lines):
        if not in_fence and line.startswith(prefix):
            cur = (line[len(prefix):].strip(), [])
            parts.append(cur)
        elif cur is None:
            pre.append(line)
        else:
            cur[1].append(line)
    return pre, parts


def is_blank(lines):
    return not any(l.strip() and l.strip() != "---" for l in lines)


def strip_rules(lines):
    """Drop leading/trailing blank lines and horizontal rules."""
    while lines and (not lines[0].strip() or lines[0].strip() == "---"):
        lines = lines[1:]
    while lines and (not lines[-1].strip() or lines[-1].strip() == "---"):
        lines = lines[:-1]
    return lines


# ---------------------------------------------------------------------------
# question blocks
# ---------------------------------------------------------------------------

def find_blocks(lines):
    """Locate `**Qn.**` ... `</details>` blocks and bare <details> blocks.

    Returns a list of (start, end_exclusive, kind) with kind "q" or "details".
    """
    blocks = []
    i, n = 0, len(lines)
    in_fence = False
    while i < n:
        line = lines[i]
        if FENCE.match(line):
            in_fence = not in_fence
            i += 1
            continue
        if not in_fence and (Q_START.match(line) or DETAILS_OPEN.match(line)):
            kind = "q" if Q_START.match(line) else "details"
            j, inner_fence = i + 1, False
            while j < n:
                if FENCE.match(lines[j]):
                    inner_fence = not inner_fence
                elif not inner_fence:
                    if lines[j].strip() == "</details>":
                        break
                    if kind == "q" and Q_START.match(lines[j]):
                        raise ContentError("question at line %d has no answer block before "
                                           "the next question" % (i + 1))
                j += 1
            if j >= n:
                raise ContentError("unterminated block starting at line %d: %s"
                                   % (i + 1, line[:60]))
            blocks.append((i, j + 1, kind))
            i = j + 1
            continue
        i += 1
    return blocks


def split_details(block):
    """Split a block into (head_lines, summary, body_lines) around <details>."""
    for k, line in enumerate(block):
        m = DETAILS_OPEN.match(line)
        if m:
            summary = m.group(1)
            body = block[k + 1:-1]
            if summary is None:
                while body and not body[0].strip():
                    body = body[1:]
                sm = SUMMARY_ONLY.match(body[0]) if body else None
                if not sm:
                    raise ContentError("<details> without <summary>: %s" % block[0][:60])
                summary, body = sm.group(1), body[1:]
            return block[:k], summary.strip(), body
    raise ContentError("block has no <details>: %s" % block[0][:60])


def parse_options(head):
    """Split a question's head into stem lines and (letter, text) options."""
    stem, options, trailing = [], [], []
    for _, line, in_fence in fence_aware(head):
        if not in_fence and not FENCE.match(line):
            mb = OPTION_BULLET.match(line)
            mp = OPTION_PLAIN.match(line)
            if mb:
                options.append([mb.group(1), mb.group(2).strip()])
                continue
            if mp:
                for part in INLINE_OPTION_SPLIT.split(line.strip()):
                    pm = OPTION_PLAIN.match(part)
                    if not pm:
                        raise ContentError("can't split inline options: %s" % line)
                    options.append([pm.group(1), pm.group(2).strip()])
                continue
            if options and line.strip():
                # A wrapped option line continues the option above it.
                if not trailing:
                    options[-1][1] += " " + line.strip()
                    continue
        if options:
            trailing.append(line)
        else:
            stem.append(line)
    if any(l.strip() for l in trailing):
        raise ContentError("text after the options in question: %s" % head[0][:60])
    return stem, options


def parse_mcq(block, kit):
    """Parse a question block. Returns a dict, or None if it has no options."""
    head, summary, body = split_details(block)
    m = Q_START.match(head[0])
    number = int(m.group(1))
    head = [m.group(2)] + head[1:]
    stem, options = parse_options(head)
    body_text = "\n".join(body).strip()
    if not options:
        return {"number": number, "mcq": False,
                "prompt_html": render("\n".join(stem), kit),
                "summary": summary,
                "answer_html": render(body_text, kit)}
    letters = [o[0] for o in options]
    if letters != [chr(ord("A") + k) for k in range(len(letters))]:
        raise ContentError("Q%d: options out of order: %s" % (number, letters))
    am = ANSWER_LETTERS.match(body_text)
    if not am:
        raise ContentError("Q%d: answer doesn't start with the answer letter(s): %s"
                           % (number, body_text[:60]))
    answer = sorted(set(re.findall(r"[A-F]", am.group(1))))
    if not set(answer) <= set(letters):
        raise ContentError("Q%d: answer %s not among options %s" % (number, answer, letters))
    stem_text = "\n".join(stem).strip()
    return {
        "number": number,
        "mcq": True,
        "stem_html": render(stem_text, kit),
        "options": [{"letter": l, "html": render_inline(t, kit)} for l, t in options],
        "answer": answer,
        "explanation_html": render(body_text, kit),
        "text": plain_text(render(stem_text, kit)),
    }


def mcq_widget(q):
    """Static widget markup for a question embedded in a reading page."""
    multi = len(q["answer"])
    badge = '<span class="mcq-badge">Choose %d</span>' % multi if multi > 1 else ""
    opts = "".join(
        '<li><button type="button" class="mcq-opt" data-letter="%s">'
        '<span class="mcq-letter">%s</span><span class="mcq-text">%s</span></button></li>'
        % (o["letter"], o["letter"], o["html"]) for o in q["options"])
    return (
        '<div class="mcq" id="q-%s" data-qid="%s" data-multi="%d">'
        '<div class="mcq-head"><span class="mcq-num">Q%d</span>%s'
        '<span class="mcq-prev" hidden></span></div>'
        '<div class="mcq-stem">%s</div>'
        '<ol class="mcq-options">%s</ol>'
        '<div class="mcq-actions"><button type="button" class="btn btn-primary mcq-check" '
        'disabled>Check answer</button><button type="button" class="btn mcq-retry" hidden>'
        'Try again</button><span class="mcq-status" aria-live="polite"></span></div>'
        '<div class="mcq-explain" hidden></div></div>'
        % (q["id"], q["id"], multi, q["number"], badge, q["stem_html"], opts))


def diagram_figure(spec):
    """The figure the reader's script turns into an interactive diagram; the spec rides along as JSON."""
    data = json.dumps(spec, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return ('<figure class="dg" data-kind="%s"><script type="application/json" class="dg-spec">%s</script>'
            '<figcaption class="dg-head"><strong class="dg-title">%s</strong></figcaption>'
            '<p class="dg-nojs muted small">This diagram is interactive and needs JavaScript.</p></figure>'
            % (spec["type"], data, html.escape(spec["title"])))


def reveal_widget(summary, body_html):
    return ('<details class="reveal"><summary>%s</summary><div class="reveal-body">%s</div>'
            '</details>' % (html.escape(summary), body_html))


# ---------------------------------------------------------------------------
# readable documents
# ---------------------------------------------------------------------------

class PageRenderer:
    """Renders page markdown, swapping question blocks for widgets.

    Questions found along the way are collected into self.questions so the
    quiz engine can serve the same items the reader shows.
    """

    def __init__(self, doc_id, kit, questions):
        self.doc_id = doc_id
        self.kit = kit
        self.questions = questions
        self.blocks = 0

    def take_diagrams(self, lines, slots, ctx):
        """Swap each ```diagram block for a placeholder whose slot holds the interactive figure."""
        out = []
        i = 0
        for_inline = lambda text: render_inline(text, self.kit)
        while i < len(lines):
            if not DIAGRAM_FENCE.match(lines[i]):
                # Skip over other code blocks whole, so a diagram fence quoted inside one stays code.
                if FENCE.match(lines[i]):
                    j = i + 1
                    while j < len(lines) and not FENCE.match(lines[j]):
                        j += 1
                    out.extend(lines[i:j + 1])
                    i = j + 1
                    continue
                out.append(lines[i])
                i += 1
                continue
            j = i + 1
            while j < len(lines) and lines[j].strip() != "```":
                j += 1
            if j >= len(lines):
                raise ContentError("%s: unterminated diagram block" % ctx["page_title"])
            try:
                spec = prepare_diagram("\n".join(lines[i + 1:j]), for_inline)
            except DiagramError as e:
                raise ContentError("%s %s: diagram %s" % (self.doc_id, ctx["page_title"], e))
            slots.append(diagram_figure(spec))
            out.extend(["", PLACEHOLDER % (len(slots) - 1), ""])
            i = j + 1
        return out

    def render_page(self, lines, ctx):
        slots = []
        lines = self.take_diagrams(lines, slots, ctx)
        out = []
        last = 0
        group_label = None
        blocks = find_blocks(lines)
        for start, end, kind in blocks:
            out.extend(lines[last:start])
            block = lines[start:end]
            for l in lines[last:start]:
                hm = EXAM_HEADER.match(l.strip())
                if hm:
                    group_label = hm.group(1).strip()
            if kind == "q":
                self.blocks += 1
                q = parse_mcq(block, self.kit)
                if q["mcq"]:
                    q.update(self.question_meta(q, ctx, group_label))
                    if q["id"] in self.questions:
                        raise ContentError("duplicate question id %s" % q["id"])
                    self.questions[q["id"]] = q
                    slots.append(mcq_widget(q))
                else:
                    slots.append('<div class="qa-block"><div class="qa-prompt">'
                                 '<strong>Q%d.</strong> %s</div>%s</div>'
                                 % (q["number"], q["prompt_html"],
                                    reveal_widget(q["summary"], q["answer_html"])))
            else:
                _, summary, body = split_details(block)
                slots.append(reveal_widget(summary, render("\n".join(body), self.kit)))
            out.extend(["", PLACEHOLDER % (len(slots) - 1), ""])
            last = end
        out.extend(lines[last:])
        page_html = render("\n".join(out), self.kit)

        def fill(m):
            idx = int(m.group(1) or m.group(2))
            return slots[idx]
        return PLACEHOLDER_P.sub(fill, page_html)

    def question_meta(self, q, ctx, group_label):
        label = group_label or ctx["page_number"] or ctx["page_id"]
        return {
            "id": "%s-%s-q%d" % (self.doc_id, slugify(label.replace(".", "-")), q["number"]),
            "source": self.doc_id,
            "group": ctx["chapter_id"],
            "group_title": ctx["chapter_title"],
            "part": ctx["part"],
            "page_id": ctx["page_id"],
            "page_title": ctx["page_title"],
        }


def build_doc(cfg, questions):
    lines = read_lines(cfg["file"])
    pre, chapters_raw = split_headings(lines, 1)
    # The file's first "# Title" is the document title; whatever follows it up
    # to the next "# " heading is an introduction chapter.
    if not chapters_raw:
        raise ContentError("%s has no '# ' headings" % cfg["file"])
    _, intro_body = chapters_raw[0]
    chapters_raw = [("Introduction", intro_body)] + chapters_raw[1:]

    renderer = PageRenderer(cfg["id"], cfg["kit"], questions)
    chapters, pages = [], []
    used_ids = set()
    part = None

    def unique(base):
        pid, k = base, 2
        while pid in used_ids:
            pid = "%s-%d" % (base, k)
            k += 1
        used_ids.add(pid)
        return pid

    for title, body in chapters_raw:
        ctitle = clean_title(title)
        is_part = bool(re.match(r"^Part\s+[IVX]+\b", ctitle))
        if is_part:
            part = ctitle
        cm = re.match(r"^Chapter\s+(\d+)\s*:\s*(.*)$", ctitle)
        chap_id = unique("ch%s" % cm.group(1) if cm else slugify(ctitle))
        chapter = {"id": chap_id, "title": ctitle, "number": cm.group(1) if cm else None,
                   "is_part": is_part, "part": part, "pages": []}

        if cfg["page_level"] == 1:
            units = [(ctitle, body, chap_id, None)]
        else:
            intro, secs = split_headings(body, 2)
            units = []
            if not is_blank(intro):
                units.append(("Overview" if secs else ctitle, intro,
                              chap_id if not secs else chap_id + "-overview", None))
            for stitle, sbody in secs:
                st = clean_title(stitle)
                if re.search(r"table of contents", st, re.I):
                    continue
                sm = re.match(r"^(\d+(?:\.\d+)+)\s+(.*)$", st)
                pid = sm.group(1).replace(".", "-") if sm else "%s-%s" % (chap_id, slugify(st))
                units.append((st, sbody, pid, sm.group(1) if sm else None))

        for ptitle, pbody, pid, pnum in units:
            pbody = strip_rules(pbody)
            if not pbody:
                continue
            pid = unique(pid)
            ctx = {"chapter_id": chap_id, "chapter_title": ctitle, "part": part,
                   "page_id": pid, "page_title": ptitle, "page_number": pnum}
            page_html = renderer.render_page(pbody, ctx)
            page = {"id": pid, "title": ptitle, "chapter": chap_id, "html": page_html,
                    "text": plain_text(SCRIPT.sub(" ", page_html)),
                    "questions": [qid for qid, q in questions.items()
                                  if q["source"] == cfg["id"] and q["page_id"] == pid]}
            pages.append(page)
            chapter["pages"].append(pid)
        if chapter["pages"]:
            chapters.append(chapter)

    written = sum(1 for _, line, in_fence in fence_aware(lines) if not in_fence and LOOSE_Q.match(line))
    if written != renderer.blocks:
        raise ContentError("%s has %d lines that start a question but %d parsed; check the **Qn.** "
                           "formatting near the new questions" % (cfg["file"], written, renderer.blocks))
    for k, p in enumerate(pages):
        p["prev"] = pages[k - 1]["id"] if k else None
        p["next"] = pages[k + 1]["id"] if k + 1 < len(pages) else None
    return {"id": cfg["id"], "kit": cfg["kit"], "title": cfg["title"],
            "chapters": chapters, "pages": {p["id"]: p for p in pages},
            "order": [p["id"] for p in pages]}


# ---------------------------------------------------------------------------
# CCNA practice bank
# ---------------------------------------------------------------------------

def build_bank(questions):
    lines = read_lines(BANK_FILE)
    _, domains = split_headings(lines, 1)
    count = 0
    groups = []
    for title, body in domains[1:]:
        dtitle = clean_title(title)
        dm = re.match(r"^Domain\s+(\w+)\s*[—-]\s*(.*)$", dtitle)
        if not dm:
            raise ContentError("unexpected bank heading: %s" % title)
        gid = "d" + dm.group(1).lower()
        groups.append({"id": gid, "title": dtitle})
        for start, end, kind in find_blocks(body):
            if kind != "q":
                raise ContentError("bare <details> in the question bank near: %s" % body[start])
            q = parse_mcq(body[start:end], "ccna")
            if not q["mcq"]:
                raise ContentError("bank Q%d has no options" % q["number"])
            q.update({"id": "ccna-q%d" % q["number"], "source": "bank", "group": gid,
                      "group_title": dtitle, "part": None, "page_id": None, "page_title": None})
            if q["id"] in questions:
                raise ContentError("duplicate bank question %s" % q["id"])
            questions[q["id"]] = q
            count += 1
    return groups, count


# ---------------------------------------------------------------------------
# flashcards, drills, labs
# ---------------------------------------------------------------------------

def build_cards(kit):
    decks, cards = [], []
    deck = None
    q = None
    for line in read_lines(CARDS_FILES[kit]):
        if line.startswith("## "):
            title = line[3:].strip()
            slug = slugify(re.sub(r"^\d+\s*", "", title))
            # CCNA deck ids predate the CCNP deck, so only the newer kit is prefixed.
            deck = {"id": slug if kit == "ccna" else kit + "-" + slug, "title": title,
                    "name": re.sub(r"^\d+\s*", "", title), "kit": kit}
            decks.append(deck)
        elif line.startswith("**Q:**"):
            q = line[6:].strip()
        elif line.startswith("**A:**") and q is not None:
            if deck is None:
                raise ContentError("flashcard before any '## deck' heading: %s" % q)
            cards.append({
                # Same key as the Anki build's GUID: editing an answer keeps the card.
                "id": hashlib.sha256((kit + "-card::" + q).encode("utf-8")).hexdigest()[:16],
                "deck": deck["id"],
                "kit": kit,
                "front_html": render_inline(q, kit),
                "back_html": render_inline(line[6:].strip(), kit),
            })
            q = None
    if len({c["id"] for c in cards}) != len(cards):
        raise ContentError("two flashcards share the same question text")
    return decks, cards


def build_drills():
    lines = read_lines(DRILLS_FILE)
    _, sections = split_headings(lines, 1)
    toolkit_lines = strip_rules(sections[0][1])
    # Drop the intro blockquotes; the toolkit starts at its own heading.
    for k, l in enumerate(toolkit_lines):
        if l.startswith("## "):
            toolkit_lines = toolkit_lines[k:]
            break
    drill_sections, drills, speed_html = [], [], ""
    for title, body in sections[1:]:
        st = clean_title(title)
        sm = re.match(r"^SECTION\s+(\d+)\s*[—-]\s*(.*)$", st)
        if not sm:
            speed_html = render("\n".join(strip_rules(body)), "ccna")
            continue
        sid = "s" + sm.group(1)
        intro = []
        for l in body:
            if Q_START.match(l):
                break
            intro.append(l)
        drill_sections.append({"id": sid, "title": sm.group(2).strip(),
                               "intro_html": render("\n".join(strip_rules(intro)), "ccna")})
        for start, end, kind in find_blocks(body):
            if kind != "q":
                raise ContentError("bare <details> in the drill sheet near: %s" % body[start])
            q = parse_mcq(body[start:end], "ccna")
            drills.append({"id": "drill-q%d" % q["number"], "number": q["number"],
                           "section": sid, "prompt_html": q.get("prompt_html") or q["stem_html"],
                           "answer_html": q.get("answer_html") or q["explanation_html"]})
    return {"toolkit_html": render("\n".join(toolkit_lines), "ccna"),
            "speed_html": speed_html, "sections": drill_sections, "drills": drills}


LIST_ITEM = re.compile(r"^(\d+\.|-|\*)\s+(.*)$")
CHECKABLE_HEADING = re.compile(
    r"^##\s+(Tasks|Verification checklist|Part [A-Z]\b|Grade yourself|Break-and-fix)")


def checkable_list(lines, start, lab_id, counter, kit):
    """Turn the list after a Tasks/Verification heading into checkbox items.

    Returns (end_index, html, items).
    """
    i = start
    while i < len(lines) and not lines[i].strip():
        i += 1
    items = []
    while i < len(lines):
        line = lines[i]
        m = LIST_ITEM.match(line)
        if m:
            items.append([m.group(2)])
            i += 1
            continue
        if not items:
            break
        if line.strip() == "":
            nxt = i + 1
            while nxt < len(lines) and not lines[nxt].strip():
                nxt += 1
            if nxt < len(lines) and (LIST_ITEM.match(lines[nxt]) or lines[nxt].startswith((" ", "\t"))):
                items[-1].append("")
                i += 1
                continue
            break
        if line.startswith("#") or DETAILS_OPEN.match(line) or Q_START.match(line):
            break
        items[-1].append(re.sub(r"^ {2,3}", "", line))
        i += 1
    rendered = []
    for parts in items:
        counter[0] += 1
        iid = "%s-i%d" % (lab_id, counter[0])
        body = render("\n".join(parts), kit)
        rendered.append({"id": iid, "html": body})
    markup = '<ul class="checklist">%s</ul>' % "".join(
        '<li><label class="check-item"><input type="checkbox" data-item="%s">'
        '<span class="check-body">%s</span></label></li>' % (it["id"], it["html"])
        for it in rendered)
    return i, markup, rendered


def build_labs(kit):
    lines = read_lines(LABS_FILES[kit])
    _, chapters = split_headings(lines, 1)
    intro_html = render("\n".join(strip_rules(chapters[0][1])), kit)
    labs = []
    for title, body in chapters[1:]:
        lt = clean_title(title)
        lm = re.match(r"^Lab\s+(\d+)\s*[—-]\s*(.*)$", lt)
        lab_id = ("lab%s" % lm.group(1) if lm else slugify(lt))
        if kit != "ccna":
            lab_id = kit + "-" + lab_id
        body = strip_rules(body)
        # "**Guide sections:** 8.4 · **Time:** ~45 min · **Diagram:** ..." becomes
        # the lab's header strip.
        meta_html = ""
        if body and body[0].startswith("**Guide sections:**"):
            meta_html = render_inline(body[0], kit)
            body = body[1:]
        # Swap the checkable lists for placeholders, then render the rest.
        out, slots, items, counter = [], [], [], [0]
        i = 0
        renderer = PageRenderer("labs", kit, {})
        in_fence = False
        while i < len(body):
            line = body[i]
            if FENCE.match(line):
                in_fence = not in_fence
            if not in_fence and CHECKABLE_HEADING.match(line):
                out.append(line)
                i += 1
                # Keep any lead-in prose; the list that follows is what gets ticked.
                while (i < len(body) and not LIST_ITEM.match(body[i])
                       and not body[i].startswith("#") and not DETAILS_OPEN.match(body[i])):
                    out.append(body[i])
                    i += 1
                if i < len(body) and LIST_ITEM.match(body[i]):
                    end, markup, its = checkable_list(body, i, lab_id, counter, kit)
                    slots.append(markup)
                    items.extend(its)
                    out.extend(["", "XXCHECK%05dXX" % (len(slots) - 1), ""])
                    i = end
                continue
            out.append(line)
            i += 1
        page_html = renderer.render_page(out, {"chapter_id": lab_id, "chapter_title": lt,
                                               "part": None, "page_id": lab_id,
                                               "page_title": lt, "page_number": None})
        page_html = re.sub(r"<p>XXCHECK(\d{5})XX</p>",
                           lambda m: slots[int(m.group(1))], page_html)
        if "XXCHECK" in page_html:
            raise ContentError("checklist placeholder left in %s" % lab_id)
        labs.append({"id": lab_id, "kit": kit, "number": int(lm.group(1)) if lm else None,
                     "title": lm.group(2).strip() if lm else lt, "meta_html": meta_html,
                     "html": page_html, "items": [it["id"] for it in items],
                     "text": plain_text(page_html)})
    return {"intro_html": intro_html, "labs": labs}


# ---------------------------------------------------------------------------

def build():
    questions = {}
    docs = {cfg["id"]: build_doc(cfg, questions) for cfg in DOCS}
    groups, bank_count = build_bank(questions)
    ccnp_count = sum(1 for q in questions.values() if q["source"] == "ccnp")
    ccna_count = sum(1 for q in questions.values() if q["source"] == "ccna")
    decks, cards = [], []
    labs = {"intro_html": {}, "labs": []}
    for kit in CARDS_FILES:
        kit_decks, kit_cards = build_cards(kit)
        decks += kit_decks
        cards += kit_cards
        kit_labs = build_labs(kit)
        labs["intro_html"][kit] = kit_labs["intro_html"]
        labs["labs"] += kit_labs["labs"]
    if len({c["id"] for c in cards}) != len(cards):
        raise ContentError("two flashcards share the same question text")
    drills = build_drills()
    counts = {"ccna_bank": bank_count, "ccna": ccna_count, "ccnp": ccnp_count, "drills": len(drills["drills"])}
    for key, want in EXPECTED.items():
        if counts[key] != want:
            raise ContentError("expected %d %s questions, parsed %d" % (want, key, counts[key]))
    for q in questions.values():
        q.pop("mcq", None)
    return {
        "docs": docs,
        "questions": questions,
        "bank_groups": groups,
        "decks": decks,
        "cards": cards,
        "drills": drills,
        "labs": labs,
        "stats": dict(counts, cards=len(cards), labs=len(labs["labs"]),
                      pages=sum(len(d["pages"]) for d in docs.values()),
                      diagrams=sum(p["html"].count('<figure class="dg"') for d in docs.values() for p in d["pages"].values())),
    }


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_OUT
    try:
        content = build()
    except ContentError as e:
        raise SystemExit("content build failed: %s" % e)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(content, f, ensure_ascii=False, separators=(",", ":"))
    s = content["stats"]
    print("Wrote %s (%.1f MB)" % (out, os.path.getsize(out) / 1e6))
    print("  %d pages, %d interactive diagrams, %d CCNA bank + %d CCNA guide + %d CCNP questions, "
          "%d cards, %d drills, %d labs" % (s["pages"], s["diagrams"], s["ccna_bank"], s["ccna"], s["ccnp"],
                                           s["cards"], s["drills"], s["labs"]))


if __name__ == "__main__":
    main()
