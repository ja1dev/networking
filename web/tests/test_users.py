"""Accounts: sign-in, admin-only user management and per-user workspaces."""
import pytest
from fastapi.testclient import TestClient

from app import config

ADMIN_PASSWORD = "s3cret-pass"


@pytest.fixture
def auth(client, monkeypatch):
    """Sign-in switched on, with the admin's password set the way startup sets it."""
    from app import main, services
    from app.db import SessionLocal
    from app.models import User
    monkeypatch.setattr(config, "AUTH_ENABLED", True)
    monkeypatch.setattr(config, "APP_PASSWORD", ADMIN_PASSWORD)
    with SessionLocal() as db:
        admin = db.query(User).filter_by(username="admin").one()
        admin.password_hash = None
        db.commit()
        assert services.ensure_admin_password(db, ADMIN_PASSWORD) is True
        assert services.ensure_admin_password(db, "something-else") is False, "only sets an empty password"
    main._failures.clear()
    client.cookies.clear()
    yield
    main._failures.clear()
    client.cookies.clear()


def browser():
    from app.main import app
    c = TestClient(app)
    c.headers.update({"X-Requested-With": "fetch"})
    return c


def sign_in(c, username, password, expect=303):
    r = c.post("/login", data={"username": username, "password": password, "next": "/"},
               follow_redirects=False)
    assert r.status_code == expect, r.text
    return r


def test_login_needs_username_and_password(client, auth):
    r = client.get("/quiz", follow_redirects=False)
    assert r.status_code == 303 and r.headers["location"].startswith("/login?next=/quiz")
    assert client.get("/api/cards/queue").status_code == 401
    assert client.get("/healthz").status_code == 200
    assert 'name="username"' in client.get("/login").text
    sign_in(client, "admin", "wrong", expect=401)
    sign_in(client, "nobody", ADMIN_PASSWORD, expect=401)
    bad = client.post("/login", data={"username": "admin", "password": "nope"})
    assert 'value="admin"' in bad.text, "the username is kept after a failed attempt"
    ok = client.post("/login", data={"username": " Admin ", "password": ADMIN_PASSWORD,
                                     "next": "//evil.example"}, follow_redirects=False)
    assert ok.status_code == 303 and ok.headers["location"] == "/"
    page = client.get("/quiz").text
    assert 'class="who" title="Signed in as admin"' in page
    assert 'href="/users"' in page, "admins see the Users page in the nav"
    client.post("/logout")
    assert client.get("/quiz", follow_redirects=False).status_code == 303


def test_login_lockout(client, auth):
    from app import main
    for _ in range(main.MAX_FAILURES):
        client.post("/login", data={"username": "admin", "password": "nope"})
    r = client.post("/login", data={"username": "admin", "password": ADMIN_PASSWORD})
    assert r.status_code == 429


def test_admin_creates_users_and_workspaces_are_separate(client, auth):
    sign_in(client, "admin", ADMIN_PASSWORD)
    assert client.get("/users").status_code == 200
    r = client.post("/api/users", json={"username": "Alice", "password": "alice-pass-1", "role": "user"})
    assert r.status_code == 200 and r.json()["username"] == "alice" and r.json()["role"] == "user"
    alice_id = r.json()["id"]
    assert "alice" in client.get("/users").text

    # The admin's own progress.
    client.post("/api/questions/ccna-q1/answer", json={"selected": ["A"]})
    admin_quiz = client.post("/api/quiz", json={"source": "bank", "count": 2}).json()["id"]
    client.post("/api/settings", json={"timezone": "Asia/Tokyo"})
    state = {"devices": {"SW1": {"cfg": {"hostname": "ADMIN-SW"}}}}
    client.put("/api/terminal/vlans", json={"state": state, "passing": [0]})

    alice = browser()
    sign_in(alice, "alice", "alice-pass-1")
    # Alice starts empty: none of the admin's answers, quizzes, settings or labs.
    assert alice.get("/api/quiz/%d" % admin_quiz).status_code == 400
    assert alice.get("/quiz/%d" % admin_quiz).status_code == 404
    assert alice.delete("/api/quiz/%d" % admin_quiz).status_code == 400
    assert 'value="Asia/Tokyo"' not in alice.get("/settings").text
    assert "ADMIN-SW" not in alice.get("/terminal/vlans").text
    assert '<script type="application/json" id="term-saved">null</script>' in alice.get("/terminal/vlans").text
    assert 'href="/quiz/%d"' % admin_quiz in client.get("/quiz").text
    assert 'href="/quiz/%d"' % admin_quiz not in alice.get("/quiz").text
    # Her own work is hers.
    alice.post("/api/settings", json={"timezone": "Europe/London"})
    alice_quiz = alice.post("/api/quiz", json={"source": "bank", "count": 1}).json()["id"]
    assert alice.get("/api/quiz/%d" % alice_quiz).status_code == 200
    assert client.get("/api/quiz/%d" % alice_quiz).status_code == 400
    assert 'value="Europe/London"' not in client.get("/settings").text
    assert 'value="Asia/Tokyo"' in client.get("/settings").text
    q = alice.post("/api/questions/ccna-q68/answer", json={"selected": ["A", "C"]}).json()
    assert q["correct"] is True
    alice.put("/api/terminal/vlans", json={"state": {"devices": {"SW1": {"cfg": {"hostname": "ALICE"}}}},
                                           "passing": []})
    assert "ALICE" in alice.get("/terminal/vlans").text
    assert "ALICE" not in client.get("/terminal/vlans").text

    # Users can't manage accounts.
    page = alice.get("/").text
    assert 'href="/users"' not in page
    assert alice.get("/users").status_code == 404
    assert alice.post("/api/users", json={"username": "mallory", "password": "x" * 10}).status_code == 404
    assert alice.delete("/api/users/%d" % alice_id).status_code == 404
    assert alice.put("/api/users/%d/role" % alice_id, json={"role": "admin"}).status_code == 404

    # Admin resets Alice's password: her existing session ends, the new password works.
    assert client.put("/api/users/%d/password" % alice_id, json={"password": "short"}).status_code == 400
    assert client.put("/api/users/%d/password" % alice_id, json={"password": "alice-pass-2"}).json()["ok"]
    assert alice.get("/api/cards/queue").status_code == 401
    sign_in(alice, "alice", "alice-pass-1", expect=401)
    sign_in(alice, "alice", "alice-pass-2")
    assert alice.get("/api/quiz/%d" % alice_quiz).status_code == 200, "her progress survives the reset"

    # Promote her: she can now manage users too.
    assert client.put("/api/users/%d/role" % alice_id, json={"role": "admin"}).json()["role"] == "admin"
    assert alice.get("/users").status_code == 200
    assert client.put("/api/users/%d/role" % alice_id, json={"role": "user"}).json()["role"] == "user"
    assert alice.get("/users").status_code == 404

    # Deleting her removes her and everything she owned.
    from app.db import SessionLocal
    from app.models import QuestionAttempt, QuizSession, Setting, TerminalProgress
    assert client.delete("/api/users/%d" % alice_id).json()["ok"]
    assert alice.get("/api/cards/queue").status_code == 401
    with SessionLocal() as db:
        for model in (QuestionAttempt, QuizSession, Setting, TerminalProgress):
            assert db.query(model).filter_by(user_id=alice_id).count() == 0, model.__name__
        assert db.query(QuizSession).filter_by(id=admin_quiz).count() == 1, "the admin's data stays"
    assert client.get("/api/quiz/%d" % admin_quiz).status_code == 200


