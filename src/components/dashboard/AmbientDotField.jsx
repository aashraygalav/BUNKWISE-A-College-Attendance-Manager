import React, { useEffect, useRef } from 'react';

/**
 * AmbientDotField
 * ===============
 * A global, quiet, modern, interactive dark charcoal environmental layer
 * featuring a continuous, composed field of tiny white/off-white points
 * that subtly repel from the cursor.
 *
 * Visual & Behavioral Design Principles:
 * - Single global ambient instrument surface behind the entire website and cockpit.
 * - Deep charcoal / graphite base (#08090C, #0B0C10, #101116) with subtle tonal depth.
 * - Responsive dot density:
 *     Desktop: 500–750 dots
 *     Tablet:  280–420 dots
 *     Mobile:  80–140 dots (static)
 * - Tiny (0.80px–1.25px radius) crisp points with Retina DPR scaling.
 * - Baseline opacity: 0.18–0.28 (clearly perceptible at first glance, yet delicate).
 * - Cursor proximity opacity: 0.32–0.44 (modest brightening, zero halos or glow trails).
 * - Composed spatial arrangement: relaxed organic jitter avoiding clumps and voids.
 * - Content-aware composition: subtly quieter behind dense text, rich in negative space.
 * - Gentle physical repulsion (140px radius, 14px max displacement, spring 0.045, damping 0.82).
 * - Idle sleep: 0% continuous CPU usage when cursor stops or leaves.
 * - Accessibility: respects prefers-reduced-motion (static points, zero animation).
 * - Zero connecting lines (no constellation / AI SaaS network aesthetics).
 * - Strict layering: fixed behind all content via -z-10 and pointer-events-none.
 */
