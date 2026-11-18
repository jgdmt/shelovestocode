// One CSS declaration as a block:  [color] : [purple] (color picker) ;  ×
// Declarations the browser would ignore are flagged with the reason.

import { h } from "../../ui/dom.js";
import { toHex } from "../../core/colors.js";
import { editable, deleteButton } from "../../blocks/parts.js";
import { checkDeclaration } from "./lint.js";
import { ui } from "../../core/i18n.js";

const isColorProperty = (property) => /(^|-)color$/.test(property) || property === "background";

// onEdit: the declaration changed (no re-render), onRemove: delete it.
export function renderDeclaration(block, grip, decl, { onEdit, onRemove }) {
    block.classList.add("declaration");
    const error = h("span", { class: "decl-error" });

    const property = editable(decl.property, "decl-property", (text) => {
        decl.property = text.trim().toLowerCase();
        changed();
    });

    const value = editable(decl.value, "decl-value", (text) => {
        decl.value = text;
        changed();
    });

    // <input type="color"> only takes "#rrggbb": other colors show black until picked
    const picker = h("input", {
        type: "color",
        class: "decl-color",
        title: ui("blocks.pickColor"),
        onInput: () => {
            decl.value = picker.value;
            value.textContent = picker.value;
            changed();
        }
    });

    function refresh() {
        picker.hidden = !isColorProperty(decl.property);
        if (document.activeElement !== picker)
            picker.value = toHex(decl.value) || "#000000";
        // a blank declaration just added with "+" is not an error yet
        const problem = decl.property || decl.value ? checkDeclaration(decl.property, decl.value) : null;
        block.classList.toggle("invalid", Boolean(problem));
        error.textContent = problem || "";
    }

    function changed() {
        refresh();
        onEdit();
    }

    refresh();
    block.append(grip, property, h("span", { class: "decl-punct" }, ":"), value, picker,
        h("span", { class: "decl-punct" }, ";"), deleteButton(onRemove), error);
}
