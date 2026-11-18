// Entry point of html/exercise.html: loads the exercise and wires the panels.
//
//   left panel ── inventory item ──▶ code panel ── code ──▶ result panel
//       ▲                                                        │
//       └──────────────────── check results ◀────────────────────┘
//
// Each panel lives in its own folder, HTML/CSS specifics in languages/.

import "./ui/icons.js";
import { debounce } from "./ui/dom.js";
import { ctx } from "./core/context.js";
import { loadExercise } from "./core/exercise-loader.js";
import { exerciseFiles } from "./core/files.js";
import { markStarted, markFinished } from "./core/progress.js";
import { createTopbar } from "./ui/topbar.js";
import { setupLayout } from "./ui/layout.js";
import { setupThemeToggle } from "./ui/theme.js";
import { confetti } from "./ui/confetti.js";
import { createLeftPanel } from "./left-panel/index.js";
import { createCodePanel } from "./code-panel/index.js";
import { createResultPanel } from "./result-panel/index.js";
import { startTour, setupGuideTour } from "./ui/guide.js";
import { loadUi, ui } from "./core/i18n.js";
import { loadUserImages } from "./core/user-images.js";

function start({ module, ex }) {
    const files = exerciseFiles(ex, module);
    let finished = false;
    let celebrate = false; // no confetti for a level already done when the page opens

    const liveRun = debounce(run, 300);
    const topbar = createTopbar(module);
    const result = createResultPanel(files, { autoLink: ex.autoLink === true, checks: ex.checks, onRun: run });
    const code = createCodePanel(files, {
        onRun: run,
        onChange: () => {
            if (result.isLive())
                liveRun();
        }
    });
    const left = createLeftPanel(ex, {
        onInsert: code.insert,
        showProperties: files.some((file) => file.language.id === "css")
    });
    setupLayout();
    setupThemeToggle();
    setupGuideTour();

    async function run() {
        const results = await result.show(code.currentCode());
        if (!results)
            return; // a newer run is on its way
        left.updateChecks(results);
        // bonus checks are optional
        if (!finished && results.every((ok, i) => ok || ex.checks[i].bonus === true))
            finish();
    }

    function finish() {
        finished = true;
        if (celebrate)
            confetti();
        left.showSuccess();
        topbar.markDone();
        markFinished();
    }

    run().then(() => { celebrate = true; });
    markStarted();
}

await loadUi();
await loadUserImages();
const loaded = await loadExercise();
if (loaded) {
    start(loaded);
    try {
        if (!localStorage.getItem('slc-guide-tour-seen')) {
            localStorage.setItem('slc-guide-tour-seen', "true");
            startTour(true);
        }
    } catch {}
} else
    document.body.textContent = ui("page.notFound", { ex: ctx.ex, mod: ctx.mod });
