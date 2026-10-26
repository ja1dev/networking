"""Render the CCNP study guide's diagrams as PNGs into ccnp/images/.

Same visual language as the CCNA kit: the drawing primitives (node, edge,
cloud, group, field_bar, lifeline, seq_arrow, ...) are imported from
ccna/scripts/build_diagrams.py rather than copied, so both guides stay
consistent. Every diagram is drawn at 2x scale (S); build_pdf.py displays each
image at half its pixel width, so a 520pt-wide canvas fills the text column.

Usage: python ccnp/scripts/build_diagrams.py  [only-these-diagram-names...]
"""
import math
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "images")
sys.path.insert(0, os.path.join(os.path.dirname(ROOT), "ccna", "scripts"))

from build_diagrams import (  # noqa: E402
    S, INK, MUT, LINE, WHITE, ROUTER, SWITCH, HOST, SERVER, WIFI, BAD, WARN, NET,
    canvas, text, text_w, label_bg, line, arrow_head, arrow, node, cloud, edge,
    blocked, group, field_bar, lifeline, seq_arrow, title,
)

DIAGRAMS = {}


def diagram(name, w, h):
    def deco(fn):
        DIAGRAMS[name] = (fn, w, h)
        return fn
    return deco


# ---------------------------------------------------------------- diagrams
# ---------------------------------------------------------------- chapter 1
@diagram("c01_tiers", 540, 330)
def c01_tiers(d, W, H):
    title(d, W, "Three-tier campus vs collapsed core — where each job lives")
    # layer captions on the far left
    for y, s in ((80, "Core"), (165, "Distribution"), (250, "Access")):
        text(d, (12, y), s, 8.5, True, MUT, anchor="lm")
    text(d, (190, 38), "Three-tier (large campus)", 9, True, MUT)
    c1 = node(d, 150, 80, "switch", "Core-1", None, palette=ROUTER, w=72)
    c2 = node(d, 240, 80, "switch", "Core-2", None, palette=ROUTER, w=72)
    d1 = node(d, 150, 165, "switch", "Dist-1", None, w=72)
    d2 = node(d, 240, 165, "switch", "Dist-2", None, w=72)
    acc = [node(d, 110 + i * 85, 250, "switch", "Access", None, palette=HOST, w=66)
           for i in range(3)]
    edge(d, c1, c2)
    for c in (c1, c2):
        for dd in (d1, d2):
            edge(d, c, dd)
    edge(d, d1, d2)
    for dd in (d1, d2):
        for a in acc:
            edge(d, dd, a)
    label_bg(d, (195, 123), "summarize toward the core", 7.5, ROUTER[0], bold=True)
    label_bg(d, (195, 300), "L2/L3 boundary + FHRP + STP root at distribution", 7.5, SWITCH[0], bold=True)
    line(d, (345, 45), (345, 315), LINE, 2, dash=(3, 5))
    text(d, (445, 38), "Collapsed core (one building)", 9, True, MUT)
    m1 = node(d, 400, 140, "switch", "Core/Dist-1", None, palette=ROUTER, w=86)
    m2 = node(d, 495, 140, "switch", "Core/Dist-2", None, palette=ROUTER, w=86)
    b = [node(d, 385 + i * 62, 250, "switch", "Acc", None, palette=HOST, w=52)
         for i in range(3)]
    edge(d, m1, m2)
    for m in (m1, m2):
        for a in b:
            edge(d, m, a)
    label_bg(d, (447, 300), "two roles, one pair of switches", 7.5, MUT)


@diagram("c01_spine_leaf", 520, 270)
def c01_spine_leaf(d, W, H):
    title(d, W, "Spine-leaf fabric — routed underlay, overlay on top")
    spines = [node(d, 150 + i * 220, 75, "switch", f"Spine {i+1}", None,
                   palette=ROUTER, w=84) for i in range(2)]
    leaves = [node(d, 70 + i * 127, 185, "switch", f"Leaf {i+1}", None, w=78)
              for i in range(4)]
    for sp in spines:
        for lf in leaves:
            edge(d, sp, lf)
    for lf in leaves:
        cx = (lf[0] + lf[2]) / 2
        text(d, (cx, lf[3] + 12), "servers", 7.5, False, MUT)
    l1, l4 = leaves[0], leaves[3]
    y = 245
    line(d, ((l1[0] + l1[2]) / 2, l1[3] + 22), ((l1[0] + l1[2]) / 2, y), SERVER[0], 2, dash=(4, 3))
    line(d, ((l4[0] + l4[2]) / 2, l4[3] + 22), ((l4[0] + l4[2]) / 2, y), SERVER[0], 2, dash=(4, 3))
    line(d, ((l1[0] + l1[2]) / 2, y), ((l4[0] + l4[2]) / 2, y), SERVER[0], 2, dash=(4, 3))
    label_bg(d, (260, y), "VXLAN overlay: L2 stretched across the routed fabric", 8, SERVER[0], bold=True)
    label_bg(d, (260, 128), "every leaf → every spine: equal-cost paths, no STP blocking", 8, ROUTER[0], bold=True)


# ---------------------------------------------------------------- chapter 2
@diagram("c02_svl", 520, 300)
def c02_svl(d, W, H):
    title(d, W, "StackWise Virtual — two chassis, one logical switch")
    group(d, 70, 48, 450, 135, "one logical switch: one control plane, one gateway IP",
          color=ROUTER[0], label_size=8)
    s1 = node(d, 145, 92, "switch", "DIST-1", "active", palette=ROUTER, w=96)
    s2 = node(d, 375, 92, "switch", "DIST-2", "SSO standby", palette=ROUTER, w=96)
    for dy in (-8, 0):
        line(d, (s1[2], 88 + dy), (s2[0], 88 + dy), ROUTER[0], 3)
    label_bg(d, (260, 72), "SVL (EtherChannel)", 8, ROUTER[0], bold=True)
    line(d, (s1[2], 108), (s2[0], 108), WARN[0], 2, dash=(4, 3))
    label_bg(d, (260, 112), "dual-active detection link", 7.5, WARN[0], bold=True)
    accs = [node(d, 150, 230, "switch", "Access-1", None, palette=HOST, w=84),
            node(d, 370, 230, "switch", "Access-2", None, palette=HOST, w=84)]
    for a in accs:
        ax = (a[0] + a[2]) / 2
        line(d, ((s1[0] + s1[2]) / 2, s1[3]), (ax - 14, a[1]), SWITCH[0], 2)
        line(d, ((s2[0] + s2[2]) / 2, s2[3]), (ax + 14, a[1]), SWITCH[0], 2)
        d.ellipse([(ax - 32) * S, (a[1] - 22) * S, (ax + 32) * S, (a[1] - 6) * S],
                  outline=SWITCH[0], width=2 * S)
    label_bg(d, (260, 280), "MEC: one EtherChannel per access switch, a member to each chassis — nothing blocks",
             7.5, SWITCH[0], bold=True)


# ---------------------------------------------------------------- chapter 3
@diagram("c03_native_mismatch", 520, 275)
def c03_native_mismatch(d, W, H):
    title(d, W, "Native VLAN mismatch — untagged frames change VLAN mid-link")
    s1 = node(d, 150, 95, "switch", "SW1", "native VLAN 10", w=110)
    s2 = node(d, 370, 95, "switch", "SW2", "native VLAN 20", w=110)
    edge(d, s1, s2, label="802.1Q trunk", label_dy=-10)
    pa = node(d, 150, 200, "pc", "PC-A", "VLAN 10", w=80)
    pb = node(d, 370, 200, "pc", "PC-B", "VLAN 20", w=80)
    edge(d, s1, pa)
    edge(d, s2, pb)
    arrow(d, (215, 140), (305, 140), color=BAD[0], width=2)
    label_bg(d, (260, 160), "sent untagged in VLAN 10 → lands in VLAN 20", 7.5, BAD[0], bold=True)
    label_bg(d, (260, 258), "PC-A's broadcasts reach PC-B's VLAN — CDP logs it, PVST+ blocks the port",
             8, MUT)


# ---------------------------------------------------------------- chapter 4
@diagram("c04_mst_regions", 540, 300)
def c04_mst_regions(d, W, H):
    title(d, W, "MST regions — MSTIs live inside a region; only the CIST crosses")
    group(d, 20, 45, 270, 225, "Region CAMPUS (rev 1)", color=ROUTER[0], fill="#f3f8fd")
    r1 = node(d, 85, 95, "switch", "DIST-1", "CIST root", palette=WARN, w=88)
    r2 = node(d, 205, 95, "switch", "DIST-2", None, palette=ROUTER, w=80)
    r3 = node(d, 145, 185, "switch", "ACC-1", None, palette=ROUTER, w=76)
    edge(d, r1, r2)
    edge(d, r1, r3)
    edge(d, r2, r3)
    group(d, 320, 45, 520, 140, "Region DC (rev 4)", color=SERVER[0], fill="#f7f4fe")
    q1 = node(d, 420, 95, "switch", "DC-1", "CIST regional root", palette=SERVER, w=120)
    p = node(d, 420, 220, "switch", "Legacy-SW", "PVST+", palette=HOST, w=96)
    b1, _ = edge(d, r2, q1, color=MUT)
    edge(d, r3, p, color=MUT)
    label_bg(d, (294, 80), "boundary", 7.5, BAD[0], bold=True)
    label_bg(d, (300, 214), "boundary (PVST sim)", 7.5, BAD[0], bold=True)
    label_bg(d, (270, 270), "Inside a region: MSTI 1, 2… load-balance. Between regions: one CIST, each region = one big switch",
             7.5, MUT)


