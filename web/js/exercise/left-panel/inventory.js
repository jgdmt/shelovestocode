// Inventory tabs: tags, CSS properties and images (built-in and imported). Items are clicked or
// dragged; both give a payload { kind, value } the page inserts in the right file.

import { $, h, icon } from "../ui/dom.js";
import { startNewDrag, endNewDrag } from "../blocks/drag-drop.js";
import { tagChip, propertyChip } from "../blocks/chips.js";
import { TAGS, IMAGES, CSS_PROPERTIES } from "../../exercises/inventory.js";
import { ui } from "../core/i18n.js";
import { userImages, importImage, removeImage } from "../core/user-images.js";

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
    $("tag-list").replaceChildren(...TAGS.map((tag) =>
        item(tagChip(tag), ui(`inventory.tags.${tag}`), () => onInsert({ kind: "tag", value: tag }))));
}

function renderProperties(onInsert) {
    $("property-list").replaceChildren(...Object.entries(CSS_PROPERTIES).map(([property, { example }]) =>
        item(propertyChip(property), ui(`inventory.properties.${property}`), () => onInsert({ kind: "property", value: property }),
            declarationExample(property, example))));
}

// An image of the Images tab: click or drag it to use it.
function imageFigure(name, src, payload, removeButton = null) {
    return h("figure", {
        draggable: true,
        onDragstart: (e) => startNewDrag(e, payload),
        onDragend: endNewDrag,
        onClick: () => onInsertImage(payload)
    }, h("img", { src, alt: "", draggable: false }), h("figcaption", { title: name }, name), removeButton);
}

let onInsertImage = () => {};

function showImageError(message) {
    const box = $("image-error");
    box.textContent = message;
    box.hidden = !message;
}

const IMPORT_ERRORS = { "not-image": "inventory.notImage", "too-big": "inventory.tooBig", "unreadable": "inventory.unreadable" };

async function importFiles(files) {
    const errors = [];
    for (const file of files) {
        try {
            await importImage(file);
        } catch (err) {
            console.warn("Import failed", file.name, err);
            errors.push(ui(IMPORT_ERRORS[err.message] ?? "inventory.importFailed", { name: file.name }));
        }
    }
    renderImages();
    showImageError(errors.join(" "));
}

function importTile() {
    const input = h("input", {
        type: "file",
        accept: "image/*",
        multiple: true,
        hidden: true,
        onChange: () => {
            importFiles([...input.files]);
            input.value = "";
        }
    });
    return h("label", { class: "image-import", title: ui("inventory.importTitle") },
        input, icon("upload"), h("span", {}, ui("inventory.import")));
}

function removeButton(name) {
    return h("button", {
        class: "image-remove",
        title: ui("inventory.removeImage"),
        onClick: async (e) => {
            e.stopPropagation();
            if (!confirm(ui("inventory.removeConfirm", { name })))
                return;
            await removeImage(name).catch((err) => console.warn("Remove failed", err));
            renderImages();
        }
    }, icon("x", "icon icon-sm"));
}

function renderImages() {
    const builtIn = IMAGES.map((name) => {
        const path = `/images/${name}`;
        return imageFigure(name, path, { kind: "image", value: path });
    });
    const imported = userImages().map(({ name, url, path }) =>
        imageFigure(name, url, { kind: "image", value: path }, removeButton(name)));
    $("image-list").replaceChildren(importTile(), ...imported, ...builtIn);
}

export function renderInventory(onInsert, { showProperties }) {
    renderTags(onInsert);
    onInsertImage = onInsert;
    renderImages();
    document.querySelector('[data-tab="properties"]').hidden = !showProperties;
    if (showProperties)
        renderProperties(onInsert);
}
