"""Render the study guide's diagrams as PNGs into ccna/images/.

Every diagram is drawn with Pillow at 2x scale (SCALE) for crispness; the PDF
build displays each image at half its pixel width, so a 1040px canvas prints
520pt wide (the full text column). One shared visual language throughout:
device nodes with small drawn icons, role-based colors, labeled links.

Usage: python scripts/build_diagrams.py  [only-these-diagram-names...]
"""
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "images")
FONT_DIR = os.path.join(ROOT, "fonts")

S = 2  # supersampling scale: all 1x coordinates are multiplied by this

INK = "#22303c"
MUT = "#5f7181"
LINE = "#8fa0af"
WHITE = "#ffffff"

# (border, fill) per device role
ROUTER = ("#0b6cc4", "#e3f0fb")
SWITCH = ("#0e8a6d", "#e3f6f0")
HOST = ("#64748b", "#eef1f4")
SERVER = ("#7c5cd6", "#efeafc")
WIFI = ("#d97b00", "#fdf1dd")
BAD = ("#c0392b", "#fdeae7")
WARN = ("#dd9a00", "#fff6e0")
NET = ("#8895a2", "#f4f6f8")

_fonts = {}


def font(size, bold=False):
    key = (size, bold)
    if key not in _fonts:
        name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
        _fonts[key] = ImageFont.truetype(os.path.join(FONT_DIR, name), int(size * S))
    return _fonts[key]


def canvas(w, h):
    img = Image.new("RGB", (int(w * S), int(h * S)), WHITE)
    return img, ImageDraw.Draw(img)


def text(d, xy, s, size=10, bold=False, fill=INK, anchor="mm", align="center"):
    d.multiline_text((xy[0] * S, xy[1] * S), s, font=font(size, bold), fill=fill,
                     anchor=anchor, align=align, spacing=3 * S)


def text_w(s, size=10, bold=False):
    return font(size, bold).getlength(s) / S


def label_bg(d, xy, s, size=8.5, fill=MUT, bold=False, pad=3):
    """Text with a white backing pill so it stays readable on top of lines."""
    w = text_w(s, size, bold)
    h = size * 1.5
    d.rounded_rectangle(
        [(xy[0] - w / 2 - pad) * S, (xy[1] - h / 2 - 1) * S,
         (xy[0] + w / 2 + pad) * S, (xy[1] + h / 2 + 1) * S],
        radius=3 * S, fill=WHITE)
    text(d, xy, s, size, bold, fill)


def line(d, p1, p2, color=LINE, width=2, dash=None):
    if dash is None:
        d.line([p1[0] * S, p1[1] * S, p2[0] * S, p2[1] * S], fill=color, width=width * S)
        return
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    dist = math.hypot(dx, dy)
    if dist == 0:
        return
    ux, uy = dx / dist, dy / dist
    on, off = dash
    t = 0.0
    while t < dist:
        t2 = min(t + on, dist)
        d.line([(p1[0] + ux * t) * S, (p1[1] + uy * t) * S,
                (p1[0] + ux * t2) * S, (p1[1] + uy * t2) * S],
               fill=color, width=width * S)
        t = t2 + off


def arrow_head(d, tip, angle, color, size=7):
    a1, a2 = angle + math.radians(152), angle - math.radians(152)
    pts = [(tip[0] * S, tip[1] * S),
           ((tip[0] + size * math.cos(a1)) * S, (tip[1] + size * math.sin(a1)) * S),
           ((tip[0] + size * math.cos(a2)) * S, (tip[1] + size * math.sin(a2)) * S)]
    d.polygon(pts, fill=color)


def arrow(d, p1, p2, color=MUT, width=2, label=None, label_size=8.5, both=False,
          dash=None, shorten=0, label_dy=-9):
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    dist = math.hypot(dx, dy) or 1
    ux, uy = dx / dist, dy / dist
    q1 = (p1[0] + ux * shorten, p1[1] + uy * shorten)
    q2 = (p2[0] - ux * shorten, p2[1] - uy * shorten)
    line(d, q1, q2, color, width, dash)
    ang = math.atan2(q2[1] - q1[1], q2[0] - q1[0])
    arrow_head(d, q2, ang, color)
    if both:
        arrow_head(d, q1, ang + math.pi, color)
    if label:
        label_bg(d, ((q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2 + label_dy),
                 label, label_size, color, bold=True)


def _icon(d, cx, cy, kind, color):
    """Tiny device glyph, drawn with primitives inside a ~22x16 area."""
    if kind == "router":
        r = 10
        d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
                  outline=color, width=2 * S)
        for ang in (0, 90, 180, 270):
            a = math.radians(ang + 45)
            x1, y1 = cx + 2 * math.cos(a), cy + 2 * math.sin(a)
            x2, y2 = cx + 6.5 * math.cos(a), cy + 6.5 * math.sin(a)
            d.line([x1 * S, y1 * S, x2 * S, y2 * S], fill=color, width=2 * S)
            arrow_head(d, (x2, y2), a, color, size=3.5)
    elif kind == "switch":
        d.rounded_rectangle([(cx - 13) * S, (cy - 7) * S, (cx + 13) * S, (cy + 7) * S],
                            radius=2 * S, outline=color, width=2 * S)
        for i, y in enumerate((cy - 3, cy + 3)):
            sgn = 1 if i == 0 else -1
            d.line([(cx - 8) * S, y * S, (cx + 8) * S, y * S], fill=color, width=2 * S)
            arrow_head(d, (cx + sgn * 8, y), math.pi if sgn < 0 else 0, color, size=3.5)
    elif kind == "pc":
        d.rectangle([(cx - 9) * S, (cy - 8) * S, (cx + 9) * S, (cy + 4) * S],
                    outline=color, width=2 * S)
        d.line([(cx - 5) * S, (cy + 7) * S, (cx + 5) * S, (cy + 7) * S],
               fill=color, width=2 * S)
        d.line([cx * S, (cy + 4) * S, cx * S, (cy + 7) * S], fill=color, width=2 * S)
    elif kind == "server":
        d.rounded_rectangle([(cx - 8) * S, (cy - 10) * S, (cx + 8) * S, (cy + 10) * S],
                            radius=2 * S, outline=color, width=2 * S)
        for y in (cy - 5, cy, cy + 5):
            d.line([(cx - 4) * S, y * S, (cx + 4) * S, y * S], fill=color, width=2 * S)
    elif kind == "ap":
        d.ellipse([(cx - 2.5) * S, (cy + 2) * S, (cx + 2.5) * S, (cy + 7) * S], fill=color)
        for r in (6, 10):
            d.arc([(cx - r) * S, (cy + 4.5 - r) * S, (cx + r) * S, (cy + 4.5 + r) * S],
                  start=215, end=325, fill=color, width=2 * S)
    elif kind == "phone":
        d.rounded_rectangle([(cx - 5) * S, (cy - 9) * S, (cx + 5) * S, (cy + 9) * S],
                            radius=2 * S, outline=color, width=2 * S)
        d.line([(cx - 2) * S, (cy + 5.5) * S, (cx + 2) * S, (cy + 5.5) * S],
               fill=color, width=2 * S)
    elif kind == "wlc":
        d.rounded_rectangle([(cx - 13) * S, (cy - 8) * S, (cx + 13) * S, (cy + 8) * S],
                            radius=2 * S, outline=color, width=2 * S)
        d.ellipse([(cx - 2) * S, (cy - 4.5) * S, (cx + 2) * S, (cy - 0.5) * S], fill=color)
        for r in (4.5, 7.5):
            d.arc([(cx - r) * S, (cy - 2.5 - r) * S, (cx + r) * S, (cy - 2.5 + r) * S],
                  start=35, end=145, fill=color, width=2 * S)


