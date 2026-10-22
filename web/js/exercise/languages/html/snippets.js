// Where inventory items land in an HTML file edited as code.

import { VOID_TAGS } from "./model.js";

// Content goes where the cursor is, unless it's outside <body>: then it goes
// on a new line just before </body>.
function insideBody(text, cursor, { code, cursor: at }) {
    const open = /<body[^>]*>/i.exec(code);
    const close = code.search(/<\/body>/i);
    if (!open || close === -1 || (at >= open.index + open[0].length && at <= close))
        return { text, cursor };
    const lineStart = code.lastIndexOf("\n", close - 1) + 1;
    const before = code.slice(lineStart, close);
    if (before.trim())
        return { text, cursor, at: close };
    const indent = `${before}  `;
    return { text: `${indent}${text}\n`, cursor: indent.length + cursor, at: lineStart };
}

export function snippet(payload, context = { code: "", cursor: 0 }) {
    let text;
    if (payload.kind === "tag")
        text = VOID_TAGS.has(payload.value) ? `<${payload.value}>` : `<${payload.value}></${payload.value}>`;
    else if (payload.kind === "image")
        text = `<img src="${payload.value}">`;
    else
        return null;
    // caret between the opening and the closing tag
    const cursor = text.includes("</") ? text.lastIndexOf("</") : text.length;
    return insideBody(text, cursor, context);
}
