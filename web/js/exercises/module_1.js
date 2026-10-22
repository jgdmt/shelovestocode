// Exercises of module 1: CSS basics. Format: see README.md in this folder.

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

export default {
    title: "Module 1 — CSS basics",
    length: 2,
    exercises: [
        {
            title: "Paint it purple",
            guide: "HTML gives a page its content, CSS gives it its looks! Here the HTML is ready: we only change the style.",
            mission: [
                "A CSS <b>rule</b> picks elements with a <b>selector</b> (<code>h1</code>) and changes their look with <b>declarations</b> (<code>color: purple;</code>).",
                "In <code>style.css</code>, make the title <b>purple</b>, then make the paragraph text <b>20px</b> big."
            ],
            files: {
                "index.html": {
                    readOnly: true,
                    starter: PAGE(LINK, "    <h1>Hello CSS!</h1>\n    <p>This text will soon have style.</p>")
                },
                "style.css": {
                    blocks: { properties: ["color", "font-size", "background-color", "text-align"] },
                    starter: "h1 {\n}\n",
                    solution: "h1 {\n  color: purple;\n}\n\np {\n  font-size: 20px;\n}\n"
                }
            },
            checks: [
                {
                    label: "The title is purple",
                    test: (doc, { style, sameColor }) => sameColor(style("h1", "color"), "purple")
                },
                {
                    label: "The paragraph text is 20px",
                    test: (doc, { style }) => style("p", "font-size") === "20px"
                }
            ],
            hints: [
                "Inside the braces of <code>h1 { }</code>, write a declaration: a property, a colon, a value and a semicolon.",
                `This declaration changes the text color:${snippet("color: purple;")}`,
                `For the paragraph, add a new rule:${snippet("p {\n  font-size: 20px;\n}")}`
            ],
            lesson:
`<p>A CSS rule has two parts:</p>
<ul>
  <li>the <b>selector</b> (<code>h1</code>, <code>p</code>...) says which elements are styled;</li>
  <li>the <b>declarations</b> between <code>{ }</code> say how: <code>property: value;</code></li>
</ul>
<p>The HTML loads the CSS file with this line in its <code>&lt;head&gt;</code>:</p>
${snippet('<link rel="stylesheet" href="style.css">')}`
        },
        {
            title: "Link your style",
            guide: "This time the CSS is ready, but the page doesn't use it yet. Let's connect them!",
            mission: [
                `1. In <code>index.html</code>, load the stylesheet: add this line inside <code>&lt;head&gt;</code>.${snippet('<link rel="stylesheet" href="style.css">')}`,
                `2. The CSS styles elements with the class <code>story</code>: give the <code>&lt;div&gt;</code> this attribute.${snippet('class="story"')}`,
                "3. In <code>style.css</code>, give the title the color you like."
            ],
            files: {
                "index.html": {
                    blocks: { palette: ["h1", "p", "div"], attributes: true },
                    starter: PAGE("", "    <div>\n      <h1>My first styled page</h1>\n      <p>CSS makes the web beautiful.</p>\n    </div>"),
                    solution: PAGE(LINK, "    <div class=\"story\">\n      <h1>My first styled page</h1>\n      <p>CSS makes the web beautiful.</p>\n    </div>")
                },
                "style.css": {
                    blocks: { properties: ["color", "background-color", "padding", "border-radius"] },
                    starter: ".story {\n  background-color: lavender;\n  padding: 16px;\n  border-radius: 12px;\n}\n",
                    solution: ".story {\n  background-color: lavender;\n  padding: 16px;\n  border-radius: 12px;\n}\n\nh1 {\n  color: purple;\n}\n"
                }
            },
            checks: [
                {
                    label: "index.html loads style.css",
                    test: (doc, { linked }) => linked("style.css")
                },
                {
                    label: "The <div> has the class \"story\"",
                    test: (doc, { $ }) => $("div.story") !== null
                },
                {
                    label: "The story box is lavender",
                    test: (doc, { style, sameColor }) => sameColor(style(".story", "background-color"), "lavender")
                },
                {
                    label: "The title has a color",
                    test: (doc, { style, sameColor }) => !sameColor(style("h1", "color"), "black")
                }
            ],
            hints: [
                "The <code>&lt;head&gt;</code> can't be edited in blocks mode: switch to <b>Code</b> for step 1.",
                "In blocks mode, hover the <code>&lt;div&gt;</code> and click <b>+</b> to add an attribute: name <code>class</code>, value <code>story</code>.",
                "Click a selector chip in the CSS blocks (like <code>h1</code>) to create a rule, then add a <code>color</code> property to it."
            ],
            lesson:
`<p>HTML and CSS are two files that work together:</p>
<ul>
  <li><code>&lt;link rel="stylesheet" href="style.css"&gt;</code> tells the browser to load the CSS;</li>
  <li>a <b>class</b> (<code>class="story"</code>) names elements, and the selector <code>.story</code> styles them all.</li>
</ul>`
        }
    ]
};
