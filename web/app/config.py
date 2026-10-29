"""Runtime settings, all from environment variables.

DATABASE_URL   Postgres on Railway (it injects this when a Postgres service is
               linked); defaults to a local SQLite file for development.
APP_PASSWORD   The password that unlocks the site. Unset = no login (local only).
SECRET_KEY     Signs the session cookie. Required whenever APP_PASSWORD is set,
               so sessions survive restarts and redeploys.
CONTENT_PATH   Where build_content.py wrote content.json.
"""
import os

APP_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.dirname(APP_DIR)
REPO_ROOT = os.path.dirname(WEB_DIR)


def _database_url():
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        path = os.path.join(WEB_DIR, "data", "app.db")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        return "sqlite:///" + path
    # Railway and Heroku-style URLs name the scheme "postgres(ql)://"; SQLAlchemy
    # needs the driver spelled out to pick psycopg 3.
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


DATABASE_URL = _database_url()
APP_PASSWORD = os.environ.get("APP_PASSWORD", "")
SECRET_KEY = os.environ.get("SECRET_KEY", "")
if APP_PASSWORD and len(SECRET_KEY) < 32:
    raise RuntimeError("SECRET_KEY must be set (32+ characters) when APP_PASSWORD is set. "
                       "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\"")
if not SECRET_KEY:
    # No password means no login, so the session only carries UI state.
    SECRET_KEY = "local-development-only-" + "0" * 32
AUTH_ENABLED = bool(APP_PASSWORD)
# Behind Railway's HTTPS edge the cookie should never travel over plain HTTP.
SECURE_COOKIES = os.environ.get("SECURE_COOKIES", "1" if os.environ.get("RAILWAY_ENVIRONMENT") else "0") == "1"
SESSION_DAYS = int(os.environ.get("SESSION_DAYS", "30"))
CONTENT_PATH = os.environ.get("CONTENT_PATH", os.path.join(APP_DIR, "data", "content.json"))
TERMINAL_LABS_PATH = os.path.join(APP_DIR, "terminal_labs.json")
MEDIA_DIRS = {
    "ccna": os.path.join(REPO_ROOT, "ccna", "images"),
    "ccnp": os.path.join(REPO_ROOT, "ccnp", "images"),
}
