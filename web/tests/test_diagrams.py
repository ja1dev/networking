"""Interactive diagrams: the build-time checks, and how they reach the page."""
import json
import re

import pytest

from app.diagrams import DiagramError, prepare


def spec(**kw):
    base = {"type": "topology", "title": "T",
            "nodes": [{"id": "R1", "x": 0, "y": 0, "info": "**hi**"}, {"id": "R2", "x": 1, "y": 0}],
            "links": [{"a": "R1", "b": "R2"}]}
    base.update(kw)
    return base


def check(s):
    return prepare(json.dumps(s), lambda t: "<b>%s</b>" % t)


def test_prose_fields_become_html_and_plain_ones_stay_text():
    out = check(spec(caption="c"))
    assert out["caption"] == "<b>c</b>"
    assert out["nodes"][0]["info"] == "<b>**hi**</b>"
    assert out["title"] == "T"


@pytest.mark.parametrize("bad, message", [
    (spec(nodes=[{"id": "R 1", "x": 0, "y": 0}]), "use letters"),
    (spec(links=[{"a": "R1", "b": "R9"}]), "doesn't exist"),
    (spec(nodes=[{"id": "R1", "x": 0, "y": 0}, {"id": "R2", "x": 0, "y": 0}]), "on top of"),
    (spec(nodes=[{"id": "R1", "x": 0, "y": 0}, {"id": "R2", "x": 1, "y": 0}]), "info text to click"),
    (spec(links=[{"a": "R1", "b": "R2"}, {"a": "R1", "b": "R2"}]), "each needs an id"),
    (spec(colour="red"), "unknown key"),
    (spec(steps=[{"title": "a", "text": "b"}]), "single step"),
    (spec(steps=[{"title": "a", "text": "b", "links": {"R1-R3": "active"}}, {"title": "c", "text": "d"}]), "isn't a link id"),
    (spec(steps=[{"title": "a", "text": "b", "packets": [{"path": ["R1", "R1"]}]}, {"title": "c", "text": "d"}]), "no single link"),
    (spec(steps=[{"title": "a", "text": "b", "nodes": {"R1": {"badge": "x" * 15}}}, {"title": "c", "text": "d"}]), "1-14"),
    ({"type": "sequence", "title": "S", "actors": [{"id": "A"}, {"id": "B"}],
      "messages": [{"from": "A", "to": "C", "label": "x", "text": "t"}, {"from": "A", "to": "B", "label": "y", "text": "t"}]}, "actor ids"),
    ({"type": "compare", "title": "C", "fields": [{"id": "p", "label": "P", "kind": "number", "rule": "order"}],
      "candidates": [{"label": "a", "values": {"p": 1}}, {"label": "b", "values": {"p": 2}}]}, "rule must be"),
    ({"type": "compare", "title": "C", "fields": [{"id": "m", "label": "M", "kind": "mac", "rule": "lowest"}],
      "candidates": [{"label": "a", "values": {"m": "00:11"}}, {"label": "b", "values": {"m": "0011.2233.4455"}}]}, "not a MAC"),
    ({"type": "path", "title": "P", "from": "R1", "to": "R2", "nodes": [{"id": "R1", "x": 0, "y": 0}, {"id": "R2", "x": 1, "y": 0}],
      "links": [{"a": "R1", "b": "R2"}]}, "needs cost or costs"),
    ({"type": "bits", "title": "B", "mode": "dscp", "value": 64}, "0-63"),
    ({"type": "match", "title": "M", "kind": "prefix-list", "input": "10.0.0.0/8",
      "rules": [{"seq": 5, "action": "permit", "prefix": "10.0.0.0/8", "le": 8}]}, "le must be longer"),
    ({"type": "match", "title": "M", "kind": "prefix-list", "input": "10.0.0.0/8",
      "rules": [{"seq": 5, "action": "permit", "prefix": "10.0.0.1/8"}]}, "no host bits"),
    ({"type": "match", "title": "M", "kind": "extended", "input": {"proto": "tcp", "src": "1.1.1.1", "dst": "2.2.2.2", "port": 80},
      "rules": [{"action": "permit", "proto": "icmp", "src": "any", "dst": "any", "port": "eq 80"}]}, "only tcp and udp"),
    ({"type": "match", "title": "M", "kind": "extended", "input": {"proto": "tcp", "src": "1.1.1.1", "dst": "2.2.2.2", "port": 80},
      "rules": [{"action": "permit", "proto": "udp", "src": "any", "dst": "any", "established": True}]}, "tcp lines only"),
    ({"type": "match", "title": "M", "kind": "standard", "input": "10.0.0.1",
      "rules": [{"seq": 20, "action": "permit", "source": "any"}, {"seq": 10, "action": "deny", "source": "any"}]}, "in order"),
    ({"type": "match", "title": "M", "kind": "standard", "input": "10.0.0.300",
      "rules": [{"action": "permit", "source": "any"}]}, "not an IPv4 address"),
])
def test_mistakes_fail_with_the_problem_named(bad, message):
    with pytest.raises(DiagramError, match=re.escape(message)):
        check(bad)


def test_not_json_is_reported():
    with pytest.raises(DiagramError, match="not valid JSON"):
        prepare("{type: topology}", str)


def test_diagrams_reach_the_page_as_figures(content):
    figures = 0
    for doc in content["docs"].values():
        for page in doc["pages"].values():
            for m in re.finditer(r'<figure class="dg" data-kind="(\w+)"><script type="application/json" class="dg-spec">(.*?)</script>',
                                 page["html"], re.S):
                figures += 1
                data = json.loads(m.group(2).replace("<\\/", "</"))
                assert data["type"] == m.group(1)
                # The spec is data for the script, not words on the page: search never sees it.
                assert '"messages":' not in page["text"] and '"nodes":' not in page["text"]
            assert "```diagram" not in page["html"]
    assert figures == content["stats"]["diagrams"] > 0
