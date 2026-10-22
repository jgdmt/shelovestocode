// Where we are, read once from the URL: exercise.html?branch=web&mod=0&ex=0

const params = new URLSearchParams(window.location.search);

export const ctx = {
    branch: params.get("branch") || "web",
    mod: params.get("mod") || "0",
    ex: parseInt(params.get("ex") || "0", 10)
};

// Exercises not yet ported to the new format still use the old pages.
export function exerciseUrl(module, index) {
    const query = `branch=${ctx.branch}&mod=${ctx.mod}&ex=${index}`;
    return module.exercises[index]
        ? `exercise.html?${query}`
        : `module_${ctx.mod}/${index}.html?${query}`;
}
