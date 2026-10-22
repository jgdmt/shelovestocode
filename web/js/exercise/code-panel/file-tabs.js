// File tabs of the code panel (index.html | style.css...), with a lock on
// read-only files and a badge counting the problems found in each file.

import { $, h, icon, setupSegmented } from "../ui/dom.js";

export function createFileTabs(files, onSelect) {
    const container = $("file-tabs");
    const badges = new Map();

    container.replaceChildren(...files.map((file) => {
        const badge = h("span", { class: "file-badge", hidden: true });
        badges.set(file.name, badge);
        return h("button", {
            class: `file-tab file-${file.language.id}`,
            "data-file": file.name,
            title: file.readOnly ? "Read only" : undefined
        }, h("span", { class: "file-dot" }), file.name, file.readOnly ? icon("lock", "icon icon-sm file-lock") : null, badge);
    }));

    const select = setupSegmented(container, "file", onSelect);

    return {
        select,
        setIssues(name, issues) {
            const badge = badges.get(name);
            badge.hidden = issues.length === 0;
            badge.textContent = issues.length;
            badge.classList.toggle("has-errors", issues.some((issue) => issue.severity === "error"));
        }
    };
}
