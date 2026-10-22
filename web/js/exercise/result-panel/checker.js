// Runs the exercise checks against the page as the browser renders it, so a
// check can look at computed styles ("is the title purple?").
//
// The page is rendered in a hidden iframe allowing same-origin access but no
// scripts: we can read it, and the student's code can't run there.
//
// A check is { label, test(doc, helpers) }:
//   doc                     the rendered document
//   $(selector), $$(selector)
//   style(selectorOrElement, property)   computed value, e.g. "rgb(128, 0, 128)"
//   sameColor(a, b)         compares colors whatever their format (purple, #800080...)
//   code(fileName)          source of a file
//   linked(fileName)        true when index.html links that stylesheet

import { h } from "../ui/dom.js";
import { normalizeColor } from "../core/colors.js";
import { linkedStylesheets } from "./page-builder.js";

function helpersFor(doc, files) {
    const $ = (selector) => doc.querySelector(selector);
    return {
        $,
        $$: (selector) => [...doc.querySelectorAll(selector)],
        style(target, property) {
            const element = typeof target === "string" ? $(target) : target;
            return element ? doc.defaultView.getComputedStyle(element).getPropertyValue(property).trim() : null;
        },
        sameColor(a, b) {
            const color = normalizeColor(a);
            return color !== null && color === normalizeColor(b);
        },
        code: (name) => files.get(name) ?? "",
        linked: (name) => linkedStylesheets(files.get("index.html") ?? "").includes(name)
    };
}

export function createChecker() {
    const frame = h("iframe", { class: "checker-frame", sandbox: "allow-same-origin", tabIndex: -1, "aria-hidden": "true" });
    document.body.appendChild(frame);
    let cancelPrevious = null;

    // Resolves with the rendered document, or null if a newer render started.
    function render(page) {
        cancelPrevious?.();
        return new Promise((resolve) => {
            cancelPrevious = () => resolve(null);
            frame.onload = () => {
                cancelPrevious = null;
                resolve(frame.contentDocument);
            };
            frame.srcdoc = page;
        });
    }

    return {
        /** One boolean per check, or null when outdated by a newer run. */
        async run(checks, page, files) {
            const doc = await render(page);
            if (!doc)
                return null;
            const helpers = helpersFor(doc, files);
            return checks.map((check) => {
                try {
                    return Boolean(check.test(doc, helpers));
                } catch {
                    return false;
                }
            });
        }
    };
}
