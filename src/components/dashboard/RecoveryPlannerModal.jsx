import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Sparkles, CheckCircle2, CalendarCheck, Clock, Award, ChevronDown, ChevronUp, Layers } from 'lucide-react';
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
    const res = AttendanceCalc.compute(s, targetPercent);
    return res.currentRate < targetPercent;
  });

  const [activeSubjectId, setActiveSubjectId] = useState(
    selectedSubjectId || (shortageSubjects.length ? shortageSubjects[0].id : subjects[0]?.id)
  );
  const [showAllCombinations, setShowAllCombinations] = useState(false);

  useEffect(() => {
    if (selectedSubjectId) {
      setActiveSubjectId(selectedSubjectId);
    } else if (shortageSubjects.length) {
      setActiveSubjectId(shortageSubjects[0].id);
    } else if (subjects.length) {
      setActiveSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, isOpen]);

  // Reset expander when switching subjects
  useEffect(() => {
    setShowAllCombinations(false);
  }, [activeSubjectId]);

  const currentSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const roadmap = AttendanceCalc.calculateRecoveryRoadmap(currentSubject, targetPercent);
  const stats = AttendanceCalc.compute(currentSubject, targetPercent);
  const combinations = roadmap.combinations || [];
  const displayCombinations = showAllCombinations ? combinations : combinations.slice(0, 3);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-void/85 backdrop-blur-xl animate-fadeIn">
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
                Calculated Theory + Lab combinations to recover above {targetPercent}%.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              SoundFX.playTick();
              onClose();
            }}
            className="btn-tactile p-2 rounded-full hover:bg-white/10 text-ghost/60 hover:text-ghost transition-colors"
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
                  type="button"
                  onClick={() => {
                    SoundFX.playTick();
                    setActiveSubjectId(sub.id);
                  }}
                  className={`btn-tactile px-4 py-2.5 rounded-2xl font-sans text-xs whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? isDanger
                        ? 'bg-danger-crimson text-white border-danger-crimson shadow-sm'
                        : 'bg-plasma text-white border-plasma shadow-sm'
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
          roadmap.isImpossible || stats.isImpossible
            ? 'bg-rose-500/15 border-rose-500/40'
            : stats.currentRate < targetPercent
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
                  roadmap.isImpossible || stats.isImpossible
                    ? 'text-rose-300'
                    : stats.currentRate < targetPercent
                    ? 'text-danger-crimson'
                    : 'text-lime'
                }`}>
                  {roadmap.isImpossible || stats.isImpossible
                    ? `Mathematically Unreachable (${stats.formattedRate}%)`
                    : stats.currentRate < targetPercent
                    ? `Shortage Recovery Active (${stats.formattedRate}%)`
                    : `Safe Attendance Status (${stats.formattedRate}%)`}
                </span>
              </div>
              <p className="font-sans text-xs text-ghost/80 max-w-xl">
                {roadmap.isImpossible || stats.isImpossible
                  ? `Target ${targetPercent}% is mathematically unreachable with remaining planned sessions.`
                  : stats.message}
              </p>
            </div>
            <div className="font-mono text-right flex sm:flex-col items-center sm:items-end justify-between">
              <span className="text-[10px] text-ghost/50 uppercase">Current Deficit</span>
              <span className={`text-xl font-bold ${
                stats.currentRate < targetPercent ? 'text-danger-crimson' : 'text-lime'
              }`}>
                {stats.currentRate < targetPercent
                  ? `-${(targetPercent - stats.currentRate).toFixed(1)}%`
                  : `+${(stats.currentRate - targetPercent).toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {roadmap.inShortage && !roadmap.alreadyAboveTarget ? (
          <div className="space-y-6 mb-6">
            {roadmap.isImpossible || stats.isImpossible ? (
              <div className="rounded-3xl p-6 bg-void-subtle border border-rose-500/30 text-center">
                <ShieldAlert size={32} className="text-rose-400 mx-auto mb-2" />
                <h4 className="font-sans font-bold text-white text-sm mb-1">
                  75% is mathematically unreachable with the remaining planned sessions.
                </h4>
                <p className="font-sans text-xs text-ghost/60 max-w-md mx-auto mb-3">
                  Even with 100% attendance in all remaining classes, the maximum achievable attendance is{' '}
                  <strong className="text-white font-mono">{stats.maxPossibleRate}%</strong>.
                </p>
                <div className="inline-flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-ghost/70">
                  Planned Remaining: {stats.theoryRemaining} Theory {stats.hasLab ? `+ ${stats.labRemaining} Labs` : ''}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Section Header with verified guidance note */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-plasma" />
                    <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-ghost">
                      {stats.hasLab ? 'Theory + Lab Recovery Options' : 'Theory Recovery Options'}
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] text-ghost/50">
                    {combinations.length} valid combination{combinations.length > 1 ? 's' : ''} found
                  </span>
                </div>

                <div className="rounded-2xl p-3 bg-white/[0.03] border border-white/5 flex items-start gap-2.5 text-ghost/60">
                  <Sparkles size={15} className="text-plasma shrink-0 mt-0.5" />
                  <p className="font-sans text-xs leading-relaxed">
                    Every option below reaches at least <strong className="text-ghost">{targetPercent}%</strong>. Theory contributes 55 contact minutes per class; Lab contributes 115 (<span className="text-plasma-light font-mono font-semibold">2.09× Lab weight</span>).
                  </p>
                </div>
                {/* Valid Recovery Combination Cards */}
                <div className="space-y-3">
                  {displayCombinations.map((combo, idx) => (
                    <div
                      key={idx}
                      className={`instrument-card rounded-2xl p-4 sm:p-5 transition-all border ${
                        combo.isFewestSessions
                          ? 'border-lime/40'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Top Row: Session Composition Badges & Highlights */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {combo.theorySessions > 0 ? (
                            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs font-semibold text-ghost flex items-center gap-1.5">
                              <CalendarCheck size={13} className="text-plasma" />
                              {combo.theorySessions} Theory
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-ghost/40">
                              0 Theory
                            </span>
                          )}

                          {stats.hasLab && (
                            combo.labSessions > 0 ? (
                              <span className="px-3 py-1 rounded-xl bg-plasma/15 border border-plasma/30 font-mono text-xs font-semibold text-plasma-light flex items-center gap-1.5">
                                <CalendarCheck size={13} className="text-plasma-light" />
                                {combo.labSessions} {combo.labSessions === 1 ? 'Lab' : 'Labs'}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-ghost/40">
                                0 Labs
                              </span>
                            )
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {combo.isFewestSessions && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-lime/10 border border-lime/30 text-lime font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                              <Award size={12} /> Min sessions
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-[11px] text-ghost/70">
                            {combo.totalSessions} total {combo.totalSessions === 1 ? 'session' : 'sessions'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                        <div>
                          <div className="font-mono text-[10px] text-ghost/50 uppercase">Projected</div>
                          <div className="font-mono text-base font-bold text-lime">
                            {combo.projectedRate}%
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] text-ghost/50 uppercase">Rate Gain</div>
                          <div className="font-mono text-base font-bold text-emerald-400">
                            +{combo.rateGain}%
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] text-ghost/50 uppercase">Contact Time</div>
                          <div className="font-mono text-xs font-medium text-ghost/80 mt-1">
                            {combo.weightedRecoveryMinutes} mins ({(combo.weightedRecoveryMinutes / 60).toFixed(1)}h)
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] text-ghost/50 uppercase">Post-Recovery Cushion</div>
                          <div className="font-mono text-xs font-medium text-ghost/80 mt-1">
                            {combo.remainingSafeTheorySkips} safe {combo.remainingSafeTheorySkips === 1 ? 'skip' : 'skips'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progressive Disclosure Toggle if > 3 combinations */}
                {combinations.length > 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      SoundFX.playTick();
                      setShowAllCombinations(!showAllCombinations);
                    }}
                    className="btn-tactile w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-ghost/70 hover:text-ghost font-sans text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    {showAllCombinations ? (
                      <>
                        <ChevronUp size={14} /> Show Fewer Options
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Show {combinations.length - 3} More Combinations
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl p-8 bg-void-subtle border border-white/5 text-center mb-6">
            <CheckCircle2 size={36} className="text-lime mx-auto mb-3" />
            <h3 className="font-sans font-bold text-lg text-ghost mb-1">
              You're already above the {targetPercent}% target.
            </h3>
            <p className="font-sans text-xs text-ghost/60 max-w-md mx-auto mb-4">
              {currentSubject.name} is currently sitting at {stats.formattedRate}%, safely maintaining your required criteria.
            </p>
            <div className="inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-full bg-lime/10 border border-lime/30 text-lime">
              Safe to Miss Today: {stats.currentSafeTheorySkips} Theory {stats.hasLab ? `or ${stats.currentSafeLabSkips} Lab` : ''} Classes
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              SoundFX.playTick();
              onClose();
            }}
            className="btn-tactile px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 font-sans text-xs font-semibold text-ghost transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

