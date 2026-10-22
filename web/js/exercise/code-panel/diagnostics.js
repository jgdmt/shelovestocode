// Live diagnostics: each changed file is checked by its language; problems are
// shown in the editor gutter, as a badge on the file tab and in the problems list.

import { debounce } from "../ui/dom.js";

export function createDiagnostics({ files, editor, tabs, problems }) {
    const byName = new Map(files.map((file) => [file.name, file]));
    const results = new Map();                             // file name -> issues
    const dirty = new Set(files.map((file) => file.name)); // files to check again
    let active = null;

    function flush() {
        for (const name of dirty) {
            const issues = byName.get(name).language.diagnose(editor.getValue(name));
            results.set(name, issues);
            editor.setDiagnostics(name, issues);
            tabs.setIssues(name, issues);
            if (name === active)
                problems.show(issues);
        }
        dirty.clear();
    }

    const flushSoon = debounce(flush, 300);

    return {
        flush,
        changed(name) {
            dirty.add(name);
            flushSoon();
        },
        show(name) {
            active = name;
            problems.show(results.get(name) || []);
        }
    };
}
