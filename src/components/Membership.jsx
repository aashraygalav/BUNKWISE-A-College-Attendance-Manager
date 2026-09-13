import React from 'react';
import { Check, Sparkles, Zap, Shield, GraduationCap } from 'lucide-react';
import { SoundFX } from '../engine/SoundFX';

export default function Membership({ onOpenDashboard }) {
  return (
    <section id="pricing" className="py-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-surface border border-white/10 text-xs font-mono text-plasma-light mb-4">
          <GraduationCap size={14} className="text-lime" />
          <span>ACCESS & DEPLOYMENT</span>
        </div>
        <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-ghost uppercase tracking-tight">
          Tiers of <span className="font-drama italic font-normal text-5xl sm:text-6xl text-lime">Mastery</span>
        </h2>
        <p className="font-sans text-ghost/60 text-sm md:text-base mt-3 font-light">
          100% Free & Open Source for college students. Private, local-first, zero cloud tracking.
        </p>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Tier 1: Essential Student */}
        <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col justify-between border border-white/10">
          <div>
            <span className="font-mono text-xs text-ghost/50 tracking-wider uppercase">TIER // 01</span>
            <h3 className="font-sans font-bold text-2xl text-white mt-1 mb-2">Student Essential</h3>
            <p className="font-sans text-xs text-ghost/60 font-light mb-6">
              Complete contact-hour tracking and safe-bunk buffer for individual students.
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-sans font-extrabold text-4xl text-white">Free</span>
              <span className="font-mono text-xs text-ghost/50">/ Forever</span>
            </div>

            <ul className="space-y-3 font-sans text-xs text-ghost/80 mb-8 font-light">
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400 flex-shrink-0" />
                <span>55m Theory + 115m Lab calculations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400 flex-shrink-0" />
                <span>Instant Safe Bunk & Shortage Alerts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400 flex-shrink-0" />
                <span>Private browser LocalStorage</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-400 flex-shrink-0" />
                <span>JSON Export & Backup</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              SoundFX.playSuccess();
              onOpenDashboard();
            }}
            className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 font-sans text-xs font-semibold text-white tracking-wider uppercase transition-all hover-lift"
          >
            Launch Free Tracker
          </button>
        </div>

        {/* Tier 2: Performance (POPS with Primary color & ring) */}
        <div className="rounded-[2.5rem] p-8 flex flex-col justify-between bg-gradient-to-b from-plasma-dark/80 to-void-surface border-2 border-plasma shadow-[0_0_50px_rgba(123,97,255,0.35)] relative scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-lime text-void font-mono text-[10px] font-extrabold tracking-widest uppercase shadow-md">
            RECOMMENDED FOR 75%
          </div>

          <div>
            <span className="font-mono text-xs text-lime tracking-wider uppercase">TIER // 02</span>
            <h3 className="font-sans font-bold text-2xl text-white mt-1 mb-2">Campus Performance</h3>
            <p className="font-sans text-xs text-ghost/80 font-light mb-6">
              Enhanced multi-course schedule planner with today's log fast recording.
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-sans font-extrabold text-4xl text-white">Free</span>
              <span className="font-mono text-xs text-ghost/50">/ Open Source</span>
            </div>

            <ul className="space-y-3 font-sans text-xs text-ghost/90 mb-8 font-light">
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-lime flex-shrink-0" />
                <span>All Student Essential features</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-lime flex-shrink-0" />
                <span>Today's Log rapid multi-class batching</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-lime flex-shrink-0" />
                <span>Interactive Web Audio SoundFX Synthesizer</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-lime flex-shrink-0" />
                <span>Custom Target Criteria adjustments (75%, 80%, 85%)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              SoundFX.playSuccess();
              onOpenDashboard();
            }}
            className="btn-magnetic w-full py-4 rounded-full bg-lime text-void font-sans text-xs font-bold tracking-wider uppercase shadow-[0_0_25px_rgba(228,249,0,0.4)] hover:shadow-[0_0_40px_rgba(228,249,0,0.7)]"
          >
            <span className="btn-sliding-bg bg-white"></span>
            <span className="btn-content text-void font-extrabold flex items-center justify-center gap-1.5">
              <Zap size={14} />
              <span>Launch Full Engine</span>
            </span>
          </button>
        </div>

        {/* Tier 3: Department Lab */}
        <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col justify-between border border-white/10">
          <div>
            <span className="font-mono text-xs text-ghost/50 tracking-wider uppercase">TIER // 03</span>
            <h3 className="font-sans font-bold text-2xl text-white mt-1 mb-2">Department Protocol</h3>
            <p className="font-sans text-xs text-ghost/60 font-light mb-6">
              Batch syllabus curriculum modeling and section timetable synchronization.
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-sans font-extrabold text-4xl text-white">Community</span>
              <span className="font-mono text-xs text-ghost/50">/ Campus</span>
            </div>

            <ul className="space-y-3 font-sans text-xs text-ghost/80 mb-8 font-light">
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-plasma-light flex-shrink-0" />
                <span>Semester schedule batch templates</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-plasma-light flex-shrink-0" />
                <span>Curriculum contact hour validation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-plasma-light flex-shrink-0" />
                <span>Zero backend server infrastructure required</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-plasma-light flex-shrink-0" />
                <span>Custom Cloudflare Pages deployment ready</span>
              </li>
            </ul>
          </div>

          <a
            href="https://github.com/aashraygalav/BUNKWISE-A-College-Attendance-Manager"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 text-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 font-sans text-xs font-semibold text-ghost/80 tracking-wider uppercase transition-all hover-lift"
          >
            GitHub Repository ↗
          </a>
        </div>
      </div>
    </section>
  );
}