def node(d, cx, cy, kind, name, sub=None, palette=None, w=None, h=None, icon=True):
    pal = palette or {"router": ROUTER, "switch": SWITCH, "pc": HOST, "server": SERVER,
                      "ap": WIFI, "wlc": WIFI, "phone": HOST, "box": NET}.get(kind, NET)
    border, fill = pal
    lines = [name] + ([sub] if sub else [])
    tw = max(max(text_w(name, 9.5, True), text_w(sub or "", 8)) + 18, 58)
    w = w or tw
    h = h or (58 if icon else (36 if sub else 26))
    x1, y1, x2, y2 = cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2
    d.rounded_rectangle([(x1 + 1.5) * S, (y1 + 2) * S, (x2 + 1.5) * S, (y2 + 2) * S],
                        radius=7 * S, fill="#dde4ea")
    d.rounded_rectangle([x1 * S, y1 * S, x2 * S, y2 * S], radius=7 * S,
                        fill=fill, outline=border, width=2 * S)
    if icon:
        _icon(d, cx, y1 + 16, kind, border)
        ty = y1 + 34
    else:
        ty = cy - (5 if sub else 0)
    text(d, (cx, ty + (5 if sub and icon else 0) - (0 if icon else 0)),
         name, 9.5, True, INK)
    if sub:
        text(d, (cx, ty + 16 if icon else cy + 8), sub, 8, False, MUT)
    return (x1, y1, x2, y2)


def cloud(d, cx, cy, label, sub=None, rx=52, ry=26):
    for ox, oy, r in [(-rx * .45, 2, ry * .75), (rx * .45, 2, ry * .75),
                      (-rx * .15, -ry * .35, ry * .8), (rx * .2, -ry * .3, ry * .75),
                      (0, ry * .2, ry * .8)]:
        d.ellipse([(cx + ox - r * 1.3) * S, (cy + oy - r) * S,
                   (cx + ox + r * 1.3) * S, (cy + oy + r) * S],
                  fill=NET[1], outline=NET[0], width=2 * S)
    d.ellipse([(cx - rx * .9) * S, (cy - ry * .45) * S, (cx + rx * .9) * S,
               (cy + ry * .75) * S], fill=NET[1])
    text(d, (cx, cy + (0 if not sub else -5)), label, 9.5, True, INK)
    if sub:
        text(d, (cx, cy + 9), sub, 8, False, MUT)


def edge(d, box1, box2, **kw):
    """Link between two node bounding boxes, clipped to their borders."""
    c1 = ((box1[0] + box1[2]) / 2, (box1[1] + box1[3]) / 2)
    c2 = ((box2[0] + box2[2]) / 2, (box2[1] + box2[3]) / 2)

    def clip(box, frm, to):
        cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
        dx, dy = to[0] - frm[0], to[1] - frm[1]
        tx = abs((box[2] - box[0]) / 2 / dx) if dx else 9e9
        ty = abs((box[3] - box[1]) / 2 / dy) if dy else 9e9
        t = min(tx, ty)
        return (cx + dx * t, cy + dy * t)

    p1, p2 = clip(box1, c1, c2), clip(box2, c2, c1)
    label = kw.pop("label", None)
    size = kw.pop("label_size", 8.5)
    lcol = kw.pop("label_color", MUT)
    ldy = kw.pop("label_dy", 0)
    ldx = kw.pop("label_dx", 0)
    line(d, p1, p2, **kw)
    if label:
        label_bg(d, ((p1[0] + p2[0]) / 2 + ldx, (p1[1] + p2[1]) / 2 + ldy),
                 label, size, lcol, bold=True)
    return p1, p2


def blocked(d, p, size=7):
    for sgn in (1, -1):
        d.line([(p[0] - size) * S, (p[1] - sgn * size) * S,
                (p[0] + size) * S, (p[1] + sgn * size) * S],
               fill=BAD[0], width=3 * S)


def group(d, x1, y1, x2, y2, label=None, color=MUT, label_size=8.5, fill=None):
    if fill:
        d.rounded_rectangle([x1 * S, y1 * S, x2 * S, y2 * S], radius=9 * S, fill=fill)
    step = 7
    for (a, b, c, e) in [((x1, y1), (x2, y1), 1, 0), ((x1, y2), (x2, y2), 1, 0),
                         ((x1, y1), (x1, y2), 0, 1), ((x2, y1), (x2, y2), 0, 1)]:
        line(d, a, b, color, 2, dash=(5, 4))
    if label:
        label_bg(d, ((x1 + x2) / 2, y1), label, label_size, color, bold=True)


