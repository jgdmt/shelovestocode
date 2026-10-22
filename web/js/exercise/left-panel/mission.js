// Mission tab: Archimede's bubble, instructions, objectives, hints and lesson.

import { $, h } from "../ui/dom.js";
import { enhanceSnippets } from "../ui/snippets.js";

function renderTexts(ex) {
    document.title = `${ex.title} — SheLovesToCode`;
    $("guide-text").textContent = ex.guide;
    $("ex-title").textContent = ex.title;
    // a div, not a <p>: paragraphs may contain snippets (<pre>)
    $("mission").innerHTML = ex.mission.map((paragraph) => `<div class="paragraph">${paragraph}</div>`).join("");
    $("lesson").innerHTML = ex.lesson;
    enhanceSnippets($("mission"));
    enhanceSnippets($("lesson"));
}

function setupHints(hints) {
    const button = $("hint-btn");
    let shown = 0;
    button.hidden = hints.length === 0;
    button.addEventListener("click", () => {
        const hint = h("div", { class: "hint", innerHTML: hints[shown] });
        $("hints").appendChild(hint);
        enhanceSnippets(hint);
        shown++;
        button.hidden = shown >= hints.length;
    });
}

export function createMission(ex) {
    renderTexts(ex);
    setupHints(ex.hints || []);

    const checkItems = ex.checks.map((check) => h("li", {}, check.label));
    $("checks").replaceChildren(...checkItems);

    return {
        updateChecks(results) {
            checkItems.forEach((item, i) => item.classList.toggle("ok", results[i]));
        },
        showSuccess() {
            $("success").hidden = false;
            $("hint-btn").hidden = true;
            $("guide-text").textContent = "Well done! Read the lesson below, then move on to the next exercise.";
        }
    };
}
