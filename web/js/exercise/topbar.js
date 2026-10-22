// Top bar: module title, exercise steps and the Next button.

import { $, h } from "./dom.js";
import { ctx, exerciseUrl } from "./context.js";
import { Status, statusOf } from "./progress.js";

const STEP_CLASS = {
    [Status.STARTED]: "started",
    [Status.FINISHED]: "done"
};

export function createTopbar(module) {
    $("module-title").textContent = module.title;

    const steps = Array.from({ length: module.length }, (_, i) => {
        const step = h("a", { class: "step", href: exerciseUrl(module, i) }, String(i));
        const state = i === ctx.ex ? "current" : STEP_CLASS[statusOf(i)];
        if (state)
            step.classList.add(state);
        return step;
    });
    $("steps").replaceChildren(...steps);

    const next = ctx.ex + 1;
    if (next < module.length)
        $("next-btn").href = exerciseUrl(module, next);

    return {
        markDone() {
            steps[ctx.ex].classList.add("done");
            $("next-btn").setAttribute("aria-disabled", "false");
        }
    };
}
