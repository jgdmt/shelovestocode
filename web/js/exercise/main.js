// Entry point of html/exercise.html: loads the exercise and wires the panels together.
//
//   left panel  <-- check results --  main  -- code -->  preview
//                                      ^ |
//                          code / blocks | v
//                          editor <--> blocks view
//                                 |
//              broken code -> repair dialog (html-lint.js)

import { $, setupSegmented, debounce } from "./dom.js";
import { ctx } from "./context.js";
import { load, save } from "./storage.js";
import { markStarted, markFinished } from "./progress.js";
import { parse, serialize } from "./blocks.js";
import { findIssues } from "./html-lint.js";
import { runChecks } from "./checks.js";
import { createEditor } from "./editor.js";
import { createBlocksView } from "./blocks-view.js";
import { createRepairDialog } from "./repair-dialog.js";
import { TAGS } from "../exercises/inventory.js";
import { createPreview } from "./preview.js";
import { createLeftPanel } from "./left-panel.js";
import { createTopbar } from "./topbar.js";

const CODE_KEY = `slc-${ctx.branch}-${ctx.mod}-${ctx.ex}`;
const MODE_KEY = "slc-mode";

async function loadExercise() {
    try {
        const { default: module } = await import(`../exercises/module_${ctx.mod}.js`);
        const ex = module.exercises[ctx.ex];
        return ex ? { module, ex } : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function start({ module, ex }) {
    let mode = "code";
    let doc = null;     // parsed document while in blocks mode (keeps doctype, head...)
    let finished = false;

    const topbar = createTopbar(module);
    const left = createLeftPanel(ex, { onInsert: insert });
    const preview = createPreview({
        frame: $("preview"),
        panel: document.querySelector(".panel-right"),
        switcher: $("view-switch"),
        goal: ex.solution
    });

    const liveRun = debounce(run, 300);
    const editor = createEditor($("code-view"), {
        value: load(CODE_KEY) || ex.starter,
        onRun: run,
        onChange(code) {
            save(CODE_KEY, code);
            if ($("live-toggle").checked)
                liveRun();
        }
    });

    // Blocks edits are turned into code; the editor change handler does the rest.
    // The code is only rewritten when a block changes: switching back and
    // forth without editing keeps the student's code untouched.
    const blocksView = createBlocksView({
        palette: $("palette"),
        root: $("drop-zone"),
        tags: ex.blocks?.palette || Object.keys(TAGS),
        onChange: (body) => editor.setValue(serialize({ ...doc, body }))
    });

    const repairDialog = createRepairDialog({
        onFixMyself: (lines) => editor.markLines(lines),
        onLetBrowserFix() {
            const parsed = parse(editor.getValue());
            editor.setValue(serialize(parsed));
            showBlocks(parsed);
        }
    });

    function run() {
        const code = editor.getValue();
        preview.update(code);
        const results = runChecks(ex.checks, code);
        left.updateChecks(results);
        if (!finished && results.every(Boolean))
            finish();
    }

    function finish() {
        finished = true;
        left.showSuccess();
        topbar.markDone();
        markFinished();
    }

    function insert(snippet, block) {
        if (mode === "blocks")
            blocksView.add(block);
        else
            editor.insert(snippet);
    }

    function applyMode(newMode) {
        mode = newMode;
        save(MODE_KEY, mode);
        selectMode(mode, { silent: true });
        $("code-view").hidden = mode !== "code";
        $("blocks-view").hidden = mode !== "blocks";
        if (mode === "code")
            editor.refresh();
    }

    function showBlocks(parsed) {
        doc = parsed;
        blocksView.setBody(parsed.body);
        applyMode("blocks");
    }

    // Code the browser had to repair asks the student first (see html-lint.js).
    function setMode(newMode) {
        if (newMode === "code") {
            applyMode("code");
            return;
        }
        const code = editor.getValue();
        const parsed = parse(code);
        const issues = findIssues(code, serialize(parsed));
        if (issues.length) {
            repairDialog.show(issues);
            return false;
        }
        showBlocks(parsed);
    }

    function reset() {
        if (!confirm("Start this exercise again? Your code will be erased."))
            return;
        editor.setValue(ex.starter);
        if (mode === "blocks")
            showBlocks(parse(ex.starter));
        run();
    }

    const selectMode = setupSegmented($("mode-switch"), "mode", setMode);
    $("mode-switch").hidden = ex.blocks === false;
    $("run-btn").addEventListener("click", run);
    $("reset-btn").addEventListener("click", reset);

    if (load(MODE_KEY) === "blocks" && ex.blocks !== false)
        selectMode("blocks");
    run();
    markStarted();
}

const loaded = await loadExercise();
if (loaded)
    start(loaded);
else
    document.body.textContent = `Exercise ${ctx.ex} of module ${ctx.mod} not found.`;
