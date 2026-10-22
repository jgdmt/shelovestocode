// Where inventory items land in a CSS file edited as code.

import { CSS_PROPERTIES } from "../../../exercises/inventory.js";

// Is the cursor between the { } of a rule?
function insideRule(code, index) {
    let depth = 0;
    for (let i = 0; i < index; i++) {
        if (code.startsWith("/*", i)) {
            const end = code.indexOf("*/", i + 2);
            i = end === -1 ? index : end + 1;
        } else if (code[i] === "{") {
            depth++;
        } else if (code[i] === "}") {
            depth = Math.max(0, depth - 1);
        }
    }
    return depth > 0;
}

// A declaration goes where the cursor is if it's inside a rule, else at the
// end of the last rule (or in a new "body" rule).
function declarationSnippet(declaration, { code, cursor }) {
    if (insideRule(code, cursor))
        return { text: declaration, cursor: declaration.length };
    const close = code.lastIndexOf("}");
    if (close === -1) {
        const text = `${code && !code.endsWith("\n") ? "\n" : ""}body {\n  ${declaration}\n}\n`;
        return { text, cursor: text.indexOf(declaration) + declaration.length, at: code.length };
    }
    const text = code[close - 1] === "\n" ? `  ${declaration}\n` : ` ${declaration} `;
    return { text, cursor: text.indexOf(declaration) + declaration.length, at: close };
}

// A new rule goes at the cursor, or at the end of the file when the cursor is inside a rule.
function ruleSnippet(selector, { code, cursor }) {
    const rule = `${selector} {\n  \n}\n`;
    const inside = insideRule(code, cursor);
    const text = inside ? `${code.endsWith("\n") ? "" : "\n"}\n${rule}` : rule;
    return { text, cursor: text.indexOf("{\n  ") + 4, at: inside ? code.length : undefined };
}

export function snippet(payload, context = { code: "", cursor: 0 }) {
    if (payload.kind === "tag" || payload.kind === "selector")
        return ruleSnippet(payload.value, context);
    if (payload.kind === "property")
        return declarationSnippet(`${payload.value}: ${CSS_PROPERTIES[payload.value]?.example ?? ""};`, context);
    if (payload.kind === "image")
        return declarationSnippet(`background-image: url("${payload.value}");`, context);
    return null;
}
