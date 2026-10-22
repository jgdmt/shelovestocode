// Inventory tabs: tags, CSS properties and images. Items are clicked or
// dragged; both give a payload { kind, value } the page inserts in the right file.

import { $, h } from "../ui/dom.js";
import { startNewDrag, endNewDrag } from "../blocks/drag-drop.js";
import { tagChip, propertyChip } from "../blocks/chips.js";
import { TAGS, IMAGES, CSS_PROPERTIES } from "../../exercises/inventory.js";

function renderTags(onInsert) {
    $("tag-list").replaceChildren(...Object.entries(TAGS).map(([tag, description]) =>
        h("li", { onClick: () => onInsert({ kind: "tag", value: tag }) }, tagChip(tag), h("span", {}, description))));
}

function renderProperties(onInsert) {
    $("property-list").replaceChildren(...Object.entries(CSS_PROPERTIES).map(([property, { description, example }]) =>
        h("li", { onClick: () => onInsert({ kind: "property", value: property }) },
            propertyChip(property),
            h("span", {}, description, h("span", { class: "muted" }, ` — e.g. ${example}`)))));
}

function renderImages(onInsert) {
    $("image-list").replaceChildren(...IMAGES.map((name) => {
        const payload = { kind: "image", value: `/images/${name}` };
        return h("figure", {
            draggable: true,
            onDragstart: (e) => startNewDrag(e, payload),
            onDragend: endNewDrag,
            onClick: () => onInsert(payload)
        }, h("img", { src: payload.value, alt: "", draggable: false }), h("figcaption", {}, name));
    }));
}

export function renderInventory(onInsert, { showProperties }) {
    renderTags(onInsert);
    renderImages(onInsert);
    document.querySelector('[data-tab="properties"]').hidden = !showProperties;
    if (showProperties)
        renderProperties(onInsert);
}