export default function AmbientDotField({ isGlobal = true, zIndex = 0, containerRef = null, className = '' }) {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    active: false,
    moving: false,
    lastMoveTime: 0
  });
  const rafIdRef = useRef(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Detect accessibility preferences and device capabilities
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isMobileDevice = window.innerWidth < 768 || isCoarsePointer;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // --------------------------------------------------------------------------
    // 1. Responsive Density & Composed Dot Generation
    // --------------------------------------------------------------------------
    const initDots = () => {
      const area = width * height;
      if (area <= 0) return;

      // Target density based on screen class (Continuous ambient presence)
      let targetCount;
      if (isMobileDevice) {
        // Mobile: 80–140 dots (clean, static)
        targetCount = Math.min(140, Math.max(80, Math.round(area / 6500)));
      } else if (width < 1024) {
        // Tablet: 280–420 dots
        targetCount = Math.min(420, Math.max(280, Math.round(area / 4200)));
      } else {
        // Desktop: 500–750 dots (full-viewport continuous ambient field)
        targetCount = Math.min(750, Math.max(500, Math.round(area / 3000)));
      }

      // Distribute dots using a relaxed, jittered grid to guarantee balanced negative space
      const aspect = Math.max(0.2, width / Math.max(1, height));
      const cols = Math.max(6, Math.ceil(Math.sqrt(targetCount * aspect)));
      const rows = Math.max(6, Math.ceil(targetCount / cols));
      const cellW = width / cols;
      const cellH = height / rows;

      const newDots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (newDots.length >= targetCount) break;

          // Normalized spatial coordinates (0.0 to 1.0)
          const normX = c / cols;
          const normY = r / rows;

          // Content-aware composition:
          // Slightly soften density directly in typical reading quadrants (e.g. lower-left hero headline zone)
          const isHeadlineReadingZone = normX < 0.42 && normY > 0.58;
          if (isHeadlineReadingZone && Math.random() < 0.18) {
            // Keep text zones calm and legible
            continue;
          }

          // Organic jitter within cell boundaries (preserves negative space without rigid rows)
          const jitterX = (0.08 + Math.random() * 0.84) * cellW;
          const jitterY = (0.08 + Math.random() * 0.84) * cellH;
          const originX = c * cellW + jitterX;
          const originY = r * cellH + jitterY;

          // Subtle physical variance per dot:
          // Tiny radius: 0.80px to 1.25px (1.6px to 2.5px rendered diameter)
          const radius = 0.8 + Math.random() * 0.45;

          // Baseline opacity: 0.18–0.28 increased by ~20% to ~0.22–0.34
          // Open spaces get crisp baseline opacity; reading zones are slightly softer
          let baseAlpha = 0.22 + Math.random() * 0.12;
          if (isHeadlineReadingZone) {
            baseAlpha = 0.19 + Math.random() * 0.06;
          }

          newDots.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            radius,
            baseAlpha,
            alpha: baseAlpha
          });
        }
      }

      dotsRef.current = newDots;
    };

    // --------------------------------------------------------------------------
    // 2. Rendering Frame
    // --------------------------------------------------------------------------
    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const dots = dotsRef.current;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        // Off-white / clean light tone (no purple, no lime)
        ctx.fillStyle = `rgba(245, 247, 250, ${dot.alpha.toFixed(3)})`;
        ctx.fill();
      }
    };

    // --------------------------------------------------------------------------
    // 3. Physics Simulation & Settle Engine
    // --------------------------------------------------------------------------
    const interactionRadius = 280; // ~280px wide influence area (approx 2x previous radius)
    const maxDisplacement = 16;   // 14–18px subtle maximum displacement
    const spring = 0.045;          // Gentle restorative force
    const damping = 0.82;          // High friction to prevent bounce or oscillations

    const updatePhysics = () => {
      const dots = dotsRef.current;
      const mouse = mouseRef.current;
      let totalKineticEnergy = 0;

      // When cursor is stationary for >1.4s, smoothly settle field back to resting state
      if (mouse.active && Date.now() - mouse.lastMoveTime > 1400) {
        mouse.active = false;
      }

      // Mouse displacement calculation
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        let targetX = dot.originX;
        let targetY = dot.originY;
        let targetAlpha = dot.baseAlpha;

        if (mouse.active) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < interactionRadius * interactionRadius && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            // Quadratic smooth proximity factor (1 at cursor, 0 at 280px edge)
            const factor = Math.max(0, 1 - dist / interactionRadius);
            const force = factor * factor;

            // Subtle repulsion away from cursor:
            // 0px -> 16px, 70px -> 9px, 140px -> 4px, 210px -> 1px, 280px -> 0px
            targetX = dot.originX + (dx / dist) * force * maxDisplacement;
            targetY = dot.originY + (dy / dist) * force * maxDisplacement;

            // Nearest particles respond visibly up to ~0.50 (+20% from ~0.42); outer region mostly moves rather than glows
            targetAlpha = dot.baseAlpha + force * (0.50 - dot.baseAlpha);
          }
        }

        // Spring acceleration toward target (origin or displaced)
        const ax = (targetX - dot.x) * spring;
        const ay = (targetY - dot.y) * spring;

        dot.vx = (dot.vx + ax) * damping;
        dot.vy = (dot.vy + ay) * damping;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // Smooth opacity transition
        dot.alpha += (targetAlpha - dot.alpha) * 0.1;

        // Track system energy to determine when all particles have settled
        totalKineticEnergy +=
          Math.abs(dot.vx) +
          Math.abs(dot.vy) +
          Math.abs(dot.x - dot.originX) +
          Math.abs(dot.y - dot.originY);
      }

      return totalKineticEnergy;
    };

    // --------------------------------------------------------------------------
    // 4. Animation Loop with Idle Sleep (Zero CPU when inactive)
    // --------------------------------------------------------------------------
    const loop = () => {
      if (!isRunningRef.current) return;

      const energy = updatePhysics();
      drawFrame();

      // If mouse is inactive or stationary, and particles have settled back to origin
      const dots = dotsRef.current;
      const isMouseStationary = !mouseRef.current.active;
      if (isMouseStationary && energy < Math.max(0.18, dots.length * 0.0008)) {
        // Snap directly to home coordinates for pixel perfection
        for (let i = 0; i < dots.length; i++) {
          dots[i].x = dots[i].originX;
          dots[i].y = dots[i].originY;
          dots[i].vx = 0;
          dots[i].vy = 0;
          dots[i].alpha = dots[i].baseAlpha;
        }
        drawFrame();

        // Pause loop until next user interaction (0% continuous CPU usage)
        isRunningRef.current = false;
        rafIdRef.current = null;
        return;
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    const wakeAnimation = () => {
      if (prefersReducedMotion || isMobileDevice) return;
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        rafIdRef.current = requestAnimationFrame(loop);
      }
    };

    // --------------------------------------------------------------------------
    // 5. Canvas Resize & DPR Handling
    // --------------------------------------------------------------------------
    const handleResize = () => {
      const rect = isGlobal
        ? { width: window.innerWidth, height: window.innerHeight }
        : canvas.getBoundingClientRect();

      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initDots();
      drawFrame();

      if (!prefersReducedMotion && !isMobileDevice) {
        wakeAnimation();
      }
    };

    // Use window resize for global or ResizeObserver for local container
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    // --------------------------------------------------------------------------
    // 6. Global & Local Pointer Movement Listeners
    // --------------------------------------------------------------------------
    const handlePointerMove = (e) => {
      if (prefersReducedMotion || isMobileDevice) return;

      let mouseX = e.clientX;
      let mouseY = e.clientY;

      if (!isGlobal) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        if (mouseX < -40 || mouseX > rect.width + 40 || mouseY < -40 || mouseY > rect.height + 40) {
          if (mouseRef.current.active) {
            mouseRef.current.active = false;
            wakeAnimation();
          }
          return;
        }
      }

      mouseRef.current.x = mouseX;
      mouseRef.current.y = mouseY;
      mouseRef.current.active = true;
      mouseRef.current.lastMoveTime = Date.now();
      wakeAnimation();
    };

    const handlePointerLeave = () => {
      if (mouseRef.current.active) {
        mouseRef.current.active = false;
        wakeAnimation();
      }
    };

    // Tab visibility handling
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        isRunningRef.current = false;
      } else {
        drawFrame();
      }
    };

    if (!prefersReducedMotion && !isMobileDevice) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      isRunningRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (!prefersReducedMotion && !isMobileDevice) {
        window.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerleave', handlePointerLeave);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isGlobal, containerRef]);

  const containerClasses = isGlobal
    ? `fixed inset-0 pointer-events-none select-none overflow-hidden ${className}`
    : `absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`;

  return (
    <div className={containerClasses} style={{ zIndex }} aria-hidden="true">
      {/* Layer 1: Deep charcoal / graphite environment base (#08090C -> #0B0C10 -> #101116) */}
      <div className="absolute inset-0 bg-[#0B0C10]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_15%,#101116_0%,#0B0C10_60%,#08090C_100%)]" />

      {/* Layer 2: Ambient Interactive Dot Field Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* Layer 3: Technical Material Grid & Subtle Charcoal Edge Vignette */}
      <div className="absolute inset-0 instrument-grid opacity-12 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_80%_at_50%_40%,transparent_65%,rgba(8,9,12,0.35)_100%)] pointer-events-none" />
    </div>
  );
}
