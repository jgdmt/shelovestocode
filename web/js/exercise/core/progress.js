// Exercise progress, kept by the backend. The home page fetches it and stores
// it in sessionStorage ("ex-state", also read by the old exercise pages) with
// the module it belongs to. Without backend, nothing is tracked.

import { ctx } from "./context.js";

const API = "http://127.0.0.1:8000";
const STATES_KEY = "ex-state";
const MODULE_KEY = "ex-state-module";

export const Status = {
    DEFAULT: 0,
    STARTED: 1,
    FINISHED: 2
};

// States of the exercises of module mod, or [] when unknown.
export function readStates(mod = ctx.mod) {
    try {
        if (sessionStorage.getItem(MODULE_KEY) !== String(mod))
            return [];
        return JSON.parse(sessionStorage.getItem(STATES_KEY)) || [];
    } catch {
        return [];
    }
}

function writeStates(mod, states) {
    try {
        sessionStorage.setItem(STATES_KEY, JSON.stringify(states));
        sessionStorage.setItem(MODULE_KEY, String(mod));
    } catch {
        // progress stays on the backend anyway
    }
}

/** Asks the backend where the student is: { module, states }, or null without backend. */
export async function fetchProgress(branch = ctx.branch) {
    try {
        const response = await fetch(`${API}/info?branch=${branch}`);
        const info = await response.json();
        writeStates(info.module, info.branch_status);
        return { module: String(info.module), states: info.branch_status };
    } catch {
        console.warn("Backend not reachable: progress is not tracked");
        return null;
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
    writeStates(ctx.mod, states);
    post(`/${endpoint}?branch=${ctx.branch}&mod=${ctx.mod}&ex=${ctx.ex}`);
}

export function markStarted() {
    advance("start", [Status.DEFAULT], Status.STARTED);
}

export function markFinished() {
    advance("finish", [Status.DEFAULT, Status.STARTED], Status.FINISHED);
}
