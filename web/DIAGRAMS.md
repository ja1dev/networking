# Writing interactive diagrams

The study guides (`ccna/docs/CCNA_Study_Guide.md`, `ccnp/docs/CCNP_Study_Guide.md`) can hold
interactive diagrams. Each one is a fenced block whose language is `diagram`, holding **one JSON
object**:

````
```diagram
{ "type": "topology", "title": "...", ... }
```
````

`python -m app.build_content` checks every diagram (`app/diagrams.py`) and fails with the
diagram's title and the problem, so a typo stops the Docker build rather than breaking a page.
`node tests/diagrams.test.mjs` then runs each one through its logic: elections must produce a
winner, paths must connect, and ACL tries must parse. The PDF build prints a diagram as a one-line
pointer to the web edition.

Every diagram has a `type` and a `title`, and may have a `caption`. `caption`, `info`, `text` and
`prompt` are **markdown** (`**bold**`, `` `code` ``, *italics*). Every other string is plain text.
Unknown keys are errors.

Use these choices everywhere they apply:

* **Device kinds**: `router`, `switch`, `l3switch`, `firewall`, `host`, `server`, `cloud`,
  `ap`, `wlc`, `controller`, `phone`.
* **Tones**: `accent`, `good`, `bad`, `warn`, `muted`, `purple`.

## Picking a type

| You want the reader to… | type |
|---|---|
| watch a process unfold on a network: elections, convergence, a packet walk, a failover | `topology` with `steps` |
| explore a design by clicking devices and links to read what each does | `topology` without `steps` (some `info` required) |
| follow a conversation between devices: handshakes, state machines, DORA, IKE | `sequence` |
| rig an election and watch the tie-breakers decide: root bridge, DR/BDR, HSRP active, BGP best path, EIGRP successor | `compare` |
| change link costs and see the best path move, including ECMP | `path` |
| flip bits: binary/hex of a byte, an IPv4 address and prefix, DSCP | `bits` |
| test packets against an ACL, or routes against a prefix list | `match` |

## topology

```json
{
  "type": "topology",
  "title": "Root bridge election",
  "caption": "Optional markdown under the title.",
  "nodes": [
    {"id": "SW1", "kind": "switch", "x": 0, "y": 0, "label": "SW1", "sub": "prio 32768", "info": "Markdown shown when clicked."}
  ],
  "links": [
    {"a": "SW1", "b": "SW2", "label": "10.0.0.0/30", "aLabel": "Gi0/1", "bLabel": "Gi0/2", "style": "solid", "info": "..."},
    {"id": "t1", "a": "R1", "b": "R3", "style": "tunnel"}
  ],
  "zones": [{"label": "Area 0", "nodes": ["R1", "R2"], "tone": "accent", "pad": 0}],
  "steps": [
    {"title": "1. Everyone claims to be root",
     "text": "Markdown explaining this moment.",
     "focus": ["SW1", "SW1-SW2"],
     "nodes": {"SW1": {"badge": "Root", "tone": "good", "state": "active"}},
     "links": {"SW2-SW3": "blocked", "t1": "active"},
     "packets": [{"path": ["SW1", "SW2", "SW3"], "label": "BPDU", "tone": "accent", "via": [null, "p2"]}]}
  ]
}
```

* `x`, `y` are **grid units**: one unit is about 120 px across and 110 px down. Fractions are
  fine. Keep diagrams to about 6 units across, so they fit a reading column and a phone. Leave a
  unit between rows so the labels under each device have room.
* Node `id`s are letters, digits, `_` and `.` only. `label` defaults to the id; `sub` is a
  small monospace line under it (an address, a priority, a role).
* Link `style`: `solid` (the default), `dashed`, `tunnel` (a purple arc, for GRE, IPsec, DMVPN,
  VXLAN and LISP), `wireless` or `thick` (a bundle or trunk). `aLabel` and `bLabel` sit near each
  end (interface names); `label` sits mid-link (a subnet, a cost, a speed).
* A step refers to a link by its `id`, or as `"A-B"` (either order) when it is the only link
  between A and B. Parallel links each need an `id`.
* **Steps** (two or more) turn the diagram into a step-through with Back and Next.
  * `nodes` (a `badge` of up to 14 characters, a `tone`, and a `state` of `active`, `down` or
    `dim`) and `links` (`active`, `blocked`, `down` or `dim`) **carry forward** to later steps
    until changed; `null` clears them.
  * `focus` and `packets` belong to one step only. Focus dims everything else.
  * A packet's `path` must follow links. When two nodes have more than one link between them,
    name the link per hop in `via`, using `null` for hops that have only one link.
  * Packet labels are up to 24 characters.
* Without steps, give `info` to the devices and links worth clicking.

## sequence