def field_bar(d, x, y, w, h, fields, size=8.5):
    """fields: list of (label, weight, (border, fill), sublabel)."""
    total = sum(f[1] for f in fields)
    cx = x
    for name, wt, pal, sub in fields:
        fw = w * wt / total
        d.rectangle([cx * S, y * S, (cx + fw) * S, (y + h) * S],
                    fill=pal[1], outline=pal[0], width=2 * S)
        text(d, (cx + fw / 2, y + h / 2 - (5 if sub else 0)), name, size, True, INK)
        if sub:
            text(d, (cx + fw / 2, y + h / 2 + 8), sub, size - 1.2, False, MUT)
        cx += fw
    return x + w


def lifeline(d, x, y1, y2, kind, name, sub=None):
    b = node(d, x, y1, kind, name, sub, icon=True)
    line(d, (x, b[3]), (x, y2), LINE, 2, dash=(4, 4))
    return b


def seq_arrow(d, x1, x2, y, label, sub=None, color=MUT, size=8.5):
    arrow(d, (x1, y), (x2, y), color=color, label=None)
    mid = (x1 + x2) / 2
    label_bg(d, (mid, y - 9), label, size, color, bold=True)
    if sub:
        label_bg(d, (mid, y + 9), sub, size - 1, MUT)


def title(d, w, s):
    text(d, (w / 2, 14), s, 10.5, True, "#0b3d66")


DIAGRAMS = {}


def diagram(name, w, h):
    def deco(fn):
        DIAGRAMS[name] = (fn, w, h)
        return fn
    return deco


# ---------------------------------------------------------------- chapter 1
@diagram("office_lan", 520, 300)
def office_lan(d, W, H):
    title(d, W, "A small office network — every device in its role")
    cl = cloud(d, 450, 70, "Internet")
    r = node(d, 330, 90, "router", "Router", "connects networks")
    sw = node(d, 200, 170, "switch", "Switch", "connects devices")
    pcs = [node(d, 60, 255, "pc", "PC-A"), node(d, 150, 260, "pc", "PC-B"),
           node(d, 240, 260, "phone", "IP Phone")]
    srv = node(d, 60, 120, "server", "Server", "files & apps")
    ap = node(d, 340, 235, "ap", "Access Point", "Wi-Fi clients")
    arrow(d, (388, 78), (415, 72), MUT, both=True, shorten=2)
    edge(d, r, sw)
    for p in pcs:
        edge(d, sw, p)
    edge(d, sw, srv)
    edge(d, sw, ap, label="PoE", label_dy=-8)


@diagram("campus_tiers", 560, 300)
def campus_tiers(d, W, H):
    title(d, W, "Three-tier campus  vs  collapsed core (two-tier)")
    # left: three tier
    text(d, (145, 36), "Three-tier (large campus)", 9, True, MUT)
    c1 = node(d, 100, 75, "switch", "Core", None, palette=ROUTER, w=70)
    c2 = node(d, 195, 75, "switch", "Core", None, palette=ROUTER, w=70)
    d1 = node(d, 100, 155, "switch", "Dist", None, w=70)
    d2 = node(d, 195, 155, "switch", "Dist", None, w=70)
    a = [node(d, 55 + i * 92, 240, "switch", f"Access", None, palette=HOST, w=66)
         for i in range(3)]
    for c in (c1, c2):
        for dd in (d1, d2):
            edge(d, c, dd)
    edge(d, c1, c2)
    for dd in (d1, d2):
        for ac in a:
            edge(d, dd, ac)
    # right: collapsed
    text(d, (440, 36), "Collapsed core (smaller site)", 9, True, MUT)
    m1 = node(d, 390, 115, "switch", "Core+Dist", None, palette=ROUTER, w=84)
    m2 = node(d, 500, 115, "switch", "Core+Dist", None, palette=ROUTER, w=84)
    b = [node(d, 348 + i * 86, 240, "switch", "Access", None, palette=HOST, w=64)
         for i in range(3)]
    edge(d, m1, m2)
    for m in (m1, m2):
        for ac in b:
            edge(d, m, ac)
    line(d, (285, 45), (285, 285), LINE, 2, dash=(3, 5))


@diagram("spine_leaf", 520, 240)
def spine_leaf(d, W, H):
    title(d, W, "Spine-leaf — every leaf connects to every spine, never to each other")
    spines = [node(d, 170 + i * 180, 75, "switch", f"Spine {i+1}", None,
                   palette=ROUTER, w=84) for i in range(2)]
    leaves = [node(d, 80 + i * 120, 185, "switch", f"Leaf {i+1}", "servers below",
                   w=84) for i in range(4)]
    for sp in spines:
        for lf in leaves:
            edge(d, sp, lf)
    label_bg(d, (260, 228), "any server → any server: always leaf–spine–leaf, two hops", 8.5, MUT)


# ---------------------------------------------------------------- chapter 2
@diagram("osi_tcpip", 470, 330)
def osi_tcpip(d, W, H):
    title(d, W, "The OSI model vs the TCP/IP model")
    osi = ["7  Application", "6  Presentation", "5  Session", "4  Transport",
           "3  Network", "2  Data Link", "1  Physical"]
    pals = [SERVER, SERVER, SERVER, ROUTER, SWITCH, WARN, HOST]
    y0, rh = 44, 36
    for i, (name, pal) in enumerate(zip(osi, pals)):
        y = y0 + i * rh
        d.rounded_rectangle([60 * S, y * S, 210 * S, (y + rh - 5) * S], radius=5 * S,
                            fill=pal[1], outline=pal[0], width=2 * S)
        text(d, (135, y + (rh - 5) / 2), name, 9.5, True, INK)
    tcp = [("Application", 0, 3, SERVER), ("Transport", 3, 4, ROUTER),
           ("Internet", 4, 5, SWITCH), ("Network Access", 5, 7, WARN)]
    for name, a, b, pal in tcp:
        y1, y2 = y0 + a * rh, y0 + b * rh - 5
        d.rounded_rectangle([250 * S, y1 * S, 385 * S, y2 * S], radius=5 * S,
                            fill=pal[1], outline=pal[0], width=2 * S)
        text(d, (317, (y1 + y2) / 2), name, 9.5, True, INK)
    pdus = [("data", 1), ("segment", 3), ("packet", 4), ("frame / bits", 5.5)]
    for pdu, row in pdus:
        text(d, (430, y0 + row * rh + 14), pdu, 8.5, True, MUT)
    text(d, (430, y0 - 8), "PDU", 8, True, MUT)
    for i in range(7):
        line(d, (215, y0 + i * rh + 15), (245, y0 + i * rh + 15), "#c9d3dc", 1)


