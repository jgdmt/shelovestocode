// Helpers for writing exercise texts.

const escape = (code) => code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Code meant to be copied: shown as a block with a "Copy" button.
// Write the code as is, it is escaped here: snippet('<link rel="stylesheet" href="style.css">')
export const snippet = (code) => `<pre class="snippet">${escape(code)}</pre>`;