@diagram("c04_guards", 540, 330)
def c04_guards(d, W, H):
    title(d, W, "Where each STP enhancement belongs")
    d1 = node(d, 170, 80, "switch", "DIST-1", "STP root", palette=ROUTER, w=92)
    d2 = node(d, 370, 80, "switch", "DIST-2", "secondary", palette=ROUTER, w=92)
    edge(d, d1, d2)
    a = node(d, 270, 190, "switch", "ACCESS", None, w=92)
    edge(d, d1, a)
    p1, p2 = edge(d, d2, a)
    hosts = [node(d, 150 + i * 120, 285, "pc", f"Host {i+1}", None, w=70) for i in range(3)]
    for h in hosts:
        edge(d, a, h)
    label_bg(d, (120, 120), "Root guard (dist downlinks)", 8, BAD[0], bold=True)
    label_bg(d, (440, 128), "Loop guard + UDLD (access uplinks)", 8, SWITCH[0], bold=True)
    label_bg(d, (270, 238), "PortFast + BPDU guard (host ports)", 8, WARN[0], bold=True)
    blocked(d, ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2))
    label_bg(d, (400, 160), "alternate (blocking)", 7.5, MUT)


# ---------------------------------------------------------------- chapter 5
@diagram("c05_dual", 520, 330)
def c05_dual(d, W, H):
    title(d, W, "DUAL at R1 — three ways to reach 10.9.9.0/24, three different verdicts")
    r1 = node(d, 65, 165, "router", "R1", "FD = 3000", w=78)
    d.ellipse([405 * S, 135 * S, 505 * S, 195 * S], fill=NET[1], outline=NET[0], width=2 * S)
    text(d, (455, 158), "10.9.9.0/24", 9, True, INK)
    text(d, (455, 174), "destination", 7.5, False, MUT)
    rows = [
        (75, "R2", "RD 1000", "total 3000", "SUCCESSOR", SWITCH),
        (165, "R3", "RD 2500", "total 4000", "FEASIBLE SUCCESSOR", WARN),
        (255, "R4", "RD 3500", "total 3600", "NOT A BACKUP", BAD),
    ]
    for y, name, rd, tot, role, pal in rows:
        b = node(d, 265, y, "router", name, rd, w=78, palette=pal)
        edge(d, r1, b, label=tot, label_size=7.5, color=pal[0])
        line(d, (b[2], y), (405, 165), LINE, 2)
        label_bg(d, (265, y + 38), role, 7.5, pal[0], bold=True)
    label_bg(d, (260, 312), "Feasibility condition: RD < FD (3000).  R3: 2500 < 3000 ✓   "
             "R4: 3500 ≥ 3000 ✗", 8, MUT)


# ---------------------------------------------------------------- chapter 6
@diagram("c06_multiarea", 540, 300)
def c06_multiarea(d, W, H):
    title(d, W, "Multi-area OSPF — which router speaks which LSA, and where it travels")
    group(d, 10, 50, 160, 190, "Area 1 — normal", SWITCH[0], fill=SWITCH[1])
    group(d, 160, 50, 380, 190, "Area 0 — backbone", ROUTER[0], fill=ROUTER[1])
    group(d, 380, 50, 530, 190, "Area 2 — NSSA", SERVER[0], fill=SERVER[1])
    r1 = node(d, 70, 125, "router", "R1", "internal", w=66)
    a1 = node(d, 160, 125, "router", "ABR1", "areas 1+0", w=70, palette=WARN)
    r3 = node(d, 270, 125, "router", "R3", "backbone", w=66)
    a2 = node(d, 380, 125, "router", "ABR2", "areas 0+2", w=70, palette=WARN)
    r5 = node(d, 470, 125, "router", "R5", "ASBR", w=66, palette=BAD)
    edge(d, r1, a1, label="Type 1, 2", label_size=7, label_dy=-14)
    edge(d, a1, r3, label="Type 3", label_size=7, label_dy=-14)
    edge(d, r3, a2, label="Type 5", label_size=7, label_dy=-14)
    edge(d, a2, r5, label="Type 7", label_size=7, label_dy=-14)
    cloud(d, 470, 238, "EIGRP domain", "redistributed", rx=58, ry=24)
    line(d, (470, 154), (470, 214), LINE, 2, dash=(4, 4))
    label_bg(d, (255, 220), "ABR1 turns area 1's Type 1/2 detail into Type 3 summaries", 7.5, MUT)
    label_bg(d, (255, 240), "R5's externals enter the NSSA as Type 7;", 7.5, MUT)
    label_bg(d, (255, 258), "ABR2 translates them to Type 5 for the rest of the domain", 7.5, MUT)
    label_bg(d, (270, 285), "LSA scope: 1, 2, 3, 7 stay in one area · 4 and 5 flood the whole domain"
             " (except stub areas)", 7.5, MUT)


# ---------------------------------------------------------------- chapter 7
@diagram("c07_states", 540, 250)
def c07_states(d, W, H):
    title(d, W, "BGP neighbor states — a session is only useful in the last one")
    rows = [
        [("Idle", "not trying yet"), ("Connect", "TCP SYN sent"), ("Active", "TCP failed — retrying")],
        [("OpenSent", "OPEN sent"), ("OpenConfirm", "awaiting KEEPALIVE"),
         ("Established", "UPDATEs flow")],
    ]
    xs = [90, 270, 450]
    boxes = []
    for ry, row in zip((65, 160), rows):
        for x, (n, sub) in zip(xs, row):
            pal = SWITCH if n == "Established" else (BAD if n == "Active" else NET)
            boxes.append(node(d, x, ry, "box", n, sub, w=128, h=40, icon=False, palette=pal))
    for a, b in ((0, 1), (1, 2), (3, 4), (4, 5)):
        p, q = boxes[a], boxes[b]
        arrow(d, (p[2] + 2, (p[1] + p[3]) / 2), (q[0] - 2, (q[1] + q[3]) / 2), color=MUT)
    act, ops = boxes[2], boxes[3]
    line(d, (450, act[3] + 2), (450, 112), MUT, 2)
    line(d, (450, 112), (90, 112), MUT, 2)
    arrow(d, (90, 112), (90, ops[1] - 2), color=MUT)
    label_bg(d, (270, 112), "TCP 3-way handshake completes", 7.5, MUT, bold=True)
    label_bg(d, (270, 210), "Stuck in Active = TCP 179 never completes (no route, wrong IP, ACL)",
             8, BAD[0], bold=True)
    label_bg(d, (270, 232), "Falls back to Idle after OpenSent = OPEN rejected"
             " (wrong remote-as, bad auth)", 8, MUT)


@diagram("c07_aspath", 520, 290)
def c07_aspath(d, W, H):
    title(d, W, "AS_PATH loop prevention — a router rejects any path containing its own AS")
    r1 = node(d, 95, 95, "router", "R1", "AS 65001", w=84)
    r2 = node(d, 425, 95, "router", "R2", "AS 65002", w=84)
    r3 = node(d, 260, 225, "router", "R3", "AS 65003", w=84, palette=WARN)
    arrow(d, (r1[2] + 4, 82), (r2[0] - 4, 82), color=ROUTER[0], width=2)
    label_bg(d, (260, 68), "10.1.0.0/16  path: 65001", 8, ROUTER[0], bold=True)
    arrow(d, (r2[0] + 20, r2[3] + 4), (r3[2] - 6, r3[1] + 10), color=ROUTER[0], width=2)
    label_bg(d, (440, 205), "path: 65002 65001", 8, ROUTER[0], bold=True)
    arrow(d, (r3[0] + 6, r3[1] + 10), (r1[2] - 20, r1[3] + 4), color=BAD[0], width=2)
    label_bg(d, (95, 205), "path: 65003 65002 65001", 8, BAD[0], bold=True)
    blocked(d, (149, 151), 8)
    label_bg(d, (260, 275), "R1 sees 65001 in the path → drops the update. No TTL, no hop limit"
             " — the path itself is the proof.", 7.5, MUT)


# ---------------------------------------------------------------- chapter 8
@diagram("c08_ptp_exchange", 500, 330)
def c08_ptp_exchange(d, W, H):
    title(d, W, "PTP delay-request exchange — four timestamps, offset and path delay")
    lifeline(d, 110, 70, 290, "server", "Master", "grandmaster / BC")
    lifeline(d, 390, 70, 290, "switch", "Slave", "ordinary clock")
    arrow(d, (110, 130), (390, 150), ROUTER[0])
    label_bg(d, (250, 128), "Sync", 8.5, ROUTER[0], bold=True)
    text(d, (100, 130), "t1", 9, True, ROUTER[0], anchor="rm")
    text(d, (400, 150), "t2", 9, True, ROUTER[0], anchor="lm")
    arrow(d, (110, 172), (390, 192), MUT, dash=(5, 4))
    label_bg(d, (250, 172), "Follow_Up (carries t1)", 8, MUT, bold=True)
    arrow(d, (390, 214), (110, 234), SWITCH[0])
    label_bg(d, (250, 213), "Delay_Req", 8.5, SWITCH[0], bold=True)
    text(d, (400, 214), "t3", 9, True, SWITCH[0], anchor="lm")
    text(d, (100, 234), "t4", 9, True, SWITCH[0], anchor="rm")
    arrow(d, (110, 256), (390, 276), MUT, dash=(5, 4))
    label_bg(d, (250, 256), "Delay_Resp (carries t4)", 8, MUT, bold=True)
    label_bg(d, (250, 306), "delay = [(t2 − t1) + (t4 − t3)] ÷ 2      offset = [(t2 − t1) − (t4 − t3)] ÷ 2",
             8.5, INK, bold=True)


@diagram("c08_nat_terms", 540, 250)
def c08_nat_terms(d, W, H):
    title(d, W, "NAT terms — first word: whose address; second word: who is looking")
    group(d, 20, 50, 200, 200, "INSIDE", color=ROUTER[0])
    group(d, 340, 50, 520, 200, "OUTSIDE", color=SWITCH[0])
    pc = node(d, 80, 115, "pc", "Host", w=70)
    r = node(d, 270, 115, "router", "NAT router", w=100)
    sv = node(d, 460, 115, "server", "Web server", w=90)
    edge(d, pc, r)
    edge(d, r, sv)
    label_bg(d, (110, 172), "inside local  10.1.1.10", 8, ROUTER[0], bold=True)
    label_bg(d, (110, 188), "outside local  198.51.100.80", 8, SWITCH[0])
    label_bg(d, (430, 172), "inside global  203.0.113.10", 8, ROUTER[0], bold=True)
    label_bg(d, (430, 188), "outside global  198.51.100.80", 8, SWITCH[0])
    label_bg(d, (270, 166), "translates", 8, MUT, bold=True)
    label_bg(d, (270, 228), "blue = the inside host's address · green = the outside host's address",
             8, MUT)


