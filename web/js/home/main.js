// Home page: Archimede welcomes the student and lists the modules with their progress.

import "../exercise/ui/icons.js";
import { $ } from "../exercise/ui/dom.js";
import { setupThemeToggle } from "../exercise/ui/theme.js";
import { ctx } from "../exercise/core/context.js";
import { fetchProgress } from "../exercise/core/progress.js";
import { loadModule } from "../exercise/core/exercise-loader.js";
import { MODULES } from "../exercises/index.js";
import { moduleCard } from "./module-card.js";

setupThemeToggle();

const [progress, modules] = await Promise.all([
    fetchProgress(ctx.branch),
    Promise.all(MODULES.map(loadModule))
]);

// the backend only knows the progress of the module the student is in
const statesOf = (mod) => (progress?.module === String(mod) ? progress.states : []);

$("modules").replaceChildren(...modules.map((module, i) => moduleCard(MODULES[i], module, statesOf(MODULES[i]))));
