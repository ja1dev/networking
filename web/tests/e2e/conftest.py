"""Browser end-to-end suite: a real server, a real Chrome, real clicks.

Opt-in so the unit suite stays fast:
    cd web && .venv/bin/python -m pytest tests/e2e -m e2e -q     (or E2E=1)
"""
import json
import os
import re
import secrets
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

from e2e_helpers import FETCH, WEB, login_ok

HERE = Path(__file__).resolve().parent


# ---------------------------------------------------------------- opt-in
def pytest_configure(config):
    config.addinivalue_line("markers", "e2e: browser end-to-end tests (run with -m e2e or E2E=1)")
    config.addinivalue_line("markers", "allow_console(*patterns): console errors (regexes) this test causes on purpose")


def _enabled(config) -> bool:
    return os.environ.get("E2E") == "1" or "e2e" in (config.getoption("markexpr") or "")


def pytest_collection_modifyitems(config, items):
    if _enabled(config):
        return
    skip = pytest.mark.skip(reason="browser e2e suite: run with -m e2e or E2E=1")
    for item in items:
        if HERE in Path(str(item.fspath)).parents:
            item.add_marker(skip)


# ---------------------------------------------------------------- the server
@dataclass
class Server:
    base: str
    admin_password: str
    proc: subprocess.Popen = field(repr=False)
    log: Path = field(repr=False)

    def stop(self):
        self.proc.terminate()
        try:
            self.proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.proc.kill()


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _env(tmp: Path, content: Path, password: str) -> dict:
    env = dict(os.environ)
    env.pop("TEST_DATABASE_URL", None)
    env.pop("RAILWAY_ENVIRONMENT", None)
    env.update(DATABASE_URL="sqlite:///" + str(tmp / "app.db"), CONTENT_PATH=str(content),
               APP_PASSWORD=password, SECRET_KEY=secrets.token_hex(32), PYTHONUNBUFFERED="1")
    return env


def start_server(content: Path) -> Server:
    """A fresh migrated database and a uvicorn on a free port."""
    tmp = Path(tempfile.mkdtemp(prefix="netlab-e2e-"))
    password = "e2e-" + secrets.token_hex(8)
    env = _env(tmp, content, password)
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=WEB, env=env,
                   check=True, capture_output=True)
    port = _free_port()
    log = tmp / "server.log"
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1",
                             "--port", str(port)], cwd=WEB, env=env,
                            stdout=open(log, "w"), stderr=subprocess.STDOUT)
    base = "http://127.0.0.1:%d" % port
    deadline = time.time() + 30
    while time.time() < deadline:
        if proc.poll() is not None:
            raise RuntimeError("server exited:\n" + log.read_text())
        try:
            with urllib.request.urlopen(base + "/healthz", timeout=1) as r:
                if r.status == 200:
                    return Server(base, password, proc, log)
        except OSError:
            time.sleep(0.2)
    proc.kill()
    raise RuntimeError("server didn't come up:\n" + log.read_text())


@pytest.fixture(scope="session")
def content_file():
    tmp = Path(tempfile.mkdtemp(prefix="netlab-e2e-content-"))
    path = tmp / "content.json"
    subprocess.run([sys.executable, "-c",
                    "import json, sys; from app import build_content; "
                    "json.dump(build_content.build(), open(sys.argv[1], 'w'))", str(path)],
                   cwd=WEB, check=True)
    yield path
    shutil.rmtree(tmp, ignore_errors=True)


@pytest.fixture(scope="session")
def server(content_file):
    s = start_server(content_file)
    yield s
    s.stop()


@pytest.fixture
def fresh_server(content_file):
    """A server of its own, for tests that leave state behind (like a locked-out IP)."""
    s = start_server(content_file)
    yield s
    s.stop()


# ---------------------------------------------------------------- the browser
@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=True)
        yield b
        b.close()


class ConsoleGuard:
    """Collects console errors and page errors; the test fails on any it didn't expect."""

    def __init__(self, allowed):
        self.allowed = [re.compile(a) for a in allowed]
        self.errors = []

    def allow(self, *patterns):
        self.allowed += [re.compile(p) for p in patterns]

    def watch(self, page):
        page.on("console", lambda m: m.type == "error" and self.errors.append((page.url, m.text)))
        page.on("pageerror", lambda e: self.errors.append((page.url, str(e))))
        return page

    def unexpected(self):
        return [(u, t) for u, t in self.errors if not any(a.search(t) for a in self.allowed)]


@pytest.fixture
def console(request):
    mark = request.node.get_closest_marker("allow_console")
    guard = ConsoleGuard(mark.args if mark else ())
    yield guard
    bad = guard.unexpected()
    if bad:
        pytest.fail("unexpected console errors:\n" + "\n".join("  %s: %s" % e for e in bad))


@pytest.fixture
def contexts(browser):
    """Make browser contexts that close when the test ends."""
    made = []

    def make(theme=None, **kw):
        kw.setdefault("viewport", {"width": 1440, "height": 950})
        ctx = browser.new_context(**kw)
        if theme:
            # base.html applies the saved theme before first paint.
            ctx.add_init_script("try { localStorage.setItem('netlab-theme', %s) } catch (e) {}" % json.dumps(theme))
        made.append(ctx)
        return ctx

    yield make
    for ctx in made:
        ctx.close()


@pytest.fixture(scope="session")
def admin_state(browser, server):
    """The admin's signed-in cookies, captured once."""
    ctx = browser.new_context()
    page = ctx.new_page()
    login_ok(page, server.base, "admin", server.admin_password)
    # With a timezone saved, the dashboard won't reload itself on first visit to set one.
    assert ctx.request.post(server.base + "/api/settings", headers=FETCH, data={"timezone": "UTC"}).ok
    state = ctx.storage_state()
    ctx.close()
    return state


@pytest.fixture
def admin_page(contexts, admin_state, console):
    return console.watch(contexts(storage_state=admin_state).new_page())


@pytest.fixture
def make_user(browser, server, admin_state):
    """Create an account through the admin API; returns (username, password, id)."""
    ctx = browser.new_context(storage_state=admin_state)

    def make(role="user"):
        name = "u" + secrets.token_hex(5)
        password = "pw-" + secrets.token_hex(8)
        r = ctx.request.post(server.base + "/api/users", headers=FETCH,
                             data={"username": name, "password": password, "role": role})
        assert r.ok, r.text()
        return name, password, r.json()["id"]

    yield make
    ctx.close()


@pytest.fixture
def user_page(contexts, make_user, server, console):
    """A brand-new user, signed in, with an empty workspace."""
    name, password, _ = make_user()
    page = console.watch(contexts().new_page())
    login_ok(page, server.base, name, password)
    page.user = (name, password)
    return page


@pytest.fixture(scope="session")
def lab_user_state(browser, server, admin_state):
    """One account for the terminal-lab runs, so they don't touch the admin's labs."""
    ctx = browser.new_context(storage_state=admin_state)
    name, password = "labs" + secrets.token_hex(4), "pw-" + secrets.token_hex(8)
    r = ctx.request.post(server.base + "/api/users", headers=FETCH,
                         data={"username": name, "password": password, "role": "user"})
    assert r.ok, r.text()
    ctx.close()
    ctx = browser.new_context()
    page = ctx.new_page()
    login_ok(page, server.base, name, password)
    state = ctx.storage_state()
    ctx.close()
    return state
