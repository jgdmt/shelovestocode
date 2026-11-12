const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

// Every text is a key of /locales/<lang>/module_<n>.json (en, fr, nl).
export default {
    title: "module.title",
    description: "module.description",
    length: 8,
    exercises: [
        {
            title: "ex0.title",
            keep_code: true,
            mission: "ex0.mission",
            dialogues: [
                { text: "ex0.dialogue0" },
                { character: "iroh.jpg", name: "Iroh", text: "ex0.dialogue1" }
            ],
            hints: [
                { character: "archi.jpg", text: "ex0.hint0" }
            ],
            blocks: { palette: ["h1", "h2", "h3", "p"] },
            checks: [
                {
                    label: "ex0.check0",
                    test: (doc) => doc.querySelector("body h1") !== null
                },
                {
                    label: "ex0.check1",
                    test: (doc) => norm(doc.querySelector("h1")?.textContent) === "lost & found"
                },
                {
                    label: "ex0.check2",
                    test: (doc) => norm(doc.querySelector("p")?.textContent) === "welcome to lost & found, where you can find what you've lost and lose what you've found"
                },
                {
                    label: "ex0.check3",
                    test: (doc) => {
                        const h1 = doc.querySelector("h1");
                        const p = doc.querySelector("p");
                        return !!(h1 && p && (h1.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING));
                    }
                }
            ],
            lesson: "ex0.lesson"
        },
    ]
}