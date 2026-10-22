// Shown when switching to blocks with code the browser had to repair:
// the student either fixes it, or lets the browser rewrite it.

import { $, h } from "../ui/dom.js";

export function createRepairDialog() {
    const dialog = $("repair");
    let handlers = null;

    const choose = (name) => () => {
        dialog.hidden = true;
        handlers[name]();
    };
    $("repair-myself").addEventListener("click", choose("onFixMyself"));
    $("repair-browser").addEventListener("click", choose("onLetBrowserFix"));

    return {
        // issues: [{ line, message }], then { onFixMyself, onLetBrowserFix }
        show(issues, newHandlers) {
            handlers = newHandlers;
            $("repair-list").replaceChildren(...issues.map((issue) => h("li", {}, issue.message)));
            dialog.hidden = false;
        }
    };
}
