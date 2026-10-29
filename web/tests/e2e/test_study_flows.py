"""Smoke flows through the study tools: reader, quiz, flashcards, subnetting, workbook labs."""
import ipaddress
import re

import pytest
from playwright.sync_api import expect

from e2e_helpers import TOAST

pytestmark = pytest.mark.e2e


def test_reader_question_and_page_progress(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/1-3")
    box = page.locator(".mcq").first
    box.scroll_into_view_if_needed()
    expect(box.locator(".mcq-check")).to_be_disabled()
    box.locator(".mcq-opt").first.click()
    box.locator(".mcq-check").click()
    status = box.locator(".mcq-status")
    expect(status).not_to_be_empty()
    expect(box.locator(".mcq-explain")).to_be_visible()
    if status.inner_text().strip() != "Correct":
        # "Answer: C" (or "Answer: A, C"): retry with the right letters.
        letters = re.findall(r"[A-F]", status.inner_text().split("Answer:")[1])
        box.locator(".mcq-retry").click()
        for letter in letters:
            box.locator('.mcq-opt[data-letter="%s"]' % letter).click()
        box.locator(".mcq-check").click()
        expect(status).to_have_text("Correct")
    page.check("#page-done")
    expect(page.locator(TOAST)).to_contain_text("Marked as done")
    page.reload()
    expect(page.locator("#page-done")).to_be_checked()


def test_practice_quiz_start_to_results(user_page, server):
    page = user_page
    page.goto(server.base + "/quiz")
    page.select_option("#count", "10")
    page.click("#quiz-form button[type=submit]")
    expect(page).to_have_url(re.compile(r"/quiz/\d+$"))
    for i in range(10):
        page.wait_for_selector(".mcq")
        mcq = page.locator(".mcq").first
        need = int(mcq.get_attribute("data-multi") or 1)
        for key in "abcde"[:need]:
            page.keyboard.press(key)
        page.keyboard.press("Enter")
        expect(page.locator(".mcq-explain")).to_be_visible()
        if i < 9:
            page.keyboard.press("Enter")
    page.get_by_text("See results").click()
    expect(page.locator(".score-ring")).to_be_visible()


def test_flashcard_flip_and_rate(user_page, server):
    page = user_page
    page.goto(server.base + "/cards/study?deck=ospf")
    expect(page.locator(".flashcard")).to_be_visible()
    page.keyboard.press("Space")
    expect(page.locator(".flashcard .back")).to_be_visible()
    page.keyboard.press("3")
    page.wait_for_timeout(500)
    page.goto(server.base + "/cards/browse?deck=ospf")
    expect(page.locator("body")).to_contain_text(re.compile(r"learning|review|due", re.I))


def test_subnetting_trainer(user_page, server):
    page = user_page
    page.goto(server.base + "/subnetting")
    page.locator(".reveal > summary", has_text="Problem types").click()
    for label in page.locator(".kind-list label").all():
        inp = label.locator("input")
        if inp.is_checked() != (inp.get_attribute("value") == "network"):
            label.click()
    for _ in range(2):
        m = re.search(r"(\d+\.\d+\.\d+\.\d+)/(\d+)", page.locator(".problem").inner_text())
        net = ipaddress.ip_network("%s/%s" % m.groups(), strict=False)
        page.fill('[data-field="net"]', str(net.network_address))
        page.fill('[data-field="bc"]', str(net.broadcast_address))
        page.keyboard.press("Enter")
        expect(page.locator("#work")).to_contain_text("Correct")
        page.keyboard.press("Enter")
    expect(page.locator("#session-stats")).to_contain_text("2/2")
    page.fill("#calc-input", "172.16.45.200/20")
    expect(page.locator("#calc-out")).to_contain_text("172.16.47.255")
    page.evaluate("try { localStorage.removeItem('netlab-subnet-prefs') } catch (e) {}")


def test_workbook_lab_checklist_persists(user_page, server):
    page = user_page
    page.goto(server.base + "/labs/lab5")
    boxes = page.locator("[data-item]")
    boxes.nth(0).check()
    boxes.nth(1).check()
    expect(page.locator("#lab-count")).to_have_text("2")
    page.wait_for_timeout(300)
    page.reload()
    expect(page.locator("[data-item]").nth(1)).to_be_checked()
