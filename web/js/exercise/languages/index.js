// Languages known by the engine, picked from the file extension.
//
// A language is an object with:
//   id, label, mode        mode is the CodeMirror mode
//   diagnose(code)         [{ line, message, severity: "error" | "warning" }], shown live in the editor
//   snippet(payload, { code, cursor })
//                          { text, cursor, at? } to insert in the editor for an inventory item
//                          ({ kind, value }), or null when it makes no sense in this language.
//                          at: index where to insert (default: at the cursor); cursor: caret
//                          offset in text after inserting
// and, when the language has a blocks mode:
//   parse(code), serialize(doc)
//   blockingIssues(code)   problems to fix before showing blocks (else the code would change silently)
//   repair(code)           the code as the browser understood it
//   createBlocksView(host, { config, context, onChange(doc) }) -> { setDoc(doc), insert(payload) }

import html from "./html/index.js";
import css from "./css/index.js";
import js from "./js.js";

const BY_EXTENSION = { html, css, js };

export function languageFor(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    return BY_EXTENSION[extension] || js;
}
