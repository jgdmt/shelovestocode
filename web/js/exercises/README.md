# Writing exercises

Each module is a file `module_<n>.js` in this folder, opened with
`html/exercise.html?branch=web&mod=<n>&ex=<index>`.

```js
export default {
    title: "Module 1 — CSS basics",
    length: 8,            // steps shown in the top bar; missing exercises link to the old pages
    exercises: [ /* ... */ ]
};
```

## An exercise

| Field      | What it is |
|------------|------------|
| `title`    | Heading of the mission |
| `guide`    | What Archimede says in his speech bubble |
| `mission`  | Paragraphs of instructions (HTML allowed) |
| `files`    | The files of the exercise, see below |
| `autoLink` | `true` to apply the CSS files even if `index.html` doesn't link them (first CSS steps) |
| `checks`   | Objectives, see below |
| `hints`    | Revealed one by one (HTML allowed) |
| `lesson`   | Shown once every check passes (HTML allowed) |

### Code to copy

Code the student is meant to copy goes in a `snippet()`: it is shown as a block
with a **Copy** button. Write the code as is, it is escaped for you. Use
`<code>` for code that is only mentioned in a sentence.

```js
import { snippet } from "./helpers.js";

mission: [`Add this line inside <code>&lt;head&gt;</code>:${snippet('<link rel="stylesheet" href="style.css">')}`]
```

### Files

```js
files: {
    "index.html": { starter, solution, readOnly, blocks },
    "style.css":  { starter, solution, readOnly, blocks }
}
```

- `starter`: the code the student starts from. `solution`: the code shown in the **Goal** preview (defaults to `starter`).
- `readOnly: true`: the file is shown but can't be edited (e.g. the HTML of a CSS exercise).
- `blocks`: settings of the blocks mode, or `false` to disable it.
  - HTML: `{ palette: ["h1", "p"], attributes: true }`. `attributes` lets students add and edit attributes (off by default).
  - CSS: `{ properties: ["color", "font-size"] }`. Selectors are proposed from the tags, classes and ids of `index.html`.

The language comes from the extension (`.html`, `.css`, `.js`). An exercise with a single HTML file can use the short format `{ starter, solution, blocks }` instead of `files`.

### Checks

```js
checks: [
    { label: "The title is purple", test: (doc, { style, sameColor }) => sameColor(style("h1", "color"), "purple") }
]
```

`test` runs on the page as the browser renders it (CSS applied, scripts not run) and gets:

- `doc`: the rendered document (`doc.querySelector(...)`...)
- `$(selector)`, `$$(selector)`: first element / all elements
- `style(selectorOrElement, property)`: computed value, e.g. `"rgb(128, 0, 128)"`, `"20px"`
- `sameColor(a, b)`: compares two colors whatever their format (`purple`, `#800080`, `rgb(...)`)
- `code(fileName)`: source code of a file
- `linked(fileName)`: `true` when `index.html` links that stylesheet

A check that throws counts as failed.

## Inventory

Tags, CSS properties and images of the inventory tabs are listed in `inventory.js`.
