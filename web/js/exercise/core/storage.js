// localStorage can throw (private mode, blocked storage): never let it break the page.

export function load(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function save(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // nothing to do, the student just loses persistence
    }
}
