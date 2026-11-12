# Writing exercises

Each module is a file `module_<n>.js` in this folder, opened with
`html/exercise.html?branch=web&mod=<n>&ex=<index>`.

```js
export default {
    title: "module.title",              // keys of locales/<lang>/module_<n>.json, see Translations
    description: "module.description",  // shown on the home page
    length: 8,            // steps shown in the top bar; missing exercises link to the old pages
    exercises: [ /* ... */ ]
};
```

Add the module number to `MODULES` in `index.js` to show it on the home page.

## An exercise

All texts are translation keys (see Translations below).

| Field      | What it is |
|------------|------------|
| `title`    | Heading of the mission: `"ex0.title"` |
| `dialogues`| Speech bubbles of the clients: `{ character, name, text: "ex0.dialogue0" }` |
| `guide`    | What Archimede says in his speech bubble: `"ex0.guide"` |
| `mission`  | Paragraphs of instructions (HTML allowed): `"ex0.mission"`, an array in the JSON |
| `files`    | The files of the exercise, see below |
| `autoLink` | `true` to apply the CSS files even if `index.html` doesn't link them (first CSS steps) |
| `checks`   | Objectives, see below |
| `hints`    | Revealed one by one: `{ character, text: "ex0.hint0" }` |
| `lesson`   | Shown once every check passes (HTML allowed): `"ex0.lesson"` |

### Code to copy

Code the student is meant to copy goes in a `<pre class="snippet">`: it is
shown as a block with a **Copy** button. The texts are in JSON now, so escape the
code yourself (`<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`). Use `<code>` for code
that is only mentioned in a sentence.

```json
"mission": ["Add this line inside <code>&lt;head&gt;</code>:<pre class=\"snippet\">&lt;link rel=\"stylesheet\" href=\"style.css\"&gt;</pre>"]
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
    { label: "ex0.check0", test: (doc, { style, sameColor }) => sameColor(style("h1", "color"), "purple") }
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

## Translations

Texts are translated with [i18next](https://www.i18next.com/)
(`js/exercise/core/i18n.js`). The module file only holds keys; the texts live in
one JSON file per language and module:

```
locales/en/module_0.json
locales/fr/module_0.json
locales/nl/module_0.json
```

```json
{
    "module": { "title": "HTML basics", "description": "Tags, structure and your very first web page." },
    "ex0": {
        "title": "Hello and welcome",
        "guide": "...",
        "mission": ["First paragraph", "Second paragraph"],
        "dialogue0": ["It would be so nice to have a really big header!"],
        "hint0": ["Do you need help? I'm here for you!"],
        "check0": "There is an <h1> title",
        "lesson": "<p>...</p>"
    }
}
```

Keys are replaced by their text when the module is loaded (`localizeModule`), so
the rest of the code only sees plain strings. The language comes from the backend
(`/info` → `language`: 0 = en, 1 = fr, 2 = nl). A key missing (or empty) in French
or Dutch falls back to English, and a value that isn't a key is shown as is.

### Interface texts

The fixed texts of the interface (buttons, tabs, guided tour, error messages,
inventory descriptions...) are in `locales/<lang>/ui.json`.

- In JavaScript: `import { ui } from "../core/i18n.js";` then `ui("code.reset")`,
  or with values: `ui("html.neverClosed", { name, line })` for `"<{{name}}> (line {{line}}) is never closed."`.
- In HTML: `data-i18n="key"` replaces the text of the element, `data-i18n-title="key"`
  (or `-aria-label`, `-href`...) replaces an attribute. Keep the English text in
  the HTML too: it shows if the translations can't load.
- Counts use i18next plurals: `"problems_one"` / `"problems_other"` with `{ count }`.

## Inventory

Tags, CSS properties and images of the inventory tabs are listed in `inventory.js`;
their descriptions are in `locales/<lang>/ui.json` (`inventory.tags`, `inventory.properties`).

Students can also import their own images from the Images tab
(`js/exercise/core/user-images.js`). They are kept in the student's browser
(IndexedDB, photos scaled down to 1000 px), so they only exist on that computer.
In the code they are written `my-images/<name>`, and the previews and the checks
replace that path by the image itself.
