// Code / blocks switch of the code panel. Each file gets its own blocks view,
// created on first use and filled from the code. Code the browser would have to
// repair first asks the student (see languages/*/lint.js).

import { $, h, setupSegmented } from "../ui/dom.js";
import { load, save } from "../core/storage.js";
import { createRepairDialog } from "./repair-dialog.js";

const MODE_KEY = "slc-mode";

export function canUseBlocks(file) {
    return Boolean(file.language.createBlocksView) && file.blocks !== false && !file.readOnly;
}

// context: what blocks views may need from the other files (see languages/index.js).
export function createBlocksMode({ editor, context }) {
    const views = new Map(); // file name -> { host, view }
    const repairDialog = createRepairDialog();
    const selectMode = setupSegmented($("mode-switch"), "mode", setMode);
    let preferBlocks = load(MODE_KEY) === "blocks";
    let active = null;

    function viewFor(file) {
        if (!views.has(file.name)) {
            const host = h("div", { class: "blocks-view", hidden: true });
            $("blocks-host").appendChild(host);
            const view = file.language.createBlocksView(host, {
                config: file.blocks || {},
                context,
                // blocks edits become code: the editor change handler does the rest
                onChange: (doc) => editor.setValue(file.name, file.language.serialize(doc))
            });
            views.set(file.name, { host, view });
        }
        return views.get(file.name);
    }

    function display(blocks) {
        $("code-view").hidden = blocks;
        $("problems").classList.toggle("in-blocks", blocks);
        $("blocks-host").hidden = !blocks;
        views.forEach(({ host }, name) => { host.hidden = !(blocks && name === active.name); });
        selectMode(blocks ? "blocks" : "code", { silent: true });
        if (!blocks)
            editor.refresh();
    }

    // Fills the blocks view of file; false when the student must fix the code first.
    function fill(file) {
        const code = editor.getValue(file.name);
        const issues = file.language.blockingIssues(code);
        if (issues.length) {
            repairDialog.show(issues, {
                onFixMyself: () => editor.goToLine(issues[0].line),
                onLetBrowserFix() {
                    editor.setValue(file.name, file.language.repair(editor.getValue(file.name)));
                    if (file === active && fill(file)) {
                        preferBlocks = true;
                        display(true);
                    }
                }
            });
            return false;
        }
        viewFor(file).view.setDoc(file.language.parse(code));
        return true;
    }

    function setMode(mode) {
        if (mode === "blocks" && !fill(active))
            return false;
        preferBlocks = mode === "blocks";
        save(MODE_KEY, mode);
        display(preferBlocks);
    }

    const isShown = () => !$("blocks-host").hidden;

    return {
        isShown,

        // Shows file as blocks when the student prefers blocks and the file allows it.
        show(file) {
            active = file;
            $("mode-switch").hidden = !canUseBlocks(file);
            display(preferBlocks && canUseBlocks(file) && fill(file));
        },

        insert: (file, payload) => viewFor(file).view.insert(payload),

        // The code changed from outside the blocks (reset): show it again.
        refresh() {
            if (isShown())
                fill(active);
        }
    };
}
