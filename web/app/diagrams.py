"""Checks and prepares the interactive diagrams written in the study guides' markdown.

A diagram is a fenced block whose language is `diagram`, holding one JSON object (see
web/DIAGRAMS.md for the format). The content build validates every one here, so a typo
fails the Docker build with the diagram's title instead of breaking a page at runtime,
and turns the prose fields (info, text, caption, prompt) from markdown into HTML.
"""
import ipaddress
import json
import re

KINDS = ("router", "switch", "l3switch", "firewall", "host", "server", "cloud", "ap", "wlc",
         "controller", "phone")
TONES = ("accent", "good", "bad", "warn", "muted", "purple")
LINK_STYLES = ("solid", "dashed", "tunnel", "wireless", "thick")
LINK_STATES = ("active", "blocked", "down", "dim")
NODE_STATES = ("active", "down", "dim")
# Prose fields hold markdown and reach the page as HTML; every other string is shown as plain text.
PROSE = ("info", "text", "caption", "prompt")
ID = re.compile(r"^[A-Za-z0-9_.]+$")
MAC = re.compile(r"^[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}$|^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$")


class DiagramError(Exception):
    pass


def _need(cond, msg):
    if not cond:
        raise DiagramError(msg)


def _keys(obj, where, required, optional=()):
    _need(isinstance(obj, dict), "%s must be an object" % where)
    missing = [k for k in required if k not in obj]
    _need(not missing, "%s is missing %s" % (where, ", ".join(missing)))
    extra = sorted(set(obj) - set(required) - set(optional))
    _need(not extra, "%s has unknown key(s) %s" % (where, ", ".join(extra)))


def _text(v, where, allow_empty=False):
    _need(isinstance(v, str) and (allow_empty or v.strip()), "%s must be non-empty text" % where)


def _num(v, where):
    _need(isinstance(v, (int, float)) and not isinstance(v, bool), "%s must be a number" % where)


def _ipv4(v, where):
    try:
        ipaddress.IPv4Address(v)
    except (ipaddress.AddressValueError, ValueError):
        raise DiagramError("%s: %r is not an IPv4 address" % (where, v))


def _nodes_links(spec, where_kind):
    _need(isinstance(spec["nodes"], list) and spec["nodes"], "nodes must be a non-empty list")
    ids = set()
    places = set()
    for n in spec["nodes"]:
        _keys(n, "node", ("id", "x", "y"), ("kind", "label", "sub", "info"))
        _need(isinstance(n["id"], str) and ID.match(n["id"]),
              "node id %r: use letters, digits, '_' or '.' (no spaces or dashes)" % n["id"])
        _need(n["id"] not in ids, "two nodes share the id %s" % n["id"])
        ids.add(n["id"])
        _num(n["x"], "node %s x" % n["id"])
        _num(n["y"], "node %s y" % n["id"])
        _need((n["x"], n["y"]) not in places, "node %s sits on top of another node" % n["id"])
        places.add((n["x"], n["y"]))
        _need(n.get("kind", "router") in KINDS, "node %s: kind must be one of %s" % (n["id"], ", ".join(KINDS)))
        for k in ("label", "sub", "info"):
            if k in n:
                _text(n[k], "node %s %s" % (n["id"], k))
    _need(isinstance(spec["links"], list), "links must be a list")
    pairs = {}
    link_ids = set()
    for l in spec["links"]:
        opt = ("id", "label", "aLabel", "bLabel", "style", "info")
        if where_kind == "path":
            opt += ("cost", "costs", "editable", "down")
        _keys(l, "link", ("a", "b"), opt)
        _need(l["a"] in ids and l["b"] in ids, "link %s-%s names a node that doesn't exist" % (l["a"], l["b"]))
        _need(l["a"] != l["b"], "link from %s to itself" % l["a"])
        _need(l.get("style", "solid") in LINK_STYLES,
              "link %s-%s: style must be one of %s" % (l["a"], l["b"], ", ".join(LINK_STYLES)))
        for k in ("label", "aLabel", "bLabel", "info"):
            if k in l:
                _text(l[k], "link %s-%s %s" % (l["a"], l["b"], k))
        if "id" in l:
            _need(isinstance(l["id"], str) and ID.match(l["id"]) and l["id"] not in ids and l["id"] not in link_ids,
                  "link id %r must be unique and unlike any node id" % l.get("id"))
            link_ids.add(l["id"])
        pair = tuple(sorted((l["a"], l["b"])))
        pairs[pair] = pairs.get(pair, 0) + 1
        if where_kind == "path":
            _need(("cost" in l) != ("costs" in l), "link %s-%s needs cost or costs (not both)" % (l["a"], l["b"]))
            if "cost" in l:
                _need(isinstance(l["cost"], int) and l["cost"] >= 0, "link %s-%s cost must be a whole number >= 0" % (l["a"], l["b"]))
            else:
                _need(isinstance(l["costs"], list) and len(l["costs"]) == 2
                      and all(isinstance(c, int) and c >= 0 for c in l["costs"]),
                      "link %s-%s costs must be [a-to-b, b-to-a] whole numbers" % (l["a"], l["b"]))
    refs = set(link_ids)
    for l in spec["links"]:
        if pairs[tuple(sorted((l["a"], l["b"])))] == 1:
            refs.add("%s-%s" % (l["a"], l["b"]))
            refs.add("%s-%s" % (l["b"], l["a"]))
        else:
            _need("id" in l, "links %s-%s run in parallel, so each needs an id" % (l["a"], l["b"]))
    adjacency = {}
    for l in spec["links"]:
        adjacency.setdefault(l["a"], set()).add(l["b"])
        adjacency.setdefault(l["b"], set()).add(l["a"])
    return ids, refs, adjacency


