"""Build an interactive 'tap-to-reveal' PDF from a Q&A markdown file.

Each <details><summary>Answer</summary>...</details> block becomes a hidden
PDF layer (OCG) with a pushbutton that toggles it. Works in Adobe Acrobat.
"""
import re
import os
import sys
import markdown
import pymupdf

SRC = sys.argv[1] if len(sys.argv) > 1 else r"u:\Users\Misc\CCNA_Practice_Questions.md"
OUT = sys.argv[2] if len(sys.argv) > 2 else r"u:\Users\Misc\CCNA_Practice_Questions_Interactive.pdf"
TITLE = sys.argv[3] if len(sys.argv) > 3 else "CCNA Practice Questions"
SLICE = int(sys.argv[4]) if len(sys.argv) > 4 else 0   # 0 = all; N = first N answers only

# ---- page geometry ----
PW, PH = 612, 792              # US Letter
ML, MR, MT, MB = 54, 54, 58, 54
COLW = PW - ML - MR
BOTTOM = PH - MB
BTN_H = 18
GAP = 4

ARCH = pymupdf.Archive("fonts")

CSS = """
@font-face { font-family: Sans; src: url(segoeui.ttf); }
@font-face { font-family: SansB; src: url(segoeuib.ttf); }
@font-face { font-family: Mono; src: url(consola.ttf); }
* { font-family: Sans; }
body { font-family: Sans; font-size: 10.5px; color: #1a1a1a; line-height: 1.35; }
p { margin: 3px 0; }
h1 { font-family: SansB; font-size: 17px; color: #0b3d66; margin: 6px 0 3px 0; }
h2 { font-family: SansB; font-size: 13px; color: #0b6cc4; margin: 5px 0 3px 0; }
h3 { font-family: SansB; font-size: 11.5px; color: #12507e; margin: 4px 0; }
strong, b { font-family: SansB; color: #0b3d66; }
code { font-family: Mono; font-size: 9.5px; color: #b02020; }
pre { font-family: Mono; font-size: 8.5px; color: #1a1a1a; background-color: #f4f6f8;
      padding: 5px; margin: 4px 0; }
pre code { color: #1a1a1a; }
ul, ol { margin: 3px 0 3px 16px; }
li { margin: 1px 0; }
table { margin: 4px 0; }
th { background-color: #0b6cc4; color: #ffffff; font-family: SansB; font-size: 9px;
     padding: 3px 5px; text-align: left; border: 1px solid #0b6cc4; }
td { font-size: 9px; padding: 3px 5px; border: 1px solid #cdd7e0; }
.answer { background-color: #eaf7ee; border: 1px solid #57b877; padding: 4px 8px; }
.answer-label { font-family: SansB; color: #0b7a3b; font-size: 10px; }
"""

EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U00002B00-\U00002BFF"
    "\U0000FE00-\U0000FE0F\U0001F1E6-\U0001F1FF]",
    flags=re.UNICODE,
)


def md2html(md_text):
    md_text = EMOJI.sub("", md_text)
    body = markdown.markdown(
        md_text, extensions=["tables", "fenced_code", "sane_lists"]
    )
    return f"<div>{body}</div>"


def split_segments(text):
    """Yield ('content', md) and ('answer', md) segments in order."""
    pat = re.compile(r"<details>\s*<summary>.*?</summary>(.*?)</details>", re.DOTALL)
    pos = 0
    for m in pat.finditer(text):
        if m.start() > pos:
            yield ("content", text[pos:m.start()])
        yield ("answer", m.group(1).strip())
        pos = m.end()
    if pos < len(text):
        yield ("content", text[pos:])


def split_blocks(md_text):
    """Split a content segment into renderable blocks (respect code/tables)."""
    lines = md_text.split("\n")
    blocks, cur, in_code = [], [], False
    def flush():
        if cur:
            chunk = "\n".join(cur).strip()
            if chunk:
                blocks.append(chunk)
            cur.clear()
    for ln in lines:
        s = ln.strip()
        if s.startswith("```"):
            cur.append(ln); in_code = not in_code
            if not in_code:
                flush()
            continue
        if in_code:
            cur.append(ln); continue
        if s == "":
            flush(); continue
        if s == "---":
            flush(); blocks.append("---"); continue
        if s.startswith("#"):
            flush(); blocks.append(ln); continue
        cur.append(ln)
    flush()
    return blocks