@diagram("encapsulation", 540, 250)
def encapsulation(d, W, H):
    title(d, W, "Encapsulation — each layer wraps the one above it")
    rows = [
        ("Application", [("Data", 5, SERVER, None)]),
        ("Transport", [("TCP header", 1.6, ROUTER, None), ("Data", 5, SERVER, None)]),
        ("Internet", [("IP header", 1.6, SWITCH, None), ("TCP header", 1.6, ROUTER, None),
                      ("Data", 5, SERVER, None)]),
        ("Network Access", [("Eth header", 1.6, WARN, None), ("IP header", 1.6, SWITCH, None),
                            ("TCP header", 1.6, ROUTER, None), ("Data", 5, SERVER, None),
                            ("FCS", 1, WARN, None)]),
    ]
    y = 46
    for name, fields in rows:
        text(d, (118, y + 14), name, 8.5, True, MUT, anchor="rm")
        total_w = 405 * sum(f[1] for f in fields) / 10.8
        x = 530 - total_w
        field_bar(d, x, y, total_w, 28, fields, size=8)
        y += 46
    text(d, (100, y + 4), "segment → packet → frame:\nsame data, more wrapping", 8.5, True, MUT)
    arrow(d, (295, y - 8), (295, y + 14), MUT)
    text(d, (330, y + 8), "to the wire", 8.5, False, MUT, anchor="lm")


@diagram("tcp_handshake", 430, 290)
def tcp_handshake(d, W, H):
    title(d, W, "The TCP three-way handshake")
    c = lifeline(d, 90, 70, 265, "pc", "Client")
    s = lifeline(d, 340, 70, 265, "server", "Server")
    seq_arrow(d, 90, 340, 135, "SYN", "\"want to talk?  my seq = x\"", ROUTER[0])
    seq_arrow(d, 340, 90, 180, "SYN-ACK", "\"yes! my seq = y, ack = x+1\"", SWITCH[0])
    seq_arrow(d, 90, 340, 225, "ACK", "\"got it — ack = y+1\"", ROUTER[0])
    label_bg(d, (215, 258), "connection established — data can flow", 8.5, INK, bold=True)


# ---------------------------------------------------------------- chapter 5/6
@diagram("eth_frame", 540, 170)
def eth_frame(d, W, H):
    title(d, W, "The Ethernet frame")
    fields = [("Preamble", 1.5, NET, "8 B"), ("Dest MAC", 1.4, ROUTER, "6 B"),
              ("Src MAC", 1.4, ROUTER, "6 B"), ("Type", 0.9, WARN, "2 B"),
              ("Data (the packet)", 3.4, SERVER, "46–1500 B"), ("FCS", 0.9, SWITCH, "4 B")]
    field_bar(d, 25, 60, 490, 42, fields, size=8.5)
    text(d, (270, 125), "Type says what's inside (IPv4 / IPv6 / ARP) — FCS is the damage check", 8.5, False, MUT)
    text(d, (270, 142), "MACs answer: who is it for, who sent it", 8.5, False, MUT)


@diagram("mac_learning", 540, 290)
def mac_learning(d, W, H):
    title(d, W, "How a switch learns — source teaches, destination decides")
    sw = node(d, 210, 150, "switch", "SW1", None, w=90)
    hosts = []
    for i, (hx, hy, nm) in enumerate([(60, 60, "A"), (60, 240, "B"),
                                      (360, 60, "C"), (360, 240, "D")]):
        hosts.append(node(d, hx, hy, "pc", f"PC-{nm}", f"MAC {nm*2}{nm*2}", w=78))
    for i, hb in enumerate(hosts):
        edge(d, sw, hb, label=f"Fa0/{i+1}", label_size=7.5)
    tb = (415, 100, 530, 205)
    d.rounded_rectangle([tb[0] * S, tb[1] * S, tb[2] * S, tb[3] * S], radius=6 * S,
                        fill="#f4f6f8", outline=MUT, width=2 * S)
    text(d, (472, 115), "MAC table", 9, True, INK)
    for i, row in enumerate(["AA → Fa0/1", "BB → Fa0/2", "CC → Fa0/3", "DD → ???"]):
        text(d, (472, 138 + i * 17), row, 8.5, False, MUT)
    label_bg(d, (472, 222), "unknown → flood all ports", 8, BAD[0], bold=True)


@diagram("domains", 560, 280)
def domains(d, W, H):
    title(d, W, "Collision domains (per port)  vs  broadcast domains (per VLAN / router side)")
    sw1 = node(d, 140, 110, "switch", "SW1", None, w=80)
    r = node(d, 285, 110, "router", "R1", None, w=70)
    sw2 = node(d, 430, 110, "switch", "SW2", None, w=80)
    pcs1 = [node(d, 65 + i * 85, 225, "pc", f"PC{i+1}", w=58) for i in range(2)]
    pcs2 = [node(d, 385 + i * 85, 225, "pc", f"PC{i+3}", w=58) for i in range(2)]
    e1 = [edge(d, sw1, p) for p in pcs1]
    e2 = [edge(d, sw2, p) for p in pcs2]
    edge(d, sw1, r)
    edge(d, r, sw2)
    for (p1, p2) in e1 + e2:
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        d.ellipse([(mx - 14) * S, (my - 22) * S, (mx + 14) * S, (my + 22) * S],
                  outline=BAD[0], width=2 * S)
    group(d, 25, 60, 250, 265, "broadcast domain 1", ROUTER[0], fill=None)
    group(d, 320, 60, 545, 265, "broadcast domain 2", ROUTER[0], fill=None)
    label_bg(d, (285, 265), "red ovals: one collision domain per switch port", 8, BAD[0])
    label_bg(d, (285, 155), "the router is the wall\nbroadcasts cannot cross", 8, ROUTER[0])


