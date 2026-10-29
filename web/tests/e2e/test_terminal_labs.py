"""Every graded terminal lab, solved through the real page by typing its published solution."""
import re

import pytest
from playwright.sync_api import expect

from e2e_helpers import (TERM_DONE, TERM_OUT, TERM_SCORE, TOPO_LINK, console_tab, reset_lab, score_text,
                         terminal_labs, type_solution)

pytestmark = pytest.mark.e2e

LABS = terminal_labs()


@pytest.mark.parametrize("lab", LABS, ids=[l["id"] for l in LABS])
def test_published_solution_passes_every_task(lab, contexts, lab_user_state, server, console):
    page = console.watch(contexts(storage_state=lab_user_state).new_page())
    reset_lab(page, server.base, lab["id"])
    page.goto(server.base + "/terminal/" + lab["id"])
    total = len(lab["tasks"])
    expect(page.locator(TERM_SCORE)).to_have_text(score_text(0, total))
    expect(page.locator(TOPO_LINK)).to_have_count(len(lab["links"]))

    type_solution(page, lab)

    try:
        expect(page.locator(TERM_SCORE)).to_have_text(score_text(total, total), timeout=10_000)
    except AssertionError:
        failing = page.locator(".task:not(.pass) .task-title").all_inner_texts()
        raise AssertionError("%s: tasks still failing after the solution: %s" % (lab["id"], failing))
    expect(page.locator(TERM_DONE)).to_be_visible()

    page.wait_for_timeout(1500)  # the debounced save
    page.reload()
    expect(page.locator(TERM_SCORE)).to_have_text(score_text(total, total))
    # Consoles that were used show their history again; open one the solution typed into.
    page.locator(console_tab(next(iter(lab["solution"])))).click()
    expect(page.locator(TERM_OUT)).to_contain_text("[console reconnected]")
    expect(page.locator(TOPO_LINK)).to_have_count(len(lab["links"]))


def test_reset_returns_to_the_starting_network(contexts, lab_user_state, server, console):
    lab = next(l for l in LABS if l["id"] == "first-lan")
    page = console.watch(contexts(storage_state=lab_user_state).new_page())
    reset_lab(page, server.base, lab["id"])
    page.goto(server.base + "/terminal/first-lan")
    type_solution(page, lab)
    total = len(lab["tasks"])
    expect(page.locator(TERM_SCORE)).to_have_text(score_text(total, total))
    page.wait_for_timeout(1500)
    reset = page.locator("#term-reset")
    reset.click()
    expect(reset).to_contain_text("Click again")
    reset.click()
    page.wait_for_load_state("load")
    expect(page.locator(TERM_SCORE)).to_have_text(score_text(0, total))
    expect(page.locator(TERM_OUT)).not_to_contain_text("console reconnected")
    page.goto(server.base + "/terminal")
    expect(page.get_by_role("link", name=re.compile(lab["title"]))).to_contain_text("done")
