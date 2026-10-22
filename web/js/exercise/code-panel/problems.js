// Problems of the active file, listed under the editor. Click one to jump to its line.

import { $, h, icon } from "../ui/dom.js";

export function createProblems(onSelect) {
    const box = $("problems");

    return {
        show(issues) {
            box.hidden = issues.length === 0;
            box.replaceChildren(
                h("div", { class: "problems-title" }, icon("alert"), `${issues.length} problem${issues.length > 1 ? "s" : ""}`),
                ...issues.map((issue) => h("button", {
                    class: `problem problem-${issue.severity}`,
                    onClick: () => onSelect(issue.line)
                }, issue.message)));
        }
    };
}
