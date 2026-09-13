import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, LayoutDashboard } from 'lucide-react';
import { SoundFX } from '../engine/SoundFX';

export default function Navbar({ onOpenDashboard, activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    SoundFX.init();
    setSoundEnabled(SoundFX.enabled);

    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSoundToggle = () => {
    const next = SoundFX.toggle();
    setSoundEnabled(next);
  };

  const scrollTo = (id) => {
    SoundFX.playTap();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center justify-between gap-4 md:gap-8 px-5 py-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] max-w-5xl w-full ${
          scrolled
            ? 'bg-void-surface/75 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]'
            : 'bg-void-subtle/30 backdrop-blur-md border border-white/5'
        }`}
      >
        {/* Brand Logo */}
        <div
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-plasma to-lime flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(123,97,255,0.4)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-void flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-lime">BW</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold tracking-tight text-sm text-white flex items-center gap-1.5">
              BunkWise
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-plasma/20 text-plasma-light border border-plasma/30">
                75%
              </span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 font-sans text-xs font-medium tracking-wide text-ghost/70">
          <button
            onClick={() => scrollTo('features')}
            className="hover-lift hover:text-white transition-colors"
          >
            Engine
          </button>
          <button
            onClick={() => scrollTo('protocol')}
            className="hover-lift hover:text-white transition-colors"
          >
            Protocol
          </button>
          <button
            onClick={() => scrollTo('philosophy')}
            className="hover-lift hover:text-white transition-colors"
          >
            Manifesto
          </button>
          <button
            onClick={() => scrollTo('pricing')}
            className="hover-lift hover:text-white transition-colors"
          >
            Tiers
          </button>
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-2.5">
          {/* Sound Synthesizer Toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Disable Web Audio' : 'Enable Web Audio'}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-ghost/70 hover:text-white transition-all hover-lift"
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => {
              SoundFX.playSuccess();
              onOpenDashboard();
            }}
            className="btn-magnetic bg-plasma text-white px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wide shadow-[0_0_20px_rgba(123,97,255,0.4)] hover:shadow-[0_0_30px_rgba(123,97,255,0.6)]"
          >
            <span className="btn-sliding-bg bg-gradient-to-r from-plasma-dark to-plasma"></span>
            <span className="btn-content flex items-center gap-1.5">
              <LayoutDashboard size={13} className="text-lime" />
              <span>Launch Tracker</span>
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