# ---------------------------------------------------------------- chapter 9
@diagram("c09_fhrp_loadshare", 520, 300)
def c09_fhrp_loadshare(d, W, H):
    title(d, W, "Per-VLAN load sharing — HSRP Active and STP root on the same switch")
    core = cloud(d, 260, 62, "Core", rx=46, ry=20)
    d1 = node(d, 130, 140, "switch", "DSW1", "VLAN 10: Active + root", palette=ROUTER, w=150)
    d2 = node(d, 390, 140, "switch", "DSW2", "VLAN 20: Active + root", palette=SERVER, w=150)
    edge(d, d1, d2, label="L2 trunk", label_size=7.5)
    line(d, (160, 112), (225, 78), LINE, 2)
    line(d, (360, 112), (295, 78), LINE, 2)
    acc = node(d, 260, 235, "switch", "ACC1", "VLAN 10 + 20 hosts", w=130)
    p1, p2 = edge(d, d1, acc, color=ROUTER[0], width=3)
    q1, q2 = edge(d, d2, acc, color=SERVER[0], width=3)
    label_bg(d, ((p1[0] + p2[0]) / 2 - 52, (p1[1] + p2[1]) / 2),
             "VLAN 10 fwd", 7.5, ROUTER[0], bold=True)
    label_bg(d, ((q1[0] + q2[0]) / 2 + 52, (q1[1] + q2[1]) / 2),
             "VLAN 20 fwd", 7.5, SERVER[0], bold=True)
    label_bg(d, (260, 288), "each VLAN's forwarding uplink leads straight to its Active gateway", 8, MUT)


# ---------------------------------------------------------------- chapter 10
@diagram("c10_mcast_mac", 540, 220)
def c10_mcast_mac(d, W, H):
    title(d, W, "Group → MAC: 25 fixed bits + the low 23 bits of the group (5 bits lost)")
    text(d, (52, 72), "IPv4\ngroup", 8.5, True, MUT)
    field_bar(d, 95, 55, 420, 34, [("1110", 4, NET, "fixed"),
                                   ("5 bits", 5, BAD, "lost"),
                                   ("low-order 23 bits", 23, ROUTER, "copied")], size=8.5)
    text(d, (52, 152), "MAC", 8.5, True, MUT)
    field_bar(d, 95, 135, 420, 34, [("01:00:5e", 23, WARN, "fixed OUI"),
                                    ("0", 2, NET, None),
                                    ("23 bits", 23, ROUTER, "from the group")], size=8.5)
    arrow(d, (385, 92), (385, 132), ROUTER[0])
    label_bg(d, (270, 200), "239.1.1.1 and 224.129.1.1 → both 01:00:5e:01:01:01  ·  2⁵ = 32 groups per MAC",
             8.5, INK, bold=True)


@diagram("c10_pim_trees", 540, 320)
def c10_pim_trees(d, W, H):
    title(d, W, "PIM-SM — join via the RP first, then switch to the shortest-path tree")
    src = node(d, 60, 90, "server", "Source S", w=80)
    fhr = node(d, 170, 90, "router", "FHR", w=60)
    rp = node(d, 330, 90, "router", "RP", "10.0.0.1", palette=WARN, w=70)
    mid = node(d, 270, 210, "router", "R2", w=60)
    lhr = node(d, 430, 210, "router", "LHR", "PIM DR", w=64)
    rcv = node(d, 430, 290, "pc", "Receiver", "IGMP join G", w=86, icon=False)
    edge(d, src, fhr)
    p1, p2 = edge(d, fhr, rp, color=WARN[0], width=2, dash=(6, 4))
    label_bg(d, ((p1[0] + p2[0]) / 2, 64), "① Register (unicast)", 7.5, WARN[0], bold=True)
    edge(d, rp, lhr, color=WARN[0], width=3)
    label_bg(d, (420, 140), "② shared tree (*,G)", 7.5, WARN[0], bold=True)
    edge(d, fhr, mid, color=ROUTER[0], width=3)
    edge(d, mid, lhr, color=ROUTER[0], width=3)
    label_bg(d, (160, 140), "③ SPT (S,G)", 7.5, ROUTER[0], bold=True)
    edge(d, lhr, rcv)
    label_bg(d, (190, 280), "after the first packet the LHR joins (S,G)", 8, MUT)
    label_bg(d, (190, 298), "toward S and prunes S off the RP tree", 8, MUT)


# ---------------------------------------------------------------- chapter 11
@diagram("c11_marking_fields", 540, 230)
def c11_marking_fields(d, W, H):
    title(d, W, "Where QoS markings live — Layer 3 DSCP survives routing, Layer 2 CoS does not")
    text(d, (60, 75), "IP ToS\nbyte", 8.5, True, MUT)
    field_bar(d, 110, 58, 400, 36, [("DSCP — 6 bits (0–63)", 6, ROUTER, "EF 46 · AF41 34 · CS3 24"),
                                    ("ECN — 2 bits", 2, WARN, "congestion")], size=8.5)
    text(d, (60, 160), "802.1Q\ntag", 8.5, True, MUT)
    field_bar(d, 110, 143, 400, 36, [("PCP / CoS", 3, SWITCH, "3 bits"),
                                     ("DEI", 1, NET, "1"),
                                     ("VLAN ID", 12, NET, "12 bits")], size=8.5)
    label_bg(d, (270, 210), "the router strips the 802.1Q tag — so CoS dies at the first Layer 3 hop",
             8.5, MUT)


@diagram("c11_hqos", 520, 260)
def c11_hqos(d, W, H):
    title(d, W, "Hierarchical QoS — the parent shaper creates congestion the child can manage")
    d.rounded_rectangle([25 * S, 45 * S, 495 * S, 205 * S], radius=9 * S,
                        fill=ROUTER[1], outline=ROUTER[0], width=2 * S)
    text(d, (260, 62), "Parent WAN-SHAPER: shape average 50 Mbps", 9, True, ROUTER[0])
    classes = [("VOICE", "priority 10%", BAD), ("VIDEO", "bw 30%", SERVER),
               ("SIGNAL", "bw 5%", WARN), ("CRIT-DATA", "bw 25% + WRED", SWITCH),
               ("SCAVENGER", "bw 1%", NET), ("default", "bw 25% + FQ", HOST)]
    x = 40
    for name, sub, pal in classes:
        w = 70
        d.rounded_rectangle([x * S, 85 * S, (x + w) * S, 140 * S], radius=5 * S,
                            fill=pal[1], outline=pal[0], width=2 * S)
        text(d, (x + w / 2, 104), name, 8, True, INK)
        text(d, (x + w / 2, 122), sub, 7, False, MUT)
        x += w + 5
    text(d, (260, 160), "Child WAN-QUEUING — percentages are of the 50 Mbps shaped rate", 8.5, True, INK)
    text(d, (260, 182), "voice dequeued first (capped at 5 Mbps); others share by their guarantees",
         8, False, MUT)
    arrow(d, (260, 207), (260, 232), ROUTER[0])
    label_bg(d, (260, 244), "Gi0/0/1 — 1 Gbps port, 50 Mbps circuit (never congests on its own)", 8, MUT)


# ---------------------------------------------------------------- chapter 12
@diagram("c12_tunnel_headers", 540, 250)
def c12_tunnel_headers(d, W, H):
    title(d, W, "What each tunnel wraps around your packet (and what it costs)")
    rows = [
        ("Original", [("IP hdr", 1, ROUTER, "20 B"), ("TCP + data", 4.2, SERVER, None)],
         "0 B"),
        ("GRE", [("New IP", 1, WARN, "20 B"), ("GRE", .8, BAD, "4 B"),
                 ("IP hdr", 1, ROUTER, "20 B"), ("TCP + data", 3.2, SERVER, None)],
         "+24 B"),
        ("GRE over IPsec\n(transport mode)",
         [("New IP", 1, WARN, "20 B"), ("ESP", .8, SWITCH, "hdr+IV"), ("GRE", .8, BAD, "4 B"),
          ("IP hdr", 1, ROUTER, "20 B"), ("TCP + data", 2.0, SERVER, None),
          ("ESP trl", .8, SWITCH, "pad+ICV")],
         "≈ +60–80 B"),
        ("IPsec VTI\n(tunnel mode)",
         [("New IP", 1, WARN, "20 B"), ("ESP", .8, SWITCH, "hdr+IV"),
          ("IP hdr", 1, ROUTER, "20 B"), ("TCP + data", 2.8, SERVER, None),
          ("ESP trl", .8, SWITCH, "pad+ICV")],
         "≈ +50–70 B"),
    ]
    y = 45
    for name, fields, cost in rows:
        text(d, (55, y + 18), name, 8, True, INK)
        field_bar(d, 110, y, 360, 36, fields, size=7.5)
        text(d, (505, y + 18), cost, 8.5, True, BAD[0])
        y += 48
    label_bg(d, (290, 240), "ESP encrypts everything between its header and trailer · every added byte"
             " comes out of the 1500-byte MTU", 7.5, MUT)


