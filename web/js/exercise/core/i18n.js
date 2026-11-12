// Translations with i18next. Texts live in /locales/<lang>/module_<n>.json, one
// namespace per module, and the fixed texts of the interface in /locales/<lang>/ui.json; the module files only hold keys ("ex0.title").
// localizeModule() replaces every key of a module by its text when the module
// is loaded, so the rest of the code just reads plain strings.
// Missing or empty translations fall back to English; a value that is not a
// key (plain text) is shown as is.

import i18next from "https://cdn.jsdelivr.net/npm/i18next@23.11.5/dist/esm/i18next.js";
import { languages, readLanguage } from "./progress.js";

const CODES = {
    [languages.EN]: "en",
    [languages.FR]: "fr",
    [languages.NL]: "nl"
};
const FALLBACK = "en";
const KEY = /^[\w-]+(\.[\w-]+)+$/; // "ex0.title", "module.description"

export const currentLanguage = () => CODES[readLanguage()] ?? FALLBACK;

let ready = null;
function init() {
    ready ??= i18next.init({
        lng: currentLanguage(),
        fallbackLng: FALLBACK,
        ns: [],
        resources: {},
        returnEmptyString: false,
        interpolation: { escapeValue: false }
    }).then(() => {
        document.documentElement.lang = currentLanguage();
    });
    return ready;
}

async function fetchJson(url) {
    try {
        const response = await fetch(url);
        return response.ok ? await response.json() : null;
    } catch {
        return null;
    }
}

const namespaces = new Map();
/** Loads the texts of a namespace in the student's language and in English. */
function loadNamespace(ns) {
    if (!namespaces.has(ns)) {
        namespaces.set(ns, (async () => {
            await init();
            for (const code of new Set([currentLanguage(), FALLBACK])) {
                const texts = await fetchJson(`/locales/${code}/${ns}.json`);
                if (texts)
                    i18next.addResourceBundle(code, ns, texts, true, true);
                else
                    console.warn(`No translations for ${ns} in "${code}"`);
            }
        })());
    }
    return namespaces.get(ns);
}

/** The text of a key in namespace ns (a string, or an array for multi-line texts). */
export function t(value, ns) {
    if (value == null)
        return value;
    if (Array.isArray(value))
        return value.flatMap((item) => t(item, ns));
    if (typeof value === "object") { // inline { en: [...], fr: [...] }
        return [currentLanguage(), FALLBACK]
            .map((code) => value[code])
            .find((text) => [text].flat().some((line) => line && line.trim())) ?? "";
    }
    if (typeof value === "string" && KEY.test(value) && i18next.exists(value, { ns }))
        return i18next.t(value, { ns, returnObjects: true });
    return value;
}

const lines = (value) => [value ?? []].flat();
const text = (value) => lines(value).join(" ");

/** Replaces the keys of a module (module_<mod>.js) by their texts. Done once per module. */
export async function localizeModule(module, mod) {
    if (!module || module.localized)
        return module;
    const ns = `module_${mod}`;
    await loadNamespace(ns);
    const tr = (value) => t(value, ns);

    module.title = text(tr(module.title));
    module.description = text(tr(module.description));
    for (const ex of module.exercises ?? []) {
        if (!ex)
            continue;
        ex.title = text(tr(ex.title));
        if (ex.guide != null)
            ex.guide = text(tr(ex.guide));
        if (ex.mission != null)
            ex.mission = lines(tr(ex.mission));
        if (ex.lesson != null)
            ex.lesson = text(tr(ex.lesson));
        for (const check of ex.checks ?? [])
            check.label = text(tr(check.label));
        for (const dialogue of ex.dialogues ?? [])
            dialogue.text = text(tr(dialogue.text));
        ex.hints = (ex.hints ?? []).map((hint) => typeof hint === "string"
            ? { character: "archi.jpg", text: text(tr(hint)) }
            : { ...hint, text: text(tr(hint.text ?? hint)) });
    }
    module.localized = true;
    return module;
}

/** A fixed text of the interface (locales/<lang>/ui.json): ui("code.reset"), ui("html.neverClosed", { name, line }) */
export const ui = (key, options) => i18next.t(key, { ns: "ui", ...options });

/** Loads the interface texts, then translates the elements of the page marked with data-i18n*. */
export async function loadUi() {
    await loadNamespace("ui");
    translatePage();
}

// data-i18n="key": text, data-i18n-html="key": HTML, data-i18n-<attribute>="key": that attribute (title, aria-label, href...)
export function translatePage(root = document) {
    for (const element of root.querySelectorAll("*")) {
        for (const { name, value } of [...element.attributes]) {
            if (name === "data-i18n")
                element.textContent = ui(value);
            else if (name === "data-i18n-html")
                element.innerHTML = ui(value);
            else if (name.startsWith("data-i18n-"))
                element.setAttribute(name.slice("data-i18n-".length), ui(value));
        }
    }
}