def test_user_validation(client, auth):
    sign_in(client, "admin", ADMIN_PASSWORD)
    me = client.get("/users").text
    assert "Add user" in me
    for body, msg in [({"username": "ab", "password": "long-enough"}, "3 to 32"),
                      ({"username": "has space", "password": "long-enough"}, "3 to 32"),
                      ({"username": "bob", "password": "short"}, "8 to 128"),
                      ({"username": "bob", "password": "long-enough", "role": "owner"}, "unknown role")]:
        r = client.post("/api/users", json=body)
        assert r.status_code == 400 and msg in r.json()["error"], (body, r.json())
    assert client.post("/api/users", json={"username": "bob", "password": "long-enough"}).status_code == 200
    dup = client.post("/api/users", json={"username": "BOB", "password": "long-enough"})
    assert dup.status_code == 400 and "already" in dup.json()["error"]

    from app.db import SessionLocal
    from app.models import User
    with SessionLocal() as db:
        admin_id = db.query(User).filter_by(username="admin").one().id
        bob_id = db.query(User).filter_by(username="bob").one().id
    assert "delete your own" in client.delete("/api/users/%d" % admin_id).json()["error"]
    assert "own role" in client.put("/api/users/%d/role" % admin_id, json={"role": "user"}).json()["error"]
    assert client.delete("/api/users/99999").status_code == 400
    assert client.delete("/api/users/%d" % bob_id).json()["ok"]


def test_change_own_password_keeps_this_session(client, auth):
    sign_in(client, "admin", ADMIN_PASSWORD)
    other = browser()
    sign_in(other, "admin", ADMIN_PASSWORD)
    r = client.put("/api/account/password", json={"current": "wrong-one", "password": "brand-new-pass"})
    assert r.status_code == 400 and "current password" in r.json()["error"]
    assert client.put("/api/account/password", json={"current": ADMIN_PASSWORD,
                                                     "password": "brand-new-pass"}).json()["ok"]
    assert client.get("/api/cards/queue").status_code == 200, "this session stays signed in"
    assert other.get("/api/cards/queue").status_code == 401, "other sessions end"
    sign_in(other, "admin", "brand-new-pass")
    # APP_PASSWORD no longer overrides a password the admin chose.
    from app import services
    from app.db import SessionLocal
    with SessionLocal() as db:
        assert services.ensure_admin_password(db, ADMIN_PASSWORD) is False


def test_old_shared_password_sessions_are_signed_out(client, auth):
    # A cookie from before accounts existed only carried {"auth": true}.
    from itsdangerous import TimestampSigner
    import base64
    import json
    signer = TimestampSigner(config.SECRET_KEY)
    legacy = signer.sign(base64.b64encode(json.dumps({"auth": True}).encode())).decode()
    client.cookies.set("netlab", legacy)
    assert client.get("/", follow_redirects=False).status_code == 303
