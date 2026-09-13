import React from 'react';
import { X, BookOpen, Clock, ShieldCheck, Scale, Compass, CheckCircle2 } from 'lucide-react';
import { SoundFX } from '../engine/SoundFX';

export default function AboutMethodologyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-void/85 backdrop-blur-xl animate-fade-in">
      <div
        className="glass-panel w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 bg-void-surface relative shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-plasma/20 border border-plasma/40 text-plasma-light">
              <Compass size={22} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-ghost">
                BunkWise Academic Methodology
              </h2>
              <p className="font-mono text-xs text-ghost/50 mt-0.5">
                Calibrated strictly for UPES contact learning hours criteria
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundFX.playTick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-ghost/60 hover:text-ghost transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-ghost/80 font-sans text-xs sm:text-sm leading-relaxed">
          {/* Section 1: The Contact Hours Reality */}
          <div className="p-5 rounded-3xl bg-void-subtle border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-plasma-light font-bold">
              <Scale size={18} />
              <span className="uppercase font-mono text-xs tracking-wider">
                The 2.09× Contact Minutes Multiplier
              </span>
            </div>
            <p className="text-ghost/70 mb-3">
              Standard college trackers naively treat 1 Lab as equivalent to 1 Theory class.
              At UPES, attendance is evaluated strictly by <strong>contact minutes</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-cyan-400 font-bold block mb-1">THEORY SESSION</span>
                <span className="text-ghost">55 Contact Minutes (0.9167 hrs)</span>
              </div>
              <div className="p-3 rounded-2xl bg-plasma/10 border border-plasma/20">
                <span className="text-lime font-bold block mb-1">LABORATORY SESSION</span>
                <span className="text-ghost">115 Contact Minutes (1.9167 hrs)</span>
              </div>
            </div>
            <div className="mt-3 text-[11px] font-mono text-lime">
              Ratio: 115m / 55m = exactly 2.0909× weight multiplier.
            </div>
          </div>

          {/* Section 2: Safe Bunk & Shortage Recovery Formulas */}
          <div className="p-5 rounded-3xl bg-void-subtle border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-lime font-bold">
              <Clock size={18} />
              <span className="uppercase font-mono text-xs tracking-wider">
                Calculus of the 75% Buffer
              </span>
            </div>
            <div className="space-y-3 font-sans text-xs text-ghost/70">
              <p>
                <strong>Safe Bunks Buffer:</strong>
                <br />
                <code className="font-mono text-[11px] text-ghost/90 bg-white/5 px-2 py-0.5 rounded">
                  Buffer Minutes = Attended Minutes / 0.75 - Conducted Minutes
                </code>
                <br />
                Calculates how many future sessions can be missed in a row without breaching 75.0%.
              </p>
              <p>
                <strong>Shortage Recovery Protocol:</strong>
                <br />
                <code className="font-mono text-[11px] text-ghost/90 bg-white/5 px-2 py-0.5 rounded">
                  Minutes Needed = (0.75 × Conducted - Attended) / (1 - 0.75)
                </code>
                <br />
                Solves for the exact consecutive sessions required to cross back into exam eligibility.
              </p>
            </div>
          </div>

          {/* Section 3: 4 Risk Tiers */}
          <div className="p-5 rounded-3xl bg-void-subtle border border-white/5">
            <div className="flex items-center gap-2 mb-3 text-ghost font-bold">
              <ShieldCheck size={18} className="text-plasma-light" />
              <span className="uppercase font-mono text-xs tracking-wider">
                Standardized 4-Tier Risk Hierarchy
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <span className="font-bold">SAFE (≥ 80%)</span>
                <p className="text-[10px] text-ghost/60 font-sans mt-0.5">Surplus buffer available.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <span className="font-bold">CAUTION (75-79.9%)</span>
                <p className="text-[10px] text-ghost/60 font-sans mt-0.5">Zero buffer. 1 missed lab drops you.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">
                <span className="font-bold">AT RISK (70-74.9%)</span>
                <p className="text-[10px] text-ghost/60 font-sans mt-0.5">Minor shortage. 1-3 classes to recover.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
                <span className="font-bold">CRITICAL (&lt; 70%)</span>
                <p className="text-[10px] text-ghost/60 font-sans mt-0.5">Urgent shortage. Detention risk.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={() => {
              SoundFX.playTick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-full bg-plasma text-white font-sans text-xs font-semibold hover-lift"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
