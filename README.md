# Networking

Self-contained Cisco study kits, plus the scripts that build them:

- **`ccna/`**: the complete **CCNA 200-301 (v1.1)** kit. Five resources that work
  together, plus a **Study Tips** manual that sequences them and a **DevNet Lab
  Companion** for running the labs in the cloud without your own server.
- **`ccnp/`**: the **CCNP Enterprise** study guide covering both exams,
  **ENCOR 350-401 v1.2** and **ENARSI 300-410 v1.1**. See
  [CCNP Enterprise](#ccnp-enterprise) below.

## CCNA: the five resources

| Document | What it's for | Size |
| --- | --- | --- |
| **Study Guide** | Teaches every exam topic from scratch, in plain language with diagrams, worked configs and the reasoning behind each concept | 24 chapters, ~160 pages |
| **Practice Question Bank** | Tests it — exam-style questions grouped by the official domains, each with a full explanation of why the right answer is right *and* why the traps are wrong | 152 questions |
| **Subnetting Drill Sheet** | Builds the one skill that has to be *fast*, not just correct | 60 worked problems |
| **Flashcard Deck** | Drills the facts into instant recall via spaced repetition. Builds for **Anki** (`.apkg`) and **Quizlet/other apps** (`.tsv`) | 299 cards, 15 subdecks |
| **Lab Workbook** | Turns reading into typing — hands-on EVE-NG/GNS3 labs following the guide chapter by chapter, each with verification steps, full solutions and a break-and-fix challenge | 17 labs + capstone |
| **DevNet Lab Companion** | Runs the Lab Workbook with no hardware at all — maps every lab onto Cisco's free DevNet Sandboxes (reservable CML sessions + Always-On IOS XE), with an EVE-NG→CML translation guide and a Linux-host survival kit | all 17 labs mapped |
| **Study Tips** | The manual for the other five: the per-chapter study loop (read → Anki → lab → move on), a chapter-by-chapter path through all resources, and the readiness checkpoints for booking the exam | start here |

They cross-reference each other: the guide points at the drills for subnetting
practice and at the question bank per domain, the drills point back at Chapters
11–13 for the theory, and the question bank points at the guide's **Blueprint
Coverage Map** appendix — a table mapping every official exam topic to the
section that covers it, so a missed question leads straight to the right page.
A flashcard you keep failing is the same signal: go re-read that section.

Chapter 24 ties them together with two schedules — an 8-week plan and a 14-day
sprint — mapping each day to chapters, drills, question-bank domains and daily
Anki reviews.

## CCNP Enterprise

`ccnp/CCNP_Study_Guide.pdf` is the CCNA guide's sequel, written in the same voice
and the same "explain *why*" style, pitched at someone who already holds a CCNA.

| Part | Covers | Chapters |
| --- | --- | --- |
| **I — ENCOR 350-401 v1.2** | Architecture, virtualization, infrastructure, assurance, security, automation & AI (the March 2026 blueprint: Catalyst Center / SD-WAN Manager naming, wireless removed) | 1–21 |
| **II — ENARSI 300-410 v1.1** | Redistribution, route maps, EIGRP/OSPF/BGP in depth, PBR/VRF-Lite/BFD, MPLS L3VPN, DMVPN, infrastructure security and services — troubleshooting-first | 22–32 |
| **III — Passing both** | Exam strategy, EVE-NG/DevNet lab mapping, 10-week + 5-week ENCOR plans, 6-week + 3-week ENARSI plans, cheat sheet | 33 |
| **Appendices** | A: ENCOR coverage map · B: ENARSI coverage map (every official topic → section) · C: the CCNA sections to re-read first · glossary | — |

~843 pages, 48 rendered diagrams. Every chapter opens with a **Blueprint** line
naming the exact exam topics it covers. Each section explains the problem first
(the why), then a 📖 Story Time analogy, a step-by-step walk-through (the how)
and a worked example with real numbers, and ends with **exam-style questions**
(814 in all: single answer, "Choose two", "Refer to the exhibit" and
troubleshooting scenarios). Every answer explains why the right option is right
and why each wrong one is wrong.

```bash
python ccnp/scripts/build_diagrams.py     # renders ccnp/images/*.png
python ccna/scripts/build_pdf.py ccnp/docs/CCNP_Study_Guide.md ccnp/CCNP_Study_Guide.pdf "CCNP Study Guide"
```

The CCNP kit reuses the CCNA kit's tooling rather than copying it:
`build_pdf.py` resolves a document's `images/` against that document's own kit
folder, and `ccnp/scripts/build_diagrams.py` imports the drawing primitives from
`ccna/scripts/build_diagrams.py`, so both guides share one visual language.

## NetLab: the interactive web app

`web/` turns both kits into a study site you can deploy. The markdown stays the
single source of truth: at build time `web/app/build_content.py` parses it into
structured content, and the app tracks your progress in Postgres.

| Area | What it does |
| --- | --- |
| **Read** | Both guides, the Study Tips and the DevNet companion, page by page, with a contents sidebar. Each page can be marked done and has a notes box. Every exam-style question is a live widget: pick, check, see why. Answers are graded on the server, so they never appear in the page source. Click any diagram to open it full size |
| **Terminal** | 13 guided CLI labs plus a sandbox, run on a Cisco IOS-style simulator in the browser (`web/app/static/js/ios.js`). Each lab has a live topology diagram (links go green when up, pings animate along their path) and a console per router, switch and VPCS PC, with `?` help, Tab completion, abbreviations, `no` and `do` forms, `\| include/section`, and real IOS errors. Tasks are checked against what the simulated network actually does. Covers device hardening, addressing, VLANs, trunks and DTP, router-on-a-stick, static and floating routes, single-area OSPF and OSPF troubleshooting, standard and extended ACLs, DHCP and relay, SSH, and a multi-fault troubleshooting ticket. Progress saves to the server |
| **Quiz** | Builds sets from the 152 CCNA bank and 814 CCNP questions by topic (or all of ENCOR / ENARSI), filtered to all, unseen or missed. **Practice** explains each answer as you go; **Exam** is timed (72s a question by default), lets you flag and change answers, and grades at the end with a per-topic breakdown |
| **Flashcards** | All 299 cards with Anki-style spaced repetition (learning steps, ease, lapses), a daily new-card limit, per-deck study, cram mode and a browser |
| **Subnetting** | An endless trainer across 10 problem types (network/broadcast, host ranges, right-sizing, wildcards, same-subnet, IPv6 shorten/expand...). Each answer gets the drill sheet's worked method with the bits highlighted. Also a calculator, the 60 worked drills with self-grading, and the toolkit |
| **Labs** | Every lab's tasks and verification steps as checkboxes, plus completion and notes |
| **Dashboard** | Continue-reading, what's due today, accuracy per source, reading/terminal/lab progress, weak topics (under 85%), streak and a 16-week activity map |

Keyboard: `A`–`E` pick answers, `Enter` checks, `←`/`→` page through, `Space` flips a card and `1`–`4` rate it, `/` searches.

### Run it locally (Docker)

```bash
docker compose up --build            # http://localhost:8000, with Postgres
```

Put `APP_PASSWORD`, `SECRET_KEY` and optionally `NETLAB_PORT` in a `.env` file
next to `docker-compose.yml` to try the login or use another port.

### Deploy to Railway

1. Create a project from this repo. Railway reads `railway.json` and builds the root `Dockerfile`.
2. Add a **Postgres** database to the project and reference its `DATABASE_URL` from the web service's variables.
3. Set these variables on the web service:
   - `APP_PASSWORD`: the password for the site. Without it, anyone with the URL can use it.
   - `SECRET_KEY`: 32+ random characters, from `python -c "import secrets; print(secrets.token_hex(32))"`.
4. Generate a domain under the service's **Networking** settings.

Each start runs `alembic upgrade head` before serving, and Railway checks
`/healthz`. Editing the markdown and redeploying updates the content and keeps
your progress. Questions, cards and pages are keyed by their numbering and text.

### Developing

```bash
cd web
python -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m app.build_content          # writes app/data/content.json
.venv/bin/alembic upgrade head                 # SQLite at web/data/app.db
.venv/bin/uvicorn app.main:app --reload
.venv/bin/python -m pytest tests               # content, scheduler, API
node tests/subnet_math.test.mjs && node tests/subnet_gen.test.mjs
node tests/ios.test.mjs                        # simulator, and every terminal lab's solution
```

Terminal labs live in `web/app/terminal_labs.json`: devices with diagram
positions, cables, starting configs, tasks with machine checks, hints and a full
solution. `tests/ios.test.mjs` proves for every lab that no task starts solved,
the solution passes every check, and the saved state reloads intact.

Schema changes go through Alembic: edit `app/models.py`, then
`alembic revision --autogenerate -m "..."` and review the file in
`migrations/versions/`. The content build fails loudly if a question block in
the markdown stops parsing, which stops a broken deploy at build time.

## Layout

```
ccna/
  CCNA_Study_Guide.pdf          <- the PDFs, ready to read
  CCNA_Practice_Questions.pdf
  CCNA_Subnetting_Drills.pdf
  CCNA_Lab_Workbook.pdf
  CCNA_DevNet_Labs.pdf          <- the Lab Workbook, on free cloud sandboxes
  CCNA_Study_Tips.pdf               <- read this one first
  CCNA_Flashcards.apkg          <- import into Anki
  CCNA_Flashcards.tsv           <- or into Quizlet / other apps
  docs/       Markdown sources (edit these)
  images/     Rendered diagrams (generated by scripts/build_diagrams.py)
  scripts/    Build scripts that turn docs/*.md into the files above
  fonts/      TrueType fonts used by the builds
ccnp/
  CCNP_Study_Guide.pdf          <- ENCOR + ENARSI
  docs/       CCNP_Study_Guide.md (edit this)
  images/     Rendered diagrams (generated by scripts/build_diagrams.py)
  scripts/    build_diagrams.py (PDF build uses ccna/scripts/build_pdf.py)
```

The PDFs sit at the top of `ccna/` and `ccnp/` so they're the first thing you see. The
markdown in `ccna/docs/` is the single source of truth — the PDFs are generated
from it, so edit the markdown and rebuild rather than editing a PDF.

One source, one output, no extra copies:

| Source (edit) | Output (use) |
| --- | --- |
| `ccna/docs/CCNA_Study_Guide.md` | `ccna/CCNA_Study_Guide.pdf` |
| `ccna/docs/CCNA_Practice_Questions.md` | `ccna/CCNA_Practice_Questions.pdf` |
| `ccna/docs/CCNA_Subnetting_Drills.md` | `ccna/CCNA_Subnetting_Drills.pdf` |
| `ccna/docs/CCNA_Lab_Workbook.md` | `ccna/CCNA_Lab_Workbook.pdf` |
| `ccna/docs/CCNA_DevNet_Labs.md` | `ccna/CCNA_DevNet_Labs.pdf` |
| `ccna/docs/CCNA_Study_Tips.md` | `ccna/CCNA_Study_Tips.pdf` |
| `ccna/docs/CCNA_Flashcards.md` | `ccna/CCNA_Flashcards.apkg` + `ccna/CCNA_Flashcards.tsv` |
| `ccna/scripts/build_diagrams.py` | `ccna/images/*.png` (the study guide's diagrams) |
| `ccnp/docs/CCNP_Study_Guide.md` | `ccnp/CCNP_Study_Guide.pdf` |
| `ccnp/scripts/build_diagrams.py` | `ccnp/images/*.png` |

The study guide's diagrams are **drawn in code**: `scripts/build_diagrams.py`
renders each one (device topologies, sequence diagrams, frame layouts) into
`ccna/images/` at 2x scale, and `build_pdf.py` embeds them at half size so
they print crisp. To change a diagram, edit its function in the script and
re-run it — passing diagram names as arguments rebuilds just those
(e.g. `python ccna/scripts/build_diagrams.py stp hsrp`).

## Building

Requirements: `pip install markdown xhtml2pdf reportlab pymupdf genanki pillow`

Fonts: everything needed is committed in `ccna/fonts/` (DejaVu Sans and DejaVu Sans
Mono, redistributable under the Bitstream Vera license — see
`ccna/fonts/LICENSE.txt`), so the builds work out of the box on any platform.

The two PDF scripts *prefer* Segoe UI and Consolas if you drop `segoeui.ttf`,
`segoeuib.ttf`, `consola.ttf`, and `consolab.ttf` into `ccna/fonts/` — those are the
fonts the original PDFs were built with, but they're Windows-only and can't be
redistributed, so DejaVu is the committed fallback.

Rebuild everything after editing the markdown:

Every script resolves paths against `ccna/` (derived from its own location), so
these work from any working directory, and each has sensible defaults if run
with no arguments.

```bash
# Standard PDFs — build_pdf.py [source.md] [output.pdf] [footer title]
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Study_Guide.md ccna/CCNA_Study_Guide.pdf "CCNA Study Guide"
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Practice_Questions.md ccna/CCNA_Practice_Questions.pdf "CCNA Practice Questions"
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Subnetting_Drills.md ccna/CCNA_Subnetting_Drills.pdf "CCNA Subnetting Drills"
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Lab_Workbook.md ccna/CCNA_Lab_Workbook.pdf "CCNA Lab Workbook"
python ccna/scripts/build_pdf.py ccna/docs/CCNA_DevNet_Labs.md ccna/CCNA_DevNet_Labs.pdf "CCNA DevNet Labs"
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Study_Tips.md ccna/CCNA_Study_Tips.pdf "CCNA Study Tips"

# Flashcards — writes both the .apkg and the .tsv
python ccna/scripts/build_flashcards.py
```

### The flashcard deck

One source, two formats — use whichever app you prefer.

**Anki** — import `ccna/CCNA_Flashcards.apkg` (File → Import, or double-click).
It creates a **CCNA 200-301** deck with 15 topic subdecks, so you can drill just
the area you studied that day; every card is tagged `ccna` plus its topic.

Card IDs are derived from stable hashes of the question text, so **re-importing
a rebuilt deck updates the existing cards instead of duplicating them** — your
review history and scheduling survive edits. Change a card in
`ccna/docs/CCNA_Flashcards.md`, rerun the build, re-import.

Anki platforms: **free** on Windows/macOS/Linux and Android (AnkiDroid), and
**free in any browser** via AnkiWeb — which works on iPhone if you sync the deck
and add the page to your home screen. The native iOS app (**AnkiMobile**) is a
one-time paid purchase; check the App Store for current pricing.

**Quizlet (or anything else)** — import `ccna/CCNA_Flashcards.tsv`. In Quizlet:
*Create → Import*, paste the file's contents, and set the delimiters to
**Tab** between term and definition and **New line** between cards. The TSV is
plain text with markdown stripped, since most apps display markup literally.
Note that re-importing there creates a *new* set rather than updating an
existing one.

### Optional: self-testing quiz PDFs

`build_interactive.py` turns either Q&A document into a **tap-to-reveal** PDF —
each answer becomes a hidden layer behind a Show / Hide button, so you can quiz
yourself without seeing the answer first. These are **built on demand and not
committed** (they're the same content as the PDFs above, so keeping them in the
repo would just be a second copy); `*_Interactive.pdf` is gitignored.

```bash
# build_interactive.py [source.md] [output.pdf] [title] [answer limit]
python ccna/scripts/build_interactive.py ccna/docs/CCNA_Practice_Questions.md ccna/CCNA_Practice_Questions_Interactive.pdf "CCNA Practice Questions"
python ccna/scripts/build_interactive.py ccna/docs/CCNA_Subnetting_Drills.md ccna/CCNA_Subnetting_Drills_Interactive.pdf "CCNA Subnetting Drills"
```

The buttons need **Adobe Acrobat Reader**; other viewers may only expose the
layers panel.

### Notes for editing

- The markdown sources use **CRLF** line endings — keep them consistent.
- Markdown tables must not have an empty leading header cell (`| | A | B |`);
  xhtml2pdf computes a negative column width and the build fails. Give the
  first column a label instead.
