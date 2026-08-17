# Networking

A complete, self-contained study kit for the **Cisco CCNA 200-301 (v1.1)** exam:
three documents that work together, plus the scripts that build them into PDFs.

## The three documents

| Document | What it's for | Size |
| --- | --- | --- |
| **Study Guide** | Teaches every exam topic from scratch, in plain language with diagrams, worked configs and the reasoning behind each concept | 24 chapters, ~113 pages |
| **Practice Question Bank** | Tests it — exam-style questions grouped by the official domains, each with a full explanation of why the right answer is right *and* why the traps are wrong | 140 questions |
| **Subnetting Drill Sheet** | Builds the one skill that has to be *fast*, not just correct | 60 worked problems |

They cross-reference each other: the guide points at the drills for subnetting
practice and at the question bank per domain, the drills point back at Chapters
11–13 for the theory, and the question bank points at the guide's **Blueprint
Coverage Map** appendix — a table mapping every official exam topic to the
section that covers it, so a missed question leads straight to the right page.

Chapter 24 ties all three together with two schedules — an 8-week plan and a
14-day sprint — mapping each day to chapters, drills and question-bank domains.

## Layout

```
ccna/
  docs/       Markdown sources (edit these)
  pdf/        Generated PDFs (build output, committed for convenience)
  scripts/    Build scripts that turn docs/*.md into pdf/*.pdf
  fonts/      TrueType fonts used by the builds
```

Everything lives under `ccna/`. The markdown in `ccna/docs/` is the single
source of truth — the PDFs in `ccna/pdf/` are generated from it, so edit the
markdown and rebuild rather than editing a PDF.

One source, one PDF, no extra copies:

| Source (edit) | PDF (read) |
| --- | --- |
| `ccna/docs/CCNA_Study_Guide.md` | `ccna/pdf/CCNA_Study_Guide.pdf` |
| `ccna/docs/CCNA_Practice_Questions.md` | `ccna/pdf/CCNA_Practice_Questions.pdf` |
| `ccna/docs/CCNA_Subnetting_Drills.md` | `ccna/pdf/CCNA_Subnetting_Drills.pdf` |

## Building

Requirements: `pip install markdown xhtml2pdf reportlab pymupdf`

Fonts: everything needed is committed in `ccna/fonts/` (DejaVu Sans and DejaVu Sans
Mono, redistributable under the Bitstream Vera license — see
`ccna/fonts/LICENSE.txt`), so the builds work out of the box on any platform.

Both scripts *prefer* Segoe UI and Consolas if you drop `segoeui.ttf`,
`segoeuib.ttf`, `consola.ttf`, and `consolab.ttf` into `ccna/fonts/` — those are the
fonts the original PDFs were built with, but they're Windows-only and can't be
redistributed, so DejaVu is the committed fallback.

Rebuild everything after editing the markdown:

```bash
# Standard PDFs — build_pdf.py [source.md] [output.pdf] [footer title]
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Study_Guide.md ccna/pdf/CCNA_Study_Guide.pdf "CCNA Study Guide"
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Practice_Questions.md ccna/pdf/CCNA_Practice_Questions.pdf "CCNA Practice Questions"
python ccna/scripts/build_pdf.py ccna/docs/CCNA_Subnetting_Drills.md ccna/pdf/CCNA_Subnetting_Drills.pdf "CCNA Subnetting Drills"

```

Run the script with no arguments and it defaults to the study guide. Paths
resolve against `ccna/` (derived from the script's own location), so the
commands work from any working directory.

### Optional: self-testing quiz PDFs

`build_interactive.py` turns either Q&A document into a **tap-to-reveal** PDF —
each answer becomes a hidden layer behind a Show / Hide button, so you can quiz
yourself without seeing the answer first. These are **built on demand and not
committed** (they're the same content as the PDFs above, so keeping them in the
repo would just be a second copy); `*_Interactive.pdf` is gitignored.

```bash
# build_interactive.py [source.md] [output.pdf] [title] [answer limit]
python ccna/scripts/build_interactive.py ccna/docs/CCNA_Practice_Questions.md ccna/pdf/CCNA_Practice_Questions_Interactive.pdf "CCNA Practice Questions"
python ccna/scripts/build_interactive.py ccna/docs/CCNA_Subnetting_Drills.md ccna/pdf/CCNA_Subnetting_Drills_Interactive.pdf "CCNA Subnetting Drills"
```

The buttons need **Adobe Acrobat Reader**; other viewers may only expose the
layers panel.

### Notes for editing

- The markdown sources use **CRLF** line endings — keep them consistent.
- Markdown tables must not have an empty leading header cell (`| | A | B |`);
  xhtml2pdf computes a negative column width and the build fails. Give the
  first column a label instead.