```json
{
  "type": "sequence",
  "title": "DHCP: Discover, Offer, Request, Ack",
  "actors": [{"id": "PC", "kind": "host", "label": "PC"}, {"id": "SRV", "kind": "server", "label": "DHCP server"}],
  "messages": [
    {"from": "PC", "to": "SRV", "label": "DISCOVER", "detail": "0.0.0.0 → 255.255.255.255", "text": "Markdown for this step.", "states": {"PC": "SELECTING"}},
    {"note": "Server checks its pool", "over": ["SRV"], "text": "..."},
    {"from": "SRV", "to": "PC", "label": "OFFER", "dashed": true, "tone": "good", "text": "..."},
    {"from": "PC", "to": "SRV", "label": "REQUEST", "drop": true, "tone": "bad", "text": "A lost message ends in an ✕."}
  ]
}
```

* There are 2 to 6 actors. Each message is one step. `label` is up to 40 characters, `detail`
  up to 48, and both are plain text.
* `states` (up to 16 characters each) show as a chip under each actor and carry forward. Use
  them for state machines: OSPF neighbor states, the BGP FSM, the STP port states, TCP.
* `from` equal to `to` draws a self-message (a timer expiring, a local decision).

## compare

```json
{
  "type": "compare",
  "title": "Who becomes DR and BDR?",
  "prompt": "Markdown telling the reader what to try.",
  "places": ["DR", "BDR"],
  "fields": [
    {"id": "prio", "label": "Interface priority", "kind": "number", "rule": "highest", "ineligible": 0},
    {"id": "rid", "label": "Router ID", "kind": "ip", "rule": "highest"}
  ],
  "candidates": [
    {"label": "R1", "values": {"prio": 1, "rid": "1.1.1.1"}},
    {"label": "R2", "values": {"prio": 1, "rid": "2.2.2.2"}}
  ]
}
```

* `fields` are the tie-breakers **in the order the protocol applies them**.
  * `kind`: `number`, `mac` (`0011.2233.4455`), `ip`, `choice` (with `options`
    `[{"value","label"}]`, best first) or `bool`.
  * `rule`: `highest` or `lowest` for numbers, MACs and IPs; `order` for choice; `true` or
    `false` (which value wins) for bool. `context` means the field is shown and editable but never
    compared.
  * `ineligible`: a value that removes a candidate before the comparison (OSPF priority 0).
  * `onlyIfSame`: compare this field only when every remaining candidate shares the named field's
    value (BGP MED only between paths from the same neighbor AS, using a `context` field for the
    neighbor AS).
  * `editable: false` makes a field read-only.
* `places` names successive winners, each run again without the earlier ones. Without it, give
  `winner` (for example "Root bridge" or "Best path").
* The starting values must produce a single winner.

## path

```json
{
  "type": "path",
  "title": "OSPF picks the lowest total cost",
  "prompt": "...",
  "metric": "Cost",
  "from": "R1", "to": "R5",
  "nodes": [{"id": "R1", "x": 0, "y": 1}],
  "links": [{"a": "R1", "b": "R2", "cost": 10, "label": "1G"}, {"a": "R2", "b": "R3", "costs": [10, 50]}]
}
```

* Every link has `cost` (both ways) or `costs` (`[a-to-b, b-to-a]`, for one-way metrics). The
  reader can edit each one unless the link says `editable: false`.
* The reader picks the two endpoints. Equal-cost paths all light up.

## bits

```json
{"type": "bits", "mode": "ipv4", "value": "172.16.45.200", "prefix": 20, "title": "...", "prompt": "..."}
```

* `mode` is `octet` (a value from 0 to 255: binary, decimal and hex), `dscp` (0 to 63: name, IP
  precedence and ToS byte) or `ipv4` (an address).
* For `ipv4`, a `prefix` slider shows the network and host bits, mask, wildcard, network,
  broadcast and host range. `"showPrefix": false` shows the address bits only.

## match

```json
{
  "type": "match", "kind": "standard", "name": "10", "title": "...", "prompt": "...",
  "rules": [{"action": "deny", "source": "host 10.1.1.5"}, {"action": "permit", "source": "10.1.1.0 0.0.0.255"}],
  "input": "10.1.1.77",
  "tries": ["10.1.1.5", "10.2.0.1"]
}
```

* `kind: "standard"`: each rule has a `source` of `any`, `host A.B.C.D`, `A.B.C.D W.W.W.W` or a
  bare address. Inputs and tries are addresses.
* `kind: "extended"`: each rule has a `proto` (`ip`, `tcp`, `udp` or `icmp`), `src`, `dst` and
  an optional `port`. The port is `eq` / `neq` / `lt` / `gt N` or `range N M`, written as a number
  or as an IOS name such as `www`, `domain` or `ssh`. Inputs and tries are
  `{"proto", "src", "dst", "port"}`, with no port for icmp.
* `kind: "prefix-list"`: each rule has a `seq`, an `action`, a `prefix` (no host bits) and an
  optional `ge` and `le`, following IOS's rule that the length is less than `ge`, which is at most
  `le`, which is at most 32. Inputs and tries are prefixes such as `10.1.0.0/16`.
* `tries` become one-click buttons. Pick them to show each line matching and the implicit deny.
