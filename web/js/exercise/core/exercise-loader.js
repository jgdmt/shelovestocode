// Loads exercise modules (js/exercises/module_<n>.js).

import { ctx } from "./context.js";

export async function loadModule(mod) {
    const { default: module } = await import(`../../exercises/module_${mod}.js`);
    return module;
}

// The module and exercise named in the URL (?mod=0&ex=1), or null.
export async function loadExercise() {
    try {
        const module = await loadModule(ctx.mod);
        const ex = module.exercises[ctx.ex];
        return ex ? { module, ex } : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}
