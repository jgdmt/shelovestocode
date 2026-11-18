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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createDialogues(ex, delay = 800) {
    const guide = $("guide");
    let lastImage = null;
    const dialogues = ex.dialogues || [];

    // for...of (not forEach) so each `await` really pauses before the next bubble
    for (const [i, dialogue] of dialogues.entries()) {
        if (i > 0) await sleep(delay);

        // no character given: continuation of the previous speaker (or Archimede by default)
        const continuation = !dialogue.character && lastImage !== null;
        const character = dialogue.character || "archi.jpg";
        const speaker = dialogue.name || "Archimede";

        const image = h("img", { src: `/images/${character}`, style: "display: block;" });
        const text = h("p", { class: "bubble" }, dialogue.text);
        const name = h("h6", { style: "margin: 5px 0;" }, speaker);
        const avatar = h("div", { style: "display: inline-block; text-align: center;" });
        if (continuation || lastImage === character) {
            image.style.visibility = "hidden";
            name.hidden = true;
        }
        avatar.append(image, name);

        const div = h("div");
        div.append(avatar, text);
        guide.appendChild(div);
        enhanceSnippets(div);

        // little "new message" pop-in
        div.animate(
            [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
            { duration: 250, easing: "ease-out" }
        );
        // div.scrollIntoView({ behavior: "smooth", block: "nearest" });

        if (!continuation) lastImage = character;
    }
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
