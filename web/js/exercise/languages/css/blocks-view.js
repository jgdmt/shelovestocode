// CSS blocks: palettes (selectors found in the HTML, properties) + rules.
//
//   rule          [h1 {]  / declarations zone /  [}]
//   declaration   see declaration-block.js
//   comment       a comment inside a rule
//   raw           gray block for @media, comments between rules...
//
// config: { properties: [names] } restricts the property palette.
// context.htmlSelectors() returns the tags, classes and ids of the page.

import { h } from "../../ui/dom.js";
import { createDragDrop } from "../../blocks/drag-drop.js";
import { editable, deleteButton, rawBlock } from "../../blocks/parts.js";
import { propertyChip, selectorChip } from "../../blocks/chips.js";
import { createRule, createDeclaration } from "./model.js";
import { isValidSelector } from "./lint.js";
import { renderDeclaration } from "./declaration-block.js";
import { CSS_PROPERTIES } from "../../../exercises/inventory.js";

const DEFAULT_PALETTE = ["color", "background-color", "font-size", "text-align", "margin", "padding", "border", "border-radius"];

// Node for a palette / inventory payload.
function nodeFor(payload) {
    if (payload.kind === "tag" || payload.kind === "selector")
        return createRule(payload.value);
    if (payload.kind === "property")
        return createDeclaration(payload.value, CSS_PROPERTIES[payload.value]?.example ?? "");
    if (payload.kind === "image")
        return createDeclaration("background-image", `url("${payload.value}")`);
    return null;
}

export function createCssBlocksView(host, { config = {}, context, onChange }) {
    let sheet = null;
    let currentRule = null; // where clicked properties go

    const selectorPalette = h("div", { class: "palette-row" });
    const propertyPalette = h("div", { class: "palette-row" });
    const root = h("div", { class: "drop-zone zone css-rules", "data-empty": "Drop a selector here to create a rule" });
    host.append(
        h("div", { class: "palette" },
            h("div", { class: "palette-label" }, "Selectors from your page"), selectorPalette,
            h("div", { class: "palette-label" }, "Properties: drop them into a rule"), propertyPalette),
        root);

    const edited = () => onChange(sheet); // no re-render: it would lose the caret
    const commit = () => {
        render();
        onChange(sheet);
    };

    const dnd = createDragDrop(root, {
        create: nodeFor,
        accepts: (list, node) => (list === sheet.rules
            ? node.type === "rule" || node.type === "raw"
            : node.type === "declaration" || node.type === "comment"),
        dropInto: (target, node) => (target.type === "rule" && node.type === "declaration" ? target.declarations : null),
        childLists: (node) => (node.declarations ? [node.declarations] : []),
        onDrop: commit
    });

    (config.properties || DEFAULT_PALETTE).forEach((property) =>
        propertyPalette.appendChild(propertyChip(property, () => insert({ kind: "property", value: property }))));

    function renderSelectorPalette() {
        const selectors = context.htmlSelectors();
        selectorPalette.replaceChildren(...(selectors.length
            ? selectors.map((selector) => selectorChip(selector, () => insert({ kind: "selector", value: selector })))
            : [h("span", { class: "muted" }, "Add tags to your HTML first")]));
    }

    // Rules are added at the end; declarations go in the rule last focused (or the last rule).
    function insert(payload) {
        const node = nodeFor(payload);
        if (!node)
            return;
        if (node.type === "rule") {
            sheet.rules.push(node);
            currentRule = node;
        } else {
            if (!currentRule || !sheet.rules.includes(currentRule)) {
                currentRule = sheet.rules.findLast((rule) => rule.type === "rule") || createRule("body");
                if (!sheet.rules.includes(currentRule))
                    sheet.rules.push(currentRule);
            }
            currentRule.declarations.push(node);
        }
        commit();
    }

    function remove(node, list) {
        list.splice(list.indexOf(node), 1);
        commit();
    }

    function renderComment(block, grip, item, list) {
        block.classList.add("text-block");
        block.append(grip, h("span", { class: "block-label" }, "comment"),
            editable(item.text, "block-text", (text) => { item.text = text; edited(); }),
            deleteButton(() => remove(item, list)));
    }

    function renderRule(block, grip, rule, list) {
        block.classList.add("container", "rule");
        block.addEventListener("focusin", () => { currentRule = rule; });

        const selector = editable(rule.selector, "rule-selector", (text) => {
            rule.selector = text;
            selector.classList.toggle("invalid", !isValidSelector(text));
            edited();
        });
        selector.classList.toggle("invalid", !isValidSelector(rule.selector));

        const zone = h("div", { class: "zone", "data-empty": "Drop properties here" });
        renderList(rule.declarations, zone);

        block.append(
            h("div", { class: "block-row" }, grip, h("span", { class: "rule-open" }, selector, " {"), deleteButton(() => remove(rule, list))),
            zone,
            h("div", { class: "block-row" }, h("span", { class: "grip-slot" }), h("span", { class: "rule-close" }, "}")));
    }

    function renderNode(node, list) {
        const block = h("div", { class: "block" });
        const grip = dnd.block(block, node, list);
        if (node.type === "rule")
            renderRule(block, grip, node, list);
        else if (node.type === "declaration")
            renderDeclaration(block, grip, node, { onEdit: edited, onRemove: () => remove(node, list) });
        else if (node.type === "comment")
            renderComment(block, grip, node, list);
        else
            rawBlock(block, grip, node.css, (text) => { node.css = text; edited(); }, () => remove(node, list));
        return block;
    }

    function renderList(list, zone) {
        dnd.zone(zone, list);
        zone.replaceChildren(...list.map((node) => renderNode(node, list)));
    }

    function render() {
        renderList(sheet.rules, root);
    }

    return {
        setDoc(newSheet) {
            sheet = newSheet;
            renderSelectorPalette();
            render();
        },
        insert
    };
}
