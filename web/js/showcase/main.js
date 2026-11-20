// Showcase: previews of the example pages in html/examples; a click opens one,
// full size, in a side panel that the close button (or Escape) hides again.

import "../exercise/ui/icons.js";
import { $, h, icon } from "../exercise/ui/dom.js";
import { setupThemeToggle } from "../exercise/ui/theme.js";
import { loadUi } from "../exercise/core/i18n.js";

const DIR = "/html/examples/";
// used when the server does not list the folder
const FALLBACK = ["1.html"];

try { await loadUi(); } catch (e) { console.warn("showcase: translations not loaded", e); }
setupThemeToggle();

// The example pages: read from the folder listing of the server (serve.py lists folders).
async function listExamples() {
    try {
        const res = await fetch(DIR);
        if (!res.ok)
            throw new Error(res.status);
        const doc = new DOMParser().parseFromString(await res.text(), "text/html");
        const files = [...doc.querySelectorAll("a[href]")]
            .map((a) => decodeURIComponent(a.getAttribute("href")))
            .filter((href) => /^[^/?#]+\.html?$/i.test(href));
        if (files.length)
            return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    } catch (e) {
        console.warn("showcase: cannot list", DIR, e);
    }
    return FALLBACK;
}

const nameOf = (file) => file.replace(/\.html?$/i, "");

const layout = document.querySelector(".showcase-layout");
const viewer = $("viewer");
const frame = $("viewer-frame");
let activeCard = null;

function openViewer(file, card) {
    const url = DIR + file;
    activeCard?.classList.remove("active");
    activeCard = card;
    card.classList.add("active");
    if (frame.getAttribute("src") !== url)
        frame.src = url;
    $("viewer-title").textContent = card.dataset.title;
    // $("viewer-open").href = url;
    layout.classList.add("viewer-open");
    viewer.setAttribute("aria-hidden", "false");
    $("viewer-close").focus({ preventScroll: true });
}

function closeViewer() {
    layout.classList.remove("viewer-open");
    viewer.setAttribute("aria-hidden", "true");
    activeCard?.classList.remove("active");
    activeCard?.focus({ preventScroll: true });
    activeCard = null;
}

$("viewer-close").append(icon("x"));
$("viewer-close").addEventListener("click", closeViewer);
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && layout.classList.contains("viewer-open"))
        closeViewer();
});

function previewCard(file) {
    const thumbFrame = h("iframe", { src: DIR + file, loading: "lazy", tabIndex: -1, title: nameOf(file), "aria-hidden": "true" });
    const label = h("span", { class: "preview-name" }, nameOf(file).replaceAll("_", " "));
    const card = h("button", { class: "preview-card", type: "button", onClick: () => openViewer(file, card) },
        h("div", { class: "preview-thumb" }, thumbFrame),
        label);
    card.dataset.title = nameOf(file).replaceAll("_", " ");
    // use the page's <title> as the name when it has one
    thumbFrame.addEventListener("load", () => {
        const title = thumbFrame.contentDocument?.title?.trim();
        if (title) {
            label.textContent = title;
            card.dataset.title = title;
        }
    });
    return card;
}

// keep each thumbnail scaled to the width of its card
const resize = new ResizeObserver((entries) => {
    for (const { target, contentRect } of entries)
        target.style.setProperty("--thumb-scale", contentRect.width / 1280);
});

const files = await listExamples();
const cards = files.map(previewCard);
$("gallery").replaceChildren(...cards);
cards.forEach((card) => resize.observe(card.querySelector(".preview-thumb")));
