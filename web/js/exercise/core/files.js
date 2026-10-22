// The files of an exercise, and what the student typed in them.

import { ctx } from "./context.js";
import { load, save } from "./storage.js";
import { languageFor } from "../languages/index.js";

/**
 * Exercises with a single HTML file can keep the short format
 * { starter, solution, blocks }: it becomes one "index.html" file.
 */
export function exerciseFiles(ex) {
    const files = ex.files || { "index.html": { starter: ex.starter, solution: ex.solution, blocks: ex.blocks } };
    return Object.entries(files).map(([name, file]) => ({
        name,
        language: languageFor(name),
        starter: file.starter ?? "",
        solution: file.solution ?? file.starter ?? "",
        blocks: file.blocks,
        readOnly: file.readOnly === true,
        storageKey: `slc-${ctx.branch}-${ctx.mod}-${ctx.ex}-${name}`
    }));
}

// What the student typed, or the starter code. Read-only files always show the starter.
export const initialCode = (file) => (file.readOnly ? file.starter : load(file.storageKey) ?? file.starter);

export function saveCode(file, code) {
    if (!file.readOnly)
        save(file.storageKey, code);
}
