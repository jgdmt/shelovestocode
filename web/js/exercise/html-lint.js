// Finds the places where the browser has to guess what the student meant.
//
// The browser silently repairs broken HTML (an unclosed <h1> swallows what
// follows...). Before turning code into blocks we look for those repairs, so
// the student can fix them instead of seeing their code change behind their back:
//   1. lint: a tag stack over the source finds unclosed / stray / misnested tags
//   2. round trip: anything else the parser rearranged shows up as a
//      difference between the source and the regenerated code

import { VOID_TAGS } from "./blocks.js";

// Tags the browser adds on its own: never reported, never compared.
const IMPLIED_TAGS = new Set(["html", "head", "body"]);
const RAW_TEXT_TAGS = new Set(["script", "style"]);

const TOKEN = /<!--[\s\S]*?(?:-->|$)|<!doctype[^>]*>?|<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^'">])*)(>?)|[^<]+|</gi;
const ATTR = /([^\s"'=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

const decoder = document.createElement("textarea");
function decode(s) {
    decoder.innerHTML = s;
    return decoder.value;
}

function parseAttrs(source) {
    return [...source.matchAll(ATTR)].map((m) => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4] ?? "")]);
}

/**
 * Splits code into tokens:
 *   { kind: "open" | "close" | "text" | "broken", name, attrs, text, line }
 */
export function tokenize(code) {
    const tokens = [];
    let line = 1;
    let lastIndex = 0;
    const lineAt = (index) => {
        for (; lastIndex < index; lastIndex++) {
            if (code[lastIndex] === "\n")
                line++;
        }
        return line;
    };

    TOKEN.lastIndex = 0;
    let m;
    while ((m = TOKEN.exec(code)) !== null) {
        const at = lineAt(m.index);
        const [raw, slash, name, attrs, end] = m;

        if (raw.startsWith("<!"))
            continue;

        if (!name) {
            const value = decode(raw).replace(/\s+/g, " ").trim();
            if (value)
                tokens.push({ kind: "text", text: value, line: at });
            continue;
        }

        const tag = name.toLowerCase();
        // "<h1 Title</h1>": a "<" inside a tag means its ">" is missing
        if (!end || attrs.includes("<")) {
            tokens.push({ kind: "broken", name: tag, line: at });
            continue;
        }
        if (slash) {
            tokens.push({ kind: "close", name: tag, line: at });
            continue;
        }

        tokens.push({ kind: "open", name: tag, attrs: parseAttrs(attrs.replace(/\/\s*$/, "")), line: at });

        // script/style content is text until the matching closing tag
        if (RAW_TEXT_TAGS.has(tag)) {
            const closeAt = code.toLowerCase().indexOf(`</${tag}`, TOKEN.lastIndex);
            const stop = closeAt === -1 ? code.length : closeAt;
            const content = code.slice(TOKEN.lastIndex, stop).trim();
            if (content)
                tokens.push({ kind: "text", text: content.replace(/\s+/g, " "), line: lineAt(TOKEN.lastIndex) });
            TOKEN.lastIndex = stop;
        }
    }
    return tokens;
}

function lint(tokens) {
    const issues = [];
    const stack = [];
    const forcedClosed = []; // tags closed early by a misnesting, their own closing tag is expected later

    for (const token of tokens) {
        const { kind, name, line } = token;
        if (kind === "broken") {
            issues.push({ line, message: `The tag <${name}> on line ${line} is missing its closing ">".` });
        } else if (kind === "open") {
            if (!IMPLIED_TAGS.has(name) && !VOID_TAGS.has(name))
                stack.push(token);
        } else if (kind === "close" && !IMPLIED_TAGS.has(name)) {
            if (VOID_TAGS.has(name)) {
                issues.push({ line, message: `<${name}> never needs a closing tag: remove </${name}> on line ${line}.` });
                continue;
            }
            const index = stack.map((t) => t.name).lastIndexOf(name);
            if (index === -1) {
                const forced = forcedClosed.indexOf(name);
                if (forced !== -1) {
                    forcedClosed.splice(forced, 1);
                    continue;
                }
                issues.push({ line, message: `</${name}> on line ${line} closes a tag that was never opened.` });
                continue;
            }
            for (const open of stack.slice(index + 1)) {
                issues.push({ line: open.line, message: `<${open.name}> (line ${open.line}) must be closed before </${name}> (line ${line}).` });
                forcedClosed.push(open.name);
            }
            stack.length = index;
        }
    }

    for (const open of stack)
        issues.push({ line: open.line, message: `<${open.name}> (line ${open.line}) is never closed.` });

    return issues.sort((a, b) => a.line - b.line);
}

function tokenKey(token) {
    if (token.kind === "text")
        return `#${token.text}`;
    if (token.kind === "close")
        return `</${token.name}>`;
    return `<${token.name}${token.attrs.map(([name, value]) => ` ${name}="${value}"`).join("")}>`;
}

const comparable = (token) => !(token.kind !== "text" && IMPLIED_TAGS.has(token.name));

// Line of the first source token the regenerated code disagrees with, or null.
function firstDifference(source, regenerated) {
    const a = tokenize(source).filter(comparable);
    const b = tokenize(regenerated).filter(comparable);
    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i++) {
        if (!a[i] || !b[i] || tokenKey(a[i]) !== tokenKey(b[i]))
            return (a[i] || a[a.length - 1])?.line ?? 1;
    }
    return null;
}

/**
 * Returns [{ line, message }], empty when the browser read the code exactly
 * as written. regenerated is the code serialized back from the parsed blocks.
 */
export function findIssues(source, regenerated) {
    const issues = lint(tokenize(source));
    if (issues.length)
        return issues;
    const line = firstDifference(source, regenerated);
    if (line === null)
        return [];
    return [{ line, message: `The browser had to rearrange your code around line ${line}. Check that every tag is in the right place.` }];
}
