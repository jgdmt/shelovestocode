// Inventory tabs: tags, CSS properties and images. Items are clicked or
// dragged; both give a payload { kind, value } the page inserts in the right file.

import { $, h } from "../ui/dom.js";
import { startNewDrag, endNewDrag } from "../blocks/drag-drop.js";
import { tagChip, propertyChip } from "../blocks/chips.js";
import { TAGS, IMAGES, CSS_PROPERTIES } from "../../exercises/inventory.js";

// The chip, its description, and optionally an example of use.
function item(chip, description, onClick, example = null) {
    return h("li", { class: "inventory-item", onClick },
        chip,
        h("div", { class: "inventory-item-desc" }, description),
        example);
}

// "color: purple;" colored like in the editor
const declarationExample = (property, value) => h("code", { class: "inventory-example" },
    h("span", { class: "example-property" }, property), ": ",
    h("span", { class: "example-value" }, value), ";");

function renderTags(onInsert) {
    $("tag-list").replaceChildren(...Object.entries(TAGS).map(([tag, description]) =>
        item(tagChip(tag), description, () => onInsert({ kind: "tag", value: tag }))));
}

function renderProperties(onInsert) {
    $("property-list").replaceChildren(...Object.entries(CSS_PROPERTIES).map(([property, { description, example }]) =>
        item(propertyChip(property), description, () => onInsert({ kind: "property", value: property }),
            declarationExample(property, example))));
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
