// CSS language: see languages/index.js for the interface.

import { parse, serialize } from "./model.js";
import { diagnose } from "./lint.js";
import { snippet } from "./snippets.js";
import { createCssBlocksView } from "./blocks-view.js";

export default {
    id: "css",
    label: "CSS",
    mode: "css",

    diagnose,
    // only structural problems: blocks can show (and flag) unknown properties or values
    blockingIssues: (code) => parse(code).errors.map((error) => ({ ...error, severity: "error" })),
    repair: (code) => serialize(parse(code)),

    parse,
    serialize,
    snippet,
    createBlocksView: createCssBlocksView
};
