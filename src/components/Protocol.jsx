import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Protocol() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');

      cards.forEach((card, index) => {
        if (index < cards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            pin: true,
            pinSpacing: false,
            scrub: true,
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.to(card, {
                scale: 1 - progress * 0.1,
                filter: `blur(${progress * 15}px)`,
                opacity: 1 - progress * 0.5,
                duration: 0.1,
                overwrite: 'auto'
              });
            }
          });
        } else {
          ScrollTrigger.create({
            trigger: card,
            start: 'top top',
            pin: true,
            pinSpacing: true
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={containerRef} className="relative w-full bg-transparent">
      {/* SECTION TITLE BANNER */}
      <div className="pt-24 pb-8 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-surface border border-white/10 text-xs font-mono text-lime mb-3">
          <span>// PROTOCOL ARCHIVE</span>
        </div>
        <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-ghost uppercase tracking-tight">
          Three-Stage <span className="font-drama italic font-normal text-5xl sm:text-6xl text-plasma-light">Optimization</span>
        </h2>
      </div>

      {/* CARD 01: Schedule Calibration */}
      <div className="protocol-card min-h-screen w-full flex items-center justify-center px-6 py-16 bg-[#08090C]/85">
        <div className="glass-panel w-full max-w-5xl rounded-[3rem] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-white/10">
          <div className="flex-1 max-w-lg z-10">
            <span className="font-mono text-sm font-bold text-plasma-light tracking-widest block mb-4">
              PHASE // 01
            </span>
            <h3 className="font-sans font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight mb-4">
              Schedule Calibration
            </h3>
            <p className="font-sans text-ghost/70 text-base leading-relaxed font-light mb-6">
              Configure your weekly format (1 Lab + 3 Theory classes per week) or input direct contact learning hours. BunkWise automatically weights labs at 115m and theory at 55m.
            </p>
            <div className="font-mono text-xs text-lime flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>SYSTEM: CALIBRATION_COMPLETE</span>
            </div>
          </div>

          {/* Animation 1: Slowly rotating geometric concentric circles & radar */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-plasma/30 animate-[spin_25s_linear_infinite]" />
            <div className="absolute inset-6 rounded-full border border-dashed border-lime/30 animate-[spin_18s_linear_infinite_reverse]" />
            <div className="absolute inset-12 rounded-full border border-white/10 animate-[spin_12s_linear_infinite]" />
            <div className="w-24 h-24 rounded-full bg-plasma/10 border border-plasma/50 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(123,97,255,0.3)]">
              <span className="font-mono text-xs text-plasma-light font-bold">2.09×</span>
              <span className="font-mono text-[9px] text-ghost/50">RATIO</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 02: Daily Contact Logging */}
      <div className="protocol-card min-h-screen w-full flex items-center justify-center px-6 py-16 bg-[#08090C]/85">
        <div className="glass-panel w-full max-w-5xl rounded-[3rem] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-white/10">
          <div className="flex-1 max-w-lg z-10">
            <span className="font-mono text-sm font-bold text-lime tracking-widest block mb-4">
              PHASE // 02
            </span>
            <h3 className="font-sans font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight mb-4">
              Daily Contact Logging
            </h3>
            <p className="font-sans text-ghost/70 text-base leading-relaxed font-light mb-6">
              Mark individual Theory or Lab sessions with one click. Accidental clicks revert instantly with full undo capability, keeping your records flawless.
            </p>
            <div className="font-mono text-xs text-lime flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>INPUT: REAL_TIME_LEDGER</span>
            </div>
          </div>

          {/* Animation 2: Scanning horizontal laser line over grid cells */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 relative bg-void-subtle rounded-3xl border border-white/10 p-4 flex flex-col justify-between overflow-hidden">
            {/* Cell Grid */}
            <div className="grid grid-cols-4 gap-2 h-full">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white/5 border border-white/5 flex items-center justify-center font-mono text-[10px] text-ghost/40"
                >
                  {i % 3 === 0 ? '55m' : '115m'}
                </div>
              ))}
            </div>
            {/* Sweeping Laser Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-lime to-transparent shadow-[0_0_15px_#E4F900] animate-[bounce_3s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>

      {/* CARD 03: Margin Optimization */}
      <div className="protocol-card min-h-screen w-full flex items-center justify-center px-6 py-16 bg-[#08090C]/85">
        <div className="glass-panel w-full max-w-5xl rounded-[3rem] p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-white/10">
          <div className="flex-1 max-w-lg z-10">
            <span className="font-mono text-sm font-bold text-plasma-light tracking-widest block mb-4">
              PHASE // 03
            </span>
            <h3 className="font-sans font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight mb-4">
              Margin Optimization
            </h3>
            <p className="font-sans text-ghost/70 text-base leading-relaxed font-light mb-6">
              Instant feedback reveals how many Theory or Lab sessions can be safely skipped right now, or exact recovery paths if attendance dips below criteria.
            </p>
            <div className="font-mono text-xs text-lime flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>OPTIMIZER: BUFFER_ACTIVE</span>
            </div>
          </div>

          {/* Animation 3: Pulsing Waveform (EKG style SVG path animation) */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 relative bg-void-subtle rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden p-4">
            <svg className="w-full h-32" viewBox="0 0 300 100" fill="none">
              <path
                d="M 0 50 L 70 50 L 90 20 L 110 80 L 130 50 L 170 50 L 190 10 L 210 90 L 230 50 L 300 50"
                stroke="#7B61FF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80 shadow-[0_0_20px_#7B61FF]"
              />
              <circle cx="190" cy="10" r="4" fill="#E4F900" className="animate-ping" />
            </svg>
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-ghost/40">
              TELEMETRY HARMONICS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
