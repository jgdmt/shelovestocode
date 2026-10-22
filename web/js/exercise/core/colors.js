// Color formats: the browser accepts purple, #800080, rgb(128, 0, 128)...
// A 2D canvas converts any of them to a single format.

const canvas = document.createElement("canvas").getContext("2d");
const SENTINEL = "#010203"; // left unchanged by the canvas when the color is invalid

// "#rrggbb" (or "rgba(...)" when transparent), or null when it isn't a color.
export function normalizeColor(color) {
    if (typeof color !== "string")
        return null;
    canvas.fillStyle = SENTINEL;
    canvas.fillStyle = color;
    const result = canvas.fillStyle;
    return result === SENTINEL && color.trim().toLowerCase() !== SENTINEL ? null : result;
}

// "#rrggbb" for <input type="color">, or null.
export function toHex(color) {
    const result = normalizeColor(color);
    return result?.startsWith("#") ? result : null;
}
