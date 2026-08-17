# 📝 CCNA Practice Question Bank
### 100+ Exam-Style Questions with Answers & Full Explanations

> **How to use it:** Try each question BEFORE reading the answer. The explanation tells you *why* the right answer is right AND why the traps are wrong — that's what builds real understanding. Aim to consistently score **85%+** before your exam. Questions are grouped by the 6 official exam domains.

---

# Domain 1 — Network Fundamentals

---

**Q1.** Which device operates primarily at Layer 2 of the OSI model?

A. Router  B. Switch  C. Firewall  D. Load balancer

<details><summary>Answer</summary>

**B. Switch.** A switch forwards frames using MAC addresses, which is Layer 2 (Data Link). A router works at Layer 3 (IP addresses). *Trap:* firewalls and load balancers can work at higher layers.
</details>

---

**Q2.** What is the correct order of TCP's three-way handshake?

A. ACK, SYN, SYN-ACK  B. SYN, ACK, SYN-ACK  C. SYN, SYN-ACK, ACK  D. SYN-ACK, SYN, ACK

<details><summary>Answer</summary>

**C. SYN, SYN-ACK, ACK.** The initiator sends SYN, the receiver replies SYN-ACK, the initiator finishes with ACK. Memorize this order — it's tested a lot.
</details>

---

**Q3.** Which protocol is connectionless and does NOT guarantee delivery?

A. TCP  B. UDP  C. HTTP  D. FTP

<details><summary>Answer</summary>

**B. UDP.** UDP is fast, connectionless, and doesn't confirm delivery — good for voice/video/DNS. TCP is the reliable, connection-oriented one.
</details>

---

**Q4.** What is the data unit at Layer 3 called?

A. Frame  B. Segment  C. Packet  D. Bit

<details><summary>Answer</summary>

**C. Packet.** Layer 4 = segment, **Layer 3 = packet**, Layer 2 = frame, Layer 1 = bits. Memory trick: "Some People Fear Birthdays."
</details>

---

**Q5.** Which port number does HTTPS use?

A. 80  B. 21  C. 443  D. 22

<details><summary>Answer</summary>

**C. 443.** HTTPS = 443 (secure web). HTTP = 80, FTP = 21, SSH = 22.
</details>

---

**Q6.** A host has IP `169.254.10.5`. What most likely happened?

A. It got an address from DHCP  B. It was assigned a public IP  C. It could not reach a DHCP server (APIPA)  D. It is using a loopback

<details><summary>Answer</summary>

**C. APIPA.** The 169.254.x.x range is auto-assigned when a device can't reach a DHCP server. It's a big clue that DHCP is broken or unreachable.
</details>

---

**Q7.** Which cable type connects two switches together (without Auto-MDIX)?

A. Straight-through  B. Crossover  C. Rollover  D. Fiber only

<details><summary>Answer</summary>

**B. Crossover.** Similar devices (switch-switch, PC-PC, router-router) need a **crossover** cable. Different devices use straight-through. Rollover is for console access.
</details>

---

**Q8.** How many bits are in an IPv6 address?

A. 32  B. 48  C. 64  D. 128

<details><summary>Answer</summary>

**D. 128 bits.** IPv4 = 32 bits, MAC = 48 bits, **IPv6 = 128 bits**, written as 8 groups of 4 hex digits.
</details>

---

**Q9.** Which of the following is a private IPv4 address?

A. 8.8.8.8  B. 172.32.0.1  C. 192.168.5.20  D. 200.1.1.1

<details><summary>Answer</summary>

**C. 192.168.5.20.** Private ranges: 10.0.0.0/8, 172.16–31.0.0, 192.168.0.0/16. Note 172.**32** is OUTSIDE the private range (only 16–31), so B is a trap.
</details>

---

**Q10.** What does the Transport layer use to identify which application traffic belongs to?

A. MAC addresses  B. IP addresses  C. Port numbers  D. VLAN tags

<details><summary>Answer</summary>

**C. Port numbers.** Ports (like 80, 443, 22) identify the app/service. IP finds the host; the port finds the app on that host.
</details>

---

**Q11.** Which IPv6 address type replaces the IPv4 broadcast?

A. Anycast  B. Multicast  C. Unicast  D. Loopback

<details><summary>Answer</summary>

**B. Multicast.** IPv6 has **no broadcast** — it uses multicast to reach groups. Classic exam fact.
</details>

---

**Q12.** Convert binary `10101100` to decimal.

A. 172  B. 168  C. 160  D. 174

<details><summary>Answer</summary>

**A. 172.** 128 + 32 + 8 + 4 = 172. (Bits on: 128, 32, 8, 4.)
</details>

---

**Q13.** Which layer of the TCP/IP model maps to OSI Layers 5, 6, and 7?