def _zones(spec, ids):
    for z in spec.get("zones", []):
        _keys(z, "zone", ("label", "nodes"), ("tone", "pad"))
        _text(z["label"], "zone label")
        _need(isinstance(z["nodes"], list) and z["nodes"] and all(n in ids for n in z["nodes"]),
              "zone %r must list existing node ids" % z["label"])
        _need(z.get("tone", "muted") in TONES, "zone %r tone must be one of %s" % (z["label"], ", ".join(TONES)))
        if "pad" in z:
            _need(isinstance(z["pad"], int) and 0 <= z["pad"] <= 4, "zone %r pad must be 0-4" % z["label"])


def _topology(spec):
    _keys(spec, "topology", ("type", "title", "nodes", "links"), ("caption", "zones", "steps"))
    ids, refs, adjacency = _nodes_links(spec, "topology")
    _zones(spec, ids)
    steps = spec.get("steps", [])
    _need(isinstance(steps, list), "steps must be a list")
    if not steps:
        _need(any("info" in x for x in spec["nodes"] + spec["links"]),
              "a topology without steps must give at least some nodes or links an info text to click")
    _need(len(steps) != 1, "a single step isn't a step-through; give two or more steps, or none")
    # What each link reference joins: link ids, plus "A-B" for a pair with only one link.
    link_of = {}
    for l in spec["links"]:
        if "id" in l:
            link_of[l["id"]] = (l["a"], l["b"])
        for ref in ("%s-%s" % (l["a"], l["b"]), "%s-%s" % (l["b"], l["a"])):
            if ref in refs:
                link_of[ref] = (l["a"], l["b"])
    for k, s in enumerate(steps, 1):
        where = "step %d" % k
        _keys(s, where, ("title", "text"), ("focus", "nodes", "links", "packets"))
        _text(s["title"], where + " title")
        _text(s["text"], where + " text")
        for f in s.get("focus", []):
            _need(f in ids or f in refs, "%s focus %r is not a node or link" % (where, f))
        for nid, st in s.get("nodes", {}).items():
            _need(nid in ids, "%s sets node %r, which doesn't exist" % (where, nid))
            if st is None:
                continue
            _keys(st, "%s node %s" % (where, nid), (), ("badge", "tone", "state"))
            if "badge" in st:
                _need(isinstance(st["badge"], str) and 0 < len(st["badge"]) <= 14,
                      "%s node %s badge must be 1-14 characters" % (where, nid))
            _need(st.get("tone", "accent") in TONES, "%s node %s tone must be one of %s" % (where, nid, ", ".join(TONES)))
            _need(st.get("state", "active") in NODE_STATES,
                  "%s node %s state must be one of %s" % (where, nid, ", ".join(NODE_STATES)))
        for ref, st in s.get("links", {}).items():
            _need(ref in refs, "%s sets link %r, which isn't a link id or an A-B pair with one link" % (where, ref))
            _need(st is None or st in LINK_STATES, "%s link %s state must be one of %s or null" % (where, ref, ", ".join(LINK_STATES)))
        for p in s.get("packets", []):
            _keys(p, where + " packet", ("path",), ("label", "tone", "via"))
            path = p["path"]
            _need(isinstance(path, list) and len(path) >= 2 and all(n in ids for n in path),
                  "%s packet path must list two or more existing nodes" % where)
            via = p.get("via")
            if via is not None:
                _need(isinstance(via, list) and len(via) == len(path) - 1,
                      "%s packet via must name one link per hop" % where)
            for h in range(len(path) - 1):
                a, b = path[h], path[h + 1]
                if via is not None and via[h] is not None:
                    _need(via[h] in link_of and set(link_of[via[h]]) == {a, b},
                          "%s packet via %r doesn't join %s and %s" % (where, via[h], a, b))
                else:
                    _need("%s-%s" % (a, b) in refs,
                          "%s packet hops %s -> %s, but no single link joins them (add one, or name it in via)" % (where, a, b))
            _need(p.get("tone", "accent") in TONES, "%s packet tone must be one of %s" % (where, ", ".join(TONES)))
            if "label" in p:
                _need(isinstance(p["label"], str) and 0 < len(p["label"]) <= 24, "%s packet label must be 1-24 characters" % where)


