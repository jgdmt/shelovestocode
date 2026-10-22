// Blocks model: HTML code <-> tree of nodes. Pure functions, no UI.
//
// A document is { doctype, htmlAttrs, head, body } where head is kept as raw
// HTML and body is a list of nodes:
//   { type: "element", tag, attrs: [{ name, value }], children: [nodes] }
//   { type: "text", value }
//   { type: "raw", html }     anything blocks can't show (comments, scripts...)

export const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

// Tags that flow inside text and can share a line with it.
const INLINE_TAGS = new Set(["a", "abbr", "b", "br", "code", "em", "i", "img", "mark", "small", "span", "strong", "sub", "sup", "u"]);

// Tags whose content is not plain HTML: kept as raw code.
const RAW_TAGS = new Set(["script", "style", "template", "svg", "math", "noscript"]);

const ATTR_NAME = /^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/;

/* ---------- node creation ---------- */

const text = (value) => ({ type: "text", value });
const element = (tag, attrs = [], children = []) => ({ type: "element", tag, attrs, children });

// tag "#text" creates a text node.
export function createNode(tag, attrs) {
    if (tag === "#text")
        return text("Some text");
    if (tag === "img")
        return element("img", attrs || [{ name: "src", value: "/images/archi.jpg" }]);
    if (tag === "a")
        return element("a", attrs || [{ name: "href", value: "https://" }], [text("A link")]);
    if (VOID_TAGS.has(tag))
        return element(tag, attrs);
    if (/^h[1-6]$/.test(tag))
        return element(tag, attrs, [text("My title")]);
    if (tag === "p")
        return element(tag, attrs, [text("Some text")]);
    return element(tag, attrs);
}

// An element whose content is at most one piece of text, shown on one line.
export function isCompact(node) {
    return node.children.length === 0
        || (node.children.length === 1 && node.children[0].type === "text");
}

export function canHaveChildren(node) {
    return node.type === "element" && !VOID_TAGS.has(node.tag);
}

/* ---------- parsing ---------- */

const readAttrs = (el) => [...el.attributes].map(({ name, value }) => ({ name, value }));

function flowsInline(node) {
    return node && (node.nodeType === Node.TEXT_NODE
        || (node.nodeType === Node.ELEMENT_NODE && INLINE_TAGS.has(node.tagName.toLowerCase())));
}

function readChildren(parent) {
    const childNodes = [...parent.childNodes];
    const nodes = [];

    childNodes.forEach((child, i) => {
        if (child.nodeType === Node.COMMENT_NODE) {
            nodes.push({ type: "raw", html: `<!--${child.data}-->` });
        } else if (child.nodeType === Node.TEXT_NODE) {
            // whitespace with a line break is just indentation
            if (!child.textContent.trim() && child.textContent.includes("\n"))
                return;
            let value = child.textContent.replace(/\s+/g, " ");
            if (i === 0)
                value = value.trimStart();
            if (i === childNodes.length - 1)
                value = value.trimEnd();
            // a lone space only matters between two pieces of inline content
            if (value === " " && !(flowsInline(childNodes[i - 1]) && flowsInline(childNodes[i + 1])))
                return;
            if (value)
                nodes.push(text(value));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const tag = child.tagName.toLowerCase();
            if (RAW_TAGS.has(tag))
                nodes.push({ type: "raw", html: child.outerHTML });
            else
                nodes.push(element(tag, readAttrs(child), VOID_TAGS.has(tag) ? [] : readChildren(child)));
        }
    });
    return nodes;
}

// Never fails: the browser parser always produces a document, even from broken code.
export function parse(code) {
    const doc = new DOMParser().parseFromString(code, "text/html");
    return {
        doctype: /^\s*<!doctype\s+html\s*>/i.test(code),
        htmlAttrs: readAttrs(doc.documentElement),
        head: doc.head.innerHTML.trim(),
        body: readChildren(doc.body)
    };
}

/* ---------- serialization ---------- */

const escapeText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function attrsToHtml(attrs) {
    return attrs
        .filter((attr) => ATTR_NAME.test(attr.name))
        .map((attr) => attr.value === "" ? ` ${attr.name}` : ` ${attr.name}="${escapeAttr(attr.value)}"`)
        .join("");
}

function fitsOnOneLine(node) {
    return node.type === "text"
        || (node.type === "element" && node.children.every((child) =>
            child.type === "text" || (child.type === "element" && INLINE_TAGS.has(child.tag) && fitsOnOneLine(child))));
}

const isInline = (node) => node.type === "text"
    || (node.type === "element" && INLINE_TAGS.has(node.tag) && fitsOnOneLine(node));

function inlineHtml(node) {
    if (node.type === "text")
        return escapeText(node.value);
    if (node.type === "raw")
        return node.html;
    const open = `<${node.tag}${attrsToHtml(node.attrs)}>`;
    if (VOID_TAGS.has(node.tag))
        return open;
    return `${open}${node.children.map(inlineHtml).join("")}</${node.tag}>`;
}

// Lines of a list of nodes; consecutive inline nodes share a line.
function childLines(nodes, depth) {
    const pad = "  ".repeat(depth);
    const lines = [];
    let run = "";
    const flush = () => {
        if (run.trim())
            lines.push(pad + run.trim());
        run = "";
    };

    for (const node of nodes) {
        if (isInline(node)) {
            run += inlineHtml(node);
            continue;
        }
        flush();
        if (node.type === "raw" || fitsOnOneLine(node)) {
            lines.push(pad + inlineHtml(node));
        } else {
            lines.push(`${pad}<${node.tag}${attrsToHtml(node.attrs)}>`);
            lines.push(...childLines(node.children, depth + 1));
            lines.push(`${pad}</${node.tag}>`);
        }
    }
    flush();
    return lines;
}

export function serialize({ doctype, htmlAttrs, head, body }) {
    return [
        ...(doctype ? ["<!DOCTYPE html>"] : []),
        `<html${attrsToHtml(htmlAttrs)}>`,
        "  <head>",
        ...(head ? [`    ${head}`] : []),
        "  </head>",
        "  <body>",
        ...childLines(body, 2),
        "  </body>",
        "</html>"
    ].join("\n");
}
