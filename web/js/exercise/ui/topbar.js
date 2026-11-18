// Top bar: module title, exercise steps and the Next button.

import { $, h } from "./dom.js";
import { ctx, exerciseUrl } from "../core/context.js";
import { Status, statusOf } from "../core/progress.js";
import { readStates } from "../core/progress.js"
import { ui } from "../core/i18n.js";

const STEP_CLASS = {
    [Status.STARTED]: "started",
    [Status.FINISHED]: "done"
};

export function createTopbar(module) {
    $("module-title").textContent = ui("topbar.moduleTitle", { mod: ctx.mod, title: module.title });
    const len = readStates()[parseInt(ctx.mod)].length;

    const steps = Array.from({ length: len }, (_, i) => {
        const step = h("a", { class: "step", href: exerciseUrl(module, i) }, String(i));
        const state = i === ctx.ex ? "current" : STEP_CLASS[statusOf(i)];
        if (state)
            step.classList.add(state);
        return step;
    });
    $("steps").replaceChildren(...steps);

    const next = ctx.ex + 1;
    if (next < len)
        $("next-btn").href = exerciseUrl(module, next);
    return {
        markDone() {
            steps[ctx.ex].classList.add("done");
            $("next-btn").removeAttribute("hidden");
            $("run-btn").classList.remove('btn-primary');
            $("run-btn").classList.add("btn-light")
            $("run-btn").setAttribute("aria-disabled", "true");

        }
    };
}