class Builder:
    def __init__(self, title):
        self.doc = pymupdf.open()
        self.title = title
        self.scratch = pymupdf.open()
        self.sp = self.scratch.new_page(width=PW, height=4000)
        self.page = None
        self.y = 0
        self.pageno = 0
        self.new_page()

    def new_page(self):
        if self.page is not None:
            self.footer()
        self.page = self.doc.new_page(width=PW, height=PH)
        self.pageno += 1
        self.y = MT

    def footer(self):
        txt = f"{self.title}  \u2022  Page {self.pageno}"
        self.page.insert_text((ML, PH - 30), txt, fontsize=8, color=(0.53, 0.58, 0.64))

    def measure(self, html, width=COLW):
        # clear scratch page then measure
        self.sp.clean_contents()
        r = pymupdf.Rect(0, 0, width, 4000)
        spare, _ = self.sp.insert_htmlbox(r, html, css=CSS, archive=ARCH, scale_low=1)
        return 4000 - spare if spare >= 0 else 4000

    def ensure(self, h):
        if self.y + h > BOTTOM:
            self.new_page()

    def place_content(self, html):
        h = self.measure(html)
        # block taller than a page: allow shrink-to-fit on a fresh page
        if h > BOTTOM - MT:
            self.new_page()
            r = pymupdf.Rect(ML, self.y, ML + COLW, BOTTOM)
            self.page.insert_htmlbox(r, html, css=CSS, archive=ARCH, scale_low=0.5)
            self.y = BOTTOM
            return
        self.ensure(h)
        r = pymupdf.Rect(ML, self.y, ML + COLW, self.y + h + 2)
        self.page.insert_htmlbox(r, html, css=CSS, archive=ARCH, scale_low=1)
        self.y += h + 2

    def place_answer(self, html, idx):
        wrapped = f'<div class="answer"><span class="answer-label">ANSWER</span><br/>{html}</div>'
        ah = self.measure(wrapped)
        unit = BTN_H + GAP + ah
        if unit > BOTTOM - MT:  # oversized: fresh page + shrink answer
            self.new_page()
            self.add_button(idx)
            self.y += BTN_H + GAP
            r = pymupdf.Rect(ML, self.y, ML + COLW, BOTTOM)
            oc = self.doc.add_ocg(f"ans-{idx}", on=(1 if os.environ.get("FORCE_ON") else 0))
            self.page.insert_htmlbox(r, wrapped, css=CSS, archive=ARCH, oc=oc, scale_low=0.5)
            self.y = BOTTOM
            return
        self.ensure(unit)
        self.add_button(idx)
        self.y += BTN_H + GAP
        oc = self.doc.add_ocg(f"ans-{idx}", on=(1 if os.environ.get("FORCE_ON") else 0))
        r = pymupdf.Rect(ML, self.y, ML + COLW, self.y + ah + 2)
        self.page.insert_htmlbox(r, wrapped, css=CSS, archive=ARCH, oc=oc, scale_low=1)
        self.y += ah + 6

    def button_visual(self, rect, label, color, fontsize=8.5):
        self.page.draw_rect(rect, color=None, fill=color)
        line_h = fontsize * 1.4
        off = max(0.0, (rect.height - line_h) / 2)
        tr = pymupdf.Rect(rect.x0, rect.y0 + off, rect.x1, rect.y1)
        self.page.insert_textbox(tr, label, fontsize=fontsize, color=(1, 1, 1),
                                 align=1, fontname="hebo")

    def hotspot(self, rect, name, js):
        w = pymupdf.Widget()
        w.rect = rect
        w.field_name = name
        w.field_type = pymupdf.PDF_WIDGET_TYPE_BUTTON
        w.fill_color = None
        w.border_width = 0
        w.script = js
        self.page.add_widget(w)

    def add_button(self, idx):
        rect = pymupdf.Rect(ML, self.y, ML + 150, self.y + BTN_H)
        self.button_visual(rect, "Show / Hide Answer", (0.043, 0.42, 0.77))
        js = ("var o=this.getOCGs();for(var i=0;i<o.length;i++)"
              f"{{if(o[i].name=='ans-{idx}'){{o[i].state=!o[i].state;}}}}")
        self.hotspot(rect, f"btn-{idx}", js)

    def add_global_buttons(self):
        specs = [
            ("Reveal All", (0.15, 0.55, 0.30),
             "var o=this.getOCGs();for(var i=0;i<o.length;i++){o[i].state=true;}"),
            ("Hide All", (0.60, 0.20, 0.20),
             "var o=this.getOCGs();for(var i=0;i<o.length;i++){o[i].state=false;}"),
        ]
        x = ML
        for name, col, js in specs:
            rect = pymupdf.Rect(x, self.y, x + 110, self.y + 20)
            self.button_visual(rect, name, col, fontsize=9.5)
            self.hotspot(rect, name.replace(" ", ""), js)
            x += 120
        self.y += 26

    def finish(self, out):
        self.footer()
        self.scratch.close()
        self.doc.save(out, garbage=4, deflate=True)
        n = self.doc.page_count
        self.doc.close()
        return n


def main():
    text = open(SRC, encoding="utf-8").read()
    b = Builder(TITLE)

    intro = (
        '<div style="background-color:#fff6e0;padding:6px 9px;">'
        '<b>How to use this interactive PDF:</b> Click <b>Show / Hide Answer</b> under any '
        'question to reveal or hide its answer. This requires <b>Adobe Acrobat Reader</b> '
        '(free). In other viewers the buttons may not work \u2014 use your viewer\'s '
        '<b>Layers</b> panel, or the <b>Reveal All</b> button below.</div>'
    )
    b.place_content(md2html(intro))
    b.add_global_buttons()

    idx = 0
    for kind, seg in split_segments(text):
        if kind == "content":
            for blk in split_blocks(seg):
                if blk == "---":
                    b.y += 4
                    continue
                b.place_content(md2html(blk))
        else:
            idx += 1
            if SLICE and idx > SLICE:
                break
            b.place_answer(md2html(seg), idx)

    n = b.finish(OUT)
    print(f"Saved {OUT} ({n} pages, {idx} interactive answers)")


if __name__ == "__main__":
    main()
