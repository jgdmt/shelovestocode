// Colored tag chips, used in the inventory and the blocks palette.

import { h } from "./dom.js";

export function tagColor(tag) {
    if (tag === "#text")
        return "tag-text";
    if (/^h[1-6]$/.test(tag))
        return "tag-h";
    if (tag === "p")
        return "tag-p";
    if (tag === "img")
        return "tag-img";
    return "tag-other";
}

// A draggable chip: the drop zone of the blocks view reads "application/x-tag".
// The special tag "#text" stands for free text.
export function tagChip(tag, onClick) {
    return h("span", {
        class: `chip ${tagColor(tag)}`,
        draggable: true,
        title: tag === "#text" ? "Free text, to mix with tags like <b>" : undefined,
        onDragstart: (e) => e.dataTransfer.setData("application/x-tag", tag),
        onClick
    }, tag === "#text" ? "Abc text" : `<${tag}>`);
}
