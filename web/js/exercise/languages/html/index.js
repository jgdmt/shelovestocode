// HTML language: see languages/index.js for the interface.

import { parse, serialize } from "./model.js";
import { findIssues } from "./lint.js";
import { snippet } from "./snippets.js";
import { createHtmlBlocksView } from "./blocks-view.js";
import { TAGS } from "../../../exercises/inventory.js";

const diagnose = (code) => findIssues(code, serialize(parse(code)))
    .map((issue) => ({ ...issue, severity: "error" }));

export default {
    id: "html",
    label: "HTML",
    mode: "htmlmixed",

    diagnose,
    // any guess of the browser would silently change the code in blocks mode
    blockingIssues: diagnose,
    repair: (code) => serialize(parse(code)),

    parse,
    serialize,
    snippet,
    createBlocksView: (host, options) => createHtmlBlocksView(host, { ...options, palette: Object.keys(TAGS) })
};
