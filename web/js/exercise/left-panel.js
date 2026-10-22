// Left panel: tabs, mission (guide, objectives, hints, lesson) and inventory.

import { $, h, setupSegmented } from "./dom.js";
import { tagChip } from "./chips.js";
import { VOID_TAGS, createNode } from "./blocks.js";
import { TAGS, IMAGES } from "../exercises/inventory.js";

function setupTabs() {
    const panes = document.querySelectorAll("[data-pane]");
    setupSegmented(document.querySelector(".tabs"), "tab", (tab) => {
        panes.forEach((pane) => { pane.hidden = pane.dataset.pane !== tab; });
    });
}

function renderMission(ex) {
    document.title = `${ex.title} — SheLovesToCode`;
    $("guide-text").textContent = ex.guide;
    $("ex-title").textContent = ex.title;
    $("mission").innerHTML = ex.mission.map((paragraph) => `<p>${paragraph}</p>`).join("");
    $("lesson").innerHTML = ex.lesson;
}

function setupHints(hints) {
    const button = $("hint-btn");
    let shown = 0;
    button.hidden = hints.length === 0;
    button.addEventListener("click", () => {
        $("hints").appendChild(h("div", { class: "hint", innerHTML: hints[shown] }));
        shown++;
        button.hidden = shown >= hints.length;
    });
}

// onInsert(snippet, node): the page decides whether it goes to the editor or the blocks.
function renderInventory(onInsert) {
    const tagItems = Object.entries(TAGS).map(([tag, description]) => {
        const snippet = VOID_TAGS.has(tag) ? `<${tag}>` : `<${tag}></${tag}>`;
        return h("li", { onClick: () => onInsert(snippet, createNode(tag)) }, tagChip(tag), h("span", {}, description));
    });
    $("tag-list").replaceChildren(...tagItems);

    const imageItems = IMAGES.map((name) => {
        const src = `/images/${name}`;
        return h("figure", { onClick: () => onInsert(`<img src="${src}">`, createNode("img", [{ name: "src", value: src }])) },
            h("img", { src, alt: "" }),
            h("figcaption", {}, name));
    });
    $("image-list").replaceChildren(...imageItems);
}

export function createLeftPanel(ex, { onInsert }) {
    setupTabs();
    renderMission(ex);
    setupHints(ex.hints || []);
    renderInventory(onInsert);

    const checkItems = ex.checks.map((check) => h("li", {}, check.label));
    $("checks").replaceChildren(...checkItems);

    return {
        updateChecks(results) {
            checkItems.forEach((item, i) => item.classList.toggle("ok", results[i]));
        },
        showSuccess() {
            $("success").hidden = false;
            $("hint-btn").hidden = true;
            $("guide-text").textContent = "Well done! Read the lesson below, then move on to the next exercise.";
        }
    };
}
