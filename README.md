# Networking

CCNA study materials — markdown sources plus the PDFs generated from them.

## Layout

```
docs/       Markdown sources (edit these)
pdf/        Generated PDFs (build output, committed for convenience)
scripts/    Build scripts that turn docs/*.md into pdf/*.pdf
fonts/      TrueType fonts used by the builds (not committed — see below)
```

| Document | Source | PDF |
| --- | --- | --- |
| Study Guide | `docs/CCNA_Study_Guide.md` | `pdf/CCNA_Study_Guide.pdf` |
| Practice Questions | `docs/CCNA_Practice_Questions.md` | `pdf/CCNA_Practice_Questions.pdf`, `pdf/CCNA_Practice_Questions_Interactive.pdf` |
| Subnetting Drills | `docs/CCNA_Subnetting_Drills.md` | `pdf/CCNA_Subnetting_Drills.pdf`, `pdf/CCNA_Subnetting_Drills_Interactive.pdf` |

## Building

Requirements: `pip install markdown xhtml2pdf reportlab pymupdf`

Fonts: both scripts expect `fonts/` in the repo root with `segoeui.ttf`,
`segoeuib.ttf`, `consola.ttf`, and `consolab.ttf` (copy them from a Windows
`C:\Windows\Fonts` install). They are not committed for licensing reasons.

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
