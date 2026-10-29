"""Sign-in, user management and per-user workspaces."""
import re

import pytest
from playwright.sync_api import expect

from e2e_helpers import (FETCH, LOGIN_ERROR, LOGIN_PASS, LOGIN_USER, NAV_USERS, NEW_NAME, NEW_PASS,
                         NEW_ROLE, NEW_USER, PW_CURRENT, PW_FORM, PW_FORM_SELF, PW_NEW, SUBMIT, TERM_OUT,
                         TERM_PROMPT, TOAST, TOAST_ERROR, USER_ROWS, cmd, login, login_ok, reset_lab, sign_out,
                         user_row)

pytestmark = pytest.mark.e2e
UNAUTHORIZED = r"status of 401"


@pytest.mark.allow_console(UNAUTHORIZED)
def test_sign_in_errors_keep_the_username(contexts, server, console):
    page = console.watch(contexts().new_page())
    page.goto(server.base + "/quiz")
    expect(page).to_have_url(re.compile(r"/login\?next=/quiz$"))
    expect(page.locator(LOGIN_USER)).to_be_focused()
    login(page, server.base, "admin", "not-the-password", "/quiz")
    expect(page.locator(LOGIN_ERROR)).to_contain_text("don't match")
    expect(page.locator(LOGIN_USER)).to_have_value("admin")
    login(page, server.base, "nobody-here", server.admin_password, "/quiz")
    expect(page.locator(LOGIN_ERROR)).to_be_visible()
    page.fill(LOGIN_USER, " Admin ")
    page.fill(LOGIN_PASS, server.admin_password)
    page.click(SUBMIT)
    expect(page).to_have_url(server.base + "/quiz")
    expect(page.locator(NAV_USERS).first).to_be_visible()
    sign_out(page)
    expect(page).to_have_url(re.compile(r"/login"))
    page.goto(server.base + "/quiz")
    expect(page).to_have_url(re.compile(r"/login\?next=/quiz$"))


@pytest.mark.allow_console(UNAUTHORIZED, r"status of 429")
def test_repeated_failures_lock_the_ip(contexts, fresh_server, console):
    page = console.watch(contexts().new_page())
    for _ in range(5):
        login(page, fresh_server.base, "admin", "wrong-password")
        expect(page.locator(LOGIN_ERROR)).to_be_visible()
    login(page, fresh_server.base, "admin", fresh_server.admin_password)
    expect(page.locator(LOGIN_ERROR)).to_contain_text("Too many attempts")
    expect(page).to_have_url(re.compile(r"/login"))


@pytest.mark.allow_console(r"status of 400")
def test_admin_manages_users(admin_page, contexts, server, console):
    page = admin_page
    page.goto(server.base + "/users")
    before = page.locator(USER_ROWS).count()
    name = "newbie%d" % before
    page.fill(NEW_NAME, name.capitalize())
    page.fill(NEW_PASS, "first-pass-1")
    page.select_option(NEW_ROLE, "user")
    page.locator(NEW_USER).locator(SUBMIT).click()
    expect(page.locator(user_row(name))).to_contain_text("never")
    # Duplicate names are refused with a toast.
    page.fill(NEW_NAME, name)
    page.fill(NEW_PASS, "first-pass-1")
    page.locator(NEW_USER).locator(SUBMIT).click()
    expect(page.locator(TOAST_ERROR)).to_contain_text("already a user called " + name)

    # The new user signs in; then the admin promotes them and they see the Users page.
    other = console.watch(contexts().new_page())
    login_ok(other, server.base, name, "first-pass-1")
    expect(other.locator(NAV_USERS)).to_have_count(0)
    page.locator(user_row(name)).locator("select.role").select_option("admin")
    expect(page.locator(TOAST)).to_contain_text(name + " is now an admin")
    other.reload()
    expect(other.locator(NAV_USERS).first).to_be_visible()
    page.locator(user_row(name)).locator("select.role").select_option("user")
    expect(page.locator(TOAST)).to_contain_text(name + " is now a user")

    # Delete takes two clicks; the deleted user is signed out.
    delete = page.locator(user_row(name)).locator("[data-act=delete]")
    delete.click()
    expect(delete).to_have_text("Click again to delete")
    delete.click()
    expect(page.locator(user_row(name))).to_have_count(0)
    other.goto(server.base + "/")
    expect(other).to_have_url(re.compile(r"/login"))
    page.reload()
    expect(page.locator(USER_ROWS)).to_have_count(before)


