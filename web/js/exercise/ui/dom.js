// Small DOM helpers shared by the exercise page.

export const $ = (id) => document.getElementById(id);

/**
 * Creates an element: h("span", { class: "chip", onClick: fn }, "text", child)
 * Keys starting with "on" become event listeners, known properties are set
 * directly, anything else becomes an attribute.
 */
export function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (value === undefined)
            continue;
        if (key.startsWith("on"))
            node.addEventListener(key.slice(2).toLowerCase(), value);
        else if (key === "class")
            node.className = value;
        else if (key in node)
            node[key] = value;
        else
            node.setAttribute(key, value);
    }
    node.append(...children.filter((child) => child != null));
    return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";

// An icon from the sprite in exercise.html: icon("x") uses <symbol id="i-x">.
export function icon(name, className = "icon") {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(SVG_NS, "use");
    use.setAttribute("href", `#i-${name}`);
    svg.appendChild(use);
    return svg;
}

/**
 * Wires a group of buttons carrying a data-<attr> so only one is active.
 * onSelect can return false to refuse the change. The returned select(value)
 * does the same from code; select(value, { silent: true }) only updates the buttons.
 */
export function setupSegmented(container, attr, onSelect) {
    const buttons = [...container.querySelectorAll(`[data-${attr}]`)];
    const select = (value, { silent = false } = {}) => {
        if (!silent && onSelect(value) === false)
            return;
        buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset[attr] === value));
    };
    buttons.forEach((btn) => btn.addEventListener("click", () => select(btn.dataset[attr])));
    return select;
}

export function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