A. Transport  B. Internet  C. Application  D. Network Access

<details><summary>Answer</summary>

**C. Application.** The TCP/IP Application layer combines OSI Session, Presentation, and Application.
</details>

---

**Q14.** What is the broadcast MAC address?

A. 00:00:00:00:00:00  B. FF:FF:FF:FF:FF:FF  C. 01:00:5E:00:00:01  D. FE80::1

<details><summary>Answer</summary>

**B. FF:FF:FF:FF:FF:FF.** All F's = broadcast (everyone listens). D is an IPv6 link-local, not a MAC.
</details>

---

**Q15.** A fiber run must go 10 km between buildings. Which media is appropriate?

A. Cat6 copper  B. Multimode fiber  C. Single-mode fiber  D. Coaxial

<details><summary>Answer</summary>

**C. Single-mode fiber.** Single-mode (tiny core, laser) goes many kilometers. Multimode is for shorter in-building runs; copper maxes ~100 m.
</details>

---

# Domain 2 — Network Access (Switching, VLANs, Wireless)

---

**Q16.** What does a switch do when it receives a frame with an unknown destination MAC?

A. Drops it  B. Floods it out all ports except the incoming one  C. Sends it to the default gateway  D. Buffers it forever

<details><summary>Answer</summary>

**B. Floods it out all other ports.** This is "unknown unicast flooding." Once the destination replies, the switch learns its port and stops flooding.
</details>

---

**Q17.** Which command puts switch port Fa0/1 into VLAN 10?

A. `vlan 10`  B. `switchport access vlan 10`  C. `switchport trunk vlan 10`  D. `ip vlan 10`

<details><summary>Answer</summary>

**B. `switchport access vlan 10`** (entered under `interface fa0/1`). You'd also set `switchport mode access`.
</details>

---

**Q18.** Which standard is used to tag frames on a trunk link?

A. 802.11  B. 802.1Q  C. 802.3  D. 802.1X

<details><summary>Answer</summary>

**B. 802.1Q.** "Dot1Q" inserts a 4-byte VLAN tag. 802.11 = Wi-Fi, 802.3 = Ethernet, 802.1X = port authentication.
</details>

---

**Q19.** On an 802.1Q trunk, which VLAN's traffic is sent untagged by default?

A. VLAN 0  B. VLAN 1 (native)  C. VLAN 1000  D. All VLANs

<details><summary>Answer</summary>

**B. VLAN 1 (the native VLAN).** Native VLAN traffic crosses the trunk untagged. Both switches must agree on the native VLAN.
</details>

---

**Q20.** What is the purpose of Spanning Tree Protocol?

A. Speed up routing  B. Prevent Layer 2 loops  C. Assign IP addresses  D. Encrypt traffic

<details><summary>Answer</summary>

**B. Prevent Layer 2 loops.** STP blocks redundant paths so broadcasts don't circle forever (broadcast storms), while keeping a backup ready.
</details>

---

**Q21.** In STP, how is the root bridge chosen?

A. Highest IP address  B. Lowest bridge ID (priority + MAC)  C. Fastest port  D. Most connections

<details><summary>Answer</summary>

**B. Lowest bridge ID.** Bridge ID = priority + MAC. Lowest priority wins; if tied, lowest MAC wins.
</details>

---

**Q22.** Which feature lets a switch port skip STP's listening/learning states for end devices?

A. BPDU Guard  B. PortFast  C. EtherChannel  D. Root Guard

<details><summary>Answer</summary>

**B. PortFast.** It moves an access port straight to forwarding. Use only on ports connected to end devices, never switch-to-switch.
</details>

---

**Q23.** What happens by default when a port-security violation occurs?

A. Port logs only  B. Port drops traffic silently  C. Port shuts down (err-disabled)  D. Port reboots

<details><summary>Answer</summary>

**C. Port shuts down.** Default violation mode is **shutdown** (err-disabled). Other modes: protect (silent drop) and restrict (drop + log).
</details>

---

**Q24.** Which LACP mode combination will successfully form an EtherChannel?

A. passive/passive  B. active/passive  C. auto/auto  D. on/active

<details><summary>Answer</summary>

**B. active/passive.** LACP needs at least one side active. passive/passive fails (both wait). on/active mismatches protocols (on = no negotiation).
</details>

---

**Q25.** Which two channels do NOT overlap on the 2.4 GHz band (pick the standard set)?

A. 1, 2, 3  B. 1, 5, 9  C. 1, 6, 11  D. 2, 7, 12

<details><summary>Answer</summary>

**C. 1, 6, 11.** These are the non-overlapping 2.4 GHz channels — using them avoids interference.
</details>

---

**Q26.** Which wireless security standard is the most secure?

