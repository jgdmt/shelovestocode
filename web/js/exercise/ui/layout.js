// Splitters of the workspace: code | result, and result / goal.

import { $ } from "./dom.js";
import { setupSplitter } from "./splitter.js";

const MIN_RIGHT = 320;
const MIN_CENTER = 420;
const GAP = 14; // --gap in the CSS: workspace padding, left panel margin, splitter width

export function setupLayout() {
    const workspace = document.querySelector(".workspace");
    const stack = $("result-stack");

    setupSplitter($("col-splitter"), {
        key: "slc-right-width",
        sizeAt: (e) => workspace.getBoundingClientRect().right - GAP - e.clientX - GAP / 2,
        clamp(width) {
            const left = document.querySelector(".panel-left").getBoundingClientRect().right;
            const max = workspace.getBoundingClientRect().right - GAP - left - 2 * GAP - MIN_CENTER;
            return Math.round(Math.max(MIN_RIGHT, Math.min(max, width)));
        },
        apply: (width) => width === null
            ? workspace.style.removeProperty("--right-width")
            : workspace.style.setProperty("--right-width", `${width}px`)
    });

    setupSplitter($("row-splitter"), {
        key: "slc-result-size",
        sizeAt(e) {
            const rect = stack.getBoundingClientRect();
            return (e.clientY - rect.top) / rect.height * 100;
        },
        clamp: (percent) => Math.max(15, Math.min(85, percent)),
        apply: (percent) => percent === null
            ? stack.style.removeProperty("--result-size")
            : stack.style.setProperty("--result-size", `${percent}%`)
    });
}
