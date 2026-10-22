// Drag handles that resize panels. Sizes are remembered per viewer;
// double-click a handle to go back to the default layout.
//
//   sizeAt(event)  pointer position -> wanted size
//   clamp(size)    keeps the size usable (also used on window resize)
//   apply(size)    applies it, null means "back to the CSS default"

import { load, save } from "../core/storage.js";

export function setupSplitter(handle, { key, sizeAt, clamp, apply }) {
    let size = parseFloat(load(key));
    if (Number.isNaN(size))
        size = null;
    else
        apply(size = clamp(size));

    handle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        document.body.classList.add("resizing", `resizing-${handle.getAttribute("aria-orientation")}`);

        const move = (ev) => apply(size = clamp(sizeAt(ev)));
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", () => {
            handle.removeEventListener("pointermove", move);
            document.body.classList.remove("resizing", "resizing-vertical", "resizing-horizontal");
            save(key, String(size));
        }, { once: true });
    });

    handle.addEventListener("dblclick", () => {
        size = null;
        apply(null);
        save(key, "");
    });

    window.addEventListener("resize", () => {
        if (size !== null)
            apply(size = clamp(size));
    });
}
