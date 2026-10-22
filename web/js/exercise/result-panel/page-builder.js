// Builds the page shown in the previews from the exercise files, the way a
// browser loads them: <link href="style.css"> and <script src="script.js">
// are replaced by the content of those files.

const fileName = (href) => href.trim().replace(/^\.?\//, "");

function styleFor(doc, name, css) {
    const style = doc.createElement("style");
    style.dataset.file = name;
    style.textContent = css;
    return style;
}

// Names of the files the HTML links as stylesheets.
export function linkedStylesheets(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return [...doc.querySelectorAll("link[href]")]
        .filter((link) => /\bstylesheet\b/i.test(link.rel))
        .map((link) => fileName(link.getAttribute("href")));
}

/**
 * files: Map name -> code. autoLink adds the CSS files the HTML doesn't link,
 * for the first exercises where students don't know <link> yet.
 */
export function buildPage(files, { autoLink = false } = {}) {
    const html = files.get("index.html") ?? "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    const linked = new Set();

    doc.querySelectorAll("link[href]").forEach((link) => {
        const name = fileName(link.getAttribute("href"));
        if (/\bstylesheet\b/i.test(link.rel) && files.has(name)) {
            link.replaceWith(styleFor(doc, name, files.get(name)));
            linked.add(name);
        }
    });

    doc.querySelectorAll("script[src]").forEach((script) => {
        const name = fileName(script.getAttribute("src"));
        if (!files.has(name))
            return;
        const inline = doc.createElement("script");
        [...script.attributes].filter((attr) => attr.name !== "src").forEach((attr) => inline.setAttribute(attr.name, attr.value));
        inline.textContent = files.get(name);
        script.replaceWith(inline);
    });

    if (autoLink) {
        for (const [name, css] of files) {
            if (name.endsWith(".css") && !linked.has(name))
                doc.head.appendChild(styleFor(doc, name, css));
        }
    }

    // keep the student's doctype choice: without it the browser uses quirks mode
    const doctype = /^\s*<!doctype/i.test(html) ? "<!DOCTYPE html>\n" : "";
    return doctype + doc.documentElement.outerHTML;
}
