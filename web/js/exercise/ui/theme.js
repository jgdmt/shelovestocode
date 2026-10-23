// Light / dark theme. By default the page follows the system; the toggle in the
// top bar saves an explicit choice, applied as <html data-theme="..."> (an inline
// script in the page applies it before the first paint).

import { $, icon } from "./dom.js";
import { load, save } from "../core/storage.js";

const KEY = "slc-theme";
const systemDark = matchMedia("(prefers-color-scheme: dark)");

const current = () => document.documentElement.dataset.theme || (systemDark.matches ? "dark" : "light");

function render(button) {
    const dark = current() === "dark";
    button.replaceChildren(icon(dark ? "sun" : "moon"));
    button.title = dark ? "Switch to light mode" : "Switch to dark mode";
}

export function setupThemeToggle() {
    const button = $("theme-toggle");
    const saved = load(KEY);
    if (saved)
        document.documentElement.dataset.theme = saved;

    button.addEventListener("click", () => {
        const next = current() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        save(KEY, next);
        render(button);
    });
    systemDark.addEventListener("change", () => render(button));
    render(button);
}