# ---------------------------------------------------------------- chapter 7/8
@diagram("vlans", 520, 280)
def vlans(d, W, H):
    title(d, W, "One physical switch, three virtual networks")
    sw = node(d, 260, 90, "switch", "SW1", "one box, three LANs", w=150)
    groups = [("VLAN 10 — Staff", ROUTER, 95), ("VLAN 20 — Students", SWITCH, 260),
              ("VLAN 30 — Admin", SERVER, 425)]
    for gname, pal, gx in groups:
        pcs = [node(d, gx - 38 + i * 76, 215, "pc", f"PC", w=52) for i in range(2)]
        for p in pcs:
            edge(d, sw, p, color=pal[0])
        group(d, gx - 85, 175, gx + 85, 250, gname, pal[0], label_size=8.5)
    label_bg(d, (260, 268), "same VLAN: switch delivers directly · different VLAN: only via a router", 8.5, MUT)


@diagram("dot1q", 540, 210)
def dot1q(d, W, H):
    title(d, W, "802.1Q — a 4-byte tag inserted into the frame on trunk links")
    text(d, (60, 70), "Access\nport", 8.5, True, MUT)
    field_bar(d, 100, 55, 415, 30, [("Dest", 1, ROUTER, None), ("Src", 1, ROUTER, None),
                                    ("Type", .7, WARN, None), ("Data", 2.4, SERVER, None),
                                    ("FCS", .7, SWITCH, None)], size=8)
    text(d, (60, 135), "Trunk\nport", 8.5, True, MUT)
    field_bar(d, 100, 120, 415, 30, [("Dest", 1, ROUTER, None), ("Src", 1, ROUTER, None),
                                     ("802.1Q tag", 1.1, BAD, None), ("Type", .7, WARN, None),
                                     ("Data", 2.4, SERVER, None), ("FCS", .7, SWITCH, None)],
              size=8)
    arrow(d, (238, 90), (238, 118), BAD[0])
    field_bar(d, 175, 165, 230, 26, [("PRI (QoS)", 1, WARN, None),
                                     ("VLAN ID  1–4094", 2, BAD, None)], size=8)
    line(d, (207, 150), (185, 165), MUT, 1)
    line(d, (268, 150), (395, 165), MUT, 1)
    text(d, (455, 178), "12 bits — which VLAN\nthis frame belongs to", 8, False, MUT)


@diagram("roas", 500, 320)
def roas(d, W, H):
    title(d, W, "Router-on-a-stick — one trunk, one subinterface per VLAN")
    r = node(d, 250, 80, "router", "R1", "Gi0/0.10 = .10.1 · Gi0/0.20 = .20.1", w=230)
    sw = node(d, 250, 180, "switch", "SW1", None, w=100)
    edge(d, r, sw, label="one trunk — tags 10 & 20", label_dx=95, width=3)
    p1 = node(d, 110, 260, "pc", "PC-A", "VLAN 10", w=76)
    p2 = node(d, 390, 260, "pc", "PC-B", "VLAN 20", w=76)
    edge(d, sw, p1, color=ROUTER[0], label="access 10", label_size=7.5, label_dy=-14, label_dx=-30)
    edge(d, sw, p2, color=SWITCH[0], label="access 20", label_size=7.5, label_dy=-14, label_dx=30)
    label_bg(d, (250, 307), "A → B: up the trunk tagged 10, routed, back down tagged 20", 8.5, MUT)


# ---------------------------------------------------------------- chapter 9/10
@diagram("stp", 480, 290)
def stp(d, W, H):
    title(d, W, "STP breaks the loop — one port blocks, the rest forward")
    root = node(d, 240, 80, "switch", "SW1 (Root)", "best bridge ID", palette=ROUTER, w=110)
    s2 = node(d, 110, 220, "switch", "SW2", None, w=80)
    s3 = node(d, 370, 220, "switch", "SW3", None, w=80)
    edge(d, root, s2, label="DP ↓  RP ↑", label_size=7.5, label_dx=-42)
    edge(d, root, s3, label="DP ↓  RP ↑", label_size=7.5, label_dx=42)
    p1, p2 = edge(d, s2, s3, label="DP", label_size=7.5, label_dy=-12, label_dx=-70)
    bx = (p1[0] * 0.25 + p2[0] * 0.75, p1[1] * 0.25 + p2[1] * 0.75)
    blocked(d, bx)
    label_bg(d, (bx[0], bx[1] + 18), "blocked (alternate) — the loop is cut here", 8, BAD[0], bold=True)
    label_bg(d, (240, 282), "all of the root's ports are designated; every other switch keeps one root port", 8, MUT)


@diagram("etherchannel", 470, 230)
def etherchannel(d, W, H):
    title(d, W, "EtherChannel — four cables, one logical link (no STP blocking inside)")
    s1 = node(d, 100, 130, "switch", "SW1", None, w=90)
    s2 = node(d, 370, 130, "switch", "SW2", None, w=90)
    for i, dy in enumerate((-21, -7, 7, 21)):
        line(d, (145, 130 + dy), (325, 130 + dy), SWITCH[0], 2)
    d.ellipse([160 * S, 96 * S, 310 * S, 164 * S], outline=ROUTER[0], width=2 * S)
    label_bg(d, (235, 96), "Port-Channel 1 — one link to STP", 8.5, ROUTER[0], bold=True)
    label_bg(d, (235, 195), "each flow hashes onto ONE member link — one download won't go faster", 8, MUT)


