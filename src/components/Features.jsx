import React, { useState, useEffect } from 'react';
import { Layers, Terminal, Calendar, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Features() {
  // --------------------------------------------------------------------------
  // Card 1: Diagnostic Shuffler
  // --------------------------------------------------------------------------
  const initialShufflerCards = [
    {
      title: '55m Theory Slot',
      weight: '1.0× Base Weight',
      desc: 'Standard lecture duration adding 55 contact minutes to the semester ledger.',
      tag: 'THEORY',
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-400'
    },
    {
      title: '115m Lab Session',
      weight: '2.09× Dynamic Weight',
      desc: 'Critical lab practicals spanning 115 minutes—missing one inflicts over 2× the attendance drop.',
      tag: 'LAB (2.09×)',
      color: 'from-purple-500/20 to-plasma/20 border-plasma/50 text-plasma-light'
    },
    {
      title: 'Contact Minutes Calculus',
      weight: 'Strict Hour Engine',
      desc: 'Calculates true attendance percentages from minutes, not naive class counts.',
      tag: 'ALGORITHM',
      color: 'from-lime/20 to-emerald-500/20 border-lime/40 text-lime'
    }
  ];

  const [shufflerCards, setShufflerCards] = useState(initialShufflerCards);

  useEffect(() => {
    const interval = setInterval(() => {
      setShufflerCards((prev) => {
        const next = [...prev];
        next.unshift(next.pop());
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------------------------------
  // Card 2: Telemetry Typewriter
  // --------------------------------------------------------------------------
  const typewriterLines = [
    'CALCULATING SAFE BUNK MARGIN... [75% TARGET CRITERIA]',
    'ATTENDED: 64.9 HRS (61 SESSIONS) | MISSED: 32.5 HRS',
    'BUFFER VERIFIED: +1.9 HRS SAFE SURPLUS AVAILABLE.',
    'RECOMMENDATION: SKIP UP TO 2 THEORY OR 0 LAB SESSIONS.',
    'WARNING: MISSING 1 LAB DROPS CURRENT 80.0% TO 72.8%!'
  ];

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullLine = typewriterLines[currentLineIndex];
    let timer;

    if (!isDeleting && displayText.length < currentFullLine.length) {
      timer = setTimeout(() => {
        setDisplayText(currentFullLine.slice(0, displayText.length + 1));
      }, 35);
    } else if (!isDeleting && displayText.length === currentFullLine.length) {
      timer = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, 18);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setCurrentLineIndex((prev) => (prev + 1) % typewriterLines.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentLineIndex]);

  // --------------------------------------------------------------------------
  // Card 3: Cursor Protocol Scheduler
  // --------------------------------------------------------------------------
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const [activeDay, setActiveDay] = useState(2); // Tuesday
  const [cursorStep, setCursorStep] = useState(0);

  useEffect(() => {
    const loop = setInterval(() => {
      setCursorStep((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    if (cursorStep === 1) {
      setActiveDay(3); // Move to Wed
    } else if (cursorStep === 2) {
      setActiveDay(4); // Move to Thu
    } else if (cursorStep === 3) {
      setActiveDay(2); // Reset to Tue
    }
  }, [cursorStep]);

  return (
    <section id="features" className="py-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-void-surface border border-white/10 text-xs font-mono text-plasma-light mb-4">
          <Zap size={13} className="text-lime" />
          <span>FUNCTIONAL ARTIFACTS</span>
        </div>
        <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-ghost uppercase tracking-tight">
          Engineered for <span className="font-drama italic font-normal lowercase text-5xl sm:text-6xl text-lime">precision</span>
        </h2>
        <p className="font-sans text-ghost/60 text-sm md:text-base max-w-xl mt-3 font-light">
          Three software micro-UIs actively executing real-time contact hours, dynamic bunk margins, and shortage recovery algorithms.
        </p>
      </div>

      {/* 3 Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CARD 1: Diagnostic Shuffler */}
        <div className="glass-panel rounded-[2rem] p-7 flex flex-col justify-between overflow-hidden relative group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-ghost/50 tracking-wider">PROP // 01</span>
              <div className="p-2 rounded-xl bg-white/5 text-plasma">
                <Layers size={18} />
              </div>
            </div>
            <h3 className="font-sans font-bold text-xl text-ghost mb-2">
              Contact Hours Engine
            </h3>
            <p className="font-sans text-xs text-ghost/60 leading-relaxed mb-6 font-light">
              55m Theory vs 115m Lab. Evaluated by contact minutes so labs carry true 2.09× weight.
            </p>
          </div>

          {/* Interactive Shuffler Container */}
          <div className="relative h-48 w-full mt-2">
            {shufflerCards.map((card, idx) => {
              const isTop = idx === 0;
              const isMiddle = idx === 1;
              const isBottom = idx === 2;

              return (
                <div
                  key={card.title}
                  className={`absolute inset-x-0 rounded-2xl p-4 border bg-gradient-to-br transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${card.color} ${
                    isTop
                      ? 'top-0 z-30 opacity-100 scale-100 shadow-[0_15px_30px_rgba(0,0,0,0.5)]'
                      : isMiddle
                      ? 'top-4 z-20 opacity-80 scale-95'
                      : 'top-8 z-10 opacity-50 scale-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10">
                      {card.tag}
                    </span>
                    <span className="font-mono text-[10px] text-white/70">{card.weight}</span>
                  </div>
                  <div className="font-sans font-bold text-sm text-white mb-1">{card.title}</div>
                  <div className="font-sans text-[11px] text-white/70 leading-snug">{card.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 2: Telemetry Typewriter */}
        <div className="glass-panel rounded-[2rem] p-7 flex flex-col justify-between overflow-hidden relative group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-ghost/50 tracking-wider">PROP // 02</span>
              <div className="p-2 rounded-xl bg-white/5 text-lime">
                <Terminal size={18} />
              </div>
            </div>
            <h3 className="font-sans font-bold text-xl text-ghost mb-2">
              Dynamic Safe Bunk Buffer
            </h3>
            <p className="font-sans text-xs text-ghost/60 leading-relaxed mb-6 font-light">
              Continuous buffer calculation preventing percentage dips below 75% before you skip.
            </p>
          </div>

          {/* Typewriter Terminal Window */}
          <div className="w-full bg-void-subtle rounded-2xl p-4 border border-white/10 font-mono text-xs relative h-48 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5 text-[10px] text-lime">
                <span className="w-1.5 h-1.5 rounded-full bg-lime animate-ping" />
                <span>LIVE TELEMETRY STREAM</span>
              </span>
              <span className="text-[10px] text-ghost/40">CALC_V2.0</span>
            </div>

            <div className="my-auto py-2 text-ghost/90 leading-relaxed">
              <span className="text-plasma-light">&gt; </span>
              <span>{displayText}</span>
              <span className="inline-block w-2 h-4 bg-lime ml-1 align-middle animate-pulse" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-ghost/40">
              <span>CRITERIA: 75%</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> STATUS: VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: Cursor Protocol Scheduler */}
        <div className="glass-panel rounded-[2rem] p-7 flex flex-col justify-between overflow-hidden relative group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-ghost/50 tracking-wider">PROP // 03</span>
              <div className="p-2 rounded-xl bg-white/5 text-plasma-light">
                <Calendar size={18} />
              </div>
            </div>
            <h3 className="font-sans font-bold text-xl text-ghost mb-2">
              Shortage Recovery Protocol
            </h3>
            <p className="font-sans text-xs text-ghost/60 leading-relaxed mb-6 font-light">
              Exact recovery schedule solving for consecutive sessions needed if attendance falls below 75%.
            </p>
          </div>

          {/* Interactive Weekly Grid Micro-UI */}
          <div className="w-full bg-void-subtle rounded-2xl p-4 border border-white/10 relative h-48 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-ghost/70">
              <span>ATTENDANCE SCHEDULE</span>
              <span className="text-plasma-light font-semibold">WEEK 08</span>
            </div>

            {/* S M T W T F S Day Pills */}
            <div className="grid grid-cols-7 gap-1.5 my-auto">
              {days.map((day, idx) => {
                const isSelected = idx === activeDay;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center py-2.5 rounded-xl border text-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-plasma/30 border-plasma text-white shadow-[0_0_15px_rgba(123,97,255,0.4)] scale-105'
                        : 'bg-white/5 border-white/5 text-ghost/50'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold">{day}</span>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 bg-current opacity-75" />
                  </div>
                );
              })}
            </div>

            {/* Bottom Status Ticker */}
            <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-white/5">
              <span className="text-ghost/40">SLOT: LAB (115M)</span>
              <span className="text-lime font-medium">+115 MIN RECOVERY ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
