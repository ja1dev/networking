"""No main page scrolls sideways, at phone and desktop width, in light and dark themes."""
import pytest

from e2e_helpers import no_overflow

pytestmark = pytest.mark.e2e

PAGES = ["/", "/read", "/read/ccna", "/read/ccnp", "/read/ccnp/1-3", "/quiz", "/cards", "/cards/browse",
         "/cards/study", "/subnetting", "/subnetting/drills", "/subnetting/toolkit", "/labs", "/labs/lab5",
         "/terminal", "/terminal/ospf", "/terminal/sandbox", "/search?q=native+vlan", "/settings", "/users"]


@pytest.mark.parametrize("theme", ["light", "dark"])
@pytest.mark.parametrize("width", [390, 1440])
def test_no_horizontal_scroll(width, theme, contexts, admin_state, server, console):
    phone = width < 600
    ctx = contexts(theme=theme, storage_state=admin_state, viewport={"width": width, "height": 900},
                   is_mobile=phone, has_touch=phone)
    page = console.watch(ctx.new_page())
    wide = []
    for path in PAGES:
        r = page.goto(server.base + path)
        assert r.status == 200, (path, r.status)
        assert page.evaluate("document.documentElement.dataset.theme") == theme
        over = no_overflow(page)
        if over > 1:
            wide.append((path, over))
    assert not wide, "pages scroll sideways (path, px): %s" % wide
