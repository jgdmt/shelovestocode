// Thin wrapper around CodeMirror 5 (loaded globally from the CDN).

export function createEditor(parent, { value, onChange, onRun }) {
    const cm = CodeMirror(parent, {
        value,
        mode: "htmlmixed",
        lineNumbers: true,
        autoCloseTags: true,
        tabSize: 2,
        indentUnit: 2,
        lineWrapping: true,
        extraKeys: { "Ctrl-Enter": onRun, "Cmd-Enter": onRun }
    });

    let marked = [];
    const clearMarks = () => {
        marked.forEach((handle) => cm.removeLineClass(handle, "background", "line-error"));
        marked = [];
    };

    cm.on("change", () => {
        clearMarks();
        onChange(cm.getValue());
    });

    return {
        getValue: () => cm.getValue(),
        setValue: (code) => cm.setValue(code),
        refresh: () => cm.refresh(),

        // Inserts a snippet at the cursor and puts the cursor before its closing tag.
        insert(snippet) {
            cm.replaceSelection(snippet);
            const close = snippet.lastIndexOf("</");
            if (close > 0) {
                const cursor = cm.getCursor();
                cm.setCursor({ line: cursor.line, ch: cursor.ch - (snippet.length - close) });
            }
            cm.focus();
        },

        // Highlights lines (1-based) until the next edit and moves the cursor to the first one.
        markLines(lines) {
            clearMarks();
            marked = lines.map((line) => cm.addLineClass(line - 1, "background", "line-error"));
            cm.setCursor({ line: lines[0] - 1, ch: 0 });
            cm.scrollIntoView(null, 100);
            cm.focus();
        }
    };
}
