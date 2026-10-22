// Runs the exercise checks against the student's code.
// Returns one boolean per check; a check that throws counts as failed.

export function runChecks(checks, code) {
    const doc = new DOMParser().parseFromString(code, "text/html");
    return checks.map((check) => {
        try {
            return Boolean(check.test(doc));
        } catch {
            return false;
        }
    });
}
