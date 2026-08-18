"""Build an Anki deck (.apkg) from the flashcard markdown source.

Each `## Heading` becomes a subdeck of "CCNA 200-301" and a tag; each
`**Q:** ... / **A:** ...` pair becomes one Basic (front/back) note.

IDs and note GUIDs are derived from stable hashes of the content, so
re-importing an updated deck UPDATES existing cards rather than duplicating
them -- your review history and scheduling survive a rebuild.

Usage: python scripts/build_anki.py [source.md] [output.apkg]
"""
import hashlib
import os
import re
import sys

import genanki

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs", "CCNA_Flashcards.md")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "CCNA_Flashcards.apkg")

TOP_DECK = "CCNA 200-301"


def stable_id(text):
    """A deterministic 31-bit id, so rebuilds keep the same deck/model ids."""
    return int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16) % (1 << 31)


MODEL = genanki.Model(
    stable_id("ccna-basic-model-v1"),
    "CCNA Basic",
    fields=[{"name": "Question"}, {"name": "Answer"}],
    templates=[{
        "name": "Q -> A",
        "qfmt": '<div class="q">{{Question}}</div>',
        "afmt": '{{FrontSide}}<hr id="answer"><div class="a">{{Answer}}</div>',
    }],
    css="""
.card {
  font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 19px;
  text-align: left;
  color: #1a1a1a;
  background-color: #ffffff;
  padding: 18px 20px;
  line-height: 1.5;
}
.q { font-weight: 600; color: #0b3d66; }
.a { margin-top: 4px; }
hr#answer { border: none; border-top: 2px solid #0b6cc4; margin: 14px 0 10px 0; }
b, strong { color: #0b6cc4; }
code { font-family: "SF Mono", Consolas, monospace; font-size: 0.9em;
       background-color: #eef1f4; color: #b02020; padding: 1px 4px; border-radius: 3px; }
em { color: #444; }
.nightMode.card { color: #e8e8e8; background-color: #2c2c2c; }
.nightMode .q { color: #7fbfff; }
.nightMode b, .nightMode strong { color: #7fbfff; }
.nightMode code { background-color: #3a3a3a; color: #ff9a9a; }
.nightMode em { color: #bbb; }
.nightMode hr#answer { border-top-color: #7fbfff; }
""",
)

# --- minimal markdown -> HTML for card text -------------------------------
def md_inline(s):
    s = (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", s)
    return s.strip()


def parse(path):
    """Yield (section, question, answer) triples."""
    with open(path, encoding="utf-8") as f:
        text = f.read().replace("\r\n", "\n")
    section = None
    q = None
    for line in text.split("\n"):
        if line.startswith("## "):
            section = line[3:].strip()
        elif line.startswith("**Q:**"):
            q = line[6:].strip()
        elif line.startswith("**A:**") and q is not None:
            yield section, q, line[6:].strip()
            q = None


def main():
    decks = {}
    notes = 0
    for section, q, a in parse(SRC):
        if section is None:
            raise SystemExit("card found before any '## section' heading")
        name = "%s::%s" % (TOP_DECK, section)
        if name not in decks:
            decks[name] = genanki.Deck(stable_id(name), name)
        # tag from the section: "05 Spanning Tree" -> "spanning-tree"
        tag = re.sub(r"^\d+\s*", "", section).lower()
        tag = re.sub(r"[^a-z0-9]+", "-", tag).strip("-")
        note = genanki.Note(
            model=MODEL,
            fields=[md_inline(q), md_inline(a)],
            tags=["ccna", tag],
            # GUID from the QUESTION only: editing an answer updates the
            # existing card instead of creating a duplicate.
            guid=genanki.guid_for("ccna-card::" + q),
        )
        decks[name].add_note(note)
        notes += 1

    if not notes:
        raise SystemExit("no cards parsed from %s" % SRC)

    genanki.Package(list(decks.values())).write_to_file(OUT)
    print("Wrote %s" % OUT)
    print("  %d cards across %d subdecks" % (notes, len(decks)))
    for name in sorted(decks):
        print("    %-52s %3d" % (name, len(decks[name].notes)))


if __name__ == "__main__":
    main()
