import json
import os
import tempfile
from pathlib import Path

import pytest

E2E_DIR = Path(__file__).resolve().parent / "e2e"


def pytest_ignore_collect(collection_path, config):
    # The browser suite needs Playwright and Chrome; skip its directory entirely unless asked for,
    # so the unit suite runs anywhere (the Docker image has neither).
    if collection_path == E2E_DIR or E2E_DIR in collection_path.parents:
        wanted = os.environ.get("E2E") == "1" or "e2e" in (config.getoption("markexpr") or "")
        return None if wanted else True
    return None

# Point the app at a throwaway database and content file before it's imported.
_tmp = tempfile.mkdtemp(prefix="netlab-test-")
# TEST_DATABASE_URL runs the suite against a real Postgres (e.g. inside docker compose).
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL") or "sqlite:///" + os.path.join(_tmp, "test.db")
os.environ["CONTENT_PATH"] = os.path.join(_tmp, "content.json")
os.environ.pop("APP_PASSWORD", None)

from app import build_content  # noqa: E402

CONTENT = build_content.build()
with open(os.environ["CONTENT_PATH"], "w", encoding="utf-8") as f:
    json.dump(CONTENT, f)


@pytest.fixture(scope="session")
def content():
    return CONTENT


@pytest.fixture(scope="session")
def client():
    from alembic import command
    from alembic.config import Config
    from fastapi.testclient import TestClient

    cfg = Config(os.path.join(os.path.dirname(os.path.dirname(__file__)), "alembic.ini"))
    command.upgrade(cfg, "head")
    from app.main import app

    with TestClient(app) as c:
        c.headers.update({"X-Requested-With": "fetch"})
        yield c
