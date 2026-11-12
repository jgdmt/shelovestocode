// Mission tab: Archimede's bubble, instructions, objectives, hints and lesson.

import { $, h } from "../ui/dom.js";
import { enhanceSnippets } from "../ui/snippets.js";
import { ui } from "../core/i18n.js";

function renderTexts(ex) {
    document.title = ui("page.exerciseDocTitle", { title: ex.title });
    createDialogues(ex);
    // $("guide-text").textContent = ex.guide;
    // $("ex-title").textContent = ex.title;
    // a div, not a <p>: paragraphs may contain snippets (<pre>)
    // $("mission").innerHTML = ex.mission.map((paragraph) => `<div class="paragraph">${paragraph}</div>`).join("");
    $("lesson").innerHTML = ex.lesson;
    enhanceSnippets($("mission"));
    enhanceSnippets($("lesson"));
}

function setupHints(hints) {
    const button = $("hint-btn");
    let shown = 0;
    button.hidden = hints.length === 0;
    button.addEventListener("click", () => {
        // const hint = h("div", { class: "hint", innerHTML: hints[shown] });
        const image = h("img", { src: `/images/${hints[shown].character}`, style:"display: block;" });
        const text = h("p", { id: "guide-text", class:"bubble" }, hints[shown].text);
        const hint = h("div");
        hint.appendChild(image);
        hint.appendChild(text);
        $("hints").appendChild(hint);
        enhanceSnippets(hint);
        shown++;
        button.hidden = shown >= hints.length;
    });
}

function createDialogues(ex) {
    let lastImage = null;
    (ex.dialogues || []).forEach((dialogue) => {
        let charExists = true;
        if (!dialogue.character) {
            dialogue.character = "archi.jpg";
            if (lastImage)
                charExists = false;
        }
        if (!dialogue.name) {
            dialogue.name = "Archimede";
        }
        const image = h("img", { src: `/images/${dialogue.character}`, style:"display: block;" });
        const text = h("p", { id: "guide-text", class:"bubble" }, dialogue.text);
        const name = h("h6", { style:"margin: 5px 0;" }, dialogue.name);
        const div = h("div");
        const character = h("div", { style: "display: inline-block; text-align: center;" });
        if (lastImage == dialogue.character || !charExists) {
            image.style.visibility = "hidden";
            name.hidden = true;
        }
        character.appendChild(image);
        character.appendChild(name);
        div.appendChild(character);
        div.appendChild(text);
        $("guide").appendChild(div)
        lastImage = dialogue.character;
    })
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
            $("hints").hidden = true;
            // $("guide-text").textContent = "Well done! Read the lesson below, then move on to the next exercise.";
        }
    };
}
