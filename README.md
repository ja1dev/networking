# Networking

CCNA study materials — markdown sources plus the PDFs generated from them.

## Layout

```
docs/       Markdown sources (edit these)
pdf/        Generated PDFs (build output, committed for convenience)
scripts/    Build scripts that turn docs/*.md into pdf/*.pdf
fonts/      TrueType fonts used by the builds
```

| Document | Source | PDF | Size |
| --- | --- | --- | --- |
| Study Guide | `docs/CCNA_Study_Guide.md` | `pdf/CCNA_Study_Guide.pdf` | 24 chapters, ~110 pages |
| Practice Questions | `docs/CCNA_Practice_Questions.md` | `pdf/CCNA_Practice_Questions.pdf`, `pdf/CCNA_Practice_Questions_Interactive.pdf` | 142 questions |
| Subnetting Drills | `docs/CCNA_Subnetting_Drills.md` | `pdf/CCNA_Subnetting_Drills.pdf`, `pdf/CCNA_Subnetting_Drills_Interactive.pdf` | 60 drills |

The study guide's final appendix maps every topic in the official
**CCNA 200-301 (v1.1)** blueprint to the section that covers it — useful as a
pre-exam checklist.

## Building

Requirements: `pip install markdown xhtml2pdf reportlab pymupdf`

Fonts: everything needed is committed in `fonts/` (DejaVu Sans and DejaVu Sans
Mono, redistributable under the Bitstream Vera license — see
`fonts/LICENSE.txt`), so the builds work out of the box on any platform.

Both scripts *prefer* Segoe UI and Consolas if you drop `segoeui.ttf`,
`segoeuib.ttf`, `consola.ttf`, and `consolab.ttf` into `fonts/` — those are the
fonts the original PDFs were built with, but they're Windows-only and can't be
redistributed, so DejaVu is the committed fallback.

Standard PDF — `scripts/build_pdf.py [source.md] [output.pdf] [footer title]`:

```bash
python scripts/build_pdf.py docs/CCNA_Study_Guide.md pdf/CCNA_Study_Guide.pdf "CCNA Study Guide"
python scripts/build_pdf.py docs/CCNA_Practice_Questions.md pdf/CCNA_Practice_Questions.pdf "CCNA Practice Questions"
python scripts/build_pdf.py docs/CCNA_Subnetting_Drills.md pdf/CCNA_Subnetting_Drills.pdf "CCNA Subnetting Drills"
```

Interactive tap-to-reveal PDF — `scripts/build_interactive.py [source.md] [output.pdf] [title] [answer limit]`.
Each `<details>` answer block becomes a hidden PDF layer with a Show / Hide
button (requires Adobe Acrobat Reader):

```bash
python scripts/build_interactive.py docs/CCNA_Practice_Questions.md pdf/CCNA_Practice_Questions_Interactive.pdf "CCNA Practice Questions"
python scripts/build_interactive.py docs/CCNA_Subnetting_Drills.md pdf/CCNA_Subnetting_Drills_Interactive.pdf "CCNA Subnetting Drills"
```

Run with no arguments and each script defaults to the study guide / practice
questions respectively, resolving paths relative to the repo root.
