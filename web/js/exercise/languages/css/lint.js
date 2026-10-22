// CSS diagnostics. The browser silently ignores what it doesn't understand
// (a typo in a property, an invalid color...): we tell the student instead.
// Validation relies on the browser itself through CSS.supports().

import { parse } from "./model.js";

// Shorthands are not listed by getComputedStyle, which only gives longhands.
const SHORTHANDS = ["animation", "background", "border", "border-bottom", "border-color", "border-left", "border-radius",
    "border-right", "border-style", "border-top", "border-width", "columns", "flex", "flex-flow", "font", "gap", "grid",
    "grid-area", "grid-template", "inset", "list-style", "margin", "outline", "overflow", "padding", "place-content",
    "place-items", "text-decoration", "transition"];

let knownProperties = null;
function known() {
    if (!knownProperties)
        knownProperties = new Set([...getComputedStyle(document.documentElement), ...SHORTHANDS]);
    return knownProperties;
}

function distance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        let previous = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const current = row[j];
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
            previous = current;
        }
    }
    return row[b.length];
}

function suggest(property) {
    let best = null;
    let bestDistance = property.length > 6 ? 3 : 2;
    for (const candidate of known()) {
        const d = distance(property, candidate);
        if (d <= bestDistance && !candidate.startsWith("-")) {
            best = candidate;
            bestDistance = d;
        }
    }
    return best;
}

/** Message explaining why a declaration is ignored by the browser, or null. */
export function checkDeclaration(property, value) {
    if (!property)
        return "This declaration has no property name.";
    if (property.startsWith("--"))
        return null; // custom property: anything goes
    if (!CSS.supports(property, "initial")) {
        const hint = suggest(property);
        return `"${property}" is not a CSS property.${hint ? ` Did you mean "${hint}"?` : ""}`;
    }
    const bare = value.replace(/\s*!important\s*$/i, "");
    if (!bare)
        return `"${property}" has no value.`;
    if (!CSS.supports(property, bare))
        return `"${bare}" is not a valid value for "${property}".`;
    return null;
}

export function isValidSelector(selector) {
    try {
        document.createDocumentFragment().querySelector(selector);
        return true;
    } catch {
        return false;
    }
}

/** [{ line, message, severity }]: errors break the structure, warnings are ignored declarations. */
export function diagnose(code) {
    const { rules, errors } = parse(code);
    const issues = errors.map((error) => ({ ...error, severity: "error" }));

    for (const rule of rules) {
        if (rule.type !== "rule")
            continue;
        if (!isValidSelector(rule.selector))
            issues.push({ line: rule.line, severity: "warning", message: `"${rule.selector}" (line ${rule.line}) is not a valid selector.` });
        for (const item of rule.declarations) {
            const problem = item.type === "declaration" && checkDeclaration(item.property, item.value);
            if (problem)
                issues.push({ line: item.line, severity: "warning", message: `Line ${item.line}: ${problem}` });
        }
    }
    return issues.sort((a, b) => a.line - b.line);
}
