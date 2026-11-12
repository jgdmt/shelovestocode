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
    title: "module.title",
    description: "module.description",
    length: 2,
    exercises: [
        {
            title: "ex0.title",
            guide: "ex0.guide",
            mission: "ex0.mission",
            dialogues: [
                {
                    character: "iroh.jpg",
                    text: "ex0.dialogue0"
                },
                {
                    character: "haku2.jpg",
                    text: "ex0.dialogue1"
                }
            ],
            hints: [
                {
                    character: "archi.jpg",
                    text: "ex0.hint0"
                }
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
                    label: "ex0.check0",
                    test: (doc, { style, sameColor }) => sameColor(style("h1", "color"), "purple")
                },
                {
                    label: "ex0.check1",
                    test: (doc, { style }) => style("p", "font-size") === "20px"
                }
            ],
            // hints: [
            //     "Inside the braces of <code>h1 { }</code>, write a declaration: a property, a colon, a value and a semicolon.",
            //     `This declaration changes the text color:${snippet("color: purple;")}`,
            //     `For the paragraph, add a new rule:${snippet("p {\n  font-size: 20px;\n}")}`
            // ],
            lesson:
"ex0.lesson"
        },
        {
            title: "ex1.title",
            guide: "ex1.guide",
            mission: "ex1.mission",
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
                    label: "ex1.check0",
                    test: (doc, { linked }) => linked("style.css")
                },
                {
                    label: "ex1.check1",
                    test: (doc, { $ }) => $("div.story") !== null
                },
                {
                    label: "ex1.check2",
                    test: (doc, { style, sameColor }) => sameColor(style(".story", "background-color"), "lavender")
                },
                {
                    label: "ex1.check3",
                    test: (doc, { style, sameColor }) => !sameColor(style("h1", "color"), "black")
                }
            ],
            hints: [
                { character: "archi.jpg", text: "ex1.hint0" },
                { character: "archi.jpg", text: "ex1.hint1" },
                { character: "archi.jpg", text: "ex1.hint2" }
            ],
            lesson:
"ex1.lesson"
        }
    ]
};
