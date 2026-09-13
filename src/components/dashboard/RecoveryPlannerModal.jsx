import React, { useState } from 'react';
import { X, ShieldAlert, Target, Sparkles, CheckCircle2, ArrowRight, Activity, CalendarCheck } from 'lucide-react';
import { AttendanceCalc } from '../../engine/AttendanceCalc';
import { SoundFX } from '../../engine/SoundFX';

export default function RecoveryPlannerModal({
  isOpen,
  onClose,
  subjects = [],
  selectedSubjectId,
  targetPercent = 75
}) {
  if (!isOpen || !subjects.length) return null;

  // Find subjects that are below target criteria first
  const shortageSubjects = subjects.filter(s => {
    const stats = AttendanceCalc.compute(s, targetPercent);
    return stats.currentRate < targetPercent;
  });

  const [activeSubjectId, setActiveSubjectId] = useState(
    selectedSubjectId || (shortageSubjects.length ? shortageSubjects[0].id : subjects[0]?.id)
  );

  const currentSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const roadmap = AttendanceCalc.calculateRecoveryRoadmap(currentSubject, targetPercent);
  const stats = AttendanceCalc.compute(currentSubject, targetPercent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-void/80 backdrop-blur-xl animate-fade-in">
      <div
        className="glass-panel w-full max-w-3xl rounded-[2.5rem] border border-white/10 p-6 sm:p-8 bg-void-surface relative shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-danger-crimson/20 border border-danger-crimson/40 text-danger-crimson">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-xl text-ghost flex items-center gap-2">
                Shortage Recovery Protocol
                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-danger-crimson/20 text-danger-crimson border border-danger-crimson/30">
                  Target: {targetPercent}%
                </span>
              </h2>
              <p className="font-sans text-xs text-ghost/50 mt-0.5">
                Step-by-step consecutive attendance roadmaps to rescue low attendance percentages.
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

        {/* Subject Selector Tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-xs text-ghost/50 uppercase tracking-wider">
              Select Subject for Recovery
            </label>
            {shortageSubjects.length > 0 && (
              <span className="font-mono text-[11px] text-danger-crimson font-semibold">
                {shortageSubjects.length} subject{shortageSubjects.length > 1 ? 's' : ''} in shortage
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {subjects.map(sub => {
              const isSelected = sub.id === activeSubjectId;
              const subStats = AttendanceCalc.compute(sub, targetPercent);
              const isDanger = subStats.currentRate < targetPercent;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    SoundFX.playTick();
                    setActiveSubjectId(sub.id);
                  }}
                  className={`px-4 py-2.5 rounded-2xl font-sans text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? isDanger
                        ? 'bg-danger-crimson text-white border-danger-crimson shadow-[0_0_20px_rgba(255,59,48,0.4)]'
                        : 'bg-plasma text-white border-plasma shadow-[0_0_20px_rgba(123,97,255,0.4)]'
                      : isDanger
                      ? 'bg-danger-crimson/10 border-danger-crimson/30 text-danger-crimson hover:bg-danger-crimson/20'
                      : 'bg-white/5 border-white/5 text-ghost/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-semibold">{sub.name}</span>
                  <span className="font-mono text-[11px] font-bold">
                    {subStats.formattedRate}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Summary Banner */}
        <div className={`rounded-3xl p-5 mb-6 border ${
          stats.currentRate < targetPercent
            ? 'bg-danger-crimson/10 border-danger-crimson/30'
            : 'bg-lime/10 border-lime/30'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {stats.currentRate < targetPercent ? (
                  <ShieldAlert size={18} className="text-danger-crimson" />
                ) : (
                  <CheckCircle2 size={18} className="text-lime" />
                )}
                <span className={`font-sans font-bold text-sm ${
                  stats.currentRate < targetPercent ? 'text-danger-crimson' : 'text-lime'
                }`}>
                  {stats.currentRate < targetPercent
                    ? `Attendance Shortage Alert (${stats.formattedRate}%)`
                    : `Safe Attendance Status (${stats.formattedRate}%)`}
                </span>
              </div>
              <p className="font-sans text-xs text-ghost/80 max-w-xl">
                {stats.message}
              </p>
            </div>
            <div className="font-mono text-right flex sm:flex-col items-center sm:items-end justify-between">
              <span className="text-[10px] text-ghost/50 uppercase">Current Deficit</span>
              <span className={`text-xl font-bold ${
                stats.currentRate < targetPercent ? 'text-danger-crimson' : 'text-lime'
              }`}>
                {stats.currentRate < targetPercent
                  ? `-${(targetPercent - stats.currentRate).toFixed(1)}%`
                  : `+${(stats.currentRate - targetPercent).toFixed(1)}% buffer`}
              </span>
            </div>
          </div>
        </div>

        {/* Recovery Roadmaps (If in shortage) */}
        {roadmap.inShortage ? (
          <div className="space-y-6 mb-6">
            {/* Strategy 1: Laboratory Acceleration (2.09x) */}
            {stats.hasLab && roadmap.labSteps.length > 0 && (
              <div className="rounded-3xl p-5 bg-void-subtle border border-plasma/30 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-plasma-light" />
                    <span className="font-sans font-bold text-sm text-ghost">
                      Fast-Track Laboratory Recovery (2.09× Acceleration)
                    </span>
                  </div>
                  <span className="font-mono text-xs text-lime font-bold px-3 py-1 rounded-full bg-lime/10 border border-lime/30">
                    Recommended Route
                  </span>
                </div>
                <p className="font-sans text-xs text-ghost/70 mb-4">
                  Because each lab session is 115 contact minutes, attending consecutive labs repairs your attendance twice as fast as theory classes:
                </p>

                {/* Milestone Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {roadmap.labSteps.map(step => (
                    <div
                      key={step.stepNumber}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        step.reachedTarget
                          ? 'bg-lime/15 border-lime/50 text-lime shadow-[0_0_15px_rgba(228,249,0,0.2)]'
                          : 'bg-white/5 border-white/5 text-ghost'
                      }`}
                    >
                      <div className="font-mono text-[10px] text-ghost/50 uppercase mb-1">
                        Lab Session #{step.stepNumber}
                      </div>
                      <div className="font-mono text-lg font-bold">
                        {step.projectedRate}%
                      </div>
                      <div className="font-sans text-[10px] mt-1 font-semibold">
                        {step.reachedTarget ? '✓ CRITERIA MET' : 'In Progress'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy 2: Standard Theory Consecutive Attendance */}
            <div className="rounded-3xl p-5 bg-void-subtle border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-ghost/60" />
                  <span className="font-sans font-bold text-sm text-ghost">
                    Theory Consecutive Recovery (55m sessions)
                  </span>
                </div>
                <span className="font-mono text-xs text-ghost/50">
                  {roadmap.attendTheoryNeeded} consecutive classes needed
                </span>
              </div>

              {/* Milestone Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {roadmap.theorySteps.slice(0, 10).map(step => (
                  <div
                    key={step.stepNumber}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      step.reachedTarget
                        ? 'bg-lime/15 border-lime/50 text-lime shadow-[0_0_15px_rgba(228,249,0,0.2)]'
                        : 'bg-white/5 border-white/5 text-ghost'
                    }`}
                  >
                    <div className="font-mono text-[10px] text-ghost/50 uppercase mb-1">
                      Theory #{step.stepNumber}
                    </div>
                    <div className="font-mono text-base font-bold">
                      {step.projectedRate}%
                    </div>
                    <div className="font-sans text-[10px] mt-1 font-medium">
                      {step.reachedTarget ? '✓ 75% GOAL' : `+${(step.projectedRate - stats.currentRate).toFixed(1)}%`}
                    </div>
                  </div>
                ))}
              </div>
              {roadmap.theorySteps.length > 10 && (
                <div className="text-center mt-3 font-mono text-xs text-ghost/40">
                  ...and {roadmap.theorySteps.length - 10} more consecutive sessions to fully clear criteria.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-8 bg-void-subtle border border-white/5 text-center mb-6">
            <CheckCircle2 size={36} className="text-lime mx-auto mb-3" />
            <h3 className="font-sans font-bold text-lg text-ghost mb-1">
              Attendance Healthy — No Recovery Protocol Required
            </h3>
            <p className="font-sans text-xs text-ghost/60 max-w-md mx-auto mb-4">
              {currentSubject.name} is currently sitting at an optimal {stats.formattedRate}%, comfortably above your {targetPercent}% threshold.
            </p>
            <div className="inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-full bg-lime/10 border border-lime/30 text-lime">
              Safe Bunk Budget: {stats.safeTheorySkips} Theory {stats.hasLab ? `or ${stats.safeLabSkips} Lab` : ''} Skips Available
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              SoundFX.playTick();
              onClose();
            }}
            className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 font-sans text-xs font-semibold text-ghost transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
