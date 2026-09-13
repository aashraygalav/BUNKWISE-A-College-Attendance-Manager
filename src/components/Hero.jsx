import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Activity, Terminal, ShieldAlert } from 'lucide-react';
import { SoundFX } from '../engine/SoundFX';

export default function Hero({ onOpenDashboard }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-anim-item', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.2
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full h-[100dvh] flex flex-col justify-end overflow-hidden px-6 sm:px-12 md:px-20 pb-16 md:pb-24 pt-28"
    >
      {/* Full-bleed Background with Deep Tokyo Cyber / UPES Foothills Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-subtle-drift opacity-40 scale-105"
          style={{ backgroundImage: `url('/upes_bidholi_bg.jpg')` }}
        />
        {/* Heavy Primary-to-Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-plasma/10 via-transparent to-void/90" />
      </div>

      {/* Hero Content Pushed to Bottom-Left Third */}
      <div className="relative z-10 max-w-4xl">
        {/* Telemetry Ticker Tag */}
        <div className="hero-anim-item inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-void-surface/90 border border-white/10 backdrop-blur-xl mb-6 shadow-[0_0_20px_rgba(123,97,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-lime animate-pulse-beacon shadow-[0_0_8px_#E4F900]" />
          <span className="font-mono text-xs text-lime font-medium tracking-wider uppercase">
            // UPES BIDHOLI • 2.09× LAB WEIGHT MULTIPLIER ACTIVE
          </span>
        </div>

        {/* Large Scale Contrast Headline */}
        <h1 className="hero-anim-item flex flex-col tracking-tight mb-6">
          <span className="font-sans font-extrabold text-3xl sm:text-5xl md:text-6xl text-ghost uppercase tracking-tighter">
            Precision Attendance beyond
          </span>
          <span className="font-drama italic font-normal text-6xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-plasma via-lime to-white leading-[0.9] -mt-1 md:-mt-3">
            The 75% Margin.
          </span>
        </h1>

        {/* Descriptive Manifesto Descriptor */}
        <p className="hero-anim-item font-sans text-ghost/70 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed mb-8">
          The cinematic contact-minute engine calibrated for college academics.
          55m theory classes, 115m laboratory sessions, exact safe-bunk buffers,
          and unrecoverable shortage alerts—engineered to perfection.
        </p>

        {/* CTA & Metrics Row */}
        <div className="hero-anim-item flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            onClick={() => {
              SoundFX.playSuccess();
              onOpenDashboard();
            }}
            className="btn-magnetic bg-plasma text-white px-8 py-4 rounded-full font-sans text-sm font-semibold tracking-wide shadow-[0_0_35px_rgba(123,97,255,0.5)] hover:shadow-[0_0_50px_rgba(123,97,255,0.8)] flex items-center gap-2"
          >
            <span className="btn-sliding-bg bg-gradient-to-r from-plasma-dark to-lime"></span>
            <span className="btn-content flex items-center gap-2 text-white">
              <span>Start Tracking Attendance</span>
              <ArrowUpRight size={18} className="text-lime" />
            </span>
          </button>

          <a
            href="#features"
            className="hover-lift px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-sans text-xs font-medium text-ghost tracking-wider uppercase transition-colors"
          >
            Inspect The Engine
          </a>
        </div>
      </div>

      {/* Floating Right Corner Telemetry Readout */}
      <div className="hidden lg:flex absolute bottom-24 right-16 z-10 flex-col items-end gap-2 font-mono text-xs text-ghost/50 border-r-2 border-plasma/40 pr-4">
        <span className="text-lime font-bold">LAT: 30.4158° N, 77.9658° E</span>
        <span>THEORY: 55 MINS / SESSION</span>
        <span>LAB: 115 MINS (2.09× WEIGHT)</span>
        <span className="text-plasma">STATUS: ATTENDANCE_OPTIMIZED</span>
      </div>
    </section>
  );
}
