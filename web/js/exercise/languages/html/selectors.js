// Selectors the CSS blocks propose: tags, .classes and #ids used in the page body.

export function selectorsIn(html) {
    const body = new DOMParser().parseFromString(html, "text/html").body;
    const selectors = new Set();
    for (const element of body.querySelectorAll("*")) {
        selectors.add(element.tagName.toLowerCase());
        element.classList.forEach((name) => selectors.add(`.${name}`));
        if (element.id)
            selectors.add(`#${element.id}`);
    }
    return [...selectors];
}
