// Confetti burst in the brand colors, fired from the two bottom corners when a
// level is finished. Skipped for people who asked their system for less motion.

const COLORS = ["#6847c7", "#9a83e8", "#b9a5f2", "#c2459b", "#3f6ad8", "#ffffff"];
const GRAVITY = 0.35;
const DRAG = 0.99;

function piece(fromLeft) {
    const angle = ((fromLeft ? -62 : -118) + (Math.random() - 0.5) * 36) * Math.PI / 180;
    const speed = 13 + Math.random() * 11;
    return {
        x: fromLeft ? 0 : innerWidth,
        y: innerHeight,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 7 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        wobble: Math.random() * Math.PI * 2,
        round: Math.random() < 0.3
    };
}

export function confetti({ count = 180, duration = 2800 } = {}) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

    const canvas = document.createElement("canvas");
    canvas.className = "confetti";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const ratio = devicePixelRatio || 1;
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    ctx.scale(ratio, ratio);

    const pieces = Array.from({ length: count }, (_, i) => piece(i % 2 === 0));
    const start = performance.now();

    function frame(now) {
        const elapsed = now - start;
        // fade out during the last 40%
        const alpha = Math.min(1, (duration - elapsed) / (duration * 0.4));
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.globalAlpha = Math.max(0, alpha);

        for (const p of pieces) {
            p.vy = p.vy * DRAG + GRAVITY;
            p.vx *= DRAG;
            p.x += p.vx + Math.sin(elapsed / 180 + p.wobble) * 0.8;
            p.y += p.vy;
            p.rotation += p.spin;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            if (p.round) {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // paper strip, flattened to look like it flips
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, (p.size / 2) * Math.abs(Math.cos(p.rotation * 2)));
            }
            ctx.restore();
        }

        if (elapsed < duration)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // animation frames pause in background tabs: remove the canvas on a timer
    setTimeout(() => canvas.remove(), duration);
}