# ---------------------------------------------------------------- chapter 11-13
@diagram("ip_split", 540, 190)
def ip_split(d, W, H):
    title(d, W, "One address, two parts — the mask draws the line")
    text(d, (270, 46), "192.168.1.130 / 26", 12, True, INK)
    fields = [("192", 1, ROUTER, "11000000"), ("168", 1, ROUTER, "10101000"),
              ("1", 1, ROUTER, "00000001"), ("10", .25, ROUTER, "10"),
              ("000010", .75, HOST, "000010")]
    x = 60
    for name, wt, pal, bits in [("network part — first 26 bits", 26, ROUTER, None),
                                ("host part", 6, HOST, None)]:
        fw = 420 * wt / 32
        d.rectangle([x * S, 70 * S, (x + fw) * S, 102 * S], fill=pal[1],
                    outline=pal[0], width=2 * S)
        text(d, (x + fw / 2, 86), name, 8.5, True, INK)
        x += fw
    text(d, (60, 118), "mask", 8.5, True, MUT, anchor="rm")
    x = 60
    for name, wt, pal in [("11111111.11111111.11111111.11", 26, ROUTER), ("000000", 6, HOST)]:
        fw = 420 * wt / 32
        d.rectangle([x * S, 110 * S, (x + fw) * S, 130 * S], fill=pal[1],
                    outline=pal[0], width=1 * S)
        text(d, (x + fw / 2, 120), name, 7.5, False, MUT)
        x += fw
    text(d, (270, 152), "255.255.255.192 — same street (network) · which house (host)", 8.5, False, MUT)
    label_bg(d, (445, 60), "6 host bits → 2⁶−2 = 62 hosts", 8, HOST[0])


@diagram("subnet_blocks", 540, 210)
def subnet_blocks(d, W, H):
    title(d, W, "Slicing 192.168.1.0/24 into four /26 blocks (block size 64)")
    pals = [ROUTER, SWITCH, SERVER, WARN]
    x, w = 40, 460
    for i in range(4):
        bx = x + i * w / 4
        d.rectangle([bx * S, 55 * S, (bx + w / 4) * S, 115 * S], fill=pals[i][1],
                    outline=pals[i][0], width=2 * S)
        text(d, (bx + w / 8, 75), f".{i*64} – .{i*64+63}", 9, True, INK)
        text(d, (bx + w / 8, 95), f"net .{i*64}\nbcast .{i*64+63}", 7.5, False, MUT)
    for i in range(5):
        text(d, (x + i * w / 4, 128), f".{(i*64) % 256 if i < 4 else 255}", 8, True, MUT)
    text(d, (270, 155), "usable hosts per block: .1–.62, .65–.126, .129–.190, .193–.254", 8.5, False, MUT)
    label_bg(d, (270, 180), "first address = the network's name · last = its broadcast · the rest are yours", 8, MUT)


@diagram("ipv6_addr", 540, 190)
def ipv6_addr(d, W, H):
    title(d, W, "Anatomy of a global unicast IPv6 address (128 bits)")
    text(d, (270, 46), "2001:0db8:00a1:0002 : 0000:0000:0000:0055", 11.5, True, INK)
    fields = [("Global routing prefix", 48, ROUTER, "/48 — from your ISP"),
              ("Subnet", 16, WARN, "16 bits"),
              ("Interface ID", 64, SERVER, "64 bits — the host")]
    x = 45
    for name, wt, pal, sub in fields:
        fw = 450 * wt / 128
        d.rectangle([x * S, 65 * S, (x + fw) * S, 112 * S], fill=pal[1],
                    outline=pal[0], width=2 * S)
        text(d, (x + fw / 2, 81), name, 8.5, True, INK)
        text(d, (x + fw / 2, 98), sub, 7.5, False, MUT)
        x += fw
    label_bg(d, (270, 135), "65,536 subnets for you, and every subnet is a /64", 8.5, MUT)
    text(d, (270, 162), "shortened: 2001:db8:a1:2::55  (drop leading zeros, :: once for the zero run)", 8.5, False, INK)


# ---------------------------------------------------------------- chapter 14+
@diagram("hsrp", 500, 300)
def hsrp(d, W, H):
    title(d, W, "HSRP — two real routers, one virtual gateway the PCs believe in")
    r1 = node(d, 120, 90, "router", "R1 — Active", "forwards traffic", w=110)
    r2 = node(d, 380, 90, "router", "R2 — Standby", "waits, ready", w=110)
    d.rounded_rectangle([185 * S, 145 * S, 315 * S, 200 * S], radius=7 * S,
                        outline=ROUTER[0], width=2 * S)
    text(d, (250, 162), "Virtual router", 9, True, ROUTER[0])
    text(d, (250, 182), "VIP 10.1.1.1\nvMAC 0000.0c07.ac05", 7.5, False, MUT)
    line(d, (176, 90), (325, 90), LINE, 2, dash=(4, 4))
    label_bg(d, (250, 90), "hello every 3 s", 7.5, MUT)
    line(d, (155, 118), (215, 148), ROUTER[0], 2)
    line(d, (345, 118), (285, 148), LINE, 2, dash=(3, 4))
    pcs = [node(d, 130 + i * 120, 265, "pc", f"PC{i+1}", "gw 10.1.1.1", w=80)
           for i in range(3)]
    for p in pcs:
        line(d, ((p[0] + p[2]) / 2, p[1]), (250, 202), LINE, 2)
    label_bg(d, (250, 224), "PCs only ever know the virtual IP + MAC — failover moves BOTH to R2", 8, MUT)


