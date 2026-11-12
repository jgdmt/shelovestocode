// Home page: Archimede welcomes the student and lists the modules with their progress.

import "../exercise/ui/icons.js";
import { $ } from "../exercise/ui/dom.js";
import { setupThemeToggle } from "../exercise/ui/theme.js";
import { ctx } from "../exercise/core/context.js";
import { fetchProgress } from "../exercise/core/progress.js";
import { loadModules } from "../exercise/core/exercise-loader.js";
import { moduleCard } from "./module-card.js";
import { loadUi } from "../exercise/core/i18n.js";


// const [progress, modules] = await Promise.all([
//     fetchProgress(ctx.branch),
//     Promise.all(MODULES.map(loadModules))
// ]);

const progress = await fetchProgress(ctx.branch);
await loadUi(); // after fetchProgress: it saves the student's language
setupThemeToggle();
const modules = await loadModules(progress.states);

// the backend only knows the progress of the module the student is in
// const statesOf = (mod) => (progress?.module === String(mod) ? progress.states[mod] : []);

$("modules").replaceChildren(...modules.map((module, i) => moduleCard(i, module, progress.states)));

// $("modules").replaceChildren(...)