"""Interactive diagrams in the reader: step-throughs, ladders, and each try-it widget."""
import re

import pytest
from playwright.sync_api import expect

pytestmark = pytest.mark.e2e


def figure(page, title):
    fig = page.locator("figure.dg", has=page.locator(".dg-title", has_text=title))
    expect(fig).to_have_attribute("data-ready", "1")
    fig.scroll_into_view_if_needed()
    return fig


def test_topology_steps_forward_and_back_without_turning_the_page(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/30-5")
    fig = figure(page, "DMVPN Phase 3")
    expect(fig.locator(".dg-count")).to_have_text("Step 1 of 5")
    expect(fig.locator(".dg-step-title")).to_contain_text("follows the summary to the hub")
    expect(fig.locator(".dg-back")).to_be_disabled()
    fig.locator(".dg-next").click()
    expect(fig.locator(".dg-step-title")).to_contain_text("Redirect")
    # Badges carry forward and clear: the hub's hairpin badge shows on step 2, gone by step 3.
    expect(fig.locator(".dg-badge-text", has_text="hairpin")).to_be_visible()
    fig.locator(".dg-next").click()
    expect(fig.locator(".dg-badge-text", has_text="hairpin")).to_have_count(0)
    expect(fig.locator(".dg-pkt-label", has_text="Resolution Req")).to_be_visible()
    # Arrow keys step the diagram while it has focus, and must not page the reader.
    url = page.url
    fig.locator(".dg-next").focus()
    page.keyboard.press("ArrowRight")
    expect(fig.locator(".dg-count")).to_have_text("Step 4 of 5")
    page.keyboard.press("ArrowLeft")
    expect(fig.locator(".dg-count")).to_have_text("Step 3 of 5")
    assert page.url == url
    fig.locator(".dg-dot").nth(4).click()
    expect(fig.locator(".dg-badge-text", has_text="H route")).to_be_visible()
    expect(fig.locator(".dg-next")).to_have_text("Start over ↺")
    fig.locator(".dg-next").click()
    expect(fig.locator(".dg-count")).to_have_text("Step 1 of 5")


def test_clicking_a_device_explains_it(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/30-5")
    fig = figure(page, "DMVPN Phase 3")
    info = fig.locator(".dg-info")
    expect(info).to_be_hidden()
    fig.locator(".dg-node.has-info", has=page.locator(".dg-name", has_text="Hub")).click()
    expect(info).to_be_visible()
    expect(info).to_contain_text("NHS")
    fig.locator(".dg-info-close").click()
    expect(info).to_be_hidden()


def test_sequence_reveals_messages_and_states(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/28-3")
    fig = figure(page, "A BGP session coming up")
    expect(fig.locator(".dg-msg.is-current")).to_have_count(1)
    expect(fig.locator(".dg-msg:not(.is-hidden)")).to_have_count(1)
    fig.locator(".dg-dot").last.click()
    expect(fig.locator(".dg-msg.is-hidden")).to_have_count(0)
    expect(fig.locator(".dg-state-text", has_text="Established")).to_have_count(2)


def test_election_reruns_as_values_change(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/6-7")
    fig = figure(page, "Who becomes DR and BDR")
    result = fig.locator(".dg-result")
    expect(result).to_have_text("DR: R3 (decided by Router ID). BDR: R2 (decided by Router ID).")
    fig.get_by_label("R1 Interface priority").fill("10")
    expect(result).to_have_text("DR: R1 (decided by Interface priority). BDR: R3 (decided by Router ID).")
    fig.get_by_label("R4 Interface priority").fill("abc")
    expect(result).to_contain_text("isn't a valid interface priority")
    expect(result).to_have_class(re.compile(r"\bbad\b"))
    fig.get_by_role("button", name="Reset values").click()
    expect(fig.get_by_label("R1 Interface priority")).to_have_value("1")
    expect(result).to_contain_text("DR: R3")


def test_bgp_best_path_skips_med_across_neighbor_ases(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/28-6")
    fig = figure(page, "BGP best path")
    expect(fig.locator(".dg-walk")).to_contain_text("MED: skipped")
    fig.get_by_label("Path B via ISP2 Local preference").fill("200")
    expect(fig.locator(".dg-result")).to_have_text("Best path: Path B via ISP2 (decided by Local preference).")


def test_shortest_path_follows_the_costs(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/5-7")
    fig = figure(page, "OSPF picks the lowest total cost")
    result = fig.locator(".dg-result")
    expect(result).to_have_text("Best path: R1 → R2 → R4 → R5, total cost 30.")
    fig.get_by_label("Cost R1 to R3").fill("29")
    expect(result).to_contain_text("2 equal-cost paths (total 30)")
    fig.get_by_label("Cost R1 to R3").fill("5")
    expect(result).to_have_text("Best path: R1 → R3 → R5, total cost 6.")
    fig.get_by_label("Path to").select_option("R4")
    expect(result).to_have_text("Best path: R1 → R3 → R5 → R4, total cost 16.")


def test_prefix_list_and_acl_testers(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/23-2")
    fig = figure(page, "Test routes against a prefix list")
    result = fig.locator(".dg-result")
    expect(result).to_have_text("Line 2 matches first: permitted (the route is allowed).")
    fig.get_by_role("button", name="10.20.0.0/16").click()
    expect(result).to_contain_text("implicit deny")
    expect(fig.locator(".dg-acl li.is-match")).to_contain_text("implicit")
    fig.get_by_label("Route").fill("10.1.1")
    expect(result).to_have_class(re.compile(r"\bbad\b"))

    page.goto(server.base + "/read/ccnp/31-2")
    fig = figure(page, "Walk a packet through an extended ACL")
    result = fig.locator(".dg-result")
    expect(result).to_have_text("Line 1 matches first: permitted.")
    fig.get_by_label("Dest. port").fill("22")
    expect(result).to_contain_text("implicit deny")
    expect(fig.locator(".dg-acl li").first).to_contain_text("port 22 isn't eq 443")
    fig.get_by_label("Source", exact=True).fill("198.51.100.9")
    expect(result).to_have_text("Line 2 matches first: permitted.")


def test_bits_widgets(user_page, server):
    page = user_page
    page.goto(server.base + "/read/ccnp/11-2")
    fig = figure(page, "DSCP")
    facts = fig.locator(".dg-facts")
    expect(facts).to_contain_text("EF (expedited forwarding")
    fig.get_by_label("Decimal value").fill("34")
    expect(facts).to_contain_text("AF41")
    fig.get_by_label("bit worth 32").click()  # 34 - 32 = 2
    expect(fig.get_by_label("Decimal value")).to_have_value("2")

    page.goto(server.base + "/read/ccna/11-2")
    fig = figure(page, "Where the network ends")
    facts = fig.locator(".dg-facts")
    expect(facts).to_contain_text("172.16.32.0")
    fig.get_by_label("Prefix length").fill("24")
    expect(facts).to_contain_text("172.16.45.0")
    expect(facts).to_contain_text("172.16.45.255")
    fig.get_by_label("IPv4 address").fill("10.1.2.3")
    expect(facts).to_contain_text("10.1.2.0")
