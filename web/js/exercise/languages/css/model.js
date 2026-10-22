// CSS model: stylesheet code <-> list of rules. Pure functions, no UI.
//
// We parse the source ourselves instead of using the CSSOM, which rewrites
// values (#FF0000 becomes rgb(255, 0, 0)): blocks must show what was typed.
//
// A stylesheet is { rules: [nodes], errors: [{ line, message }] }:
//   { type: "rule", selector, declarations: [items], line }
//       item: { type: "declaration", property, value, line } | { type: "comment", text, line }
//   { type: "raw", css, line }     at-rules (@media...) and comments between rules
//
// parse() never fails: like a browser it recovers from missing "}", ";" or
// ":", and reports in `errors` what it had to guess.

const short = (text) => {
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > 30 ? `${flat.slice(0, 30)}…` : flat;
};

export function createRule(selector) {
    return { type: "rule", selector, declarations: [] };
}

export function createDeclaration(property, value = "") {
    return { type: "declaration", property, value };
}

function lineCounter(code) {
    const starts = [0];
    for (let i = 0; i < code.length; i++) {
        if (code[i] === "\n")
            starts.push(i + 1);
    }
    return (index) => {
        let line = 0;
        while (line + 1 < starts.length && starts[line + 1] <= index)
            line++;
        return line + 1;
    };
}

// End of a declaration: ";" outside quotes and parentheses, or a comment.
function declarationEnd(code, from, to) {
    let depth = 0;
    let quote = null;
    for (let i = from; i < to; i++) {
        const ch = code[i];
        if (quote) {
            if (ch === quote)
                quote = null;
        } else if (ch === "\"" || ch === "'") {
            quote = ch;
        } else if (ch === "(") {
            depth++;
        } else if (ch === ")") {
            depth--;
        } else if (depth <= 0 && (ch === ";" || code.startsWith("/*", i))) {
            return i;
        }
    }
    return to;
}

function parseDeclarations(code, from, to, lineAt, errors) {
    const items = [];
    let i = from;

    while (i < to) {
        while (i < to && /\s/.test(code[i]))
            i++;
        if (i >= to)
            break;

        if (code.startsWith("/*", i)) {
            const close = code.indexOf("*/", i + 2);
            const end = close === -1 || close + 2 > to ? to : close + 2;
            items.push({ type: "comment", text: code.slice(i, end), line: lineAt(i) });
            i = end;
            continue;
        }

        const end = declarationEnd(code, i, to);
        let text = code.slice(i, end);
        const line = lineAt(i);
        let next = code[end] === ";" ? end + 1 : end;

        const colon = text.indexOf(":");
        if (colon === -1) {
            errors.push({ line, message: `"${short(text)}" (line ${line}) is missing a ":" between the property and its value.` });
            i = next;
            continue;
        }

        // "color: red⏎ font-size: 12px": a forgotten ";" glues two declarations
        const glued = /\n\s*-?[a-zA-Z][\w-]*\s*:/.exec(text.slice(colon + 1));
        if (glued) {
            const cut = colon + 1 + glued.index;
            errors.push({ line, message: `Missing ";" at the end of line ${line}.` });
            text = text.slice(0, cut);
            next = i + cut;
        }

        const property = text.slice(0, colon).trim().toLowerCase();
        const value = text.slice(colon + 1).replace(/\s+/g, " ").trim();
        if (!property)
            errors.push({ line, message: `The value "${short(value)}" (line ${line}) has no property name before its ":".` });
        else
            items.push({ type: "declaration", property, value, line });
        i = next;
    }
    return items;
}

// "@media ... { ... }" or "@import ...;": kept as raw code.
function atRuleEnd(code, from, lineAt, errors) {
    const semicolon = code.indexOf(";", from);
    const open = code.indexOf("{", from);
    if (open === -1 || (semicolon !== -1 && semicolon < open))
        return semicolon === -1 ? code.length : semicolon + 1;

    let depth = 0;
    for (let i = open; i < code.length; i++) {
        if (code[i] === "{")
            depth++;
        else if (code[i] === "}" && --depth === 0)
            return i + 1;
    }
    errors.push({ line: lineAt(from), message: `The block starting line ${lineAt(from)} is never closed: add a "}".` });
    return code.length;
}

export function parse(code) {
    const lineAt = lineCounter(code);
    const rules = [];
    const errors = [];
    let i = 0;

    while (i < code.length) {
        while (i < code.length && /\s/.test(code[i]))
            i++;
        if (i >= code.length)
            break;
        const line = lineAt(i);

        if (code.startsWith("/*", i)) {
            const close = code.indexOf("*/", i + 2);
            if (close === -1)
                errors.push({ line, message: `The comment starting line ${line} is never closed: add "*/".` });
            const end = close === -1 ? code.length : close + 2;
            const css = close === -1 ? `${code.slice(i).trimEnd()} */` : code.slice(i, end);
            rules.push({ type: "raw", css, line });
            i = end;
            continue;
        }

        if (code[i] === "@") {
            const end = atRuleEnd(code, i, lineAt, errors);
            rules.push({ type: "raw", css: code.slice(i, end).trim(), line });
            i = end;
            continue;
        }

        const open = code.indexOf("{", i);
        const stray = code.indexOf("}", i);
        if (open === -1 || (stray !== -1 && stray < open)) {
            const end = stray !== -1 && (open === -1 || stray < open) ? stray + 1 : code.length;
            const text = code.slice(i, end).trim();
            errors.push({
                line,
                message: text === "}"
                    ? `"}" on line ${line} closes a rule that was never opened.`
                    : `"${short(text)}" (line ${line}) is not inside a rule: it needs a selector and { }.`
            });
            i = end;
            continue;
        }

        const selector = code.slice(i, open).replace(/\s+/g, " ").trim();
        const close = code.indexOf("}", open + 1);
        const nextOpen = code.indexOf("{", open + 1);
        let bodyEnd = close;
        let resume = close + 1;

        if (close === -1 || (nextOpen !== -1 && nextOpen < close)) {
            errors.push({ line, message: `The rule "${short(selector)}" (line ${line}) is never closed: add a "}".` });
            if (nextOpen === -1) {
                bodyEnd = resume = code.length;
            } else {
                // the next rule starts on the line of the next "{"
                const lineStart = code.lastIndexOf("\n", nextOpen) + 1;
                const semicolon = code.lastIndexOf(";", nextOpen);
                bodyEnd = resume = Math.max(lineStart > open ? lineStart : open + 1, semicolon > open ? semicolon + 1 : open + 1);
            }
        }

        rules.push({ type: "rule", selector, declarations: parseDeclarations(code, open + 1, bodyEnd, lineAt, errors), line });
        i = resume;
    }

    return { rules, errors };
}

export function serialize({ rules }) {
    const blocks = rules.map((rule) => {
        if (rule.type === "raw")
            return rule.css;
        const lines = rule.declarations
            .filter((item) => item.type === "comment" || item.property || item.value)
            .map((item) => (item.type === "comment" ? `  ${item.text}` : `  ${item.property}: ${item.value};`));
        return `${rule.selector} {\n${lines.map((l) => `${l}\n`).join("")}}`;
    });
    return blocks.length ? `${blocks.join("\n\n")}\n` : "";
}