def _sequence(spec):
    _keys(spec, "sequence", ("type", "title", "actors", "messages"), ("caption",))
    actors = spec["actors"]
    _need(isinstance(actors, list) and 2 <= len(actors) <= 6, "a sequence needs 2-6 actors")
    ids = set()
    for a in actors:
        _keys(a, "actor", ("id",), ("kind", "label"))
        _need(isinstance(a["id"], str) and ID.match(a["id"]) and a["id"] not in ids, "actor id %r must be unique" % a["id"])
        ids.add(a["id"])
        _need(a.get("kind", "router") in KINDS, "actor %s kind must be one of %s" % (a["id"], ", ".join(KINDS)))
    msgs = spec["messages"]
    _need(isinstance(msgs, list) and len(msgs) >= 2, "a sequence needs two or more messages")
    for k, m in enumerate(msgs, 1):
        where = "message %d" % k
        if "note" in m:
            _keys(m, where, ("note", "over", "text"), ("states", "tone"))
            _text(m["note"], where + " note")
            _need(isinstance(m["over"], list) and m["over"] and all(x in ids for x in m["over"]),
                  "%s over must list actor ids" % where)
        else:
            _keys(m, where, ("from", "to", "label", "text"), ("detail", "states", "tone", "dashed", "drop"))
            _need(m["from"] in ids and m["to"] in ids, "%s from/to must be actor ids" % where)
            _text(m["label"], where + " label")
            _need(len(m["label"]) <= 40, "%s label is over 40 characters; move detail to detail or text" % where)
            if "detail" in m:
                _text(m["detail"], where + " detail")
                _need(len(m["detail"]) <= 48, "%s detail is over 48 characters" % where)
            for flag in ("dashed", "drop"):
                if flag in m:
                    _need(isinstance(m[flag], bool), "%s %s must be true or false" % (where, flag))
        _text(m["text"], where + " text")
        _need(m.get("tone", "accent") in TONES, "%s tone must be one of %s" % (where, ", ".join(TONES)))
        for aid, st in m.get("states", {}).items():
            _need(aid in ids, "%s states names %r, not an actor" % (where, aid))
            _need(isinstance(st, str) and 0 < len(st) <= 16, "%s state for %s must be 1-16 characters" % (where, aid))


def _field_value(f, v, where):
    kind = f["kind"]
    if kind == "number":
        _num(v, where)
    elif kind == "mac":
        _need(isinstance(v, str) and MAC.match(v), "%s: %r is not a MAC like 0011.2233.4455" % (where, v))
    elif kind == "ip":
        _ipv4(v, where)
    elif kind == "choice":
        _need(v in [o["value"] for o in f["options"]], "%s: %r is not one of the options" % (where, v))
    elif kind == "bool":
        _need(isinstance(v, bool), "%s must be true or false" % where)