A. WEP  B. WPA  C. WPA2  D. WPA3

<details><summary>Answer</summary>

**D. WPA3.** Newest and strongest. WEP is broken, WPA is weak, WPA2 is good, WPA3 is best.
</details>

---

**Q27.** In a lightweight wireless architecture, what protocol do APs use to talk to the WLC?

A. CDP  B. CAPWAP  C. LLDP  D. GRE

<details><summary>Answer</summary>

**B. CAPWAP.** Lightweight APs tunnel to the Wireless LAN Controller using CAPWAP for control and (optionally) data.
</details>

---

**Q28.** Router-on-a-stick uses what to route between VLANs on one physical link?

A. Loopbacks  B. Subinterfaces  C. SVIs  D. Trunk ACLs

<details><summary>Answer</summary>

**B. Subinterfaces.** The router creates one subinterface per VLAN, each with `encapsulation dot1q <vlan>` and an IP that acts as the gateway.
</details>

---

**Q29.** Which command shows which VLAN each access port belongs to?

A. `show mac address-table`  B. `show vlan brief`  C. `show ip route`  D. `show cdp neighbors`

<details><summary>Answer</summary>

**B. `show vlan brief`.** It lists VLANs and their assigned ports. Great first check for VLAN misconfigurations.
</details>

---

**Q30.** What is the default native VLAN, and why change it?

A. VLAN 0; performance  B. VLAN 1; security (avoid VLAN hopping)  C. VLAN 99; redundancy  D. VLAN 4094; naming

<details><summary>Answer</summary>

**B. VLAN 1; for security.** Changing the native VLAN away from the default helps prevent double-tagging VLAN-hopping attacks.
</details>

---

# Domain 3 — IP Connectivity (Routing & OSPF)

---

**Q31.** In the routing table, what does the letter `O` mean?

A. A static route  B. A connected route  C. An OSPF-learned route  D. An offline route

<details><summary>Answer</summary>

**C. OSPF-learned.** C = connected, S = static, O = OSPF, D = EIGRP, R = RIP, B = BGP.
</details>

---

**Q32.** A router has two routes to the same network: one via OSPF, one static. Which is used?

A. OSPF (AD 110)  B. Static (AD 1)  C. Both load-balance  D. Neither

<details><summary>Answer</summary>

**B. Static (AD 1).** Lower administrative distance wins. Static (1) beats OSPF (110). Connected (0) beats everything.
</details>

---

**Q33.** Which administrative distance does a directly connected route have?

A. 0  B. 1  C. 90  D. 110

<details><summary>Answer</summary>

**A. 0.** Connected = 0 (most trusted). Static = 1, EIGRP = 90, OSPF = 110, RIP = 120.
</details>

---

**Q34.** What does a router do with a packet if no matching route exists and there is no default route?

A. Floods it  B. Sends to gateway of last resort  C. Drops it  D. Buffers it

<details><summary>Answer</summary>

**C. Drops it.** No route + no default = the packet is discarded (often with an ICMP unreachable). A default route (0.0.0.0/0) would catch it.
</details>

---

**Q35.** Which command creates a default route toward next hop 203.0.113.1?

A. `ip route 0.0.0.0 0.0.0.0 203.0.113.1`  B. `ip default 203.0.113.1`  C. `ip route default 203.0.113.1`  D. `default-gateway 203.0.113.1`

<details><summary>Answer</summary>

**A. `ip route 0.0.0.0 0.0.0.0 203.0.113.1`.** 0.0.0.0/0 matches everything not otherwise known. (`ip default-gateway` is only for a switch/host, not routing.)
</details>

---

**Q36.** When two routes to the same destination have different prefix lengths, the router chooses the one that is:

A. Learned first  B. Most specific (longest prefix)  C. From the lowest AD  D. Load-balanced

<details><summary>Answer</summary>

**B. Longest prefix match.** A /24 beats a /16 for a matching destination — the more specific route wins, regardless of AD (AD only breaks ties for the *same* prefix).
</details>

---

**Q37.** What metric does OSPF use to choose the best path?

A. Hop count  B. Bandwidth-based cost  C. Delay  D. Ticks

<details><summary>Answer</summary>

**B. Cost (based on bandwidth).** Cost = reference bandwidth ÷ link bandwidth. Faster links = lower cost = preferred. (RIP uses hop count.)
</details>

---

**Q38.** Two OSPF routers won't become neighbors. Which mismatch could be the cause?

A. Different hostnames  B. Different interface descriptions  C. Different area or subnet  D. Different clock time

<details><summary>Answer</summary>

**C. Different area or subnet.** Neighbors must match area, subnet, hello/dead timers, authentication, and MTU. Hostnames/descriptions don't matter.
</details>

