"""How the console feels: help, completion, history, keys and error messages."""
import pytest
from playwright.sync_api import expect

from e2e_helpers import TERM_IN, TERM_OUT, TERM_PROMPT, cmd, reset_lab, term_key

pytestmark = pytest.mark.e2e


@pytest.fixture
def sandbox(contexts, lab_user_state, server, console):
    page = console.watch(contexts(storage_state=lab_user_state).new_page())
    reset_lab(page, server.base, "sandbox")
    page.goto(server.base + "/terminal/sandbox")
    expect(page.locator(TERM_PROMPT)).to_have_text("R1>")
    return page


def test_help_on_a_partial_word_and_on_a_whole_line(sandbox):
    page, inp, out = sandbox, sandbox.locator(TERM_IN), sandbox.locator(TERM_OUT)
    cmd(page, "enable")
    inp.fill("c")
    inp.press("?")
    expect(out).to_contain_text("clear  clock  configure  connect  copy")
    expect(inp).to_have_value("c")
    inp.fill("show ip ")
    inp.press("?")
    expect(out).to_contain_text("IP routing table")
    expect(inp).to_have_value("show ip ")
    # A line typed with a trailing ? and Enter shows help and gives the line back.
    cmd(page, "configure terminal")
    cmd(page, "interface g0/0")
    cmd(page, "ip address 10.0.0.1 ?")
    expect(out).to_contain_text("IP subnet mask")
    expect(inp).to_have_value("ip address 10.0.0.1 ")


def test_tab_completion_history_and_ctrl_z(sandbox):
    page, inp = sandbox, sandbox.locator(TERM_IN)
    cmd(page, "en")
    inp.fill("conf")
    inp.press("Tab")
    expect(inp).to_have_value("configure ")
    inp.type("t")
    inp.press("Enter")
    expect(page.locator(TERM_PROMPT)).to_have_text("R1(config)#")
    inp.fill("int g0")
    inp.press("Tab")
    expect(inp).to_have_value("int GigabitEthernet0")
    cmd(page, "int g0/1")
    cmd(page, "description uplink")
    inp.press("ArrowUp")
    expect(inp).to_have_value("description uplink")
    inp.press("ArrowUp")
    expect(inp).to_have_value("int g0/1")
    inp.press("ArrowDown")
    expect(inp).to_have_value("description uplink")
    inp.fill("")
    inp.press("Control+z")
    expect(page.locator(TERM_PROMPT)).to_have_text("R1#")


def test_ios_error_messages(sandbox):
    page, out = sandbox, sandbox.locator(TERM_OUT)
    cmd(page, "en")
    cmd(page, "show ip routee")
    expect(out).to_contain_text("% Invalid input detected at '^' marker.")
    cmd(page, "c")
    expect(out).to_contain_text('% Ambiguous command:  "c"')
    cmd(page, "show")
    expect(out).to_contain_text("% Incomplete command.")
    cmd(page, "conf t")
    cmd(page, "do c")
    expect(out).to_contain_text('% Ambiguous command:  "c"')


def test_on_screen_keys_on_a_phone(contexts, lab_user_state, server, console):
    ctx = contexts(storage_state=lab_user_state, viewport={"width": 390, "height": 844},
                   is_mobile=True, has_touch=True)
    page = console.watch(ctx.new_page())
    reset_lab(page, server.base, "sandbox")
    page.goto(server.base + "/terminal/sandbox")
    inp = page.locator(TERM_IN)
    cmd(page, "en")
    inp.fill("sh")
    page.locator(term_key("Tab")).tap()
    expect(inp).to_have_value("show ")
    page.locator(term_key("?")).tap()
    expect(page.locator(TERM_OUT)).to_contain_text("running-config")
    cmd(page, "conf t")
    page.locator(term_key("ctrl-z")).tap()
    expect(page.locator(TERM_PROMPT)).to_have_text("R1#")
    page.locator(term_key("ArrowUp")).tap()
    expect(inp).to_have_value("conf t")
