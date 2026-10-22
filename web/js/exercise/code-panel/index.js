// Center panel: file tabs, the code (editor or blocks) and its problems.
// Saves what the student types and tells the page when the code changes.

import { $ } from "../ui/dom.js";
import { initialCode, saveCode } from "../core/files.js";
import { selectorsIn } from "../languages/html/selectors.js";
import { createEditor } from "./editor.js";
import { createFileTabs } from "./file-tabs.js";
import { createProblems } from "./problems.js";
import { createDiagnostics } from "./diagnostics.js";
import { createBlocksMode } from "./blocks-mode.js";

export function createCodePanel(files, { onChange, onRun }) {
    const byName = new Map(files.map((file) => [file.name, file]));
    let active = files[0];

    const editor = createEditor($("code-view"), {
        onRun,
        onChange(name, code) {
            saveCode(byName.get(name), code);
            diagnostics.changed(name);
            onChange();
        }
    });
    files.forEach((file) => editor.open(file.name, initialCode(file), { mode: file.language.mode, readOnly: file.readOnly }));

    const tabs = createFileTabs(files, openFile);
    const problems = createProblems((line) => editor.goToLine(line));
    const diagnostics = createDiagnostics({ files, editor, tabs, problems });
    const blocks = createBlocksMode({
        editor,
        context: { htmlSelectors: () => selectorsIn(byName.has("index.html") ? editor.getValue("index.html") : "") }
    });

    function openFile(name) {
        active = byName.get(name);
        editor.show(name);
        $("readonly-banner").hidden = !active.readOnly;
        $("code-view").classList.toggle("readonly", active.readOnly);
        diagnostics.show(name);
        blocks.show(active);
    }

    // Inventory items go to the active file, or to a file that knows what to do
    // with them (a CSS property clicked while on index.html goes to style.css).
    function insert(payload) {
        const accepts = (file) => !file.readOnly && file.language.snippet(payload) !== null;
        const target = accepts(active) ? active : files.find(accepts);
        if (!target)
            return;
        if (target !== active)
            tabs.select(target.name);
        if (blocks.isShown())
            blocks.insert(target, payload);
        else
            editor.insert(target.language.snippet(payload, { code: editor.getValue(target.name), cursor: editor.cursorIndex() }));
    }

    function reset() {
        if (!confirm("Start this exercise again? Your code will be erased in every file."))
            return;
        files.forEach((file) => editor.setValue(file.name, file.starter));
        blocks.refresh();
        onRun();
    }

    $("reset-btn").addEventListener("click", reset);
    diagnostics.flush();
    tabs.select(active.name);

    return {
        insert,
        currentCode: () => new Map(files.map((file) => [file.name, editor.getValue(file.name)]))
    };
}
