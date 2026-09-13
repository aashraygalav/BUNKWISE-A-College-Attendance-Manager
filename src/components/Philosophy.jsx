import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.manifesto-text', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative w-full py-32 md:py-48 px-6 sm:px-12 md:px-20 bg-void-subtle overflow-hidden border-y border-white/5"
    >
      {/* Parallaxing Dark Bio-Cyber Texture Background */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-12 text-left">
        {/* Monospace section marker */}
        <div className="manifesto-text font-mono text-xs text-lime tracking-widest uppercase flex items-center gap-3">
          <span className="w-8 h-px bg-lime/60" />
          <span>MANIFESTO // THE CORE PHILOSOPHY</span>
        </div>

        {/* Statement 1: Common Flawed Approach */}
        <div className="manifesto-text max-w-2xl font-sans text-lg sm:text-xl md:text-2xl text-ghost/50 font-normal leading-relaxed">
          Most attendance trackers focus on:
          <span className="text-ghost/80 block mt-1">
            counting every class as an identical, arbitrary number—failing completely when laboratory practicals carry double the contact duration.
          </span>
        </div>

        {/* Statement 2: BunkWise Differentiated Approach */}
        <div className="manifesto-text">
          <span className="font-sans text-xl sm:text-2xl text-ghost/70 block mb-2 font-light">
            We focus on:
          </span>
          <div className="font-drama italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-ghost leading-[1.05]">
            Contact minute calculus,{' '}
            <span className="text-plasma">2.09× laboratory weighting</span>, and{' '}
            <span className="text-lime">exact bunk margins.</span>
          </div>
        </div>

        {/* Supporting Note */}
        <div className="manifesto-text font-mono text-xs text-ghost/40 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <span>// MATHEMATICALLY VERIFIED MARGIN BUFFERS</span>
          <span>STRICT 75% ATTENDANCE COMPLIANCE</span>
        </div>
      </div>
    </section>
  );
}
