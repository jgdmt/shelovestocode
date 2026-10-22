// One CodeMirror 5 editor (loaded globally from the CDN) for every file of the
// exercise: each file has its own document (content, undo history, cursor),
// swapped when switching tabs.

export function createEditor(parent, { onChange, onRun }) {
    const cm = CodeMirror(parent, {
        value: "",
        lineNumbers: true,
        autoCloseTags: true,
        tabSize: 2,
        indentUnit: 2,
        lineWrapping: true,
        gutters: ["CodeMirror-linenumbers", "diagnostics"],
        extraKeys: { "Ctrl-Enter": onRun, "Cmd-Enter": onRun }
    });

    const files = new Map(); // name -> { doc, readOnly, diagnostics, lineClasses }
    let active = null;
    let focusLine = null;

    // CodeMirror only notices window resizes, not its panel being resized
    new ResizeObserver(() => cm.refresh()).observe(parent);

    function clearFocusLine() {
        if (focusLine)
            cm.removeLineClass(focusLine, "background", "line-focus");
        focusLine = null;
    }

    // Diagnostics: a gutter dot (message as tooltip) and a tinted line.
    function applyDiagnostics(file) {
        file.lineClasses.forEach(([handle, cls]) => file.doc.removeLineClass(handle, "background", cls));
        file.lineClasses = [];
        cm.clearGutter("diagnostics");
        for (const { line, message, severity } of file.diagnostics) {
            if (line < 1 || line > file.doc.lineCount())
                continue;
            const marker = document.createElement("span");
            marker.className = `diag-marker diag-${severity}`;
            marker.title = message;
            cm.setGutterMarker(line - 1, "diagnostics", marker);
            const cls = `line-${severity}`;
            file.lineClasses.push([file.doc.addLineClass(line - 1, "background", cls), cls]);
        }
    }

    return {
        open(name, value, { mode, readOnly = false }) {
            const doc = CodeMirror.Doc(value, mode);
            doc.on("change", () => {
                if (name === active)
                    clearFocusLine();
                onChange(name, doc.getValue());
            });
            files.set(name, { doc, readOnly, diagnostics: [], lineClasses: [] });
        },

        show(name) {
            const file = files.get(name);
            clearFocusLine();
            active = name;
            cm.swapDoc(file.doc);
            cm.setOption("readOnly", file.readOnly);
            applyDiagnostics(file);
        },

        getValue: (name) => files.get(name).doc.getValue(),
        setValue: (name, code) => files.get(name).doc.setValue(code),
        refresh: () => cm.refresh(),

        setDiagnostics(name, diagnostics) {
            const file = files.get(name);
            file.diagnostics = diagnostics;
            if (name === active)
                applyDiagnostics(file);
        },

        cursorIndex: () => cm.indexFromPos(cm.getCursor("from")),

        // Inserts { text, cursor, at? } at index `at`, or at the cursor; `cursor` is the
        // offset in text where the caret ends.
        insert({ text, cursor, at }) {
            const start = at ?? cm.indexFromPos(cm.getCursor("from"));
            if (at === undefined)
                cm.replaceSelection(text);
            else
                cm.replaceRange(text, cm.posFromIndex(at));
            cm.setCursor(cm.posFromIndex(start + cursor));
            cm.focus();
        },

        // Moves to a line (1-based) and highlights it until the next edit.
        goToLine(line) {
            clearFocusLine();
            focusLine = cm.addLineClass(line - 1, "background", "line-focus");
            cm.setCursor({ line: line - 1, ch: 0 });
            cm.scrollIntoView(null, 100);
            cm.focus();
        }
    };
}
