# 🎯 CCNA Study Tips — How to Work Through This Kit

> **What this is:** the instruction manual for the other five books. The kit
> gives you a Study Guide, a Question Bank, a Drill Sheet, a Flashcard Deck and
> a Lab Workbook — this document tells you **what order to touch them in**, what
> "done with a chapter" actually means, and the handful of study-science rules
> that make the difference between *reading for six weeks* and *being ready in
> six weeks*. For calendar plans (8-week and 14-day), see Study Guide
> Chapter 24 — this is the method those calendars assume.

---

## 1. The One Rule

**Finish a chapter completely before starting the next one.**

Completely means all five checkboxes:

1. ☐ **Read** the chapter — out loud where it says *why*, because the whys are
   the exam.
2. ☐ **Add its flashcards** — study that chapter's subdeck in Anki until you've
   seen every card once (the table in section 3 says which subdeck).
3. ☐ **Build its lab** — if the chapter has one. No lab, no checkbox to skip:
   most chapters have one, and it's where reading becomes ability.
4. ☐ **Explain it to the wall.** Pick the two or three big ideas and explain
   them out loud, from memory, to nobody. Where you stumble is *exactly* where
   to re-read. (This feels ridiculous. It is also the single highest-value
   fifteen minutes in this entire document.)
5. ☐ **Move on** — and let Anki carry the chapter from here.

**Why so strict about not skipping ahead?** Because this guide builds like a
tower: VLANs assume switching, trunks assume VLANs, router-on-a-stick assumes
trunks, OSPF assumes routing, and the capstone assumes everything. A shaky
floor doesn't fall over immediately — it falls over four chapters later, where
it's expensive to figure out which floor was the problem. Sequential and
solid beats fast and hollow.

The only thing that is **never** sequential: reviews. Which brings us to —

## 2. The Daily Frame (Non-Negotiables)

Every study day has the same skeleton, whatever chapter you're on:

