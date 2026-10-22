// Shown when switching to blocks with code the browser had to repair:
// the student either fixes it, or lets the browser rewrite it.

import { $, h } from "./dom.js";

export function createRepairDialog({ onFixMyself, onLetBrowserFix }) {
    const dialog = $("repair");
    let current = [];

    const close = () => { dialog.hidden = true; };

    $("repair-myself").addEventListener("click", () => {
        close();
        onFixMyself(current.map((issue) => issue.line));
    });
    $("repair-browser").addEventListener("click", () => {
        close();
        onLetBrowserFix();
    });

    return {
        show(issues) {
            current = issues;
            $("repair-list").replaceChildren(...issues.map((issue) => h("li", {}, issue.message)));
            dialog.hidden = false;
        }
    };
}