# ---------------------------------------------------------------- chapter 13
@diagram("c13_lisp_flow", 540, 330)
def c13_lisp_flow(d, W, H):
    title(d, W, "LISP — ask the mapping system where an EID lives, then tunnel to its RLOC")
    lifeline(d, 80, 70, 315, "router", "ITR", "site A edge")
    lifeline(d, 270, 70, 315, "server", "MS / MR", "mapping system")
    lifeline(d, 460, 70, 315, "router", "ETR", "site B edge")
    seq_arrow(d, 460, 270, 135, "0  Map-Register", "\"10.2.0.0/16 is behind me\"", SWITCH[0])
    seq_arrow(d, 80, 270, 175, "1  Map-Request", "\"where is 10.2.3.4?\"", ROUTER[0])
    seq_arrow(d, 270, 460, 210, "2  forwarded", "MS passes it to the ETR", MUT)
    arrow(d, (460, 248), (80, 248), WARN[0])
    label_bg(d, (270, 239), "3  Map-Reply — straight back to the ITR", 8.5, WARN[0], bold=True)
    label_bg(d, (270, 257), "EID 10.2.0.0/16 → RLOC 198.51.100.2", 7.5, MUT)
    arrow(d, (80, 290), (460, 290), BAD[0], width=3)
    label_bg(d, (270, 281), "4  data, LISP-encapsulated (UDP 4341)", 8.5, BAD[0], bold=True)
    label_bg(d, (270, 299), "ITR caches the mapping — later packets skip steps 1–3", 7.5, MUT)


@diagram("c13_vxlan_header", 540, 210)
def c13_vxlan_header(d, W, H):
    title(d, W, "VXLAN — a whole Ethernet frame inside UDP: 50 bytes of overhead")
    field_bar(d, 20, 50, 500, 44, [
        ("Outer MAC", 1.15, NET, "14 B"), ("Outer IP", 1.1, WARN, "20 B · VTEP→VTEP"),
        ("UDP", .9, ROUTER, "8 B · dst 4789"), ("VXLAN", 1.0, BAD, "8 B"),
        ("Inner Ethernet frame", 2.4, SERVER, "the original L2 frame")], size=8)
    field_bar(d, 205, 125, 220, 30, [("Flags", .8, BAD, None), ("Reserved", .9, NET, None),
                                     ("VNI — 24 bits", 2, BAD, None),
                                     ("Rsvd", .6, NET, None)], size=7.5)
    line(d, (290, 94), (205, 125), MUT, 1)
    line(d, (366, 94), (425, 125), MUT, 1)
    text(d, (315, 172), "24-bit VNI = 16,777,216 segments (vs 4,094 VLANs)", 8.5, True, INK)
    text(d, (315, 190), "UDP source port is hashed from the inner flow → ECMP spreads traffic",
         8, False, MUT)
    text(d, (105, 140), "underlay sees only\nVTEP-to-VTEP UDP", 8, False, MUT)


# ---------------------------------------------------------------- chapter 14
@diagram("c14_sdwan_planes", 540, 330)
def c14_sdwan_planes(d, W, H):
    title(d, W, "Catalyst SD-WAN — controllers form the brain, WAN Edges carry the traffic")
    mgr = node(d, 95, 80, "server", "SD-WAN Manager", "management plane", w=130)
    val = node(d, 270, 80, "server", "SD-WAN Validator", "orchestration", w=130)
    ctl = node(d, 445, 80, "server", "SD-WAN Controller", "control plane (OMP)", w=135)
    e1 = node(d, 120, 250, "router", "WAN Edge — Branch", "data plane", w=140)
    e2 = node(d, 420, 250, "router", "WAN Edge — DC", "data plane", w=130)
    for e in (e1, e2):
        for c in (mgr, val, ctl):
            edge(d, e, c, color=ROUTER[0], width=1, dash=(4, 4))
    line(d, (e1[2], 250), (e2[0], 250), BAD[0], 4)
    label_bg(d, (270, 238), "IPsec tunnels + BFD", 8.5, BAD[0], bold=True)
    label_bg(d, (270, 296), "data flows edge to edge — never through the controllers", 7.5, MUT)
    label_bg(d, (270, 160), "DTLS/TLS control connections (dashed)", 8.5, ROUTER[0], bold=True)
    label_bg(d, (270, 314), "Validator: authenticates + NAT discovery · Controller: routes, TLOCs, keys, policy",
             7.5, MUT)


@diagram("c14_sda_roles", 540, 360)
def c14_sda_roles(d, W, H):
    title(d, W, "SD-Access fabric roles — and where the traditional network plugs in")
    group(d, 20, 50, 400, 340, "Fabric site (underlay: IS-IS · overlay: LISP + VXLAN + SGT)",
          color=SWITCH[0])
    cp = node(d, 90, 105, "server", "Control plane", "LISP MS/MR", w=110)
    bn = node(d, 320, 105, "switch", "Border node", "fabric exit", w=110, palette=WARN)
    i1 = node(d, 140, 200, "switch", "Intermediate", "underlay only", w=105, palette=NET)
    i2 = node(d, 290, 200, "switch", "Intermediate", "underlay only", w=105, palette=NET)
    e1 = node(d, 90, 290, "switch", "Edge node", "anycast gateway", w=110)
    e2 = node(d, 330, 290, "switch", "Edge node", "anycast gateway", w=110)
    for a, b in [(cp, i1), (bn, i2), (i1, i2), (i1, e1), (i2, e2), (i1, e2), (i2, e1)]:
        edge(d, a, b, width=2)
    fu = node(d, 470, 105, "router", "Fusion router", "VRF-lite / BGP", w=110)
    edge(d, bn, fu, color=WARN[0], width=3)
    sh = node(d, 470, 220, "server", "Shared services", "DHCP · DNS · ISE", w=110)
    edge(d, fu, sh)
    cl = cloud(d, 470, 310, "WAN / Internet", rx=50, ry=24)
    line(d, (470, 128), (470, 145), LINE, 2)
    line(d, (525, 105), (533, 105), LINE, 2, dash=(4, 4))
    line(d, (533, 105), (533, 310), LINE, 2, dash=(4, 4))
    line(d, (533, 310), (520, 310), LINE, 2, dash=(4, 4))
    label_bg(d, (175, 335), "endpoints attach here; 802.1X assigns VN + SGT", 7.5, MUT)


# ---------------------------------------------------------------- chapter 15
@diagram("c15_span", 540, 330)
def c15_span(d, W, H):
    title(d, W, "SPAN, RSPAN, ERSPAN — how far the copied traffic can travel")
    # SPAN
    text(d, (40, 45), "SPAN", 9.5, True, ROUTER[0], anchor="lm")
    s1 = node(d, 200, 85, "switch", "SW1", None, w=60)
    h1 = node(d, 80, 85, "pc", "Source port", None, w=85)
    a1 = node(d, 330, 85, "server", "Analyzer", None, w=75)
    edge(d, h1, s1, label="Gi1/0/1", label_size=7.5, label_dy=-12)
    edge(d, s1, a1, color=BAD[0], label="Gi1/0/24", label_size=7.5, label_dy=-12)
    text(d, (460, 85), "source and destination\non the same switch", 8, False, MUT)
    # RSPAN
    text(d, (40, 140), "RSPAN", 9.5, True, ROUTER[0], anchor="lm")
    h2 = node(d, 80, 180, "pc", "Source port", None, w=85)
    s2 = node(d, 200, 180, "switch", "SW1", None, w=60)
    s3 = node(d, 330, 180, "switch", "SW2", None, w=60)
    a2 = node(d, 455, 180, "server", "Analyzer", None, w=75)
    edge(d, h2, s2)
    edge(d, s2, s3, color=BAD[0], width=3, label="VLAN 999", label_size=7.5,
         label_dy=-12)
    edge(d, s3, a2, color=BAD[0])
    text(d, (265, 214), "RSPAN VLAN rides trunks — Layer 2 only, every switch on the path carries it", 7.5,
         False, MUT)
    # ERSPAN
    text(d, (40, 240), "ERSPAN", 9.5, True, ROUTER[0], anchor="lm")
    h3 = node(d, 80, 280, "pc", "Source port", None, w=85)
    s4 = node(d, 190, 280, "switch", "SW1", None, w=60)
    cl = cloud(d, 320, 280, "Routed network", rx=56, ry=24)
    a3 = node(d, 460, 280, "server", "Analyzer", None, w=75)
    edge(d, h3, s4)
    line(d, (220, 280), (262, 280), BAD[0], 3)
    line(d, (378, 280), (422, 280), BAD[0], 3)
    label_bg(d, (320, 317), "copies wrapped in GRE — can cross any IP network", 7.5, BAD[0],
             bold=True)


# ---------------------------------------------------------------- chapter 16
@diagram("c16_workflow", 540, 260)
def c16_workflow(d, W, H):
    title(d, W, "Catalyst Center — intent flows down, telemetry flows back up")
    steps = [("Design", "sites · settings\nIP pools · images", ROUTER),
             ("Policy", "VNs · groups\nQoS · access", SERVER),
             ("Provision", "PnP · templates\nfabric · SWIM", SWITCH),
             ("Assurance", "health · issues\nAI baselines", WARN)]
    xs = [80, 205, 330, 455]
    boxes = []
    for x, (n, sub, pal) in zip(xs, steps):
        boxes.append(node(d, x, 85, "box", n, None, palette=pal, icon=False, w=100, h=34))
        text(d, (x, 130), sub, 7.5, False, MUT)
    for a, b in zip(boxes, boxes[1:]):
        arrow(d, (a[2], 85), (b[0], 85), MUT, shorten=2)
    net = node(d, 270, 215, "box", "The network — switches, routers, APs", None,
               palette=NET, icon=False, w=300, h=34)
    arrow(d, (330, 150), (300, net[1]), SWITCH[0], shorten=2)
    label_bg(d, (245, 175), "config pushed", 8.5, SWITCH[0], bold=True)
    arrow(d, (400, net[1]), (440, 150), WARN[0], shorten=2)
    label_bg(d, (470, 180), "telemetry", 8.5, WARN[0], bold=True)
    label_bg(d, (270, 250), "Assurance findings feed back into the next design / policy change",
             7.5, MUT)


# ---------------------------------------------------------------- chapter 17
def _f5_panel(d, cx, cy, w, h, pal, heading, lines, size=8):
    """Rounded box with a bold heading and a list of plain lines under it."""
    border, fill = pal
    x1, y1, x2, y2 = cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2
    d.rounded_rectangle([(x1 + 1.5) * S, (y1 + 2) * S, (x2 + 1.5) * S, (y2 + 2) * S],
                        radius=7 * S, fill="#dde4ea")
    d.rounded_rectangle([x1 * S, y1 * S, x2 * S, y2 * S], radius=7 * S,
                        fill=fill, outline=border, width=2 * S)
    text(d, (cx, y1 + 13), heading, 9, True, border)
    for i, s in enumerate(lines):
        text(d, (cx, y1 + 30 + i * 14), s, size, False, INK)
    return (x1, y1, x2, y2)