def _compare(spec):
    _keys(spec, "compare", ("type", "title", "fields", "candidates"), ("caption", "prompt", "winner", "places"))
    fields = spec["fields"]
    _need(isinstance(fields, list) and fields, "compare needs fields")
    fids = set()
    for f in fields:
        _keys(f, "field", ("id", "label", "kind", "rule"), ("options", "editable", "ineligible", "onlyIfSame"))
        _need(isinstance(f["id"], str) and ID.match(f["id"]) and f["id"] not in fids, "field id %r must be unique" % f["id"])
        fids.add(f["id"])
        _text(f["label"], "field label")
        _need(f["kind"] in ("number", "mac", "ip", "choice", "bool"), "field %s kind must be number, mac, ip, choice or bool" % f["id"])
        # A "context" field is shown and editable but never compared (BGP's neighbour AS, which only gates MED).
        rules = {"number": ("highest", "lowest"), "mac": ("highest", "lowest"), "ip": ("highest", "lowest"),
                 "choice": ("order",), "bool": ("true", "false")}[f["kind"]] + ("context",)
        _need(f["rule"] in rules, "field %s rule must be %s" % (f["id"], " or ".join(rules)))
        if f["kind"] == "choice":
            opts = f.get("options")
            _need(isinstance(opts, list) and len(opts) >= 2, "field %s needs two or more options, best first" % f["id"])
            for o in opts:
                _keys(o, "option", ("value", "label"))
        else:
            _need("options" not in f, "field %s: options only go with kind choice" % f["id"])
        if "editable" in f:
            _need(isinstance(f["editable"], bool), "field %s editable must be true or false" % f["id"])
        if f["rule"] == "context":
            _need("ineligible" not in f and "onlyIfSame" not in f, "context field %s can't take ineligible or onlyIfSame" % f["id"])
        if "ineligible" in f:
            _field_value(f, f["ineligible"], "field %s ineligible" % f["id"])
    _need(any(f["rule"] != "context" for f in fields), "compare needs at least one field that is compared")
    for f in fields:
        if "onlyIfSame" in f:
            _need(f["onlyIfSame"] in fids and f["onlyIfSame"] != f["id"], "field %s onlyIfSame must name another field" % f["id"])
    cands = spec["candidates"]
    _need(isinstance(cands, list) and len(cands) >= 2, "compare needs two or more candidates")
    for c in cands:
        _keys(c, "candidate", ("label", "values"))
        _text(c["label"], "candidate label")
        _need(set(c["values"]) == fids, "candidate %s must give exactly one value per field" % c["label"])
        for f in fields:
            _field_value(f, c["values"][f["id"]], "%s %s" % (c["label"], f["label"]))
    places = spec.get("places")
    if places is not None:
        _need(isinstance(places, list) and 1 <= len(places) <= len(cands) and all(isinstance(p, str) and p for p in places),
              "places must name 1..candidates places, e.g. [\"DR\", \"BDR\"]")
    if "winner" in spec:
        _text(spec["winner"], "winner")


def _path(spec):
    _keys(spec, "path", ("type", "title", "nodes", "links", "from", "to"), ("caption", "prompt", "zones", "metric"))
    ids, _, _ = _nodes_links(spec, "path")
    _zones(spec, ids)
    _need(spec["from"] in ids and spec["to"] in ids and spec["from"] != spec["to"], "path from/to must be two different nodes")
    if "metric" in spec:
        _text(spec["metric"], "metric")


def _bits(spec):
    _keys(spec, "bits", ("type", "title", "mode", "value"), ("caption", "prompt", "prefix", "showPrefix"))
    mode = spec["mode"]
    _need(mode in ("octet", "dscp", "ipv4"), "bits mode must be octet, dscp or ipv4")
    if mode == "ipv4":
        _ipv4(spec["value"], "bits value")
        if "prefix" in spec:
            _need(isinstance(spec["prefix"], int) and 0 <= spec["prefix"] <= 32, "bits prefix must be 0-32")
        if "showPrefix" in spec:
            _need(isinstance(spec["showPrefix"], bool), "showPrefix must be true or false")
    else:
        top = 255 if mode == "octet" else 63
        _need(isinstance(spec["value"], int) and 0 <= spec["value"] <= top, "bits value must be 0-%d" % top)
        _need("prefix" not in spec and "showPrefix" not in spec, "prefix only goes with mode ipv4")


def _address(text, where):
    t = str(text).strip().lower().split()
    if t == ["any"]:
        return
    if len(t) == 2 and t[0] == "host":
        _ipv4(t[1], where)
        return
    _need(1 <= len(t) <= 2, "%s: %r should be any, host A.B.C.D, or A.B.C.D wildcard" % (where, text))
    for x in t:
        _ipv4(x, where)


PORT = re.compile(r"^(eq|neq|lt|gt) (\d+|[a-z-]+)$|^range (\d+|[a-z-]+) (\d+|[a-z-]+)$")
PORT_NAMES = {"ftp-data", "ftp", "ssh", "telnet", "smtp", "domain", "bootps", "bootpc", "tftp", "www", "pop3",
              "ntp", "snmp", "snmptrap", "bgp", "https", "syslog"}


def _port(text, where):
    m = PORT.match(str(text))
    _need(m, "%s: %r should be eq/neq/lt/gt N or range N M" % (where, text))
    for tok in [g for g in m.groups()[1:] if g]:
        _need(tok.isdigit() and int(tok) <= 65535 or tok in PORT_NAMES, "%s: unknown port %r" % (where, tok))