| When | What | How long |
|------|------|----------|
| First | **Anki reviews** — whatever the app says is due. Zero exceptions. | 10–20 min |
| Second | **Subnetting warm-up** — 5 problems from the Drill Sheet (once you've passed Chapter 12) | 5–10 min |
| Then | **New material** — the current chapter's checkboxes | 45–90 min |
| Last | **Close the loop** — save lab configs, mark your checkbox progress, note tomorrow's starting point | 2 min |

**Why reviews first, before new material?** Two reasons. The honest one: if
they come last, they get skipped, and a skipped day turns into a 90-card
mountain that makes tomorrow worse. The scientific one: spaced repetition only
works *as a system* — Anki schedules each card for the moment you're about to
forget it, and answering **on that day** is what pushes the memory out another
interval. Do the reviews when they're due and 15 minutes a day holds hundreds
of facts; binge them weekly and you're just rereading flashcards.

**Why subnetting daily instead of "the subnetting week"?** Because the exam
doesn't give you time to derive it. Every routing question, every ACL wildcard,
every VLSM design leans on subnetting — it has to be *reflex*, and reflexes
are built by short daily reps, not marathons. Five problems. Every day. By
exam week you'll do them while the coffee brews.

**Missed a day?** Do the Anki backlog first, shrink or skip the new material,
and don't try to "catch up" by doubling tomorrow. The schedule bends; the
review-first rule doesn't.

## 3. The Chapter-by-Chapter Path

This is the whole kit in one table — work top to bottom, left to right.
(Q-domains appear when a domain's chapters are *all* done: questions are a
test of the finished domain, not a reading companion.)

| Step | Read (Guide) | Anki subdeck | Lab | Then |
|------|--------------|--------------|-----|------|
| 1 | Ch 1–2 (networks, models, TCP/UDP) | 01, 02 | Lab 0 (set up EVE-NG) | — |
| 2 | Ch 3–4 (cables, PoE, binary/hex) | 03 | — | — |
| 3 | Ch 5–6 (Ethernet, switching, IOS) | 04 (first half) | Labs 1–2 | — |
| 4 | Ch 7–8 (VLANs, trunks, inter-VLAN) | 04 (rest) | Labs 3–5 | — |
| 5 | Ch 9 (STP) | 05 | Lab 6 | — |
| 6 | Ch 10 (EtherChannel) | 06 | Lab 7 | — |
| 7 | Ch 11–12 (IPv4, subnetting) | 07 | Lab 8 | **Start daily drills** |
| 8 | Ch 13 (IPv6) | 08 | Lab 11 | **Question Domain 1** |
| 9 | Ch 14–15 (routing, static routes) | 09 | Labs 9, 12 | — |
| 10 | Ch 16 (OSPF) | 10 | Lab 10 | **Question Domain 3** |
| 11 | Ch 17 (DHCP, NAT, NTP, QoS…) | 11 | Labs 13–14 | **Question Domain 4** |
| 12 | Ch 18–19 (security, ACLs) | 12 | Labs 15–16 | **Question Domains 5 + 5b** |
| 13 | Ch 20 (wireless) | 13 | WLC GUI in Packet Tracer | **Question Domain 2** (needs 7–10 + 20) |
| 14 | Ch 21 (management) | 15 (its Ch 21 cards) | — | — |
| 15 | Ch 22 (automation, AI) | 14 | — | **Question Domain 6** |
| 16 | Ch 23 (troubleshooting) | 15 (the rest) | redo two Break-its | **Question Domain 7** |
| 17 | Ch 24 + review | — | **Lab 17 capstone** | full bank re-take |

Three notes on the table's quirks, so you trust it rather than fight it:

- **Lab numbers 9–12 aren't in reading order** — the Lab Workbook groups IPv6
  (Lab 11) and HSRP (Lab 12) where they build best, but *read* Ch 13 before
  Lab 11 and Ch 14 before Lab 12, exactly as shown.
- **Domain 2 questions come late** even though switching is early: that
  domain mixes switching *and* wireless, so it isn't testable until Ch 20.
- **Domain 1 questions unlock at step 8**, not step 2 — the domain mixes
  cabling and models with addressing *and IPv6*, so it needs Ch 11–13 done.

## 4. What "Done" Feels Like (the honest checkpoints)

You're calibrating against these, not against pages-read:

- **A chapter is done** when the wall-explanation (rule 1, checkbox 4) comes
  out smooth, and its lab's *Break it* didn't require the solution box.
- **A question domain is done** when you score **85%+** *and* can say why each
  wrong answer is wrong. A right answer you can't defend is a coin that
  happened to land well — the exam will flip it again, worded differently.
- **A failing flashcard is a message**, not a nuisance. Three misses on the
  same card = stop drilling it and go re-read that section; the card is
  telling you the *understanding* is missing, and no amount of repetition
  fixes a fact that was never understood. (The deck's answers name their
  guide sections for exactly this.)
- **You're ready to book** when: the full question bank re-take clears 85%,
  the drill sheet runs at exam speed (under a minute a problem), the Lab 17
  capstone passes its own grading matrix, and the Blueprint Coverage Map
  (Guide Appendix A) has no row that makes your stomach drop. Book about two
  weeks out at that point — a deadline sharpens the final review wonderfully.

## 5. The Five Habits That Separate Passing From Failing

1. **Type, never paste.** Every lab command, by hand, every time. The exam's
   sim questions and your first job interview both happen at a CLI with no
   clipboard. Muscle memory is a real thing and this is how it's built.
2. **Chase the why.** When two study partners disagree, the one who can say
   *why* the native VLAN matters beats the one who memorized "change it from
   VLAN 1." This entire guide is built around the whys because the exam's
   favorite trick is four answers that are all *true* — and one that's *why*.
3. **Break things on purpose.** Every lab's Break-it challenge exists because
   diagnosing a fault teaches more than configuring a feature. If a lab
   worked first try, you haven't finished it — break it and fix it.
4. **Never leave a mystery.** "It works now but I don't know why" is the most
   expensive sentence in networking. Five minutes of `show` commands while
   the mystery is fresh, or an hour of confusion when it resurfaces in
   Chapter 19.
5. **Protect the streak, not the session.** Ninety minutes daily beats seven
   hours on Sunday — spaced repetition, subnetting reflexes and lab muscle
   memory are all *frequency* effects, not *duration* effects. On a terrible
   day, do the Anki reviews and five subnets and call it a win; the streak
   survived, and the streak is the actual asset.

## 6. The Final Two Weeks

Once every row of the section-3 table is checked:

- **Week –2:** re-take the full question bank (fresh, timed-ish). For every
  miss: Blueprint Map → section → re-read → find its flashcard and re-mark it.
  Rebuild Lab 17 from scratch *without* your saved configs.
- **Week –1:** drills at full speed daily, Anki daily (your reviews should be
  mostly old friends by now), the eight capstone break-and-fix challenges one
  per day, and Chapter 24's must-memorize cheat sheet twice through.
- **Day before:** Anki reviews, five subnets, the cheat sheet once, and stop.
  Cramming past this point trades sleep (which consolidates memory) for
  anxiety (which shreds it) — objectively a terrible deal.
- **Exam day:** Chapter 24.4's tips take it from here. You can't go back to
  previous questions, subnetting speed buys you thinking time, and you've
  typed every command they can show you. Go get it.

*— End of Study Tips —*
