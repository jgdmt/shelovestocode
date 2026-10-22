// Drag & drop shared by every blocks view.
//
// A view renders its nodes as blocks inside zones: a zone shows one list of
// nodes, a block shows one node of that list. The view registers them here and
// describes its rules:
//   create(payload)        node for something dragged from a palette (null to refuse)
//   accepts(list, node)    may node live in that list
//   dropInto(target, node) list of target where node goes when dropped on the
//                          middle of target's block, or null
//   childLists(node)       lists owned by node (a block can't go inside itself)
//   onDrop()               the lists changed

import { h, icon } from "../ui/dom.js";

// Payload of the palette/inventory chip being dragged, readable during dragover
// (dataTransfer content is only readable on drop).
let incoming = null;

export function startNewDrag(e, payload) {
    incoming = payload;
    e.dataTransfer.setData("application/x-block", JSON.stringify(payload));
}

export function endNewDrag() {
    incoming = null;
}

export function createDragDrop(root, { create, accepts, dropInto = () => null, childLists = (node) => (node.children ? [node.children] : []), onDrop }) {
    const blockInfo = new WeakMap(); // block element -> { node, list }
    const zoneList = new WeakMap();  // zone element  -> list
    const indicator = h("div", { class: "drop-indicator" });
    let dragged = null;              // { node, list } while moving a block
    let highlighted = null;

    const owns = (node, list) => childLists(node).some((l) => l === list || l.some((child) => owns(child, list)));
    const draggedNode = () => dragged?.node ?? (incoming ? create(incoming) : null);

    function isAllowed(list, node) {
        return node && accepts(list, node) && !(dragged && owns(dragged.node, list));
    }

    // Where a drop at the pointer would land in zone: { into, block } or { list, zone, index, before }.
    function targetIn(zone, e, node) {
        const list = zoneList.get(zone);
        const items = [...zone.children].filter((child) => blockInfo.has(child));

        for (let i = 0; i < items.length; i++) {
            const rect = items[i].getBoundingClientRect();
            if (e.clientY < rect.top)
                return { list, zone, index: i, before: items[i] };
            if (e.clientY > rect.bottom)
                continue;
            const ratio = (e.clientY - rect.top) / rect.height;
            const into = dropInto(blockInfo.get(items[i]).node, node);
            if (into && ratio > 0.25 && ratio < 0.75 && isAllowed(into, node))
                return { list: into, into: true, block: items[i] };
            return ratio < 0.5
                ? { list, zone, index: i, before: items[i] }
                : { list, zone, index: i + 1, before: items[i + 1] || null };
        }
        return { list, zone, index: items.length, before: null };
    }

    // The innermost zone that accepts the node, walking up from the pointer.
    function findTarget(e, node) {
        for (let zone = e.target.closest(".zone"); zone && root.contains(zone); zone = zone.parentElement?.closest(".zone")) {
            if (!zoneList.has(zone))
                continue;
            const target = targetIn(zone, e, node);
            if (isAllowed(target.list, node))
                return target;
        }
        return null;
    }

    function clearFeedback() {
        indicator.remove();
        highlighted?.classList.remove("drop-into");
        highlighted = null;
        root.classList.remove("over");
    }

    root.addEventListener("dragover", (e) => {
        clearFeedback();
        const target = findTarget(e, draggedNode());
        if (!target)
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
            clearFeedback();
    });

    root.addEventListener("drop", (e) => {
        e.preventDefault();
        clearFeedback();
        const node = draggedNode();
        const target = findTarget(e, node);
        incoming = null;
        if (!target)
            return;

        if (dragged) {
            const from = dragged.list.indexOf(node);
            dragged.list.splice(from, 1);
            if (dragged.list === target.list && from < target.index)
                target.index--;
        }
        if (target.into)
            target.list.push(node);
        else
            target.list.splice(target.index, 0, node);
        onDrop();
    });

    return {
        zone(element, list) {
            zoneList.set(element, list);
        },

        // Registers a block and returns its grip: only the grip starts a drag,
        // so texts inside the block stay selectable.
        block(element, node, list) {
            blockInfo.set(element, { node, list });
            element.addEventListener("dragstart", (e) => {
                e.stopPropagation(); // don't let parent blocks think they're dragged
                e.dataTransfer.setData("application/x-move", "");
                dragged = { node, list };
                element.classList.add("dragging");
            });
            element.addEventListener("dragend", (e) => {
                e.stopPropagation();
                dragged = null;
                element.draggable = false;
                element.classList.remove("dragging");
                clearFeedback();
            });
            return h("span", {
                class: "grip",
                title: "Drag to move",
                onMousedown: () => { element.draggable = true; },
                onMouseup: () => { element.draggable = false; }
            }, icon("grip"));
        }
    };
}