def _match(spec):
    _keys(spec, "match", ("type", "title", "kind", "rules", "input"), ("caption", "prompt", "name", "tries"))
    kind = spec["kind"]
    _need(kind in ("standard", "extended", "prefix-list"), "match kind must be standard, extended or prefix-list")
    rules = spec["rules"]
    _need(isinstance(rules, list) and rules, "match needs rules")
    for k, r in enumerate(rules, 1):
        where = "rule %d" % k
        if kind == "standard":
            _keys(r, where, ("action", "source"))
            _address(r["source"], where)
        elif kind == "extended":
            _keys(r, where, ("action", "proto", "src", "dst"), ("port",))
            _need(r["proto"] in ("ip", "tcp", "udp", "icmp"), "%s proto must be ip, tcp, udp or icmp" % where)
            _address(r["src"], where + " src")
            _address(r["dst"], where + " dst")
            if "port" in r:
                _need(r["proto"] in ("tcp", "udp"), "%s: only tcp and udp lines take a port" % where)
                _port(r["port"], where)
        else:
            _keys(r, where, ("seq", "action", "prefix"), ("ge", "le"))
            _need(isinstance(r["seq"], int) and r["seq"] > 0, "%s seq must be a positive whole number" % where)
            try:
                net = ipaddress.IPv4Network(r["prefix"])
            except ValueError:
                raise DiagramError("%s prefix %r must be a network like 10.0.0.0/8 with no host bits" % (where, r["prefix"]))
            ge, le = r.get("ge"), r.get("le")
            if ge is not None:
                _need(isinstance(ge, int) and net.prefixlen < ge <= 32, "%s ge must be longer than the prefix and <= 32" % where)
            if le is not None:
                _need(isinstance(le, int) and net.prefixlen < le <= 32 and (ge is None or ge <= le),
                      "%s le must be longer than the prefix, >= ge and <= 32" % where)
        _need(r["action"] in ("permit", "deny"), "%s action must be permit or deny" % where)
    if kind == "prefix-list":
        seqs = [r["seq"] for r in rules]
        _need(seqs == sorted(seqs) and len(set(seqs)) == len(seqs), "prefix-list seqs must be unique and in order")
    inputs = [spec["input"]] + list(spec.get("tries", []))
    for k, t in enumerate(inputs):
        where = "input" if k == 0 else "try %d" % k
        if kind == "prefix-list":
            _need(isinstance(t, str) and re.match(r"^\d+\.\d+\.\d+\.\d+/\d{1,2}$", t), "%s must be a prefix like 10.1.0.0/16" % where)
            ipaddress.IPv4Network(t, strict=False)
        elif kind == "standard":
            _ipv4(t, where)
        else:
            _keys(t, where, ("proto", "src", "dst"), ("port",))
            _need(t["proto"] in ("tcp", "udp", "icmp"), "%s proto must be tcp, udp or icmp" % where)
            _ipv4(t["src"], where + " src")
            _ipv4(t["dst"], where + " dst")
            if t["proto"] in ("tcp", "udp"):
                _need(isinstance(t.get("port"), int) and 0 <= t["port"] <= 65535, "%s needs a port 0-65535" % where)
            else:
                _need("port" not in t, "%s: icmp has no port" % where)


CHECK = {"topology": _topology, "sequence": _sequence, "compare": _compare, "path": _path,
         "bits": _bits, "match": _match}


def _prose(obj, render_inline):
    """Render every prose field, wherever it sits, from markdown to HTML."""
    if isinstance(obj, dict):
        return {k: (render_inline(v) if k in PROSE and isinstance(v, str) else _prose(v, render_inline))
                for k, v in obj.items()}
    if isinstance(obj, list):
        return [_prose(v, render_inline) for v in obj]
    return obj


def prepare(source, render_inline):
    """Parse and check one diagram block. Returns the spec ready for the page, prose as HTML."""
    try:
        spec = json.loads(source)
    except json.JSONDecodeError as e:
        raise DiagramError("not valid JSON (%s)" % e)
    _need(isinstance(spec, dict), "a diagram is one JSON object")
    _need(spec.get("type") in CHECK, "type must be one of %s" % ", ".join(CHECK))
    _text(spec.get("title"), "title")
    try:
        CHECK[spec["type"]](spec)
    except DiagramError as e:
        raise DiagramError("%s (in %r)" % (e, spec["title"]))
    return _prose(spec, render_inline)
