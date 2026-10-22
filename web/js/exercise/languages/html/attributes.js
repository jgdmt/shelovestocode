// Attributes inside the colored opening tag of an HTML block: [<div class="story" +>]
//
// editable: students can add, edit and remove attributes; otherwise they are
// shown read-only so the blocks still match the code.

import { h, icon } from "../../ui/dom.js";
import { editable as editableText } from "../../blocks/parts.js";

// onEdit: an attribute changed (no re-render), onCommit: the list changed (re-render).
export function createAttributes({ editable, onEdit, onCommit }) {
    let focusNext = null; // newly added attribute: its name gets the focus after re-render

    function readOnly(node) {
        return node.attrs.map((attr) => h("span", { class: "attr" },
            h("span", { class: "attr-name" }, attr.name), "=\"",
            h("span", { class: "attr-value" }, attr.value), "\""));
    }

    function pill(node, attr) {
        const name = editableText(attr.name, "attr-name", (value) => { attr.name = value; onEdit(); });
        if (attr === focusNext) {
            focusNext = null;
            requestAnimationFrame(() => name.focus());
        }
        return h("span", { class: "attr" },
            name, "=\"",
            editableText(attr.value, "attr-value", (value) => { attr.value = value; onEdit(); }),
            "\"",
            h("button", {
                class: "attr-del",
                title: "Remove this attribute",
                onClick: () => {
                    node.attrs.splice(node.attrs.indexOf(attr), 1);
                    onCommit();
                }
            }, icon("x", "icon icon-sm")));
    }

    function addButton(node) {
        return h("button", {
            class: "attr-add",
            title: "Add an attribute",
            onClick: () => {
                focusNext = { name: "", value: "" };
                node.attrs.push(focusNext);
                onCommit();
            }
        }, icon("plus", "icon icon-sm"));
    }

    return {
        render: (node) => (editable ? [...node.attrs.map((attr) => pill(node, attr)), addButton(node)] : readOnly(node))
    };
}
