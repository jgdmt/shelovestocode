// Exercise progress: sessionStorage "ex-state" (filled by the index page) + backend API.
// When the page is opened directly, there is no state and nothing is tracked.

import { ctx } from "./context.js";

const API = "http://127.0.0.1:8000";

export const Status = {
    DEFAULT: 0,
    STARTED: 1,
    FINISHED: 2
};

function readStates() {
    try {
        return JSON.parse(sessionStorage.getItem("ex-state")) || [];
    } catch {
        return [];
    }
}

function writeStates(states) {
    try {
        sessionStorage.setItem("ex-state", JSON.stringify(states));
    } catch {
        // progress stays on the backend anyway
    }
}

async function post(path) {
    try {
        const response = await fetch(`${API}${path}`, { method: "POST" });
        if (!response.ok)
            console.warn("API error", response.status, path);
    } catch {
        console.warn("Backend not reachable", path);
    }
}

export function statusOf(index) {
    return readStates()[index]?.status ?? Status.DEFAULT;
}

function advance(endpoint, from, to) {
    const states = readStates();
    const state = states[ctx.ex];
    if (!state || !from.includes(state.status))
        return;
    state.status = to;
    writeStates(states);
    post(`/${endpoint}?branch=${ctx.branch}&mod=${ctx.mod}&ex=${ctx.ex}`);
}

export function markStarted() {
    advance("start", [Status.DEFAULT], Status.STARTED);
}

export function markFinished() {
    advance("finish", [Status.DEFAULT, Status.STARTED], Status.FINISHED);
}