@diagram("c17_aaa_flow", 500, 320)
def c17_aaa_flow(d, W, H):
    title(d, W, "AAA with TACACS+ — three separate conversations over TCP 49")
    xa, xr, xs = 70, 250, 430
    lifeline(d, xa, 62, 300, "pc", "Admin", "SSH client")
    lifeline(d, xr, 62, 300, "router", "R1", "AAA client")
    lifeline(d, xs, 62, 300, "server", "ISE", "TACACS+ server")
    seq_arrow(d, xa, xr - 4, 118, "SSH: user jsmith + password", color=HOST[0])
    seq_arrow(d, xr, xs - 4, 148, "AUTHENTICATION START", color=ROUTER[0])
    seq_arrow(d, xs, xr + 4, 178, "PASS  (FAIL = denied, no fallback)", color=SWITCH[0])
    seq_arrow(d, xr, xs - 4, 208, "AUTHORIZATION: exec shell?", color=ROUTER[0])
    seq_arrow(d, xs, xr + 4, 238, "PASS  priv-lvl=15", color=SWITCH[0])
    seq_arrow(d, xr, xs - 4, 268, "ACCOUNTING START", color=SERVER[0])
    seq_arrow(d, xr, xa + 4, 290, "R1# prompt", color=HOST[0])
    label_bg(d, (W / 2, 312), "no answer at all = ERROR → R1 tries the next method (local)",
             8, BAD[0], bold=True)


@diagram("c17_copp", 520, 270)
def c17_copp(d, W, H):
    title(d, W, "CoPP — policing the narrow path from fast hardware to the slow CPU")
    cpu = _f5_panel(d, 260, 62, 230, 46, ROUTER, "Route processor (CPU)",
                 ["thousands of packets / second"])
    copp = _f5_panel(d, 260, 138, 230, 46, WARN, "CoPP policy (control-plane)",
                  ["classify → police per class"])
    asic = _f5_panel(d, 260, 222, 270, 46, SWITCH, "Forwarding hardware (ASIC / CEF)",
                  ["millions of packets / second"])
    arrow(d, (20, 222), (asic[0] - 2, 222), color=HOST[0])
    arrow(d, (asic[2] + 2, 222), (505, 222), color=HOST[0])
    label_bg(d, (62, 202), "transit", 8, HOST[0], bold=True)
    label_bg(d, (465, 202), "forwarded", 8, HOST[0], bold=True)
    arrow(d, (260, asic[1] - 1), (260, copp[3] + 2), color=WARN[0])
    label_bg(d, (372, 183), "punted: OSPF, BGP, SSH, SNMP, ARP, ICMP", 7.5, WARN[0], bold=True)
    arrow(d, (260, copp[1] - 1), (260, cpu[3] + 2), color=SWITCH[0])
    label_bg(d, (325, 99), "conforming", 7.5, SWITCH[0], bold=True)
    drop = node(d, 455, 138, "box", "dropped", "exceed-action drop", palette=BAD,
                icon=False, w=96)
    arrow(d, (copp[2] + 2, 138), (drop[0] - 2, 138), color=BAD[0])
    label_bg(d, (78, 138), "data plane never", 7.5, MUT)
    label_bg(d, (78, 152), "touches the CPU", 7.5, MUT)


# ---------------------------------------------------------------- chapter 18
@diagram("c18_trustsec", 540, 290)
def c18_trustsec(d, W, H):
    title(d, W, "TrustSec — classify at the edge, carry the tag, enforce at egress")
    ise = node(d, 270, 62, "server", "ISE", "policy + SGT matrix", w=120)
    pc = node(d, 50, 160, "pc", "Contractor", "802.1X", w=78)
    s1 = node(d, 160, 160, "switch", "Access SW", "assigns SGT 20", w=96)
    s2 = node(d, 285, 160, "switch", "Dist SW", "carries SGT 20", w=88)
    s3 = node(d, 405, 160, "switch", "DC SW", "SGACL 20→30", w=92)
    sv = node(d, 500, 160, "server", "PCI", "SGT 30", w=60)
    edge(d, pc, s1)
    edge(d, s1, s2, color=WARN[0], width=3)
    edge(d, s2, s3, color=WARN[0], width=3)
    edge(d, s3, sv)
    blocked(d, (453, 160))
    line(d, (215, 84), (170, 131), ROUTER[0], 2, dash=(4, 4))
    line(d, (325, 84), (395, 131), ROUTER[0], 2, dash=(4, 4))
    label_bg(d, (172, 103), "authz: SGT 20", 7.5, ROUTER[0], bold=True)
    label_bg(d, (372, 103), "matrix download", 7.5, ROUTER[0], bold=True)
    group(d, 10, 212, 205, 272, "1  CLASSIFY", SWITCH[0])
    text(d, (107, 240), "dynamic (ISE) or static\n(IP, VLAN, port → SGT)", 7.5, False, INK)
    group(d, 215, 212, 350, 272, "2  PROPAGATE", WARN[0])
    text(d, (282, 240), "inline CMD 0x8909\nor SXP (TCP 64999)", 7.5, False, INK)
    group(d, 360, 212, 530, 272, "3  ENFORCE", BAD[0])
    text(d, (445, 240), "SGACL at egress:\n(src SGT, dst SGT) → deny", 7.5, False, INK)


# ---------------------------------------------------------------- chapter 20
@diagram("c20_mdp_stack", 520, 220)
def c20_mdp_stack(d, W, H):
    title(d, W, "Model-driven programmability — one model, two protocols")
    rows = [
        ("Content", [("YANG data models", 2, SERVER, "IETF · OpenConfig · Cisco native")]),
        ("Encoding", [("XML", 1, NET, None), ("JSON or XML", 1, NET, None)]),
        ("Protocol", [("NETCONF", 1, ROUTER, "RPCs, datastores, commit"),
                      ("RESTCONF", 1, SWITCH, "GET / POST / PUT / PATCH / DELETE")]),
        ("Transport", [("SSH  port 830", 1, WARN, None), ("HTTPS  port 443", 1, WARN, None)]),
    ]
    y = 40
    for name, fields in rows:
        text(d, (52, y + 18), name, 9, True, MUT)
        field_bar(d, 105, y, 400, 36, [(f[0], f[1], f[2], f[3]) for f in fields])
        y += 44


@diagram("c20_restconf_uri", 540, 110)
def c20_restconf_uri(d, W, H):
    title(d, W, "Anatomy of a RESTCONF URI")
    field_bar(d, 10, 32, 520, 46, [
        ("https://10.0.0.1", 1.25, HOST, "device"),
        ("/restconf", 0.85, ROUTER, "API root"),
        ("/data", 0.6, ROUTER, "datastore"),
        ("/ietf-interfaces:interfaces", 1.95, SERVER, "module : container"),
        ("/interface=Gi1", 1.2, SWITCH, "list entry by key"),
    ], size=8)
    label_bg(d, (W / 2, 96), "path below /data mirrors the YANG tree: container → list=key → leaf",
             8, MUT)


@diagram("c20_cc_token", 480, 270)
def c20_cc_token(d, W, H):
    title(d, W, "Catalyst Center — authenticate once, then send the token")
    xs, xc = 90, 390
    lifeline(d, xs, 60, 255, "server", "Script", "Python / Postman")
    lifeline(d, xc, 60, 255, "server", "Catalyst Center", "Intent API")
    seq_arrow(d, xs, xc - 4, 118, "POST /dna/system/api/v1/auth/token", "Basic user:pass",
              color=ROUTER[0])
    seq_arrow(d, xc, xs + 4, 160, '200  {"Token": "eyJ..."}', color=SWITCH[0])
    seq_arrow(d, xs, xc - 4, 202, "GET /dna/intent/api/v1/network-device",
              "header X-Auth-Token: eyJ...", color=ROUTER[0])
    seq_arrow(d, xc, xs + 4, 242, '200  {"response": [ ... ]}', color=SWITCH[0])


# ---------------------------------------------------------------- chapter 21
@diagram("c21_eem", 520, 165)
def c21_eem(d, W, H):
    title(d, W, "EEM — when THIS happens, do THESE things, on the device itself")
    ev = _f5_panel(d, 90, 100, 150, 112, WARN, "Event detectors",
                ["syslog pattern", "cli pattern", "timer (watchdog, cron)", "track state",
                 "interface counter", "none (run by hand)"])
    srv = _f5_panel(d, 260, 100, 120, 64, ROUTER, "EEM server",
                 ["matches event", "→ applet"])
    act = _f5_panel(d, 430, 100, 150, 112, SWITCH, "Applet actions",
                 ["010 cli \"enable\"", "020 cli \"conf t\"", "030 cli \"...\"",
                  "040 syslog msg", "050 mail", "(run in label order)"])
    arrow(d, (ev[2] + 2, 100), (srv[0] - 2, 100), color=WARN[0])
    arrow(d, (srv[2] + 2, 100), (act[0] - 2, 100), color=SWITCH[0])


