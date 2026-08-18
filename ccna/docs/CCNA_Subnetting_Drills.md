# 🧮 CCNA Subnetting Drill Sheet
### 50+ Problems with Full Worked Answers — From Baby Steps to Exam Speed

> **Why this exists:** Subnetting shows up ALL OVER the CCNA exam, and you have to do it **fast** (about 60–90 seconds per question). Reading about it isn't enough — you have to *drill* it until it's automatic, like times tables. This sheet gives you 50+ problems, grouped from easy to hard, each with a **step-by-step answer**.

> **How to use it:** Cover the answer with your hand or a piece of paper. Work the problem on scratch paper FIRST. Then check. Do **5–10 problems every single day**. In two weeks you'll be fast. 💪

> **Where this fits.** The theory behind every method here lives in **Chapters 11–13 of the CCNA Study Guide** (IP addressing, subnetting, IPv6) — if a step doesn't make sense, that's where to look. Once these are automatic, the **Practice Question Bank** puts subnetting back into full exam-style questions.

---

## 🧰 The Toolkit (Everything You Need on One Page)

### The Two Magic Charts

**Chart 1 — Bit values in one octet (memorize left to right):**

| Position | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th |
|----------|-----|-----|-----|-----|-----|-----|-----|-----|
| **Worth** | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

**Chart 2 — The subnet "cheat table" (memorize this cold):**

| CIDR | Mask (last octet) | Block size | Usable hosts |
|------|-------------------|------------|--------------|
| /24 | 0 | 256 | 254 |
| /25 | 128 | 128 | 126 |
| /26 | 192 | 64 | 62 |
| /27 | 224 | 32 | 30 |
| /28 | 240 | 16 | 14 |
| /29 | 248 | 8 | 6 |
| /30 | 252 | 4 | 2 |

> Notice the pattern: **Block size doubles as you go up** (4, 8, 16, 32, 64, 128, 256), and **Mask value** = 256 − block size.

### The 5 Facts You Compute for Any Subnet

For any IP + mask, you can always find these 5 things:

1. **Block size** = 256 − (the interesting octet of the mask).
2. **Network address** = the block start the IP falls into (all host bits 0).
3. **Broadcast address** = one below the *next* network (all host bits 1).
4. **First usable host** = network + 1.
5. **Last usable host** = broadcast − 1.

### The Formulas

```
 Number of hosts per subnet = 2^(host bits) − 2
 Number of subnets          = 2^(borrowed bits)
 Host bits                  = 32 − CIDR
```

### The 3-Step "Where Does This IP Live?" Method

1. Find the **block size** (256 − interesting mask octet).
2. Count up in the interesting octet by the block size (0, block, 2×block…) until you pass the IP's value. The one **just below or equal** is the **network**.
3. **Broadcast** = next network − 1. Hosts sit between them.

---

# 📗 SECTION 1 — Warm-Up: Masks, CIDR & Host Counts

*(Goal: instant recall. Aim for under 15 seconds each.)*

---

**Q1.** Convert `/26` to a dotted-decimal mask.

<details><summary>Answer</summary>

**255.255.255.192**

/26 means 26 ones: `11111111.11111111.11111111.11000000`. The last octet `11000000` = 128 + 64 = **192**.
</details>

---

**Q2.** Convert `255.255.255.240` to CIDR.

<details><summary>Answer</summary>

**/28**

240 = `11110000` = 4 ones. So 8 + 8 + 8 + 4 = **28**.
</details>

---

**Q3.** Convert `/19` to a dotted-decimal mask.

<details><summary>Answer</summary>

**255.255.224.0**

/19 = `11111111.11111111.11100000.00000000`. Third octet `11100000` = 128+64+32 = **224**.
</details>

---

**Q4.** How many **usable hosts** are in a `/27`?

<details><summary>Answer</summary>

**30**

Host bits = 32 − 27 = 5. Hosts = 2^5 − 2 = 32 − 2 = **30**.
</details>

---

**Q5.** How many **usable hosts** are in a `/30`?

<details><summary>Answer</summary>

**2**

Host bits = 32 − 30 = 2. Hosts = 2^2 − 2 = 4 − 2 = **2**. (This is the classic router-to-router link size.)
</details>

