// A module on the home page: title, description, progress and its exercises.

import { h, icon } from "../exercise/ui/dom.js";
import { exerciseUrl } from "../exercise/core/context.js";
import { Status } from "../exercise/core/progress.js";
import { ui } from "../exercise/core/i18n.js";

const STEP_CLASS = {
    [Status.STARTED]: "started",
    [Status.FINISHED]: "done"
};

// states: progress of the exercises of this module ([] when unknown).
export function moduleCard(mod, module, all_states) {
    if (module == null) {
        return h("div", { hidden: true });
    }
    const states = all_states[mod];
    const indexes = [...Array(module.length).keys()];
    const statusOf = (i) => states[i]?.status ?? Status.DEFAULT;
    const urlOf = (i) => exerciseUrl(module, i, { mod });

    const done = indexes.filter((i) => statusOf(i) === Status.FINISHED).length;
    const next = indexes.find((i) => statusOf(i) !== Status.FINISHED) ?? 0;
    const label = ui(done === 0 ? "home.start" : done === module.length ? "home.review" : "home.continue");

    const steps = indexes.map((i) => {
        const step = h("a", { class: "step", href: urlOf(i), title: module.exercises[i]?.title }, String(i));
        if (STEP_CLASS[statusOf(i)])
            step.classList.add(STEP_CLASS[statusOf(i)]);
        return step;
    });

    return h("article", { class: "module-card" },
        h("div", { class: "module-label" }, ui("home.module", { mod })),
        h("h2", { class: "display" }, module.title),
        h("p", { class: "module-description" }, module.description ?? ""),
        h("div", { class: "module-progress" },
            h("div", { class: "progress-bar" }, h("span", { style: `width: ${(done / module.length) * 100}%` })),
            h("span", { class: "muted" }, ui("home.done", { done, total: module.length }))),
        h("nav", { class: "module-steps", "aria-label": ui("home.exercisesOf", { mod }) }, ...steps),
        h("a", { class: "btn btn-primary", href: urlOf(next) }, label, icon("arrow-right")));
}
