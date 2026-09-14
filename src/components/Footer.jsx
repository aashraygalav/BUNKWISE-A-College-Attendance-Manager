import React from 'react';
import { ArrowUp } from 'lucide-react';
import { SoundFX } from '../engine/SoundFX';

export default function Footer({ onOpenDashboard }) {
  const scrollToTop = () => {
    SoundFX.playTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-void-subtle rounded-t-[4rem] border-t border-white/10 px-6 sm:px-12 md:px-20 pt-20 pb-12 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-plasma to-lime flex items-center justify-center p-0.5">
                <div className="w-full h-full rounded-full bg-void flex items-center justify-center">
                  <span className="font-mono text-xs font-bold text-lime">BW</span>
                </div>
              </div>
              <span className="font-sans font-extrabold text-xl text-white">BunkWise</span>
            </div>
            <p className="font-sans text-xs text-ghost/60 max-w-md font-light leading-relaxed">
              Precision college attendance & learning hours optimizer built for the 75% criteria.
              Strictly calculated by contact minutes (55m Theory + 115m Labs 2.09× ratio) to protect your academic standing.
            </p>
            {/* System Operational Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-beacon shadow-[0_0_8px_#10B981]" />
              <span className="font-mono text-[11px] text-emerald-300 font-medium tracking-wider">
                SYSTEM OPERATIONAL // 60 FPS
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="flex flex-col gap-3 font-sans text-xs">
            <span className="font-mono text-ghost/40 tracking-wider uppercase mb-1">NAVIGATION</span>
            <a href="#hero" className="text-ghost/70 hover:text-white transition-colors hover-lift">
              Opening Shot
            </a>
            <a href="#dashboard-section" className="text-ghost/70 hover:text-white transition-colors hover-lift">
              Attendance Cockpit
            </a>
            <a href="#philosophy" className="text-ghost/70 hover:text-white transition-colors hover-lift">
              The Manifesto
            </a>
          </div>

          {/* Col 3: Community & Legal */}
          <div className="flex flex-col gap-3 font-sans text-xs">
            <span className="font-mono text-ghost/40 tracking-wider uppercase mb-1">CONNECT</span>
            <a
              href="https://github.com/aashraygalav/BUNKWISE-A-College-Attendance-Manager"
              target="_blank"
              rel="noreferrer"
              className="text-ghost/70 hover:text-white transition-colors flex items-center gap-1.5 hover-lift"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub Repository</span>
            </a>
            <button
              onClick={() => {
                SoundFX.playSuccess();
                onOpenDashboard();
              }}
              className="text-left text-plasma-light hover:text-white transition-colors hover-lift font-semibold"
            >
              Launch Live Tracker ↗
            </button>
            <span className="text-ghost/40">License: MIT Open Source</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-ghost/40">
          <div>
            © {new Date().getFullYear()} BunkWise. Engineered with precision by Aashray Galav.
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors hover-lift px-3 py-1 rounded-full bg-white/5 border border-white/5"
          >
            <span>BACK TO TOP</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
