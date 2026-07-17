"use client";
import { useEffect, useRef } from "react";

// ── Color interpolation across the new MeaTech palette ────────────────────────
// #1A6EFF (26,110,255) → #00D4AA (0,212,170) → #FFB547 (255,181,71)
function flowRGBA(progress: number, alpha: number): string {
  const p = Math.max(0, Math.min(1, progress));
  let r: number, g: number, b: number;
  if (p <= 0.5) {
    const t = p * 2;
    r = Math.round(26 + (0 - 26) * t); // 26→0
    g = Math.round(110 + (212 - 110) * t); // 110→212
    b = Math.round(255 + (170 - 255) * t); // 255→170
  } else {
    const t = (p - 0.5) * 2;
    r = Math.round(0 + (255 - 0) * t); // 0→255
    g = Math.round(212 + (181 - 212) * t); // 212→181
    b = Math.round(170 + (71 - 170) * t); // 170→71
  }
  return `rgba(${r},${g},${b},${alpha})`;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number;
  trail: [number, number][];
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse    = useRef({ x: -2000, y: -2000 });
  const particles= useRef<Particle[]>([]);
  const timeRef  = useRef(0);
  const rafRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let W = 0, H = 0;

    // ── Initialise particles ────────────────────────────────────────────────
    function spawn(W: number, H: number): Particle {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0.4 + Math.random() * 0.9,
        vy: (Math.random() - 0.5) * 0.55,
        size: 1 + Math.random() * 2.2,
        alpha: 0.35 + Math.random() * 0.55,
        trail: [],
      };
    }

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      particles.current = Array.from({ length: 130 }, () => spawn(W, H));
    }

    // ── Main draw loop ──────────────────────────────────────────────────────
    function draw() {
      const t  = (timeRef.current += 0.007);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      /* Background — deep navy gradient */
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,   "#070C1A");
      bg.addColorStop(0.5, "#0C1530");
      bg.addColorStop(1,   "#070C1A");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* Subtle radial vignette */
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.05, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, "rgba(26, 110, 255, 0.06)");
      vig.addColorStop(1, "rgba(0, 5, 18, 0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      /* ── Flowing wave lines ─────────────────────────────────────────────── */
      const WAVES = 10;
      for (let i = 0; i < WAVES; i++) {
        const wp     = i / (WAVES - 1);            // 0→1 across waves
        const baseY  = (H / (WAVES + 1)) * (i + 1);
        const amp    = 10 + wp * 24;
        const speed  = 0.35 + i * 0.055;

        ctx.beginPath();
        ctx.setLineDash([]);

        let first = true;
        for (let x = 0; x <= W; x += 2) {
          const xp   = x / W;                      // 0→1 across width
          const freq = 0.016 * (1 + (1 - xp) * 2.8); // chaotic left → smooth right
          let y      = baseY
            + Math.sin(x * freq + t * speed + i * 0.9) * amp
            + Math.sin(x * freq * 0.4 + t * speed * 1.4) * amp * 0.28;

          /* Mouse warp — waves bend away from cursor */
          const dx = x - mx, dy = y - my;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 150 && d > 0) y += (dy / d) * (1 - d / 150) * 50;

          first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          first = false;
        }

        ctx.strokeStyle = flowRGBA(wp, 0.18 + wp * 0.2);
        ctx.lineWidth   = 0.8 + wp * 0.9;
        ctx.stroke();

        /* Bright highlight on every 3rd wave */
        if (i % 3 === 0) {
          ctx.strokeStyle = flowRGBA(wp, 0.45);
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }

      /* ── Central AI node ─────────────────────────────────────────────────── */
      const cx    = W * 0.5;
      const cy    = H * 0.5;
      const pulse = Math.sin(t * 2) * 0.5 + 0.5;

      /* Ambient glow halos — electric blue */
      for (let ri = 0; ri < 5; ri++) {
        const radius = 60 + ri * 30 + pulse * 10;
        const ga     = (0.1 - ri * 0.018) * (0.6 + pulse * 0.4);
        const rg     = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        rg.addColorStop(0, `rgba(26,110,255,${ga * 4})`);
        rg.addColorStop(0.5, `rgba(0,212,170,${ga})`);
        rg.addColorStop(1, "rgba(26,110,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
      }

      /* Outer dashed ring — clockwise, blue */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.38);
      ctx.setLineDash([7, 12]);
      ctx.beginPath(); ctx.arc(0, 0, 42 + pulse * 7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,170,${0.4 + pulse * 0.3})`;
      ctx.lineWidth   = 1.8;
      ctx.stroke();
      ctx.restore();

      /* Inner dashed ring — counter-clockwise, amber */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.65);
      ctx.setLineDash([3, 8]);
      ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,181,71,${0.5 + pulse * 0.35})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.restore();

      ctx.setLineDash([]);

      /* Core glowing dot — amber center */
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
      core.addColorStop(0,   `rgba(255,181,71,${0.9 + pulse * 0.1})`);
      core.addColorStop(0.4, `rgba(0,212,170,0.85)`);
      core.addColorStop(1,   "rgba(26,110,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = core; ctx.fill();

      /* ── Particles ─────────────────────────────────────────────────────────*/
      particles.current.forEach((p) => {
        /* Mouse repulsion */
        const dx = p.x - mx, dy = p.y - my;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100 && d > 0) {
          p.vx += (dx / d) * 0.45 * (1 - d / 100);
          p.vy += (dy / d) * 0.45 * (1 - d / 100);
        }

        /* Clamp & drift */
        p.vx = Math.max(0.2, Math.min(2.8, p.vx * 0.992));
        p.vy = Math.max(-1.8, Math.min(1.8, p.vy * 0.98));

        p.x += p.vx;
        p.y += p.vy;

        /* Wrap around */
        if (p.x > W + 20) {
          p.x = -20;
          p.y  = Math.random() * H;
          p.vx = 0.4 + Math.random() * 0.6;
          p.vy = (Math.random() - 0.5) * 0.5;
          p.trail = [];
        }
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;

        /* Trail */
        p.trail.push([p.x, p.y]);
        if (p.trail.length > 7) p.trail.shift();

        const xp    = Math.max(0, Math.min(1, p.x / W));
        const color = (a: number) => flowRGBA(xp, a);

        /* Draw fading trail */
        p.trail.forEach(([tx, ty], ti) => {
          ctx.beginPath();
          ctx.arc(tx, ty, p.size * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = color((ti / p.trail.length) * p.alpha * 0.38);
          ctx.fill();
        });

        /* Soft glow halo */
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4.5);
        pg.addColorStop(0, color(p.alpha * 0.55));
        pg.addColorStop(1, color(0));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();

        /* Core dot */
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color(p.alpha); ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    const onMove  = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouse.current = { x: -2000, y: -2000 }; };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "auto",   /* canvas captures mouse for interactivity */
      }}
    />
  );
}