---

**Q39.** In OSPF, what must the backbone area always be?

A. Area 1  B. Area 10  C. Area 0  D. Area 255

<details><summary>Answer</summary>

**C. Area 0.** The backbone is always Area 0; all other areas connect to it.
</details>

---

**Q40.** What is a wildcard mask of `0.0.0.255` equivalent to matching?

A. A single host  B. A whole /24 network  C. Everything  D. A /16 network

<details><summary>Answer</summary>

**B. A whole /24.** Wildcards are the inverse of subnet masks. 0 = must match, 255 = anything. 0.0.0.255 matches all hosts in one /24.
</details>

---

**Q41.** Which command correctly advertises 10.1.1.0/24 into OSPF area 0?

A. `network 10.1.1.0 255.255.255.0 area 0`  B. `network 10.1.1.0 0.0.0.255 area 0`  C. `network 10.1.1.0 area 0`  D. `advertise 10.1.1.0/24`

<details><summary>Answer</summary>

**B. `network 10.1.1.0 0.0.0.255 area 0`.** OSPF uses a **wildcard** mask, not a subnet mask, in the network statement.
</details>

---

**Q42.** How does OSPF pick its Router ID if not set manually?

A. Lowest interface IP  B. Highest loopback, else highest active physical IP  C. The MAC address  D. Randomly

<details><summary>Answer</summary>

**B. Highest loopback, otherwise highest active physical interface IP.** Best practice is to set `router-id` manually for predictability.
</details>

---

**Q43.** A floating static route is created by:

A. Lowering its metric  B. Giving it a higher administrative distance than the primary  C. Adding a wildcard mask  D. Using a /32

<details><summary>Answer</summary>

**B. Higher AD.** A backup ("floating") static route has a higher AD so it's only installed if the primary route disappears.
</details>

---

**Q44.** Which routing protocol type builds a full map of the network and runs SPF?

A. Distance vector  B. Link state  C. Path vector  D. Static

<details><summary>Answer</summary>

**B. Link state.** OSPF (link state) builds an LSDB and runs Dijkstra/SPF. RIP is distance vector; BGP is path vector.
</details>

---

**Q45.** What is the OSPF cost of a 100 Mbps link using the default reference bandwidth?

A. 1  B. 10  C. 19  D. 100

<details><summary>Answer</summary>

**A. 1.** Default reference is 100 Mbps, so a 100 Mbps link = 100/100 = **1**. (10 Mbps = 10.) Note: STP cost for 100 Mbps is 19 — don't confuse them!
</details>

---

# Domain 4 — IP Services (DHCP, DNS, NAT, NTP, SNMP)

---

**Q46.** What is the correct order of the DHCP process?

A. Offer, Discover, Request, Ack  B. Discover, Offer, Request, Ack  C. Request, Offer, Discover, Ack  D. Discover, Request, Offer, Ack

<details><summary>Answer</summary>

**B. Discover, Offer, Request, Ack (DORA).** Client discovers, server offers, client requests, server acknowledges.
</details>

---

**Q47.** Which service translates domain names into IP addresses?

A. DHCP  B. DNS  C. NAT  D. NTP

<details><summary>Answer</summary>

**B. DNS.** DNS is the internet's phone book — name to IP. DHCP hands out addresses, NAT translates addresses, NTP syncs time.
</details>

---

**Q48.** Your home router lets 20 devices share one public IP. What technology is this?

A. Static NAT  B. Dynamic NAT  C. PAT (NAT overload)  D. Proxy ARP

<details><summary>Answer</summary>

**C. PAT / NAT overload.** Many private hosts share ONE public IP, distinguished by port numbers. This is what home routers do.
</details>

---

**Q49.** DHCP clients are on a different subnet than the DHCP server. What must you configure on the router?

A. `ip default-gateway`  B. `ip helper-address <server>`  C. `ip nat inside`  D. `ip route`

<details><summary>Answer</summary>

