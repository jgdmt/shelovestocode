import { $ } from "./dom.js";
import { ui } from "../core/i18n.js";

const { driver } = window.driver.js;

const tourSteps = () => [
    { element: "#guide-missions", popover: { title: ui("tour.missionTitle"), description: ui("tour.mission")} },
    { element: "#guide-tags", popover: { title: ui("tour.tagsTitle"), description: ui("tour.tags")} },
    { element: "#guide-properties", popover: { title: ui("tour.propertiesTitle"), description: ui("tour.properties")} },
    { element: "#guide-images", popover: { title: ui("tour.imagesTitle"), description: ui("tour.images")} },
    { element: "#guide", popover: { title: ui("tour.clientsTitle"), description: ui("tour.clients") }},
    { element: "#guide-objectives", popover: { title: ui("tour.objectivesTitle"), description: ui("tour.objectives") }},
    { element: "#guide-hints", popover: { title: ui("tour.hintsTitle"), description: ui("tour.hints") }},
    { element: "#mode-switch", popover: { title: ui("tour.modeTitle"), description: ui("tour.mode") }},
    { element: "#guide-preview", popover: { title: ui("tour.previewTitle"), description: ui("tour.preview") }},
    { element: "#guide-live", popover: { title: ui("tour.liveTitle"), description: ui("tour.live") }},
    { element: "#run-btn", popover: { title: ui("tour.runTitle"), description: ui("tour.run") }},
    { element: "#panel-goal", popover: { title: ui("tour.exampleTitle"), description: ui("tour.example") }},
    { element: "#theme-toggle", popover: { title: ui("tour.darkmodeTitle"), description: ui("tour.darkmode")}},
    { element: "#guide-tour", popover: { title: ui("tour.guideTitle"), description: ui("tour.guide") }},
    { popover: { title: ui("tour.funTitle"), description: ui("tour.fun") }}
];

const welcomeStep = () => ({
    popover: {
        title: ui("tour.welcomeTitle"),
        description: ui("tour.welcomeText"),
        showButtons: ["next", "close"],
        nextBtnText: ui("tour.start"),
    }
});

function isVisible(selector) {
    const element = document.querySelector(selector);

    if (!element)
        return false;
    return element.checkVisibility ? element.checkVisibility({ visibilityProperty: true, opacityProperty: true }) : element.getClientREcts().length > 0;
}

function visibleSteps(steps) {
    return steps.filter((step) => !step.element || isVisible(step.element));
}

export function startTour(withConfirmation = true) {
    const steps = visibleSteps(tourSteps());
    driver({
        showProgress: true,
        nextBtnText: ui("tour.next"),
        prevBtnText: ui("tour.previous"),
        doneBtnText: ui("tour.done"),
        progressText: ui("tour.progress", { current: "{{current}}", total: "{{total}}" }),
        steps: withConfirmation ? [welcomeStep(), ...steps] : steps
    }).drive();
}

export function setupGuideTour() {
    const button = $("guide-tour");

    button.addEventListener("click", () => {
        console.log("Started tour")
        startTour();
    })
}