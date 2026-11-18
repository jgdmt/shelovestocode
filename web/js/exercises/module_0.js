// Exercises of module 0: HTML basics. Format: see README.md in this folder.

import { snippet } from "./helpers.js";

const PAGE = (head, body) =>
`<!DOCTYPE html>
<html>
  <head>${head}
  </head>
  <body>
${body}
  </body>
</html>
`;

const LINK = `\n    <link rel="stylesheet" href="style.css">`;


// Computed text-align of a centered element ("-webkit-center" can come from inherited UA styles).
const isCentered = (value) => value === "center" || value === "-webkit-center";

// --- Layout and style helpers for the CSS checks ---------------------------

const px = (value) => parseFloat(value) || 0;

// Box of what is actually drawn: the text of a text-only element (a <p> is as
// wide as its parent, only its text moves when centered), otherwise the element itself.
function drawnBox(el) {
    if (el.tagName === "IMG" || el.children.length > 0)
        return el.getBoundingClientRect();
    const range = el.ownerDocument.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect();
}

// True when the drawn box of `el` is horizontally centered in the content box of `parent`.
function centeredIn(el, parent = el.parentElement, tolerance = 2) {
    if (!el || !parent)
        return false;
    const box = drawnBox(el);
    const outer = parent.getBoundingClientRect();
    const cs = parent.ownerDocument.defaultView.getComputedStyle(parent);
    const left = outer.left + px(cs.borderLeftWidth) + px(cs.paddingLeft);
    const right = outer.right - px(cs.borderRightWidth) - px(cs.paddingRight);
    return box.width > 0 && Math.abs((box.left + box.right) / 2 - (left + right) / 2) <= tolerance;
}

const SIDES = ["top", "right", "bottom", "left"];

// A visible border on all four sides.
const hasBorder = (style, el) =>
    !!el && SIDES.every((side) => style(el, `border-${side}-style`) !== "none" && px(style(el, `border-${side}-width`)) > 0);

const hasPadding = (style, el) => !!el && SIDES.every((side) => px(style(el, `padding-${side}`)) > 0);

// Computed colors are "rgb(r, g, b)" or "rgba(r, g, b, a)".
const rgba = (value) => {
    const [r, g, b, a = 1] = (value || "").match(/[\d.]+/g)?.map(Number) ?? [];
    return { r, g, b, a };
};

const hasBackground = (style, el) =>
    !!el && (rgba(style(el, "background-color")).a > 0 || style(el, "background-image") !== "none");

// Any shade of blue: blue clearly dominates red, and is at least as strong as green.
const isBlue = (value) => {
    const { r, g, b, a } = rgba(value);
    return a > 0 && b > r + 30 && b >= g;
};

// Full background of an element (color + image), to compare two backgrounds.
const backgroundOf = (style, el) => el ? `${style(el, "background-color")} ${style(el, "background-image")}` : "";

// Background of the page: the body's, or the html element's when the body has none.
const pageBackground = (style, doc) =>
    backgroundOf(style, hasBackground(style, doc.body) ? doc.body : doc.documentElement);

// The section (parent element) of the <h2> that says `title`, e.g. "our items".
function sectionTitled(doc, title) {
    const h2 = [...doc.querySelectorAll("h2")].find((h) => norm(h.textContent) === title);
    const section = h2?.parentElement;
    return section && section !== doc.body ? section : null;
}

// The section around the main heading and the shop description (ex10).
function titleSection(doc) {
    const h1 = doc.querySelector("h1");
    const section = h1?.parentElement;
    if (!section || section === doc.body)
        return null;
    const p = [...section.children].find((child) => child.tagName === "P");
    return p ? { section, h1, p } : null;
}

// The item sub sections of "Our items" (ex11).
const itemSections = (doc) => [...(sectionTitled(doc, "our items")?.children ?? [])].filter((el) => el.tagName === "DIV");

// Text-like input: type text (the default) or email.
const isTextField = (input) => input.type === "text" || input.type === "email";

// True when every corner is rounded to at least half the element's size (a circle for a square).
function isRound(style, el) {
    if (!el)
        return false;
    const { width, height } = el.getBoundingClientRect();
    const half = Math.min(width, height) / 2;
    return half > 0 && ["top-left", "top-right", "bottom-right", "bottom-left"].every((corner) => {
        const value = style(el, `border-${corner}-radius`).split(" ")[0];
        return value.endsWith("%") ? px(value) >= 50 : px(value) >= half - 0.5;
    });
}