**B. `ip helper-address`.** It relays the DHCP broadcast to the server across subnets (since routers don't forward broadcasts).
</details>

---

**Q50.** Which port does DNS primarily use?

A. 53  B. 67  C. 80  D. 123

<details><summary>Answer</summary>

**A. 53.** DNS = 53 (UDP mostly, TCP for big transfers). 67/68 = DHCP, 80 = HTTP, 123 = NTP.
</details>

---

**Q51.** Which DNS record maps a name to an IPv6 address?

A. A  B. AAAA  C. CNAME  D. MX

<details><summary>Answer</summary>

**B. AAAA.** A = IPv4, **AAAA = IPv6**, CNAME = alias, MX = mail server.
</details>

---

**Q52.** Why is NTP important on network devices?

A. Faster routing  B. Accurate timestamps for logs and certificates  C. More bandwidth  D. Encryption

<details><summary>Answer</summary>

**B. Accurate time.** Logs, security certs, and troubleshooting all depend on synchronized clocks. NTP keeps them aligned.
</details>

---

**Q53.** Which SNMP version adds encryption and authentication?

A. SNMPv1  B. SNMPv2c  C. SNMPv3  D. SNMPv2

<details><summary>Answer</summary>

**C. SNMPv3.** It adds authentication and encryption. v1 and v2c send community strings in clear text — avoid for security.
</details>

---

**Q54.** In NAT terminology, the private address of a host BEFORE translation is the:

A. Inside local  B. Inside global  C. Outside local  D. Outside global

<details><summary>Answer</summary>

**A. Inside local.** Inside local = private (before), inside global = public (after). Outside terms refer to the remote host.
</details>

---

**Q55.** A syslog message at severity level 0 means:

A. Debugging  B. Informational  C. Emergency (system unusable)  D. Warning

<details><summary>Answer</summary>

**C. Emergency.** Level 0 = Emergency (most severe). Level 7 = Debug (least). Remember: lower number = more urgent.
</details>

---

# Domain 5 — Security Fundamentals

---

**Q56.** Which part of the CIA triad ensures data isn't secretly altered?

A. Confidentiality  B. Integrity  C. Availability  D. Authentication

<details><summary>Answer</summary>

**B. Integrity.** Confidentiality = secrecy, **Integrity = data stays correct/unaltered**, Availability = it's up when needed.
</details>

---

**Q57.** Which attack fills a switch's MAC table to force flooding?

A. VLAN hopping  B. MAC flooding  C. DHCP starvation  D. ARP spoofing

<details><summary>Answer</summary>

**B. MAC flooding.** It overflows the CAM table so the switch floods frames (attacker can sniff). Defense: **port security**.
</details>

---

**Q58.** Which feature stops a rogue DHCP server on an untrusted port?

A. BPDU Guard  B. DHCP snooping  C. Port-security  D. DAI

<details><summary>Answer</summary>

**B. DHCP snooping.** It marks trusted ports (toward the real server) and blocks DHCP offers from untrusted ports.
</details>

---

**Q59.** Which protocol should replace Telnet for remote device management?

A. FTP  B. HTTP  C. SSH  D. SNMPv1

<details><summary>Answer</summary>

**C. SSH.** SSH (port 22) encrypts the session. Telnet (23) is clear text — never use it in production.
</details>

---

**Q60.** In AAA, what does the second "A" (Authorization) determine?

A. Who you are  B. What you're allowed to do  C. What you did  D. Where you are

<details><summary>Answer</summary>

**B. What you're allowed to do.** Authentication = who you are, Authorization = what you can do, Accounting = what you did.
</details>

---

**Q61.** Which AAA protocol encrypts the entire packet and uses TCP?

A. RADIUS  B. TACACS+  C. Kerberos  D. LDAP

<details><summary>Answer</summary>

**B. TACACS+.** Cisco's TACACS+ uses TCP and encrypts the whole packet — great for device admin. RADIUS uses UDP and encrypts only the password.
</details>

---

**Q62.** In 802.1X, what role does the switch play?

A. Supplicant  B. Authenticator  C. Authentication server  D. Client

<details><summary>Answer</summary>

**B. Authenticator.** The switch/AP is the "bouncer." The device is the supplicant; RADIUS is the authentication server.
</details>

---

**Q63.** Which command encrypts plain-text passwords in the running config?

A. `enable secret`  B. `service password-encryption`  C. `crypto key generate rsa`  D. `password-encrypt on`

<details><summary>Answer</summary>

**B. `service password-encryption`.** It scrambles clear-text passwords (like console/line) in the config. `enable secret` is separately hashed already.
</details>

---

**Q64.** Which defense protects against ARP spoofing (man-in-the-middle)?

A. Port-security  B. Dynamic ARP Inspection (DAI)  C. BPDU Guard  D. STP

<details><summary>Answer</summary>

**B. Dynamic ARP Inspection.** DAI validates ARP packets against the DHCP snooping database, blocking forged ARP replies.
</details>

---

**Q65.** A site-to-site VPN between two offices typically uses:

A. SSL only  B. IPsec  C. Telnet  D. GRE only

<details><summary>Answer</summary>

**B. IPsec.** Site-to-site VPNs use IPsec to encrypt traffic between office routers across the public internet.
</details>

---

# Domain 5b — Access Control Lists (ACLs)

---

**Q66.** What is at the end of every ACL, even if not typed?

A. permit any  B. an implicit deny all  C. a log entry  D. nothing

<details><summary>Answer</summary>

**B. Implicit deny all.** Anything not explicitly permitted is denied. Forgetting a `permit` can block everything.
</details>

---

**Q67.** A standard ACL filters based on what?

A. Source and destination IP  B. Source IP only  C. Port numbers  D. MAC addresses

<details><summary>Answer</summary>

**B. Source IP only.** Standard ACLs (1–99) match source only. Extended ACLs (100–199) match source, destination, protocol, and port.
</details>

---

**Q68.** Where should a standard ACL be placed?

A. Close to the source  B. Close to the destination  C. On every interface  D. On the trunk

<details><summary>Answer</summary>

**B. Close to the destination.** Because it only sees source IP, placing it far from the destination could block traffic you meant to allow. (Extended ACLs go close to the source.)
</details>

---

**Q69.** In ACL processing, which rule wins?

A. The last match  B. The first match  C. The most specific  D. The lowest number

<details><summary>Answer</summary>

**B. The first match.** ACLs are read top-to-bottom; the first matching line is applied and the rest are skipped. Order matters!
</details>

---

**Q70.** Which statement permits only host 192.168.1.10?

A. `permit 192.168.1.10 0.0.0.255`  B. `permit host 192.168.1.10`  C. `permit any`  D. `permit 192.168.1.0 0.0.0.0`

<details><summary>Answer</summary>

**B. `permit host 192.168.1.10`** (same as `permit 192.168.1.10 0.0.0.0`). Wildcard 0.0.0.0 means an exact match on that one host.
</details>

---

# Domain 6 — Automation & Programmability

---

**Q71.** In SDN, which plane makes forwarding decisions?

A. Data plane  B. Control plane  C. Management plane  D. Physical plane

<details><summary>Answer</summary>

**B. Control plane.** The control plane is the "brain" (decides paths); the data plane is the "muscle" (forwards packets). SDN centralizes the control plane.
</details>

---

**Q72.** A northbound API on a controller communicates with:

A. Switches  B. Routers  C. Applications/scripts  D. The data plane

<details><summary>Answer</summary>

**C. Applications/scripts (upward).** Northbound = to apps/humans (REST). Southbound = down to devices (NETCONF/OpenFlow).
</details>

---

**Q73.** Which HTTP method is used to RETRIEVE data from a REST API?

A. POST  B. GET  C. PUT  D. DELETE

<details><summary>Answer</summary>

**B. GET.** GET reads, POST creates, PUT updates/replaces, DELETE removes.
</details>

---

**Q74.** Which data format uses curly braces and key/value pairs and is most common in REST APIs?

A. XML  B. YAML  C. JSON  D. CSV

<details><summary>Answer</summary>

**C. JSON.** JSON uses { } with "key": value. YAML uses indentation; XML uses tags.
</details>

---

**Q75.** Which automation tool is agentless and uses YAML playbooks?

A. Puppet  B. Chef  C. Ansible  D. SaltStack

<details><summary>Answer</summary>

**C. Ansible.** Agentless (nothing installed on devices), uses easy YAML playbooks. Puppet and Chef use agents.
</details>

---

**Q76.** What is the main benefit of network automation?

A. More cables  B. Consistent, fast, error-free configuration at scale  C. Slower changes  D. Replacing all routers

<details><summary>Answer</summary>

**B. Consistent, fast, error-free configuration at scale.** Automation removes repetitive manual typos and enforces one consistent config across many devices.
</details>

---

**Q77.** Cisco DNA Center is an example of:

A. A router  B. An SDN controller  C. A firewall  D. A switch OS

<details><summary>Answer</summary>

**B. An SDN controller.** DNA Center centrally manages, automates, and monitors the network (intent-based networking).
</details>

---

# Domain 7 — Configuration & Troubleshooting Scenarios

---

**Q78.** After configuring an interface, `show ip interface brief` shows "administratively down." What fixes it?

A. `no shutdown`  B. `ip address`  C. Reboot  D. `enable`

<details><summary>Answer</summary>

**A. `no shutdown`.** "Administratively down" means the port is manually disabled. `no shutdown` on the interface enables it.
</details>

---

**Q79.** You can ping 8.8.8.8 but not google.com. What's broken?

A. Routing  B. DNS  C. NAT  D. The cable

<details><summary>Answer</summary>

**B. DNS.** IP connectivity works (ping by IP succeeds), but name resolution fails — a DNS server problem.
</details>

---

**Q80.** Two switches won't form a trunk. Which is a likely cause?

A. Different hostnames  B. Native VLAN or mode mismatch  C. Different IOS versions  D. Different port numbers

<details><summary>Answer</summary>

**B. Native VLAN / mode mismatch.** Mismatched native VLANs or trunk modes (e.g., access vs trunk) stop trunking and can raise errors.
</details>

---

**Q81.** A PC gets 169.254.x.x. What should you check first?

A. DNS server  B. DHCP reachability (server/relay/VLAN)  C. The default route  D. STP

<details><summary>Answer</summary>

**B. DHCP reachability.** APIPA means the client couldn't reach a DHCP server — check the server, the `ip helper-address`, and the VLAN/port.
</details>

---

**Q82.** A link is slow with many errors. One side is full-duplex, the other half. This is a:

A. Speed mismatch  B. Duplex mismatch  C. VLAN mismatch  D. MTU mismatch

<details><summary>Answer</summary>

**B. Duplex mismatch.** Mismatched duplex causes collisions/late collisions and slowness. Set both ends the same (or both to auto).
</details>

---

**Q83.** Which command shows the path packets take and where they stop?

A. `ping`  B. `traceroute`  C. `show ip route`  D. `show cdp neighbors`

<details><summary>Answer</summary>

**B. `traceroute`.** It reveals each hop along the path, helping you find where connectivity breaks.
</details>

---

**Q84.** A port-security-enabled port is err-disabled after a violation. How do you recover it?

A. `no shutdown` only  B. `shutdown` then `no shutdown`  C. Reload  D. Delete the VLAN

<details><summary>Answer</summary>

**B. `shutdown` then `no shutdown`.** You must bounce the interface (and clear the cause) to bring an err-disabled port back.
</details>

---

**Q85.** Which command shows OSPF neighbors and their states?

A. `show ip ospf neighbor`  B. `show ip route`  C. `show running-config`  D. `show ip protocols`

<details><summary>Answer</summary>

**A. `show ip ospf neighbor`.** It lists neighbors and states (e.g., FULL). Great for diagnosing why routers aren't exchanging routes.
</details>

---

**Q86.** A host's gateway is 192.168.1.65 /26, and the host is 192.168.1.130 /26. Why no internet?

A. Wrong DNS  B. Host and gateway are in different subnets  C. Bad cable  D. STP blocking

<details><summary>Answer</summary>

**B. Different subnets.** .65 is in subnet .64–.127; .130 is in subnet .128–.191. The host can't use a gateway outside its own subnet.
</details>

---

**Q87.** Which command saves the running configuration so it survives a reboot?

A. `write erase`  B. `copy running-config startup-config`  C. `reload`  D. `show startup-config`

<details><summary>Answer</summary>

**B. `copy running-config startup-config`** (or `write memory`). Running-config lives in RAM and is lost on reboot unless saved.
</details>

---

**Q88.** `show cdp neighbors detail` is most useful for:

A. Seeing routing tables  B. Discovering a neighbor's IP and platform  C. Checking VLANs  D. Viewing ACLs

<details><summary>Answer</summary>

**B. Neighbor IP/platform.** CDP reveals directly connected Cisco device details (name, port, model, IP) — handy for mapping.
</details>

---

**Q89.** A switch's MAC address table is empty for a device that's clearly connected and powered. What's a likely reason?

A. The device hasn't sent any frames yet  B. STP is off  C. Wrong IOS  D. NAT is disabled

<details><summary>Answer</summary>

**A. It hasn't sent frames yet.** Switches learn MACs from **source** addresses of incoming frames. A silent device won't be learned until it transmits.
</details>

---

**Q90.** Which show command quickly confirms an interface is "up/up" with its IP?

A. `show vlan brief`  B. `show ip interface brief`  C. `show mac address-table`  D. `show version`

<details><summary>Answer</summary>

**B. `show ip interface brief`.** It lists interfaces, IPs, and status/protocol (up/up). Fast Layer 1/2 sanity check.
</details>

---

# Domain 8 — More Fundamentals & Mixed Review

---

**Q91.** How many usable hosts are in a /27 subnet?

A. 32  B. 30  C. 62  D. 14

<details><summary>Answer</summary>

**B. 30.** Host bits = 5, 2^5 − 2 = 30.
</details>

---

**Q92.** Which address is the broadcast for 192.168.1.0/26's second subnet?

A. 192.168.1.63  B. 192.168.1.127  C. 192.168.1.128  D. 192.168.1.191

<details><summary>Answer</summary>

**B. 192.168.1.127.** Block size 64: subnets .0, .64, .128, .192. Second subnet = .64–.127, so broadcast = **.127**.
</details>

---

**Q93.** Which IPv6 address is a link-local address?

A. 2001:db8::1  B. FE80::1  C. ::1  D. FF02::1

<details><summary>Answer</summary>

**B. FE80::1.** Link-local addresses start with FE80::/10. ::1 is loopback; FF02:: is multicast; 2001:: is global unicast.
</details>

---

**Q94.** What does `::` mean in an IPv6 address?

A. End of address  B. One or more groups of all zeros (used once)  C. A separator only  D. A loopback

<details><summary>Answer</summary>

**B. A run of all-zero groups, collapsed once.** You may use `::` only a single time per address to avoid ambiguity.
</details>

---

**Q95.** Which protocol automatically lets an IPv6 host build its own address from the router's prefix?

A. DHCPv4  B. SLAAC  C. ARP  D. NAT

<details><summary>Answer</summary>

**B. SLAAC.** Stateless Address Autoconfiguration lets a host form its own IPv6 address using the advertised prefix — no DHCP needed.
</details>

---

**Q96.** Which of these is a Layer 1 problem?

A. Wrong VLAN  B. Unplugged/broken cable  C. Missing default route  D. ACL blocking

<details><summary>Answer</summary>

**B. Broken cable.** Physical media issues (cables, connectors, no link light) are Layer 1. VLANs are L2, routing/ACLs are L3+.
</details>

---

**Q97.** What is the purpose of a default gateway on a host?

A. Resolve names  B. Reach devices on other networks  C. Assign IPs  D. Encrypt traffic

<details><summary>Answer</summary>

**B. Reach other networks.** The gateway (router interface) forwards traffic destined for outside the local subnet.
</details>

---

**Q98.** Which command tests basic connectivity to an IP?

A. `ping`  B. `show run`  C. `configure terminal`  D. `copy`

<details><summary>Answer</summary>

**A. `ping`.** It sends ICMP echo requests. `!!!!!` = success, `.....` = no reply.
</details>

---

**Q99.** A trunk carries VLANs 10 and 20, but VLAN 20 traffic isn't passing while VLAN 10 works. What's a likely cause?

A. Wrong hostname  B. VLAN 20 not allowed on the trunk  C. Duplex mismatch  D. Wrong DNS

<details><summary>Answer</summary>

**B. VLAN 20 not in the allowed list.** Check `switchport trunk allowed vlan` — VLAN 20 may be pruned/omitted. Also confirm VLAN 20 exists on both switches.
</details>

---

**Q100.** Which two are valid reasons to use VLANs? (Choose the best single answer.)

A. Faster CPUs  B. Segment broadcast domains and improve security  C. Replace routers  D. Increase cable length

<details><summary>Answer</summary>

**B. Segment broadcast domains and improve security.** VLANs shrink broadcast domains and isolate groups (e.g., students vs admin). Routing between them still needs a router/L3 switch.
</details>

---

**Q101.** Which is TRUE about a /30 subnet?

A. It has 4 usable hosts  B. It has 2 usable hosts, ideal for router links  C. It's used for large LANs  D. It has no broadcast

<details><summary>Answer</summary>

**B. 2 usable hosts, ideal for point-to-point router links.** /30 = 4 addresses total, minus network and broadcast = 2 usable.
</details>

---

**Q102.** In the frame, which field detects transmission errors?

A. Preamble  B. Source MAC  C. FCS (Frame Check Sequence)  D. Type

<details><summary>Answer</summary>

**C. FCS.** The Frame Check Sequence at the end validates the frame's integrity; a bad FCS means the frame is discarded.
</details>

---

**Q103.** Which command sets a device to only allow SSH (not Telnet) for remote logins?

A. `transport input ssh`  B. `transport input all`  C. `no ip telnet`  D. `login local`

<details><summary>Answer</summary>

**A. `transport input ssh`** (under `line vty`). It restricts remote access to SSH only, blocking insecure Telnet.
</details>

---

**Q104.** What best describes "longest prefix match"?

A. Trusting the lowest AD  B. Choosing the most specific matching route  C. Load balancing  D. Picking the oldest route

<details><summary>Answer</summary>

**B. Most specific matching route.** Among matching routes, the one with the longest prefix (e.g., /24 over /16) is used to forward the packet.
</details>

---

**Q105.** You need 6 subnets from a /24, each with room for ~25 hosts. Which mask fits BOTH needs?

A. /26  B. /27  C. /28  D. /25

<details><summary>Answer</summary>

**B. /27.** /27 gives 8 subnets (≥6) and 30 hosts each (≥25). /26 gives only 4 subnets (too few); /28 gives 14 hosts (too few).
</details>

---

## 🎯 How to Use These Results

- **Score yourself by domain.** If you miss several in one domain (say OSPF or ACLs), go back to that chapter in the main guide and re-drill.
- **Re-take after a few days.** Spacing your practice helps memory stick.
- **Target 85%+ consistently** before booking the exam.
- **Pair with labs.** Reading answers isn't enough — configure these things in Packet Tracer to make them permanent.

Good luck — you're building real skills now! 🚀

*— End of Practice Question Bank —*