// Images the student imports in the Images tab. They are kept in this browser
// (IndexedDB), resized on import so they stay small. In the code they are
// written "my-images/<name>"; the previews and the checks swap that path for
// the image itself (see resolveUserImages, used by page-builder.js).

export const PREFIX = "my-images/";

const DB_NAME = "slc-images";
const STORE = "images";
const MAX_SIDE = 1000;               // px: bigger photos are scaled down
const KEEP_AS_IS = 300 * 1024;       // smaller files are kept untouched
const MAX_RAW = 2 * 1024 * 1024;     // GIF / SVG can't be resized: 2 MB max

const cache = new Map(); // name -> data URL

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "name" });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function withStore(mode, action) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = action(transaction.objectStore(STORE));
        transaction.oncomplete = () => resolve(request?.result);
        transaction.onerror = transaction.onabort = () => reject(transaction.error);
    });
}

/** Reads the imported images once, before the page uses them. Never throws. */
export async function loadUserImages() {
    try {
        const images = await withStore("readonly", (store) => store.getAll());
        images.sort((a, b) => a.added - b.added).forEach(({ name, url }) => cache.set(name, url));
    } catch (err) {
        console.warn("Imported images are not available in this browser", err);
    }
}

/** [{ name, url, path }]: path is what goes in the code. */
export const userImages = () => [...cache].map(([name, url]) => ({ name, url, path: PREFIX + name }));

const readAsDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
});

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("unreadable"));
        img.src = url;
    });
}

// Data URL of the image, scaled down when it is big. Returns { url, extension }.
async function shrink(file) {
    const original = await readAsDataUrl(file);
    if (/^image\/(gif|svg\+xml)$/.test(file.type)) { // resizing would lose the animation / the vectors
        if (file.size > MAX_RAW)
            throw new Error("too-big");
        return { url: original, extension: null };
    }
    const img = await loadImage(original);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= KEEP_AS_IS)
        return { url: original, extension: null };

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    // photos as JPEG (much smaller), the rest as PNG to keep transparency
    return file.type === "image/jpeg"
        ? { url: canvas.toDataURL("image/jpeg", 0.85), extension: "jpg" }
        : { url: canvas.toDataURL("image/png"), extension: "png" };
}

// "Ma Photo (1).JPEG" -> "ma-photo-1.jpeg", unique among the imported images.
function uniqueName(fileName, extension) {
    const dot = fileName.lastIndexOf(".");
    const clean = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const base = clean(dot > 0 ? fileName.slice(0, dot) : fileName) || "image";
    const ext = extension ?? (clean(dot > 0 ? fileName.slice(dot + 1) : "") || "png");
    let name = `${base}.${ext}`;
    for (let i = 2; cache.has(name); i++)
        name = `${base}-${i}.${ext}`;
    return name;
}

/**
 * Imports a file chosen by the student. Resolves with its name, or rejects with
 * Error("not-image" | "too-big" | "unreadable" | anything else = storage failed).
 */
export async function importImage(file) {
    if (!file.type.startsWith("image/"))
        throw new Error("not-image");
    const { url, extension } = await shrink(file);
    const name = uniqueName(file.name, extension);
    await withStore("readwrite", (store) => store.put({ name, url, added: Date.now() }));
    cache.set(name, url);
    return name;
}

export async function removeImage(name) {
    await withStore("readwrite", (store) => store.delete(name));
    cache.delete(name);
}

/** Replaces the "my-images/<name>" paths of a page by the images themselves. */
export function resolveUserImages(text) {
    if (!cache.size)
        return text;
    return text.replace(/(?:\.?\/)?my-images\/([\w.-]+)/g, (path, name) => cache.get(name) ?? path);
}
