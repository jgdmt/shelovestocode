// Loads exercise modules (js/exercises/module_<n>.js).

import { ctx } from "./context.js";
import { localizeModule } from "./i18n.js";

export async function loadModules(modules) {
    let mods = [];
    for (let i = 0; i < modules.length; i++) {
        try {
            const { default: module } = await import(`../../exercises/module_${i}.js`);
            await localizeModule(module, i);
            if (module.length < modules[i].length) {
                console.error("Missing exercises");
            } else if (module.length > modules[i].length) {
                console.log("Number of exercises not matching and have been reduced to match.");
            }
            module.length = modules[i].length;
            mods.push(module);
        } catch {
            mods.push(null);
            continue;
        }
    }
    return mods;
}

export async function loadModule(mod) {
    try {
        const { default: module } = await import(`../../exercises/module_${mod}.js`);
        return await localizeModule(module, mod);
    } catch (err) {
        console.error(err);
        return null;
    }
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