@diagram("packet_walk", 560, 250)
def packet_walk(d, W, H):
    title(d, W, "A packet's trip — Layer 3 stays, Layer 2 is rebuilt at every hop")
    xs = [55, 175, 300, 425, 520]
    pa = node(d, xs[0], 105, "pc", "PC-A", ".1.10", w=64)
    r1 = node(d, xs[1], 105, "router", "R1", "gateway", w=64)
    r2 = node(d, xs[2], 105, "router", "R2", None, w=64)
    sv = node(d, xs[3], 105, "server", "Server", "10.0.0.50", w=72)
    edge(d, pa, r1, label="frame 1", label_size=7.5, label_dy=-10)
    edge(d, r1, r2, label="frame 2", label_size=7.5, label_dy=-10)
    edge(d, r2, sv, label="frame 3", label_size=7.5, label_dy=-10)
    d.rounded_rectangle([35 * S, 160 * S, 545 * S, 235 * S], radius=7 * S,
                        fill="#f4f6f8", outline=LINE, width=1 * S)
    text(d, (95, 175), "the constants:", 8.5, True, INK, anchor="lm")
    text(d, (210, 175), "src IP .1.10 → dst IP 10.0.0.50 — unchanged end to end", 8.5, False, MUT, anchor="lm")
    text(d, (95, 197), "rebuilt per hop:", 8.5, True, INK, anchor="lm")
    text(d, (210, 197), "src/dst MACs — each frame lives on one link only (ARP finds each next MAC)", 8.5, False, MUT, anchor="lm")
    text(d, (95, 219), "the countdown:", 8.5, True, INK, anchor="lm")
    text(d, (210, 219), "TTL 64 → 63 → 62 — each router subtracts one", 8.5, False, MUT, anchor="lm")


@diagram("ospf_areas", 500, 270)
def ospf_areas(d, W, H):
    title(d, W, "OSPF areas — every area touches the backbone")
    d.ellipse([170 * S, 60 * S, 330 * S, 160 * S], fill=ROUTER[1], outline=ROUTER[0], width=2 * S)
    text(d, (250, 80), "Area 0 — backbone", 9, True, ROUTER[0])
    b1 = node(d, 215, 122, "router", "R1", None, w=56)
    b2 = node(d, 290, 122, "router", "R2", None, w=56)
    edge(d, b1, b2)
    d.ellipse([30 * S, 150 * S, 200 * S, 245 * S], fill=SWITCH[1], outline=SWITCH[0], width=2 * S)
    text(d, (110, 230), "Area 1", 9, True, SWITCH[0])
    a1 = node(d, 105, 190, "router", "ABR", "in both areas", palette=WARN, w=80)
    d.ellipse([300 * S, 150 * S, 470 * S, 245 * S], fill=SERVER[1], outline=SERVER[0], width=2 * S)
    text(d, (390, 230), "Area 2", 9, True, SERVER[0])
    a2 = node(d, 390, 190, "router", "ABR", "in both areas", palette=WARN, w=80)
    edge(d, b1, a1)
    edge(d, b2, a2)
    label_bg(d, (250, 258), "ABRs summarize between areas — small LSDB per area, SPF stays cheap", 8.5, MUT)


@diagram("dhcp_dora", 430, 300)
def dhcp_dora(d, W, H):
    title(d, W, "DHCP — the DORA handshake")
    c = lifeline(d, 90, 70, 280, "pc", "Client", "no IP yet")
    s = lifeline(d, 340, 70, 280, "server", "DHCP Server")
    seq_arrow(d, 90, 340, 140, "1  DISCOVER", "broadcast — \"any DHCP server?\"", ROUTER[0])
    seq_arrow(d, 340, 90, 178, "2  OFFER", "\"how about 192.168.1.50?\"", SWITCH[0])
    seq_arrow(d, 90, 340, 216, "3  REQUEST", "broadcast — \"I'll take that one\"", ROUTER[0])
    seq_arrow(d, 340, 90, 254, "4  ACK", "\"it's yours — lease confirmed\"", SWITCH[0])
    label_bg(d, (215, 280), "IP + mask + gateway + DNS, leased", 8.5, INK, bold=True)


@diagram("nat", 560, 260)
def nat(d, W, H):
    title(d, W, "PAT — many private hosts, one public address, sorted by port")
    pcs = [node(d, 65, 90 + i * 75, "pc", f"PC{i+1}", f"192.168.1.1{i}", w=80)
           for i in range(2)]
    r = node(d, 260, 125, "router", "NAT router", "outside: 203.0.113.5", w=130)
    cl = cloud(d, 480, 90, "Internet")
    for p in pcs:
        edge(d, r, p)
    arrow(d, (330, 112), (425, 95), MUT, shorten=4)
    d.rounded_rectangle([180 * S, 185 * S, 545 * S, 245 * S], radius=7 * S,
                        fill="#f4f6f8", outline=LINE, width=1 * S)
    text(d, (362, 198), "NAT table — the router's memory of who asked", 8.5, True, INK)
    text(d, (362, 218), "192.168.1.10 : 5555   ↔   203.0.113.5 : 40001", 8.5, False, MUT)
    text(d, (362, 233), "192.168.1.11 : 5555   ↔   203.0.113.5 : 40002", 8.5, False, MUT)
    label_bg(d, (95, 225), "private (inside local)", 8, ROUTER[0])
    label_bg(d, (480, 140), "public (inside global)", 8, SWITCH[0])


@diagram("dot1x", 540, 230)
def dot1x(d, W, H):
    title(d, W, "802.1X — the port stays shut until identity checks out")
    sup = node(d, 90, 110, "pc", "Supplicant", "the laptop", w=100)
    auth = node(d, 270, 110, "switch", "Authenticator", "the switch/AP", w=116)
    srv = node(d, 460, 110, "server", "Auth server", "RADIUS", w=100)
    edge(d, sup, auth, label="EAPOL", label_dy=-10)
    edge(d, auth, srv, label="RADIUS", label_dy=-10)
    label_bg(d, (270, 175), "the switch is only the middleman — the RADIUS server says yes or no", 8.5, MUT)
    label_bg(d, (270, 197), "until then, the port passes NOTHING but the login conversation", 8.5, BAD[0])


