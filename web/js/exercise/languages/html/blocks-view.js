// HTML blocks: palette + tree of blocks inside <body>.
//
//   compact element   <h1> [text] </h1>         one line, text edited in place
//   container         <div ...> / zone / </div>  children in a nested drop zone
//   text              free text between tags (mixed content)
//   raw               gray block of code blocks can't represent
//
// config: { palette: [tags], attributes: bool } (see attributes.js).

import { h } from "../../ui/dom.js";
import { createDragDrop } from "../../blocks/drag-drop.js";
import { editable, deleteButton, rawBlock } from "../../blocks/parts.js";
import { tagChip, textChip, tagColor } from "../../blocks/chips.js";
import { VOID_TAGS, createNode, isCompact, canHaveChildren } from "./model.js";
import { createAttributes } from "./attributes.js";

// Node for a palette / inventory payload.
function nodeFor(payload) {
    if (payload.kind === "tag")
        return createNode(payload.value);
    if (payload.kind === "text")
        return createNode("#text");
    if (payload.kind === "image")
        return createNode("img", [{ name: "src", value: payload.value }]);
    return null;
}

export function createHtmlBlocksView(host, { config = {}, palette: defaultPalette, onChange }) {
    let doc = null;

    const palette = h("div", { class: "palette", "data-hint": "Drag a tag into <body>" });
    const head = h("div", { class: "sk-head" });
    const root = h("div", { class: "drop-zone zone", "data-empty": "Drop tags here" });
    host.append(palette, h("div", { class: "skeleton" },
        h("div", { class: "sk-tag" }, "<html>"),
        h("div", { class: "sk-indent" }, head, h("div", { class: "sk-tag" }, "<body>"), root, h("div", { class: "sk-tag" }, "</body>")),
        h("div", { class: "sk-tag" }, "</html>")));

    const edited = () => onChange(doc); // no re-render: it would lose the caret
    const commit = () => {
        render();
        onChange(doc);
    };

    const attributes = createAttributes({ editable: config.attributes === true, onEdit: edited, onCommit: commit });

    const dnd = createDragDrop(root, {
        create: nodeFor,
        accepts: () => true,
        // the middle of a one-line element means "put it inside"
        dropInto: (target) => (canHaveChildren(target) && isCompact(target) ? target.children : null),
        onDrop: commit
    });

    (config.palette || defaultPalette).forEach((tag) => palette.appendChild(tagChip(tag, () => add(createNode(tag)))));
    palette.appendChild(textChip(() => add(createNode("#text"))));

    function add(node) {
        doc.body.push(node);
        commit();
    }

    function remove(node, list) {
        list.splice(list.indexOf(node), 1);
        commit();
    }

    const removeButton = (node, list) => deleteButton(() => remove(node, list));
    const openTag = (node) => h("span", { class: `tag-open ${tagColor(node.tag)}` }, `<${node.tag}`, ...attributes.render(node), ">");
    const closeTag = (node) => h("span", { class: `block-tag ${tagColor(node.tag)}` }, `</${node.tag}>`);

    function renderCompact(block, grip, node, list) {
        block.append(grip, openTag(node));
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
        block.append(removeButton(node, list));
    }

    function renderContainer(block, grip, node, list) {
        block.classList.add("container");
        const zone = h("div", { class: "zone", "data-empty": "Drop tags here" });
        renderList(node.children, zone);
        block.append(
            h("div", { class: "block-row" }, grip, openTag(node), removeButton(node, list)),
            zone,
            // the empty grip-sized slot puts </div> right under <div>
            h("div", { class: "block-row" }, h("span", { class: "grip-slot" }), closeTag(node)));
    }

    function renderText(block, grip, node, list) {
        block.classList.add("text-block");
        block.append(
            grip,
            h("span", { class: "block-label" }, "text"),
            editable(node.value, "block-text", (value) => { node.value = value; edited(); }),
            removeButton(node, list));
    }

    function renderNode(node, list) {
        const block = h("div", { class: "block" });
        const grip = dnd.block(block, node, list);
        if (node.type === "text")
            renderText(block, grip, node, list);
        else if (node.type === "raw")
            rawBlock(block, grip, node.html, (value) => { node.html = value; edited(); }, () => remove(node, list));
        else if (isCompact(node))
            renderCompact(block, grip, node, list);
        else
            renderContainer(block, grip, node, list);
        return block;
    }

    function renderList(list, zone) {
        dnd.zone(zone, list);
        zone.replaceChildren(...list.map((node) => renderNode(node, list)));
    }

    // <head> is not editable as blocks, but its content (a <link> to the CSS...) is shown.
    function renderHead() {
        head.replaceChildren(...(doc.head
            ? [h("div", { class: "sk-tag" }, "<head>"),
                h("pre", { class: "sk-head-code" }, doc.head.replace(/\n\s*/g, "\n")),
                h("div", { class: "sk-tag" }, "</head>")]
            : [h("div", { class: "sk-tag" }, "<head></head>")]));
    }

    function render() {
        renderHead();
        renderList(doc.body, root);
    }

    return {
        setDoc(newDoc) {
            doc = newDoc;
            render();
        },
        insert(payload) {
            const node = nodeFor(payload);
            if (node)
                add(node);
        }
    };
}
