import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Undo2,
  Plus,
  Sliders,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { AttendanceCalc } from '../../engine/AttendanceCalc';
import { SoundFX } from '../../engine/SoundFX';

export default function SubjectCard({
  subject,
  onMark,
  onUndo,
  onEdit,
  onDelete,
  onOpenSimulator,
  onOpenRecovery,
  targetPercent = 75
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Consume existing calculations directly from engine - ZERO duplicated math
  const stats = AttendanceCalc.compute(subject, targetPercent);
  const roadmap = AttendanceCalc.calculateRecoveryRoadmap(subject, targetPercent);

  const getStatusClass = () => {
    if (stats.riskState === 'SAFE') return 'instrument-card-safe';
    if (stats.riskState === 'CAUTION') return 'instrument-card-caution';
    return 'instrument-card-danger';
  };

  const getDialColor = () => {
    if (stats.riskState === 'SAFE') return '#10B981';
    if (stats.riskState === 'CAUTION') return '#F59E0B';
    return '#F43F5E';
  };

  const getRiskBadge = () => {
    switch (stats.riskState) {
      case 'SAFE':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            SAFE
          </span>
        );
      case 'CAUTION':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
            CAUTION
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse">
            CRITICAL
          </span>
        );
      case 'AT RISK':
      default:
        return (
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
            AT RISK
          </span>
        );
    }
  };

  // Radial SVG stroke dash calculation (radius = 32, circumference = 2 * PI * 32 = 201.06)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const rateClamped = Math.min(100, Math.max(0, stats.currentRate));
  const strokeDashoffset = circumference - (rateClamped / 100) * circumference;

  return (
    <div className="flip-card-perspective w-full h-full min-h-[440px]">
      <div className={`flip-card-inner rounded-[2rem] ${isFlipped ? 'is-flipped' : ''}`}>

        {/* ==================================================================
            FRONT FACE: ATTENDANCE INSTRUMENT
            ================================================================== */}
        <div
          className={`flip-card-front instrument-card rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between ${getStatusClass()} relative overflow-hidden`}
        >
          <div>
            {/* Top Header Row */}
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div>
                <h3 className="font-sans font-bold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
                  <span>{subject.name}</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {subject.code && (
                    <span className="font-mono text-xs text-ghost/60 font-semibold">{subject.code}</span>
                  )}
                  {getRiskBadge()}
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      subject.hasLab
                        ? 'bg-plasma/15 border-plasma/30 text-plasma-light'
                        : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                    }`}
                  >
                    {subject.hasLab ? 'Theory + Lab' : 'Theory Only (55m)'}
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1 text-ghost/50">
                {onOpenSimulator && (
                  <button
                    onClick={() => {
                      SoundFX.playTick();
                      onOpenSimulator(subject.id);
                    }}
                    title="Simulate What-If Scenarios"
                    className="btn-tactile p-1.5 rounded-lg hover:bg-white/10 hover:text-plasma-light"
                  >
                    <Sliders size={14} />
                  </button>
                )}
                <button
                  onClick={() => {
                    SoundFX.playTap();
                    onEdit(subject);
                  }}
                  title="Edit Subject"
                  className="btn-tactile p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => {
                    SoundFX.playMiss();
                    onDelete(subject.id);
                  }}
                  title="Delete Subject"
                  className="btn-tactile p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Rate & Progress Dial Module */}
            <div className="flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-3">
              <div>
                <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {stats.formattedRate}%
                </div>
                <div className="font-mono text-[11px] text-ghost/50 mt-0.5">
                  Target: <strong className="text-white">{stats.targetPercent}%</strong>
                </div>
              </div>

              {/* Radial Circular SVG Dial */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-white/5"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={getDialColor()}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute font-mono text-xs font-bold text-white">
                  {Math.round(stats.currentRate)}%
                </span>
              </div>
            </div>

            {/* Actionable Plain-English Recommendation */}
            <div
              className={`p-3 rounded-2xl border mb-3 font-sans text-xs leading-relaxed ${
                stats.status === 'safe'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                  : stats.status === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-200'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-200'
              }`}
            >
              <div className="font-semibold">{stats.message}</div>
              {stats.subMessage && (
                <div className="text-[11px] opacity-75 mt-0.5">{stats.subMessage}</div>
              )}
            </div>

            {/* Mid Action Row: Recovery Flip + Details Toggle */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  SoundFX.playTap();
                  setIsFlipped(true);
                }}
                className={`btn-tactile flex-1 py-2 px-3 rounded-xl font-mono text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                  stats.currentRate < targetPercent
                    ? 'bg-danger-crimson/15 hover:bg-danger-crimson/25 border-danger-crimson/35 text-danger-crimson'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-ghost/80 hover:text-white'
                }`}
                title="Flip card to open subject recovery command center"
              >
                <RotateCw size={12} className="text-current opacity-75" />
                <span>{stats.currentRate < targetPercent ? 'Recovery Plan ↻' : 'Recovery ↻'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  SoundFX.playTick();
                  setShowDetails(prev => !prev);
                }}
                className="btn-tactile flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-ghost/70 hover:text-white font-mono text-xs font-medium flex items-center justify-center gap-1 border border-white/5"
              >
                <span>{showDetails ? 'Hide Details' : 'Details ▾'}</span>
                {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Expandable Details Drawer (Smooth CSS Grid Accordion) */}
            <div className={`accordion-grid ${showDetails ? 'open' : ''}`}>
              <div className="accordion-inner space-y-2.5 pt-1 pb-3 font-sans text-xs">
                {/* Primary Actionable Metric: Current Safe Bunks */}
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">
                    Current Safe Bunks (Safe right now)
                  </div>
                  <div className="font-sans text-xs text-white">
                    Theory: <strong className="font-mono text-emerald-300">{stats.currentSafeTheorySkips} classes</strong>
                    {subject.hasLab && (
                      <> • Lab: <strong className="font-mono text-plasma-light">{stats.currentSafeLabSkips} sessions</strong></>
                    )}
                  </div>
                  <div className="text-[10px] text-ghost/40 mt-0.5">
                    Consecutive upcoming sessions you can miss right now without dropping below {stats.targetPercent}%.
                  </div>
                </div>

                {/* Secondary: Semester Bunk Allowance */}
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="font-mono text-[10px] text-plasma-light font-bold uppercase tracking-wider mb-0.5">
                    Semester Bunk Allowance
                  </div>
                  <div className="font-sans text-xs text-white">
                    Max Allowed: <span className="font-mono">{stats.semesterMaxTheorySkips} Theory</span>
                    {subject.hasLab && <> or <span className="font-mono">{stats.semesterMaxLabSkips} Lab</span></>}
                  </div>
                  <div className="font-sans text-xs text-ghost/70 mt-0.5">
                    Remaining: <span className="font-mono text-ghost">{stats.remainingSemesterTheorySkips} Theory</span>
                    {subject.hasLab && <> or <span className="font-mono text-ghost">{stats.remainingSemesterLabSkips} Lab</span></>}
                  </div>
                  <div className="text-[10px] text-ghost/40 mt-0.5">
                    Full-term semester budget assuming remaining sessions are attended.
                  </div>
                </div>

                {/* Contact Learning Hours (2-Decimal Precision) */}
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Contact Learning Hours</span>
                    {subject.hasLab && <span className="text-plasma-light font-normal text-[9px]">2.09× Lab weight</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-center mt-1">
                    <div className="p-1 rounded bg-black/20">
                      <div className="text-ghost/40 text-[9px] uppercase">Attended</div>
                      <div className="text-emerald-400 font-bold">{stats.attendedHours}h</div>
                    </div>
                    <div className="p-1 rounded bg-black/20">
                      <div className="text-ghost/40 text-[9px] uppercase">Conducted</div>
                      <div className="text-ghost font-bold">{stats.conductedHours}h</div>
                    </div>
                    <div className="p-1 rounded bg-black/20">
                      <div className="text-ghost/40 text-[9px] uppercase">Planned</div>
                      <div className="text-plasma-light font-bold">{stats.totalSemHours}h</div>
                    </div>
                  </div>
                </div>

                {/* Session Ledger Breakdown */}
                <div className="space-y-1 font-mono text-[11px] px-1">
                  <div className="flex items-center justify-between text-ghost/70">
                    <span>Theory (55m):</span>
                    <span>
                      <strong className="text-emerald-400">{stats.theoryAttended}</strong> att / {stats.theoryMissed} miss ({stats.theoryTotal} total)
                    </span>
                  </div>
                  {subject.hasLab && (
                    <div className="flex items-center justify-between text-ghost/70">
                      <span>Lab (115m):</span>
                      <span>
                        <strong className="text-emerald-400">{stats.labAttended}</strong> att / {stats.labMissed} miss ({stats.labTotal} total)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Attendance Logging Controls (Fast Daily Workflow) */}
          <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
            {/* Theory Actions */}
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-ghost/40 w-14 uppercase flex-shrink-0">Theory:</span>
              <button
                onClick={() => {
                  SoundFX.playSuccess();
                  onMark(subject.id, 'theory_attended');
                }}
                className="btn-tactile flex-1 min-h-[40px] sm:min-h-[36px] py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/25 text-emerald-300 font-mono text-xs font-semibold flex items-center justify-center gap-1"
              >
                <Plus size={13} />
                <span>Attended</span>
              </button>
              <button
                onClick={() => {
                  SoundFX.playMiss();
                  onMark(subject.id, 'theory_missed');
                }}
                className="btn-tactile flex-1 min-h-[40px] sm:min-h-[36px] py-1.5 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/25 text-rose-300 font-mono text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span>+ Missed</span>
              </button>
              <button
                onClick={() => {
                  SoundFX.playTap();
                  onUndo(subject.id);
                }}
                title="Undo last action"
                className="btn-tactile min-h-[40px] sm:min-h-[36px] px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-ghost/50 hover:text-white flex items-center justify-center border border-white/5"
              >
                <Undo2 size={13} />
              </button>
            </div>

            {/* Lab Actions (if applicable) */}
            {subject.hasLab && (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-ghost/40 w-14 uppercase flex-shrink-0">Lab:</span>
                <button
                  onClick={() => {
                    SoundFX.playSuccess();
                    onMark(subject.id, 'lab_attended');
                  }}
                  className="btn-tactile flex-1 min-h-[40px] sm:min-h-[36px] py-1.5 px-2 rounded-xl bg-plasma/15 hover:bg-plasma/25 border border-plasma/30 text-plasma-light font-mono text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Plus size={13} />
                  <span>Attended</span>
                </button>
                <button
                  onClick={() => {
                    SoundFX.playMiss();
                    onMark(subject.id, 'lab_missed');
                  }}
                  className="btn-tactile flex-1 min-h-[40px] sm:min-h-[36px] py-1.5 px-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/25 text-rose-300 font-mono text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <span>+ Missed</span>
                </button>
                <button
                  onClick={() => {
                    SoundFX.playTap();
                    onUndo(subject.id);
                  }}
                  title="Undo last action"
                  className="btn-tactile min-h-[40px] sm:min-h-[36px] px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-ghost/50 hover:text-white flex items-center justify-center border border-white/5"
                >
                  <Undo2 size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            BACK FACE: RECOVERY COMMAND CENTER
            ================================================================== */}
        <div
          className="flip-card-back recovery-card-frame rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between border relative overflow-y-auto"
        >
          <div>
            {/* Command Center Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-plasma/20 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-plasma/20 text-plasma-light border border-plasma/30 font-semibold flex items-center gap-1">
                  <ShieldAlert size={10} className="text-plasma-light" />
                  RECOVERY PROTOCOL
                </span>
                <span className="font-mono text-[10px] text-ghost/50">
                  {subject.code || 'UPES'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  SoundFX.playTick();
                  setIsFlipped(false);
                }}
                className="btn-tactile px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-ghost/70 hover:text-white font-mono text-[11px] flex items-center gap-1 border border-white/5"
                title="Return to attendance face"
              >
                <ArrowLeft size={12} />
                <span>Front</span>
              </button>
            </div>

            {/* Course Title */}
            <div className="mb-3">
              <h4 className="font-sans font-bold text-lg text-white leading-tight">
                {subject.name}
              </h4>
              <p className="font-mono text-[10px] text-ghost/50 mt-0.5">
                Attendance Rebuild Engine • Target {targetPercent}%
              </p>
            </div>

            {/* Metric Comparison Strip: Current vs Target */}
            <div className="p-3 rounded-2xl bg-void/70 border border-plasma/20 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-ghost/40 uppercase block">Current Attendance</span>
                  <span className={`font-mono text-2xl font-extrabold ${
                    stats.currentRate < targetPercent ? 'text-danger-crimson' : 'text-emerald-400'
                  }`}>
                    {stats.formattedRate}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] text-ghost/40 uppercase block">Required Target</span>
                  <span className="font-mono text-2xl font-extrabold text-white">
                    {targetPercent}%
                  </span>
                </div>
              </div>

              {/* Status / Deficit Line */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                {stats.currentRate < targetPercent ? (
                  <>
                    <span className="text-danger-crimson font-medium">Deficit:</span>
                    <span className="text-ghost/80">
                      Need <strong className="text-white font-bold">{roadmap.requiredMinutesDeficit || stats.requiredMinutesDeficit}</strong> weighted mins
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400 font-medium">Criteria Cleared:</span>
                    <span className="text-ghost/80">
                      Safe buffer: <strong className="text-emerald-300 font-bold">{stats.currentSafeTheorySkips}</strong> Theory skips
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Best Recovery Combinations Section */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-ghost/50 uppercase tracking-wider px-1">
                <span>{stats.currentRate < targetPercent ? 'Best Recovery Combinations' : 'Healthy Buffer Overview'}</span>
                {roadmap.combinations?.length > 0 && (
                  <span className="text-plasma-light">{roadmap.combinations.length} options found</span>
                )}
              </div>

              {/* If Shortage & Combinations Exist */}
              {stats.currentRate < targetPercent && roadmap.combinations?.length > 0 && (
                <div className="space-y-1.5">
                  {roadmap.combinations.slice(0, 3).map((comb, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white">
                            {comb.theorySessions} Theory + {comb.labSessions} Lab{comb.labSessions !== 1 ? 's' : ''}
                          </span>
                          {comb.isFewestSessions && (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-lime/10 text-lime font-semibold border border-lime/30 uppercase tracking-wider">
                              MIN SESSIONS
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-ghost/50 mt-0.5">
                          {comb.totalSessions} total sessions • +{comb.projectedBufferMinutes !== undefined ? comb.projectedBufferMinutes : (comb.bufferMinutes || 0)}m buffer
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono text-xs font-bold text-emerald-400">
                          → {comb.projectedRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}

                  {roadmap.combinations.length > 3 && (
                    <div className="text-center py-0.5">
                      <span className="font-mono text-[10px] text-ghost/40">
                        + {roadmap.combinations.length - 3} additional combination options available
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* If Shortage but Unrecoverable */}
              {stats.currentRate < targetPercent && (roadmap.isImpossible || stats.isImpossible) && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-sans text-xs">
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <ShieldAlert size={14} className="text-rose-400" />
                    Target Mathematically Unreachable
                  </div>
                  <p className="text-[11px] text-rose-200/70">
                    Remaining planned sessions cannot mathematically bridge the deficit. Maximum reachable rate is{' '}
                    <strong className="font-mono text-white">{roadmap.maxPossibleRate || stats.maxPossibleRate}%</strong>.
                  </p>
                </div>
              )}

              {/* If Subject is Already Healthy (>= 75%) */}
              {stats.currentRate >= targetPercent && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-sans text-xs">
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    75% Target Cleared — Safe Attendance
                  </div>
                  <p className="text-[11px] text-emerald-200/70">
                    You currently have <strong className="font-mono text-white">{stats.currentSafeTheorySkips} Theory</strong> or{' '}
                    <strong className="font-mono text-white">{stats.currentSafeLabSkips} Lab</strong> safe bunks available today.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recovery Actions Footer */}
          <div className="pt-3 border-t border-plasma/20 flex flex-col gap-2">
            {onOpenRecovery && (
              <button
                type="button"
                onClick={() => {
                  SoundFX.playWarning();
                  onOpenRecovery(subject.id);
                }}
                className="btn-tactile w-full py-2 px-3 rounded-xl bg-plasma hover:bg-plasma-dark text-white font-sans text-xs font-semibold border border-plasma/40 shadow-sm flex items-center justify-center gap-1.5"
              >
                <ShieldAlert size={14} />
                <span>View Full Recovery Plan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                SoundFX.playTick();
                setIsFlipped(false);
              }}
              className="btn-tactile w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-ghost/70 hover:text-white font-mono text-xs flex items-center justify-center gap-1 border border-white/5"
            >
              <ArrowLeft size={13} />
              <span>Back to Attendance</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
