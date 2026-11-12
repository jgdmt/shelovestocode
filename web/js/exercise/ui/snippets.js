// Adds a "Copy" button to the code snippets of the texts (pre.snippet, made
// with snippet() in js/exercises/helpers.js).

import { h, icon } from "./dom.js";
import { ui } from "../core/i18n.js";

async function copy(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        // clipboard API refused (permissions, old browser): fall back to a hidden textarea
        const area = h("textarea", { value: text, style: "position: fixed; opacity: 0" });
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
    }
}

export function enhanceSnippets(container) {
    for (const pre of container.querySelectorAll("pre.snippet:not(.ready)")) {
        pre.classList.add("ready");
        const label = h("span", {}, ui("code.copy"));
        const button = h("button", {
            class: "snippet-copy",
            title: ui("code.copyTitle"),
            onClick: async () => {
                await copy(pre.firstChild.textContent);
                button.classList.add("copied");
                button.replaceChildren(icon("check"), h("span", {}, ui("code.copied")));
                setTimeout(() => {
                    button.classList.remove("copied");
                    button.replaceChildren(icon("copy"), label);
                }, 1500);
            }
        }, icon("copy"), label);
        pre.appendChild(button);
    }
}