---

**Q6.** How many **usable hosts** are in a `/22`?

<details><summary>Answer</summary>

**1022**

Host bits = 32 − 22 = 10. Hosts = 2^10 − 2 = 1024 − 2 = **1022**.
</details>

---

**Q7.** Convert binary `11000000` to decimal.

<details><summary>Answer</summary>

**192**

128 + 64 = **192**.
</details>

---

**Q8.** Convert decimal `224` to binary.

<details><summary>Answer</summary>

**11100000**

128 + 64 + 32 = 224. So the top three bits are on: `11100000`.
</details>

---

**Q9.** What is the **block size** of a `/29`?

<details><summary>Answer</summary>

**8**

/29 mask last octet = 248. Block size = 256 − 248 = **8**.
</details>

---

**Q10.** A mask ends in `.248`. What CIDR is that, and how many hosts?

<details><summary>Answer</summary>

**/29, 6 hosts**

248 = `11111000` = 5 ones → 24 + 5 = /29. Host bits = 3 → 2^3 − 2 = **6**.
</details>

---

# 📘 SECTION 2 — Find the Network & Broadcast Address

*(The bread-and-butter skill. Aim for under 60 seconds each.)*

---

**Q11.** Given `192.168.1.77 /26`, find the network and broadcast address.

<details><summary>Answer</summary>

**Network 192.168.1.64, Broadcast 192.168.1.127**

- Block size = 256 − 192 = **64**.
- Count by 64: 0, 64, 128… 77 falls between **64 and 127**.
- Network = **.64**, next network = .128, so Broadcast = 128 − 1 = **.127**.
</details>

---

**Q12.** Given `10.0.0.200 /27`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 10.0.0.192, Broadcast 10.0.0.223**

- Block size = 256 − 224 = **32**.
- Count by 32: …160, 192, 224. 200 is between **192 and 223**.
- Network = **.192**, Broadcast = 224 − 1 = **.223**.
</details>

---

**Q13.** Given `172.16.5.130 /25`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 172.16.5.128, Broadcast 172.16.5.255**

- Block size = 256 − 128 = **128**.
- Count by 128: 0, 128. 130 is between **128 and 255**.
- Network = **.128**, Broadcast = **.255**.
</details>

---

**Q14.** Given `192.168.10.44 /28`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 192.168.10.32, Broadcast 192.168.10.47**

- Block size = 256 − 240 = **16**.
- Count by 16: 0, 16, 32, 48. 44 is between **32 and 47**.
- Network = **.32**, Broadcast = 48 − 1 = **.47**.
</details>

---

**Q15.** Given `10.10.10.10 /29`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 10.10.10.8, Broadcast 10.10.10.15**

- Block size = 256 − 248 = **8**.
- Count by 8: 0, 8, 16. 10 is between **8 and 15**.
- Network = **.8**, Broadcast = 16 − 1 = **.15**.
</details>

---

**Q16.** Given `192.168.1.100 /30`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 192.168.1.100, Broadcast 192.168.1.103**

- Block size = 256 − 252 = **4**.
- Count by 4: …96, 100, 104. 100 lands exactly ON **100** (a network boundary).
- Network = **.100**, Broadcast = 104 − 1 = **.103**.
</details>

---

**Q17.** Given `172.16.99.200 /21`, find the network and broadcast. *(Now the interesting octet is the THIRD one!)*

<details><summary>Answer</summary>

**Network 172.16.96.0, Broadcast 172.16.103.255**

- /21 mask = 255.255.**248**.0. The interesting octet is the **3rd**.
- Block size = 256 − 248 = **8** (in the third octet).
- Count by 8 in octet 3: …88, 96, 104. 99 is between **96 and 103**.
- Network = 172.16.**96**.0, Broadcast = 172.16.**103**.255.
</details>

---

**Q18.** Given `10.50.150.7 /20`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 10.50.144.0, Broadcast 10.50.159.255**

- /20 mask = 255.255.**240**.0. Interesting octet = 3rd.
- Block size = 256 − 240 = **16**.
- Count by 16 in octet 3: …128, 144, 160. 150 is between **144 and 159**.
- Network = 10.50.**144**.0, Broadcast = 10.50.**159**.255.
</details>