# ---------------------------------------------------------------- chapter 22
@diagram("c22_rib_fib", 520, 300)
def c22_rib_fib(d, W, H):
    title(d, W, "Control plane decides, data plane forwards — RIB → FIB + adjacency")
    srcs = [("Connected", "AD 0"), ("Static", "AD 1"), ("EIGRP", "AD 90"),
            ("OSPF", "AD 110"), ("BGP", "AD 20/200")]
    boxes = []
    for i, (n, s) in enumerate(srcs):
        boxes.append(node(d, 60 + i * 100, 70, "box", n, s, palette=NET, w=86, icon=False))
    group(d, 12, 40, 508, 205, "CONTROL PLANE", color=ROUTER[0])
    rib = node(d, 260, 165, "box", "RIB — show ip route", "lowest AD wins per prefix",
               palette=ROUTER, w=230, icon=False)
    for b in boxes:
        arrow(d, ((b[0] + b[2]) / 2, b[3]), (260, rib[1]), MUT, width=1, shorten=2)
    group(d, 12, 225, 508, 292, "DATA PLANE (CEF)", color=SWITCH[0])
    fib = node(d, 140, 262, "box", "FIB — show ip cef", "next hop pre-resolved",
               palette=SWITCH, w=200, icon=False)
    adj = node(d, 385, 262, "box", "Adjacency — show adjacency", "L2 rewrite ready",
               palette=SWITCH, w=210, icon=False)
    arrow(d, (230, rib[3]), (160, fib[1]), ROUTER[0], shorten=2)
    label_bg(d, (110, 214), "copied on change", 7.5, ROUTER[0])
    arrow(d, (fib[2], 262), (adj[0], 262), SWITCH[0], shorten=2)


# ---------------------------------------------------------------- chapter 23
@diagram("c23_prefix_range", 520, 230)
def c23_prefix_range(d, W, H):
    title(d, W, "10.0.0.0/8 ge 16 le 24 — fixed network bits, a window of lengths")
    x0, x1, y = 40, 480, 70
    unit = (x1 - x0) / 32
    # length ruler 0..32
    d.rectangle([x0 * S, y * S, x1 * S, (y + 26) * S], fill=NET[1], outline=NET[0], width=2 * S)
    d.rectangle([x0 * S, y * S, (x0 + 8 * unit) * S, (y + 26) * S],
                fill=ROUTER[1], outline=ROUTER[0], width=2 * S)
    text(d, (x0 + 4 * unit, y + 13), "first 8 bits", 8, True, ROUTER[0])
    text(d, (x0 + 4 * unit, y + 40), "must equal 10.", 7.5, False, MUT)
    d.rectangle([(x0 + 16 * unit) * S, (y - 2) * S, (x0 + 24 * unit) * S, (y + 28) * S],
                fill=SWITCH[1], outline=SWITCH[0], width=2 * S)
    text(d, (x0 + 20 * unit, y + 13), "allowed lengths", 8, True, SWITCH[0])
    for n in (0, 8, 16, 24, 32):
        xx = x0 + n * unit
        line(d, (xx, y + 26), (xx, y + 32), INK, 1)
        text(d, (xx, y + 58), f"/{n}", 8, True, INK)
    text(d, (x0 + 16 * unit, y + 40), "ge 16", 7.5, True, SWITCH[0])
    text(d, (x0 + 24 * unit, y + 40), "le 24", 7.5, True, SWITCH[0])
    rows = [("10.1.0.0/16", "match", SWITCH), ("10.1.2.0/24", "match", SWITCH),
            ("10.0.0.0/8", "too short", BAD), ("10.1.2.0/25", "too long", BAD),
            ("11.1.0.0/16", "wrong network", BAD)]
    for i, (p, r, pal) in enumerate(rows):
        cx = 62 + i * 99
        node(d, cx, 185, "box", p, r, palette=pal, w=92, icon=False)
    label_bg(d, (260, 222), "both tests must pass: network bits AND length window", 8, MUT)


@diagram("c23_route_map_flow", 520, 290)
def c23_route_map_flow(d, W, H):
    title(d, W, "Route-map evaluation — first matching clause decides")
    ys = [65, 135, 205]
    labels = [("seq 10 deny", "match tag 90?"), ("seq 20 permit", "match prefix-list LANS?"),
              ("seq 30 permit", "(no match = all)")]
    acts = [("filtered", BAD), ("accepted + set tag", SWITCH), ("accepted", SWITCH)]
    for y, (n, q), (a, pal) in zip(ys, labels, acts):
        b = node(d, 150, y, "box", n, q, palette=WARN, w=180, icon=False)
        r = node(d, 410, y, "box", a, None, palette=pal, w=150, icon=False)
        arrow(d, (b[2], y), (r[0], y), pal[0], shorten=2)
        label_bg(d, ((b[2] + r[0]) / 2, y - 10), "yes", 7.5, pal[0], bold=True)
    for y1, y2 in ((ys[0], ys[1]), (ys[1], ys[2])):
        arrow(d, (150, y1 + 18), (150, y2 - 18), MUT, shorten=1)
        label_bg(d, (172, (y1 + y2) / 2), "no", 7.5, MUT, bold=True)
    arrow(d, (150, ys[2] + 18), (150, 252), MUT, shorten=1)
    node(d, 150, 268, "box", "implicit deny — filtered", None, palette=BAD, w=180, icon=False)
    label_bg(d, (410, 268), "no clause matched → route is denied", 8, MUT)


# ---------------------------------------------------------------- chapter 24
@diagram("c24_mutual_redist", 530, 350)
def c24_mutual_redist(d, W, H):
    title(d, W, "Two-point mutual redistribution — a route can come back wearing a better AD")
    d.ellipse([15 * S, 55 * S, 190 * S, 245 * S], fill=SWITCH[1], outline=SWITCH[0], width=2 * S)
    text(d, (102, 78), "RIP domain", 9.5, True, SWITCH[0])
    text(d, (102, 94), "AD 120", 8, False, MUT)
    node(d, 102, 160, "box", "192.168.5.0/24", "native RIP route", palette=SWITCH,
         w=118, icon=False)
    d.ellipse([340 * S, 55 * S, 515 * S, 245 * S], fill=ROUTER[1], outline=ROUTER[0], width=2 * S)
    text(d, (428, 78), "OSPF domain", 9.5, True, ROUTER[0])
    text(d, (428, 94), "AD 110", 8, False, MUT)
    text(d, (428, 160), "E2 LSA floods\nfrom R1 to R2", 8, False, MUT)
    r1 = node(d, 265, 95, "router", "R1", "redistributes", palette=WARN, w=96)
    r2 = node(d, 265, 210, "router", "R2", "redistributes", palette=WARN, w=96)
    arrow(d, (150, 140), (r1[0], 100), SWITCH[0], shorten=3, label="1", label_dy=-8)
    arrow(d, (r1[2], 100), (380, 125), ROUTER[0], shorten=3, label="2", label_dy=-8)
    arrow(d, (380, 195), (r2[2], 215), ROUTER[0], shorten=3, label="3", label_dy=-8)
    arrow(d, (r2[0], 215), (150, 180), BAD[0], shorten=3, dash=(5, 4), label="4",
          label_dy=10)
    steps = [("1", "R1 learns the prefix from RIP (AD 120)", SWITCH[0]),
             ("2", "R1 redistributes it into OSPF as an E2 route", ROUTER[0]),
             ("3", "R2 hears it twice: RIP 120 vs OSPF E2 110 — the reflected copy wins", ROUTER[0]),
             ("4", "R2 redistributes its OSPF entry back into RIP — feedback, then loops", BAD[0])]
    for i, (n, s_, col) in enumerate(steps):
        yy = 268 + i * 19
        text(d, (40, yy), n, 9, True, col)
        text(d, (55, yy), s_, 8.5, False, INK, anchor="lm")


# ---------------------------------------------------------------- chapter 25
@diagram("c25_pbr", 520, 270)
def c25_pbr(d, W, H):
    title(d, W, "PBR — matching packets take the policy path; the rest follow the RIB")
    g = node(d, 70, 90, "pc", "Guest VLAN", "10.20.0.0/16", w=96)
    c = node(d, 70, 200, "pc", "Corp VLAN", "10.10.0.0/16", w=96)
    r = node(d, 245, 145, "router", "R1", "ip policy route-map", w=120)
    bb = node(d, 445, 80, "router", "Broadband", "203.0.113.1", palette=WARN, w=100)
    mp = node(d, 445, 210, "router", "MPLS PE", "RIB best path", w=100)
    edge(d, g, r)
    edge(d, c, r)
    arrow(d, (r[2], 132), (bb[0], 90), WARN[0], width=3, shorten=2)
    arrow(d, (r[2], 158), (mp[0], 205), ROUTER[0], width=3, shorten=2)
    label_bg(d, (300, 95), "guest web: set ip next-hop", 7.5, WARN[0], bold=True)
    label_bg(d, (280, 198), "everything else: normal routing", 7.5, ROUTER[0], bold=True)
    label_bg(d, (245, 250), "applied INBOUND on the guest interface — before the routing lookup",
             8, MUT)


@diagram("c25_vrf_lite", 520, 280)
def c25_vrf_lite(d, W, H):
    title(d, W, "VRF-Lite — one router, separate tables, overlapping addresses allowed")
    d.rounded_rectangle([160 * S, 50 * S, 360 * S, 235 * S], radius=10 * S, fill=NET[1],
                        outline=ROUTER[0], width=2 * S)
    text(d, (260, 64), "R1", 10, True, ROUTER[0])
    red = ("#c0392b", "#fdeae7")
    blue = ROUTER
    rb = node(d, 260, 110, "box", "VRF RED table", "10.1.1.0/24 → Gi0/1", palette=red,
              w=180, icon=False)
    bb = node(d, 260, 185, "box", "VRF BLUE table", "10.1.1.0/24 → Gi0/2", palette=blue,
              w=180, icon=False)
    h1 = node(d, 60, 110, "pc", "RED site", "10.1.1.0/24", palette=red, w=90)
    h2 = node(d, 60, 185, "pc", "BLUE site", "10.1.1.0/24", palette=blue, w=90)
    n1 = node(d, 460, 110, "router", "R2", "Gi0/3.10", palette=red, w=90)
    n2 = node(d, 460, 185, "router", "R2", "Gi0/3.20", palette=blue, w=90)
    edge(d, h1, rb, color=red[0], label="Gi0/1", label_size=7.5, label_dy=-10)
    edge(d, h2, bb, color=blue[0], label="Gi0/2", label_size=7.5, label_dy=-10)
    edge(d, rb, n1, color=red[0], label="VLAN 10", label_size=7.5, label_dy=-10)
    edge(d, bb, n2, color=blue[0], label="VLAN 20", label_size=7.5, label_dy=-10)
    label_bg(d, (260, 258), "a RED packet is only ever looked up in RED's table — no route, no leak",
             8, MUT)