// Style rules of the page, including those nested in @media...
function* styleRules(doc) {
    function* walk(rules) {
        for (const rule of rules) {
            if (rule.selectorText)
                yield rule;
            if (rule.cssRules)
                yield* walk(rule.cssRules);
        }
    }
    for (const sheet of doc.styleSheets) {
        try {
            yield* walk(sheet.cssRules);
        } catch {
            // unreadable sheet
        }
    }
}

// True when the mouse pointer becomes a hand over `el`: "cursor: pointer" set on it (or
// inherited), or in a ":hover" rule on it or one of its ancestors ("details:hover").
function pointerOnHover(doc, style, el) {
    if (!el)
        return false;
    if (style(el, "cursor") === "pointer")
        return true;
    for (const rule of styleRules(doc)) {
        if (rule.style.cursor !== "pointer")
            continue;
        for (const part of rule.selectorText.split(",")) {
            if (!part.includes(":hover"))
                continue;
            let selector = part.replace(/:hover/g, "").trim();
            if (selector === "" || /[\s>+~]$/.test(selector))
                selector += "*";
            try {
                if (el.closest(selector))
                    return true;
            } catch {
                // selector the browser can't use with closest()
            }
        }
    }
    return false;
}

// Caption of a form field, without punctuation ("Name:" -> "name"): its <label> (for=... or
// around the field), or else a free <label> next to it (before it, or after a check box).
function captionOf(field) {
    const labels = [...(field.labels ?? [])];
    if (labels.length === 0) {
        const before = field.previousElementSibling;
        const after = field.nextElementSibling;
        const near = /^(checkbox|radio)$/.test(field.type) ? [after, before] : [before, after];
        const free = near.find((el) => el?.tagName === "LABEL" && !el.control);
        if (free)
            labels.push(free);
    }
    return norm(labels.map((label) => label.textContent).join(" ")).replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

// Fields of the "Order" section (ex13).
const orderFields = (doc, selector = "input") => [...(sectionTitled(doc, "order")?.querySelectorAll(selector) ?? [])];

// Text of a button: <button>Confirm</button> or <input type="submit" value="Confirm">.
const buttonText = (button) => norm(button.tagName === "INPUT" ? button.value : button.textContent).replace(/[^\p{L}\p{N}\s]/gu, "").trim();

const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

export default {
    title: "module.title",
    description: "module.description",
    exercises: [
        {
            title: "ex0.title",
            dialogues: [
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex0.dialogue0"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex0.dialogue1"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex0.dialogue2"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex0.dialogue3"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex0.hint0"
                },
                {
                    character: "archi.jpg",
                    text: "ex0.hint1"
                }
            ],
            blocks: { palette: ["h1", "h2", "h3", "p"] },
            starter:
`<html>
  <head>
  </head>
  <body>
    <p>This is some text.</p>
  </body>
</html>`,
            checks: [
                {
                    label: "ex0.check0",
                    test: (doc) => doc.querySelector("body h1") !== null
                },
                {
                    label: "ex0.check1",
                    test: (doc) => norm(doc.querySelector("h1")?.textContent) === "lost and found"
                },
                {
                    label: "ex0.check2",
                    test: (doc) => norm(doc.querySelector("p")?.textContent) === "welcome to lost and found, where you can find what you've lost and lose what you've found!"
                },
                {
                    label: "ex0.check3",
                    test: (doc) => {
                        const h1 = doc.querySelector("h1");
                        const p = doc.querySelector("p");
                        return !!(h1 && p && (h1.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING));
                    }
                }
            ],
            lesson: "ex0.lesson"
        },
        {
            title: "ex1.title",
            keep_code: 0,
            dialogues: [
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex1.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex1.dialogue1"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex1.dialogue2"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex1.dialogue3"
                },
                {
                    text: "ex1.dialogue4"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex1.hint0"
                },
                {
                    character: "archi.jpg",
                    text: "ex1.hint1"
                }
            ],
            blocks: { palette: ["h1", "h2", "h3", "p", "div"] },
            checks: [
                {
                    label: "ex1.check0",
                    test: (doc) => doc.querySelector("div h2") !== null
                },
                {
                    label: "ex1.check1",
                    test: (doc) => {
                        const h2 = doc.querySelector("h2");
                        return h2 && norm(h2.textContent) === "our items";
                    }
                },
                {
                    label: "ex1.check2",
                    test: (doc) => doc.querySelector("h1 + p + div") !== null
                }
            ],
            lesson: "ex1.lesson"
        },
        {
            title: "ex2.title",
            keep_code: 1,
            dialogues: [
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex2.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex2.dialogue1"
                },
                {
                    text: "ex2.dialogue2"
                },
                {
                    text: "ex2.dialogue3"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex2.hint0"
                }
            ],
            blocks: { palette: ["h1", "h2", "h3", "p", "div"] },
            checks: [
                {
                    label: "ex2.check0",
                    test: (doc) => doc.querySelectorAll("div h2").length === 3
                },
                {
                    label: "ex2.check1",
                    test: (doc) => {
                        const h2 = doc.querySelectorAll("div h2");
                        for (let i = 0; i < h2.length; i++) {
                            if (norm(h2[i].textContent) === "faq") return true;
                        }
                        return false;
                    }
                },
                {
                    label: "ex2.check2",
                    test: (doc) => {
                        const h2 = doc.querySelectorAll("div h2");
                        for (let i = 0; i < h2.length; i++) {
                            if (norm(h2[i].textContent) === "order") return true;
                        }
                        return false;
                    }
                },
                {
                    label: "ex2.check3",
                    test: (doc) => {
                        const h2 = doc.querySelectorAll("div h2");
                        return h2 && h2.length === 3 && norm(h2[0].textContent) === "our items" && norm(h2[1].textContent) === "faq" && norm(h2[2].textContent) === "order";
                    }
                }
            ],
            lesson: "ex2.lesson"
        },
        {
            title: "ex3.title",
            keep_code: 2,
            mission: "ex3.mission",
            dialogues: [
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex3.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex3.dialogue1"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex3.dialogue2"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex3.dialogue3"
                },
                {
                    text: "ex3.dialogue4"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex3.dialogue5"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex3.hint0"
                }
            ],
            blocks: { palette: ["h1", "h2", "h3", "p", "div"] },
            checks: [
                {
                    label: "ex3.check0",
                    test: (doc) => {
                        return doc.querySelectorAll("div > h3 + p").length >= 2;
                    }
                },
                {
                    label: "ex3.check1",
                    test: (doc) => {
                        const div = doc.querySelectorAll("div");
                        let isOk = false;

                        div.forEach(element => {
                            const children = element.children;

                            if (children.length === 3 && children[0].tagName === 'H2' && norm(children[0].textContent) === "our items" && children[1].tagName === 'DIV') {
                                const newSectionChildren = children[1].children
                                const newSectionChildren2 = children[2].children
                                if ((newSectionChildren.length === 2 && newSectionChildren[0].tagName === 'H3' && newSectionChildren[1].tagName === 'P') &&
                                    (newSectionChildren2.length === 2 && newSectionChildren2[0].tagName === 'H3' && newSectionChildren2[1].tagName === 'P')) {
                                    isOk = true;
                                    return;
                                }
                            }
                        });
                        return isOk;
                    }
                },
                {
                    label: "ex3.check2",
                    test: (doc) => {
                        const texts = doc.querySelectorAll("div h3");

                        if (texts.length == 0)
                            return false;

                        for (let i = 0; i < texts.length; i++) {
                            if (norm(texts[i].textContent).length < 3 || norm(texts[i].textContent) === "my title")
                                return false;
                        }
                        return true;
                    }
                },
                {
                    label: "ex3.check3",
                    test: (doc) => {
                        const p = doc.querySelectorAll("div p");

                        if (p.length == 0)
                            return false;

                        for (let i = 0; i < p.length; i++) {
                            if (norm(p[i].textContent).length < 5 || norm(p[i].textContent) === "some text")
                                return false;
                        }
                        return true;
                    }
                }
            ],
            lesson:
