// Center panel, blocks mode: palette + tree of blocks inside <body>.
// Owns the body nodes and calls onChange(body) after every edit.
//
// Rendering:
//   compact element   <h1> [text] </h1>         one line, text edited in place
//   container         <div ...> / zone / </div>  children in a nested drop zone
//   text              free text between tags (mixed content)
//   raw               gray block of code blocks can't represent

import { h } from "./dom.js";
import { VOID_TAGS, createNode, isCompact, canHaveChildren } from "./blocks.js";
import { tagChip, tagColor } from "./chips.js";

// contentEditable span; Enter validates instead of inserting a line break.
function editable(value, className, onInput) {
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

function contains(node, target) {
    return node === target || (node.children || []).some((child) => contains(child, target));
}

export function createBlocksView({ palette, root, tags, onChange }) {
    let body = [];
    let dragged = null;          // { node, list } while moving a block
    let highlighted = null;      // block showing a "drop into" outline
    let focusAfterRender = null; // attribute whose name should get the focus

    const blockInfo = new WeakMap(); // block element -> { node, list }
    const zoneList = new WeakMap();  // zone element  -> list of nodes it shows
    const indicator = h("div", { class: "drop-indicator" });

    const edited = () => onChange(body); // no re-render: it would lose the caret
    const commit = () => {
        render();
        onChange(body);
    };

    [...tags, "#text"].forEach((tag) => palette.appendChild(tagChip(tag, () => add(createNode(tag)))));

    function add(node) {
        body.push(node);
        commit();
    }

    function remove(node, list) {
        list.splice(list.indexOf(node), 1);
        commit();
    }

    /* ---------- drag & drop ---------- */

    // Where a drop at the pointer would land: { into } or { list, index, zone, before }.
    function dropTarget(e) {
        const zone = e.target.closest(".zone");
        if (!zone || !root.contains(zone))
            return null;
        const list = zoneList.get(zone);
        const items = [...zone.children].filter((child) => blockInfo.has(child));

        for (let i = 0; i < items.length; i++) {
            const rect = items[i].getBoundingClientRect();
            if (e.clientY < rect.top)
                return { list, zone, index: i, before: items[i] };
            if (e.clientY > rect.bottom)
                continue;
            const { node } = blockInfo.get(items[i]);
            const ratio = (e.clientY - rect.top) / rect.height;
            // the middle of a one-line element means "put it inside"
            if (canHaveChildren(node) && isCompact(node) && ratio > 0.25 && ratio < 0.75)
                return { into: node, block: items[i] };
            return ratio < 0.5
                ? { list, zone, index: i, before: items[i] }
                : { list, zone, index: i + 1, before: items[i + 1] || null };
        }
        return { list, zone, index: items.length, before: null };
    }

    // A block can't be dropped inside itself.
    function isAllowed(target) {
        if (!dragged)
            return true;
        if (target.into)
            return !contains(dragged.node, target.into);
        return !ownsList(dragged.node, target.list);
    }

    // true when list is the children of node or of one of its descendants
    function ownsList(node, list) {
        return node.children === list || (node.children || []).some((child) => ownsList(child, list));
    }

    function clearDropFeedback() {
        indicator.remove();
        highlighted?.classList.remove("drop-into");
        highlighted = null;
        root.classList.remove("over");
    }

    root.addEventListener("dragover", (e) => {
        const target = dropTarget(e);
        clearDropFeedback();
        if (!target || !isAllowed(target))
            return;
        e.preventDefault();
        root.classList.add("over");
        if (target.into) {
            highlighted = target.block;
            highlighted.classList.add("drop-into");
        } else {
            target.zone.insertBefore(indicator, target.before);
        }
    });

    root.addEventListener("dragleave", (e) => {
        if (!root.contains(e.relatedTarget))
            clearDropFeedback();
    });

    root.addEventListener("drop", (e) => {
        e.preventDefault();
        const target = dropTarget(e);
        clearDropFeedback();
        if (!target || !isAllowed(target))
            return;

        const tag = e.dataTransfer.getData("application/x-tag");
        let node;
        if (tag) {
            node = createNode(tag);
        } else if (dragged) {
            node = dragged.node;
            const from = dragged.list.indexOf(node);
            dragged.list.splice(from, 1);
            if (dragged.list === target.list && from < target.index)
                target.index--;
        } else {
            return;
        }

        if (target.into)
            target.into.children.push(node);
        else
            target.list.splice(target.index, 0, node);
        commit();
    });

    // Only the grip starts a drag, so texts stay selectable.
    function grip(block, node, list) {
        block.addEventListener("dragstart", (e) => {
            e.stopPropagation(); // don't let parent blocks think they're dragged
            e.dataTransfer.setData("application/x-move", "");
            dragged = { node, list };
            block.classList.add("dragging");
        });
        block.addEventListener("dragend", (e) => {
            e.stopPropagation();
            dragged = null;
            block.draggable = false;
            block.classList.remove("dragging");
            clearDropFeedback();
        });
        return h("span", {
            class: "grip",
            title: "Drag to move",
            onMousedown: () => { block.draggable = true; },
            onMouseup: () => { block.draggable = false; }
        }, "⠿");
    }

    const deleteButton = (node, list) =>
        h("button", { class: "block-del", title: "Remove", onClick: () => remove(node, list) }, "×");

    /* ---------- rendering ---------- */

    function renderAttrs(node) {
        const pills = node.attrs.map((attr) => {
            const name = editable(attr.name, "attr-name", (value) => { attr.name = value; edited(); });
            if (attr === focusAfterRender)
                requestAnimationFrame(() => name.focus());
            return h("span", { class: "attr" },
                name, "=\"",
                editable(attr.value, "attr-value", (value) => { attr.value = value; edited(); }),
                "\"",
                h("button", {
                    class: "attr-del",
                    title: "Remove this attribute",
                    onClick: () => { node.attrs.splice(node.attrs.indexOf(attr), 1); commit(); }
                }, "×"));
        });
        const addButton = h("button", {
            class: "attr-add",
            title: "Add an attribute",
            onClick: () => {
                focusAfterRender = { name: "", value: "" };
                node.attrs.push(focusAfterRender);
                commit();
            }
        }, "+");
        return [...pills, addButton];
    }

    // "<div" + attributes + ">" or just "<div>" when there are no attributes
    function openTag(node) {
        const color = tagColor(node.tag);
        if (!node.attrs.length)
            return [h("span", { class: `block-tag ${color}` }, `<${node.tag}>`), ...renderAttrs(node)];
        const attrs = renderAttrs(node);
        const addButton = attrs.pop();
        return [
            h("span", { class: `block-tag ${color}` }, `<${node.tag}`),
            ...attrs,
            h("span", { class: `block-tag ${color}` }, ">"),
            addButton
        ];
    }

    const closeTag = (node) => h("span", { class: `block-tag ${tagColor(node.tag)}` }, `</${node.tag}>`);

    function renderCompact(block, node, list) {
        block.append(grip(block, node, list), ...openTag(node));
        if (!VOID_TAGS.has(node.tag)) {
            block.append(editable(node.children[0]?.value ?? "", "block-text", (value) => {
                if (node.children.length)
                    node.children[0].value = value;
                else
                    node.children.push({ type: "text", value });
                edited();
            }));
            block.append(closeTag(node));
        }
        block.append(deleteButton(node, list));
    }

    function renderContainer(block, node, list) {
        block.classList.add("container");
        const zone = h("div", { class: "zone" });
        renderList(node.children, zone);
        block.append(
            h("div", { class: "block-row" }, grip(block, node, list), ...openTag(node), h("span", { class: "spacer" }), deleteButton(node, list)),
            zone,
            h("div", { class: "block-row" }, closeTag(node)));
    }

    function renderText(block, node, list) {
        block.classList.add("text-block");
        block.append(
            grip(block, node, list),
            h("span", { class: "block-label" }, "text"),
            editable(node.value, "block-text", (value) => { node.value = value; edited(); }),
            deleteButton(node, list));
    }

    function renderRaw(block, node, list) {
        block.classList.add("raw-block");
        const area = h("textarea", {
            class: "raw-code",
            spellcheck: false,
            value: node.html,
            rows: node.html.split("\n").length,
            onInput: () => {
                node.html = area.value;
                area.rows = area.value.split("\n").length;
                edited();
            }
        });
        block.append(
            h("div", { class: "block-row" },
                grip(block, node, list),
                h("span", { class: "block-label", title: "Blocks can't show this yet: edit it as code" }, "code"),
                h("span", { class: "spacer" }),
                deleteButton(node, list)),
            area);
    }

    function renderNode(node, list) {
        const block = h("div", { class: "block" });
        blockInfo.set(block, { node, list });
        if (node.type === "text")
            renderText(block, node, list);
        else if (node.type === "raw")
            renderRaw(block, node, list);
        else if (isCompact(node))
            renderCompact(block, node, list);
        else
            renderContainer(block, node, list);
        return block;
    }

    function renderList(list, zone) {
        zoneList.set(zone, list);
        zone.replaceChildren(...list.map((node) => renderNode(node, list)));
    }

    function render() {
        renderList(body, root);
        focusAfterRender = null;
    }

    return {
        add,
        setBody(nodes) {
            body = nodes;
            render();
        }
    };
}