---

**Q19.** Given `192.168.200.55 /18`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 192.168.192.0, Broadcast 192.168.255.255**

- /18 mask = 255.255.**192**.0. Interesting octet = 3rd.
- Block size = 256 − 192 = **64**.
- Count by 64 in octet 3: 0, 64, 128, 192, 256. 200 is between **192 and 255**.
- Network = 192.168.**192**.0, Broadcast = 192.168.**255**.255.
</details>

---

**Q20.** Given `10.1.1.1 /8`, find the network and broadcast.

<details><summary>Answer</summary>

**Network 10.0.0.0, Broadcast 10.255.255.255**

- /8 mask = 255.0.0.0. The whole 10.x.x.x block is one network.
- Network = **10.0.0.0**, Broadcast = **10.255.255.255**.
</details>

---

# 📙 SECTION 3 — Find the Usable Host Range

*(Network + 1 to Broadcast − 1. Put it all together.)*

---

**Q21.** For `192.168.1.77 /26`, list the **first and last usable host**.

<details><summary>Answer</summary>

**First 192.168.1.65, Last 192.168.1.126**

Network = .64, Broadcast = .127 (from Q11). First host = 64 + 1 = **.65**, Last host = 127 − 1 = **.126**.
</details>

---

**Q22.** For `172.16.5.130 /25`, list the first and last usable host.

<details><summary>Answer</summary>

**First 172.16.5.129, Last 172.16.5.254**

Network = .128, Broadcast = .255. First = **.129**, Last = **.254**.
</details>

---

**Q23.** For `10.10.10.10 /29`, list the first and last usable host.

<details><summary>Answer</summary>

**First 10.10.10.9, Last 10.10.10.14**

Network = .8, Broadcast = .15. First = **.9**, Last = **.14**.
</details>

---

**Q24.** For `192.168.1.100 /30`, list the first and last usable host.

<details><summary>Answer</summary>

**First 192.168.1.101, Last 192.168.1.102**

Network = .100, Broadcast = .103. First = **.101**, Last = **.102**. (Exactly 2 usable — perfect for a WAN link.)
</details>

---

**Q25.** For `172.16.99.200 /21`, list the first and last usable host.

<details><summary>Answer</summary>

**First 172.16.96.1, Last 172.16.103.254**

Network = 172.16.96.0, Broadcast = 172.16.103.255. First = 172.16.96.**1**, Last = 172.16.103.**254**.
</details>

---

**Q26.** Is `192.168.1.64` a **usable host** address in the `192.168.1.0 /26` scheme? Why?

<details><summary>Answer</summary>

**No — it's a network address.**

With /26, block size 64, the subnets start at .0, .64, .128, .192. `.64` is the **network address** of the second subnet, so it can't be assigned to a device.
</details>

---

**Q27.** Is `192.168.1.191` usable in a `/26` scheme? Why?

<details><summary>Answer</summary>

**No — it's a broadcast address.**

Subnets: .128–.191 is the third /26 (block .128, next block .192). So **.191** is the **broadcast** of that subnet — not usable.
</details>

---

**Q28.** Two PCs: `192.168.1.70 /26` and `192.168.1.130 /26`. Can they talk **directly** (same subnet)?

<details><summary>Answer</summary>

**No — different subnets, so they need a router.**

- .70 is in subnet **.64** (.64–.127).
- .130 is in subnet **.128** (.128–.191).
Different networks → traffic must go through a router (default gateway).
</details>

---

**Q29.** Two PCs: `10.0.0.33 /27` and `10.0.0.60 /27`. Same subnet?

<details><summary>Answer</summary>

**No.**

Block size 32 → subnets .0–.31, .32–.63, .64–.95…
- .33 is in **.32** (.32–.63).
- .60 is also in **.32** (.32–.63).

Wait — recheck: both are between 32 and 63! So they ARE in the same subnet **.32**. ✅ **Yes, same subnet — they can talk directly.**

