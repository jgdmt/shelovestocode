// Right column: the student's page above, the goal below.
// The checks run on the page as the browser renders it (see checker.js).

import { $ } from "../ui/dom.js";
import { buildPage } from "./page-builder.js";
import { createChecker } from "./checker.js";

export function createResultPanel(files, { autoLink, checks, onRun }) {
    const solutions = new Map(files.map((file) => [file.name, file.solution]));
    $("goal-preview").srcdoc = buildPage(solutions, { autoLink });

    const checker = createChecker();
    $("run-btn").addEventListener("click", onRun);

    return {
        isLive: () => $("live-toggle").checked,

        // Shows the page and resolves with one boolean per check (null if outdated by a newer call).
        show(code) {
            const page = buildPage(code, { autoLink });
            $("preview").srcdoc = page;
            return checker.run(checks, page, code);
        }
    };
}