@diagram("c25_bfd", 520, 250)
def c25_bfd(d, W, H):
    title(d, W, "Why BFD — with a switch in the path, the far router can die silently")
    r1 = node(d, 75, 105, "router", "R1", "Gi0/0 still UP", w=100)
    sw = node(d, 260, 105, "switch", "Switch / carrier", None, w=120)
    r2 = node(d, 445, 105, "router", "R2", "crashed", palette=BAD, w=96)
    edge(d, r1, sw, color=SWITCH[0], width=3, label="link up", label_size=7.5, label_dy=-11)
    p1, p2 = edge(d, sw, r2, color=LINE, dash=(4, 4))
    blocked(d, ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2))
    d.rounded_rectangle([40 * S, 160 * S, 480 * S, 235 * S], radius=7 * S,
                        fill="#f4f6f8", outline=LINE, width=1 * S)
    rows = [("OSPF dead interval", "40 s of black-holed traffic"),
            ("BGP hold time", "up to 180 s"),
            ("BFD 50 ms × 3", "150 ms → tells OSPF/EIGRP/BGP at once")]
    for i, (a, b) in enumerate(rows):
        yy = 177 + i * 21
        text(d, (60, yy), a, 8.5, True, INK if i < 2 else SWITCH[0], anchor="lm")
        text(d, (230, yy), b, 8.5, False, MUT if i < 2 else SWITCH[0], anchor="lm")


# ---------------------------------------------------------------- chapter 26
@diagram("c26_dual", 540, 300)
def c26_dual(d, W, H):
    title(d, W, "DUAL on R1 — reported distance decides who may be a backup")
    r1 = node(d, 70, 160, "router", "R1", "computing", w=74)
    net = node(d, 470, 160, "box", "10.9.9.0/24", "destination", icon=False, w=96)
    r2 = node(d, 270, 70, "router", "R2", None, w=60)
    r3 = node(d, 270, 160, "router", "R3", None, w=60)
    r4 = node(d, 270, 250, "router", "R4", None, w=60)
    edge(d, r1, r2, color=ROUTER[0], width=3)
    edge(d, r1, r3, color=SWITCH[0])
    edge(d, r1, r4, color=BAD[0], dash=(5, 4))
    edge(d, r2, net, color=ROUTER[0], width=3)
    edge(d, r3, net, color=SWITCH[0])
    edge(d, r4, net, color=BAD[0], dash=(5, 4))
    label_bg(d, (365, 98), "RD 1000", 8, ROUTER[0], bold=True)
    label_bg(d, (370, 160), "RD 2500", 8, SWITCH[0], bold=True)
    label_bg(d, (365, 222), "RD 3500", 8, BAD[0], bold=True)
    label_bg(d, (165, 92), "total 3000 = FD", 8, ROUTER[0], bold=True)
    label_bg(d, (170, 160), "total 4000", 8, SWITCH[0], bold=True)
    label_bg(d, (165, 228), "total 3600", 8, BAD[0], bold=True)
    text(d, (270, 34), "successor", 8.5, True, ROUTER[0])
    text(d, (270, 200), "FS: 2500 < 3000", 8, True, SWITCH[0])
    text(d, (305, 272), "not FS: 3500 ≥ 3000", 8, True, BAD[0], anchor="lm")
    label_bg(d, (270, 291), "feasibility condition: a neighbor's RD must be strictly lower than the FD",
             8, MUT)


# ---------------------------------------------------------------- chapter 27
@diagram("c27_virtual_link", 540, 250)
def c27_virtual_link(d, W, H):
    title(d, W, "A virtual link stitches Area 2 to the backbone through transit Area 1")
    d.ellipse([20 * S, 50 * S, 180 * S, 200 * S], fill=ROUTER[1], outline=ROUTER[0], width=2 * S)
    text(d, (100, 70), "Area 0", 9, True, ROUTER[0])
    d.ellipse([170 * S, 50 * S, 370 * S, 200 * S], fill=SWITCH[1], outline=SWITCH[0], width=2 * S)
    text(d, (270, 66), "Area 1 (transit)", 9, True, SWITCH[0])
    d.ellipse([360 * S, 50 * S, 520 * S, 200 * S], fill=SERVER[1], outline=SERVER[0], width=2 * S)
    text(d, (440, 70), "Area 2", 9, True, SERVER[0])
    core = node(d, 85, 140, "router", "R1", "backbone", w=66)
    abr1 = node(d, 190, 140, "router", "R2 ABR", "RID 2.2.2.2", palette=WARN, w=82)
    abr2 = node(d, 350, 140, "router", "R3", "RID 3.3.3.3", palette=WARN, w=82)
    r4 = node(d, 460, 140, "router", "R4", "internal", w=66)
    edge(d, core, abr1)
    edge(d, abr1, abr2)
    edge(d, abr2, r4)
    arrow(d, (200, 104), (340, 104), color=ROUTER[0], both=True, dash=(6, 4))
    label_bg(d, (270, 87), "virtual link (an Area 0 interface)", 8, ROUTER[0], bold=True)
    label_bg(d, (270, 222), "Area 2 doesn't touch Area 0 — R3 only becomes an ABR via the virtual link",
             8, MUT)
    label_bg(d, (270, 240), "transit area must be a normal area (never stub/NSSA)", 8, MUT)


# ---------------------------------------------------------------- chapter 28
@diagram("c28_next_hop", 540, 200)
def c28_next_hop(d, W, H):
    title(d, W, "iBGP keeps the eBGP next hop — unless the border router rewrites it")
    isp = node(d, 70, 80, "router", "ISP", "AS 65100", w=76)
    r1 = node(d, 270, 80, "router", "R1 border", "AS 65001", w=90)
    r2 = node(d, 470, 80, "router", "R2", "AS 65001", w=76)
    edge(d, isp, r1, label="eBGP 203.0.113.0/30", label_size=7.5, label_dy=-12)
    edge(d, r1, r2, label="iBGP (loopbacks)", label_size=7.5, label_dy=-12)
    d.rounded_rectangle([300 * S, 128 * S, 530 * S, 190 * S], radius=6 * S,
                        fill="#f4f6f8", outline=LINE, width=1 * S)
    text(d, (310, 142), "R2 learns 8.8.8.0/24:", 8, True, INK, anchor="lm")
    text(d, (310, 160), "default: next hop 203.0.113.1  ✗ unreachable", 8, False, BAD[0], anchor="lm")
    text(d, (310, 178), "next-hop-self: next hop 1.1.1.1  ✓ via IGP", 8, False, SWITCH[0], anchor="lm")
    d.rounded_rectangle([20 * S, 128 * S, 230 * S, 190 * S], radius=6 * S,
                        fill="#f4f6f8", outline=LINE, width=1 * S)
    text(d, (30, 142), "ISP advertises 8.8.8.0/24", 8, True, INK, anchor="lm")
    text(d, (30, 160), "eBGP sets next hop = itself", 8, False, MUT, anchor="lm")
    text(d, (30, 178), "(203.0.113.1)", 8, False, MUT, anchor="lm")


@diagram("c28_route_reflector", 540, 315)
def c28_route_reflector(d, W, H):
    title(d, W, "Route reflector — who gets reflected to whom")
    rr = node(d, 270, 80, "router", "RR", "cluster-id 1.1.1.1", palette=WARN, w=110)
    c1 = node(d, 80, 210, "router", "Client A", None, w=80)
    c2 = node(d, 210, 210, "router", "Client B", None, w=80)
    n1 = node(d, 360, 210, "router", "Non-client C", None, w=100)
    n2 = node(d, 480, 210, "router", "Non-client D", None, w=100)
    edge(d, rr, c1, color=SWITCH[0])
    edge(d, rr, c2, color=SWITCH[0])
    text(d, (145, 252), "route-reflector clients", 7.5, True, SWITCH[0])
    edge(d, rr, n1, color=ROUTER[0])
    edge(d, rr, n2, color=ROUTER[0])
    line(d, (410, 210), (430, 210), ROUTER[0], 2)
    text(d, (420, 252), "C and D: iBGP full mesh", 7.5, True, ROUTER[0])
    d.rounded_rectangle([20 * S, 266 * S, 520 * S, 310 * S], radius=6 * S,
                        fill="#f4f6f8", outline=LINE, width=1 * S)
    text(d, (30, 278), "from a client  → reflect to all clients and all non-clients", 8, False, INK, anchor="lm")
    text(d, (30, 296), "from a non-client → reflect to clients only (non-clients mesh among themselves)",
         8, False, INK, anchor="lm")


# ---------------------------------------------------------------- chapter 29
@diagram("c29_mpls_label", 520, 200)
def c29_mpls_label(d, W, H):
    title(d, W, "The MPLS label — a 32-bit shim between Layer 2 and Layer 3")
    frame = [("Ethernet", 1.6, NET, "type 0x8847"), ("MPLS label", 1.5, WARN, "4 bytes"),
             ("IP header", 1.5, ROUTER, None), ("Payload", 2.6, SERVER, None)]
    field_bar(d, 25, 42, 470, 38, frame, size=8.5)
    # zoom lines from the label box to the expanded header
    lx1 = 25 + 470 * 1.6 / 7.2
    lx2 = 25 + 470 * 3.1 / 7.2
    line(d, (lx1, 80), (25, 112), LINE, 1, dash=(3, 3))
    line(d, (lx2, 80), (495, 112), LINE, 1, dash=(3, 3))
    fields = [("Label", 20, WARN, "20 bits"), ("TC", 3, SWITCH, "3"),
              ("S", 1.6, BAD, "1"), ("TTL", 8, ROUTER, "8 bits")]
    field_bar(d, 25, 112, 470, 40, fields, size=8.5)
    text(d, (260, 170), "Label: what to do with me  ·  TC: QoS (old EXP)  ·  "
         "S = 1 on the bottom label  ·  TTL: loop guard", 8, False, MUT)
    text(d, (260, 186), "labels 0–15 reserved — 3 = implicit null (\"pop before sending to me\")",
         8, False, MUT)


