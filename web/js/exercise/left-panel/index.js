// Left panel: the Mission tab and the inventory tabs (Tags, Properties, Images).

import { setupSegmented } from "../ui/dom.js";
import { createMission } from "./mission.js";
import { renderInventory } from "./inventory.js";

function setupTabs() {
    const panes = document.querySelectorAll("[data-pane]");
    setupSegmented(document.querySelector(".tabs"), "tab", (tab) => {
        panes.forEach((pane) => { pane.hidden = pane.dataset.pane !== tab; });
    });
}

// Returns the mission: { updateChecks(results), showSuccess() }.
export function createLeftPanel(ex, { onInsert, showProperties }) {
    setupTabs();
    renderInventory(onInsert, { showProperties });
    return createMission(ex);
}
