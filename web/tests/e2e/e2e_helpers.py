"""Selectors and page actions shared by the e2e tests.

Everything that depends on the page markup lives here, so a template change means
one edit in this file rather than a hunt through every test.
"""
import json
import re
from pathlib import Path

from playwright.sync_api import Page, expect

WEB = Path(__file__).resolve().parents[2]
LABS_FILE = WEB / "app" / "terminal_labs.json"
FETCH = {"X-Requested-With": "fetch"}

# ---------------------------------------------------------------- selectors
LOGIN_USER, LOGIN_PASS, SUBMIT = "#username", "#password", "button[type=submit]"
LOGIN_ERROR = ".error-msg"
TOAST, TOAST_ERROR = ".toast", ".toast.error"
NAV_USERS = 'a[href="/users"]'  # may appear more than once (sidebar and menu): use .first
LOGOUT = 'form[action="/logout"] button'
ACCOUNT_MENU = '[aria-label="Account menu"]'  # the account menu that holds Sign out
THEME_TOGGLE = "[data-theme-toggle]"

# Users page
NEW_USER, NEW_NAME, NEW_PASS, NEW_ROLE = "#new-user", "#nu-name", "#nu-pass", "#nu-role"
USER_ROWS = "#user-rows tr"
PW_FORM = ".pw-form"

# Settings page
PW_FORM_SELF, PW_CURRENT, PW_NEW = "#password-form", "#pw-current", "#pw-new"

# Terminal
TERM_IN, TERM_OUT, TERM_PROMPT = "#term-input", "#term-out", "#term-prompt"
TERM_SCORE, TERM_RESET, TERM_DONE = "#term-score", "#term-reset", "#term-done"
TOPO_LINK = "#topo .topo-link"
TASK = ".task"


def user_row(name: str) -> str:
    return '#user-rows tr[data-name="%s"]' % name


def console_tab(dev: str) -> str:
    return ".console-tab[data-dev='%s']" % dev


def term_key(key: str) -> str:
    return "[data-key='%s']" % key


# ---------------------------------------------------------------- data
def terminal_labs(graded_only=True) -> list:
    labs = json.loads(LABS_FILE.read_text(encoding="utf-8"))
    return [l for l in labs if l["tasks"] or not graded_only]


# ---------------------------------------------------------------- actions
def login(page: Page, base: str, username: str, password: str, next_path: str = "/"):
    page.goto(base + "/login?next=" + next_path)
    page.fill(LOGIN_USER, username)
    page.fill(LOGIN_PASS, password)
    page.click(SUBMIT)


def login_ok(page: Page, base: str, username: str, password: str, next_path: str = "/settings"):
    # Not the dashboard by default: on a first visit it saves the device's timezone and reloads
    # itself, which would abort whatever navigation the test does next.
    login(page, base, username, password, next_path)
    expect(page).to_have_url(base + next_path)


def sign_out(page: Page):
    button = page.locator(LOGOUT).first
    if not button.is_visible() and page.locator(ACCOUNT_MENU).count():
        page.locator(ACCOUNT_MENU).first.click()
    button.click()


def no_overflow(page: Page) -> int:
    """Pixels the page scrolls sideways (0 or 1 is fine: sub-pixel rounding)."""
    return page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")


def reset_lab(page: Page, base: str, lab_id: str):
    r = page.request.delete(base + "/api/terminal/" + lab_id, headers=FETCH)
    assert r.ok, r.status


def cmd(page: Page, text: str):
    inp = page.locator(TERM_IN)
    inp.fill(text)
    inp.press("Enter")


def prompt_text(page: Page) -> str:
    return page.locator(TERM_PROMPT).inner_text()


CONFIG_PROMPT = re.compile(r"\([a-z0-9-]*\)#$")


def type_solution(page: Page, lab: dict):
    """Type the lab's published solution at each console, the way a student would."""
    types = {d["name"]: d["type"] for d in lab["devices"]}
    for dev, lines in lab["solution"].items():
        page.locator(console_tab(dev)).click()
        if types[dev] != "pc":
            # Solutions start in global configuration mode.
            cmd(page, "")
            if prompt_text(page).endswith(">"):
                cmd(page, "enable")
            if not CONFIG_PROMPT.search(prompt_text(page)):
                cmd(page, "configure terminal")
        for line in lines:
            cmd(page, line)
        if types[dev] != "pc" and CONFIG_PROMPT.search(prompt_text(page)):
            cmd(page, "end")


def score_text(done: int, total: int) -> str:
    return "%d / %d tasks" % (done, total)