*(Lesson: always double-check by finding the block for BOTH addresses. Don't guess!)*
</details>

---

**Q30.** A device is configured `192.168.5.31 /27`. What's wrong?

<details><summary>Answer</summary>

**.31 is a broadcast address — you can't assign it to a host.**

Block size 32 → subnets .0–.31, .32–.63… `.31` is the **broadcast** of the first subnet (.0–.31). Assigning it will break connectivity.
</details>

---

# 📕 SECTION 4 — "How Many Subnets / Hosts Do I Need?" (Design)

*(These are the word problems. Read carefully!)*

---

**Q31.** You have `192.168.1.0 /24` and need **4 equal subnets**. What mask and how many hosts each?

<details><summary>Answer</summary>

**Mask /26 (255.255.255.192), 62 hosts each.**

- 4 subnets = 2^2, so **borrow 2 bits**: /24 + 2 = **/26**.
- Host bits = 6 → 2^6 − 2 = **62** hosts.
- Subnets: .0, .64, .128, .192.
</details>

---

**Q32.** You have `192.168.1.0 /24` and need **at least 50 hosts per subnet**, as many subnets as possible. What mask?

<details><summary>Answer</summary>

**Mask /26 (255.255.255.192).**

- Need 50 hosts → find host bits: 2^6 − 2 = 62 ≥ 50 ✅ (2^5 − 2 = 30 is too small).
- 6 host bits → mask = 32 − 6 = **/26**.
- Gives 4 subnets of 62 hosts each.
</details>

---

**Q33.** You need **at least 500 hosts** in one subnet. What is the smallest mask (largest CIDR number) that works?

<details><summary>Answer</summary>

**/23 (255.255.254.0).**

- 2^9 − 2 = 510 ≥ 500 ✅ (2^8 − 2 = 254 too small).
- 9 host bits → mask = 32 − 9 = **/23**.
</details>

---

**Q34.** You need **exactly 6 subnets** from `172.16.0.0 /16`, each as large as possible. What mask?

<details><summary>Answer</summary>

**/19 (255.255.224.0).**

- 6 subnets → need 2^3 = 8 (2^2 = 4 too few) → **borrow 3 bits**.
- /16 + 3 = **/19**. Host bits = 13 → 2^13 − 2 = **8190** hosts each.
</details>

---

**Q35.** How many `/30` subnets can you make from a single `/24`?

<details><summary>Answer</summary>

**64.**

From /24 to /30 you borrow 6 bits (30 − 24). 2^6 = **64** subnets. (Each /30 has 2 usable hosts — great for point-to-point links.)
</details>

---

**Q36.** How many `/26` subnets fit in a `/22`?

<details><summary>Answer</summary>

**16.**

26 − 22 = 4 borrowed bits → 2^4 = **16** subnets.
</details>

---

**Q37.** A company needs 200 hosts in one LAN. Will a `/25` work? What about a single `/24`?

<details><summary>Answer</summary>

**/25 = No. /24 = Yes.**

- /25 → 2^7 − 2 = **126** hosts (too small for 200). ❌
- /24 → 2^8 − 2 = **254** hosts (fits 200). ✅
</details>

---

**Q38.** You need a subnet for a **point-to-point link between two routers** with no wasted addresses. What mask?

<details><summary>Answer</summary>

**/30 (or /31 for zero waste).**

- **/30** gives exactly 2 usable hosts — one per router. The standard choice.
- **/31** (RFC 3021) gives 2 usable with *no* network/broadcast waste, used on point-to-point links by advanced setups.
</details>

---

**Q39.** From `10.0.0.0 /24`, you subnet into `/28`s. What is the **network address of the 5th subnet**?

<details><summary>Answer</summary>

**10.0.0.64**

Block size = 16. Subnets: 1st = .0, 2nd = .16, 3rd = .32, 4th = .48, **5th = .64**. ✅
</details>

---

**Q40.** From `192.168.1.0 /24` subnetted into `/27`s, what is the **broadcast of the 3rd subnet**?

<details><summary>Answer</summary>

**192.168.1.95**

Block size = 32. Subnets: 1st .0–.31, 2nd .32–.63, **3rd .64–.95**. Broadcast of 3rd = **.95**.
</details>

---

# 📗 SECTION 5 — VLSM (Variable Length Subnet Masks)

*(Different-sized subnets from one block. The GOLDEN RULE: always assign the biggest subnet first!)*

---

**Q41.** From `192.168.1.0 /24`, create subnets for: Sales (100 hosts), IT (50 hosts), HR (25 hosts), and a WAN link (2 hosts). Give the subnet + mask for each.

<details><summary>Answer</summary>

**Assign biggest first:**

| Group | Hosts | Mask | Subnet | Range | Broadcast |
|-------|-------|------|--------|-------|-----------|
| Sales | 100 | /25 (126) | 192.168.1.0 | .1–.126 | .127 |
| IT | 50 | /26 (62) | 192.168.1.128 | .129–.190 | .191 |
| HR | 25 | /27 (30) | 192.168.1.192 | .193–.222 | .223 |
| WAN | 2 | /30 (2) | 192.168.1.224 | .225–.226 | .227 |

**Steps:** Sales needs 100 → /25 (126). Start at .0, uses .0–.127. Next free = .128. IT needs 50 → /26 (62), uses .128–.191. Next free = .192. HR needs 25 → /27 (30), uses .192–.223. Next free = .224. WAN needs 2 → /30, uses .224–.227. ✅
</details>

---

**Q42.** From `10.0.0.0 /24`, you need three subnets: A (60 hosts), B (12 hosts), C (2 hosts). Provide subnet + mask for each.

<details><summary>Answer</summary>

| Group | Hosts | Mask | Subnet | Range | Broadcast |
|-------|-------|------|--------|-------|-----------|
| A | 60 | /26 (62) | 10.0.0.0 | .1–.62 | .63 |
| B | 12 | /28 (14) | 10.0.0.64 | .65–.78 | .79 |
| C | 2 | /30 (2) | 10.0.0.80 | .81–.82 | .83 |

A: 60 → /26 (62), .0–.63. Next = .64. B: 12 → /28 (14), .64–.79. Next = .80. C: 2 → /30, .80–.83. ✅
</details>

---

**Q43.** In Q41, what goes wrong if you assign the **WAN /30 first** at 192.168.1.0, then try to fit Sales?

<details><summary>Answer</summary>

**You waste space and may not fit Sales cleanly (fragmentation).**

If WAN takes .0–.3, Sales (/25 = 126 hosts) can't start until a 128-aligned boundary (.128). You'd push Sales to .128–.255, leaving .4–.127 chopped up and possibly unusable for the other groups. **That's why VLSM's golden rule is: biggest subnet first.**
</details>

---

**Q44.** From `172.16.0.0 /22`, allocate: Building1 (500 hosts), Building2 (250 hosts), Building3 (100 hosts). Provide subnet + mask for each.

<details><summary>Answer</summary>

| Group | Hosts | Mask | Subnet | Range | Broadcast |
|-------|-------|------|--------|-------|-----------|
| Bldg1 | 500 | /23 (510) | 172.16.0.0 | 172.16.0.1–172.16.1.254 | 172.16.1.255 |
| Bldg2 | 250 | /24 (254) | 172.16.2.0 | 172.16.2.1–172.16.2.254 | 172.16.2.255 |
| Bldg3 | 100 | /25 (126) | 172.16.3.0 | 172.16.3.1–172.16.3.126 | 172.16.3.127 |

Bldg1: 500 → /23 (510), uses 172.16.0.0–172.16.1.255. Next = 172.16.2.0. Bldg2: 250 → /24 (254), uses 172.16.2.0–.255. Next = 172.16.3.0. Bldg3: 100 → /25 (126), uses 172.16.3.0–.127. ✅ (All fits inside the /22!)
</details>

---

**Q45.** You subnetted `192.168.4.0 /24` with VLSM and used up to `192.168.4.223`. A new team needs **20 hosts**. What subnet + mask do you give them, and does it fit?

<details><summary>Answer</summary>

**192.168.4.224 /27, and yes it fits exactly.**

- 20 hosts → /27 (30 usable). Next free address is .224.
- /27 block size 32 → uses .224–.255 (broadcast .255). Fits perfectly in the remaining space. ✅
</details>

---

# 📘 SECTION 6 — Rapid-Fire Mixed Drills (Exam Simulation)

*(No hints. Do these on a timer — target under 60 seconds each.)*

---

**Q46.** `192.168.3.194 /26` → network, broadcast, first, last?

<details><summary>Answer</summary>

Block 64. Subnets .0/.64/.128/.192. 194 is in **.192** (.192–.255).
- Network **192.168.3.192**, Broadcast **192.168.3.255**, First **.193**, Last **.254**.
</details>

---

**Q47.** `10.20.30.40 /28` → network, broadcast, first, last?

<details><summary>Answer</summary>

Block 16. 40 is between 32 and 47.
- Network **10.20.30.32**, Broadcast **10.20.30.47**, First **.33**, Last **.46**.
</details>

---

**Q48.** `172.31.100.100 /26` → network, broadcast?

<details><summary>Answer</summary>

Block 64. 100 is between 64 and 127.
- Network **172.31.100.64**, Broadcast **172.31.100.127**.
</details>

---

**Q49.** `192.168.15.15 /29` → network, broadcast, first, last?

<details><summary>Answer</summary>

Block 8. 15 is between 8 and 15.
- Network **192.168.15.8**, Broadcast **192.168.15.15**, First **.9**, Last **.14**.
- (Note: .15 is the broadcast, so the *device* .15 is NOT a usable host!)
</details>

---

**Q50.** `10.0.5.130 /23` → network, broadcast? *(Third-octet subnetting!)*

<details><summary>Answer</summary>

/23 mask = 255.255.**254**.0. Block size in 3rd octet = 256 − 254 = **2**.
Count by 2 in octet 3: 0, 2, 4, 6… 5 is between **4 and 5**.
- Network **10.0.4.0**, Broadcast **10.0.5.255**.
</details>

---

**Q51.** `192.168.1.222 /27` → is it a host, network, or broadcast?

<details><summary>Answer</summary>

**Usable host.**

Block 32. Subnet containing 222 is **.192** (.192–.223). Network = .192, Broadcast = .223. Since 222 is between .193 and .222, it's a **usable host**. ✅
</details>

---

**Q52.** `172.16.14.0 /23` → how many usable hosts, and what's the broadcast?

<details><summary>Answer</summary>

**510 hosts; broadcast 172.16.15.255.**

/23 → host bits 9 → 2^9 − 2 = **510**. Block size 2 in 3rd octet → 14 and 15 belong together (14–15), so range is 172.16.14.0–172.16.15.255, broadcast **172.16.15.255**.
</details>

---

**Q53.** `10.10.10.100 /25` → which subnet (network address)?

<details><summary>Answer</summary>

**10.10.10.0**

Block 128. Subnets: .0 (.0–.127) and .128 (.128–.255). 100 is in **.0**. Network = **10.10.10.0**.
</details>

---

**Q54.** `192.168.100.100 /30` → network, broadcast, both usable hosts?

<details><summary>Answer</summary>

Block 4. Count by 4: …96, 100, 104. 100 is a boundary.
- Network **192.168.100.100**, Broadcast **192.168.100.103**, Hosts **.101 and .102**.
</details>

---

**Q55.** You see `255.255.255.252`. How many of these subnets fit in a `/24`, and what are they good for?

<details><summary>Answer</summary>

**64 subnets; good for point-to-point router links.**

255.255.255.252 = **/30**. From /24 to /30 you borrow 6 bits → 2^6 = **64** subnets, each with **2 usable hosts**. Perfect for router-to-router (WAN) links where you only need one address on each end.
</details>

---

# 🏆 SECTION 7 — Boss Level: Full Scenario Problems

*(These mimic the harder simulation-style exam questions. Take your time.)*

---

**Q56.** A router interface is configured with `192.168.1.65 /26`. A host on that LAN is set to `192.168.1.130 /26` with gateway `192.168.1.65`. The host can't reach the internet. What's the problem and the fix?

<details><summary>Answer</summary>

**Problem: the host and its gateway are in different subnets.**

- Gateway .65 /26 is in subnet **.64** (.64–.127).
- Host .130 /26 is in subnet **.128** (.128–.191).

The host can't reach a gateway that isn't on its own subnet, so it can't route out. **Fix:** give the host an address in .64–.127 (e.g., 192.168.1.66), OR move the gateway into the host's subnet. They must share the same subnet.
</details>

---

**Q57.** You're given `192.168.50.0 /24` and must support **6 subnets**, each needing **25 usable hosts**. Give the mask and list all 6 network addresses.

<details><summary>Answer</summary>

**Mask /27 (255.255.255.224).**

- 25 hosts → /27 gives 30 usable ✅. 
- /27 also gives 2^3 = 8 subnets (≥ 6 needed) ✅.
- Block size 32 → networks: **.0, .32, .64, .96, .128, .160** (first 6), plus .192, .224 spare.
</details>

---

**Q58.** `10.1.1.0 /24` needs these, biggest-first (VLSM): Subnet A 120 hosts, B 60 hosts, C 30 hosts, D 12 hosts, plus two /30 WAN links (E, F). List each subnet + mask + range.

<details><summary>Answer</summary>

| Sub | Hosts | Mask | Network | Range | Broadcast |
|-----|-------|------|---------|-------|-----------|
| A | 120 | /25 (126) | 10.1.1.0 | .1–.126 | .127 |
| B | 60 | /26 (62) | 10.1.1.128 | .129–.190 | .191 |
| C | 30 | /27 (30) | 10.1.1.192 | .193–.222 | .223 |
| D | 12 | /28 (14) | 10.1.1.224 | .225–.238 | .239 |
| E | 2 | /30 (2) | 10.1.1.240 | .241–.242 | .243 |
| F | 2 | /30 (2) | 10.1.1.244 | .245–.246 | .247 |

Everything fits inside the /24 with room to spare (.248–.255 free). ✅
</details>

---

**Q59.** Summarize (aggregate) these four networks into ONE route: `172.16.0.0/24, 172.16.1.0/24, 172.16.2.0/24, 172.16.3.0/24`.

<details><summary>Answer</summary>

**172.16.0.0 /22**

The four /24s (.0, .1, .2, .3 in the 3rd octet) share the top 22 bits. In binary the 3rd octet: 00000000, 00000001, 00000010, 00000011 — the first **6 bits** are identical, and 16 + 6 = **22**. So the summary is **172.16.0.0/22** (covers .0 through .3). This is **route summarization**, which shrinks routing tables.
</details>

---

**Q60.** Summarize `192.168.8.0/24` through `192.168.15.0/24` into one route.

<details><summary>Answer</summary>

**192.168.8.0 /21**

Third octet values 8–15 in binary: 00001000 … 00001111. The first **5 bits** (00001) are common → 16 + 5 = **21**. Summary = **192.168.8.0/21** (covers .8 through .15). ✅
</details>

---

# 🎯 The One-Page Speed Method (Print This!)

When you see any "IP + CIDR" question, do this in your head, every time:

**Step 1 — which octet is "interesting"?**

| CIDR | Interesting octet |
|------|-------------------|
| /1–/8 | 1st |
| /9–/16 | 2nd |
| /17–/24 | 3rd |
| /25–/32 | 4th |

**Step 2 —** block size = **256 − (mask value in that octet)**

**Step 3 —** count 0, block, 2×block… until you pass the IP. The one at or just
below it is the **network address**.

**Step 4 —**

| Value | Formula |
|---|---------|
| Broadcast | next network − 1 |
| First host | network + 1 |
| Last host | broadcast − 1 |

**Step 5 —** usable hosts = **2^(32−CIDR) − 2**

## Final Tips 🌟

1. **Memorize the cheat table** (/24–/30 with block sizes and host counts). It saves you 30 seconds every question.
2. **Always find the block for BOTH addresses** when asked "same subnet?" — don't eyeball it.
3. **Watch out for network & broadcast addresses** disguised as host answers (a favorite trick).
4. **VLSM golden rule:** biggest subnet first, every time.
5. **Do 10 problems a day.** Speed comes only from reps. In two weeks this will feel easy.

You've got this. Now go drill! 🚀

*— End of Subnetting Drill Sheet —*