"ex3.lesson"
        },
        {
            title: "ex4.title",
            keep_code: 3,
            mission: "ex4.mission",
            dialogues: [
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex4.dialogue0"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex4.dialogue1"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex4.dialogue2"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex4.dialogue3"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex4.hint0"
                }
            ],
            blocks: { palette: ["h1", "h2", "h3", "p", "div", "img"] },
            checks: [
                {
                    label: "ex4.check0",
                    test: (doc) => doc.querySelector("img") !== null
                },
                {
                    label: "ex4.check1",
                    test: (doc) => doc.querySelector("div > h3 ~ img ~ p") !== null
                }
            ],
            lesson:
"ex4.lesson"
        },
        {
            title: "ex5.title",
            keep_code: 4,
            mission: "ex5.mission",
            dialogues: [
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex5.dialogue0"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex5.dialogue1"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex5.dialogue2"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex5.dialogue3"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex5.dialogue4"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex5.hint0"
                },
                {
                    character: "archi.jpg",
                    text: "ex5.hint1"
                }
            ],
            files: {
                "index.html": {
                    readOnly: true,
                    starter: PAGE(LINK, "    <h1>Gabbro</h1>\n    <p>Chill musician</p>\n    <p>I play the flute.</p>")
                },
                "style.css": {
                    blocks: { properties: ["color", "font-size", "background-color", "text-align"]}
                }
            },
            checks: [
                {
                    label: "ex5.check0",
                    test: (doc, { style }) => isCentered(style("h1", "text-align"))
                },
                {
                    label: "ex5.check1",
                    test: (doc, { $$, style }) => {
                        const paragraphs = $$("p");
                        return paragraphs.length > 0 && paragraphs.every((p) => isCentered(style(p, "text-align")));
                    }
                }
            ],
            lesson: "ex5.lesson"
        },
        {
            title: "ex6.title",
            keep_code: 5,
            mission: "ex6.mission",
            dialogues: [
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex6.dialogue0"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex6.dialogue1"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex6.dialogue2"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex6.dialogue3"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex6.dialogue4"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex6.hint0"
                }
            ],
            files: {
                "index.html": {
                    readOnly: true,
                    starter: PAGE(LINK, "    <img src='/images/gabbro.webp'>\n    <h1>Gabbro</h1>\n    <p>Chill musician</p>\n    <p>I play the flute.</p>")
                },
                "style.css": {
                    blocks: { properties: ["text-align", "width", "height", "display", "margin", "border-radius"] }
                }
            },
            checks: [
                {
                    label: "ex6.check0",
                    test: (doc, { $, style }) => {
                        const img = $("img");
                        return !!img && Math.round(px(style(img, "width"))) === 100 && Math.round(px(style(img, "height"))) === 100;
                    }
                },
                {
                    label: "ex6.check1",
                    test: (doc, { $ }) => centeredIn($("img"))
                },
                {
                    label: "ex6.check2",
                    bonus: true,
                    test: (doc, { $, style }) => isRound(style, $("img"))
                }
            ],
            lesson: "ex6.lesson"
        },
        {
            title: "ex7.title",
            keep_code: 6,
            mission: "ex7.mission",
            dialogues: [
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex7.dialogue0"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex7.dialogue1"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex7.dialogue2"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex7.dialogue3"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex7.hint0"
                }
            ],
            files: {
                "index.html": {
                    readOnly: true,
                    starter: PAGE(LINK, "    <img src='/images/gabbro.webp'>\n    <h1>Gabbro</h1>\n    <p class='job'>Chill musician</p>\n    <p class='description'>I play the flute.</p>")
                },
                "style.css": {
                    blocks: { properties: ["text-align", "width", "height", "display", "margin", "border-radius", "color", "font-size", "border", "font-weight", "font-style"]}
                }
            },
            checks: [
                {
                    label: "ex7.check0",
                    test: (doc, { $, style }) => hasBorder(style, $("img"))
                },
                {
                    label: "ex7.check1",
                    test: (doc, { $, style }) => {
                        const job = $(".job");
                        const size = px(style(job, "font-size"));
                        return !!job && isBlue(style(job, "color")) && px(style(job, "font-weight")) >= 600 && size >= 20 && size <= 25 && style(job, "font-style") === "normal";
                    }
                },
                {
                    label: "ex7.check2",
                    test: (doc, { style, sameColor }) => style(".description", "font-style") === "italic" && sameColor(style(".description", "color"), 'black') && px(style(".description", "font-weight")) < 600
                }
            ],
            lesson: "ex7.lesson"
        },
        {
            title: "ex8.title",
            keep_code: 7,
            dialogues: [
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex8.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex8.dialogue1"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex8.dialogue2"
                },
                {

                    text: "ex8.dialogue3"
                },
                {
                    text: "ex8.dialogue4"
                },
                {
                    text: "ex8.dialogue5"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex8.hint0"
                }
            ],
            files: {
                "index.html": {
                    readOnly: true,
                    starter: PAGE(LINK, "    <div>\n        <img src='/images/gabbro.webp'>\n        <h1>Gabbro</h1>\n        <p class='job'>Chill musician</p>\n        <p class='description'>I play the flute.</p>\n    </div>")
                },
                "style.css": {
                    blocks: { properties: ["text-align", "width", "height", "display", "margin", "border-radius", "color", "border", "background-color", "padding"] }
                }
            },
            checks: [
                {
                    label: "ex8.check0",
                    test: (doc, { $, style }) => hasBackground(style, $("div"))
                },
                {
                    label: "ex8.check1",
                    test: (doc, { $, style }) => hasBorder(style, $("div"))
                },
                {
                    label: "ex8.check2",
                    test: (doc, { $, style }) => hasPadding(style, $("div"))
                },
                {
                    label: "ex8.check3",
                    test: (doc, { $ }) => {
                        const div = $("div");
                        // narrower than the page, otherwise it is "centered" without doing anything
                        return !!div && div.getBoundingClientRect().width < doc.body.clientWidth - 4 && centeredIn(div);
                    }
                },
                {
                    label: "ex8.check4",
                    test: (doc, { $ }) => {
                        const div = $("div");
                        return !!div && div.children.length > 0 && [...div.children].every((child) => centeredIn(child, div));
                    }
                }
            ],
            lesson: "ex8.lesson"
        },
        {
            title: "ex9.title",
            keep_code: 4,
            dialogues: [
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex9.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex9.dialogue1"
                },
                {
                    text: "ex9.dialogue2"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex9.dialogue3"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex9.dialogue4"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex9.hint0"
                },
                {
                    character: "archi.jpg",
                    text: "ex9.hint1"
                }
            ],
            files: {
                "index.html": {
                    blocks: { palette: ["h1", "h2", "h3", "p", "div", "img"], attributes: true }
                },
                "style.css": {
                    blocks: { properties: ["text-align", "background-color", "background-image", "color"] }
                }
            },
            checks: [
                {
                    label: "ex9.check0",
                    test: (doc, { linked }) => linked("style.css")
                },
                {
                    label: "ex9.check1",
                    test: (doc, { style }) => isCentered(style("h1", "text-align"))
                },
                {
                    label: "ex9.check2",
                    test: (doc, { style }) => isCentered(style("p", "text-align"))
                },
                {
                    label: "ex9.check3",
                    test: (doc, { style }) => hasBackground(style, doc.body) || hasBackground(style, doc.documentElement)
                },
                {
                    label: "ex9.check4",
                    bonus: true,
                    test: (doc, { $, $$, style }) => {
                        // the h1 and the first paragraph are centered, no other paragraph or heading is
                        const first = $("p");
                        const others = $$("p, h2, h3, h4, h5, h6").filter((el) => el !== first);
                        return !!first && isCentered(style("h1", "text-align")) && isCentered(style(first, "text-align"))
                            && others.every((el) => !isCentered(style(el, "text-align")));
                    }
                }
            ],
            lesson: "ex9.lesson"
        },
        {
            title: "ex10.title",
            keep_code: 9,
            dialogues: [
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex10.dialogue0"
                },
                {
                    text: "ex10.dialogue1"
                },
                {
                    name: "Jhin",
                    character: "jhin.jpg",
                    text: "ex10.dialogue2"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex10.dialogue3"
                },
                {
                    text: "ex10.dialogue4"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex10.hint0"
                },
                {
                    character: "archi.jpg",
                    text: "ex10.hint1"
                }
            ],
            files: {
                "index.html": { 
                    blocks: { palette: ["h1", "h2", "h3", "p", "div", "img"], attributes: true }
                },
                "style.css": {
                    blocks: { properties: ["text-align", "background-color", "background-image", "color", "border", "padding", "margin", "border-radius", "font-style", "font-weight"] }
                }
            },
            checks: [
                {
                    label: "ex10.check0",
                    test: (doc) => titleSection(doc) !== null
                },
                {
                    label: "ex10.check1",
                    test: (doc, { style }) => {
                        const section = titleSection(doc)?.section;
                        return !!section && hasBackground(style, section) && backgroundOf(style, section) !== pageBackground(style, doc);
                    }
                },
                {
                    label: "ex10.check2",
                    test: (doc, { style }) => {
                        const title = titleSection(doc);
                        const pageColor = style(doc.body, "color");
                        return !!title && style(title.h1, "color") !== pageColor && style(title.p, "color") !== pageColor;
                    }
                },
                {
                    label: "ex10.check3",
                    test: (doc, { style }) => {
                        const section = titleSection(doc)?.section;
                        return !!section &&
                            ["top-left", "top-right", "bottom-right", "bottom-left"].every((corner) => px(style(section, `border-${corner}-radius`)) > 0);
                    }
                },
                {
                    label: "ex10.check4",
                    test: (doc, { style }) => {
                        const title = titleSection(doc);
                        return !!title && style(title.p, "font-style") === "italic";
                    }
                },
                {
                    label: "ex10.check5",
                    test: (doc, { style }) => hasPadding(style, titleSection(doc)?.section)
                },
                {
                    label: "ex10.check6",
                    test: (doc) => {
                        const title = titleSection(doc);
                        return !!title && centeredIn(title.h1, title.section) && centeredIn(title.p, title.section);
                    }
                },
                {
                    label: "ex10.check7",
                    bonus: true,
                    test: (doc, { $$, style }) => {
                        // the shop description is in italic, no other paragraph is
                        const description = titleSection(doc)?.p;
                        return !!description && style(description, "font-style") === "italic"
                            && $$("p").every((p) => p === description || style(p, "font-style") !== "italic");
                    }
                }
            ],
            lesson: "ex10.lesson"
        },
        {
            title: "ex11.title",
            keep_code: 10,
            dialogues: [
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex11.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex11.dialogue1"
                },
                {
                    text: "ex11.dialogue2"
                },
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex11.dialogue3"
                },
                {
                    text: "ex11.dialogue4"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex11.dialogue5"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex11.hint0"
                }
            ],
            files: {
                "index.html": {
                    blocks: { palette: ["h1", "h2", "h3", "p", "div", "img"], attributes: true },
                    solution: PAGE(LINK, "<h2>Our items</h2><div><h3>Bucket of toothpaste</h3><img src='/images/bucket.png'></img><p>Who knows how long it has been there?</p></div>")
                },
                "style.css": {
                    solution: "div { background-color: lavender; border-radius: 8px; border: 1px solid #545487; padding: 5px; margin: 15px 0px } p { font-style: italic; } img { height: 50px; width: 50px; } ",
                    blocks: { properties: ["text-align", "background-color", "background-image", "color", "border", "padding", "margin", "border-radius", "font-style", "font-weight"] }
                }
            },
            checks: [
                {
                    label: "ex11.check0",
                    test: (doc, { style }) => {
                        const items = itemSections(doc);
                        return items.length > 0 && items.every((item) =>
                            hasBorder(style, item) && style(item, "border-top-color") !== style(item, "background-color"));
                    }
                },
                {
                    label: "ex11.check1",
                    test: (doc, { style }) => {
                        const items = itemSections(doc);
                        if (items.length === 0 || !items.every((item) => hasBackground(style, item)))
                            return false;
                        const background = backgroundOf(style, items[0]);
                        const title = titleSection(doc)?.section;
                        return items.every((item) => backgroundOf(style, item) === background)
                            && background !== pageBackground(style, doc)
                            && (!title || background !== backgroundOf(style, title));
                    }
                },
                {
                    label: "ex11.check2",
                    test: (doc, { style }) => {
                        const descriptions = itemSections(doc).flatMap((item) => [...item.querySelectorAll("p")]);
                        return descriptions.length > 0 && descriptions.every((p) => style(p, "font-style") === "italic");
                    }
                },
                {
                    label: "ex11.check3",
                    test: (doc) => itemSections(doc).every((item) => {
                        const box = item.getBoundingClientRect();
                        return [...item.querySelectorAll("img")].every((img) => {
                            const r = img.getBoundingClientRect();
                            return r.width > 0 && r.left >= box.left - 0.5 && r.right <= box.right + 0.5;
                        });
                    })
                },
                {
                    label: "ex11.check4",
                    test: (doc, { style }) => {
                        const items = itemSections(doc);
                        if (items.length === 0 || !items.every((item) => hasPadding(style, item)))
                            return false;
                        // a gap between each item and the next one
                        return items.slice(1).every((item, i) =>
                            item.getBoundingClientRect().top - items[i].getBoundingClientRect().bottom > 0);
                    }
                },
                {
                    label: "ex11.check5",
                    bonus: true,
                    test: (doc, { style }) => {
                        // in every item: the description (<p>) is in italic, the item name (<h3>) is not
                        const items = itemSections(doc);
                        return items.length > 0 && items.every((item) => {
                            const name = item.querySelector("h3");
                            const descriptions = [...item.querySelectorAll("p")];
                            return !!name && style(name, "font-style") !== "italic"
                                && descriptions.length > 0 && descriptions.every((p) => style(p, "font-style") === "italic");
                        });
                    }
                }
            ],
            lesson: "ex11.lesson"
        },
        {
            title: "ex12.title",
            keep_code: 11,
            dialogues: [
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex12.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex12.dialogue1"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex12.dialogue2"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex12.dialogue3"
                },
                {
                    text: "ex12.dialogue4"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex12.hint0"
                }
            ],
            files: {
                "index.html": {
                    blocks: { palette: ["h1", "h2", "h3", "p", "div", "img", "details", "summary"], attributes: true },
                    solution: PAGE(LINK, "<h2>FAQ</h2><details><summary>How many people have gotten lost in the shop?</summary><p>Yes.</p></details>")
                },
                "style.css": {
                    solution: "details { background-color: lavender; border-radius: 8px; padding: 5px; margin: 15px 0px; } details:hover { cursor: pointer; } summary { font-weight: bold }",
                    blocks: { properties: ["text-align", "background-color", "background-image", "color", "border", "padding", "margin", "border-radius", "font-style", "font-weight"] }
                }
            },
            checks: [
                {
                    label: "ex12.check0",
                    test: (doc) => {
                        const faq = sectionTitled(doc, "faq");
                        return !!faq && [...faq.querySelectorAll("details")].some((details) => {
                            const summary = details.querySelector("summary");
                            const answer = norm(details.textContent).length - norm(summary?.textContent).length;
                            return !!summary && norm(summary.textContent).length > 0 && answer > 0;
                        });
                    }
                },
                {
                    label: "ex12.check1",
                    test: (doc, { style }) => {
                        const questions = [...(sectionTitled(doc, "faq")?.querySelectorAll("details") ?? [])];
                        return questions.length > 0 && questions.every((details) =>
                            hasBackground(style, details) || hasBackground(style, details.querySelector("summary")));
                    }
                },
                {
                    label: "ex12.check2",
                    test: (doc, { style }) => {
                        const summaries = [...(sectionTitled(doc, "faq")?.querySelectorAll("details > summary") ?? [])];
                        return summaries.length > 0 && summaries.every((summary) => px(style(summary, "font-weight")) >= 600);
                    }
                },
                {
                    label: "ex12.check3",
                    test: (doc) => {
                        const questions = [...(sectionTitled(doc, "faq")?.querySelectorAll("details") ?? [])];
                        return questions.length > 0 && questions.every((details) =>
                            [...details.querySelectorAll("p")].some((p) => norm(p.textContent).length > 0));
                    }
                },
                {
                    label: "ex12.check4",
                    bonus: true,
                    test: (doc, { style }) => {
                        const questions = [...(sectionTitled(doc, "faq")?.querySelectorAll("details > summary") ?? [])];
                        return questions.length > 0 && questions.every((summary) => pointerOnHover(doc, style, summary));
                    }
                }
            ],
            lesson: "ex12.lesson"
        },
        {
            title: "ex13.title",
            keep_code: 12,
            dialogues: [
                {
                    character: "gabbro.webp",
                    name: "Gabbro",
                    text: "ex13.dialogue0"
                },
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex13.dialogue1"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex13.dialogue2"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex13.dialogue3"
                },
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex13.hint0"
                },
                {
                    character: "archi.jpg",
                    text: "ex13.hint1"
                }
            ],
            files: {
                "index.html": {
                    blocks: { palette: ["h1", "h2", "h3", "p", "div", "img", "details", "summary", "input", "button", "label", "form"], attributes: true },
                    // solution: PAGE(LINK, "<h2>Order</h2><form><label for='name'>Name: </label><input id='name' placeholder='Jane Doe'><br><br><label for='mail'>Email: </label><input id='mail' placeholder='janedoe@mail.com'><br><br><label for='date'>Delivery date: </label><input id='date' type='date'><br><br><input type='checkbox' id='conditions'><label for='conditions'>I agree that Lost and Found is no way responsible if I get lost in the shop</label><br><br><button>Order</button></form>")
                },
                "style.css": {
                    blocks: { properties: ["text-align", "background-color", "background-image", "color", "border", "padding", "margin", "border-radius", "font-style", "font-weight"] }
                    // solution: "details { background-color: lavender; border-radius: 8px; padding: 5px; margin: 15px 0px; } details:hover { cursor: pointer; } summary { font-weight: bold }"
                }
            },
            checks: [
                {
                    label: "ex13.check0",
                    test: (doc) => orderFields(doc).some((input) => isTextField(input) && captionOf(input) === "name")
                },
                {
                    label: "ex13.check1",
                    test: (doc) => orderFields(doc).some((input) => isTextField(input) && captionOf(input) === "email")
                },
                {
                    label: "ex13.check2",
                    test: (doc) => orderFields(doc, "input[type='date' i]").some((input) => captionOf(input) === "delivery date")
                },
                {
                    label: "ex13.check3",
                    test: (doc) => orderFields(doc, "input[type='checkbox' i]").some((input) => captionOf(input) === "i agree to everything")
                },
                {
                    label: "ex13.check4",
                    test: (doc) => orderFields(doc, "button, input[type='submit' i], input[type='button' i]").some((button) => buttonText(button) === "confirm")
                },
                {
                    label: "ex13.check5",
                    test: (doc) => {
                        const fields = orderFields(doc, "input, button, label");
                        return fields.length > 0 && fields.every((field) => field.closest("form") !== null);
                    }
                }
            ],
            lesson: "ex13.lesson"
        },
        {
            title: "ex14.title",
            keep_code: 13,
            dialogues: [
                {
                    character: "iroh.jpg",
                    name: "Iroh",
                    text: "ex14.dialogue0"
                },
                {
                    character: "jhin.jpg",
                    name: "Jhin",
                    text: "ex14.dialogue1"
                },
                {
                    character: "haku.jpg",
                    name: "Haku",
                    text: "ex14.dialogue2"
                },
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex14.hint0"
                },
                {
                    character: "archi.jpg",
                    text: "ex14.hint1"
                }
            ],
            files: {
                "index.html": {
                    attributes: true,
                    // solution: PAGE(LINK, "<h2>Order</h2><form><label for='name'>Name: </label><input id='name' placeholder='Jane Doe'><br><br><label for='mail'>Email: </label><input id='mail' placeholder='janedoe@mail.com'><br><br><label for='date'>Delivery date: </label><input id='date' type='date'><br><br><input type='checkbox' id='conditions'><label for='conditions'>I agree that Lost and Found is no way responsible if I get lost in the shop</label><br><br><button>Order</button></form>")
                },
                "style.css": {
                    // solution: "details { background-color: lavender; border-radius: 8px; padding: 5px; margin: 15px 0px; } details:hover { cursor: pointer; } summary { font-weight: bold }"
                }
            },
            checks: [
                {
                    label: "ex14.check0",
                    test: (doc) => { return true; }
                }
            ],
            lesson: "ex14.lesson"
        }
    ]
};
