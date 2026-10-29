// Shared behaviour for every page: API calls, toasts, theme and the mobile drawers.

export async function api(method, url, body) {
  const opts = { method, headers: { "X-Requested-With": "fetch" } };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(url, opts);
  } catch (e) {
    toast("Can't reach the server. Check your connection.", true);
    throw reported(e);
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search);
    throw reported(new Error("signed out"));
  }
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error
      : (data.detail && JSON.stringify(data.detail)) || "Something went wrong (" + res.status + ")";
    toast(msg, true);
    throw reported(new Error(msg));
  }
  return data;
}

// api() has already told the user about these, so callers needn't catch them just to stay quiet.
function reported(err) {
  err.reported = true;
  return err;
}
window.addEventListener("unhandledrejection", (e) => {
  if (e.reason && e.reason.reported) e.preventDefault();
});

let toastTimer;
export function toast(message, isError = false) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.toggle("error", isError);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, isError ? 5000 : 2200);
}

export function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function el(tag, attrs = {}, html) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("data-") || k === "type" || k === "id" || k.startsWith("aria-")) node.setAttribute(k, v);
    else node[k] = v;
  }
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// True while the user is typing, so single-key shortcuts don't fire.
export function typing(e) {
  const t = e.target;
  return t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

function setupChrome() {
  document.querySelectorAll("[data-theme-toggle]").forEach((t) => t.addEventListener("click", () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("netlab-theme", root.dataset.theme); } catch (e) { /* private mode */ }
  }));
  document.querySelector("[data-nav-toggle]")?.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });
  document.querySelectorAll("[data-toc-toggle]").forEach((b) => b.addEventListener("click", () => {
    document.body.classList.toggle("toc-open");
  }));
  document.querySelector("[data-close-drawers]")?.addEventListener("click", () => {
    document.body.classList.remove("nav-open", "toc-open");
  });
  // CCNP / CCNA / Both: saved per user, then the page reloads with that track's content.
  document.addEventListener("click", async (e) => {
    const choice = e.target.closest("[data-track-choice]");
    if (!choice || choice.classList.contains("on")) return;
    const value = choice.dataset.trackChoice;
    document.querySelectorAll("[data-track-choice]").forEach((b) => {
      const on = b.dataset.trackChoice === value;
      b.classList.toggle("on", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.documentElement.dataset.track = value;
    await api("POST", "/api/settings", { track: value });
    location.reload();
  });
  // The account menu closes on an outside click or Escape.
  document.addEventListener("click", (e) => {
    document.querySelectorAll("details.user-menu[open]").forEach((m) => { if (!m.contains(e.target)) m.open = false; });
  });
  // Diagrams in the guides open full size on click.
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".prose img");
    if (img) { openLightbox(img); return; }
    if (e.target.closest(".lightbox")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "Escape") document.querySelectorAll("details.user-menu[open]").forEach((m) => { m.open = false; });
    if (e.key === "Escape") document.body.classList.remove("nav-open", "toc-open");
    if (e.key === "/" && !typing(e) && !e.metaKey && !e.ctrlKey) {
      // The page's own search box if it has one, else the one in the top bar (hidden on phones).
      const box = [...document.querySelectorAll("input[type=search]")].find((i) => i.offsetParent !== null);
      if (box) { e.preventDefault(); box.focus(); } else if (location.pathname !== "/search") {
        location.href = "/search";
      }
    }
  });
}

function openLightbox(img) {
  closeLightbox();
  const box = el("div", { class: "lightbox", role: "dialog", "aria-label": img.alt || "Diagram" });
  const big = el("img", { src: img.currentSrc || img.src, alt: img.alt });
  box.append(big);
  if (img.alt) {
    const cap = el("div", { class: "lightbox-cap" });
    cap.textContent = img.alt;
    box.append(cap);
  }
  document.body.append(box);
}

function closeLightbox() {
  document.querySelector(".lightbox")?.remove();
}

setupChrome();
