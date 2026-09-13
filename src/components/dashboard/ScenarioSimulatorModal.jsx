import React, { useState } from 'react';
import { X, Sliders, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, RefreshCw, Zap } from 'lucide-react';
import { AttendanceCalc, THEORY_MINUTES, LAB_MINUTES } from '../../engine/AttendanceCalc';
import { SoundFX } from '../../engine/SoundFX';

export default function ScenarioSimulatorModal({
  isOpen,
  onClose,
  subjects = [],
  selectedSubjectId,
  targetPercent = 75,
  onApplySimulated
}) {
  if (!isOpen || !subjects.length) return null;

  const [activeSubjectId, setActiveSubjectId] = useState(
    selectedSubjectId || subjects[0]?.id
  );

  // Simulation controls
  const [addTheoryAttended, setAddTheoryAttended] = useState(0);
  const [addTheoryMissed, setAddTheoryMissed] = useState(0);
  const [addLabAttended, setAddLabAttended] = useState(0);
  const [addLabMissed, setAddLabMissed] = useState(0);

  const currentSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const hasLab = Boolean(currentSubject?.hasLab);

  const resetSimulation = () => {
    SoundFX.playTick();
    setAddTheoryAttended(0);
    setAddTheoryMissed(0);
    setAddLabAttended(0);
    setAddLabMissed(0);
  };

  const simResult = AttendanceCalc.simulateScenario(
    currentSubject,
    {
      addTheoryAttended,
      addTheoryMissed,
      addLabAttended: hasLab ? addLabAttended : 0,
      addLabMissed: hasLab ? addLabMissed : 0
    },
    targetPercent
  );

  const orig = simResult.original;
  const sim = simResult.simulated;
  const isDrop = sim.currentRate < orig.currentRate;
  const isGain = sim.currentRate > orig.currentRate;

  const handleApply = () => {
    if (!onApplySimulated) return;
    SoundFX.playSuccess();
    onApplySimulated(currentSubject.id, {
      addTheoryAttended,
      addTheoryMissed,
      addLabAttended: hasLab ? addLabAttended : 0,
      addLabMissed: hasLab ? addLabMissed : 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-void/80 backdrop-blur-xl animate-fade-in">
      <div
        className="glass-panel w-full max-w-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 bg-void-surface relative shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-plasma/20 border border-plasma/40 text-plasma-light">
              <Sliders size={22} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-ghost flex items-center gap-2">
                What-If Attendance Simulator
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-plasma/20 text-plasma-light border border-plasma/30">
                  UPES Calibrated
                </span>
              </h2>
              <p className="font-sans text-xs text-ghost/50 mt-0.5">
                Model future theory & lab decisions to see live percentage shift and bunk limits.
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

        {/* Subject Selector Pills */}
        <div className="mb-6">
          <label className="font-mono text-xs text-ghost/50 uppercase tracking-wider block mb-2">
            Target Subject
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {subjects.map(sub => {
              const isSelected = sub.id === activeSubjectId;
              const subStats = AttendanceCalc.compute(sub, targetPercent);
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    SoundFX.playTick();
                    setActiveSubjectId(sub.id);
                    resetSimulation();
                  }}
                  className={`px-4 py-2 rounded-2xl font-sans text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-plasma text-white border-plasma shadow-[0_0_20px_rgba(123,97,255,0.4)]'
                      : 'bg-white/5 border-white/5 text-ghost/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-semibold">{sub.name}</span>
                  <span className="font-mono text-[11px] opacity-80">
                    {subStats.formattedRate}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulation Sandbox Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Controls: Theory */}
          <div className="rounded-3xl p-5 bg-void-subtle border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-plasma shadow-[0_0_8px_#7B61FF]" />
                <span className="font-sans font-bold text-sm text-ghost">
                  Theory Sessions (55m)
                </span>
              </div>
              <span className="font-mono text-[10px] text-ghost/40">1.0× WEIGHT</span>
            </div>

            <div className="space-y-4">
              {/* Attend Theory */}
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                <div>
                  <div className="font-sans text-xs font-semibold text-ghost">Attend Future Theory</div>
                  <div className="font-mono text-[10px] text-lime">+55 contact mins each</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      SoundFX.playTick();
                      setAddTheoryAttended(Math.max(0, addTheoryAttended - 1));
                    }}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-ghost flex items-center justify-center font-mono text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold text-ghost w-6 text-center">
                    {addTheoryAttended}
                  </span>
                  <button
                    onClick={() => {
                      SoundFX.playTick();
                      setAddTheoryAttended(addTheoryAttended + 1);
                    }}
                    className="w-8 h-8 rounded-xl bg-plasma/30 hover:bg-plasma/50 text-white flex items-center justify-center font-mono text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Miss/Bunk Theory */}
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                <div>
                  <div className="font-sans text-xs font-semibold text-ghost">Bunk / Miss Theory</div>
                  <div className="font-mono text-[10px] text-danger-crimson">Unattended session</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      SoundFX.playTick();
                      setAddTheoryMissed(Math.max(0, addTheoryMissed - 1));
                    }}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-ghost flex items-center justify-center font-mono text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold text-ghost w-6 text-center">
                    {addTheoryMissed}
                  </span>
                  <button
                    onClick={() => {
                      SoundFX.playTick();
                      setAddTheoryMissed(addTheoryMissed + 1);
                    }}
                    className="w-8 h-8 rounded-xl bg-danger-crimson/30 hover:bg-danger-crimson/50 text-white flex items-center justify-center font-mono text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Lab */}
          <div className="rounded-3xl p-5 bg-void-subtle border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime shadow-[0_0_8px_#E4F900]" />
                <span className="font-sans font-bold text-sm text-ghost">
                  Laboratory Sessions (115m)
                </span>
              </div>
              <span className="font-mono text-[10px] text-lime font-bold">2.09× WEIGHT</span>
            </div>

            {hasLab ? (
              <div className="space-y-4">
                {/* Attend Lab */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div>
                    <div className="font-sans text-xs font-semibold text-ghost">Attend Future Lab</div>
                    <div className="font-mono text-[10px] text-lime">+115 contact mins each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        SoundFX.playTick();
                        setAddLabAttended(Math.max(0, addLabAttended - 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-ghost flex items-center justify-center font-mono text-sm"
                    >
                      -
                    </button>
                    <span className="font-mono text-base font-bold text-ghost w-6 text-center">
                      {addLabAttended}
                    </span>
                    <button
                      onClick={() => {
                        SoundFX.playTick();
                        setAddLabAttended(addLabAttended + 1);
                      }}
                      className="w-8 h-8 rounded-xl bg-lime/30 hover:bg-lime/50 text-white flex items-center justify-center font-mono text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Miss/Bunk Lab */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div>
                    <div className="font-sans text-xs font-semibold text-ghost">Bunk / Miss Lab</div>
                    <div className="font-mono text-[10px] text-danger-crimson">Heavy 2.09× drop impact</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        SoundFX.playTick();
                        setAddLabMissed(Math.max(0, addLabMissed - 1));
                      }}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-ghost flex items-center justify-center font-mono text-sm"
                    >
                      -
                    </button>
                    <span className="font-mono text-base font-bold text-ghost w-6 text-center">
                      {addLabMissed}
                    </span>
                    <button
                      onClick={() => {
                        SoundFX.playTick();
                        setAddLabMissed(addLabMissed + 1);
                      }}
                      className="w-8 h-8 rounded-xl bg-danger-crimson/30 hover:bg-danger-crimson/50 text-white flex items-center justify-center font-mono text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <span className="text-ghost/40 text-xs font-mono">
                  This subject has no laboratory component enabled.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Projected Result Telemetry Card */}
        <div className="rounded-3xl p-6 bg-gradient-to-br from-void to-void-subtle border border-white/10 shadow-inner mb-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-lime" />
              <span className="font-mono text-xs uppercase tracking-wider text-ghost/70 font-semibold">
                Simulated Attendance Projection
              </span>
            </div>
            <button
              onClick={resetSimulation}
              className="text-ghost/50 hover:text-ghost font-mono text-[11px] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Current vs Projected % */}
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div>
                <div className="font-mono text-[10px] text-ghost/40 uppercase">Current</div>
                <div className="font-mono text-2xl font-bold text-ghost/70">
                  {orig.formattedRate}%
                </div>
              </div>
              <ArrowRight size={20} className="text-ghost/30" />
              <div>
                <div className="font-mono text-[10px] text-ghost/40 uppercase">Projected</div>
                <div
                  className={`font-mono text-3xl font-extrabold flex items-center gap-1.5 ${
                    sim.currentRate >= targetPercent ? 'text-lime' : 'text-danger-crimson'
                  }`}
                >
                  {sim.formattedRate}%
                </div>
              </div>
            </div>

            {/* Delta Shift */}
            <div className="flex flex-col">
              <div className="font-mono text-[10px] text-ghost/40 uppercase mb-1">Impact Shift</div>
              <div className="flex items-center gap-2">
                {isGain && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime font-mono text-xs font-bold">
                    <TrendingUp size={14} /> +{simResult.rateDiff}%
                  </span>
                )}
                {isDrop && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-danger-crimson/10 border border-danger-crimson/30 text-danger-crimson font-mono text-xs font-bold">
                    <TrendingDown size={14} /> {simResult.rateDiff}%
                  </span>
                )}
                {!isGain && !isDrop && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-ghost/50 font-mono text-xs">
                    0.0% (No change)
                  </span>
                )}
              </div>
            </div>

            {/* Safe Skips / Recovery Requirement */}
            <div className="flex flex-col">
              <div className="font-mono text-[10px] text-ghost/40 uppercase mb-1">
                {sim.currentRate >= targetPercent ? 'Projected Safe Buffer' : 'Shortage Action'}
              </div>
              {sim.currentRate >= targetPercent ? (
                <div className="font-sans text-xs text-ghost font-medium">
                  Safe to bunk: <span className="font-mono text-lime font-bold">{sim.safeTheorySkips} Theory</span>
                  {hasLab && (
                    <> or <span className="font-mono text-lime font-bold">{sim.safeLabSkips} Lab</span></>
                  )}
                </div>
              ) : (
                <div className="font-sans text-xs text-danger-crimson font-semibold flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Must attend next {sim.attendTheoryNeeded} classes to recover!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              SoundFX.playTick();
              onClose();
            }}
            className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 font-sans text-xs font-semibold text-ghost transition-colors"
          >
            Close Sandbox
          </button>
          {(addTheoryAttended > 0 || addTheoryMissed > 0 || addLabAttended > 0 || addLabMissed > 0) && (
            <button
              onClick={handleApply}
              className="btn-magnetic bg-plasma text-white px-7 py-3 rounded-full font-sans text-xs font-bold tracking-wide shadow-[0_0_25px_rgba(123,97,255,0.4)] hover:shadow-[0_0_35px_rgba(123,97,255,0.7)] flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="text-lime" />
              Apply Changes to Live Tracker
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
