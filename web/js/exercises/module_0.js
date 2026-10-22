// Exercises of module 0: HTML basics. Format: see README.md in this folder.

import { snippet } from "./helpers.js";

const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

export default {
    title: "HTML basics",
    description: "Tags, structure and your very first web page.",
    length: 8,
    exercises: [
        {
            title: "Hello and welcome",
            guide: "Hi, I'm Archimede! Welcome to your first web exercise. Together we'll learn HTML, the language that describes the content and structure of a web page.",
            mission: [
                "On the right you can see the result of the code in the middle. Every change you make shows up live.",
                "Our story has no title yet! Add a main title <code>&lt;h1&gt;</code> with the text <b>A story with a random title</b>, just above the paragraph."
            ],
            blocks: { palette: ["h1", "h2", "h3", "p"] },
            starter:
`<html>
  <head>
  </head>
  <body>
    <p>This is the story of a random character.</p>
  </body>
</html>`,
            solution:
`<html>
  <head>
  </head>
  <body>
    <h1>A story with a random title</h1>
    <p>This is the story of a random character.</p>
  </body>
</html>`,
            checks: [
                {
                    label: "There is an <h1> title",
                    test: (doc) => doc.querySelector("body h1") !== null
                },
                {
                    label: "The title says “A story with a random title”",
                    test: (doc) => norm(doc.querySelector("h1")?.textContent) === "a story with a random title"
                },
                {
                    label: "The paragraph is still there",
                    test: (doc) => norm(doc.querySelector("p")?.textContent) === "this is the story of a random character."
                },
                {
                    label: "The title comes before the paragraph",
                    test: (doc) => {
                        const h1 = doc.querySelector("h1");
                        const p = doc.querySelector("p");
                        return !!(h1 && p && (h1.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING));
                    }
                }
            ],
            hints: [
                "Titles are written with tags that start with <code>h</code> followed by a number. The smaller the number, the bigger the title.",
                "Most tags go in pairs: an opening tag <code>&lt;h1&gt;</code> and a closing tag <code>&lt;/h1&gt;</code>. The text goes between them.",
                `Write this on the line just before <code>&lt;p&gt;</code>:${snippet("<h1>A story with a random title</h1>")}`
            ],
            lesson:
`<p><code>&lt;html&gt;</code>, <code>&lt;head&gt;</code>, <code>&lt;body&gt;</code>, <code>&lt;p&gt;</code> and <code>&lt;h1&gt;</code> are called <b>tags</b>. Most tags go in pairs: the opening one (<code>&lt;html&gt;</code>) and the closing one (<code>&lt;/html&gt;</code>).</p>
<p>There are 3 fundamental tags:</p>
<ul>
  <li><b>&lt;html&gt;</b> wraps the whole page and announces that the rest is HTML.</li>
  <li><b>&lt;head&gt;</b> contains metadata: information for the browser, not visible on the page.</li>
  <li><b>&lt;body&gt;</b> contains everything visible on the page.</li>
</ul>
<p>For now we focus on the body and leave the head empty.</p>`
        }
    ]
};