@diagram("c29_l3vpn_walk", 540, 300)
def c29_l3vpn_walk(d, W, H):
    title(d, W, "MPLS L3VPN — routes ride MP-BGP, packets ride a two-label stack")
    y = 150
    ce1 = node(d, 40, y, "router", "CE1", "Site A", w=62)
    pe1 = node(d, 145, y, "router", "PE1", "1.1.1.1", w=66, palette=WARN)
    p1 = node(d, 250, y, "router", "P1", None, w=56)
    p2 = node(d, 345, y, "router", "P2", None, w=56)
    pe2 = node(d, 445, y, "router", "PE2", "4.4.4.4", w=66, palette=WARN)
    ce2 = node(d, 492, y + 88, "router", "CE2", "10.2.2.0/24", w=78)
    group(d, 105, 105, 485, 195, "Provider MPLS core (no customer routes)", ROUTER[0])
    edge(d, ce1, pe1)
    edge(d, pe1, p1)
    edge(d, p1, p2)
    edge(d, p2, pe2)
    edge(d, pe2, ce2)
    # MP-BGP arc over the top
    arrow(d, (445, 75), (145, 75), SERVER[0], width=2, dash=(5, 4))
    label_bg(d, (295, 62), "MP-BGP VPNv4: 65000:100:10.2.2.0/24 · RT 65000:100 · VPN label 24",
             8, SERVER[0], bold=True)
    label_bg(d, (295, 88), "next hop 4.4.4.4 (PE2 loopback)", 7.5, MUT)
    line(d, (445, 75), (445, 122), LINE, 1, dash=(3, 3))
    line(d, (145, 75), (145, 122), LINE, 1, dash=(3, 3))

    # label stacks under each core link
    def stack(cx, labels):
        top = 212
        for i, (lab, pal) in enumerate(labels):
            d.rounded_rectangle([(cx - 26) * S, (top + i * 18) * S, (cx + 26) * S,
                                 (top + i * 18 + 16) * S], radius=3 * S,
                                fill=pal[1], outline=pal[0], width=1 * S)
            text(d, (cx, top + i * 18 + 8), lab, 7.5, True, INK)
    stack(92, [("IP", ROUTER)])
    stack(197, [("18", WARN), ("24", SERVER), ("IP", ROUTER)])
    stack(297, [("21", WARN), ("24", SERVER), ("IP", ROUTER)])
    stack(395, [("24", SERVER), ("IP", ROUTER)])
    text(d, (197, 278), "push 18 + 24", 7.5, False, MUT)
    text(d, (297, 278), "swap 18→21", 7.5, False, MUT)
    text(d, (395, 278), "PHP: pop 21", 7.5, False, MUT)
    label_bg(d, (270, 294), "orange = transport (LDP) label  ·  purple = VPN label, read only by PE2",
             7.5, MUT)


# ---------------------------------------------------------------- chapter 30
@diagram("c30_dmvpn_topology", 520, 300)
def c30_dmvpn_topology(d, W, H):
    title(d, W, "DMVPN — one mGRE tunnel subnet (10.0.0.0/24) laid over the internet")
    hub = node(d, 260, 70, "router", "Hub (NHS)", "tun 10.0.0.1 · NBMA 198.51.100.1",
               w=190, palette=WARN)
    cloud(d, 260, 160, "Internet", "underlay / NBMA", rx=70, ry=30)
    s1 = node(d, 85, 245, "router", "Spoke 1", "tun .11 · NBMA 203.0.113.11", w=160)
    s2 = node(d, 435, 245, "router", "Spoke 2", "tun .12 · NBMA 203.0.113.12", w=160)
    line(d, (215, 98), (110, 216), ROUTER[0], 3)
    line(d, (305, 98), (410, 216), ROUTER[0], 3)
    label_bg(d, (138, 140), "registered", 8, ROUTER[0], bold=True)
    label_bg(d, (382, 140), "registered", 8, ROUTER[0], bold=True)
    line(d, (166, 245), (354, 245), SWITCH[0], 3, dash=(7, 5))
    label_bg(d, (260, 232), "spoke-to-spoke tunnel", 8, SWITCH[0], bold=True)
    label_bg(d, (260, 258), "built on demand", 7.5, MUT)
    label_bg(d, (260, 290), "hub knows spokes from NHRP registration — adding Spoke 3 never touches the hub",
             7.5, MUT)


@diagram("c30_phase3_seq", 520, 330)
def c30_phase3_seq(d, W, H):
    title(d, W, "Phase 3 spoke-to-spoke — redirect, resolve, go direct")
    xs = (80, 260, 440)
    lifeline(d, xs[0], 62, 300, "router", "Spoke 1", "10.0.0.11")
    lifeline(d, xs[1], 62, 300, "router", "Hub", "10.0.0.1")
    lifeline(d, xs[2], 62, 300, "router", "Spoke 2", "10.0.0.12")
    seq_arrow(d, xs[0], xs[1], 122, "1  data to 10.12.0.10", "follows the hub's summary",
              ROUTER[0], size=8)
    seq_arrow(d, xs[1], xs[2], 160, "2  hub forwards it", "out the same tunnel",
              ROUTER[0], size=8)
    seq_arrow(d, xs[1], xs[0], 198, "3  NHRP Redirect", "\"there's a better path\"",
              WARN[0], size=8)
    seq_arrow(d, xs[0], xs[1], 236, "4  Resolution Request", "relayed to Spoke 2",
              SERVER[0], size=8)
    line(d, (xs[1], 236), (xs[2], 236), SERVER[0], 2, dash=(4, 3))
    arrow_head(d, (xs[2], 236), 0, SERVER[0])
    seq_arrow(d, xs[2], xs[0], 276, "5  Resolution Reply — direct", "NBMA 203.0.113.12",
              SWITCH[0], size=8)
    label_bg(d, (260, 318), "Spoke 1 installs an NHRP shortcut (H route) — later packets go straight to Spoke 2",
             7.5, INK, bold=True)


# ---------------------------------------------------------------- chapter 31
@diagram("c31_copp", 520, 270)
def c31_copp(d, W, H):
    title(d, W, "CoPP — only traffic addressed to the router meets the policers")
    cloud(d, 60, 135, "Packets", "arriving", rx=48, ry=26)
    r = node(d, 175, 135, "router", "Forwarding", "CEF / data plane", w=110)
    arrow(d, (108, 135), (118, 135), MUT)
    out = node(d, 460, 60, "box", "Out another port", "transit traffic", w=120, icon=False)
    arrow(d, (175, 106), (398, 60), SWITCH[0], width=2, label="transit — CoPP never sees it",
          label_size=7.5, label_dy=-10)
    classes = [("CM-ROUTING", "OSPF · EIGRP · BGP ×2", ROUTER),
               ("CM-MGMT", "SSH · Telnet · HTTP(S) · SNMP", SWITCH),
               ("CM-ICMP", "ping, unreachables", WARN),
               ("class-default", "everything unclassified", BAD)]
    for i, (nm, sub, pal) in enumerate(classes):
        y = 120 + i * 36
        d.rounded_rectangle([290 * S, (y - 14) * S, 420 * S, (y + 14) * S], radius=5 * S,
                            fill=pal[1], outline=pal[0], width=2 * S)
        text(d, (355, y - 5), nm, 8, True, INK)
        text(d, (355, y + 7), sub, 6.8, False, MUT)
        arrow(d, (420, y), (450, y), pal[0], width=2)
    arrow(d, (232, 150), (285, 150), ROUTER[0], width=2)
    label_bg(d, (255, 172), "to me", 7.5, ROUTER[0], bold=True)
    node(d, 485, 174, "box", "CPU", "route proc.", w=58, h=120, icon=False, palette=SERVER)
    label_bg(d, (355, 258), "first match wins, each class policed — unclassified traffic shares class-default",
             7.5, MUT)


# ---------------------------------------------------------------- chapter 32
@diagram("c32_ipsla_track", 520, 290)
def c32_ipsla_track(d, W, H):
    title(d, W, "IP SLA + object tracking — the probe decides which default route lives")
    r = node(d, 70, 150, "router", "R1", "branch edge", w=80)
    a = node(d, 220, 85, "router", "ISP-A", "203.0.113.1", w=90, palette=SWITCH)
    b = node(d, 220, 215, "router", "ISP-B", "198.51.100.1", w=90, palette=WARN)
    cloud(d, 360, 150, "Internet", rx=54, ry=27)
    t = node(d, 470, 150, "server", "8.8.8.8", "probe target", w=78)
    edge(d, r, a, color=ROUTER[0], width=3)
    line(d, (265, 95), (318, 133), ROUTER[0], 3)
    line(d, (414, 150), (431, 150), ROUTER[0], 3)
    edge(d, r, b, color=LINE, width=2, dash=(5, 4))
    line(d, (265, 205), (318, 167), LINE, 2, dash=(5, 4))
    label_bg(d, (120, 103), "primary", 8, SWITCH[0], bold=True)
    label_bg(d, (120, 200), "backup (AD 10)", 8, WARN[0], bold=True)
    label_bg(d, (330, 44), "ip sla 10: icmp-echo to 8.8.8.8 every 5 s — out ISP-A (blue path)",
             8, ROUTER[0], bold=True)
    d.rounded_rectangle([20 * S, 250 * S, 500 * S, 284 * S], radius=6 * S,
                        fill="#f4f6f8", outline=LINE, width=1 * S)
    text(d, (260, 260), "probe fails → track 1 down → tracked default via ISP-A removed → AD 10 backup installs",
         7.5, True, INK)
    text(d, (260, 274), "a /32 route pins 8.8.8.8 to ISP-A so the probe always tests the primary path",
         7.5, False, MUT)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    only = set(sys.argv[1:])
    unknown = only - set(DIAGRAMS)
    if unknown:
        raise SystemExit(f"Unknown diagram(s): {', '.join(sorted(unknown))}")
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