# ---------------------------------------------------------------- chapter 19/20/22
@diagram("acl_flow", 500, 320)
def acl_flow(d, W, H):
    title(d, W, "ACL processing — first match wins, then the list stops")
    steps = [("packet arrives", NET), ("rule 1 match?", WARN), ("rule 2 match?", WARN),
             ("rule 3 match?", WARN)]
    y = 55
    boxes = []
    for name, pal in steps:
        b = node(d, 165, y, "box", name, icon=False, w=150, h=30, palette=pal)
        boxes.append(b)
        y += 52
    for i in range(len(boxes) - 1):
        arrow(d, (165, boxes[i][3]), (165, boxes[i + 1][1]), MUT,
              label="no" if i else None, label_size=7.5)
    imp = node(d, 165, y, "box", "implicit deny — dropped", icon=False, w=190, h=30, palette=BAD)
    arrow(d, (165, boxes[-1][3]), (165, imp[1]), MUT, label="no match anywhere", label_size=7.5)
    for i, b in enumerate(boxes[1:]):
        act = node(d, 390, 55 + (i + 1) * 52, "box",
                   ["permit — forwarded", "deny — dropped", "permit — forwarded"][i],
                   icon=False, w=165, h=30,
                   palette=[SWITCH, BAD, SWITCH][i])
        arrow(d, (b[2], (b[1] + b[3]) / 2), (act[0], (act[1] + act[3]) / 2), MUT,
              label="yes", label_size=7.5)
    label_bg(d, (250, 308), "later rules never see a packet an earlier rule already matched — order is everything", 8, MUT)


@diagram("wifi_channels", 540, 210)
def wifi_channels(d, W, H):
    title(d, W, "2.4 GHz — channels overlap; only 1, 6 and 11 stay clear of each other")
    base_y, hgt, x0, step, half = 165, 85, 55, 32, 36
    for ch in range(1, 12):
        cx = x0 + (ch - 1) * step
        pal = {1: ROUTER, 6: SWITCH, 11: SERVER}.get(ch)
        col = pal[0] if pal else "#c9d3dc"
        pts = [((cx - half) * S, base_y * S), (cx * S, (base_y - hgt) * S),
               ((cx + half) * S, base_y * S)]
        if pal:
            d.polygon(pts, fill=pal[1], outline=col, width=3 * S)
        else:
            d.line(pts[0] + pts[1], fill=col, width=1 * S)
            d.line(pts[1] + pts[2], fill=col, width=1 * S)
        ly = base_y + 12 if not pal else base_y - hgt - 10
        label_bg(d, (cx, ly), str(ch), 8.5, col if pal else MUT, bold=bool(pal))
    line(d, (x0 - half - 5, base_y), (x0 + 10 * step + half + 5, base_y), MUT, 2)
    label_bg(d, (270, 192), "each channel is ~4 channel-numbers wide — neighbors bleed into each other", 8.5, MUT)


@diagram("wlc", 560, 320)
def wlc(d, W, H):
    title(d, W, "Lightweight APs + WLC — everything rides the CAPWAP tunnels")
    wlc_b = node(d, 450, 90, "wlc", "WLC", "trunk + LAG", w=110)
    sw = node(d, 260, 90, "switch", "Core SW", None, w=90)
    aps = [node(d, 110 + i * 170, 205, "ap", f"AP{i+1}", "access port", w=90)
           for i in range(2)]
    for i, dy in enumerate((-8, 8)):
        line(d, (305, 90 + dy), (395, 90 + dy), SWITCH[0], 2)
    label_bg(d, (350, 68), "LAG (static)", 7.5, SWITCH[0], bold=True)
    for ap in aps:
        edge(d, sw, ap)
    for ap in aps:
        cx = (ap[0] + ap[2]) / 2
        line(d, (cx + 8, ap[1] + 4), (452, 122), ROUTER[0], 2, dash=(6, 4))
    label_bg(d, (350, 155), "CAPWAP: control 5246 (DTLS) · data 5247", 8, ROUTER[0], bold=True)
    cls = [node(d, 60 + i * 105, 285, "phone", "client", w=62) for i in range(3)]
    for i, cb in enumerate(cls):
        line(d, ((cb[0] + cb[2]) / 2, cb[1]),
             ((aps[min(i, 1)][0] + aps[min(i, 1)][2]) / 2, aps[min(i, 1)][3]),
             WIFI[0], 1, dash=(2, 3))
    label_bg(d, (415, 250), "AP wire carries ONE thing (tunnel) → access port\nWLC unwraps many VLANs → trunk", 8, MUT)


@diagram("sdn", 470, 300)
def sdn(d, W, H):
    title(d, W, "SDN — one brain, many muscles")
    apps = node(d, 235, 65, "box", "Your apps, scripts & dashboards", "\"what you want\"",
                icon=False, w=230, h=38, palette=SERVER)
    ctl = node(d, 235, 150, "box", "Controller (Catalyst Center)",
               "network-wide view, makes decisions", icon=False, w=240, h=40, palette=ROUTER)
    devs = [node(d, 90 + i * 145, 245, ["router", "switch", "switch"][i],
                 ["R1", "SW1", "SW2"][i], None, w=70) for i in range(3)]
    arrow(d, (235, apps[3]), (235, ctl[1]), SERVER[0], both=True,
          label="Northbound API — REST")
    for dv in devs:
        arrow(d, (235, ctl[3]), ((dv[0] + dv[2]) / 2, dv[1]), SWITCH[0], shorten=2)
    label_bg(d, (235, 212), "Southbound — NETCONF / OpenFlow", 8.5, SWITCH[0], bold=True)
    label_bg(d, (235, 288), "north = up toward you (intent) · south = down to devices (commands)", 8, MUT)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    only = set(sys.argv[1:])
    for name, (fn, w, h) in DIAGRAMS.items():
        if only and name not in only:
            continue
        img, d = canvas(w, h)
        fn(d, w, h)
        path = os.path.join(OUT_DIR, name + ".png")
        img.save(path, optimize=True)
        print(f"  {name}.png  ({w}x{h}pt)")
    print(f"Wrote {len(only) or len(DIAGRAMS)} diagrams to {OUT_DIR}")


if __name__ == "__main__":
    main()
