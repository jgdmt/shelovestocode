// CSS diagnostics. The browser silently ignores what it doesn't understand
// (a typo in a property, an invalid color...): we tell the student instead.
// Validation relies on the browser itself through CSS.supports().

import { parse } from "./model.js";
import { ui } from "../../core/i18n.js";

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
        return ui("css.noProperty");
    if (property.startsWith("--"))
        return null; // custom property: anything goes
    if (!CSS.supports(property, "initial")) {
        const hint = suggest(property);
        return ui("css.notProperty", { property }) + (hint ? ` ${ui("css.didYouMean", { hint })}` : "");
    }
    const bare = value.replace(/\s*!important\s*$/i, "");
    if (!bare)
        return ui("css.noValue", { property });
    if (!CSS.supports(property, bare))
        return ui("css.badValue", { value: bare, property });
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
            issues.push({ line: rule.line, severity: "warning", message: ui("css.badSelector", { selector: rule.selector, line: rule.line }) });
        for (const item of rule.declarations) {
            const problem = item.type === "declaration" && checkDeclaration(item.property, item.value);
            if (problem)
                issues.push({ line: item.line, severity: "warning", message: ui("css.atLine", { line: item.line, problem }) });
        }
    }
    return issues.sort((a, b) => a.line - b.line);
}