def test_password_reset_signs_the_user_out(admin_page, make_user, contexts, server, console):
    name, password, _ = make_user()
    other = console.watch(contexts().new_page())
    login_ok(other, server.base, name, password)
    page = admin_page
    page.goto(server.base + "/users")
    row = page.locator(user_row(name))
    row.locator("[data-act=password]").click()
    row.locator(PW_FORM).locator("input").fill("second-pass-2")
    row.locator(PW_FORM).locator("button").click()
    expect(page.locator(TOAST)).to_contain_text("Password updated for " + name)
    other.goto(server.base + "/")
    expect(other).to_have_url(re.compile(r"/login"))
    login_ok(other, server.base, name, "second-pass-2")


@pytest.mark.allow_console(r"status of 400")
def test_users_change_their_own_password(user_page, contexts, server, console):
    page = user_page
    name, password = page.user
    elsewhere = console.watch(contexts().new_page())
    login_ok(elsewhere, server.base, name, password)
    page.goto(server.base + "/settings")
    page.fill(PW_CURRENT, "wrong-current")
    page.fill(PW_NEW, "brand-new-pass")
    page.locator(PW_FORM_SELF).locator(SUBMIT).click()
    expect(page.locator(TOAST_ERROR)).to_contain_text("current password")
    page.fill(PW_CURRENT, password)
    page.fill(PW_NEW, "brand-new-pass")
    page.locator(PW_FORM_SELF).locator(SUBMIT).click()
    expect(page.locator(TOAST)).to_contain_text("Password changed")
    page.reload()
    expect(page).to_have_url(server.base + "/settings")
    elsewhere.goto(server.base + "/")
    expect(elsewhere).to_have_url(re.compile(r"/login"))
    login_ok(elsewhere, server.base, name, "brand-new-pass")


@pytest.mark.allow_console(r"status of 404")
def test_users_cannot_manage_accounts(user_page, server):
    page = user_page
    expect(page.locator(NAV_USERS)).to_have_count(0)
    assert page.goto(server.base + "/users").status == 404
    r = page.request.post(server.base + "/api/users", headers=FETCH,
                          data={"username": "mallory", "password": "x" * 10})
    assert r.status == 404


def test_workspaces_are_separate(make_user, contexts, server, console):
    pages = []
    for _ in range(2):
        name, password, _ = make_user()
        p = console.watch(contexts().new_page())
        login_ok(p, server.base, name, password)
        pages.append(p)
    a, b = pages
    # A renames a router in a terminal lab and saves a setting.
    reset_lab(a, server.base, "first-lan")
    a.goto(server.base + "/terminal/first-lan")
    for line in ["enable", "configure terminal", "hostname ALICE-R1"]:
        cmd(a, line)
    expect(a.locator(TERM_PROMPT)).to_have_text("ALICE-R1(config)#")
    a.wait_for_timeout(1500)  # the debounced save
    r = a.request.post(server.base + "/api/settings", headers=FETCH, data={"new_cards_per_day": 7})
    assert r.ok
    # B sees none of it.
    b.goto(server.base + "/terminal/first-lan")
    expect(b.locator(TERM_PROMPT)).to_have_text("R1>")
    expect(b.locator(TERM_OUT)).not_to_contain_text("ALICE-R1")
    b.goto(server.base + "/settings")
    expect(b.locator("#new_cards_per_day")).not_to_have_value("7")
    # A's state survives a reload.
    a.goto(server.base + "/terminal/first-lan")
    expect(a.locator(TERM_OUT)).to_contain_text("[console reconnected]")
    cmd(a, "")
    expect(a.locator(TERM_PROMPT)).to_have_text(re.compile(r"^ALICE-R1"))
