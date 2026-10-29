# Browser end-to-end tests

These tests drive the real app in the installed Chrome (headless, via Playwright). They're
opt-in, so the plain `pytest -q` run stays fast and skips them.

```bash
cd web
.venv/bin/python -m pytest tests/e2e -m e2e -q        # or: E2E=1 .venv/bin/python -m pytest tests/e2e -q
.venv/bin/python -m pytest tests/e2e -m e2e -q -k ospf  # one terminal lab
```

Requirements: `requirements-dev.txt` installed in `web/.venv` (it brings Playwright) and Google
Chrome on the machine (`channel="chrome"`). Nothing else: no Docker, no running server.

## What happens

The session starts its own server: it builds `content.json` from the markdown, migrates a
throwaway SQLite database with `alembic upgrade head`, and runs uvicorn on a free port with a
generated `APP_PASSWORD` and `SECRET_KEY`. Sign-in is on, so every test signs in for real. The
lockout test gets a second server of its own, because a locked-out IP would block the rest.

| File | Covers |
| --- | --- |
| `test_accounts.py` | sign-in errors, lockout, adding/promoting/deleting users, password resets signing people out, changing your own password, separate workspaces |
| `test_terminal_labs.py` | every graded lab in `app/terminal_labs.json` (read at run time, so new labs are covered automatically): its published solution is typed at the consoles and must pass every task, survive a reload, and the diagram must draw every cable; plus lab reset |
| `test_cli_ux.py` | `?` on partial words and at the end of a line, Tab, history, Ctrl+Z, IOS error messages, the on-screen keys on a phone |
| `test_study_flows.py` | reader question and page progress, a practice quiz to results, a flashcard review, the subnetting trainer, a workbook checklist |
| `test_layout.py` | every main page at 390px and 1440px, light and dark: none may scroll sideways |

Every test fails on unexpected browser console errors or page errors. A test that causes an
error on purpose (a wrong password answers 401) lists it with `@pytest.mark.allow_console(regex)`.

## When the markup changes

Selectors and page actions live in `e2e_helpers.py`. Update them there rather than in the tests.
