import os
import re
import sys
import markdown
from xhtml2pdf import pisa
from xhtml2pdf import default as x2p_default
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping

# Repo root, so fonts and default paths resolve no matter where this is run from.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "fonts")

# Preferred fonts first, bundled fallback second. Segoe UI / Consolas are
# Windows-only and can't be redistributed, so DejaVu (Bitstream Vera license,
# full box-drawing coverage) ships in fonts/ and is used when they're absent.
_FONT_CHOICES = [
    ("Sans", ["segoeui.ttf", "DejaVuSans.ttf"], ["segoeuib.ttf", "DejaVuSans-Bold.ttf"]),
    ("Mono", ["consola.ttf", "DejaVuSansMono.ttf"], ["consolab.ttf", "DejaVuSansMono-Bold.ttf"]),
]


def pick_font(candidates):
    """Return the first candidate present in fonts/, else raise a clear error."""
    for name in candidates:
        path = os.path.join(FONT_DIR, name)
        if os.path.exists(path):
            return path
    raise SystemExit(
        f"No font found in {FONT_DIR}. Looked for: {', '.join(candidates)}"
    )


_FONTS = [
    (family, pick_font(regular), pick_font(bold))
    for family, regular, bold in _FONT_CHOICES
]
for family, regular, bold in _FONTS:
    pdfmetrics.registerFont(TTFont(family, regular))
    pdfmetrics.registerFont(TTFont(family + "-Bold", bold))
    addMapping(family, 0, 0, family)
    addMapping(family, 1, 0, family + "-Bold")
    x2p_default.DEFAULT_FONT[family.lower()] = family

# Usage: python scripts/build_pdf.py [source.md] [output.pdf] [footer title]
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs", "CCNA_Study_Guide.md")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "pdf", "CCNA_Study_Guide.pdf")
FOOTER_TITLE = sys.argv[3] if len(sys.argv) > 3 else "CCNA Study Guide"

with open(SRC, "r", encoding="utf-8") as f:
    text = f.read()


def normalize_blocks(md_text):
    """Insert a blank line before list/table blocks that directly follow a
    paragraph, so python-markdown recognizes them (outside code fences)."""
    lines = md_text.split("\n")
    out = []
    in_code = False
    for i, ln in enumerate(lines):
        stripped = ln.lstrip()
        if stripped.startswith("```"):
            in_code = not in_code
            out.append(ln)
            continue
        if not in_code and out:
            prev = out[-1]
            prev_s = prev.strip()
            is_list = stripped.startswith("- ") or stripped.startswith("* ")
            is_table = stripped.startswith("|")
            prev_is_list = prev.lstrip().startswith(("- ", "* "))
            prev_is_table = prev.lstrip().startswith("|")
            if (is_list and prev_s and not prev_is_list) or (
                is_table and prev_s and not prev_is_table
            ):
                out.append("")
        out.append(ln)
    return "\n".join(out)


text = normalize_blocks(text)

# Strip emoji / pictographs that the PDF fonts can't render as color glyphs.
# IMPORTANT: keep box-drawing (U+2500-257F), block elements (U+2580-259F),
# and geometric shapes/arrows (U+2190-21FF, U+25A0-25FF) used in diagrams.
emoji_pattern = re.compile(
    "[\U0001F000-\U0001FAFF"   # emoji & symbols
    "\U00002600-\U000027BF"    # misc symbols & dingbats (checkmarks etc.)
    "\U00002B00-\U00002BFF"    # extra arrows/stars (but keep 25xx)
    "\U0000FE00-\U0000FE0F"    # variation selectors
    "\U0001F1E6-\U0001F1FF]+", # flags
    flags=re.UNICODE,
)
text = emoji_pattern.sub("", text)

# Convert GitHub-style <details>/<summary> answer blocks into styled boxes.
# Using md_in_html so markdown (tables, lists, bold) inside still renders.
text = re.sub(
    r"<details>\s*<summary>(.*?)</summary>",
    r'<div class="answer" markdown="1">\n\n**\1**\n',
    text,
    flags=re.DOTALL,
)
text = text.replace("</details>", "\n</div>")

html_body = markdown.markdown(
    text,
    extensions=["tables", "fenced_code", "toc", "sane_lists", "md_in_html"],
)

css = r"""
@page {
  size: letter;
  margin: 1.7cm 1.6cm 2cm 1.6cm;
  @frame footer { -pdf-frame-content: footerContent; bottom: 1cm; margin-left: 1.6cm; margin-right: 1.6cm; height: 1cm; }
}

body { font-family: "Sans"; font-size: 10.5pt; line-height: 1.4; color: #1a1a1a; }

h1 { font-family: "Sans"; font-size: 20pt; color: #0b3d66; border-bottom: 2pt solid #0b6cc4;
     padding-bottom: 4pt; margin-top: 18pt; -pdf-keep-with-next: true; }
h2 { font-family: "Sans"; font-size: 15pt; color: #0b6cc4; margin-top: 14pt; -pdf-keep-with-next: true; }
h3 { font-family: "Sans"; font-size: 12.5pt; color: #12507e; margin-top: 10pt; -pdf-keep-with-next: true; }
h4 { font-family: "Sans"; font-size: 11pt; color: #333; margin-top: 8pt; }

p { margin: 5pt 0; }
li { margin: 2pt 0; }
strong { font-weight: bold; color: #0b3d66; }

a { color: #0b6cc4; text-decoration: none; }

blockquote {
  background-color: #fff6e0;
  border-left: 4pt solid #f0ad4e;
  margin: 8pt 0; padding: 6pt 10pt;
  font-size: 10pt;
}

pre {
  font-family: "Mono"; font-size: 8pt; line-height: 1.15;
  background-color: #f4f6f8; border: 0.6pt solid #cdd7e0;
  padding: 7pt; margin: 7pt 0;
  -pdf-keep-in-frame-mode: overflow;
}
code { font-family: "Mono"; font-size: 9pt; background-color: #eef1f4; color: #b23; }
pre code { color: #1a1a1a; background-color: transparent; font-size: 8pt; }

table { -pdf-keep-in-frame-mode: shrink; margin: 8pt 0; width: 100%; }
th { background-color: #0b6cc4; color: #ffffff; font-weight: bold; padding: 4pt 6pt;
     font-size: 9.5pt; text-align: left; border: 0.5pt solid #0b6cc4; }
td { padding: 3pt 6pt; font-size: 9.5pt; border: 0.5pt solid #cdd7e0; }

hr { border: none; border-top: 0.8pt solid #cdd7e0; margin: 12pt 0; }

.answer {
  background-color: #eaf7ee;
  border: 0.7pt solid #57b877;
  border-left: 4pt solid #33a457;
  padding: 4pt 10pt;
  margin: 6pt 0 10pt 0;
}
"""

html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>{css}</style></head>
<body>
{html_body}
<div id="footerContent" style="font-family:'Sans'; font-size:8pt; color:#8895a2; text-align:center;">
  {FOOTER_TITLE} &nbsp;&bull;&nbsp; Page <pdf:pagenumber> of <pdf:pagecount>
</div>
</body></html>"""

with open(OUT, "wb") as out_file:
    result = pisa.CreatePDF(html, dest=out_file, encoding="utf-8",
                            path=ROOT + os.sep)

if result.err:
    print(f"FAILED with {result.err} errors")
else:
    print("PDF created successfully:", OUT)
