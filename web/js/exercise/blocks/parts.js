// Small pieces shared by the blocks views.

import { h, icon } from "../ui/dom.js";
import { startNewDrag, endNewDrag } from "./drag-drop.js";

// contentEditable span; Enter validates instead of inserting a line break.
export function editable(value, className, onInput) {
    const span = h("span", {
        class: className,
        contentEditable: "plaintext-only",
        spellcheck: false,
        textContent: value,
        onInput: () => onInput(span.textContent),
        onKeydown: (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                span.blur();
            }
        }
    });
    return span;
}

export const deleteButton = (onClick) =>
    h("button", { class: "block-del", title: "Remove", onClick }, icon("x"));

// Gray block for code a view can't represent: edited as plain text.
export function rawBlock(block, grip, value, onInput, onRemove) {
    block.classList.add("raw-block");
    const area = h("textarea", {
        class: "raw-code",
        spellcheck: false,
        value,
        rows: value.split("\n").length,
        onInput: () => {
            area.rows = area.value.split("\n").length;
            onInput(area.value);
        }
    });
    block.append(
        h("div", { class: "block-row" },
            grip,
            h("span", { class: "block-label", title: "Blocks can't show this yet: edit it as code" }, "code"),
            deleteButton(onRemove)),
        area);
}

// Draggable palette chip. payload: { kind: "tag" | "property" | "selector" | "image" | "text", value }
export function chip(label, className, payload, { onClick, title } = {}) {
    return h("span", {
        class: `chip ${className}`,
        draggable: true,
        title,
        onDragstart: (e) => startNewDrag(e, payload),
        onDragend: endNewDrag,
        onClick
    }, label);
}
