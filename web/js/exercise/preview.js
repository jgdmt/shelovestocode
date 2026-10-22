// Right panel: renders either the student's code or the expected result.

import { setupSegmented } from "./dom.js";

export function createPreview({ frame, panel, switcher, goal }) {
    let view = "mine";
    let code = "";

    const render = () => {
        frame.srcdoc = view === "goal" ? goal : code;
    };

    setupSegmented(switcher, "view", (value) => {
        view = value;
        panel.classList.toggle("goal", view === "goal");
        render();
    });

    return {
        update(newCode) {
            code = newCode;
            if (view === "mine")
                render();
        }
    };
}
