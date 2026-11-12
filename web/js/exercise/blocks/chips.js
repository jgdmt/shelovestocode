// Colored chips for the inventory and the blocks palettes.

import { chip } from "./parts.js";
import { ui } from "../core/i18n.js";

export function tagColor(tag) {
    if (/^h[1-6]$/.test(tag))
        return "tag-h";
    if (tag === "p")
        return "tag-p";
    if (tag === "img")
        return "tag-img";
    return "tag-other";
}

export const tagChip = (tag, onClick) =>
    chip(`<${tag}>`, tagColor(tag), { kind: "tag", value: tag }, { onClick });

export const textChip = (onClick) =>
    chip(ui("blocks.text"), "tag-text", { kind: "text" }, { onClick, title: ui("blocks.textTitle") });

export const propertyChip = (property, onClick) =>
    chip(property, "chip-property", { kind: "property", value: property }, { onClick });

export const selectorChip = (selector, onClick) =>
    chip(selector, "chip-selector", { kind: "selector", value: selector }, { onClick });
