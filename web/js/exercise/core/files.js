// The files of an exercise, and what the student typed in them.

import { ctx } from "./context.js";
import { load, save } from "./storage.js";
import { languageFor } from "../languages/index.js";

// The files of an exercise as { name: { starter, solution, blocks, readOnly } }.
// Exercises with a single HTML file can keep the short format
// { starter, solution, blocks }: it becomes one "index.html" file.
const filesOf = (ex) => ex.files || { "index.html": { starter: ex.starter, solution: ex.solution, blocks: ex.blocks } };

const storageKeyOf = (index, name) => `slc-${ctx.branch}-${ctx.mod}-${index}-${name}`;

// The code exercise `index` has for `name`: what the student typed there, or,
// if they never typed in it, what that exercise started with (its starter, or
// in turn the code of the exercise it keeps). Without this, a level the
// student only looked at broke the chain: the next one started empty.
function codeOf(exercises, index, name, seen = new Set()) {
    const saved = load(storageKeyOf(index, name));
    if (saved !== null)
        return saved;
    const ex = exercises[index];
    if (!ex || seen.has(index))
        return "";
    seen.add(index);
    const file = filesOf(ex)[name];
    if (file?.starter !== undefined)
        return file.starter;
    return ex.keep_code !== undefined ? codeOf(exercises, ex.keep_code, name, seen) : "";
}

export function exerciseFiles(ex, module) {
    const exercises = module?.exercises ?? [];
    return Object.entries(filesOf(ex)).map(([name, file]) => ({
        name,
        language: languageFor(name),
        starter: file.starter ?? (ex.keep_code !== undefined ? codeOf(exercises, ex.keep_code, name) : ""),
        solution: file.solution ?? "",
        blocks: file.blocks,
        readOnly: file.readOnly === true,
        storageKey: storageKeyOf(ctx.ex, name)
    }));
}

// What the student typed, or the starter code. Read-only files always show the starter.
export const initialCode = (file) => (file.readOnly ? file.starter : load(file.storageKey) ?? file.starter);

export function saveCode(file, code) {
    if (!file.readOnly)
        save(file.storageKey, code);
}
