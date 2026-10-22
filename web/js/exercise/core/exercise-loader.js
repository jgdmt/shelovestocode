// Loads the module and exercise named in the URL (?mod=0&ex=1).

import { ctx } from "./context.js";

export async function loadExercise() {
    try {
        const { default: module } = await import(`../../exercises/module_${ctx.mod}.js`);
        const ex = module.exercises[ctx.ex];
        return ex ? { module, ex } : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}
