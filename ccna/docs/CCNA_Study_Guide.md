# 🌐 The Super Friendly CCNA Study Guide
### Learn Networking Like You're 12 — But Go Really, Really Deep

> **What is this?** This is a big, friendly book that teaches you everything you need to pass the **CCNA** exam (Cisco Certified Network Associate, exam code **200-301**). It explains hard computer stuff in easy words, with lots of pictures made out of text, real examples, and step-by-step commands you can practice.

> **How to use it:** Read it top to bottom the first time. Don't skip the "Story Time" and "Try It" boxes — that's where the learning sticks. Later, use the Table of Contents to jump around and review.

> **About the 🔬 depth sections:** some sections go deeper than the CCNA exam
strictly requires — the mechanism underneath, not just the behaviour. They're
marked, so you can skip them on a tight timeline and come back later. They're
also where CCNP begins; **Appendix B** maps them onto what comes next.

> **This guide is one of five:** the **Study Guide** (this book) teaches the concepts, the **Practice Question Bank** tests them with 152 exam-style questions grouped by domain, the **Subnetting Drill Sheet** builds the one skill you need to be *fast* at, the **Flashcard Deck** (208 cards, for Anki or Quizlet) drills the facts into instant recall, and the **Lab Workbook** (17 hands-on labs for EVE-NG/GNS3) turns what you read into what you can type. Read a chapter here, then answer that domain's questions and build its lab — the appendix at the back maps every official exam topic to the section that covers it.

---

## 📖 Table of Contents

1. [What Is a Network? (The Big Picture)](#chapter-1)
2. [How Computers Talk: Models & Layers](#chapter-2)
3. [The Physical Stuff: Cables, Signals & Ports](#chapter-3)
4. [Numbers Computers Use: Binary & Hex](#chapter-4)
5. [MAC Addresses & Ethernet](#chapter-5)
6. [Switches: The Traffic Cops of the LAN](#chapter-6)
7. [VLANs: Splitting One Switch Into Many](#chapter-7)
8. [Trunks, VTP & Inter-VLAN Routing](#chapter-8)
9. [Spanning Tree Protocol (STP): Stopping Loops](#chapter-9)
10. [EtherChannel: Bundling Cables](#chapter-10)
11. [IP Addresses: The Home Address of Every Device](#chapter-11)
12. [Subnetting: Cutting the Network Cake](#chapter-12)
13. [IPv6: The New, Giant Address System](#chapter-13)
14. [Routers & Routing: Finding the Path](#chapter-14)
15. [Static Routing](#chapter-15)
16. [Dynamic Routing & OSPF](#chapter-16)
17. [DHCP, DNS, NAT & Other Helpers](#chapter-17)
18. [Network Security Basics](#chapter-18)
19. [Access Control Lists (ACLs)](#chapter-19)
20. [Wireless Networking (Wi‑Fi)](#chapter-20)
21. [Network Management & Monitoring](#chapter-21)
22. [Automation & Programmability](#chapter-22)
23. [Troubleshooting Toolbox](#chapter-23)
24. [Exam Tips & Study Plan](#chapter-24)
25. [Glossary](#glossary)
26. [Appendix: Exam Blueprint Coverage Map](#blueprint)
27. [Appendix B: Beyond CCNA — The Road to CCNP](#beyond)

---

<a name="chapter-1"></a>
# Chapter 1: What Is a Network? (The Big Picture)

## 1.1 The Simple Idea

A **network** is just **two or more devices connected so they can share stuff**. That "stuff" can be messages, pictures, videos, games, or files.

Think about talking to your friend with two paper cups and a string:

**You** hold one cup and talk into it; your **friend** holds the other and
listens. The **string** stretched between them carries the sound.

- The **cups** are like your computers (they turn your voice into something the string can carry, and back again).
- The **string** is like the **cable** or **Wi‑Fi** that carries the message.
- Your **voice** is the **data**.

A computer network is the same idea, just with way more cups, way more strings, and super fast messages.

**📝 Exam-style questions — 1.1**

**Q1.** Which statement best describes a computer network?

- **A.** Two or more devices connected so they can share data and resources
- **B.** Any single device that has been given an IP address
- **C.** A group of computers that must all be connected to the internet
- **D.** The cables and switches installed inside one building

<details><summary>Answer</summary>

**Answer: A.** A network is simply two or more devices joined so they can share stuff: messages, files, printers, video. Two laptops on one cable already count. **Why not the others:** one device with an address (B) has nobody to talk to, so it isn't a network on its own. A network doesn't need the internet at all (C); a lab with no internet link is still a network. D describes some of the hardware of one kind of network (a LAN), but networks can be wireless and can span the planet, and cables with nothing sharing over them aren't the point.
</details>

**Q2.** In the paper-cups-and-string story, what does the **string** stand for in a real network?

- **A.** The data being sent
- **B.** The end devices that turn a message into signals
- **C.** The transmission medium, such as a cable or a Wi‑Fi radio channel
- **D.** The rules both sides agree on for taking turns

<details><summary>Answer</summary>

**Answer: C.** The string carries the sound between the cups, which is exactly what a cable or a radio channel does for bits: it's the **medium**. **Why not the others:** your voice is the data (A), not the string. The cups are the devices (B) that turn the message into something the string can carry. Turn-taking rules (D) are what networking calls **protocols**; they're agreements between the talkers, not the thing the signal travels along.
</details>

## 1.2 Why Do We Even Need Networks?

Before networks, if you wanted a file from another computer, you had to copy it to a floppy disk and walk it over. People jokingly called this **"sneakernet"** (because you used your sneakers to walk!). Networks let us:

- **Share files** (documents, photos).
- **Share devices** (one printer for the whole office).
- **Talk** (email, video calls, chat).
- **Reach the internet** (the biggest network of all).

**📝 Exam-style questions — 1.2**

**Q1.** A small office has six PCs and one laser printer. Today, staff copy files to USB sticks and walk them to the PC that has the printer attached. Which two benefits would a network bring this office? (Choose two.)

- **A.** Every PC could print to the one shared printer.
- **B.** Files could move between PCs without anyone carrying storage around.
- **C.** Each PC's processor would run faster.
- **D.** The office would no longer need to back up its files.
- **E.** The PCs would no longer need any security software.

<details><summary>Answer</summary>

**Answer: A, B.** Sharing devices (one printer for everyone) and sharing files are two of the core reasons networks exist. **Why not the others:** a network doesn't speed up a PC's own processor (C); it connects machines, it doesn't upgrade them. Backups (D) are still needed; a network just makes them easier to centralise. And connecting machines makes security *more* important (E), not less, because now other devices can reach them.
</details>

**Q2.** What does the term **sneakernet** describe?

- **A.** Moving data by physically carrying storage media from one computer to another
- **B.** A wireless network built for mobile devices
- **C.** A peer-to-peer network with no central server
- **D.** An early Ethernet standard that ran over coaxial cable

<details><summary>Answer</summary>

**Answer: A.** Sneakernet is the joke name for "copy it to a disk and walk it over", because your sneakers are the transport. It's the problem networks solved. **Why not the others:** it has nothing to do with radio (B). Peer-to-peer (C) is a real network model where devices share directly over a network. Coaxial Ethernet (D) was a real wired standard, but it's a network, the very opposite of carrying disks around.
</details>

## 1.3 Types of Networks (by Size)

| Name | Stands For | Size | Everyday Example |
|------|------------|------|------------------|
| **PAN** | Personal Area Network | Tiny (a few feet) | Your phone connected to wireless earbuds |
| **LAN** | Local Area Network | One building or home | Your school's computer lab |
| **WLAN** | Wireless LAN | One building, no wires | Wi‑Fi at a coffee shop |
| **CAN** | Campus Area Network | A few nearby buildings | A university campus |
| **MAN** | Metropolitan Area Network | A whole city | A city's traffic camera network |
| **WAN** | Wide Area Network | Country or worldwide | The **Internet** itself |

**Story Time 📖:** Imagine your house is a **LAN**. Your whole neighborhood connected together is like a **MAN**. All the neighborhoods, cities, and countries connected is the **WAN** (the Internet). Each is just a bigger circle around the last one.

**Why do we bother naming networks by size?** It's not just trivia — the size changes *everything about how you build it*:

- **Who owns the wires?** In a **LAN**, *you* own all the cables and switches, so bandwidth is basically free and huge (1–10 Gbps is normal). In a **WAN**, you cross land you don't own, so you **rent** the connection from a provider (an ISP), it costs money every month, and it's usually much slower than your LAN. *That's why the LAN/WAN line matters: one side is "free and fast," the other is "paid and slower."*
- **Distance changes the technology.** Short distances can use cheap copper cable. Long distances need fiber or leased provider links. So knowing the scale tells you which media and devices you'll even be allowed to use.
- **Who fixes it?** In a LAN, your team fixes problems. In a WAN, you often have to call the provider. Different scale = different responsibility.

| Type | Reaches | Example |
|------|---------|---------|
| **PAN** (Personal) | A few metres — around one person | Phone ↔ earbuds |
| **LAN** (Local) | One building or site | An office, school or home |
| **MAN** (Metropolitan) | A city | A university's campuses linked across town |
| **WAN** (Wide) | Countries, the globe | The internet itself |

Each one **contains** the smaller: your PAN sits inside a LAN, which reaches the world through a WAN.

**📝 Exam-style questions — 1.3**

**Q1.** A retailer links its head office in Chicago to a warehouse in Dallas using a connection it rents from a service provider. Which type of network is this link part of?

- **A.** LAN
- **B.** CAN
- **C.** MAN
- **D.** WAN

<details><summary>Answer</summary>

**Answer: D.** Chicago to Dallas crosses states, over land the company doesn't own, on a leased provider link. That's a **WAN**. **Why not the others:** a LAN (A) covers one building or site that you own. A CAN (B) joins a few buildings close together, such as a campus. A MAN (C) covers one city; two cities a thousand kilometres apart are well past that.
</details>

**Q2.** Which statement correctly describes a key difference between a LAN and a WAN?

- **A.** A LAN is usually owned by the organization and gives high bandwidth at no monthly cost, while WAN links are usually leased from a provider and cost money every month.
- **B.** A LAN always uses wireless, while a WAN always uses cables.
- **C.** WAN links are usually faster than LAN links, because WANs use fiber.
- **D.** A LAN connects several cities, while a WAN stays inside one building.

<details><summary>Answer</summary>

**Answer: A.** Ownership is the big divide: in a LAN you own the cables and switches, so bandwidth is cheap and plentiful (1–10 Gbps is normal). A WAN crosses land you don't own, so you rent it, pay monthly, and usually get less speed for more money. **Why not the others:** LANs are mostly wired (B), and WANs can use radio, satellite or cellular. WAN links are usually *slower* than the LAN (C), and LANs use fiber too. D swaps the two definitions.
</details>

**Q3.** A user's smartwatch syncs with her phone over Bluetooth, and the phone is connected to the office Wi‑Fi. Which two network types are in use? (Choose two.)

- **A.** PAN
- **B.** WLAN
- **C.** MAN
- **D.** CAN
- **E.** WAN

<details><summary>Answer</summary>

**Answer: A, B.** Watch to phone over a few centimetres is a **PAN** (personal area network). Phone to office Wi‑Fi is a **WLAN** (a wireless LAN). **Why not the others:** nothing here spans a city (C), a group of campus buildings (D) or a country (E). The office may well reach the internet over a WAN, but the two links described are the PAN and the WLAN.
</details>

## 1.4 The Main Network Devices (Meet the Characters)

```diagram
{
  "type": "topology",
  "title": "A small office network: every device in its role",
  "caption": "Click any device or link to read what it does and **why** it's there.",
  "nodes": [
    {
      "id": "INET",
      "kind": "cloud",
      "x": 5,
      "y": 0,
      "label": "Internet",
      "info": "The **WAN**: networks you don't own, reached over a link you rent from an ISP. Everything beyond the router is someone else's network."
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 3.1,
      "y": 0,
      "label": "Router",
      "sub": "R1",
      "info": "The **router** joins two different networks: the office LAN and the ISP. It picks paths using **IP addresses** and does **not** forward broadcasts, so the office's broadcast chatter stays inside the office."
    },
    {
      "id": "FW",
      "kind": "firewall",
      "x": 1.5,
      "y": 0,
      "label": "Firewall",
      "info": "The **security guard at the door**. It allows or blocks traffic between the internet and the LAN according to rules, such as \"replies to our own requests may come in; nothing else may\"."
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 1.5,
      "y": 1.4,
      "label": "Switch",
      "sub": "SW1",
      "info": "The **switch** connects every wired device in the office. It learns which **MAC address** lives on which port and sends each frame only where it needs to go. It's the local mail sorter, so it moves traffic **within** the LAN."
    },
    {
      "id": "SRV",
      "kind": "server",
      "x": 0,
      "y": 1.4,
      "label": "Server",
      "sub": "192.168.1.10",
      "info": "A **server** waits for requests and provides a service: shared files, a printer queue, an internal website. The PCs are its **clients**."
    },
    {
      "id": "AP",
      "kind": "ap",
      "x": 3.3,
      "y": 1.4,
      "label": "Access point",
      "info": "The **access point** lets wireless devices join the wired LAN. It's powered over its one network cable (**PoE**, section 3.7), which is why it can hang on a ceiling with no power outlet nearby."
    },
    {
      "id": "PCA",
      "kind": "host",
      "x": 0,
      "y": 2.8,
      "label": "PC-A",
      "sub": "192.168.1.21",
      "info": "A **client**: it asks for services (web pages, files) rather than providing them."
    },
    {
      "id": "PCB",
      "kind": "host",
      "x": 1.1,
      "y": 2.8,
      "label": "PC-B",
      "sub": "192.168.1.22",
      "info": "Another client. PC-A and PC-B talk to each other through the switch only; the router never sees that traffic, because it stays inside one network."
    },
    {
      "id": "PHONE",
      "kind": "phone",
      "x": 2.2,
      "y": 2.8,
      "label": "IP phone",
      "info": "An **IP phone** is just another network device. Like the AP, it usually gets its power from the switch port."
    },
    {
      "id": "LAP",
      "kind": "host",
      "x": 3.9,
      "y": 2.8,
      "label": "Laptop",
      "sub": "Wi-Fi",
      "info": "A wireless client. Its traffic reaches the AP over radio, and from there it travels on the wired LAN like everyone else's."
    }
  ],
  "links": [
    {
      "a": "R1",
      "b": "INET",
      "label": "rented WAN link",
      "info": "The line between **your** network and the provider's. This side is \"free and fast\"; that side is \"paid and slower\"."
    },
    {
      "a": "FW",
      "b": "R1"
    },
    {
      "a": "FW",
      "b": "SW1"
    },
    {
      "a": "SW1",
      "b": "SRV"
    },
    {
      "a": "SW1",
      "b": "PCA"
    },
    {
      "a": "SW1",
      "b": "PCB"
    },
    {
      "a": "SW1",
      "b": "PHONE",
      "label": "PoE"
    },
    {
      "a": "SW1",
      "b": "AP",
      "label": "PoE",
      "info": "One cable carries both data and power to the access point."
    },
    {
      "a": "AP",
      "b": "LAP",
      "style": "wireless"
    }
  ]
}
```

You will meet these devices over and over. Let's introduce them like characters in a story.

| Device | Job (Simple) | Job (Real) |
|--------|--------------|------------|
| **Hub** 🕸️ | The loudspeaker that shouts to everyone | Repeats signals to all ports (dumb, old) |
| **Switch** 🚦 | The smart mail sorter inside a building | Sends data only to the right device using MAC addresses |
| **Router** 🗺️ | The GPS that connects different cities | Connects different networks and picks paths using IP addresses |
| **Access Point (AP)** 📡 | The Wi‑Fi broadcaster | Lets wireless devices join the wired network |
| **Firewall** 🛡️ | The security guard at the door | Allows or blocks traffic based on rules |
| **Server** 🗄️ | The helper that stores/serves things | Provides files, websites, email, etc. |
| **Client** 💻 | The person asking for things | Your laptop or phone that requests services |

**Key difference to remember:**
- A **switch** connects devices **inside the same network** (a LAN).
- A **router** connects **different networks together** (LAN to LAN, or LAN to the Internet).

**But WHY do we even need two different devices? Why not connect the whole world with switches?** This is one of the most important "why"s in all of networking, so let's really get it:

A switch **floods broadcasts to everyone** (remember, that's its job). If the *entire internet* were one giant switched network, then every "who has this address?" broadcast from every device on Earth would be sent to **every other device on Earth**. The whole internet would instantly drown in broadcast traffic and collapse. It literally could not work. 🌍💥

Routers solve this because **routers do NOT forward broadcasts**. A router breaks the world into separate networks and only passes along the specific traffic that needs to cross between them. So:

- **Switches** keep a *local* group fast and simple (but can't scale to the world).
- **Routers** create *boundaries* so networks stay a manageable size, and provide the smart "which way do I send this?" decisions needed to reach far-away networks.

*That's the real reason the two devices exist: switches for speed inside a small area, routers for scale and boundaries between areas.* You'll see this theme (switch = local, router = between networks) over and over.

Picture two separate LANs. In **LAN A**, a handful of PCs plug into a switch;
in **LAN B**, the same. Each switch then has one uplink to a **shared router**.

The switches move traffic **within** their own LAN. The router is the only
device joining the two — every packet crossing from A to B passes through it.

> **Coming up:** these devices don't get scattered randomly — section **1.7** shows the standard shapes networks are built in, and section **3.7** explains how many of them get their electricity from the network cable itself.

**📝 Exam-style questions — 1.4**

**Q1.** Which device forwards traffic inside a LAN by reading the destination **MAC address** and sending each frame only out the port where that device lives?

- **A.** Hub
- **B.** Switch
- **C.** Router
- **D.** Firewall

<details><summary>Answer</summary>

**Answer: B.** A switch learns which MAC address sits behind which port and forwards each frame only where it needs to go. **Why not the others:** a hub (A) understands no addresses at all; it repeats every signal out every port. A router (C) forwards between networks using **IP** addresses, not MAC addresses. A firewall (D) permits or blocks traffic by security rules; its job is filtering, not local delivery.
</details>

**Q2.** Why can't the whole internet be built as one giant switched network with no routers?

- **A.** Switches flood broadcasts to every port, so every broadcast from every device would reach every other device on Earth.
- **B.** Switches can only learn the MAC addresses of devices on one port.
- **C.** Switches cannot use fiber, so they cannot reach other countries.
- **D.** Switches can forward frames between at most 48 ports.

<details><summary>Answer</summary>

**Answer: A.** A switch's job includes flooding broadcasts. In one world-sized switched network, billions of devices' broadcasts would hit every device, and the network would drown. Routers don't forward broadcasts, so they split the world into manageable networks. **Why not the others:** a switch learns MACs on all of its ports (B). Switches use fiber all the time (C). Port count (D) isn't the limit: you can connect switches to switches; the broadcasts are the problem.
</details>

**Q3.** Which two statements about routers are true? (Choose two.)

- **A.** A router connects different networks and chooses paths using IP addresses.
- **B.** A router does not forward broadcasts by default, so each of its interfaces is a separate broadcast domain.
- **C.** A router floods a frame with an unknown destination out all of its ports.
- **D.** A router repeats every electrical signal it receives out every other port.
- **E.** A router's main job is to let wireless devices join the wired network.

<details><summary>Answer</summary>

**Answer: A, B.** Routers join networks together, decide the path with IP addresses, and act as the boundary that broadcasts don't cross. **Why not the others:** flooding unknown destinations (C) is what a *switch* does. Repeating every signal (D) is a *hub*. Letting wireless clients onto the wired network (E) is an *access point's* job (your home box may combine both, but they're separate roles).
</details>

**Q4.** An office wants a device between its network and the internet that inspects traffic and blocks anything its security policy doesn't allow. Which device is designed for this job?

- **A.** Access point
- **B.** Switch
- **C.** Firewall
- **D.** Server

<details><summary>Answer</summary>

**Answer: C.** A firewall is the security guard at the door: it allows or blocks traffic according to rules. **Why not the others:** an access point (A) connects wireless clients. A switch (B) delivers frames inside the LAN. A server (D) *provides* services such as files and websites; it's one of the things a firewall protects, not the guard itself.
</details>

## 1.5 Clients, Servers & Peers

- **Client-Server model:** One computer (the **server**) waits and gives out services; other computers (**clients**) ask for them. Example: A web **server** holds YouTube's videos; your phone is the **client** asking to watch.
- **Peer-to-Peer (P2P):** Every computer is both a client AND a server at the same time. Example: Sharing files directly between two laptops.

**Why pick one over the other?** Each shines in a different situation:

- **Client-Server** gives you **one place to control everything** — one server to secure, back up, and update. That's *why* businesses use it: if all the company files live on one server, you protect and back up that one machine instead of 500 laptops. The downside is *why* it can be risky too: if that one server dies, **everyone** loses the service (a "single point of failure").
- **Peer-to-Peer** needs **no central server**, so it's cheap and easy for small setups (two laptops sharing a folder) — *that's why* home file-sharing and some video-call apps use it. The downside is it's hard to secure and manage once you have many devices, because there's no single place in charge.

*The lesson: "should this be client-server or P2P?" is really a question of control and reliability vs. simplicity and cost.*

**📝 Exam-style questions — 1.5**

**Q1.** A company keeps every shared document on one file server that is backed up each night. What is the main weakness of this client-server design?

- **A.** The file server is a single point of failure: if it goes down, nobody can reach the files.
- **B.** The documents are harder to back up than if they were spread across every laptop.
- **C.** Every client must also act as a server for the others.
- **D.** There is no single place to apply security to the files.

<details><summary>Answer</summary>

**Answer: A.** Putting everything in one place makes it easy to control, and that's also the risk: lose the server and everyone loses the service. **Why not the others:** client-server makes backups *easier* (B), because you back up one machine instead of hundreds. Every device acting as both client and server (C) describes peer-to-peer. And one central server is exactly the single place to apply security (D).
</details>

**Q2.** Which statement describes a peer-to-peer network?

- **A.** One dedicated server answers requests and the other computers only ask.
- **B.** Each computer can act as both a client and a server at the same time.
- **C.** All traffic must pass through a router before reaching another computer.
- **D.** A central server must approve every computer before it can share files.

<details><summary>Answer</summary>

**Answer: B.** In peer-to-peer, every device is an equal: it can request things and serve them, such as two laptops sharing folders with each other. **Why not the others:** A and D describe the client-server model, which has a central machine in charge. C is about routing between networks; two peers on the same LAN talk directly through a switch with no router involved.
</details>

**Q3.** Two freelancers share a small studio with no IT staff and want to swap files between their two laptops as cheaply as possible. Which model fits, and why?

- **A.** Client-server, because a dedicated server is the only way to share files
- **B.** Peer-to-peer, because it needs no central server and is simple for a couple of devices
- **C.** Client-server, because it is cheaper than peer-to-peer for two devices
- **D.** Peer-to-peer, because it is the easiest model to secure and manage once there are hundreds of devices

<details><summary>Answer</summary>

**Answer: B.** For two laptops, peer-to-peer is cheap and simple: no server to buy, no one to run it. **Why not the others:** peers can share files directly, so a server isn't required (A). Buying and running a server is *more* expensive than sharing directly (C). D gets peer-to-peer's weakness backwards: with many devices and no central control, P2P becomes *hard* to secure and manage.
</details>

## 1.6 How Data Moves: Packets

Big messages are **cut into small pieces** called **packets** before traveling. Why? Because small pieces are easier to send, and if one gets lost you only resend that little piece — not the whole thing.

**Story Time 📖:** Imagine mailing a giant puzzle. Instead of one huge box (heavy, easy to lose everything), you send each puzzle piece in its own envelope. Each envelope has the **address** (where it's going) and a **number** (so the puzzle can be rebuilt in order). If envelope #7 gets lost, you only resend #7.

**Let's go deeper — WHY is chopping data into packets so clever?** There are three big reasons, and they explain how the whole internet manages to work:

1. **Sharing the road (this is the big one).** If one computer sent its *entire* huge file as one unbroken stream, it would **hog the wire** and everyone else would have to wait. By cutting files into packets, many computers can **take turns** sending packets on the same wire — their packets interleave, so everyone makes progress at once. It's like taking turns talking instead of one person giving a two-hour speech. *This idea is called "packet switching," and it's why the internet can serve billions of people over shared lines.*
2. **Cheap error recovery.** If a packet gets damaged or lost, you only re-send that *one small packet*, not the whole file. Re-sending piece #7 is cheap; re-sending a 4 GB movie because one bit flipped would be awful.
3. **Flexible paths.** Different packets can even take **different routes** to the destination and be reassembled at the end. If one path gets congested or breaks, later packets can go another way. *This is why the internet is so resilient — there's no single fragile path.*

A big file doesn't travel as one lump. It's chopped into numbered **packets** —
P1, P2, P3, P4 — and each one carries four things:

| Every packet carries | Why it's needed |
|----------------------|-----------------|
| **TO** address | So the network knows where to deliver it |
| **FROM** address | So the far end knows who to reply to |
| **ORDER number** | So the pieces can be reassembled in sequence |
| **DATA** | The actual slice of your file |

They travel independently — possibly by different routes — and are rebuilt at the other end.

Step through a file crossing a small network below, including a link failing halfway through:

```diagram
{
  "type": "topology",
  "title": "Packet switching: pieces travel on their own",
  "caption": "PC-A sends a file to the server as four numbered packets. Press **Next**.",
  "nodes": [
    {
      "id": "PCA",
      "kind": "host",
      "x": 0,
      "y": 1,
      "label": "PC-A"
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 1.3,
      "y": 1
    },
    {
      "id": "R2",
      "kind": "router",
      "x": 2.6,
      "y": 0
    },
    {
      "id": "R3",
      "kind": "router",
      "x": 2.6,
      "y": 2
    },
    {
      "id": "R4",
      "kind": "router",
      "x": 3.9,
      "y": 1
    },
    {
      "id": "SRV",
      "kind": "server",
      "x": 5.1,
      "y": 1,
      "label": "Web server"
    }
  ],
  "links": [
    {
      "a": "PCA",
      "b": "R1"
    },
    {
      "a": "R1",
      "b": "R2"
    },
    {
      "a": "R1",
      "b": "R3"
    },
    {
      "a": "R2",
      "b": "R4"
    },
    {
      "a": "R3",
      "b": "R4"
    },
    {
      "a": "R4",
      "b": "SRV"
    }
  ],
  "steps": [
    {
      "title": "1. The file is cut into numbered packets",
      "text": "PC-A chops the file into **P1 to P4**. Each one carries the **TO** address (the server), the **FROM** address (PC-A), its **order number**, and a slice of the data. Because each packet is self-contained, each can be handled on its own.",
      "focus": [
        "PCA"
      ],
      "nodes": {
        "PCA": {
          "badge": "P1-P4 ready",
          "tone": "accent"
        }
      }
    },
    {
      "title": "2. P1 takes the best path, through R2",
      "text": "No packet carries its whole route. Each router looks at the destination as the packet arrives and picks the next hop. Right now R1's best way to the server is through R2. Other computers' packets are sharing these same links, taking turns with ours: that's **packet switching**.",
      "nodes": {
        "PCA": null
      },
      "packets": [
        {
          "path": [
            "PCA",
            "R1",
            "R2",
            "R4",
            "SRV"
          ],
          "label": "P1"
        }
      ]
    },
    {
      "title": "3. The R2-R4 link fails with P2 on it",
      "text": "P2 was heading the same way when the link between R2 and R4 died. P2 is lost. Only **one small packet** is lost, not the whole file.",
      "links": {
        "R2-R4": "down"
      },
      "nodes": {
        "SRV": {
          "badge": "has P1",
          "tone": "accent"
        }
      },
      "packets": [
        {
          "path": [
            "PCA",
            "R1",
            "R2"
          ],
          "label": "P2 (lost)",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "4. The routers find another way",
      "text": "The routers learn the link is down and R1 now sends toward the server through **R3**. P3 goes the new way. There's no single fragile path, which is why the internet keeps working when links fail.",
      "nodes": {
        "SRV": {
          "badge": "P1, P3"
        }
      },
      "packets": [
        {
          "path": [
            "PCA",
            "R1",
            "R3",
            "R4",
            "SRV"
          ],
          "label": "P3"
        }
      ]
    },
    {
      "title": "5. Only P2 is resent, and the file is rebuilt",
      "text": "The sender learns P2 never arrived (TCP's job, section 2.7) and resends just that piece, then sends P4. P3 arrived before P2, but the **order numbers** let the server put everything back in sequence. Cheap recovery, flexible paths, a shared road: the three wins of packets.",
      "nodes": {
        "SRV": {
          "badge": "rebuilt",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PCA",
            "R1",
            "R3",
            "R4",
            "SRV"
          ],
          "label": "P2 resent, then P4",
          "tone": "good"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 1.6**

**Q1.** What is the main reason that cutting data into packets lets many computers share one link efficiently?

- **A.** Packets from different computers take turns on the link, so no single transfer hogs it.
- **B.** Each packet gets its own dedicated circuit for the whole journey.
- **C.** Packets are never lost, so no resending is ever needed.
- **D.** Packets are bigger than the original file, so fewer of them are needed.

<details><summary>Answer</summary>

**Answer: A.** That's **packet switching**: small pieces from many senders interleave on the same wire, so everyone makes progress at once. **Why not the others:** a dedicated circuit for the whole journey (B) is the old telephone model, the opposite of packet switching. Packets *can* be lost (C); the win is that you only resend the small lost piece. And packets are pieces of the file (D), so each is smaller than the whole.
</details>

**Q2.** A 4 GB file is being sent as packets, and one packet is corrupted on the way. With packet-based delivery, what has to be sent again?

- **A.** The whole 4 GB file, from the beginning
- **B.** Only the data that was in the damaged packet
- **C.** Nothing: the receiver rebuilds the missing piece from the packets around it
- **D.** Every packet that travelled the same route as the damaged one

<details><summary>Answer</summary>

**Answer: B.** Only the piece that went wrong is resent. That's the cheap error recovery packets give you. **Why not the others:** resending the whole file (A) is exactly what chopping it up avoids. The receiver can't invent missing data from its neighbours (C); the bytes really are gone. And the route a packet took (D) has nothing to do with which data needs resending; other packets on that route arrived fine.
</details>

**Q3.** Packets can arrive at the destination by different routes and out of order. Which two pieces of information in each packet let the network deliver it and let the receiver rebuild the original data? (Choose two.)

- **A.** The destination address
- **B.** A list of every router the packet must pass through
- **C.** An ordering (sequence) number
- **D.** The total number of hops to the destination
- **E.** A copy of the previous packet's data

<details><summary>Answer</summary>

**Answer: A, C.** The **destination address** tells every device along the way where the packet is going, and the **order number** lets the receiver put the pieces back in sequence no matter how they arrived. **Why not the others:** packets don't carry their whole route (B); each router decides the next hop as the packet arrives, which is why routes can change mid-transfer. The hop count to the destination (D) isn't known in advance. Copying the previous packet's data (E) would double the traffic for nothing.
</details>

---

## 1.7 How Networks Are Shaped: Design Architectures

We've met the devices. But **how do you arrange them** when you're building a network for a real company? You don't just plug everything into everything — networks follow **standard shapes** (architectures) that engineers reuse because they're predictable, easy to grow, and easy to troubleshoot.

### The 3-Tier (Hierarchical) Design

The classic campus design splits the network into **three layers**, each with one job:



| Layer | Job | Typical gear |
|-------|-----|--------------|
| **Access** | Where **end devices plug in** (PCs, phones, APs). Port security, VLANs, PoE. | Layer 2 switches |
| **Distribution** | The **middle manager**: routing between VLANs, ACLs/policy, aggregates access switches. | Layer 3 switches |
| **Core** | The **highway**: moves huge amounts of traffic between distribution blocks as fast as possible. | High-speed L3 switches |

**Why split it into layers at all — why not just one big flat switch network?** Because of **scale and blast radius**. In a flat network, every switch connects to every other switch in a tangle: adding one more switch means touching many devices, one loop can take down everything, and troubleshooting means checking everywhere. Layers fix this by giving each device **one clear job and one clear place**:

- **Growth becomes copy-paste.** Need a new building? Add an access/distribution "block" and connect it to the core. You don't redesign anything else.
- **Failures stay contained.** A problem at an access switch affects that closet, not the company.
- **Troubleshooting has a map.** "Users on floor 3 can't reach the server" immediately tells you *which* block to look at.
- **Policy has a home.** Filtering happens at distribution — one predictable place — instead of scattered randomly.

**The Collapsed Core (2-Tier)** — for smaller networks, the core and distribution layers are **merged into one layer**:

In a collapsed core, the access switches connect straight up into a single
combined core/distribution layer — two tiers instead of three.

**Why collapse them?** Because a separate core only pays off when you have **enough distribution blocks to justify it**. In a single-building company, a dedicated core layer would just be extra hardware forwarding traffic between two switches — expensive, and more devices to manage for no benefit. *The rule of thumb: 3-tier for large multi-building campuses, 2-tier (collapsed core) for smaller sites.*

![Three-tier campus design versus collapsed core](images/campus_tiers.png)

### Spine-Leaf (The Data Center Shape)

![Spine-leaf: every leaf connects to every spine](images/spine_leaf.png)

Data centers use a different shape. Every **leaf** connects to **every spine** — and leaves never connect to each other:

The shape is simple to describe: a row of **spine** switches, a row of **leaf**
switches, and **every leaf connected to every spine**. Leaves never connect to
each other, and spines never connect to each other. Servers hang off the leaves.

**Why does the data center need its own shape?** Because traffic patterns changed. Old networks were mostly **north-south** (user → server → internet), which the 3-tier design handles well. Modern data centers are mostly **east-west** — servers talking to *other servers* (a web app querying a database, virtual machines syncing). In a 3-tier design, two servers on different access switches must travel *up* to distribution or core and back *down* — and the path length depends on where they happen to sit.

Spine-leaf makes every server **exactly the same distance from every other server**: leaf → spine → leaf. Always two hops. That's called **predictable latency**, and it's the whole point. Need more capacity? Add a spine — every leaf instantly gets more bandwidth. Need more servers? Add a leaf. *Same idea as the hierarchy above — one job per layer — but tuned for server-to-server traffic instead of user-to-internet traffic.*

Step through some server-to-server traffic in a small fabric:

```diagram
{
  "type": "topology",
  "title": "Spine-leaf: every server pair is leaf, spine, leaf",
  "caption": "Two spines, four leaves, a server on each leaf. Click a switch to read its role, or press **Next**.",
  "nodes": [
    {
      "id": "SP1",
      "kind": "l3switch",
      "x": 1.4,
      "y": 0,
      "label": "Spine1",
      "info": "A **spine** connects to every leaf and to nothing else: no servers, no other spines. Its only job is to carry traffic between leaves, fast."
    },
    {
      "id": "SP2",
      "kind": "l3switch",
      "x": 3.6,
      "y": 0,
      "label": "Spine2",
      "info": "Adding a spine adds a new path between every pair of leaves at once, so it's how you add **capacity**."
    },
    {
      "id": "L1",
      "kind": "switch",
      "x": 0,
      "y": 1.6,
      "label": "Leaf1",
      "info": "A **leaf** is where servers plug in. It has an uplink to every spine and never links to another leaf. Adding a leaf is how you add **servers**."
    },
    {
      "id": "L2",
      "kind": "switch",
      "x": 1.67,
      "y": 1.6,
      "label": "Leaf2"
    },
    {
      "id": "L3",
      "kind": "switch",
      "x": 3.33,
      "y": 1.6,
      "label": "Leaf3"
    },
    {
      "id": "L4",
      "kind": "switch",
      "x": 5,
      "y": 1.6,
      "label": "Leaf4"
    },
    {
      "id": "SA",
      "kind": "server",
      "x": 0,
      "y": 3,
      "label": "Server A"
    },
    {
      "id": "SB",
      "kind": "server",
      "x": 1.67,
      "y": 3,
      "label": "Server B"
    },
    {
      "id": "SC",
      "kind": "server",
      "x": 3.33,
      "y": 3,
      "label": "Server C"
    },
    {
      "id": "SD",
      "kind": "server",
      "x": 5,
      "y": 3,
      "label": "Server D"
    }
  ],
  "links": [
    {
      "a": "L1",
      "b": "SP1"
    },
    {
      "a": "L1",
      "b": "SP2"
    },
    {
      "a": "L2",
      "b": "SP1"
    },
    {
      "a": "L2",
      "b": "SP2"
    },
    {
      "a": "L3",
      "b": "SP1"
    },
    {
      "a": "L3",
      "b": "SP2"
    },
    {
      "a": "L4",
      "b": "SP1"
    },
    {
      "a": "L4",
      "b": "SP2"
    },
    {
      "a": "L1",
      "b": "SA"
    },
    {
      "a": "L2",
      "b": "SB"
    },
    {
      "a": "L3",
      "b": "SC"
    },
    {
      "a": "L4",
      "b": "SD"
    }
  ],
  "steps": [
    {
      "title": "1. Server A to Server D: leaf, spine, leaf",
      "text": "Server A's traffic goes up to its leaf, across one spine, and down to Server D's leaf. That's east-west traffic, the bulk of a data center's work.",
      "packets": [
        {
          "path": [
            "SA",
            "L1",
            "SP1",
            "L4",
            "SD"
          ],
          "label": "A to D"
        }
      ]
    },
    {
      "title": "2. Every pair is the same distance",
      "text": "Server B to Server C is **also** leaf, spine, leaf. It doesn't matter which leaves the servers sit on: every pair is the same length apart. That's **predictable latency**, the point of the design.",
      "packets": [
        {
          "path": [
            "SB",
            "L2",
            "SP2",
            "L3",
            "SC"
          ],
          "label": "B to C"
        }
      ]
    },
    {
      "title": "3. Both spines carry traffic at once",
      "text": "Each leaf has an equal path through **every** spine, so the fabric spreads different flows across all of them (equal-cost multipath). Nothing sits idle the way a blocked backup link would.",
      "packets": [
        {
          "path": [
            "SA",
            "L1",
            "SP1",
            "L4",
            "SD"
          ],
          "label": "flow 1"
        },
        {
          "path": [
            "SA",
            "L1",
            "SP2",
            "L4",
            "SD"
          ],
          "label": "flow 2",
          "tone": "purple"
        }
      ]
    },
    {
      "title": "4. A spine fails: less capacity, same path length",
      "text": "Lose Spine1 and every leaf still reaches every other leaf through Spine2, still in three switches. You lose some capacity, not reachability. Need it back, or need more? Add a spine and every leaf gains bandwidth.",
      "nodes": {
        "SP1": {
          "state": "down",
          "badge": "failed",
          "tone": "bad"
        }
      },
      "links": {
        "L1-SP1": "down",
        "L2-SP1": "down",
        "L3-SP1": "down",
        "L4-SP1": "down"
      },
      "packets": [
        {
          "path": [
            "SA",
            "L1",
            "SP2",
            "L4",
            "SD"
          ],
          "label": "A to D"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 1.7**

**Q1.** In the three-tier campus design, which layer is where PCs, IP phones and access points plug in, and where features such as port security and PoE are applied?

- **A.** Access
- **B.** Distribution
- **C.** Core
- **D.** Spine

<details><summary>Answer</summary>

**Answer: A.** The **access** layer is the edge where end devices connect, so per-port features (port security, VLAN assignment, PoE) live there. **Why not the others:** distribution (B) aggregates the access switches and applies routing and policy between VLANs. The core (C) moves traffic between distribution blocks as fast as possible and connects no end devices. Spine (D) belongs to the data-center spine-leaf design, not the three-tier campus.
</details>

**Q2.** A single-building company uses a **collapsed core** design. Which two layers of the three-tier model have been combined?

- **A.** Access and distribution
- **B.** Distribution and core
- **C.** Access and core
- **D.** Core and the WAN edge

<details><summary>Answer</summary>

**Answer: B.** A collapsed core merges the **core and distribution** layers into one, leaving two tiers: access and core/distribution. A separate core only pays off when there are enough distribution blocks to connect. **Why not the others:** the access layer always stays separate (A, C), because that's where users plug in. The WAN edge (D) isn't one of the three campus tiers.
</details>

**Q3.** Which statement correctly describes how a spine-leaf fabric is cabled?

- **A.** Every leaf connects to every spine, leaves never connect to each other, and servers connect to the leaves.
- **B.** Every leaf connects to every other leaf in a full mesh, and servers connect to the spines.
- **C.** Spines connect to each other in a ring, and each leaf connects to one spine.
- **D.** Each leaf connects to one spine, and servers connect to both leaves and spines.

<details><summary>Answer</summary>

**Answer: A.** That one rule is the whole design: every leaf to every spine, no leaf-to-leaf links, no spine-to-spine links, and servers hang off the leaves. **Why not the others:** leaves never link to each other (B), and servers never connect to spines (B, D). Spines never link to each other (C), and a leaf with only one spine (C, D) would lose the equal two-hop path through *every* spine that makes the design predictable.
</details>

**Q4.** Why do modern data centers prefer spine-leaf over the three-tier design?

- **A.** Most traffic is now east-west (server to server), and spine-leaf gives every pair of servers on different leaves the same leaf-spine-leaf path, so latency is predictable.
- **B.** Most traffic is north-south (users to the internet), which spine-leaf handles with fewer devices.
- **C.** Spine-leaf needs no routing or switching configuration.
- **D.** Spine-leaf uses fewer cables than any other design.

<details><summary>Answer</summary>

**Answer: A.** Servers talking to servers is the bulk of data-center traffic, and spine-leaf makes every such conversation the same length: leaf, spine, leaf. Need more capacity? Add a spine. **Why not the others:** north-south traffic (B) is what the three-tier campus was built for. Spine-leaf still needs configuration (C). And full leaf-to-spine meshing uses *more* cables (D), not fewer; that's the price of the equal paths.
</details>

## 1.8 SOHO, On-Premises & Cloud

Not every network is a campus. The exam expects you to recognize a few common **deployment styles**.

**SOHO (Small Office / Home Office)** is your house or a small shop. The defining feature: **one box does everything**. Your home "router" is secretly a router *plus* a switch *plus* a wireless access point *plus* a firewall *plus* a DHCP server *plus* a NAT device — all in one plastic case.

**Why combine them at home but separate them at work?** Cost and scale. A home has a handful of devices and no IT staff, so a single cheap all-in-one is perfect. A company has thousands of devices, needs each function to scale independently (more switch ports without buying more firewalls), and needs redundancy — so those functions get split into dedicated, replaceable devices. *Same functions, different packaging.*

**On-premises** means the servers live **in your building**, on hardware you bought and maintain. **Cloud** means they live in someone else's data center (AWS, Azure) and you rent them.

| Aspect | On-Premises | Cloud |
|---|---|---|
| **Hardware** | You buy and own it | Provider owns it |
| **Cost shape** | Big up-front purchase | Pay monthly for what you use |
| **Scaling** | Buy and install more (weeks) | Click a button (minutes) |
| **Maintenance** | Your team | Provider |
| **Control** | Total | Limited to what the provider exposes |

Many companies run **hybrid** — some systems on-premises (sensitive data, legacy apps), some in the cloud (websites, backups). *Why hybrid? Because the trade-offs above land differently per application, so the sensible answer is rarely "all one way."*

**📝 Exam-style questions — 1.8**

**Q1.** A home user has one box from the ISP that provides Wi‑Fi, four LAN ports, a firewall, DHCP and NAT. Which deployment style is this?

- **A.** SOHO
- **B.** Three-tier campus
- **C.** Public cloud
- **D.** Spine-leaf

<details><summary>Answer</summary>

**Answer: A.** One all-in-one box doing router, switch, AP, firewall, DHCP and NAT jobs is the signature of a **SOHO** (small office/home office) network. **Why not the others:** a three-tier campus (B) splits those functions into many dedicated devices. Public cloud (C) means renting servers in a provider's data center. Spine-leaf (D) is a data-center switching design.
</details>

**Q2.** Which two statements describe cloud hosting compared with on-premises servers? (Choose two.)

- **A.** You pay regularly for the capacity you use instead of buying hardware up front.
- **B.** Extra capacity can be added in minutes.
- **C.** You have total control over the physical hardware.
- **D.** Your own team replaces failed disks and power supplies.
- **E.** It requires a large purchase before anything can run.

<details><summary>Answer</summary>

**Answer: A, B.** Cloud turns servers into a monthly bill for what you use, and scaling is a few clicks. **Why not the others:** total hardware control (C), your own team doing hardware repairs (D) and a big up-front purchase (E) are all features of **on-premises**, where you buy and run the hardware yourself.
</details>

**Q3.** A clinic keeps its patient-records servers in its own building but runs its public website and offsite backups at a cloud provider. Which model is this?

- **A.** SOHO
- **B.** Hybrid
- **C.** On-premises only
- **D.** Cloud only

<details><summary>Answer</summary>

**Answer: B.** Some systems on-premises (the sensitive records) and some in the cloud (the website and backups) is **hybrid**, and it's common because the trade-offs land differently for each application. **Why not the others:** SOHO (A) describes a small all-in-one network, not where servers are hosted. "On-premises only" (C) and "cloud only" (D) each ignore half of what the clinic runs.
</details>

## 1.9 Virtualization: One Machine Pretending to Be Many

Here's something that seems like magic: a **single physical server** can run **twenty separate "computers"** at once, each with its own operating system, IP address, and reboot button.

### Virtual Machines & Hypervisors

A **virtual machine (VM)** is a complete pretend computer — pretend CPU, pretend disk, pretend network card — running as software on a real one. The program that creates and manages VMs is the **hypervisor**.

The stack, from the bottom up:

| Level | What's there |
|-------|--------------|
| Physical server | Real CPU, RAM and network card |
| **Hypervisor** | Divides that real hardware into virtual slices |
| VM 1 · VM 2 · VM 3 | Each with its **own complete OS** — Windows, Linux, whatever |

**Why bother? Why not just use the physical server directly?** Because a physical server running one application typically uses **5–15% of its power** — the rest is wasted, but you still pay for the box, the rack space, the electricity, and the cooling. Virtualization lets one strong server do the work of many weak ones. And you gain things physical servers can't do: **snapshots** (save a machine's exact state before a risky change and roll back in seconds), **moving a running server** to different hardware without downtime, and **creating a new server in a minute** instead of ordering hardware. *It turns servers from things you buy into things you create.*

### Containers

A **container** is a lighter-weight idea. Instead of virtualizing the whole computer, containers **share the host's operating system** and package just the application plus what it needs to run.

The container stack, bottom up:

| Level | What's there |
|-------|--------------|
| Physical server | Real hardware |
| **One shared operating system** | A single OS, used by everything above |
| Container engine (e.g. Docker) | Packages and isolates each app |
| App A · App B · App C | The apps — **no OS inside each one** |

*Compare with the VM stack above: the guest operating systems are simply gone.*

| Aspect | Virtual Machine | Container |
|---|---|---|
| **Contains** | Full OS + app | Just the app + its dependencies |
| **Size** | Gigabytes | Megabytes |
| **Start time** | Minutes | Seconds |
| **Isolation** | Stronger (separate OS) | Lighter (shared OS kernel) |

**Why does the shared OS matter so much?** Because the operating system is the *heavy* part. Ten VMs mean ten copies of Windows or Linux booting, patching, and eating RAM. Ten containers share one. That's why containers start in seconds and you can pack far more onto one server — the trade-off being **weaker isolation**, since they all trust the same kernel. *VMs when you need strong separation or different operating systems; containers when you want many small, fast, identical app instances.*

### VRFs — Virtualization Inside a Router

**VRF (Virtual Routing and Forwarding)** does for a **router** what a hypervisor does for a server: it splits one physical router into **several independent virtual routers**, each with its **own separate routing table**.

**Why would you want that?** Because sometimes two networks must stay *completely* separate even though they share hardware. Picture a building shared by two companies, or a hospital keeping medical devices apart from guest Wi-Fi. Without VRFs, all their routes live in one routing table — so if both use `192.168.1.0/24`, they collide, and worse, traffic could leak between them.

With VRFs, each gets its own routing table that **cannot see the other**. They can even use identical, overlapping IP ranges without conflict, because those routes live in different tables entirely.

*The neat way to remember it:* **VLANs separate at Layer 2, VRFs separate at Layer 3.** A VLAN splits one switch into many broadcast domains; a VRF splits one router into many routing tables. Same instinct — one physical box, several isolated logical ones.

**📝 Exam-style questions — 1.9**

**Q1.** What is the role of a hypervisor?

- **A.** It creates and runs virtual machines, dividing one physical server's CPU, memory and network among them.
- **B.** It shares one host operating system kernel among many isolated applications.
- **C.** It gives a router several independent routing tables.
- **D.** It splits one switch into several broadcast domains.

<details><summary>Answer</summary>

**Answer: A.** The hypervisor is the layer that carves real hardware into virtual machines, each running its own complete operating system. **Why not the others:** sharing one kernel among isolated apps (B) is what a **container engine** such as Docker does. Separate routing tables in one router (C) are **VRFs**. Splitting a switch into broadcast domains (D) is what **VLANs** do.
</details>

**Q2.** Which two statements correctly compare containers with virtual machines? (Choose two.)

- **A.** Containers share the host's operating system kernel instead of each running a full OS.
- **B.** Containers are typically megabytes in size and start in seconds.
- **C.** Each container includes its own complete guest operating system.
- **D.** Containers give stronger isolation than VMs.
- **E.** Containers can only run on a physical server with no operating system installed.

<details><summary>Answer</summary>

**Answer: A, B.** Dropping the guest OS is the whole trick: with only the app and its dependencies inside, containers are small and quick to start. **Why not the others:** a full guest OS in each (C) describes a VM. Because containers all trust the same kernel, their isolation is *weaker* than a VM's (D). And containers need a host OS (E); they run on top of it through a container engine.
</details>

**Q3.** A service provider's router carries traffic for two customers who both use 10.1.1.0/24 internally. The provider must keep their routes completely apart on the same physical router. Which feature does this?

- **A.** VLANs
- **B.** VRFs
- **C.** A trunk link
- **D.** A hypervisor

<details><summary>Answer</summary>

**Answer: B.** A **VRF** gives each customer its own routing table on the same router, so identical, overlapping prefixes live side by side without colliding or leaking. **Why not the others:** VLANs (A) separate traffic at Layer 2 but leave one shared routing table, where two 10.1.1.0/24 routes would clash. A trunk (C) just carries several VLANs over one link. A hypervisor (D) virtualizes servers, not a router's routing table.
</details>

---

<a name="chapter-2"></a>
# Chapter 2: How Computers Talk — Models & Layers

## 2.1 Why Do We Need "Models"?

When something is complicated, we break it into **layers** so each layer has one job. This makes it easier to understand, build, and fix.

**Story Time 📖:** Think of sending a birthday present through the mail:

1. **You** pick the gift (the actual thing you want to send).
2. **You** wrap it in a box.
3. **You** put an address label on it.
4. The **post office** decides the route.
5. The **truck/plane** physically carries it.

Each step is a "layer." The gift doesn't care how the truck works, and the truck doesn't care what's in the box. Networks work the same way!

**But WHY is this layering so powerful? Here's the real payoff:** because each layer only talks to the layers right above and below it, you can **swap out one layer without touching the others**. This is the whole reason networking can improve over time:

- When Wi‑Fi replaced cables, only **Layer 1** (physical) changed. Your web browser (Layer 7), TCP (Layer 4), and IP (Layer 3) didn't need a single change — they don't know or care whether the bits travel over copper, fiber, or radio.
- When websites moved from HTTP to secure HTTPS, only the top layers changed. The routers in the middle kept working exactly the same.

*That's the magic of layers: each one hides its messy details from the others, so we can upgrade any piece independently.* Imagine if changing your Wi‑Fi meant rewriting every website — the internet could never evolve. Layering is what lets thousands of companies build networking pieces that all snap together.

**And WHY does this help YOU troubleshoot?** Because when something breaks, you can check **one layer at a time** instead of panicking about everything at once. No cable/signal? That's Layer 1. Wrong VLAN? Layer 2. Bad IP or gateway? Layer 3. Can't reach the app but ping works? Layer 4+. The layers become a checklist. (We use exactly this in the Troubleshooting chapter.)

**📝 Exam-style questions — 2.1**

**Q1.** Offices replaced their Ethernet cables with Wi‑Fi, yet web browsers, TCP and IP needed no changes at all. Which property of layered models made that possible?

- **A.** Each layer hides its details from the others, so one layer can change without the others changing.
- **B.** Every layer encrypts the data, so the medium underneath doesn't matter.
- **C.** Layered models remove headers, so less data crosses the radio link.
- **D.** Layered models guarantee that every packet is delivered.

<details><summary>Answer</summary>

**Answer: A.** Each layer only talks to the layers just above and below it, so swapping Layer 1 (copper for radio) leaves Layers 3, 4 and 7 untouched. **Why not the others:** most layers don't encrypt anything (B). Layering *adds* headers rather than removing them (C). And layering itself guarantees nothing about delivery (D); reliability is one protocol's job (TCP), not a property of the model.
</details>

**Q2.** A user can ping the company web server by its IP address, but her browser shows "connection refused" when she opens the site. Using the layers as a troubleshooting checklist, where should you look first?

- **A.** Layer 1: the cable or Wi‑Fi signal
- **B.** Layer 2: the switch port's VLAN
- **C.** Layer 3: the PC's IP address and default gateway
- **D.** Layer 4 and above: whether the web service is running and listening on its port

<details><summary>Answer</summary>

**Answer: D.** A successful ping proves Layers 1 to 3 work end to end: signals, frames and IP routing are all fine. "Connection refused" means the server answered but nothing accepted the connection on that port, so the problem is at the transport or application layer. **Why not the others:** a broken cable or signal (A), a wrong VLAN (B) or a bad IP address or gateway (C) would each have made the ping fail too.
</details>

## 2.2 The OSI Model — 7 Layers

The **OSI model** (Open Systems Interconnection) is a **7-layer** map of how data travels. It's a teaching tool — real networks use TCP/IP (next section) — but the CCNA exam LOVES the OSI model, so learn it well.

Layers are numbered from the **bottom (Layer 1)** to the **top (Layer 7)**:

| # | Layer | Its job | You'd recognize |
|---|-------|---------|-----------------|
| **7** | Application | What you actually see and use | Web browser, email |
| **6** | Presentation | Translate, compress, encrypt | JPEG, TLS |
| **5** | Session | Start, keep and end conversations | Holding a call open |
| **4** | Transport | Reliable delivery, port numbers | TCP, UDP |
| **3** | Network | Addressing and routing between networks | IP, routers |
| **2** | Data Link | Local delivery on one link | Switches, Ethernet, MAC |
| **1** | Physical | Wires, signals, light, radio | Cables, fiber, Wi-Fi |

### A Trick to Remember the 7 Layers

From Layer 7 down to 1:
**"All People Seem To Need Data Processing"**
- **A**pplication
- **P**resentation
- **S**ession
- **T**ransport
- **N**etwork
- **D**ata Link
- **P**hysical

From Layer 1 up to 7:
**"Please Do Not Throw Sausage Pizza Away"**
- **P**hysical
- **D**ata Link
- **N**etwork
- **T**ransport
- **S**ession
- **P**resentation
- **A**pplication

### What Each Layer Does (Deep but Simple)

**Layer 1 — Physical:** The actual **wires, radio waves, and electricity/light**. It turns 1s and 0s into signals you can send (a flash of light, a pulse of electricity, a radio wave). No thinking here — just moving bits. Examples: copper cables, fiber optic, connectors, voltage.

**Layer 2 — Data Link:** Delivers data **between two devices on the same local network**. It uses **MAC addresses** (a device's built-in hardware ID). This layer packs data into **frames**. Switches live here. It also checks for errors in each frame.

**Layer 3 — Network:** Delivers data **across different networks** using **IP addresses**. This is where **routers** decide the best path. Data here is called a **packet**.

**Layer 4 — Transport:** Makes sure data arrives **correctly and in order**. It uses **TCP** (careful and reliable) or **UDP** (fast but not guaranteed). It also uses **port numbers** to know which app the data belongs to. Data here is called a **segment** (TCP) or **datagram** (UDP).

**Layer 5 — Session:** Opens, manages, and closes the **conversation** between two apps. Think of it as keeping the phone line open while you talk.

**Layer 6 — Presentation:** **Translates** data into a format both sides understand. Handles **encryption** (scrambling for safety) and **compression** (shrinking to save space). Example: turning a photo into JPEG.

**Layer 7 — Application:** The layer **closest to you**, the human. It's the services apps use: web (HTTP/HTTPS), email (SMTP), file transfer (FTP). Note: this is NOT the app itself (like Chrome) — it's the networking rules the app uses.

**📝 Exam-style questions — 2.2**

**Q1.** Which OSI layer provides logical addressing and chooses the path between different networks?

- **A.** Data Link
- **B.** Network
- **C.** Transport
- **D.** Session

<details><summary>Answer</summary>

**Answer: B.** Layer 3, the **Network** layer, is where IP addresses live and where routers pick the path between networks. **Why not the others:** the Data Link layer (A) delivers frames on one local link using MAC addresses. The Transport layer (C) handles ports and reliable delivery between applications. The Session layer (D) opens, maintains and closes conversations between applications.
</details>

**Q2.** Which OSI layer is responsible for translating data formats, compression and encryption, for example turning a picture into JPEG?

- **A.** Application
- **B.** Presentation
- **C.** Session
- **D.** Transport

<details><summary>Answer</summary>

**Answer: B.** Layer 6, **Presentation**, makes sure both sides understand the format: translation, compression and encryption. **Why not the others:** the Application layer (A) is the network services apps use, such as HTTP and SMTP. The Session layer (C) manages the conversation itself. The Transport layer (D) handles ports, segmentation and reliability, not data formats.
</details>

**Q3.** Which two functions belong to the OSI Data Link layer? (Choose two.)

- **A.** Addressing frames with MAC addresses for delivery on the local network
- **B.** Detecting corrupted frames with a check value in the trailer
- **C.** Using port numbers to hand data to the right application
- **D.** Choosing the best path to a remote network
- **E.** Opening and closing conversations between two applications

<details><summary>Answer</summary>

**Answer: A, B.** Layer 2 packs data into **frames**, addresses them with **MAC addresses** for the local hop, and checks each frame for errors (Ethernet's FCS). **Why not the others:** port numbers (C) are Layer 4. Choosing paths between networks (D) is Layer 3. Opening and closing conversations (E) is Layer 5.
</details>

**Q4.** At which OSI layers do a traditional switch and a router make their forwarding decisions?

- **A.** Switch: Layer 1. Router: Layer 2.
- **B.** Switch: Layer 2. Router: Layer 3.
- **C.** Switch: Layer 3. Router: Layer 4.
- **D.** Switch: Layer 2. Router: Layer 4.

<details><summary>Answer</summary>

**Answer: B.** A switch forwards **frames** by MAC address (Layer 2), and a router forwards **packets** by IP address (Layer 3). **Why not the others:** Layer 1 (A) is the hub's world, repeating bits with no addresses. Routers don't forward by port numbers (C, D); Layer 4 identifies applications at the endpoints. (Multilayer switches that also route exist, and you'll meet them later, but the classic switch is a Layer 2 device.)
</details>

## 2.3 The TCP/IP Model — The Real-World Version

![The OSI model beside the TCP/IP model with PDUs](images/osi_tcpip.png)

The **TCP/IP model** is what the Internet actually uses. It has **4 layers** (sometimes shown as 5). It's basically the OSI model squished together.

| TCP/IP layer | Covers which OSI layers |
|--------------|-------------------------|
| **Application** | 7 Application + 6 Presentation + 5 Session |
| **Transport** | 4 Transport |
| **Internet** | 3 Network |
| **Network Access** | 2 Data Link + 1 Physical |

TCP/IP simply **merges** layers OSI keeps separate — the top three become one, and the bottom two become one.

**📝 Exam-style questions — 2.3**

**Q1.** Which OSI layers does the TCP/IP model's **Application** layer cover?

- **A.** Layer 7 only
- **B.** Layers 6 and 7
- **C.** Layers 5, 6 and 7
- **D.** Layers 4, 5, 6 and 7

<details><summary>Answer</summary>

**Answer: C.** TCP/IP merges OSI's top three layers (Session, Presentation and Application) into its one Application layer. **Why not the others:** A and B leave Session (and Presentation) without a home in TCP/IP. D wrongly pulls in Layer 4, which TCP/IP keeps as its own Transport layer.
</details>

**Q2.** In the four-layer TCP/IP model, which layer matches OSI Layers 1 and 2?

- **A.** Internet
- **B.** Transport
- **C.** Network Access (also called Link)
- **D.** Physical

<details><summary>Answer</summary>

**Answer: C.** TCP/IP squeezes Physical and Data Link into a single **Network Access** layer. **Why not the others:** the Internet layer (A) matches OSI Layer 3 (IP). Transport (B) matches OSI Layer 4. "Physical" (D) only appears as a separate layer in the five-layer version of TCP/IP, and even there it covers just OSI Layer 1, not Layer 2 as well.
</details>

## 2.4 Encapsulation — Wrapping Data in Layers

![Encapsulation: each layer wraps the one above](images/encapsulation.png)

As data goes **down** the layers (from your app to the wire), each layer **adds its own wrapper** (called a **header**). This is called **encapsulation**. It's like putting a letter inside envelope inside a box inside a shipping container.

| Going down the stack | What gets added | The result is called |
|----------------------|-----------------|----------------------|
| Layers 7–5 | — | **Data** |
| Layer 4 | TCP header | **Segment** |
| Layer 3 | IP header | **Packet** |
| Layer 2 | MAC header **and** a trailer | **Frame** |
| Layer 1 | — (turned into signals) | **Bits** |

*Each layer wraps what the one above handed it — and the receiving device unwraps them in reverse.*

Step down the stack of a PC sending a web request, one wrapper at a time:

```diagram
{
  "type": "sequence",
  "title": "Encapsulation: a web request going down the stack",
  "actors": [
    {
      "id": "APP",
      "label": "Application"
    },
    {
      "id": "TR",
      "label": "Transport"
    },
    {
      "id": "NET",
      "label": "Network"
    },
    {
      "id": "DL",
      "label": "Data Link"
    },
    {
      "id": "PHY",
      "label": "Physical"
    }
  ],
  "messages": [
    {
      "note": "Browser asks for a page",
      "over": [
        "APP"
      ],
      "states": {
        "APP": "Data"
      },
      "text": "PC-A (192.168.1.10) asks web server 10.2.2.20 for `/index.html`. At Layers 7 to 5 this is just **data**: no addresses yet."
    },
    {
      "from": "APP",
      "to": "TR",
      "label": "data",
      "detail": "GET /index.html",
      "text": "The application hands its data down to the transport layer. It neither knows nor cares how the bits will travel."
    },
    {
      "from": "TR",
      "to": "NET",
      "label": "+ TCP header",
      "detail": "ports 49152 to 80",
      "states": {
        "TR": "Segment"
      },
      "text": "TCP adds **port numbers**: destination 80 tells the server *which application* gets this (the web server), and source 49152 tells the reply which browser tab to come back to. It also adds sequence numbers for reliability."
    },
    {
      "from": "NET",
      "to": "DL",
      "label": "+ IP header",
      "detail": "to 10.2.2.20",
      "states": {
        "NET": "Packet"
      },
      "text": "IP adds the **final** source and destination. These two addresses stay the same for the whole trip."
    },
    {
      "from": "DL",
      "to": "PHY",
      "label": "+ Eth header + FCS",
      "detail": "to R1's MAC",
      "states": {
        "DL": "Frame"
      },
      "text": "Ethernet adds a header **and** a trailer (the FCS error check). Look at the destination MAC: it's the **default gateway's** (R1), not the server's. The server is on another network, so the next *local* hop is the router. MAC means \"next hop\"; IP means \"final destination\"."
    },
    {
      "note": "Frame leaves as bits",
      "over": [
        "DL",
        "PHY"
      ],
      "states": {
        "PHY": "Bits"
      },
      "text": "Layer 1 turns the frame into electrical pulses, light or radio. At the far end, the server reverses everything (**de-encapsulation**): check and strip the frame, read the IP header, hand the segment to TCP, deliver the data to port 80."
    }
  ]
}
```

At the other end, the receiving computer does the **opposite** — it peels off each wrapper. This is called **de-encapsulation**.

**Why wrap data in all these layers? Why not just send the raw data?** Because each header carries the exact information *one specific device* needs to do *its* job — and nothing more:

- The **switch** in the middle only reads the **Layer 2 (MAC) header** to decide the next local hop. It doesn't need to understand your data — just the "local address."
- The **router** only reads the **Layer 3 (IP) header** to pick the path across networks. It ignores your actual data too.
- The **receiving computer** reads the **Layer 4 (port) header** to know *which app* gets the data (web browser? email?).

So each wrapper is like an **address label for a different worker** along the journey. The switch reads its label, the router reads its label, the destination reads its label. *That's why we add headers in order going down, and strip them in reverse going up* — each device unwraps only as far as it needs to, does its job, and passes it on. It's an assembly line where every station reads only its own instructions.

**A key detail (exam favorite):** as a frame passes through switches and routers, the **MAC addresses (Layer 2) change at every hop**, but the **IP addresses (Layer 3) stay the same** from start to finish. *Why?* Because MAC = "the next local step" (changes each hop, like passing a note hand-to-hand across a room), while IP = "the final destination" (never changes, like the address written on the envelope). Hold onto this — it clicks fully once you reach routing in Chapter 14.

Step through it hop by hop:

```diagram
{
  "type": "topology",
  "title": "Hop by hop: the MACs change, the IPs don't",
  "caption": "PC-A (192.168.1.10) sends to SRV (10.2.2.20) through router R1. Press **Next** and watch which addresses change.",
  "nodes": [
    {
      "id": "PCA",
      "kind": "host",
      "x": 0,
      "y": 1,
      "label": "PC-A",
      "sub": "192.168.1.10"
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 1.25,
      "y": 1
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 2.5,
      "y": 1,
      "info": "R1 has one MAC per interface: Gi0/0 is `0c1a.2b3c.0000` (192.168.1.1) and Gi0/1 is `0c1a.2b3c.0001` (10.2.2.1)."
    },
    {
      "id": "SW2",
      "kind": "switch",
      "x": 3.75,
      "y": 1
    },
    {
      "id": "SRV",
      "kind": "server",
      "x": 5,
      "y": 1,
      "label": "Web server",
      "sub": "10.2.2.20"
    }
  ],
  "links": [
    {
      "a": "PCA",
      "b": "SW1"
    },
    {
      "a": "SW1",
      "b": "R1",
      "bLabel": "Gi0/0"
    },
    {
      "a": "R1",
      "b": "SW2",
      "aLabel": "Gi0/1"
    },
    {
      "a": "SW2",
      "b": "SRV"
    }
  ],
  "steps": [
    {
      "title": "1. PC-A frames the packet for its gateway",
      "text": "The server is on another network, so PC-A addresses the **frame** to its default gateway: source MAC `0050.7966.0001` (PC-A), destination MAC `0c1a.2b3c.0000` (R1 Gi0/0). Inside, the **packet** says 192.168.1.10 to 10.2.2.20. SW1 reads only the destination MAC to forward it.",
      "packets": [
        {
          "path": [
            "PCA",
            "SW1",
            "R1"
          ],
          "label": "frame 1"
        }
      ]
    },
    {
      "title": "2. R1 unwraps to Layer 3 and decides",
      "text": "The frame was addressed to R1, so R1 checks the FCS, **throws the frame away**, and reads the IP header. 10.2.2.20 is on its Gi0/1 network. The first frame's job is done: it only ever had to cross one link.",
      "focus": [
        "R1"
      ],
      "nodes": {
        "R1": {
          "badge": "reads IP",
          "tone": "accent"
        }
      }
    },
    {
      "title": "3. R1 builds a brand-new frame",
      "text": "New frame for the new link: source MAC `0c1a.2b3c.0001` (R1 Gi0/1), destination MAC `0050.7966.0020` (SRV). The packet inside is the **same**: still 192.168.1.10 to 10.2.2.20 (only its TTL dropped by one). No NAT here, so no IP address changes.",
      "nodes": {
        "R1": null
      },
      "packets": [
        {
          "path": [
            "R1",
            "SW2",
            "SRV"
          ],
          "label": "frame 2",
          "tone": "purple"
        }
      ]
    },
    {
      "title": "4. SRV unwraps all the way up",
      "text": "SRV sees its own MAC, strips the frame, sees its own IP, strips the packet, and hands the segment to whatever listens on **TCP port 80**: the web server. Two frames, one packet: MAC = next local hop, IP = final destination.",
      "nodes": {
        "SRV": {
          "badge": "port 80",
          "tone": "good"
        }
      }
    }
  ]
}
```

### The Names of Data at Each Layer (PDUs)

**PDU** means **Protocol Data Unit** — the fancy name for "the chunk of data" at each layer. Memorize these:

| Layer | Data is called |
|-------|----------------|
| Transport (4) | **Segment** (TCP) / **Datagram** (UDP) |
| Network (3) | **Packet** |
| Data Link (2) | **Frame** |
| Physical (1) | **Bits** |

**Memory trick:** "**Some People Fear Birthdays**" → **S**egment, **P**acket, **F**rame, **B**its (from Layer 4 down to 1).

**📝 Exam-style questions — 2.4**

**Q1.** As data moves down the stack at the sender, which list gives the PDU names in the correct order from Layer 4 to Layer 1?

- **A.** Segment, packet, frame, bits
- **B.** Packet, segment, frame, bits
- **C.** Frame, packet, segment, bits
- **D.** Segment, frame, packet, bits

<details><summary>Answer</summary>

**Answer: A.** Layer 4 makes a **segment**, Layer 3 wraps it in a **packet**, Layer 2 wraps that in a **frame**, and Layer 1 sends it as **bits** ("Some People Fear Birthdays"). **Why not the others:** B swaps Layers 3 and 4. C lists the frame first, which is the outermost wrapper, not the innermost. D swaps the packet and the frame; a frame carries a packet, not the other way round.
</details>

**Q2.** Refer to the exhibit. PC-A sends a web request to SRV. There is no NAT. Which addresses does the frame carry as it travels from R1 to SRV?

```
PC-A ---- SW1 ---- Gi0/0 [ R1 ] Gi0/1 ---- SW2 ---- SRV

PC-A       IP 192.168.1.10   MAC 0050.7966.0001
R1 Gi0/0   IP 192.168.1.1    MAC 0c1a.2b3c.0000
R1 Gi0/1   IP 10.2.2.1       MAC 0c1a.2b3c.0001
SRV        IP 10.2.2.20      MAC 0050.7966.0020
```

- **A.** Source MAC 0050.7966.0001, destination MAC 0050.7966.0020, source IP 192.168.1.10, destination IP 10.2.2.20
- **B.** Source MAC 0c1a.2b3c.0001, destination MAC 0050.7966.0020, source IP 192.168.1.10, destination IP 10.2.2.20
- **C.** Source MAC 0c1a.2b3c.0001, destination MAC 0050.7966.0020, source IP 10.2.2.1, destination IP 10.2.2.20
- **D.** Source MAC 0050.7966.0001, destination MAC 0c1a.2b3c.0000, source IP 192.168.1.10, destination IP 10.2.2.20

<details><summary>Answer</summary>

**Answer: B.** R1 strips the frame PC-A built, reads the IP header, and builds a **new frame** for the next local hop: from its own Gi0/1 MAC to SRV's MAC. The IP addresses inside never change. **Why not the others:** A keeps PC-A's MAC as the source, but MACs only describe the current local hop, and PC-A's frame ended at R1. C changes the source IP to R1's, which only NAT would do, and there's no NAT here. D is the frame on the *first* hop, from PC-A to its gateway, not the one between R1 and SRV.
</details>

**Q3.** Which header does each device read to make its forwarding decision?

- **A.** A switch reads the IP header; a router reads the Ethernet header.
- **B.** A switch reads the destination MAC address; a router reads the destination IP address.
- **C.** Both read the TCP port numbers.
- **D.** A switch reads the destination IP address; a router reads the destination TCP port.

<details><summary>Answer</summary>

**Answer: B.** Each device unwraps only as far as it needs: the switch reads the Layer 2 header (destination MAC), the router reads the Layer 3 header (destination IP). **Why not the others:** A swaps the two jobs. Port numbers (C) are read by the receiving host to pick the application, not by switches and routers when forwarding. D gives both devices the wrong layer.
</details>

**Q4.** During encapsulation, which layer adds both a **header and a trailer**?

- **A.** Transport
- **B.** Network
- **C.** Data Link
- **D.** Physical

<details><summary>Answer</summary>

**Answer: C.** The Data Link layer adds the MAC header at the front and the **FCS trailer** at the end, so the error check can cover everything before it. **Why not the others:** the Transport layer (A) adds only a TCP or UDP header, and the Network layer (B) adds only an IP header. The Physical layer (D) adds no header at all; it turns the frame into signals.
</details>

## 2.5 TCP vs. UDP — The Two Delivery Styles

This is SUPER important for the exam. Both live at Layer 4 (Transport).

### TCP (Transmission Control Protocol) — The Careful Delivery

TCP is like sending a package with **signature required** and **tracking**. It makes sure everything arrives, in order, with nothing missing.

- **Reliable:** Confirms every piece arrived.
- **Ordered:** Puts pieces back in the right order.
- **Connection-based:** Sets up a connection first (the "3-way handshake").
- **Slower** because of all the checking.
- **Used for:** Websites (HTTP/HTTPS), email, file downloads — anything where every bit matters.

**The 3-Way Handshake** (how TCP starts a conversation):

The three-way handshake, in order:

1. **A → B: SYN** — *"Hi, can we talk?"*
2. **B → A: SYN-ACK** — *"Sure. Can you hear me?"*
3. **A → B: ACK** — *"Yes. Let's go."*

Only after that third message does either side send real data.

**Remember:** SYN → SYN-ACK → ACK. Like knocking, getting a "who is it?", then answering.

Here it is with the sequence numbers and the TCP states each side passes through:

```diagram
{
  "type": "sequence",
  "title": "The TCP three-way handshake",
  "actors": [
    {
      "id": "PC",
      "kind": "host",
      "label": "Client"
    },
    {
      "id": "SRV",
      "kind": "server",
      "label": "Web server"
    }
  ],
  "messages": [
    {
      "note": "Web server waits on port 80",
      "over": [
        "PC",
        "SRV"
      ],
      "states": {
        "PC": "CLOSED",
        "SRV": "LISTEN"
      },
      "text": "The server's web application has opened port 80 and is **listening**. The client has no connection yet."
    },
    {
      "from": "PC",
      "to": "SRV",
      "label": "SYN",
      "detail": "seq=1000, MSS 1460",
      "states": {
        "PC": "SYN-SENT"
      },
      "text": "\"Hi, can we talk?\" The client picks a random **initial sequence number** (1000 here, to keep it readable) and offers its MSS, the biggest chunk of data it wants per segment (section 2.7)."
    },
    {
      "from": "SRV",
      "to": "PC",
      "label": "SYN-ACK",
      "detail": "seq=5000, ack=1001, MSS 1460",
      "states": {
        "SRV": "SYN-RECEIVED"
      },
      "text": "\"Sure, can you hear me?\" Two jobs in one segment: **ACK** the client's SYN (a SYN counts as one byte, so it asks for 1001 next) and send the server's own **SYN** with its own starting number."
    },
    {
      "from": "PC",
      "to": "SRV",
      "label": "ACK",
      "detail": "seq=1001, ack=5001",
      "states": {
        "PC": "ESTABLISHED",
        "SRV": "ESTABLISHED"
      },
      "tone": "good",
      "text": "\"Yes, let's go.\" Now **both** directions have been tested: each side has seen the other's SYN acknowledged. That's why it takes three messages, not two."
    },
    {
      "from": "PC",
      "to": "SRV",
      "label": "data: GET /index.html",
      "detail": "seq=1001",
      "text": "Only now does real data flow. UDP skips all of this and just sends, which is why it's faster and why it can't promise anything."
    }
  ]
}
```

### UDP (User Datagram Protocol) — The Fast Delivery

UDP is like **shouting a message** — fast, but you don't check if the person heard every word.

- **Not reliable:** No confirmation.
- **No ordering:** Pieces might arrive out of order.
- **Connectionless:** Just sends, no handshake.
- **Faster** because no checking.
- **Used for:** Video calls, live streaming, online games, DNS — anything where **speed matters more** than perfect delivery. (If one frame of video is lost, who cares? You want it fast!)

### TCP vs UDP Side by Side

| Feature | TCP 🐢 | UDP 🐇 |
|---------|--------|--------|
| Reliable? | Yes ✅ | No ❌ |
| In order? | Yes ✅ | No ❌ |
| Handshake? | Yes (SYN/SYN-ACK/ACK) | No |
| Speed | Slower | Faster |
| Good for | Web, email, files | Video, voice, games, DNS |

**📝 Exam-style questions — 2.5**

**Q1.** Which two statements describe UDP? (Choose two.)

- **A.** It is connectionless and sends data without a handshake.
- **B.** It does not acknowledge or resend lost data.
- **C.** It uses a three-way handshake to open a connection.
- **D.** It puts out-of-order data back in sequence.
- **E.** It is used by HTTPS to download web pages.

<details><summary>Answer</summary>

**Answer: A, B.** UDP just sends: no setup and no acknowledgements, so no resending. That's why it's fast. **Why not the others:** the three-way handshake (C) and sequencing (D) are TCP features. HTTPS (E) runs over TCP port 443, because every byte of a web page matters.
</details>

**Q2.** Which sequence of messages opens a TCP connection?

- **A.** SYN, ACK, SYN-ACK
- **B.** SYN, SYN-ACK, ACK
- **C.** ACK, SYN, FIN
- **D.** SYN, SYN-ACK, FIN

<details><summary>Answer</summary>

**Answer: B.** The client sends **SYN**, the server replies **SYN-ACK** (agreeing and sending its own SYN), and the client sends **ACK**. Only then does data flow. **Why not the others:** A puts the ACK before the server has answered. C and D include **FIN**, which *closes* a connection rather than opening one.
</details>

**Q3.** Which application is best suited to UDP rather than TCP?

- **A.** Voice over IP calls
- **B.** Downloading a software update
- **C.** Sending email with SMTP
- **D.** Loading a banking web page over HTTPS

<details><summary>Answer</summary>

**Answer: A.** Real-time voice needs low delay more than perfection: a lost slice of audio is a tiny glitch, but waiting for a resend would make the conversation lag. So voice rides on UDP. **Why not the others:** a software update (B), an email (C) and a banking page (D) are all useless if any byte is missing or out of order, so they use TCP's reliability.
</details>

**Q4.** Why does real-time voice traffic use UDP instead of TCP?

- **A.** A resent voice packet would arrive too late to be played, so TCP's retransmissions only add delay.
- **B.** UDP encrypts the audio, and TCP cannot.
- **C.** UDP guarantees the packets arrive in order.
- **D.** TCP cannot carry audio.

<details><summary>Answer</summary>

**Answer: A.** By the time TCP noticed a loss and resent it, that bit of the conversation would already be in the past. Better to skip it and keep going. **Why not the others:** neither protocol encrypts anything (B); that's a job for TLS or SRTP. Ordering (C) is a TCP feature, not a UDP one. TCP can carry any bytes, audio included (D); it's just the wrong fit for real time.
</details>

## 2.6 Port Numbers — Apartment Numbers for Apps

An IP address gets you to the right **building** (computer). A **port number** gets you to the right **apartment** (app/service) inside it.

**Story Time 📖:** Your friend lives in a big apartment building. The **street address** (IP) gets the mail to the building. The **apartment number** (port) makes sure it reaches your friend and not the neighbor.

Ports you MUST memorize for the exam:

| Port | Protocol | What It Does | TCP/UDP |
|------|----------|--------------|---------|
| **20, 21** | FTP | Transfer files | TCP |
| **22** | SSH | Secure remote login | TCP |
| **23** | Telnet | Remote login (NOT secure) | TCP |
| **25** | SMTP | Send email | TCP |
| **53** | DNS | Turn names into IP addresses | UDP (and TCP) |
| **67, 68** | DHCP | Hand out IP addresses | UDP |
| **69** | TFTP | Simple file transfer | UDP |
| **80** | HTTP | Web pages (not secure) | TCP |
| **110** | POP3 | Receive email | TCP |
| **143** | IMAP | Receive email (better) | TCP |
| **161, 162** | SNMP | Manage network devices | UDP |
| **443** | HTTPS | Secure web pages | TCP |
| **514** | Syslog | Send log messages | UDP |

**Memory trick for secure vs not:** HTTP is **80**, add secure "S" and it becomes HTTPS **443**. SSH (**22**) is the secure version of Telnet (**23**) — they're next-door neighbors, but only 22 locks the door. 🔒

---

> **Ports also let the network treat traffic differently.** Recognizing "this is voice, that is a file download" is the first step of **QoS**, which decides who goes first when a link is full — see section **17.7**.

**📝 Exam-style questions — 2.6**

**Q1.** Which protocol and port does SSH use?

- **A.** TCP 22
- **B.** TCP 23
- **C.** UDP 22
- **D.** TCP 443

<details><summary>Answer</summary>

**Answer: A.** SSH, the secure remote login, uses **TCP port 22**. **Why not the others:** TCP 23 (B) is **Telnet**, the insecure neighbour. SSH needs TCP's reliable delivery, not UDP (C). TCP 443 (D) is **HTTPS**.
</details>

**Q2.** Which two protocols use UDP as their transport? (Choose two.)

- **A.** DHCP
- **B.** TFTP
- **C.** SMTP
- **D.** HTTPS
- **E.** Telnet

<details><summary>Answer</summary>

**Answer: A, B.** **DHCP** uses UDP 67 and 68, and **TFTP** uses UDP 69. Both are simple request-and-reply protocols. **Why not the others:** SMTP (C, TCP 25), HTTPS (D, TCP 443) and Telnet (E, TCP 23) all need TCP's reliable byte stream.
</details>

**Q3.** Refer to the exhibit. A packet capture on a PC shows this packet. Which service is the PC asking for?

```
Internet Protocol, Src: 192.168.1.50, Dst: 192.168.1.1
User Datagram Protocol, Src Port: 51344, Dst Port: 53
```

- **A.** DHCP
- **B.** DNS
- **C.** SNMP
- **D.** TFTP

<details><summary>Answer</summary>

**Answer: B.** Destination **UDP 53** is **DNS**: the PC is asking 192.168.1.1 (here, the home router acting as its DNS server) to turn a name into an address. The high source port, 51344, is just the PC's temporary port for this conversation. **Why not the others:** DHCP (A) uses UDP 67 and 68. SNMP (C) uses UDP 161 and 162. TFTP (D) uses UDP 69.
</details>

**Q4.** Which two ports are used to **retrieve** email from a mail server? (Choose two.)

- **A.** TCP 110
- **B.** TCP 143
- **C.** TCP 25
- **D.** UDP 161
- **E.** UDP 69

<details><summary>Answer</summary>

**Answer: A, B.** **POP3** (TCP 110) and **IMAP** (TCP 143) are the two ways a mail client pulls email down from a server. **Why not the others:** TCP 25 (C) is **SMTP**, which *sends* mail. UDP 161 (D) is **SNMP** device management. UDP 69 (E) is **TFTP** file transfer.
</details>

---

## 2.7 TCP In Depth — How Reliability Actually Works

![The TCP three-way handshake](images/tcp_handshake.png)

> 🔬 **Depth section.** The exam asks *what* TCP does; this explains *how*. Skip it if you're on a tight sprint — but this is the layer of understanding CCNP assumes you already have.

Section 2.5 said TCP is "reliable." That word hides four separate mechanisms, and knowing which one is doing what is the difference between memorizing and understanding.

### What's Actually in the Header

| Field | Size | What it's for |
|-------|------|---------------|
| Source / Destination Port | 16 bits each | Which application at each end |
| **Sequence Number** | 32 bits | Where this data sits in the byte stream |
| **Acknowledgment Number** | 32 bits | The next byte expected from the other side |
| Data Offset | 4 bits | Where the header stops and data starts |
| Flags — `URG ACK PSH RST SYN FIN` | 6 bits | Connection control (SYN opens, FIN closes, RST aborts) |
| **Window Size** | 16 bits | How much more the receiver can accept right now |
| Checksum | 16 bits | Corruption check |
| Options | variable | MSS, window scale, selective ACK |

**Three fields do the heavy lifting** — and the rest of this section is really just those three at work: **Sequence Number**, **Acknowledgment Number**, and **Window Size**.

### Sequence & Acknowledgment — Counting Bytes, Not Packets

This is the detail most people get wrong: TCP sequence numbers count **bytes**, not segments.

Sender has 3000 bytes to send, MSS = 1000:

| Segment sent | Bytes it carries |
|--------------|------------------|
| `Seq=1` | 1–1000 |
| `Seq=1001` | 1001–2000 |
| `Seq=2001` | 2001–3000 |

The receiver replies with a single **`Ack=3001`** — *"I have everything up to
byte 3000; send me byte 3001 next."*

**Why count bytes instead of packets?** Because it makes the acknowledgment *self-describing*. `Ack=3001` means "every byte below 3001 arrived" — one number confirms an arbitrary amount of data, and it stays correct even if the network splits or re-sizes segments along the way. Note the ack is the **next byte expected**, not the last byte received: it's a request, not a receipt.

**What if a middle segment is lost?**

| Segment sent | Bytes | What happened |
|--------------|-------|---------------|
| `Seq=1` | 1–1000 | arrives |
| `Seq=1001` | 1001–2000 | **LOST** |
| `Seq=2001` | 2001–3000 | arrives |

The receiver now answers **`Ack=1001`**, then `Ack=1001` again, then again — the
same number three times, because that's the truth: it still needs byte 1001.

The receiver keeps saying `Ack=1001` because that's the truth — it can't acknowledge past the hole. Three **duplicate ACKs** tell the sender "one specific segment is missing, but later ones are arriving, so the path is alive." The sender resends just that segment — **fast retransmit** — without waiting for a timeout. *That's why the ack is "next expected" rather than "last received": the repetition itself becomes the signal.*

Step through the loss, the duplicate ACKs and the fast retransmit:

```diagram
{
  "type": "sequence",
  "title": "A lost segment, duplicate ACKs and fast retransmit",
  "actors": [
    {
      "id": "S",
      "kind": "server",
      "label": "Sender"
    },
    {
      "id": "R",
      "kind": "host",
      "label": "Receiver"
    }
  ],
  "messages": [
    {
      "from": "S",
      "to": "R",
      "label": "Seq=1 (bytes 1-1000)",
      "text": "The sender has 5000 bytes to send with an MSS of 1000, so five segments. The first one arrives fine."
    },
    {
      "from": "R",
      "to": "S",
      "label": "Ack=1001",
      "dashed": true,
      "text": "\"I have everything below 1001; send byte 1001 next.\" The ack names the **next byte expected**."
    },
    {
      "from": "S",
      "to": "R",
      "label": "Seq=1001 (bytes 1001-2000)",
      "drop": true,
      "tone": "bad",
      "text": "This segment is lost somewhere in the network."
    },
    {
      "from": "S",
      "to": "R",
      "label": "Seq=2001 (bytes 2001-3000)",
      "text": "The sender doesn't wait for each ack (that's what the window allows), so the next segment is already on its way. It arrives, and the receiver keeps it, but there's a hole before it."
    },
    {
      "from": "R",
      "to": "S",
      "label": "Ack=1001",
      "detail": "duplicate ACK 1",
      "dashed": true,
      "tone": "warn",
      "text": "The receiver can't acknowledge past the hole, so it repeats **Ack=1001**: that's the truth, it still needs byte 1001."
    },
    {
      "from": "S",
      "to": "R",
      "label": "Seq=3001 (bytes 3001-4000)",
      "text": "The next segment arrives too, and is kept in the receiver's buffer behind the hole."
    },
    {
      "from": "R",
      "to": "S",
      "label": "Ack=1001",
      "detail": "duplicate ACK 2",
      "dashed": true,
      "tone": "warn",
      "text": "Again. Each repeat tells the sender two things: one specific segment is missing, and later ones *are* arriving, so the path is alive."
    },
    {
      "from": "S",
      "to": "R",
      "label": "Seq=4001 (bytes 4001-5000)",
      "text": "The last segment arrives. The receiver now holds bytes 1 to 1000 and 2001 to 5000, with a hole in between."
    },
    {
      "from": "R",
      "to": "S",
      "label": "Ack=1001",
      "detail": "duplicate ACK 3",
      "dashed": true,
      "tone": "warn",
      "text": "The **third duplicate ACK** is the trigger."
    },
    {
      "from": "S",
      "to": "R",
      "label": "Seq=1001 (resent)",
      "tone": "good",
      "text": "**Fast retransmit**: the sender resends just the missing segment straight away, without waiting for its retransmission timer to run out."
    },
    {
      "from": "R",
      "to": "S",
      "label": "Ack=5001",
      "detail": "everything up to byte 5000",
      "dashed": true,
      "tone": "good",
      "text": "The hole is filled, and the receiver already held bytes 2001 to 5000, so **one** ack covers all of it. Counting bytes is what makes a single number able to say that."
    }
  ]
}
```

### Flow Control vs Congestion Control — Two Different Problems

These get confused constantly, and the exam likes the distinction.

| Aspect | Flow control | Congestion control |
|---|---|---|
| **Protects** | The **receiver** | The **network** |
| **Question** | "Can you keep up?" | "Can the path keep up?" |
| **Mechanism** | Window Size field | Sender's congestion window |
| **Signal** | Receiver advertises a window | Packet loss / duplicate ACKs |

**Flow control** is the receiver saying how much buffer it has left: `Window=64240` means "send up to 64,240 unacknowledged bytes." A slow receiver shrinks it; a full one advertises **zero** and the sender pauses. This stops a fast server from drowning a slow phone.

**Congestion control** is the sender's own guess about the *network*, which nobody advertises. It starts small (**slow start**, doubling each round trip), grows until loss appears, then backs off sharply and climbs gently. **Why treat loss as the congestion signal?** Because a full router queue drops packets — so loss is the only feedback the network gives for free. *Flow control is told to you; congestion control has to be inferred.*

The actual send rate is the **smaller** of the two windows. Either can be the bottleneck.

### MSS, MTU and Why 1460 Shows Up Everywhere

**MTU** is the largest frame payload a link carries — **1500 bytes** on Ethernet. **MSS** is the largest *TCP data* chunk, negotiated in the handshake:

```
 1500 (MTU) − 20 (IP header) − 20 (TCP header) = 1460 (MSS)
```

**Why negotiate this instead of just sending and letting routers fragment?** Because fragmentation is expensive and fragile: the destination must hold fragments and reassemble, and losing **one** fragment destroys the whole original packet — turning a 1% loss rate into something far worse. Agreeing on a size that fits end to end avoids the problem entirely. This is also why a tunnel (GRE, IPsec, PPPoE) causes mysterious breakage: its extra headers shrink the usable MTU, and traffic that ignores the new limit gets dropped rather than delivered.

### Closing Down

Opening takes three messages; closing normally takes **four**, because each direction closes independently:

1. **A → B: FIN** — *"I'm done sending."*
2. **B → A: ACK**
3. **B → A: FIN** — *"So am I."*
4. **A → B: ACK**

**Why can't both sides just hang up at once?** Because TCP is **full duplex** — two independent byte streams. One side finishing its upload doesn't mean the other finished its download, so a **half-close** is legitimate: the server can keep sending after the client says FIN. (A **RST** is the abrupt alternative — "this connection is invalid, stop now" — which is what you get connecting to a closed port.)

Step through a normal close, including the half-close:

```diagram
{
  "type": "sequence",
  "title": "Closing a TCP connection: four messages",
  "actors": [
    {
      "id": "C",
      "kind": "host",
      "label": "Client"
    },
    {
      "id": "S",
      "kind": "server",
      "label": "Server"
    }
  ],
  "messages": [
    {
      "note": "Connection open, data flowing",
      "over": [
        "C",
        "S"
      ],
      "states": {
        "C": "ESTABLISHED",
        "S": "ESTABLISHED"
      },
      "text": "Two independent byte streams: client to server, and server to client."
    },
    {
      "from": "C",
      "to": "S",
      "label": "FIN",
      "detail": "I'm done sending",
      "states": {
        "C": "FIN-WAIT-1"
      },
      "text": "The client has nothing more to **send**. That closes only the client-to-server direction."
    },
    {
      "from": "S",
      "to": "C",
      "label": "ACK",
      "dashed": true,
      "states": {
        "S": "CLOSE-WAIT",
        "C": "FIN-WAIT-2"
      },
      "text": "The server acknowledges the FIN, but it may still have data of its own to send, so it doesn't close yet."
    },
    {
      "from": "S",
      "to": "C",
      "label": "data (rest of the download)",
      "text": "The **half-close**: the server keeps sending, and the client keeps receiving (and acking). Legitimate, because the two directions are separate."
    },
    {
      "from": "S",
      "to": "C",
      "label": "FIN",
      "detail": "so am I",
      "states": {
        "S": "LAST-ACK"
      },
      "text": "Now the server is done too, and closes its direction."
    },
    {
      "from": "C",
      "to": "S",
      "label": "ACK",
      "dashed": true,
      "states": {
        "C": "TIME-WAIT",
        "S": "CLOSED"
      },
      "tone": "good",
      "text": "The server is finished. The client waits a little in **TIME-WAIT** in case that last ACK was lost and the server resends its FIN."
    },
    {
      "from": "C",
      "to": "C",
      "label": "TIME-WAIT timer expires",
      "states": {
        "C": "CLOSED"
      },
      "text": "Both sides are closed. The abrupt alternative is a single **RST**, \"this connection is invalid, stop now\", which is what you get connecting to a closed port."
    }
  ]
}
```

**📝 Exam-style questions — 2.7**

**Q1.** A sender transmits four 1000-byte segments: Seq=1, Seq=1001, Seq=2001 and Seq=3001. The segment with Seq=1001 is lost; the other three arrive. Which acknowledgment numbers does the receiver send back, in order?

- **A.** Ack=1001, Ack=1001, Ack=1001
- **B.** Ack=1001, Ack=3001, Ack=4001
- **C.** Ack=1000, Ack=3000, Ack=4000
- **D.** Ack=2001, Ack=3001, Ack=4001

<details><summary>Answer</summary>

**Answer: A.** An ack is the **next byte expected**, and the receiver can't acknowledge past the hole. After Seq=1 it asks for 1001. When 2001 and 3001 arrive, it still needs 1001, so it says Ack=1001 again: **duplicate ACKs**, which tell the sender exactly what's missing. **Why not the others:** B and D acknowledge bytes 1001–2000, which never arrived. C uses the *last byte received*, but TCP acks name the *next byte expected*.
</details>

**Q2.** A busy receiver advertises **Window=0** in its acknowledgments. What does the sender do?

- **A.** It stops sending new data until the receiver advertises a window larger than zero.
- **B.** It immediately resends everything it has sent so far.
- **C.** It resets the connection with RST.
- **D.** It halves its congestion window, because zero means the network is congested.

<details><summary>Answer</summary>

**Answer: A.** A zero window is **flow control**: the receiver is saying "my buffer is full, pause". The sender waits (sending a small probe now and then) until the receiver opens the window again. **Why not the others:** nothing was lost, so there's nothing to resend (B). The connection is healthy, just paused, so there's no reason to reset it (C). D mixes up the two mechanisms: the advertised window protects the *receiver*, while congestion control reacts to signs of a congested *network* such as loss.
</details>

**Q3.** A host on Ethernet (MTU 1500) opens an IPv4 TCP connection, with no IP or TCP options. What MSS does it advertise?

- **A.** 1500
- **B.** 1480
- **C.** 1460
- **D.** 1440

<details><summary>Answer</summary>

**Answer: C.** The MSS is the TCP *data* that fits in one packet: 1500 − 20 (IPv4 header) − 20 (TCP header) = **1460**. **Why not the others:** 1500 (A) is the whole IP packet, headers included. 1480 (B) subtracts only the IP header and forgets TCP's. 1440 (D) is the answer for **IPv6**, whose header is 40 bytes.
</details>

**Q4.** A PC sends a TCP SYN to port 23 on a server where no Telnet service is running. What does the server send back?

- **A.** A SYN-ACK, followed by a FIN once it notices nothing is listening
- **B.** A TCP segment with the RST flag set
- **C.** A FIN, to close the connection politely
- **D.** An ICMP port unreachable message

<details><summary>Answer</summary>

**Answer: B.** A connection request to a closed TCP port gets an **RST**: "this connection is invalid, stop now". The client reports "connection refused". **Why not the others:** a SYN-ACK (A) would mean something *is* listening. FIN (C) closes a connection that was actually open; this one never opened. ICMP port unreachable (D) is how a host answers a **UDP** datagram sent to a closed port, because UDP has no RST flag.
</details>

---

<a name="chapter-3"></a>
# Chapter 3: The Physical Stuff — Cables, Signals & Ports

## 3.1 Why Physical Matters

Everything digital eventually rides on something physical: a **copper wire**, a **glass fiber**, or a **radio wave**. If the cable is broken, nothing else matters. This is **Layer 1**.

**📝 Exam-style questions — 3.1**

**Q1.** A user reports she has no network at all. The link light on her PC's network card is off, and so is the light on the switch port her cable runs to. Which OSI layer should you check first?

- **A.** Physical
- **B.** Data Link
- **C.** Network
- **D.** Application

<details><summary>Answer</summary>

**Answer: A.** No link light at either end means no signal is getting through, so start at **Layer 1**: the cable, the connectors, the port. If the cable is broken, nothing above it can work. **Why not the others:** a Layer 2 problem such as a wrong VLAN (B), a Layer 3 problem such as a bad IP address (C), or an application fault (D) would all leave the link light on.
</details>

**Q2.** Which two of these are Layer 1 transmission media? (Choose two.)

- **A.** Twisted-pair copper cable
- **B.** Fiber-optic cable
- **C.** A MAC address
- **D.** An IP packet
- **E.** An Ethernet frame

<details><summary>Answer</summary>

**Answer: A, B.** Layer 1 is the physical stuff that carries signals: copper carries electricity and fiber carries light (radio, for Wi‑Fi, is the third). **Why not the others:** a MAC address (C) and an Ethernet frame (E) belong to Layer 2. An IP packet (D) is Layer 3. They all *ride on* the medium, but none of them is the medium.
</details>

## 3.2 Copper Cables (Ethernet / Twisted Pair)

The most common LAN cable is **twisted-pair copper**, ending in an **RJ‑45** connector (looks like a fat phone plug). Inside are **8 tiny wires**, twisted into **4 pairs**.

An **RJ-45** connector has **8 pins**, numbered 1–8 across the front, with a
small plastic clip that holds it in the socket. Inside the cable are **4 twisted
pairs** — 8 wires total, twisted in pairs to cancel out interference.

**Why twisted?** Twisting the wires cancels out electrical noise (interference), so the signal stays clean. Cool trick!

### Categories of Copper Cable

| Category | Max Speed | Common Use |
|----------|-----------|-----------|
| Cat 5 | 100 Mbps | Old networks |
| **Cat 5e** | 1 Gbps | Common homes |
| **Cat 6** | 1–10 Gbps (short) | Modern offices |
| Cat 6a | 10 Gbps | High-speed networks |
| Cat 7 / 8 | 10–40 Gbps | Data centers |

> **Mbps** = Megabits per second. **Gbps** = Gigabits per second (1000 Mbps). Bigger = faster.

### Straight-Through vs. Crossover Cables

This is a classic CCNA topic, and once you understand the **"why"** behind it, you'll never forget it. Let's build it up slowly.

#### First, the Big Secret: Devices Talk on Different Wires

Inside that Ethernet cable, some wires are used to **transmit** (send) and others to **receive** (listen). On older 10/100 Mbps Ethernet, only 2 of the 4 pairs are used:

- **Pins 1 and 2** = **Transmit** (Tx) — the "mouth" 🗣️
- **Pins 3 and 6** = **Receive** (Rx) — the "ears" 👂

**Here's the key rule:** For two devices to talk, one device's **mouth (Tx)** must connect to the other device's **ears (Rx)**. If both devices talk on the same wires and listen on the same wires, it's like two people both shouting into pins 1-2 and both listening on pins 3-6 — nobody hears anybody! 🙉

Devices **transmit** on one pair and **listen** on another:

| Device | Sends on | Listens on |
|---|---|---|
| PC / router | pins **1, 2** | pins **3, 6** |
| Switch | pins **3, 6** | pins **1, 2** |

**That opposition is the whole trick.** A PC's transmit pins line up with a
switch's listen pins, so a plain straight-through cable works. Connect two of
the *same* kind of device, though, and transmit meets transmit — both talking,
neither listening — which is exactly what a crossover cable fixes.

#### Why "Same" vs "Different" Devices Matters

Different device types are wired **oppositely** on purpose, so they naturally line up:

- A **PC** transmits on pins 1-2 and receives on 3-6.
- A **switch** does the **opposite**: it receives on 1-2 and transmits on 3-6.

So when you connect a PC to a switch with a **straight-through cable** (pin 1→1, 2→2, 3→3, 6→6), the PC's Tx (1,2) lands right on the switch's Rx (1,2). They line up perfectly with no crossing needed! ✅

But when you connect **two of the same** device (two PCs, or two switches), they both transmit on the same pins. A straight-through cable would connect Tx→Tx and Rx→Rx (the "BAD" picture above). So you need a **crossover cable** that physically swaps the pairs (1→3, 2→6) to make Tx meet Rx. 🔄

#### The Two Cable Types

- **Straight-Through cable:** Each wire goes to the **same pin** on both ends (pin 1 → pin 1, pin 2 → pin 2, and so on). Used to connect **DIFFERENT** kinds of devices, because they're already wired oppositely.
  - PC ↔ Switch
  - Router ↔ Switch
  - Wireless Access Point ↔ Switch

- **Crossover cable:** The transmit and receive pairs are **swapped** inside the cable (pin 1 → pin 3, pin 2 → pin 6). Used to connect **SIMILAR** kinds of devices, because they'd otherwise both talk on the same wires.
  - Switch ↔ Switch
  - PC ↔ PC
  - Router ↔ Router
  - PC ↔ Router (both are "smart" end-devices — routers and PCs are wired the same way, so they count as "similar")
  - Switch ↔ Hub *(both are "network" devices; old hubs often had one pre-crossed "uplink" port that took a straight cable instead)*

> **Wait — why is PC ↔ Router a crossover if they're different-looking devices?** Because what matters is how they're **wired**, not what they look like. Both PCs and routers are "end devices" that transmit on pins 1-2. Switches and hubs are "network devices" that transmit on pins 3-6. **Same category = crossover; different category = straight-through.**

#### A Simple Way to Remember Which Cable

Sort every device into one of two teams by how it's wired:

| Team A — sends on 1, 2 | Team B — sends on 3, 6 |
|------------------------|------------------------|
| PC / Laptop | Switch |
| Router | Hub |
| Server | — |
| Firewall | — |
| Wireless AP (its uplink is wired like a PC's) | — |

- **Same team** (A-A or B-B) → use a **CROSSOVER** cable.
- **Different teams** (A-B) → use a **STRAIGHT-THROUGH** cable.

**Quick check:** Switch ↔ Switch = both Team B = **crossover**. PC ↔ Switch = Team A + Team B = **straight-through**. Router ↔ PC = both Team A = **crossover**. Easy! ✅

Click each cable below to see which pins meet which, and why that cable type is needed:

```diagram
{
  "type": "topology",
  "title": "Which cable goes where?",
  "caption": "Assume old gear with **no Auto-MDIX**. Click a link to see why it needs that cable; click a device to see its team.",
  "nodes": [
    {
      "id": "PC1",
      "kind": "host",
      "x": 0,
      "y": 0,
      "info": "**Team A**: transmits on pins 1 and 2, listens on 3 and 6."
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 1.5,
      "y": 1,
      "info": "**Team B**: transmits on pins 3 and 6, listens on 1 and 2, the opposite of a PC."
    },
    {
      "id": "SW2",
      "kind": "switch",
      "x": 4,
      "y": 1,
      "info": "**Team B**, just like SW1."
    },
    {
      "id": "SRV",
      "kind": "server",
      "x": 5.2,
      "y": 0,
      "info": "**Team A**: servers are wired like PCs."
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 1.5,
      "y": 2.6,
      "info": "**Team A**: routers transmit on 1 and 2, just like PCs. That surprises people, because a router *looks* like network gear."
    },
    {
      "id": "PC2",
      "kind": "host",
      "x": 0,
      "y": 2.6,
      "info": "**Team A**."
    },
    {
      "id": "LAP",
      "kind": "host",
      "x": 3.3,
      "y": 2.6,
      "label": "Admin laptop",
      "info": "Connected to R1's **console** port, not to any network port, so the cable carries a serial console session, not Ethernet."
    }
  ],
  "links": [
    {
      "a": "PC1",
      "b": "SW1",
      "label": "straight-through",
      "info": "Team A to Team B. PC pins 1, 2 (transmit) already land on the switch's pins 1, 2 (listen), so every wire goes **straight**: 1 to 1, 2 to 2, 3 to 3, 6 to 6."
    },
    {
      "a": "SW1",
      "b": "SW2",
      "label": "crossover",
      "info": "Team B to Team B. Both transmit on 3, 6, so a straight cable would join mouth to mouth. A **crossover** swaps the pairs (1 to 3, 2 to 6) so transmit meets listen."
    },
    {
      "a": "SW2",
      "b": "SRV",
      "label": "straight-through",
      "info": "Team B to Team A: different teams, so straight-through."
    },
    {
      "a": "SW1",
      "b": "R1",
      "label": "straight-through",
      "info": "Team B to Team A: router to switch is the most common straight-through link in any network."
    },
    {
      "a": "R1",
      "b": "PC2",
      "label": "crossover",
      "info": "Team A to Team A. A PC and a router both transmit on 1, 2, so this needs a **crossover**, even though they look like very different devices."
    },
    {
      "a": "R1",
      "b": "LAP",
      "label": "rollover",
      "style": "dashed",
      "aLabel": "Console",
      "info": "A **rollover** (console) cable reverses every pin: 1 to 8, 2 to 7, 3 to 6, 4 to 5. It carries no Ethernet; it's how you configure a device that has no IP address yet."
    }
  ]
}
```

#### The Actual Wire Pinout (T568B)

Ethernet cables follow a color-order standard. The most common is **T568B**. A straight-through cable uses **T568B on both ends**. A crossover uses **T568B on one end and T568A on the other** (which swaps the green and orange pairs = swaps Tx and Rx).

| Pin | Straight-through (T568B) | Crossover (T568A far end) |
|-----|--------------------------|---------------------------|
| 1 | White/Orange | White/Green — *crosses to 3* |
| 2 | Orange | Green — *crosses to 6* |
| 3 | White/Green | White/Orange — *crosses to 1* |
| 4 | Blue | Blue |
| 5 | White/Blue | White/Blue |
| 6 | Green | Orange — *crosses to 2* |
| 7 | White/Brown | White/Brown |
| 8 | Brown | Brown |

So the pin-to-pin connections come out as:

| Pin | Straight-through | Crossover |
|---|------------------|-----------|
| Pin 1 → | 1 | **3** |
| Pin 2 → | 2 | **6** |
| Pin 3 → | 3 | **1** |
| Pin 6 → | 6 | **2** |

*Straight-through keeps every pin in place; crossover swaps the transmit and receive pairs.*

#### A Third Cable: The Rollover (Console) Cable

There's one more cable you must know for the exam: the **rollover cable** (also called a **console cable**). It is **NOT** for network traffic at all — it's for **configuring** a Cisco device directly from your laptop's console.

- The wires are **completely reversed** end-to-end: pin 1 → pin 8, pin 2 → pin 7, and so on (it "rolls over").
- It's usually **light blue** (Cisco's classic color).
- One end plugs into the device's **console port**; the other connects to your laptop (often via a USB-to-serial adapter).

A **rollover** cable reverses the order completely: pin **1 ↔ 8**, **2 ↔ 7**,
**3 ↔ 6**, **4 ↔ 5**. It carries no Ethernet at all — it's for console access to
a device's command line.

**Three cables, three jobs — memorize this table:**

| Cable | Wiring | Used For |
|-------|--------|----------|
| **Straight-through** | Same pins both ends | Connecting **different** devices (PC-Switch, Router-Switch) |
| **Crossover** | Tx/Rx pairs swapped | Connecting **similar** devices (Switch-Switch, PC-PC, PC-Router) |
| **Rollover** | All pins reversed | **Console** access to configure a device |

#### Gigabit Ethernet: All Four Pairs

On **Gigabit** Ethernet (1000 Mbps) and faster, all **4 pairs** are used, and each pair can transmit AND receive at the same time. The straight-through vs. crossover rules still apply for the exam, but modern gear almost always uses **Auto-MDIX** to sort it out automatically (see below).

**Memory trick:** Same devices = **cross** them. Different devices = keep them **straight**. (Think: two friends who are alike need to "cross" paths to meet; different friends walk straight to each other.)

> **Good news:** Most modern devices have **Auto-MDIX** (Automatic Medium-Dependent Interface Crossover), a feature that automatically detects whether it needs a crossover and **fixes it electronically** — so either cable type works. Because of this, you rarely need a real crossover cable today. **But the CCNA exam still tests the classic rules**, and Auto-MDIX only works when the port's speed/duplex is set to auto-negotiate, so know both the rules AND that Auto-MDIX exists.

**📝 Exam-style questions — 3.2**

**Q1.** Two older switches have no Auto-MDIX. Which cable must connect their Fast Ethernet ports?

- **A.** Straight-through
- **B.** Crossover
- **C.** Rollover
- **D.** Serial

<details><summary>Answer</summary>

**Answer: B.** Two switches are on the **same team**: both transmit on pins 3 and 6. A straight cable would join transmit to transmit, so you need a **crossover** to swap the pairs. **Why not the others:** straight-through (A) is for *different* teams, such as PC to switch. A rollover (C) is a console cable that carries no Ethernet at all. A serial cable (D) is for old WAN interfaces, not RJ-45 Ethernet ports.
</details>

**Q2.** Which two connections need a **straight-through** cable when the devices don't support Auto-MDIX? (Choose two.)

- **A.** PC to switch
- **B.** Router to switch
- **C.** Router to router
- **D.** PC to router
- **E.** Switch to switch

<details><summary>Answer</summary>

**Answer: A, B.** PCs and routers transmit on pins 1 and 2; switches transmit on 3 and 6. Different teams line up naturally, so a straight cable works for PC-switch and router-switch. **Why not the others:** router to router (C), PC to router (D) and switch to switch (E) each join two devices of the same team, so they need a crossover.
</details>

**Q3.** A technician needs to configure a brand-new router that has no IP address yet, from a laptop with a USB-to-serial adapter. Which cable connects the laptop to the router's console port?

- **A.** Straight-through
- **B.** Crossover
- **C.** Rollover
- **D.** Fiber patch cable

<details><summary>Answer</summary>

**Answer: C.** The **rollover** (console) cable reverses every pin (1 to 8, 2 to 7 and so on) and carries the serial console session, not Ethernet. It's how you reach a device that has no network configuration yet. **Why not the others:** straight-through (A) and crossover (B) cables carry Ethernet between network ports, and the router has no IP address to reach over Ethernet anyway. A fiber patch cable (D) plugs into fiber optics, not the RJ-45 console port.
</details>

**Q4.** On 10BASE-T and 100BASE-TX, which pins does a **PC** transmit on?

- **A.** Pins 1 and 2
- **B.** Pins 3 and 6
- **C.** Pins 4 and 5
- **D.** Pins 7 and 8

<details><summary>Answer</summary>

**Answer: A.** PCs, routers, servers and firewalls transmit on **1 and 2** and listen on 3 and 6. **Why not the others:** 3 and 6 (B) are where a PC *listens*, and where a switch transmits. Pins 4, 5, 7 and 8 (C, D) carry nothing on 10/100 Ethernet; only Gigabit and faster use all four pairs.
</details>

## 3.3 Fiber Optic Cables — Light Instead of Electricity

Fiber uses **pulses of light** through thin glass strands instead of electricity through copper. Light is super fast and can travel very far without weakening.

| Type | Core Size | Light Source | Distance | Use |
|------|-----------|--------------|----------|-----|
| **Multimode (MMF)** | Bigger core | LED / cheap laser | Shorter (up to ~550m) | Inside buildings |
| **Single-mode (SMF)** | Tiny core | Precise laser | Very long (many km) | Between cities |

**Copper** carries **electricity**, so it can pick up electrical noise from
nearby motors, lights and cables. **Fiber** carries **light**, which is immune to
electrical interference — one reason it runs faster and very much further.

**Why choose fiber?**
- Immune to electrical interference.
- Much longer distances.
- Higher speeds.
- More secure (harder to tap).
- Downsides: more expensive and more fragile than copper.

**📝 Exam-style questions — 3.3**

**Q1.** Two buildings are 20 km apart. Which cabling should join them?

- **A.** Single-mode fiber
- **B.** Multimode fiber
- **C.** Cat 6a copper
- **D.** Cat 8 copper

<details><summary>Answer</summary>

**Answer: A.** Single-mode fiber's tiny core and precise laser keep the light clean over many kilometres, which is exactly what a 20 km run needs. **Why not the others:** multimode (B) reaches only a few hundred metres (around 550 m at best in this guide's table). Copper Ethernet (C, D) stops at 100 metres, and even less for Cat 8 at full speed.
</details>

**Q2.** Which two are advantages of fiber over copper? (Choose two.)

- **A.** It is immune to electrical interference.
- **B.** It carries signals much further.
- **C.** It is cheaper to buy and install.
- **D.** It is tougher and harder to damage.
- **E.** It can deliver PoE power to an access point.

<details><summary>Answer</summary>

**Answer: A, B.** Light in glass ignores electrical noise from motors and power cables, and it travels far further before it weakens. **Why not the others:** fiber is usually *more* expensive (C) and *more* fragile (D) than copper; those are its downsides. Glass can't carry electricity, so it can't deliver PoE (E).
</details>

**Q3.** Which statement about multimode fiber is true?

- **A.** It has a larger core and uses LEDs or low-cost lasers, so it suits shorter runs inside buildings.
- **B.** It has a tiny core and a precise laser, so it suits runs between cities.
- **C.** It reaches further than single-mode fiber.
- **D.** It carries electrical pulses rather than light.

<details><summary>Answer</summary>

**Answer: A.** Multimode's wider core lets light bounce along many paths, which spreads the signal out over distance. That's fine inside a building and cheap to drive. **Why not the others:** B describes **single-mode**. Single-mode reaches much further, not less far (C). All fiber carries light (D); electrical pulses are copper's job.
</details>

## 3.4 Wireless (Radio Waves)

Wi‑Fi uses **radio waves** (invisible signals through the air) instead of cables. We cover this in depth in Chapter 20, but for now: no wire, more freedom, but more interference and usually a bit slower/less reliable than a good cable.

**📝 Exam-style questions — 3.4**

**Q1.** Compared with a good cable, which statement about Wi‑Fi is usually true?

- **A.** It gives more freedom to move, but suffers more interference and is usually less reliable.
- **B.** It is immune to interference because radio waves pass through walls.
- **C.** It is always faster than a wired Gigabit connection.
- **D.** Every device gets its own dedicated, interference-free channel.

<details><summary>Answer</summary>

**Answer: A.** No wire means freedom, but radio is shared with everything else nearby (neighbours' Wi‑Fi, microwaves, walls in the way), so it's more exposed to interference and usually slower or less steady than a cable. **Why not the others:** radio is *more* exposed to interference, not immune (B). A good cable usually beats Wi‑Fi (C). And Wi‑Fi clients share the airtime on a channel (D); they don't each get a private one.
</details>

**Q2.** At which OSI layer are the radio waves that carry Wi‑Fi signals?

- **A.** Physical
- **B.** Data Link
- **C.** Network
- **D.** Transport

<details><summary>Answer</summary>

**Answer: A.** Radio waves, like copper and fiber, are a **Layer 1** medium: they carry the bits. **Why not the others:** Wi‑Fi also has Layer 2 rules (its frames and MAC addresses), but those are rules about the data, not the waves themselves (B). IP (C) and TCP or UDP (D) run on top, exactly as they do over cable.
</details>

## 3.5 Network Speeds & Duplex

**Duplex** = how data flows in two directions.

- **Half-duplex:** Can send OR receive, but not at the same time (like a walkie-talkie — you say "over" and take turns). Old hubs used this.
- **Full-duplex:** Can send AND receive at the same time (like a phone call — both people talk at once). Modern switches use this.

| Mode | How it works | Result |
|---|--------------|--------|
| **Half-duplex** | Send **or** receive — one at a time, taking turns | Collisions possible |
| **Full-duplex** | Send **and** receive simultaneously | No collisions; the modern default |

**Collision:** In half-duplex, if two devices talk at once, their signals crash — that's a **collision**. Full-duplex has no collisions.

Step through the difference:

```diagram
{
  "type": "topology",
  "title": "Half-duplex on a hub, full-duplex on a switch",
  "caption": "Left: a hub, one shared wire. Right: a switch with full-duplex ports. Press **Next**.",
  "nodes": [
    {
      "id": "HUB",
      "kind": "switch",
      "x": 1,
      "y": 0,
      "label": "HUB1",
      "sub": "half-duplex"
    },
    {
      "id": "PC1",
      "kind": "host",
      "x": 0,
      "y": 1.6
    },
    {
      "id": "PC2",
      "kind": "host",
      "x": 2,
      "y": 1.6
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 4,
      "y": 0,
      "sub": "full-duplex"
    },
    {
      "id": "PC3",
      "kind": "host",
      "x": 3.1,
      "y": 1.6
    },
    {
      "id": "PC4",
      "kind": "host",
      "x": 4.9,
      "y": 1.6
    }
  ],
  "links": [
    {
      "a": "HUB",
      "b": "PC1"
    },
    {
      "a": "HUB",
      "b": "PC2"
    },
    {
      "a": "SW1",
      "b": "PC3"
    },
    {
      "a": "SW1",
      "b": "PC4"
    }
  ],
  "zones": [
    {
      "label": "one shared wire",
      "nodes": [
        "HUB",
        "PC1",
        "PC2"
      ],
      "tone": "warn"
    }
  ],
  "steps": [
    {
      "title": "1. On a hub, one talks and everyone listens",
      "text": "PC1 sends; the hub repeats the signal to every other port. It works, but like a walkie-talkie: only one device may talk at a time. That's **half-duplex**.",
      "packets": [
        {
          "path": [
            "PC1",
            "HUB",
            "PC2"
          ],
          "label": "PC1 talking"
        }
      ]
    },
    {
      "title": "2. Two talk at once: a collision",
      "text": "PC1 and PC2 both start at the same moment. Their signals meet on the shared wire and garble each other: a **collision**. Both frames are ruined and must be sent again (CSMA/CD, section 5.5, handles the recovery).",
      "nodes": {
        "HUB": {
          "badge": "collision!",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "PC1",
            "HUB"
          ],
          "label": "frame",
          "tone": "bad"
        },
        {
          "path": [
            "PC2",
            "HUB"
          ],
          "label": "frame",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "3. On a switch, both talk at once with no crash",
      "text": "Each switch port has its own pair of wires in each direction, so PC3 and PC4 send to each other **at the same time** and nothing collides. That's **full-duplex**, like a phone call, and it's the modern default.",
      "nodes": {
        "HUB": null,
        "SW1": {
          "badge": "no collisions",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PC3",
            "SW1",
            "PC4"
          ],
          "label": "PC3 to PC4",
          "tone": "good"
        },
        {
          "path": [
            "PC4",
            "SW1",
            "PC3"
          ],
          "label": "PC4 to PC3",
          "tone": "good"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 3.5**

**Q1.** Which statement about full-duplex Ethernet is correct?

- **A.** A port sends and receives at the same time, so collisions can't happen.
- **B.** A port sends or receives, taking turns, and collisions are possible.
- **C.** Full-duplex is required when a PC connects to a hub.
- **D.** Full-duplex doubles the length a copper cable can run.

<details><summary>Answer</summary>

**Answer: A.** With full-duplex, each direction has its own path, so the port talks and listens at once, like a phone call. Nobody shares the wire, so there's nothing to collide with. **Why not the others:** B describes **half-duplex**. A hub is a shared wire, so anything connected to it must run half-duplex (C). Duplex has no effect on cable length (D).
</details>

**Q2.** Refer to the exhibit. The PC attached to Fa0/5 supports full-duplex and is set to auto-negotiate. Which change lets the link run full-duplex with no collisions and no duplex mismatch?

```
SW1# show running-config interface fastethernet0/5
interface FastEthernet0/5
 speed 100
 duplex half

SW1# show interfaces fastethernet0/5 | include duplex|collisions
  Half-duplex, 100Mb/s, media type is 10/100BaseTX
     0 output errors, 1824 collisions, 0 interface resets
```

- **A.** Configure `duplex full` on Fa0/5 and leave the PC on auto-negotiation.
- **B.** Remove the hard-coded settings so both ends auto-negotiate (or set full-duplex on both ends).
- **C.** Replace the cable with a crossover cable.
- **D.** Configure `speed 10` on Fa0/5.

<details><summary>Answer</summary>

**Answer: B.** The port is forced to half-duplex, so it takes turns and counts collisions. Letting both sides auto-negotiate (or hard-coding full-duplex on *both* ends) gives a full-duplex link. **Why not the others:** forcing only the switch (A) turns off negotiation on that side; the PC hears no negotiation, falls back to **half**-duplex, and now the two ends disagree, a duplex mismatch with late collisions and errors. The link is already up, so the cable type isn't the problem (C). Changing the speed (D) leaves the port in half-duplex and makes it slower too.
</details>

**Q3.** A PC is connected to an old hub. Which duplex must the PC's network card use?

- **A.** Half-duplex
- **B.** Full-duplex
- **C.** Full-duplex, but only at 100 Mbps
- **D.** Either, because the hub converts between them

<details><summary>Answer</summary>

**Answer: A.** A hub is one shared wire: everyone hears everyone, so only one device can talk at a time. That's **half-duplex**, with CSMA/CD to handle collisions. **Why not the others:** full-duplex (B, C) assumes a private path in each direction, which a hub doesn't provide at any speed. A hub just repeats signals (D); it can't buffer or convert anything.
</details>

## 3.6 Common Ports & Interfaces on Devices

- **Ethernet ports (RJ-45):** For copper cables — the most common.
- **SFP/SFP+ slots:** Small slots where you plug fiber or copper modules — flexible!
- **Console port:** A special port used to **configure** a Cisco device directly with a laptop (usually rollover cable or USB). This is your first way to talk to a brand-new switch.
- **USB ports:** For files, or console access on newer gear.

**📝 Exam-style questions — 3.6**

**Q1.** A brand-new switch is still in its box and has no IP address. Which port do you use for its first configuration?

- **A.** The console port
- **B.** Gi1/0/1, using SSH
- **C.** An SFP slot
- **D.** VLAN 1, using Telnet

<details><summary>Answer</summary>

**Answer: A.** The **console** port gives you the command line directly over a cable, no IP address needed, so it's how you meet a brand-new device. **Why not the others:** SSH (B) and Telnet (D) both need an IP address on the switch, which it doesn't have yet. An SFP slot (C) takes a fiber or copper module for network traffic, not management.
</details>

**Q2.** Which kind of port lets one switch interface take either a fiber module or a copper module?

- **A.** An SFP slot
- **B.** An RJ-45 port
- **C.** A console port
- **D.** A USB port

<details><summary>Answer</summary>

**Answer: A.** An **SFP** (or SFP+) slot accepts a small plug-in module, and you choose the module (multimode fiber, single-mode fiber, or copper) to match the cable. **Why not the others:** an RJ-45 port (B) is fixed copper. The console port (C) is for management, and a USB port (D) is for files or console access; neither carries network traffic.
</details>

---

## 3.7 Power over Ethernet (PoE) — Data *and* Electricity on One Cable

Here's a genuinely useful trick: an Ethernet cable can carry **electrical power** alongside the data. That's **Power over Ethernet (PoE)**, and it's why the phone on an office desk and the access point on the ceiling have **only one cable** going to them — no power brick, no wall outlet.

One cable carries **both** the data and the electricity. The switch feeding the
power and the device drawing it have names worth knowing:

| Term | Stands for | Which is |
|------|-----------|----------|
| **PSE** | Power Sourcing Equipment | The switch (or injector) supplying power |
| **PD** | Powered Device | The AP, phone or camera drawing it |

**Why is this such a big deal?** Think about where these devices live: an access point on a **ceiling**, a security camera on an **outside wall**, a phone in the middle of an open-plan floor. Running an electrical outlet to each of those spots means an electrician, conduit, and real money — often more than the device costs. PoE means the network cable you were *already going to run* delivers power too. And there's a bonus: because the power comes from the switch in the wiring closet, plugging that **switch** into a UPS keeps every phone and camera alive during a power cut — one battery protects them all.

### The Standards (Know the Power Levels)

| Standard | Common name | Power at the switch port | Typically powers |
|----------|-------------|--------------------------|------------------|
| **802.3af** | PoE | ~15.4 W | IP phones, basic APs |
| **802.3at** | PoE+ | ~30 W | Modern APs, PTZ cameras |
| **802.3bt** | PoE++ / UPoE | ~60–100 W | Video screens, laptops, lighting |

Note that the **device receives slightly less** than the port supplies — some power is lost as heat in the cable run. That's why an 802.3af port is listed as 15.4 W at the switch but only about 12.95 W at the device.

**Does PoE risk frying a device that isn't built for it?** No — and the reason is worth knowing. Before sending real power, the switch performs a **detection** step: it applies a small voltage and looks for a specific electrical signature that powered devices are built to present. No signature, no power — so your laptop plugged into a PoE port receives **only data**, exactly as normal. After detection, the switch **classifies** the device to learn how much power it actually wants, and grants only that. *Negotiate first, then deliver — the same "check before you commit" pattern you'll see all over networking.*

Step through what the switch does with a laptop and with an access point:

```diagram
{
  "type": "sequence",
  "title": "PoE: detect, classify, then power",
  "actors": [
    {
      "id": "LAP",
      "kind": "host",
      "label": "Laptop"
    },
    {
      "id": "SW",
      "kind": "switch",
      "label": "SW1 (PSE)"
    },
    {
      "id": "AP",
      "kind": "ap",
      "label": "AP (PD)"
    }
  ],
  "messages": [
    {
      "from": "SW",
      "to": "LAP",
      "label": "detect: test voltage",
      "detail": "PD signature?",
      "text": "Before any real power, the switch applies a small, harmless voltage and measures what it sees."
    },
    {
      "from": "SW",
      "to": "SW",
      "label": "no PD: data only",
      "states": {
        "LAP": "data only"
      },
      "text": "A laptop doesn't present the powered-device signature, so the switch **never** turns power on for it. It just gets normal Ethernet."
    },
    {
      "from": "SW",
      "to": "AP",
      "label": "detect: test voltage",
      "text": "Same test on the port where the access point is plugged in."
    },
    {
      "from": "AP",
      "to": "SW",
      "label": "valid PD signature",
      "dashed": true,
      "tone": "good",
      "text": "The AP is built to present the signature, so the switch knows it's a real **PD** (powered device)."
    },
    {
      "from": "SW",
      "to": "AP",
      "label": "classification",
      "detail": "how much power?",
      "text": "Next the switch **classifies** the device, so it grants only what's needed instead of the maximum."
    },
    {
      "from": "AP",
      "to": "SW",
      "label": "Class 4 (30 W)",
      "dashed": true,
      "text": "This AP needs 802.3at (PoE+) power."
    },
    {
      "from": "SW",
      "to": "SW",
      "label": "budget check",
      "detail": "30 W of 370 W left",
      "text": "The switch's PoE budget is shared by every port. Here there's exactly enough left. One more 30 W device and it would be **denied power**: link light on, device dark."
    },
    {
      "from": "SW",
      "to": "AP",
      "label": "power on (~50 V DC)",
      "tone": "good",
      "states": {
        "AP": "powered"
      },
      "text": "Only now does real power flow, over the same cable as the data. Negotiate first, then deliver."
    }
  ]
}
```

**The gotcha to watch for:** a switch has a **total power budget** shared by all its ports. A switch advertising 370 W of PoE cannot run 48 ports at 30 W each (that would need 1,440 W). Fill a switch with hungry devices and later ports simply get **denied power** — they'll look dead while their link light works fine. Check with:

```
SW# show power inline                 ! per-port draw + remaining budget
SW# show power inline gi1/0/5         ! detail for one port
```

**📝 Exam-style questions — 3.7**

**Q1.** Which standard provides about 30 W per port at the switch?

- **A.** 802.3af (PoE)
- **B.** 802.3at (PoE+)
- **C.** 802.3bt (PoE++)
- **D.** 802.3ad

<details><summary>Answer</summary>

**Answer: B.** **802.3at**, known as PoE+, gives about **30 W** at the port, enough for modern access points and pan-tilt-zoom cameras. **Why not the others:** 802.3af (A) gives about 15.4 W. 802.3bt (C) gives about 60–100 W. 802.3ad (D) isn't PoE at all; it's the original standard for **LACP** link bundling, which you'll meet with EtherChannel.
</details>

**Q2.** A laptop with no PoE support is plugged into a PoE-enabled switch port. Why isn't it damaged?

- **A.** The switch only sends power after it detects a powered device's electrical signature, and the laptop doesn't present one.
- **B.** The switch always sends full power, but laptops ignore it.
- **C.** The switch only powers ports configured as trunks.
- **D.** The switch waits for the device to request an address from DHCP before sending power.

<details><summary>Answer</summary>

**Answer: A.** Before any real power flows, the switch runs **detection**: a small test voltage that looks for the signature powered devices are built to show. No signature, no power, so the laptop just gets data. **Why not the others:** the switch never sends full power blindly (B); that's exactly the risk detection prevents. Trunk mode (C) has nothing to do with PoE, and access ports power phones and APs all the time. DHCP (D) happens *after* the device is powered and booted, so it couldn't come first.
</details>

**Q3.** A switch has a 370 W PoE budget. Twelve access points are already drawing 30 W each. A thirteenth access point is plugged in; its link light comes on but the access point stays dark. What is the most likely cause?

- **A.** The switch has run out of PoE budget, so it refuses to power the new port.
- **B.** The cable is faulty.
- **C.** The access point needs a crossover cable.
- **D.** The port must be configured as a trunk before it can supply power.

<details><summary>Answer</summary>

**Answer: A.** 12 × 30 W = 360 W, leaving 10 W. The new AP needs 30 W, so the switch **denies power** to it; `show power inline` would show the budget nearly used up. **Why not the others:** a faulty cable (B) would usually stop the link light too. Cable type (C) doesn't affect power, and modern APs have Auto-MDIX anyway. Ports don't need to be trunks to deliver PoE (D).
</details>

**Q4.** In PoE terms, which statement names the two ends correctly?

- **A.** The switch is the PSE and the IP phone is the PD.
- **B.** The switch is the PD and the IP phone is the PSE.
- **C.** Both are PSEs, because both carry power.
- **D.** The switch is the PSE and the cable is the PD.

<details><summary>Answer</summary>

**Answer: A.** **PSE** (Power Sourcing Equipment) supplies power: the switch or an injector. **PD** (Powered Device) draws it: the phone, AP or camera. **Why not the others:** B swaps the roles. Only one side supplies power (C). The cable (D) just carries it, and some power is lost as heat along the way, which is why a PD gets a little less than the port supplies.
</details>

---

<a name="chapter-4"></a>
# Chapter 4: Numbers Computers Use — Binary & Hex

## 4.1 Computers Only Understand On and Off

Deep down, a computer is millions of tiny switches. Each switch is either **ON** or **OFF**. We write:
- **ON = 1**
- **OFF = 0**

A single 1 or 0 is called a **bit** (short for **b**inary dig**it**). It's the smallest piece of computer info.

**"But WHY do I, a future network engineer, have to learn binary? Can't the computer do the math?"** Great question — here's the honest reason: **subnetting.** When you split networks into smaller pieces (Chapter 12, one of the most-tested CCNA skills), the split happens *in the middle of the binary numbers*, not on the neat decimal boundaries you see. An IP address like `192.168.1.130` looks like tidy decimal numbers, but the switch and router see it as **32 on/off switches**, and the network "line" can fall between switch #25 and #26 — a spot that's invisible in decimal but obvious in binary. **If you can't see the binary underneath, subnetting feels like random magic. Once you can, it becomes simple counting.** That's why we start here: binary is the secret decoder ring for the whole addressing half of the exam.

Here is that exact address. With a /25 the line falls after bit 25, inside the last decimal number:

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "192.168.1.130",
  "prefix": 25,
  "title": "192.168.1.130: the line you can't see in decimal",
  "prompt": "Each octet is 8 bits. The network/host line at /25 cuts the **last octet** in two: its top bit (128) is network, the other seven are host. Slide the prefix and watch the line move; click bits to flip them."
}
```

**📝 Exam-style questions — 4.1**

**Q1.** What is a **bit**?

- **A.** A single binary digit, either 0 or 1
- **B.** A group of eight binary digits
- **C.** One hexadecimal digit
- **D.** One decimal number from 0 to 255

<details><summary>Answer</summary>

**Answer: A.** A bit (**b**inary dig**it**) is the smallest piece of information: one switch, on (1) or off (0). **Why not the others:** eight bits (B) make a **byte**. One hex digit (C) stands for four bits. A number from 0 to 255 (D) is what one *byte* can hold, which is why each part of an IPv4 address stops at 255.
</details>

**Q2.** Why does a network engineer need to read IP addresses in binary?

- **A.** The line between the network part and the host part can fall in the middle of a decimal number, where only the binary shows it.
- **B.** Cisco routers only accept addresses typed in binary.
- **C.** Binary addresses travel faster on the wire than decimal ones.
- **D.** Decimal can't represent numbers bigger than 255.

<details><summary>Answer</summary>

**Answer: A.** In subnetting, the network/host split can land between, say, bit 25 and bit 26, inside the last decimal number of `192.168.1.130`. In decimal that line is invisible; in binary it's obvious. **Why not the others:** IOS takes addresses in dotted decimal (B). Everything on the wire is bits anyway (C); decimal is only how *we* write it. Decimal can show any size of number (D); 255 is just the limit of one byte.
</details>

## 4.2 Bits and Bytes

- **1 bit** = one 1 or 0.
- **8 bits** = **1 byte**.

Networks and computers group bits into bytes all the time. An IP address like `192.168.1.1` is made of **4 bytes** (32 bits total). More on that soon!

One **byte** is **8 bits**, and each position is worth double the one to its right:

| Position | Worth | Bit |
|----------|-------|-----|
| 1st (leftmost) | 128 | **1** |
| 2nd | 64 | 0 |
| 3rd | 32 | **1** |
| 4th | 16 | **1** |
| 5th | 8 | 0 |
| 6th | 4 | 0 |
| 7th | 2 | **1** |
| 8th (rightmost) | 1 | 0 |

Add up the positions holding a 1: 128 + 32 + 16 + 2 = **178**.

```diagram
{
  "type": "bits",
  "mode": "octet",
  "value": 178,
  "title": "One byte: eight place values",
  "prompt": "This is the byte from the table: `10110010` = **178**. Click any bit to flip it and watch the decimal and hex change. Try turning them all on: 255."
}
```

**📝 Exam-style questions — 4.2**

**Q1.** How many bits are in an IPv4 address?

- **A.** 8
- **B.** 32
- **C.** 48
- **D.** 128

<details><summary>Answer</summary>

**Answer: B.** An IPv4 address is **4 bytes**, and 4 × 8 = **32 bits**. **Why not the others:** 8 bits (A) is one byte, a single part of the address. 48 bits (C) is a MAC address. 128 bits (D) is an IPv6 address.
</details>

**Q2.** What is the decimal value of the binary byte `10110010`?

- **A.** 146
- **B.** 177
- **C.** 178
- **D.** 182

<details><summary>Answer</summary>

**Answer: C.** Add the place values that hold a 1: 128 + 32 + 16 + 2 = **178**. **Why not the others:** 146 (A) is `10010010`, which loses the 32. 177 (B) is `10110001`, the last two bits swapped. 182 (D) is `10110110`, with an extra 4.
</details>

**Q3.** A MAC address is 48 bits long. How many **bytes** is that?

- **A.** 4
- **B.** 6
- **C.** 8
- **D.** 12

<details><summary>Answer</summary>

**Answer: B.** 48 ÷ 8 = **6 bytes**. **Why not the others:** 4 bytes (A) is an IPv4 address. 8 bytes (C) would be 64 bits. 12 (D) is how many **hex digits** a MAC address has (each digit is 4 bits), not how many bytes.
</details>

## 4.3 How Binary Counting Works (The Place Values)

In our normal (decimal) numbers, each spot is worth 10× more as you go left: 1, 10, 100, 1000...

In **binary**, each spot is worth **2×** more as you go left. For one byte (8 bits), the spots are worth:

| Position | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th |
|----------|-----|-----|-----|-----|-----|-----|-----|-----|
| **Worth** | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

To find a byte's value, **add up the spots that have a 1**.

### Example 1: Convert binary `11000000` to decimal

| Place | Bit |
|-------|-----|
| 128 | **1** |
| 64 | **1** |
| 32 | 0 |
| 16 | 0 |
| 8 | 0 |
| 4 | 0 |
| 2 | 0 |
| 1 | 0 |

Only the 128 and 64 positions hold a 1, so: 128 + 64 = **192** ✅

So `11000000` = **192**. (This is the first byte of `192.168.x.x`!)

### Example 2: Convert binary `10101000` to decimal

| Place | Bit |
|-------|-----|
| 128 | **1** |
| 64 | 0 |
| 32 | **1** |
| 16 | 0 |
| 8 | **1** |
| 4 | 0 |
| 2 | 0 |
| 1 | 0 |

128 + 32 + 8 = **168** ✅

So `10101000` = **168**.

### Example 3: Convert decimal `200` to binary

Ask: "Does 128 fit into 200?" Yes → write 1, subtract → 200-128 = 72.
"Does 64 fit into 72?" Yes → write 1, subtract → 72-64 = 8.
"Does 32 fit into 8?" No → 0. "16?" No → 0. "8?" Yes → 1, subtract → 0.
The rest are 0.

Work down from the biggest place value that fits:

| Place | Fits in what's left? | Bit |
|-------|----------------------|-----|
| 128 | yes (200 − 128 = 72) | **1** |
| 64 | yes (72 − 64 = 8) | **1** |
| 32 | no | 0 |
| 16 | no | 0 |
| 8 | yes (8 − 8 = 0) | **1** |
| 4 | no | 0 |
| 2 | no | 0 |
| 1 | no | 0 |

So 200 = **11001000** ✅

So `200` = **11001000**.

```diagram
{
  "type": "bits",
  "mode": "octet",
  "value": 200,
  "title": "Check your conversions: 200 = 11001000",
  "prompt": "Rebuild the examples: clear bits to make `11000000` (192), then `10101000` (168). Then try one of your own: 172 is 128 + 32 + 8 + 4."
}
```

> **Try It ✏️:** Convert `11111111` to decimal. (Add all spots: 128+64+32+16+8+4+2+1 = **255**.) This is the biggest one byte can hold! That's why IP numbers only go up to 255.

**📝 Exam-style questions — 4.3**

**Q1.** What is decimal `200` in binary?

- **A.** `11000100`
- **B.** `11001000`
- **C.** `11010000`
- **D.** `10001100`

<details><summary>Answer</summary>

**Answer: B.** Work down from 128: 128 fits (72 left), 64 fits (8 left), 32 and 16 don't, 8 fits (0 left). That's `11001000`. **Why not the others:** `11000100` (A) is 196, with a 4 instead of the 8. `11010000` (C) is 208, with a 16 instead of the 8. `10001100` (D) is 140; it's the right bits written in the wrong places.
</details>

**Q2.** What is decimal `172` (the first octet of the 172.16.0.0 private range) in binary?

- **A.** `10101100`
- **B.** `10101010`
- **C.** `10110100`
- **D.** `10011100`

<details><summary>Answer</summary>

**Answer: A.** 172 = 128 + 32 + 8 + 4, so the 128, 32, 8 and 4 bits are on: `10101100`. **Why not the others:** `10101010` (B) is 170. `10110100` (C) is 180. `10011100` (D) is 156. Each one gets a single place value wrong, which is exactly the slip to watch for.
</details>

**Q3.** A subnet mask octet is `11111000`. What is it in decimal?

- **A.** 224
- **B.** 240
- **C.** 248
- **D.** 252

<details><summary>Answer</summary>

**Answer: C.** 128 + 64 + 32 + 16 + 8 = **248**. Five ones from the left. **Why not the others:** 224 (A) is three ones, `11100000`. 240 (B) is four, `11110000`. 252 (D) is six, `11111100`. Mask octets are always ones from the left, so counting the ones is a fast check.
</details>

**Q4.** What is the largest decimal value one byte can hold?

- **A.** 128
- **B.** 254
- **C.** 255
- **D.** 256

<details><summary>Answer</summary>

**Answer: C.** All eight bits on, `11111111`, is 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = **255**. **Why not the others:** 128 (A) is only the top bit. 254 (B) is `11111110`, one short. 256 (D) is how many *different values* a byte can hold, counting zero (0 to 255), not the largest value.
</details>

## 4.4 Hexadecimal (Hex) — Shortcut for Big Binary

Binary is long and easy to mess up. **Hexadecimal** ("hex") is a shortcut. Hex uses **16 symbols**: 0-9 and then A-F.

| Decimal | Binary | Hex |
|---------|--------|-----|
| 0 | 0000 | 0 |
| 1 | 0001 | 1 |
| 2 | 0010 | 2 |
| 3 | 0011 | 3 |
| 4 | 0100 | 4 |
| 5 | 0101 | 5 |
| 6 | 0110 | 6 |
| 7 | 0111 | 7 |
| 8 | 1000 | 8 |
| 9 | 1001 | 9 |
| 10 | 1010 | **A** |
| 11 | 1011 | **B** |
| 12 | 1100 | **C** |
| 13 | 1101 | **D** |
| 14 | 1110 | **E** |
| 15 | 1111 | **F** |

**The magic:** **4 bits = 1 hex digit.** So one byte (8 bits) = exactly **2 hex digits**. This makes hex perfect for shortening long binary.

### Example: Binary `11110000` to Hex

Split into two groups of 4: `1111` and `0000`.
- `1111` = 15 = **F**
- `0000` = 0 = **0**

So `11110000` = **F0** in hex. Way shorter!

```diagram
{
  "type": "bits",
  "mode": "octet",
  "value": 240,
  "title": "One byte is exactly two hex digits",
  "prompt": "The left four bits make the first hex digit and the right four make the second: `1111 0000` = **F0**. Flip bits in one half and only that hex digit changes. Try `1010 1111` (AF) and `1100 1000` (C8)."
}
```

**Where you'll see hex:** MAC addresses (like `00:1A:2B:3C:4D:5E`) and IPv6 addresses are written in hex. Now you know why!

**But WHY use hex instead of just showing the binary or decimal?** Because hex is the "Goldilocks" choice — *just right* for humans reading computer numbers:

- **Binary is too long and error-prone.** A MAC address in binary is 48 ones and zeros in a row: `000000000001101000101011...`. Miscount one digit and you're wrong. No human can read that reliably.
- **Decimal doesn't line up with bits.** Decimal digits don't map cleanly to groups of bits, so converting is annoying and hides the pattern.
- **Hex fits perfectly.** Because **4 bits = exactly 1 hex digit**, hex is a clean, lossless shorthand for binary. You can glance at a hex digit and instantly know its 4 bits, and vice-versa. It's short like decimal but *lines up with the bits* like binary. That's the whole reason MAC and IPv6 addresses (which are big piles of bits) are written in hex — it keeps them **short AND bit-accurate**.

**📝 Exam-style questions — 4.4**

**Q1.** What is hex `3C` in decimal?

- **A.** 48
- **B.** 60
- **C.** 63
- **D.** 312

<details><summary>Answer</summary>

**Answer: B.** The left hex digit is worth 16s: 3 × 16 = 48, plus C (12) = **60**. **Why not the others:** 48 (A) forgets the C. 63 (C) would be `3F`. 312 (D) treats the digits like decimal ("3" then "12" stuck together), which is not how place values work.
</details>

**Q2.** What is the binary byte `10101111` in hex?

- **A.** `AF`
- **B.** `FA`
- **C.** `A7`
- **D.** `BF`

<details><summary>Answer</summary>

**Answer: A.** Split into nibbles: `1010` = 10 = **A**, and `1111` = 15 = **F**, so `AF`. **Why not the others:** `FA` (B) puts the nibbles in the wrong order. `A7` (C) would need `0111` on the right. `BF` (D) would need `1011` on the left.
</details>

**Q3.** How many bits does one hexadecimal digit represent?

- **A.** 2
- **B.** 4
- **C.** 8
- **D.** 16

<details><summary>Answer</summary>

**Answer: B.** Hex has 16 symbols, and 4 bits make exactly 16 combinations, so **one hex digit is four bits**, and a byte is two hex digits. **Why not the others:** 2 bits (A) only make 4 combinations. 8 bits (C) is a whole byte, which takes *two* hex digits. 16 (D) is how many symbols hex has, not how many bits a digit stands for.
</details>

**Q4.** What is decimal `200` in hex?

- **A.** `8C`
- **B.** `B8`
- **C.** `C2`
- **D.** `C8`

<details><summary>Answer</summary>

**Answer: D.** 200 ÷ 16 = 12 remainder 8, so the digits are 12 (**C**) and **8**: `C8`. Check: in binary 200 is `1100 1000`, which is C and 8. **Why not the others:** `8C` (A) is 140, the digits reversed. `B8` (B) is 184. `C2` (C) is 194.
</details>

---

<a name="chapter-5"></a>
# Chapter 5: MAC Addresses & Ethernet

## 5.1 What Is a MAC Address?

A **MAC address** (Media Access Control) is a **permanent ID number** burned into every network device at the factory. Think of it as the device's **fingerprint** — it (usually) never changes.

- It's **48 bits** long, written as **12 hex digits**.
- Usually shown in pairs: `00:1A:2B:3C:4D:5E` (or with dashes, or Cisco style `001a.2b3c.4d5e`).

A MAC address splits into two halves:

| Half | Example | What it means |
|------|---------|---------------|
| First 24 bits | `00:1A:2B` | The **OUI** — which manufacturer made it |
| Last 24 bits | `3C:4D:5E` | A serial the maker assigns to that individual card |

- The **first half (OUI)** tells you the **manufacturer** (Cisco, Apple, Intel...).
- The **second half** is a unique serial the manufacturer assigns.

**MAC vs IP — the big difference:**
- **MAC address** = permanent, physical, works only on the **local** network (Layer 2). Like your **name**.
- **IP address** = changeable, logical, works **across** networks (Layer 3). Like your **home address** (changes if you move).

**The question everyone asks: "WHY do we need BOTH? Isn't one address enough?"** This is one of the most important ideas in all of networking, so let's nail it with the name-vs-address analogy:

- Your **name** never changes and identifies *you personally* — but a name is **useless for delivering mail across the country**. You can't write "deliver this to Sarah" on a package and expect the postal system to find her among millions of Sarahs. A name doesn't tell anyone *where* you are.
- Your **home address** *does* tell everyone where to deliver — but it **changes when you move**, and it describes a *location*, not a person.

MAC and IP work exactly the same way, and we need both for two different jobs:

- **IP address = the location.** It's structured so routers can figure out *the general direction* to send data ("this address is in the 192.168.1 neighborhood, send it that way"). Routing across the world only works because IP addresses describe *where* a device is on the network. But an IP can change (connect to a different Wi‑Fi, you get a new IP).
- **MAC address = the specific device, locally.** Once data finally arrives at the right local network, the MAC address identifies *exactly which machine* on that network gets it. It's permanent and unique so there's no confusion about *who* on the local wire.

**The killer reason you can't drop either one:** Imagine trying to route with MACs only. MAC addresses have **no structure** — they're random factory serial numbers. There's no "neighborhood" in a MAC, so a router would need a list of *every device on Earth* to know where to send things. Impossible. IP's structured, location-based design is what makes worldwide routing possible. But IP alone can't pin down the final device on the local wire — that's the MAC's job.

**So they're a team:** IP gets your data *to the right neighborhood* (across many networks, hop by hop), and MAC delivers it *to the exact house* (on the final local network). You'll see in Chapter 14 that as data travels, the **IP stays the same the whole trip** (the final destination), while the **MAC changes at every hop** (the next local handoff). Two addresses, two jobs, working together.

**📝 Exam-style questions — 5.1**

**Q1.** How long is a MAC address?

- **A.** 32 bits, written as four decimal numbers
- **B.** 48 bits, written as 12 hex digits
- **C.** 64 bits, written as 16 hex digits
- **D.** 128 bits, written as 32 hex digits

<details><summary>Answer</summary>

**Answer: B.** A MAC address is **48 bits**, and since each hex digit is 4 bits, that's **12 hex digits** (for example `001a.2b3c.4d5e`). **Why not the others:** 32 bits in dotted decimal (A) is an IPv4 address. 128 bits in 32 hex digits (D) is an IPv6 address. 64 bits (C) is the size of an IPv6 interface ID, not a MAC address.
</details>

**Q2.** A NIC has the MAC address `00:50:56:C0:00:08`. Which part is the OUI?

- **A.** `00:50:56`
- **B.** `C0:00:08`
- **C.** `00:50`
- **D.** `00:50:56:C0`

<details><summary>Answer</summary>

**Answer: A.** The **OUI** is the first 24 bits, which is the first **three bytes**: `00:50:56`. It identifies the manufacturer. **Why not the others:** `C0:00:08` (B) is the last 24 bits, the serial the maker assigns to this one card. `00:50` (C) is only 16 bits and `00:50:56:C0` (D) is 32; the OUI is exactly 24.
</details>

**Q3.** Why can't routers forward traffic across the internet using MAC addresses alone?

- **A.** MAC addresses are flat factory serials with no location structure, so a router would need an entry for every device on Earth.
- **B.** MAC addresses change at every router hop, so they can't be stored.
- **C.** MAC addresses are too short to be unique.
- **D.** Routers can't read Layer 2 headers.

<details><summary>Answer</summary>

**Answer: A.** A MAC says *who* a device is, not *where* it is, so there's no "neighbourhood" to route toward. IP addresses are structured by location, so a router can keep one entry for a whole network. **Why not the others:** a device's own MAC address doesn't change (B); what changes per hop is which MACs go in the *frame*. 48 bits is plenty for uniqueness (C). Routers do read Layer 2 headers (D); every frame they receive has one, and they strip it before routing.
</details>

**Q4.** Which two statements correctly compare MAC and IP addresses? (Choose two.)

- **A.** A MAC address identifies a device on the local network and is used at Layer 2.
- **B.** An IP address is a logical Layer 3 address that can change when a device joins a different network.
- **C.** An IP address is burned into the network card by the manufacturer.
- **D.** Routers use MAC addresses to choose the path to a distant network.
- **E.** A laptop keeps the same IP address on every Wi‑Fi network it joins.

<details><summary>Answer</summary>

**Answer: A, B.** The MAC is the device's "name" for local delivery; the IP is its "home address", which describes where it is and changes when it moves. **Why not the others:** it's the MAC that's burned in, not the IP (C). Routers choose paths by IP (D). A laptop usually gets a new IP address on each network it joins (E), which is exactly why IP is the location and MAC is the identity.
</details>

## 5.2 What Is Ethernet?

**Ethernet** is the most common set of rules (a **protocol**) for wired LANs. It defines how devices format data into **frames** and share the wire. Almost every wired network you touch uses Ethernet.

**📝 Exam-style questions — 5.2**

**Q1.** Which IEEE standard family defines wired Ethernet?

- **A.** 802.3
- **B.** 802.11
- **C.** 802.1Q
- **D.** 802.15

<details><summary>Answer</summary>

**Answer: A.** **IEEE 802.3** is Ethernet: its frame format, its MAC addressing and its cabling and signalling standards (100BASE-TX, 1000BASE-T and the rest). **Why not the others:** 802.11 (B) is Wi‑Fi. 802.1Q (C) is VLAN tagging on trunks, which you'll meet in Chapter 8. 802.15 (D) covers personal-area networks such as Bluetooth.
</details>

**Q2.** At which OSI layers does Ethernet operate?

- **A.** Layer 1 only
- **B.** Layers 1 and 2
- **C.** Layers 2 and 3
- **D.** Layer 3 only

<details><summary>Answer</summary>

**Answer: B.** Ethernet defines the cables and signals (**Layer 1**) *and* the frames and MAC addresses (**Layer 2**). That's why "Ethernet" can mean a cable or a frame. **Why not the others:** it's more than just cabling (A), since it defines the frame too. It does no IP addressing or routing (C, D); IP rides *inside* Ethernet frames.
</details>

## 5.3 The Ethernet Frame (What a Frame Looks Like)

![The fields of an Ethernet frame](images/eth_frame.png)

When data travels on a LAN, it's wrapped in an **Ethernet frame**. Here's the layout:

| Field | Size | What it's for |
|-------|------|---------------|
| Destination MAC | 6 bytes | Who the frame is **for** — read first, so a switch can forward immediately |
| Source MAC | 6 bytes | Who **sent** it — this is what a switch learns from |
| Type | 2 bytes | What's inside (e.g. IPv4, IPv6, ARP) |
| **Data** | 46–1500 bytes | The packet being carried |
| FCS | 4 bytes | Corruption check, added at the **end** so it can cover everything before it |

- **Destination MAC:** Who is this frame for?
- **Source MAC:** Who sent it?
- **Type/Length:** What kind of data is inside (e.g., IPv4)?
- **Data:** The actual payload (an IP packet lives here).
- **FCS (Frame Check Sequence):** An error-check. If the math doesn't add up, the frame is damaged and gets thrown away.

Step through what happens to a frame that gets damaged on the way:

```diagram
{
  "type": "topology",
  "title": "The FCS catches a damaged frame",
  "caption": "PC-A sends a frame to PC-B through SW1. Press **Next**.",
  "nodes": [
    {
      "id": "PCA",
      "kind": "host",
      "x": 0,
      "y": 0.6,
      "label": "PC-A",
      "sub": "0050.7966.0001"
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 2.5,
      "y": 0.6
    },
    {
      "id": "PCB",
      "kind": "host",
      "x": 5,
      "y": 0.6,
      "label": "PC-B",
      "sub": "0050.7966.0002"
    }
  ],
  "links": [
    {
      "a": "PCA",
      "b": "SW1",
      "bLabel": "Fa0/1"
    },
    {
      "a": "SW1",
      "b": "PCB"
    }
  ],
  "steps": [
    {
      "title": "1. PC-A builds the frame and its FCS",
      "text": "PC-A runs a calculation (a CRC) over the destination MAC, source MAC, type and data, and puts the result in the **FCS** at the very end of the frame. Being last lets it cover everything before it.",
      "focus": [
        "PCA"
      ],
      "nodes": {
        "PCA": {
          "badge": "FCS 5A3C91E2",
          "tone": "accent"
        }
      }
    },
    {
      "title": "2. Noise flips a bit on the way",
      "text": "The cable runs past a noisy motor, and one bit of the frame flips. Nothing on the wire knows yet.",
      "nodes": {
        "PCA": null
      },
      "packets": [
        {
          "path": [
            "PCA",
            "SW1"
          ],
          "label": "frame, 1 bit flipped",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "3. SW1's check fails, so the frame is dropped",
      "text": "SW1 runs the same calculation on what it received. The answer doesn't match the FCS, so the frame is damaged and is **thrown away**. `show interfaces fa0/1` counts it as an input error and a **CRC** error.",
      "nodes": {
        "SW1": {
          "badge": "CRC error",
          "tone": "bad"
        }
      }
    },
    {
      "title": "4. Ethernet doesn't resend; TCP does",
      "text": "Nobody tells PC-A. Ethernet only **detects** errors; it never asks for a resend. If the data was part of a TCP connection, PC-A's TCP notices the missing acknowledgment and resends the data (section 2.7).",
      "nodes": {
        "SW1": null,
        "PCB": {
          "badge": "got it",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PCA",
            "SW1",
            "PCB"
          ],
          "label": "TCP resends the data",
          "tone": "good"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 5.3**

**Q1.** Which field of an Ethernet frame does a switch use to **learn** where devices are?

- **A.** Destination MAC address
- **B.** Source MAC address
- **C.** Type
- **D.** FCS

<details><summary>Answer</summary>

**Answer: B.** A frame that arrives on a port carrying a source MAC proves that device is reachable through that port, so the switch records the **source** MAC against the port. **Why not the others:** the destination MAC (A) is what the switch uses to *forward*, not to learn. The Type field (C) says what's inside (IPv4, IPv6, ARP). The FCS (D) is the error check.
</details>

**Q2.** A switch receives a frame whose FCS doesn't match the value it calculates. What happens?

- **A.** The switch discards the frame, and Ethernet does not ask the sender to resend it.
- **B.** The switch asks the sender to retransmit the frame.
- **C.** The switch repairs the damaged bits using the FCS and forwards the frame.
- **D.** The switch forwards the frame and lets the destination decide.

<details><summary>Answer</summary>

**Answer: A.** A failed FCS means the frame was damaged, so it's thrown away (and counted as a CRC error on the interface). Ethernet has no resend mechanism; if the data mattered, a higher layer such as TCP notices it's missing and resends. **Why not the others:** Ethernet never requests retransmission (B). The FCS detects errors but can't fix them (C). A store-and-forward switch checks the FCS before forwarding, precisely so it doesn't pass damaged frames on (D).
</details>

**Q3.** An Ethernet frame's Type field contains `0x86DD`. What is the frame carrying?

- **A.** An IPv4 packet
- **B.** An IPv6 packet
- **C.** An ARP message
- **D.** An 802.1Q VLAN tag

<details><summary>Answer</summary>

**Answer: B.** `0x86DD` is the EtherType for **IPv6**. **Why not the others:** IPv4 (A) is `0x0800`. ARP (C) is `0x0806`. `0x8100` (D) marks an 802.1Q tag, which you'll meet with trunks in Chapter 8.
</details>

**Q4.** What is the allowed size of the Data field in a standard Ethernet frame?

- **A.** 46 to 1500 bytes
- **B.** 64 to 1518 bytes
- **C.** 0 to 1500 bytes
- **D.** 46 to 9000 bytes

<details><summary>Answer</summary>

**Answer: A.** The payload runs from **46 to 1500 bytes**. The 1500 is the Ethernet MTU you met in section 2.7. **Why not the others:** 64 to 1518 bytes (B) is the size of the **whole frame**: the 46–1500 data plus 14 bytes of header and 4 of FCS. The data can't be empty (C); a short payload is padded up to 46 bytes. 9000 bytes (D) is a typical *jumbo* frame, which is not standard Ethernet.
</details>

## 5.4 Three Ways to Address a Frame: Unicast, Broadcast, Multicast

| Type | Meaning | Real Life |
|------|---------|-----------|
| **Unicast** | One-to-**one** | Whispering to one friend |
| **Broadcast** | One-to-**everyone** | Yelling to the whole class |
| **Multicast** | One-to-**a group** | Talking to just your study group |

- **Broadcast MAC address** is all F's: `FF:FF:FF:FF:FF:FF`. Every device listens to it.

| Type | Goes to | In the example |
|------|---------|----------------|
| **Unicast** | Exactly one device | Only B receives it |
| **Broadcast** | Every device on the segment | B, C and D all receive it |
| **Multicast** | Only devices that joined the group | B and D receive it; C does not |

Step through the example:

```diagram
{
  "type": "topology",
  "title": "Unicast, broadcast and multicast",
  "caption": "A sends three frames through SW1. Press **Next**.",
  "nodes": [
    {
      "id": "SW1",
      "kind": "switch",
      "x": 2,
      "y": 0
    },
    {
      "id": "B",
      "kind": "host",
      "x": 0.5,
      "y": 1.6
    },
    {
      "id": "C",
      "kind": "host",
      "x": 1.5,
      "y": 1.6
    },
    {
      "id": "D",
      "kind": "host",
      "x": 2.5,
      "y": 1.6
    },
    {
      "id": "A",
      "kind": "host",
      "x": 3.5,
      "y": 1.6
    }
  ],
  "links": [
    {
      "a": "SW1",
      "b": "A"
    },
    {
      "a": "SW1",
      "b": "B"
    },
    {
      "a": "SW1",
      "b": "C"
    },
    {
      "a": "SW1",
      "b": "D"
    }
  ],
  "steps": [
    {
      "title": "1. Unicast: one to one",
      "text": "The destination MAC is **B's** own address. SW1 knows which port B is on, so only B receives it.",
      "packets": [
        {
          "path": [
            "A",
            "SW1",
            "B"
          ],
          "label": "to B's MAC"
        }
      ]
    },
    {
      "title": "2. Broadcast: one to everyone",
      "text": "Destination `FFFF.FFFF.FFFF`: every device on the segment must receive and process it. ARP's \"who has this IP address?\" works this way. SW1 floods it out every port except the one it came in on.",
      "packets": [
        {
          "path": [
            "A",
            "SW1",
            "B"
          ],
          "label": "FFFF.FFFF.FFFF",
          "tone": "warn"
        },
        {
          "path": [
            "A",
            "SW1",
            "C"
          ],
          "label": "FFFF.FFFF.FFFF",
          "tone": "warn"
        },
        {
          "path": [
            "A",
            "SW1",
            "D"
          ],
          "label": "FFFF.FFFF.FFFF",
          "tone": "warn"
        }
      ]
    },
    {
      "title": "3. Multicast: only the group",
      "text": "B and D joined a video stream (group 239.1.1.1, MAC `0100.5e01.0101`); C didn't. With **IGMP snooping** (on by default on Catalyst switches) SW1 knows who joined and sends the stream only to them. Without snooping, a switch floods multicast like a broadcast.",
      "nodes": {
        "B": {
          "badge": "joined",
          "tone": "good"
        },
        "D": {
          "badge": "joined",
          "tone": "good"
        },
        "C": {
          "state": "dim"
        }
      },
      "packets": [
        {
          "path": [
            "A",
            "SW1",
            "B"
          ],
          "label": "group stream",
          "tone": "purple"
        },
        {
          "path": [
            "A",
            "SW1",
            "D"
          ],
          "label": "group stream",
          "tone": "purple"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 5.4**

**Q1.** What is the Ethernet broadcast MAC address?

- **A.** `0000.0000.0000`
- **B.** `FFFF.FFFF.FFFF`
- **C.** `0100.5E00.0001`
- **D.** `FFFF.FF00.0000`

<details><summary>Answer</summary>

**Answer: B.** All 48 bits set to 1, all F's, means "every device on this segment". **Why not the others:** all zeros (A) isn't a usable destination. `0100.5E00.0001` (C) is an IPv4 **multicast** MAC (it maps to 224.0.0.1). D sets only half the bits, which makes it an ordinary address, not a broadcast.
</details>

**Q2.** A video stream is sent once and received only by the hosts that joined that stream. What kind of addressing is this?

- **A.** Unicast
- **B.** Broadcast
- **C.** Multicast
- **D.** Anycast

<details><summary>Answer</summary>

**Answer: C.** One-to-a-group, delivered only to the members who joined, is **multicast**. **Why not the others:** unicast (A) is one-to-one, so the sender would need a separate copy for every viewer. Broadcast (B) would hit every device, including those that don't want the stream. Anycast (D) delivers to the *nearest one* of several devices sharing an address, which you'll meet with IPv6.
</details>

**Q3.** A switch has 24 access ports, all in VLAN 1 and all connected. A broadcast frame arrives on Fa0/1. Where does the switch send it?

- **A.** Out every port except Fa0/1
- **B.** Out every port, including Fa0/1
- **C.** Only out the uplink port
- **D.** Nowhere, because switches block broadcasts

<details><summary>Answer</summary>

**Answer: A.** A broadcast is for everyone in the broadcast domain, so the switch **floods** it out every port in the VLAN, except the one it arrived on. **Why not the others:** sending it back out Fa0/1 (B) would echo it to the sender's own segment for nothing. The switch has no special "send broadcasts up only" rule (C). Switches forward broadcasts (D); *routers* are what stop them.
</details>

## 5.5 How Devices Learn About Collisions (CSMA/CD)

Old networks (with hubs) shared one wire, so two devices could talk at once and **collide**. Ethernet used a polite system called **CSMA/CD**:

- **CS** (Carrier Sense): "Listen first — is anyone talking?"
- **MA** (Multiple Access): "We all share the same wire."
- **CD** (Collision Detection): "If we crash, stop, wait a random time, and try again."

**Story Time 📖:** It's like a group of polite kids in a room. Before you speak, you listen. If two of you start at the same time, you both stop, wait a random number of seconds, and try again. The random wait means you probably won't collide twice in a row.

**Why the RANDOM wait — why not a fixed wait?** This is a clever detail. If both kids waited the *same* fixed amount (say exactly 1 second), they'd both start talking again at the *same moment* — and collide again, forever! By each waiting a **random** amount, they almost certainly pick different times, so one goes first and the other hears them and holds off. *Randomness is what breaks the tie.* (The real rule, called "backoff," even makes the random wait get bigger after repeated collisions, to calm things down when the wire is busy.)

Step through one collision and its recovery:

```diagram
{
  "type": "sequence",
  "title": "CSMA/CD: listen, collide, back off, retry",
  "actors": [
    {
      "id": "A",
      "kind": "host",
      "label": "PC-A"
    },
    {
      "id": "W",
      "kind": "switch",
      "label": "Hub (shared wire)"
    },
    {
      "id": "B",
      "kind": "host",
      "label": "PC-B"
    }
  ],
  "messages": [
    {
      "note": "Both listen: the wire is quiet",
      "over": [
        "A",
        "W",
        "B"
      ],
      "states": {
        "A": "listening",
        "B": "listening"
      },
      "text": "**Carrier sense**: before talking, each station listens. Nobody is sending, so both are allowed to start."
    },
    {
      "from": "A",
      "to": "W",
      "label": "A starts",
      "states": {
        "A": "sending"
      },
      "text": "PC-A begins its frame."
    },
    {
      "from": "B",
      "to": "W",
      "label": "B starts too",
      "states": {
        "B": "sending"
      },
      "text": "Signals take time to travel. PC-B listened, heard silence, and started too. This is why listening first can't prevent every collision."
    },
    {
      "note": "Collision!",
      "over": [
        "W"
      ],
      "text": "The two signals overlap on the shared wire and garble each other. Both stations notice (**collision detection**)."
    },
    {
      "from": "A",
      "to": "W",
      "label": "jam signal",
      "tone": "bad",
      "text": "Each station stops its frame and sends a short **jam signal**, so every station on the wire knows the frame was ruined."
    },
    {
      "from": "B",
      "to": "W",
      "label": "jam signal",
      "tone": "bad",
      "text": "PC-B does the same. Both frames are lost and both stations must try again."
    },
    {
      "from": "A",
      "to": "A",
      "label": "backoff: 0 slots",
      "detail": "random: 0 or 1",
      "states": {
        "A": "backoff"
      },
      "text": "Each station picks a **random** number of slot times to wait. After a first collision the choice is 0 or 1; after each further collision the range doubles."
    },
    {
      "note": "B backs off 1 slot",
      "over": [
        "W",
        "B"
      ],
      "states": {
        "B": "backoff"
      },
      "text": "PC-B happened to pick a different number. That's the whole point of randomness: it breaks the tie."
    },
    {
      "from": "A",
      "to": "W",
      "label": "A resends",
      "tone": "good",
      "states": {
        "A": "sending"
      },
      "text": "PC-A's wait ended first, the wire is quiet, so it sends again."
    },
    {
      "note": "B hears A: defers",
      "over": [
        "W",
        "B"
      ],
      "states": {
        "B": "deferring"
      },
      "text": "When PC-B's wait ends it listens first, hears PC-A, and **defers** instead of colliding again."
    },
    {
      "from": "B",
      "to": "W",
      "label": "B sends",
      "tone": "good",
      "states": {
        "A": "listening",
        "B": "sending"
      },
      "text": "Both frames get through. On a full-duplex switch port none of this happens, because there's no shared wire to collide on."
    }
  ]
}
```

**Why does this whole system exist — and why is it mostly gone now?** CSMA/CD only mattered because old **hubs** forced everyone to *share one wire* (one collision domain), so collisions were unavoidable and you needed rules to recover from them. Modern **switches** give every device its **own dedicated wire** and run **full-duplex** (send and receive at once), so two devices are never fighting for the same wire — **collisions literally can't happen**. That's *why* CSMA/CD is now basically history: we fixed the root cause (the shared wire) instead of just managing the symptom (collisions). The exam still asks about it because it explains *why switches were such a huge upgrade over hubs.*

> **Modern note:** Today's **switches** use **full-duplex**, so collisions basically don't happen anymore. CSMA/CD is mostly history, but the exam still mentions it.

**📝 Exam-style questions — 5.5**

**Q1.** Under CSMA/CD, what does a station do when it detects a collision?

- **A.** It stops sending, sends a jam signal, waits a random backoff time and then tries again.
- **B.** It keeps sending, because the receiver will sort out the damaged bits.
- **C.** It waits exactly one second and resends.
- **D.** It switches the port to full-duplex.

<details><summary>Answer</summary>

**Answer: A.** Stop, make sure everyone knows there was a collision (the jam signal), wait a random time, listen, and try again. **Why not the others:** a collided frame is garbage (B), so continuing wastes the wire. A fixed wait (C) would make both stations retry at the same moment and collide again. Duplex isn't something a station changes on the fly (D); it's set when the link comes up.
</details>

**Q2.** Why is the CSMA/CD backoff timer random instead of fixed?

- **A.** So the colliding stations are unlikely to retry at exactly the same moment
- **B.** So the station with the highest MAC address always goes first
- **C.** So the frame can be resent at a lower speed
- **D.** So the switch can learn the sender's MAC address

<details><summary>Answer</summary>

**Answer: A.** If both waited the same time, they'd collide again forever. Random waits almost always differ, so one station goes first and the other hears it and holds off. The range even grows after repeated collisions. **Why not the others:** there's no MAC-based priority in CSMA/CD (B). Backoff doesn't change the speed (C). MAC learning (D) happens from any received frame's source address; it has nothing to do with collisions.
</details>

**Q3.** On a modern switch, when does a port actually use CSMA/CD?

- **A.** Only when the port runs half-duplex
- **B.** Always, on every Ethernet port
- **C.** Only when the port runs full-duplex
- **D.** Only on trunk ports

<details><summary>Answer</summary>

**Answer: A.** CSMA/CD exists for shared, half-duplex wires, so a port only uses it in **half-duplex**, for example when a hub or an old device is attached. **Why not the others:** full-duplex ports (B, C) can't have collisions, so CSMA/CD is switched off. Trunking (D) is about carrying VLANs and has nothing to do with collision handling.
</details>

---

<a name="chapter-6"></a>
# Chapter 6: Switches — The Traffic Cops of the LAN

## 6.1 The Switch's Superpower: The MAC Address Table

A **switch** connects many devices in a LAN. Its genius is that it learns **which device is on which port** and only sends data where it needs to go (unlike a dumb hub that shouts to everyone).

It keeps a list called the **MAC address table** (or CAM table):

A switch's MAC address table is simply a list of *which address lives on which port*:

| MAC Address | Port |
|-------------|------|
| `00:11:…:AA` | Fa0/1 |
| `00:22:…:BB` | Fa0/2 |
| `00:33:…:CC` | Fa0/3 |

**📝 Exam-style questions — 6.1**

**Q1.** What does a switch's MAC address table map?

- **A.** Each MAC address to the switch port (and VLAN) where it was learned
- **B.** Each IP address to its MAC address
- **C.** Each destination network to an outgoing interface
- **D.** Each port to its speed and duplex

<details><summary>Answer</summary>

**Answer: A.** The MAC address table answers one question: "which port do I send this MAC address out of?" **Why not the others:** IP-to-MAC (B) is the **ARP table**, kept by hosts and routers. Network-to-interface (C) is a **routing table**. Speed and duplex (D) are interface settings, shown by `show interfaces status`.
</details>

**Q2.** What is another common name for the MAC address table?

- **A.** CAM table
- **B.** ARP cache
- **C.** Routing table
- **D.** NAT table

<details><summary>Answer</summary>

**Answer: A.** The MAC table is often called the **CAM table**, after the content-addressable memory that lets the switch look up a MAC address in one step. **Why not the others:** the ARP cache (B) maps IP addresses to MACs. A routing table (C) maps networks to next hops. A NAT table (D) maps inside addresses to outside ones.
</details>

**Q3.** Refer to the exhibit. A frame arrives on Fa0/1 with destination MAC `0011.2233.44cc`. What does SW1 do with it?

```
SW1# show mac address-table
          Mac Address Table
-------------------------------------------

Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0011.2233.44aa    DYNAMIC     Fa0/1
   1    0011.2233.44bb    DYNAMIC     Fa0/2
   1    0011.2233.44cc    DYNAMIC     Fa0/3
Total Mac Addresses for this criterion: 3
```

- **A.** It forwards the frame out Fa0/3 only.
- **B.** It floods the frame out every port except Fa0/1.
- **C.** It forwards the frame out Fa0/2 and Fa0/3.
- **D.** It drops the frame, because the destination was learned dynamically.

<details><summary>Answer</summary>

**Answer: A.** The destination is in the table against **Fa0/3**, so the switch sends the frame there and nowhere else. That's the switch's whole superpower. **Why not the others:** flooding (B) is only for destinations the switch *doesn't* know. Nothing in the table points this MAC at Fa0/2 (C). "DYNAMIC" (D) just means the entry was learned from traffic rather than typed in; dynamic entries are used for forwarding like any other.
</details>

## 6.2 How a Switch Learns (Step by Step)

**Story Time 📖:** A new switch is like a new mail sorter who doesn't know anyone yet. It learns by watching return addresses.

1. **Learning:** When a frame comes in, the switch looks at the **Source MAC** and remembers "Aha, that device is on this port."
2. **Flooding (when unsure):** If the switch doesn't know where the **Destination MAC** is, it sends the frame out **all ports** (except the one it came in on) — just in case. This is called **flooding**.
3. **Forwarding:** Once it knows the destination's port, it sends the frame **only** to that one port.
4. **Filtering:** If the destination is on the **same port** the frame came from, the switch drops it (no need to send it back).
5. **Aging:** If a device is quiet for a while (default 300 seconds), the switch forgets it to keep the table fresh.

**Step 1.** PC-A (on port 1) sends a frame to PC-C, but the switch has never
heard of PC-C. So it **floods** the frame out ports 2, 3 and 4 — and at the same
time **learns** that PC-A is on port 1, from the frame's source address.

**Step 2.** PC-C (on port 3) replies to PC-A. The switch already knows PC-A is on
port 1, so it sends the reply **only** to port 1 — and **learns** that PC-C is on
port 3.

The table now holds both. From here on, traffic between them goes straight to the
right port with no flooding. 🎯

Step through a switch learning from scratch, with four PCs:

```diagram
{
  "type": "topology",
  "title": "How a switch learns: the source teaches, the destination decides",
  "caption": "SW1 starts with an empty MAC table. Press **Next** and watch it learn.",
  "nodes": [
    {
      "id": "SW1",
      "kind": "switch",
      "x": 2,
      "y": 0
    },
    {
      "id": "PCA",
      "kind": "host",
      "x": 0,
      "y": 1.7,
      "label": "PC-A",
      "sub": "aaaa.aaaa.aaaa"
    },
    {
      "id": "PCB",
      "kind": "host",
      "x": 1.33,
      "y": 1.7,
      "label": "PC-B",
      "sub": "bbbb.bbbb.bbbb"
    },
    {
      "id": "PCC",
      "kind": "host",
      "x": 2.67,
      "y": 1.7,
      "label": "PC-C",
      "sub": "cccc.cccc.cccc"
    },
    {
      "id": "PCD",
      "kind": "host",
      "x": 4,
      "y": 1.7,
      "label": "PC-D",
      "sub": "dddd.dddd.dddd"
    }
  ],
  "links": [
    {
      "a": "SW1",
      "b": "PCA",
      "bLabel": "Fa0/1"
    },
    {
      "a": "SW1",
      "b": "PCB",
      "bLabel": "Fa0/2"
    },
    {
      "a": "SW1",
      "b": "PCC",
      "bLabel": "Fa0/3"
    },
    {
      "a": "SW1",
      "b": "PCD",
      "bLabel": "Fa0/4"
    }
  ],
  "steps": [
    {
      "title": "1. A new switch knows nobody",
      "text": "The MAC table is empty: `show mac address-table dynamic` lists nothing. The switch will fill it purely by watching the **source** address of each frame that arrives.",
      "focus": [
        "SW1"
      ]
    },
    {
      "title": "2. PC-A sends to PC-C: learn A, flood",
      "text": "A frame from `aaaa.aaaa.aaaa` arrived on Fa0/1, so PC-A **must** be on Fa0/1: learned. The destination `cccc.cccc.cccc` is unknown, so SW1 **floods** the frame out every other port. PC-B and PC-D see it isn't for them and discard it.\n\nTable: aaaa → Fa0/1.",
      "nodes": {
        "PCA": {
          "badge": "learned Fa0/1",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PCA",
            "SW1",
            "PCB"
          ],
          "label": "to cccc (unknown)",
          "tone": "warn"
        },
        {
          "path": [
            "PCA",
            "SW1",
            "PCC"
          ],
          "label": "to cccc (unknown)",
          "tone": "warn"
        },
        {
          "path": [
            "PCA",
            "SW1",
            "PCD"
          ],
          "label": "to cccc (unknown)",
          "tone": "warn"
        }
      ]
    },
    {
      "title": "3. PC-C replies: forward, and learn C",
      "text": "The reply's destination, `aaaa.aaaa.aaaa`, is in the table, so it goes **only** out Fa0/1. Its source teaches SW1 that PC-C is on Fa0/3.\n\nTable: aaaa → Fa0/1, cccc → Fa0/3.",
      "nodes": {
        "PCC": {
          "badge": "learned Fa0/3",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PCC",
            "SW1",
            "PCA"
          ],
          "label": "to aaaa (known)"
        }
      ]
    },
    {
      "title": "4. Now traffic goes straight through",
      "text": "Both ends are known, so PC-A's next frame to PC-C is **forwarded** out Fa0/3 alone. PC-B and PC-D never see it. Flooding was a one-time cost.",
      "packets": [
        {
          "path": [
            "PCA",
            "SW1",
            "PCC"
          ],
          "label": "to cccc (known)",
          "tone": "good"
        }
      ]
    },
    {
      "title": "5. PC-B to PC-D: learn B, flood again",
      "text": "PC-B's source is learned on Fa0/2. PC-D has never spoken, so its MAC is still unknown and this frame floods too, until PC-D replies.\n\nTable: aaaa → Fa0/1, bbbb → Fa0/2, cccc → Fa0/3, dddd → ???",
      "nodes": {
        "PCB": {
          "badge": "learned Fa0/2",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PCB",
            "SW1",
            "PCA"
          ],
          "label": "to dddd (unknown)",
          "tone": "warn"
        },
        {
          "path": [
            "PCB",
            "SW1",
            "PCC"
          ],
          "label": "to dddd (unknown)",
          "tone": "warn"
        },
        {
          "path": [
            "PCB",
            "SW1",
            "PCD"
          ],
          "label": "to dddd (unknown)",
          "tone": "warn"
        }
      ]
    },
    {
      "title": "6. Silence ages an entry out",
      "text": "PC-C sends nothing for **300 seconds** (the default aging time), so SW1 forgets it. That keeps the table fresh if PC-C moves. The next frame to PC-C floods again, and PC-C's reply puts it straight back.",
      "nodes": {
        "PCC": {
          "badge": "aged out",
          "tone": "muted",
          "state": "dim"
        }
      }
    }
  ]
}
```

**Let's understand WHY the switch behaves this way — every step has a smart reason:**

- **Why learn from the SOURCE, not the destination?** Because the source is a **fact the switch can trust**: a frame physically arrived on port 1 carrying source MAC AA, so AA *must* be reachable through port 1 — no guessing. The destination, on the other hand, is just a *request* ("please deliver to CC") that the switch may not know yet. You learn from what already happened, not from what's being asked.

- **Why FLOOD an unknown destination instead of dropping it?** Because dropping it would break communication for a device the switch simply hasn't heard from *yet*. The switch reasons: *"I don't know where CC is, but CC probably exists — let me send this out every port so it reaches CC wherever it is."* Flooding guarantees delivery even before learning is complete. And it's self-correcting: the moment CC replies, the switch **learns CC's port from that reply** and never has to flood to CC again. So flooding is a one-time "I'll shout until I learn," not a permanent waste.

- **Why FILTER (drop) a frame whose destination is on the same port it came in on?** Because that device is already on that wire — it doesn't need the switch to echo the frame back the way it came. Sending it back would be pointless noise.

- **Why AGE OUT (forget) quiet devices after ~300 seconds?** Two reasons. First, the MAC table has **limited memory** — you can't remember every device forever. Second, devices **move** (unplugged and plugged into a different port, or a laptop roams). If the switch remembered the old port forever, it would keep sending frames to the *wrong* place after a device moved. Forgetting stale entries keeps the map **fresh and correct**. If the device is still active, it'll send another frame and get re-learned instantly — so nothing is lost.

**📝 Exam-style questions — 6.2**

**Q1.** Refer to the exhibit. A frame arrives on Fa0/2 with destination MAC `0011.2233.44dd`. All ports are in VLAN 1. What does SW1 do?

```
SW1# show mac address-table dynamic
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    0011.2233.44aa    DYNAMIC     Fa0/1
   1    0011.2233.44bb    DYNAMIC     Fa0/2
   1    0011.2233.44cc    DYNAMIC     Fa0/3
```

- **A.** It drops the frame, because the destination is unknown.
- **B.** It floods the frame out every port in VLAN 1 except Fa0/2.
- **C.** It floods the frame out every port in VLAN 1, including Fa0/2.
- **D.** It sends the frame out Fa0/1 only, the first port in the table.

<details><summary>Answer</summary>

**Answer: B.** `0011.2233.44dd` isn't in the table, so this is an **unknown unicast**: the switch floods it out every port in the VLAN except the one it came in on, trusting the real owner to answer so it can learn where it lives. **Why not the others:** dropping it (A) would break communication with a device the switch simply hasn't heard from yet. Sending it back out the arrival port (C) is pointless. The table's order means nothing (D); an unknown MAC isn't tied to any port.
</details>

**Q2.** PC1 and PC2 are both plugged into a hub, and the hub connects to switch port Fa0/5. The switch has learned both PCs' MACs on Fa0/5. PC1 sends a frame to PC2. What does the switch do?

- **A.** It filters (drops) the frame, because the destination is on the same port the frame arrived on.
- **B.** It sends the frame back out Fa0/5 so PC2 receives it.
- **C.** It floods the frame out every port.
- **D.** It moves PC2's entry to a different port.

<details><summary>Answer</summary>

**Answer: A.** PC2 is on the same wire as PC1, behind the hub, so it has *already* received the frame. The switch sees the destination is on the arrival port and **filters** it. **Why not the others:** echoing it back (B) would just duplicate what PC2 already heard. Both MACs are known, so there's no reason to flood (C). Nothing has moved, so the table stays as it is (D).
</details>

**Q3.** A user unplugs her laptop from Fa0/3 and plugs it into Fa0/7 on the same switch and VLAN. The laptop immediately sends a frame. What happens to its MAC table entry?

- **A.** The switch updates the entry to point to Fa0/7 as soon as it sees the laptop's source MAC there.
- **B.** The entry stays on Fa0/3 until the 300-second aging timer expires.
- **C.** The switch shuts down Fa0/7, because the MAC address is already known on another port.
- **D.** The switch keeps two entries, one on Fa0/3 and one on Fa0/7.

<details><summary>Answer</summary>

**Answer: A.** Learning from the source address works both ways: the first frame from the laptop on Fa0/7 proves where it is now, so the switch moves the entry straight away. **Why not the others:** the aging timer (B) only cleans up devices that go *quiet*; an active device is re-learned the moment it speaks. Shutting the port (C) is something port security might do, not normal learning. A MAC address lives on one port per VLAN (D); two entries would leave the switch not knowing where to send.
</details>

**Q4.** By default, how long does a Cisco Catalyst switch keep a dynamic MAC address entry for a device that has gone silent?

- **A.** 30 seconds
- **B.** 60 seconds
- **C.** 300 seconds
- **D.** 4 hours

<details><summary>Answer</summary>

**Answer: C.** The default MAC aging time is **300 seconds** (5 minutes). A device that stays quiet that long is forgotten, and re-learned the moment it sends again. **Why not the others:** 30 and 60 seconds (A, B) are not the default; too short a timer would cause extra flooding. 4 hours (D) is the default **ARP** cache timeout on a Cisco router, a different table entirely.
</details>

## 6.3 Collision Domains vs. Broadcast Domains

![Collision domains per port, broadcast domains per router side](images/domains.png)

Two important ideas:

- **Collision Domain:** An area where two frames could collide. **Each switch port is its own collision domain** (that's why switches are great — tiny collision domains = no collisions).
- **Broadcast Domain:** An area where a broadcast reaches everyone. **All ports on a switch are one broadcast domain** by default. A **router** (or a VLAN) breaks up broadcast domains.

```
 HUB:   one big collision domain (everyone can crash) ❌
 SWITCH: each port = own collision domain ✅
         but all ports = one broadcast domain
 ROUTER: each interface = own broadcast domain ✅
```

**Memory trick:** **Switches break up collision domains. Routers break up broadcast domains.**

Step through it on a small network with a switch on one side of a router and a hub on the other:

```diagram
{
  "type": "topology",
  "title": "Counting collision and broadcast domains",
  "caption": "The shaded areas are the broadcast domains. Press **Next**.",
  "nodes": [
    {
      "id": "R1",
      "kind": "router",
      "x": 2.5,
      "y": 0
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 1,
      "y": 1.3
    },
    {
      "id": "HUB",
      "kind": "switch",
      "x": 4,
      "y": 1.3,
      "label": "HUB1"
    },
    {
      "id": "PC1",
      "kind": "host",
      "x": 0.4,
      "y": 2.7
    },
    {
      "id": "PC2",
      "kind": "host",
      "x": 1.6,
      "y": 2.7
    },
    {
      "id": "PC3",
      "kind": "host",
      "x": 3.4,
      "y": 2.7
    },
    {
      "id": "PC4",
      "kind": "host",
      "x": 4.6,
      "y": 2.7
    }
  ],
  "links": [
    {
      "a": "R1",
      "b": "SW1",
      "aLabel": "Gi0/0"
    },
    {
      "a": "R1",
      "b": "HUB",
      "aLabel": "Gi0/1"
    },
    {
      "a": "SW1",
      "b": "PC1"
    },
    {
      "a": "SW1",
      "b": "PC2"
    },
    {
      "a": "HUB",
      "b": "PC3"
    },
    {
      "a": "HUB",
      "b": "PC4"
    }
  ],
  "zones": [
    {
      "label": "Broadcast domain 1",
      "nodes": [
        "SW1",
        "PC1",
        "PC2"
      ],
      "tone": "accent"
    },
    {
      "label": "Broadcast domain 2",
      "nodes": [
        "HUB",
        "PC3",
        "PC4"
      ],
      "tone": "purple"
    }
  ],
  "steps": [
    {
      "title": "1. A broadcast floods its own side",
      "text": "PC1 sends an ARP broadcast. SW1 floods it to PC2 and to R1's Gi0/0, as it must. R1 receives it but **does not forward it** out Gi0/1.",
      "nodes": {
        "R1": {
          "badge": "stops here",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "PC1",
            "SW1",
            "PC2"
          ],
          "label": "broadcast",
          "tone": "warn"
        },
        {
          "path": [
            "PC1",
            "SW1",
            "R1"
          ],
          "label": "broadcast",
          "tone": "warn"
        }
      ]
    },
    {
      "title": "2. The router is the wall",
      "text": "The same happens on the other side: PC3's broadcast reaches PC4 and R1's Gi0/1, and stops there. **One broadcast domain per router interface**: two here.",
      "packets": [
        {
          "path": [
            "PC3",
            "HUB",
            "PC4"
          ],
          "label": "broadcast",
          "tone": "warn"
        },
        {
          "path": [
            "PC3",
            "HUB",
            "R1"
          ],
          "label": "broadcast",
          "tone": "warn"
        }
      ]
    },
    {
      "title": "3. On the switch: one collision domain per port",
      "text": "Each of SW1's ports is its own collision domain: the link to PC1, the link to PC2 and the link to R1. That's **3**, and with full-duplex none of them ever sees a collision.",
      "focus": [
        "SW1",
        "PC1",
        "PC2",
        "R1",
        "SW1-PC1",
        "SW1-PC2",
        "R1-SW1"
      ],
      "nodes": {
        "R1": null,
        "SW1": {
          "badge": "3 col. domains",
          "tone": "good"
        }
      }
    },
    {
      "title": "4. On the hub: everything shares one",
      "text": "A hub repeats every signal to every port, so PC3, PC4 and R1's Gi0/1 all share **one** collision domain. Total: **4 collision domains, 2 broadcast domains**. Swap the hub for a switch and it becomes 5 and 2.",
      "focus": [
        "HUB",
        "PC3",
        "PC4",
        "R1",
        "HUB-PC3",
        "HUB-PC4",
        "R1-HUB"
      ],
      "nodes": {
        "SW1": null,
        "HUB": {
          "badge": "1 col. domain",
          "tone": "warn"
        }
      }
    }
  ]
}
```

**Why do these two "domains" even matter in real life?** Because they're really two different questions about *how big a problem can spread*:

- A **collision domain** asks *"how many devices are fighting over one wire?"* Bigger collision domains = more crashes = slower network. Switches shrink each collision domain down to a **single wire** (one device), which is *why* replacing hubs with switches was such a massive speed boost — nobody fights over the wire anymore.
- A **broadcast domain** asks *"how far does a 'HEY EVERYONE!' shout travel?"* Every device in the domain must stop and process every broadcast. Too many devices in one broadcast domain = everyone drowning in broadcast noise (exactly the problem VLANs and routers solve, from Chapter 1 and Chapter 7). *This is why we care:* keeping broadcast domains a reasonable size is the difference between a snappy network and a sluggish one. Switches can't shrink broadcast domains on their own — only **routers** (or **VLANs**, which are just broadcast domains in software) can. That single fact drives a huge amount of network design.

**📝 Exam-style questions — 6.3**

**Q1.** Refer to the exhibit. How many collision domains and broadcast domains are there? All switch ports and router interfaces are in use as shown, and there are no VLANs beyond the default.

```
                 [ R1 ]
          Gi0/0 /      \ Gi0/1
               /        \
            [SW1]      [HUB1]
           /  |  \     /  |  \
        PC1  PC2  PC3 PC4 PC5 PC6
```

- **A.** 5 collision domains and 2 broadcast domains
- **B.** 7 collision domains and 2 broadcast domains
- **C.** 4 collision domains and 1 broadcast domain
- **D.** 5 collision domains and 1 broadcast domain

<details><summary>Answer</summary>

**Answer: A.** Every **switch port** is its own collision domain: SW1 uses four ports (PC1, PC2, PC3 and the link to R1), so that's 4. Everything on the **hub** is one shared collision domain: +1, total **5**. The router stops broadcasts, so each router interface is its own broadcast domain: **2**. **Why not the others:** 7 (B) counts each hub port separately, but a hub repeats everything everywhere, so it's all one domain. C forgets the hub side entirely and the router's broadcast split. D gets the collision domains right but ignores that R1 separates the two broadcast domains.
</details>

**Q2.** Which device, by default, breaks up broadcast domains?

- **A.** Router
- **B.** Layer 2 switch
- **C.** Hub
- **D.** Access point

<details><summary>Answer</summary>

**Answer: A.** Routers don't forward broadcasts, so each router interface marks the edge of a broadcast domain. **Why not the others:** a Layer 2 switch (B) floods broadcasts out every port in the VLAN; it breaks up *collision* domains, not broadcast domains. A hub (C) breaks up nothing. An access point (D) bridges wireless clients onto the wired LAN, so they share the same broadcast domain.
</details>

**Q3.** Which two statements are true? (Choose two.)

- **A.** Each port on a switch is a separate collision domain.
- **B.** All ports on a hub share one collision domain.
- **C.** Each port on a switch is a separate broadcast domain.
- **D.** A router forwards broadcasts between its interfaces.
- **E.** Each port on a hub is a separate broadcast domain.

<details><summary>Answer</summary>

**Answer: A, B.** Switches shrink collision domains to one port each; a hub is one big shared wire. **Why not the others:** all the ports of a switch (in one VLAN) are one broadcast domain (C). Routers *stop* broadcasts (D). A hub repeats everything, broadcasts included, to every port (E).
</details>

**Q4.** Why is a very large broadcast domain a problem?

- **A.** Every device in it has to receive and process every broadcast, so broadcast traffic steals bandwidth and CPU from everyone.
- **B.** Broadcasts cause collisions on full-duplex switch ports.
- **C.** Switches can only learn 100 MAC addresses per broadcast domain.
- **D.** Routers inside the broadcast domain must forward every broadcast.

<details><summary>Answer</summary>

**Answer: A.** A broadcast must be handled by every device in the domain. With thousands of devices, the background "HEY EVERYONE!" noise grows until real traffic suffers. That's why we cut networks up with routers and VLANs. **Why not the others:** full-duplex ports can't have collisions (B). There's no 100-address limit (C); switches hold thousands. Routers don't forward broadcasts at all (D); they're the boundary of the domain.
</details>

## 6.4 Meeting the Cisco IOS (The Switch's Brain)

Cisco devices run an operating system called **IOS** (Internetwork Operating System). You type commands to configure them. Let's learn the modes:

```
 Switch>              ← User EXEC mode (look, but limited)
 Switch#              ← Privileged EXEC mode (full view, "enable")
 Switch(config)#      ← Global Config mode (change settings)
 Switch(config-if)#   ← Interface Config (change one port)
```

**How to move between modes:**

```
Switch> enable                 ← go from User to Privileged (# prompt)
Switch# configure terminal     ← go into Global Config
Switch(config)# interface fa0/1  ← go into one interface
Switch(config-if)# exit        ← go back one level
Switch(config)# end            ← jump all the way back to Privileged
```

**📝 Exam-style questions — 6.4**

**Q1.** Which prompt shows that you are in privileged EXEC mode?

- **A.** `Switch>`
- **B.** `Switch#`
- **C.** `Switch(config)#`
- **D.** `Switch(config-if)#`

<details><summary>Answer</summary>

**Answer: B.** The `#` on its own after the hostname means **privileged EXEC**, the mode `enable` takes you to. **Why not the others:** `>` (A) is user EXEC, where you can only look at a little. `(config)#` (C) is global configuration and `(config-if)#` (D) is interface configuration; both are configuration modes, not privileged EXEC.
</details>

**Q2.** You are at `SW1(config-if)#` and want to get back to `SW1#` with one command. Which command do you use?

- **A.** `exit`
- **B.** `end`
- **C.** `disable`
- **D.** `logout`

<details><summary>Answer</summary>

**Answer: B.** `end` (or Ctrl+Z) jumps from any configuration mode straight back to privileged EXEC. **Why not the others:** `exit` (A) goes back only one level, to `SW1(config)#`. `disable` (C) drops from privileged EXEC to user EXEC and isn't a configuration-mode command. `logout` (D) ends the session altogether.
</details>

**Q3.** Refer to the exhibit. How can the engineer view the running configuration without leaving global configuration mode?

```
SW1(config)# show running-config
                  ^
% Invalid input detected at '^' marker.
```

- **A.** `do show running-config`
- **B.** `enable show running-config`
- **C.** `exec show running-config`
- **D.** `show running-config all`

<details><summary>Answer</summary>

**Answer: A.** `show` commands belong to EXEC mode, so configuration mode rejects them. Putting **`do`** in front runs an EXEC command from any configuration mode. **Why not the others:** `enable` (B) moves from user EXEC to privileged EXEC; it doesn't run other commands. `exec` (C) doesn't run commands; under a `line` it only turns the EXEC shell on or off for that line. Adding `all` (D) is still a `show` command, so config mode rejects it just the same.
</details>

## 6.5 Your First Switch Configuration (Try It!)

Here's a friendly starter config with comments explaining each line:

```
Switch> enable
Switch# configure terminal
Switch(config)# hostname SW1                 ! name the switch "SW1"
SW1(config)# enable secret MyPass123         ! password to enter privileged mode
SW1(config)# line console 0                  ! configure the console port
SW1(config-line)# password ConsolePass       ! set a console password
SW1(config-line)# login                      ! require the password
SW1(config-line)# exit
SW1(config)# service password-encryption     ! scramble passwords in the config
SW1(config)# banner motd #Authorized Users Only!#  ! warning message
SW1(config)# exit
SW1# copy running-config startup-config      ! SAVE! (or it's lost on reboot)
```

> **Super important:** `running-config` is the **live** config in memory (lost on reboot). `startup-config` is **saved** to storage. Always `copy running-config startup-config` (or `write memory`) to save your work!

**📝 Exam-style questions — 6.5**

**Q1.** What does `copy running-config startup-config` do?

- **A.** It saves the live configuration from RAM to NVRAM, so it survives a reload.
- **B.** It replaces the live configuration with the saved one.
- **C.** It copies the configuration to a TFTP server.
- **D.** It erases the saved configuration.

<details><summary>Answer</summary>

**Answer: A.** The **running-config** lives in RAM and vanishes on reload; the **startup-config** in NVRAM is what the switch loads at boot. Copying running to startup saves your work (`write memory` does the same). **Why not the others:** B is the opposite direction (`copy startup-config running-config`, which actually *merges* rather than replaces). Copying to TFTP (C) is `copy running-config tftp:`. Erasing the saved config (D) is `erase startup-config`.
</details>

**Q2.** Refer to the exhibit. An engineer expects the console to ask for a password, but it doesn't. Why?

```
SW1# show running-config | section line con
line con 0
 password ConsolePass
```

- **A.** The `login` command is missing, so the password is never checked.
- **B.** The password must be encrypted with `service password-encryption` before it works.
- **C.** Console passwords only apply to SSH users.
- **D.** The `enable secret` command overrides the console password.

<details><summary>Answer</summary>

**Answer: A.** `password` only *stores* a password; `login` tells the line to *ask* for it. Without `login`, anyone at the console walks straight in. **Why not the others:** `service password-encryption` (B) just hides the password in the config file; it doesn't change whether it's checked. The console line is for the console, not SSH (C). `enable secret` (D) protects the step into privileged EXEC; it doesn't affect the console login.
</details>

**Q3.** A switch has both `enable password Cisco1` and `enable secret Cisco2` configured. Which password gets you into privileged EXEC mode?

- **A.** Cisco1
- **B.** Cisco2
- **C.** Either one
- **D.** Neither, because the two commands conflict

<details><summary>Answer</summary>

**Answer: B.** When both exist, **`enable secret` wins**, because it's stored as a proper hash and is the more secure of the two. **Why not the others:** `enable password` (A) is ignored while a secret is set. Only one is accepted (C). IOS allows both lines in the config (D); it just uses the secret.
</details>

**Q4.** What does `service password-encryption` do?

- **A.** It hides plain-text passwords in the configuration with weak, reversible (type 7) encryption.
- **B.** It hashes every password with strong encryption that can't be reversed.
- **C.** It encrypts all management traffic sent to the switch.
- **D.** It requires users to enter a password before reaching user EXEC mode.

<details><summary>Answer</summary>

**Answer: A.** It scrambles passwords like the console and vty `password` lines so they don't show in plain text over someone's shoulder, but type 7 is easy to reverse, so it's a privacy screen, not real protection. **Why not the others:** strong one-way hashing (B) is what `enable secret` and `username ... secret` give you. Encrypting management traffic (C) is SSH's job. Requiring a password at login (D) is what `login` does.
</details>

## 6.6 Setting Up Remote Management (SSH)

To manage a switch over the network (not just the console cable), set up **SSH** (secure) — never Telnet (unsecure). A switch needs an IP address on a **management VLAN** for this:

```
SW1(config)# ip domain-name mycompany.com
SW1(config)# crypto key generate rsa         ! creates encryption keys (choose 1024+)
SW1(config)# username admin secret AdminPass ! a login account
SW1(config)# interface vlan 1
SW1(config-if)# ip address 192.168.1.10 255.255.255.0  ! management IP
SW1(config-if)# no shutdown                  ! turn the interface ON
SW1(config-if)# exit
SW1(config)# ip default-gateway 192.168.1.1  ! how to reach other networks
SW1(config)# line vty 0 15                   ! the 16 virtual "remote login" lines
SW1(config-line)# transport input ssh        ! allow SSH only (block Telnet)
SW1(config-line)# login local                ! use the username/password above
SW1(config-line)# exit
```

Step through an SSH login from an admin PC on another subnet, and see which line of that configuration each step needs:

```diagram
{
  "type": "sequence",
  "title": "What each SSH setting is for",
  "actors": [
    {
      "id": "ADM",
      "kind": "host",
      "label": "Admin PC"
    },
    {
      "id": "SW1",
      "kind": "switch",
      "label": "SW1"
    }
  ],
  "messages": [
    {
      "from": "ADM",
      "to": "SW1",
      "label": "TCP SYN to port 22",
      "detail": "to 192.168.1.10",
      "text": "The admin PC, 10.10.20.50, is on another subnet. Its request is addressed to the switch's management IP, 192.168.1.10, so the switch needs `interface vlan 1` with an `ip address` and `no shutdown`. A Layer 2 switch has no other IP address to reach."
    },
    {
      "from": "SW1",
      "to": "ADM",
      "label": "SYN-ACK",
      "detail": "via default gateway",
      "text": "The admin is on **another subnet**, so the switch hands its reply to its `ip default-gateway`. Without that line the reply has nowhere to go and the session just hangs."
    },
    {
      "from": "ADM",
      "to": "SW1",
      "label": "ACK",
      "text": "TCP is up. The vty line accepts it because `transport input ssh` lists SSH. A Telnet attempt to port 23 would be refused right here."
    },
    {
      "from": "SW1",
      "to": "ADM",
      "label": "RSA host key",
      "text": "The key pair comes from `crypto key generate rsa`, which needed the hostname and `ip domain-name` first. The admin's SSH client checks and remembers this key."
    },
    {
      "note": "Key exchange: session now encrypted",
      "over": [
        "ADM",
        "SW1"
      ],
      "text": "Both sides agree on session keys. From here on, everything, including the password, crosses the network encrypted. That's the whole reason to use SSH and never Telnet."
    },
    {
      "from": "ADM",
      "to": "SW1",
      "label": "username + password",
      "detail": "inside the encryption",
      "text": "`login local` tells the vty lines to check the switch's own user list, created by `username admin secret ...`."
    },
    {
      "from": "SW1",
      "to": "ADM",
      "label": "SW1> prompt",
      "tone": "good",
      "states": {
        "ADM": "logged in"
      },
      "text": "The admin lands in **user EXEC**. Typing `enable` and the enable secret gets to `SW1#`."
    }
  ]
}
```

**📝 Exam-style questions — 6.6**

**Q1.** An engineer enters `crypto key generate rsa` on a brand-new switch and IOS rejects it. Which two settings are needed first? (Choose two.)

- **A.** A hostname other than the default
- **B.** An IP domain name, set with `ip domain-name`
- **C.** A local user account, created with `username`
- **D.** `transport input ssh` on the vty lines
- **E.** An IP address on the VLAN 1 interface

<details><summary>Answer</summary>

**Answer: A, B.** The RSA key is named after the switch's **hostname plus domain name**, so IOS refuses to generate it while the hostname is still the default or no domain name is set. **Why not the others:** a local user (C), `transport input ssh` (D) and a management IP address (E) are all needed for SSH logins to *work*, but none of them is required to generate the key.
</details>

**Q2.** Refer to the exhibit. A user tries to Telnet to the switch. What happens?

```
line vty 0 15
 login local
 transport input ssh
```

- **A.** The connection is refused, because the vty lines accept SSH only.
- **B.** The user is asked for a username and password, and Telnet works.
- **C.** Telnet works without any password, because `login local` applies to SSH only.
- **D.** The switch converts the Telnet session to SSH automatically.

<details><summary>Answer</summary>

**Answer: A.** `transport input ssh` says which protocols the vty lines accept, and Telnet isn't on the list, so the connection is refused. **Why not the others:** Telnet never reaches the login prompt (B). `login local` applies to whatever protocol the line accepts (C); here that's only SSH. Telnet and SSH are different protocols, so nothing can "convert" one into the other (D).
</details>

**Q3.** Why does a Layer 2 switch need `ip default-gateway` to be managed from another subnet?

- **A.** So that the switch can send replies to management hosts that are on other subnets
- **B.** So that the switch can route traffic between its VLANs
- **C.** So that PCs plugged into the switch can reach the internet
- **D.** So that the switch can generate its RSA keys

<details><summary>Answer</summary>

**Answer: A.** The switch's management interface is like a host: to answer an admin on another subnet, it needs a gateway to send the replies to. Without one, the SSH session from another subnet never gets its replies. **Why not the others:** a Layer 2 switch doesn't route (B); the default gateway is only for the switch's *own* traffic. PCs use their own default gateway (C), not the switch's. RSA keys (D) need a hostname and domain name, not a gateway.
</details>

**Q4.** Which command limits the vty lines to SSH only?

- **A.** `transport input ssh`
- **B.** `ip ssh version 2`
- **C.** `login local`
- **D.** `transport output ssh`

<details><summary>Answer</summary>

**Answer: A.** `transport input ssh` under `line vty 0 15` controls which protocols may come *in*, so Telnet is refused. **Why not the others:** `ip ssh version 2` (B) chooses the SSH version but doesn't block Telnet. `login local` (C) says to check the local username database; it doesn't choose a protocol. `transport output` (D) controls connections made *from* the switch to other devices, not into it.
</details>

## 6.7 Helpful "Show" Commands (Your Eyes Into the Switch)

| Command | What it shows |
|---------|---------------|
| `show running-config` | The current live configuration |
| `show mac address-table` | What MACs the switch learned & where |
| `show interfaces status` | Which ports are up/down, speed, VLAN |
| `show ip interface brief` | Quick list of interfaces & IPs |
| `show version` | IOS version, uptime, hardware info |
| `show vlan brief` | List of VLANs and their ports |

**📝 Exam-style questions — 6.7**

**Q1.** Which command gives a short list of interfaces with their IP addresses and up/down status?

- **A.** `show ip interface brief`
- **B.** `show interfaces status`
- **C.** `show vlan brief`
- **D.** `show version`

<details><summary>Answer</summary>

**Answer: A.** `show ip interface brief` lists every interface on one line each, with its IP address, status and protocol. **Why not the others:** `show interfaces status` (B) shows switch ports with their VLAN, duplex and speed, but no IP addresses. `show vlan brief` (C) lists VLANs and their ports. `show version` (D) shows the IOS version, uptime and hardware.
</details>

**Q2.** Which command shows the IOS version, how long the switch has been up and the hardware model?

- **A.** `show running-config`
- **B.** `show version`
- **C.** `show interfaces status`
- **D.** `show mac address-table`

<details><summary>Answer</summary>

**Answer: B.** `show version` shows the software version, uptime, model, memory and how the switch last booted. **Why not the others:** `show running-config` (A) shows the live configuration. `show interfaces status` (C) shows the ports. `show mac address-table` (D) shows which MACs were learned on which ports.
</details>

**Q3.** Refer to the exhibit. Which statement is true?

```
SW1# show interfaces status

Port      Name         Status       Vlan   Duplex  Speed Type
Fa0/1     PC-Finance   connected    10     a-full  a-100 10/100BaseTX
Fa0/2                  notconnect   1        auto   auto 10/100BaseTX
Fa0/3     Printer      err-disabled 10       auto   auto 10/100BaseTX
Gi0/1     Uplink       connected    trunk    full   1000 10/100/1000BaseTX
```

- **A.** Fa0/1 auto-negotiated full-duplex at 100 Mbps.
- **B.** Fa0/3 was shut down by an administrator with the `shutdown` command.
- **C.** Gi0/1 is an access port in VLAN 1.
- **D.** Fa0/2 has a device attached and is passing traffic.

<details><summary>Answer</summary>

**Answer: A.** The `a-` prefix means the value was **auto-negotiated**, so `a-full` and `a-100` say Fa0/1 negotiated full-duplex at 100 Mbps. **Why not the others:** a port shut down by an administrator shows **disabled** (B); **err-disabled** means the switch shut it down itself, for example after a port-security violation. Gi0/1's VLAN column says **trunk** (C). **notconnect** (D) means no link, so nothing working is plugged in.
</details>

## 6.8 Port Security — Locking Down a Port

**Port security** stops strangers from plugging into your network. It limits **which** and **how many** MAC addresses can use a port.

```
SW1(config)# interface fa0/1
SW1(config-if)# switchport mode access           ! make it a normal device port
SW1(config-if)# switchport port-security         ! turn on port security
SW1(config-if)# switchport port-security maximum 1   ! allow only 1 device
SW1(config-if)# switchport port-security mac-address sticky  ! remember the first MAC seen
SW1(config-if)# switchport port-security violation shutdown  ! if broken, shut the port
```

**Violation modes** (what happens if a rule is broken):
- **protect:** Silently drop the bad traffic. No alert.
- **restrict:** Drop the bad traffic AND log/alert.
- **shutdown:** Turn the port off completely (default). Needs an admin to turn it back on.

**Story Time 📖:** Port security is like a locker that only opens for the first backpack you put in it. If a different backpack tries, the locker can ignore it (protect), ignore-and-tattle (restrict), or slam shut and refuse everyone (shutdown).

Step through a violation with the configuration above:

```diagram
{
  "type": "topology",
  "title": "Port security: sticky learning and a shutdown violation",
  "caption": "Fa0/1 allows **one** MAC address, learned sticky, with violation mode **shutdown**. Both devices use the same wall jack, Fa0/1. Press **Next**.",
  "nodes": [
    {
      "id": "SW1",
      "kind": "switch",
      "x": 2,
      "y": 0,
      "sub": "Fa0/1: max 1"
    },
    {
      "id": "PC1",
      "kind": "host",
      "x": 0.8,
      "y": 1.6,
      "label": "PC1",
      "sub": "0050.7966.6801"
    },
    {
      "id": "LAP",
      "kind": "host",
      "x": 3.2,
      "y": 1.6,
      "label": "Visitor laptop",
      "sub": "0050.7966.6802"
    }
  ],
  "links": [
    {
      "id": "p1",
      "a": "SW1",
      "b": "PC1"
    },
    {
      "id": "p2",
      "a": "SW1",
      "b": "LAP",
      "style": "dashed"
    }
  ],
  "steps": [
    {
      "title": "1. Sticky learns the first MAC",
      "text": "PC1 sends its first frame. With `mac-address sticky`, SW1 learns `0050.7966.6801` and writes it into the running-config as a secure address. That's the one allowed MAC (`maximum 1`). Save the config, or the sticky address is lost on reload.",
      "nodes": {
        "LAP": {
          "state": "dim"
        },
        "SW1": {
          "badge": "sticky 6801",
          "tone": "good"
        }
      },
      "links": {
        "p2": "dim"
      },
      "packets": [
        {
          "path": [
            "PC1",
            "SW1"
          ],
          "label": "src 6801"
        }
      ]
    },
    {
      "title": "2. Someone plugs in a laptop instead",
      "text": "A visitor unplugs PC1 and plugs a laptop into the same jack. Its first frame has source `0050.7966.6802`, a second MAC on a port that allows one. That's a **violation**.",
      "nodes": {
        "PC1": {
          "state": "dim"
        },
        "LAP": null
      },
      "links": {
        "p1": "dim",
        "p2": null
      },
      "packets": [
        {
          "path": [
            "LAP",
            "SW1"
          ],
          "label": "src 6802",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "3. Shutdown mode err-disables the port",
      "text": "In **shutdown** mode (the default) SW1 puts Fa0/1 into **err-disabled**: no traffic at all, a log message, and the violation counter goes up. **restrict** would instead drop only the laptop's frames and log them; **protect** would drop them silently. Either way the port would stay up.",
      "nodes": {
        "SW1": {
          "badge": "err-disabled",
          "tone": "bad"
        }
      },
      "links": {
        "p2": "down"
      }
    },
    {
      "title": "4. Recovery takes an administrator",
      "text": "The laptop is removed and PC1 is plugged back in, but the port stays dead until an admin enters `shutdown` then `no shutdown` on Fa0/1 (unless `errdisable recovery` has been configured). Then PC1's sticky MAC is allowed again.",
      "nodes": {
        "SW1": {
          "badge": "secure-up",
          "tone": "good"
        },
        "PC1": null,
        "LAP": {
          "state": "dim"
        }
      },
      "links": {
        "p1": null,
        "p2": "dim"
      },
      "packets": [
        {
          "path": [
            "PC1",
            "SW1"
          ],
          "label": "src 6801",
          "tone": "good"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 6.8**

**Q1.** Which violation mode drops traffic from unknown MAC addresses, increments the violation counter and sends a log message, but leaves the port up?

- **A.** protect
- **B.** restrict
- **C.** shutdown
- **D.** sticky

<details><summary>Answer</summary>

**Answer: B.** **restrict** drops the offending frames *and* tells you about it (syslog, SNMP and the violation counter), while legitimate traffic keeps flowing. **Why not the others:** **protect** (A) drops silently, with no log and no counter. **shutdown** (C) err-disables the whole port. **sticky** (D) isn't a violation mode at all; it's how the switch learns and saves allowed MACs.
</details>

**Q2.** Refer to the exhibit. The unauthorized device has been removed. What must the administrator do to bring Fa0/1 back into service?

```
SW1# show port-security interface fa0/1
Port Security              : Enabled
Port Status                : Secure-shutdown
Violation Mode             : Shutdown
Aging Time                 : 0 mins
Aging Type                 : Absolute
SecureStatic Address Aging : Disabled
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 1
Last Source Address:Vlan   : 0050.7966.6802:1
Security Violation Count   : 1
```

- **A.** Enter `shutdown` and then `no shutdown` on Fa0/1.
- **B.** Nothing; the port recovers by itself after 300 seconds.
- **C.** Enter `no switchport port-security violation shutdown` on Fa0/1.
- **D.** Enter `clear mac address-table dynamic` on SW1.

<details><summary>Answer</summary>

**Answer: A.** In **shutdown** mode a violation puts the port in the err-disabled state ("Secure-shutdown"). It stays there until someone bounces it with `shutdown` then `no shutdown`. **Why not the others:** there's no automatic recovery by default (B); you'd have to configure `errdisable recovery cause psecure-violation` for that. Changing the violation mode (C) affects *future* violations; it doesn't revive a port that's already err-disabled. Clearing dynamic MAC entries (D) doesn't touch the port's state, and the sticky address isn't a dynamic entry anyway.
</details>

**Q3.** If you enable port security without choosing a violation mode, which mode is used?

- **A.** protect
- **B.** restrict
- **C.** shutdown
- **D.** None; the command fails until a mode is set

<details><summary>Answer</summary>

**Answer: C.** **shutdown** is the default, so the first unknown MAC err-disables the port. **Why not the others:** protect (A) and restrict (B) must be configured explicitly. Port security works without naming a mode (D), because shutdown is assumed.
</details>

**Q4.** On a switch port left at its default `switchport mode dynamic auto`, the command `switchport port-security` is rejected. Why does the configuration set `switchport mode access` first?

- **A.** Port security can't be enabled on a dynamic (DTP) port, because the port might become a trunk.
- **B.** `switchport mode access` turns on MAC learning, which is off by default.
- **C.** Access mode is needed for the port to supply PoE.
- **D.** Port security only works on ports in VLAN 1, and access mode puts the port there.

<details><summary>Answer</summary>

**Answer: A.** IOS answers "Command rejected: ... is a dynamic port." A port that might negotiate itself into a trunk is a moving target, so port security wants a port fixed as access (or a static trunk). **Why not the others:** MAC learning is always on (B). PoE doesn't depend on the switchport mode (C). Port security works in any VLAN (D), and access mode doesn't change the port's VLAN.
</details>

---

<a name="chapter-7"></a>
# Chapter 7: VLANs — Splitting One Switch Into Many

## 7.1 The Problem VLANs Solve (Let's Really Understand This)

![One physical switch carrying three VLANs](images/vlans.png)

To understand *why* VLANs exist, we first have to feel the **pain of not having them**. So let's build up the problem slowly, step by step.

### Step 1: Remember what a switch does by default

A plain switch puts **every port in one big network**. Any device can talk to any other device. More importantly — and this is the key — **a broadcast from one device reaches EVERY other device** on that switch.

Remember broadcasts? They're the "HEY EVERYONE!" messages (destination MAC `FF:FF:FF:FF:FF:FF`). Devices send them constantly for normal things:
- **ARP** ("Who has IP 192.168.1.5? Tell me your MAC!")
- **DHCP** ("Any DHCP server out there? I need an address!")
- Windows network discovery, printer announcements, and more.

A switch **must flood every broadcast out of every port**. It has no choice — that's the rule. The area a broadcast reaches is called a **broadcast domain**.

### Step 2: Now picture a real school with one flat network

Imagine a school with **200 devices** all plugged into switches, all in one broadcast domain: student laptops, teacher PCs, the principal's computer, printers, security cameras, and the payroll server.

**Problem A — Broadcast noise (performance):**
Every one of those 200 devices sends broadcasts. Every broadcast goes to **all 200 devices**. Each device's CPU has to stop and inspect every broadcast, even ones meant for nobody it cares about. With hundreds of devices, this becomes a constant storm of interruptions that **wastes bandwidth and slows everything down**.

In one flat network with no VLANs, a single PC asking *"who has 192.168.1.5?"*
sends a broadcast that reaches **all 200 devices** — laptops, printers, cameras,
the payroll server, everything. Every one of them has to stop and process a
question that almost none of them can answer. 😩

**Problem B — No security separation:**
Because everyone is on the same network, a **student laptop can try to reach the payroll server** directly. There's no wall between them. If a student's laptop gets a virus, it can spread to the principal's computer and the cameras. That's dangerous.

**Problem C — Location locks you in:**
In a flat network, "which network you're on" is decided by "which switch you physically plug into." If the principal moves to a classroom across the building, they'd be on the classroom's network — mixed in with students. To fix it, someone would have to **run new cables**. Ugh.

### Step 3: The old (bad) fix, and why VLANs are better

Before VLANs, the only way to separate groups was to **buy a separate physical switch for each group** — one switch for teachers, one for students, one for admin — and keep them totally unplugged from each other. That's expensive, wasteful (a 48-port switch with only 6 teachers uses 6 ports), and inflexible.

**VLANs solve all three problems at once** by letting you create **multiple separate networks inside a single physical switch** — invisible walls, in software.

| Setup | Broadcast domains | Who shares one |
|---|---|---|
| **Without VLANs** | **1** | Teachers, students and admin all together 😬 |
| **With VLANs** | **3** | VLAN 10 Teachers · VLAN 20 Students · VLAN 30 Admin 😌 |

And that's on the **same physical switch** — no extra hardware involved.

**The single most important sentence about VLANs:**
> **A VLAN = a broadcast domain.** When you make 3 VLANs, you've made 3 separate broadcast domains — as if you had 3 separate physical switches, even though it's one box.

Now a broadcast from a student only reaches **other students** (VLAN 20), never the teachers or the payroll server. Problem A (noise) shrinks, Problem B (security) is solved by the wall, and Problem C (location) is solved because you can just **assign a port to a VLAN with a command** instead of running cables.

Step through it below: one switch, three VLANs, and watch where each broadcast is allowed to go.

```diagram
{
  "type": "topology",
  "title": "One switch, three broadcast domains",
  "caption": "SW1 has ports in VLAN 10 (Teachers), VLAN 20 (Students) and VLAN 30 (Admin). Press **Next** to send some broadcasts.",
  "nodes": [
    {"id": "SW1", "kind": "switch", "x": 2.45, "y": 0, "sub": "VLANs 10, 20, 30", "info": "One physical switch. Each port is assigned to one VLAN, and the switch keeps a separate flooding domain for each VLAN."},
    {"id": "T1", "kind": "host", "x": 0, "y": 1.6, "label": "Teacher 1", "sub": "VLAN 10", "info": "Access port Fa0/1, VLAN 10."},
    {"id": "T2", "kind": "host", "x": 0.9, "y": 1.6, "label": "Teacher 2", "sub": "VLAN 10", "info": "Access port Fa0/2, VLAN 10."},
    {"id": "S1", "kind": "host", "x": 2.05, "y": 1.6, "label": "Student 1", "sub": "VLAN 20", "info": "Access port Fa0/3, VLAN 20."},
    {"id": "S2", "kind": "host", "x": 2.95, "y": 1.6, "label": "Student 2", "sub": "VLAN 20", "info": "Access port Fa0/4, VLAN 20."},
    {"id": "PR", "kind": "host", "x": 4.1, "y": 1.6, "label": "Principal", "sub": "VLAN 30", "info": "Access port Fa0/5, VLAN 30."},
    {"id": "PAY", "kind": "server", "x": 5.0, "y": 1.6, "label": "Payroll", "sub": "VLAN 30", "info": "Access port Fa0/6, VLAN 30. Students have no Layer 2 path to it."}
  ],
  "links": [
    {"a": "SW1", "b": "T1"}, {"a": "SW1", "b": "T2"}, {"a": "SW1", "b": "S1"},
    {"a": "SW1", "b": "S2"}, {"a": "SW1", "b": "PR"}, {"a": "SW1", "b": "PAY"}
  ],
  "zones": [
    {"label": "VLAN 10", "nodes": ["T1", "T2"], "tone": "accent"},
    {"label": "VLAN 20", "nodes": ["S1", "S2"], "tone": "good"},
    {"label": "VLAN 30", "nodes": ["PR", "PAY"], "tone": "purple"}
  ],
  "steps": [
    {"title": "1. Student 1 sends an ARP broadcast",
     "text": "Student 1 asks *who has 192.168.20.5?* The frame goes to `FFFF.FFFF.FFFF`, so the switch must flood it. The question is: flood it **where**?",
     "packets": [{"path": ["S1", "SW1"], "label": "ARP broadcast", "tone": "warn"}]},
    {"title": "2. Flooded inside VLAN 20 only",
     "text": "The frame came in on a VLAN 20 port, so SW1 floods it **only to the other VLAN 20 ports**. The teachers and the payroll server never see it. That's what *a VLAN is a broadcast domain* means.",
     "focus": ["SW1", "S1", "S2", "SW1-S1", "SW1-S2"],
     "packets": [{"path": ["SW1", "S2"], "label": "ARP broadcast", "tone": "warn"}]},
    {"title": "3. A teacher's DHCP Discover stays in VLAN 10",
     "text": "Same rule for every VLAN. Teacher 1's DHCP Discover reaches Teacher 2 and nobody else. Without VLANs, all six devices would have had to stop and read both broadcasts.",
     "focus": ["SW1", "T1", "T2", "SW1-T1", "SW1-T2"],
     "packets": [{"path": ["T1", "SW1", "T2"], "label": "DHCP Discover", "tone": "accent"}]},
    {"title": "4. Students can't reach payroll at Layer 2",
     "text": "Student 1 tries to reach the payroll server. SW1 will **never** forward a frame from a VLAN 20 port out a VLAN 30 port. The only way between VLANs is through a router, where you decide what's allowed (Chapter 8).",
     "nodes": {"PAY": {"badge": "no path", "tone": "bad"}},
     "packets": [{"path": ["S1", "SW1"], "label": "to payroll?", "tone": "bad"}]}
  ]
}
```

**📝 Exam-style questions — 7.1**

**Q1.** A new 48-port switch has every port in VLAN 1. An engineer creates VLANs 10, 20 and 30 and moves some ports into each one. The remaining ports stay in VLAN 1. How many broadcast domains does the switch now have?

- **A.** 1
- **B.** 3
- **C.** 4
- **D.** 48

<details><summary>Answer</summary>

**Answer: C.** Each VLAN is its own broadcast domain, and VLAN 1 still has ports in it, so that's VLANs 1, 10, 20 and 30: four. **Why not the others:** A is the count before any VLANs were made. B forgets that VLAN 1 is still in use by the leftover ports. D confuses broadcast domains with collision domains: every switch port is its own collision domain, but ports in the same VLAN share one broadcast domain.
</details>

**Q2.** A switch with no VLANs configured receives a broadcast frame on port Fa0/3. What does it do with the frame?

- **A.** It forwards it only out the port where the destination MAC was learned.
- **B.** It floods it out every port except Fa0/3.
- **C.** It drops it, because broadcasts need a router.
- **D.** It sends it back out Fa0/3 and every other port.

<details><summary>Answer</summary>

**Answer: B.** A broadcast goes to `FFFF.FFFF.FFFF`, which is "everyone", so the switch floods it out every port in the same VLAN (here, all of them) except the one it came in on. **Why not the others:** A describes a known unicast; no device "owns" the broadcast MAC, so there's no single port to pick. C is backwards: switches flood broadcasts, and it's routers that stop them. D is wrong because a switch never sends a frame back out the port it arrived on.
</details>

**Q3.** A school runs 200 devices in one flat network. Which two problems would splitting them into VLANs solve? (Choose two.)

- **A.** Every broadcast interrupts all 200 devices.
- **B.** Student laptops can reach the payroll server directly, with no point where traffic can be filtered.
- **C.** The school needs more IP addresses than a /24 provides.
- **D.** Frames between two devices in different VLANs no longer need a router.
- **E.** Full-duplex links suffer from collisions.

<details><summary>Answer</summary>

**Answer: A, B.** VLANs shrink each broadcast domain, so a broadcast only bothers its own group, and they separate groups so cross-group traffic has to pass a router, where ACLs can allow or block it. **Why not the others:** C is an addressing problem; VLANs don't create addresses (though each VLAN gets its own subnet). D is backwards: VLANs *create* the need for a router between groups. E is wrong because full-duplex links have no collisions to begin with.
</details>

## 7.2 Why VLANs Are Awesome (Each Benefit, With the Reasoning)

Now that you feel the problem, here's *why* each benefit actually works:

- **Security (a real wall):** Devices in different VLANs are on different networks (different subnets). A device **physically cannot** send a frame straight into another VLAN — the switch won't do it. The only way between VLANs is through a **router**, and at the router you can add rules (ACLs) to allow or block specific traffic. So VLANs turn "everyone can reach everything" into "you decide exactly who can reach what." *Example: students (VLAN 20) simply have no path to the payroll server (VLAN 30) unless you deliberately create and permit one.*

- **Smaller broadcast domains (speed):** Fewer devices per VLAN = fewer broadcasts per device = less wasted CPU and bandwidth. *Example: splitting 200 devices into four 50-device VLANs means each broadcast bothers 50 devices instead of 200.*

- **Organization by role, not location:** You group devices by **what they are** (all cameras together, all VoIP phones together), no matter where they're plugged in. *Example: a camera in the gym and a camera in the office can both be in VLAN 50, even though they're on opposite sides of the building.*

- **Flexibility (no re-cabling):** Moving someone to a different network is one command (`switchport access vlan X`), not a cabling job. *Example: the principal moves rooms; you just set their new port to VLAN 30 and they're back on the admin network instantly.*

- **Cost savings:** One physical switch does the job of several. No need to buy separate hardware per group.

Click the devices and links below to see how VLANs follow the **role** of a device rather than where it's plugged in.

```diagram
{
  "type": "topology",
  "title": "VLANs by role, not by location",
  "caption": "Two switches in different buildings, joined by a trunk. Click any device or link.",
  "nodes": [
    {"id": "R1", "kind": "router", "x": 4.5, "y": 0, "sub": "inter-VLAN gateway", "info": "The only way **between** VLANs. Here you can put ACLs, for example *VLAN 20 may not reach VLAN 30*."},
    {"id": "GYM", "kind": "switch", "x": 1, "y": 1, "label": "SW-Gym", "info": "Gym building switch. It has cameras and student laptops, each port set to the VLAN of the device's **role**."},
    {"id": "OFF", "kind": "switch", "x": 4.5, "y": 1.3, "label": "SW-Office", "info": "Office building switch. Same VLAN numbers as the gym switch, because VLANs stretch across the trunk."},
    {"id": "CAM1", "kind": "host", "x": 0, "y": 2.5, "label": "Camera 1", "sub": "VLAN 50", "info": "A camera in the gym, in **VLAN 50** with every other camera, so one rule set covers all cameras."},
    {"id": "ST", "kind": "host", "x": 1.8, "y": 2.5, "label": "Student", "sub": "VLAN 20", "info": "A student laptop in **VLAN 20**. Its broadcasts reach only other VLAN 20 ports, in either building."},
    {"id": "CAM2", "kind": "host", "x": 3.6, "y": 2.7, "label": "Camera 2", "sub": "VLAN 50", "info": "A camera in the office, also in **VLAN 50**, even though it's in a different building from Camera 1. Same group, different place."},
    {"id": "PAY", "kind": "server", "x": 5.4, "y": 2.7, "label": "Payroll", "sub": "VLAN 30", "info": "Payroll in **VLAN 30**. A student in VLAN 20 has no Layer 2 path here; anything they send must go through R1 and its rules."}
  ],
  "links": [
    {"a": "GYM", "b": "OFF", "style": "thick", "label": "trunk", "info": "A **trunk** carries VLANs 20, 30 and 50 between the buildings, tagging each frame with its VLAN (section 7.3)."},
    {"a": "OFF", "b": "R1", "style": "thick", "label": "trunk", "info": "Another trunk, so R1 can be the gateway for every VLAN (router-on-a-stick, section 8.4)."},
    {"a": "GYM", "b": "CAM1", "info": "Access port in VLAN 50."},
    {"a": "GYM", "b": "ST", "info": "Access port in VLAN 20."},
    {"a": "OFF", "b": "CAM2", "info": "Access port in VLAN 50."},
    {"a": "OFF", "b": "PAY", "info": "Access port in VLAN 30. Moving payroll to another jack is one command: `switchport access vlan 30` on the new port."}
  ]
}
```

**Big idea (and a cliffhanger):** Each VLAN is its **own broadcast domain / its own subnet**. That's great for separation — but sometimes teachers legitimately *need* to reach a shared server on another VLAN. Moving data **between** VLANs requires a **router** (or a Layer 3 switch). That's called **inter-VLAN routing**, and we cover it in Chapter 8. For now, just hold this thought: *VLANs separate; routers reconnect — on your terms.*

**📝 Exam-style questions — 7.2**

**Q1.** Student laptops in VLAN 20 and a print server in VLAN 30 are plugged into the same switch. Every access port is configured correctly. What do the students need in order to print?

- **A.** Nothing, because both VLANs are on the same switch.
- **B.** A router or Layer 3 switch to route between VLAN 20 and VLAN 30.
- **C.** A trunk between the students' ports and the print server's port.
- **D.** The same native VLAN on both access ports.

<details><summary>Answer</summary>

**Answer: B.** Different VLANs are different broadcast domains and different subnets, so getting from one to the other is routing, a Layer 3 job. **Why not the others:** A is the classic trap: being on the same box doesn't matter, the switch keeps VLANs apart by design. C is wrong because trunks carry many VLANs between network devices; they don't join VLANs together. D is wrong because native VLAN is a trunk setting and has nothing to do with access ports.
</details>

**Q2.** The principal moves to a new office. The wall jack there connects to Fa0/15, which is an access port in VLAN 20 (Students). Her PC must be in VLAN 30 (Admin). What is the simplest fix?

- **A.** Configure `switchport access vlan 30` on Fa0/15.
- **B.** Run a new cable from her office to an admin switch.
- **C.** Configure `switchport mode trunk` on Fa0/15.
- **D.** Give her PC a static IP address from the VLAN 30 subnet and leave the port alone.

<details><summary>Answer</summary>

**Answer: A.** VLAN membership is a port setting, so moving a person to a new network is one command, not a cabling job. **Why not the others:** B is the pre-VLAN way, exactly the hassle VLANs remove. C makes the port a trunk, which is for switch-to-switch links; a PC doesn't understand tags. D doesn't work: the port still puts her frames into VLAN 20, so she'd have a VLAN 30 address in the VLAN 20 broadcast domain and couldn't reach her gateway.
</details>

**Q3.** An engineer splits 200 devices from one flat network into four VLANs of 50 devices each. Which statement is true?

- **A.** Each broadcast is now processed by about 50 devices instead of 200.
- **B.** The switch's total bandwidth is now four times higher.
- **C.** Devices in different VLANs can still exchange frames directly through the switch.
- **D.** Each VLAN must now be placed on its own physical switch.

<details><summary>Answer</summary>

**Answer: A.** A broadcast only floods within its own VLAN, so it reaches the 50 devices of that VLAN instead of all 200. **Why not the others:** B is wrong because VLANs don't add bandwidth; they cut wasted broadcast traffic. C is wrong because a switch never forwards a frame from one VLAN into another. D is the opposite of the point: VLANs let one physical switch act as several.
</details>

## 7.3 Access Ports vs. Trunk Ports — The Deep "Why"

This is the concept students most often memorize without understanding. Let's make sure **you truly get it**, because once you see the problem, the answer becomes obvious.

### The core question: how does a switch remember which VLAN a frame belongs to?

Here's a subtle thing. A normal Ethernet frame has **no field that says "I'm in VLAN 20."** VLANs are a switch invention — regular frames know nothing about them. So the switch keeps that information **in its own memory**: "the frame that came in on port Fa0/2 belongs to VLAN 20, because I configured Fa0/2 as a VLAN 20 port."

As long as everything stays **inside one switch**, this works perfectly. The switch knows every port's VLAN, so it keeps VLANs separate on its own.

**But what happens when we have TWO switches?** 🤔

### The scenario that creates the whole problem

Imagine two switches, SW1 and SW2, in different parts of a building. You have VLAN 10 (Teachers) and VLAN 20 (Students) on **both** switches — because teachers and students sit in both areas.

Now, Teacher-A is plugged into SW1, and Teacher-B is plugged into SW2. They're both in VLAN 10, so they *should* be able to talk. Their frame has to travel across the **one cable that connects SW1 to SW2**.

Here's the trap. When SW1 sends Teacher-A's frame across that cable to SW2, SW2 receives a **plain Ethernet frame with no VLAN information in it**. SW2 thinks: *"A frame arrived on my uplink port... but which VLAN is it? Teachers? Students? I have no idea!"*

Picture SW1 and SW2, each holding both a Teacher (VLAN 10) and a Student
(VLAN 20), joined by **one cable**. A frame leaves SW1 — but the frame itself
carries **no label saying which VLAN it belongs to**. SW2 receives it and has no
way to answer the only question that matters: *which VLAN is this?* 😱

If that one cable were an **access port** (belongs to a single VLAN), it could only carry **one** VLAN's traffic. So you'd need a **separate cable for every VLAN** between the switches:

**The naive fix** is one cable per VLAN: a VLAN 10 cable, a VLAN 20 cable, a
VLAN 30 cable, each plugged into access ports at both ends. It works — and it
scales terribly. Twenty VLANs would mean **twenty cables** and twenty burned
ports on *each* switch. 😫

That obviously doesn't scale. We need **one cable to carry many VLANs** — but then we're back to the problem: *how does the receiving switch know which VLAN each frame belongs to?*

### The solution: tagging, and that's what a TRUNK is

The answer is beautifully simple: **before sending a frame across the shared cable, the switch attaches a little label (a "tag") that says which VLAN it belongs to.** The receiving switch reads the tag, learns the VLAN, removes the tag, and delivers the frame correctly.

A **cable/port that carries multiple VLANs by tagging frames** is called a **TRUNK**. A port that carries **just one VLAN with no tags** (for a normal end device) is called an **ACCESS** port. That's the whole distinction:

The real fix is **one trunk cable** carrying VLAN 10 *and* VLAN 20, with every
frame **tagged** with its VLAN number so SW2 knows exactly where it belongs.

| Port | Role | Carries | Tagged? |
|------|------|---------|---------|
| Fa0/1, Fa0/2 | **Access** | One VLAN each | No — for PCs |
| Fa0/24 | **Trunk** | Many VLANs | Yes — switch-to-switch |

### So: WHY access, WHY trunk? (The rule you'll never forget)

- Use an **ACCESS port** for a link to a **normal end device** (PC, printer, phone, camera, server). Why? Because that device belongs to exactly **one** VLAN and knows nothing about VLAN tags. The switch keeps the VLAN info to itself; the device just sends and receives plain frames, blissfully unaware VLANs even exist. *If you sent an ordinary PC a tagged frame, it usually wouldn't understand it.*

- Use a **TRUNK port** for a link between **two network devices that both need to carry many VLANs** — switch-to-switch, switch-to-router (for inter-VLAN routing), or switch-to-access-point. Why? Because a single cable must carry traffic for **multiple** VLANs, and tagging is the only way for the other end to tell them apart.

**One-sentence memory hook:**
> **Access = to a device (one VLAN, no tag). Trunk = between switches (many VLANs, tagged).**

Ask yourself: *"Does this link need to carry more than one VLAN?"* If **yes → trunk**. If **no (it's an end device) → access**. That single question answers it every time.

### A concrete walk-through (follow the frame!)

Let's trace Teacher-A (VLAN 10 on SW1) sending a frame to Teacher-B (VLAN 10 on SW2):

Step through the same trip below, then watch a student's frame share the same cable without mixing in.

```diagram
{
  "type": "topology",
  "title": "Follow a frame across the trunk",
  "caption": "Fa0/24 on each switch is a trunk. Every other port is an access port in the VLAN shown.",
  "nodes": [
    {"id": "TA", "kind": "host", "x": 0, "y": 0, "label": "Teacher-A", "sub": "VLAN 10"},
    {"id": "SA", "kind": "host", "x": 0, "y": 2, "label": "Student-A", "sub": "VLAN 20"},
    {"id": "SW1", "kind": "switch", "x": 1.6, "y": 1},
    {"id": "SW2", "kind": "switch", "x": 3.8, "y": 1},
    {"id": "TB", "kind": "host", "x": 5.4, "y": 0, "label": "Teacher-B", "sub": "VLAN 10"},
    {"id": "SB", "kind": "host", "x": 5.4, "y": 2, "label": "Student-B", "sub": "VLAN 20"}
  ],
  "links": [
    {"a": "SW1", "b": "TA", "aLabel": "Fa0/1"},
    {"a": "SW1", "b": "SA", "aLabel": "Fa0/2"},
    {"a": "SW1", "b": "SW2", "style": "thick", "label": "trunk", "aLabel": "Fa0/24", "bLabel": "Fa0/24"},
    {"a": "SW2", "b": "TB", "aLabel": "Fa0/5"},
    {"a": "SW2", "b": "SB", "aLabel": "Fa0/6"}
  ],
  "steps": [
    {"title": "1. A plain frame enters an access port",
     "text": "Teacher-A's PC knows nothing about VLANs. It sends an ordinary, **untagged** frame. SW1 notes *Fa0/1 is in VLAN 10*, so internally this frame is VLAN 10.",
     "packets": [{"path": ["TA", "SW1"], "label": "untagged frame"}]},
    {"title": "2. SW1 tags it for the trunk",
     "text": "The destination is behind SW2, across a cable that carries many VLANs. So SW1 **adds a tag saying VLAN 10** before sending it out Fa0/24. Without the tag, SW2 couldn't tell which VLAN it belongs to.",
     "links": {"SW1-SW2": "active"},
     "packets": [{"path": ["SW1", "SW2"], "label": "tag: VLAN 10", "tone": "accent"}]},
    {"title": "3. SW2 reads the tag, then strips it",
     "text": "SW2 reads *VLAN 10*, removes the tag, and forwards the frame only out VLAN 10 access ports. Teacher-B gets a normal untagged frame. Student-B is never offered it.",
     "focus": ["SW2", "TB", "SW2-TB", "SW1", "SW1-SW2"],
     "packets": [{"path": ["SW2", "TB"], "label": "untagged frame"}]},
    {"title": "4. Same cable, different tag",
     "text": "Student-A's frame enters a VLAN 20 port, crosses the **same trunk** tagged *VLAN 20*, and is delivered only to Student-B. One cable, many VLANs, and the tag keeps them apart. Tags only ever exist **on the trunk**.",
     "packets": [{"path": ["SA", "SW1", "SW2", "SB"], "label": "VLAN 20 frame", "tone": "good"}]}
  ]
}
```

1. Teacher-A's PC sends a **plain frame** into SW1's port Fa0/1 (an **access** port in VLAN 10). The PC has no idea about VLANs.
2. SW1 knows "Fa0/1 = VLAN 10," so internally it treats the frame as VLAN 10.
3. SW1 needs to send it to SW2 across the **trunk** (Fa0/24). Because the trunk carries multiple VLANs, SW1 **adds a tag: "VLAN 10"** to the frame.
4. The tagged frame crosses the cable. SW2 receives it on **its** trunk port, reads the tag, and thinks *"Ah, VLAN 10."*
5. SW2 **removes the tag** and looks for VLAN 10 devices. Teacher-B is on Fa0/5 (an **access** port in VLAN 10), so SW2 sends the now-plain frame out Fa0/5.
6. Teacher-B's PC receives a normal, untagged frame — it never knew a tag was ever involved. 🎉

Notice the pattern: **tags exist only on the trunk, in transit between switches.** They're added when entering the trunk and stripped before reaching the end device. Access ports never see tags; trunks always use them.

**📝 Exam-style questions — 7.3**

**Q1.** Which type of switch port should connect to an ordinary desktop PC?

- **A.** A trunk port
- **B.** An access port
- **C.** A port in `dynamic desirable` mode
- **D.** A routed port with an IP address

<details><summary>Answer</summary>

**Answer: B.** A PC belongs to one VLAN and expects plain, untagged frames, which is exactly what an access port provides. **Why not the others:** A trunk (A) sends tagged frames for many VLANs, which a normal PC doesn't understand. C leaves the port free to negotiate itself into a trunk, which is a security risk on a user port (section 8.2). D turns the port into a Layer 3 interface, which is for links to routers, not hosts.
</details>

**Q2.** SW1 and SW2 each have hosts in VLAN 10 and VLAN 20, and they're joined by a single cable. Hosts must reach hosts in the same VLAN on the other switch. How must the link between the switches be configured?

- **A.** As an access port in VLAN 10 on both switches
- **B.** As a trunk on both switches
- **C.** As an access port in VLAN 1 on both switches
- **D.** As an access port in VLAN 10 on SW1 and in VLAN 20 on SW2

<details><summary>Answer</summary>

**Answer: B.** One cable has to carry two VLANs, and only a trunk can do that, because it tags each frame so the far switch knows which VLAN it belongs to. **Why not the others:** A carries only VLAN 10, so VLAN 20 hosts would be cut off. C carries only VLAN 1, which neither group uses. D is worse: it would join VLAN 10 on one side to VLAN 20 on the other, merging two VLANs that should be separate.
</details>

**Q3.** A host in VLAN 10 on SW1 sends a frame to a host in VLAN 10 on SW2. The switches are joined by an 802.1Q trunk, and VLAN 10 is not the native VLAN. Where does the frame carry a VLAN tag?

- **A.** Only on the link from the sending PC to SW1
- **B.** Only on the trunk between SW1 and SW2
- **C.** On all three links
- **D.** Nowhere, because the switches share a VLAN table

<details><summary>Answer</summary>

**Answer: B.** SW1 adds the tag as the frame enters the trunk, and SW2 strips it before sending the frame out the access port. **Why not the others:** A and C are wrong because the hosts send and receive plain untagged frames on access ports. D is wrong because switches don't share a table that maps each frame to a VLAN; the tag is the only way SW2 learns the frame's VLAN.
</details>

**Q4.** Which two links are normally configured as trunks? (Choose two.)

- **A.** A switch-to-switch uplink that carries several VLANs
- **B.** A switch port connected to a router doing router-on-a-stick
- **C.** A switch port connected to a network printer
- **D.** A switch port connected to a single desktop PC
- **E.** A switch port connected to an IP camera

<details><summary>Answer</summary>

**Answer: A, B.** Both links must carry traffic for more than one VLAN: the uplink joins VLANs across switches, and the router needs every VLAN on one cable so it can route between them. **Why not the others:** a printer (C), a PC (D) and a camera (E) each belong to one VLAN, so they get access ports. Ask "does this link carry more than one VLAN?" Here the answer is no.
</details>

## 7.4 Configuring VLANs (Try It!)

```
SW1(config)# vlan 10                 ! create VLAN 10
SW1(config-vlan)# name Teachers      ! give it a friendly name
SW1(config-vlan)# vlan 20
SW1(config-vlan)# name Students
SW1(config-vlan)# exit

SW1(config)# interface fa0/1         ! the port a teacher's PC uses
SW1(config-if)# switchport mode access      ! this is an access port (one VLAN)
SW1(config-if)# switchport access vlan 10   ! put it in VLAN 10
SW1(config-if)# exit

SW1(config)# interface range fa0/2 - 12   ! do many ports at once
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 20  ! students
```

**Why `switchport mode access` AND `switchport access vlan 10`?** The first line says *"this port carries exactly one VLAN and will never tag frames"* (its role). The second says *"and that one VLAN is number 10"* (which VLAN). Role first, then assignment.

Check your work:

```
SW1# show vlan brief
VLAN Name       Status    Ports
---- ---------- --------- ------------------------------
1    default    active    Fa0/13, Fa0/14, ...
10   Teachers   active    Fa0/1
20   Students   active    Fa0/2, Fa0/3, ... Fa0/12
```

**📝 Exam-style questions — 7.4**

**Q1.** Refer to the exhibit. VLAN 30 has not been created on the switch. What happens when the engineer enters these commands on a Catalyst switch in VTP server or transparent mode?

```
SW1(config)# interface FastEthernet0/7
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 30
```

- **A.** The last command is rejected because VLAN 30 doesn't exist.
- **B.** The switch creates VLAN 30 automatically and puts Fa0/7 in it.
- **C.** Fa0/7 is placed in the err-disabled state.
- **D.** Fa0/7 stays in VLAN 1 until VLAN 30 is created by hand.

<details><summary>Answer</summary>

**Answer: B.** IOS prints `% Access VLAN does not exist. Creating vlan 30` and creates the VLAN for you, with the default name VLAN0030. It's handy, but it also means a typo can quietly create a VLAN you didn't want. **Why not the others:** A is what many people expect, but the command is accepted. C is wrong because err-disabled comes from violations such as port security or BPDU Guard, not from a VLAN assignment. D is wrong because the port is assigned to VLAN 30 straight away.
</details>

**Q2.** Refer to the exhibit. Port Fa0/24 is up and connected to another switch, but it doesn't appear anywhere in the output. What is the most likely reason?

```
SW1# show vlan brief
VLAN Name                 Status    Ports
---- -------------------- --------- -------------------------------
1    default              active    Fa0/13, Fa0/14, Fa0/15, Fa0/16
10   Teachers             active    Fa0/1
20   Students             active    Fa0/2, Fa0/3, Fa0/4, Fa0/5
1002 fddi-default         act/unsup
1003 token-ring-default   act/unsup
1004 fddinet-default      act/unsup
1005 trnet-default        act/unsup
```

- **A.** Fa0/24 is operating as a trunk.
- **B.** Fa0/24 is administratively shut down.
- **C.** Fa0/24 is an access port in VLAN 1.
- **D.** Fa0/24 is assigned to VLAN 1002.

<details><summary>Answer</summary>

**Answer: A.** `show vlan brief` lists access ports only. A trunk belongs to many VLANs at once, so it isn't listed under any of them; use `show interfaces trunk` to see it. **Why not the others:** B is wrong because shut-down access ports are still listed under their VLAN. C is wrong because a VLAN 1 access port would be listed in VLAN 1's row, alongside Fa0/13 to Fa0/16. D is wrong because VLAN 1002's row shows no ports.
</details>

**Q3.** An engineer configures `switchport access vlan 10` on a user port but leaves out `switchport mode access`. Why should the second command be added?

- **A.** Without it, the access VLAN command is ignored.
- **B.** It stops the port from negotiating itself into a trunk with DTP.
- **C.** It enables PortFast on the port.
- **D.** It creates VLAN 10 in the VLAN database.

<details><summary>Answer</summary>

**Answer: B.** Many Catalyst ports default to a dynamic DTP mode, so a device that asks for a trunk could get one. `switchport mode access` fixes the port's role so it can only ever be an access port. **Why not the others:** A is wrong because the access VLAN is used whenever the port operates as an access port; the danger is that it might not. C is wrong because PortFast is a separate command (section 9.6). D is wrong because `switchport mode access` has nothing to do with creating VLANs.
</details>

**Q4.** How many ports does `interface range fa0/2 - 12` select?

- **A.** 2
- **B.** 10
- **C.** 11
- **D.** 12

<details><summary>Answer</summary>

**Answer: C.** The range includes both ends, so Fa0/2 through Fa0/12 is 12 − 2 + 1 = 11 ports. **Why not the others:** B is the off-by-one slip of subtracting without adding 1. D counts Fa0/1 to Fa0/12. A reads "2 - 12" as two separate ports.
</details>

## 7.5 The Default & Special VLANs (And Why They Matter)

- **VLAN 1 — the default:** Every port starts in VLAN 1 out of the box. That's convenient, but it's a security weakness: attackers *know* VLAN 1 is the default and often target it. **Best practice: don't use VLAN 1 for real user traffic or management.** Move important things to a purpose-made VLAN. *Why: reducing predictability reduces risk.*

- **Native VLAN — the "untagged" exception on a trunk:** Here's a subtle but important idea. On a trunk, almost every frame gets a tag. But 802.1Q leaves **one** VLAN **untagged** — the **native VLAN** (default VLAN 1). Any frame that arrives on a trunk **without** a tag is assumed to belong to the native VLAN.

  *Why does an untagged option even exist?* Historically, for compatibility with older devices that didn't understand tags (like a legacy hub or a switch that predates 802.1Q). It gives the trunk a sensible default: "if there's no label, put it here."

  *Why is it a security topic?* If the two ends of a trunk **disagree** on the native VLAN, frames can "leak" from one VLAN into another (a **VLAN-hopping** attack called double-tagging). **Best practice: set the native VLAN to an unused VLAN (e.g., 99) and make sure both ends match.** *Why: it removes the mismatch attackers exploit and keeps user traffic off the untagged path.*

- **Management VLAN — keep admins separate:** The VLAN you use to remotely reach and configure your switches (SSH to the switch's IP). Putting it in its own dedicated VLAN (not VLAN 1, not a user VLAN) means normal users can't even *see* the management traffic, let alone attack it. *Why: separation of "who runs the network" from "who uses the network."*

- **VLANs 1002–1005:** Reserved for old Token Ring/FDDI tech. You'll never use them today — just know they're reserved so the numbers aren't a surprise on the exam.

**📝 Exam-style questions — 7.5**

**Q1.** What is the native VLAN on an 802.1Q trunk if no one has changed it?

- **A.** VLAN 1
- **B.** VLAN 99
- **C.** VLAN 1002
- **D.** There is no native VLAN until one is configured.

<details><summary>Answer</summary>

**Answer: A.** Out of the box the native VLAN is VLAN 1, the same as the default VLAN. Frames in the native VLAN cross the trunk untagged. **Why not the others:** B is a common choice for a *configured* native VLAN, not the default. C is one of the reserved legacy FDDI/Token Ring VLANs. D is wrong because every 802.1Q trunk always has a native VLAN.
</details>

**Q2.** An attacker in the native VLAN sends a frame carrying two 802.1Q tags, hoping the first switch strips the outer tag and a second switch forwards the frame into the VLAN named by the inner tag. What is this attack called?

- **A.** MAC flooding
- **B.** Double-tagging VLAN hopping
- **C.** DHCP starvation
- **D.** ARP spoofing

<details><summary>Answer</summary>

**Answer: B.** Double tagging abuses the fact that native-VLAN frames leave a trunk untagged: the first switch removes the outer (native) tag, and the next switch reads the inner tag and puts the frame into the victim VLAN. Moving the native VLAN to an unused VLAN defeats it. **Why not the others:** A fills a switch's MAC table to force flooding. C exhausts a DHCP pool with fake requests. D poisons ARP caches to intercept traffic. None of them involve VLAN tags.
</details>

**Q3.** Which two are best practices for special VLANs? (Choose two.)

- **A.** Set the native VLAN to an unused VLAN, the same on both ends of each trunk.
- **B.** Put switch management in its own dedicated VLAN, not VLAN 1.
- **C.** Put user ports in VLAN 1002 so they're isolated.
- **D.** Use VLAN 1 for management, because it always exists.
- **E.** Use a different native VLAN on each end of a trunk to confuse attackers.

<details><summary>Answer</summary>

**Answer: A, B.** An unused, matching native VLAN keeps user traffic off the untagged path, and a dedicated management VLAN keeps admin access away from users. **Why not the others:** C is wrong because 1002–1005 are reserved legacy VLANs, not for users. D is exactly what the guide warns against: VLAN 1 is the predictable default that attackers target. E causes a native VLAN mismatch, which leaks frames between VLANs, the opposite of security.
</details>

**Q4.** An engineer enters `no vlan 1` on a Catalyst switch. What happens?

- **A.** VLAN 1 is deleted and its ports become inactive.
- **B.** VLAN 1 is deleted and its ports move to VLAN 1002.
- **C.** The command is rejected, because the default VLAN can't be deleted.
- **D.** VLAN 1 is renamed to "unused".

<details><summary>Answer</summary>

**Answer: C.** IOS replies `%Default VLAN 1 may not be deleted.` VLAN 1 always exists, and so do 1002–1005. That's why the advice is to *stop using* VLAN 1, not to remove it. **Why not the others:** A and B describe a deletion that IOS doesn't allow. D is wrong because no command renames a VLAN as a side effect, and VLAN 1's name can't be changed anyway.
</details>

---

<a name="chapter-8"></a>
# Chapter 8: Trunks, VTP & Inter-VLAN Routing

## 8.1 Trunking with 802.1Q (Dot1Q) — How the Tag Actually Works

![The 802.1Q tag inserted into a frame on a trunk](images/dot1q.png)

In Chapter 7 you learned *why* trunks exist: a single cable must carry many VLANs, so we **tag** each frame with its VLAN number. Now let's see *how* that tag works, because the exam tests the details.

The tagging standard is **802.1Q** (say "dot-one-Q"). When a frame goes onto a trunk, the switch inserts a **4-byte tag** right into the middle of the Ethernet frame — squeezed in between the Source MAC and the Type field:

| Frame | Fields, in order |
|---|---|
| **Normal frame** | Dest MAC → Src MAC → Type → Data → FCS |
| **Tagged frame** | Dest MAC → Src MAC → **802.1Q tag (4 bytes)** → Type → Data → FCS |

The tag is **inserted after the source MAC**, not bolted on the front — the
addresses stay exactly where hardware expects to find them, so a switch reads
them at full speed and only then notices the tag.

**What's inside that 4-byte tag?** The important part for the exam is the **VLAN ID** — a number from **1 to 4094** that says which VLAN the frame belongs to. (The tag also holds a priority field for QoS, but the VLAN ID is the star.)

**Why does the switch re-do the checksum?** The frame ends with an **FCS** (error-check). Since the switch changed the frame by adding a tag, it must **recalculate the FCS** so the frame still passes the error check on the other side. Good to know it happens automatically.

**The full journey of a tag (tie it together):**
1. A plain frame enters an **access** port → the switch knows its VLAN internally, no tag yet.
2. The frame needs to cross a **trunk** → the switch **adds** the 802.1Q tag with the VLAN ID.
3. The other switch's trunk **reads** the tag to learn the VLAN.
4. Before the frame reaches the destination **access** port, the switch **removes** the tag.
5. The end device gets a normal, untagged frame. *The tag lived only on the trunk.*

Step through a trunk below, including what the **native VLAN** does differently and what goes wrong when the two ends disagree about it.

```diagram
{
  "type": "topology",
  "title": "802.1Q tags and the native VLAN",
  "caption": "Gi0/1 on both switches is an 802.1Q trunk with native VLAN 99. PC-A and PC-B are in VLAN 10; MGMT-1 and MGMT-2 are in VLAN 99.",
  "nodes": [
    {"id": "A", "kind": "host", "x": 0, "y": 0, "label": "PC-A", "sub": "VLAN 10"},
    {"id": "M1", "kind": "host", "x": 0, "y": 2, "label": "MGMT-1", "sub": "VLAN 99"},
    {"id": "SW1", "kind": "switch", "x": 1.6, "y": 1, "sub": "native 99"},
    {"id": "SW2", "kind": "switch", "x": 3.8, "y": 1, "sub": "native 99"},
    {"id": "B", "kind": "host", "x": 5.4, "y": 0, "label": "PC-B", "sub": "VLAN 10"},
    {"id": "M2", "kind": "host", "x": 5.4, "y": 2, "label": "MGMT-2", "sub": "VLAN 99"}
  ],
  "links": [
    {"a": "SW1", "b": "A"},
    {"a": "SW1", "b": "M1"},
    {"a": "SW1", "b": "SW2", "style": "thick", "label": "802.1Q trunk", "aLabel": "Gi0/1", "bLabel": "Gi0/1"},
    {"a": "SW2", "b": "B"},
    {"a": "SW2", "b": "M2"}
  ],
  "steps": [
    {"title": "1. VLAN 10 frame: tagged on the trunk",
     "text": "PC-A's untagged frame enters a VLAN 10 access port. On its way out Gi0/1, SW1 inserts the 4-byte **802.1Q tag** (VLAN ID 10) between the source MAC and the Type field, and recalculates the FCS.",
     "packets": [{"path": ["A", "SW1", "SW2"], "label": "tag VID 10", "tone": "accent"}]},
    {"title": "2. SW2 strips the tag and delivers",
     "text": "SW2 reads VID 10, removes the tag (and recalculates the FCS again), and sends a plain frame out a VLAN 10 access port. PC-B never sees a tag.",
     "packets": [{"path": ["SW2", "B"], "label": "untagged", "tone": "accent"}]},
    {"title": "3. Native VLAN 99 crosses untagged",
     "text": "MGMT-1 is in **VLAN 99, the native VLAN**. SW1 sends native-VLAN frames across the trunk **without a tag**. SW2 receives an untagged frame on a trunk, so it puts it in *its* native VLAN, 99. Both ends agree, so it lands in the right place.",
     "packets": [{"path": ["M1", "SW1", "SW2", "M2"], "label": "no tag (native)", "tone": "good"}]},
    {"title": "4. Mismatch: SW2's native VLAN is 1",
     "text": "Now suppose SW2 was left at the default, native VLAN 1. The same untagged frame arrives, and SW2 puts it in **VLAN 1**: traffic has leaked from VLAN 99 into VLAN 1. CDP warns with `%CDP-4-NATIVE_VLAN_MISMATCH`. That's why both ends must match, and why the native VLAN should be an unused one.",
     "nodes": {"SW2": {"badge": "native 1 ✕", "tone": "bad"}, "M2": {"state": "dim"}},
     "packets": [{"path": ["M1", "SW1", "SW2"], "label": "no tag → VLAN 1?", "tone": "bad"}]}
  ]
}
```

### Configuring a Trunk (and why each line matters)

```
SW1(config)# interface fa0/24
SW1(config-if)# switchport mode trunk            ! this port carries many VLANs (tagged)
SW1(config-if)# switchport trunk native vlan 99  ! untagged traffic = VLAN 99 (not 1, for security)
SW1(config-if)# switchport trunk allowed vlan 10,20,30  ! only let these VLANs cross
```

- **`switchport mode trunk`** — sets the port's *role* to trunk, so it will tag/expect-tags instead of belonging to a single VLAN.
- **`switchport trunk native vlan 99`** — moves the untagged "native" VLAN off the default VLAN 1 to a safe, unused VLAN. *Why: prevents native-VLAN-mismatch VLAN-hopping attacks.* Both ends must match.
- **`switchport trunk allowed vlan 10,20,30`** — a whitelist. *Why bother?* A trunk carries **all** VLANs by default, which wastes bandwidth (broadcasts for VLANs nobody on the far switch uses) and widens the attack surface. Restricting the trunk to only the VLANs that actually need to cross is called **VLAN pruning** — it's cleaner, faster, and safer.

Check it:

```
SW1# show interfaces trunk
Port    Mode   Encapsulation  Status    Native vlan
Fa0/24  on     802.1q         trunking  99
```

**📝 Exam-style questions — 8.1**

**Q1.** How does 802.1Q mark a frame with its VLAN on a trunk?

- **A.** It inserts a 4-byte tag between the source MAC address and the Type/Length field.
- **B.** It wraps the whole frame in a new 26-byte header and adds a second FCS.
- **C.** It adds a 4-byte tag in front of the destination MAC address.
- **D.** It writes the VLAN number into the last 2 bytes of the FCS.

<details><summary>Answer</summary>

**Answer: A.** 802.1Q squeezes a 4-byte tag in after the source MAC, so both MAC addresses stay where hardware expects them, then recalculates the FCS. **Why not the others:** B describes Cisco's old ISL, which encapsulated the whole frame; modern switches don't support it. C would push the destination MAC out of its normal place. D is wrong because the FCS is an error check, and overwriting it would make every frame look corrupted.
</details>

**Q2.** The VLAN ID field in an 802.1Q tag is 12 bits long. Which VLAN numbers can be used for traffic?

- **A.** 1 to 1005
- **B.** 1 to 4094
- **C.** 0 to 4095
- **D.** 1 to 4096

<details><summary>Answer</summary>

**Answer: B.** Twelve bits give 4096 values (0–4095), but 0 and 4095 are reserved, which leaves 1–4094. **Why not the others:** A is only the *normal* range; 1006–4094 is the extended range, and it's valid too. C includes the two reserved values. D goes past what 12 bits can hold.
</details>

**Q3.** Refer to the exhibit. VLAN 40 exists on both SW1 and SW2, but users in VLAN 40 on SW1 can't reach users in VLAN 40 on SW2. What is the cause?

```
SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       10,20,30

Port        Vlans allowed and active in management domain
Gi0/1       10,20,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       10,20,30
```

- **A.** VLAN 40 is not in the trunk's allowed VLAN list.
- **B.** The native VLAN doesn't match on the two switches.
- **C.** Gi0/1 is not trunking.
- **D.** The trunk uses ISL encapsulation.

<details><summary>Answer</summary>

**Answer: A.** The allowed list is 10, 20 and 30, so VLAN 40 frames are never sent across Gi0/1. **Why not the others:** B can't be judged from one side's output, and a mismatch wouldn't single out VLAN 40. C is wrong because Status says `trunking`. D is wrong because Encapsulation says `802.1q`.
</details>

**Q4.** Following on from Q3, the engineer must let VLAN 40 cross the trunk and keep VLANs 10, 20 and 30 working. Which command should be entered on Gi0/1?

- **A.** `switchport trunk allowed vlan 40`
- **B.** `switchport trunk allowed vlan add 40`
- **C.** `switchport trunk native vlan 40`
- **D.** `switchport access vlan 40`

<details><summary>Answer</summary>

**Answer: B.** The `add` keyword appends VLAN 40 to the existing list. **Why not the others:** A *replaces* the list with just VLAN 40, cutting off 10, 20 and 30; it's a famous outage-causing slip. C changes which VLAN is untagged, which doesn't fix the allowed list and would cause a native mismatch. D only applies when the port is an access port, so it does nothing for the trunk.
</details>

## 8.2 DTP (Dynamic Trunking Protocol) — And Why to Disable It

Cisco switches can **automatically negotiate** whether a link becomes a trunk, using **DTP**. It's convenient, but understanding it matters for security.

Modes:
- **trunk (on):** Always a trunk.
- **access:** Always an access port.
- **dynamic auto:** Will become a trunk only if the other side asks.
- **dynamic desirable:** Actively asks the other side to form a trunk.

**Why is auto-negotiation risky?** Because an attacker can plug in a laptop that *pretends to be a switch* and says "let's form a trunk!" If your port is in a dynamic mode, it agrees — and now the attacker's laptop receives **all VLANs**, defeating your separation. This is a **VLAN-hopping** attack.

> **Security best practice:** On end-device ports, hard-set `switchport mode access` and add `switchport nonegotiate` (which turns DTP off). On real switch-to-switch links, hard-set `switchport mode trunk` and also `switchport nonegotiate`. *Why: never leave "should this be a trunk?" up to negotiation an attacker could exploit.*

**📝 Exam-style questions — 8.2**

**Q1.** Two switch ports are connected and both use DTP. Which combination of modes leaves the link as an access link?

- **A.** `dynamic desirable` and `dynamic auto`
- **B.** `dynamic auto` and `dynamic auto`
- **C.** `trunk` and `dynamic auto`
- **D.** `dynamic desirable` and `dynamic desirable`

<details><summary>Answer</summary>

**Answer: B.** `dynamic auto` only agrees to a trunk when the other side asks for one. Two auto ports both wait, nobody asks, and the link stays access. **Why not the others:** in A and D, at least one side is desirable and actively asks, so a trunk forms. In C, the `trunk` side sends DTP asking for a trunk, and auto agrees.
</details>

**Q2.** Which interface command stops a port from sending DTP frames?

- **A.** `switchport mode dynamic auto`
- **B.** `switchport nonegotiate`
- **C.** `no switchport`
- **D.** `switchport trunk native vlan 999`

<details><summary>Answer</summary>

**Answer: B.** `switchport nonegotiate` turns DTP off on a port whose mode is already set to `access` or `trunk`. **Why not the others:** A is a DTP mode, so negotiation stays on. C makes the port a routed Layer 3 port, which is a different thing altogether. D only changes the native VLAN.
</details>

**Q3.** Refer to the exhibit. Gi0/5 connects to a wall jack at a user's desk. What is the problem, and what is the fix?

```
SW1# show interfaces gi0/5 switchport
Name: Gi0/5
Switchport: Enabled
Administrative Mode: dynamic desirable
Operational Mode: trunk
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
```

- **A.** The device at the desk has negotiated a trunk and can reach every VLAN. Set `switchport mode access` and `switchport nonegotiate`.
- **B.** The port is in VLAN 1. Changing the access VLAN is all that's needed.
- **C.** Nothing is wrong; `dynamic desirable` is recommended for user ports.
- **D.** The port should use ISL encapsulation instead of dot1q.

<details><summary>Answer</summary>

**Answer: A.** A user port has no business being a trunk. Because the port is in a dynamic mode, whatever is plugged in answered DTP and got a trunk, which gives it access to every allowed VLAN: a switch-spoofing VLAN-hopping attack. Hard-setting access mode and turning DTP off closes the door. **Why not the others:** B misses the point, because the access VLAN isn't used while the port is trunking. C is wrong because dynamic modes on user ports are exactly the risk. D changes the tagging method, not the fact that it's a trunk.
</details>

## 8.3 VTP (VLAN Trunking Protocol) — Convenience vs. Danger

**VTP** lets you create a VLAN on **one** switch and have it **automatically copy** to all other switches in the same VTP domain. In a network with 50 switches, that's a huge time-saver — no need to type `vlan 10` on all 50.

VTP modes:
- **Server:** Can create/edit/delete VLANs; shares changes to others.
- **Client:** Receives VLAN info; can't edit VLANs itself.
- **Transparent:** Ignores VTP for its own VLANs (keeps them local) but forwards VTP messages along.

Step through the horror story below: an old switch with a high revision number joins the network.

```diagram
{
  "type": "topology",
  "title": "How one old switch wipes out every VLAN",
  "caption": "All switches are in VTP domain CAMPUS. Press **Next** to plug in the old switch.",
  "nodes": [
    {"id": "SRV", "kind": "switch", "x": 2.5, "y": 0, "label": "SW1", "sub": "VTP server · rev 12"},
    {"id": "SW2", "kind": "switch", "x": 1, "y": 1.5, "sub": "VTP client · rev 12"},
    {"id": "SW3", "kind": "switch", "x": 4, "y": 1.5, "sub": "VTP client · rev 12"},
    {"id": "OLD", "kind": "switch", "x": 4, "y": 3, "label": "Old switch", "sub": "VTP client · rev 50"}
  ],
  "links": [
    {"a": "SRV", "b": "SW2", "style": "thick", "label": "trunk"},
    {"a": "SRV", "b": "SW3", "style": "thick", "label": "trunk"},
    {"a": "SW3", "b": "OLD", "style": "thick", "label": "new trunk"}
  ],
  "steps": [
    {"title": "1. A healthy VTP domain",
     "text": "SW1 is the VTP server. Its VLAN database (VLANs 10, 20 and 30, shown on each badge) is at **revision 12**, and both clients have synchronized to it.",
     "nodes": {"SRV": {"badge": "10,20,30", "tone": "good"}, "SW2": {"badge": "10,20,30", "tone": "good"}, "SW3": {"badge": "10,20,30", "tone": "good"}, "OLD": {"state": "dim"}},
     "links": {"SW3-OLD": "down"},
     "packets": [{"path": ["SRV", "SW2"], "label": "VTP rev 12"}, {"path": ["SRV", "SW3"], "label": "VTP rev 12"}]},
    {"title": "2. An old lab switch is plugged in",
     "text": "Someone reuses a switch from the lab. It still has the domain name CAMPUS and a VLAN database at **revision 50** that holds only VLAN 1. It's a *client*, so it looks harmless. The link to SW3 comes up as a trunk.",
     "nodes": {"OLD": {"state": "active", "badge": "VLAN 1", "tone": "warn"}},
     "links": {"SW3-OLD": null}},
    {"title": "3. Its advertisement wins on revision number",
     "text": "The old switch advertises revision 50. VTP trusts the **highest revision**, not the server and not the biggest list, and that includes a client's advertisement in VTP versions 1 and 2. SW3 adopts it and passes it on, and SW1 adopts it too.",
     "packets": [{"path": ["OLD", "SW3", "SRV", "SW2"], "label": "VTP rev 50", "tone": "bad"}]},
    {"title": "4. VLANs 10, 20 and 30 are gone everywhere",
     "text": "Every switch now has revision 50 and only VLAN 1. Access ports in VLANs 10, 20 and 30 go **inactive**, and every user is offline at once. The fix is prevention: reset a used switch's revision to 0 (switch to transparent mode and back) before connecting it, or run VTP version 3 or transparent mode.",
     "nodes": {"SRV": {"badge": "VLAN 1", "tone": "bad"}, "SW2": {"badge": "VLAN 1", "tone": "bad"}, "SW3": {"badge": "VLAN 1", "tone": "bad"}, "OLD": {"badge": "VLAN 1", "tone": "bad"}}}
  ]
}
```

**Why VTP can be dangerous (the famous horror story):** VTP uses a **revision number** that increases every time you change VLANs. Switches trust whichever message has the **highest revision number**. If you take an **old switch** that has a high revision number and a nearly-empty VLAN list, and plug it into your network, it can **overwrite every other switch's VLANs with its own (empty) list** — instantly wiping VLANs network-wide and taking everyone offline. 😱

> **Best practice:** Before adding any used switch to your network, **reset its VTP revision number to 0** (set it to VTP transparent mode and back, or erase config). Many engineers avoid VTP entirely, or use the safer VTP version 3, precisely because of this risk. *Why: a convenience feature should never be able to delete your whole VLAN design by accident.*

**📝 Exam-style questions — 8.3**

**Q1.** Which VTP mode lets a switch create, change and delete VLANs and advertise those changes to the rest of the domain?

- **A.** Server
- **B.** Client
- **C.** Transparent
- **D.** Off

<details><summary>Answer</summary>

**Answer: A.** A VTP server can edit VLANs, and it advertises each change with a higher revision number. **Why not the others:** a client (B) can't create or delete VLANs at all; it only learns them. Transparent (C) can create VLANs, but they stay local and aren't advertised, although it does relay other switches' VTP messages. Off (D) ignores VTP entirely and doesn't relay it either.
</details>

**Q2.** A used switch with VTP domain name CAMPUS, configuration revision 50 and only VLAN 1 is configured as a VTP client and connected over a trunk to the production network. The production server is at revision 12. All switches run VTP version 2. What happens?

- **A.** Nothing, because clients can't send VLAN information.
- **B.** The used switch learns revision 12 from the server.
- **C.** The production switches adopt the revision 50 database and lose their VLANs.
- **D.** The trunk is err-disabled because of the revision mismatch.

<details><summary>Answer</summary>

**Answer: C.** VTP versions 1 and 2 accept whichever advertisement has the highest revision in the domain, even one from a client. The VLAN-1-only database overwrites everyone, and ports in the missing VLANs go inactive. **Why not the others:** A is the dangerous myth; clients do advertise their database. B gets the direction backwards: the lower revision is the one that loses. D is wrong because VTP has no err-disable reaction; it simply synchronizes.
</details>

**Q3.** Before connecting a used switch to production, which action resets its VTP configuration revision to 0?

- **A.** Change it to VTP transparent mode, then back to client mode.
- **B.** Reload the switch.
- **C.** Enter `vtp version 2`.
- **D.** Enter `no vlan 1`.

<details><summary>Answer</summary>

**Answer: A.** Moving to transparent mode resets the revision to 0 (so does changing the domain name). Then you can safely put it back in client mode. **Why not the others:** B does nothing, because the revision is saved in `vlan.dat` in flash and survives a reload, and so does erasing the startup config. C changes the VTP version, not the revision. D is rejected, because VLAN 1 can't be deleted.
</details>

## 8.4 Inter-VLAN Routing — Why VLANs Need a Router to Talk

![Router-on-a-stick topology](images/roas.png)

We spent Chapter 7 building **walls** between VLANs. But walls are inconvenient when teachers legitimately need to reach a shared file server on a different VLAN. So how do we let *some* traffic through, on our terms?

**Why can't a switch just do it?** Because VLANs are **different subnets** (e.g., VLAN 10 = 192.168.10.0/24, VLAN 20 = 192.168.20.0/24). A plain switch works at **Layer 2** (MAC addresses) and only moves frames **within** the same VLAN/subnet. The moment traffic must go from one subnet to another, that's a **Layer 3 (routing) decision** — and routing is a **router's** job (or a Layer 3 switch's job).

**Story Time 📖:** VLANs are like separate countries with closed borders (great for order). A **router** is the international airport + customs — the *only* official crossing point, where you can also check passports (ACLs) and decide who's allowed through. Without the airport, the countries simply can't reach each other.

There are three ways to provide that routing:

### Method 1: Old Way — One Router Cable Per VLAN
Run a separate physical link from the router to the switch for **each** VLAN. It works, but it burns a router port and a switch port per VLAN — the exact "one cable per VLAN" waste we solved with trunks. **Don't do this for more than a couple of VLANs.**

### Method 2: Router-on-a-Stick (ROAS) — One Trunk, Virtual Sub-Ports
Use **one** trunk link between the switch and router. The router splits that single physical interface into **subinterfaces** — one virtual sub-port per VLAN — and gives each one an IP address that becomes that VLAN's **default gateway**.

**Why subinterfaces?** Because the trunk delivers **tagged** frames for many VLANs down one wire. The router needs a separate "identity" (and gateway IP) for each VLAN, so it creates a virtual interface per VLAN and matches each to a tag with `encapsulation dot1q`.

The router keeps **one physical link** to the switch — the "stick" — configured
as a trunk, and splits it into **subinterfaces**, one per VLAN:

| Subinterface | VLAN | Acts as gateway |
|--------------|------|-----------------|
| `Gi0/0.10` | 10 | 192.168.10.1 |
| `Gi0/0.20` | 20 | 192.168.20.1 |

The switch port at the other end is a trunk carrying both VLANs.

Router config for ROAS:

```
R1(config)# interface gi0/0.10          ! subinterface for VLAN 10
R1(config-subif)# encapsulation dot1q 10   ! "frames tagged VLAN 10 belong to me"
R1(config-subif)# ip address 192.168.10.1 255.255.255.0  ! gateway for V10
R1(config-subif)# exit
R1(config)# interface gi0/0.20
R1(config-subif)# encapsulation dot1q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
```

**How a cross-VLAN trip works here:** A teacher (VLAN 10) wants the student server (VLAN 20). Because it's a different subnet, the teacher's PC sends the frame to its **default gateway** (192.168.10.1) up the trunk (tagged VLAN 10). The router receives it on subinterface Gi0/0.10, **routes** it to the 192.168.20.0 network, re-sends it tagged as VLAN 20 back down the trunk, and the switch delivers it to the server. The router was the border crossing.

Step through that trip below. Watch how the same packet crosses the trunk **twice**, once up and once down.

```diagram
{
  "type": "topology",
  "title": "Router-on-a-stick: up the trunk and back down",
  "caption": "R1 Gi0/0 is split into Gi0/0.10 (192.168.10.1, VLAN 10) and Gi0/0.20 (192.168.20.1, VLAN 20). Click a device for its settings.",
  "nodes": [
    {"id": "R1", "kind": "router", "x": 2.5, "y": 0, "sub": "Gi0/0.10 · Gi0/0.20", "info": "One physical link, two subinterfaces. `Gi0/0.10` has `encapsulation dot1Q 10` and 192.168.10.1/24; `Gi0/0.20` has `encapsulation dot1Q 20` and 192.168.20.1/24. Each one is the default gateway for its VLAN."},
    {"id": "SW1", "kind": "switch", "x": 2.5, "y": 1.5, "info": "Gi0/1 toward R1 is a **trunk**. Fa0/1 is an access port in VLAN 10, Fa0/2 an access port in VLAN 20."},
    {"id": "PC1", "kind": "host", "x": 0.8, "y": 3, "label": "Teacher PC", "sub": "192.168.10.10/24", "info": "VLAN 10. Default gateway **192.168.10.1** (R1's Gi0/0.10)."},
    {"id": "SRV", "kind": "server", "x": 4.2, "y": 3, "label": "Server", "sub": "192.168.20.50/24", "info": "VLAN 20. Default gateway **192.168.20.1** (R1's Gi0/0.20)."}
  ],
  "links": [
    {"a": "R1", "b": "SW1", "style": "thick", "label": "trunk", "info": "R1 Gi0/0 to SW1 Gi0/1. On SW1 this port is `switchport mode trunk`, carrying VLANs 10 and 20."},
    {"a": "SW1", "b": "PC1", "aLabel": "Fa0/1"},
    {"a": "SW1", "b": "SRV", "aLabel": "Fa0/2"}
  ],
  "steps": [
    {"title": "1. The PC sends to its gateway",
     "text": "192.168.20.50 isn't in the PC's own subnet (192.168.10.0/24), so the PC addresses the frame to the **MAC of its gateway**, 192.168.10.1. The IP destination stays 192.168.20.50.",
     "packets": [{"path": ["PC1", "SW1"], "label": "to gateway MAC"}]},
    {"title": "2. Up the trunk, tagged VLAN 10",
     "text": "SW1 forwards the frame toward R1's MAC, out the trunk, tagged **VLAN 10**. R1 accepts it on Gi0/0.10 because of `encapsulation dot1Q 10`.",
     "packets": [{"path": ["SW1", "R1"], "label": "tag 10", "tone": "accent"}]},
    {"title": "3. R1 routes it and sends it back down",
     "text": "R1 looks up 192.168.20.50: it's on the connected network of Gi0/0.20. R1 writes a new Ethernet header (its own MAC to the server's MAC) and sends it **back down the same cable**, tagged **VLAN 20**.",
     "nodes": {"R1": {"badge": "routed", "tone": "good"}},
     "packets": [{"path": ["R1", "SW1"], "label": "tag 20", "tone": "good"}]},
    {"title": "4. Delivered in VLAN 20",
     "text": "SW1 strips the tag and delivers the frame out Fa0/2. The reply makes the same trip in reverse. Every inter-VLAN packet crosses the trunk **twice**, which is why a busy network outgrows router-on-a-stick and moves to a Layer 3 switch.",
     "nodes": {"R1": null},
     "packets": [{"path": ["SW1", "SRV"], "label": "untagged", "tone": "good"}]}
  ]
}
```

### Method 3: Layer 3 Switch (SVI) — The Modern, Fast Way
A **Layer 3 switch** can route between VLANs **by itself**, using **SVIs** (Switch Virtual Interfaces) — a virtual gateway interface for each VLAN, right inside the switch. No external router, no trunk-to-a-router bottleneck.

**Why is this preferred today?** ROAS sends *all* inter-VLAN traffic up and back down a single trunk cable, which can become a bottleneck. A Layer 3 switch routes internally at hardware speed, so it's much faster — the standard choice in real networks.

```
L3SW(config)# ip routing                 ! turn on Layer 3 routing (off by default)
L3SW(config)# interface vlan 10
L3SW(config-if)# ip address 192.168.10.1 255.255.255.0   ! SVI = gateway for VLAN 10
L3SW(config-if)# no shutdown
L3SW(config)# interface vlan 20
L3SW(config-if)# ip address 192.168.20.1 255.255.255.0
L3SW(config-if)# no shutdown
```

Each PC uses its VLAN's `.1` address as its **default gateway** to reach other VLANs. *Why the `.1`?* It's just convention — the gateway is usually the first usable address in the subnet, so it's easy to remember and standardize.

**📝 Exam-style questions — 8.4**

**Q1.** Refer to the exhibit. Hosts in VLAN 20 can't ping their default gateway, 192.168.20.1. VLAN 20 is allowed on the switch's trunk to R1. What is the cause?

```
R1# show running-config | section interface GigabitEthernet0/0.20
interface GigabitEthernet0/0.20
 encapsulation dot1Q 30
 ip address 192.168.20.1 255.255.255.0
```

- **A.** The subinterface number must be 30 to match the encapsulation.
- **B.** The subinterface accepts frames tagged VLAN 30, not VLAN 20.
- **C.** The physical interface Gi0/0 needs an IP address in VLAN 20.
- **D.** The mask should be /16 to cover all VLANs.

<details><summary>Answer</summary>

**Answer: B.** `encapsulation dot1Q` decides which tag a subinterface handles. Frames tagged 20 arrive, but no subinterface is listening for 20, so they're dropped. The fix is `encapsulation dot1Q 20`. **Why not the others:** A is the trap: the subinterface number is just a label, and matching it to the VLAN is only a tidy habit. C is wrong because in ROAS the physical interface usually has no IP address; the subinterfaces carry them. D would overlap the other VLANs' subnets and doesn't fix the tag.
</details>

**Q2.** An engineer configures SVIs for VLANs 10 and 20 on a Layer 3 switch. Each PC can ping its own SVI but not the other VLAN. Which command is missing?

- **A.** `ip routing`
- **B.** `no switchport` on each SVI
- **C.** `encapsulation dot1q` on each SVI
- **D.** `switchport mode trunk` on each SVI

<details><summary>Answer</summary>

**Answer: A.** A Layer 3 switch doesn't route between SVIs until you enable it with `ip routing`. Pinging your own gateway works without it; going *through* the switch to another VLAN doesn't. **Why not the others:** B is used to turn a physical port into a routed port, not on an SVI. C belongs on router subinterfaces in ROAS. D is a Layer 2 port setting and doesn't exist on a VLAN interface.
</details>

**Q3.** Which two statements about router-on-a-stick are true? (Choose two.)

- **A.** The switch port connected to the router must be a trunk.
- **B.** Each subinterface's IP address is the default gateway for its VLAN.
- **C.** The router needs one physical interface per VLAN.
- **D.** Traffic between VLANs never crosses the trunk.
- **E.** The subinterface number must equal the VLAN ID.

<details><summary>Answer</summary>

**Answer: A, B.** The single link must carry every VLAN, so it's a trunk, and each subinterface's address is what that VLAN's hosts use as their gateway. **Why not the others:** C describes the old one-cable-per-VLAN method. D is backwards: every inter-VLAN packet goes up the trunk and back down. E is only a convention; `encapsulation dot1Q` sets the VLAN.
</details>

**Q4.** Refer to the exhibit. The engineer has configured `interface vlan 30` with `no shutdown` on a Layer 3 switch. Why is it down?

```
L3SW# show ip interface brief | include Vlan
Vlan10        192.168.10.1    YES manual up                    up
Vlan20        192.168.20.1    YES manual up                    up
Vlan30        192.168.30.1    YES manual up                    down
```

- **A.** `ip routing` hasn't been enabled.
- **B.** VLAN 30 doesn't exist, or no port in VLAN 30 is up and forwarding.
- **C.** SVIs need `no switchport` before they come up.
- **D.** The subnet 192.168.30.0/24 overlaps another SVI.

<details><summary>Answer</summary>

**Answer: B.** An SVI's line protocol is up only when its VLAN exists and at least one access or trunk port carrying that VLAN is up and forwarding. Status up / protocol down is the signature of an SVI with no active ports. **Why not the others:** A affects routing between SVIs, not whether an SVI is up; VLANs 10 and 20 are up without it mattering. C isn't an SVI command. D would be rejected when the address is configured, with an "overlaps" error, not cause a down state.
</details>

---

<a name="chapter-9"></a>
# Chapter 9: Spanning Tree Protocol (STP) — Stopping Loops

## 9.1 The Scary Problem: Loops

For safety, we connect switches with **extra cables** (redundancy) so if one breaks, another works. But this creates a **loop** — and loops are a disaster in Layer 2!

**Story Time 📖:** Imagine two mirrors facing each other. A single reflection bounces forever, multiplying endlessly. A broadcast frame in a switch loop does the same — it circles forever, multiplying, until the network **melts down** (a "broadcast storm"). 😱

Wire SW1, SW2 and SW3 together in a triangle — each connected to both of the
others — and you've built a **loop**. A broadcast entering that triangle circles
it endlessly, because nothing in a frame tells a switch to stop forwarding it.

**Here's the WHY that makes STP make sense — and it's a fact most beginners miss:** *Why do loops destroy a Layer 2 network but not the Internet, which is full of loops?* The answer is a single missing feature: **Ethernet frames have no "expiration date."**

When you learn about IP packets (Layer 3) in Chapter 14, you'll meet a field called **TTL (Time To Live)** — a little counter that drops by 1 at each router. When it hits 0, the packet is thrown away. TTL is a **built-in self-destruct** that guarantees a lost packet can't circle forever. **Layer 2 Ethernet frames have NOTHING like this.** There is no TTL in a frame. So if a frame ever enters a loop, **nothing will ever stop it** — it circles endlessly.

Now combine that with two switch behaviors you already know:

1. Switches **flood broadcasts and unknown frames out every port**. In a loop, a single broadcast comes back around, and the switch floods it again... and again... forever. Worse, at a loop junction the frame gets **duplicated** down multiple paths, so one broadcast becomes two, then four, then eight — a doubling avalanche. That's the **broadcast storm**, and it saturates every link in seconds. 💥
2. Because the same source MAC keeps arriving on *different* ports as the frame loops, the switch's **MAC table thrashes** — constantly rewriting "AA is on port 1... no, port 2... no, port 3!" This is called **MAC flapping**, and it corrupts the switch's forwarding logic on top of the storm.

So a Layer 2 loop isn't a small slowdown — it's a **total, instant meltdown** of the whole broadcast domain. *That's why we can't just "leave the backup cable plugged in and hope."* We need something to actively guarantee there's never a loop — while still keeping that backup cable ready. Enter STP.

**📝 Exam-style questions — 9.1**

**Q1.** Why does a broadcast frame caught in a Layer 2 loop keep circling until the loop is broken, when an IP packet caught in a routing loop eventually disappears?

- **A.** Ethernet frames have no TTL field, so nothing ever discards a looping frame.
- **B.** Switches don't learn MAC addresses from broadcast frames.
- **C.** Spanning tree is disabled by default on Cisco switches.
- **D.** Routers forward broadcasts back into the switched network.

<details><summary>Answer</summary>

**Answer: A.** An IP packet's TTL drops by one at each router and the packet is discarded at zero. An Ethernet header has no such counter, so a looping frame lives forever, and flooding keeps copying it. **Why not the others:** B is false: switches learn the source MAC of every frame, broadcasts included, and that learning is what causes MAC flapping in a loop. C is false: STP is on by default, which is exactly why loops are rare. D is false: routers don't forward broadcasts.
</details>

**Q2.** Which two symptoms are typical of a Layer 2 switching loop? (Choose two.)

- **A.** A broadcast storm that saturates links and CPUs
- **B.** MAC address table instability, with the same MAC moving between ports
- **C.** ICMP "time exceeded" messages from the switches
- **D.** OSPF electing a new designated router
- **E.** Frames being dropped because their TTL reached zero

<details><summary>Answer</summary>

**Answer: A, B.** Frames multiply around the loop (the storm), and the same source MAC keeps arriving on different ports, so the switch keeps rewriting its table (MAC flapping). **Why not the others:** C and E both rely on a TTL, which Ethernet frames don't have. D is a Layer 3 event and not a sign of a Layer 2 loop.
</details>

**Q3.** Refer to the exhibit. A switch logs this message many times per second. What is the most likely cause?

```
%SW_MATM-4-MACFLAP_NOTIF: Host 0050.7966.6800 in vlan 10 is flapping between port Gi0/1 and port Gi0/2
```

- **A.** A Layer 2 loop that brings the host's frames in on both Gi0/1 and Gi0/2
- **B.** A port security violation on Gi0/1
- **C.** A native VLAN mismatch on Gi0/2
- **D.** A duplex mismatch between Gi0/1 and Gi0/2

<details><summary>Answer</summary>

**Answer: A.** The switch keeps learning the same MAC on two different ports, which is what happens when copies of the host's frames come around a loop and arrive from both directions. **Why not the others:** B would log a `PORT_SECURITY` violation and shut down or restrict the port. C produces CDP native-VLAN-mismatch messages, not MAC moves. D causes errors and late collisions on one link; it doesn't make a MAC appear on two ports.
</details>

## 9.2 The Hero: Spanning Tree Protocol

**STP (802.1D)** automatically finds loops and **blocks** one path so there's only ONE way through — no loops. If the active path breaks, STP **unblocks** the backup path. Best of both worlds: redundancy WITHOUT loops.

STP leaves the triangle physically wired but **blocks one port**, so there's
only one active path and no loop. If the working link later breaks, STP unblocks
that port and everyone stays connected — the redundancy is still there, just held
in reserve.

**Why "block a port" instead of "unplug the cable"?** Because a blocked port is a **backup on standby**, not a removed one. It still *listens* for STP messages, so it knows the instant the main path fails — and then it springs into action and starts forwarding. You get the safety of no-loops *and* the resilience of a spare path, automatically. Unplugging the cable would give you no loop but also no backup. Blocking gives you both.

**📝 Exam-style questions — 9.2**

**Q1.** How does spanning tree break a loop in a redundant switched network?

- **A.** It administratively shuts down one of the redundant interfaces.
- **B.** It puts one or more ports in a blocking state, where they forward no user frames but still receive BPDUs.
- **C.** It err-disables the port with the highest cost.
- **D.** It removes the VLAN from one of the trunks.

<details><summary>Answer</summary>

**Answer: B.** A blocked port stays up and keeps listening to BPDUs, so it knows the moment it's needed and can take over as a backup. **Why not the others:** A and C would remove the backup completely, needing a human to bring it back. D changes the trunk's allowed VLAN list, which is an admin job, not something STP does.
</details>

**Q2.** Which IEEE standard defines the original Spanning Tree Protocol?

- **A.** 802.1D
- **B.** 802.1Q
- **C.** 802.1w
- **D.** 802.3ad

<details><summary>Answer</summary>

**Answer: A.** 802.1D is classic STP. **Why not the others:** 802.1Q (B) is VLAN tagging. 802.1w (C) is Rapid STP, the faster successor. 802.3ad (D) is LACP for EtherChannel.
</details>

**Q3.** Three switches are wired in a triangle and STP has blocked one port. The link that was forwarding between two of them then fails. What happens?

- **A.** Nothing; the blocked port stays blocked until an administrator intervenes.
- **B.** STP recalculates, and the blocked port moves to forwarding so the switches stay connected.
- **C.** All three switches reload to rebuild the spanning tree.
- **D.** The blocked port becomes err-disabled to prevent a loop.

<details><summary>Answer</summary>

**Answer: B.** That's the whole point of blocking rather than unplugging: the standby path is brought into service automatically once STP has worked out the new tree. **Why not the others:** A ignores STP's job of restoring connectivity. C isn't something STP ever does. D would make things worse; err-disable is for protection features such as BPDU Guard.
</details>

## 9.3 How STP Chooses (The Election)

![STP blocking one port to break the loop](images/stp.png)

STP holds "elections" using special messages called **BPDUs** (Bridge Protocol Data Units).

1. **Pick a Root Bridge:** The "boss" switch. It's the one with the **lowest Bridge ID** (Bridge ID = priority + MAC address). Lower priority wins; if tied, lower MAC wins.
2. **Each other switch finds its Root Port:** The port with the **lowest cost** path to the root.
3. **Each segment picks a Designated Port:** The best port to forward on that link.
4. **Any leftover ports get Blocked:** To break the loop.

**Why elect a "root bridge" at all? Why does STP need a boss?** Because to decide *which* port to block, every switch needs to agree on a **single reference point** to measure distance from. Think of it like a group of hikers who all need to find the shortest way home: if they each pick a *different* "home," their maps disagree and they'll make conflicting choices — someone might block the wrong link and cut the network in half. By all agreeing on **one** root bridge, every switch measures "how do I best reach the root?" against the *same* landmark, so their independent decisions fit together into one loop-free tree. **The root is the shared point of reference that makes the whole thing consistent.** (That's also why it's called a *spanning tree* — a tree has no loops, and every branch traces back to one root.)

**Why does "lowest Bridge ID" win, and why is it priority + MAC?** STP needs a tie-proof way to pick exactly one winner. The **MAC address** is guaranteed unique, so it can *always* break a tie — there's never a stalemate. But you don't want the root chosen by random factory MAC luck (the oldest switch, often the weakest, tends to have the lowest MAC!). So STP puts an admin-controllable **priority** *in front* of the MAC. Priority is checked first, so by lowering the priority on your best switch, **you** decide the root — and the MAC is just the automatic backup tiebreaker. (This is exactly why section 9.7 tells you to set the root manually.)

Try it below: change priorities and MACs and see who becomes root. Priority is checked first, and the MAC only breaks a tie.

```diagram
{
  "type": "compare",
  "title": "Which switch becomes the root bridge?",
  "prompt": "All four switches start at the default priority (32769 for VLAN 1), so the **lowest MAC** wins: probably your oldest switch. Lower Core-1's priority to 24577 and watch it take over. Priorities move in steps of 4096 (section 9.10).",
  "winner": "Root bridge",
  "fields": [
    {"id": "prio", "label": "Bridge priority (VLAN 1)", "kind": "number", "rule": "lowest"},
    {"id": "mac", "label": "MAC address", "kind": "mac", "rule": "lowest"}
  ],
  "candidates": [
    {"label": "Core-1", "values": {"prio": 32769, "mac": "00d0.97a4.1c00"}},
    {"label": "Core-2", "values": {"prio": 32769, "mac": "00d0.97a4.2e80"}},
    {"label": "Access-1", "values": {"prio": 32769, "mac": "0019.e8a1.0f00"}},
    {"label": "Access-2", "values": {"prio": 32769, "mac": "001a.2b3c.4d00"}}
  ]
}
```

**Why pick ports by "lowest cost to root"?** Because cost is based on **link speed** — a fast link has a *low* cost, a slow link a *high* cost (see the table). Choosing the lowest-cost path means STP keeps your **fastest** route active and blocks the slower, redundant one. So the network isn't just loop-free — it's loop-free *on the best available path*. Makes sense: if you have a 1 Gbps and a 100 Mbps route to the same place, you want the gigabit one working and the slow one as backup.

Now watch the whole election play out on a triangle of switches, all joined by 1 Gbps links (cost 4 each).

```diagram
{
  "type": "topology",
  "title": "Root bridge, root ports, designated ports, and the blocked port",
  "caption": "Every link is 1 Gbps (cost 4). Press **Next** to run the election.",
  "nodes": [
    {"id": "SW1", "kind": "switch", "x": 2.5, "y": 0, "sub": "prio 24577", "info": "Bridge ID 24577 (priority 24576 + VLAN 1), MAC 00d0.97a4.1c00."},
    {"id": "SW2", "kind": "switch", "x": 0.8, "y": 1.9, "sub": "32769 · 0019.e8a1.0f00"},
    {"id": "SW3", "kind": "switch", "x": 4.2, "y": 1.9, "sub": "32769 · 001a.2b3c.4d00"}
  ],
  "links": [
    {"a": "SW1", "b": "SW2", "bLabel": "Gi0/1"},
    {"a": "SW1", "b": "SW3", "bLabel": "Gi0/1"},
    {"a": "SW2", "b": "SW3", "aLabel": "Gi0/2", "bLabel": "Gi0/2"}
  ],
  "steps": [
    {"title": "1. Everyone claims to be root",
     "text": "When the switches boot, each one sends BPDUs naming **itself** as root. As soon as a switch hears a better (lower) Bridge ID, it stops claiming and passes on the better one instead.",
     "packets": [{"path": ["SW2", "SW3"], "label": "I'm root!"}, {"path": ["SW3", "SW1"], "label": "I'm root!"}, {"path": ["SW1", "SW2"], "label": "I'm root!"}]},
    {"title": "2. Lowest Bridge ID wins: SW1",
     "text": "SW1's priority, 24577, beats 32769, so the MACs never even get compared. SW1 is the **root bridge**, and from now on only SW1 originates BPDUs, advertising a root path cost of **0**.",
     "nodes": {"SW1": {"badge": "Root", "tone": "good"}},
     "packets": [{"path": ["SW1", "SW2"], "label": "root SW1, cost 0", "tone": "good"}, {"path": ["SW1", "SW3"], "label": "root SW1, cost 0", "tone": "good"}]},
    {"title": "3. Each non-root switch picks its root port",
     "text": "SW2 can reach the root directly (cost **4**) or through SW3 (4 + 4 = **8**). The lowest cost wins, so **Gi0/1** is SW2's root port. SW3 does the same sum and also picks its Gi0/1.",
     "nodes": {"SW2": {"badge": "RP Gi0/1", "tone": "accent"}, "SW3": {"badge": "RP Gi0/1", "tone": "accent"}},
     "focus": ["SW1", "SW2", "SW3", "SW1-SW2", "SW1-SW3"]},
    {"title": "4. Designated ports, and the one that blocks",
     "text": "Every port on the root is **designated** for its segment. On the SW2–SW3 link both switches are cost 4 from the root, a tie, so the **lower sender Bridge ID** wins: SW2 (MAC 0019… beats 001a…). SW2's Gi0/2 is designated, and SW3's Gi0/2 is left over, so it **blocks**. The loop is broken.",
     "nodes": {"SW3": {"badge": "Gi0/2 BLK", "tone": "warn"}},
     "links": {"SW2-SW3": "blocked"}},
    {"title": "5. A link fails and the backup takes over",
     "text": "If SW1–SW3 fails, SW3 loses its root port. Its blocked Gi0/2 still hears SW2's BPDUs (cost 4, so 8 for SW3), so it becomes the new **root port**. Classic STP takes about 30 seconds of listening and learning to get there; RSTP takes about a second.",
     "nodes": {"SW3": {"badge": "RP Gi0/2", "tone": "good"}},
     "links": {"SW1-SW3": "down", "SW2-SW3": "active"},
     "packets": [{"path": ["SW1", "SW2", "SW3"], "label": "BPDU", "tone": "good"}]}
  ]
}
```

### STP Path Costs (memorize these!)

| Link Speed | STP Cost |
|-----------|----------|
| 10 Mbps | 100 |
| 100 Mbps | 19 |
| 1 Gbps | 4 |
| 10 Gbps | 2 |

Lower total cost = better path. Faster links have lower cost = preferred. *(Notice the costs aren't a neat formula like 10/9/8 — they're specific values defined by the standard, which is why you just memorize them. Faster = lower, always.)*

**📝 Exam-style questions — 9.3**

**Q1.** Refer to the exhibit. All switches are in VLAN 1's spanning tree. Which switch becomes the root bridge?

```
Switch   Bridge priority   MAC address
SW1      32769             0019.e8a1.1100
SW2      32769             0019.e8a1.0f00
SW3      28673             00d0.ff12.3400
SW4      32769             000c.85a0.2200
```

- **A.** SW1
- **B.** SW2
- **C.** SW3
- **D.** SW4

<details><summary>Answer</summary>

**Answer: C.** Priority is compared first, and SW3's 28673 is the lowest, so the MAC addresses don't matter. **Why not the others:** D has the lowest MAC, which would only win if all the priorities tied; that's the trap. A and B also lose on priority.
</details>

**Q2.** SW1 is the root bridge. SW3 connects to SW1 directly over a 100 Mbps link, and also to SW2 over a 1 Gbps link. SW2 connects to SW1 over a 1 Gbps link. Using the short (default) STP costs, which port becomes SW3's root port, and what is its root path cost?

- **A.** The port toward SW1, cost 19
- **B.** The port toward SW2, cost 8
- **C.** The port toward SW1, cost 4
- **D.** The port toward SW2, cost 23

<details><summary>Answer</summary>

**Answer: B.** Through SW2 it's 4 (SW2 to SW1) + 4 (SW3 to SW2) = 8. Directly, it's 19 for the 100 Mbps link. 8 beats 19, so the root port is the one toward SW2, even though it's an extra hop. **Why not the others:** A picks the direct link, but STP counts cost, not hops. C uses the wrong cost for 100 Mbps. D adds the 100 Mbps cost to a path that doesn't use that link.
</details>

**Q3.** Why does the Bridge ID put an administrator-set priority in front of the MAC address?

- **A.** So the administrator, not factory MAC addresses, decides which switch becomes root
- **B.** Because MAC addresses aren't unique between vendors
- **C.** So the switch with the most ports always becomes root
- **D.** Because the priority sets each port's cost

<details><summary>Answer</summary>

**Answer: A.** Priority is compared first, so lowering it on your best core switch makes that switch root. The MAC is only the tie-breaker that guarantees there's always exactly one winner. **Why not the others:** B is false: MACs are unique, and that's why they can break ties. C is wrong because port count plays no part in the election. D is wrong because port cost comes from link speed, not bridge priority.
</details>

**Q4.** Which two statements about STP port roles are true in a normal switched network? (Choose two.)

- **A.** Every non-root switch has exactly one root port.
- **B.** All active ports on the root bridge are designated ports.
- **C.** The root bridge has one root port toward the core.
- **D.** Each segment has two designated ports, one at each end.
- **E.** The switch with the highest Bridge ID becomes the root bridge.

<details><summary>Answer</summary>

**Answer: A, B.** Each non-root switch keeps one best path to the root (its root port), and the root bridge is cost 0 from itself, so it wins every segment it's on. **Why not the others:** C is wrong because the root has no root port; it *is* the root. D is wrong because each segment has exactly one designated port. E has it backwards: the lowest Bridge ID wins.
</details>

## 9.4 Port States (The Traffic Lights)

In classic STP, a port moves through states before it forwards data:

| Order | State | Roughly how long | What happens |
|-------|-------|------------------|--------------|
| 1 | **Blocking** | ~20 s | Listens to BPDUs, forwards nothing |
| 2 | **Listening** | ~15 s | Works out the topology |
| 3 | **Learning** | ~15 s | Builds its MAC table, still forwards nothing |
| 4 | **Forwarding** | — | Finally passes traffic |

- **Blocking:** No data, just listens for BPDUs.
- **Listening:** Preparing, no data yet.
- **Learning:** Building the MAC table, still no data.
- **Forwarding:** Finally sending data! 🟢
- **Disabled:** Turned off.

**Why does a port "waste" ~30–50 seconds crawling through these states instead of forwarding right away?** Because forwarding too soon could *create the very loop STP exists to prevent.* Picture what happens when a new link comes up: for a brief moment, this switch and its neighbor might **both** think they should forward on it — and if they both start instantly, you get a temporary loop and a broadcast storm before STP finishes its calculations. The waiting states are a deliberate **"measure twice, cut once"** safety pause:

- **Listening** gives every switch time to exchange BPDUs and *agree* on the final tree, so no two switches make a conflicting choice.
- **Learning** lets the port build up its MAC table *before* it starts forwarding, so when it does go live it isn't flooding everything blindly.

Step through the full 50 seconds below. SW1 is the root, and the link between SW1 and SW2 has just failed. Watch SW3's blocked port Gi0/2, which faces SW2.

```diagram
{
  "type": "sequence",
  "title": "Classic STP: 50 seconds from blocking to forwarding",
  "actors": [
    {"id": "SW3", "kind": "switch", "label": "SW3 Gi0/2"},
    {"id": "SW2", "kind": "switch", "label": "SW2"},
    {"id": "SW1", "kind": "switch", "label": "SW1 (root)"}
  ],
  "messages": [
    {"from": "SW2", "to": "SW3", "label": "BPDU: root SW1, cost 4", "states": {"SW3": "Blocking"},
     "text": "Before the failure, SW2's designated port sends BPDUs every 2 seconds. SW3's Gi0/2 is **blocking**: it forwards no user frames but stores the best BPDU it hears there."},
    {"note": "SW1–SW2 link fails", "over": ["SW1", "SW2"],
     "text": "SW2 loses its root port and has no other path it knows of to SW1. It's an **indirect** failure for SW3: SW3's own links are fine."},
    {"from": "SW2", "to": "SW3", "label": "BPDU: I'm root (SW2)", "tone": "warn",
     "text": "SW2 now claims to be root itself. That BPDU is **inferior** to the one SW3 has stored (root SW1), so classic STP ignores it."},
    {"from": "SW3", "to": "SW3", "label": "Max Age expires", "detail": "20 seconds", "states": {"SW3": "Listening"},
     "text": "SW3 keeps the old information until **Max Age (20 s)** runs out. Only then does Gi0/2 become designated and move to **listening**. No user data yet."},
    {"from": "SW3", "to": "SW2", "label": "BPDU: root SW1, cost 4", "tone": "good",
     "text": "SW3 tells SW2 about the real root. SW2 makes the port toward SW3 its new root port and stops claiming to be root."},
    {"from": "SW3", "to": "SW3", "label": "Forward Delay expires", "detail": "15 seconds", "states": {"SW3": "Learning"},
     "text": "After **15 s** of listening, the port moves to **learning**: it fills its MAC table from incoming frames but still doesn't forward them."},
    {"from": "SW3", "to": "SW3", "label": "Forward Delay expires", "detail": "15 seconds", "states": {"SW3": "Forwarding"}, "tone": "good",
     "text": "After another **15 s**, the port is **forwarding**. 20 + 15 + 15 = **50 seconds** of outage. That wait is the reason RSTP exists."}
  ]
}
```

The timers (20s blocking, 15s + 15s) are STP being cautious — it would rather be **slow and safe** than fast and looping. This caution is exactly *why* people invented the faster RSTP (next), and *why* PortFast exists for ports that provably can't cause a loop (a single PC).

**📝 Exam-style questions — 9.4**

**Q1.** In classic 802.1D STP, in what order does a blocked port move through the states on its way to forwarding?

- **A.** Blocking, learning, listening, forwarding
- **B.** Blocking, listening, learning, forwarding
- **C.** Listening, blocking, learning, forwarding
- **D.** Blocking, forwarding, learning, listening

<details><summary>Answer</summary>

**Answer: B.** The port first *listens* (agrees on the topology with BPDUs), then *learns* (fills its MAC table), then forwards. **Why not the others:** A learns MAC addresses before the topology is settled. C and D put the states in an order STP never uses.
</details>

**Q2.** In which two 802.1D states does a port add entries to the MAC address table? (Choose two.)

- **A.** Blocking
- **B.** Listening
- **C.** Learning
- **D.** Forwarding
- **E.** Disabled

<details><summary>Answer</summary>

**Answer: C, D.** Learning exists to fill the MAC table before forwarding starts, and forwarding keeps learning while it passes traffic. **Why not the others:** blocking (A) and listening (B) process BPDUs only. Disabled (E) does nothing at all.
</details>

**Q3.** With the default 802.1D timers, an indirect link failure means a blocked port must first wait for its stored BPDU to age out. About how long is it before that port forwards traffic?

- **A.** 2 seconds
- **B.** 15 seconds
- **C.** 30 seconds
- **D.** 50 seconds

<details><summary>Answer</summary>

**Answer: D.** Max Age (20 s) + listening (15 s forward delay) + learning (15 s forward delay) = 50 s. **Why not the others:** A is the hello time between BPDUs. B is a single forward delay. C is listening plus learning only, which is what you get after a *direct* failure, when there's no Max Age to wait out.
</details>

**Q4.** Why does a port wait in the listening state before it starts forwarding?

- **A.** To give every switch time to exchange BPDUs and agree on the final tree, so no temporary loop forms
- **B.** To wait for the attached host to get an address from DHCP
- **C.** To let the port negotiate speed and duplex
- **D.** To check that the port's VLAN exists

<details><summary>Answer</summary>

**Answer: A.** If two switches both started forwarding on a new link before agreeing on the tree, a short loop and broadcast storm could form. The wait is STP being "slow and safe". **Why not the others:** B is backwards; the wait often makes DHCP *time out*, which is one reason PortFast exists. C is autonegotiation, a Layer 1 process that happens before STP is involved. D has nothing to do with STP timers.
</details>

## 9.5 Faster STP: RSTP (802.1w)

Classic STP is slow (~30-50 seconds to recover). **RSTP (Rapid Spanning Tree, 802.1w)** does the same job in **a few seconds**. It's the modern default. RSTP port roles: Root, Designated, **Alternate** (backup to root), and **Backup**.

**📝 Exam-style questions — 9.5**

**Q1.** Which IEEE standard defines Rapid Spanning Tree Protocol?

- **A.** 802.1D
- **B.** 802.1w
- **C.** 802.1s
- **D.** 802.1X

<details><summary>Answer</summary>

**Answer: B.** 802.1w is RSTP. **Why not the others:** 802.1D (A) is classic STP. 802.1s (C) is MST, which maps many VLANs to a few instances. 802.1X (D) is port-based authentication, nothing to do with spanning tree.
</details>

**Q2.** Which RSTP port role is a pre-computed backup for the root port, receiving BPDUs from a different switch?

- **A.** Designated
- **B.** Alternate
- **C.** Backup
- **D.** Edge

<details><summary>Answer</summary>

**Answer: B.** An alternate port offers a different path to the root and takes over at once if the root port fails. **Why not the others:** A forwards onto a segment. C backs up a *designated* port on the same shared segment (it hears its own switch's BPDUs). D isn't a role at all; "edge" is RSTP's name for a PortFast port.
</details>

**Q3.** An access switch running Rapid PVST+ connects to an old switch that only runs 802.1D. What happens on that link?

- **A.** The link is err-disabled because the versions don't match.
- **B.** The RSTP switch falls back to 802.1D behaviour on that port, so it converges with classic timers.
- **C.** The old switch is upgraded to RSTP automatically.
- **D.** Both switches stop sending BPDUs on that link.

<details><summary>Answer</summary>

**Answer: B.** RSTP is backward compatible. When it hears 802.1D BPDUs on a port, it speaks 802.1D on that port, and loses the rapid convergence there. **Why not the others:** A is wrong because a version difference isn't treated as an error. C is impossible: a protocol can't upgrade another switch's software. D would blind STP to that link and risk a loop.
</details>

## 9.6 PortFast & BPDU Guard (Helpful Extras)

- **PortFast:** Lets a port to a PC skip the waiting states and go straight to forwarding. Use ONLY on ports with end devices (never switch-to-switch!).
- **BPDU Guard:** If a PortFast port suddenly receives a BPDU (meaning someone plugged in a switch!), it shuts the port down. Great protection.

```
SW1(config)# interface fa0/1
SW1(config-if)# spanning-tree portfast
SW1(config-if)# spanning-tree bpduguard enable
```

**Why is PortFast SAFE on a PC port but DANGEROUS on a switch port?** A loop needs **at least two switches** — a single PC has only one cable and physically cannot loop traffic back on itself. So skipping the safety wait on a PC port risks nothing; there's no loop to worry about. But if you enabled PortFast on a **switch-to-switch** link, that port would jump straight to forwarding without the "measure twice" pause — the exact recipe for the instant loop STP is supposed to prevent. *PortFast is safe precisely where a loop is impossible, and reckless where a loop is possible.*

**Why do we ALSO need BPDU Guard, and why does it pair with PortFast?** Here's the risk PortFast creates: you told the switch "trust me, this port only has a harmless PC." But what if someone (a confused user, or an attacker) unplugs the PC and plugs in a **switch**? That port would happily fast-forward and could form a loop — the very thing you disabled the safety wait for. **BPDU Guard is the safety net.** Only switches send BPDUs, so if a PortFast port ever *receives* a BPDU, something is plugged in that shouldn't be. BPDU Guard immediately **shuts the port down** rather than risk a loop. So the two features are a team: **PortFast** makes PC ports fast, and **BPDU Guard** makes that speed safe by slamming the door if a switch ever appears where only a PC was allowed.

**Why is PortFast also just... nice for users?** Without it, a PC plugging in waits ~30 seconds in the STP states before it can talk — long enough that a PC might give up on getting a DHCP address ("no network!") before the port even wakes up. PortFast removes that delay, so devices get online instantly. Practical *and* it dodges a real support headache.

> **PortFast and BPDU Guard protect *access* ports.** Two more guards protect the rest of the topology — **Root Guard** and **Loop Guard** — and section **9.9** puts all four side by side so you don't mix them up on the exam.

**📝 Exam-style questions — 9.6**

**Q1.** A port has PortFast and BPDU Guard enabled. A user plugs a small switch into it, and the switch sends a BPDU. What does the port do?

- **A.** It moves to the err-disabled state.
- **B.** It moves to the blocking state until the BPDUs stop.
- **C.** It becomes a root port.
- **D.** It ignores the BPDU, because PortFast ports don't process BPDUs.

<details><summary>Answer</summary>

**Answer: A.** BPDU Guard shuts the port down (err-disabled) the moment a BPDU arrives, because a port that was promised to have only an end device clearly has a switch on it. **Why not the others:** B describes the inconsistent states of Root Guard and Loop Guard, which recover on their own. C would only happen if nothing protected the port and the BPDU were better than the current root path. D is false: PortFast ports still send and receive BPDUs, which is how BPDU Guard can spot one.
</details>

**Q2.** Where should PortFast be enabled?

- **A.** On access ports connected to a single end device such as a PC or printer
- **B.** On trunk ports between distribution switches
- **C.** On every port, to speed up convergence
- **D.** Only on the root bridge's ports

<details><summary>Answer</summary>

**Answer: A.** A single end device can't create a loop, so it's safe to skip the listening and learning wait there. **Why not the others:** B and D are switch-to-switch links, where jumping straight to forwarding could cause a loop. C would remove STP's safety pause everywhere, including where loops are possible.
</details>

**Q3.** Refer to the exhibit. What happened, and how is the port brought back into service?

```
%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi0/10 with BPDU Guard enabled. Disabling port.
%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/10, putting Gi0/10 in err-disable state
```

- **A.** A device that sends BPDUs was connected to Gi0/10. Remove it, then `shutdown` and `no shutdown` the port (or let errdisable recovery do it).
- **B.** Gi0/10 is blocking and will recover by itself when the BPDUs stop.
- **C.** A port security violation occurred. Run `clear port-security` on Gi0/10.
- **D.** Gi0/10 became the root port. Lower the bridge priority to fix it.

<details><summary>Answer</summary>

**Answer: A.** BPDU Guard err-disabled the port because a BPDU arrived. An err-disabled port stays down until it's bounced by hand or by `errdisable recovery cause bpduguard`, and you should remove the offending switch first or it will happen again. **Why not the others:** B is how Root Guard and Loop Guard behave, not BPDU Guard. C is a different feature with different log messages. D is wrong because the port is disabled, not forwarding in any role.
</details>

**Q4.** Which global configuration command enables BPDU Guard on every port where PortFast is enabled?

- **A.** `spanning-tree bpduguard enable`
- **B.** `spanning-tree portfast bpduguard default`
- **C.** `spanning-tree portfast default`
- **D.** `errdisable recovery cause bpduguard`

<details><summary>Answer</summary>

**Answer: B.** This global command turns on BPDU Guard for all PortFast-enabled ports at once. **Why not the others:** A is the interface-level command for one port. C enables PortFast on all non-trunk ports, not BPDU Guard. D only controls automatic recovery after an err-disable.
</details>

## 9.7 Making a Switch the Root (Best Practice)

Don't let STP pick a random root. Force your best central switch to be root:

```
SW1(config)# spanning-tree vlan 10 root primary   ! become root for VLAN 10
! or set priority directly (must be multiples of 4096):
SW1(config)# spanning-tree vlan 10 priority 4096
```

**📝 Exam-style questions — 9.7**

**Q1.** Which value can be set with `spanning-tree vlan 10 priority`?

- **A.** 30000
- **B.** 28672
- **C.** 32769
- **D.** 65535

<details><summary>Answer</summary>

**Answer: B.** The priority must be a multiple of 4096 from 0 to 61440, and 28672 = 7 × 4096. **Why not the others:** A isn't a multiple of 4096. C is what `show spanning-tree` *displays* for VLAN 1 (32768 + 1), not a value you can type. D is beyond the 61440 maximum.
</details>

**Q2.** An engineer enters `spanning-tree vlan 10 root primary` on SW1. The current root for VLAN 10 has priority 32778 (32768 + 10). What does the command do?

- **A.** It sets SW1's priority to 0.
- **B.** It sets SW1's priority to 24576, low enough to win against the current root.
- **C.** It keeps watching the network and lowers SW1's priority whenever another switch tries to become root.
- **D.** It sets SW1's priority to 4096.

<details><summary>Answer</summary>

**Answer: B.** `root primary` is a macro that runs once. It sets 24576 if that's enough to beat the current root; otherwise it sets the priority 4096 below the current root's. Here 24576 beats 32768, so 24576 it is. **Why not the others:** A and D are values you could set by hand, but not what the macro chooses here. C is the big misconception: the macro calculates once and saves a plain priority, so a switch added later with priority 0 would still win. Setting the priority explicitly is more predictable.
</details>

**Q3.** Which priority does `spanning-tree vlan 10 root secondary` set?

- **A.** 4096
- **B.** 24576
- **C.** 28672
- **D.** 32768

<details><summary>Answer</summary>

**Answer: C.** Secondary sets 28672: lower than the default 32768, so this switch takes over if the primary root fails, but higher than the primary's 24576. **Why not the others:** B is the value `root primary` usually sets. D is the default. A is a value you'd set by hand.
</details>

---

## 9.8 STP Flavors — PVST+, Rapid PVST+ and Why Cisco Runs One Per VLAN

So far we've talked about "STP" as one thing. In reality there are several **versions**, and the exam expects you to tell them apart.

| Flavor | Standard | Speed | Instances |
|--------|----------|-------|-----------|
| **STP** | 802.1D | Slow (30–50 s) | One for the whole switch |
| **PVST+** | Cisco | Slow (30–50 s) | **One per VLAN** |
| **RSTP** | 802.1w | Fast (seconds) | One for the whole switch |
| **Rapid PVST+** | Cisco (802.1w per VLAN) | **Fast (seconds)** | **One per VLAN** |

**Rapid PVST+ is the Cisco default on modern switches**, and it's the one to assume unless a question says otherwise.

**Why run a separate spanning tree for every VLAN — isn't that a lot of extra work?** It is more work, and it buys something valuable: **you can use all your links instead of wasting half of them.** Remember what plain STP does — it blocks redundant links to break loops. With one spanning tree for everything, a blocked link is blocked for *all* traffic; you bought a second uplink and it sits idle doing nothing until something breaks.

Step through it below: one tree for everything versus one tree per VLAN.

```diagram
{
  "type": "topology",
  "title": "One tree per VLAN puts both uplinks to work",
  "caption": "AS1 is an access switch with an uplink to each distribution switch. All links are 1 Gbps.",
  "nodes": [
    {"id": "DS1", "kind": "l3switch", "x": 0.6, "y": 0, "sub": "distribution"},
    {"id": "DS2", "kind": "l3switch", "x": 0.6, "y": 2.2, "sub": "distribution"},
    {"id": "AS1", "kind": "switch", "x": 3.4, "y": 1.1, "sub": "access · VLANs 10, 20"}
  ],
  "links": [
    {"a": "DS1", "b": "DS2", "style": "thick", "label": "trunk"},
    {"a": "AS1", "b": "DS1", "label": "uplink 1", "aLabel": "Gi0/1"},
    {"a": "AS1", "b": "DS2", "label": "uplink 2", "aLabel": "Gi0/2"}
  ],
  "steps": [
    {"title": "1. One tree for everything",
     "text": "With one spanning tree for all VLANs (classic 802.1D), DS1 is root for everything, and AS1's uplink to DS2 is blocked for **every** VLAN. You paid for two uplinks and one sits idle.",
     "nodes": {"DS1": {"badge": "Root (all)", "tone": "good"}},
     "links": {"AS1-DS1": "active", "AS1-DS2": "blocked"},
     "packets": [{"path": ["AS1", "DS1"], "label": "VLANs 10 + 20"}]},
    {"title": "2. PVST+: VLAN 10's tree",
     "text": "Now each VLAN gets its own election. For **VLAN 10**, DS1 has the lowest priority (`root primary`), so it's root. AS1 blocks uplink 2 **for VLAN 10 only**.",
     "nodes": {"DS1": {"badge": "Root VLAN 10"}},
     "packets": [{"path": ["AS1", "DS1"], "label": "VLAN 10", "tone": "accent"}]},
    {"title": "3. VLAN 20's tree",
     "text": "For **VLAN 20**, DS2 is root. Now uplink 2 forwards and uplink 1 is the one blocked, but only for VLAN 20.",
     "nodes": {"DS1": null, "DS2": {"badge": "Root VLAN 20", "tone": "good"}},
     "links": {"AS1-DS1": "blocked", "AS1-DS2": "active"},
     "packets": [{"path": ["AS1", "DS2"], "label": "VLAN 20", "tone": "purple"}]},
    {"title": "4. Both uplinks carry traffic",
     "text": "Put the two trees together: each uplink forwards for one VLAN and blocks for the other. Both links carry real traffic, every VLAN is still loop-free, and if one uplink fails, its VLANs reconverge onto the other.",
     "nodes": {"DS1": {"badge": "Root VLAN 10", "tone": "good"}},
     "links": {"AS1-DS1": "active", "AS1-DS2": "active"},
     "packets": [{"path": ["AS1", "DS1"], "label": "VLAN 10", "tone": "accent"}, {"path": ["AS1", "DS2"], "label": "VLAN 20", "tone": "purple"}]}
  ]
}
```

With one tree per VLAN, you can deliberately make **different switches the root for different VLANs**:

Make **SW1** the root for VLAN 10 and **SW2** the root for VLAN 20, and the
blocking decisions land on different links for each VLAN:

| VLAN | Root | Left link | Right link |
|------|------|-----------|------------|
| **10** | SW1 | forwarding | blocked |
| **20** | SW2 | blocked | forwarding |

Each link is blocked for *some* VLANs and forwarding for *others* — so **both
uplinks carry real traffic**, while every VLAN still has a loop-free tree.

Now each link is blocked for *some* VLANs and forwarding for *others*, so both uplinks carry real traffic and you get crude **load balancing** — while each VLAN still has a perfectly loop-free tree. *You pay in CPU (each VLAN runs its own election) and gain link utilization. That trade is why Cisco made per-VLAN the default.*

The command that sets which switch wins the election is per-VLAN for exactly this reason:

```
SW1(config)# spanning-tree mode rapid-pvst        ! the modern default
SW1(config)# spanning-tree vlan 10 root primary   ! SW1 = root for VLAN 10
SW2(config)# spanning-tree vlan 20 root primary   ! SW2 = root for VLAN 20
```

**📝 Exam-style questions — 9.8**

**Q1.** Which spanning tree flavor runs a separate 802.1w (rapid) instance for each VLAN?

- **A.** PVST+
- **B.** Rapid PVST+
- **C.** RSTP
- **D.** 802.1D

<details><summary>Answer</summary>

**Answer: B.** Rapid PVST+ is Cisco's per-VLAN version of 802.1w: fast convergence and one tree per VLAN. **Why not the others:** A is per-VLAN but uses slow 802.1D timers. C is rapid but runs one tree for the whole switch. D is slow and runs one tree for everything.
</details>

**Q2.** An engineer makes DS1 the root bridge for VLAN 10 and DS2 the root bridge for VLAN 20. What is the main benefit?

- **A.** Both uplinks from each access switch carry traffic, because each one forwards for a different VLAN.
- **B.** Spanning tree is no longer needed for VLANs 10 and 20.
- **C.** VLAN 10 and VLAN 20 hosts can now talk to each other without a router.
- **D.** Each switch now sends fewer BPDUs.

<details><summary>Answer</summary>

**Answer: A.** With different roots, the blocked port lands on a different uplink for each VLAN, so you get crude load balancing instead of an idle link. **Why not the others:** B is wrong: each VLAN still has its own loop-free tree. C is wrong: routing between VLANs still needs a Layer 3 device. D is backwards: per-VLAN STP sends BPDUs for every VLAN, so more of them.
</details>

**Q3.** Refer to the exhibit. Which statement is true?

```
SW1# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0019.e8a1.0f00
             This bridge is the root
```

- **A.** SW1 runs Rapid PVST+ and is the root for VLAN 10, with a configured priority of 24576.
- **B.** SW1 runs PVST+ and is the root for VLAN 10.
- **C.** SW1 has a configured priority of 24586 for VLAN 10.
- **D.** SW1 runs MST, and VLAN 10 is mapped to instance 10.

<details><summary>Answer</summary>

**Answer: A.** In rapid-pvst mode, IOS shows the protocol as `rstp`. The displayed priority is the configured priority plus the VLAN number: 24586 = 24576 + 10. **Why not the others:** B would show `protocol ieee`. C is impossible, because priorities must be multiples of 4096. D would show `protocol mstp` and an MST instance instead of VLAN0010.
</details>

## 9.9 Protecting the Topology: Root Guard, Loop Guard & BPDU Filter

PortFast and BPDU Guard (section 9.6) protect **access ports**. There are two more guards the exam asks about, and each defends against a *different* accident. The trick is keeping them straight — so here's what each one is afraid of.

### Root Guard — "You Are Not Allowed to Become the Root"

**The fear:** someone plugs a switch into your network that has a **better (lower) bridge priority** than your carefully chosen root — maybe an old switch from a cupboard with priority 4096 still configured, or a small unmanaged switch someone brought from home. STP does exactly what it's designed to do: it holds a new election, that switch **wins**, and suddenly your entire network's traffic is being funneled through a slow switch sitting under someone's desk. Nothing is "broken" — everything is just mysteriously terrible.

**The fix:** on ports where a root bridge should **never** appear (ports facing access switches or other companies), enable Root Guard. If a **superior BPDU** arrives, the port is put into **root-inconsistent** state — it stops forwarding until the offending switch stops shouting.

```
SW(config-if)# spanning-tree guard root
SW# show spanning-tree inconsistentports
```

### Loop Guard — "I Stopped Hearing From You, So I'll Stay Cautious"

**The fear:** this one is subtle. A **blocking** port stays blocking only because it keeps *receiving* BPDUs from the neighbor. If those BPDUs stop arriving — not because the link died, but because of a one-way (unidirectional) failure, like a broken fiber strand in one direction — the blocked port thinks *"no more BPDUs, the loop must be gone,"* and helpfully **starts forwarding**. The link is still physically up in the other direction, so you've just created a **real loop** — a broadcast storm caused by the loop-prevention protocol itself.

**The fix:** Loop Guard says *"if a port that was receiving BPDUs suddenly stops, don't assume the loop is gone — assume something is wrong."* The port goes into **loop-inconsistent** state instead of forwarding, and recovers automatically when BPDUs return.

```
SW(config-if)# spanning-tree guard loop
```

### BPDU Filter — "Don't Even Talk About Spanning Tree Here"

BPDU Filter **suppresses BPDUs** on a port. It's the odd one out, because it's the only one that makes the network *less* protected, and it's genuinely dangerous: filtering on a port that turns out to connect to another switch means **STP is blind to that link**, and a loop there will never be blocked. Use it only on ports facing networks you deliberately don't share STP with.

### Keeping Them Straight (Exam Gold)

| Feature | Put it on | Triggers when | Reasoning |
|---------|-----------|---------------|-----------|
| **PortFast** | Access ports (PCs) | — | Skip the wait; PCs don't cause loops |
| **BPDU Guard** | Access ports (PCs) | A BPDU **arrives** | A PC port should *never* see a switch |
| **Root Guard** | Toward other switches | A **superior** BPDU arrives | That switch may not become root |
| **Loop Guard** | Blocking/non-designated ports | BPDUs **stop arriving** | Silence is suspicious, not safe |
| **BPDU Filter** | Rare, edge cases | — | Stops sending/processing BPDUs |

*The one-line memory hook:* **BPDU Guard reacts to a BPDU showing up where it shouldn't. Loop Guard reacts to a BPDU disappearing where it should still be.* One fears noise, the other fears silence.

**📝 Exam-style questions — 9.9**

**Q1.** Which feature puts a port into the root-inconsistent state if it receives a superior BPDU?

- **A.** BPDU Guard
- **B.** Root Guard
- **C.** Loop Guard
- **D.** BPDU Filter

<details><summary>Answer</summary>

**Answer: B.** Root Guard says "no root bridge may ever appear through this port". A superior BPDU there stops the port forwarding until the superior BPDUs stop. **Why not the others:** A err-disables on *any* BPDU. C reacts to BPDUs *stopping* (loop-inconsistent). D just suppresses BPDUs and protects nothing.
</details>

**Q2.** A fiber link has failed in one direction only. A blocked port on SW3 stops receiving BPDUs, although the link still looks up. Which feature stops that port from moving to forwarding and creating a loop?

- **A.** Root Guard
- **B.** BPDU Guard
- **C.** Loop Guard
- **D.** PortFast

<details><summary>Answer</summary>

**Answer: C.** Loop Guard treats silence on a port that used to hear BPDUs as suspicious. It puts the port into loop-inconsistent instead of letting it forward. **Why not the others:** A and B react to BPDUs *arriving*, but here they've stopped. D would make things worse by skipping the wait states.
</details>

**Q3.** Refer to the exhibit. What happens when the device on Gi0/3 stops sending superior BPDUs?

```
SW1# show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0010             GigabitEthernet0/3       Root Inconsistent

Number of inconsistent ports (segments) in the system : 1
```

- **A.** Gi0/3 recovers automatically and goes back through the normal STP states.
- **B.** Gi0/3 stays down until an administrator enters `shutdown` and `no shutdown`.
- **C.** Gi0/3 moves to err-disabled.
- **D.** Gi0/3 becomes the root port for VLAN 10.

<details><summary>Answer</summary>

**Answer: A.** Root-inconsistent is a temporary blocking state. Once the superior BPDUs stop, the port recovers by itself. **Why not the others:** B and C describe BPDU Guard's err-disable, which needs a manual or timed recovery. D is exactly what Root Guard exists to prevent.
</details>

---

## 9.10 STP Mechanics In Depth — Bridge IDs, Costs and Port Roles

> 🔬 **Depth section.** Section 9.3 covered *who wins*; this covers the fields and the exact decision order — which is what troubleshooting (and CCNP) actually requires.

### What a BPDU Carries

Switches converge by flooding one small message, the **BPDU**, every 2 seconds. Four fields decide everything:

| Field | Meaning |
|-------|---------|
| **Root Bridge ID** | Who the sender believes is root |
| **Root Path Cost** | The sender's total cost to reach that root |
| **Sender Bridge ID** | Who is sending this BPDU |
| **Port ID** | Which port it left from (port priority + port number) |

### The Bridge ID Is Not Just a Priority

The Bridge ID is **8 bytes**, in three parts:

| Part | Size | Contents |
|------|------|----------|
| Priority | 4 bits | 0–61440, **only in steps of 4096** |
| Extended System ID | 12 bits | The **VLAN number** |
| MAC address | 6 bytes | The switch's own address — the final tie-breaker |

*Default: priority 32768 + the VLAN — which is why VLAN 1 displays as 32769.*

**Why is the priority forced into steps of 4096, instead of any number you like?** Because the low 12 bits were **repurposed to hold the VLAN ID**. When Cisco moved to one spanning tree per VLAN (section 9.8), each instance needed its own distinct Bridge ID — but the field was full. The fix was to carve the VLAN number out of the priority field, which leaves only the top 4 bits adjustable: 2⁴ = 16 usable values, spaced 4096 apart. *That's why `spanning-tree vlan 10 priority 4097` is rejected but 4096 is accepted — and why a switch's Bridge ID differs per VLAN even though the MAC is identical.*

This also explains the default you see everywhere: priority 32768 for VLAN 1 displays as **32769** (32768 + 1).

### How Root Path Cost Accumulates

Cost is **added on reception**, using the cost of the port the BPDU arrived on:

| Link speed | Cost |
|------------|------|
| 10 Mbps | 100 |
| 100 Mbps | 19 |
| 1 Gbps | 4 |
| 10 Gbps | 2 |

Take a chain — ROOT, then SW2, then SW3, joined by 1 Gbps links (cost 4 each):

Try a bigger example below. SW4 has two ways to reach the root, and its root port is on the cheaper one. Change the link costs (for example, make SW2–SW4 a 100 Mbps link, cost 19) and watch it move.

```diagram
{
  "type": "path",
  "title": "SW4's root port is on its cheapest path to the root",
  "prompt": "Each cost is the STP cost of that link (1 Gbps = 4, 100 Mbps = 19). If you make the two paths cost the same, both light up, but STP still uses only one: it breaks the tie with the lower sender Bridge ID, as described below.",
  "metric": "Root path cost",
  "from": "SW4",
  "to": "ROOT",
  "nodes": [
    {"id": "ROOT", "x": 0, "y": 1},
    {"id": "SW2", "x": 2, "y": 0},
    {"id": "SW3", "x": 2, "y": 2},
    {"id": "SW4", "x": 4, "y": 1}
  ],
  "links": [
    {"a": "ROOT", "b": "SW2", "cost": 4, "label": "1G"},
    {"a": "ROOT", "b": "SW3", "cost": 19, "label": "100M"},
    {"a": "SW2", "b": "SW4", "cost": 4, "label": "1G"},
    {"a": "SW3", "b": "SW4", "cost": 4, "label": "1G"}
  ]
}
```

| Switch | BPDU says | Adds its ingress cost | Advertises onward |
|--------|-----------|-----------------------|-------------------|
| ROOT | — | — | cost **0** |
| SW2 | receives 0 | + 4 | cost **4** |
| SW3 | receives 4 | + 4 | knows it is **8** from root |

**Why add on the way in rather than on the way out?** Because a switch knows the speed of the link it *received* on, but not what the neighbour's outbound link will be. Charging the cost at ingress means every switch computes its own distance from local facts only — no coordination needed. *Notice costs are not linear with speed: 10 Mbps is 100 while 1 Gbps is 4. The scale was chosen so slow links look dramatically worse, not proportionally worse.*

### The Decision Order (Memorize This Sequence)

Every port role in the network comes from applying four tie-breakers, **in order**, stopping at the first that decides:

1. **Lowest Root Bridge ID** — who is root at all.
2. **Lowest Root Path Cost** — of the paths to root, which is cheapest.
3. **Lowest Sender Bridge ID** — if costs tie, which neighbour is preferable.
4. **Lowest Sender Port ID** — if even that ties (two links to the *same* neighbour), which of its ports.

Then roles fall out:

Try the four tie-breakers below. SW4 hears a BPDU on each of its uplinks and has to pick one as its root port. Both start at the same root path cost, so the decision falls through to the sender's Bridge ID.

```diagram
{
  "type": "compare",
  "title": "Which of SW4's ports becomes the root port?",
  "prompt": "Both BPDUs name the same root. Lower the cost on one, or change a sender's priority or MAC, and see which tie-breaker decides. To reach the port ID tie-breaker, give both candidates the same sender (as with two parallel links to one neighbour).",
  "winner": "Root port",
  "fields": [
    {"id": "cost", "label": "Root path cost via this port", "kind": "number", "rule": "lowest"},
    {"id": "sprio", "label": "Sender bridge priority", "kind": "number", "rule": "lowest"},
    {"id": "smac", "label": "Sender MAC", "kind": "mac", "rule": "lowest"},
    {"id": "pprio", "label": "Sender port priority", "kind": "number", "rule": "lowest"},
    {"id": "pnum", "label": "Sender port number", "kind": "number", "rule": "lowest"}
  ],
  "candidates": [
    {"label": "Gi0/1 (from SW2)", "values": {"cost": 8, "sprio": 32769, "smac": "001a.2b3c.4d00", "pprio": 128, "pnum": 3}},
    {"label": "Gi0/2 (from SW3)", "values": {"cost": 8, "sprio": 32769, "smac": "0019.e8a1.0f00", "pprio": 128, "pnum": 2}}
  ]
}
```

- **Root Port** — the one port on each non-root switch with the best path to root. *Every non-root switch has exactly one.*
- **Designated Port** — on each segment, the one port responsible for forwarding onto it. *Every segment has exactly one.* All ports on the root bridge are designated.
- **Blocking / Non-designated** — everything else.

**Why does step 4 exist at all — when would two links tie on everything else?** When a switch has **two parallel links to the same neighbour**. Same root, same cost, same sender Bridge ID — the first three tie-breakers are useless. Port ID is the final arbiter, and it's why the lower-numbered port becomes the root port and the other blocks. (If you'd rather bundle them than block one, that's exactly what EtherChannel in Chapter 10 is for.)

**📝 Exam-style questions — 9.10**

**Q1.** A switch uses the default bridge priority. What priority does `show spanning-tree vlan 20` display for it?

- **A.** 32768
- **B.** 32769
- **C.** 32788
- **D.** 20

<details><summary>Answer</summary>

**Answer: C.** The displayed value is the priority (32768) plus the extended system ID, which is the VLAN number (20): 32788. **Why not the others:** A leaves out the VLAN. B is what VLAN 1 shows. D is just the VLAN number.
</details>

**Q2.** ROOT connects to SW2 over a 1 Gbps link, and SW2 connects to SW3 over a 100 Mbps link. Using short STP costs, what root path cost does SW3 advertise in the BPDUs it sends downstream?

- **A.** 4
- **B.** 19
- **C.** 23
- **D.** 27

<details><summary>Answer</summary>

**Answer: C.** ROOT advertises 0. SW2 adds 4 for the 1 Gbps port it received on and advertises 4. SW3 adds 19 for its 100 Mbps port, so its cost is 23, and that's what it advertises onward. **Why not the others:** A is SW2's cost. B is only the last link. D adds the 1 Gbps cost twice.
</details>

**Q3.** Refer to the exhibit. SW1 is the root. SW2 has two parallel links to it, with every port at the default port priority of 128. Which port becomes SW2's root port?

```
SW2 Gi0/1  <------>  SW1 Gi0/24
SW2 Gi0/2  <------>  SW1 Gi0/23
```

- **A.** Gi0/1, because it has the lower local port number
- **B.** Gi0/2, because it receives BPDUs from SW1's lower port ID (Gi0/23)
- **C.** Both, because they're equal-cost paths
- **D.** Whichever link came up first

<details><summary>Answer</summary>

**Answer: B.** Root ID, cost and sender Bridge ID all tie, so the decision falls to the **sender's** port ID, the port on SW1 that sent the BPDU. SW1's Gi0/23 has a lower port ID than Gi0/24, so SW2's Gi0/2 wins. **Why not the others:** A is the trap: SW2's own port number is used only as a final tie-breaker when the sender port IDs also match, which can't happen here. C is wrong because STP never forwards on two root ports. D has no part in the election.
</details>

**Q4.** Why must a bridge priority be a multiple of 4096?

- **A.** Because the low 12 bits of the 16-bit priority field now carry the VLAN ID (the extended system ID)
- **B.** Because 4096 is the maximum number of switches in one STP domain
- **C.** Because port costs are calculated in units of 4096
- **D.** Because the MAC address takes up the low 12 bits

<details><summary>Answer</summary>

**Answer: A.** Per-VLAN STP needed a different Bridge ID for each VLAN, so the low 12 bits of the priority field were given to the VLAN number. Only the top 4 bits are left for you to set, and they count in steps of 4096. **Why not the others:** B is made up; there's no such limit. C mixes up port cost with bridge priority. D is wrong because the MAC is a separate 6-byte part of the Bridge ID.
</details>

## 9.11 RSTP In Depth — Why It's Seconds Instead of Fifty

> 🔬 **Depth section.** Rapid PVST+ is the modern default, so this is the behaviour you'll actually see.

Classic STP takes **30–50 seconds** to recover: 20 s max-age waiting to declare a BPDU stale, then 15 s listening, then 15 s learning. RSTP (802.1w) does the same job in **seconds**. It's not a faster timer — it's a different approach.

### Fewer States, Clearer Roles

| Classic STP state | RSTP state |
|-------------------|------------|
| Disabled / Blocking / Listening | **Discarding** |
| Learning | **Learning** |
| Forwarding | **Forwarding** |

And two new **roles** that classic STP lacked:

| Role | Meaning |
|------|---------|
| **Root** | Best path to the root bridge |
| **Designated** | Forwards onto this segment |
| **Alternate** | A backup for the **root port**, learned from *another* switch |
| **Backup** | A backup for a **designated port**, on the same shared segment |

**This is the core of the speedup.** Classic STP knew a port was blocked but not *why* or *what it could replace*. RSTP pre-computes the answer: an **alternate port** is already identified as "the standby route to root." When the root port fails, the alternate is promoted **immediately** — no waiting, no re-election, because the decision was made in advance. *It's the same pre-warmed-backup idea as the OSPF BDR: the work is done before the failure, not after.*

**Alternate vs Backup** trips people up. An **alternate** hears superior BPDUs from a *different* switch — it's a genuinely different path to root. A **backup** hears superior BPDUs from *itself* (two ports of the same switch on one shared segment, typically via a hub) — it's a spare on the same path, and is rare in modern switched networks.

### Proposal / Agreement — the Handshake That Replaces Waiting

On a point-to-point link, two RSTP switches negotiate explicitly instead of waiting out timers:

1. **SW1 → SW2: proposal** — *"I intend to be the designated port here."*
2. **SW2 syncs** — it blocks its own other non-edge ports, so it cannot possibly
   create a loop no matter what SW1 does next.
3. **SW2 → SW1: agreement** — *"Agreed, go ahead."*
4. **SW1 forwards immediately** — no timers waited out.

**Why is skipping the timers safe here, when classic STP insisted on them?** Because the timers were a substitute for information. Classic STP had no way to ask "is it safe to forward?", so it waited long enough for any conflicting news to arrive. RSTP just **asks**, and the neighbour blocks its own downstream ports (the **sync**) before answering. Safety comes from an explicit agreement rather than from elapsed time.

Step through the handshake below. SW1 is upstream (closer to the root), SW2 is in the middle, and SW3 is further down.

```diagram
{
  "type": "sequence",
  "title": "RSTP proposal and agreement, link by link",
  "actors": [
    {"id": "SW1", "kind": "switch", "label": "SW1 (upstream)"},
    {"id": "SW2", "kind": "switch", "label": "SW2"},
    {"id": "SW3", "kind": "switch", "label": "SW3 (downstream)"}
  ],
  "messages": [
    {"from": "SW1", "to": "SW2", "label": "Proposal", "detail": "BPDU with the proposal flag set", "states": {"SW1": "Discarding"},
     "text": "A point-to-point link comes up. SW1 wants its port on this link to be **designated**, so it sends a BPDU with the **proposal** flag. Its port stays discarding for now."},
    {"from": "SW2", "to": "SW2", "label": "Sync", "detail": "block its own non-edge designated ports", "states": {"SW2": "Synced"},
     "text": "SW2 sees that SW1 offers a better path to the root. Before agreeing, it **syncs**: it puts its other non-edge designated ports into discarding. Now nothing SW1 does can create a loop through SW2. Edge (PortFast) ports keep forwarding."},
    {"from": "SW2", "to": "SW1", "label": "Agreement", "tone": "good", "states": {"SW1": "Forwarding", "SW2": "Root port: Fwd"},
     "text": "SW2 replies with an **agreement**. SW1's designated port goes straight to **forwarding**, and so does SW2's new root port. There are no timers, just an explicit OK."},
    {"from": "SW2", "to": "SW3", "label": "Proposal", "states": {"SW3": "Discarding"},
     "text": "The handshake ripples downstream. The SW2 port that sync blocked now proposes to SW3."},
    {"from": "SW3", "to": "SW2", "label": "Agreement", "tone": "good", "states": {"SW3": "Forwarding"},
     "text": "SW3 syncs and agrees, and that link forwards too. The whole tree converges in well under a second, one link at a time. On a **shared** (half-duplex) link this handshake isn't available, and RSTP falls back to timers."}
  ]
}
```

This is also why **link type** matters:

- **Point-to-point** (full duplex) → handshake available → fast.
- **Shared** (half duplex, hub) → multiple neighbours, no single peer to negotiate with → falls back to timers.
- **Edge** (PortFast, host-facing) → forwards immediately.

*So a duplex mismatch doesn't just hurt throughput — it can silently drop a link into shared mode and cost you rapid convergence.*

Finally, RSTP handles **topology change** differently. Classic STP notified the root, which set a flag causing everyone to age out MAC tables in 15 seconds. RSTP lets **any** switch flood a topology change directly and **flushes** affected MAC entries outright rather than aging them — so traffic re-learns its path at once instead of blackholing while a stale table expires.

**📝 Exam-style questions — 9.11**

**Q1.** RSTP has only three port states. Which classic 802.1D states are merged into RSTP's discarding state?

- **A.** Disabled, blocking and listening
- **B.** Blocking, listening and learning
- **C.** Listening and learning
- **D.** Blocking only

<details><summary>Answer</summary>

**Answer: A.** None of disabled, blocking or listening forwards frames or learns MACs, so RSTP folds them into one state: discarding. Learning and forwarding keep their names. **Why not the others:** B and C wrongly include learning, which RSTP keeps as its own state. D leaves out disabled and listening.
</details>

**Q2.** Refer to the exhibit. Which port can't use the RSTP proposal/agreement handshake and will fall back to timer-based convergence?

```
SW2# show spanning-tree vlan 10
...
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.1    P2p
Gi0/2               Altn BLK 4         128.2    P2p
Fa0/5               Desg FWD 19        128.5    P2p Edge
Fa0/6               Desg FWD 19        128.6    Shr
```

- **A.** Gi0/1
- **B.** Gi0/2
- **C.** Fa0/5
- **D.** Fa0/6

<details><summary>Answer</summary>

**Answer: D.** `Shr` means a shared link (half duplex, usually a hub or a duplex mismatch). There may be several neighbours on it, so there's no single peer to agree with, and RSTP falls back to timers. **Why not the others:** A and B are point-to-point (`P2p`) links, where the handshake works. C is an edge port (PortFast), which forwards straight away with no handshake needed.
</details>

**Q3.** On an RSTP switch, the root port fails and an alternate port exists. What happens?

- **A.** The alternate port becomes the root port and moves to forwarding almost at once.
- **B.** The switch waits Max Age (20 seconds) before using the alternate port.
- **C.** The alternate port goes through listening and learning, taking 30 seconds.
- **D.** The switch becomes the root bridge.

<details><summary>Answer</summary>

**Answer: A.** The alternate was already worked out as the next-best path to the root, so RSTP promotes it straight away. **Why not the others:** B and C describe classic 802.1D timers, which RSTP avoids. D only happens if a switch loses *every* path to the root; here a backup path still exists.
</details>

**Q4.** What is the difference between an RSTP alternate port and a backup port?

- **A.** An alternate port receives better BPDUs from another switch; a backup port receives better BPDUs from its own switch on a shared segment.
- **B.** An alternate port is on the root bridge; a backup port is on a non-root switch.
- **C.** An alternate port forwards traffic; a backup port discards it.
- **D.** They're two names for the same role.

<details><summary>Answer</summary>

**Answer: A.** An alternate offers a genuinely different path to the root through a neighbouring switch. A backup is a spare for a designated port on the same shared segment, and it hears its own switch's BPDUs, usually through a hub. **Why not the others:** B is wrong: neither role is tied to the root bridge. C is wrong: both roles are discarding. D is wrong: RSTP defines them as separate roles.
</details>

---

<a name="chapter-10"></a>
# Chapter 10: EtherChannel — Bundling Cables

## 10.1 The Idea

![EtherChannel: four cables acting as one logical link](images/etherchannel.png)

What if one cable between switches isn't fast enough? **EtherChannel** bundles **multiple physical cables** into **one logical link**. More speed, and if one cable dies, the others keep working!

Without EtherChannel, four cables between two switches give you the speed of
**one**, because STP blocks the other three to prevent a loop. Bundle them into
an EtherChannel and STP sees a **single logical link** — so all four carry
traffic. 🎉

**Bonus:** STP sees the bundle as a **single link**, so it won't block the extra cables. You get all the bandwidth AND redundancy.

**This "bonus" is actually the WHOLE POINT — let's understand WHY EtherChannel exists.** Here's the problem it solves: imagine you connect two switches with 4 cables for more speed. What does STP do? Remember Chapter 9 — STP sees 4 paths between the same two switches as a **loop**, so it **blocks 3 of them!** You wanted 4× the bandwidth, but STP leaves you with just **1 active cable** and 3 sitting idle. Frustrating!

From STP's point of view, four parallel links between SW1 and SW2 are four
chances to form a loop. It forwards on **one** and blocks the other **three**.
You paid for four cables and got the speed of one. 😤

**EtherChannel's clever trick:** it makes STP see the 4 cables as **ONE logical link**, so there's no loop to block — and all 4 cables carry traffic together. *That's the "why": EtherChannel is the peace treaty between "I want more bandwidth (many cables)" and "STP blocks redundant cables."* It gets you the bandwidth of all the cables **and** keeps the redundancy (if one cable dies, the bundle just keeps going on the rest, with no STP recalculation delay).

**Why does losing a cable NOT cause an outage?** Because to STP and to the switch's logic, nothing changed — it's still "one link," just now made of 3 cables instead of 4. Traffic keeps flowing on the survivors instantly. Compare that to STP failover (unblocking a backup port), which takes seconds. EtherChannel failover is nearly instant because the "backup" was already active and part of the bundle.

Step through it below: four cables without EtherChannel, then the same four bundled.

```diagram
{
  "type": "topology",
  "title": "Four cables: STP blocks three, EtherChannel uses all four",
  "caption": "SW1 and SW2 are joined by four 1 Gbps links, Gi0/1 to Gi0/4 on both sides (top to bottom). Click a link for its ports.",
  "nodes": [
    {"id": "SW1", "kind": "switch", "x": 0.5, "y": 1, "sub": "Gi0/1-4"},
    {"id": "SW2", "kind": "switch", "x": 4, "y": 1, "sub": "Gi0/1-4"}
  ],
  "links": [
    {"id": "l1", "a": "SW1", "b": "SW2", "info": "Gi0/1 on SW1 to Gi0/1 on SW2, 1 Gbps."},
    {"id": "l2", "a": "SW1", "b": "SW2", "info": "Gi0/2 on SW1 to Gi0/2 on SW2, 1 Gbps."},
    {"id": "l3", "a": "SW1", "b": "SW2", "info": "Gi0/3 on SW1 to Gi0/3 on SW2, 1 Gbps."},
    {"id": "l4", "a": "SW1", "b": "SW2", "info": "Gi0/4 on SW1 to Gi0/4 on SW2, 1 Gbps."}
  ],
  "steps": [
    {"title": "1. Four separate links: STP sees a loop",
     "text": "To spanning tree, four parallel links are four ways round a loop. It forwards on **one** (the lowest port ID wins the tie) and blocks the other **three**. You bought 4 Gbps and get 1.",
     "links": {"l1": "active", "l2": "blocked", "l3": "blocked", "l4": "blocked"},
     "packets": [{"path": ["SW1", "SW2"], "via": ["l1"], "label": "all traffic"}]},
    {"title": "2. Bundle them into Port-channel 1",
     "text": "With `channel-group 1 mode active` on all four ports at both ends, LACP forms **Po1**. STP now sees **one logical link**, so there's no loop to break, and all four members forward.",
     "nodes": {"SW1": {"badge": "Po1", "tone": "good"}, "SW2": {"badge": "Po1", "tone": "good"}},
     "links": {"l1": "active", "l2": "active", "l3": "active", "l4": "active"},
     "packets": [{"path": ["SW1", "SW2"], "via": ["l1"]}, {"path": ["SW1", "SW2"], "via": ["l2"]}, {"path": ["SW1", "SW2"], "via": ["l3"]}, {"path": ["SW1", "SW2"], "via": ["l4"]}]},
    {"title": "3. A cable fails: no STP recalculation",
     "text": "Gi0/3 fails. Po1 is still up, just with three members, so STP notices nothing. The flows that hashed to Gi0/3 move to the survivors almost instantly, with no blocking, listening or learning.",
     "links": {"l3": "down"},
     "packets": [{"path": ["SW1", "SW2"], "via": ["l1"]}, {"path": ["SW1", "SW2"], "via": ["l2"]}, {"path": ["SW1", "SW2"], "via": ["l4"]}]}
  ]
}
```

**📝 Exam-style questions — 10.1**

**Q1.** Two switches are joined by four 1 Gbps links. No EtherChannel is configured, and spanning tree is running. How many of the links forward traffic?

- **A.** 0
- **B.** 1
- **C.** 2
- **D.** 4

<details><summary>Answer</summary>

**Answer: B.** STP sees four parallel paths as a loop, so it forwards on one link and blocks the other three. **Why not the others:** A would leave the switches disconnected, which STP never does on purpose. C has no basis; STP doesn't load-share within one VLAN's tree. D is what you get only *after* bundling them with EtherChannel.
</details>

**Q2.** Which two benefits does EtherChannel provide? (Choose two.)

- **A.** STP treats the bundle as one logical link, so it doesn't block member links.
- **B.** If a member link fails, traffic moves to the remaining links without STP reconverging.
- **C.** A single file transfer can use the combined bandwidth of every member link.
- **D.** Links of different speeds can be bundled together.
- **E.** Spanning tree no longer needs to run on the switches.

<details><summary>Answer</summary>

**Answer: A, B.** The logical link hides the members from STP, which gives you the bandwidth of all of them and near-instant failover inside the bundle. **Why not the others:** C is the classic misconception: each flow is hashed to one member, so a single transfer is capped at one link's speed (section 10.4). D is wrong because members must match in speed and duplex. E is wrong because STP still runs; it just sees the port-channel as one port.
</details>

**Q3.** On most Catalyst switches, what is the maximum number of physical links that can actively forward in one EtherChannel?

- **A.** 2
- **B.** 4
- **C.** 8
- **D.** 16

<details><summary>Answer</summary>

**Answer: C.** Up to 8 links can be active in one bundle. **Why not the others:** A and B are common bundle sizes, not limits. D is the number LACP can *configure*: 8 active plus up to 8 in hot-standby, ready to replace a failed member.
</details>

## 10.2 Two Ways to Negotiate

- **PAgP** (Port Aggregation Protocol): Cisco's own. Modes: `desirable`, `auto`.
- **LACP** (802.3ad): The industry standard (works with any vendor). Modes: `active`, `passive`.
- **Static "on":** Force it with no negotiation.

**Why have a negotiation protocol at all — why not just force the bundle "on"?** Because bundling cables only works if **both ends agree and are configured compatibly**. If one switch bundled 4 ports but the other didn't, you'd get chaos — mismatched links, possible loops, and errors. PAgP/LACP make the two switches **check with each other first** ("Hey, want to bundle these 4 ports? Are your settings compatible?") before forming the channel. It's a safety handshake. **Static "on" skips the handshake** — faster to set up, but risky: if you fat-finger the config on one side, there's no negotiation to catch the mistake, and you can create a loop. *That's why LACP (with negotiation) is generally preferred over static.*

**Why prefer LACP over Cisco's PAgP?** Because LACP is the **open industry standard (802.3ad)** — it works between Cisco and non-Cisco gear (Arista, HP, etc.). PAgP is Cisco-only. In a mixed network, LACP is the safe universal choice.

**Which combos form a channel?**

Step through an LACP negotiation below: one side **active**, the other **passive**.

```diagram
{
  "type": "sequence",
  "title": "LACP active meets LACP passive",
  "actors": [
    {"id": "SW1", "kind": "switch", "label": "SW1 (active)"},
    {"id": "SW2", "kind": "switch", "label": "SW2 (passive)"}
  ],
  "messages": [
    {"note": "Gi0/1-2: channel-group 1 on both", "over": ["SW1", "SW2"], "states": {"SW1": "Individual", "SW2": "Individual"},
     "text": "Both switches have Gi0/1 and Gi0/2 in channel-group 1. SW1 uses `mode active`, SW2 uses `mode passive`. Until LACP agrees, each port works as an ordinary single link."},
    {"from": "SW1", "to": "SW2", "label": "LACPDU", "detail": "I'm active: system ID, key, port", "text": "An **active** port starts the conversation, sending LACPDUs that describe itself: its system priority and MAC, its key (which group of ports it belongs to) and its port number."},
    {"from": "SW2", "to": "SW1", "label": "LACPDU", "detail": "I'm passive: here's my side", "text": "A **passive** port never starts, but it does answer. SW2 replies with its own details. That's why passive + passive never forms a channel: both sides wait for the other to speak."},
    {"note": "Both check: same speed, duplex, VLANs, mode", "over": ["SW1", "SW2"], "text": "Each switch checks that every member agrees with its partners: same speed and duplex, and the same access VLAN or trunk settings. A port that doesn't match is left out (suspended)."},
    {"from": "SW1", "to": "SW2", "label": "LACPDU", "detail": "in sync, collecting + distributing", "tone": "good", "states": {"SW1": "Bundled (P)", "SW2": "Bundled (P)"},
     "text": "Both sides mark their ports as in sync, and the ports join **Po1**. `show etherchannel summary` shows each member with **(P)**, bundled in the port-channel."},
    {"from": "SW2", "to": "SW1", "label": "LACPDU", "detail": "every 30 s (slow rate)", "dashed": true,
     "text": "LACPDUs keep flowing (every 30 seconds by default) so each side notices if its partner disappears or changes, and pulls that member out of the bundle."}
  ]
}
```

| Side A | Side B | Forms? |
|--------|--------|--------|
| LACP active | LACP active | Yes |
| LACP active | LACP passive | Yes |
| LACP passive | LACP passive | No (both just wait) |
| PAgP desirable | PAgP desirable | Yes |
| PAgP desirable | PAgP auto | Yes |
| PAgP auto | PAgP auto | No |

**📝 Exam-style questions — 10.2**

**Q1.** Which pair of modes forms an EtherChannel?

- **A.** LACP passive and LACP passive
- **B.** PAgP auto and PAgP auto
- **C.** LACP active and LACP passive
- **D.** LACP active and PAgP desirable

<details><summary>Answer</summary>

**Answer: C.** The active side starts sending LACPDUs, and the passive side answers. **Why not the others:** in A and B both sides only listen, so nobody starts. D mixes two different protocols, which can't talk to each other.
</details>

**Q2.** Which link aggregation protocol is an open IEEE standard and works between Cisco and other vendors' switches?

- **A.** PAgP
- **B.** LACP
- **C.** DTP
- **D.** VTP

<details><summary>Answer</summary>

**Answer: B.** LACP was defined in IEEE 802.3ad (now 802.1AX), so any vendor can use it. **Why not the others:** PAgP (A) is Cisco-only. DTP (C) negotiates trunking, not bundles, and VTP (D) shares VLAN databases. Both are Cisco-only too.
</details>

**Q3.** Which two mode combinations will NOT form an EtherChannel? (Choose two.)

- **A.** `auto` and `auto`
- **B.** `active` and `active`
- **C.** `passive` and `passive`
- **D.** `desirable` and `auto`
- **E.** `on` and `on`

<details><summary>Answer</summary>

**Answer: A, C.** Auto (PAgP) and passive (LACP) only respond. With both ends waiting, no negotiation ever starts. **Why not the others:** B forms, because both sides initiate. D forms, because desirable initiates and auto responds. E forms, because `on` forces the bundle with no negotiation at all, as long as the configurations match.
</details>

**Q4.** SW1's ports are set to `channel-group 1 mode on` and SW2's ports to `channel-group 1 mode active`. What is the result?

- **A.** The channel forms, because the active side starts the negotiation.
- **B.** No channel forms, because `on` sends no LACPDUs and SW2 never hears a partner.
- **C.** The channel forms using PAgP instead.
- **D.** The channel forms at half the normal speed.

<details><summary>Answer</summary>

**Answer: B.** `on` doesn't speak LACP at all, so SW2's LACPDUs go unanswered and its ports aren't bundled, while SW1 bundles its ports blindly. That mismatch is exactly why forcing `on` is risky. **Why not the others:** A forgets that negotiation needs a reply. C is wrong because nothing switches protocols automatically. D isn't a thing; a channel either forms or it doesn't.
</details>

## 10.3 Configuring EtherChannel (LACP)

```
SW1(config)# interface range gi0/1 - 2      ! the two physical ports
SW1(config-if-range)# channel-group 1 mode active   ! LACP active
SW1(config-if-range)# exit
SW1(config)# interface port-channel 1       ! configure the bundle as one
SW1(config-if)# switchport mode trunk
```

> **Rule:** All bundled ports must have the **same** settings (speed, duplex, VLANs, mode). If they don't match, the channel won't form.

Check it:

```
SW1# show etherchannel summary
```

**📝 Exam-style questions — 10.3**

**Q1.** Refer to the exhibit. Why is Gi0/3 not carrying traffic in Po1?

```
SW1# show etherchannel summary
Flags:  D - down        P - bundled in port-channel
        I - stand-alone s - suspended
        S - Layer2      U - in use
...
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SU)         LACP      Gi0/1(P)    Gi0/2(P)    Gi0/3(s)
```

- **A.** Gi0/3's settings (for example speed, duplex or VLAN configuration) don't match the other members.
- **B.** Gi0/3 is administratively shut down.
- **C.** Port-channel 1 is down.
- **D.** Gi0/3 is in standby, waiting for a ninth link to fail.

<details><summary>Answer</summary>

**Answer: A.** `(s)` means suspended: the switch kept the port out of the bundle because it isn't compatible with the others. Fix the mismatch and it joins. **Why not the others:** B would show `(D)` for down. C is wrong because `Po1(SU)` means Layer 2 and in use. D would show `(H)` for hot-standby, which only happens when more than eight links are configured.
</details>

**Q2.** Which command puts Gi0/1 and Gi0/2 into EtherChannel group 1 as LACP ports that start negotiation themselves?

- **A.** `channel-group 1 mode desirable`
- **B.** `channel-group 1 mode active`
- **C.** `channel-group 1 mode on`
- **D.** `channel-group 1 mode passive`

<details><summary>Answer</summary>

**Answer: B.** `active` is LACP's mode that sends LACPDUs and starts the negotiation. **Why not the others:** A is PAgP's initiating mode. C forces the bundle without any protocol. D is LACP, but it only answers and never starts.
</details>

**Q3.** An EtherChannel trunk has formed. An engineer needs to change the allowed VLAN list on the bundle. Where should the change be made?

- **A.** On `interface port-channel 1`, which passes the setting on to its members
- **B.** On each member port separately, leaving the port-channel alone
- **C.** On only one member port, which then copies it to the others
- **D.** It can't be changed without deleting the EtherChannel.

<details><summary>Answer</summary>

**Answer: A.** Configure the logical interface and IOS applies the setting to the members, so they stay consistent. **Why not the others:** B and C risk the members disagreeing; a member whose settings differ from the port-channel gets suspended. D is wrong because the bundle can be reconfigured live.
</details>

---

## 10.4 How EtherChannel Actually Splits Traffic (And Why One Download Won't Go Faster)

> 🔬 **Depth section.** Explains the single most misunderstood thing about link bundles.

Section 10.1 said an EtherChannel of four 1 Gbps links gives you "4 Gbps." That's true in aggregate — and misleading for any single conversation. Here's the mechanism.

An EtherChannel does **not** send packet 1 down link 1, packet 2 down link 2, and so on. Instead it runs a **hash** over selected header fields and uses the result to pick a link:

The switch takes selected header fields — source/destination MAC, or IP, or
port numbers — runs them through a **hash**, and uses the result to pick one of
the member links. Same conversation, same hash, **same physical link every time**.

Because the same conversation always hashes to the same value, **every frame in a given flow takes the same physical link**.

**Why deliberately pin a flow to one link instead of spraying packets across all four?** Because round-robin would **reorder** packets. Links are never perfectly equal — different queue depths, different momentary load — so packets sent in order across four links arrive out of order. TCP interprets out-of-order arrival as loss, fires duplicate ACKs, retransmits, and cuts its congestion window. You'd have built a 4 Gbps bundle that performs *worse* than a single link. Hashing trades per-flow speed for **in-order delivery**, which is the right trade.

**The consequence to remember:** one file transfer between two hosts uses **one link** and is capped at that link's speed. EtherChannel scales *many* conversations, not one. A backup server pushing a single huge stream sees no benefit at all.

Step through some flows below to see it. The bundle has four members, and each conversation is hashed to exactly one of them.

```diagram
{
  "type": "topology",
  "title": "Each flow sticks to one member link",
  "caption": "Po1 has four 1 Gbps members (m1–m4), with `port-channel load-balance src-dst-ip`. Which flow lands on which link depends on the hash; these are examples.",
  "nodes": [
    {"id": "PC1", "kind": "host", "x": 0, "y": 0, "sub": "10.1.1.11"},
    {"id": "PC2", "kind": "host", "x": 0, "y": 2.2, "sub": "10.1.1.12"},
    {"id": "SW1", "kind": "switch", "x": 1.4, "y": 1.1},
    {"id": "SW2", "kind": "switch", "x": 3.6, "y": 1.1},
    {"id": "SRV1", "kind": "server", "x": 5, "y": 0, "sub": "10.2.2.21"},
    {"id": "SRV2", "kind": "server", "x": 5, "y": 2.2, "sub": "10.2.2.22"}
  ],
  "links": [
    {"a": "PC1", "b": "SW1"},
    {"a": "PC2", "b": "SW1"},
    {"id": "m1", "a": "SW1", "b": "SW2"},
    {"id": "m2", "a": "SW1", "b": "SW2"},
    {"id": "m3", "a": "SW1", "b": "SW2"},
    {"id": "m4", "a": "SW1", "b": "SW2"},
    {"a": "SW2", "b": "SRV1"},
    {"a": "SW2", "b": "SRV2"}
  ],
  "steps": [
    {"title": "1. PC1 to SRV1 hashes to m1",
     "text": "The switch hashes the source and destination IPs (10.1.1.11 and 10.2.2.21) and gets a result that maps to **m1**. Every packet of this conversation gives the same result, so every one uses m1 and they arrive in order.",
     "packets": [{"path": ["PC1", "SW1", "SW2", "SRV1"], "via": [null, "m1", null], "label": "flow A"}]},
    {"title": "2. A different pair, a different link",
     "text": "PC2 to SRV2 is a different address pair, so it gives a different hash: **m3** here. Many conversations spread across the members, which is how the bundle reaches its 4 Gbps total.",
     "packets": [{"path": ["PC1", "SW1", "SW2", "SRV1"], "via": [null, "m1", null], "label": "flow A"}, {"path": ["PC2", "SW1", "SW2", "SRV2"], "via": [null, "m3", null], "label": "flow B", "tone": "good"}]},
    {"title": "3. One big download is still one link",
     "text": "PC2 starts a huge transfer from SRV1. It's one address pair, so it hashes to one member (**m4**) and tops out at **1 Gbps**, however idle m2 is. EtherChannel scales many conversations, not one.",
     "focus": ["PC2", "SW1", "SW2", "SRV1", "m4", "PC2-SW1", "SW2-SRV1"],
     "packets": [{"path": ["SRV1", "SW2", "SW1", "PC2"], "via": [null, "m4", null], "label": "big download", "tone": "warn"}]}
  ]
}
```

Cisco lets you choose which fields feed the hash:

```
SW(config)# port-channel load-balance src-dst-ip     ! common on L3 boundaries
SW(config)# port-channel load-balance src-dst-mac    ! typical default
SW# show etherchannel load-balance
SW# show etherchannel summary          ! P = in port-channel, (SU) = in use
```

**Why does the choice matter?** Consider a switch uplinking to a router: every frame leaving the subnet has the **router's MAC** as its destination, so a MAC-based hash sees almost no variation and dumps nearly everything on one link. Switching to `src-dst-ip` restores variety, because the real destinations differ even though the next-hop MAC doesn't. *Pick the fields that actually vary in your traffic — otherwise the bundle silently runs on one strand.*

**Powers of two matter too.** With 2, 4 or 8 links the hash space divides evenly. With 3, 5, 6 or 7, some links receive a larger share of hash buckets than others and the load sits permanently lopsided.

**📝 Exam-style questions — 10.4**

**Q1.** A backup server sends one large file to a storage array across an EtherChannel of four 1 Gbps links. What is the most throughput that single transfer can reach?

- **A.** About 1 Gbps
- **B.** About 2 Gbps
- **C.** About 4 Gbps
- **D.** About 250 Mbps

<details><summary>Answer</summary>

**Answer: A.** A single flow always hashes to the same member link, so it's capped at that one link's speed. **Why not the others:** C is the bundle's *total*, which only many flows together can use. B has no basis. D assumes the flow is split four ways, but EtherChannel never splits one flow across members.
</details>

**Q2.** Traffic from 300 users to their default gateway router crosses an EtherChannel, but nearly all of it uses one member link. The switch uses `port-channel load-balance dst-mac`. Which change will spread the load best?

- **A.** `port-channel load-balance src-dst-ip`
- **B.** `port-channel load-balance dst-mac` on the router instead
- **C.** Add two more member links.
- **D.** Change the LACP mode from active to passive.

<details><summary>Answer</summary>

**Answer: A.** Every frame to the gateway has the same destination MAC, the router's, so a `dst-mac` hash gives the same answer every time. Hashing the source and destination IPs brings in values that really vary. **Why not the others:** B keeps a hash that doesn't vary for this traffic. C adds links that the same single hash result will never use. D only changes who starts the negotiation, not how traffic is spread.
</details>

**Q3.** Why does EtherChannel hash each flow onto one link instead of sending packets round-robin across all members?

- **A.** Round-robin would deliver packets out of order, and TCP would treat that as loss and slow down.
- **B.** Round-robin would create a Layer 2 loop.
- **C.** Hashing uses less bandwidth than round-robin.
- **D.** STP would block the extra links during round-robin.

<details><summary>Answer</summary>

**Answer: A.** Members never have exactly the same queues and delay, so packets spread across them arrive out of order. TCP sees duplicate ACKs, retransmits and cuts its window. Keeping a flow on one link keeps it in order. **Why not the others:** B is wrong because the bundle is one logical link either way. C is wrong because the method doesn't change how many bytes are sent. D is wrong because STP sees only the port-channel.
</details>

**Q4.** An EtherChannel has three member links, and it carries hundreds of flows. Why might one link carry noticeably less traffic than the other two?

- **A.** The hash produces a fixed number of buckets (eight on Catalyst switches), and eight can't be split evenly three ways, so the links get 3, 3 and 2 buckets.
- **B.** LACP always makes the third link a standby link.
- **C.** STP blocks the third link.
- **D.** Three-link bundles run at half duplex.

<details><summary>Answer</summary>

**Answer: A.** The hash result picks one of eight buckets, and the buckets are shared among the members. With 2, 4 or 8 links the share is even. With 3, one link gets two buckets instead of three, and so roughly a quarter of the traffic instead of three-eighths. **Why not the others:** B is wrong because standby only applies beyond eight members. C is wrong because STP doesn't see the members. D is nonsense, since every member must run full duplex.
</details>

---

<a name="chapter-11"></a>
# Chapter 11: IP Addresses — The Home Address of Every Device

## 11.1 What Is an IP Address?

An **IP address** is the **logical address** of a device on a network — like a **home address** for mail. Unlike a MAC address (permanent name), an IP address can **change** and works **across the whole internet**.

**IPv4** addresses look like this: `192.168.1.10`. They're **32 bits** long, split into **4 parts** (called **octets**), each 8 bits, separated by dots.

An IPv4 address is **four octets**, each 0–255:

| Format | octet 1 | octet 2 | octet 3 | octet 4 |
|---|---------|---------|---------|---------|
| **Decimal** | 192 | 168 | 1 | 10 |
| **Binary** | 11000000 | 10101000 | 00000001 | 00001010 |

Four octets × 8 bits = **32 bits** in total.

Each octet is one byte (8 bits), so it can be **0 to 255**. (Remember from Chapter 4: 11111111 = 255.)

Flip the bits of one octet below to see how 8 bits make every value from 0 to 255.

```diagram
{
  "type": "bits",
  "mode": "octet",
  "value": 168,
  "title": "One octet, eight bits",
  "prompt": "168 is 128 + 32 + 8. Click bits to change the value. Turn them all on for 255, and try 192 (11000000) and 10 (00001010), the other octets of 192.168.1.10."
}
```

**📝 Exam-style questions — 11.1**

**Q1.** How many bits are in an IPv4 address?

- **A.** 8
- **B.** 32
- **C.** 48
- **D.** 128

<details><summary>Answer</summary>

**Answer: B.** Four octets of 8 bits each make 32 bits. **Why not the others:** A is one octet. C is the length of a MAC address. D is the length of an IPv6 address.
</details>

**Q2.** Which dotted-decimal address is the same as `11000000.10101000.00001010.01100100`?

- **A.** 192.168.10.100
- **B.** 192.168.5.100
- **C.** 192.168.10.50
- **D.** 192.84.10.100

<details><summary>Answer</summary>

**Answer: A.** 11000000 = 128 + 64 = 192. 10101000 = 128 + 32 + 8 = 168. 00001010 = 8 + 2 = 10. 01100100 = 64 + 32 + 4 = 100. **Why not the others:** B reads 00001010 as 5, which is the value shifted one place right. C halves the last octet the same way. D reads 10101000 as 84, also shifted one bit.
</details>

**Q3.** Which of these can never be a valid IPv4 address, whatever the mask?

- **A.** 172.16.0.255
- **B.** 10.256.1.1
- **C.** 192.168.0.0
- **D.** 1.1.1.1

<details><summary>Answer</summary>

**Answer: B.** An octet is 8 bits, so its largest value is 255, and 256 doesn't fit. **Why not the others:** A is a normal host address in, for example, 172.16.0.0/16. C is a valid address (it's a network address under /24, but it's still a well-formed IPv4 address). D is a well-known public DNS server address.
</details>

**Q4.** What is decimal 172 in binary?

- **A.** 10101100
- **B.** 10110100
- **C.** 11001010
- **D.** 10101010

<details><summary>Answer</summary>

**Answer: A.** 172 = 128 + 32 + 8 + 4, so the 128, 32, 8 and 4 bits are on: 10101100. **Why not the others:** B is 180 (128 + 32 + 16 + 4). C is 202. D is 170, close but with the 2 bit on instead of the 4.
</details>

## 11.2 Two Parts: Network & Host

![An IP address split into network and host parts by the mask](images/ip_split.png)

Every IP address has two parts:
- **Network part:** Which network you're on (like a street name).
- **Host part:** Which specific device you are (like a house number).

The **subnet mask** tells us where the split is. More in Chapter 12!

In `192.168.1.10`, the address splits into two parts:

| Part | Value | Think of it as |
|------|-------|----------------|
| **Network** | `192.168.1` | The street |
| **Host** | `10` | The house on that street |

**Why split an address into "network" and "host" at all? Why not just give every device one flat number?** This is the single design choice that makes the internet *possible*, so it's worth really understanding. Imagine if IP addresses had **no structure** — just random serial numbers like MAC addresses. Then a router trying to reach a device would need a list of **every single device on Earth** (billions of entries) to know where to send traffic. No router could hold that, and it could never keep up.

The network/host split fixes this with the same trick the **postal system** uses. The mail sorter in New York doesn't memorize every person in California. It just knows "anything addressed to California → send it west." Only when the letter *arrives* in the right town does someone look at the specific street and house.

IP works identically:
- Routers only care about the **network part** ("this address is in the 192.168.1 network → send it that way"). They keep a small list of *networks*, not devices — millions of times smaller.
- Only the **final** switch on the destination network cares about the **host part** ("ah, device .10 specifically").

*So the split is what lets routers stay small and fast:* they think in terms of **neighborhoods (networks)**, not individual houses (hosts). This is called **hierarchical addressing**, and it's why a handful of routing entries can reach the entire internet. Everything in Chapter 12 (subnetting) is just *you deciding where to draw that network/host line* to make neighborhoods the right size.
```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "172.16.45.200",
  "prefix": 20,
  "title": "Where the network ends and the hosts begin",
  "prompt": "Slide the prefix length and watch the network bits (solid) and host bits (dashed) move. Click any bit to flip it."
}
```

**📝 Exam-style questions — 11.2**

**Q1.** A host has the address 172.16.45.200 with mask 255.255.0.0. Which part of the address is the host part?

- **A.** 172.16
- **B.** 45.200
- **C.** 200
- **D.** 16.45.200

<details><summary>Answer</summary>

**Answer: B.** A 255.255.0.0 mask marks the first two octets as network and the last two as host. **Why not the others:** A is the network part. C would be the host part with a /24 mask. D would need an 8-bit mask (255.0.0.0).
</details>

**Q2.** Why do routers store routes to networks instead of to individual hosts?

- **A.** Grouping hosts under a network part keeps routing tables small enough to handle the whole internet.
- **B.** Routers can't read the host part of an address.
- **C.** Host addresses change too often for routers to track.
- **D.** Each network can only hold one host at a time.

<details><summary>Answer</summary>

**Answer: A.** Hierarchical addressing works like postcodes: routers only need to know the way to each "neighbourhood", and the last router delivers to the house. **Why not the others:** B is false; routers read whole addresses but don't need a route per host. C misses the real reason, scale. D is false: a network holds many hosts.
</details>

**Q3.** What is the network address of 172.16.45.200/20?

- **A.** 172.16.0.0
- **B.** 172.16.32.0
- **C.** 172.16.45.0
- **D.** 172.16.40.0

<details><summary>Answer</summary>

**Answer: B.** A /20 mask is 255.255.240.0, so the third octet moves in blocks of 256 − 240 = 16: 0, 16, 32, 48. 45 falls in the block that starts at 32, so the network is 172.16.32.0 (and its broadcast is 172.16.47.255). You can check it with the slider in the diagram above. **Why not the others:** A uses /16. C uses /24. D treats the block size as 8 (that would be /21).
</details>


## 11.3 IP Address Classes (The Old System)

Long ago, IP addresses were divided into **classes** by their first number:

| Class | First Octet Range | Default Mask | Use |
|-------|-------------------|--------------|-----|
| **A** | 1 – 126 | 255.0.0.0 (/8) | Huge networks |
| **B** | 128 – 191 | 255.255.0.0 (/16) | Medium networks |
| **C** | 192 – 223 | 255.255.255.0 (/24) | Small networks |
| **D** | 224 – 239 | — | Multicast (groups) |
| **E** | 240 – 255 | — | Experimental |

> Note: **127** (like 127.0.0.1) is reserved for **loopback** — a device talking to itself ("localhost"). It's the "am I alive?" test address.

**Why did classes exist, and WHY were they abandoned?** Classes were an early, *simple* way to decide the network/host split just by looking at the first number. Easy — but incredibly **wasteful**, and that waste is why they died:

The class is decided by the **first few bits** of the address. Flip the leading bits of the first octet below and watch the first-octet value jump between the class ranges.

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "172.16.5.4",
  "showPrefix": false,
  "title": "The leading bits decide the class",
  "prompt": "Look at the first octet. Starts with **0**: class A (1–126). **10**: class B (128–191). **110**: class C (192–223). **1110**: class D, multicast (224–239). **1111**: class E (240–255). Flip the top bits to move 172 between classes."
}
```

- A **Class A** network gives you **16 million** host addresses. If a company needed, say, 5,000 addresses, they'd get a Class A (16 million) or a Class B (65,000) — and **waste millions of addresses** they'd never use.
- With only ~4 billion IPv4 addresses total, handing them out in giant fixed chunks burned through them frighteningly fast.

So the industry switched to **classless addressing (CIDR)** — the idea that you can put the network/host split **anywhere**, not just on the class boundaries. That company needing 5,000 addresses can get *exactly* the right-sized block instead of a wasteful giant one. **That flexibility to choose the split is literally what subnetting is** (Chapter 12), and it's why we barely use classes today except to explain the history and the private-range groupings.

**📝 Exam-style questions — 11.3**

**Q1.** Which class does the address 191.200.1.1 belong to?

- **A.** Class A
- **B.** Class B
- **C.** Class C
- **D.** Class D

<details><summary>Answer</summary>

**Answer: B.** Class B covers first octets 128 to 191, and 191 is the very last one. In binary, 191 is 10111111: it starts with **10**, the class B pattern. **Why not the others:** A ends at 126. C starts at 192, one higher. D is 224 to 239.
</details>

**Q2.** What is the default mask of a class C address?

- **A.** 255.0.0.0
- **B.** 255.255.0.0
- **C.** 255.255.255.0
- **D.** 255.255.255.252

<details><summary>Answer</summary>

**Answer: C.** Class C uses three octets for the network, so the default mask is /24. **Why not the others:** A is class A's default (/8). B is class B's (/16). D is a /30, used for point-to-point links, and isn't any class's default.
</details>

**Q3.** Which address is a class D (multicast) address?

- **A.** 223.1.1.1
- **B.** 239.1.1.1
- **C.** 240.0.0.1
- **D.** 127.0.0.1

<details><summary>Answer</summary>

**Answer: B.** Class D is 224 to 239, used for multicast groups. **Why not the others:** A is the top of class C. C is class E (experimental, 240 and up). D is loopback, which is reserved and sits in the gap between class A and class B.
</details>

**Q4.** A company needs about 5,000 addresses. Why did classful addressing waste so much in a case like this?

- **A.** Only fixed sizes existed: a class C (254 hosts) was too small, so the company got a class B with about 65,000 addresses.
- **B.** Class B networks only allowed 5,000 hosts.
- **C.** Classful addressing required a separate network for every host.
- **D.** Classful routers couldn't forward to more than 254 hosts.

<details><summary>Answer</summary>

**Answer: A.** With classes, the network/host split was fixed at /8, /16 or /24. Anything between had to round up to the next class, leaving about 60,000 addresses unused here. CIDR fixed that by letting the split go anywhere. **Why not the others:** B is wrong: a class B holds 65,534 hosts. C and D describe limits that never existed.
</details>

## 11.4 Private vs. Public IP Addresses

- **Public IPs:** Unique on the whole internet. Given out by authorities. Like a real street address anyone can mail to.
- **Private IPs:** Free to use inside your own network, NOT routable on the internet. Many networks reuse them. A router uses **NAT** (Chapter 17) to share one public IP.

**Private ranges to memorize:**

The class B private range is the tricky one, because it covers **sixteen** second-octet values, not just 172.16. See why below: it's a /12.

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "172.16.0.0",
  "prefix": 12,
  "title": "Why 172.16.0.0 to 172.31.255.255 is one block",
  "prompt": "The private class B block is **172.16.0.0/12**. The first 12 bits are fixed; the last 4 bits of the second octet are host bits, so it runs from 172.16 to 172.31. Change the second octet to 31 and you're still inside; change it to 32 and the network bits change, so you've left the private range."
}
```

| Class | Private Range |
|-------|---------------|
| A | 10.0.0.0 – 10.255.255.255 |
| B | 172.16.0.0 – 172.31.255.255 |
| C | 192.168.0.0 – 192.168.255.255 |

**Story Time 📖:** Private IPs are like apartment numbers **inside** a building. Lots of buildings have an "Apt 1," so they're not unique to the world. The building's **street address** (public IP) is what the outside world sees. NAT is the front-desk clerk who forwards mail between the two.

**Why do private IPs even exist? WHY not just give every device a public one?** Because **we ran out.** IPv4 has only ~4.3 billion addresses, and there are *way* more than 4.3 billion phones, laptops, TVs, and gadgets. If every device needed a unique public address, we'd have run dry decades ago. Private addresses are the brilliant workaround: **billions of home and office networks all reuse the same private ranges** (that's why your home network and your neighbor's both use 192.168.1.x — and it's fine, because they never directly touch). The whole building shares **one** public address to face the internet, and **NAT** (Chapter 17) translates between the shared public address and the many private ones. *So private IPs exist to stretch a limited supply of public addresses across an unlimited number of devices* — a patch that (along with IPv6) kept the internet growing.

**📝 Exam-style questions — 11.4**

**Q1.** Which two addresses are private (RFC 1918) addresses? (Choose two.)

- **A.** 172.20.14.5
- **B.** 192.169.1.1
- **C.** 10.255.0.1
- **D.** 172.32.1.1
- **E.** 11.0.0.1

<details><summary>Answer</summary>

**Answer: A, C.** 172.20 is inside 172.16–172.31, and anything starting with 10 is private. **Why not the others:** B is 192.**169**, one past the private 192.168 range. D is 172.**32**, one past the end of 172.16–172.31. E starts with 11, not 10. All three are public addresses.
</details>

**Q2.** Which prefix describes the whole private class B range?

- **A.** 172.16.0.0/16
- **B.** 172.16.0.0/12
- **C.** 172.0.0.0/8
- **D.** 169.254.0.0/16

<details><summary>Answer</summary>

**Answer: B.** 172.16.0.0/12 covers 172.16.0.0 to 172.31.255.255. **Why not the others:** A covers only 172.16.x.x, one sixteenth of the range. C includes many public addresses, such as 172.217.x.x. D is the APIPA (link-local) range, not RFC 1918.
</details>

**Q3.** Two neighbouring homes both use 192.168.1.0/24 inside. Why doesn't this cause a conflict on the internet?

- **A.** Private addresses aren't routed on the internet; each home's router uses NAT to share its own public address.
- **B.** Internet routers automatically renumber duplicate networks.
- **C.** Each home's router adds its MAC address to make the address unique.
- **D.** It does cause a conflict, so only one home can be online at a time.

<details><summary>Answer</summary>

**Answer: A.** Private ranges are only meaningful inside each site. At the edge, NAT translates them to the site's unique public address, so the internet never sees the duplicates. **Why not the others:** B and C describe mechanisms that don't exist. D is wrong because reusing private ranges is completely normal and is exactly what they're for.
</details>

## 11.5 Special Addresses

- **Network address:** The **first** address in a subnet (all host bits = 0). Names the network. Can't be given to a device.
- **Broadcast address:** The **last** address (all host bits = 1). Sends to everyone on the subnet. Can't be given to a device.
- **Loopback:** 127.0.0.1 — yourself.
- **APIPA:** 169.254.x.x — a device gives itself this when it can't reach a DHCP server (a "something's broken" sign).

**Why can't you assign the first (network) and last (broadcast) addresses to a device?** Because each one is already "spoken for" as a special meaning, and giving it to a device would create confusion:

- The **network address** (all host bits 0) is the *name of the whole subnet itself* — it's how routers refer to the group ("the 192.168.1.0 network"). If you also gave it to a PC, there'd be an ambiguity: does "192.168.1.0" mean *the network* or *that one PC*? So it's reserved as the label for the group.
- The **broadcast address** (all host bits 1) is the "**everyone on this subnet**" address. When a device sends here, *every* device on the subnet must receive it. If you assigned it to a single PC, then "send to everyone" and "send to that one PC" would be the same address — chaos. So it's reserved for the shout-to-all function.

*This is exactly why the host formula is 2^h **minus 2**:* every subnet loses its first address (the network name) and its last address (the broadcast) as usable host addresses. Now that "−2" isn't a random rule you memorize — you know *why* those two are off-limits.

**📝 Exam-style questions — 11.5**

**Q1.** A user's PC shows the address 169.254.17.3. What does this most likely mean?

- **A.** The PC couldn't reach a DHCP server and gave itself an APIPA address.
- **B.** The PC received a public address from the ISP.
- **C.** The PC is using its loopback address.
- **D.** The DHCP server is handing out addresses from a private range.

<details><summary>Answer</summary>

**Answer: A.** 169.254.0.0/16 is the address a host gives itself when DHCP fails, which is a strong clue to check the cable, the VLAN or the DHCP server. **Why not the others:** B is wrong because 169.254 is never handed out as a public address. C would be 127.x.x.x. D is wrong because 169.254 isn't an RFC 1918 range, and a DHCP server doesn't normally hand it out.
</details>

**Q2.** In the network 192.168.5.0/24, which address can be assigned to a host?

- **A.** 192.168.5.0
- **B.** 192.168.5.255
- **C.** 192.168.5.254
- **D.** 127.0.0.1

<details><summary>Answer</summary>

**Answer: C.** .254 is the last usable host address in a /24. **Why not the others:** A is the network address (all host bits 0). B is the broadcast address (all host bits 1). D is loopback, which is never configured as a host's network address.
</details>

**Q3.** Why does a /24 have 254 usable host addresses rather than 256?

- **A.** The first address names the network and the last one is the broadcast, so neither can go on a host.
- **B.** The first address is always the default gateway and the last is the DNS server.
- **C.** Two addresses are reserved for the switch's management interface.
- **D.** 256 isn't possible in 8 bits.

<details><summary>Answer</summary>

**Answer: A.** All host bits 0 is the network's name and all host bits 1 means "everyone on this subnet", so 2⁸ − 2 = 254. **Why not the others:** B mixes up convention with rules: the gateway is often .1, but it's an ordinary usable address. C isn't a rule. D is wrong: 8 bits give exactly 256 values, 0 to 255.
</details>

## 11.6 Default Gateway

The **default gateway** is the **router's address** that a device uses to reach **other networks**. It's the "door out of your neighborhood."

A PC at `192.168.1.10` that wants something outside its own network hands the
packet to its **default gateway**, `192.168.1.1` — the router — which forwards it
on toward the internet. The PC itself needs to know nothing beyond that one address.

If a PC wants to talk to a device on its **own** network, it sends directly. If the destination is on a **different** network, it sends to the **default gateway** to forward.

**But HOW does the PC decide "same network" vs "different network"? And WHY does it need a gateway for one but not the other?** The PC does a quick piece of math with its **subnet mask** every time it sends: it compares the *network part* of its own IP with the network part of the destination IP.

Step through both cases below: a neighbour on the same subnet, and a server on another network.

```diagram
{
  "type": "topology",
  "title": "Local goes direct, remote goes to the gateway",
  "caption": "PC1 is 192.168.1.10/24 with default gateway 192.168.1.1.",
  "nodes": [
    {"id": "PC1", "kind": "host", "x": 0, "y": 2.2, "sub": "192.168.1.10/24"},
    {"id": "PC2", "kind": "host", "x": 1.8, "y": 2.2, "sub": "192.168.1.20/24"},
    {"id": "SW1", "kind": "switch", "x": 0.9, "y": 1},
    {"id": "R1", "kind": "router", "x": 2.6, "y": 0.4, "sub": "192.168.1.1"},
    {"id": "NET", "kind": "cloud", "x": 4, "y": 0.4, "label": "Internet"},
    {"id": "WEB", "kind": "server", "x": 5.2, "y": 1.4, "label": "Web server", "sub": "203.0.113.10"}
  ],
  "links": [
    {"a": "PC1", "b": "SW1"},
    {"a": "PC2", "b": "SW1"},
    {"a": "SW1", "b": "R1"},
    {"a": "R1", "b": "NET"},
    {"a": "NET", "b": "WEB"}
  ],
  "steps": [
    {"title": "1. To PC2: same network, so direct",
     "text": "PC1 applies its /24 mask to both addresses: 192.168.1**.10** and 192.168.1**.20** share the network part 192.168.1. Same network, so PC1 ARPs for **PC2's own MAC** and sends the frame straight there. The router isn't involved.",
     "focus": ["PC1", "PC2", "SW1", "PC1-SW1", "PC2-SW1"],
     "packets": [{"path": ["PC1", "SW1", "PC2"], "label": "to PC2's MAC"}]},
    {"title": "2. To the web server: different network",
     "text": "203.0.113.10 doesn't match 192.168.1, so it's off the local network. PC1 ARPs for the **gateway's** MAC and sends the frame there. The IP destination is still 203.0.113.10; only the Layer 2 destination is the router.",
     "packets": [{"path": ["PC1", "SW1", "R1"], "label": "to R1's MAC", "tone": "accent"}]},
    {"title": "3. The router carries it onward",
     "text": "R1 looks up 203.0.113.10 in its routing table and forwards the packet toward the internet. Each router hop writes a new Layer 2 header, but the IP addresses stay the same end to end (without NAT).",
     "packets": [{"path": ["R1", "NET", "WEB"], "label": "to 203.0.113.10", "tone": "good"}]},
    {"title": "4. Wrong gateway: local works, remote doesn't",
     "text": "If PC1's gateway were mistyped as 192.168.1.254, where nothing lives, step 1 would still work, but its ARP for the gateway would get no answer, so nothing off-network would work. *Local works, remote fails* points straight at the gateway setting.",
     "nodes": {"PC1": {"badge": "GW .254?", "tone": "bad"}},
     "packets": [{"path": ["PC1", "SW1"], "label": "ARP .254: no reply", "tone": "bad"}]}
  ]
}
```

- **Same network part?** ("You live on my street.") The PC can reach the destination **directly** — it just ARPs for the destination's MAC and sends the frame straight over. No router needed, because they share the same local wire/broadcast domain.
- **Different network part?** ("You live in another town.") The PC has **no way to reach another network by itself** — Layer 2 only reaches the local wire. So it hands the frame to its **default gateway** (the router) and says "please forward this onward." The router, whose whole job is connecting networks, takes it from there.

*This is why a device with no default gateway can still talk to its local neighbors but can't reach the internet* — it has no "door" to hand off-network traffic to. It's also why a wrong gateway address is such a common real-world problem: local stuff works, but nothing outside does, which is a huge troubleshooting clue (you'll see this in Chapter 23).

**But hold on — what if the gateway itself dies?** Every device on the subnet is pointed at that one address, so if that router fails, the whole subnet loses the outside world at once. That's a big enough problem to have its own family of protocols; we'll solve it properly in section **14.7 (FHRP/HSRP)** once you've met routers in detail.

**📝 Exam-style questions — 11.6**

**Q1.** Refer to the exhibit. The PC can ping other hosts in 192.168.10.0/24 but can't reach anything outside that network. What is the cause?

```
C:\> ipconfig

Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 192.168.10.25
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
```

- **A.** The default gateway isn't in the PC's own subnet.
- **B.** The subnet mask should be 255.255.0.0.
- **C.** The PC's address is a broadcast address.
- **D.** The PC needs a DNS server to reach the gateway.

<details><summary>Answer</summary>

**Answer: A.** The PC is in 192.168.10.0/24, but its gateway, 192.168.1.1, is in another subnet. The PC can only ARP for addresses on its own network, so it can never reach that gateway. Typically the gateway should be 192.168.10.1. **Why not the others:** B would merge subnets and is a hack, not the fix. C is wrong because .25 is an ordinary host address. D is wrong because DNS turns names into addresses, and reaching a gateway doesn't involve names.
</details>

**Q2.** PC1 (10.1.1.10/24) sends a packet to 10.1.2.20. Which destination MAC address does PC1 put in the frame?

- **A.** The MAC address of 10.1.2.20
- **B.** The MAC address of PC1's default gateway
- **C.** FFFF.FFFF.FFFF
- **D.** PC1's own MAC address

<details><summary>Answer</summary>

**Answer: B.** 10.1.2.20 is on a different /24 (10.1.2 versus 10.1.1), so the frame goes to the gateway, while the IP header still says 10.1.2.20. **Why not the others:** A is the trap: PC1 can't ARP for a host on another network. C is used only for broadcasts such as ARP requests, not for data. D would send the frame to itself.
</details>

**Q3.** A PC is configured as 172.16.5.10 with mask 255.255.0.0. It sends a packet to 172.16.200.1. What does the PC do?

- **A.** It sends an ARP request for 172.16.200.1 directly, because the destination is on its own network.
- **B.** It sends the packet to its default gateway.
- **C.** It drops the packet, because 200 is outside its third octet.
- **D.** It sends a DNS query for 172.16.200.1.

<details><summary>Answer</summary>

**Answer: A.** With a /16 mask, only the first two octets are the network: 172.16 and 172.16 match, so the destination is local. **Why not the others:** B is what would happen with a /24 mask, which is the trap. C is wrong because the third octet is host bits here. D is wrong because the destination is already an IP address; there's no name to look up.
</details>

---

<a name="chapter-12"></a>
# Chapter 12: Subnetting — Cutting the Network Cake

## 12.1 What Is Subnetting?

**Subnetting** means **splitting one big network into smaller networks** (subnets). It's one of the MOST important CCNA skills. Don't worry — we'll make it painless.

**Story Time 📖:** Imagine you have one giant pizza (a network). If the whole class shares one pizza, it's chaos. Instead, you **cut it into slices** (subnets) so each group gets its own slice. Subnetting is just deciding **where to cut**.

**But WHY cut the network up at all? Why not leave everything in one big network?** Two powerful reasons, and they're the same problems you met earlier — now with a fix:

1. **Broadcast control (performance).** Remember: every device in a network hears every broadcast. Put 1,000 devices in one flat network and each device is constantly interrupted by everyone else's ARP/DHCP shouting — the network crawls. Subnetting slices that into smaller broadcast domains (e.g., ten groups of 100), so each device only hears its own group. *Smaller pizza slices = less noise per person.*
2. **Security & organization.** Separate subnets let you put a **router (with rules)** between groups — so you control exactly who reaches what (students can't reach payroll). Same idea as VLANs (Chapter 7); in fact, each VLAN gets its own subnet.
3. **Stopping waste.** Instead of assigning a giant network to a tiny office (wasting thousands of addresses), you cut a slice that's *just the right size*. This is the classless flexibility that replaced the wasteful old classes.

*So subnetting isn't math for math's sake — it's how you keep networks fast, secure, and efficient.* The math is just the tool for deciding **where to cut**.

> **Pair this chapter with the Subnetting Drill Sheet.** Subnetting is the one CCNA skill that has to be *fast*, not just correct — the drill sheet's 60 worked problems are built to turn the methods below into reflexes. Read here, drill there.

**📝 Exam-style questions — 12.1**

**Q1.** Which two are reasons to subnet a large network? (Choose two.)

- **A.** To make broadcast domains smaller
- **B.** To put a router, and its filtering rules, between groups of devices
- **C.** To increase the total number of addresses in the block
- **D.** To remove the need for routers
- **E.** To give every subnet more usable hosts

<details><summary>Answer</summary>

**Answer: A, B.** Each subnet is its own broadcast domain, so devices hear less noise, and traffic between subnets has to pass a router, where you can apply ACLs. **Why not the others:** C is impossible: cutting a block into slices never adds addresses (it actually costs two per subnet). D is backwards, because subnets need routers between them. E is backwards too: each slice is smaller than the original.
</details>

**Q2.** An engineer splits 192.168.1.0/24 into four equal subnets. What prefix length does each subnet have?

- **A.** /25
- **B.** /26
- **C.** /27
- **D.** /28

<details><summary>Answer</summary>

**Answer: B.** Four subnets need 2 borrowed bits (2² = 4), and 24 + 2 = 26. Each /26 holds 64 addresses. **Why not the others:** A borrows one bit, which gives only 2 subnets. C gives 8 and D gives 16, so they're smaller than needed.
</details>

**Q3.** An engineer borrows 3 host bits from 10.20.30.0/24. How many subnets does this create, and what is the new prefix length?

- **A.** 3 subnets, /27
- **B.** 6 subnets, /27
- **C.** 8 subnets, /27
- **D.** 8 subnets, /21

<details><summary>Answer</summary>

**Answer: C.** Each borrowed bit doubles the count: 2³ = 8 subnets. The prefix grows by 3, from /24 to /27. **Why not the others:** A counts bits, not combinations. B is 2³ − 2, an old classful rule that modern IOS doesn't use (`ip subnet-zero` has been the default for decades). D subtracts the bits instead of adding them.
</details>

## 12.2 The Subnet Mask

The **subnet mask** decides which part of an IP is "network" and which is "host." It looks like an IP address but is made of **1s then 0s**:

Line the address up against the mask:

| Item | Value |
|---|---|
| **IP** | `192.168.1.10` |
| **Mask** | `255.255.255.0` |
| **Mask in binary** | `11111111.11111111.11111111.00000000` |

The **24 ones** mark the network portion; the **8 zeros** mark the host portion.

- Wherever the mask has a **1**, that part is **network**.
- Wherever the mask has a **0**, that part is **host**.

**WHY does a "mask" made of 1s and 0s work — what's actually happening?** The word *mask* is literal: it's like a stencil laid over the IP address that **covers up** part of it. The computer does a bit-by-bit **AND** operation between the IP and the mask, and the result is the **network address**. Here's the intuition without heavy math:

Try the AND below. The mask's 1-bits keep the address's network bits and its 0-bits clear the rest, which leaves the network address.

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "192.168.1.10",
  "prefix": 24,
  "title": "Address AND mask = network",
  "prompt": "At /24 the network is 192.168.1.0. Slide to /26 and the mask becomes 255.255.255.192: still network 192.168.1.0, because .10 is in the first block of 64. Click host bits to move the address and watch the network stay put until you flip a network bit."
}
```

- Where the mask is **1**, the IP's bit "shows through" → that's the **network** part (it's kept).
- Where the mask is **0**, the IP's bit gets "blocked out" to 0 → that's the **host** part (erased to find the network's starting address).

So a device can instantly find "what network does this address belong to?" by applying the mask. *That's the whole point of the mask existing* — it's the tool every device uses to answer the "same network or different?" question from Chapter 11.

**And WHY must the mask be all 1s THEN all 0s — never mixed like 11010011?** Because the network part has to be **contiguous** (one solid block on the left). Remember hierarchical addressing: routers summarize whole networks by their leading bits ("everything starting with 192.168.1 goes this way"). That only works if all the network bits are grouped together at the front. A scattered mask like `11010011` would make it impossible to describe a network as a clean "starts-with" prefix, breaking route summarization. *So the "1s then 0s" rule isn't arbitrary — it's what keeps addresses summarizable and routing efficient.* This is also why we can shorten a mask to a single number (the count of 1s) — the CIDR "/24" notation you'll see next.

**📝 Exam-style questions — 12.2**

**Q1.** Which of these is a valid subnet mask?

- **A.** 255.255.0.255
- **B.** 255.255.255.224
- **C.** 255.255.255.250
- **D.** 255.254.255.0

<details><summary>Answer</summary>

**Answer: B.** 224 is 11100000, so the mask is 27 ones followed by zeros. **Why not the others:** A has 1s after 0s (the third octet is all zeros, then 255). C is 11111010 in the last octet, which mixes ones and zeros. D puts 255 after 254, which also breaks the "ones, then zeros" rule.
</details>

**Q2.** What is the network address for host 10.45.130.77 with mask 255.255.192.0?

- **A.** 10.45.130.0
- **B.** 10.45.128.0
- **C.** 10.45.192.0
- **D.** 10.45.0.0

<details><summary>Answer</summary>

**Answer: B.** The interesting octet is the third. 130 is 10000010 and 192 is 11000000, and 10000010 AND 11000000 = 10000000 = 128. The last octet is ANDed with 0, so the network is 10.45.128.0. **Why not the others:** A keeps the 130 as if the mask were /24. C copies the mask value into the address. D uses a /16.
</details>

**Q3.** How many 1-bits are in the mask 255.255.248.0?

- **A.** 19
- **B.** 21
- **C.** 22
- **D.** 24

<details><summary>Answer</summary>

**Answer: B.** 255 + 255 is 16 ones, and 248 is 11111000, five more: 21, so the mask is /21. **Why not the others:** A would be 255.255.224.0. C would be 255.255.252.0. D would be 255.255.255.0.
</details>

## 12.3 CIDR / Slash Notation

Instead of writing `255.255.255.0`, we count the 1s and write **/24**. This is called **CIDR** (say "sider") or **prefix notation**.

| Mask | Slash | # of 1s |
|------|-------|---------|
| 255.0.0.0 | /8 | 8 |
| 255.255.0.0 | /16 | 16 |
| 255.255.255.0 | /24 | 24 |
| 255.255.255.128 | /25 | 25 |
| 255.255.255.192 | /26 | 26 |
| 255.255.255.224 | /27 | 27 |
| 255.255.255.240 | /28 | 28 |
| 255.255.255.248 | /29 | 29 |
| 255.255.255.252 | /30 | 30 |

**Why can we get away with just writing a single number like "/24"?** Because of the "1s then 0s" rule you just learned! Since the 1s are *always* packed together on the left, the **only** thing that varies is *how many* of them there are. Once you know the count (24), you know the entire mask (24 ones, then 8 zeros). No information is lost. *That's why /24 and 255.255.255.0 are exactly the same thing* — /24 is just the shorthand, and it's why engineers prefer it (faster to write, easier to compare: /26 is obviously "more network bits" than /24).

**📝 Exam-style questions — 12.3**

**Q1.** Which dotted-decimal mask is the same as /27?

- **A.** 255.255.255.192
- **B.** 255.255.255.224
- **C.** 255.255.255.240
- **D.** 255.255.224.0

<details><summary>Answer</summary>

**Answer: B.** /27 is 24 + 3, so three ones in the last octet: 128 + 64 + 32 = 224. **Why not the others:** A is /26. C is /28. D has the three ones in the *third* octet, which makes it /19.
</details>

**Q2.** Which prefix length is the same as 255.255.255.240?

- **A.** /26
- **B.** /27
- **C.** /28
- **D.** /29

<details><summary>Answer</summary>

**Answer: C.** 240 is 11110000, four ones, and 24 + 4 = 28. **Why not the others:** /26 is .192, /27 is .224 and /29 is .248.
</details>

**Q3.** What is the dotted-decimal mask for /19?

- **A.** 255.255.224.0
- **B.** 255.255.255.224
- **C.** 255.255.192.0
- **D.** 255.255.240.0

<details><summary>Answer</summary>

**Answer: A.** 19 = 16 + 3, so the third octet has three ones (224) and the fourth is 0. **Why not the others:** B is /27, with the 224 in the wrong octet. C is /18. D is /20.
</details>

## 12.4 How Many Hosts? The Magic Formula

The number of usable devices in a subnet:

```
   Usable hosts = 2^(host bits) − 2
```

Why minus 2? Because you **can't use** the **network address** (first) or the **broadcast address** (last).

**Example:** A /24 has 8 host bits (32 − 24 = 8).
```
   2^8 − 2 = 256 − 2 = 254 usable devices ✅
```

**Example:** A /26 has 6 host bits (32 − 26 = 6).
```
   2^6 − 2 = 64 − 2 = 62 usable devices ✅
```

### Powers of 2 (memorize these!)

| Power | Value | | Power | Value |
|-------|-------|---|-------|-------|
| 2¹ | 2 | | 2⁵ | 32 |
| 2² | 4 | | 2⁶ | 64 |
| 2³ | 8 | | 2⁷ | 128 |
| 2⁴ | 16 | | 2⁸ | 256 |

**📝 Exam-style questions — 12.4**

**Q1.** How many usable host addresses does a /27 subnet have?

- **A.** 30
- **B.** 32
- **C.** 62
- **D.** 14

<details><summary>Answer</summary>

**Answer: A.** 32 − 27 = 5 host bits, and 2⁵ − 2 = 30. **Why not the others:** B forgets to subtract the network and broadcast addresses. C is a /26. D is a /28.
</details>

**Q2.** A LAN needs 60 hosts. Which prefix length gives enough addresses while wasting the fewest?

- **A.** /25
- **B.** /26
- **C.** /27
- **D.** /28

<details><summary>Answer</summary>

**Answer: B.** /26 has 6 host bits: 2⁶ − 2 = 62 usable, which covers 60. **Why not the others:** A (126 hosts) works but wastes 66 addresses. C (30) and D (14) are too small.
</details>

**Q3.** How many usable host addresses does a /22 subnet have?

- **A.** 510
- **B.** 1022
- **C.** 1024
- **D.** 2046

<details><summary>Answer</summary>

**Answer: B.** 32 − 22 = 10 host bits, and 2¹⁰ − 2 = 1022. **Why not the others:** A is a /23. C forgets the −2. D is a /21.
</details>

**Q4.** Which two prefix lengths provide at least 100 usable host addresses? (Choose two.)

- **A.** /24
- **B.** /25
- **C.** /26
- **D.** /27
- **E.** /28

<details><summary>Answer</summary>

**Answer: A, B.** /24 gives 254 and /25 gives 126, both at least 100. **Why not the others:** /26 gives 62, /27 gives 30 and /28 gives 14, all short of 100.
</details>

## 12.5 The "Block Size" Trick (Subnetting Made Easy)

![A /24 sliced into four /26 blocks](images/subnet_blocks.png)

The easiest way to subnet: find the **block size** (how big each subnet is). 

**Block size = 256 − (the interesting octet of the mask).**

The "interesting octet" is the last octet in the mask that isn't 255 or 0.

**Why does this trick work? Why 256 minus the mask value?** Because the "block size" is literally *how far apart each subnet starts* — and that spacing is controlled by the lowest network bit. Here's the intuition: in the interesting octet, the mask value (like 192) uses up the high bits for the network, leaving the low bits for hosts. The value **256 − 192 = 64** is exactly the value of that **lowest network bit** — the smallest "step" you can take before you roll into the next subnet. So subnets land at multiples of 64 (0, 64, 128, 192) because each one is 64 addresses "wide." *The block size is just the size of one slice*, and 256 − mask gives it to you instantly without drawing out all the binary. That's why this shortcut is a lifesaver on the timed exam — it turns binary work into simple counting.

### Worked Example: 192.168.1.0 /26

1. **Mask /26** = 255.255.255.**192**. Interesting octet = 192.
2. **Block size** = 256 − 192 = **64**.
3. **Subnets start at multiples of 64:** 0, 64, 128, 192.

Now list them:

```
 Subnet      Network      First Host   Last Host    Broadcast
 #1          .0           .1           .62          .63
 #2          .64          .65          .126         .127
 #3          .128         .129         .190         .191
 #4          .192         .193         .254         .255
```

**How to read each row:**
- **Network** = the block start (.0, .64, ...).
- **Broadcast** = one below the next block (.63 is just below .64).
- **First host** = network + 1.
- **Last host** = broadcast − 1.

### Try It ✏️: Which subnet is 192.168.1.100 /26 in?

Block size 64 → subnets at 0, 64, 128, 192. 100 falls between **64 and 127**, so it's in the **.64 subnet** (hosts .65–.126, broadcast .127). Done!

Now check it in binary. At /26 the last octet keeps only its top two bits for the network, and 100 is 01100100, so the network part is 01000000 = 64.

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "192.168.1.100",
  "prefix": 26,
  "title": "192.168.1.100/26: which block of 64?",
  "prompt": "Read off the network (.64), broadcast (.127) and host range (.65–.126). Then slide to /27 (blocks of 32: it's in .96–.127) and /28 (blocks of 16: .96–.111), and check each one with the block size trick."
}
```

**📝 Exam-style questions — 12.5**

**Q1.** Which subnet does the host 172.16.77.130/27 belong to?

- **A.** 172.16.77.96/27
- **B.** 172.16.77.128/27
- **C.** 172.16.77.130/27
- **D.** 172.16.77.160/27

<details><summary>Answer</summary>

**Answer: B.** /27 means a .224 mask, so blocks of 256 − 224 = 32 in the last octet: 96, 128, 160. 130 falls in 128–159. **Why not the others:** A ends at .127. C is the host itself, not a network. D starts after the host.
</details>

**Q2.** What is the broadcast address of the subnet that contains 10.10.10.70/28?

- **A.** 10.10.10.63
- **B.** 10.10.10.71
- **C.** 10.10.10.79
- **D.** 10.10.10.80

<details><summary>Answer</summary>

**Answer: C.** /28 gives blocks of 16: 64, 80. 70 is in the 64 block, so the broadcast is one below the next block, 79. **Why not the others:** A is the broadcast of the block before. B would come from blocks of 8 (/29). D is the next subnet's network address.
</details>

**Q3.** What is the last usable host address in the /29 subnet that contains 192.168.50.45?

- **A.** 192.168.50.45
- **B.** 192.168.50.46
- **C.** 192.168.50.47
- **D.** 192.168.50.39

<details><summary>Answer</summary>

**Answer: B.** /29 gives blocks of 8: 40 to 47. The broadcast is .47, so the last usable host is .46. **Why not the others:** A is just the given host. C is the broadcast. D is in the block before (32–39).
</details>

**Q4.** Refer to the exhibit. PC1 can't reach anything outside its subnet. What is the problem?

```
R1# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 ip address 192.168.1.65 255.255.255.192

PC1:  IP 192.168.1.60   Mask 255.255.255.192   Gateway 192.168.1.65
```

- **A.** PC1 is in 192.168.1.0/26, but its gateway is in 192.168.1.64/26, a different subnet.
- **B.** 192.168.1.65 is a broadcast address and can't be a gateway.
- **C.** The mask 255.255.255.192 is invalid.
- **D.** Nothing is wrong; the problem must be elsewhere.

<details><summary>Answer</summary>

**Answer: A.** With blocks of 64, .60 is in 0–63 and .65 is in 64–127. PC1 can't ARP for a gateway outside its own subnet. Either PC1 needs an address in .65–.126, or the gateway must be in .1–.62. **Why not the others:** B is wrong because .65 is the first usable host of the .64 subnet; the broadcast is .127. C is wrong because .192 is a valid /26 mask. D ignores the mismatch.
</details>

## 12.6 A Full Subnetting Walkthrough

**Question:** You have `172.16.0.0/16` and need **subnets with at least 500 hosts each**. What mask?

1. Need 500 hosts → find host bits: 2^9 = 512 (≥ 502 after −2). So **9 host bits**.
2. Total bits = 32. Network bits = 32 − 9 = **23**. So mask = **/23** (255.255.254.0).
3. Each /23 gives 2^9 − 2 = **510 hosts.** ✅

Check it below: at /23 the host part is 9 bits, one of them in the third octet. Slide to /24 and the host count drops to 254, too few. Slide to /22 and you get 1022: it works, but you get half as many subnets.

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "172.16.4.0",
  "prefix": 23,
  "title": "A /23: 510 hosts across two third-octet values",
  "prompt": "172.16.4.0/23 runs from 172.16.4.0 to 172.16.5.255: the last bit of the third octet is a **host** bit. Flip it and you're at 172.16.5.x, still the same subnet. Flip the bit above it and you're in the next /23, 172.16.6.0."
}
```

**📝 Exam-style questions — 12.6**

**Q1.** An engineer is subnetting 10.0.0.0/8. Every subnet needs at least 1000 hosts, and the engineer wants as many subnets as possible. Which mask should be used?

- **A.** 255.255.248.0
- **B.** 255.255.252.0
- **C.** 255.255.254.0
- **D.** 255.255.255.0

<details><summary>Answer</summary>

**Answer: B.** 1000 hosts need 10 host bits (2¹⁰ − 2 = 1022), so the prefix is /22, which is 255.255.252.0. **Why not the others:** A is /21 (2046 hosts). It works, but you'd get half as many subnets. C is /23 (510 hosts) and D is /24 (254), both too small.
</details>

**Q2.** 192.168.10.0/24 must be split into at least 10 equal subnets, with as many hosts per subnet as possible. Which prefix length, and how many usable hosts per subnet?

- **A.** /27, 30 hosts
- **B.** /28, 14 hosts
- **C.** /29, 6 hosts
- **D.** /26, 62 hosts

<details><summary>Answer</summary>

**Answer: B.** 10 subnets need 4 borrowed bits (2³ = 8 is too few, 2⁴ = 16 is enough), giving /28 with 4 host bits: 2⁴ − 2 = 14. **Why not the others:** A gives only 8 subnets. D gives only 4. C gives 32 subnets, more than enough, but with fewer hosts each than /28, so it doesn't meet "as many hosts as possible".
</details>

**Q3.** How many /23 subnets fit inside 172.16.0.0/16?

- **A.** 64
- **B.** 128
- **C.** 256
- **D.** 512

<details><summary>Answer</summary>

**Answer: B.** Going from /16 to /23 borrows 7 bits, and 2⁷ = 128. **Why not the others:** A is /22 (6 bits). C is /24 (8 bits). D is /25 (9 bits).
</details>

**Q4.** 172.16.0.0/16 is divided into /23 subnets, starting with 172.16.0.0/23. What is the broadcast address of the third subnet?

- **A.** 172.16.4.255
- **B.** 172.16.5.255
- **C.** 172.16.6.255
- **D.** 172.16.3.255

<details><summary>Answer</summary>

**Answer: B.** /23 subnets step by 2 in the third octet: 172.16.0.0, 172.16.2.0, then 172.16.4.0. The third one runs from 172.16.4.0 to 172.16.5.255. **Why not the others:** A treats it as a /24 and stops at .4.255. C is inside the fourth subnet (172.16.6.0/23). D is the broadcast of the *second* subnet.
</details>

## 12.7 VLSM — Different-Sized Slices

**VLSM (Variable Length Subnet Mask)** means making subnets of **different sizes** to avoid waste. Give big departments big subnets and tiny point-to-point links tiny subnets.

**Story Time 📖:** Cutting a pizza into equal slices wastes food if some people are only a little hungry. VLSM lets you cut big slices for hungry people and small slices for snackers — no waste!

**Example plan for 192.168.1.0/24:**

| Group | Hosts Needed | Subnet | Mask | Range |
|-------|-------------|--------|------|-------|
| Sales | 100 | 192.168.1.0 | /25 (126 hosts) | .0–.127 |
| IT | 50 | 192.168.1.128 | /26 (62 hosts) | .128–.191 |
| HR | 25 | 192.168.1.192 | /27 (30 hosts) | .192–.223 |
| Link | 2 | 192.168.1.224 | /30 (2 hosts) | .224–.227 |

**Golden VLSM rule:** Always assign the **biggest** subnet first, then smaller ones. This prevents overlap.

Click each LAN and link below to see the range it got from the plan above.

```diagram
{
  "type": "topology",
  "title": "One /24, four right-sized subnets",
  "caption": "The VLSM plan for 192.168.1.0/24, biggest first. Click a LAN or the WAN link for its range.",
  "nodes": [
    {"id": "SALES", "kind": "switch", "x": 0, "y": 0, "label": "Sales LAN", "sub": "192.168.1.0/25", "info": "**100 hosts** → /25 (126 usable). Network .0, hosts **.1–.126**, broadcast .127. Placed first: a /25 can only start at .0 or .128."},
    {"id": "IT", "kind": "switch", "x": 0, "y": 1.4, "label": "IT LAN", "sub": "192.168.1.128/26", "info": "**50 hosts** → /26 (62 usable). Network .128, hosts **.129–.190**, broadcast .191."},
    {"id": "HR", "kind": "switch", "x": 0, "y": 2.8, "label": "HR LAN", "sub": "192.168.1.192/27", "info": "**25 hosts** → /27 (30 usable). Network .192, hosts **.193–.222**, broadcast .223."},
    {"id": "R1", "kind": "router", "x": 2.4, "y": 1.4, "sub": "gateway for all 3", "info": "R1 has one interface in each LAN (usually the first host address: .1, .129 and .193) and one on the WAN link (.225)."},
    {"id": "R2", "kind": "router", "x": 4.6, "y": 1.4, "sub": "192.168.1.226", "info": "The other end of the point-to-point link. Its WAN address is .226, the only other usable address in the /30."}
  ],
  "links": [
    {"a": "R1", "b": "SALES", "info": "192.168.1.0/25, gateway 192.168.1.1."},
    {"a": "R1", "b": "IT", "info": "192.168.1.128/26, gateway 192.168.1.129."},
    {"a": "R1", "b": "HR", "info": "192.168.1.192/27, gateway 192.168.1.193."},
    {"a": "R1", "b": "R2", "label": ".224/30", "info": "**2 hosts** → /30. Network .224, hosts **.225** (R1) and **.226** (R2), broadcast .227. Addresses .228–.255 are still free for later."}
  ]
}
```

**Why must you assign biggest-first? What actually goes wrong otherwise?** Because subnets can only start on **boundaries that match their size** (a /25 must start at .0 or .128; a /26 at .0/.64/.128/.192; and so on). Big subnets have **few** legal starting points, while small subnets fit almost anywhere. So if you place the big, picky subnets **first**, they grab their valid boundaries while everything is still open. If you place small subnets first, they scatter around and **block the boundaries the big subnet needed** — now your /25 has nowhere legal to fit, even though there's technically enough total space. It's like packing a suitcase: put the big rigid items in first, then tuck small soft things around them. Do it backwards and the big item won't fit. *That's the whole reason for the rule — it's about respecting alignment boundaries, not just tidiness.*

**📝 Exam-style questions — 12.7**

**Q1.** An engineer uses VLSM to divide 192.168.20.0/24, assigning the biggest subnet first, each starting at the lowest free address. LAN A needs 50 hosts, LAN B needs 25 and LAN C needs 10. Which subnet does LAN C get?

- **A.** 192.168.20.96/28
- **B.** 192.168.20.64/28
- **C.** 192.168.20.96/27
- **D.** 192.168.20.112/28

<details><summary>Answer</summary>

**Answer: A.** LAN A needs a /26 (62 hosts): .0–.63. LAN B needs a /27 (30): .64–.95. LAN C needs a /28 (14): the next free address is .96, so .96–.111. **Why not the others:** B overlaps LAN B. C is the wrong size: a /27 holds 30, wasting 16 addresses. D skips over .96–.111 for no reason.
</details>

**Q2.** Why should VLSM assign the largest subnets first?

- **A.** Large subnets must start on boundaries that are multiples of their size, and placing small subnets first can leave no aligned space for them.
- **B.** Routers only accept the largest subnet as their first interface.
- **C.** Large subnets get lower addresses, so they win routing ties.
- **D.** It makes the plan use fewer total addresses.

<details><summary>Answer</summary>

**Answer: A.** A /25 can only start at .0 or .128. Scatter some /30s across the block first and both of those starts may be taken, even though enough addresses are free in total. **Why not the others:** B and C are made up. D is wrong because the order doesn't change how many addresses each subnet uses; it decides whether they fit at all.
</details>

**Q3.** Refer to the exhibit. An engineer proposes this address plan. Which two subnets overlap?

```
Sales   10.1.1.0/25
Eng     10.1.1.128/26
Lab     10.1.1.160/28
WAN     10.1.1.192/30
```

- **A.** Sales and Eng
- **B.** Eng and Lab
- **C.** Lab and WAN
- **D.** None of them overlap.

<details><summary>Answer</summary>

**Answer: B.** Eng, a /26 at .128, covers .128 to .191. Lab (.160 to .175) sits entirely inside it. **Why not the others:** A doesn't overlap: Sales ends at .127 and Eng starts at .128. C doesn't either: Lab ends at .175 and the WAN starts at .192. D misses the Eng/Lab clash, because it only looks at the start addresses.
</details>

## 12.8 The /30 and /31 — Tiny Subnets for Router Links

A **/30** gives exactly **2 usable hosts** — perfect for a cable between two routers (each end needs one IP). A **/31** is a special case that gives 2 hosts with no waste (used on point-to-point links). Memorize: **/30 = 2 hosts.**

See it below: a /30 leaves 2 host bits, so 4 addresses, and only the middle two are usable. Slide to /31 to see the RFC 3021 case, where both addresses are usable.

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "10.1.12.1",
  "prefix": 30,
  "title": "A /30: four addresses, two usable",
  "prompt": "At /30, 10.1.12.0 is the network, .1 and .2 are the two router ends, and .3 is the broadcast. Click the last two bits to walk through all four. The next /30 starts at 10.1.12.4."
}
```

**Why use a tiny /30 for a router-to-router link instead of a normal /24?** Because a point-to-point link between two routers has **exactly two devices** on it — one router on each end. A /24 would reserve 254 host addresses for a link that can only ever use 2, **wasting 252 addresses**. Multiply that across dozens of WAN links in a real network and you've thrown away thousands of addresses for nothing. A /30 gives you precisely the 2 addresses you need (plus its own network and broadcast). *This is VLSM's whole philosophy in action: match the slice size to the actual need.* The /31 takes it even further — a special rule (RFC 3021) that squeezes a point-to-point link down to literally 2 addresses with no network/broadcast waste at all, because on a link with only two ends, "broadcast" and "unicast to the other guy" mean the same thing anyway.

**📝 Exam-style questions — 12.8**

**Q1.** How many usable host addresses does a /30 subnet provide?

- **A.** 1
- **B.** 2
- **C.** 4
- **D.** 6

<details><summary>Answer</summary>

**Answer: B.** Two host bits give 4 addresses, minus the network and broadcast, leaving 2: one for each router. **Why not the others:** A is too few for a link with two ends. C counts the network and broadcast too. D is a /29.
</details>

**Q2.** R1's Gi0/0 is 10.1.1.6/30. Which address must R2's end of the link use?

- **A.** 10.1.1.4
- **B.** 10.1.1.5
- **C.** 10.1.1.7
- **D.** 10.1.1.8

<details><summary>Answer</summary>

**Answer: B.** /30 blocks are 4 wide: .4 to .7. .4 is the network, .7 is the broadcast, and .5 and .6 are the only usable addresses. R1 has .6, so R2 gets .5. **Why not the others:** A is the network address. C is the broadcast. D is in the next subnet, so the routers wouldn't share a network.
</details>

**Q3.** Which statement about /31 subnets on point-to-point links is true?

- **A.** Both addresses are usable as host addresses, as defined in RFC 3021.
- **B.** A /31 has no usable addresses, because both are reserved.
- **C.** A /31 has one usable address.
- **D.** /31 is only valid for IPv6.

<details><summary>Answer</summary>

**Answer: A.** On a link with exactly two ends there's no need for a separate network or broadcast address, so RFC 3021 lets both addresses be used. IOS accepts a /31 on a point-to-point interface (with a warning on Ethernet). **Why not the others:** B and C apply the normal −2 rule, which RFC 3021 sets aside for /31 links. D is wrong because /31 is an IPv4 technique; IPv6 links commonly use /64 or /127.
</details>

**Q4.** How many /30 subnets can be made from 192.168.100.0/26?

- **A.** 8
- **B.** 16
- **C.** 32
- **D.** 64

<details><summary>Answer</summary>

**Answer: B.** From /26 to /30 borrows 4 bits, and 2⁴ = 16. Put another way, 64 addresses ÷ 4 per /30 = 16. **Why not the others:** A is what /29s would give. C counts as if the block were a /25. D is the number of addresses, not subnets.
</details>

---

<a name="chapter-13"></a>
# Chapter 13: IPv6 — The New, Giant Address System

## 13.1 Why IPv6 Exists

IPv4 has about **4.3 billion** addresses. That sounds like a lot, but with phones, laptops, TVs, watches, and fridges all online, **we ran out!** 😲

**IPv6** fixes this with a mind-bogglingly huge number of addresses: **340 undecillion** (that's 340 followed by 36 zeros). Enough for every grain of sand to have trillions of addresses.

**📝 Exam-style questions — 13.1**

**Q1.** How long is an IPv6 address?

- **A.** 32 bits
- **B.** 64 bits
- **C.** 128 bits
- **D.** 256 bits

<details><summary>Answer</summary>

**Answer: C.** IPv6 addresses are 128 bits long, four times the length of an IPv4 address. That's where the "340 undecillion" comes from: 2^128 is about 3.4 × 10^38. **Why not the others:** A, 32 bits is IPv4, the space we ran out of. B, 64 bits is only the *host half* (the interface ID) of a typical IPv6 address. D, no IP version uses 256-bit addresses.
</details>

**Q2.** What was the main problem IPv6 was designed to solve?

- **A.** IPv4 can't carry voice and video traffic
- **B.** The world was running out of IPv4 addresses
- **C.** IPv4 packets can't cross routers from different vendors
- **D.** IPv4 has no way to send traffic to a group of hosts

<details><summary>Answer</summary>

**Answer: B.** About 4.3 billion IPv4 addresses simply isn't enough for every phone, laptop, TV and sensor on the planet. IPv6's giant address space fixes that for good. **Why not the others:** A, IPv4 carries voice and video every day (QoS handles the priorities). C, IPv4 is an open standard every vendor speaks. D, IPv4 already has multicast (224.0.0.0/4).
</details>

## 13.2 What IPv6 Looks Like

![Anatomy of a global unicast IPv6 address](images/ipv6_addr.png)

IPv6 is **128 bits** (four times bigger than IPv4's 32 bits). It's written in **hexadecimal**, in **8 groups** of 4 hex digits, separated by **colons**:

An IPv6 address is written as **8 groups of 4 hex digits**, separated by colons:

`2001:0db8:0000:0000:0000:ff00:0042:8329`

Each group is 16 bits, so 8 × 16 = **128 bits** in total.

**📝 Exam-style questions — 13.2**

**Q1.** How many bits does each colon-separated group in an IPv6 address represent?

- **A.** 4
- **B.** 8
- **C.** 16
- **D.** 32

<details><summary>Answer</summary>

**Answer: C.** Each group is four hex digits, and each hex digit is 4 bits, so a group is 16 bits. Eight groups × 16 bits = 128 bits. **Why not the others:** A, 4 bits is one hex digit, not a whole group. B, 8 bits is one IPv4 octet, a habit worth un-learning here. D, 32 bits would make the address 256 bits long.
</details>

**Q2.** Which one is a valid IPv6 address written out in full?

- **A.** `2001:0db8:0000:ff00:0042:8329`
- **B.** `2001:0db8:0000:0000:0000:ff00:0042:8329`
- **C.** `2001.0db8.0000.0000.0000.ff00.0042.8329`
- **D.** `2001:0db8:0000:0000:0000:ff00:0042:83g9`

<details><summary>Answer</summary>

**Answer: B.** Eight groups of four hex digits, separated by colons: that's exactly the full form. **Why not the others:** A has only six groups and no `::` to stand in for the missing two, so it's only 96 bits. C uses dots; IPv6 separates groups with colons. D contains `g`, which isn't a hex digit (hex stops at f).
</details>

**Q3.** How many hexadecimal digits are in a fully written IPv6 address?

- **A.** 8
- **B.** 16
- **C.** 32
- **D.** 128

<details><summary>Answer</summary>

**Answer: C.** 128 bits ÷ 4 bits per hex digit = 32 hex digits (8 groups of 4). **Why not the others:** A is the number of *groups*. B would only be 64 bits. D is the number of *bits*, not hex digits.
</details>

## 13.3 Shortening IPv6 (The Two Rules)

IPv6 is long, so there are two rules to shorten it:

**Rule 1 — Drop leading zeros** in each group:
```
 2001:0db8:0000:0000:0000:ff00:0042:8329
 2001:db8:0:0:0:ff00:42:8329        (leading zeros removed)
```

**Rule 2 — Replace ONE run of all-zero groups with `::`** (double colon), only once:
```
 2001:db8:0:0:0:ff00:42:8329
 2001:db8::ff00:42:8329             (the three 0 groups became ::)
```

> **Important:** You can use `::` **only once** per address (otherwise it's ambiguous how many zeros it hides).

**Why can `::` only be used ONCE?** Because the whole trick works by *counting*: when you see `::`, you figure out how many zero-groups it hides by subtracting the visible groups from 8. If an address had **two** `::`, you'd have no way to know how to split the zeros between them — `2001::5::1` could mean several different addresses. One `::` keeps it unambiguous: "fill the gap with exactly enough zeros to reach 8 groups." That's why the rule exists — it's what makes the shorthand reversible.

**Why do these shortening rules exist at all?** Because IPv6 addresses are **enormous** (128 bits = 32 hex digits), and real addresses are full of zeros (the designers deliberately left big zero-filled gaps for future structure). Writing `2001:0db8:0000:0000:0000:0000:0000:0001` by hand every time would be miserable and error-prone. The rules let you write `2001:db8::1` instead — same address, far less to type and mistype. *It's purely a human-convenience feature; the computer always uses the full 128 bits internally.*

### Try It ✏️: Shorten `2001:0db8:0000:0000:0000:0000:0000:0001`
- Drop leading zeros: `2001:db8:0:0:0:0:0:1`
- Collapse the zeros: `2001:db8::1` ✅

**📝 Exam-style questions — 13.3**

**Q1.** An engineer must write `2001:0db8:0000:0000:0001:0000:0000:0001` in compressed form. Which two answers are valid representations of this address? (Choose two.)

- **A.** `2001:db8::1::1`
- **B.** `2001:db8::1:0:0:1`
- **C.** `2001:db8:0:0:1::1`
- **D.** `2001:db8::1:1`
- **E.** `2001:db8:0000::1`

<details><summary>Answer</summary>

**Answer: B, C.** The address has two separate runs of two zero groups. `::` may replace only *one* of them, so you can collapse either the first run (B) or the second (C) and write the other as `0:0`. Both expand back to the same eight groups. (The recommended style, RFC 5952, collapses the first run when the runs are the same length, so B is the "preferred" text form, but both are valid.) **Why not the others:** A uses `::` twice, which is ambiguous and illegal. D expands to `2001:db8:0:0:0:0:1:1`, a different address: it lost the 1 in the fifth group's place. E shows four groups, so `::` hides four zero groups, giving `2001:db8:0:0:0:0:0:1`, which is also a different address.
</details>

**Q2.** What is the full, uncompressed form of `2001:db8:a::12`?

- **A.** `2001:0db8:000a:0000:0000:0000:0000:0012`
- **B.** `2001:0db8:a000:0000:0000:0000:0000:1200`
- **C.** `2001:0db8:000a:0000:0000:0000:0012`
- **D.** `2001:0db8:000a:0000:0000:0000:0000:0000:0012`

<details><summary>Answer</summary>

**Answer: A.** Four groups are visible (2001, db8, a, 12), so `::` hides 8 − 4 = 4 zero groups. Then put back the leading zeros: `a` → `000a`, `12` → `0012`. **Why not the others:** B pads with zeros on the *right*, but only *leading* zeros are ever dropped, so `a` is `000a`, not `a000`. C has only seven groups. D has nine; an IPv6 address always has exactly eight.
</details>

**Q3.** Which is the shortest valid way to write `FE80:0000:0000:0000:0202:B3FF:FE1E:8329`?

- **A.** `FE8::202:B3FF:FE1E:8329`
- **B.** `FE80::0202:B3FF:FE1E:8329`
- **C.** `FE80::202:B3FF:FE1E:8329`
- **D.** `FE80:0:0:0:202:B3FF:FE1E:8329`

<details><summary>Answer</summary>

**Answer: C.** Collapse the three zero groups to `::` and drop the leading zero from `0202`. **Why not the others:** A drops the *trailing* zero of FE80, which changes the value (FE8 means 0FE8). B is valid but not the shortest, because `0202` still has a leading zero. D is valid too, but it never uses `::`, so it's longer than C.
</details>

## 13.4 Types of IPv6 Addresses

| Type | Starts With | Meaning |
|------|-------------|---------|
| **Global Unicast** | 2000::/3 | Public, internet-routable (like a public IPv4) |
| **Link-Local** | FE80::/10 | Only works on the local link; auto-made on every interface |
| **Unique Local** | FC00::/7 | Private, like IPv4 private addresses |
| **Multicast** | FF00::/8 | One-to-many group |
| **Loopback** | ::1 | Yourself (like 127.0.0.1) |
| **Unspecified** | :: | "No address yet" |

> **Note:** IPv6 has **no broadcast!** It uses **multicast** instead. This is a favorite exam fact.

**Why did IPv6 KILL the broadcast?** Because broadcasts are **rude and wasteful** — a broadcast forces *every* device on the network to stop what it's doing, pull in the frame, and inspect it, *even if the message has nothing to do with them.* On a busy IPv4 network, all that broadcast interruption adds up to real wasted CPU and bandwidth (you saw this pain in the VLAN chapter). IPv6's designers looked at this and said: *why bother everyone when we can talk only to the devices that care?* So IPv6 replaces broadcast with **targeted multicast** — messages go only to the specific group that signed up to listen. For example, instead of IPv4's ARP (a broadcast that yells at everyone "who has this IP?"), IPv6 uses **Neighbor Discovery** with a multicast that reaches *only* the one relevant device. *Same job, far less interruption.* Fewer devices bothered = a more efficient network. That's the "why" behind one of the exam's favorite facts.

**Why does every IPv6 interface automatically make a "link-local" (FE80::) address?** Because IPv6 was designed so devices can **always talk to their direct neighbors instantly**, even before any DHCP, router, or manual config exists. The link-local address is a self-assigned "I can at least reach the devices on my own wire" address. *Why is that useful?* It lets crucial startup processes work immediately — like discovering the router, or two devices coordinating — without waiting for any address setup. It's the networking equivalent of being able to talk to people in the same room without needing a phone number yet. (Link-local only works on the local link — routers never forward it — which is exactly why it's safe to auto-generate on every interface.)

**📝 Exam-style questions — 13.4**

**Q1.** Which prefix identifies an IPv6 link-local address?

- **A.** `2000::/3`
- **B.** `FC00::/7`
- **C.** `FE80::/10`
- **D.** `FF00::/8`

<details><summary>Answer</summary>

**Answer: C.** Link-local addresses live in FE80::/10. Every IPv6 interface creates one automatically, and routers never forward them off the link. **Why not the others:** A is global unicast (public, routable). B is unique local, IPv6's version of private addressing. D is multicast.
</details>

**Q2.** A host is configured with `FD12:3456:789A:1::10/64`. What type of address is this?

- **A.** Global unicast
- **B.** Link-local
- **C.** Unique local
- **D.** Multicast

<details><summary>Answer</summary>

**Answer: C.** Unique local is FC00::/7, which covers everything starting FC or FD. In practice you'll almost always see FD, because that's the half meant for locally assigned prefixes. Think of it as IPv6's 10.0.0.0/8. **Why not the others:** A, global unicast starts with 2 or 3 (2000::/3). B, link-local starts with FE80. D, multicast starts with FF.
</details>

**Q3.** Which two statements about IPv6 addressing are true? (Choose two.)

- **A.** IPv6 has no broadcast addresses; multicast does that job.
- **B.** Routers forward link-local addresses between subnets.
- **C.** Unique local addresses are the IPv6 equivalent of private IPv4 addresses.
- **D.** `::1` is the unspecified address.
- **E.** Global unicast addresses begin with FF.

<details><summary>Answer</summary>

**Answer: A, C.** IPv6 dropped broadcast completely and talks to groups with multicast, so only the devices that care get interrupted. Unique local (FC00::/7) addresses are for internal use, like 10.x or 192.168.x. **Why not the others:** B, link-local addresses are valid only on their own link, and routers never forward them; that's what "link-local" means. D, `::1` is the loopback address; the unspecified address is `::` (all zeros). E, FF is multicast; global unicast starts with 2000::/3.
</details>

## 13.5 EUI-64 — Making a Host Part from a MAC

IPv6 can build the second half of its address automatically from the device's MAC address using **EUI-64**:

1. Split the 48-bit MAC in half.
2. Insert `FFFE` in the middle (making 64 bits).
3. Flip the 7th bit of the first byte.

| Step | Result |
|------|--------|
| Start with the MAC | `00:1A:2B:3C:4D:5E` |
| Split it and insert `FF:FE` in the middle | `00:1A:2B:FF:FE:3C:4D:5E` |
| Flip the 7th bit of the first byte (`00` → `02`) | `02:1A:2B:FF:FE:3C:4D:5E` |
| **Interface ID** | `021A:2BFF:FE3C:4D5E` |

```diagram
{
  "type": "bits",
  "mode": "octet",
  "value": 0,
  "title": "EUI-64's bit flip, up close",
  "prompt": "This is the first byte of the MAC `00:1A:2B:3C:4D:5E`. EUI-64 flips the **7th bit from the left**, the one worth **2** (the universal/local bit). Click it and watch `0x00` become `0x02`. Then type **82** in the Decimal box (`0x52`, binary 0101 0010): that bit is already 1, so the flip makes it 0 and the byte becomes `0x50`. EUI-64 *flips* the bit; it doesn't just set it."
}
```

**📝 Exam-style questions — 13.5**

**Q1.** A host has the MAC address `0C1A.2B3C.4D5E`. Which interface ID does it build with modified EUI-64?

- **A.** `0C1A:2BFF:FE3C:4D5E`
- **B.** `0D1A:2BFF:FE3C:4D5E`
- **C.** `0E1A:2BFF:FE3C:4D5E`
- **D.** `0E1A:2B3C:FFFE:4D5E`

<details><summary>Answer</summary>

**Answer: C.** Split the MAC (`0C1A2B` | `3C4D5E`), put `FFFE` in the middle, then flip the 7th bit of the first byte. `0C` is `0000 1100`; flipping the bit worth 2 gives `0000 1110` = `0E`. **Why not the others:** A forgot the bit flip. B flipped the wrong bit (the one worth 1, giving 0D). D put `FFFE` after the fourth byte instead of exactly in the middle, after the third.
</details>

**Q2.** Refer to the exhibit. The engineer then enters `ipv6 address 2001:db8:acad:10::/64 eui-64` on Gi0/0. Which address does the interface get?

```
R1# show interfaces gi0/0 | include address
  Hardware is iGbE, address is 5254.0012.3456 (bia 5254.0012.3456)
```

- **A.** `2001:db8:acad:10:5254:ff:fe12:3456`
- **B.** `2001:db8:acad:10:5054:ff:fe12:3456`
- **C.** `2001:db8:acad:10:5654:ff:fe12:3456`
- **D.** `2001:db8:acad:10:5054:12:fffe:3456`

<details><summary>Answer</summary>

**Answer: B.** The first byte is `52` = `0101 0010`. The bit worth 2 is already 1, and EUI-64 *flips* it, so it becomes 0: `0101 0000` = `50`. With `FFFE` in the middle the interface ID is `5054:00FF:FE12:3456`, written `5054:ff:fe12:3456`. **Why not the others:** A didn't flip the bit. C *set* a different bit (the one worth 4) instead of flipping the one worth 2. "Flip" means 1 becomes 0 here, which trips up anyone who memorised "00 becomes 02". D inserted `FFFE` in the wrong place.
</details>

## 13.6 Configuring IPv6 on a Router

```
R1(config)# ipv6 unicast-routing        ! turn on IPv6 routing
R1(config)# interface gi0/0
R1(config-if)# ipv6 address 2001:db8:0:1::1/64   ! set an IPv6 address
R1(config-if)# ipv6 address fe80::1 link-local   ! optional link-local
R1(config-if)# no shutdown
```

**📝 Exam-style questions — 13.6**

**Q1.** An engineer configures IPv6 addresses on two interfaces of R1. Hosts on each LAN can ping their own R1 interface, but R1 doesn't forward IPv6 packets between the LANs and hosts receive no Router Advertisements. Which command is missing?

- **A.** `ipv6 enable`
- **B.** `ipv6 unicast-routing`
- **C.** `ipv6 address autoconfig`
- **D.** `ip routing`

<details><summary>Answer</summary>

**Answer: B.** IPv4 routing is on by default on a Cisco router, but IPv6 routing is not. Until `ipv6 unicast-routing` is entered globally, the router acts like an IPv6 host: it answers on its own addresses but won't route between interfaces or send RAs. **Why not the others:** A, `ipv6 enable` is an interface command that just turns on IPv6 with a link-local address. C makes the interface get its *own* address by SLAAC, like a host. D turns on IPv4 routing, which doesn't touch IPv6.
</details>

**Q2.** An engineer enters `ipv6 address 2001:db8:0:1::1/64` on Gi0/0 and doesn't configure a link-local address. `ipv6 unicast-routing` is enabled and the interface is up. Which two statements are true? (Choose two.)

- **A.** The interface automatically creates its own FE80:: link-local address.
- **B.** The routing table shows `2001:db8:0:1::/64` as connected (C) and `2001:db8:0:1::1/128` as local (L).
- **C.** The global address won't work until a link-local address is configured by hand.
- **D.** The router forwards traffic sourced from link-local addresses to other subnets.
- **E.** The interface must also have an IPv4 address before IPv6 can be enabled.

<details><summary>Answer</summary>

**Answer: A, B.** As soon as IPv6 is enabled on an interface, it builds a link-local address on its own (on Cisco routers usually with EUI-64). And just like IPv4, the subnet appears as a connected route and the router's own address as a /128 local route. **Why not the others:** C, the `link-local` command is optional; it just picks an easier-to-read value such as FE80::1. D, link-local traffic never leaves its link. E, IPv6 runs fine on an interface with no IPv4 address at all.
</details>

## 13.7 How Devices Get IPv6 Addresses

- **SLAAC** (Stateless Address Auto-Configuration): The device makes its own address by listening to the router. No DHCP needed!
- **DHCPv6:** A server hands out addresses (stateful) or just extra info like DNS (stateless).
- **Static:** You type it in by hand.

**📝 Exam-style questions — 13.7**

**Q1.** Which method lets a host build its own global IPv6 address from the prefix a router advertises, with no server keeping track of who has what?

- **A.** Stateful DHCPv6
- **B.** SLAAC
- **C.** Static configuration
- **D.** DHCP relay

<details><summary>Answer</summary>

**Answer: B.** With SLAAC (stateless address autoconfiguration) the host takes the /64 prefix from the router's RA and adds its own interface ID. Nobody keeps a list, which is what "stateless" means. **Why not the others:** A, stateful DHCPv6 has a server lease addresses and remember each one. C, static means someone types the address in. D, relay only forwards DHCP messages to a server on another subnet; it doesn't assign anything.
</details>

**Q2.** A network uses stateless DHCPv6. What does the DHCPv6 server provide to hosts?

- **A.** The IPv6 address and the DNS server
- **B.** Only the default gateway
- **C.** Extra settings such as the DNS server; the host builds its address with SLAAC
- **D.** Nothing; stateless means no DHCPv6 server is used

<details><summary>Answer</summary>

**Answer: C.** Stateless DHCPv6 hands out "other" information like DNS servers and the domain name, while the address itself comes from SLAAC. The server doesn't need to track addresses, so it keeps no state. **Why not the others:** A describes stateful DHCPv6. B, DHCPv6 never hands out a default gateway; that always comes from the Router Advertisement. D, there *is* a DHCPv6 server, it just doesn't hand out addresses.
</details>

**Q3.** How does an IPv6 host learn its default gateway?

- **A.** From a DHCPv6 option, the same way DHCPv4 sends option 3
- **B.** From the source link-local address of the Router Advertisement
- **C.** By sending an ARP request for the router's address
- **D.** From the DNS server

<details><summary>Answer</summary>

**Answer: B.** The router that sends the RA *is* the gateway, and the host uses the RA's source address, the router's link-local address, as its default gateway. That's why a host's default route usually points at a next hop like FE80::1. **Why not the others:** A, DHCPv6 has no default-gateway option at all, a classic exam trap. C, IPv6 has no ARP; NDP replaced it. D, DNS turns names into addresses; it doesn't pick gateways.
</details>

---

## 13.8 NDP & SLAAC In Depth — How IPv6 Replaced ARP and DHCP

> 🔬 **Depth section.** Section 13.7 said devices "can configure themselves." This is the mechanism — and it's a favourite CCNP topic.

IPv6 deleted two things you rely on in IPv4: **ARP** and **broadcasts**. Both were replaced by **NDP (Neighbor Discovery Protocol)**, which runs over ICMPv6.

### The Five NDP Messages

| Type | Message | Purpose |
|------|---------|---------|
| **133** | Router Solicitation (RS) | "Any routers here?" |
| **134** | Router Advertisement (RA) | "I'm a router, here's the prefix" |
| **135** | Neighbor Solicitation (NS) | "Who has this address?" (ARP's job) |
| **136** | Neighbor Advertisement (NA) | "I do, here's my MAC" |
| **137** | Redirect | "There's a better first hop for that" |

### Why Multicast Instead of Broadcast

IPv4's ARP shouts to the **broadcast** address, so **every** device on the segment must interrupt its CPU, inspect the packet, and almost always discard it. On a busy VLAN that's constant wasted work for everyone.

IPv6 sends its NS to a **solicited-node multicast** address, built from the last 24 bits of the target address:

Take the target address `2001:db8::a1b2:c3d4`, keep its **last 24 bits**
(`b2:c3d4`), and append them to the fixed prefix `FF02::1:FF` — giving the
solicited-node address **`FF02::1:FFb2:c3d4`**.

**Why does this help, when it's still one-to-many?** Because a NIC filters multicast **in hardware**. A host joins only the group matching its own address, so its network card silently ignores everything else — the CPU is never even notified. Since the group is derived from the low 24 bits, the odds of two hosts sharing it on one segment are tiny. *Effectively, only the intended target wakes up. Same question as ARP, asked without bothering the whole room.*

```diagram
{
  "type": "sequence",
  "title": "Neighbor Solicitation: ARP's job without the broadcast",
  "caption": "PC1 (`2001:db8:a:b::10`) wants to send to PC2 (`2001:db8:a:b::a1b2:c3d4`) on the same link but doesn't know its MAC yet. Watch who wakes up.",
  "actors": [
    {
      "id": "PC1",
      "kind": "host",
      "label": "PC1"
    },
    {
      "id": "PC2",
      "kind": "host",
      "label": "PC2 (…a1b2:c3d4)"
    },
    {
      "id": "PC3",
      "kind": "host",
      "label": "PC3 (…77:1234)"
    }
  ],
  "messages": [
    {
      "note": "No entry for …a1b2:c3d4",
      "over": [
        "PC1"
      ],
      "states": {
        "PC1": "INCOMPLETE"
      },
      "text": "PC1 checks its **neighbor cache** (IPv6's ARP table, `show ipv6 neighbors` on a router). No entry, so it must ask. The entry starts in the **INCOMPLETE** state."
    },
    {
      "from": "PC1",
      "to": "PC2",
      "label": "NS (135): who has …a1b2:c3d4?",
      "detail": "to FF02::1:FFB2:C3D4 / MAC 3333.FFB2.C3D4",
      "text": "The NS goes to the **solicited-node** group built from the target's last 24 bits (`b2:c3d4`). On Ethernet that maps to the multicast MAC `33:33` + the last 32 bits: **3333.FFB2.C3D4**. PC1's own MAC rides along in the message, so PC2 learns it for free."
    },
    {
      "note": "NIC filters 3333.FFB2.C3D4",
      "over": [
        "PC3"
      ],
      "states": {
        "PC3": "not disturbed"
      },
      "text": "PC3 joined only *its* group, `FF02::1:FF77:1234` (MAC 3333.FF77.1234). Its network card drops this frame **in hardware**, and the CPU never hears about it. With an ARP broadcast, PC3 would have had to stop and look."
    },
    {
      "from": "PC2",
      "to": "PC1",
      "label": "NA (136): that's me",
      "detail": "unicast, MAC 0050.56aa.bbcc",
      "dashed": true,
      "tone": "good",
      "states": {
        "PC2": "answered"
      },
      "text": "PC2 replies with a **Neighbor Advertisement** sent straight to PC1, carrying its MAC address."
    },
    {
      "note": "Cached: sends packet",
      "over": [
        "PC1"
      ],
      "states": {
        "PC1": "REACHABLE"
      },
      "tone": "good",
      "text": "PC1 caches `…a1b2:c3d4 → 0050.56aa.bbcc` as **REACHABLE** and sends its packet. Same job as ARP, but only the target was interrupted."
    }
  ]
}
```

### SLAAC — Building Your Own Address

1. The host boots and forms a **link-local** address (`FE80::/10` + its interface ID).
2. **DAD:** it sends an NS to its *own* tentative address — silence means nobody
   else has it, so it's safe to use.
3. It sends an **RS** to `FF02::2` (all-routers).
4. A router replies with an **RA**: *"the prefix here is `2001:db8:a:b::/64`."*
5. The host builds its address: **prefix + its own interface ID**.
6. It runs **DAD** once more, on the new address.

**Why does the host generate the host portion itself rather than being assigned one?** Because a /64 subnet holds 18 quintillion addresses. Collisions are so improbable that central bookkeeping — the entire reason DHCP exists — stops being worth it. The scarcity that made DHCP necessary in IPv4 simply doesn't exist here. **DAD (Duplicate Address Detection)** is the cheap safety check that makes self-assignment safe: ask for your own address, and *silence is the confirmation*.

```diagram
{
  "type": "sequence",
  "title": "SLAAC: a host builds its own address",
  "caption": "Press **Next** to watch a PC with MAC `5254.0012.3456` go from nothing to a working global address. Nobody hands it an address; it builds one and checks it.",
  "actors": [
    {
      "id": "PC",
      "kind": "host",
      "label": "PC"
    },
    {
      "id": "LAN",
      "kind": "host",
      "label": "Other hosts"
    },
    {
      "id": "R1",
      "kind": "router",
      "label": "R1 (FE80::1)"
    }
  ],
  "messages": [
    {
      "note": "Builds its link-local",
      "over": [
        "PC"
      ],
      "states": {
        "PC": "LL tentative"
      },
      "text": "The PC makes a **link-local** address from FE80::/64 plus its interface ID (here EUI-64 from the MAC; many operating systems use a random ID instead). It's **tentative**: not used until it's proven unique."
    },
    {
      "from": "PC",
      "to": "LAN",
      "label": "NS (135): DAD for my link-local",
      "detail": ":: → FF02::1:FF12:3456",
      "text": "**Duplicate Address Detection.** The PC asks about its *own* tentative address. The source is `::` (unspecified) because it doesn't own an address yet. Only a host that already holds an address ending `12:3456` listens to that solicited-node group."
    },
    {
      "note": "Silence: nobody owns it",
      "over": [
        "PC",
        "LAN"
      ],
      "states": {
        "PC": "LL ready"
      },
      "text": "No Neighbor Advertisement comes back, so the link-local address is unique. Silence *is* the confirmation."
    },
    {
      "from": "PC",
      "to": "R1",
      "label": "RS (133): any routers here?",
      "detail": "FE80::5054:ff:fe12:3456 → FF02::2",
      "text": "Rather than wait up to a few minutes for the next periodic RA, the PC sends a **Router Solicitation** to all-routers, `FF02::2`."
    },
    {
      "from": "R1",
      "to": "PC",
      "label": "RA (134): prefix 2001:db8:a:b::/64",
      "detail": "FE80::1 → FF02::1, flags A=1 M=0 O=0",
      "dashed": true,
      "tone": "good",
      "text": "R1 answers with a **Router Advertisement**: the on-link prefix, its length, and the flags. A = 1 means \"build your own address\". The RA's source, **FE80::1**, becomes the PC's default gateway. DHCPv6 never hands out a gateway; the RA always does."
    },
    {
      "from": "PC",
      "to": "PC",
      "label": "Prefix + interface ID",
      "detail": "2001:db8:a:b:5054:ff:fe12:3456",
      "states": {
        "PC": "GUA tentative"
      },
      "text": "The PC glues the /64 prefix from the RA to its own 64-bit interface ID. No server is involved, so nothing records who holds what: that's the *stateless* part."
    },
    {
      "from": "PC",
      "to": "LAN",
      "label": "NS (135): DAD for the new address",
      "detail": ":: → FF02::1:FF12:3456",
      "text": "DAD runs again for the global address. Notice the **same** solicited-node group: both addresses end in the same 24 bits, `12:3456`."
    },
    {
      "note": "Address in use",
      "over": [
        "PC"
      ],
      "states": {
        "PC": "GUA preferred"
      },
      "tone": "good",
      "text": "Silence again, so the PC uses **2001:db8:a:b:5054:ff:fe12:3456** with gateway **FE80::1**. If the RA had M = 1, the PC would ask a DHCPv6 server for its address instead; with O = 1 it would ask DHCPv6 only for extras such as DNS."
    }
  ]
}
```

### The RA Flags Decide Everything

An RA carries flags that tell hosts how much autonomy they have:

| Flag | Meaning | Result |
|------|---------|--------|
| **A** = 1 | Autonomous | Build your own address by SLAAC |
| **M** = 1 | Managed | Get your address from **stateful DHCPv6** |
| **O** = 1 | Other config | Address by SLAAC, but get DNS etc. from DHCPv6 |

**Why keep DHCPv6 at all if SLAAC works?** Because SLAAC answers "what address should I use?" but originally said nothing about **DNS servers**, and it keeps **no record** of who has what. An enterprise that must audit which device held which address — for security logs or compliance — needs the central ledger that only stateful DHCPv6 provides. *SLAAC optimizes for zero administration; DHCPv6 optimizes for accountability. The M and O flags let you pick per network.*

```
R1# show ipv6 neighbors           ! the NDP cache — IPv6's ARP table
R1# show ipv6 interface gi0/0     ! link-local, global, joined multicast groups
R1(config-if)# ipv6 nd prefix 2001:db8:a:b::/64 no-autoconfig   ! clear the A flag
```

**📝 Exam-style questions — 13.8**

**Q1.** A host needs the MAC address of neighbor `2001:db8:1::25:1a3c:7f02`. To which address does it send the Neighbor Solicitation?

- **A.** `FF02::1:FF3C:7F02`
- **B.** `FF02::1:FF1A:3C7F`
- **C.** `FF02::2:FF3C:7F02`
- **D.** `FF02::1`

<details><summary>Answer</summary>

**Answer: A.** The solicited-node address is `FF02::1:FF` followed by the target's last 24 bits. The last 24 bits (6 hex digits) of `...1a3c:7f02` are `3c:7f02`. **Why not the others:** B took the wrong 24 bits; it's always the lowest 24. C uses `FF02::2`, which isn't the solicited-node prefix (FF02::2 on its own is all-routers). D is all-nodes, which would wake every host on the link, just like an ARP broadcast. Avoiding that is the whole point of solicited-node multicast.
</details>

**Q2.** A host has just booted and wants to find the routers on its link right away. Which NDP message does it send, and to which address?

- **A.** A Router Solicitation to `FF02::1`
- **B.** A Router Solicitation to `FF02::2`
- **C.** A Router Advertisement to `FF02::2`
- **D.** A Neighbor Solicitation to `FF02::2`

<details><summary>Answer</summary>

**Answer: B.** A Router Solicitation (ICMPv6 type 133) asks "any routers here?", so it goes to the all-routers group, `FF02::2`. Routers answer with an RA (type 134). **Why not the others:** A, `FF02::1` is all-nodes; the question is only for routers. C, hosts don't send RAs; routers do. D, a Neighbor Solicitation (135) resolves one specific address to a MAC (ARP's job) or checks for duplicates; it isn't how you find routers.
</details>

**Q3.** A network team wants hosts to build their own addresses with SLAAC but learn their DNS server from a DHCPv6 server. Which RA flags do this?

- **A.** M = 1
- **B.** A = 1, O = 1, M = 0
- **C.** A = 0, O = 0, M = 0
- **D.** A = 1, O = 0, M = 0

<details><summary>Answer</summary>

**Answer: B.** A = 1 says "build your own address", and O = 1 ("other config") says "ask DHCPv6 for the extras like DNS". M stays 0 because the address doesn't come from DHCPv6. **Why not the others:** A, M = 1 tells hosts to get their *address* from stateful DHCPv6. C turns off SLAAC and tells hosts nothing useful. D is pure SLAAC with no DHCPv6 at all, so hosts would only learn DNS if the RA itself carried it.
</details>

**Q4.** During SLAAC, a host sends a Neighbor Solicitation for its own tentative address and gets no reply. What does the host conclude?

- **A.** No router is present, so it must use a link-local address only
- **B.** The address is unique on the link, so the host can use it
- **C.** The address is a duplicate, so it must generate another one
- **D.** The DHCPv6 server is down

<details><summary>Answer</summary>

**Answer: B.** This is Duplicate Address Detection (DAD). The host asks "does anyone already have this address?", and silence means nobody does. **Why not the others:** A, DAD has nothing to do with finding routers; that's RS and RA. C is the opposite: a duplicate would *answer* with a Neighbor Advertisement. D, DAD doesn't involve DHCPv6.
</details>

---

<a name="chapter-14"></a>
# Chapter 14: Routers & Routing — Finding the Path

## 14.1 What a Router Does

A **switch** moves data **inside** one network. A **router** moves data **between** different networks. It's the **GPS** of networking — it knows the paths to faraway networks and picks the best one.

A router sits between two different networks — say `192.168.1.0/24` on one side
and `10.0.0.0/24` on the other — with an interface in each. It's the only device
that knows how to reach **both**, so anything crossing between them goes through it.

**📝 Exam-style questions — 14.1**

**Q1.** Which device forwards packets between different IP networks and stops broadcasts from crossing between them?

- **A.** Hub
- **B.** Layer 2 switch
- **C.** Router
- **D.** Wireless access point

<details><summary>Answer</summary>

**Answer: C.** A router joins different networks, picks a path using the destination IP address, and doesn't forward broadcasts, so every router interface is the edge of a broadcast domain. **Why not the others:** A, a hub just repeats bits out every port. B, a Layer 2 switch moves frames *within* one network (one VLAN) and floods broadcasts to every port in it. D, an AP bridges wireless clients onto the wired LAN; it doesn't route between networks.
</details>

**Q2.** Which statement about a router's interfaces is true?

- **A.** All of a router's interfaces must be in the same IP subnet.
- **B.** Each router interface connects to a different IP subnet.
- **C.** Routers forward broadcasts out every interface by default.
- **D.** Routers forward packets based on the destination MAC address.

<details><summary>Answer</summary>

**Answer: B.** A router's whole job is to sit *between* networks, so each interface is in its own subnet (IOS even refuses an address that overlaps another interface's subnet). **Why not the others:** A is the opposite of what a router is for. C, routers deliberately *stop* broadcasts. D, routers forward on the destination *IP* address; the MAC address only gets a frame to the router across one link.
</details>

## 14.2 The Routing Table

Every router keeps a **routing table** — a list of known networks and how to reach them. When a packet arrives, the router looks up the destination and forwards it toward the right next hop.

```
R1# show ip route
C   192.168.1.0/24 is directly connected, Gi0/0
C   10.0.0.0/24    is directly connected, Gi0/1
S   172.16.0.0/24  [1/0] via 10.0.0.2
O   192.168.5.0/24 [110/2] via 10.0.0.2
```

**The letters on the left tell you how the route was learned:**
- **C** = Connected (a network directly plugged into the router).
- **L** = Local (the router's own interface IP).
- **S** = Static (typed in by an admin).
- **O** = OSPF (learned dynamically).
- **D** = EIGRP. **R** = RIP. **B** = BGP.

**📝 Exam-style questions — 14.2**

**Q1.** Refer to the exhibit. Which statement is true?

```
R1# show ip route
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.0.0.0/24 is directly connected, GigabitEthernet0/1
L        10.0.0.1/32 is directly connected, GigabitEthernet0/1
S     172.16.0.0/16 [1/0] via 10.0.0.2
O     192.168.5.0/24 [110/2] via 10.0.0.2, 00:12:44, GigabitEthernet0/1
```

- **A.** 10.0.0.1/32 is a host on the 10.0.0.0/24 subnet that R1 learned through ARP.
- **B.** 10.0.0.1/32 is R1's own IP address on GigabitEthernet0/1.
- **C.** An administrator typed in the route to 192.168.5.0/24.
- **D.** The route to 172.16.0.0/16 has an administrative distance of 0.

<details><summary>Answer</summary>

**Answer: B.** An **L** (local) route is a /32 for the router's own interface address. It tells R1 "packets to this address are for me". **Why not the others:** A, ARP entries live in the ARP table, never in the routing table. C, the code **O** means OSPF learned it; a typed-in route would be **S**. D, the `[1/0]` shows AD 1, the default for a static route; AD 0 is for connected routes.
</details>

**Q2.** In the route `O 192.168.5.0/24 [110/2] via 10.0.0.2`, what do 110 and 2 mean?

- **A.** 110 is the administrative distance and 2 is the metric.
- **B.** 110 is the metric and 2 is the administrative distance.
- **C.** 110 is the OSPF process ID and 2 is the area number.
- **D.** 110 is the hop count and 2 is the number of equal-cost paths.

<details><summary>Answer</summary>

**Answer: A.** The brackets always read `[administrative distance/metric]`. 110 is OSPF's default AD, and 2 is the OSPF cost to reach the network. **Why not the others:** B has them backwards. C, the process ID and area never appear in the brackets. D, OSPF doesn't count hops, and equal-cost paths show as extra `via` lines, not a number in the brackets.
</details>

**Q3.** Which code letter marks a route learned through EIGRP in `show ip route`?

- **A.** E
- **B.** D
- **C.** B
- **D.** R

<details><summary>Answer</summary>

**Answer: B.** EIGRP routes show as **D** (think "DUAL", EIGRP's algorithm) and EIGRP externals as **D EX**. **Why not the others:** A, E was used for the old EGP protocol, so EIGRP had to take a different letter. C, B is BGP. D, R is RIP.
</details>

## 14.3 How a Router Decides: Longest Prefix Match

If two routes could match a destination, the router picks the **most specific** one — the one with the **longest prefix** (biggest /number).

**Example:** A packet to 192.168.1.55 could match:
- `192.168.0.0/16` (broad)
- `192.168.1.0/24` (specific) ← **winner!** More exact.

**Story Time 📖:** It's like directions. "Go to California" vs. "Go to 123 Maple St, San Diego, CA." The **more specific** address gets you exactly where you need to go, so the router prefers it.

**Why does "most specific" win — why is that the right rule?** Because a longer prefix means the route is describing a **smaller, more exact group of addresses**, which almost always means someone configured it *deliberately* for that specific destination. Think about the directions analogy again: "Go to California" (a /16, broad) and "Go to 123 Maple St, San Diego" (a /24, exact) might *both* technically be correct — but the exact one reflects real, specific knowledge of where you're going. The broad route is a fallback for "everything in this general area," while the specific route is "I know *exactly* where this one goes." A router honoring the most specific match means it uses the **most precise information available** and only falls back to broader routes when it has nothing better. *The ultimate example is the default route (0.0.0.0/0) — the least specific route possible ("everywhere else") — which only wins when literally nothing else matches.* That's why longest-prefix-match and default routes work together so cleanly.

```diagram
{
  "type": "topology",
  "title": "Longest prefix match: four packets, four different exits",
  "caption": "R1 has four routes that overlap. Press **Next** to send packets and see which line of the routing table catches each one.",
  "nodes": [
    {
      "id": "PC",
      "kind": "host",
      "x": 0,
      "y": 1.65,
      "sub": "192.168.1.10"
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 1.7,
      "y": 1.65,
      "sub": "the decision"
    },
    {
      "id": "R2",
      "kind": "router",
      "x": 4,
      "y": 0,
      "sub": "172.16.1.1"
    },
    {
      "id": "R3",
      "kind": "router",
      "x": 4,
      "y": 1.1,
      "sub": "172.16.2.2"
    },
    {
      "id": "R4",
      "kind": "router",
      "x": 4,
      "y": 2.2,
      "sub": "172.16.3.3"
    },
    {
      "id": "ISP",
      "kind": "cloud",
      "x": 4,
      "y": 3.3,
      "sub": "203.0.113.1"
    }
  ],
  "links": [
    {
      "a": "PC",
      "b": "R1"
    },
    {
      "a": "R1",
      "b": "R2",
      "label": "10.0.0.0/8"
    },
    {
      "a": "R1",
      "b": "R3",
      "label": "10.1.0.0/16"
    },
    {
      "a": "R1",
      "b": "R4",
      "label": "10.1.1.0/24"
    },
    {
      "a": "R1",
      "b": "ISP",
      "label": "0.0.0.0/0"
    }
  ],
  "steps": [
    {
      "title": "1. Four routes that overlap",
      "text": "R1's table holds `10.0.0.0/8` via R2, `10.1.0.0/16` via R3, `10.1.1.0/24` via R4 and a default `0.0.0.0/0` via the ISP. They overlap: every 10.1.1.x address is inside all four. That's normal. The rule that settles it is **the longest matching prefix wins**.",
      "focus": [
        "R1"
      ]
    },
    {
      "title": "2. To 10.1.1.77: /24 wins",
      "text": "10.1.1.77 matches **all four** routes. The longest prefix is **/24**, the most specific knowledge R1 has, so the packet goes to **R4**.",
      "nodes": {
        "R4": {
          "badge": "/24 wins",
          "tone": "good"
        }
      },
      "links": {
        "R1-R4": "active"
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1",
            "R4"
          ],
          "label": "to 10.1.1.77"
        }
      ]
    },
    {
      "title": "3. To 10.1.200.1: /16 wins",
      "text": "10.1.200.1 isn't in 10.1.1.0/24 (that only runs to 10.1.1.255). It matches /16, /8 and /0, and **/16** is the longest, so it goes to **R3**.",
      "nodes": {
        "R4": null,
        "R3": {
          "badge": "/16 wins",
          "tone": "good"
        }
      },
      "links": {
        "R1-R4": null,
        "R1-R3": "active"
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1",
            "R3"
          ],
          "label": "to 10.1.200.1"
        }
      ]
    },
    {
      "title": "4. To 10.9.9.9: /8 wins",
      "text": "Only `10.0.0.0/8` and the default match. **/8** beats **/0**, so the packet goes to **R2**.",
      "nodes": {
        "R3": null,
        "R2": {
          "badge": "/8 wins",
          "tone": "good"
        }
      },
      "links": {
        "R1-R3": null,
        "R1-R2": "active"
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1",
            "R2"
          ],
          "label": "to 10.9.9.9"
        }
      ]
    },
    {
      "title": "5. To 8.8.8.8: only the default matches",
      "text": "Nothing in 10.x matches, so the **default route** (/0, zero bits to match) catches it. The default is the last resort: it only wins when nothing more specific exists.",
      "nodes": {
        "R2": null,
        "ISP": {
          "badge": "/0 wins",
          "tone": "good"
        }
      },
      "links": {
        "R1-R2": null,
        "R1-ISP": "active"
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1",
            "ISP"
          ],
          "label": "to 8.8.8.8"
        }
      ]
    },
    {
      "title": "6. Take the default away",
      "text": "Delete the default route and send to 8.8.8.8 again. Now **nothing** matches, so R1 **drops** the packet and sends the PC an ICMP *destination unreachable*. Routers never flood packets they can't place.",
      "nodes": {
        "ISP": {
          "state": "dim"
        },
        "R1": {
          "badge": "drop",
          "tone": "bad"
        }
      },
      "links": {
        "R1-ISP": "down"
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1"
          ],
          "label": "to 8.8.8.8",
          "tone": "bad"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 14.3**

**Q1.** Refer to the exhibit. R1 receives a packet for 10.1.2.5. Which next hop does it use?

```
R1# show ip route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
      10.0.0.0/8 is variably subnetted, 3 subnets, 3 masks
O        10.0.0.0/8 [110/30] via 172.16.1.1, 00:05:12, GigabitEthernet0/1
O        10.1.0.0/16 [110/20] via 172.16.2.2, 00:05:12, GigabitEthernet0/2
O        10.1.1.0/24 [110/10] via 172.16.3.3, 00:05:12, GigabitEthernet0/3
```

- **A.** 203.0.113.1
- **B.** 172.16.1.1
- **C.** 172.16.2.2
- **D.** 172.16.3.3

<details><summary>Answer</summary>

**Answer: C.** 10.1.2.5 matches 0.0.0.0/0, 10.0.0.0/8 and 10.1.0.0/16. It does *not* match 10.1.1.0/24, which only covers 10.1.1.0–10.1.1.255. Of the matches, /16 is the longest, so the packet goes to 172.16.2.2. **Why not the others:** A, the default route only wins when nothing more specific matches. B, /8 matches but is less specific than /16. D, 10.1.2.5 isn't inside 10.1.1.0/24, so that route doesn't apply however tempting "10.1" looks.
</details>

**Q2.** Refer to the exhibit. R1 receives a packet for 172.16.10.5. What does it do?

```
R1# show ip route
      172.16.0.0/16 is variably subnetted, 2 subnets, 2 masks
D        172.16.0.0/16 [90/30720] via 10.1.1.2, 00:10:01, GigabitEthernet0/0
O        172.16.10.0/24 [110/3] via 10.2.2.2, 00:08:44, GigabitEthernet0/1
```

- **A.** Forwards it to 10.1.1.2, because EIGRP's AD of 90 beats OSPF's 110
- **B.** Forwards it to 10.2.2.2, because 172.16.10.0/24 is the longest matching prefix
- **C.** Load-balances it across both next hops
- **D.** Drops it, because the two routes conflict

<details><summary>Answer</summary>

**Answer: B.** These are two *different* prefixes, so both sit in the table and the router simply picks the longest match: /24 beats /16. **Why not the others:** A, AD only decides between routes to the *exact same* prefix and length. It never overrides longest match. C, load balancing needs equal-cost routes to the same prefix from the same source. D, overlapping routes aren't a conflict; they're normal, and longest match sorts them out.
</details>

**Q3.** A router has no default route. A packet arrives for 192.0.2.50, and no route in the table matches it. What happens?

- **A.** The router floods the packet out every interface.
- **B.** The router drops the packet and may send an ICMP Destination Unreachable back to the source.
- **C.** The router sends the packet out the interface with the lowest metric.
- **D.** The router sends an ARP request for 192.0.2.50 on every interface.

<details><summary>Answer</summary>

**Answer: B.** No match and no default route means the router has nowhere to send it, so it drops the packet. It normally tells the sender with an ICMP "destination unreachable". **Why not the others:** A, flooding unknown destinations is what a *switch* does with unknown MACs; routers never flood. C, metrics only compare routes that match. D, a router only ARPs for addresses on its directly connected subnets.
</details>

## 14.4 Administrative Distance (Who to Trust)

If a router learns about the **same** network from **two different sources**, which does it believe? It uses **Administrative Distance (AD)** — a **trust score** where **lower = more trusted**.

| Source | AD (trust) |
|--------|-----------|
| Connected | 0 (most trusted) |
| Static | 1 |
| EIGRP | 90 |
| OSPF | 110 |
| RIP | 120 |
| Unknown/unreachable | 255 (never used) |

**Memory trick:** Lower AD = "closer to the truth." A directly connected network (AD 0) is undeniable — you can see it! A guess from RIP (AD 120) is less trusted.

**Why do we even need AD — and why these specific rankings?** Because a router might hear about the same destination from *multiple* sources at once (a static route AND OSPF AND RIP), and those sources can **disagree**. The router needs a consistent tie-breaker to decide who to believe. AD is that tie-breaker, and the rankings reflect **how trustworthy each source's information is**:

- **Connected = 0 (total certainty).** The network is *physically plugged into this router*. There's no guessing — the router can literally see the wire. You can't get more trustworthy than "I'm directly attached to it," so it wins over everything.
- **Static = 1 (a human said so).** An administrator *deliberately typed* this route. The logic is "a human's explicit instruction should override an automatic protocol's guess," so static beats the routing protocols. (It's 1, not 0, only because a real connected link is even more certain.)
- **The protocols (EIGRP 90, OSPF 110, RIP 120)** are automatic and can be wrong or slow to update, so they're trusted less than a human's static route. Among *them*, the ranking reflects how smart the protocol is: **EIGRP** (90) uses rich info (bandwidth + delay) and is very reliable; **OSPF** (110) is also smart (full map); **RIP** (120) is the dumbest (just counts hops), so it's trusted least. *Better information = lower number = more trust.*

*So AD answers "WHO do I believe?" It's about the credibility of the messenger.* Note this is different from the next concept, which answers "WHICH PATH is best?" — keep them separate!

```diagram
{
  "type": "compare",
  "title": "Same prefix, four sources: who does R1 believe?",
  "prompt": "R1 has heard about **172.16.50.0/24** four ways. Lowest administrative distance goes in the routing table; the metric doesn't matter here, because metrics from different protocols can't be compared. Try setting EIGRP's AD to **255** (untrusted, never used) to act out EIGRP failing, or the static route's AD to **1** to make it beat everything.",
  "winner": "Installed route",
  "fields": [
    {
      "id": "ad",
      "label": "Administrative distance",
      "kind": "number",
      "rule": "lowest",
      "ineligible": 255
    },
    {
      "id": "metric",
      "label": "Metric (not compared)",
      "kind": "number",
      "rule": "context"
    }
  ],
  "candidates": [
    {
      "label": "EIGRP via 10.0.1.2",
      "values": {
        "ad": 90,
        "metric": 3072
      }
    },
    {
      "label": "OSPF via 10.0.2.2",
      "values": {
        "ad": 110,
        "metric": 20
      }
    },
    {
      "label": "RIP via 10.0.3.2",
      "values": {
        "ad": 120,
        "metric": 1
      }
    },
    {
      "label": "Floating static via 10.0.4.2",
      "values": {
        "ad": 200,
        "metric": 0
      }
    }
  ]
}
```

**📝 Exam-style questions — 14.4**

**Q1.** R1 learns 10.5.0.0/24 from EIGRP (internal), OSPF and RIP at the same time. Which route goes into the routing table?

- **A.** The OSPF route
- **B.** The EIGRP route
- **C.** The RIP route
- **D.** All three, load-balanced

<details><summary>Answer</summary>

**Answer: B.** Same prefix, different sources, so administrative distance decides, and lowest wins: internal EIGRP 90, OSPF 110, RIP 120. **Why not the others:** A and C lose on AD; they stay in their own protocol's database as backups but aren't installed. D, IOS never load-balances across different routing protocols; one source wins.
</details>

**Q2.** Which two default administrative distances are correct on a Cisco router? (Choose two.)

- **A.** OSPF: 110
- **B.** eBGP: 20
- **C.** RIP: 100
- **D.** Internal EIGRP: 170
- **E.** Static route: 0

<details><summary>Answer</summary>

**Answer: A, B.** OSPF is 110, and external BGP is 20, which makes routes learned from another AS more trusted than any IGP's (iBGP is 200). **Why not the others:** C, RIP is 120. D, internal EIGRP is 90; 170 is *external* EIGRP (routes redistributed into EIGRP). E, a static route is 1; only connected routes are 0.
</details>

**Q3.** What happens to a route whose administrative distance is 255?

- **A.** It is preferred over every other route.
- **B.** It is installed only if no connected route exists.
- **C.** It is never installed in the routing table.
- **D.** It is used only for load balancing.

<details><summary>Answer</summary>

**Answer: C.** AD 255 means "I don't believe this source at all", so the router never installs the route. **Why not the others:** A, lower AD is preferred, so 255 is the *least* trusted value possible. B and D describe behaviour that AD 255 doesn't have; such a route can never enter the table at all.
</details>

## 14.5 Metric (Which Path Within One Protocol)

If one routing protocol knows **two paths** to the same place, it uses a **metric** to pick the best. Each protocol measures differently:
- **RIP:** hop count (fewest routers).
- **OSPF:** cost (based on bandwidth — faster links preferred).
- **EIGRP:** bandwidth + delay.

**Why is metric SEPARATE from Administrative Distance — don't they do the same thing?** No, and keeping them straight is a classic exam point. They answer two *different* questions, in order:

1. **AD picks the SOURCE first** ("who do I trust most?"). If both OSPF and a static route describe a destination, AD decides which routing *method* wins — before metric is even considered.
2. **Metric picks the PATH within that winning source** ("of the routes from my trusted source, which physical path is best?").

*Think of planning a trip:* **AD** is choosing *which navigation app* to trust (the reliable one vs. the flaky one). **Metric** is that chosen app then picking the *best route* among several it found. You pick the app first, then the app picks the road. You never compare a road from one app against the trust-level of another app — different questions, done in sequence.

**Why do different protocols use different metrics?** Because they were designed with different levels of "smart." **RIP** just counts routers (hops) — simple, but dumb: it would happily pick a 1-hop path over a slow modem instead of a 2-hop path over gigabit fiber, because it only counts hops, not speed! **OSPF** fixed this by measuring **bandwidth** (cost), so it prefers faster links even if they have more hops. **EIGRP** goes further, blending bandwidth *and* delay. *So the metric a protocol uses tells you how cleverly it judges "best" — and it's a big reason OSPF and EIGRP are preferred over old RIP.*

**📝 Exam-style questions — 14.5**

**Q1.** R1 learns 10.9.9.0/24 from OSPF with a cost of 30, and from RIP with a hop count of 1. Which route does R1 install?

- **A.** The RIP route, because 1 is lower than 30
- **B.** The OSPF route, because OSPF's administrative distance is lower
- **C.** Both, because the metrics can't be compared
- **D.** Neither, because the metrics conflict

<details><summary>Answer</summary>

**Answer: B.** Two different protocols means AD decides first: OSPF 110 beats RIP 120. Metric is never compared across protocols. A hop count and an OSPF cost measure completely different things. **Why not the others:** A compares a RIP hop count with an OSPF cost, which is apples to oranges. C, it's true that the metrics can't be compared, but that's exactly why AD picks *one*. D, nothing conflicts; AD settles it.
</details>

**Q2.** RIP knows two paths to a network: one hop over a 1.544 Mbps T1, or two hops over 1 Gbps links. Which path does RIP choose?

- **A.** The two-hop gigabit path, because it's faster
- **B.** The one-hop T1 path, because it has fewer hops
- **C.** Both paths equally
- **D.** Whichever path it learned first

<details><summary>Answer</summary>

**Answer: B.** RIP's metric is hop count only, so one hop beats two even though that hop is about 650 times slower. That's the weakness OSPF's bandwidth-based cost fixes. **Why not the others:** A is what OSPF would choose, not RIP. C, RIP only load-balances paths with *equal* hop counts. D, RIP picks by metric, not by arrival order.
</details>

**Q3.** OSPF finds two paths to 10.20.0.0/24, each with a total cost of 20. What does the router do by default?

- **A.** Installs only the path through the neighbor with the highest router ID
- **B.** Installs both and load-balances across them
- **C.** Installs neither until one path's cost changes
- **D.** Installs the path it learned first and keeps the other as a backup only

<details><summary>Answer</summary>

**Answer: B.** Equal-cost paths from the same protocol all go into the table (ECMP), and traffic is shared across them. OSPF on IOS installs up to four by default. You'd see two `via` lines under the one route. **Why not the others:** A, router ID breaks ties in elections, not in path selection. C, a tie isn't an error. D, keeping only one is what happens when costs *differ*.
</details>

## 14.6 The Router's Boot Process & Interfaces

Routers boot like this: **POST** (self-test) → load **IOS** → load **config**. Router interfaces are **shut down by default** — you must turn them on with `no shutdown` and give them an IP:

```
R1(config)# interface gi0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# description Link to LAN
R1(config-if)# no shutdown              ! turn the interface ON
```

Check interfaces quickly:

```
R1# show ip interface brief
Interface   IP-Address    OK? Method Status  Protocol
Gi0/0       192.168.1.1   YES manual up      up
Gi0/1       10.0.0.1      YES manual up      up
```

"up / up" means the cable is good (Layer 1) **and** the protocol is working (Layer 2). "administratively down" means someone forgot `no shutdown`.

**📝 Exam-style questions — 14.6**

**Q1.** Refer to the exhibit. Users on the LAN connected to Gi0/2 can't reach anything. What fixes the problem?

```
R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     192.168.1.1     YES manual up                    up
GigabitEthernet0/1     10.0.0.1        YES manual up                    up
GigabitEthernet0/2     172.16.0.1      YES manual administratively down down
```

- **A.** Replace the cable on Gi0/2
- **B.** Enter `no shutdown` on Gi0/2
- **C.** Re-enter the IP address on Gi0/2
- **D.** Configure `clock rate` on Gi0/2

<details><summary>Answer</summary>

**Answer: B.** "administratively down" means the interface is shut down in the config. Router interfaces start that way, so someone forgot `no shutdown`. **Why not the others:** A, a bad or missing cable shows `down down`, not "administratively down". C, the address is already there. D, `clock rate` is for the DCE end of a serial link, not Ethernet.
</details>

**Q2.** An interface shows Status `up` and Protocol `down`. What does this most likely mean?

- **A.** The cable is unplugged.
- **B.** The interface has been shut down by an administrator.
- **C.** Layer 1 is working, but there's a Layer 2 problem such as an encapsulation mismatch.
- **D.** The interface is fully working.

<details><summary>Answer</summary>

**Answer: C.** Status is Layer 1 (a signal is there) and Protocol is Layer 2 (the data link protocol is working). Up/down means the wire is fine but the two ends can't agree, for example HDLC on one end of a serial link and PPP on the other. **Why not the others:** A would show down/down. B would show administratively down/down. D needs up/up.
</details>

**Q3.** In what order does a Cisco router start up?

- **A.** Load the startup configuration, run POST, load IOS
- **B.** Run POST, load the startup configuration, load IOS
- **C.** Run POST, load IOS, load the startup configuration
- **D.** Load IOS, run POST, load the startup configuration

<details><summary>Answer</summary>

**Answer: C.** First the hardware checks itself (POST, the power-on self-test). Then the bootstrap finds and loads IOS, and IOS applies the startup configuration from NVRAM. **Why not the others:** A and D load software before the hardware has been tested. B loads the config before IOS, but the config is a list of IOS commands, so IOS has to be running first to read it.
</details>

---

## 14.7 First Hop Redundancy (FHRP & HSRP) — A Backup for the Default Gateway

![HSRP: two routers behind one virtual gateway](images/hsrp.png)

Back in section 11.6 we learned that every device needs a **default gateway** — the router it hands packets to when the destination isn't local. Now let's ask an uncomfortable question about that arrangement.

**What happens when the default gateway dies?**

Picture PC1, PC2 and PC3 on a switch, all configured with the same default
gateway: **R1 at 192.168.1.1**, which reaches the internet.

Now R1 dies. Every PC keeps sending to `192.168.1.1` — and nothing answers. The
entire subnet is offline. 😱

Here's the painful part: **you can add a second router, and it doesn't help.** Suppose you install R2 with address `192.168.1.2` as a backup. R2 is powered on, healthy, and perfectly capable of forwarding traffic — but every PC on the subnet was configured (by DHCP or by hand) to use `192.168.1.1`. They will keep sending frames to a router that no longer exists. The backup sits there unused while everyone is offline.

**Why don't the PCs just switch to the other router?** Because a PC's default gateway is a **single, static setting**. A PC has no protocol for discovering "my gateway died, let me find another one" — that's simply not part of how hosts work. You could reconfigure every PC by hand, or wait for DHCP leases to renew with a new gateway, but both take far too long during an outage.

So the problem is really this: *the hosts can't change, so **the routers must pretend to be one router**.*

### The Solution: A Virtual Router

**FHRP (First Hop Redundancy Protocol)** is the family of protocols that solves this. Two or more real routers share a **virtual IP address** and a **virtual MAC address**. The PCs use that virtual IP as their default gateway and never know — or care — which physical router is actually doing the work.

Two real routers share one **virtual identity**:

| Device | Address | Role |
|---|---------|------|
| **The virtual router** | IP `192.168.1.1`, MAC `0000.0c07.acXX` | What every PC is configured to use |
| **R1** | 192.168.1.2 | **Active** — actually forwarding |
| **R2** | 192.168.1.3 | **Standby** — watching, ready |

When R1 fails, **R2 takes over that same virtual IP *and* MAC**. The PCs keep
sending to `192.168.1.1` and notice nothing at all. ✨

**Why does the virtual MAC address matter as much as the virtual IP?** This is the detail that makes the whole thing work invisibly, and it's a favorite exam point. Remember how a PC actually sends a packet off-subnet: it ARPs for the gateway's IP, caches the resulting **MAC address**, and addresses its frames to that MAC. If failover only moved the *IP*, every PC would still be sending frames to R1's old MAC — stuck in their ARP caches for minutes — and traffic would keep flowing to a dead router.

By moving the **virtual MAC** to the standby router as well, the frames PCs are already sending arrive at the new active router **unchanged**. No ARP cache needs to expire, no host needs to relearn anything. *The hosts genuinely cannot tell that anything happened — which is the entire goal.*

### The Three FHRPs

| Protocol | Origin | Roles | Notes |
|----------|--------|-------|-------|
| **HSRP** | Cisco proprietary | Active / Standby | The Cisco classic — know this one best |
| **VRRP** | Open standard (RFC) | Master / Backup | Same idea, vendor-neutral |
| **GLBP** | Cisco proprietary | AVG / AVF | Also **load balances** across routers |

**Why does GLBP exist if HSRP already works?** Because HSRP and VRRP are **active/standby** — the backup router forwards *nothing* while the primary is healthy. You bought two routers and use one. GLBP shares the load across several routers at once by handing out **different virtual MACs** to different PCs when they ARP, so traffic naturally splits. *You can get similar load sharing from HSRP by running two groups and making each router active for one — a common real-world trick.*

### How HSRP Elects Its Active Router

Routers in the same **HSRP group** exchange hello messages (every 3 seconds by default) and elect an active router:

1. **Highest priority wins** (default 100, range 0–255).
2. **Tie? Highest interface IP address wins.**

If hellos stop arriving for the **hold time** (10 seconds by default), the standby declares the active router dead and takes over.

```diagram
{
  "type": "compare",
  "title": "Which router becomes HSRP active?",
  "prompt": "Three routers share HSRP group 1 on the 192.168.1.0/24 LAN. Highest priority wins; a tie goes to the highest interface IP. Only one is active and one standby; any others just listen. Try giving R2 priority 110 to tie with R1, and watch the IP address decide. (Remember: a router only takes over from a running active router if it has `preempt`.)",
  "places": [
    "Active",
    "Standby"
  ],
  "fields": [
    {
      "id": "prio",
      "label": "HSRP priority",
      "kind": "number",
      "rule": "highest"
    },
    {
      "id": "ip",
      "label": "Interface IP",
      "kind": "ip",
      "rule": "highest"
    }
  ],
  "candidates": [
    {
      "label": "R1",
      "values": {
        "prio": 110,
        "ip": "192.168.1.2"
      }
    },
    {
      "label": "R2",
      "values": {
        "prio": 100,
        "ip": "192.168.1.3"
      }
    },
    {
      "label": "R3",
      "values": {
        "prio": 100,
        "ip": "192.168.1.4"
      }
    }
  ]
}
```

### Configuring HSRP

```
R1(config)# interface gi0/0
R1(config-if)# ip address 192.168.1.2 255.255.255.0
R1(config-if)# standby 1 ip 192.168.1.1        ! the VIRTUAL IP the PCs use
R1(config-if)# standby 1 priority 110          ! higher = preferred active
R1(config-if)# standby 1 preempt               ! take the job back after recovery

R2(config)# interface gi0/0
R2(config-if)# ip address 192.168.1.3 255.255.255.0
R2(config-if)# standby 1 ip 192.168.1.1        ! SAME virtual IP, SAME group
R2(config-if)# standby 1 preempt
```

**Why is `preempt` needed — and what breaks without it?** Without it, a recovered router **stays standby forever**. Picture it: R1 (priority 110) is active, it reboots, R2 takes over. R1 comes back healthy — and simply stays the backup, because HSRP won't disturb a working active router without being told to. Your carefully designed "the powerful router should be primary" plan is now silently inverted, and it stays that way until someone notices. `preempt` means *"when I'm healthy and I have the better priority, take the role back."* **Note that the router with the higher priority needs `preempt`** for this to work at all — it's the one doing the taking.

### Verifying

```
R1# show standby brief
Interface  Grp  Pri P State    Active          Standby         Virtual IP
Gi0/0      1    110 P Active   local           192.168.1.3     192.168.1.1

R1# show standby             ! full detail: timers, virtual MAC, state changes
```

Read that output as a sentence: *group 1, priority 110, P = preempt enabled, this router is **Active**, the standby is at .3, and together they present 192.168.1.1 to the world.*

**📝 Exam-style questions — 14.7**

**Q1.** R1 (HSRP priority 110, **no** `preempt`) is active and R2 (priority 100, `preempt` configured) is standby. R1 reloads, R2 becomes active, and then R1 comes back up. What happens?

- **A.** R1 becomes active again straight away, because it has the higher priority.
- **B.** R2 stays active and R1 becomes standby.
- **C.** Both routers become active.
- **D.** R1 becomes active, because R2's `preempt` makes it step down.

<details><summary>Answer</summary>

**Answer: B.** Taking the role back requires `preempt` on the router that *wants* the role, here R1, the higher-priority one. R1 has no preempt, so it waits as standby while R2 keeps forwarding. **Why not the others:** A only happens if R1 has `preempt`. C, HSRP elects exactly one active router per group. D, preempt lets a router *take* the active role when it has better priority; it never makes a router hand the role over.
</details>

**Q2.** Which virtual MAC address does HSRP version 1 use for group 1?

- **A.** `0000.0c07.ac01`
- **B.** `0000.5e00.0101`
- **C.** `0007.b400.0101`
- **D.** `0000.0c9f.f001`

<details><summary>Answer</summary>

**Answer: A.** HSRPv1 uses `0000.0c07.acXX`, where XX is the group number in hex. Group 1 gives `ac01`. **Why not the others:** B is VRRP's format (`0000.5e00.01XX`). C is GLBP's format (`0007.b400.XXYY`). D is HSRP *version 2*'s format (`0000.0c9f.fXXX`).
</details>

**Q3.** Which two statements about first hop redundancy protocols are true? (Choose two.)

- **A.** VRRP is an open standard.
- **B.** GLBP can load-balance by giving different hosts different virtual MAC addresses.
- **C.** HSRP calls its roles Master and Backup.
- **D.** HSRP's default hold time is 3 seconds.
- **E.** VRRP is Cisco proprietary.

<details><summary>Answer</summary>

**Answer: A, B.** VRRP is the vendor-neutral standard. GLBP's active virtual gateway answers ARP requests with different virtual MACs, so different hosts send to different routers at the same time. **Why not the others:** C, Master/Backup are VRRP's names; HSRP uses Active/Standby. D, 3 seconds is HSRP's *hello* time; the hold time is 10 seconds. E, it's the other way round: HSRP and GLBP are Cisco's, VRRP is the standard.
</details>

**Q4.** R1 (192.168.1.2) and R2 (192.168.1.3) are in HSRP group 10, both at the default priority, and both start at the same time. Which router becomes active?

- **A.** R1, because it has the lower IP address
- **B.** R2, because it has the higher IP address
- **C.** R1, because it was configured first
- **D.** Neither, because a tie stops the election

<details><summary>Answer</summary>

**Answer: B.** Equal priority (100), so the tie-breaker is the highest interface IP address: 192.168.1.3 wins. **Why not the others:** A has the tie-breaker backwards. C, the order you typed the config in doesn't matter. D, the IP tie-breaker means there's always a winner, because two interfaces can't share an address.
</details>

---

## 14.8 A Day in the Life of a Packet — Everything, End to End

![A packet crossing two routers: IPs constant, MACs rebuilt](images/packet_walk.png)

> 🔬 **Depth section — and the most valuable page in this book.** Every chapter so far taught one piece. This traces a single packet through all of them at once. If one idea makes the rest click, it's this one.

PC-A wants to reach a server. They're on different networks, two routers apart.

The path, end to end:

| Device | Addresses |
|--------|-----------|
| **PC-A** | IP `192.168.1.10`, MAC `aaaa.1111` |
| **R1** | Gi0 `192.168.1.1` (MAC `bbbb.2222`) · Gi1 `10.1.1.1` |
| **R2** | Gi0 `10.1.1.2` (MAC `cccc.3333`) · Gi1 `10.0.0.1` |
| **SERVER** | IP `10.0.0.50`, MAC `dddd.4444` |

PC-A connects to a switch, which uplinks to R1; R1 links to R2; R2 reaches the
server's network.

```diagram
{
  "type": "topology",
  "title": "One packet, two routers: what changes and what doesn't",
  "caption": "The same addresses as the table above. Press **Next** to walk PC-A's packet to the server and watch the frame get rebuilt at every router.",
  "nodes": [
    {
      "id": "PCA",
      "kind": "host",
      "x": 0,
      "y": 0,
      "label": "PC-A",
      "sub": "192.168.1.10"
    },
    {
      "id": "SW",
      "kind": "switch",
      "x": 1.4,
      "y": 0,
      "label": "SW1"
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 2.8,
      "y": 0,
      "sub": "bbbb.2222"
    },
    {
      "id": "R2",
      "kind": "router",
      "x": 2.8,
      "y": 1.5,
      "sub": "cccc.3333"
    },
    {
      "id": "SRV",
      "kind": "server",
      "x": 4.2,
      "y": 1.5,
      "label": "Server",
      "sub": "10.0.0.50"
    }
  ],
  "links": [
    {
      "a": "PCA",
      "b": "SW"
    },
    {
      "a": "SW",
      "b": "R1",
      "bLabel": ".1"
    },
    {
      "a": "R1",
      "b": "R2",
      "label": "10.1.1.0/24"
    },
    {
      "a": "R2",
      "b": "SRV",
      "aLabel": ".1"
    }
  ],
  "steps": [
    {
      "title": "1. Local or remote?",
      "text": "PC-A ANDs both addresses with its mask: `192.168.1.0` is its network, `10.0.0.0` isn't. So the packet must go to the **default gateway**, 192.168.1.1 (R1). PC-A never ARPs for the server; nobody on this LAN could answer.",
      "focus": [
        "PCA"
      ],
      "nodes": {
        "PCA": {
          "badge": "remote",
          "tone": "warn"
        }
      }
    },
    {
      "title": "2. ARP for the gateway",
      "text": "PC-A needs R1's **MAC**, so it broadcasts *who has 192.168.1.1?* The switch floods the broadcast (and learns PC-A's MAC on that port).",
      "nodes": {
        "PCA": null
      },
      "packets": [
        {
          "path": [
            "PCA",
            "SW",
            "R1"
          ],
          "label": "ARP: who has .1?",
          "tone": "warn"
        }
      ]
    },
    {
      "title": "3. R1 answers",
      "text": "R1 replies with **bbbb.2222**, sent straight back to PC-A. PC-A caches it, so the next packet skips this step.",
      "packets": [
        {
          "path": [
            "R1",
            "SW",
            "PCA"
          ],
          "label": "ARP: .1 is bbbb.2222",
          "tone": "good"
        }
      ]
    },
    {
      "title": "4. The frame leaves PC-A",
      "text": "Destination **MAC** = R1 (`bbbb.2222`), destination **IP** = the server (`10.0.0.50`), TTL 64. Layer 2 says *next hop*, Layer 3 says *final destination*. The switch reads only the MAC and never looks at the IP.",
      "packets": [
        {
          "path": [
            "PCA",
            "SW",
            "R1"
          ],
          "label": "MAC bbbb.2222 TTL 64"
        }
      ]
    },
    {
      "title": "5. R1 routes and rebuilds",
      "text": "R1 strips the Ethernet header, finds `10.0.0.0/24` via 10.1.1.2 by **longest prefix match**, drops the TTL to **63**, recomputes the IP checksum, and builds a **new** frame: destination MAC R2 (`cccc.3333`), source MAC R1's outgoing interface. The IP addresses don't change.",
      "nodes": {
        "R1": {
          "badge": "TTL 64→63",
          "tone": "accent"
        }
      },
      "packets": [
        {
          "path": [
            "R1",
            "R2"
          ],
          "label": "MAC cccc.3333 TTL 63"
        }
      ]
    },
    {
      "title": "6. R2 is directly connected",
      "text": "`10.0.0.0/24` is R2's own connected network, so this time the next hop is the server itself. R2 ARPs for **10.0.0.50** and learns `dddd.4444`.",
      "nodes": {
        "R1": null,
        "R2": {
          "badge": "connected",
          "tone": "accent"
        }
      },
      "packets": [
        {
          "path": [
            "R2",
            "SRV"
          ],
          "label": "ARP: who has .50?",
          "tone": "warn"
        }
      ]
    },
    {
      "title": "7. Delivered",
      "text": "R2 drops the TTL to **62** and builds the last frame to `dddd.4444`. Across three links the packet wore three different Ethernet headers, but the source and destination IPs never changed.",
      "nodes": {
        "R2": {
          "badge": "TTL 63→62",
          "tone": "accent"
        },
        "SRV": {
          "badge": "received",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "R2",
            "SRV"
          ],
          "label": "MAC dddd.4444 TTL 62",
          "tone": "good"
        }
      ]
    },
    {
      "title": "8. The reply is a new journey",
      "text": "The server does its own local-or-remote check, sends to *its* gateway (R2), and each router routes the reply independently. If R2 had no route back to 192.168.1.0/24, the request would arrive and the reply would die: *I can reach it, but it can't reach me.*",
      "nodes": {
        "R2": null,
        "SRV": null
      },
      "packets": [
        {
          "path": [
            "SRV",
            "R2",
            "R1",
            "SW",
            "PCA"
          ],
          "label": "reply",
          "tone": "good"
        }
      ]
    }
  ]
}
```

### Step 1 — "Is this local?" (PC-A does the math)

PC-A ANDs its own address and the destination with its mask (Chapter 12):

| Address (AND `255.255.255.0`) | Result |
|-------------------------------|--------|
| `192.168.1.10` | `192.168.1.0` — **my** network |
| `10.0.0.50` | `10.0.0.0` — **different** |

Different network, so PC-A sends the frame to its **default gateway**. **This is the decision that makes everything else happen** — and note *what PC-A does not do*: it never ARPs for the server. Asking "who has 10.0.0.50?" on this segment would be pointless; nobody there can answer.

### Step 2 — ARP for the gateway (not the destination)

PC-A needs the **MAC** of 192.168.1.1. It broadcasts an ARP request; R1 replies `bbbb.2222`.

### Step 3 — The frame leaves PC-A

| Field | Value | Points at |
|-------|-------|-----------|
| L2 DST MAC | `bbbb.2222` | **R1 (router)** |
| L2 SRC MAC | `aaaa.1111` | PC-A |
| L3 SRC IP | `192.168.1.10` | PC-A |
| L3 DST IP | `10.0.0.50` | **server** |
| L3 TTL | 64 | — |

**Stare at that mismatch — it's the whole idea.** The Layer 2 address says "router," the Layer 3 address says "server." Layer 2 answers *"who's my next hop on this wire?"*; Layer 3 answers *"where is this ultimately going?"* Confusing these two is the single most common source of confusion in networking.

### Step 4 — The switch forwards (and thinks about nothing else)

The switch looks up `bbbb.2222` in its MAC table and forwards out that port (Chapter 6). It never examines the IP header. If it doesn't know the MAC, it floods — and it learns `aaaa.1111` is on the port the frame arrived from.

### Step 5 — R1 routes

R1 accepts the frame because the destination MAC is its own. It strips the Ethernet header, reads `10.0.0.50`, and consults its routing table using **longest prefix match** (14.3). Match: send to R2 at `10.1.1.2`. Then R1:

1. **Decrements the TTL** 64 → 63.
2. **Recomputes the IP header checksum** (the TTL changed).
3. **Builds a brand-new Layer 2 header** for the next link.

| Field | Was | Now | Changed? |
|-------|-----|-----|----------|
| **L2** DST MAC | `bbbb.2222` | `cccc.3333` | **rewritten** |
| **L2** SRC MAC | `aaaa.1111` | `bbbb.2222` | **rewritten** |
| **L3** SRC IP | `192.168.1.10` | same | unchanged |
| **L3** DST IP | `10.0.0.50` | same | unchanged |
| **L3** TTL | 64 | 63 | decremented |

**New MACs every hop; the IP addresses never change.**

**Why throw away a perfectly good Layer 2 header at every hop?** Because it was only ever valid on **one wire**. MAC addresses have no meaning beyond the local segment — `aaaa.1111` is not reachable, or even known, on the far side of R1. The IP addresses survive end to end because they identify the *conversation*; the MACs are rewritten because they identify only the *current handoff*. (Unless NAT is involved, Chapter 17 — that's exactly what makes NAT special: it breaks this rule deliberately.)

**And why decrement TTL?** It's the loop insurance. If a routing mistake sends this packet in a circle, TTL hits zero, some router discards it and returns an ICMP "time exceeded." Without it, one bad route could circulate a packet forever. *That ICMP reply is also precisely how `traceroute` maps a path — send TTL=1, see who complains, then TTL=2, and so on.*

### Step 6 — R2 delivers

R2 repeats the process, but this time `10.0.0.0/24` is **directly connected**. So R2 ARPs for `10.0.0.50` itself, gets `dddd.4444`, and builds the final frame with TTL 62.

### Step 7 — The return trip is a whole new decision

The server replies — and **none of the outbound decisions are reused.** It runs its own local-or-remote check, consults its own gateway, and each router independently routes the reply. *This is why "I can reach it but it can't reach me" is possible: routing is per-direction, and asymmetric or missing return routes are a classic fault.*

### Where Each Chapter Lives in This Story

| Step | Chapter |
|------|---------|
| Local-or-remote decision, masks | 11, 12 |
| ARP for the gateway | 5 |
| Switch MAC learning & flooding | 6 |
| VLAN tagging if the path crosses a trunk | 7, 8 |
| Loop-free path selection | 9 |
| Routing table lookup, longest prefix match | 14 |
| How R1 learned about 10.0.0.0/24 | 15, 16 |
| Gateway redundancy if R1 dies | 14.7 |
| Address rewriting for the internet | 17 |
| Permit/deny along the way | 19 |

**When something is broken, walk these steps in order.** Nearly every fault is one of them failing: wrong mask (step 1), no ARP reply (step 2), wrong VLAN (step 4), missing route (step 5), or no return route (step 7).

**📝 Exam-style questions — 14.8**

**Q1.** PC1 (192.168.10.10) sends a packet to a server at 172.16.5.20. The path is PC1 → R1 → R2 → server. Which addresses does the packet carry on the link between R1 and R2?

- **A.** Source IP 192.168.10.10, destination IP 172.16.5.20; source MAC is R1's outgoing interface, destination MAC is R2's incoming interface.
- **B.** Source IP is R1's outgoing interface, destination IP is R2's incoming interface; source MAC is R1, destination MAC is R2.
- **C.** Source IP 192.168.10.10, destination IP 172.16.5.20; source MAC is PC1, destination MAC is the server.
- **D.** Source IP 192.168.10.10, destination IP 172.16.5.20; source MAC is PC1, destination MAC is R2's incoming interface.

<details><summary>Answer</summary>

**Answer: A.** The IP addresses stay end to end (no NAT here). The MAC addresses describe only the current link, so R1 builds a new frame from its own interface to R2's. **Why not the others:** B, routers don't change the IP addresses of packets they forward. C, the server's MAC means nothing outside its own LAN; PC1 never even learns it. D, PC1's MAC was dropped when R1 threw away the old Ethernet header.
</details>

**Q2.** PC1 (192.168.10.10/24, gateway 192.168.10.1) needs to send a packet to 172.16.5.20 and has an empty ARP cache. Which address does PC1 send an ARP request for?

- **A.** 172.16.5.20
- **B.** 192.168.10.1
- **C.** 192.168.10.255
- **D.** None; PC1 sends the packet to the broadcast MAC address

<details><summary>Answer</summary>

**Answer: B.** 172.16.5.20 isn't on PC1's subnet, so the frame must go to the default gateway, and PC1 needs the gateway's MAC. **Why not the others:** A, nobody on PC1's LAN owns 172.16.5.20, so that ARP would get no answer. C is the subnet's broadcast address, not a device. D, normal unicast data is never sent to the broadcast MAC; only the ARP request itself is broadcast.
</details>

**Q3.** A packet arrives at a router with a TTL of 1. The routing table has a route for its destination through another router. What happens?

- **A.** The router forwards it with a TTL of 1.
- **B.** The router forwards it with a TTL of 0, and the next router drops it.
- **C.** The router decrements the TTL to 0, drops the packet and sends an ICMP Time Exceeded message to the source.
- **D.** The router resets the TTL to 64 and forwards it.

<details><summary>Answer</summary>

**Answer: C.** Every router decrements the TTL. When it reaches 0, the packet is dropped and the sender gets an ICMP Time Exceeded. That's the loop protection, and the trick traceroute is built on. **Why not the others:** A, the router must decrement. B, a router never forwards a packet with a TTL of 0. D, only the original sender sets the starting TTL.
</details>

**Q4.** A router forwards an IPv4 packet from one Ethernet LAN to another. NAT is not configured. Which two fields does it change? (Choose two.)

- **A.** Source MAC address
- **B.** Destination IP address
- **C.** TTL
- **D.** Source IP address
- **E.** TCP destination port

<details><summary>Answer</summary>

**Answer: A, C.** The router builds a new Ethernet header, so the source MAC (and destination MAC) change, and it decrements the TTL (recomputing the header checksum). **Why not the others:** B and D, the IP addresses stay the same end to end unless NAT rewrites them. E, a router doesn't touch Layer 4 ports either, unless it's doing PAT.
</details>

---

<a name="chapter-15"></a>
# Chapter 15: Static Routing

## 15.1 What Is a Static Route?

A **static route** is a path you **type in by hand**. You're telling the router: "To reach network X, send packets to next-hop Y." Simple and predictable, but you must update it yourself if the network changes.

**Story Time 📖:** A static route is like writing directions on a sticky note: "To get to Grandma's, turn left at the big oak tree." It works great — until they cut down the tree and nobody updates your note. That's the downside: static routes don't adjust automatically.

**📝 Exam-style questions — 15.1**

**Q1.** What is the main drawback of static routes?

- **A.** They use a lot of bandwidth sending updates.
- **B.** They don't adapt on their own when the network changes.
- **C.** They have a higher administrative distance than OSPF.
- **D.** They can only point to a next-hop IP address, never to an interface.

<details><summary>Answer</summary>

**Answer: B.** A static route is the sticky note from the Story Time: it says the same thing until a human changes it. If a link fails or a new subnet appears, the router won't work around it. **Why not the others:** A, static routes send no updates at all, which is one of their advantages. C, a static route's AD is 1, *lower* (more trusted) than OSPF's 110. D, a static route can point to a next hop, an exit interface, or both.
</details>

**Q2.** An engineer configures `ip route 10.0.0.0 255.255.255.0 192.168.1.2`. How does the route appear in `show ip route`?

- **A.** `S 10.0.0.0/24 [1/0] via 192.168.1.2`
- **B.** `S 10.0.0.0/24 [0/1] via 192.168.1.2`
- **C.** `C 10.0.0.0/24 [1/0] via 192.168.1.2`
- **D.** `S 10.0.0.0/24 [110/1] via 192.168.1.2`

<details><summary>Answer</summary>

**Answer: A.** Static routes are coded **S**, and the brackets read `[AD/metric]`: a static route has AD 1 and metric 0. **Why not the others:** B has the AD and metric swapped. C, **C** is for connected networks, which never have a `via` next hop. D, 110 is OSPF's AD; a static route keeps AD 1 unless you set another value.
</details>

## 15.2 When to Use Static Routes

- **Small networks** with few paths.
- **Stub networks** (only one way in/out).
- **Default routes** to the internet.
- When you want **total control**.

Downsides: lots of manual work and no automatic healing if a link fails.

**📝 Exam-style questions — 15.2**

**Q1.** In which situation are static routes the best fit?

- **A.** A branch office with a single WAN link to headquarters
- **B.** A large campus with many redundant paths between buildings
- **C.** A network where subnets are added and removed every week
- **D.** Two hundred routers connected in a full mesh

<details><summary>Answer</summary>

**Answer: A.** A stub network has only one way in and out, so there's nothing for a routing protocol to choose between. One default route at the branch does the whole job. **Why not the others:** B, redundant paths need a protocol that can reroute around failures on its own. C, constant change means constant manual edits, exactly what static routing is bad at. D, hand-writing routes for 200 routers would be a huge amount of work and very error-prone.
</details>

**Q2.** Which two are advantages of static routing over a dynamic routing protocol? (Choose two.)

- **A.** No routing protocol traffic and no extra CPU for route calculations
- **B.** The administrator controls exactly which path is used
- **C.** It reroutes around failures automatically
- **D.** It scales easily to large networks
- **E.** New subnets are learned automatically

<details><summary>Answer</summary>

**Answer: A, B.** Static routes cost nothing to run: no hellos, no updates, no SPF calculations. They're also completely predictable, because the path is whatever you typed. **Why not the others:** C, E and D are the strengths of *dynamic* routing. A static route never discovers anything new, and it only "fails over" if you plan a floating backup yourself (15.5).
</details>

## 15.3 Configuring a Static Route

The command format:
```
ip route <destination-network> <subnet-mask> <next-hop-IP>
```

**Example:** Router R1 wants to reach `10.0.0.0/24`, which is behind R2 at `192.168.1.2`:

```
R1(config)# ip route 10.0.0.0 255.255.255.0 192.168.1.2
```

You can also point out an **exit interface** instead of a next hop:
```
R1(config)# ip route 10.0.0.0 255.255.255.0 gi0/1
```

```diagram
{
  "type": "topology",
  "title": "A static route needs a route back",
  "caption": "R1 and R2 share the link 10.0.12.0/30 (R1 is .1, R2 is .2). Press **Next**. Each router starts with only its connected networks. Watch where the ping dies, and why it takes **two** static routes to fix it.",
  "nodes": [
    {
      "id": "PC1",
      "kind": "host",
      "x": 0,
      "y": 0,
      "sub": "192.168.1.10"
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 1.5,
      "y": 0,
      "sub": "192.168.1.1"
    },
    {
      "id": "R2",
      "kind": "router",
      "x": 3,
      "y": 0,
      "sub": "172.16.20.1"
    },
    {
      "id": "PC2",
      "kind": "host",
      "x": 4.5,
      "y": 0,
      "sub": "172.16.20.10"
    }
  ],
  "links": [
    {
      "a": "PC1",
      "b": "R1"
    },
    {
      "a": "R1",
      "b": "R2",
      "aLabel": ".1",
      "bLabel": ".2"
    },
    {
      "a": "R2",
      "b": "PC2"
    }
  ],
  "steps": [
    {
      "title": "1. Connected routes only",
      "text": "R1 knows `192.168.1.0/24` and `10.0.12.0/30`, nothing more. PC1 pings PC2; R1 has no route for 172.16.20.10 and no default, so it **drops** the packet.",
      "nodes": {
        "R1": {
          "badge": "no route",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "PC1",
            "R1"
          ],
          "label": "ping 172.16.20.10",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "2. Add a route on R1",
      "text": "`R1(config)# ip route 172.16.20.0 255.255.255.0 10.0.12.2`. Now R1 forwards to R2, and R2 delivers it on its connected LAN. The request **arrives**.",
      "nodes": {
        "R1": {
          "badge": "S 172.16.20.0",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PC1",
            "R1",
            "R2",
            "PC2"
          ],
          "label": "echo request",
          "tone": "good"
        }
      ]
    },
    {
      "title": "3. …but the reply dies",
      "text": "PC2 replies to **192.168.1.10**. R2 only knows its connected networks, so it has no route to 192.168.1.0/24 and drops the reply. From PC1, the ping just times out, even though half the path works. Routing is decided **one direction at a time**.",
      "nodes": {
        "R2": {
          "badge": "no route",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "PC2",
            "R2"
          ],
          "label": "echo reply",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "4. Add the return route on R2",
      "text": "`R2(config)# ip route 192.168.1.0 255.255.255.0 10.0.12.1`. Now the reply has a path home, and the ping succeeds. **Every static route needs a partner going the other way.**",
      "nodes": {
        "R2": {
          "badge": "S 192.168.1.0",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PC2",
            "R2",
            "R1",
            "PC1"
          ],
          "label": "echo reply",
          "tone": "good"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 15.3**

**Q1.** R1's Gi0/1 is 10.0.12.1/30 and connects to R2's Gi0/0, 10.0.12.2/30. R2's LAN is 172.16.20.0/24. Which command on R1 creates a working static route to that LAN?

- **A.** `ip route 172.16.20.0 255.255.255.0 10.0.12.2`
- **B.** `ip route 172.16.20.0 0.0.0.255 10.0.12.2`
- **C.** `ip route 172.16.20.0 255.255.255.0 10.0.12.1`
- **D.** `ip route 10.0.12.2 255.255.255.0 172.16.20.0`

<details><summary>Answer</summary>

**Answer: A.** The format is destination network, subnet mask, then the next hop, which is the *neighbor's* address on the shared link. **Why not the others:** B uses a wildcard mask; `ip route` needs a subnet mask. C points at R1's own address, so the packet would never leave R1. D has the destination and next hop swapped.
</details>

**Q2.** R1 has a static route to R2's LAN, 172.16.20.0/24. R2 has only its connected routes. A PC on R1's LAN (192.168.1.0/24) pings a PC on R2's LAN, and the ping fails. What is the most likely cause?

- **A.** R1's static route needs an exit interface as well as a next hop.
- **B.** R2 has no route back to 192.168.1.0/24, so the replies are dropped.
- **C.** Static routes don't work for ICMP.
- **D.** R2 needs `ip routing` enabled.

<details><summary>Answer</summary>

**Answer: B.** The echo request reaches R2's LAN, but the reply is addressed to 192.168.1.x, and R2 has no idea where that is. Routing works one direction at a time, so every static route needs a matching route on the way back. **Why not the others:** A, a next hop alone is enough. C, static routes forward any IP packet. D, `ip routing` is on by default on routers, and R2 is already forwarding its connected networks.
</details>

**Q3.** An engineer configures `ip route 10.0.0.0 255.255.255.0 GigabitEthernet0/1` on an Ethernet interface, with no next-hop address. Which statement is true?

- **A.** The route shows as `S 10.0.0.0/24 is directly connected, GigabitEthernet0/1`, and the router ARPs for each destination, relying on the next router to answer with proxy ARP.
- **B.** The route has an administrative distance of 0, the same as a connected network.
- **C.** IOS rejects the command, because Ethernet routes need a next hop.
- **D.** The router ignores the route until a next hop is learned by OSPF.

<details><summary>Answer</summary>

**Answer: A.** Without a next hop, the router treats every destination in 10.0.0.0/24 as if it were on the wire, and ARPs for each one. That only works if the neighbor answers with proxy ARP. That's why, on Ethernet, it's better to give a next hop (or both an interface and a next hop, a "fully specified" route). **Why not the others:** B, it still has AD 1; "directly connected" in the output doesn't make it a connected route. C, IOS accepts it. D, static routes never wait on OSPF.
</details>

## 15.4 The Default Route (The "Everywhere Else" Route)

A **default route** matches **any** destination the router doesn't otherwise know. It's how routers say "if you don't know where it goes, send it this way (usually toward the internet)." Written as `0.0.0.0 0.0.0.0` (means "all networks"):

```
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

**Story Time 📖:** A default route is like a mail clerk's rule: "Any letter I don't recognize? Just send it to the main post office downtown; they'll figure it out." That "main post office" is your ISP.

**Why does `0.0.0.0 0.0.0.0` mean "everything"? And why is it the LAST resort?** The magic is in the mask: a mask of `0.0.0.0` means "**match zero bits** of the address" — in other words, *don't require any part of the destination to match at all.* So every possible address matches it. That makes it the **shortest prefix possible (/0)** — the least specific route there is. Remember longest-prefix-match from Chapter 14: the router always prefers a more specific route. So the default route naturally sits at the very bottom of the priority list and only gets used when **nothing more specific matches**. *That's exactly the behavior you want:* "use real knowledge when I have it; otherwise, shove it toward the internet and let a bigger router deal with it." Your home router does this constantly — it knows *your* local network specifically, and has a default route pointing everything else (all of the internet) at your ISP. It doesn't need to know where google.com is; it just needs to know "not local → send to ISP."

```diagram
{
  "type": "topology",
  "title": "Where default routes belong: a stub branch",
  "caption": "Click each router and link to read its routes. The branch has only one way out, so a single default route is all it needs.",
  "nodes": [
    {
      "id": "BrPC",
      "kind": "host",
      "x": 0,
      "y": 0,
      "label": "Branch PC",
      "sub": "192.168.50.10",
      "info": "Its default gateway is the branch router, 192.168.50.1. The PC doesn't route at all; it only decides *local or not*."
    },
    {
      "id": "BR",
      "kind": "router",
      "x": 1.5,
      "y": 0,
      "label": "Branch",
      "sub": "stub router",
      "info": "A **stub**: one link in, one link out. It needs just one static route: `ip route 0.0.0.0 0.0.0.0 10.0.12.1`. Headquarters, the internet, anything not local goes up the WAN link. `show ip route` shows `Gateway of last resort is 10.0.12.1` and an `S*` route."
    },
    {
      "id": "HQ",
      "kind": "router",
      "x": 3,
      "y": 0,
      "sub": "203.0.113.2",
      "info": "HQ needs **two** kinds of route. Toward the branch, a specific one: `ip route 192.168.50.0 255.255.255.0 10.0.12.2` (without it, replies to the branch would follow HQ's default to the ISP and be lost). Toward the internet, its own default: `ip route 0.0.0.0 0.0.0.0 203.0.113.1`."
    },
    {
      "id": "ISP",
      "kind": "cloud",
      "x": 4.5,
      "y": 0,
      "label": "Internet",
      "sub": "203.0.113.1",
      "info": "The ISP's router knows the whole internet so HQ doesn't have to. That's the \"main post office downtown\" from the Story Time."
    }
  ],
  "links": [
    {
      "a": "BrPC",
      "b": "BR",
      "label": "192.168.50.0/24"
    },
    {
      "a": "BR",
      "b": "HQ",
      "label": "10.0.12.0/30",
      "aLabel": ".2",
      "bLabel": ".1",
      "info": "The only WAN link. If it fails, the branch is cut off whatever routes exist, which is why a routing protocol would add nothing here."
    },
    {
      "a": "HQ",
      "b": "ISP",
      "label": "203.0.113.0/30",
      "info": "HQ's default route points here. Every destination HQ doesn't know specifically, the whole internet, matches 0.0.0.0/0 and goes this way."
    }
  ]
}
```

**📝 Exam-style questions — 15.4**

**Q1.** Which command sends all traffic with no more specific match to the ISP at 203.0.113.1?

- **A.** `ip route 0.0.0.0 0.0.0.0 203.0.113.1`
- **B.** `ip route 0.0.0.0 255.255.255.255 203.0.113.1`
- **C.** `ip default-gateway 203.0.113.1`
- **D.** `ip route 255.255.255.255 0.0.0.0 203.0.113.1`

<details><summary>Answer</summary>

**Answer: A.** Network 0.0.0.0 with mask 0.0.0.0 is the /0 route: it matches every address, so it catches anything nothing else matches. **Why not the others:** B is a /32 host route to the single address 0.0.0.0, which matches nothing useful. C, `ip default-gateway` is for devices that *aren't* routing, such as a Layer 2 switch; a router with IP routing on ignores it. D has the network and mask swapped, which isn't a valid route.
</details>

**Q2.** Refer to the exhibit. Which two statements are true? (Choose two.)

```
R1# show ip route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/0
L        192.168.1.1/32 is directly connected, GigabitEthernet0/0
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/30 is directly connected, GigabitEthernet0/1
L        203.0.113.2/32 is directly connected, GigabitEthernet0/1
```

- **A.** A packet to 8.8.8.8 is forwarded to 203.0.113.1.
- **B.** A packet to 192.168.1.50 is sent directly out GigabitEthernet0/0.
- **C.** A packet to 10.1.1.1 is dropped because there is no matching route.
- **D.** The `*` means this route was learned most recently.
- **E.** The default route has an administrative distance of 0.

<details><summary>Answer</summary>

**Answer: A, B.** 8.8.8.8 matches only the default route, so it goes to 203.0.113.1, the gateway of last resort. 192.168.1.50 is on a connected network, a /24 match that beats /0, so R1 delivers it straight onto that LAN. **Why not the others:** C, 10.1.1.1 matches the default route like every other address, so it's forwarded, not dropped. D, the `*` marks a *candidate default* route, not a recent one. E, the brackets show `[1/0]`: AD 1, as for any static route.
</details>

## 15.5 Floating Static Route (Backup Path)

You can make a **backup** static route that only activates if the main path dies, by giving it a **higher administrative distance**:

```
R1(config)# ip route 10.0.0.0 255.255.255.0 192.168.1.2       ! main (AD 1)
R1(config)# ip route 10.0.0.0 255.255.255.0 192.168.9.2 5     ! backup (AD 5)
```

The backup "floats" unused until the main route disappears — then it drops in to save the day.

**Why does raising the AD make it a "backup" — how does that create standby behavior?** Recall AD is the *trust score*, and **lower wins**. Both routes describe the same destination (10.0.0.0/24), so the router must pick one. The main route has AD 1; the backup we deliberately gave AD 5. Since 1 < 5, the router installs **only the main route** and keeps the AD-5 one sitting on the bench, unused. *Here's the clever part:* a static route only stays valid while its path is usable. If the main link goes down, that AD-1 route **disappears** from consideration — and now the AD-5 backup is the *best remaining* option, so the router instantly promotes it into the routing table. When the main link recovers, the AD-1 route returns and wins again, benching the backup once more. *So "floating" is just AD doing its job:* we manufactured a deliberate trust difference so one route automatically yields to the other. It's an elegant failover with no fancy protocol — just clever use of the trust score you already understand. (You could even point the backup out a slower/pricier link, so it's only used in an emergency — exactly why you'd want it dormant normally.)

```diagram
{
  "type": "topology",
  "title": "A floating static route steps in, then steps back",
  "caption": "Two static routes to 10.0.0.0/24: the main one via R2 (AD 1) and a backup via R3 (AD 5). Press **Next** to fail the main link and bring it back.",
  "nodes": [
    {
      "id": "PC",
      "kind": "host",
      "x": 0,
      "y": 1,
      "sub": "192.168.10.10"
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 1.4,
      "y": 1
    },
    {
      "id": "R2",
      "kind": "router",
      "x": 2.9,
      "y": 0,
      "sub": "192.168.1.2"
    },
    {
      "id": "R3",
      "kind": "router",
      "x": 2.9,
      "y": 2,
      "sub": "192.168.9.2"
    },
    {
      "id": "SRV",
      "kind": "server",
      "x": 4.3,
      "y": 1,
      "label": "Server",
      "sub": "10.0.0.50"
    }
  ],
  "links": [
    {
      "a": "PC",
      "b": "R1"
    },
    {
      "a": "R1",
      "b": "R2",
      "label": "main",
      "aLabel": "Gi0/1"
    },
    {
      "a": "R1",
      "b": "R3",
      "label": "backup",
      "aLabel": "Gi0/2",
      "style": "dashed"
    },
    {
      "a": "R2",
      "b": "SRV"
    },
    {
      "a": "R3",
      "b": "SRV"
    }
  ],
  "steps": [
    {
      "title": "1. Two routes, one winner",
      "text": "`ip route 10.0.0.0 255.255.255.0 192.168.1.2` (AD 1) and `ip route 10.0.0.0 255.255.255.0 192.168.9.2 5` (AD 5). Same prefix, so the lower AD is installed. The AD-5 route sits on the bench and doesn't appear in `show ip route`.",
      "nodes": {
        "R2": {
          "badge": "AD 1 in use",
          "tone": "good"
        },
        "R3": {
          "badge": "AD 5 bench",
          "tone": "muted"
        }
      },
      "links": {
        "R1-R2": "active"
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1",
            "R2",
            "SRV"
          ],
          "label": "to 10.0.0.50"
        }
      ]
    },
    {
      "title": "2. The main link fails",
      "text": "Gi0/1 goes **down**. Its next hop, 192.168.1.2, is no longer reachable through a connected network, so R1 removes the AD-1 route from the table.",
      "nodes": {
        "R2": {
          "badge": "route gone",
          "tone": "bad"
        }
      },
      "links": {
        "R1-R2": "down"
      }
    },
    {
      "title": "3. The backup floats in",
      "text": "The AD-5 route is now the best remaining route to 10.0.0.0/24, so R1 installs it, and traffic flows via R3 with no protocol involved. `show ip route` now shows `S 10.0.0.0/24 [5/0] via 192.168.9.2`.",
      "nodes": {
        "R3": {
          "badge": "AD 5 in use",
          "tone": "good"
        }
      },
      "links": {
        "R1-R3": "active"
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1",
            "R3",
            "SRV"
          ],
          "label": "to 10.0.0.50",
          "tone": "good"
        }
      ]
    },
    {
      "title": "4. The main link recovers",
      "text": "Gi0/1 comes back up, the AD-1 route returns, and it beats AD 5 again. The backup goes back on the bench automatically. One catch: this only works because the *interface* went down. If R2 died behind a switch while Gi0/1 stayed up, R1 would never notice.",
      "nodes": {
        "R2": {
          "badge": "AD 1 in use",
          "tone": "good"
        },
        "R3": {
          "badge": "AD 5 bench",
          "tone": "muted"
        }
      },
      "links": {
        "R1-R2": "active",
        "R1-R3": null
      },
      "packets": [
        {
          "path": [
            "PC",
            "R1",
            "R2",
            "SRV"
          ],
          "label": "to 10.0.0.50"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 15.5**

**Q1.** Refer to the exhibit. Both links are up. Which statement is true?

```
R1(config)# ip route 10.0.0.0 255.255.255.0 192.168.1.2
R1(config)# ip route 10.0.0.0 255.255.255.0 192.168.9.2 5
```

- **A.** Both routes are installed and R1 load-balances across them.
- **B.** Only the route via 192.168.1.2 is installed; the route via 192.168.9.2 is installed only if the first one is removed.
- **C.** Only the route via 192.168.9.2 is installed, because 5 is its metric and that is the best value.
- **D.** The second command replaces the first.

<details><summary>Answer</summary>

**Answer: B.** The second route has an AD of 5, and the first has the default of 1. Same prefix, so the lower AD wins, and the AD-5 route waits on the bench. If the first route's path fails (its exit interface goes down), the backup floats into the table. **Why not the others:** A, load balancing needs equal AD *and* equal metric. C, the trailing number in `ip route` is the administrative distance, not a metric, and lower AD wins. D, the two lines have different next hops, so IOS keeps both.
</details>

**Q2.** R1 learns 10.50.0.0/24 through OSPF. The engineer wants a static route to 10.50.0.0/24 via 192.0.2.1 that is used **only** if the OSPF route disappears. Which administrative distance should the static route have?

- **A.** None; leave the default
- **B.** 50
- **C.** 90
- **D.** 130

<details><summary>Answer</summary>

**Answer: D.** To float behind OSPF, the static route's AD must be *higher* than OSPF's 110. 130 does that. **Why not the others:** A, the default static AD of 1 would beat OSPF and pull all the traffic onto the backup path. B and C are both below 110, so they would also replace the OSPF route instead of backing it up.
</details>

**Q3.** R1's primary static route to 10.0.0.0/24 uses next hop 192.168.1.2, which R1 reaches through a switch on Gi0/0. A floating static route with AD 5 points to 192.168.9.2. The router at 192.168.1.2 loses power, but R1's Gi0/0 stays up/up because the switch is still on. What happens?

- **A.** The floating static route takes over immediately.
- **B.** The primary route stays in the table, so traffic is sent toward the dead router and lost.
- **C.** R1 load-balances between the two next hops.
- **D.** R1 removes both routes from the table.

<details><summary>Answer</summary>

**Answer: B.** A static route stays in the table as long as its next hop looks reachable, and 192.168.1.2 is still inside a connected subnet on an up interface. R1 can't tell that the router behind the switch died, so the backup never gets its turn. (The fix is to track the next hop, for example with IP SLA, or to use a routing protocol.) **Why not the others:** A only happens when the primary route actually leaves the table, such as when Gi0/0 goes down. C, the routes have different ADs, so they're never used together. D, nothing removes the floating route; it's simply not needed as long as the primary looks valid.
</details>

## 15.6 IPv6 Static Routes

Same idea, IPv6 style:
```
R1(config)# ipv6 unicast-routing
R1(config)# ipv6 route 2001:db8:0:2::/64 2001:db8:0:1::2
R1(config)# ipv6 route ::/0 2001:db8:0:1::2        ! default route
```

**📝 Exam-style questions — 15.6**

**Q1.** Which command creates an IPv6 default route through 2001:db8:0:1::2?

- **A.** `ipv6 route ::/0 2001:db8:0:1::2`
- **B.** `ipv6 route ::/128 2001:db8:0:1::2`
- **C.** `ip route ::/0 2001:db8:0:1::2`
- **D.** `ipv6 route 0.0.0.0 0.0.0.0 2001:db8:0:1::2`

<details><summary>Answer</summary>

**Answer: A.** `::/0` is IPv6's "match everything" prefix, the twin of 0.0.0.0/0. **Why not the others:** B, `::/128` is the single unspecified address, not every address. C, `ip route` is the IPv4 command. D uses IPv4-style network and mask; IPv6 routes are always written as prefix/length.
</details>

**Q2.** An engineer wants a static IPv6 route to 2001:db8:0:2::/64 using the neighbor's link-local address FE80::2, which is reached out Gi0/1. Which command is correct?

- **A.** `ipv6 route 2001:db8:0:2::/64 fe80::2`
- **B.** `ipv6 route 2001:db8:0:2::/64 gigabitethernet0/1 fe80::2`
- **C.** `ipv6 route 2001:db8:0:2::/64 fe80::2 gigabitethernet0/1`
- **D.** `ipv6 route fe80::2 gigabitethernet0/1 2001:db8:0:2::/64`

<details><summary>Answer</summary>

**Answer: B.** Every interface on the router has its own FE80:: link, so the same link-local address could exist out of several interfaces. IOS therefore requires the exit interface, written *before* the next hop. **Why not the others:** A has no interface, and IOS rejects a link-local next hop without one. C puts the interface after the address, which isn't the command's syntax. D starts with the next hop instead of the destination prefix.
</details>

**Q3.** Which command creates a floating IPv6 default route through 2001:db8:9::2 with an administrative distance of 200?

- **A.** `ipv6 route ::/0 2001:db8:9::2 200`
- **B.** `ipv6 route ::/0 200 2001:db8:9::2`
- **C.** `ipv6 route ::/128 2001:db8:9::2 200`
- **D.** `ipv6 route ::/0 2001:db8:9::2 metric 200`

<details><summary>Answer</summary>

**Answer: A.** Same pattern as IPv4: the AD goes at the end, after the next hop. With 200, the route waits behind any OSPFv3 (110) or regular static (1) default route. **Why not the others:** B puts the distance before the next hop. C, `::/128` isn't the default route. D, there's no `metric` keyword here; the trailing number is the administrative distance.
</details>

---

<a name="chapter-16"></a>
# Chapter 16: Dynamic Routing & OSPF

## 16.1 What Is Dynamic Routing?

**Dynamic routing** means routers **talk to each other** and **learn paths automatically**. If a link breaks, they discover a new path on their own. No sticky notes to update!

```
   Static:  You update every route by hand. 😓
   Dynamic: Routers share maps and adapt automatically. 😎
```

**📝 Exam-style questions — 16.1**

**Q1.** What is the main advantage of dynamic routing over static routing?

- **A.** It uses no CPU or bandwidth.
- **B.** Routers learn new networks and find new paths around failures on their own.
- **C.** It is always more secure than static routing.
- **D.** It doesn't need any configuration at all.

<details><summary>Answer</summary>

**Answer: B.** Routers running a routing protocol tell each other what they know and recalculate when something changes, so nobody has to edit sticky notes after a link dies. **Why not the others:** A, the opposite: hellos, updates and path calculations all cost CPU, memory and bandwidth. C, routing updates can be spoofed unless you add authentication; static routes have no updates to attack. D, you still have to enable the protocol and tell it which interfaces to use.
</details>

**Q2.** Which network would benefit most from a dynamic routing protocol?

- **A.** A single router with one LAN and one internet link
- **B.** A branch with one WAN link to headquarters
- **C.** Thirty routers with several redundant paths between sites
- **D.** A lab with two routers joined by one cable

<details><summary>Answer</summary>

**Answer: C.** Many routers and several possible paths is exactly where hand-written routes become unmanageable and where automatic failover matters. **Why not the others:** A, B and D each have only one way to go, so a static or default route does the job with no protocol overhead.
</details>

## 16.2 Two Families of Routing Protocols

- **Distance Vector** (e.g., **RIP**): "I heard network X is 3 hops that way." Simple, shares its whole table with neighbors. Can be slow and short-sighted.
- **Link State** (e.g., **OSPF**): Every router builds a **full map** of the network, then calculates the best path itself. Smarter and faster.

**Why is "link state" smarter than "distance vector"? What's the real difference?** It comes down to *how much each router actually knows.*

- A **distance-vector** router is like asking for directions by only trusting **rumors from your immediate neighbors**: "My neighbor says network X is 3 hops that way." You don't see the map yourself — you just trust what the next router *tells* you. This has two problems: it's **slow to react** (bad news has to pass router-to-router-to-router, like a game of telephone), and it can believe **wrong information** during changes (leading to loops where routers point at each other).
- A **link-state** router is like being handed a **complete map of the whole city**. Every router shares facts about *its own* links, and each router assembles all those facts into an identical full map (the LSDB). Then each router **calculates the best path itself** using that map, rather than trusting neighbor rumors.

*Why does having the full map matter so much?* Because when you can see the whole network, you can (a) instantly compute the truly shortest path, and (b) react fast and correctly when something breaks — you just update your map and recalculate, no waiting for rumors to propagate hop by hop. That's why OSPF converges (settles after a change) faster and avoids the loop problems that plague RIP. **More knowledge = better, faster, safer decisions.**

**📝 Exam-style questions — 16.2**

**Q1.** Which statement describes a link-state routing protocol?

- **A.** Each router sends its whole routing table to its neighbors and trusts what they send back.
- **B.** Each router builds a full map of the network and calculates the best paths itself.
- **C.** Each router picks paths using hop count only.
- **D.** Routers only exchange routes that an administrator typed in.

<details><summary>Answer</summary>

**Answer: B.** Link-state routers share facts about their own links, every router assembles the same map (the LSDB), and each one runs SPF on it. **Why not the others:** A is distance vector, "routing by rumor". C is RIP's metric, a distance-vector protocol. D describes static routing.
</details>

**Q2.** Which of these is a distance-vector routing protocol?

- **A.** OSPFv2
- **B.** IS-IS
- **C.** RIP
- **D.** OSPFv3

<details><summary>Answer</summary>

**Answer: C.** RIP shares its routing table with its neighbors and counts hops, the classic distance-vector design. **Why not the others:** A and D are OSPF for IPv4 and IPv6, both link state. B, IS-IS is also a link-state protocol, mostly found in service-provider networks.
</details>

**Q3.** Why do distance-vector protocols usually take longer to converge after a failure than link-state protocols?

- **A.** They use larger packets.
- **B.** Each router only learns about the change when its neighbor passes it on, one hop at a time.
- **C.** They have to wait for an administrator to approve the change.
- **D.** They run Dijkstra's algorithm, which is slow.

<details><summary>Answer</summary>

**Answer: B.** Bad news travels like a game of telephone: router to router, each one recalculating before passing it on. A link-state router floods the fact itself and every router recalculates straight away. **Why not the others:** A, packet size isn't the reason. C, no routing protocol waits for a human. D, Dijkstra (SPF) is what *link-state* protocols run.
</details>

## 16.3 Meet OSPF (Open Shortest Path First)

**OSPF** is the star of the CCNA. It's a **link-state** protocol that:
- Builds a complete map of the network.
- Uses **cost** (based on bandwidth) to pick the best path.
- Reacts quickly to changes.
- Is an **open standard** (works with any vendor).

**📝 Exam-style questions — 16.3**

**Q1.** Which two statements about OSPF are true? (Choose two.)

- **A.** It is an open standard that any vendor can implement.
- **B.** It picks paths by cost, which is based on bandwidth.
- **C.** It picks paths by hop count.
- **D.** It is a Cisco-proprietary protocol.
- **E.** It is a distance-vector protocol.

<details><summary>Answer</summary>

**Answer: A, B.** OSPF is an open standard (it runs between Cisco and anyone else), and its metric is cost, derived from interface bandwidth. **Why not the others:** C is RIP. D, OSPF is an open standard; EIGRP started out as the Cisco one. E, OSPF is link state.
</details>

**Q2.** What is OSPF's default administrative distance on a Cisco router?

- **A.** 90
- **B.** 100
- **C.** 110
- **D.** 120

<details><summary>Answer</summary>

**Answer: C.** OSPF routes show up as `[110/cost]`. **Why not the others:** A is internal EIGRP. B isn't the default AD for any common IGP. D is RIP.
</details>

## 16.4 How OSPF Works (The Friendship Steps)

**Story Time 📖:** OSPF routers are like new neighbors who introduce themselves, become friends, then share maps of the whole neighborhood.

1. **Hello:** Routers send **Hello** packets to find neighbors.
2. **Neighbor / Adjacency:** They become **neighbors**, then form an **adjacency** (a trusted friendship).
3. **Exchange LSAs:** They swap **Link-State Advertisements** — little facts about their links.
4. **Build the LSDB:** Each router assembles all the LSAs into a full **Link-State Database** (the map).
5. **Run SPF:** Each router runs the **Dijkstra (SPF) algorithm** to compute the shortest path to everywhere.
6. **Install routes:** The best paths go into the routing table.

**📝 Exam-style questions — 16.4**

**Q1.** In which order does OSPF go from a powered-on router to routes in the table?

- **A.** Run SPF, exchange LSAs, send Hellos, install routes
- **B.** Send Hellos, form adjacencies, exchange LSAs, build the LSDB, run SPF, install routes
- **C.** Exchange LSAs, send Hellos, run SPF, build the LSDB, install routes
- **D.** Install routes, send Hellos, exchange LSAs, run SPF

<details><summary>Answer</summary>

**Answer: B.** First find neighbors (Hellos), then become adjacent, then swap LSAs, assemble the map, compute the shortest paths, and install the best ones. **Why not the others:** A runs SPF before there's a map to run it on. C trades LSAs before there are any neighbors to trade with. D installs routes before learning anything.
</details>

**Q2.** Which algorithm does OSPF use to calculate the shortest path to every destination?

- **A.** Bellman-Ford
- **B.** DUAL
- **C.** Dijkstra's SPF
- **D.** Spanning Tree

<details><summary>Answer</summary>

**Answer: C.** OSPF runs Dijkstra's shortest path first algorithm over its LSDB, with itself at the root of the tree. **Why not the others:** A, Bellman-Ford is behind distance-vector protocols like RIP. B, DUAL is EIGRP's algorithm. D, Spanning Tree stops Layer 2 loops between switches; it doesn't calculate routes.
</details>

**Q3.** On an Ethernet segment, to which multicast address does OSPF send its Hello packets?

- **A.** 224.0.0.5
- **B.** 224.0.0.6
- **C.** 224.0.0.9
- **D.** 224.0.0.10

<details><summary>Answer</summary>

**Answer: A.** 224.0.0.5 is AllSPFRouters: every OSPF router listens to it. **Why not the others:** B, 224.0.0.6 is AllDRouters, which only the DR and BDR listen to (16.10). C, 224.0.0.9 is RIPv2. D, 224.0.0.10 is EIGRP.
</details>

## 16.5 OSPF Areas

![OSPF areas around the backbone with ABRs](images/ospf_areas.png)

Big OSPF networks are split into **areas** to keep maps small and updates local. The center is always **Area 0** (the backbone). All other areas connect to Area 0.

```diagram
{
  "type": "topology",
  "title": "Three areas, one backbone",
  "caption": "Click any router or link to see what it knows and what a failure there would touch.",
  "nodes": [
    {
      "id": "R3",
      "kind": "router",
      "x": 0,
      "y": 0,
      "sub": "internal",
      "info": "An **internal router**: every interface is in Area 1. It holds the full, detailed map of Area 1, but Area 2 reaches it only as **summary** routes (Type 3 LSAs) from ABR1. In its routing table those show as `O IA` (inter-area)."
    },
    {
      "id": "R4",
      "kind": "router",
      "x": 0,
      "y": 1.6,
      "sub": "internal",
      "info": "Another Area 1 internal router. Its LSDB is identical to R3's, which is the rule inside every area."
    },
    {
      "id": "ABR1",
      "kind": "router",
      "x": 1.45,
      "y": 0.8,
      "sub": "Area 1 + 0",
      "info": "An **ABR** (area border router) with interfaces in Area 1 and Area 0. It keeps a separate LSDB for each area and turns Area 1's detail into summaries for the backbone, and the backbone's routes into summaries for Area 1."
    },
    {
      "id": "BB",
      "kind": "router",
      "x": 2.55,
      "y": 0.8,
      "label": "Core",
      "sub": "backbone",
      "info": "A **backbone router**: all interfaces in Area 0. All inter-area traffic crosses Area 0, so this is where Area 1 meets Area 2."
    },
    {
      "id": "ABR2",
      "kind": "router",
      "x": 3.65,
      "y": 0.8,
      "sub": "Area 0 + 2",
      "info": "The ABR for Area 2. Areas 1 and 2 never connect directly; they only meet through Area 0."
    },
    {
      "id": "R5",
      "kind": "router",
      "x": 5.1,
      "y": 0,
      "sub": "internal",
      "info": "An Area 2 internal router. It never sees Area 1's individual links, only ABR2's summaries."
    },
    {
      "id": "R6",
      "kind": "router",
      "x": 5.1,
      "y": 1.6,
      "sub": "internal",
      "info": "Another Area 2 internal router."
    }
  ],
  "links": [
    {
      "a": "R3",
      "b": "R4",
      "info": "If **this** link flaps, only the Area 1 routers (R3, R4, ABR1) rerun the full SPF. Area 0 and Area 2 just see an updated summary, if the reachable prefixes change at all. That containment is the whole reason for areas."
    },
    {
      "a": "R3",
      "b": "ABR1"
    },
    {
      "a": "R4",
      "b": "ABR1"
    },
    {
      "a": "ABR1",
      "b": "BB",
      "info": "An Area 0 link. Summaries from Area 1 flow over it to the rest of the backbone."
    },
    {
      "a": "BB",
      "b": "ABR2",
      "info": "An Area 0 link."
    },
    {
      "a": "ABR2",
      "b": "R5"
    },
    {
      "a": "ABR2",
      "b": "R6"
    },
    {
      "a": "R5",
      "b": "R6"
    }
  ],
  "zones": [
    {
      "label": "Area 1",
      "nodes": [
        "R3",
        "R4"
      ],
      "tone": "purple"
    },
    {
      "label": "Area 0 (backbone)",
      "nodes": [
        "ABR1",
        "BB",
        "ABR2"
      ],
      "tone": "accent"
    },
    {
      "label": "Area 2",
      "nodes": [
        "R5",
        "R6"
      ],
      "tone": "good"
    }
  ]
}
```

**Area 0** is the backbone. Every other area — Area 1, Area 2 and so on —
connects **to Area 0**, never directly to each other. Traffic between two
non-backbone areas always passes through the backbone.

**Why split OSPF into areas at all — isn't one big map simpler?** For a small network, yes. But the "full map" that makes link-state smart becomes a **burden** as the network grows. Two things blow up:

1. **Map size & CPU.** Every router must store the *entire* network map (LSDB) and run the SPF calculation over all of it. In a network with 1,000 routers, that's a huge map and a heavy calculation for *every* router.
2. **Constant recalculation.** Here's the killer: in one giant area, **any** link flapping *anywhere* forces **every** router in the whole network to re-run SPF. One flaky cable in a far corner makes 1,000 routers stop and recompute. Wasteful and destabilizing.

Areas fix both by **containing the detail**. Inside an area, routers know the full local map. But between areas, they only share **summaries** ("Area 1 can reach these networks") — not every internal link. *So a flapping link in Area 1 only forces Area 1's routers to recalculate; Area 2 doesn't even hear about it.* This is the same hierarchical-addressing idea from IP: keep detail local, share summaries globally. **Why is Area 0 mandatory as the center?** Because you need a single, consistent backbone for all areas to exchange their summaries through — if areas connected in random chains, you could get inconsistent or looping inter-area information. Forcing everything through Area 0 keeps the hierarchy clean: local traffic stays local, and cross-area traffic has one well-defined path through the backbone.

**📝 Exam-style questions — 16.5**

**Q1.** A router has one interface in Area 0 and another in Area 1. What is it called?

- **A.** ASBR
- **B.** ABR
- **C.** DR
- **D.** Internal router

<details><summary>Answer</summary>

**Answer: B.** An Area Border Router sits on the edge between areas and passes summaries between them. **Why not the others:** A, an ASBR connects OSPF to the *outside* (another routing protocol or domain). C, a DR is the spokesperson on one Ethernet segment, which has nothing to do with areas. D, an internal router has all its interfaces in a single area.
</details>

**Q2.** An OSPF network is split into Area 0, Area 1 and Area 2. A link inside Area 1 keeps going up and down. What is the main benefit of the area design here?

- **A.** Routers in Area 2 don't have to rerun SPF over Area 1's detailed map.
- **B.** The flapping link is shut down automatically.
- **C.** Area 1's routers stop sending Hellos.
- **D.** All three areas share one LSDB, so the change is learned faster.

<details><summary>Answer</summary>

**Answer: A.** Detailed link-state information stays inside its area. Other areas only see summaries from the ABR, so the churn stays mostly in Area 1. **Why not the others:** B, OSPF doesn't shut down interfaces. C, Hellos keep running; that's how neighbors stay up. D is the opposite: each area has its own LSDB, which is the whole point of areas.
</details>

**Q3.** Which statement about OSPF Area 0 is true?

- **A.** Area 0 is optional in a multi-area design.
- **B.** Every other area must connect to Area 0, and traffic between two other areas passes through it.
- **C.** Area 1 and Area 2 can exchange routes directly, without Area 0.
- **D.** Only one router may be in Area 0.

<details><summary>Answer</summary>

**Answer: B.** Area 0 is the backbone. All other areas hang off it, so inter-area routes always cross it, which keeps the design loop-free and predictable. **Why not the others:** A, a multi-area design must have Area 0. C, non-backbone areas never swap routes directly. D, Area 0 can hold as many routers as you need.
</details>

## 16.6 OSPF Cost — How It Picks Paths

OSPF cost formula (default): **Cost = Reference Bandwidth ÷ Link Bandwidth**. Default reference = 100 Mbps.

| Link | Cost |
|------|------|
| 100 Mbps | 1 |
| 10 Mbps | 10 |
| 1 Gbps | 1 (needs tuning — see note) |

> Modern links are all faster than 100 Mbps, so admins raise the reference bandwidth so fast links get different costs: `auto-cost reference-bandwidth 10000`.

**Why is cost based on bandwidth (and why does dividing work)?** Because OSPF's whole goal is to prefer **faster** paths, and dividing by bandwidth naturally makes faster links cheaper. A bigger-bandwidth link puts a bigger number on the bottom of the fraction, giving a *smaller* cost — and OSPF prefers the lowest total cost. So a gigabit link ends up "cheaper" than a 10 Mbps link automatically. **Why does the reference bandwidth need tuning today?** Look at the table's problem: with the default reference of 100 Mbps, both a 100 Mbps link *and* a 1 Gbps link (and a 10 Gbps link!) all round down to cost **1** — OSPF can't tell them apart, so it might pick the slower one. That's an accident of the 1980s default, when 100 Mbps *was* blazing fast. Raising the reference bandwidth (e.g., to 10,000) restores meaningful differences between modern fast links so OSPF again prefers the genuinely faster path. *Understanding the formula is what makes this "gotcha" obvious rather than mysterious.*

```diagram
{
  "type": "path",
  "title": "Fewer hops isn't better: OSPF adds up the costs",
  "prompt": "Costs here use `auto-cost reference-bandwidth 10000`, so 1 Gbps = 10, 100 Mbps = 100 and 10 Gbps = 1. R1 takes three gigabit hops (cost 30) over two hops that include a 100 Mbps link (cost 101). Change the 100 Mbps link to **1** (what the default reference would make it) and watch OSPF move onto the slow link.",
  "metric": "Cost",
  "from": "R1",
  "to": "R5",
  "nodes": [
    {
      "id": "R1",
      "x": 0,
      "y": 1
    },
    {
      "id": "R2",
      "x": 1.5,
      "y": 0
    },
    {
      "id": "R3",
      "x": 3,
      "y": 0
    },
    {
      "id": "R4",
      "x": 2.25,
      "y": 2
    },
    {
      "id": "R5",
      "x": 4.5,
      "y": 1
    }
  ],
  "links": [
    {
      "a": "R1",
      "b": "R2",
      "cost": 10,
      "label": "1G"
    },
    {
      "a": "R2",
      "b": "R3",
      "cost": 10,
      "label": "1G"
    },
    {
      "a": "R3",
      "b": "R5",
      "cost": 10,
      "label": "1G"
    },
    {
      "a": "R1",
      "b": "R4",
      "cost": 100,
      "label": "100M"
    },
    {
      "a": "R4",
      "b": "R5",
      "cost": 1,
      "label": "10G"
    }
  ]
}
```

**📝 Exam-style questions — 16.6**

**Q1.** An engineer enters `auto-cost reference-bandwidth 10000` on every router. What is the OSPF cost of a 1 Gbps interface?

- **A.** 1
- **B.** 10
- **C.** 100
- **D.** 1000

<details><summary>Answer</summary>

**Answer: B.** The reference bandwidth is in Mbps, so cost = 10,000 ÷ 1,000 = 10. A 10 Gbps link would then cost 1 and a 100 Mbps link 100, so OSPF can finally tell them apart. **Why not the others:** A is what 1 Gbps costs with the *default* reference of 100 (and what 10 Gbps costs with this one). C is a 100 Mbps link here. D would be a 10 Mbps link.
</details>

**Q2.** All routers use the default reference bandwidth of 100 Mbps. R1 reaches R3 either directly over a 100 Mbps link, or through R2 over two 1 Gbps links. Which path does OSPF choose?

- **A.** Through R2, because gigabit links are faster
- **B.** The direct 100 Mbps link, because its total cost is 1 and the path through R2 costs 2
- **C.** Both, because the costs are equal
- **D.** Neither, because the costs can't be calculated

<details><summary>Answer</summary>

**Answer: B.** With a 100 Mbps reference, 100 Mbps and 1 Gbps links both cost 1 (the result is never lower than 1). The direct path costs 1 and the path through R2 costs 1 + 1 = 2, so OSPF picks the slower link. That's exactly why you raise the reference bandwidth. **Why not the others:** A is what you'd *want*, but OSPF only sees cost, not speed. C, 1 and 2 aren't equal. D, the costs are easy to work out; they're just misleading.
</details>

**Q3.** Which interface command sets an OSPF cost of 50 directly?

- **A.** `ip ospf cost 50`
- **B.** `bandwidth 50`
- **C.** `auto-cost 50`
- **D.** `ospf cost 50`

<details><summary>Answer</summary>

**Answer: A.** `ip ospf cost` overrides the calculated cost on that interface. **Why not the others:** B sets the interface's bandwidth value to 50 *kbps*, which changes the calculated cost (and other things that read bandwidth) rather than setting 50. C, `auto-cost reference-bandwidth` is a router-mode command that changes the reference for all interfaces. D isn't an IOS command.
</details>

## 16.7 OSPF Router ID

Each OSPF router needs a unique **Router ID** (looks like an IP). It's chosen by:
1. A manually set `router-id`, OR
2. The highest **loopback** interface IP, OR
3. The highest active physical interface IP.

Best practice: set it manually for predictability.

**Why does OSPF need a Router ID, and why prefer a loopback for it?** OSPF needs a **stable, unique name** for each router so it can label who-said-what in the map (every LSA is tagged with the Router ID of its author). If a router's identity kept changing, the map would get confused about who's who. That's *why* a **loopback** is preferred as the source: a loopback is a virtual interface that **never goes down** (it has no cable to unplug, no hardware to fail). If OSPF instead used a physical interface's IP as its ID, and that interface went down, the router's very *identity* could change — forcing disruptive recalculation. A loopback gives OSPF a rock-solid, permanent name. And setting the `router-id` manually is best of all: then you *know* each router's ID (great for troubleshooting) instead of leaving it to whichever interface happens to have the highest IP.

**📝 Exam-style questions — 16.7**

**Q1.** R1 has no `router-id` command. Its interfaces are Loopback0 10.255.255.1, Loopback1 172.16.0.1 and GigabitEthernet0/0 192.168.1.1, all up. Which router ID does OSPF choose?

- **A.** 10.255.255.1
- **B.** 172.16.0.1
- **C.** 192.168.1.1
- **D.** 0.0.0.0

<details><summary>Answer</summary>

**Answer: B.** With no manual router ID, OSPF takes the highest IP on an up loopback, and only looks at physical interfaces if there are no loopbacks. 172.16.0.1 is the higher loopback. **Why not the others:** A is the lower loopback. C is higher than both, but physical interfaces only count when no loopback is up. D, 0.0.0.0 isn't a valid router ID; without any address OSPF can't start.
</details>

**Q2.** OSPF is already running on R1 with router ID 192.168.1.1. An engineer enters `router-id 1.1.1.1` under `router ospf 1`, but `show ip ospf` still shows 192.168.1.1. Why?

- **A.** A loopback address always overrides a manual router ID.
- **B.** The new router ID takes effect only after `clear ip ospf process` or a reload.
- **C.** 1.1.1.1 isn't configured on any interface.
- **D.** The command must be entered in interface configuration mode.

<details><summary>Answer</summary>

**Answer: B.** The router ID is chosen when the OSPF process starts, and changing it would disrupt every adjacency, so IOS waits until you reset the process (it even prints a reminder). **Why not the others:** A, a manual router ID beats everything. C, a manual router ID doesn't have to exist on any interface; it's just a 32-bit name. D, `router-id` is a router-mode command.
</details>

## 16.8 Configuring OSPF (Try It!)

```
R1(config)# router ospf 1                 ! start OSPF, process ID 1 (local)
R1(config-router)# router-id 1.1.1.1      ! set a clear router ID
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0   ! advertise this network
R1(config-router)# network 10.0.0.0 0.0.0.3 area 0
```

**Wait — what's `0.0.0.255`?** That's a **wildcard mask** — the *opposite* of a subnet mask. Where a subnet mask has 1s, the wildcard has 0s.

| Mask type | Value |
|---|---|
| Subnet mask | `255.255.255.0` |
| **Wildcard mask** | `0.0.0.255` — flip every bit |

A **0** in the wildcard means "must match exactly"; a **255** means "anything goes."

Check OSPF:
```
R1# show ip ospf neighbor      ! did we make friends?
R1# show ip route ospf         ! what did we learn? (O routes)
R1# show ip protocols          ! routing settings summary
```

**📝 Exam-style questions — 16.8**

**Q1.** R1's Gi0/1 has the address 10.1.1.5/30. Which two `network` commands enable OSPF Area 0 on that interface? (Choose two.)

- **A.** `network 10.1.1.4 0.0.0.3 area 0`
- **B.** `network 10.1.1.0 0.0.0.3 area 0`
- **C.** `network 10.1.1.5 0.0.0.0 area 0`
- **D.** `network 10.1.1.8 0.0.0.3 area 0`
- **E.** `network 10.1.1.4 0.0.0.3 area 1`

<details><summary>Answer</summary>

**Answer: A, C.** A `network` command enables OSPF on every interface whose IP falls inside the address and wildcard. A covers 10.1.1.4–10.1.1.7, which includes .5. C uses a 0.0.0.0 wildcard to match exactly 10.1.1.5, a precise and popular style. **Why not the others:** B covers .0–.3 and D covers .8–.11, and neither includes .5. E matches the interface but puts it in Area 1, not Area 0.
</details>

**Q2.** What is the wildcard mask for a /28 subnet (255.255.255.240)?

- **A.** 0.0.0.7
- **B.** 0.0.0.15
- **C.** 0.0.0.16
- **D.** 0.0.0.240

<details><summary>Answer</summary>

**Answer: B.** Subtract each octet from 255: 255 − 240 = 15. That flips every bit of the mask, so the 4 host bits become the "anything goes" part. **Why not the others:** A is a /29's wildcard. C is the block size, one too many. D is the mask's last octet copied unchanged, which would mean the opposite thing.
</details>

**Q3.** R1 uses `router ospf 1` and R2 uses `router ospf 20`. Everything else matches. Will they become neighbors?

- **A.** No, the process IDs must match.
- **B.** Yes, the process ID only matters inside each router.
- **C.** Only if both are in Area 0.
- **D.** Only if R2 changes to `router ospf 1`.

<details><summary>Answer</summary>

**Answer: B.** The process ID is locally significant: it just labels the OSPF process inside one router and is never sent in a Hello. **Why not the others:** A and D treat the process ID like the area ID, which *must* match. C, the area must match, but any area number works as long as both sides agree.
</details>

## 16.9 OSPF Neighbor Requirements (Why Friendships Fail)

For two routers to become OSPF neighbors, these must match:
- Same **area**.
- Same **subnet** (on the connecting link).
- Same **Hello** and **Dead** timers.
- Matching **authentication** (if used).
- Compatible **MTU**.

If any of these differ, they won't become neighbors — a very common exam troubleshooting scenario!

**Why must all these match — why is OSPF so picky?** Because two routers can only build the **same shared map** if they agree on the ground rules. Each requirement guards against a specific way the map could get corrupted or the friendship could silently fail:

- **Same area:** Areas define *which map you're part of*. Two routers in different areas are working on different maps, so they have no shared map to sync — becoming full neighbors would be meaningless.
- **Same subnet on the link:** OSPF assumes neighbors share a direct wire. If their IPs are on different subnets, they aren't really "next to each other" in IP terms, and their Hello packets look invalid to each other.
- **Same Hello/Dead timers:** These are the heartbeat. Hello says "I'm alive" every few seconds; Dead is "if I don't hear a Hello for this long, assume you died." If the timers disagree, one router might declare the other dead while the other thinks everything's fine — chaos. They must agree on the heartbeat rhythm.
- **Matching authentication:** If OSPF security is on, a router without the right password is *deliberately* rejected — that's the whole point of authentication (keeping rogue routers out of your map).
- **Compatible MTU:** MTU is the biggest frame size a link allows. If they disagree, one router might send a map-update packet too big for the other to receive, so the sync **stalls forever** at the exchange stage — a nasty, subtle failure.

*So OSPF isn't being difficult for no reason — each match requirement protects the integrity of the shared map or the reliability of the neighbor relationship.* This is exactly why "OSPF neighbors won't form" is such a common troubleshooting question: you just walk down this list checking which agreement broke.

**📝 Exam-style questions — 16.9**

**Q1.** Refer to the exhibit. R1 and R2 are directly connected but `show ip ospf neighbor` is empty on both. What is the cause?

```
R1# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.12.1/30, Area 0, Attached via Network Statement
  Process ID 1, Router ID 1.1.1.1, Network Type POINT_TO_POINT, Cost: 1
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5

R2# show ip ospf interface GigabitEthernet0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.12.2/30, Area 0, Attached via Network Statement
  Process ID 20, Router ID 2.2.2.2, Network Type POINT_TO_POINT, Cost: 1
  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5
```

- **A.** The process IDs don't match.
- **B.** The Hello and Dead timers don't match.
- **C.** The router IDs are different.
- **D.** The interfaces are in different subnets.

<details><summary>Answer</summary>

**Answer: B.** R1 uses 10/40 and R2 uses 5/20. Hellos carry both values, and a router silently ignores Hellos whose timers differ from its own, so the routers never see each other. **Why not the others:** A, process IDs are local and never need to match. C, router IDs *must* be different; identical ones would be the problem. D, 10.0.12.1/30 and 10.0.12.2/30 are in the same subnet.
</details>

**Q2.** Which two settings must match for two routers to become OSPF neighbors? (Choose two.)

- **A.** Area ID on the connecting interfaces
- **B.** Hello and Dead intervals
- **C.** OSPF process ID
- **D.** Router ID
- **E.** Interface OSPF priority

<details><summary>Answer</summary>

**Answer: A, B.** Both are carried in the Hello and checked by the receiver, along with the subnet, authentication and stub flags. **Why not the others:** C is local to each router. D must be *unique*, not the same. E only affects the DR election; neighbors can have any priorities.
</details>

**Q3.** Two OSPF neighbors have different interface MTUs. Where does their adjacency usually get stuck?

- **A.** Down
- **B.** Init
- **C.** ExStart or Exchange
- **D.** Full

<details><summary>Answer</summary>

**Answer: C.** Hellos are small and get through, so the routers see each other. The database description packets carry the MTU and can be large, so the exchange never completes. **Why not the others:** A and B are where Hello problems show up (timers, area, ACLs). D means everything worked.
</details>

---

## 16.10 OSPF Network Types & the DR/BDR Election

Section 16.9 listed what must match for OSPF neighbors to form. One item on that list — **network type** — deserves a proper explanation, because it changes *how* OSPF behaves on a link and it brings in two roles the exam loves: **DR** and **BDR**.

### The Problem: Too Many Friendships

Picture five OSPF routers all connected to the **same switch** (one shared Ethernet segment). OSPF's instinct is for every router to become neighbors with every other router. How many adjacencies is that?

If all five routers on a segment became neighbors with each other, you'd get a
full mesh:

| Routers | Adjacencies — n(n−1)/2 |
|---------|------------------------|
| 5 | 5 × 4 ÷ 2 = **10** |
| 10 | 10 × 9 ÷ 2 = **45** |
| 20 | 20 × 19 ÷ 2 = **190** |

The count grows with the **square** of the number of routers — all flooding the
same information over one shared segment.

Every one of those adjacencies means hellos, database exchanges, and updates. Add a router and the count grows roughly with the **square** of the number of routers. On a segment with 20 routers that's 190 adjacencies flooding the same information over and over — enormous waste, since they're all on **one shared segment where everyone hears everything anyway**.

### The Solution: Elect a Spokesperson

On broadcast segments, OSPF elects a **Designated Router (DR)** and a **Backup Designated Router (BDR)**. Every other router (called **DROTHER**) forms a full adjacency **only with the DR and BDR** — not with each other.

Instead, the segment elects a spokesperson:

| Router | Role | Who it's fully adjacent to |
|--------|------|----------------------------|
| **R1** | **DR** | Everyone |
| **R2** | **BDR** | Everyone — listening, ready to take over |
| R3, R4, R5 | **DROTHER** | Only the DR and BDR |

Adjacencies drop from 10 to 7 — and the saving grows quickly as routers are added.

Routers send updates to the DR at multicast address **224.0.0.6**; the DR redistributes to everyone at **224.0.0.5**. *The DR is a librarian: instead of every router telling every other router the news, everyone tells the librarian and the librarian announces it once.*

**Why is there a BDR — why not just re-elect a new DR if the DR fails?** Because a fresh election plus rebuilding every adjacency takes time, and OSPF would be blind during it. The BDR has been **listening to everything all along**, so its database is already current — it can step up almost instantly. *The backup is pre-warmed, not recruited after the fire starts.*

### How the DR Is Elected

1. **Highest OSPF priority wins** (default 1; range 0–255).
2. **Tie? Highest Router ID wins** (the same RID from section 16.7).
3. **Priority 0 means "never eligible"** — a useful way to keep a weak router out of the job.

```
R1(config-if)# ip ospf priority 100     ! make this router the DR
R1(config-if)# ip ospf priority 0       ! this router must never be DR/BDR
```

**The trap that catches people:** the DR election is **not preemptive**. Bring a brand-new router with priority 255 onto a segment that already has a DR, and it will *not* take over — it becomes a DROTHER and waits. The existing DR keeps the job until it fails or OSPF is restarted (`clear ip ospf process`). *This is the opposite of HSRP with `preempt` — a classic exam comparison, so keep them apart: HSRP can be told to take its role back; an OSPF DR never takes the role back on its own.*

```diagram
{
  "type": "compare",
  "title": "Elect the DR and BDR for the five-router segment",
  "prompt": "These are the five routers from the table above, all starting together. Highest priority wins, then highest router ID; priority **0** never takes part. Try setting R1's priority to 0. Then set everyone to priority 1 and watch the router ID decide, and notice R5 still sits out with priority 0 despite the highest router ID. (In real life a newcomer never takes over from a running DR.)",
  "places": [
    "DR",
    "BDR"
  ],
  "fields": [
    {
      "id": "prio",
      "label": "ip ospf priority",
      "kind": "number",
      "rule": "highest",
      "ineligible": 0
    },
    {
      "id": "rid",
      "label": "Router ID",
      "kind": "ip",
      "rule": "highest"
    }
  ],
  "candidates": [
    {
      "label": "R1",
      "values": {
        "prio": 100,
        "rid": "1.1.1.1"
      }
    },
    {
      "label": "R2",
      "values": {
        "prio": 50,
        "rid": "2.2.2.2"
      }
    },
    {
      "label": "R3",
      "values": {
        "prio": 1,
        "rid": "3.3.3.3"
      }
    },
    {
      "label": "R4",
      "values": {
        "prio": 1,
        "rid": "4.4.4.4"
      }
    },
    {
      "label": "R5 (weak router)",
      "values": {
        "prio": 0,
        "rid": "5.5.5.5"
      }
    }
  ]
}
```

### The Two Network Types You Must Know

| Network type | Where it's used | DR/BDR? | Hello / Dead timers |
|--------------|-----------------|---------|---------------------|
| **Broadcast** | Ethernet (LANs, switches) | **Yes** | 10 s / 40 s |
| **Point-to-point** | Serial links, router-to-router | **No** | 10 s / 40 s |

**Why does point-to-point skip the election entirely?** Because the whole DR concept solves a problem that doesn't exist there. With exactly **two** routers on a link, there's only one possible adjacency — n(n-1)/2 = 1. Electing a spokesperson to reduce one adjacency to one adjacency would just add delay for nothing. *No crowd, no need for a spokesperson.*

This is also why a common optimization exists: a link between two routers on Ethernet is *technically* a broadcast segment, so OSPF holds a pointless election and waits through it. Telling OSPF the truth about the link skips that:

```
R1(config-if)# ip ospf network point-to-point   ! only 2 routers here — skip DR/BDR
```

**Remember from 16.9:** hello and dead timers **must match** between neighbors, and network type must be compatible — mismatches are a top cause of adjacencies that never form.

### Verifying

```
R1# show ip ospf neighbor
Neighbor ID   Pri  State           Dead Time  Address      Interface
2.2.2.2       1    FULL/DR         00:00:35   10.1.1.2     GigabitEthernet0/0
3.3.3.3       1    FULL/BDR        00:00:33   10.1.1.3     GigabitEthernet0/0
4.4.4.4       1    2WAY/DROTHER    00:00:31   10.1.1.4     GigabitEthernet0/0
```

**Read that third line carefully — `2WAY/DROTHER` is not a failure.** Two DROTHERs on a segment deliberately stop at **2WAY** and never reach FULL with each other, because they only need full adjacency with the DR and BDR. Seeing 2WAY between DROTHERs is **normal and correct**; panicking about it is a classic beginner mistake. *FULL with the DR and BDR, 2WAY with everyone else — that's a healthy broadcast segment.*

**📝 Exam-style questions — 16.10**

**Q1.** Refer to the exhibit. R5 is on the same Ethernet segment. Which statement is true?

```
R5# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1         100   FULL/DR         00:00:36    10.10.10.1      GigabitEthernet0/0
2.2.2.2          50   FULL/BDR        00:00:38    10.10.10.2      GigabitEthernet0/0
3.3.3.3           1   2WAY/DROTHER    00:00:33    10.10.10.3      GigabitEthernet0/0
4.4.4.4           0   2WAY/DROTHER    00:00:35    10.10.10.4      GigabitEthernet0/0
```

- **A.** R5 is a DROTHER, and every relationship shown is normal.
- **B.** R5 has an MTU mismatch with 3.3.3.3 and 4.4.4.4.
- **C.** R5 is the BDR.
- **D.** 4.4.4.4 will become the DR if 1.1.1.1 fails.

<details><summary>Answer</summary>

**Answer: A.** R5 lists the DR and the BDR as *other* routers, so it's neither: it's a DROTHER. DROTHERs go FULL with the DR and BDR and deliberately stop at 2WAY with each other. **Why not the others:** B, an MTU problem shows up as EXSTART or EXCHANGE, not a clean 2WAY. C, 2.2.2.2 is already the BDR, and a segment has only one. D, 4.4.4.4 has priority 0, so it can never be DR or BDR. If the DR fails, the BDR (2.2.2.2) takes over.
</details>

**Q2.** Four routers start at the same moment on one Ethernet segment. Which routers become DR and BDR?

| Router | Priority | Router ID |
|---|---|---|
| R1 | 10 | 10.0.0.1 |
| R2 | 10 | 10.0.0.2 |
| R3 | 0 | 10.0.0.99 |
| R4 | 5 | 10.0.0.50 |

- **A.** DR R3, BDR R4
- **B.** DR R2, BDR R1
- **C.** DR R1, BDR R2
- **D.** DR R4, BDR R2

<details><summary>Answer</summary>

**Answer: B.** R3 is out (priority 0). R1 and R2 tie on the highest priority, 10, so the higher router ID wins: R2 is DR. The BDR election runs again without R2, and R1's priority of 10 beats R4's 5. **Why not the others:** A, R3 has the highest router ID but priority 0 means "never". C reverses the router-ID tie-breaker. D, R4's priority (5) is lower than R1 and R2's (10), and priority is checked before router ID.
</details>

**Q3.** A segment has a working DR (priority 1) and BDR. An engineer connects a new router with `ip ospf priority 255`. What happens?

- **A.** The new router becomes DR immediately.
- **B.** The new router becomes BDR immediately, and DR at the next Hello.
- **C.** The new router becomes a DROTHER; the existing DR and BDR keep their roles.
- **D.** All routers restart the election.

<details><summary>Answer</summary>

**Answer: C.** The OSPF DR election isn't preemptive. A newcomer, however high its priority, accepts the current DR and BDR and only stands a chance when one of them fails (or OSPF is restarted). **Why not the others:** A and B describe preemption, which OSPF doesn't do. D, a new router joining never forces a new election.
</details>

**Q4.** Which two statements about the DR and BDR are true? (Choose two.)

- **A.** DROTHERs send their updates to the DR and BDR at 224.0.0.6.
- **B.** A DR and BDR are elected on point-to-point links.
- **C.** A router with OSPF priority 0 can never become DR or BDR.
- **D.** The DR election is preemptive by default.
- **E.** The default OSPF interface priority is 0.

<details><summary>Answer</summary>

**Answer: A, C.** DROTHERs tell the DR and BDR on AllDRouters (224.0.0.6), and the DR repeats it to everyone on 224.0.0.5. Priority 0 takes a router out of the election completely. **Why not the others:** B, point-to-point links have only one possible neighbor, so there's no election. D, it's non-preemptive. E, the default is 1; if it were 0, nobody could ever be DR.
</details>

---

> **One item on that list needs its own section.** "Network type" decides whether OSPF holds an election on the link — which brings in the **DR** and **BDR** roles. That's section **16.10**, next.

---

## 16.11 OSPF Internals — Adjacency States, LSAs and SPF

> 🔬 **Depth section.** CCNA asks you to configure single-area OSPF and read `show ip ospf neighbor`. CCNP assumes you know what's underneath. This is that layer.

### The Neighbor State Machine

`show ip ospf neighbor` prints a **state**, and each one means a specific step completed. When an adjacency is stuck, the state tells you exactly where:

| State | What's happening | Stuck here usually means |
|-------|------------------|--------------------------|
| **Down** | No hellos heard | Interface, cabling, or OSPF not enabled |
| **Init** | I heard their hello, but *I'm* not listed in it | One-way communication — often an ACL or wrong subnet mask |
| **2-Way** | We each see ourselves in the other's hello | **Normal** between two DROTHERs (16.10) |
| **ExStart** | Electing master/slave to sequence the exchange | **MTU mismatch** — the classic cause |
| **Exchange** | Trading database descriptions (DBDs) | MTU or unstable link |
| **Loading** | Requesting the LSAs I'm missing | Rare; usually resolves |
| **Full** | Databases synchronized | Healthy |

```diagram
{
  "type": "sequence",
  "title": "From Down to Full: one adjacency, state by state",
  "caption": "R1 (RID 1.1.1.1) and R2 (RID 2.2.2.2) on a point-to-point link, so there's no DR election to wait for. Press **Next** and watch the state chips change.",
  "actors": [
    {
      "id": "R1",
      "kind": "router",
      "label": "R1 (1.1.1.1)"
    },
    {
      "id": "R2",
      "kind": "router",
      "label": "R2 (2.2.2.2)"
    }
  ],
  "messages": [
    {
      "note": "OSPF enabled, nothing heard yet",
      "over": [
        "R1",
        "R2"
      ],
      "states": {
        "R1": "Down",
        "R2": "Down"
      },
      "text": "Both routers are **Down** toward each other: no Hello received. Stuck here means the basics: interface down, OSPF not enabled on it, or something dropping multicast."
    },
    {
      "from": "R1",
      "to": "R2",
      "label": "Hello (I've seen: nobody)",
      "detail": "to 224.0.0.5, area 0, hello 10 / dead 40",
      "states": {
        "R2": "Init"
      },
      "text": "R2 checks the Hello: area, subnet, timers, authentication all match. It now knows R1 exists, so it moves to **Init**. But R1's Hello doesn't list R2 yet, so the conversation is one-way."
    },
    {
      "from": "R2",
      "to": "R1",
      "label": "Hello (I've seen: 1.1.1.1)",
      "detail": "to 224.0.0.5",
      "states": {
        "R1": "2-Way"
      },
      "text": "R1 finds its **own** router ID in R2's Hello: R2 hears it. Two-way communication is proven, so R1 jumps to **2-Way**."
    },
    {
      "from": "R1",
      "to": "R2",
      "label": "Hello (I've seen: 2.2.2.2)",
      "detail": "to 224.0.0.5",
      "states": {
        "R2": "2-Way"
      },
      "text": "R2 sees itself in R1's Hello and reaches **2-Way** too. On Ethernet, this is where the DR election happens, and two DROTHERs stop here for good."
    },
    {
      "from": "R1",
      "to": "R2",
      "label": "DBD (empty): I'll be master",
      "detail": "seq 5000, MTU 1500",
      "states": {
        "R1": "ExStart",
        "R2": "ExStart"
      },
      "text": "**ExStart.** Each side sends an empty database description claiming to be master. The DBD carries the interface **MTU**: if the MTUs differ, the DBD is rejected and the routers sit in ExStart (or Exchange) forever."
    },
    {
      "from": "R2",
      "to": "R1",
      "label": "DBD (empty): no, I will",
      "detail": "seq 9000, RID 2.2.2.2 is higher",
      "text": "R2 has the higher router ID, so R2 is **master** and owns the sequence numbers. R1 agrees to be slave."
    },
    {
      "from": "R1",
      "to": "R2",
      "label": "DBD: my LSA headers",
      "detail": "seq 9000 (the master's number)",
      "states": {
        "R1": "Exchange",
        "R2": "Exchange"
      },
      "text": "**Exchange.** They trade **summaries** of their databases: just LSA headers (who made it, which type, which version), not the full LSAs. Each side notes which LSAs it's missing or has an older copy of."
    },
    {
      "from": "R2",
      "to": "R1",
      "label": "DBD: my LSA headers",
      "detail": "seq 9001",
      "text": "The master steps the sequence number; the slave echoes it. That's how both sides know nothing was lost."
    },
    {
      "from": "R1",
      "to": "R2",
      "label": "LSR: send me these LSAs",
      "states": {
        "R1": "Loading"
      },
      "text": "**Loading.** R1 asks for the full copies of the LSAs it's missing with a Link-State Request."
    },
    {
      "from": "R2",
      "to": "R1",
      "label": "LSU: the full LSAs",
      "dashed": true,
      "text": "R2 sends them in a Link-State Update. Every LSU is acknowledged, so flooding is reliable."
    },
    {
      "from": "R1",
      "to": "R2",
      "label": "LSAck",
      "dashed": true,
      "states": {
        "R1": "Full",
        "R2": "Full"
      },
      "tone": "good",
      "text": "Databases match: both routers are **Full**. Each now runs SPF over the identical LSDB and installs its best routes. `show ip ospf neighbor` shows `FULL/  -` on a point-to-point link."
    }
  ]
}
```

**Why is there a master/slave election in ExStart, when the routers are peers?** Because the database exchange needs a **single sequence-number owner**. If both sides numbered their own DBD packets, neither could tell a retransmission from a new one. Electing one side (**higher Router ID wins**) to drive the sequence makes the conversation unambiguous.

**Why does an MTU mismatch strand adjacencies at ExStart/Exchange specifically?** Because DBD packets can be large. If one router's MTU is smaller, it silently drops the oversized DBD — hellos (small) still arrive, so the neighbour *appears* reachable, but the exchange never completes. *This is why "stuck in EXSTART" should make you check `show interface | include MTU` before anything else.*

### LSA Types — the Building Blocks of the Map

OSPF doesn't advertise routes; it advertises **link-state advertisements** that every router assembles into an identical map.

| Type | Name | Describes | Scope |
|------|------|-----------|-------|
| **1** | Router LSA | A router's own links | Within its area |
| **2** | Network LSA | A broadcast segment, generated by the **DR** | Within its area |
| **3** | Summary LSA | A network in *another* area, from the **ABR** | Between areas |
| **4** | ASBR Summary | How to reach an ASBR | Between areas |
| **5** | External LSA | A route redistributed from outside OSPF, from the **ASBR** | Whole domain |
| **7** | NSSA External | An external route inside a not-so-stubby area | That area only |

Types **1 and 2** are the ones a CCNA-level single-area network uses. The rest appear the moment you add areas or redistribution — which is precisely where CCNP begins.

**Why does the DR generate a separate Type 2 instead of every router describing the segment?** Because a shared segment is one shared object. Ten routers each describing "I connect to this Ethernet" would give ten partial views to reconcile. The DR — already elected as the segment's spokesperson — publishes **one** authoritative description listing everyone attached. *One shared fact, one advertiser.*

### From Database to Routing Table

The pipeline runs in three steps:

1. **LSAs flood** across the area, filling an **LSDB** that is *identical* on every router.
2. Each router independently runs **Dijkstra's SPF** over that database, building
   a shortest-path tree with **itself** at the root.
3. The best path to each destination drops into that router's **routing table**.

**Why must every router in an area hold an identical database?** Because each one computes its own tree from it. If two routers disagreed about the map, they'd compute incompatible paths and could forward packets to each other in a loop. **Identical input + deterministic algorithm = consistent forwarding**, with no router needing to trust another's conclusion. *That's the fundamental difference from distance-vector protocols like RIP, which believe what neighbours tell them and can loop when neighbours are wrong.*

Cost is `reference bandwidth ÷ interface bandwidth`, with a default reference of **100 Mbps**. That default is a fossil: it makes 100 Mbps, 1 Gbps and 10 Gbps all compute to cost 1, because the answer floors at 1. On any modern network you raise it:

```
R1(config-router)# auto-cost reference-bandwidth 100000   ! in Mbps = 100 Gbps
```

Set it **identically on every router** — mismatched reference bandwidths mean routers disagree about which path is cheapest.

### Area Types (Your CCNP Runway)

Areas exist to bound flooding and SPF work. **Special area types go further, trading detail for simplicity:**

| Area type | Blocks | Routers get instead |
|-----------|--------|---------------------|
| **Standard** | nothing | full detail |
| **Stub** | Type 5 externals | a default route |
| **Totally stubby** (Cisco) | Types 3, 4, 5 | a default route |
| **NSSA** | Type 5, but allows Type 7 | local externals + default |

**Why would you deliberately deny a router information?** Because detail costs memory and CPU on every SPF run, and a branch office with one exit link cannot *use* the detail. If every route leaves through the same door, knowing 10,000 destinations beyond it changes nothing — "everything else goes that way" is equally correct and vastly cheaper. **NSSA** exists for the awkward middle case: a stub area that nonetheless has its own external route to inject, which plain stub rules would forbid.

**📝 Exam-style questions — 16.11**

**Q1.** Refer to the exhibit. The adjacency has been in this state for several minutes. What is the most likely cause?

```
R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           0   EXSTART/  -     00:00:37    10.0.12.2       GigabitEthernet0/1
```

- **A.** An MTU mismatch between R1 and R2
- **B.** A Hello timer mismatch
- **C.** An area ID mismatch
- **D.** An authentication mismatch

<details><summary>Answer</summary>

**Answer: A.** EXSTART means Hellos are working (the routers see each other) but the database exchange can't get going. That's the classic sign of mismatched MTUs: check `show interfaces` on both ends. **Why not the others:** B, C and D are all checked on the Hello itself. Any of them would stop the neighbor from appearing at all, rather than stranding it at EXSTART.
</details>

**Q2.** What does the Init state mean in `show ip ospf neighbor`?

- **A.** The two routers have synchronized their databases.
- **B.** This router has received a Hello from the neighbor, but its own router ID isn't listed in that Hello yet.
- **C.** The routers are electing a master and slave.
- **D.** The router is requesting LSAs it is missing.

<details><summary>Answer</summary>

**Answer: B.** Init is one-way communication: "I can hear you, but you haven't heard me yet." If it stays like that, something is blocking traffic in one direction. **Why not the others:** A is Full. C is ExStart. D is Loading.
</details>

**Q3.** Which LSA type does the DR create to describe a broadcast segment?

- **A.** Type 1
- **B.** Type 2
- **C.** Type 3
- **D.** Type 5

<details><summary>Answer</summary>

**Answer: B.** The Type 2 network LSA lists every router attached to the segment, published once by the DR. **Why not the others:** A, every router creates its own Type 1 router LSA. C, Type 3 summary LSAs come from ABRs. D, Type 5 external LSAs come from ASBRs.
</details>

**Q4.** During ExStart, two OSPF neighbors elect a master to control the DBD sequence numbers. Which router becomes master?

- **A.** The router with the higher OSPF priority
- **B.** The router with the higher router ID
- **C.** The DR
- **D.** The router that sent its Hello first

<details><summary>Answer</summary>

**Answer: B.** The master/slave decision uses router ID only. The master owns the sequence numbers so both sides can tell a retransmission from a new packet. **Why not the others:** A, priority only affects the DR election. C, being DR doesn't make a router master; the router ID decides. D, timing doesn't matter.
</details>

---

<a name="chapter-17"></a>
# Chapter 17: DHCP, DNS, NAT & Other Helpers

## 17.1 DHCP — Automatic IP Addresses

![The DHCP DORA exchange](images/dhcp_dora.png)

**DHCP (Dynamic Host Configuration Protocol)** hands out IP addresses **automatically**. Without it, you'd type an IP into every phone and laptop by hand. Yuck!

### The DHCP Handshake: D-O-R-A

**Story Time 📖:** When your laptop joins Wi‑Fi, it does a little four-step dance to get an address:

| Step | Direction | The message |
|------|-----------|-------------|
| 1. **DISCOVER** | Client → (broadcast) | *"Any DHCP servers out there?"* |
| 2. **OFFER** | Server → Client | *"Yes — here's an address you can use."* |
| 3. **REQUEST** | Client → Server | *"Great, I'd like that one please."* |
| 4. **ACK** | Server → Client | *"It's yours. Here are the details."* |

Remember **DORA**: **D**iscover, **O**ffer, **R**equest, **A**ck.

DHCP gives you: an **IP address**, **subnet mask**, **default gateway**, and **DNS server** — everything needed to get online.

**Why does the very first step (Discover) have to be a BROADCAST?** Because of a chicken-and-egg problem: the laptop needs an IP address to communicate normally... but it doesn't *have* one yet, and it doesn't know the DHCP server's address either! It can't send a normal unicast message ("Hey server 10.0.0.5, give me an IP") because it knows neither its own address nor the server's. So it does the only thing possible: it **shouts to everyone** (broadcast `FF:FF:FF:FF:FF:FF`) — "Is *anybody* here a DHCP server?" A broadcast is the one kind of message you can send when you know nothing about the network yet. *That's why DHCP must start with a broadcast — it's the only way to talk before you have an identity.*

**Why does the client "REQUEST" an address it was just OFFERED — didn't the server already give it one?** Two reasons. First, there might be **multiple DHCP servers**, each sending an Offer. The client picks one and the Request announces "I'm taking *this* one" so the others know to release their offers. Second, the Offer is only a *tentative* reservation; the Request→Ack step is the formal "yes I want it / it's confirmed yours" handshake, so both sides agree on the final lease. *It's like being offered a hotel room — you still have to say "yes, I'll take it" before it's truly booked.*

### Configuring a DHCP Server on a Router

```
R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10  ! don't hand these out
R1(config)# ip dhcp pool LAN_POOL
R1(dhcp-config)# network 192.168.1.0 255.255.255.0   ! range to give out
R1(dhcp-config)# default-router 192.168.1.1          ! the gateway
R1(dhcp-config)# dns-server 8.8.8.8                  ! DNS to use
R1(dhcp-config)# lease 7                             ! address lasts 7 days
```

**Why "exclude" some addresses, and why do leases expire?** You *exclude* the low addresses (like .1–.10) because those are usually your **fixed infrastructure** — the router/gateway, switches, servers — which need *permanent, predictable* addresses. If DHCP handed .1 to a random laptop, it might collide with your router! So you carve those out. And **leases expire** because addresses are a *limited, reusable* resource: when a guest's laptop leaves the coffee shop, you want its address back in the pool for the next customer. A lease is a "rental with a return date" — if the device is still around, it renews; if it vanished, the address is reclaimed. *Without expiring leases, a busy network would slowly run out of addresses given to devices that left long ago.*

### DHCP Relay (Helper Address)
DHCP uses broadcasts, which routers don't forward. If your DHCP server is on **another** network, configure a **helper address** so requests get relayed:
```
R1(config-if)# ip helper-address 10.0.0.5   ! forward DHCP to this server
```

**Why is a helper address even necessary?** Here's the conflict: DHCP Discover is a **broadcast**, but (from Chapter 6/11) **routers deliberately do NOT forward broadcasts** — that's their job, to contain broadcast domains! So a laptop's "any DHCP servers?" shout dies at the router and never reaches a server sitting on a different network. In the real world, companies don't put a DHCP server on every single subnet — they run **one central server** for everyone. The `ip helper-address` command is the fix: it tells the router "when you hear a DHCP broadcast, *make an exception* — convert it to a unicast and forward it to the real server at 10.0.0.5." *So the helper address is the deliberate bridge across the very broadcast boundary the router normally enforces* — letting one central DHCP server serve many subnets.

```diagram
{
  "type": "sequence",
  "title": "DORA across a router: what ip helper-address does",
  "caption": "The PC is on 192.168.10.0/24 behind R1's Gi0/0 (192.168.10.1); the DHCP server is 10.0.0.5, on another subnet. Press **Next**.",
  "actors": [
    {
      "id": "PC",
      "kind": "host",
      "label": "PC"
    },
    {
      "id": "R1",
      "kind": "router",
      "label": "R1 (relay)"
    },
    {
      "id": "SRV",
      "kind": "server",
      "label": "DHCP 10.0.0.5"
    }
  ],
  "messages": [
    {
      "from": "PC",
      "to": "R1",
      "label": "DISCOVER",
      "detail": "0.0.0.0:68 → 255.255.255.255:67",
      "states": {
        "PC": "SELECTING"
      },
      "text": "The PC has no address and doesn't know the server's, so it **broadcasts** from 0.0.0.0. A router never forwards broadcasts, so without help this would die at R1."
    },
    {
      "from": "R1",
      "to": "SRV",
      "label": "DISCOVER (relayed)",
      "detail": "unicast to 10.0.0.5, giaddr 192.168.10.1",
      "text": "`ip helper-address 10.0.0.5` on Gi0/0 makes R1 turn the broadcast into a **unicast** to the server. R1 writes the address of the interface the request came in on, 192.168.10.1, into the **giaddr** field. That's how the server knows which pool, which subnet, to lease from."
    },
    {
      "from": "SRV",
      "to": "R1",
      "label": "OFFER 192.168.10.21",
      "detail": "unicast back to the giaddr",
      "dashed": true,
      "text": "The server picks a free address from the pool matching 192.168.10.0/24 and sends the offer back to the relay, the only address it can reach."
    },
    {
      "from": "R1",
      "to": "PC",
      "label": "OFFER 192.168.10.21",
      "detail": "mask, gateway .1, DNS 8.8.8.8, lease",
      "dashed": true,
      "text": "R1 passes the offer onto the client's LAN. The offer is tentative: the address is held for the PC but not yet confirmed."
    },
    {
      "from": "PC",
      "to": "R1",
      "label": "REQUEST 192.168.10.21",
      "detail": "broadcast, names server 10.0.0.5",
      "states": {
        "PC": "REQUESTING"
      },
      "text": "The PC still **broadcasts**, on purpose. If several servers made offers, they all hear which one was chosen and can release theirs."
    },
    {
      "from": "R1",
      "to": "SRV",
      "label": "REQUEST (relayed)",
      "detail": "unicast to 10.0.0.5",
      "text": "The helper address relays this broadcast too."
    },
    {
      "from": "SRV",
      "to": "R1",
      "label": "ACK",
      "detail": "lease confirmed",
      "dashed": true,
      "tone": "good",
      "text": "The server records the lease and confirms it."
    },
    {
      "from": "R1",
      "to": "PC",
      "label": "ACK",
      "detail": "192.168.10.21/24, lease 7 days",
      "dashed": true,
      "tone": "good",
      "states": {
        "PC": "BOUND"
      },
      "text": "The PC is **bound**: address, mask, default gateway and DNS server, for the length of the lease. Around halfway through the lease, it renews directly with the server."
    }
  ]
}
```

> **When DHCP fails, the client tells you.** A PC that gets no answer assigns itself a **169.254.x.x** APIPA address — the single fastest clue in networking that DHCP is unreachable. Section **23.6** covers reading that (and the other three numbers) on Windows, macOS and Linux.

**📝 Exam-style questions — 17.1**

**Q1.** In which order are the four DHCP messages exchanged when a client gets a new address?

- **A.** Request, Offer, Discover, Acknowledge
- **B.** Discover, Request, Offer, Acknowledge
- **C.** Discover, Offer, Request, Acknowledge
- **D.** Offer, Discover, Acknowledge, Request

<details><summary>Answer</summary>

**Answer: C.** DORA: the client **D**iscovers, a server **O**ffers, the client **R**equests that offer, and the server **A**cknowledges it. The client sends from UDP port 68 to the server's UDP port 67. **Why not the others:** A and D start with a message that only makes sense as a reply. B has the client requesting before anything has been offered.
</details>

**Q2.** Refer to the exhibit. Which two statements are true? (Choose two.)

```
R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.20
R1(config)# ip dhcp pool VLAN10
R1(dhcp-config)# network 192.168.10.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.10.1
R1(dhcp-config)# dns-server 8.8.8.8
R1(dhcp-config)# lease 7
```

- **A.** Clients receive 192.168.10.1 as their default gateway.
- **B.** Addresses 192.168.10.1 through 192.168.10.20 are never leased.
- **C.** The router can lease 192.168.10.10 to a client.
- **D.** Clients receive 192.168.10.1 as their DNS server.
- **E.** Leases last 7 hours.

<details><summary>Answer</summary>

**Answer: A, B.** `default-router` sets the gateway handed to clients, and `excluded-address` keeps .1–.20 out of the pool for routers, switches and servers. **Why not the others:** C, .10 is inside the excluded range. D, the DNS server is 8.8.8.8, from `dns-server`. E, `lease 7` means 7 **days** (hours and minutes are optional extra arguments).
</details>

**Q3.** Clients in VLAN 20 (R1's interface Gi0/1.20) don't get addresses. The DHCP server is 10.0.0.5, on another subnet reached through Gi0/0. What fixes this?

- **A.** `ip helper-address 10.0.0.5` on Gi0/1.20
- **B.** `ip helper-address 10.0.0.5` on Gi0/0
- **C.** `ip dhcp excluded-address 10.0.0.5` on R1
- **D.** `ip default-gateway 10.0.0.5` on R1

<details><summary>Answer</summary>

**Answer: A.** The helper address goes on the interface that **hears the clients' broadcasts**, the one facing the clients. R1 then relays each DHCP broadcast as a unicast to 10.0.0.5. **Why not the others:** B, no client broadcasts ever arrive on Gi0/0, so a helper there has nothing to relay. C only stops the router's *own* DHCP server from leasing that address. D is for non-routing devices and has nothing to do with DHCP.
</details>

**Q4.** A Windows PC shows the address 169.254.37.12. What does this most likely mean?

- **A.** The PC has a statically configured address.
- **B.** The PC received this address from the DHCP server.
- **C.** The PC got no answer from a DHCP server and assigned itself an APIPA address.
- **D.** The PC is using NAT.

<details><summary>Answer</summary>

**Answer: C.** 169.254.0.0/16 is APIPA (link-local IPv4). A client picks one only after its DHCP Discovers go unanswered, so it's a strong sign that DHCP is broken or unreachable. **Why not the others:** A, nobody configures 169.254.x.x on purpose. B, DHCP servers don't hand out that range. D, NAT happens on the router; it doesn't change the PC's own address.
</details>

## 17.2 DNS — The Internet's Phone Book

**DNS (Domain Name System)** turns **names** (like `www.google.com`) into **IP addresses** (like `142.250.72.4`). Humans remember names; computers need numbers. DNS is the translator.

**Story Time 📖:** DNS is like the contacts app on your phone. You tap "Mom," and the phone dials her actual number. You don't memorize the number — DNS remembers it for you.

1. You type **`www.google.com`**.
2. A **DNS server** answers: *"that's `142.250.72.4`."*
3. Your browser connects to **`142.250.72.4`** — the name was only ever a lookup key. 🌍

Common DNS record types:
- **A** = name → IPv4 address.
- **AAAA** = name → IPv6 address.
- **CNAME** = an alias (nickname) for another name.
- **MX** = mail server for a domain.
- **PTR** = reverse (IP → name).

```diagram
{
  "type": "sequence",
  "title": "Resolving www.example.com from scratch",
  "caption": "The PC asks its local DNS server once. That server (the resolver) does the legwork, starting at the root. Press **Next**.",
  "actors": [
    {
      "id": "PC",
      "kind": "host",
      "label": "PC"
    },
    {
      "id": "RES",
      "kind": "server",
      "label": "Local DNS"
    },
    {
      "id": "ROOT",
      "kind": "server",
      "label": "Root"
    },
    {
      "id": "TLD",
      "kind": "server",
      "label": ".com servers"
    },
    {
      "id": "AUTH",
      "kind": "server",
      "label": "example.com DNS"
    }
  ],
  "messages": [
    {
      "from": "PC",
      "to": "RES",
      "label": "A? www.example.com",
      "detail": "UDP 53, recursive",
      "text": "The PC sends one **recursive** query to the DNS server it got from DHCP: *give me the final answer, whatever it takes.*"
    },
    {
      "note": "Not in cache",
      "over": [
        "RES"
      ],
      "text": "If anyone had asked recently, the answer would be in the resolver's cache and the PC would have it right now. This time it's a miss, so the resolver starts at the top."
    },
    {
      "from": "RES",
      "to": "ROOT",
      "label": "A? www.example.com",
      "text": "The root servers don't know every name. They know who runs each top-level domain."
    },
    {
      "from": "ROOT",
      "to": "RES",
      "label": "Referral",
      "dashed": true,
      "text": "A **referral**, not an answer: *I don't know, but they do.*",
      "detail": "try the .com servers"
    },
    {
      "from": "RES",
      "to": "TLD",
      "label": "A? www.example.com",
      "text": "The resolver asks a .com server."
    },
    {
      "from": "TLD",
      "to": "RES",
      "label": "Referral",
      "dashed": true,
      "text": "Another referral, this time to the **authoritative** servers for example.com, the ones that hold its records.",
      "detail": "try example.com NS"
    },
    {
      "from": "RES",
      "to": "AUTH",
      "label": "A? www.example.com",
      "text": "Third time lucky."
    },
    {
      "from": "AUTH",
      "to": "RES",
      "label": "A 203.0.113.80",
      "detail": "TTL 3600",
      "dashed": true,
      "tone": "good",
      "text": "An actual **A record**. The TTL says how long anyone may cache it: an hour here."
    },
    {
      "from": "RES",
      "to": "PC",
      "label": "A 203.0.113.80",
      "dashed": true,
      "tone": "good",
      "text": "The resolver caches the answer and passes it to the PC, which now connects to **203.0.113.80**. The next PC that asks gets it straight from the cache, which is why most lookups take a millisecond or two."
    }
  ]
}
```

**📝 Exam-style questions — 17.2**

**Q1.** Which DNS record type maps a name to an IPv6 address?

- **A.** A
- **B.** AAAA
- **C.** CNAME
- **D.** PTR

<details><summary>Answer</summary>

**Answer: B.** An AAAA ("quad-A") record holds an IPv6 address. IPv6 addresses are four times as long, hence four As. **Why not the others:** A, an A record is a name to an IPv4 address. C, a CNAME points one name at another name. D, a PTR does the reverse, from an address to a name.
</details>

**Q2.** A user can ping 142.250.72.4 but can't open `www.google.com` in a browser, and `ping www.google.com` says the host couldn't be found. What is the most likely problem?

- **A.** The default gateway is wrong.
- **B.** The PC can't resolve names, so DNS is misconfigured or unreachable.
- **C.** The web server is down.
- **D.** The PC has no IP address.

<details><summary>Answer</summary>

**Answer: B.** The ping to the IP address proves the PC can reach the internet. Only the step that turns the name into an address is failing, and that's DNS. **Why not the others:** A, a wrong gateway would break the ping to 142.250.72.4 as well. C, a down web server would still resolve; the error says the *name* couldn't be found. D, the PC couldn't ping anything without an address.
</details>

**Q3.** Which transport does a typical DNS query use?

- **A.** UDP port 53
- **B.** TCP port 80
- **C.** UDP port 67
- **D.** UDP port 123

<details><summary>Answer</summary>

**Answer: A.** Ordinary lookups are a single question and answer, so DNS uses fast, connectionless UDP 53. TCP 53 is used for zone transfers and answers too large for one UDP packet. **Why not the others:** B is HTTP. C is the DHCP server port. D is NTP.
</details>

## 17.3 NAT — Sharing One Public Address

![PAT translating private hosts to one public IP by port](images/nat.png)

**NAT (Network Address Translation)** lets **many private devices** share **one public IP** to reach the internet. This is why your whole house full of gadgets can use the internet with just one address from your provider.

Several private addresses on the inside — `192.168.1.10`, `.11`, `.12` — all
reach the internet through **one router running NAT**, which translates every one
of them to the single public address **`203.0.113.5`**.

### Types of NAT
- **Static NAT:** One private IP ↔ one public IP (permanent). Used for servers you want reachable.
- **Dynamic NAT:** A pool of public IPs shared as needed.
- **PAT (Port Address Translation) / NAT Overload:** **Many** private IPs share **ONE** public IP, using **port numbers** to tell conversations apart. This is what home routers do!

**Story Time 📖:** PAT is like an apartment building with one street address. Mail for everyone uses the same address, but the **apartment number** (port) makes sure each letter reaches the right person.

**How does PAT actually keep everyone's traffic straight with only ONE public IP? Why do ports make this work?** This is the clever core of how your home internet works, so let's trace it. When three PCs all browse the web through one public IP, the router needs a way to remember "which reply belongs to which PC." It uses a **translation table** keyed by **port numbers**:

PAT translation table (simplified):

| Private (inside) | becomes | Public (outside) |
|------------------|---------|------------------|
| `192.168.1.10 : 51000` | → | `203.0.113.5 : 40001` |
| `192.168.1.11 : 49200` | → | `203.0.113.5 : 40002` |
| `192.168.1.12 : 51000` | → | `203.0.113.5 : 40003` |

When PC .10 sends a request, the router rewrites the source to `203.0.113.5 : 40001` and **notes that in the table**. When the web server replies to `203.0.113.5 : 40001`, the router looks up port 40001, sees "that's really 192.168.1.10," and forwards it back to the right PC. *The port number is the claim ticket* — it's how the router tells apart hundreds of conversations that all share one public address. Notice even when two PCs happen to use the same private port (51000 above), the router just assigns them **different public ports** (40001 vs 40003), so there's never confusion. **Why does this matter so much?** Because it's the trick that lets a whole house — or a whole company — share a single public IPv4 address, which (along with private addressing) is a huge reason we didn't run out of IPv4 years ago. One public address can support *thousands* of simultaneous conversations, each tracked by its port.

```diagram
{
  "type": "topology",
  "title": "PAT in action: one public address, many conversations",
  "caption": "R1 runs `ip nat inside source list 1 interface gi0/1 overload`; Gi0/1's address is 203.0.113.5. Press **Next** to follow two PCs that happen to pick the same source port.",
  "nodes": [
    {
      "id": "PC1",
      "kind": "host",
      "x": 0,
      "y": 0,
      "sub": "192.168.1.10"
    },
    {
      "id": "PC2",
      "kind": "host",
      "x": 0,
      "y": 1.8,
      "sub": "192.168.1.11"
    },
    {
      "id": "R1",
      "kind": "router",
      "x": 1.7,
      "y": 0.9,
      "sub": "203.0.113.5"
    },
    {
      "id": "INET",
      "kind": "cloud",
      "x": 3.2,
      "y": 0.9,
      "label": "Internet"
    },
    {
      "id": "WEB",
      "kind": "server",
      "x": 4.7,
      "y": 0.9,
      "label": "Web server",
      "sub": "198.51.100.7"
    }
  ],
  "links": [
    {
      "a": "PC1",
      "b": "R1"
    },
    {
      "a": "PC2",
      "b": "R1"
    },
    {
      "a": "R1",
      "b": "INET",
      "aLabel": "outside"
    },
    {
      "a": "INET",
      "b": "WEB"
    }
  ],
  "zones": [
    {
      "label": "inside (private)",
      "nodes": [
        "PC1",
        "PC2"
      ],
      "tone": "muted"
    }
  ],
  "steps": [
    {
      "title": "1. PC1 opens a web connection",
      "text": "PC1 sends from **192.168.1.10:51000** to 198.51.100.7:443. That source can't be used on the internet: 192.168.1.0/24 is private, and thousands of other networks use it too.",
      "packets": [
        {
          "path": [
            "PC1",
            "R1"
          ],
          "label": "192.168.1.10:51000"
        }
      ]
    },
    {
      "title": "2. R1 rewrites the source",
      "text": "The packet goes from an `ip nat inside` interface to an `ip nat outside` one and matches ACL 1, so R1 rewrites the source to **203.0.113.5:51000** (it keeps the port when it's free) and records the pair in its translation table.",
      "nodes": {
        "R1": {
          "badge": "1 entry",
          "tone": "accent"
        }
      },
      "packets": [
        {
          "path": [
            "R1",
            "INET",
            "WEB"
          ],
          "label": "203.0.113.5:51000"
        }
      ]
    },
    {
      "title": "3. PC2 picks the same port",
      "text": "PC2 also sends from port **51000**. Port 51000 on 203.0.113.5 is already taken by PC1, so R1 picks another free port, here **1024**. Now each conversation has its own public address *and port* combination.",
      "nodes": {
        "R1": {
          "badge": "2 entries",
          "tone": "accent"
        }
      },
      "packets": [
        {
          "path": [
            "PC2",
            "R1",
            "INET",
            "WEB"
          ],
          "label": "203.0.113.5:1024"
        }
      ]
    },
    {
      "title": "4. The reply finds its way home",
      "text": "The server replies to **203.0.113.5:1024**. R1 looks up port 1024, finds *192.168.1.11:51000*, rewrites the destination and delivers it to PC2. The port is the claim ticket.",
      "nodes": {
        "PC2": {
          "badge": "got reply",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "WEB",
            "INET",
            "R1",
            "PC2"
          ],
          "label": "to 203.0.113.5:1024",
          "tone": "good"
        }
      ]
    },
    {
      "title": "5. Nobody can start a conversation from outside",
      "text": "An outside host tries to connect to 203.0.113.5 on port 8080. No translation entry matches, because none was created from inside, so R1 has nowhere to send it and drops it. That's why a server that must be reachable gets **static NAT** instead.",
      "nodes": {
        "PC2": null,
        "R1": {
          "badge": "no entry",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "WEB",
            "INET",
            "R1"
          ],
          "label": "to 203.0.113.5:8080",
          "tone": "bad"
        }
      ]
    }
  ]
}
```

### Configuring PAT (NAT Overload)
```
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255   ! who gets translated
R1(config)# interface gi0/0
R1(config-if)# ip nat inside              ! the private side
R1(config)# interface gi0/1
R1(config-if)# ip nat outside             ! the internet side
R1(config)# ip nat inside source list 1 interface gi0/1 overload   ! PAT!
```

### Configuring Static NAT (One-to-One)
```
R1(config)# ip nat inside source static 192.168.1.50 203.0.113.10
R1(config)# interface gi0/0
R1(config-if)# ip nat inside
R1(config)# interface gi0/1
R1(config-if)# ip nat outside
```
**When would you want this instead of PAT?** When traffic needs to reach *in* from the internet — a web or mail server. PAT builds its table only when an **inside** device starts a conversation, so an outsider has no entry to match and can't get in. A **static** mapping is permanent and works in **both** directions, giving that one server a fixed, reachable public address.

### Configuring Dynamic NAT with a Pool
```
R1(config)# ip nat pool MYPOOL 203.0.113.10 203.0.113.20 netmask 255.255.255.0
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# ip nat inside source list 1 pool MYPOOL      ! add 'overload' for PAT on the pool
```
Here devices are handed a public address from the pool **as needed**. *The catch:* when the pool runs out, further devices simply **fail** to get translated — which is exactly why PAT (with `overload`) is far more common. Adding `overload` to the same command lets the whole pool be shared by ports too, combining both ideas.

### Verifying Any Flavor of NAT
```
R1# show ip nat translations      ! the live translation table
R1# show ip nat statistics        ! hits, misses, which pool/ACL is in use
R1# clear ip nat translation *    ! wipe dynamic entries (useful when testing)
```

**Why must you label interfaces `inside` and `outside`?** Because NAT has to know *which direction* traffic is going to translate it correctly — it rewrites private→public on the way *out* and public→private on the way *back in*. Telling the router which side is the private "inside" and which is the internet-facing "outside" is what lets it apply the translation in the right direction. And the keyword **`overload`** is literally what turns plain NAT into *PAT* — it means "overload one public address with many conversations by using ports," exactly the port-tracking trick above.

**📝 Exam-style questions — 17.3**

**Q1.** Refer to the exhibit. Which two statements are true? (Choose two.)

```
R1# show ip nat translations
Pro Inside global         Inside local          Outside local         Outside global
tcp 203.0.113.5:51000     192.168.1.10:51000    198.51.100.7:443      198.51.100.7:443
tcp 203.0.113.5:1024      192.168.1.11:51000    198.51.100.7:443      198.51.100.7:443
--- 203.0.113.10          192.168.1.50          ---                   ---
```

- **A.** 203.0.113.5 is an inside global address.
- **B.** 192.168.1.11 is an inside global address.
- **C.** The third line is a static one-to-one translation for 192.168.1.50.
- **D.** 198.51.100.7 is an inside local address.
- **E.** Port Address Translation is not in use.

<details><summary>Answer</summary>

**Answer: A, C.** Inside global is how an inside host appears on the internet, here the shared public 203.0.113.5. A line with no protocol and no ports is a permanent static mapping, so 192.168.1.50 always appears as 203.0.113.10. **Why not the others:** B, 192.168.1.11 is the private, inside *local* address. D, 198.51.100.7 is the outside web server. E, two inside hosts share 203.0.113.5 and are told apart by port, which is exactly PAT. R1 even gave the second host port 1024 because 51000 was already taken.
</details>

**Q2.** A router uses dynamic NAT with a pool of five public addresses and no `overload`. Five inside hosts are already using the internet when a sixth host tries. What happens?

- **A.** The sixth host shares an address with another host by using a different port.
- **B.** The sixth host's traffic isn't translated, so it can't reach the internet until an address frees up.
- **C.** The router automatically adds a sixth public address to the pool.
- **D.** The oldest translation is deleted to make room.

<details><summary>Answer</summary>

**Answer: B.** Without `overload`, dynamic NAT is one inside host per public address. With the pool empty, the router has nothing to translate the sixth host to, so its packets fail. **Why not the others:** A describes PAT, which only happens with `overload`. C, the router can only use the addresses you put in the pool. D, active translations stay until they time out or are cleared.
</details>

**Q3.** Refer to the exhibit. Inside hosts can't reach the internet. What is wrong?

```
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255
R1(config)# interface gi0/0
R1(config-if)# ip nat inside
R1(config-if)# interface gi0/1
R1(config-if)# ip nat inside
R1(config-if)# exit
R1(config)# ip nat inside source list 1 interface gi0/1 overload
```

- **A.** The ACL must be an extended ACL.
- **B.** Gi0/1, the internet-facing interface, must be `ip nat outside`.
- **C.** `overload` can't be used with an interface.
- **D.** The ACL should permit the public address.

<details><summary>Answer</summary>

**Answer: B.** NAT translates traffic that goes from an *inside* interface to an *outside* interface. With both marked inside, nothing ever crosses that boundary, so nothing is translated. **Why not the others:** A, a standard ACL is the normal way to say *who* gets translated. C, `interface gi0/1 overload` is the classic PAT command: share that interface's own address. D, the ACL matches the inside *private* sources, not the public address.
</details>

**Q4.** A company's web server at 192.168.1.50 must be reachable from the internet at a fixed public address. Which type of NAT fits?

- **A.** Static NAT
- **B.** Dynamic NAT
- **C.** PAT using the outside interface address
- **D.** No NAT; private addresses are routable on the internet

<details><summary>Answer</summary>

**Answer: A.** A static mapping is permanent and works in both directions, so outside users always find the server at the same public address. **Why not the others:** B and C only create translations when an *inside* host starts a conversation, so an outsider has no entry to land on. D, private ranges are not routed on the internet.
</details>

## 17.4 NTP — Keeping Time in Sync

**NTP (Network Time Protocol)** keeps all devices' clocks in sync (UDP port **123**). Why care? Three concrete reasons the exam and real life share:

- **Correlating logs.** When something breaks, you line up syslog entries from five devices to reconstruct the story. If R1 thinks it's 09:14 and R2 thinks it's 09:03, the story is unreadable — you literally cannot tell which failure came *first*, which is the entire question.
- **Certificates and authentication.** Certificates are valid *between two timestamps*. A device with a wildly wrong clock rejects perfectly good certificates (breaking SSH/HTTPS) — or accepts expired ones.
- **Time-based features.** ACLs, key rotation and scheduled jobs all trust the clock.

**How it's organized: stratum.** NTP arranges time sources into levels called **stratum** — think "how many steps from the atomic clock." **Stratum 0** is the reference hardware itself (atomic clock, GPS), **stratum 1** is a server directly attached to it, **stratum 2** learns from stratum 1, and so on. **Lower stratum = closer to the truth = more believable.** A device that syncs from a stratum 3 server becomes stratum 4 itself. *Why does this matter?* Given several candidate servers, NTP prefers the lower stratum — and if a device advertises stratum 15+, it's considered barely better than a guess.

```
R1(config)# ntp server 129.6.15.28        ! be a CLIENT of this server
R1(config)# ntp master 3                  ! also SERVE time (as stratum 3)
R1# show ntp status                       ! synchronized? to whom? what stratum?
R1# show ntp associations                 ! all servers it's talking to
```

**The usual design:** one or two routers sync to a public NTP server on the internet, then act as `ntp master` for everything inside. **Why not point all 200 devices at the internet?** The same centralization logic as AAA and DHCP: one controlled place to manage — and if the internet link dies, your devices keep agreeing with *each other*, which is what log correlation actually needs.

**📝 Exam-style questions — 17.4**

**Q1.** Which transport protocol and port does NTP use?

- **A.** TCP 123
- **B.** UDP 123
- **C.** UDP 161
- **D.** UDP 514

<details><summary>Answer</summary>

**Answer: B.** NTP uses UDP 123. **Why not the others:** A, NTP doesn't use TCP. C is SNMP polling. D is syslog.
</details>

**Q2.** R1 synchronizes its clock to an NTP server running at stratum 2. What stratum does R1 become?

- **A.** 1
- **B.** 2
- **C.** 3
- **D.** 16

<details><summary>Answer</summary>

**Answer: C.** Each step away from the reference clock adds one, so learning from stratum 2 makes R1 stratum 3. **Why not the others:** A is a server wired straight to the reference clock. B would mean R1 is as close to the source as its server, which can't be. D, stratum 16 means "not synchronized".
</details>

**Q3.** R2 must get its time from R1 at 10.1.1.1. Which command does the engineer enter on R2?

- **A.** `ntp server 10.1.1.1`
- **B.** `ntp master 10.1.1.1`
- **C.** `clock set 10.1.1.1`
- **D.** `ntp source 10.1.1.1`

<details><summary>Answer</summary>

**Answer: A.** `ntp server` makes the router an NTP client of that address. **Why not the others:** B, `ntp master` makes a router *serve* time from its own clock, and it takes a stratum number, not an address. C sets the clock by hand with a time and date. D chooses which of R2's own interfaces it sends NTP from; it takes an interface name, not a server address.
</details>

## 17.5 Syslog — The Diary of Events

**Syslog** collects **log messages** from devices (errors, warnings, events) in one place. Messages have **severity levels 0–7** (lower = more urgent):

| Level | Name | Meaning |
|-------|------|---------|
| 0 | Emergency | System unusable! |
| 1 | Alert | Act now! |
| 2 | Critical | Serious problem |
| 3 | Error | Something failed |
| 4 | Warning | Might be a problem |
| 5 | Notice | Normal but notable |
| 6 | Informational | Just info |
| 7 | Debug | Super detailed |

**Memory trick:** "**E**very **A**wesome **C**isco **E**ngineer **W**ill **N**eed **I**ce cream **D**aily" → Emergency, Alert, Critical, Error, Warning, Notice, Informational, Debug.

**📝 Exam-style questions — 17.5**

**Q1.** Which syslog severity level is Warning?

- **A.** 2
- **B.** 3
- **C.** 4
- **D.** 5

<details><summary>Answer</summary>

**Answer: C.** Counting from 0: Emergency, Alert, Critical, Error, **Warning** (4), Notice, Informational, Debug. **Why not the others:** A is Critical. B is Error. D is Notice.
</details>

**Q2.** An engineer configures `logging host 10.0.0.50` and `logging trap warnings`. Which messages are sent to the syslog server?

- **A.** Only severity 4
- **B.** Severities 0 through 4
- **C.** Severities 4 through 7
- **D.** All severities, 0 through 7

<details><summary>Answer</summary>

**Answer: B.** A logging level means "this severity *and everything more urgent*". More urgent means a lower number, so warnings sends levels 0, 1, 2, 3 and 4. **Why not the others:** A, a level isn't an exact match. C has the direction backwards; that would bury the server in debug messages. D would need `logging trap debugging`.
</details>

**Q3.** A router logs `%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down`. What is the severity of this message?

- **A.** Error
- **B.** Critical
- **C.** Notice
- **D.** Informational

<details><summary>Answer</summary>

**Answer: A.** The number between the dashes is the severity: 3 is Error. (The `%LINEPROTO-5-UPDOWN` message that usually follows is a 5, Notice.) **Why not the others:** B is 2. C is 5. D is 6.
</details>

## 17.6 SNMP — Watching Devices

**SNMP (Simple Network Management Protocol)** lets a management station monitor and manage many devices (CPU, memory, interface stats). The moving parts have names the exam expects:

| Piece | What it is |
|-------|------------|
| **NMS / manager** | The monitoring station (the software with the dashboards) |
| **Agent** | The small process on each device that answers questions |
| **MIB** | The Management Information Base — the tree of everything askable |
| **OID** | One dotted address into that tree (e.g. `1.3.6.1.…` = "interface 1's byte count") |

Two directions of conversation, and the difference matters:

- **Polling (manager asks):** `Get` reads a value, `Set` changes one. The manager sweeps its devices every few minutes — reliable, but everything between polls is invisible.
- **Traps (agent shouts):** the device sends an unsolicited **trap** the moment something happens ("interface down!"). **Why have both?** Because polling alone means a link can flap and recover *between* two polls and you'd never know; traps alone means a dead device simply goes silent — no agent left to shout. Polling proves devices are alive; traps catch events instantly. Real monitoring uses both.

Versions: **v1** is ancient; **v2c** added better bulk reads but still "secures" everything with a plaintext **community string** — a shared password sent in the clear, usually `public` (read) and `private` (write). **v3** finally adds real **authentication and encryption** — always prefer it, and if you must run v2c, make it read-only with an ACL restricting who may ask.

**📝 Exam-style questions — 17.6**

**Q1.** Which SNMP message does an agent send on its own, without being asked, when an event happens?

- **A.** Get
- **B.** Set
- **C.** Trap
- **D.** GetBulk

<details><summary>Answer</summary>

**Answer: C.** A trap is the agent shouting "something happened!" to the manager, on UDP 162. **Why not the others:** A, B and D are all sent *by the manager* to the agent (on UDP 161): reading a value, changing a value, and reading many values at once.
</details>

**Q2.** Which SNMP version adds authentication and encryption?

- **A.** SNMPv1
- **B.** SNMPv2c
- **C.** SNMPv3
- **D.** All versions use encryption

<details><summary>Answer</summary>

**Answer: C.** SNMPv3 adds user-based authentication and optional encryption, so it's the one to use. **Why not the others:** A and B only have a community string, sent in plain text. D, only v3 encrypts.
</details>

**Q3.** What is the MIB?

- **A.** The monitoring station that collects data
- **B.** The structured collection of every value that can be read or set on a device
- **C.** The password shared between the manager and agent
- **D.** The message an agent sends when an interface goes down

<details><summary>Answer</summary>

**Answer: B.** The Management Information Base is the tree of variables an agent can report, each one addressed by an OID. **Why not the others:** A is the NMS (manager). C is the community string. D is a trap.
</details>

---

## 17.7 QoS — Deciding Who Goes First When the Road Is Full

Every service so far has been about *making things work*. QoS is about what happens when the network is **busy** and not everything can go at once.

**Why is this needed at all — doesn't the network just deliver everything?** It does, until a link fills up. When more traffic arrives at an interface than the link can send, the excess waits in a **queue**. If the queue fills, packets are **dropped**. By default that happens **blindly** — first come, first served — and that default is a disaster for certain traffic:

- A **file download** that arrives 200 ms late: nobody notices. TCP resends a lost packet and the file is fine.
- A **voice call** that arrives 200 ms late: the call breaks up. And a resent voice packet is *useless* — the moment it belonged to has already passed.

That's the core insight: **different traffic has different needs, and the network can't guess them.** A big backup transfer will happily consume every bit of bandwidth available, drowning out the phone call sharing that link — not maliciously, just because nothing told it otherwise. QoS is how you tell the network what matters when there isn't room for everything.

### What Voice and Video Actually Need

| Term | Means | Voice tolerance |
|------|-------|-----------------|
| **Bandwidth** | How much capacity | Small (~80 Kbps per call) |
| **Delay (latency)** | How long the trip takes | < 150 ms one way |
| **Jitter** | *Variation* in delay | < 30 ms |
| **Loss** | Packets dropped | < 1% |

**Why does jitter get its own row — isn't it just delay again?** No, and it's the one people underestimate. Voice must be played back at a **steady rate**. If packets arrive at 20 ms, then 60 ms, then 15 ms apart, the audio stutters even though the *average* delay looks acceptable. Consistency matters more than speed here — *a steady 100 ms beats an erratic 40 ms.*

### The QoS Toolkit (Per-Hop Behavior)

QoS is applied **hop by hop** — each device makes its own decision about traffic passing through it. That's the **PHB (Per-Hop Behavior)**.

**1. Classification** — identify what the traffic *is* (voice? video? email?), by port number, protocol, or incoming marking.

**2. Marking** — write that decision **into the packet header** so later devices don't have to redo the work. The Layer 3 marking is **DSCP** (6 bits in the IP header's ToS field); the Layer 2 marking is **CoS** (3 bits in the 802.1Q tag).

| Traffic | Common DSCP | Value |
|---------|-------------|-------|
| Voice | **EF** (Expedited Forwarding) | 46 |
| Interactive video | AF41 | 34 |
| Signaling (call setup) | CS3 | 24 |
| Best effort (everything else) | BE / Default | 0 |

```diagram
{
  "type": "bits",
  "mode": "dscp",
  "value": 46,
  "title": "Six bits of DSCP",
  "prompt": "DSCP is the top 6 bits of the IP header's ToS byte. Start at **46 (EF, voice)**, then click bits or type **34** (AF41, video), **24** (CS3, signaling) and **0** (best effort). The top three bits are the old IP precedence."
}
```

**Why mark once at the edge instead of classifying at every hop?** Because deep inspection is expensive, and every router repeating it wastes effort. Classify once where the traffic **enters** the network, stamp the verdict on the packet, and every device afterward just reads the stamp. *Do the hard thinking at the door; everyone downstream reads the badge.*

This is also why **trust boundaries** matter: a device decides whether to *believe* incoming markings. You trust the marking from a company IP phone; you do **not** trust it from a random PC, because any user could mark their game traffic EF and promote themselves to the front of every queue.

**3. Queuing** — when traffic is waiting, decide the order it leaves. **LLQ (Low Latency Queuing)** gives voice a **strict priority queue** that is always served first.

**4. Congestion avoidance** — rather than letting a queue fill and then dropping everything at once (**tail drop**), **WRED** drops *some* lower-priority packets early to signal TCP senders to slow down. **Why deliberately drop packets early?** Because tail drop causes **global synchronization**: every TCP sender loses packets simultaneously, all back off together, the link empties, all speed up together, and the link floods again — a sawtooth that wastes capacity. Dropping a few early and selectively keeps the flow smooth.

**5. Policing vs. Shaping** — both limit traffic to a rate, but they differ in what they do with the excess, and that difference is a favorite exam question:

| Tool | Over the limit? | Adds delay? | Feels like |
|---|-----------------|-------------|------------|
| **Policing** | **Drops** the excess | No | Harsh — traffic is simply chopped off |
| **Shaping** | **Buffers** it and sends it later | Yes (needs buffers) | Gentle — the bursts are smoothed out |

*Policing throws away the excess; shaping makes it wait its turn.* Policing is typically applied to **incoming** traffic (an ISP enforcing what you paid for), shaping to **outgoing** traffic (smoothing your own traffic so the far end doesn't have to drop it).

**📝 Exam-style questions — 17.7**

**Q1.** Which DSCP marking is the standard choice for voice traffic?

- **A.** AF41 (34)
- **B.** CS3 (24)
- **C.** EF (46)
- **D.** Default (0)

<details><summary>Answer</summary>

**Answer: C.** Expedited Forwarding, DSCP 46, is the voice marking, and it usually lands in the low-latency priority queue. **Why not the others:** A is interactive video. B is call signaling (setting up the call, not the audio). D is best effort.
</details>

**Q2.** Which two statements about policing and shaping are true? (Choose two.)

- **A.** Policing drops (or re-marks) traffic that exceeds the rate.
- **B.** Shaping buffers excess traffic and sends it later, which adds delay.
- **C.** Shaping drops excess traffic immediately.
- **D.** Policing adds delay because it holds packets in a queue.
- **E.** Both can only be applied to incoming traffic.

<details><summary>Answer</summary>

**Answer: A, B.** Policing chops off whatever is over the limit (or marks it down). Shaping smooths bursts by delaying packets in a buffer. **Why not the others:** C and D swap the two tools' behaviour. E, shaping is normally applied *outbound*, and policing can be applied in either direction.
</details>

**Q3.** Which queuing method gives voice a strict-priority queue that is always served first?

- **A.** FIFO
- **B.** WRED
- **C.** LLQ
- **D.** Tail drop

<details><summary>Answer</summary>

**Answer: C.** Low Latency Queuing adds a strict priority queue, with a policed limit so it can't starve everything else. **Why not the others:** A, first in first out treats every packet the same. B, WRED decides which packets to drop *early*; it doesn't schedule. D, tail drop is just what happens when a queue is full.
</details>

**Q4.** Why does WRED drop some packets before a queue is full?

- **A.** To make every TCP sender slow down at the same moment
- **B.** To nudge some TCP senders to slow down early and avoid global synchronization
- **C.** To give voice traffic more bandwidth
- **D.** To encrypt traffic that is waiting in the queue

<details><summary>Answer</summary>

**Answer: B.** Dropping a few lower-priority packets early makes a few TCP flows back off, gently and at different times. That avoids the sawtooth where every flow loses packets at once (tail drop), all back off, and all ramp up together. **Why not the others:** A is the problem WRED solves, not its goal. C, voice is protected by LLQ, and voice is UDP, so drops don't slow it down anyway. D, queuing has nothing to do with encryption.
</details>

---

<a name="chapter-18"></a>
# Chapter 18: Network Security Basics

## 18.1 The Three Goals: The CIA Triad

Security has three big goals, remembered as **CIA**:

| Goal | Means | In plain terms |
|------|-------|----------------|
| **C**onfidentiality | Secret | Only the right people can see it |
| **I**ntegrity | Correct | The data isn't secretly altered |
| **A**vailability | Working | It's up when you need it |

**Why THREE goals — why not just "keep the bad guys out"?** Because "secure" means different things depending on what you're protecting, and these three cover *all* the ways security can fail. Miss any one and you're vulnerable, even if the other two are perfect:

- **Confidentiality** protects against *the wrong people reading your data* (a hacker stealing passwords). But confidentiality alone isn't enough...
- **Integrity** protects against *data being secretly changed* — imagine a bank transfer where the amount is confidential (nobody can read it) but an attacker still flips $100 to $10,000 in transit. It was secret, but it was *tampered with*. Integrity guards the *correctness* of data.
- **Availability** protects against *the service being knocked offline* — a hacker doesn't need to read or change your data to hurt you; they can just **flood your website until it crashes** (a DoS attack) so real customers can't use it. Perfectly secret, perfectly correct data is useless if nobody can reach it.

*So the triad is a checklist that forces you to think about every angle:* Can the wrong people read it? Can they change it? Can they take it down? Real security needs all three. This is why the exam frames threats by which part of CIA they attack — it tells you what defense you need.

**📝 Exam-style questions — 18.1**

**Q1.** An attacker intercepts a funds transfer and changes the amount from $100 to $10,000 before it reaches the bank. Which part of the CIA triad was attacked?

- **A.** Confidentiality
- **B.** Integrity
- **C.** Availability
- **D.** Accounting

<details><summary>Answer</summary>

**Answer: B.** Integrity means data arrives exactly as it was sent. Changing it in transit breaks integrity, even if nobody outside could read it. Hashes and digital signatures are the usual defense. **Why not the others:** A is about who can *read* the data. C is about whether the service is up. D, accounting is one of the three A's of AAA, not part of the CIA triad.
</details>

**Q2.** A botnet floods a company's web server with traffic until real customers can't load the site. Which security goal is under attack?

- **A.** Confidentiality
- **B.** Integrity
- **C.** Availability
- **D.** Authentication

<details><summary>Answer</summary>

**Answer: C.** A (distributed) denial-of-service attack doesn't steal or change anything. It just makes the service unusable, which is an attack on availability. **Why not the others:** A, nothing is being read. B, nothing is being altered. D, authentication is about proving identity, not part of CIA.
</details>

**Q3.** Encrypting data before sending it across the internet mainly protects which goal?

- **A.** Confidentiality
- **B.** Integrity
- **C.** Availability
- **D.** None; encryption only speeds up transfers

<details><summary>Answer</summary>

**Answer: A.** Encryption turns the data into gibberish for anyone without the key, so only the right people can read it. **Why not the others:** B, encryption on its own doesn't prove the data wasn't altered; that takes a hash or authentication check, which VPNs add alongside encryption. C, encryption does nothing to keep a service online. D, encryption adds work; it never speeds anything up.
</details>

## 18.2 Common Threats (The Bad Guys' Tricks)

- **Malware:** Bad software (viruses, worms, ransomware).
- **Phishing:** Fake emails/sites tricking you into giving passwords.
- **Denial of Service (DoS):** Flooding a system so it can't work.
- **Man-in-the-Middle (MITM):** Secretly sitting between two parties to spy or change data.
- **Spoofing:** Pretending to be someone else (fake IP or MAC).
- **Brute Force:** Trying many passwords until one works.

**📝 Exam-style questions — 18.2**

**Q1.** Employees receive an email that looks like it's from their bank, with a link to a fake login page. Which threat is this?

- **A.** Brute force
- **B.** Phishing
- **C.** Denial of service
- **D.** MAC flooding

<details><summary>Answer</summary>

**Answer: B.** Phishing tricks people into handing over credentials using a convincing fake email or site. **Why not the others:** A guesses passwords rather than tricking someone into typing one. C overwhelms a service. D attacks a switch's MAC table.
</details>

**Q2.** A log shows thousands of failed SSH logins to a router from one address, each trying a different password. Which attack is this?

- **A.** Man-in-the-middle
- **B.** Spoofing
- **C.** Brute force
- **D.** Phishing

<details><summary>Answer</summary>

**Answer: C.** Trying password after password until one works is brute force. Long passwords, lockouts (`login block-for`) and an ACL limiting who can reach SSH all help. **Why not the others:** A sits silently between two parties. B fakes an identity, such as a source address. D tricks a person rather than hammering the device.
</details>

**Q3.** An attacker sends packets with a forged source IP address so they appear to come from a trusted host. What is this called?

- **A.** Spoofing
- **B.** Malware
- **C.** Phishing
- **D.** Brute force

<details><summary>Answer</summary>

**Answer: A.** Spoofing means pretending to be someone else by faking an address (IP or MAC). **Why not the others:** B is malicious software running on a device. C targets people with fake messages. D guesses passwords.
</details>

## 18.3 Layer 2 Attacks & Defenses (CCNA Favorites)

| Attack | What It Does | Defense |
|--------|--------------|---------|
| **MAC flooding** | Fills the switch's MAC table so it floods everything | **Port security** |
| **VLAN hopping** | Sneaks into another VLAN | Disable DTP, change native VLAN |
| **DHCP spoofing** | Fake DHCP server hands out bad info | **DHCP snooping** |
| **ARP spoofing** | Fakes MAC-to-IP mappings (MITM) | **Dynamic ARP Inspection** |
| **Rogue devices** | Unauthorized switch/AP | 802.1X, BPDU Guard |

**Why does MAC flooding work — how does filling a table let an attacker spy?** This one is beautifully sneaky, and it makes sense once you connect it to Chapter 6. Remember: a switch only sends a frame to the *right* port *if it knows* which port the destination MAC is on. And what does a switch do when it *doesn't* know? It **floods** the frame out every port. Now here's the attack: the switch's MAC table has **limited memory**. An attacker blasts the switch with thousands of fake source MAC addresses until the table is **completely full**. With no room left to learn real MACs, the switch is forced to **flood almost everything out every port** — meaning the attacker's port now receives copies of traffic meant for *other* people. They've turned a smart switch back into a dumb hub, and can eavesdrop. *The defense (port security) works by limiting how many MACs a port can present* — so an attacker can't flood thousands of fakes from one port. Understanding *why* the attack works is what makes the defense obvious.

**Why does DHCP spoofing (a rogue DHCP server) matter so much?** Because whoever hands you your network settings controls where your traffic goes! Recall DHCP also gives you your **default gateway** and **DNS server**. A fake DHCP server can tell you "the gateway is *my* address" — so now all your internet traffic flows *through the attacker* (a man-in-the-middle), who can spy or tamper. *That's why DHCP snooping exists:* it only trusts DHCP replies from the ports you designate (toward the real server) and blocks "offers" coming from user ports where a rogue server might hide.

### DHCP Snooping (Trust the Right Ports)
Marks which ports are allowed to send DHCP offers (trusted = toward the real server):
```
SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# interface gi0/1
SW1(config-if)# ip dhcp snooping trust     ! this port leads to the real DHCP server
```

```diagram
{
  "type": "topology",
  "title": "A rogue DHCP server, with and without snooping",
  "caption": "PC1 and an attacker's laptop share VLAN 10 on SW1. The real DHCP server (R1) is up the uplink Gi0/1. Press **Next**.",
  "nodes": [
    {
      "id": "R1",
      "kind": "router",
      "x": 1.75,
      "y": 0,
      "label": "R1",
      "sub": "real DHCP, gw .1"
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 1.75,
      "y": 1.3
    },
    {
      "id": "PC1",
      "kind": "host",
      "x": 0.3,
      "y": 2.6,
      "sub": "Gi0/5"
    },
    {
      "id": "ATK",
      "kind": "host",
      "x": 3.2,
      "y": 2.6,
      "label": "Attacker",
      "sub": "Gi0/9, fake DHCP"
    }
  ],
  "links": [
    {
      "a": "R1",
      "b": "SW1",
      "bLabel": "Gi0/1"
    },
    {
      "a": "SW1",
      "b": "PC1"
    },
    {
      "a": "SW1",
      "b": "ATK"
    }
  ],
  "steps": [
    {
      "title": "1. PC1 shouts for an address",
      "text": "PC1 broadcasts a DHCP **Discover**. A switch floods broadcasts to every port in the VLAN, so the real server **and** the attacker both hear it.",
      "packets": [
        {
          "path": [
            "PC1",
            "SW1",
            "R1"
          ],
          "label": "DISCOVER"
        },
        {
          "path": [
            "PC1",
            "SW1",
            "ATK"
          ],
          "label": "DISCOVER"
        }
      ]
    },
    {
      "title": "2. The attacker answers first",
      "text": "The attacker's laptop is right there and replies first, with an offer that names **itself** as the default gateway. PC1 accepts the first offer it gets.",
      "nodes": {
        "ATK": {
          "badge": "fake OFFER",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "ATK",
            "SW1",
            "PC1"
          ],
          "label": "OFFER gw = attacker",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "3. Man in the middle",
      "text": "Now every packet PC1 sends off its subnet goes to the attacker, who can read or alter it and pass it on to R1 so nothing looks wrong.",
      "nodes": {
        "PC1": {
          "badge": "bad gateway",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "PC1",
            "SW1",
            "ATK",
            "SW1",
            "R1"
          ],
          "label": "PC1's traffic",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "4. Turn on DHCP snooping",
      "text": "`ip dhcp snooping`, `ip dhcp snooping vlan 10`, and `ip dhcp snooping trust` on **Gi0/1** only. Now every other port is **untrusted**: a client may send Discovers and Requests there, but never Offers or Acks.",
      "nodes": {
        "ATK": null,
        "PC1": null,
        "SW1": {
          "badge": "snooping on",
          "tone": "good"
        }
      },
      "links": {
        "R1-SW1": "active"
      }
    },
    {
      "title": "5. The fake offer is dropped",
      "text": "The attacker's Offer arrives on untrusted Gi0/9, so SW1 **drops** it (and logs it). It never reaches PC1.",
      "nodes": {
        "ATK": {
          "badge": "dropped",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "ATK",
            "SW1"
          ],
          "label": "fake OFFER",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "6. The real offer gets through, and is remembered",
      "text": "R1's Offer and Ack come in on trusted Gi0/1 and pass. SW1 writes a **binding**: PC1's MAC, its leased IP, VLAN 10, port Gi0/5. Dynamic ARP Inspection uses that table next.",
      "nodes": {
        "PC1": {
          "badge": "real lease",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "R1",
            "SW1",
            "PC1"
          ],
          "label": "OFFER gw = R1",
          "tone": "good"
        }
      ]
    }
  ]
}
```

```diagram
{
  "type": "topology",
  "title": "ARP spoofing, and how DAI catches it",
  "caption": "PC1 (192.168.10.10) uses R1 (192.168.10.1, MAC 0000.0c11.1111) as its gateway. The attacker is 192.168.10.66 on the same VLAN. Press **Next**.",
  "nodes": [
    {
      "id": "R1",
      "kind": "router",
      "x": 1.75,
      "y": 0,
      "sub": "192.168.10.1"
    },
    {
      "id": "SW1",
      "kind": "switch",
      "x": 1.75,
      "y": 1.3
    },
    {
      "id": "PC1",
      "kind": "host",
      "x": 0.3,
      "y": 2.6,
      "sub": "192.168.10.10"
    },
    {
      "id": "ATK",
      "kind": "host",
      "x": 3.2,
      "y": 2.6,
      "label": "Attacker",
      "sub": "192.168.10.66"
    }
  ],
  "links": [
    {
      "a": "R1",
      "b": "SW1",
      "bLabel": "Gi0/1"
    },
    {
      "a": "SW1",
      "b": "PC1",
      "aLabel": "Gi0/5"
    },
    {
      "a": "SW1",
      "b": "ATK",
      "aLabel": "Gi0/9"
    }
  ],
  "steps": [
    {
      "title": "1. A lie, sent unasked",
      "text": "The attacker sends PC1 an ARP reply nobody asked for (a *gratuitous* ARP): **192.168.10.1 is at the attacker's MAC**. ARP has no authentication, so PC1 simply believes it and overwrites its cache.",
      "nodes": {
        "ATK": {
          "badge": "fake ARP",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "ATK",
            "SW1",
            "PC1"
          ],
          "label": ".1 is at ATTACKER MAC",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "2. PC1's traffic takes a detour",
      "text": "PC1 still sends to 192.168.10.1, but frames go to the attacker's MAC. The attacker reads them and forwards them to R1, a quiet **man-in-the-middle**.",
      "nodes": {
        "PC1": {
          "badge": "cache poisoned",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "PC1",
            "SW1",
            "ATK",
            "SW1",
            "R1"
          ],
          "label": "to the internet",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "3. Turn on Dynamic ARP Inspection",
      "text": "`ip arp inspection vlan 10`, with the uplink Gi0/1 trusted. On every untrusted port, SW1 now checks each ARP message against the **DHCP snooping binding table**, which says Gi0/9 belongs to 192.168.10.66.",
      "nodes": {
        "ATK": null,
        "PC1": null,
        "SW1": {
          "badge": "DAI on",
          "tone": "good"
        }
      }
    },
    {
      "title": "4. The lie is dropped",
      "text": "The attacker repeats the trick: *192.168.10.1 is at my MAC*, arriving on Gi0/9. The binding table says Gi0/9 is 192.168.10.66, not .1, so SW1 **drops** the ARP and logs it. PC1's cache stays correct.",
      "nodes": {
        "ATK": {
          "badge": "ARP dropped",
          "tone": "bad"
        }
      },
      "packets": [
        {
          "path": [
            "ATK",
            "SW1"
          ],
          "label": ".1 is at ATTACKER MAC",
          "tone": "bad"
        }
      ]
    },
    {
      "title": "5. Normal traffic flows",
      "text": "PC1's frames go straight to R1's real MAC. That's why DAI needs DHCP snooping first: the binding table is its source of truth.",
      "nodes": {
        "PC1": {
          "badge": "correct ARP",
          "tone": "good"
        }
      },
      "packets": [
        {
          "path": [
            "PC1",
            "SW1",
            "R1"
          ],
          "label": "to the internet",
          "tone": "good"
        }
      ]
    }
  ]
}
```

**📝 Exam-style questions — 18.3**

**Q1.** Users are receiving the wrong default gateway from a DHCP server someone plugged into an access port. Which switch feature prevents this?

- **A.** Port security
- **B.** DHCP snooping
- **C.** BPDU Guard
- **D.** Dynamic ARP Inspection

<details><summary>Answer</summary>

**Answer: B.** DHCP snooping lets server messages (Offers and Acks) in only on ports you mark as trusted, the ones toward the real server. A rogue server on an access port is ignored. **Why not the others:** A limits which MAC addresses a port accepts, but the rogue server only needs one. C protects STP from switches plugged into PortFast ports. D stops forged ARP replies, not DHCP replies (though it relies on DHCP snooping's records).
</details>

**Q2.** Refer to the exhibit. The real DHCP server is reached through the uplink Gi0/24. A user PC is connected to Gi0/1. What is the result of this configuration?

```
SW1(config)# ip dhcp snooping
SW1(config)# ip dhcp snooping vlan 10
SW1(config)# interface gi0/1
SW1(config-if)# ip dhcp snooping trust
```

- **A.** DHCP works normally for VLAN 10.
- **B.** Clients in VLAN 10 get no addresses, because the server's Offers arrive on untrusted Gi0/24 and are dropped.
- **C.** Every port in VLAN 10 is now trusted.
- **D.** DHCP snooping isn't active, because no SVI exists for VLAN 10.

<details><summary>Answer</summary>

**Answer: B.** Once snooping is on, every port is untrusted unless you say otherwise. Gi0/24, where the real Offers arrive, was never trusted, so they're dropped. Worse, the user port Gi0/1 *is* trusted, so a rogue server there would be believed. The fix is to trust Gi0/24 and remove trust from Gi0/1. **Why not the others:** A, the legitimate server's replies are being dropped. C, only the one port configured with `trust` is trusted. D, DHCP snooping is a Layer 2 feature and needs no SVI.
</details>

**Q3.** Which two statements about Dynamic ARP Inspection (DAI) are true? (Choose two.)

- **A.** DAI drops ARP messages whose IP-to-MAC pairing doesn't match a trusted record.
- **B.** DAI checks ARP messages against the DHCP snooping binding table.
- **C.** DAI stops MAC flooding attacks.
- **D.** DAI replaces the need for DHCP snooping.
- **E.** DAI checks every IP packet, not just ARP.

<details><summary>Answer</summary>

**Answer: A, B.** DAI intercepts ARP on untrusted ports and compares "IP X is at MAC Y" with what DHCP snooping recorded when the address was leased. A lie, such as an attacker claiming the gateway's IP, is dropped. **Why not the others:** C, MAC flooding is stopped by port security. D, DAI *depends* on DHCP snooping's binding table. E, DAI looks only at ARP; checking the source of IP packets is IP Source Guard's job.
</details>

**Q4.** Which two actions help prevent VLAN hopping? (Choose two.)

- **A.** Set user ports to `switchport mode access` so they can't negotiate a trunk with DTP
- **B.** Change the native VLAN on trunks to an unused VLAN
- **C.** Enable DHCP snooping
- **D.** Enable PortFast on access ports
- **E.** Enable `service password-encryption`

<details><summary>Answer</summary>

**Answer: A, B.** VLAN hopping works by tricking a port into trunking (switch spoofing via DTP) or by double-tagging frames that ride the native VLAN. Fixed access ports and an unused native VLAN shut both doors. **Why not the others:** C protects DHCP. D speeds up port startup and has no security effect. E hides passwords in the config file.
</details>

## 18.4 AAA — Who Are You, and What Can You Do?

**AAA** stands for:
- **Authentication:** Who are you? (username/password)
- **Authorization:** What are you allowed to do?
- **Accounting:** What did you do? (logging)

Servers like **RADIUS** and **TACACS+** provide AAA centrally instead of a password on every device.

| Feature | RADIUS | TACACS+ |
|---------|--------|---------|
| Made by | Open standard | Cisco |
| Protocol | UDP | TCP |
| Encrypts | Only password | Whole packet |
| Best for | Network access (Wi‑Fi) | Device admin control |

**Why split security into THREE separate A's?** Because "letting someone in" and "controlling what they do" and "recording what they did" are genuinely different jobs, and you often want them handled differently:

- **Authentication** (who are you?) just proves identity — like showing ID at a door.
- **Authorization** (what can you do?) is separate because *proving who you are doesn't mean you can do everything.* A junior tech might log in successfully (authenticated) but only be allowed to *view* configs, not change them (authorization). Splitting these lets you give different people different powers with the same login system.
- **Accounting** (what did you do?) creates a record — crucial for security investigations ("who changed this at 3am?") and compliance. You want this even for people who *were* allowed to act.

**Why centralize AAA on a server instead of a password on each device?** Imagine 500 switches each with their own local password. An employee leaves — now you must change the password on **all 500** by hand (and you'll miss some). With a central AAA server, you disable **one** account and they're locked out everywhere instantly. *One place to manage identities = far more secure and less error-prone.*

**Why choose TACACS+ vs RADIUS?** Their design differences map to their best use:
- **TACACS+** encrypts the *entire* packet and separates the three A's cleanly, and it's great for **controlling device administrators** (exactly which commands each admin can run). Encrypting everything matters when you're protecting powerful admin actions.
- **RADIUS** encrypts only the password and combines authentication+authorization, which is lighter and fine for **network access** (letting users onto Wi‑Fi). It's an open standard, so it works across all vendors.

*So it's not "which is better" — it's "which fits the job": TACACS+ for admin control, RADIUS for user network access.*

**📝 Exam-style questions — 18.4**

**Q1.** Which part of AAA records which commands an administrator entered and when?

- **A.** Authentication
- **B.** Authorization
- **C.** Accounting
- **D.** Auditing

<details><summary>Answer</summary>

**Answer: C.** Accounting is the record of what was done, the "who changed this at 3 a.m.?" answer. **Why not the others:** A proves who you are. B decides what you may do. D isn't one of the three A's.
</details>

**Q2.** Which two statements about TACACS+ and RADIUS are true? (Choose two.)

- **A.** TACACS+ uses TCP.
- **B.** TACACS+ encrypts the entire packet body.
- **C.** RADIUS encrypts the entire packet.
- **D.** TACACS+ is an open standard.
- **E.** RADIUS uses TCP port 49.

<details><summary>Answer</summary>

**Answer: A, B.** TACACS+ runs over TCP port 49 and encrypts everything after its header, which suits device administration. **Why not the others:** C, RADIUS hides only the password. D, TACACS+ is Cisco's; RADIUS is the open standard. E, RADIUS uses UDP (1812 and 1813); TCP 49 is TACACS+.
</details>

**Q3.** A junior technician can log in to every switch but may only run `show` commands. Which AAA function enforces that limit?

- **A.** Authentication
- **B.** Authorization
- **C.** Accounting
- **D.** Encryption

<details><summary>Answer</summary>

**Answer: B.** Authorization decides what an authenticated user is allowed to do, down to individual commands with TACACS+. **Why not the others:** A already let them in. C only records what they did. D isn't one of the AAA functions.
</details>

## 18.5 Passwords & Best Practices

- Use **strong, long** passwords.
- Use `enable secret` (encrypted) not `enable password` (weak).
- Use **SSH**, never **Telnet**.
- Turn on `service password-encryption`.
- Shut down **unused ports** and put them in an unused VLAN.
- Use a **login banner** warning.
- Keep IOS **updated**.

**📝 Exam-style questions — 18.5**

**Q1.** A router has both `enable password Cisco123` and `enable secret S3cure!` configured. Which password grants privileged EXEC mode?

- **A.** Cisco123
- **B.** S3cure!
- **C.** Either one
- **D.** Neither, because the two commands conflict

<details><summary>Answer</summary>

**Answer: B.** When both exist, `enable secret` always wins, and it's stored as a strong hash. **Why not the others:** A, `enable password` is ignored once a secret exists. C, only the secret is checked, so typing Cisco123 fails. D, there's no conflict; the secret simply takes priority.
</details>

**Q2.** What does `service password-encryption` do?

- **A.** Hashes every password with a strong algorithm
- **B.** Applies weak, reversible Type 7 encryption to plain-text passwords in the configuration
- **C.** Encrypts SSH sessions
- **D.** Encrypts all traffic leaving the router

<details><summary>Answer</summary>

**Answer: B.** It stops someone reading passwords over your shoulder, but Type 7 can be reversed with free tools in seconds, so it's no replacement for `enable secret` and hashed user passwords. **Why not the others:** A describes `enable secret` and `username ... secret`. C, SSH encrypts itself. D, encrypting traffic is a job for a VPN.
</details>

**Q3.** Why is SSH preferred over Telnet for managing network devices?

- **A.** SSH is faster.
- **B.** Telnet sends everything, including passwords, in plain text; SSH encrypts the session.
- **C.** Telnet doesn't work over IPv4.
- **D.** SSH doesn't need a username.

<details><summary>Answer</summary>

**Answer: B.** Anyone capturing Telnet traffic can read the password straight off the wire. SSH encrypts the whole session. **Why not the others:** A, speed isn't the reason. C, Telnet works over IPv4 just fine. D, SSH on IOS needs a username (for example with `login local`).
</details>

## 18.6 802.1X — The Bouncer at the Port

![The three roles of 802.1X](images/dot1x.png)

**802.1X** makes a device **prove who it is** before the switch port lets it onto the network. Three players:
- **Supplicant:** The device trying to connect.
- **Authenticator:** The switch/AP (the bouncer).
- **Authentication Server:** RADIUS (checks the ID).

The device asks to join; the **switch** passes the credentials to a **RADIUS**
server; RADIUS answers **allowed** or **denied**, and the switch opens or keeps
the port shut accordingly.

```diagram
{
  "type": "sequence",
  "title": "802.1X: proving who you are before the port opens",
  "caption": "A laptop plugs into an 802.1X port on SW1. Press **Next** and watch the port state.",
  "actors": [
    {
      "id": "PC",
      "kind": "host",
      "label": "Supplicant (laptop)"
    },
    {
      "id": "SW",
      "kind": "switch",
      "label": "Authenticator (SW1)"
    },
    {
      "id": "RAD",
      "kind": "server",
      "label": "Auth server (RADIUS)"
    }
  ],
  "messages": [
    {
      "note": "Port unauthorized",
      "over": [
        "SW"
      ],
      "states": {
        "SW": "unauthorized"
      },
      "text": "The link is up, but the port carries only **EAPoL** (EAP over LAN). No DHCP, no IP, nothing else until the laptop proves who it is."
    },
    {
      "from": "SW",
      "to": "PC",
      "label": "EAP-Request/Identity",
      "detail": "EAPoL",
      "text": "The switch asks: *who are you?* (A supplicant can also start things itself with an EAPoL-Start.)"
    },
    {
      "from": "PC",
      "to": "SW",
      "label": "EAP-Response/Identity: alice",
      "detail": "EAPoL",
      "text": "The laptop answers with its identity, still in EAPoL frames. It has no IP address to talk to anything else."
    },
    {
      "from": "SW",
      "to": "RAD",
      "label": "RADIUS Access-Request",
      "detail": "EAP inside RADIUS, UDP 1812",
      "text": "The switch doesn't judge credentials itself. It **wraps** the EAP message in RADIUS and passes it to the server. The switch is a relay and a gate, not a judge."
    },
    {
      "from": "RAD",
      "to": "SW",
      "label": "RADIUS Access-Challenge",
      "detail": "pick a method, e.g. PEAP or EAP-TLS",
      "dashed": true,
      "text": "The server starts the chosen EAP method. With EAP-TLS, both sides use certificates (18.8). With PEAP, a TLS tunnel protects a username and password."
    },
    {
      "from": "SW",
      "to": "PC",
      "label": "EAP-Request (method)",
      "detail": "EAPoL",
      "text": "The switch unwraps it and passes it on. Several rounds of this back-and-forth may follow; they're shown here as one."
    },
    {
      "from": "PC",
      "to": "SW",
      "label": "EAP-Response (credentials)",
      "detail": "EAPoL",
      "text": "The laptop answers the challenge with its certificate or its protected credentials."
    },
    {
      "from": "SW",
      "to": "RAD",
      "label": "RADIUS Access-Request",
      "detail": "UDP 1812",
      "text": "Relayed to the server again."
    },
    {
      "from": "RAD",
      "to": "SW",
      "label": "RADIUS Access-Accept",
      "detail": "can also assign a VLAN",
      "dashed": true,
      "tone": "good",
      "text": "The credentials check out. The Accept can carry extras, such as which VLAN to put this user in. A bad login would get an **Access-Reject**, and the port would stay closed."
    },
    {
      "from": "SW",
      "to": "PC",
      "label": "EAP-Success",
      "detail": "EAPoL",
      "dashed": true,
      "tone": "good",
      "states": {
        "SW": "authorized"
      },
      "text": "The port moves to **authorized**. Only now can the laptop send its first DHCP Discover and join the network."
    }
  ]
}
```

**📝 Exam-style questions — 18.6**

**Q1.** In 802.1X, which role does the access switch play?

- **A.** Supplicant
- **B.** Authenticator
- **C.** Authentication server
- **D.** Certificate authority

<details><summary>Answer</summary>

**Answer: B.** The switch is the bouncer: it holds the port closed, passes the credentials along, and opens the port when told to. **Why not the others:** A is the device trying to connect. C is the RADIUS server that actually checks the credentials. D issues certificates and isn't one of the three 802.1X roles.
</details>

**Q2.** Which two protocols carry 802.1X authentication? (Choose two.)

- **A.** EAP over LAN (EAPoL) between the supplicant and the authenticator
- **B.** RADIUS between the authenticator and the authentication server
- **C.** TACACS+ between the supplicant and the authentication server
- **D.** SNMP between the authenticator and the authentication server
- **E.** RADIUS between the supplicant and the authenticator

<details><summary>Answer</summary>

**Answer: A, B.** The client speaks EAPoL to the switch over the wire, and the switch wraps the EAP messages in RADIUS to the server. **Why not the others:** C, the supplicant never talks to the server directly, and 802.1X uses RADIUS, not TACACS+. D, SNMP is for monitoring. E, the supplicant doesn't speak RADIUS; it has no IP access yet.
</details>

**Q3.** An 802.1X port has not yet authenticated the connected PC. Which traffic does the port allow?

- **A.** All traffic, but it's logged
- **B.** Only EAPoL (plus a few control protocols such as CDP and STP)
- **C.** Only DHCP and DNS
- **D.** Only traffic to the RADIUS server

<details><summary>Answer</summary>

**Answer: B.** Until authentication succeeds, the port only carries the authentication conversation itself. No IP traffic gets through, not even DHCP. **Why not the others:** A would make 802.1X pointless. C, DHCP waits until the port is authorized. D, the PC never talks to RADIUS directly; the switch does that.
</details>

## 18.7 VPNs — Secret Tunnels

A **VPN (Virtual Private Network)** creates an **encrypted tunnel** across the public internet so data travels safely, as if on a private line.
- **Site-to-Site VPN:** Connects two offices (via **IPsec**).
- **Remote-Access VPN:** Connects a single user from home (e.g., Cisco AnyConnect/SSL).

Office A and Office B are joined by an **encrypted tunnel** across the public
internet. Anyone intercepting the traffic in between sees only scrambled
gibberish. 🔒

**📝 Exam-style questions — 18.7**

**Q1.** A company wants a permanent encrypted connection over the internet between headquarters and a branch office, with no software on users' PCs. Which solution fits?

- **A.** Site-to-site IPsec VPN
- **B.** Remote-access VPN
- **C.** Telnet
- **D.** Static NAT

<details><summary>Answer</summary>

**Answer: A.** A site-to-site VPN runs between the two offices' routers or firewalls, so users don't need to do anything. **Why not the others:** B connects one user's device and needs client software on it. C is unencrypted remote management. D translates addresses but encrypts nothing.
</details>

**Q2.** Which two statements about VPNs are true? (Choose two.)

- **A.** In a site-to-site VPN, the end hosts don't know the tunnel exists.
- **B.** A remote-access VPN usually needs a VPN client (such as Cisco AnyConnect) or a browser session on the user's device.
- **C.** A site-to-site VPN needs VPN client software on every PC.
- **D.** VPN traffic crosses the internet unencrypted.
- **E.** Remote-access VPNs are used for permanent links between offices.

<details><summary>Answer</summary>

**Answer: A, B.** Site-to-site tunnels are built by the edge devices, invisible to the hosts behind them. Remote access is per user, so the user's device runs the client. **Why not the others:** C describes remote access. D, the whole point of a VPN is encryption across the untrusted network. E, permanent office links are site-to-site.
</details>

---

## 18.8 Beyond Passwords — MFA, Certificates & Biometrics

Section 18.5 covered making passwords strong. But the exam also expects you to know **why the industry is moving past passwords entirely**, and what replaces them.

**What's actually wrong with passwords?** Every weakness comes from the same root: a password is **something you know**, and knowledge can be copied without you noticing. If someone phishes, guesses, or steals your password from a breached website, they now have *exactly* what you have — and nothing about the login looks unusual. You can't tell "the real user typed it" from "an attacker typed it," because they're the same event.

### The Three Authentication Factors

| Factor | Means | Examples |
|--------|-------|----------|
| **Something you know** | Knowledge | Password, PIN |
| **Something you have** | Possession | Phone app, token, smart card |
| **Something you are** | Inherence | Fingerprint, face, retina |

**MFA (Multi-Factor Authentication)** requires **two or more different factors**. The emphasis on *different* is the whole point: a password plus a security question is **not** MFA, because both are things you know and a single phishing page harvests both. A password plus a code from your phone *is* MFA — the attacker now needs to steal a **physical object** too, which is dramatically harder to do remotely and at scale.

**Certificates** replace the shared secret with a **key pair**. Your device proves its identity by signing something with a private key that **never leaves the device** — so there's no secret in transit to intercept and nothing on the server worth stealing. This is what 802.1X (section 18.6) uses in its strongest form, and why certificate-based Wi-Fi authentication beats a shared password.

**Biometrics** are convenient but come with a permanent catch worth stating plainly: **you can't change your fingerprint.** A leaked password is replaced in seconds; leaked biometric data is compromised for life. That's why biometrics are best used as *one* factor unlocking a local device — not as the single credential guarding a system.

**📝 Exam-style questions — 18.8**

**Q1.** Which login method is true multi-factor authentication?

- **A.** A password and a security question
- **B.** A password and a code from an authenticator app on the user's phone
- **C.** Two different passwords
- **D.** A PIN and a password

<details><summary>Answer</summary>

**Answer: B.** That's something you know (the password) plus something you have (the phone). An attacker now needs to steal a physical object as well. **Why not the others:** A, C and D are all two things you *know*, and one phishing page can collect both.
</details>

**Q2.** A fingerprint scan belongs to which authentication factor?

- **A.** Something you know
- **B.** Something you have
- **C.** Something you are
- **D.** Somewhere you are

<details><summary>Answer</summary>

**Answer: C.** Biometrics such as fingerprints and faces are inherence factors: something you are. **Why not the others:** A is passwords and PINs. B is tokens, phones and smart cards. D, location is sometimes used as an extra signal, but a fingerprint isn't one.
</details>

**Q3.** Why is certificate-based authentication stronger than a shared password?

- **A.** Certificates never expire.
- **B.** The private key stays on the device and is never sent, so there's no secret to intercept.
- **C.** Certificates are shorter and easier to remember.
- **D.** Certificates don't need any server to check them.

<details><summary>Answer</summary>

**Answer: B.** The device proves its identity by signing with a private key that never leaves it, so sniffing the exchange gives the attacker nothing reusable. **Why not the others:** A, certificates *do* expire, on purpose. C, nobody memorizes a certificate. D, something still has to validate the certificate, such as the RADIUS server in 802.1X.
</details>

## 18.9 Security Is People, Too — Program Elements

Every control so far has been technical. The exam explicitly covers the **non-technical** side, and there's a good reason: attackers routinely skip the technology entirely.

**Why does this belong in a networking exam?** Because the strongest firewall on earth does nothing when an employee is talked into handing over a password by someone claiming to be IT, or when a visitor walks into an unlocked wiring closet and plugs into a switch. Those attacks don't defeat your controls — they go **around** them. A security program has to cover the paths that aren't cables.

- **User awareness** — organization-wide communication that keeps threats visible: simulated phishing emails, posters, reminders about tailgating. The goal is *recognition* — an employee who has seen a fake login page before is far likelier to spot a real attack.
- **User training** — deeper, often role-specific instruction, usually formal and repeated: how to handle sensitive data, how to report an incident, acceptable use. Awareness raises alertness; training builds skill.
- **Physical access control** — locks, badge readers, cameras, and secured server rooms and wiring closets. **Why does this matter so much?** Because physical access effectively defeats most software security: someone at your switch can plug into any port, reset a device's password through the console, or simply walk out with hardware. *Console access and a paperclip beat any password you configured.*

**📝 Exam-style questions — 18.9**

**Q1.** A company sends employees fake phishing emails every month and shows a short reminder to anyone who clicks. Which security program element is this?

- **A.** User awareness
- **B.** Physical access control
- **C.** AAA
- **D.** 802.1X

<details><summary>Answer</summary>

**Answer: A.** Awareness programs keep threats in front of everyone, and simulated phishing is the classic example. **Why not the others:** B is locks and badges. C and D are technical controls for logins and port access.
</details>

**Q2.** Badge readers and cameras are installed on the doors to the wiring closets. Which security program element is this?

- **A.** User training
- **B.** Physical access control
- **C.** User awareness
- **D.** Accounting

<details><summary>Answer</summary>

**Answer: B.** It controls who can physically reach the equipment, which matters because console access lets someone reset passwords. **Why not the others:** A and C are about people's knowledge and habits. D, accounting logs what users did on a device.
</details>

**Q3.** New help-desk staff attend a formal course on handling customer data and reporting security incidents. Which element is this?

- **A.** User awareness
- **B.** User training
- **C.** Physical access control
- **D.** Authorization

<details><summary>Answer</summary>

**Answer: B.** Training is formal, often role-specific instruction that builds skills. **Why not the others:** A is the broad, ongoing reminder campaign rather than a formal course. C is locks and badges. D is an AAA function on network devices.
</details>

---

<a name="chapter-19"></a>
# Chapter 19: Access Control Lists (ACLs)

## 19.1 What Is an ACL?

An **ACL (Access Control List)** is a set of **rules** that tell a router which traffic to **allow** or **deny**. Think of it as a **bouncer with a guest list** at the door of an interface.

**Story Time 📖:** A bouncer reads names off a list from top to bottom. The FIRST matching rule wins — once he finds your name (allow or deny), he stops reading. And there's a secret rule at the bottom: "anyone NOT on the list, get out!" (the implicit deny).

**📝 Exam-style questions — 19.1**

**Q1.** A router checks a packet against an ACL. The packet matches line 2, which is a `permit`, and it would also match line 4, which is a `deny`. What does the router do?

- **A.** It drops the packet, because a deny always overrides a permit.
- **B.** It permits the packet and stops reading the ACL at line 2.
- **C.** It reads every line and applies the most specific match.
- **D.** It forwards the packet and logs a rule conflict.

<details><summary>Answer</summary>

**Answer: B.** The bouncer reads the list from the top and acts on the **first** name he finds. Line 2 matched, so the packet is permitted and lines 3 onward are never read. **Why not the others:** there's no "deny wins" rule (A); a later deny simply never gets a look. Routers don't hunt for the most specific line (C); that's how a routing table works, not an ACL. And IOS doesn't detect or log "conflicts" between lines (D); it just stops at the first match.
</details>

**Q2.** A packet reaches an interface that has an ACL applied, and the packet matches none of the configured lines. What happens to it?

- **A.** It is forwarded, because no line denied it.
- **B.** It is dropped by the implicit deny at the end of the ACL.
- **C.** It is forwarded and a log message is generated.
- **D.** It is sent to the router's CPU for a routing decision.

<details><summary>Answer</summary>

**Answer: B.** Every ACL ends with an invisible "deny everything else". If a packet gets to the bottom without matching, the secret rule throws it out. **Why not the others:** "not denied" isn't the same as "permitted" (A); the safe default is block. Nothing is logged by the implicit deny (C); you only get log messages from lines that carry the `log` keyword. And the ACL decision has nothing to do with sending the packet to the CPU (D); the packet is simply dropped.
</details>

## 19.2 How ACLs Are Read (Very Important!)

![ACL first-match processing flow](images/acl_flow.png)

- Rules are checked **top to bottom**.
- The **first match wins** — the rest are ignored.
- At the very end there's an **invisible "deny all"** (implicit deny). So if nothing matches, traffic is **blocked**.
- **Order matters!** Put specific rules before general ones.

An ACL is read **top down**, and the **first match wins**:

1. Does the packet match **rule 1**? If yes — do it (permit or deny) and **stop**.
2. If not, try **rule 2**. Match? Do it and **stop**.
3. …and so on down the list.
4. If nothing matched, the **implicit `deny any`** at the end blocks it. 🚫

*Nothing after the first match is ever considered — which is why rule order matters so much.*

**Why does "first match wins" mean ORDER is everything?** Because the router stops reading the instant it finds a match — so a rule placed too early can "steal" traffic before a more specific rule below it ever gets a chance. Classic mistake: if you put `permit any` (allow everyone) at the *top*, every packet matches it immediately and stops — your `deny` rules below are **never even read**. It's like a bouncer whose first list entry says "let everyone in" — the rest of his list is pointless. *So the rule is: specific rules first, general rules last.* This isn't a style preference — it's forced by the first-match-wins behavior.

**Why is there a hidden "deny all" at the bottom?** This is a deliberate **security-first** design choice called *implicit deny*. The philosophy is: "if you didn't *explicitly* say this traffic is allowed, then it's forbidden." The safe default is **block**, not allow — because forgetting to block something dangerous is far worse than forgetting to allow something harmless. *That's why the moment you put ANY ACL on an interface, everything you didn't explicitly permit gets dropped.* It also explains the #1 beginner mistake (below): people write a `deny` rule, forget to add `permit` for everyone else, and accidentally block the *entire* network because the invisible deny-all catches everything they didn't mention.

```diagram
{
  "type": "match",
  "kind": "standard",
  "name": "10",
  "title": "First match wins, then the hidden deny",
  "prompt": "Type a source address, or click a try. Watch which line catches it first, and what happens to addresses no line mentions.",
  "rules": [
    {"action": "deny", "source": "host 192.168.10.50"},
    {"action": "permit", "source": "192.168.10.0 0.0.0.255"},
    {"action": "permit", "source": "host 192.168.20.5"}
  ],
  "input": "192.168.10.77",
  "tries": ["192.168.10.50", "192.168.10.77", "192.168.20.5", "192.168.20.9", "10.0.0.1"]
}
```

**📝 Exam-style questions — 19.2**

**Q1.** Refer to the exhibit. The ACL is applied inbound on the router interface that faces the 10.1.1.0/24 LAN. Host 10.1.1.20 opens a Telnet session to 10.2.2.10. What happens?

```
access-list 110 permit ip 10.1.1.0 0.0.0.255 any
access-list 110 deny tcp 10.1.1.0 0.0.0.255 host 10.2.2.10 eq telnet
access-list 110 deny ip any any
```

- **A.** The session is denied by line 2, because it is more specific than line 1.
- **B.** The session is permitted by line 1, and line 2 is never checked.
- **C.** The session is denied by line 3.
- **D.** The session is denied because IOS moves the deny lines above the permit lines.

<details><summary>Answer</summary>

**Answer: B.** Telnet is carried over IP, so the packet matches line 1 (`permit ip` from 10.1.1.0/24 to anywhere) and the router stops there. Line 2 is "shadowed": nothing it could match ever gets past line 1. To block Telnet, the deny has to come **before** the broad permit. **Why not the others:** ACLs don't prefer the more specific line (A); the first match wins, full stop. Line 3 (C) is only reached by packets that match neither line above it. And IOS doesn't reorder extended ACL lines to put denies first (D); the order you enter is the order it checks.
</details>

**Q2.** An engineer applies this ACL inbound on Gi0/0 and nothing else is configured in it. What is the result?

```
access-list 20 deny 172.16.4.0 0.0.0.255
```

- **A.** Only traffic from 172.16.4.0/24 is dropped; everything else passes.
- **B.** All IPv4 traffic arriving on Gi0/0 is dropped.
- **C.** Nothing is dropped, because an ACL with no permit line is ignored.
- **D.** Only traffic from 172.16.4.0/24 is permitted.

<details><summary>Answer</summary>

**Answer: B.** Line 1 drops 172.16.4.0/24, and the implicit deny at the bottom drops everyone else. The ACL has no permit at all, so nothing gets through. This is the classic beginner mistake from the section above. **Why not the others:** A is what the engineer *meant*, and it needs `access-list 20 permit any` added after the deny. IOS doesn't ignore an ACL just because it lacks a permit (C). And D reverses the line: it says deny, not permit.
</details>

**Q3.** Which two statements about how IOS processes an ACL are true? (Choose two.)

- **A.** Lines are checked from the top down, and processing stops at the first match.
- **B.** An implicit `deny any` is applied to packets that match no line.
- **C.** The router checks every line and uses the most specific match.
- **D.** An implicit `permit any` is applied to packets that match no line.
- **E.** Deny lines are always checked before permit lines.

<details><summary>Answer</summary>

**Answer: A, B.** Top-down, first match wins, and an invisible deny at the bottom: those are the two rules everything else in this chapter builds on. **Why not the others:** "most specific wins" (C) is longest-prefix match from routing, not ACL logic. The hidden last line is a deny, not a permit (D); safe default means block. And there's no priority for deny lines (E); a permit above a deny wins if the packet reaches it first.
</details>

## 19.3 Two Kinds of ACLs

- **Standard ACL:** Filters by **source IP only**. Numbered **1–99** (and 1300–1999). Simple. Place it **close to the destination** (because it can only see the source, placing it too early might block too much).
- **Extended ACL:** Filters by **source AND destination IP, protocol, and port**. Numbered **100–199** (and 2000–2699). Powerful. Place it **close to the source** (block unwanted traffic early to save bandwidth).

**Memory trick:**
- **St**andard = **S**ource only → place near **destination**.
- **Ex**tended = **Ex**tra details → place near **source**.

**Why does a STANDARD ACL go near the DESTINATION — isn't blocking early better?** Here's the trap: a standard ACL can *only* see the **source** address, not the destination. So it's a blunt instrument — it says "block traffic FROM host X" without knowing where that traffic was headed. If you placed it near the **source**, it would block that host's traffic to *everywhere* — including places you wanted to allow! By placing it near the **destination**, you only filter the traffic right before its final stop, so you don't accidentally cut off that host's access to other, legitimate destinations along the way. *Its bluntness forces you to apply it late, close to the one destination you actually mean to protect.*

**Why does an EXTENDED ACL go near the SOURCE?** Because an extended ACL is **precise** — it can match source AND destination AND port, so it knows *exactly* which traffic to drop without collateral damage. Since it's that specific, you want to block unwanted traffic **as early as possible** — right where it enters, near the source. *Why bother?* Efficiency: why let a packet travel across your whole network, eating bandwidth on every link, only to be dropped at the far end? Kill it at the door. *So the placement rules aren't arbitrary — they come directly from how much each ACL type can "see":* blunt tools act late to avoid mistakes, precise tools act early to save resources.

**Where you put the ACL matters as much as what's in it.** Step through the same goal, done three ways:

```diagram
{
  "type": "topology",
  "title": "Where should the ACL go?",
  "caption": "Goal: stop **PC-A** reaching the **HR server**, but let it keep using the **web server**. Press **Next**.",
  "nodes": [
    {"id": "PCA", "kind": "host", "x": 0, "y": 0, "label": "PC-A", "sub": "10.1.1.5"},
    {"id": "R1", "kind": "router", "x": 1.25, "y": 0, "label": "R1"},
    {"id": "R2", "kind": "router", "x": 2.5, "y": 0, "label": "R2"},
    {"id": "R3", "kind": "router", "x": 3.75, "y": 0, "label": "R3"},
    {"id": "HR", "kind": "server", "x": 5, "y": 0, "label": "HR server", "sub": "10.3.3.10"},
    {"id": "WEB", "kind": "server", "x": 2.5, "y": 1.3, "label": "Web server", "sub": "10.2.2.20"}
  ],
  "links": [
    {"a": "PCA", "b": "R1", "bLabel": "Gi0/0"},
    {"a": "R1", "b": "R2"},
    {"a": "R2", "b": "R3"},
    {"a": "R3", "b": "HR", "aLabel": "Gi0/1"},
    {"a": "R2", "b": "WEB"}
  ],
  "steps": [
    {"title": "1. The goal",
     "text": "PC-A (10.1.1.5) must not reach the HR server (10.3.3.10), but it still needs the web server (10.2.2.20). Two kinds of ACL could do it; the question is where each one belongs."},
    {"title": "2. Standard ACL near the source: too blunt",
     "text": "`access-list 10 deny host 10.1.1.5` plus `permit any`, applied **in** on R1 Gi0/0. A standard ACL only sees the **source**, so it drops *everything* PC-A sends, web traffic included. That's the collateral damage the placement rule warns about.",
     "nodes": {"R1": {"badge": "std ACL in", "tone": "bad"}},
     "packets": [{"path": ["PCA", "R1"], "label": "to web: dropped", "tone": "bad"}]},
    {"title": "3. Standard ACL near the destination",
     "text": "Same ACL, applied **out** on R3 Gi0/1 toward the HR server. Now it only filters traffic that is about to reach HR. PC-A's web traffic never passes R3, so it's untouched. *Blunt tool, applied late.*",
     "nodes": {"R1": null, "R3": {"badge": "std ACL out", "tone": "good"}},
     "packets": [{"path": ["PCA", "R1", "R2", "WEB"], "label": "to web: allowed", "tone": "good"},
                 {"path": ["PCA", "R1", "R2", "R3"], "label": "to HR: dropped", "tone": "bad"}]},
    {"title": "4. Extended ACL near the source",
     "text": "`access-list 110 deny ip host 10.1.1.5 host 10.3.3.10` plus `permit ip any any`, applied **in** on R1 Gi0/0. It sees source **and** destination, so it can drop just the HR traffic at the very first hop. The unwanted packet never crosses R1-R2 or R2-R3. *Precise tool, applied early.*",
     "nodes": {"R3": null, "R1": {"badge": "ext ACL in", "tone": "good"}},
     "packets": [{"path": ["PCA", "R1", "R2", "WEB"], "label": "to web: allowed", "tone": "good"},
                 {"path": ["PCA", "R1"], "label": "to HR: dropped", "tone": "bad"}]}
  ]
}
```

**📝 Exam-style questions — 19.3**

**Q1.** Which two number ranges identify extended IPv4 access lists? (Choose two.)

- **A.** 1–99
- **B.** 100–199
- **C.** 1300–1999
- **D.** 2000–2699
- **E.** 200–299

<details><summary>Answer</summary>

**Answer: B, D.** Extended ACLs use 100–199 and the expanded range 2000–2699. **Why not the others:** 1–99 (A) and 1300–1999 (C) are the standard ranges. 200–299 (E) is a real range, but it belongs to an old protocol-type filter, not IPv4 extended ACLs. Memory hook: standard is the small numbers, extended starts at 100.
</details>

**Q2.** An engineer must stop host 10.1.1.5 from reaching server 10.3.3.10 while it keeps access to every other network. The engineer must use a standard ACL. Where should it be applied?

- **A.** Inbound on the router interface closest to host 10.1.1.5
- **B.** Outbound on the router interface that connects to the server's LAN
- **C.** Outbound on the router interface closest to host 10.1.1.5, toward the WAN
- **D.** Inbound on every router interface between the host and the server

<details><summary>Answer</summary>

**Answer: B.** A standard ACL can only see the source, so it would block 10.1.1.5 from *everything* if placed early. Placing it outbound toward the server's LAN means it only judges traffic that is about to reach that LAN. **Why not the others:** A and C sit near the source, so the host would lose every destination beyond that point, not just the server. D multiplies the same problem across the whole path and adds work to every router.
</details>

**Q3.** Why does Cisco recommend placing extended ACLs close to the source of the traffic?

- **A.** Extended ACLs can only match source addresses.
- **B.** They match traffic precisely, so unwanted packets can be dropped early without blocking anything else, saving bandwidth on every later link.
- **C.** IOS only allows extended ACLs to be applied in the inbound direction.
- **D.** Extended ACLs are processed only on the first router a packet reaches.

<details><summary>Answer</summary>

**Answer: B.** An extended ACL knows source, destination, protocol and port, so it can drop exactly the unwanted flow at the first hop and no further link has to carry it. **Why not the others:** A describes a *standard* ACL, which is the reason standard ACLs go near the destination instead. Extended ACLs work in either direction (C). And every router that has an ACL applied checks packets against it (D); the "first router" idea is just the recommended placement, not a rule IOS enforces.
</details>

## 19.4 Wildcard Masks (Again!)

ACLs use **wildcard masks** (the opposite of subnet masks). Remember:
- **0** = "must match exactly."
- **255** = "don't care, anything."

Examples:
- `0.0.0.0` = match one exact host.
- `0.0.0.255` = match a whole /24 network.
- `255.255.255.255` (keyword `any`) = match everything.
- The keyword `host 192.168.1.5` means the same as `192.168.1.5 0.0.0.0`.

The widget below starts on 10.10.8.0/22. Read its **wildcard** line: 0.0.3.255. That's the mask an ACL wants for this block, and it's simply 255.255.255.255 minus the subnet mask. Slide the prefix and watch both change together.

```diagram
{
  "type": "bits",
  "mode": "ipv4",
  "value": "10.10.8.0",
  "prefix": 22,
  "title": "Subnet mask and wildcard mask, side by side",
  "prompt": "Move the prefix length and compare the mask with the wildcard: every 1 in the mask is a 0 in the wildcard (\"must match\"), and every 0 in the mask is a 1 (\"don't care\")."
}
```

Now put wildcards to work. Each line below uses a different mask; test addresses at the edges of each block:

```diagram
{
  "type": "match",
  "kind": "standard",
  "name": "15",
  "title": "Wildcard mask tester",
  "prompt": "Try the edges: the first and last address of each block, and the one just past it. The last line is a trick wildcard: `0.0.0.254` cares only about the lowest bit, so it matches the **even** addresses.",
  "rules": [
    {"action": "permit", "source": "10.10.8.0 0.0.3.255"},
    {"action": "permit", "source": "172.16.32.0 0.0.15.255"},
    {"action": "permit", "source": "host 192.168.1.5"},
    {"action": "permit", "source": "192.168.2.0 0.0.0.254"}
  ],
  "input": "10.10.11.200",
  "tries": ["10.10.8.0", "10.10.11.255", "10.10.12.1", "172.16.47.255", "172.16.48.1", "192.168.1.6", "192.168.2.10", "192.168.2.11"]
}
```

**📝 Exam-style questions — 19.4**

**Q1.** Which wildcard mask matches every address in 172.16.32.0/20?

- **A.** 0.0.15.255
- **B.** 0.0.31.255
- **C.** 255.255.240.0
- **D.** 0.0.16.255

<details><summary>Answer</summary>

**Answer: A.** A /20 mask is 255.255.240.0. Subtract each octet from 255: 0.0.15.255. That covers 172.16.32.0 through 172.16.47.255. **Why not the others:** 0.0.31.255 (B) is the wildcard for a /19, twice as big. 255.255.240.0 (C) is the subnet mask itself; as a wildcard it would "don't care" about the first two octets. And 0.0.16.255 (D) isn't a clean block at all: 16 is binary 00010000, a single don't-care bit, so it would match two scattered /24s instead of one /20.
</details>

**Q2.** Which range of addresses does `access-list 15 permit 10.10.8.0 0.0.3.255` match?

- **A.** 10.10.8.0 – 10.10.8.255
- **B.** 10.10.8.0 – 10.10.11.255
- **C.** 10.10.8.0 – 10.10.15.255
- **D.** 10.10.0.0 – 10.10.3.255

<details><summary>Answer</summary>

**Answer: B.** A wildcard of 3 in the third octet means the last two bits of that octet are "don't care", so it can be 8, 9, 10 or 11. The fourth octet is fully "don't care" (255). Result: 10.10.8.0 to 10.10.11.255, which is a /22. **Why not the others:** A ignores the 3 in the third octet. C would need 0.0.7.255. D starts from the wrong third octet; the ACL's address says 8, not 0.
</details>

**Q3.** Which two ACL address entries match only the single host 192.168.1.5? (Choose two.)

- **A.** `host 192.168.1.5`
- **B.** `192.168.1.5 0.0.0.0`
- **C.** `192.168.1.5 255.255.255.255`
- **D.** `192.168.1.5 0.0.0.255`
- **E.** `192.168.1.0 0.0.0.5`

<details><summary>Answer</summary>

**Answer: A, B.** `host 192.168.1.5` is shorthand for `192.168.1.5 0.0.0.0`: every bit must match, so only one address qualifies. **Why not the others:** a wildcard of 255.255.255.255 (C) means "don't care about any bit", which is the same as `any`. 0.0.0.255 (D) matches the whole 192.168.1.0/24. And 0.0.0.5 (E) is binary 101 in the last octet, so it matches .0, .1, .4 and .5, four hosts, not one.
</details>

**Q4.** Which addresses does `access-list 5 permit 192.168.2.0 0.0.0.254` match?

- **A.** Every address from 192.168.2.0 to 192.168.2.254
- **B.** Only the even-numbered addresses in 192.168.2.0 – 192.168.2.255
- **C.** Only the odd-numbered addresses in 192.168.2.0 – 192.168.2.255
- **D.** Only 192.168.2.0 and 192.168.2.254

<details><summary>Answer</summary>

**Answer: B.** 254 is binary 11111110: the top seven bits of the last octet are "don't care", but the lowest bit must match the address's lowest bit, which is 0. Every number whose lowest bit is 0 is even, so .0, .2, .4 ... .254 match. (Try it in the tester above.) **Why not the others:** A reads the wildcard as if it were an upper bound; it isn't a range. C would need the address to end in an odd number (192.168.2.1 0.0.0.254). D treats the wildcard as a list of two addresses. Wildcards don't have to be contiguous like subnet masks, which is exactly what makes this one a trick.
</details>

## 19.5 Configuring a Standard ACL

**Goal:** Block PC `192.168.1.50` from reaching the network, but allow everyone else.

```
R1(config)# access-list 10 deny host 192.168.1.50   ! block that one PC
R1(config)# access-list 10 permit any               ! allow everyone else
R1(config)# interface gi0/1
R1(config-if)# ip access-group 10 out               ! apply it going OUT
```

> If you forget `permit any`, the implicit deny blocks EVERYONE. A classic mistake!

**📝 Exam-style questions — 19.5**

**Q1.** Refer to the exhibit. After this change, users report that no traffic at all leaves Gi0/1. What is the cause?

```
R1(config)# access-list 10 deny host 192.168.1.50
R1(config)# interface gi0/1
R1(config-if)# ip access-group 10 out
```

- **A.** The ACL is applied in the wrong direction.
- **B.** The ACL has no permit line, so the implicit deny drops every other packet.
- **C.** The `host` keyword can't be used in a standard ACL.
- **D.** Standard ACLs can only be applied inbound.

<details><summary>Answer</summary>

**Answer: B.** Line 1 drops 192.168.1.50 and the invisible deny drops the rest. Adding `access-list 10 permit any` fixes it. **Why not the others:** changing the direction (A) wouldn't help; the ACL would still deny everything, just on the other side. `host` is perfectly valid in a standard ACL (C); it means a 0.0.0.0 wildcard. And standard ACLs work in or out (D).
</details>

**Q2.** Which command applies standard ACL 10 to traffic leaving interface Gi0/1?

- **A.** `R1(config-if)# ip access-group 10 out`
- **B.** `R1(config-if)# access-class 10 out`
- **C.** `R1(config-if)# ip access-list 10 out`
- **D.** `R1(config)# access-group 10 out gi0/1`

<details><summary>Answer</summary>

**Answer: A.** On an interface, `ip access-group <acl> in|out` is the command that applies an ACL. **Why not the others:** `access-class` (B) applies an ACL to VTY lines to control who can SSH or Telnet to the router; it isn't an interface command. `ip access-list` (C) creates a named ACL in global configuration; it doesn't apply one. And D isn't IOS syntax at all.
</details>

**Q3.** Gi0/0 already has `ip access-group 10 in`. The engineer now enters `ip access-group 20 in` on the same interface. What is the result?

- **A.** Both ACLs are checked, ACL 10 first and then ACL 20.
- **B.** ACL 20 replaces ACL 10 on the inbound direction of Gi0/0.
- **C.** IOS rejects the command until ACL 10 is removed.
- **D.** IOS merges the two ACLs into one.

<details><summary>Answer</summary>

**Answer: B.** An interface holds one IPv4 ACL per direction: one in, one out. Applying a second one in the same direction silently replaces the first. **Why not the others:** IOS never chains two ACLs on the same direction (A), and it doesn't merge them (D). It doesn't complain either (C); it just overwrites, which is why it's worth checking `show ip interface` after the change.
</details>

## 19.6 Configuring an Extended ACL

**Goal:** Let LAN users browse the web (HTTP/HTTPS) but block everything else to a server.

```
R1(config)# access-list 100 permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.5 eq 80
R1(config)# access-list 100 permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.5 eq 443
R1(config)# access-list 100 deny ip any any         ! (optional, makes deny visible)
R1(config)# interface gi0/0
R1(config-if)# ip access-group 100 in               ! apply going IN
```

Reading `permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.5 eq 80`:
"Allow TCP from any host in 192.168.1.x to the server 10.0.0.5 on port 80 (web)."

Test the ACL above. It's applied **in** on Gi0/0, the LAN side, so every packet the LAN sends meets it:

```diagram
{
  "type": "match",
  "kind": "extended",
  "name": "100",
  "title": "Extended ACL tester: protocol, source, destination, port",
  "prompt": "Build a packet or click a try. Notice that the final `deny ip any any` doesn't care about the destination: SSH to the server is dropped, and so is HTTPS to a *different* server (10.0.0.6).",
  "rules": [
    {"action": "permit", "proto": "tcp", "src": "192.168.1.0 0.0.0.255", "dst": "host 10.0.0.5", "port": "eq 80"},
    {"action": "permit", "proto": "tcp", "src": "192.168.1.0 0.0.0.255", "dst": "host 10.0.0.5", "port": "eq 443"},
    {"action": "deny", "proto": "ip", "src": "any", "dst": "any"}
  ],
  "input": {"proto": "tcp", "src": "192.168.1.20", "dst": "10.0.0.5", "port": 443},
  "tries": [
    {"proto": "tcp", "src": "192.168.1.20", "dst": "10.0.0.5", "port": 80},
    {"proto": "tcp", "src": "192.168.1.20", "dst": "10.0.0.5", "port": 22},
    {"proto": "icmp", "src": "192.168.1.20", "dst": "10.0.0.5"},
    {"proto": "tcp", "src": "192.168.2.9", "dst": "10.0.0.5", "port": 443},
    {"proto": "tcp", "src": "192.168.1.20", "dst": "10.0.0.6", "port": 443}
  ]
}
```

**📝 Exam-style questions — 19.6**

**Q1.** Refer to the exhibit. The ACL is applied inbound on the interface facing the 192.168.1.0/24 LAN. Which two flows from host 192.168.1.20 are permitted? (Choose two.)

```
access-list 100 permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.5 eq 443
access-list 100 deny ip any host 10.0.0.5
access-list 100 permit ip any any
```

- **A.** HTTPS to 10.0.0.5
- **B.** A ping to 10.0.0.5
- **C.** HTTP (TCP 80) to 10.0.0.5
- **D.** SSH to 10.0.0.9
- **E.** A DNS query to 10.0.0.5

<details><summary>Answer</summary>

**Answer: A, D.** HTTPS to 10.0.0.5 matches line 1 and is permitted. SSH to 10.0.0.9 doesn't match line 1 (wrong destination) or line 2 (also wrong destination), so line 3 permits it. **Why not the others:** a ping (B), HTTP (C) and a DNS query (E) to 10.0.0.5 all miss line 1, which only allows TCP 443, and then hit line 2, which denies anything else to that server.
</details>

**Q2.** Which ACL line permits only HTTPS (TCP 443) from subnet 10.20.0.0/16 to the web server 10.30.1.10?

- **A.** `access-list 120 permit tcp 10.20.0.0 0.0.255.255 host 10.30.1.10 eq 443`
- **B.** `access-list 120 permit tcp host 10.30.1.10 10.20.0.0 0.0.255.255 eq 443`
- **C.** `access-list 120 permit udp 10.20.0.0 0.0.255.255 host 10.30.1.10 eq 443`
- **D.** `access-list 120 permit tcp 10.20.0.0 0.0.255.255 eq 443 host 10.30.1.10`

<details><summary>Answer</summary>

**Answer: A.** The order is protocol, source, destination, then the port, and a port written after the destination is the **destination** port, which is where a web server listens. **Why not the others:** B swaps source and destination, so it matches packets *from* the server. C says UDP, but the question asks for TCP 443. D puts `eq 443` after the source, which matches the client's **source** port; clients pick random high source ports, so real HTTPS requests wouldn't match.
</details>

**Q3.** What does `access-list 101 deny tcp any host 10.1.1.1 eq telnet` match?

- **A.** All TCP traffic to 10.1.1.1
- **B.** Telnet sessions to 10.1.1.1 from any source
- **C.** Telnet sessions that 10.1.1.1 opens to other hosts
- **D.** All IP traffic to 10.1.1.1

<details><summary>Answer</summary>

**Answer: B.** Source `any`, destination `host 10.1.1.1`, destination port 23 (`telnet`): any device trying to Telnet *to* 10.1.1.1. **Why not the others:** A ignores the `eq telnet` part. C reverses the direction; 10.1.1.1 is the destination here, not the source. D would need `ip` instead of `tcp`, and no port.
</details>

## 19.7 Named ACLs (Easier to Read)

Instead of numbers, use names:
```
R1(config)# ip access-list extended WEB_ONLY
R1(config-ext-nacl)# permit tcp any host 10.0.0.5 eq 443
R1(config-ext-nacl)# deny ip any any
```

**📝 Exam-style questions — 19.7**

**Q1.** Refer to the exhibit. The engineer must also allow SSH (TCP 22) to 10.0.0.5, without deleting and retyping the ACL. Which commands do it?

```
R1# show ip access-lists WEB_ONLY
Extended IP access list WEB_ONLY
    10 permit tcp any host 10.0.0.5 eq 443
    20 deny ip any any
```

- **A.** `ip access-list extended WEB_ONLY`, then `15 permit tcp any host 10.0.0.5 eq 22`
- **B.** `ip access-list extended WEB_ONLY`, then `permit tcp any host 10.0.0.5 eq 22`
- **C.** `access-list WEB_ONLY permit tcp any host 10.0.0.5 eq 22`
- **D.** `ip access-list standard WEB_ONLY`, then `15 permit tcp any host 10.0.0.5 eq 22`

<details><summary>Answer</summary>

**Answer: A.** Inside named-ACL mode you can give a line a sequence number, and 15 slots it between 10 and 20, before the deny. **Why not the others:** without a number (B), IOS adds the line at the end as sequence 30, after `deny ip any any`, so it would never match. C uses the numbered-ACL command with a name, which IOS rejects. D opens the wrong type; a standard ACL can't match TCP ports, and WEB_ONLY already exists as an extended list.
</details>

**Q2.** Which two are advantages of named ACLs? (Choose two.)

- **A.** The name can describe the ACL's purpose.
- **B.** In ACL configuration mode, single lines can be removed or inserted by sequence number.
- **C.** Named ACLs have no implicit deny at the end.
- **D.** Named ACLs can filter on MAC addresses for IPv4 traffic.
- **E.** Named ACLs are processed faster than numbered ACLs.

<details><summary>Answer</summary>

**Answer: A, B.** "WEB_ONLY" tells the next engineer what the list is for; "100" doesn't. And editing in place by sequence number beats deleting and retyping the whole list. (Modern IOS lets you edit numbered ACLs this way too, through `ip access-list extended 100`, but it's the named style that introduced it.) **Why not the others:** every ACL, named or numbered, ends in an implicit deny (C). IP ACLs match IP fields; MAC filtering is a different kind of ACL (D). And the name changes nothing about speed (E).
</details>

**Q3.** Which command creates a standard named ACL called MGMT?

- **A.** `ip access-list standard MGMT`
- **B.** `access-list standard MGMT`
- **C.** `ip access-list MGMT standard`
- **D.** `access-list MGMT standard permit any`

<details><summary>Answer</summary>

**Answer: A.** `ip access-list`, then the type, then the name. The prompt changes to `R1(config-std-nacl)#` and you type the lines. **Why not the others:** B and D use the numbered-ACL command, which expects a number, not a type or a name. C has the type and name in the wrong order.
</details>

## 19.8 Checking ACLs
```
R1# show access-lists              ! see all ACLs and hit counts
R1# show ip interface gi0/0        ! see which ACL is applied where
```

**Direction tip:** `in` filters traffic **entering** the interface; `out` filters traffic **leaving** it. Picture yourself standing inside the router looking at each door.

**📝 Exam-style questions — 19.8**

**Q1.** Refer to the exhibit. Users in 10.1.1.0/24 can browse 10.2.2.10 but can't SSH to it. What explains this?

```
R1# show access-lists 110
Extended IP access list 110
    10 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.10 eq www (152 matches)
    20 permit tcp 10.1.1.0 0.0.0.255 host 10.2.2.10 eq 443 (1043 matches)
    30 deny ip any any (12 matches)
```

- **A.** Line 10 is catching the SSH traffic before line 20.
- **B.** No line permits TCP 22, so SSH matches line 30 and is dropped.
- **C.** The ACL isn't applied to any interface.
- **D.** SSH is dropped by the implicit deny, which is why line 30 shows no matches.

<details><summary>Answer</summary>

**Answer: B.** Only ports 80 (`www`) and 443 are permitted. SSH uses TCP 22, misses lines 10 and 20, and lands on line 30. Its 12 matches are a good sign the dropped SSH attempts are being counted. **Why not the others:** line 10 only matches destination port 80 (A). The hit counters prove the ACL is applied and in use (C). And line 30 is an explicit deny that *does* have matches (D); it catches everything before the implicit deny ever could. That's exactly why people add it: to see the counter.
</details>

**Q2.** Which command shows which ACL is applied to Gi0/0, and in which direction?

- **A.** `show ip interface gi0/0`
- **B.** `show interfaces gi0/0`
- **C.** `show access-lists`
- **D.** `show ip interface brief`

<details><summary>Answer</summary>

**Answer: A.** `show ip interface` lists "Outgoing access list is ..." and "Inbound access list is ..." for the interface. **Why not the others:** `show interfaces` (B) gives Layer 1 and 2 counters, not ACLs. `show access-lists` (C) shows the ACLs' contents and hit counts but not where they're applied. `show ip interface brief` (D) only shows address and status.
</details>

**Q3.** R1's Gi0/1 connects to the 192.168.1.0/24 LAN. The engineer wants to filter packets from the LAN hosts as they arrive at R1, before R1 routes them. How should the ACL be applied?

- **A.** `ip access-group` on Gi0/1, direction `out`
- **B.** `ip access-group` on Gi0/1, direction `in`
- **C.** `ip access-group` on the WAN interface, direction `in`
- **D.** `ip access-group` on Gi0/1, in both directions

<details><summary>Answer</summary>

**Answer: B.** Stand inside the router: packets from the LAN come *in* through the Gi0/1 door. An inbound ACL there checks them before the routing decision. **Why not the others:** `out` on Gi0/1 (A) checks packets going *toward* the LAN. The WAN interface inbound (C) checks traffic arriving from the WAN. Both directions (D) needs two ACLs, and the outbound one would filter the wrong traffic.
</details>

---

<a name="chapter-20"></a>
# Chapter 20: Wireless Networking (Wi‑Fi)

## 20.1 How Wireless Works

Wireless uses **radio waves** through the air instead of cables. An **Access Point (AP)** is the device that broadcasts the Wi‑Fi and bridges wireless devices to the wired network.

Wireless clients — phones, laptops — connect over **radio waves** to an
**access point**. The AP is itself plugged into a **switch** on the wired
network, so it acts as the bridge between the two worlds.

**📝 Exam-style questions — 20.1**

**Q1.** Which device converts between 802.11 radio frames and the wired Ethernet network, so wireless clients can reach wired servers?

- **A.** An access point
- **B.** A RADIUS server
- **C.** A Layer 2 switch
- **D.** A Wireless LAN Controller with no APs

<details><summary>Answer</summary>

**Answer: A.** The AP is the bridge between the two worlds: radio on one side, an Ethernet cable to a switch on the other. **Why not the others:** a RADIUS server (B) checks credentials; it never touches radio. A switch (C) only speaks wired Ethernet. And a WLC (D) manages APs but has no radios of its own; without APs, no client can reach it over the air.
</details>

**Q2.** A laptop shows it's connected to the office Wi‑Fi, but it can't reach any server on the wired LAN. You find the AP's Ethernet cable unplugged from the switch, though the AP has power from a separate injector. Why does this break access?

- **A.** The laptop needs the cable for its own IP address configuration.
- **B.** The AP bridges radio clients onto the wired network; without its uplink, clients can reach the AP but nothing beyond it.
- **C.** Wi‑Fi clients always need a wired connection for return traffic.
- **D.** The AP stops sending beacons when the cable is unplugged.

<details><summary>Answer</summary>

**Answer: B.** The radio side still works, which is why the laptop looks "connected", but the bridge to the wired network has no far bank. **Why not the others:** the laptop itself never needs a cable (A); its DHCP request would normally travel *through* the AP's uplink, which is part of the same problem. Return traffic comes back over the air through the AP, not over a separate wire (C). And beacons are a radio function (D); an autonomous AP with power keeps sending them, which is exactly why the laptop could still associate.
</details>

## 20.2 SSID — The Network Name

The **SSID (Service Set Identifier)** is the **Wi‑Fi network's name** you see when you connect (like "CoffeeShop_Guest"). It's just a friendly label for a wireless network.

**📝 Exam-style questions — 20.2**

**Q1.** What is an SSID?

- **A.** The name that identifies a wireless network to clients
- **B.** The MAC address of the AP's radio
- **C.** The pre-shared key used to encrypt the WLAN
- **D.** The channel number the AP transmits on

<details><summary>Answer</summary>

**Answer: A.** The SSID is the friendly network name, such as "CoffeeShop_Guest", that appears in a client's Wi‑Fi list. **Why not the others:** the radio's MAC address (B) is the **BSSID**, a different identifier: one SSID can be served by many BSSIDs. The key (C) is security, not identity. And the channel (D) is a radio setting the SSID says nothing about.
</details>

**Q2.** An office broadcasts the SSID "Corp" from 12 APs, all with the same security settings. A user walks from one end of the building to the other on a call without reconnecting. What makes this possible?

- **A.** Each AP uses a different SSID, and the laptop remembers all of them.
- **B.** The APs share one SSID and security policy, so they form one extended service set the client can roam across.
- **C.** The laptop stays associated to the first AP for the whole walk.
- **D.** Hiding the SSID lets clients move between APs faster.

<details><summary>Answer</summary>

**Answer: B.** When many APs advertise the same SSID with the same security, the client sees one network (an **ESS**, extended service set) and moves between APs as signal strength changes. **Why not the others:** different SSIDs (A) would mean separate networks and a reconnect each time. Staying on the first AP (C) fails as soon as you walk out of its range. And hiding the SSID (D) only stops it appearing in beacons; it does nothing for roaming, and clients still reveal it in probes.
</details>

## 20.3 Frequency Bands & Channels

![2.4 GHz channel overlap: 1, 6 and 11 stay clear](images/wifi_channels.png)

Wi‑Fi uses two main **bands**:

| Band | Speed | Range | Crowded? |
|------|-------|-------|----------|
| **2.4 GHz** | Slower | Longer range, better through walls | Very crowded |
| **5 GHz** | Faster | Shorter range | Less crowded |
| **6 GHz** (Wi‑Fi 6E) | Fastest | Shortest | Newest, roomy |

**Why does 2.4 GHz go FARTHER but 5 GHz go FASTER — what's the tradeoff?** This is physics, and it's the same tradeoff for all radio waves. **Lower frequencies (2.4 GHz) have longer, lazier waves** that push through walls and travel far, but they carry less data. **Higher frequencies (5/6 GHz) have shorter, tighter waves** that carry way more data (faster) but get absorbed by walls and fade over distance. *So there's no "best" band — it's a genuine choice:* need coverage far across a house through walls? 2.4 GHz. Sitting near the router and want speed? 5/6 GHz. It's like sound: a deep bass (low frequency) travels through walls to the next room, while a high-pitched whisper (high frequency) is clearer up close but doesn't carry. **Why is 2.4 GHz so "crowded"?** Because everything uses it — old Wi‑Fi, Bluetooth, microwaves, baby monitors, garage doors — all crammed into a small band, so they interfere. 5/6 GHz have far more room, which is a big reason they're faster in practice.

**Channels** are like lanes on the road. On 2.4 GHz, the **non-overlapping channels are 1, 6, and 11** — using these avoids interference. (Memorize 1, 6, 11!)

In 2.4 GHz, only **channels 1, 6 and 11** are far enough apart not to overlap.
Spacing your APs across those three keeps neighbouring cells from interfering. 👍

**Why specifically 1, 6, and 11 — why not 1, 2, 3?** Because each 2.4 GHz channel is actually **wider than the spacing between channel numbers**, so neighboring channels physically *overlap* and bleed into each other. Picture each channel as a fat highway lane painted wider than the lines: channels 1 and 2 are so close their traffic smears together, causing interference — which is *worse* than being on the same channel! It turns out you need about **5 channels of gap** for two signals not to overlap. Do the math: 1, then 1+5=6, then 6+5=11. Those three are the only combination that fits in the 2.4 GHz band with **zero overlap**. *That's why every Wi‑Fi pro memorizes 1/6/11* — it's the one way to run three nearby access points without them stepping on each other. (This overlap problem is another reason 5 GHz is nicer: it has many more non-overlapping channels to spread out on.)

**📝 Exam-style questions — 20.3**

**Q1.** Which set of 2.4 GHz channels lets three neighbouring APs run with no channel overlap?

- **A.** 1, 6, 11
- **B.** 1, 2, 3
- **C.** 1, 3, 5
- **D.** 6, 8, 10

<details><summary>Answer</summary>

**Answer: A.** Each 2.4 GHz channel is wider than the 5 MHz gap between channel numbers, so you need about five numbers of separation: 1, 6 and 11. **Why not the others:** 1, 2, 3 (B) are almost on top of each other, which is worse than sharing one channel. 1, 3, 5 (C) and 6, 8, 10 (D) are only two numbers apart, so each pair still overlaps.
</details>

**Q2.** A warehouse needs Wi‑Fi coverage at the far end of the building, through several concrete walls. Only a few barcode scanners will connect, and speed doesn't matter. Which band suits it best?

- **A.** 2.4 GHz
- **B.** 5 GHz
- **C.** 6 GHz
- **D.** Any band; range is the same on all of them

<details><summary>Answer</summary>

**Answer: A.** Lower frequencies travel farther and push through walls better. With few clients and no need for speed, 2.4 GHz's crowding and lower throughput don't matter. **Why not the others:** 5 GHz (B) and especially 6 GHz (C) are faster but fade faster and are absorbed more by walls. And range really does depend on frequency (D); that's the core trade-off of this section.
</details>

**Q3.** Which two statements comparing the 2.4 GHz and 5 GHz bands are true? (Choose two.)

- **A.** 5 GHz offers many more non-overlapping channels.
- **B.** 5 GHz passes through walls better than 2.4 GHz.
- **C.** 2.4 GHz shares its spectrum with Bluetooth and microwave ovens.
- **D.** 2.4 GHz has more non-overlapping channels than 5 GHz.
- **E.** 5 GHz has a longer range than 2.4 GHz at the same power.

<details><summary>Answer</summary>

**Answer: A, C.** 5 GHz has room for many non-overlapping 20 MHz channels, while 2.4 GHz has only three. And 2.4 GHz is crowded with non-Wi‑Fi devices such as Bluetooth and microwaves. **Why not the others:** B and E have the physics backwards; higher frequencies fade faster and are absorbed more by walls. D reverses the channel count.
</details>

## 20.4 Wireless Standards (802.11 Family)

| Standard | Nickname | Band | Max Speed |
|----------|----------|------|-----------|
| 802.11b | — | 2.4 GHz | 11 Mbps |
| 802.11g | — | 2.4 GHz | 54 Mbps |
| 802.11n | Wi‑Fi 4 | 2.4 & 5 GHz | 600 Mbps |
| 802.11ac | Wi‑Fi 5 | 5 GHz | ~3.5 Gbps |
| 802.11ax | Wi‑Fi 6/6E | 2.4/5/6 GHz | ~9.6 Gbps |

**Why is Wi‑Fi "half-duplex" and shared — why does it feel slower than the numbers suggest?** Because radio is like **everyone talking in one room** — only one device can transmit at a time on a channel, or the signals collide (this is why Wi‑Fi uses CSMA/**CA**, *collision avoidance* — it can't detect collisions in the air, so it politely waits and avoids them). The more devices on one AP, the more they take turns, so real speed per device drops. *That's why wired connections (full-duplex, own wire) are still preferred for anything that needs guaranteed speed*, and why packing 30 people onto one coffee-shop AP feels sluggish even on fast Wi‑Fi.

**📝 Exam-style questions — 20.4**

**Q1.** Which 802.11 standard operates only in the 5 GHz band?

- **A.** 802.11ac
- **B.** 802.11n
- **C.** 802.11g
- **D.** 802.11ax

<details><summary>Answer</summary>

**Answer: A.** 802.11ac (Wi‑Fi 5) is 5 GHz only. **Why not the others:** 802.11n (B) works in both 2.4 and 5 GHz. 802.11g (C) is 2.4 GHz only. 802.11ax (D) works in 2.4 and 5 GHz, and in 6 GHz as Wi‑Fi 6E.
</details>

**Q2.** A company wants to use the 6 GHz band. Which standard must its APs and clients support?

- **A.** 802.11ac
- **B.** 802.11ax (Wi‑Fi 6E)
- **C.** 802.11n
- **D.** 802.11g

<details><summary>Answer</summary>

**Answer: B.** 6 GHz arrived with Wi‑Fi 6E, the 6 GHz extension of 802.11ax. **Why not the others:** 802.11ac (A) is 5 GHz only, 802.11n (C) is 2.4 and 5 GHz, and 802.11g (D) is 2.4 GHz only. None of them can use 6 GHz.
</details>

**Q3.** Why does 802.11 use CSMA/CA instead of the CSMA/CD that old shared Ethernet used?

- **A.** A radio can't reliably hear a collision while it's transmitting, so stations wait for a clear channel and rely on acknowledgements to avoid collisions instead.
- **B.** Wi‑Fi is full-duplex, so collisions can't happen.
- **C.** Clients transmit and listen at the same time, then send a jam signal when they detect a collision.
- **D.** Each client gets its own dedicated channel from the AP.

<details><summary>Answer</summary>

**Answer: A.** A transmitting radio drowns out what it's listening for, so detection is out. Instead each station checks that the channel is clear, waits a random backoff, and treats a missing ACK as "that probably collided". **Why not the others:** Wi‑Fi on a channel is half-duplex and shared (B), which is the whole problem. C describes CSMA/CD itself, the thing radio can't do. And clients on one AP share the channel (D); they don't get one each.
</details>

## 20.5 Wireless Security

| Standard | Safety | Notes |
|----------|--------|-------|
| **WEP** | ❌ Broken | Ancient, easily cracked — never use |
| **WPA** | ⚠️ Weak | Old |
| **WPA2** | ✅ Good | Uses strong AES encryption; common |
| **WPA3** | ✅✅ Best | Newest, strongest — replaces the PSK handshake with **SAE** |

**What does WPA3's SAE actually fix?** WPA2-Personal has a known weakness: an attacker can record the 4-way handshake from the parking lot and then guess passwords **offline**, millions per second, until one produces the same handshake. WPA3 replaces that handshake with **SAE (Simultaneous Authentication of Equals)** — each connection attempt requires a live exchange with the AP, so there's nothing useful to take home and crack. One guess per attempt, with the AP watching. *Same password, but brute-forcing it now happens at the AP's pace instead of a GPU's.*

Two modes:
- **Personal (PSK):** One shared password. Good for homes.
- **Enterprise (802.1X):** Each user logs in with their own account via RADIUS. Good for businesses.

**Why does wireless need its OWN security when wired networks mostly don't?** Because of one huge difference: **Wi‑Fi signals leak out into the air, past your walls, into the street.** On a wired network, an attacker has to *physically plug in* to eavesdrop. But Wi‑Fi is literally broadcasting your data as radio waves that anyone nearby can *silently capture from a parked car* — no plugging in required. *That's why Wi‑Fi must encrypt everything by default:* without encryption, your traffic is a public radio broadcast. This is also why the security standards keep evolving (WEP→WPA→WPA2→WPA3): as attackers found ways to crack each one, we needed stronger encryption, because the stakes (invisible, remote eavesdropping) are so high.

**Why choose Personal vs Enterprise mode?** With **Personal (PSK)**, *everyone shares one password.* Fine at home, but in a company it's a nightmare: if one employee leaks the password or leaves, you must change it and re-tell *everyone*. And you can't tell who's who — all users look identical. **Enterprise (802.1X)** fixes this by giving *each person their own login* (via a RADIUS server, from Chapter 18). *Why bother?* You can disable one person's access without affecting anyone else, and you get a record of who connected. Same reason we centralize AAA: individual accountability and easy revocation.

**📝 Exam-style questions — 20.5**

**Q1.** A WPA2-Personal network can be attacked by capturing the 4-way handshake and guessing passwords offline. Which WPA3 feature removes that weakness?

- **A.** SAE (Simultaneous Authentication of Equals)
- **B.** TKIP
- **C.** Protected Management Frames (PMF)
- **D.** AES-CCMP

<details><summary>Answer</summary>

**Answer: A.** SAE replaces the PSK handshake with a live exchange, so a captured exchange gives the attacker nothing to test guesses against offline. Each guess needs a fresh attempt against the AP. **Why not the others:** TKIP (B) is the old WPA cipher, weaker than what WPA2 already uses. PMF (C) is also required by WPA3, but it protects management frames such as deauthentication from being forged; it doesn't stop password cracking. AES-CCMP (D) encrypts the data and was already in WPA2, which didn't stop the offline attack.
</details>

**Q2.** A company wants every employee to sign in to Wi‑Fi with their own account, and wants to revoke one person's access without affecting anyone else. Which option meets this?

- **A.** WPA2-Personal with a long pre-shared key
- **B.** WPA3-Enterprise with 802.1X and a RADIUS server
- **C.** WEP with MAC address filtering
- **D.** An open network with a hidden SSID

<details><summary>Answer</summary>

**Answer: B.** Enterprise mode checks each user's own credentials against a RADIUS server, so disabling one account removes only that user. **Why not the others:** a PSK (A) is one shared password; revoking one person means changing it for everyone. WEP (C) is broken, and MAC addresses are easy to spoof. An open network (D) has no authentication or encryption, and hiding the SSID doesn't add either.
</details>

**Q3.** Which two statements about wireless security are true? (Choose two.)

- **A.** WPA2 encrypts with AES (CCMP).
- **B.** WEP is safe as long as it uses a 128-bit key.
- **C.** Enterprise mode authenticates users through 802.1X, usually against a RADIUS server.
- **D.** WPA3 relies on TKIP for encryption.
- **E.** Personal mode gives each user a unique password.

<details><summary>Answer</summary>

**Answer: A, C.** WPA2's strength comes from AES, and Enterprise mode means 802.1X with a RADIUS server behind it. **Why not the others:** WEP's flaw is in how it uses its keys, so a longer key doesn't save it (B). WPA3 uses AES-based ciphers, not TKIP (D). And Personal mode is one shared key for everyone (E); per-user passwords are the Enterprise feature.
</details>

## 20.6 AP Types & Wireless LAN Controllers

- **Autonomous AP:** Standalone, configured one-by-one. Fine for a few APs.
- **Lightweight AP + WLC:** Many APs managed centrally by a **Wireless LAN Controller (WLC)**. The WLC handles settings, security, and roaming for all APs at once — much easier for big networks.

A **WLC** (Wireless LAN Controller) is the brain: the **lightweight APs** below
it hold no configuration of their own and simply carry out its instructions —
which is what makes managing hundreds of APs practical.

The lightweight APs talk to the WLC using a tunnel protocol called **CAPWAP**.

**Why use a central WLC instead of just configuring each AP?** Two big reasons that appear the moment you have more than a handful of APs:

1. **Management sanity.** Configuring 200 autonomous APs one-by-one — and changing the Wi‑Fi password on all 200 by hand — is a nightmare (same "500 switches" problem from the security chapter). A WLC lets you set policy **once** and push it to every AP. Change the password in one place, done.
2. **Seamless roaming.** This is the subtle one. When you walk through a building on a video call, your phone hands off from AP to AP. Without a controller, each AP is an island and that handoff is clunky (drops, re-authentication). The WLC **coordinates all the APs as one system**, so it can move your connection smoothly from one AP to the next, manage which channels each AP uses to avoid interference, and balance load. *That coordination is impossible when each AP acts alone* — which is exactly why big networks use the lightweight-AP-plus-WLC model.

> **How does a ceiling-mounted AP get power?** Almost always from the switch, over the same Ethernet cable that carries its data — see section **3.7 (PoE)**. It's also why APs and WLCs need the trunk/access port planning from Chapters 7 and 8.

**The four deployment architectures** — the exam expects you to compare them, and each exists because it fixes the previous one's pain at a particular size of network:

| Architecture | Where the "brain" lives | Best for |
|--------------|-------------------------|----------|
| **Autonomous** | In each AP individually | A handful of APs |
| **Split-MAC** (lightweight + WLC) | Central WLC appliance; APs tunnel to it via CAPWAP | Campus with many APs |
| **Cloud-based** (e.g. Cisco Meraki) | A controller in the vendor's cloud, managed from a web dashboard | Many small sites, lean IT teams |
| **Embedded / Mobility Express** | WLC software running **inside** a switch or inside one of the APs | Small/branch sites that want central management without buying a controller |

**Why is the lightweight model called "split-MAC"?** Because the 802.11 (MAC-layer) job gets **split in two**. The **real-time** work that can't tolerate delay — transmitting frames, acknowledgements, encryption, beacons — stays **on the AP**, right at the radio. The **management** work — authentication decisions, roaming, channel/power planning, applying policy — moves **to the WLC**. *Time-critical stays local; decisions centralize.* CAPWAP is the pipe between the halves: a **control tunnel (UDP 5246)** carrying the WLC's instructions, and a **data tunnel (UDP 5247)** carrying client traffic — control messages are encrypted with **DTLS**; data usually isn't unless you turn it on.

Click any device or link in this split-MAC campus to see its job:

```diagram
{
  "type": "topology",
  "title": "A split-MAC campus: lightweight APs and their WLC",
  "caption": "Purple arcs are the CAPWAP tunnels. Click a device or a link.",
  "nodes": [
    {"id": "CORE", "kind": "l3switch", "x": 2, "y": 0, "label": "Core", "info": "The Layer 3 core. It routes between the client VLANs and carries the AP management VLAN to the WLC. To it, CAPWAP is just ordinary UDP traffic between two IP addresses."},
    {"id": "WLC", "kind": "wlc", "x": 3.6, "y": 0, "label": "WLC", "sub": "10.99.0.5", "info": "The **brain**. It holds every WLAN, makes the authentication decisions, coordinates roaming between APs, and plans channels and transmit power. It terminates every AP's CAPWAP tunnel and drops each client's traffic onto the right VLAN."},
    {"id": "ASW1", "kind": "switch", "x": 0.8, "y": 1.2, "label": "Access SW1"},
    {"id": "ASW2", "kind": "switch", "x": 3.2, "y": 1.2, "label": "Access SW2"},
    {"id": "AP1", "kind": "ap", "x": 0.8, "y": 2.4, "label": "AP1", "sub": "10.99.0.21", "info": "A **lightweight** AP in local mode. It keeps the real-time radio work: beacons, probe responses, acknowledgements, encryption. It holds no WLAN configuration of its own; it downloads everything from the WLC when it joins."},
    {"id": "AP2", "kind": "ap", "x": 3.2, "y": 2.4, "label": "AP2", "sub": "10.99.0.22", "info": "Same job as AP1. Because the WLC controls both, it can hand a moving client from AP1 to AP2 smoothly, and keep the two on different channels."},
    {"id": "LAP", "kind": "host", "x": 0.8, "y": 3.5, "label": "Laptop"},
    {"id": "PH", "kind": "phone", "x": 3.2, "y": 3.5, "label": "Phone"}
  ],
  "links": [
    {"a": "CORE", "b": "WLC", "style": "thick", "label": "LAG trunk", "info": "A trunk, because the WLC drops client traffic onto many VLANs. It's a LAG for bandwidth and redundancy, and on a Cisco WLC that means a **static** bundle (`mode on`), no LACP."},
    {"a": "CORE", "b": "ASW1", "style": "thick", "label": "trunk"},
    {"a": "CORE", "b": "ASW2", "style": "thick", "label": "trunk"},
    {"a": "ASW1", "b": "AP1", "label": "access", "info": "An **access** port. All client traffic is inside the CAPWAP tunnel, so this wire only carries one kind of traffic in one VLAN. The switch usually powers the AP over this same cable (PoE)."},
    {"a": "ASW2", "b": "AP2", "label": "access"},
    {"a": "AP1", "b": "LAP", "style": "wireless", "info": "802.11 over the air. Encryption between laptop and AP happens here, on the AP."},
    {"a": "AP2", "b": "PH", "style": "wireless"},
    {"id": "c1", "a": "AP1", "b": "WLC", "style": "tunnel", "label": "CAPWAP", "info": "**CAPWAP**: a control tunnel on UDP 5246, encrypted with DTLS, carrying the WLC's instructions, and a data tunnel on UDP 5247 carrying client traffic."},
    {"id": "c2", "a": "AP2", "b": "WLC", "style": "tunnel", "info": "AP2's own CAPWAP tunnel. Every AP has one to its WLC."}
  ]
}
```

**📝 Exam-style questions — 20.6**

**Q1.** In which wireless architecture do lightweight APs tunnel to a central controller using CAPWAP?

- **A.** Autonomous
- **B.** Split-MAC
- **C.** Cloud-based
- **D.** Mesh backhaul

<details><summary>Answer</summary>

**Answer: B.** Split-MAC splits the 802.11 job between the AP (real-time radio work) and the WLC (management and decisions), with CAPWAP joining the halves. **Why not the others:** autonomous APs (A) work alone with no controller or tunnel. Cloud-based APs (C) such as Meraki are managed from a vendor's cloud dashboard rather than tunnelling to an on-site WLC. And mesh (D) is a way to backhaul over the air between APs, not a management architecture.
</details>

**Q2.** Which UDP ports does CAPWAP use?

- **A.** 5246 for control and 5247 for data
- **B.** 5247 for control and 5246 for data
- **C.** 1812 for control and 1813 for data
- **D.** 161 for control and 162 for data

<details><summary>Answer</summary>

**Answer: A.** Control on 5246 (DTLS-encrypted), data on 5247. Memory hook: control comes first, so it gets the lower number. **Why not the others:** B swaps them. 1812 and 1813 (C) are RADIUS authentication and accounting. 161 and 162 (D) are SNMP polling and traps.
</details>

**Q3.** In a split-MAC design, which two functions stay on the lightweight AP? (Choose two.)

- **A.** Sending beacons and answering probe requests
- **B.** Acknowledging and retransmitting 802.11 frames
- **C.** Deciding whether a client is allowed to authenticate
- **D.** Planning channels and transmit power across all APs
- **E.** Coordinating a client's roam between two APs

<details><summary>Answer</summary>

**Answer: A, B.** Anything that has to happen in microseconds at the radio stays on the AP: beacons, probe responses, ACKs and retransmissions. **Why not the others:** authentication decisions (C), radio planning across the whole site (D) and roaming coordination (E) need a view of every AP, so they live on the WLC.
</details>

**Q4.** A retailer has 300 small stores with no IT staff on site. It wants central Wi‑Fi management without a controller at each store or a controller appliance to look after. Which architecture fits best?

- **A.** Autonomous APs, configured one by one
- **B.** Split-MAC with a WLC in every store
- **C.** Cloud-based, managed from the vendor's dashboard
- **D.** Embedded WLC on a switch at headquarters only, with no WAN links

<details><summary>Answer</summary>

**Answer: C.** A cloud-managed AP only needs internet access to reach its dashboard, so one small team can run all 300 stores without any controller hardware. **Why not the others:** 300 sites of autonomous APs (A) is the "configure everything by hand" problem. A WLC per store (B) means 300 boxes to buy and maintain. And D can't work as described: APs in stores need a path to their controller.
</details>

## 20.7 AP Modes — One AP, Many Jobs

A lightweight AP isn't locked into serving clients; the WLC can assign it a **mode**. Two forward traffic, the rest turn the AP into a dedicated tool:

| Mode | What the AP does |
|------|------------------|
| **Local** | The default — serves clients, tunnels **all** traffic to the WLC through CAPWAP |
| **FlexConnect** | Serves clients but can **switch traffic locally** at the site instead of tunneling it — and keeps working if the WAN link to the WLC dies |
| **Monitor** | No clients — radio only **listens**, hunting rogue APs and interference |
| **Sniffer** | Captures 802.11 frames and streams them to an analyst's Wireshark |
| **Rogue detector** | Sits on the **wired** side, matching wired MACs against rogue APs heard over the air to prove an intruder AP is on *your* network |
| **Bridge / Mesh** | Point-to-point or mesh backhaul — a wireless cable between buildings |
| **SE-Connect** | Dedicated **spectrum analysis** — finds non-Wi‑Fi interferers (microwaves, cordless phones) |

**Why does FlexConnect exist — isn't tunneling everything the whole point?** Picture a branch office in another city, its WLC back at HQ. In **local mode**, a print job from a branch laptop to the branch printer *ten feet away* would travel across the WAN to HQ and back — silly. And if the WAN link fails, Wi‑Fi at the branch dies entirely, even though the AP and the printer are both fine. **FlexConnect lets the AP drop local traffic onto the local LAN directly**, keeping only management centralized — and if the WLC becomes unreachable, the AP keeps serving its existing WLANs on its own. *Central control when available, local survival when not.* That's the exam's favorite fact about it.

Here's the FlexConnect story from above, step by step:

```diagram
{
  "type": "topology",
  "title": "Local mode vs FlexConnect at a branch",
  "caption": "The WLC is at headquarters, across the WAN. The laptop prints to a printer in the same branch. Press **Next**.",
  "nodes": [
    {"id": "LAP", "kind": "host", "x": 0, "y": 2.2, "label": "Laptop"},
    {"id": "AP", "kind": "ap", "x": 0, "y": 1, "label": "Branch AP"},
    {"id": "BSW", "kind": "switch", "x": 1.4, "y": 1, "label": "Branch SW"},
    {"id": "PRN", "kind": "host", "x": 1.4, "y": 2.2, "label": "Printer", "sub": "10.40.1.50"},
    {"id": "WAN", "kind": "cloud", "x": 2.8, "y": 1, "label": "WAN"},
    {"id": "WLC", "kind": "wlc", "x": 4.2, "y": 1, "label": "WLC", "sub": "at HQ"}
  ],
  "links": [
    {"a": "LAP", "b": "AP", "style": "wireless"},
    {"a": "AP", "b": "BSW"},
    {"a": "BSW", "b": "PRN"},
    {"a": "BSW", "b": "WAN"},
    {"a": "WAN", "b": "WLC"},
    {"id": "capwap", "a": "AP", "b": "WLC", "style": "tunnel", "label": "CAPWAP"}
  ],
  "zones": [
    {"label": "Branch", "nodes": ["LAP", "AP", "BSW", "PRN"], "tone": "accent"},
    {"label": "HQ", "nodes": ["WLC"], "tone": "purple"}
  ],
  "steps": [
    {"title": "1. Local mode: everything rides the tunnel",
     "text": "In **local mode** the AP tunnels *all* client traffic to the WLC. The print job crosses the WAN inside CAPWAP, the WLC puts it on a VLAN at HQ, and it's routed straight back across the WAN to a printer ten feet from the laptop.",
     "nodes": {"AP": {"badge": "Local mode", "tone": "accent"}},
     "packets": [{"path": ["LAP", "AP", "WLC"], "label": "print job in CAPWAP", "tone": "warn"},
                 {"path": ["WLC", "WAN", "BSW", "PRN"], "label": "back over the WAN", "tone": "warn"}]},
    {"title": "2. Local mode: WAN down means Wi-Fi down",
     "text": "The WAN link fails. A local-mode AP that loses its WLC stops serving its WLANs, so the laptop loses Wi‑Fi even though the AP, the switch and the printer are all fine.",
     "nodes": {"AP": {"badge": "no WLC", "tone": "bad"}},
     "links": {"BSW-WAN": "down", "capwap": "down"}},
    {"title": "3. FlexConnect: local traffic stays local",
     "text": "Switch the AP to **FlexConnect** with local switching. The AP drops branch traffic straight onto the branch LAN, so the print job goes AP → switch → printer. Only CAPWAP **control** traffic still goes to the WLC, which keeps management central.",
     "nodes": {"AP": {"badge": "FlexConnect", "tone": "good"}},
     "links": {"BSW-WAN": null, "capwap": null},
     "packets": [{"path": ["LAP", "AP", "BSW", "PRN"], "label": "switched locally", "tone": "good"},
                 {"path": ["AP", "WLC"], "label": "CAPWAP control", "tone": "accent"}]},
    {"title": "4. FlexConnect: WAN down, Wi-Fi stays up",
     "text": "The WAN fails again. The FlexConnect AP goes into **standalone** mode and keeps serving its WLANs on its own, switching traffic locally. Clients that authenticate locally (a PSK WLAN, or local 802.1X) carry on printing. *Central control when it's reachable, local survival when it isn't.*",
     "nodes": {"AP": {"badge": "standalone", "tone": "warn"}},
     "links": {"BSW-WAN": "down", "capwap": "down"},
     "packets": [{"path": ["LAP", "AP", "BSW", "PRN"], "label": "still printing", "tone": "good"}]}
  ]
}
```

**📝 Exam-style questions — 20.7**

**Q1.** A branch AP must keep serving clients if the WAN link to the WLC at headquarters fails, and traffic between branch devices should not cross the WAN. Which AP mode meets both needs?

- **A.** Local
- **B.** FlexConnect
- **C.** Monitor
- **D.** Bridge

<details><summary>Answer</summary>

**Answer: B.** FlexConnect can switch client traffic locally and keeps serving its WLANs in standalone mode if the WLC is unreachable. **Why not the others:** local mode (A) tunnels everything to the WLC and stops serving clients if it loses the WLC. Monitor mode (C) serves no clients at all. Bridge mode (D) turns the AP into a wireless link between sites.
</details>

**Q2.** An AP is placed on the wired side of the network to check whether rogue APs heard over the air are actually connected to the company LAN. Which mode is it in?

- **A.** Monitor
- **B.** Rogue detector
- **C.** Sniffer
- **D.** SE-Connect

<details><summary>Answer</summary>

**Answer: B.** A rogue detector AP watches the wired side and matches wired MAC addresses against the rogues that other APs report hearing, proving the rogue is plugged into *your* network. **Why not the others:** monitor mode (A) hunts rogues **over the air**, not on the wire. Sniffer mode (C) captures 802.11 frames for Wireshark. SE-Connect (D) is spectrum analysis.
</details>

**Q3.** An engineer wants an AP to stream raw RF spectrum data to an analysis tool on a laptop to identify a microwave oven that's causing interference. Which mode should the AP use?

- **A.** Sniffer
- **B.** SE-Connect
- **C.** Local
- **D.** FlexConnect

<details><summary>Answer</summary>

**Answer: B.** SE-Connect dedicates the radio to spectrum analysis, which can identify non-Wi‑Fi interferers such as microwaves and cordless phones. **Why not the others:** sniffer mode (A) captures 802.11 **frames**, and a microwave doesn't send frames. Local (C) and FlexConnect (D) are for serving clients.
</details>

## 20.8 Wiring It Up — How APs and WLCs Physically Connect

![Lightweight APs tunneling through CAPWAP to the WLC](images/wlc.png)

This is pure Chapter 7/8 knowledge applied to wireless, and the logic falls out of one question: *who needs to see which VLANs?*

- **A lightweight AP plugs into an access port.** Surprising until you remember: every client's traffic rides **inside the CAPWAP tunnel**, so the wire only ever carries one thing — CAPWAP packets between AP and WLC. One kind of traffic = one VLAN = access port. *The VLAN sorting happens at the WLC end, where the tunnel is unwrapped.*
- **The WLC plugs into a trunk port.** The reverse reasoning: the WLC unwraps tunnels from *every* AP and must drop each client onto the right VLAN — employee traffic to the employee VLAN, guest to guest. Many VLANs on one link = trunk.
- **An autonomous AP with multiple SSIDs also needs a trunk** — with no tunnel to carry the sorting elsewhere, it must tag each SSID's VLAN itself.
- **A WLC bundles its trunk ports with LAG** (link aggregation — the same EtherChannel idea from Chapter 10): more bandwidth for hundreds of APs' worth of tunnels, and no single-cable failure takes down the whole wireless network. One WLC quirk to remember: Cisco WLCs use **static LAG only — no LACP/PAgP negotiation** (`channel-group X mode on` at the switch end).

The WLC also keeps several **logical interfaces**, each answering a different "who's talking to me?":

| WLC interface | Purpose |
|---------------|---------|
| **Management** | Its main IP — CAPWAP from APs, SSH/HTTPS from admins |
| **Virtual** | A fake, unroutable address (often 192.0.2.1) used for client-facing chores like DHCP relay and the web login page |
| **Dynamic** | One per client VLAN — the exit door a WLAN's traffic uses onto the wired network |
| **Service port** | Out-of-band management — a lifeline that works even if the network config is broken |
| **Redundancy** | Heartbeat link to a standby WLC |

Follow two clients' traffic through the wiring above. The same tunnel and the same access port carry both; the split happens at the WLC.

```diagram
{
  "type": "topology",
  "title": "One tunnel in, many VLANs out",
  "caption": "SSID **Corp** maps to VLAN 10, SSID **Guest** to VLAN 30. Press **Next**.",
  "nodes": [
    {"id": "LAP", "kind": "host", "x": 0, "y": 2.4, "label": "Laptop", "sub": "SSID Corp"},
    {"id": "GST", "kind": "phone", "x": 1.2, "y": 2.4, "label": "Guest phone", "sub": "SSID Guest"},
    {"id": "AP", "kind": "ap", "x": 0.6, "y": 1.2, "label": "AP", "sub": "10.99.0.21"},
    {"id": "ASW", "kind": "switch", "x": 2, "y": 1.2, "label": "Access SW"},
    {"id": "CORE", "kind": "l3switch", "x": 3.4, "y": 1.2, "label": "Core"},
    {"id": "WLC", "kind": "wlc", "x": 3.4, "y": 0, "label": "WLC", "sub": "10.99.0.5"},
    {"id": "SRV", "kind": "server", "x": 4.8, "y": 1.2, "label": "File server", "sub": "10.20.0.10"}
  ],
  "links": [
    {"a": "LAP", "b": "AP", "style": "wireless"},
    {"a": "GST", "b": "AP", "style": "wireless"},
    {"a": "AP", "b": "ASW", "label": "access"},
    {"a": "ASW", "b": "CORE", "style": "thick", "label": "trunk"},
    {"a": "CORE", "b": "WLC", "style": "thick", "label": "LAG trunk"},
    {"a": "CORE", "b": "SRV"},
    {"id": "capwap", "a": "AP", "b": "WLC", "style": "tunnel"}
  ],
  "steps": [
    {"title": "1. The AP sits on an access port",
     "text": "The AP's switch port is an **access** port in VLAN 99, the AP management VLAN. Every client frame will travel inside CAPWAP, so this wire only ever carries AP-to-WLC packets: one kind of traffic, one VLAN.",
     "focus": ["AP", "ASW", "AP-ASW"]},
    {"title": "2. The laptop's frame goes into the tunnel",
     "text": "The laptop sends a frame for the file server. The AP wraps it in **CAPWAP data (UDP 5247)** addressed from 10.99.0.21 to the WLC at 10.99.0.5. The switches only see an ordinary IP packet between two addresses; they have no idea a laptop is inside it.",
     "packets": [{"path": ["LAP", "AP", "ASW", "CORE", "WLC"], "label": "CAPWAP, UDP 5247", "tone": "purple"}]},
    {"title": "3. The WLC unwraps it onto VLAN 10",
     "text": "The WLC maps SSID Corp to its **dynamic interface** for VLAN 10. It sends the frame back out on its trunk tagged VLAN 10, and the core routes it to the file server. This is why the WLC needs a trunk.",
     "nodes": {"WLC": {"badge": "Corp: VLAN 10", "tone": "good"}},
     "packets": [{"path": ["WLC", "CORE", "SRV"], "label": "tagged VLAN 10", "tone": "good"}]},
    {"title": "4. The guest takes the same tunnel to VLAN 30",
     "text": "The guest phone's traffic uses the **same** AP, the same access port and the same tunnel. Only at the WLC does it split off: SSID Guest maps to VLAN 30, which the core sends toward the internet, never to the file server. *The VLAN sorting happens where the tunnel ends.*",
     "nodes": {"WLC": {"badge": "Guest: VLAN 30", "tone": "warn"}},
     "packets": [{"path": ["GST", "AP", "ASW", "CORE", "WLC"], "label": "same CAPWAP tunnel", "tone": "purple"},
                 {"path": ["WLC", "CORE"], "label": "tagged VLAN 30", "tone": "warn"}]}
  ]
}
```

**📝 Exam-style questions — 20.8**

**Q1.** Which two switch-port configurations are correct? (Choose two.)

- **A.** A lightweight AP in local mode connects to an access port.
- **B.** A WLC that serves several WLANs on different VLANs connects to a trunk port.
- **C.** A lightweight AP in local mode connects to a trunk that carries every WLAN's VLAN.
- **D.** A WLC connects to an access port in the AP management VLAN.
- **E.** An autonomous AP with three SSIDs on three VLANs connects to an access port.

<details><summary>Answer</summary>

**Answer: A, B.** A local-mode AP sends everything through CAPWAP, so its port carries one VLAN. The WLC unwraps the tunnels and drops clients onto many VLANs, so it needs a trunk. **Why not the others:** a trunk to a local-mode AP (C) isn't needed because the client VLANs never appear on that wire. A WLC on an access port (D) could only reach one VLAN. And an autonomous AP with three SSIDs (E) tags each SSID's VLAN itself, so it needs a trunk.
</details>

**Q2.** A Cisco WLC's two distribution ports are bundled with LAG. How must the switch end of the bundle be configured?

- **A.** `channel-group 1 mode active`
- **B.** `channel-group 1 mode desirable`
- **C.** `channel-group 1 mode on`
- **D.** `channel-group 1 mode passive`

<details><summary>Answer</summary>

**Answer: C.** Cisco WLCs only support a static bundle; they don't speak LACP or PAgP, so the switch must not try to negotiate. **Why not the others:** `active` (A) and `passive` (D) are LACP modes and `desirable` (B) is PAgP. Each one waits for negotiation messages the WLC never sends, so the bundle wouldn't form.
</details>

**Q3.** Which WLC interface is the "exit door" that puts a WLAN's client traffic onto a particular VLAN?

- **A.** Management interface
- **B.** Virtual interface
- **C.** Dynamic interface
- **D.** Service port

<details><summary>Answer</summary>

**Answer: C.** You create one dynamic interface per client VLAN and map each WLAN to one. **Why not the others:** the management interface (A) is the WLC's own address for CAPWAP and admin access. The virtual interface (B) is a non-routable address for client-facing chores like the web login page and DHCP relay. The service port (D) is for out-of-band management of the WLC itself.
</details>

## 20.9 Managing APs and the WLC

Same menu as any Cisco device (21.1), applied to wireless — with the same security instincts:

- **CLI:** console, Telnet (❌ cleartext — disabled by default on WLCs), or **SSH** ✅.
- **GUI:** the WLC is mostly driven from its **web interface** — HTTP (❌) or **HTTPS** ✅. This is the practical difference from switches: day-to-day WLC work is GUI work, which is why the exam asks you to recognize its screens.
- **Centralized admin login:** point the WLC at **TACACS+ or RADIUS** (the AAA story from 18.4), so admin accounts live in one place instead of on every controller.
- A lightweight AP normally isn't managed directly at all — that's the entire point of owning a WLC — though its console port still matters for troubleshooting an AP that can't find its controller.

**📝 Exam-style questions — 20.9**

**Q1.** Which two protocols should an engineer use to manage a WLC securely? (Choose two.)

- **A.** HTTP
- **B.** HTTPS
- **C.** Telnet
- **D.** SSH
- **E.** TFTP

<details><summary>Answer</summary>

**Answer: B, D.** HTTPS protects the web GUI, where most WLC work happens, and SSH protects the CLI. **Why not the others:** HTTP (A) and Telnet (C) send everything, passwords included, in clear text. TFTP (E) is a file-transfer protocol with no login or encryption; it isn't a management interface at all.
</details>

**Q2.** A company runs 20 WLCs and wants administrator accounts kept in one place, so that removing an admin takes one change. What should it configure?

- **A.** Local user accounts on every WLC
- **B.** WLC admin login against a TACACS+ or RADIUS server
- **C.** An SNMPv2c community string shared by all WLCs
- **D.** CAPWAP between the WLCs

<details><summary>Answer</summary>

**Answer: B.** Pointing admin logins at a central AAA server means each account lives in one place. Remove it there and it's gone from all 20 controllers. **Why not the others:** local accounts (A) mean 20 changes per person. An SNMP community (C) is a shared string for monitoring, not a personal login. And CAPWAP (D) is the AP-to-WLC tunnel; it has nothing to do with admin accounts.
</details>

## 20.10 Creating a WLAN in the WLC GUI (What the Exam Shows You)

The exam gives you **screenshots** of this workflow, so walk it once. A **WLAN** on a WLC is a profile that ties three things together: an **SSID** (what clients see), a **dynamic interface** (which VLAN the traffic exits onto), and a **security policy**. Order of operations:

1. **Create the dynamic interface** (Controller → Interfaces): name, VLAN ID, IP address — the WLAN's door to the wired network.
2. **Create the WLAN** (WLANs → Create New): Profile Name (internal label), SSID (broadcast name), then **enable it** — new WLANs start disabled, a classic "why isn't it showing up?" gotcha.
3. **General tab:** map the WLAN to that dynamic interface.
4. **Security tab:** Layer 2 security — **WPA2/WPA3**, then either **PSK** (type the passphrase) or **802.1X** (point at your RADIUS server).
5. **QoS tab:** pick a profile — **Platinum (voice), Gold (video), Silver (best effort — the default), Bronze (background)**. This decides how the WLC marks the traffic for the QoS machinery from 17.7; guest Wi‑Fi often gets Bronze so it can't crowd out real work.
6. **Advanced tab:** the long tail — session timeouts, band steering, FlexConnect local switching.

*Memory hook for the QoS tiers: medals in order — Platinum, Gold, Silver, Bronze — and voice always takes the podium.*

**📝 Exam-style questions — 20.10**

**Q1.** An engineer creates a new WLAN on a WLC and maps it to a dynamic interface, but clients can't see the SSID at all. What's the most likely cause?

- **A.** The WLAN hasn't been enabled.
- **B.** The WLAN's QoS profile is Silver.
- **C.** The dynamic interface is on a trunk port.
- **D.** The WLAN uses WPA2 instead of WPA3.

<details><summary>Answer</summary>

**Answer: A.** New WLANs are created disabled, so nothing is broadcast until you tick **Enabled**. That's the classic "why isn't it showing up?" gotcha. **Why not the others:** Silver (B) is the default QoS profile and doesn't hide anything. The WLC's ports are supposed to be trunks (C). And WPA2 (D) is a perfectly valid security choice that clients can see and join.
</details>

**Q2.** Which QoS profile should a WLAN for wireless IP phones use on a WLC?

- **A.** Gold
- **B.** Platinum
- **C.** Silver
- **D.** Bronze

<details><summary>Answer</summary>

**Answer: B.** Platinum is the voice tier, the top of the podium. **Why not the others:** Gold (A) is for video, Silver (C) is best effort and the default, and Bronze (D) is background traffic, the usual choice for guest Wi‑Fi.
</details>

**Q3.** On which WLAN tab does an engineer select the dynamic interface the WLAN's traffic will use?

- **A.** General
- **B.** Security
- **C.** QoS
- **D.** Advanced

<details><summary>Answer</summary>

**Answer: A.** The General tab holds the profile name, SSID, status (enabled or not) and the interface the WLAN maps to. **Why not the others:** the Security tab (B) is where WPA2/WPA3 and PSK or 802.1X go. The QoS tab (C) holds the Platinum-to-Bronze profile. The Advanced tab (D) has the long tail: session timeouts, band steering, FlexConnect local switching.
</details>

## 20.11 How a Device Joins Wi‑Fi
1. **Discover:** Device listens for beacons or probes for the SSID.
2. **Authenticate:** Proves it's allowed (password/802.1X).
3. **Associate:** Officially joins the AP.
4. **Get IP (DHCP):** Receives an address and starts using the network.

The four steps above, as the actual frames a laptop exchanges joining a WPA2-Personal network. The list's "authenticate" step is really two pieces: a quick 802.11 open-system authentication **before** association, and the real password check (the 4-way handshake, or 802.1X in Enterprise mode) right **after** it.

```diagram
{
  "type": "sequence",
  "title": "A laptop joins a WPA2-Personal WLAN",
  "actors": [
    {"id": "LAP", "kind": "host", "label": "Laptop"},
    {"id": "AP", "kind": "ap", "label": "AP"},
    {"id": "DHCP", "kind": "server", "label": "DHCP server"}
  ],
  "messages": [
    {"from": "AP", "to": "LAP", "label": "Beacon", "detail": "SSID Corp, channel 36, WPA2-PSK", "dashed": true, "states": {"LAP": "scanning"},
     "text": "**Discover.** The AP announces itself about ten times a second. A laptop scanning the channels can learn the SSID, channel and security type just by listening (passive scanning)."},
    {"from": "LAP", "to": "AP", "label": "Probe Request", "detail": "Is SSID Corp here?",
     "text": "Clients don't have to wait for beacons. A **probe request** asks out loud (active scanning), which is also how a client finds a hidden SSID it already knows."},
    {"from": "AP", "to": "LAP", "label": "Probe Response", "detail": "SSID Corp, rates, WPA2-PSK", "dashed": true,
     "text": "The AP answers with the same details a beacon carries."},
    {"from": "LAP", "to": "AP", "label": "Authentication", "detail": "Open System",
     "text": "**Authenticate (802.11 style).** This is a formality left over from the original standard: open-system authentication accepts everyone. The real password check comes after association."},
    {"from": "AP", "to": "LAP", "label": "Authentication: success", "dashed": true, "states": {"LAP": "authenticated"},
     "text": "The laptop is now *authenticated but not associated*."},
    {"from": "LAP", "to": "AP", "label": "Association Request", "detail": "SSID Corp, supported rates",
     "text": "**Associate.** The laptop asks to join this AP's network."},
    {"from": "AP", "to": "LAP", "label": "Association Response", "detail": "status success, AID 5", "dashed": true, "tone": "good", "states": {"LAP": "associated"},
     "text": "The AP accepts and gives the laptop an association ID. With a WLC, the AP passes this decision to the controller over CAPWAP. The laptop is joined but still can't send data: no keys yet."},
    {"from": "AP", "to": "LAP", "label": "4-way handshake 1/4", "detail": "ANonce", "dashed": true,
     "text": "**The real password check.** The AP sends a random number (ANonce). Both sides will mix the passphrase-derived key with both random numbers to build the session keys."},
    {"from": "LAP", "to": "AP", "label": "4-way handshake 2/4", "detail": "SNonce + MIC",
     "text": "The laptop sends its own random number and a MIC, a check value only someone who knows the passphrase could compute. The passphrase itself never crosses the air."},
    {"from": "AP", "to": "LAP", "label": "4-way handshake 3/4", "detail": "group key (GTK) + MIC", "dashed": true,
     "text": "The AP's MIC proves *it* knows the passphrase too, and it hands over the group key used for broadcasts."},
    {"from": "LAP", "to": "AP", "label": "4-way handshake 4/4", "detail": "ACK", "tone": "good", "states": {"LAP": "keys installed"},
     "text": "Both sides install the keys. From here, every data frame is encrypted with AES. A wrong passphrase fails at message 2, when the AP's check of the MIC doesn't match. *WPA3 replaces this exchange with SAE, so a recording of it is useless to an attacker.*"},
    {"from": "LAP", "to": "DHCP", "label": "DHCP Discover", "detail": "0.0.0.0 → 255.255.255.255",
     "text": "**Get an IP.** Now that it can send encrypted frames, the laptop broadcasts for an address. The AP (or the WLC) bridges the broadcast onto the wired VLAN."},
    {"from": "DHCP", "to": "LAP", "label": "DHCP Offer", "detail": "10.10.10.25/24", "dashed": true,
     "text": "The server offers an address from the VLAN 10 pool."},
    {"from": "LAP", "to": "DHCP", "label": "DHCP Request", "detail": "I'll take 10.10.10.25",
     "text": "The laptop accepts the offer."},
    {"from": "DHCP", "to": "LAP", "label": "DHCP Ack", "detail": "gateway 10.10.10.1, DNS 10.20.0.53", "dashed": true, "tone": "good", "states": {"LAP": "online"},
     "text": "Done. If this step failed, the laptop would be *associated with keys* but stuck on a 169.254.x.x address: Wi‑Fi fine, DHCP broken."}
  ]
}
```

**📝 Exam-style questions — 20.11**

**Q1.** Instead of waiting to hear a beacon, a client asks whether the SSID "Corp" is available. Which frame does it send?

- **A.** Beacon
- **B.** Probe request
- **C.** Association request
- **D.** DHCP Discover

<details><summary>Answer</summary>

**Answer: B.** A probe request is active scanning: the client asks, and APs serving that SSID answer with a probe response. **Why not the others:** beacons (A) come *from* the AP. An association request (C) comes later, once the client has picked an AP. DHCP Discover (D) is the IP step at the very end, after the client has joined.
</details>

**Q2.** A laptop joins a WPA2-Personal WLAN. The Wi‑Fi icon shows it connected with full signal, but `ipconfig` shows 169.254.37.112. Which step of joining failed?

- **A.** Discovery
- **B.** Authentication
- **C.** Association
- **D.** Getting an IP address from DHCP

<details><summary>Answer</summary>

**Answer: D.** A 169.254.x.x address (APIPA) means the laptop never got a DHCP answer. Everything before that worked: it found the SSID, proved the passphrase and associated. **Why not the others:** if discovery (A), authentication (B) or association (C) had failed, the laptop wouldn't show as connected at all, and it would never have reached the point of asking for an address.
</details>

**Q3.** Which order matches how a client joins a Wi‑Fi network?

- **A.** Discover the SSID, authenticate, associate, get an IP address
- **B.** Associate, discover the SSID, authenticate, get an IP address
- **C.** Get an IP address, discover the SSID, associate, authenticate
- **D.** Discover the SSID, associate, get an IP address, authenticate

<details><summary>Answer</summary>

**Answer: A.** Find the network, then 802.11 authentication and association, with the WPA2 key exchange straight after, and only then DHCP. **Why not the others:** you can't associate (B) to a network you haven't found. You can't get an IP (C) before you're on the network, because DHCP travels over it. And D puts security after DHCP; until the keys are in place, the AP won't pass the client's data frames, so DHCP couldn't happen yet.
</details>

---

<a name="chapter-21"></a>
# Chapter 21: Network Management & Monitoring

## 21.1 Ways to Connect to a Device

- **Console (out-of-band):** A direct cable — works even if the network is down. Your lifeline for first setup or emergencies.
- **SSH (in-band):** Secure remote access over the network. The everyday way.
- **Telnet (in-band):** Remote access but **unencrypted** — avoid!

**Out-of-band vs In-band:** Out-of-band uses a separate path (console cable) that doesn't rely on the network working. In-band uses the network itself.

**Why keep an "out-of-band" console path when SSH over the network is so much more convenient?** Because of a brutal catch-22: the times you *most* need to fix a device are exactly the times the network is *broken* — and if the network is down, **SSH (which travels over that same network) won't reach the device either!** It's like keeping a spare key *outside* the house: locking yourself out is precisely when the key inside is useless. The **console cable** is a completely separate, physical path that works even when the device has no IP, no config, or a totally broken network. *That's why every network pro keeps console access:* it's the lifeline for a brand-new switch (no config yet), a misconfiguration that killed remote access, or a network meltdown. In-band (SSH) is for everyday convenience; out-of-band (console) is for emergencies — and you need both.

Watch the catch-22 play out, and the spare key save the day:

```diagram
{
  "type": "topology",
  "title": "In-band vs out-of-band management",
  "caption": "The admin normally manages SW1 over SSH through the core. A separate console server is wired to SW1's console port. Press **Next**.",
  "nodes": [
    {"id": "ADM", "kind": "host", "x": 3.6, "y": 1, "label": "Admin"},
    {"id": "CORE", "kind": "l3switch", "x": 1.8, "y": 1, "label": "Core"},
    {"id": "SW1", "kind": "switch", "x": 0, "y": 1, "label": "SW1", "sub": "mgmt 10.99.0.11"},
    {"id": "CS", "kind": "server", "x": 1.8, "y": 2.4, "label": "Console server"}
  ],
  "links": [
    {"a": "ADM", "b": "CORE", "label": "in-band"},
    {"a": "CORE", "b": "SW1", "label": "uplink"},
    {"a": "ADM", "b": "CS", "style": "dashed", "label": "OOB network"},
    {"a": "CS", "b": "SW1", "style": "dashed", "label": "console cable"}
  ],
  "steps": [
    {"title": "1. Everyday: SSH in-band",
     "text": "The admin SSHes to 10.99.0.11. The session rides the **same network** it manages: through the core and up SW1's uplink. Convenient and encrypted.",
     "packets": [{"path": ["ADM", "CORE", "SW1"], "label": "SSH, TCP 22", "tone": "accent"}]},
    {"title": "2. A typo cuts the branch you're sitting on",
     "text": "During a change the admin shuts Gi1/0/1, SW1's uplink, by mistake. The SSH session freezes, and a new one can't get through: the only path to SW1's management address just went down. *The moment you most need the device is the moment in-band access is gone.*",
     "nodes": {"SW1": {"badge": "uplink shut", "tone": "bad"}},
     "links": {"CORE-SW1": "down"},
     "packets": [{"path": ["ADM", "CORE"], "label": "SSH: no path", "tone": "bad"}]},
    {"title": "3. Out-of-band: the spare key",
     "text": "The admin connects through the **console server**, which is wired straight to SW1's console port over a separate path. It doesn't need SW1's uplink, its IP address or even a working config.",
     "packets": [{"path": ["ADM", "CS", "SW1"], "label": "console", "tone": "good"}]},
    {"title": "4. Fixed from the console",
     "text": "On the console the admin runs `no shutdown` on Gi1/0/1. The uplink comes back and SSH works again. In-band for everyday convenience, out-of-band for emergencies: you want both.",
     "nodes": {"SW1": null},
     "links": {"CORE-SW1": null},
     "packets": [{"path": ["ADM", "CORE", "SW1"], "label": "SSH works again", "tone": "good"}]}
  ]
}
```

**📝 Exam-style questions — 21.1**

**Q1.** A new switch has just been unboxed and has no configuration or IP address. Which method can an engineer use to configure it?

- **A.** SSH
- **B.** Telnet
- **C.** The console port
- **D.** HTTPS

<details><summary>Answer</summary>

**Answer: C.** The console is out-of-band: a direct cable that needs no IP address and no config. **Why not the others:** SSH (A), Telnet (B) and HTTPS (D) are in-band. Each needs an IP address on the switch, a path to it and, for SSH and HTTPS, keys and a user account, none of which exists yet.
</details>

**Q2.** An auditor captures packets on the management VLAN and reads an administrator's password in plain text. Which protocol was the administrator using?

- **A.** SSH version 2
- **B.** Telnet
- **C.** HTTPS
- **D.** SNMPv3 with authPriv

<details><summary>Answer</summary>

**Answer: B.** Telnet sends every keystroke, password included, unencrypted, which is why the guide says avoid it. **Why not the others:** SSHv2 (A) and HTTPS (C) encrypt the whole session. SNMPv3 with authPriv (D) both authenticates and encrypts, so a capture shows nothing readable.
</details>

**Q3.** Which option is an example of out-of-band management?

- **A.** SSH to a switch's management SVI
- **B.** HTTPS to a WLC's management interface
- **C.** A console server wired to each device's console port over a separate network
- **D.** SNMP polling of a router's loopback over the production network

<details><summary>Answer</summary>

**Answer: C.** Out-of-band means a path that doesn't depend on the production network. A console server on its own network keeps working when the production network is broken. **Why not the others:** A, B and D all travel over the production network they're managing, which is the definition of in-band. If that network breaks, all three break with it.
</details>

## 21.2 Discovering Neighbors: CDP & LLDP

- **CDP (Cisco Discovery Protocol):** Cisco devices automatically learn about **directly connected Cisco neighbors** (name, model, port, IP). Great for mapping.
- **LLDP (Link Layer Discovery Protocol):** The **vendor-neutral** version (802.1AB) — works across brands.

```
R1# show cdp neighbors           ! quick list of neighbors
R1# show cdp neighbors detail    ! includes their IP addresses
R1# show lldp neighbors
```

> Security tip: Turn CDP/LLDP off on ports facing untrusted networks — they reveal device info.

**Why is CDP incredibly useful AND a security risk at the same time?** Both come from the *same* fact: CDP freely broadcasts details about your device (its name, model, IOS version, IP, and which port connects where) to whatever's plugged in.

- **Why it's useful:** In a big messy wiring closet, you can sit on one switch and instantly *map the whole neighborhood* — "port 5 connects to Switch-B's port 12, which is a Catalyst running this IOS." You can rebuild a network diagram without physically tracing a single cable. A huge time-saver for documentation and troubleshooting.
- **Why it's a risk:** That same free information is a **gift to an attacker.** If a hacker plugs into a port that's leaking CDP, they instantly learn your device models and IOS versions — which tells them exactly which known vulnerabilities to try. *So the rule is: keep CDP/LLDP ON internally (where it helps you) but turn it OFF on ports facing untrusted areas* (guest ports, internet edges), because there's no reason to hand strangers a map of your gear.

Step through what CDP actually sends, how far it goes, and why you switch it off at the edges:

```diagram
{
  "type": "topology",
  "title": "CDP: one hop, and a gift to strangers",
  "caption": "CDP is on by default on Cisco gear. Press **Next**.",
  "nodes": [
    {"id": "ISP", "kind": "cloud", "x": 0, "y": 0, "label": "ISP"},
    {"id": "R1", "kind": "router", "x": 1.5, "y": 0, "label": "R1", "sub": "ISR4331"},
    {"id": "SW1", "kind": "switch", "x": 3, "y": 0, "label": "SW1", "sub": "C9300"},
    {"id": "SW2", "kind": "switch", "x": 4.5, "y": 0, "label": "SW2", "sub": "C9200"},
    {"id": "GST", "kind": "host", "x": 4.5, "y": 1.3, "label": "Guest port"}
  ],
  "links": [
    {"a": "ISP", "b": "R1", "bLabel": "Gi0/0/0"},
    {"a": "R1", "b": "SW1"},
    {"a": "SW1", "b": "SW2"},
    {"a": "SW2", "b": "GST"}
  ],
  "steps": [
    {"title": "1. Every port, every 60 seconds",
     "text": "Each Cisco device sends a CDP message out of every interface every **60 seconds**: its name, model, IOS version, the port it was sent from and its IP address. A neighbor keeps the entry for the **holdtime** (180 seconds) unless a fresh one arrives.",
     "packets": [{"path": ["R1", "SW1"], "label": "CDP from R1", "tone": "accent"},
                 {"path": ["SW1", "SW2"], "label": "CDP from SW1", "tone": "accent"}]},
    {"title": "2. Only one hop",
     "text": "CDP goes to a special multicast address that switches **consume** rather than forward. SW1 hears R1 and SW2, but `show cdp neighbors` on SW2 lists only SW1; R1 never appears there. To map further, you hop to SW1 and ask again.",
     "focus": ["R1", "SW1", "SW2", "R1-SW1", "SW1-SW2"],
     "nodes": {"SW1": {"badge": "sees R1 + SW2", "tone": "good"}, "SW2": {"badge": "sees SW1 only", "tone": "accent"}},
     "packets": [{"path": ["R1", "SW1"], "label": "R1's CDP stops here", "tone": "accent"}]},
    {"title": "3. The leak",
     "text": "The same messages go out of the ISP-facing port and the guest port. Anyone there learns the exact model and IOS version, which tells an attacker which known vulnerabilities to try.",
     "nodes": {"SW1": null, "SW2": null},
     "packets": [{"path": ["R1", "ISP"], "label": "model + IOS version", "tone": "bad"},
                 {"path": ["SW2", "GST"], "label": "model + IOS version", "tone": "bad"}]},
    {"title": "4. Off at the edges, on inside",
     "text": "`no cdp enable` on R1 Gi0/0/0 and on SW2's guest port stops the leak on just those interfaces. CDP keeps running everywhere inside, where it helps you. (`no cdp run` would turn it off on the whole device; for LLDP the per-port commands are `no lldp transmit` and `no lldp receive`.)",
     "nodes": {"R1": {"badge": "no cdp enable", "tone": "good"}, "SW2": {"badge": "no cdp enable", "tone": "good"}},
     "links": {"ISP-R1": "dim", "SW2-GST": "dim"},
     "packets": [{"path": ["SW1", "SW2"], "label": "CDP inside: fine", "tone": "good"}]}
  ]
}
```

**📝 Exam-style questions — 21.2**

**Q1.** Refer to the exhibit. Which statement is true?

```
SW1# show cdp neighbors
Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge
                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone

Device ID        Local Intrfce     Holdtme    Capability  Platform   Port ID
R1               Gig 1/0/24        152            R B S I  ISR4331    Gig 0/0/1
SW2              Gig 1/0/1         171            S I      C9200-48P  Gig 1/0/48
```

- **A.** SW1's Gi1/0/24 connects to R1's Gi0/0/1.
- **B.** R1 connects to SW1's Gi1/0/1.
- **C.** SW2's Gi1/0/1 connects to SW1's Gi1/0/48.
- **D.** The output shows R1's IP address.

<details><summary>Answer</summary>

**Answer: A.** "Local Intrfce" is the port on the switch you're typing on (SW1); "Port ID" is the port on the neighbor. So SW1 Gi1/0/24 ↔ R1 Gi0/0/1. **Why not the others:** Gi1/0/1 (B) is SW1's port toward SW2, not R1. C has the ports swapped: SW1's Gi1/0/1 connects to SW2's Gi1/0/48. And the summary view never shows IP addresses (D); you need `show cdp neighbors detail` for that.
</details>

**Q2.** Which command shows the IP address of a directly connected Cisco neighbor?

- **A.** `show cdp neighbors`
- **B.** `show cdp neighbors detail`
- **C.** `show cdp interface`
- **D.** `show ip interface brief`

<details><summary>Answer</summary>

**Answer: B.** The detail view adds each neighbor's IP address and full software version. (`show cdp entry *` shows the same information.) **Why not the others:** the plain summary (A) shows names, ports and platforms but no addresses. `show cdp interface` (C) shows CDP's timers and status on your own ports. `show ip interface brief` (D) lists *your* addresses, not your neighbors'.
</details>

**Q3.** Which two statements about CDP and LLDP are true? (Choose two.)

- **A.** LLDP is the vendor-neutral IEEE 802.1AB standard.
- **B.** CDP information is shared only with directly connected devices; switches don't forward it.
- **C.** CDP messages are routed across the network, so a router can discover devices several hops away.
- **D.** LLDP is enabled by default on every Cisco IOS device.
- **E.** CDP only works between Cisco routers.

<details><summary>Answer</summary>

**Answer: A, B.** LLDP is the open standard that works across vendors, and both protocols are strictly one hop. **Why not the others:** CDP is never routed or forwarded (C). On most Cisco IOS devices CDP is on by default and LLDP is **off** until you enter `lldp run` (D). And CDP runs on Cisco switches, routers, phones and APs, not just routers (E).
</details>

**Q4.** R1's Gi0/0/0 faces the ISP. Which command stops CDP on that interface only?

- **A.** `R1(config)# no cdp run`
- **B.** `R1(config-if)# no cdp enable`
- **C.** `R1(config-if)# no lldp run`
- **D.** `R1(config-if)# cdp disable`

<details><summary>Answer</summary>

**Answer: B.** `no cdp enable` in interface mode turns CDP off on that port and leaves it running everywhere else. **Why not the others:** `no cdp run` (A) turns CDP off for the whole router, which also loses you the internal neighbor information. `lldp run` (C) is a global LLDP command and has nothing to do with CDP. D isn't an IOS command.
</details>

## 21.3 Backing Up & Restoring Configs

Save configs to a **TFTP/FTP server** so you can restore after a failure:
```
R1# copy running-config tftp        ! back up to a server
R1# copy tftp running-config        ! restore from a server
R1# copy running-config startup-config   ! save locally (do this always!)
```

**📝 Exam-style questions — 21.3**

**Q1.** Which command backs up a router's current configuration to a TFTP server?

- **A.** `copy running-config tftp:`
- **B.** `copy tftp: running-config`
- **C.** `copy startup-config running-config`
- **D.** `copy running-config startup-config`

<details><summary>Answer</summary>

**Answer: A.** `copy <from> <to>`: from the running config, to TFTP. IOS then prompts for the server address and file name. **Why not the others:** B goes the other way and restores from the server. C loads the saved config into RAM. D saves locally to NVRAM, which is good practice but isn't a backup to a server.
</details>

**Q2.** A router's running config has a few commands that aren't in a backup file. The engineer runs `copy tftp: running-config` with that backup. What is the result?

- **A.** The running config is replaced exactly by the backup.
- **B.** The backup's commands are merged into the running config, and the extra commands stay.
- **C.** IOS rejects the copy because the configurations differ.
- **D.** The backup is written to NVRAM only.

<details><summary>Answer</summary>

**Answer: B.** Copying anything **into** running-config is like typing it at the prompt: each line is applied on top of what's there, and nothing is removed. To truly swap the config, IOS has `configure replace`. **Why not the others:** A is the common assumption, and the reason leftover commands surprise people. IOS doesn't compare and refuse (C). And the destination is running-config in RAM, not NVRAM (D).
</details>

**Q3.** An engineer makes changes on a router, tests them, and then the router reloads after a power cut. The changes are gone. What did the engineer forget?

- **A.** `copy running-config startup-config`
- **B.** `copy startup-config running-config`
- **C.** `copy running-config tftp:`
- **D.** `reload`

<details><summary>Answer</summary>

**Answer: A.** Changes live in the running config in RAM until you copy them to the startup config in NVRAM. A reload boots from startup-config. **Why not the others:** B would load the *old* saved config over the new one. A TFTP backup (C) is a good habit but the router doesn't boot from it. And reloading (D) is what lost the changes in the first place.
</details>

## 21.4 Managing IOS Images

The IOS image lives in **flash**; upgrading means copying a new image in, telling the device to boot from it, and reloading. The exam cares about the workflow *and* the two safety habits:

```
R1# show flash:                       ! space free? current image name?
R1# show version                      ! running version + config register
R1# copy tftp flash:                  ! pull the new image (or FTP/SCP/USB)
R1# verify /md5 flash:new-image.bin   ! checksum BEFORE trusting it
R1(config)# boot system flash:new-image.bin
R1# copy running-config startup-config
R1# reload
```

- **Why verify the checksum?** A corrupted transfer (or a tampered image) can leave you a device that won't boot — comparing the MD5/SHA hash against Cisco's published value costs one command and prevents the 2 a.m. surprise.
- **Why keep the old image in flash?** If the new one fails, you point `boot system` back at the known-good file. Delete it only after the new image has survived a reload.
- **TFTP vs FTP:** TFTP is the classic, dead-simple choice (UDP 69, no login); FTP adds authentication and handles big files more reliably. Both appear on the blueprint as "ways to move configs and images."

Here's that upgrade as a conversation. Notice how TFTP moves the image: one small block at a time, each one waiting for an ACK.

```diagram
{
  "type": "sequence",
  "title": "Upgrading IOS from a TFTP server",
  "actors": [
    {"id": "ADM", "kind": "host", "label": "Admin"},
    {"id": "R1", "kind": "router", "label": "R1"},
    {"id": "TFTP", "kind": "server", "label": "TFTP 10.99.0.50"}
  ],
  "messages": [
    {"from": "ADM", "to": "R1", "label": "show flash:", "detail": "enough free space? old image name?", "states": {"R1": "old image"},
     "text": "Check before you copy: is there room for the new image **and** the old one? Keeping the old image is your way back if the new one won't boot."},
    {"from": "ADM", "to": "R1", "label": "copy tftp: flash:", "detail": "file isr4300-universalk9.17.09.04a.SPA.bin",
     "text": "IOS asks for the server address and the file name, then starts the transfer."},
    {"from": "R1", "to": "TFTP", "label": "Read Request (RRQ)", "detail": "to UDP 69",
     "text": "TFTP has no login: R1 just asks for the file by name on **UDP 69**. That simplicity is why it's everywhere, and why it's only safe on a trusted network."},
    {"from": "TFTP", "to": "R1", "label": "DATA block 1", "detail": "512 bytes, from a new server port", "dashed": true,
     "text": "The server answers from a fresh port and sends the first block. By default a block is 512 bytes."},
    {"from": "R1", "to": "TFTP", "label": "ACK block 1",
     "text": "R1 acknowledges, and only then does the next block come. One block in flight at a time is simple and reliable over UDP, but slow for a large image, which is why FTP or SCP is often a better choice for big files."},
    {"note": "... many thousands of blocks later ...", "over": ["R1", "TFTP"],
     "text": "A block shorter than 512 bytes tells R1 the file is finished."},
    {"from": "R1", "to": "R1", "label": "verify /md5 flash:new image", "states": {"R1": "hash matches"}, "tone": "good",
     "text": "Compare the hash with the one Cisco publishes for that file. A corrupted or tampered image shows up here, not at 2 a.m. when the router won't boot."},
    {"from": "ADM", "to": "R1", "label": "boot system flash:<new image>",
     "text": "Tell the router which image to load next time. Without this, it may keep booting the first image it finds in flash."},
    {"from": "ADM", "to": "R1", "label": "copy running-config startup-config",
     "text": "The `boot system` line is configuration, so it has to be saved or the reload forgets it."},
    {"from": "R1", "to": "R1", "label": "reload", "states": {"R1": "new image"}, "tone": "good",
     "text": "R1 boots the new image. Check with `show version`, and delete the old file only once the new one has survived a reload."}
  ]
}
```

**📝 Exam-style questions — 21.4**

**Q1.** After copying a new IOS image into flash, which command confirms the file wasn't corrupted in transit?

- **A.** `show flash:`
- **B.** `verify /md5 flash:<image>`
- **C.** `show version`
- **D.** `dir flash:`

<details><summary>Answer</summary>

**Answer: B.** `verify /md5` computes the file's hash so you can compare it with Cisco's published value. A match means the file is intact. **Why not the others:** `show flash:` (A) and `dir flash:` (D) list file names and sizes; a corrupted file can have the right size. `show version` (C) describes the image that's running now, not the new file.
</details>

**Q2.** Which command makes a router load a specific new image at the next reload?

- **A.** `R1(config)# boot system flash:<image>`
- **B.** `R1# copy flash: startup-config`
- **C.** `R1(config)# config-register 0x2102`
- **D.** `R1# reload flash:<image>`

<details><summary>Answer</summary>

**Answer: A.** `boot system` tells the router which file to boot. Save the config afterwards so the line survives. **Why not the others:** B would try to copy an image file into the startup config, which makes no sense. `config-register 0x2102` (C) controls *how* the router boots (normal boot, load the startup config), not which image file. D isn't a valid way to pick an image.
</details>

**Q3.** Which two statements about TFTP and FTP are true? (Choose two.)

- **A.** TFTP uses UDP port 69 and has no authentication.
- **B.** FTP supports a username and password.
- **C.** TFTP encrypts the files it transfers.
- **D.** FTP runs over UDP ports 20 and 21.
- **E.** TFTP runs over TCP port 69.

<details><summary>Answer</summary>

**Answer: A, B.** TFTP is deliberately minimal: UDP 69, no login. FTP adds authentication and is more reliable for large files. **Why not the others:** neither TFTP nor plain FTP encrypts anything (C); SCP or SFTP would. FTP uses **TCP** 20 and 21 (D). TFTP is UDP, not TCP (E).
</details>

## 21.5 Password Recovery (The Config Register)

If you're locked out, the fix hinges on one 16-bit value: the **configuration register**, which tells the router *how to boot*. Normally it's **`0x2102`** — boot the IOS, load startup-config as usual. Changed to **`0x2142`**, one bit flips meaning: **ignore the startup config at boot**.

The recovery walk (console cable required — this cannot be done remotely, which is the point):

1. Power-cycle and break into **ROMMON** (Ctrl+Break during boot).
2. `confreg 0x2142`, then `reset` — the router boots *fresh*, no config, no passwords.
3. `copy startup-config running-config` — pull the real config back in (now you're logged in *around* it).
4. Change the passwords, set the register back with `config-register 0x2102`, save, reload.

**Why does this feature exist — isn't it a security hole?** It's the deliberate trade-off from 18.9: anyone with **physical access** to the console effectively owns the device, so Cisco chose recoverable-by-owner over bricked-by-forgotten-password. That's exactly why wiring closets get locks. *And the exam angle: if a router boots up ignoring its startup config "for no reason," check `show version` — someone left the register at 0x2142.*

The recovery walk, with the register value shown under the router at every step:

```diagram
{
  "type": "sequence",
  "title": "Password recovery on a Cisco router",
  "actors": [
    {"id": "ADM", "kind": "host", "label": "Admin on console"},
    {"id": "R1", "kind": "router", "label": "R1"}
  ],
  "messages": [
    {"note": "Locked out: nobody knows the enable secret", "over": ["ADM", "R1"], "states": {"R1": "reg 0x2102"},
     "text": "The register is at its normal value, **0x2102**: boot IOS and load the startup config. The admin is at the console, because none of this works remotely."},
    {"from": "ADM", "to": "R1", "label": "power-cycle, then Ctrl+Break", "states": {"R1": "ROMMON"},
     "text": "Breaking into the boot process lands in **ROMMON**, the tiny monitor that runs before IOS loads."},
    {"from": "ADM", "to": "R1", "label": "confreg 0x2142", "states": {"R1": "reg 0x2142"},
     "text": "One bit flips: **0x2142** means *ignore the startup config at boot*. The config is still safe in NVRAM; the router just won't read it."},
    {"from": "ADM", "to": "R1", "label": "reset",
     "text": "Restart from ROMMON with the new register value."},
    {"from": "R1", "to": "R1", "label": "boot, skipping startup-config", "states": {"R1": "blank config"},
     "text": "IOS comes up as if it were new: no config, so no passwords. The admin is in."},
    {"from": "ADM", "to": "R1", "label": "copy startup-config running-config", "tone": "good", "states": {"R1": "config loaded"},
     "text": "**This direction**, not the other one. It pulls the real config back into RAM, now that you're logged in *around* it. Interfaces come back administratively down, so they need a `no shutdown`. Typing `copy running-config startup-config` here instead would overwrite the saved config with a blank one."},
    {"from": "ADM", "to": "R1", "label": "enable secret <new password>",
     "text": "Set the new password (and any others you've lost)."},
    {"from": "ADM", "to": "R1", "label": "config-register 0x2102", "states": {"R1": "next: 0x2102"},
     "text": "Put the register back. It takes effect at the next reload; `show version` says *will be 0x2102 at next reload*."},
    {"from": "ADM", "to": "R1", "label": "copy running-config startup-config",
     "text": "Now save: the config with the new password goes to NVRAM."},
    {"from": "R1", "to": "R1", "label": "reload", "states": {"R1": "reg 0x2102"}, "tone": "good",
     "text": "A normal boot with the normal register and the new password. Forget the register step and the router boots with a blank config every time."}
  ]
}
```

**📝 Exam-style questions — 21.5**

**Q1.** Which configuration register value makes a router ignore its startup configuration at boot?

- **A.** 0x2102
- **B.** 0x2142
- **C.** 0x2100
- **D.** 0x0102

<details><summary>Answer</summary>

**Answer: B.** 0x2142 sets the "ignore NVRAM contents" bit, so the router boots with a blank config. **Why not the others:** 0x2102 (A) is the normal value. 0x2100 (C) makes the router stop in ROMMON instead of loading IOS. 0x0102 (D) differs from 0x2102 only in a bit that has nothing to do with the config, so the router still reads NVRAM. The "ignore the config" bit is 0x0040, and 0x2102 + 0x0040 = 0x2142.
</details>

**Q2.** Refer to the exhibit. Every time R1 reloads it comes up with a blank configuration, although a valid startup config is saved in NVRAM. How should the engineer fix it?

```
R1# show version | include register
Configuration register is 0x2142
```

- **A.** Run `config-register 0x2102`, save the configuration, and reload.
- **B.** Run `erase startup-config` and reload.
- **C.** Run `boot system flash:` and reload.
- **D.** Run `copy running-config startup-config` and reload.

<details><summary>Answer</summary>

**Answer: A.** The register was left at 0x2142 after a password recovery, so the router keeps skipping its startup config. Setting it back to 0x2102 makes it read NVRAM again. (Copy the startup config into the running config first if you need to work on it before the reload.) **Why not the others:** erasing the startup config (B) destroys the config you want. `boot system` (C) chooses the image, not whether to read the config. And D is dangerous: the running config is the blank one, so saving it overwrites the good startup config.
</details>

**Q3.** During password recovery the router has booted with register 0x2142 and a blank configuration. Which command should the engineer run next to keep the existing configuration?

- **A.** `copy running-config startup-config`
- **B.** `copy startup-config running-config`
- **C.** `erase startup-config`
- **D.** `reload`

<details><summary>Answer</summary>

**Answer: B.** The saved config is still in NVRAM. Copying it into RAM brings it back while you're already logged in, so you can then change the password. **Why not the others:** A is the classic trap: it saves the **blank** running config over the real one. C deletes the config you're trying to keep. And reloading (D) with 0x2142 still set just boots blank again.
</details>

## 21.6 Useful Monitoring Commands

| Command | Shows |
|---------|-------|
| `show processes cpu` | CPU usage |
| `show memory` | Memory usage |
| `show interfaces` | Detailed port stats, errors |
| `show logging` | Syslog messages stored locally |
| `show ip arp` | IP-to-MAC mappings |

**📝 Exam-style questions — 21.6**

**Q1.** Which command displays the syslog messages a router has stored in its local buffer?

- **A.** `show logging`
- **B.** `show processes cpu`
- **C.** `show interfaces`
- **D.** `show memory`

<details><summary>Answer</summary>

**Answer: A.** `show logging` shows the logging settings and the buffered syslog messages. **Why not the others:** `show processes cpu` (B) shows CPU load per process. `show interfaces` (C) shows port counters and errors. `show memory` (D) shows memory pools and usage, not log messages.
</details>

**Q2.** An engineer on a router needs the MAC address of the host using 10.1.1.20 on a directly connected subnet. Which command shows it?

- **A.** `show mac address-table`
- **B.** `show ip arp`
- **C.** `show cdp neighbors`
- **D.** `show ip route`

<details><summary>Answer</summary>

**Answer: B.** The ARP table maps IP addresses to MAC addresses, which is exactly the question. **Why not the others:** the MAC address table (A) is a switch's map of MACs to ports, with no IP addresses in it. CDP (C) only lists Cisco neighbors, not ordinary hosts. And the routing table (D) maps networks to next hops, not hosts to MACs.
</details>

**Q3.** Users report a slow link on Gi0/1. Which command shows CRC errors and input error counters for that interface?

- **A.** `show ip interface brief`
- **B.** `show interfaces gi0/1`
- **C.** `show running-config interface gi0/1`
- **D.** `show processes cpu`

<details><summary>Answer</summary>

**Answer: B.** `show interfaces` gives the full counters: input errors, CRC, collisions, drops, plus duplex and speed. **Why not the others:** the brief view (A) only shows address and up/down status. The running config (C) shows what's configured, not what's happening on the wire. And CPU load (D) says nothing about errors on one port.
</details>

---

<a name="chapter-22"></a>
# Chapter 22: Automation & Programmability

## 22.1 Why Automate?

Doing the same command on 500 switches by hand is slow and error-prone. **Automation** lets computers configure networks quickly, consistently, and without typos. This is a growing part of modern networking (and the CCNA).

**Story Time 📖:** Imagine writing the same birthday card 500 times by hand vs. printing them. Automation is the printer — same result, way faster, no cramped hand!

**📝 Exam-style questions — 22.1**

**Q1.** Which two benefits does network automation bring? (Choose two.)

- **A.** The same change is applied identically everywhere, without typos.
- **B.** Changes across hundreds of devices take minutes instead of days.
- **C.** Engineers no longer need to understand how the network works.
- **D.** Devices no longer need any configuration.
- **E.** Changes no longer need testing or review.

<details><summary>Answer</summary>

**Answer: A, B.** Consistency and speed at scale are the whole point: the printer, not the hand-written birthday cards. **Why not the others:** a script only does what someone who understands the network told it to (C); a wrong change gets applied to 500 devices just as fast. Devices still need configuration (D); automation just writes it for you. And because mistakes spread faster, testing and review matter *more* (E), not less.
</details>

**Q2.** An engineer must change the NTP server on 400 switches. Why is a script a better choice than SSHing to each switch?

- **A.** A script can change the NTP server without the switches needing to be reachable.
- **B.** A script applies the identical change to every switch quickly and can report which ones succeeded.
- **C.** Switches accept changes from a script even when the change is invalid.
- **D.** SSH can't be used to change NTP settings.

<details><summary>Answer</summary>

**Answer: B.** 400 manual sessions means hours of repetitive typing and a good chance of a typo on switch 263. A script does the same thing every time and can log the result per device. **Why not the others:** the script still needs to reach each switch (A), usually over the same SSH or an API. Invalid commands fail whoever sends them (C). And NTP is ordinary configuration that SSH handles fine (D); the problem is doing it 400 times.
</details>

## 22.2 Controller-Based Networking (SDN)

**SDN (Software-Defined Networking)** separates the network's "brain" from its "muscles":
- **Control plane** (the brain): Decides where traffic should go.
- **Data plane** (the muscles): Actually forwards the traffic.

In traditional networking, every device has its own brain. In SDN, a central **controller** is the brain for everyone, and devices just follow orders. Cisco's campus controller is **Cisco Catalyst Center** (renamed from **DNA Center** — the exam may use either name).

| Model | Where the thinking happens |
|-------|----------------------------|
| **Traditional** | Every device decides for itself 🧠🧠🧠 |
| **SDN** | One **controller** decides 🧠, and the devices carry it out 💪 |

**What does that difference feel like day to day?** The exam asks you to compare managing a campus the traditional way against managing it through Catalyst Center:

| Task | Traditional (per-device) | With Catalyst Center |
|------|--------------------------|----------------------|
| Config change | SSH to each device, type CLI, hope you didn't typo one of them | Define the **intent** once; the controller pushes consistent config everywhere |
| New switch | Console in, configure by hand | **Plug-and-play** provisioning — it's discovered and configured automatically |
| Monitoring | Poll devices one by one (SNMP, `show` commands) | Continuous **assurance** — telemetry from everywhere, analyzed centrally |
| Software updates | Manually, per device, at 2 a.m. | Scheduled and rolled out by the controller |
| Interface | CLI per box | GUI dashboard + a **REST API** for automation |

The traditional way still *works* — Catalyst Center even talks to the same IOS devices underneath. What changes is **where the intelligence sits** and how many places a human has to touch.

**Why separate the "brain" from the "muscles" at all?** Because in traditional networking, every switch and router has its *own* brain making its *own* decisions — which means to change network-wide policy, you have to log into *every single device* and configure it separately. With hundreds of devices, that's slow, and worse, they can drift into slightly different ("snowflake") configs that cause weird bugs. SDN's insight: **pull all the decision-making into one central controller**, and let the devices just be fast, simple forwarders that follow orders. *Why is that powerful?* Now you set policy **once** in the controller and it programs every device consistently — like conducting an orchestra from one podium instead of running to each musician individually. It also means the controller has a **complete view** of the whole network, so it can make smarter, coordinated decisions than any single device could on its own.

Step through one change made the controller way:

```diagram
{
  "type": "topology",
  "title": "One intent, every switch",
  "caption": "The engineer needs VLAN 30 for security cameras on every access switch. Press **Next**.",
  "nodes": [
    {"id": "ENG", "kind": "host", "x": 4.4, "y": 0, "label": "Engineer"},
    {"id": "CC", "kind": "controller", "x": 2, "y": 0, "label": "Catalyst Center", "sub": "10.10.20.85"},
    {"id": "SW1", "kind": "switch", "x": 0.4, "y": 1.5, "label": "SW1"},
    {"id": "SW2", "kind": "switch", "x": 2, "y": 1.5, "label": "SW2"},
    {"id": "SW3", "kind": "switch", "x": 3.6, "y": 1.5, "label": "SW3"}
  ],
  "links": [
    {"a": "ENG", "b": "CC", "label": "GUI / REST"},
    {"a": "CC", "b": "SW1"},
    {"a": "CC", "b": "SW2"},
    {"a": "CC", "b": "SW3"}
  ],
  "steps": [
    {"title": "1. The old way: one box at a time",
     "text": "Without a controller, the engineer SSHes into each switch and types the change by hand. On a busy night that goes wrong in small ways: one switch gets a typo, one gets forgotten. Now the switches have *drifted* apart, and the bugs that causes are hard to find.",
     "nodes": {"SW1": {"badge": "VLAN 30", "tone": "good"}, "SW2": {"badge": "typo: VLAN 3", "tone": "bad"}, "SW3": {"badge": "forgotten", "tone": "warn"}}},
    {"title": "2. State the intent once",
     "text": "With Catalyst Center, the engineer describes **what** they want once, in the GUI or through the REST API: *cameras get VLAN 30 on every access switch.* The controller turns that intent into device configuration.",
     "nodes": {"SW1": null, "SW2": null, "SW3": null, "CC": {"badge": "intent saved", "tone": "accent"}},
     "packets": [{"path": ["ENG", "CC"], "label": "intent: VLAN 30", "tone": "accent"}]},
    {"title": "3. The controller programs every switch",
     "text": "The controller pushes the **same** configuration to every switch over its southbound protocols. No typing, no typos, no switch left out.",
     "nodes": {"SW1": {"badge": "VLAN 30", "tone": "good"}, "SW2": {"badge": "VLAN 30", "tone": "good"}, "SW3": {"badge": "VLAN 30", "tone": "good"}},
     "packets": [{"path": ["CC", "SW1"], "label": "config", "tone": "good"},
                 {"path": ["CC", "SW2"], "label": "config", "tone": "good"},
                 {"path": ["CC", "SW3"], "label": "config", "tone": "good"}]},
    {"title": "4. Assurance: the network reports back",
     "text": "The switches stream telemetry to the controller all the time. When SW3's camera port starts logging errors, the controller notices and tells the engineer, instead of waiting for someone to poll each box. The controller's view of *every* device is what makes this possible.",
     "nodes": {"SW3": {"badge": "port errors", "tone": "warn"}, "CC": {"badge": "issue found", "tone": "warn"}},
     "packets": [{"path": ["SW3", "CC"], "label": "telemetry", "tone": "warn"},
                 {"path": ["CC", "ENG"], "label": "alert: SW3 Gi1/0/12", "tone": "warn"}]}
  ]
}
```

**📝 Exam-style questions — 22.2**

**Q1.** In a controller-based network, which plane is centralized in the controller?

- **A.** The data plane
- **B.** The control plane
- **C.** The forwarding plane on each switch
- **D.** The physical layer

<details><summary>Answer</summary>

**Answer: B.** The controller becomes the shared brain: it decides what the network should do. The devices keep their muscles, the data plane, and forward traffic as programmed. **Why not the others:** the data plane (A) stays on every device; moving every packet through one central box would never scale. "Forwarding plane" (C) is just another name for the data plane. And the physical layer (D) is cables and signals, which no controller can centralize.
</details>

**Q2.** Which two statements describe managing a campus with Cisco Catalyst Center compared with managing it device by device? (Choose two.)

- **A.** New switches can be discovered and configured automatically through plug-and-play.
- **B.** Telemetry from all devices is collected and analyzed centrally for assurance.
- **C.** Every IOS switch must be replaced with an OpenFlow-only switch.
- **D.** Every change still requires an SSH session to each device.
- **E.** The controller forwards all user traffic between switches.

<details><summary>Answer</summary>

**Answer: A, B.** Plug-and-play provisioning and continuous assurance are two of the headline differences in the comparison table above. **Why not the others:** Catalyst Center manages ordinary IOS devices (C); it doesn't need OpenFlow. Per-device SSH (D) is the traditional way the controller replaces. And user traffic stays on the switches' data planes (E); the controller makes decisions, it doesn't carry packets.
</details>

**Q3.** Which action is a data plane function?

- **A.** A switch forwards a frame out of the port listed in its MAC address table.
- **B.** A router runs the SPF algorithm after an OSPF topology change.
- **C.** An engineer opens an SSH session to a router.
- **D.** Two switches exchange STP BPDUs.

<details><summary>Answer</summary>

**Answer: A.** Moving user traffic from one port to another is the data plane's whole job. **Why not the others:** running SPF (B) and exchanging BPDUs (D) are control plane work: deciding where traffic *should* go. SSH (C) is management plane: how a human talks to the device.
</details>

## 22.3 Northbound vs. Southbound APIs

![SDN controller with northbound and southbound APIs](images/sdn.png)

The controller talks in two directions:
- **Northbound API:** Up to apps/humans (e.g., a REST API you program against).
- **Southbound API:** Down to the network devices (e.g., NETCONF, OpenFlow).

The controller sits in the middle, with an API facing each direction:

| API | Faces | Talks to | Typically |
|-----|-------|----------|-----------|
| **Northbound** | Upward | Apps and you | REST |
| **Southbound** | Downward | Switches and routers | NETCONF, OpenFlow |

**Why two different directions with different names?** Because the controller sits in the *middle* and talks to two very different audiences, so it needs a "language" for each:

- **Northbound (upward, toward humans/apps):** This is how *you* (or your automation scripts, or a dashboard) tell the controller *what you want* — "make sure the sales VLAN reaches these buildings." It's designed to be **easy for humans and software to use** (a friendly REST API), because the audience is people and programs. Think "up = toward the people giving orders."
- **Southbound (downward, toward devices):** This is how the controller *pushes those decisions* down to the actual switches and routers, using device-friendly protocols (NETCONF, OpenFlow). The audience is machines, so the language is more technical.

*Why does this split matter?* It means you can describe your intent in simple, human terms at the top, and the controller handles translating that into the nitty-gritty device commands at the bottom. **Memory hook:** North = up toward *you* (the boss giving orders); South = down toward the *devices* (the workers doing the job).

Click the parts of a controller-based network to see who talks to whom, and in which language:

```diagram
{
  "type": "topology",
  "title": "Northbound and southbound",
  "caption": "Applications above, the controller in the middle, devices below. Click a device or a link.",
  "nodes": [
    {"id": "PY", "kind": "server", "x": 0, "y": 0, "label": "Python script", "info": "Your automation. It calls the controller's **northbound REST API** with HTTP verbs and JSON, and never needs to know which CLI each device speaks."},
    {"id": "ITSM", "kind": "server", "x": 1.6, "y": 0, "label": "ITSM app", "info": "A ticketing system that opens a ticket automatically when the controller reports a problem. Same northbound REST API as the script."},
    {"id": "GUI", "kind": "host", "x": 3.2, "y": 0, "label": "Web dashboard", "info": "The controller's own GUI. Humans use it; it's another consumer of the controller's northbound side."},
    {"id": "CTL", "kind": "controller", "x": 1.6, "y": 1.4, "label": "Controller", "sub": "Catalyst Center", "info": "The **middle**. It turns intent from above into device configuration below, and turns raw device data from below into answers above. It holds the view of the whole network."},
    {"id": "R1", "kind": "router", "x": 0, "y": 2.8, "label": "R1"},
    {"id": "SW1", "kind": "switch", "x": 1.6, "y": 2.8, "label": "SW1"},
    {"id": "WLC", "kind": "wlc", "x": 3.2, "y": 2.8, "label": "WLC"}
  ],
  "links": [
    {"a": "PY", "b": "CTL", "label": "REST", "info": "**Northbound** (up, toward apps and people): a REST API over HTTPS, data in JSON. Designed to be easy for software to use."},
    {"a": "ITSM", "b": "CTL", "label": "REST", "info": "**Northbound**: the same REST API, used by another application."},
    {"a": "GUI", "b": "CTL", "info": "**Northbound**: the human-facing side of the controller."},
    {"a": "CTL", "b": "R1", "style": "dashed", "label": "NETCONF", "info": "**Southbound** (down, toward devices): protocols such as NETCONF, RESTCONF, SSH/CLI or SNMP. In other SDN designs, OpenFlow programs the switches' forwarding tables directly."},
    {"a": "CTL", "b": "SW1", "style": "dashed", "info": "**Southbound**: the controller pushes configuration down and collects state and telemetry back up."},
    {"a": "CTL", "b": "WLC", "style": "dashed", "info": "**Southbound**: the controller manages the WLC, which in turn manages its APs."}
  ],
  "zones": [
    {"label": "Applications (north)", "nodes": ["PY", "ITSM", "GUI"], "tone": "accent"},
    {"label": "Devices (south)", "nodes": ["R1", "SW1", "WLC"], "tone": "muted"}
  ]
}
```

**📝 Exam-style questions — 22.3**

**Q1.** A Python script asks Catalyst Center for a list of every device in the network. Which interface does the script use?

- **A.** A southbound NETCONF API
- **B.** A northbound REST API
- **C.** A southbound OpenFlow API
- **D.** A console connection to the controller

<details><summary>Answer</summary>

**Answer: B.** Applications and scripts sit *above* the controller and talk to it through its northbound API, which on Catalyst Center is REST. **Why not the others:** NETCONF (A) and OpenFlow (C) are southbound: the controller uses them to talk *down* to devices. A console connection (D) is for managing the controller's own system, not for asking it about the network.
</details>

**Q2.** Which two are examples of southbound protocols a controller uses? (Choose two.)

- **A.** NETCONF
- **B.** OpenFlow
- **C.** The REST API that an ITSM application calls
- **D.** The controller's web dashboard
- **E.** JSON

<details><summary>Answer</summary>

**Answer: A, B.** Both are ways for a controller to program network devices. **Why not the others:** an application's REST API (C) and the dashboard (D) face north, toward people and software. JSON (E) is a data format, not a protocol; it's what REST APIs usually carry.
</details>

**Q3.** Which sequence describes a change made through a controller?

- **A.** Application → southbound API → controller → northbound API → devices
- **B.** Application → northbound API → controller → southbound API → devices
- **C.** Devices → northbound API → controller → southbound API → application
- **D.** Application → southbound API → devices, bypassing the controller

<details><summary>Answer</summary>

**Answer: B.** North is up toward the app, south is down toward the devices, and the controller translates in the middle. **Why not the others:** A swaps the two directions. C runs the change backwards, from the devices up to the app. And D cuts out the controller, which is the opposite of controller-based networking.
</details>

## 22.4 APIs & REST

An **API (Application Programming Interface)** is a way for programs to talk to each other. A **REST API** uses normal web methods:

| Method | Meaning | Example |
|--------|---------|---------|
| **GET** | Read data | "Show me this device's config" |
| **POST** | Create | "Add a new VLAN" |
| **PUT** | Update/replace | "Change this setting" |
| **DELETE** | Remove | "Delete this VLAN" |

REST APIs usually exchange data in **JSON** format.

**Those four methods have a name: CRUD** — **C**reate, **R**ead, **U**pdate, **D**elete. They're the four things you can do to any piece of data, and REST deliberately maps them onto HTTP verbs that already existed:

| CRUD action | HTTP verb |
|-------------|-----------|
| **C**reate | POST |
| **R**ead | GET |
| **U**pdate | PUT / PATCH |
| **D**elete | DELETE |

**Why reuse web verbs instead of inventing something for networking?** Because the entire internet already speaks HTTP. Every programming language, firewall, load balancer, and proxy handles it, and any engineer already knows what GET means. Reusing it meant network APIs worked everywhere on day one, with no new protocol to learn — *the same reason we don't invent a new alphabet every time we write a new book.*

**How does a REST API know who's calling?** Since every request stands alone (see statelessness below), every request must carry proof of identity. The blueprint names the common schemes:

| Auth type | How it works | Trade-off |
|-----------|--------------|-----------|
| **Basic** | Username:password sent (Base64-encoded — *not* encrypted) in a header | Simple, but only safe inside HTTPS |
| **API key** | A long secret string identifying the calling app | Easy to issue and revoke, but it's a password by another name |
| **Bearer token / OAuth** | You authenticate **once**, receive a short-lived **token**, and send that instead | Credentials aren't repeated on every call, and a stolen token expires soon |

*The pattern to remember: whatever the scheme, it rides along **in every single request** — and none of them are safe over plain HTTP.*

**REST APIs are also stateless:** every request must carry **everything** needed to answer it (including authentication) — the server remembers nothing between calls. **Why insist on that?** Because a server that remembers nothing is a server you can duplicate freely. Any of ten identical servers can answer any request, so you scale by adding more, and a crashed server loses no conversation. *Statelessness is what makes an API scalable.*

The reply carries a **status code** telling you what happened — worth recognizing on sight:

| Code | Family | Meaning |
|------|--------|---------|
| **200 / 201** | 2xx Success | OK / Created |
| **400** | 4xx **Your** mistake | Bad request (malformed) |
| **401 / 403** | 4xx Your mistake | Not authenticated / not allowed |
| **404** | 4xx Your mistake | Not found |
| **500** | 5xx **Server's** mistake | Internal server error |

*The shortcut: **4xx means you sent something wrong, 5xx means the server broke.* That one distinction tells you immediately whether to fix your script or go look at the controller.

Here's a real conversation with Catalyst Center's REST API: log in, ask a question, and see what happens when the token runs out.

```diagram
{
  "type": "sequence",
  "title": "A REST API conversation with Catalyst Center",
  "actors": [
    {"id": "PY", "kind": "host", "label": "Python script"},
    {"id": "CC", "kind": "controller", "label": "Catalyst Center"}
  ],
  "messages": [
    {"from": "PY", "to": "CC", "label": "POST /dna/system/api/v1/auth/token", "detail": "Authorization: Basic ZGV2bmV0dXNlcjpD...",
     "text": "**Authenticate.** The script sends a username and password with **Basic** auth: just `user:password` Base64-encoded, which anyone can decode. That's why this only ever happens over HTTPS."},
    {"from": "CC", "to": "PY", "label": "200 OK", "detail": "{\"Token\": \"eyJ0eXAiOiJKV1Qi...\"}", "dashed": true, "tone": "good", "states": {"PY": "has token"},
     "text": "Success (2xx). The reply is JSON holding a **token**. From now on the script sends the token instead of the password."},
    {"from": "PY", "to": "CC", "label": "GET /dna/intent/api/v1/network-device", "detail": "X-Auth-Token: eyJ0eXAiOiJKV1Qi...",
     "text": "**Read** (the R in CRUD) the device list. The token rides along in a header on **this** request, because REST is stateless: the server doesn't remember the script between calls."},
    {"from": "CC", "to": "PY", "label": "200 OK", "detail": "{\"response\": [{\"hostname\": \"SW1\", ...}]}", "dashed": true, "tone": "good",
     "text": "The answer, as JSON the script can loop through: hostnames, models, software versions, management addresses."},
    {"note": "An hour later the token expires", "over": ["PY", "CC"], "states": {"PY": "token expired"},
     "text": "Tokens are short-lived on purpose: a stolen one stops working soon."},
    {"from": "PY", "to": "CC", "label": "GET /dna/intent/api/v1/network-device", "detail": "X-Auth-Token: (expired)",
     "text": "The script tries again with the old token."},
    {"from": "CC", "to": "PY", "label": "401 Unauthorized", "dashed": true, "tone": "bad",
     "text": "A **4xx** code: *your* side sent something wrong, here an expired token. The fix is in the script: repeat the POST to get a fresh token. A **5xx** would have meant the controller itself had broken."}
  ]
}
```

**📝 Exam-style questions — 22.4**

**Q1.** Which HTTP method does a script use to retrieve the list of devices from a controller's REST API?

- **A.** GET
- **B.** POST
- **C.** PUT
- **D.** DELETE

<details><summary>Answer</summary>

**Answer: A.** GET reads data, the R in CRUD. **Why not the others:** POST (B) creates something new, PUT (C) updates or replaces something that exists, and DELETE (D) removes it. None of them is for simply reading.
</details>

**Q2.** A script that has worked for weeks suddenly gets HTTP **401** from the controller on every call. What should the engineer check first?

- **A.** The controller's logs for a software crash
- **B.** The credentials or token the script sends with each request
- **C.** The spelling of the URL path
- **D.** The JSON syntax in the request body

<details><summary>Answer</summary>

**Answer: B.** 401 means "not authenticated": the request didn't carry valid credentials. An expired token or a changed password is the usual cause. **Why not the others:** a crash on the controller (A) would show up as a 5xx code. A misspelled path (C) gives 404 Not Found. Malformed JSON (D) gives 400 Bad Request.
</details>

**Q3.** Which two statements about REST APIs are true? (Choose two.)

- **A.** They are stateless: each request carries everything needed to process it, including authentication.
- **B.** They map create, read, update and delete operations onto HTTP methods.
- **C.** The server keeps a session for each client, so credentials are only sent once.
- **D.** They can only exchange data in XML.
- **E.** DELETE is used to read a resource.

<details><summary>Answer</summary>

**Answer: A, B.** Stateless requests plus HTTP verbs mapped to CRUD are the two defining habits of REST. **Why not the others:** the server remembers nothing between calls (C), which is why a token goes with every request. REST APIs usually use JSON and can use XML (D); neither is mandatory. And DELETE removes a resource (E); GET reads it.
</details>

**Q4.** Refer to the exhibit. A script sends this request to a controller and receives a token in reply. Which two statements are true? (Choose two.)

```
POST /dna/system/api/v1/auth/token HTTP/1.1
Host: 10.10.20.85
Authorization: Basic ZGV2bmV0dXNlcjpDaXNjbzEyMyE=
```

- **A.** The credentials are only Base64-encoded, so the request must be sent over HTTPS.
- **B.** The script must include the returned token in its later requests.
- **C.** Basic authentication encrypts the password with AES.
- **D.** After this request the controller remembers the script, so later requests need no credentials or token.
- **E.** This POST creates a new network device on the controller.

<details><summary>Answer</summary>

**Answer: A, B.** Decoding that Base64 string gives `devnetuser:Cisco123!` in one step, so only HTTPS keeps it private. The token that comes back is what the script presents from now on. **Why not the others:** Base64 is an encoding, not encryption (C). REST is stateless (D); the controller recognizes the script only by the token in each request. And this POST creates a **token**, not a device (E): the URL ends in `/auth/token`.
</details>

## 22.5 Data Formats: JSON, XML, YAML

**JSON** (most common) — uses `{ }` and `key: value`:
```json
{
  "device": "Router1",
  "interfaces": ["Gi0/0", "Gi0/1"],
  "enabled": true
}
```

**YAML** — clean, uses indentation (popular with Ansible):
```yaml
device: Router1
interfaces:
  - Gi0/0
  - Gi0/1
enabled: true
```

**XML** — uses tags like HTML:
```xml
<device>Router1</device>
```

**📝 Exam-style questions — 22.5**

**Q1.** Refer to the exhibit. Why is this JSON invalid?

```
{
  "hostname": "SW1",
  "vlans": [10, 20, 30],
  "managed": true,
}
```

- **A.** Boolean values such as `true` must be in quotes.
- **B.** There is a comma after the last key-value pair.
- **C.** Arrays must use parentheses instead of square brackets.
- **D.** Keys must not be in quotes.

<details><summary>Answer</summary>

**Answer: B.** JSON doesn't allow a trailing comma after the last item in an object or array. Remove the comma after `true` and it's valid. **Why not the others:** `true` without quotes is the correct way to write a boolean (A); in quotes it would be the *string* "true". Arrays use square brackets (C). And JSON keys must be double-quoted strings (D).
</details>

**Q2.** Refer to the exhibit. Which two statements are true? (Choose two.)

```
{
  "interfaces": [
    {"name": "Gi0/1", "enabled": true, "vlan": 10},
    {"name": "Gi0/2", "enabled": false, "vlan": 20}
  ]
}
```

- **A.** The value of `"interfaces"` is an array that holds two objects.
- **B.** The value of `"enabled"` is a string.
- **C.** The value of `"vlan"` for Gi0/2 is the number 20.
- **D.** The outermost structure is an array.
- **E.** Each object uses `=` between a key and its value.

<details><summary>Answer</summary>

**Answer: A, C.** Square brackets hold an array, here of two `{ }` objects, and `20` without quotes is a number. **Why not the others:** `true` and `false` are booleans, not strings (B). The outermost `{ }` makes it an object (D). And JSON separates keys from values with a colon (E).
</details>

**Q3.** Which data format relies on indentation instead of brackets or tags, and is the language of Ansible playbooks?

- **A.** JSON
- **B.** XML
- **C.** YAML
- **D.** CSV

<details><summary>Answer</summary>

**Answer: C.** YAML uses indentation and dashes for lists, which makes it easy for people to read and write. **Why not the others:** JSON (A) uses braces and brackets. XML (B) uses opening and closing tags. CSV (D) is comma-separated rows, with no nesting at all.
</details>

**Q4.** Which of these is **not** a valid JSON value?

- **A.** `"true"`
- **B.** `true`
- **C.** `null`
- **D.** `'SW1'`

<details><summary>Answer</summary>

**Answer: D.** JSON strings must use **double** quotes; single quotes are invalid. **Why not the others:** `"true"` (A) is a valid string that happens to contain the word true. `true` (B) is a valid boolean. `null` (C) is JSON's valid "no value".
</details>

## 22.6 Automation Tools

| Tool | Language | Style | Agent Needed? |
|------|----------|-------|---------------|
| **Ansible** | YAML | Push, simple | No (agentless) |
| **Terraform** | HCL | Declarative, push | No (agentless) |
| **Puppet** | Ruby-like | Pull | Yes (agent) |
| **Chef** | Ruby | Pull | Yes (agent) |

**Ansible** is the CCNA favorite because it's **agentless** (nothing to install on devices) and uses easy-to-read YAML "playbooks."

**Ansible and Terraform are the two named in the current (v1.1) exam blueprint** — Puppet and Chef are worth recognizing, but they're the older, agent-based generation. **Why does "agentless" keep coming up as an advantage?** Because an agent is software you must install, update, and secure **on every single device** — and plenty of network gear won't let you install anything at all. Agentless tools connect over SSH or an API that the device *already* offers, so there's nothing to deploy before you can start. *See 22.9 for how Terraform's declarative style differs from a playbook that runs steps in order.*

**📝 Exam-style questions — 22.6**

**Q1.** Which tool is agentless and uses YAML playbooks?

- **A.** Puppet
- **B.** Chef
- **C.** Ansible
- **D.** Terraform

<details><summary>Answer</summary>

**Answer: C.** Ansible connects over SSH or an API and runs playbooks written in YAML, with nothing to install on the devices. **Why not the others:** Puppet (A) and Chef (B) need an agent on each managed node. Terraform (D) is agentless too, but it uses its own language, HCL, not YAML playbooks.
</details>

**Q2.** Which two tools traditionally need an agent installed on every managed node? (Choose two.)

- **A.** Ansible
- **B.** Terraform
- **C.** Puppet
- **D.** Chef
- **E.** Python with the Requests library

<details><summary>Answer</summary>

**Answer: C, D.** Puppet and Chef are the older, pull-based generation: an agent on each node checks in with a central server. **Why not the others:** Ansible (A) and Terraform (B) are agentless. A Python script calling a REST API (E) needs nothing on the device beyond the API it already offers.
</details>

**Q3.** Why does "agentless" matter so much for network automation?

- **A.** Many network devices don't allow extra software to be installed, so tools that use SSH or an existing API can manage them straight away.
- **B.** Agentless tools don't need any credentials to log in.
- **C.** Agentless tools only work on Linux servers.
- **D.** Agents are faster, so agentless tools are only for small networks.

<details><summary>Answer</summary>

**Answer: A.** You can't install a Puppet agent on most switches, but every managed switch already speaks SSH or an API. **Why not the others:** agentless tools still log in with credentials (B), over SSH or an API. They manage network devices perfectly well (C). And speed isn't the trade-off (D); agentless tools run at large scale every day.
</details>

## 22.7 Config Management Idea: Intent & Consistency

Automation lets you describe the network you WANT ("intent"), and tools make reality match it — and keep it that way. No more "snowflake" devices that all drifted to slightly different settings.

**📝 Exam-style questions — 22.7**

**Q1.** What is configuration drift?

- **A.** Devices that should be configured alike gradually become different through one-off manual changes.
- **B.** A configuration moving from running-config to startup-config.
- **C.** A device losing its configuration after a reload.
- **D.** Configuration being pushed from a controller to its devices.

<details><summary>Answer</summary>

**Answer: A.** A quick fix here, a forgotten change there, and soon no two "identical" switches match. These "snowflakes" cause bugs that are very hard to explain. **Why not the others:** saving the config (B) is normal housekeeping. Losing an unsaved config (C) is a different problem. And a controller pushing config (D) is how you *prevent* drift.
</details>

**Q2.** What does intent-based management mean?

- **A.** You describe the result you want, and the system works out the configuration and keeps reality matching it.
- **B.** You type every command on every device yourself.
- **C.** Devices pick their own configuration with no human input.
- **D.** Configuration is only checked once, when it's first applied.

<details><summary>Answer</summary>

**Answer: A.** "Cameras get VLAN 30 everywhere" is intent. The tooling translates it into commands and keeps checking that the network still matches. **Why not the others:** typing every command (B) is the traditional way. A human still sets the intent (C). And checking only once (D) would let drift creep back in; the "keep it that way" part is the point.
</details>

---

## 22.8 AI & Machine Learning in Network Operations

Automation (so far) does **what you told it to do**, exactly and repeatedly. The newer question is whether the network can help decide **what should be done** — and this is now an explicit exam topic.

**Why bring AI into networking at all?** Because of a mismatch that keeps getting worse: a modern network produces a **staggering** amount of telemetry — every device, interface, wireless client, and application reporting constantly. No human team can read it all. So traditional monitoring uses **fixed thresholds** ("alert if CPU > 80%"), which fail in both directions: they scream about a harmless spike at 2 a.m., and they stay silent while a link slowly degrades from 5 ms to 40 ms of latency — never crossing a threshold, but ruining every call in the building.

Machine learning attacks that differently. Instead of a human guessing the right number, the system **learns what normal looks like** for *this* network — including that Monday mornings are busy and the backup runs at 1 a.m. — and flags **deviations from that baseline**. Nobody has to define "normal" in advance.

| Term | What it means |
|------|---------------|
| **AI** | The broad goal: machines performing tasks that need human-like judgment |
| **ML** | The practical method: learning patterns from data instead of following fixed rules |
| **AIOps** | Applying AI/ML to IT and network operations |
| **Predictive analytics** | Spotting a trend and warning **before** it becomes an outage |

Where it shows up in real networks:

- **Anomaly detection** — "this switch's traffic pattern is unlike anything in the last 90 days."
- **Predictive maintenance** — "this AP's error rate is rising steadily; it will likely fail soon."
- **Root cause analysis** — collapsing 400 simultaneous alarms into one sentence: *"this uplink went down; everything else is a symptom."*
- **Wireless optimization** — learning interference patterns and adjusting channels and power automatically.
- **Capacity planning** — projecting when a link will saturate based on real growth, not guesswork.

**Predictive vs. generative — the exam's key distinction.** The blueprint (v1.1) explicitly names **two kinds of AI**, and they do opposite jobs:

| Aspect | **Predictive AI** | **Generative AI** |
|--------|-------------------|-------------------|
| Job | **Forecasts** from patterns in data | **Creates** new content |
| Answers | "What is about to happen?" | "Write/make this for me" |
| In networking | Anomaly detection, failure prediction, capacity planning — everything described above | Drafting configs and ACLs, explaining a cryptic log in plain English, chat-style troubleshooting assistants, writing documentation |
| Example | "This AP will likely fail within two weeks" | "Generate the OSPF config for these three routers" |

*The one-line separator: predictive AI **watches and warns**; generative AI **writes and explains**.* Modern tools combine them — an assistant built into Catalyst Center might use predictive models to spot the anomaly, then generative AI to explain it and draft the fix. And the same caution applies double to generative AI: it produces **plausible** output, not guaranteed-correct output, so a human reviews any config it writes before it touches production.

**The honest limits** — worth knowing, because the exam frames AI as an aid rather than a replacement. ML systems learn from **historical data**, so they inherit its blind spots: a network that was misconfigured for a year has learned that misconfiguration as "normal." They produce **probabilities, not certainties**, so they can be confidently wrong. And many models can't fully explain *why* they flagged something, which is uncomfortable when you're deciding whether to reroute production traffic. *AI is a very fast assistant that reads everything and never gets tired — not an engineer. A human still owns the decision.*

**📝 Exam-style questions — 22.8**

**Q1.** Which is an example of **generative** AI in network operations?

- **A.** Predicting that an AP will fail within two weeks
- **B.** Flagging a switch whose traffic pattern differs from its 90-day baseline
- **C.** Drafting an ACL from a plain-English description of what should be allowed
- **D.** Projecting when a WAN link will reach full capacity

<details><summary>Answer</summary>

**Answer: C.** Generative AI *creates* something new: here a config, which a human then reviews. **Why not the others:** failure prediction (A), anomaly detection (B) and capacity forecasting (D) are all **predictive** AI: watching patterns in data and warning about what's coming.
</details>

**Q2.** Why can a machine-learning baseline catch problems that a fixed threshold such as "alert if latency > 100 ms" misses?

- **A.** It learns what is normal for this network at each time of day, so it flags unusual changes even when they stay under any fixed number.
- **B.** It ignores all the telemetry so it can't raise false alarms.
- **C.** It uses higher thresholds than an engineer would choose.
- **D.** It only alerts after a device has failed.

<details><summary>Answer</summary>

**Answer: A.** Latency creeping from 5 ms to 40 ms never crosses 100 ms, but it's far from *normal* for that link, and that's what a learned baseline notices. **Why not the others:** ML relies on telemetry (B); it's the input. It doesn't work by picking a bigger number (C). And warning *before* failure (D) is the whole aim of predictive analytics.
</details>

**Q3.** Which two are real limitations of AI and ML in network operations? (Choose two.)

- **A.** A model trained on a network that was misconfigured for a year may treat that misconfiguration as normal.
- **B.** Models give probabilities, so they can be confidently wrong.
- **C.** Configurations written by generative AI are guaranteed to be correct.
- **D.** ML needs no data to learn from.
- **E.** AI removes the need for a human to approve changes.

<details><summary>Answer</summary>

**Answer: A, B.** Models inherit the blind spots of their historical data, and their outputs are probabilities, not certainties. **Why not the others:** generative AI produces *plausible* output, not guaranteed-correct output (C), which is why a human reviews it. Machine learning learns *from* data (D); no data, no model. And a human still owns the decision (E).
</details>

## 22.9 Infrastructure as Code — Terraform & Friends

Section 22.6 introduced automation tools. One idea underneath them deserves its own name, because it's how modern infrastructure is actually managed: **Infrastructure as Code (IaC)** — you describe the **desired state** in a text file, keep that file in version control, and let a tool make reality match it.

**Why is writing a file better than just configuring the device?** Because a config typed into a device is **invisible history**. Six months later, nobody knows who changed that ACL, why, or what it looked like before. When the file is the source of truth, your infrastructure gains everything software engineering already figured out: **version control** (every change dated and attributed), **code review** (a second person checks before it ships), **rollback** (restore the previous file), and **reproducibility** (build an identical test environment from the same description).

| Tool | Style | Agent needed? | Typical use |
|------|-------|---------------|-------------|
| **Ansible** | Procedural-ish, push over SSH/API | **Agentless** | Device configuration, ad-hoc tasks |
| **Terraform** | **Declarative**, state-file driven | Agentless | Provisioning infrastructure (cloud, network) |
| **Puppet / Chef** | Pull-based, agent on each node | **Agent** | Server config (older, less common in CCNA v1.1) |

**Declarative vs. procedural** is the distinction to hold onto. A **procedural** tool is a recipe: *"add this VLAN, then this interface."* Run it twice and you may get errors or duplicates. A **declarative** tool is a description: *"this network has VLANs 10, 20, 30."* The tool inspects what exists, computes the difference, and changes **only what doesn't match**. Run it ten times and nothing extra happens — a property called **idempotence**. *You describe the destination, not the driving directions.*

Terraform is the exam's named example of this style: it keeps a **state file** recording what it built, so it always knows the gap between "what you asked for" and "what exists."

Here's the declarative loop from Terraform's side, including the second run that changes nothing:

```diagram
{
  "type": "sequence",
  "title": "Infrastructure as Code: plan, apply, and apply again",
  "actors": [
    {"id": "ENG", "kind": "host", "label": "Engineer"},
    {"id": "GIT", "kind": "server", "label": "Git repo"},
    {"id": "TF", "kind": "server", "label": "Terraform"},
    {"id": "SW", "kind": "switch", "label": "SW1"}
  ],
  "messages": [
    {"from": "ENG", "to": "GIT", "label": "commit vlans.tf", "detail": "SW1 has VLANs 10, 20, 30",
     "text": "The engineer edits the **desired state** in a file. It describes the destination (*these VLANs exist*), not the steps to get there."},
    {"note": "A teammate reviews and approves the change", "over": ["ENG", "GIT"],
     "text": "Because it's a file in version control, the change gets a review, a date and an author, and the previous version is one click away."},
    {"from": "ENG", "to": "TF", "label": "terraform plan",
     "text": "Ask Terraform what it *would* do, before it does anything."},
    {"from": "TF", "to": "SW", "label": "read current VLANs", "detail": "via the device's API",
     "text": "Terraform checks what actually exists, and compares it with its **state file**, its record of what it built last time."},
    {"from": "SW", "to": "TF", "label": "VLANs 10, 20", "dashed": true,
     "text": "The switch reports what it has today."},
    {"from": "TF", "to": "TF", "label": "diff: + VLAN 30", "tone": "accent",
     "text": "Desired minus actual: only VLAN 30 is missing. The plan says *1 to add, 0 to change, 0 to destroy*."},
    {"from": "ENG", "to": "TF", "label": "terraform apply",
     "text": "Approve the plan."},
    {"from": "TF", "to": "SW", "label": "create VLAN 30", "tone": "good", "states": {"SW": "VLANs 10,20,30"},
     "text": "Terraform changes **only** what doesn't match. VLANs 10 and 20 are left alone."},
    {"from": "TF", "to": "TF", "label": "update state file", "states": {"TF": "state saved"},
     "text": "It records what now exists, so the next run starts from an accurate picture."},
    {"from": "ENG", "to": "TF", "label": "terraform apply (again)",
     "text": "What if someone runs it a second time?"},
    {"from": "TF", "to": "TF", "label": "diff: no changes", "tone": "good",
     "text": "Reality already matches the file, so nothing happens. That's **idempotence**: run it ten times, get the same result. A procedural script that says *add VLAN 30* might have errored or duplicated work."}
  ]
}
```

**📝 Exam-style questions — 22.9**

**Q1.** Which statement describes a **declarative** automation tool?

- **A.** You describe the desired end state, and the tool works out what must change to reach it.
- **B.** You list each command in the exact order it must run.
- **C.** The tool records keystrokes and replays them on each device.
- **D.** The tool only reads configuration and never changes it.

<details><summary>Answer</summary>

**Answer: A.** Declarative means "describe the destination". The tool compares that with reality and changes only the difference. **Why not the others:** an ordered list of commands (B) is the procedural style, a recipe. Replaying keystrokes (C) is crude scripting with no idea of state. And a tool that never changes anything (D) is a monitoring tool, not configuration management.
</details>

**Q2.** An engineer runs `terraform apply` with an unchanged configuration file, right after a successful apply. What happens?

- **A.** Terraform reports no changes, because the infrastructure already matches the desired state.
- **B.** Terraform creates every resource a second time.
- **C.** Terraform deletes everything and rebuilds it.
- **D.** Terraform fails, because the resources already exist.

<details><summary>Answer</summary>

**Answer: A.** That's idempotence: the desired state and the real state match, so the difference is empty. **Why not the others:** duplicates (B), a rebuild (C) and errors (D) are what can happen when you re-run a *procedural* script that blindly repeats its steps. Terraform compares before it acts.
</details>

**Q3.** What does Terraform's state file do?

- **A.** It records what Terraform has built, so Terraform can work out the gap between what was asked for and what exists.
- **B.** It stores the device's startup configuration.
- **C.** It holds the YAML playbook Terraform runs.
- **D.** It is the agent Terraform installs on each device.

<details><summary>Answer</summary>

**Answer: A.** The state file is Terraform's memory of the infrastructure it manages. **Why not the others:** it doesn't replace the device's own startup config (B). Terraform uses HCL files, not YAML playbooks (C), which belong to Ansible. And Terraform is agentless (D).
</details>

**Q4.** Which two benefits come from keeping network configuration as code in version control? (Choose two.)

- **A.** Every change is recorded with who made it, when, and why.
- **B.** A bad change can be rolled back by restoring the previous version of the file.
- **C.** Changes no longer need to be tested.
- **D.** Devices no longer need management access.
- **E.** It requires installing an agent on every device.

<details><summary>Answer</summary>

**Answer: A, B.** History and rollback are what turn invisible changes into accountable ones. **Why not the others:** code still needs testing (C); version control adds review, it doesn't replace testing. The tools still reach devices over SSH or an API (D). And IaC tools such as Terraform and Ansible are agentless (E).
</details>

---

<a name="chapter-23"></a>
# Chapter 23: The Troubleshooting Toolbox

## 23.1 A Simple Method: Follow the Layers

When something's broken, check the OSI layers **from the bottom up**:

```
 1. Physical: Is the cable plugged in? Link light on?
 2. Data Link: Right VLAN? Interface up/up? MAC learned?
 3. Network: Correct IP, mask, gateway? Can you ping?
 4. Transport: Right ports open? ACL blocking?
 5-7. App: Is DNS working? Is the service running?
```

**Story Time 📖:** It's like a car that won't start. Don't rebuild the engine first! Check the simple stuff: Is there gas? Is it in park? Is the battery dead? Start low and simple, then work up.

**Why troubleshoot from the BOTTOM (Layer 1) UP instead of top-down?** Because the layers *depend* on each other — each one is built on the layer below it. Layer 3 (IP) literally cannot work if Layer 1 (the cable) is unplugged, and Layer 7 (your app) cannot work if Layer 3 has no route. So a problem at a low layer **makes everything above it look broken too.** If you start at the top, you might spend an hour debugging a "DNS problem" (Layer 7) when the real issue is a dead cable (Layer 1) — you'd be trying to fix the *symptom* while ignoring the *cause*. Checking bottom-up means you fix the **foundation first**: confirm the cable, then the VLAN/link, then the IP, then the ports, then the app. *The lower stuff is also usually faster and cheaper to check* — glancing at a link light takes 2 seconds, so it's silly to debug complex software before verifying the wire. You rule out the simple, foundational causes before touching the complicated ones. (There's also a "divide and conquer" approach where you start in the middle with a ping, but bottom-up is the safest default and the one the exam loves.)

Here's the method on a real ticket. Watch how each layer is ruled out before moving up:

```diagram
{
  "type": "topology",
  "title": "Bottom-up: \"I can't open the intranet site\"",
  "caption": "The PC is in VLAN 10. The intranet server and the DNS server sit behind R1. Press **Next**.",
  "nodes": [
    {"id": "PC", "kind": "host", "x": 0, "y": 1, "label": "PC", "sub": "10.10.10.25"},
    {"id": "SW1", "kind": "switch", "x": 1.4, "y": 1, "label": "SW1"},
    {"id": "R1", "kind": "router", "x": 2.8, "y": 1, "label": "R1", "sub": "10.10.10.1"},
    {"id": "WEB", "kind": "server", "x": 4.2, "y": 0.3, "label": "intranet", "sub": "10.20.0.10"},
    {"id": "DNS", "kind": "server", "x": 4.2, "y": 1.8, "label": "DNS", "sub": "10.20.0.53"}
  ],
  "links": [
    {"a": "PC", "b": "SW1", "label": "Gi1/0/5"},
    {"a": "SW1", "b": "R1"},
    {"a": "R1", "b": "WEB"},
    {"a": "R1", "b": "DNS"}
  ],
  "steps": [
    {"title": "1. The ticket",
     "text": "A user can't open `https://intranet.corp.local`. It's tempting to jump straight to the web server, but start at the bottom: every layer depends on the ones below it.",
     "focus": ["PC"]},
    {"title": "2. Layer 1: is it plugged in?",
     "text": "The link light is on. `show interfaces gi1/0/5` on SW1 says **up/up** with no CRC errors. Two seconds of checking, and the cable is ruled out.",
     "focus": ["PC", "SW1", "PC-SW1"],
     "nodes": {"PC": {"badge": "L1 ok", "tone": "good"}}},
    {"title": "3. Layer 2: right VLAN?",
     "text": "`show vlan brief` puts Gi1/0/5 in VLAN 10, and `show mac address-table` has learned the PC's MAC on that port. Layer 2 is fine.",
     "focus": ["PC", "SW1", "R1", "PC-SW1", "SW1-R1"],
     "nodes": {"SW1": {"badge": "L2 ok", "tone": "good"}}},
    {"title": "4. Layer 3: can it reach the server by IP?",
     "text": "`ipconfig` shows 10.10.10.25/24 with gateway 10.10.10.1. `ping 10.10.10.1` works, and so does `ping 10.20.0.10`. Addressing and routing are fine.",
     "nodes": {"R1": {"badge": "L3 ok", "tone": "good"}},
     "packets": [{"path": ["PC", "SW1", "R1", "WEB"], "label": "ping 10.20.0.10", "tone": "good"}]},
    {"title": "5. Layer 4: is the port open?",
     "text": "`show access-lists` on R1 has nothing blocking TCP 443, and a port test from the PC to 10.20.0.10 on 443 connects. The service is listening and reachable.",
     "packets": [{"path": ["PC", "SW1", "R1", "WEB"], "label": "TCP 443: open", "tone": "good"}]},
    {"title": "6. Layer 7: what about the name?",
     "text": "`ping intranet.corp.local` fails with *could not find host*. `ipconfig /all` shows the DNS server as **10.20.0.35**: a typo for 10.20.0.53. The PC's DNS queries go to an address where nothing answers.",
     "nodes": {"PC": {"badge": "DNS typo", "tone": "bad"}},
     "packets": [{"path": ["PC", "SW1", "R1"], "label": "DNS to 10.20.0.35?", "tone": "bad"}]},
    {"title": "7. Fixed",
     "text": "Correct the DNS server to 10.20.0.53 and the name resolves. Every layer below was proven good first, so there was no time wasted on the web server, which was never broken.",
     "nodes": {"PC": {"badge": "fixed", "tone": "good"}},
     "packets": [{"path": ["PC", "SW1", "R1", "DNS"], "label": "DNS query answered", "tone": "good"}]}
  ]
}
```

**📝 Exam-style questions — 23.1**

**Q1.** A user reports that nothing on the network works from their desk. Using the bottom-up method, what should the engineer check first?

- **A.** The link light and the cable between the PC and the switch
- **B.** The PC's DNS server setting
- **C.** The ACLs on the router
- **D.** The router's routing table

<details><summary>Answer</summary>

**Answer: A.** Bottom-up starts at Layer 1, and a dead link explains *everything* failing. It's also the quickest thing to check. **Why not the others:** DNS (B) is Layer 7, ACLs (C) affect Layer 3 and 4 traffic, and the routing table (D) is Layer 3. All three are worth checking later, but only once the layers below them are proven.
</details>

**Q2.** A PC has a link light, but its switch port is assigned to the wrong VLAN. At which layer does the bottom-up method find this problem?

- **A.** Layer 1
- **B.** Layer 2
- **C.** Layer 3
- **D.** Layer 7

<details><summary>Answer</summary>

**Answer: B.** VLAN membership is a Layer 2 setting on the switch; `show vlan brief` reveals it. **Why not the others:** Layer 1 (A) passed, since the link is up. The PC may then *fail* at Layer 3 (C), getting no DHCP address or failing to ping its gateway, but that's the symptom; the cause is a layer lower. Layer 7 (D) is far above where the fault is.
</details>

**Q3.** Why does the bottom-up method begin at Layer 1?

- **A.** Each layer depends on the layers below it, so a low-layer fault makes everything above it look broken.
- **B.** Layer 1 problems are the only ones that cause outages.
- **C.** Application problems can't be diagnosed with show commands.
- **D.** Cisco requires troubleshooting to follow the OSI model in order.

<details><summary>Answer</summary>

**Answer: A.** A dead cable makes DNS, routing and the application all fail together. Fixing the foundation first stops you chasing symptoms higher up. **Why not the others:** faults at any layer cause outages (B). Application problems are diagnosable (C), just not first. And there's no Cisco rule (D); bottom-up is simply the safest default, and divide-and-conquer from the middle with a ping is also valid.
</details>

## 23.2 The Essential Troubleshooting Commands

| Command | What It Tests |
|---------|---------------|
| `ping <ip>` | Can I reach that device? (basic connectivity) |
| `traceroute <ip>` | What path do packets take? Where do they stop? |
| `show ip interface brief` | Are my interfaces up with IPs? |
| `show ip route` | Do I know how to reach that network? |
| `show cdp neighbors` | What's connected to me? |
| `show mac address-table` | Which MAC is on which port? |
| `show vlan brief` | Are ports in the right VLANs? |
| `show interfaces` | Errors, drops, duplex mismatches? |
| `show running-config` | What's actually configured? |

`traceroute` finds the hop where packets stop. Here's how it works: it sends probes with a TTL that starts at 1 and grows by one each round.

```diagram
{
  "type": "sequence",
  "title": "How traceroute finds each hop",
  "actors": [
    {"id": "R1", "kind": "router", "label": "R1"},
    {"id": "R2", "kind": "router", "label": "R2 10.0.12.2"},
    {"id": "R3", "kind": "router", "label": "R3 10.0.23.3"},
    {"id": "SRV", "kind": "server", "label": "Server 10.30.0.10"}
  ],
  "messages": [
    {"from": "R1", "to": "R2", "label": "UDP probe, TTL 1", "detail": "to 10.30.0.10, port 33434",
     "text": "`R1# traceroute 10.30.0.10`. The first probe has a TTL of **1**. IOS sends three probes per TTL and shows a time for each."},
    {"from": "R2", "to": "R1", "label": "ICMP Time Exceeded", "detail": "from 10.0.12.2", "dashed": true, "tone": "warn",
     "text": "R2 decrements the TTL to 0, so it must drop the probe, and it reports back with **Time Exceeded**. That reply reveals R2's address: hop 1 is 10.0.12.2."},
    {"from": "R1", "to": "R3", "label": "UDP probe, TTL 2",
     "text": "Next round, TTL **2**. R2 decrements it to 1 and forwards it; R3 decrements it to 0."},
    {"from": "R3", "to": "R1", "label": "ICMP Time Exceeded", "detail": "from 10.0.23.3", "dashed": true, "tone": "warn",
     "text": "Hop 2 is 10.0.23.3."},
    {"from": "R1", "to": "SRV", "label": "UDP probe, TTL 3",
     "text": "TTL **3** gets all the way to the server."},
    {"from": "SRV", "to": "R1", "label": "ICMP Port Unreachable", "dashed": true, "tone": "good",
     "text": "The server isn't listening on that odd UDP port, so it answers **Port Unreachable**, which tells traceroute it has reached the destination. (Windows `tracert` sends ICMP echo requests instead and stops at the echo reply.)"},
    {"note": "If a hop shows * * *", "over": ["R1", "R2", "R3", "SRV"],
     "text": "Asterisks mean no reply came back within the timeout. A trace that shows hops 1 and 2 and then only asterisks points at hop 3 or the link to it: a missing route, an ACL, or a device that's down. Some devices also simply rate-limit or refuse to send ICMP errors, so one quiet hop in the middle of a working trace isn't always a fault."}
  ]
}
```

**📝 Exam-style questions — 23.2**

**Q1.** Users can reach some remote networks but not 172.20.5.0/24. Which command shows the hop at which packets toward that network stop?

- **A.** `ping 172.20.5.10`
- **B.** `traceroute 172.20.5.10`
- **C.** `show ip interface brief`
- **D.** `show cdp neighbors`

<details><summary>Answer</summary>

**Answer: B.** Traceroute lists each router along the path, so the last hop that answers shows roughly where things stop. **Why not the others:** ping (A) only says yes or no for the whole path. `show ip interface brief` (C) checks the local interfaces. CDP (D) lists directly connected Cisco neighbors, not the path to a remote network.
</details>

**Q2.** A user plugged into SW1 Gi1/0/12 can't reach anything, but the port is up/up. Which command quickly confirms whether the port is in the expected VLAN?

- **A.** `show vlan brief`
- **B.** `show ip route`
- **C.** `show running-config | include hostname`
- **D.** `show cdp neighbors`

<details><summary>Answer</summary>

**Answer: A.** `show vlan brief` lists every VLAN and the access ports assigned to it. **Why not the others:** a Layer 2 switch's routing table (B) has nothing to do with port VLANs. C only shows the device's name. And CDP (D) shows neighboring Cisco devices, not which VLAN a user's port is in.
</details>

**Q3.** Refer to the exhibit. Which two statements are true? (Choose two.)

```
R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.1.1.1        YES manual up                    up
GigabitEthernet0/1     10.2.2.1        YES manual administratively down down
GigabitEthernet0/2     unassigned      YES unset  up                    up
```

- **A.** Gi0/1 needs `no shutdown` before it can pass traffic.
- **B.** Gi0/0 is working at Layers 1 and 2.
- **C.** Gi0/2 has been shut down by an administrator.
- **D.** Gi0/1 has a faulty cable.
- **E.** Gi0/0 has no IP address.

<details><summary>Answer</summary>

**Answer: A, B.** "Administratively down" means someone typed `shutdown`, or the interface was never enabled. Gi0/0 is up/up with an address, so its Layers 1 and 2 are fine. **Why not the others:** Gi0/2 (C) is up/up; it simply has no IP address. Gi0/1 (D) is shut down by configuration, which says nothing about the cable; you'd only learn that after `no shutdown`. And Gi0/0 has 10.1.1.1 (E).
</details>

## 23.3 Ping — Your Best Friend

**Ping** sends a tiny "are you there?" message and waits for a reply.
```
R1# ping 192.168.1.1
!!!!!   ← exclamation marks = success! (5 replies)
.....   ← dots = no reply (failure)
```

**Ping order for troubleshooting:**
1. Ping **yourself** (127.0.0.1) — is my network software OK?
2. Ping your **own IP** — is my card OK?
3. Ping your **gateway** — can I reach the router?
4. Ping a **remote device** — can I get out?
5. Ping by **name** (ping google.com) — is DNS working?

If step 4 works but step 5 fails, it's a **DNS** problem!

**Why ping in exactly THIS order — what's the logic?** Because each step tests one more piece of the chain, moving outward from *yourself* to the *far internet*, so **the first step that fails points straight at the problem.** It's a deliberate process of elimination:

1. **Ping yourself (127.0.0.1):** Tests whether your computer's own networking *software* (the TCP/IP stack) even works. If this fails, the problem is *inside your PC* — nothing external matters yet.
2. **Ping your own IP:** Tests your network *card* and its configuration. Now you've confirmed your PC can talk to itself through its real address.
3. **Ping your gateway:** Tests whether you can reach the *router* — i.e., is your local network (cable, switch, VLAN, gateway setting) working? If steps 1–2 pass but this fails, the problem is *between you and the router* (local network).
4. **Ping a remote device:** Tests whether the *router can get you out* to other networks (routing works). If the gateway pings but this doesn't, the problem is *beyond your router* (routing/ISP).
5. **Ping by name (google.com):** Tests **DNS** specifically. If step 4 (ping by IP) works but step 5 (ping by name) fails, everything except *name resolution* is fine — so it's a **DNS** problem, full stop.

*See the beauty?* By walking outward one hop at a time, **the exact step where pings start failing tells you which link in the chain is broken** — no guessing. This is the bottom-up layer method turned into five concrete commands, and it's why experienced engineers can pinpoint a fault in under a minute.

Walk the five pings on a PC whose web browsing is broken:

```diagram
{
  "type": "topology",
  "title": "The ping ladder: walk outward until something fails",
  "caption": "The PC is set to use DNS server 192.168.1.53. Press **Next**.",
  "nodes": [
    {"id": "PC", "kind": "host", "x": 0, "y": 1, "label": "PC", "sub": "192.168.1.47"},
    {"id": "SW1", "kind": "switch", "x": 1.3, "y": 1, "label": "SW1"},
    {"id": "R1", "kind": "router", "x": 2.6, "y": 1, "label": "Gateway", "sub": "192.168.1.1"},
    {"id": "NET", "kind": "cloud", "x": 3.9, "y": 1, "label": "Internet"},
    {"id": "G", "kind": "server", "x": 5.2, "y": 1, "label": "8.8.8.8"},
    {"id": "DNS", "kind": "server", "x": 1.3, "y": 2.3, "label": "DNS?", "sub": "192.168.1.53"}
  ],
  "links": [
    {"a": "PC", "b": "SW1"},
    {"a": "SW1", "b": "R1"},
    {"a": "R1", "b": "NET"},
    {"a": "NET", "b": "G"},
    {"a": "SW1", "b": "DNS", "style": "dashed"}
  ],
  "steps": [
    {"title": "1. ping 127.0.0.1",
     "text": "Loopback never leaves the PC. A reply proves the PC's own TCP/IP software works.",
     "focus": ["PC"],
     "nodes": {"PC": {"badge": "1: stack ok", "tone": "good"}}},
    {"title": "2. ping 192.168.1.47 (own IP)",
     "text": "Pinging its own address proves the network card has its address configured and the stack is using it.",
     "focus": ["PC"],
     "nodes": {"PC": {"badge": "2: own IP ok", "tone": "good"}}},
    {"title": "3. ping 192.168.1.1 (gateway)",
     "text": "The first ping that crosses a wire. Success proves the cable, the switch, the VLAN and the PC's address and mask all work.",
     "packets": [{"path": ["PC", "SW1", "R1"], "label": "3: reply", "tone": "good"}]},
    {"title": "4. ping 8.8.8.8 (remote, by IP)",
     "text": "Success proves the gateway routes the PC out to other networks, and the replies find their way back (NAT and the return route both work).",
     "packets": [{"path": ["PC", "SW1", "R1", "NET", "G"], "label": "4: reply", "tone": "good"}]},
    {"title": "5. ping google.com (by name)",
     "text": "*Ping request could not find host google.com.* Before it can ping, the PC must ask its DNS server for the address, and nothing at 192.168.1.53 answers. Step 4 worked and step 5 failed, so **everything but DNS is fine**. Fix the PC's DNS setting (or the DNS server), and you're done.",
     "nodes": {"PC": {"badge": "5: DNS fails", "tone": "bad"}, "DNS": {"state": "down"}},
     "packets": [{"path": ["PC", "SW1", "DNS"], "label": "who is google.com?", "tone": "bad"}]}
  ]
}
```

**📝 Exam-style questions — 23.3**

**Q1.** From a PC, `ping 8.8.8.8` succeeds but `ping google.com` returns "could not find host". What is the most likely problem?

- **A.** The PC has no default gateway.
- **B.** The PC's DNS server is wrong or unreachable.
- **C.** The PC's network card is faulty.
- **D.** An ACL blocks all ICMP traffic.

<details><summary>Answer</summary>

**Answer: B.** Reaching a remote IP proves the cable, address, gateway and routing all work. The only thing a name adds is DNS, and that's what failed. **Why not the others:** without a gateway (A), `ping 8.8.8.8` would fail too. A faulty NIC (C) would break every ping. And an ACL blocking ICMP (D) would stop the ping to 8.8.8.8 as well; "could not find host" happens before any ping is even sent.
</details>

**Q2.** Refer to the exhibit. What most likely explains the first dot?

```
R1# ping 10.1.1.2
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.1.1.2, timeout is 2 seconds:
.!!!!
Success rate is 80 percent (4/5), round-trip min/avg/max = 1/1/2 ms
```

- **A.** R1 had to resolve 10.1.1.2's MAC address with ARP before it could send the first echo.
- **B.** An ACL dropped the first packet.
- **C.** There's a duplex mismatch on the link.
- **D.** A routing loop delayed the first packet.

<details><summary>Answer</summary>

**Answer: A.** The first echo waits for ARP to finish and usually times out; once the ARP entry exists, the rest succeed. This is completely normal for a first ping to a neighbor. **Why not the others:** an ACL (B) would drop all five, not just the first. A duplex mismatch (C) causes scattered loss and errors, not exactly one lost first packet. And a routing loop (D) would make every packet expire, not just the first.
</details>

**Q3.** Refer to the exhibit. What does the output tell the engineer?

```
R1# ping 192.168.50.10
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.50.10, timeout is 2 seconds:
U.U.U
Success rate is 0 percent (0/5)
```

- **A.** A router on the path sent back ICMP Destination Unreachable messages.
- **B.** The pings succeeded but were slow.
- **C.** The destination replied with Time Exceeded.
- **D.** The local interface is administratively down.

<details><summary>Answer</summary>

**Answer: A.** Each **U** is an ICMP Unreachable that came back, often because a router has no route to 192.168.50.10 or an ACL rejected the packet. The dots in between are normal: routers rate-limit how many Unreachables they send. **Why not the others:** success would show `!` (B). Time Exceeded (C) is shown as `&` and comes from a router, not the destination. And with the local interface down (D) there'd be no path to send anything, so no Unreachables would come back.
</details>

**Q4.** A PC can ping 127.0.0.1 and its own IP address, but a ping to its default gateway fails. Where is the problem most likely?

- **A.** In the PC's TCP/IP software
- **B.** Between the PC and the gateway: the cable, switch port, VLAN or the PC's address settings
- **C.** On the internet, beyond the gateway
- **D.** In DNS

<details><summary>Answer</summary>

**Answer: B.** Steps 1 and 2 passed, so the PC itself is fine; step 3 is the first to cross the local network, and it failed. **Why not the others:** the TCP/IP software (A) was proven by the loopback ping. The internet (C) is beyond the gateway, which you can't even reach yet. And no name was used (D), so DNS isn't involved.
</details>

## 23.4 Common Problems & Fixes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Interface "administratively down" | Forgot `no shutdown` | Run `no shutdown` |
| Can ping IP but not name | DNS problem | Check DNS server settings |
| Two switches won't trunk | VLAN/native/mode mismatch | Match trunk settings |
| OSPF neighbors won't form | Area/subnet/timer mismatch | Match OSPF settings |
| PC gets 169.254.x.x | Can't reach DHCP | Check DHCP server/relay |
| Slow/errors on a link | Duplex mismatch | Set both ends the same |
| Port shut by security | Port-security violation | `shutdown` then `no shutdown` |

**📝 Exam-style questions — 23.4**

**Q1.** PCs in VLAN 20 receive 169.254.x.x addresses. The DHCP server is on another subnet and works for every other VLAN. What is most likely missing?

- **A.** `ip helper-address` on the VLAN 20 gateway interface
- **B.** `ip helper-address` on the DHCP server's switch port
- **C.** `ip dhcp excluded-address` on the router
- **D.** A default gateway on the PCs

<details><summary>Answer</summary>

**Answer: A.** DHCP Discover is a broadcast, and routers don't forward broadcasts. `ip helper-address` on the interface that receives the broadcast (the VLAN 20 gateway) turns it into a unicast to the server. **Why not the others:** the relay belongs where the clients are, not near the server (B). Excluded addresses (C) only matter on an IOS DHCP server, and the server here works for other VLANs. The PCs can't get a gateway (D) until DHCP works, since DHCP is what hands it out.
</details>

**Q2.** Refer to the exhibit. An unauthorized device triggered port security on Gi1/0/7 and has been removed. How does the engineer bring the port back?

```
SW1# show interfaces gi1/0/7 status
Port      Name   Status       Vlan  Duplex  Speed Type
Gi1/0/7          err-disabled 10    auto    auto  10/100/1000BaseTX
```

- **A.** `shutdown`, then `no shutdown` on Gi1/0/7
- **B.** `clear mac address-table dynamic`
- **C.** `no switchport port-security` on Gi1/0/7
- **D.** `copy running-config startup-config`

<details><summary>Answer</summary>

**Answer: A.** An err-disabled port stays down until it's bounced with `shutdown` and `no shutdown` (or until `errdisable recovery` brings it back automatically, if configured). **Why not the others:** clearing the MAC table (B) doesn't touch the port's err-disabled state. Removing port security (C) disables the protection and still leaves the port err-disabled. Saving the config (D) changes nothing on the running port.
</details>

**Q3.** Two routers on the same link won't become OSPF neighbors. Which two mismatches cause this? (Choose two.)

- **A.** Hello and dead timers
- **B.** Router IDs that are different
- **C.** Area IDs on the link
- **D.** OSPF process IDs
- **E.** Interface OSPF priorities

<details><summary>Answer</summary>

**Answer: A, C.** Neighbors must agree on the hello and dead timers and on the area of the link (along with subnet and authentication). **Why not the others:** router IDs (B) must be *different*; identical ones are the problem. The process ID (D) is local to each router and can differ freely. Priorities (E) only affect the DR/BDR election, not whether neighbors form.
</details>

**Q4.** Which combination of switchport modes on the two ends of a link fails to form a trunk?

- **A.** `dynamic auto` and `dynamic auto`
- **B.** `dynamic desirable` and `dynamic auto`
- **C.** `trunk` and `dynamic auto`
- **D.** `trunk` and `dynamic desirable`

<details><summary>Answer</summary>

**Answer: A.** Both sides are willing but neither asks, so the link stays an access link. **Why not the others:** in B, the desirable side actively asks and the auto side agrees. In C and D, the hard-coded trunk side sends DTP and the dynamic side agrees.
</details>

## 23.5 Duplex & Speed Mismatch
If one side is full-duplex and the other half-duplex, you'll see **errors and slowness**. Best practice: let both **auto-negotiate**, or set BOTH ends the same manually.

**📝 Exam-style questions — 23.5**

**Q1.** A switch port shows `Half-duplex, 100Mb/s` with a steadily rising count of late collisions. The router at the other end is hard-coded to 100 Mb/s full-duplex. What is the problem, and what fixes it?

- **A.** A duplex mismatch; set both ends to the same duplex (or both to auto).
- **B.** A speed mismatch; set the switch port to 1000 Mb/s.
- **C.** A broken cable; replace it.
- **D.** An STP loop; enable PortFast.

<details><summary>Answer</summary>

**Answer: A.** The switch port was left on auto, but the hard-coded router doesn't negotiate, so the switch could detect the speed but had to fall back to half-duplex. The half-duplex side then sees late collisions while the full-duplex side sees errors. Match both ends. **Why not the others:** the speeds already match (B), at 100 Mb/s, which is why the link is up at all. A bad cable (C) tends to cause CRC errors on both sides, not this clean half/full split. And an STP loop (D) shows up as broadcast storms and MAC flapping, not late collisions.
</details>

**Q2.** One end of a link is hard-coded to 100 Mb/s and the other to 1000 Mb/s. What happens?

- **A.** The link doesn't come up.
- **B.** The link comes up at 100 Mb/s with no errors.
- **C.** The link comes up at 1000 Mb/s, but with collisions.
- **D.** The link comes up and both ends switch to half-duplex.

<details><summary>Answer</summary>

**Answer: A.** Unlike duplex, the two ends must signal at the same speed to see each other at all. With a speed mismatch the port stays down (notconnect). **Why not the others:** neither side can adapt (B, C), because both are hard-coded. And duplex fallback (D) only happens after a link has come up at a matching speed.
</details>

---

## 23.6 Checking IP Settings on a PC (Windows, macOS & Linux)

Troubleshooting usually starts at the **user's computer**, not the router — and the exam expects you to know the client-side commands on all three operating systems.

| Task | Windows | macOS | Linux |
|------|---------|-------|-------|
| **Show IP / mask / gateway** | `ipconfig` (`/all` for detail) | `ifconfig` | `ip address` (`ip a`) |
| **Show routing table** | `route print` | `netstat -rn` | `ip route` |
| **Show default gateway** | `ipconfig` | `netstat -rn \| grep default` | `ip route` |
| **DNS lookup** | `nslookup name` | `nslookup` / `dig` | `nslookup` / `dig` |
| **Show ARP cache** | `arp -a` | `arp -a` | `ip neighbor` |
| **Release / renew DHCP** | `ipconfig /release`<br>`ipconfig /renew` | `sudo ipconfig set en0 DHCP` | `sudo dhclient -r`<br>`sudo dhclient` |
| **Clear DNS cache** | `ipconfig /flushdns` | `sudo dscacheutil -flushcache` | varies by distro |
| **Trace the path** | `tracert` | `traceroute` | `traceroute` |

*The one that catches people:* the trace command is **`tracert`** on Windows and **`traceroute`** everywhere else — an easy exam point to lose.

### What Four Numbers to Read, and What Each Wrong Value Means

When you run `ipconfig /all`, four values tell you almost everything:

```
   IPv4 Address. . . . . . . . . . . : 192.168.1.47      ← do I have an address?
   Subnet Mask . . . . . . . . . . . : 255.255.255.0     ← right size network?
   Default Gateway . . . . . . . . . : 192.168.1.1       ← can I leave the subnet?
   DNS Servers . . . . . . . . . . . : 8.8.8.8           ← can I resolve names?
```

**Reading the address is the fastest diagnosis in networking**, because certain values are confessions:

- **169.254.x.x** — this is **APIPA**, the address a host assigns itself when **DHCP got no answer**. It is a symptom, not a configuration. It means the DHCP server is down, the cable/VLAN is wrong, or a relay (`ip helper-address`) is missing. *Seeing 169.254 tells you to stop looking at the PC and go find out why DHCP is silent.*
- **No default gateway** — local devices work, nothing outside the subnet does. Perfectly explains "I can reach the file server but not the internet."
- **Wrong subnet mask** — the sneaky one. The PC miscalculates which addresses are local, so *some* destinations work and others don't, seemingly at random.
- **Address correct, DNS blank or wrong** — `ping 8.8.8.8` succeeds but `ping google.com` fails. *That exact pairing is the classic signature of a DNS problem*, and it's a favorite exam scenario.

Follow the layered method from 23.1: confirm the PC's own settings first, then the gateway, then beyond. Most "the internet is broken" tickets are answered by these four lines.

**📝 Exam-style questions — 23.6**

**Q1.** Which command shows the routing table on a Linux host?

- **A.** `route print`
- **B.** `ip route`
- **C.** `ipconfig /displaydns`
- **D.** `arp -a`

<details><summary>Answer</summary>

**Answer: B.** On Linux, `ip route` lists the routes, including the default gateway. **Why not the others:** `route print` (A) is the Windows command. `ipconfig /displaydns` (C) shows the Windows DNS cache. `arp -a` (D) shows the ARP cache, not the routes.
</details>

**Q2.** Refer to the exhibit. What is the most likely cause?

```
Ethernet adapter Ethernet0:
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration IPv4 Address. . : 169.254.37.112(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :
```

- **A.** The PC asked for an address but no DHCP server answered.
- **B.** The PC has a static address that conflicts with another host.
- **C.** The DNS server is down.
- **D.** The default gateway is configured on the wrong subnet.

<details><summary>Answer</summary>

**Answer: A.** 169.254.x.x is APIPA, the address a host gives itself when DHCP gets no answer. Look at the DHCP server, the VLAN, or a missing `ip helper-address`. **Why not the others:** DHCP is enabled (B), so this isn't a static address. DNS (C) has nothing to do with getting an IP address. And there's no gateway at all (D), because DHCP is what would have provided one.
</details>

**Q3.** A user can open files on a server in the same subnet but can't reach anything on the internet. `ipconfig` shows a correct address and mask, and the Default Gateway line is empty. What is the problem?

- **A.** The PC has no default gateway, so it can't send traffic off its subnet.
- **B.** The PC's DNS server is wrong.
- **C.** The PC's subnet mask is wrong.
- **D.** The PC has an APIPA address.

<details><summary>Answer</summary>

**Answer: A.** Local traffic doesn't need a gateway; everything off the subnet does. That exactly matches "local works, internet doesn't". **Why not the others:** a DNS problem (B) would still let the user reach internet hosts by IP, and the gateway is clearly missing here. The mask (C) is stated to be correct. And the address is correct, not 169.254.x.x (D).
</details>

**Q4.** Which two pairings of operating system and command are correct? (Choose two.)

- **A.** Windows: `tracert` traces the path to a destination.
- **B.** macOS: `tracert` traces the path to a destination.
- **C.** Linux: `ip neighbor` shows the ARP cache.
- **D.** Windows: `ip route` shows the routing table.
- **E.** Linux: `ipconfig /release` releases the DHCP lease.

<details><summary>Answer</summary>

**Answer: A, C.** Windows is the odd one out with `tracert`, and Linux shows its ARP cache with `ip neighbor`. **Why not the others:** macOS uses `traceroute` (B). Windows uses `route print` for the routing table (D). And `ipconfig /release` is Windows (E); on Linux you'd use `dhclient -r`.
</details>

---

<a name="chapter-24"></a>
# Chapter 24: Exam Tips & Study Plan

## 24.1 About the CCNA Exam (200-301)
- **One exam** covers everything.
- Around **100–120 questions** in **120 minutes**.
- Question types: multiple choice, drag-and-drop, and **simulations** (you actually configure a virtual device!).
- You **cannot go back** to previous questions — answer carefully the first time.

## 24.2 What's on It (Topic Weights)

| Area | Rough % |
|------|---------|
| Network Fundamentals | 20% |
| Network Access (switching, VLANs, Wi‑Fi) | 20% |
| IP Connectivity (routing, OSPF) | 25% |
| IP Services (DHCP, DNS, NAT, NTP) | 10% |
| Security Fundamentals | 15% |
| Automation & Programmability | 10% |

## 24.3 Pick Your Timeline

> **The day-to-day method** — what "finish a chapter" means, the review-first daily frame, and the chapter-by-chapter path through all five resources — lives in the **Study Tips** document (`CCNA_Study_Tips.pdf`). The timelines below are the calendars; that document is the loop you run inside each day.

Two plans below: an **8-week** pace for studying alongside a job, and a **2-week
sprint** if you've set yourself a deadline. Both cover the same 24 chapters, 140
questions and 60 drills — the sprint just removes the slack.

### The 8-Week Plan (steady pace, ~1–1.5 hrs/day)
- **Weeks 1–2:** Fundamentals, OSI/TCP-IP, cables, binary/hex — including network architectures, virtualization and PoE (Chapters 1–5). → Question Bank Domain 1.
- **Weeks 3–4:** Switching, VLANs, trunking, STP and its guards, EtherChannel (Chapters 6–10). → Domain 2.
- **Week 5:** IP addressing & subnetting — practice DAILY with the Drill Sheet (Chapters 11–13).
- **Week 6:** Routing, static routes, OSPF (with DR/BDR), FHRP/HSRP (Chapters 14–16). → Domain 3.
- **Week 7:** IP services incl. NAT and QoS, security, ACLs, wireless (Chapters 17–20). → Domains 4 and 5.
- **Week 8:** Management, automation (incl. AI/ML and Terraform), troubleshooting, review, practice exams (Chapters 21–24). → Domains 6, 7 and 8.

**Every week:** work that week's domain in the **Practice Question Bank**, keep drilling subnetting, and run your **Anki reviews daily** (unlock that week's subdecks as you reach them). In the final week, use the **Blueprint Coverage Map** appendix as a checklist — anything you can't explain, go re-read.

### The 2-Week Sprint (~3–4 hrs/day)

This is aggressive but genuinely doable — it's roughly 45 hours of focused work.
The trade-off is honest: **you'll have less repetition**, so the review days and
daily subnetting are not optional. They're what stops week 1 leaking out of your
head by day 12.

**Each day: read the chapters → do that day's drills → answer the listed
questions → run your Anki reviews → note anything you couldn't explain out loud.**

*Anki is doing the heavy lifting on a two-week timeline* — it's what keeps day 2's
material alive on day 13. Import the deck on day 1 and never skip the reviews,
even on a day you read nothing.

| Day | Read | Subnetting | Questions |
|-----|------|------------|-----------|
| **1** | Ch 1–3 — networks, devices, architectures, cables, PoE | — | Domain 1, first half |
| **2** | Ch 4–5 — binary & hex, MAC addresses, Ethernet | Toolkit page + Section 1 | Domain 1, rest |
| **3** | Ch 6–7 — switches, MAC tables, VLANs | Section 1 (repeat for speed) | Domain 2, first half |
| **4** | Ch 8–9 — trunks, inter-VLAN routing, STP + the four guards | Section 2 | — |
| **5** | Ch 10–11 — EtherChannel, IP addressing, gateways | Section 2 (repeat) | Domain 2, rest |
| **6** | **Ch 12 — subnetting.** The big one. | Sections 3 + 4 | — |
| **7** | **Catch-up & review.** Re-read anything shaky from days 1–6. | Section 5 (VLSM) | Re-do every question you missed |
| **8** | Ch 13–14 — IPv6, routing tables, AD & metric | 10 mixed problems | Domain 3, first third |
| **9** | Ch 15 + 14.7 — static routes, floating statics, FHRP/HSRP | 10 mixed problems | Domain 3, second third |
| **10** | Ch 16 — OSPF, including DR/BDR and network types | 10 mixed problems | Domain 3, rest |
| **11** | Ch 17 — DHCP, DNS, NAT, NTP, syslog, SNMP, QoS | Section 6 (timed!) | Domain 4 |
| **12** | Ch 18–19 — security, AAA, Layer 2 attacks, ACLs | 10 mixed problems | Domain 5 + 5b |
| **13** | Ch 20–22 — wireless, management, automation, AI/ML, IaC | Section 7 (boss level) | Domain 6 |
| **14** | Ch 23–24 + **Blueprint Coverage Map appendix** as a checklist | Section 6 again, timed | Domains 7 & 8, then re-do every miss |

**How to know the sprint is working.** By **day 7** you should be able to subnet
without the chart. By **day 11** you should be scoring above 80% on a domain the
first time through. If you're not, you're reading too fast — slow down and cut
something rather than skimming everything.

**If you fall behind, cut in this order** (protecting what the exam weights most
— IP Connectivity is 25%, and subnetting runs through everything):

1. **The 🔬 depth sections first** (2.7, 9.10, 9.11, 10.4, 13.8, 14.8, 16.11) — they go
   beyond what the exam asks. Come back to them after you pass; they're your CCNP head start.
   *Exception: read **14.8**, the packet walk — it makes everything else easier.*
2. The "Story Time" boxes and the deeper *why* paragraphs — read the bold summary lines only.
3. Chapter 22's tool details (keep the concepts: controller-based networking, REST, JSON, Ansible/Terraform).
4. Chapter 4's binary drills — *if* you can already convert quickly.
5. **Never cut:** subnetting practice, OSPF, VLANs/trunking, or ACLs.

**The day before the exam:** don't learn anything new. Re-read the **cheat sheet
(24.5)**, walk the **Blueprint Coverage Map** and say each topic out loud, do ten
subnetting problems, and sleep. Cramming new material the night before mostly
displaces what you already knew.

## 24.4 Golden Study Tips
1. **Subnet every day.** It's the #1 skill and appears everywhere. Do 5 practice subnets each morning.
2. **Build labs.** Work through the **Lab Workbook** — 17 labs for EVE-NG/GNS3 that follow this guide chapter by chapter, each with a break-and-fix challenge. (Cisco Packet Tracer covers the one thing emulators can't: the WLC GUI.)
3. **Type commands by hand**, don't just read them. Muscle memory matters in simulations.
4. **Learn the "why," not just the "what."** Understanding beats memorizing.
5. **Do practice exams** to get used to the style and timing.
6. **Use the flashcard deck daily.** `CCNA_Flashcards.apkg` imports into Anki (or `.tsv` into Quizlet) — 189 cards covering ports, AD values, STP costs, election rules and the depth material, split into subdecks by topic. **Spaced repetition is the only study method proven to beat forgetting**, and 15 minutes a day beats an hour on Sunday.
7. **Teach someone else** — if you can explain it simply, you truly know it.

**Why these specific tips — what's the reasoning behind each?** They're not random; each one targets *how the exam actually tests you*:

- **Why subnet DAILY (not just once)?** Because the exam is **timed** (~60–90 seconds per question) and subnetting appears everywhere. Knowing *how* to subnet isn't enough — you need it to be *automatic*, like a times-table, so it doesn't eat your clock. Speed only comes from daily reps; cramming it once won't build the reflex.
- **Why build LABS instead of just reading?** Because the exam has **simulations where you configure real virtual devices.** Reading a command and *typing* it under pressure are totally different skills — the second only comes from doing. Labs also reveal the little errors (a typo, a forgotten `no shutdown`) that reading never exposes.
- **Why learn the "WHY" (this whole guide's philosophy)?** Because the exam loves "**choose the BEST answer**" questions where several options look correct. Memorizers get stuck; people who understand the *reasoning* can eliminate the traps. Understanding also means you can *reconstruct* a fact you forgot — if you get why AD ranks connected over static over OSPF, you don't need to have memorized the exact list.
- **Why teach someone else?** Because explaining something simply is the ultimate test of whether you *actually* understand it. If you stumble explaining VLANs to a friend, you've found a gap — before the exam finds it for you.

*The theme: study the way the exam tests — fast recall, hands-on config, and reasoning — not just passive reading.*

## 24.5 Must-Memorize Cheat Sheet

**Port numbers:** FTP 20/21 · SSH 22 · Telnet 23 · SMTP 25 · DNS 53 · DHCP 67/68 · HTTP 80 · HTTPS 443 · SNMP 161.

**Administrative Distance:** Connected 0 · Static 1 · EIGRP 90 · OSPF 110 · RIP 120.

**Private IP ranges:** 10.0.0.0/8 · 172.16–31.0.0 · 192.168.0.0/16.

**STP cost:** 10M=100 · 100M=19 · 1G=4 · 10G=2.

**Hosts formula:** 2^(host bits) − 2.

**DORA:** Discover, Offer, Request, Ack.

**TCP handshake:** SYN → SYN-ACK → ACK.

**Wildcard mask:** flip the subnet mask (0 = match, 255 = any).

**HSRP:** highest priority wins (default 100) · ties go to highest IP · `preempt` needed to take the role back · hello 3 s / hold 10 s.

**OSPF DR election:** highest priority (default 1) · ties go to highest Router ID · priority 0 = never · **not preemptive** · 2WAY between DROTHERs is normal.

**QoS markings:** Voice = **EF (DSCP 46)** · Video = AF41 (34) · Signaling = CS3 (24) · Best effort = 0. *Policing drops, shaping buffers.*

**PoE:** 802.3af ≈ 15.4 W · 802.3at (PoE+) ≈ 30 W · 802.3bt ≈ 60–100 W.

**Client OS:** `ipconfig` (Windows) · `ifconfig` (macOS) · `ip address` (Linux) · **169.254.x.x = DHCP failed (APIPA)**.

**REST:** GET=Read · POST=Create · PUT=Update · DELETE=Delete · **4xx = your error, 5xx = server error**.

---

<a name="blueprint"></a>
# 🗺️ Appendix: Exam Blueprint Coverage Map

Cisco publishes an official topic list for the **CCNA 200-301 (v1.1)** exam. This table maps **every** blueprint item to where it's covered in this guide — use it as a final checklist before exam day, and to find the right section fast when a practice question catches you out.

## 1.0 Network Fundamentals (20%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 1.1 | Role and function of network components | 1.4, 1.5, 3.7 (PoE), 20.6 (WLC/AP) |
| 1.2 | Network topology architectures (2-tier, 3-tier, spine-leaf, WAN, SOHO, cloud) | 1.3, **1.7**, **1.8** |
| 1.3 | Physical interface and cabling types | 3.2, 3.3, 3.6 |
| 1.4 | Identify interface and cable issues | 3.5, 23.4, 23.5 |
| 1.5 | Compare TCP to UDP | 2.5, 2.6 |
| 1.6 | Configure and verify IPv4 addressing and subnetting | 11, 12 (+ drill sheet) |
| 1.7 | Private IPv4 addressing | 11.4 |
| 1.8 | Configure and verify IPv6 addressing and prefix | 13.2–13.6 |
| 1.9 | IPv6 address types | 13.4 |
| 1.10 | Verify IP parameters for client OS | **23.6** |
| 1.11 | Wireless principles (channels, SSID, RF, encryption) | 20.1–20.4 |
| 1.12 | Virtualization fundamentals (VMs, containers, VRFs) | **1.9** |
| 1.13 | Switching concepts (MAC learning/aging, flooding, MAC table) | 6.1, 6.2 |

## 2.0 Network Access (20%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 2.1 | Configure and verify VLANs across switches | 7.1–7.5 |
| 2.2 | Interswitch connectivity (trunks, 802.1Q, native VLAN) | 8.1, 8.2 |
| 2.3 | Layer 2 discovery protocols (CDP, LLDP) | 21.2 |
| 2.4 | EtherChannel (LACP) | 10.1–10.3 |
| 2.5 | Rapid PVST+ (root bridge, port states, PortFast, guards) | 9.1–9.7, **9.8**, **9.9** |
| 2.6 | Cisco wireless architectures and AP modes | 20.6, **20.7** |
| 2.7 | Physical infrastructure of WLAN components (AP/WLC ports, LAG) | **20.8** |
| 2.8 | AP and WLC management access connections | **20.9**, 21.1 |
| 2.9 | Wireless LAN GUI configuration for client connectivity (WLAN, security, QoS profiles) | 20.5, **20.10** |

## 3.0 IP Connectivity (25%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 3.1 | Components of the routing table | 14.2, 14.4, 14.5 |
| 3.2 | How a router makes forwarding decisions | 14.3, 14.4, 14.5 |
| 3.3 | IPv4 and IPv6 static routing | 15.1–15.6 |
| 3.4 | Single-area OSPFv2 (adjacencies, point-to-point, broadcast DR/BDR, RID) | 16.3–16.9, **16.10** |
| 3.5 | First hop redundancy protocols (FHRP) | **14.7** |

## 4.0 IP Services (10%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 4.1 | Inside source NAT (static and pools) | 17.3 |
| 4.2 | NTP in client and server mode | 17.4 |
| 4.3 | Role of DHCP and DNS | 17.1, 17.2 |
| 4.4 | Function of SNMP | 17.6 |
| 4.5 | Syslog features (facilities and levels) | 17.5 |
| 4.6 | DHCP client and relay | 17.1 |
| 4.7 | Per-hop behavior for QoS (classification, marking, queuing, policing, shaping) | **17.7** |
| 4.8 | Remote access using SSH | 6.6 |
| 4.9 | Capabilities of TFTP/FTP | 21.3, 21.4 |

## 5.0 Security Fundamentals (15%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 5.1 | Key security concepts (threats, vulnerabilities, exploits, mitigation) | 18.1, 18.2 |
| 5.2 | Security program elements (awareness, training, physical access) | **18.9** |
| 5.3 | Device access control using local passwords | 6.5, 18.5 |
| 5.4 | Password policies and alternatives (MFA, certificates, biometrics) | 18.5, **18.8** |
| 5.5 | IPsec remote access and site-to-site VPNs | 18.7 |
| 5.6 | Configure and verify ACLs | 19.1–19.8 |
| 5.7 | Layer 2 security (DHCP snooping, DAI, port security) | 6.8, 18.3 |
| 5.8 | AAA concepts | 18.4 |
| 5.9 | Wireless security protocols (WPA, WPA2, WPA3) | 20.5 |
| 5.10 | Configure WLAN using WPA2 PSK in the GUI | 20.5, 20.6 |

## 6.0 Automation and Programmability (10%)

| # | Blueprint topic | Where |
|---|-----------------|-------|
| 6.1 | How automation impacts network management | 22.1 |
| 6.2 | Traditional vs. controller-based networking | 22.2 |
| 6.3 | Controller-based, software-defined architecture (overlay, underlay, fabric) | 22.2, 22.3 |
| 6.4 | AI (generative and predictive) and machine learning in network operations | **22.8** |
| 6.5 | Characteristics of REST-based APIs (CRUD, HTTP verbs, data encoding) | 22.4 |
| 6.6 | Configuration management mechanisms (Ansible, Terraform) | 22.6, **22.9** |
| 6.7 | Interpret JSON-encoded data | 22.5 |

> **Bold** sections are the ones most often skipped by self-study candidates — FHRP, QoS, virtualization, the STP guards, DR/BDR, and AI/ML. They're small topics individually, but together they're worth a meaningful slice of the exam. Don't leave them for the last night. 🎯

---

<a name="beyond"></a>
# 🚀 Appendix B: Beyond CCNA — The Road to CCNP

CCNA proves you understand a network. **CCNP proves you can design, scale and troubleshoot one.** This appendix maps what you've learned onto what comes next, so the depth sections in this guide have somewhere to go.

## The Shape of the Certification

CCNP Enterprise is **two exams**, not one:

| Exam | Role |
|------|------|
| **ENCOR 350-401** (Core) | Required. Architecture, virtualization, infrastructure, assurance, security, automation |
| **One concentration** | Your specialty — most commonly **ENARSI 300-410** (advanced routing) |

**The mindset shift matters more than the syllabus.** CCNA asks *"what does this do, and how do you configure it?"* CCNP asks *"why this design, what breaks at scale, and how do you prove it's working?"* Questions stop having one clean answer and start having trade-offs — which is exactly why this guide keeps explaining *why* rather than only *what*.

## What Carries Straight Over

These aren't re-taught at CCNP — they're **assumed**, on day one:

| You learned | CCNP expects you to already be fluent |
|-------------|----------------------------------------|
| Subnetting (Ch 12) | Instantly, including VLSM in your head |
| The packet walk (14.8) | As your default troubleshooting method |
| VLANs, trunking, STP (Ch 7–9) | Plus the mechanics in 9.10 and 9.11 |
| OSPF single-area (Ch 16) | Plus adjacency states and LSA types (16.11) |
| ACLs (Ch 19) | Extended, named, and used for far more than filtering |
| TCP mechanics (2.7) | When diagnosing "the network is slow" |

*If any of those feel shaky, strengthen them before moving on — CCNP builds directly on top and won't stop to review.*

## What's Genuinely New

### Routing gets much bigger

- **BGP** — the protocol that runs the internet. Not on CCNA at all, and a large slice of CCNP. Path-vector rather than link-state: routing by **policy** ("prefer this provider") instead of purely by cost.
- **EIGRP in depth** — feasible successors, the DUAL algorithm, stuck-in-active.
- **Multi-area OSPF** — the ABR/ASBR roles, LSA types 3–7, and the stub area types previewed in 16.11.
- **Route redistribution** — moving routes between protocols, where routing loops are genuinely easy to create.
- **Route maps and prefix lists** — the tools for expressing policy.

### Overlays and virtualization

- **GRE and IPsec tunnels** — a virtual link across someone else's network.
- **VRFs** — you met the idea in 1.9; CCNP makes them routine.
- **VXLAN and LISP** — the fabric technologies underneath modern data centers.
- **SD-Access and SD-WAN** — the controller-based architectures Chapter 22 introduced, in operational detail.

### Assurance — proving it works

Largely absent from CCNA, and a real part of the job:

- **NetFlow** — who is talking to whom, and how much.
- **SPAN / RSPAN** — mirroring traffic to a capture tool.
- **IP SLA** — synthetic probes that measure the path continuously, often driving failover.

### Automation deepens

Chapter 22 covered concepts. CCNP wants **working code**: Python scripts against device APIs, real Ansible playbooks, EEM applets, and JSON/YAML you can read fluently.

## A Sensible Order After You Pass

1. **Build something real first.** A multi-site lab in GNS3/EVE-NG or CML beats reading. Break it deliberately.
2. **Learn BGP early.** It's the biggest new concept and it rewards time.
3. **Get comfortable in Python.** Automation is the fastest-growing part of the exam *and* the job.
4. **Then pick a concentration** — ENARSI if you like routing and troubleshooting, ENWLSI for wireless, ENAUTO for automation.

## Where This Guide Already Took You Past CCNA

The 🔬 depth sections deliberately go beyond exam requirements, because they're where CCNP starts:

| Section | Beyond-CCNA content |
|---------|---------------------|
| **2.7** | Sliding windows, congestion vs flow control, MSS/MTU and tunnel breakage |
| **9.10** | BPDU fields, extended system ID, the four-step decision order |
| **9.11** | RSTP roles, proposal/agreement sync, link types |
| **10.4** | Load-balancing hash behaviour and its per-flow consequence |
| **13.8** | The full NDP message set, DAD, RA flags |
| **14.8** | The complete end-to-end forwarding walk |
| **16.11** | Neighbor state machine, LSA types 1–7, SPF, stub/NSSA areas |

**One last thing.** The single habit that carries furthest isn't a protocol — it's insisting on knowing *why* something works before you accept that it does. That's what separates someone who passed an exam from someone you'd want fixing your network at 3 a.m. 🌐

---

---

<a name="glossary"></a>
# 📚 Glossary (Quick Definitions)

- **ABR (Area Border Router):** An OSPF router joining two areas; generates Type 3 summary LSAs.
- **ACL:** Rules that permit or deny traffic.
- **AD (Administrative Distance):** Trust score for routing sources (lower = better).
- **AI/ML in networking:** Using learned baselines instead of fixed thresholds to spot anomalies and predict failures (see 22.8).
- **Alternate port:** RSTP's pre-computed standby for the root port — promoted instantly on failure.
- **AP (Access Point):** Broadcasts Wi‑Fi and bridges to the wired network.
- **APIPA:** The 169.254.x.x address a host gives itself when DHCP doesn't answer — a symptom, not a setting.
- **ARP:** Finds a device's MAC from its IP.
- **ASBR:** Autonomous System Boundary Router — injects external routes into OSPF as Type 5 LSAs.
- **Bandwidth:** How much data a link can carry.
- **BGP:** The internet's path-vector routing protocol. Not on CCNA; a major CCNP topic.
- **BPDU:** Messages STP uses to find loops.
- **Broadcast:** A message sent to everyone on a network.
- **CAPWAP:** The tunnel protocol between a lightweight AP and its WLC — control on UDP 5246 (DTLS-encrypted), client data on UDP 5247.
- **Catalyst Center:** Cisco's campus SDN controller (formerly DNA Center) — intent-based config push, plug-and-play provisioning and assurance.
- **CDP/LLDP:** Protocols to discover neighbor devices.
- **CIDR:** Slash notation for subnet masks (e.g., /24).
- **Collapsed core:** A two-tier design where the core and distribution layers are merged; used at smaller sites.
- **Collision Domain:** An area where frames can collide.
- **Congestion control:** The sender's own guess about network capacity, inferred from packet loss.
- **Container:** An app packaged with its dependencies that shares the host OS kernel — smaller and faster to start than a VM.
- **DAD (Duplicate Address Detection):** An IPv6 host asking for its own tentative address; silence means it's free.
- **Default Gateway:** The router address used to leave your network.
- **DHCP:** Hands out IP addresses automatically.
- **DNS:** Turns names into IP addresses.
- **DR / BDR:** The Designated and Backup Designated Router OSPF elects on a broadcast segment to cut down adjacencies.
- **DSCP:** The 6-bit QoS marking in the IP header (voice = EF / 46).
- **Duplex:** One-way-at-a-time (half) vs both-ways (full).
- **Encapsulation:** Wrapping data with headers as it goes down the layers.
- **EtherChannel:** Bundling multiple links into one.
- **Extended System ID:** The 12 bits of the STP Bridge ID holding the VLAN — why priority moves in steps of 4096.
- **Fast retransmit:** Resending a segment after three duplicate ACKs, without waiting for a timeout.
- **FlexConnect:** AP mode that switches traffic locally at a branch and keeps Wi‑Fi alive if the WLC becomes unreachable.
- **FHRP:** First Hop Redundancy Protocol — lets two routers share a virtual IP and MAC so the default gateway can fail over.
- **Flow control:** The receiver advertising how much buffer it has left, via the TCP Window field.
- **Frame:** Data unit at Layer 2.
- **Generative AI:** AI that creates content (configs, explanations, docs); predictive AI forecasts from patterns. Both are exam topics (22.8).
- **Gateway:** A door between networks.
- **GLBP:** Cisco FHRP that also load balances traffic across several routers.
- **Hex:** Base-16 numbers (0-9, A-F).
- **HSRP:** Cisco FHRP using Active and Standby roles.
- **Hypervisor:** Software that creates and runs virtual machines on physical hardware.
- **IaC (Infrastructure as Code):** Describing infrastructure in version-controlled files and letting a tool make reality match.
- **Idempotence:** A change that can be applied repeatedly with the same result — the point of declarative tools.
- **IP Address:** Logical address of a device.
- **Jitter:** Variation in delay. Voice needs it under ~30 ms, because uneven arrival makes audio choppy.
- **LAG:** Link aggregation on a WLC — its EtherChannel, always static (no LACP/PAgP).
- **LAN/WAN:** Local vs wide-area network.
- **Loop Guard:** Blocks a port that stops receiving BPDUs, in case a one-way link failure would otherwise create a loop.
- **LSA:** Link-State Advertisement — the pieces OSPF floods and assembles into a map.
- **LSDB:** Link-State Database — the map, identical on every router in an area.
- **MAC Address:** Permanent hardware ID (Layer 2).
- **Metric:** How a routing protocol ranks paths.
- **MSS:** Maximum Segment Size — largest TCP payload, typically 1460 on Ethernet.
- **MTU:** Maximum Transmission Unit — largest frame payload a link carries (1500 on Ethernet).
- **NAT/PAT:** Sharing private IPs behind a public IP.
- **NDP:** Neighbor Discovery Protocol — IPv6's replacement for ARP, using ICMPv6 and multicast.
- **NSSA:** Not-So-Stubby Area — a stub area still permitted its own external routes (Type 7).
- **OSI Model:** 7-layer model of networking.
- **OSPF:** A link-state routing protocol.
- **Packet:** Data unit at Layer 3.
- **PAT:** Many devices share one public IP via ports.
- **Ping:** Tests basic connectivity.
- **PoE:** Power over Ethernet — power and data on one cable (802.3af/at/bt).
- **Policing:** Dropping traffic above a rate. (Shaping buffers it instead.)
- **Port Number:** Identifies an app/service (Layer 4).
- **Preempt:** The HSRP option that lets a recovered higher-priority router reclaim the Active role.
- **Proposal/agreement:** The RSTP handshake that replaces waiting out timers on point-to-point links.
- **QoS:** Deciding which traffic goes first when a link is congested.
- **Rapid PVST+:** Cisco's default spanning-tree mode: 802.1w speed with one instance per VLAN.
- **Root Guard:** Stops a switch on a given port from becoming the STP root.
- **Router:** Connects different networks.
- **Routing Table:** A router's map of known networks.
- **SAE:** WPA3's replacement for the PSK handshake — blocks offline dictionary attacks by requiring a live exchange per guess.
- **Shaping:** Buffering traffic above a rate to send it later, smoothing bursts.
- **SLAAC:** Stateless Address Autoconfiguration — an IPv6 host building its own address from an RA prefix.
- **Sliding window:** TCP sending multiple unacknowledged segments up to the advertised window size.
- **SOHO:** Small Office / Home Office — where one box is router, switch, AP, firewall and DHCP server.
- **Solicited-node multicast:** FF02::1:FFxx:xxxx — the group NDP queries so only the target's NIC wakes up.
- **SPF (Dijkstra):** The algorithm each OSPF router runs on the LSDB to build its own shortest-path tree.
- **Spine-leaf:** Data center design where every leaf connects to every spine, giving equal latency between servers.
- **SSID:** A Wi‑Fi network's name.
- **Split-MAC:** The lightweight architecture — real-time 802.11 work stays on the AP, management decisions move to the WLC.
- **STP:** Stops Layer 2 loops.
- **Stub area:** An OSPF area that blocks external LSAs and uses a default route instead.
- **Subnet:** A smaller piece of a network.
- **Subnet Mask:** Splits IP into network and host parts.
- **Switch:** Connects devices within a LAN using MACs.
- **TCP:** Reliable, ordered delivery.
- **Terraform:** A declarative, agentless infrastructure-as-code tool named in the current exam blueprint.
- **Trunk:** A link carrying many VLANs.
- **Trust boundary:** The point where the network decides whether to believe incoming QoS markings.
- **TTL:** Time To Live — decremented each routed hop; hits zero and the packet is dropped, preventing loops.
- **UDP:** Fast, no-guarantee delivery.
- **VLAN:** A virtual, separated LAN inside a switch.
- **VM (Virtual Machine):** A complete pretend computer, with its own OS, running as software on real hardware.
- **VPN:** An encrypted tunnel over the internet.
- **VRF:** Virtual Routing and Forwarding — several isolated routing tables on one router. (VLANs split L2; VRFs split L3.)
- **VRRP:** The open-standard FHRP, using Master and Backup roles.
- **Wildcard Mask:** The inverse of a subnet mask, used in ACLs/OSPF.

---

## 🎉 You Made It!

You just went through **everything** on the CCNA — from what a cable is, all the way to network automation. If some parts felt hard, that's normal. Come back, re-read, and **practice** (especially subnetting drills and the Lab Workbook).

Remember the big ideas:
- **Switches** work with **MAC** addresses inside a LAN (Layer 2).
- **Routers** work with **IP** addresses between networks (Layer 3).
- **Subnetting** is just cutting networks into smaller pieces — practice it daily.
- **Security** and **automation** are the future — learn them well.

You've got this. Good luck on your exam! 🚀

*— End of Guide —*
