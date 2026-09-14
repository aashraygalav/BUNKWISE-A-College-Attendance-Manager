import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Undo2,
  Plus,
  Sliders,
  ShieldAlert,
  ChevronDown,
  ChevronUp
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
  const stats = AttendanceCalc.compute(subject, targetPercent);

  const getStatusBorder = () => {
    if (stats.riskState === 'SAFE') return 'border-emerald-500/40 hover:border-emerald-400/70';
    if (stats.riskState === 'CAUTION') return 'border-amber-500/40 hover:border-amber-400/70';
    return 'border-rose-500/50 hover:border-rose-400/80';
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

  // SVG Radial stroke dash calculation (radius = 32, circumference = 2 * PI * 32 = 201.06)
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const rateClamped = Math.min(100, Math.max(0, stats.currentRate));
  const strokeDashoffset = circumference - (rateClamped / 100) * circumference;

  return (
    <div
      className={`glass-panel rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative overflow-hidden border ${getStatusBorder()} shadow-lg`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-sans font-bold text-xl text-white tracking-tight flex items-center gap-2">
              <span>{subject.name}</span>
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {subject.code && (
                <span className="font-mono text-xs text-ghost/60 font-semibold">{subject.code}</span>
              )}
              {getRiskBadge()}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  subject.hasLab
                    ? 'bg-plasma/20 border-plasma/40 text-plasma-light'
                    : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                }`}
              >
                {subject.hasLab ? 'Theory + Lab' : 'Theory Only (55m)'}
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 text-ghost/50">
            {stats.status === 'danger' && onOpenRecovery && (
              <button
                onClick={() => {
                  SoundFX.playWarning();
                  onOpenRecovery(subject.id);
                }}
                title="Open Shortage Recovery Protocol"
                className="p-1.5 rounded-lg bg-danger-crimson/20 text-danger-crimson hover:bg-danger-crimson/30 transition-colors animate-pulse"
              >
                <ShieldAlert size={15} />
              </button>
            )}
            {onOpenSimulator && (
              <button
                onClick={() => {
                  SoundFX.playTick();
                  onOpenSimulator(subject.id);
                }}
                title="Simulate What-If Scenarios"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-plasma-light transition-colors"
              >
                <Sliders size={15} />
              </button>
            )}
            <button
              onClick={() => {
                SoundFX.playTap();
                onEdit(subject);
              }}
              title="Edit Subject"
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => {
                SoundFX.playMiss();
                onDelete(subject.id);
              }}
              title="Delete Subject"
              className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Rate & Dial Row (Clean Default View) */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-void-subtle/80 border border-white/5 mb-3">
          <div>
            <div className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {stats.formattedRate}%
            </div>
            <div className="font-mono text-[11px] text-ghost/50 mt-1">
              Target: <strong className="text-white">{stats.targetPercent}%</strong>
            </div>
          </div>

          {/* Radial Circular SVG Dial */}
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-void-surface"
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

        {/* Actionable Plain-English Recommendation Box */}
        <div
          className={`p-3.5 rounded-2xl border mb-3 font-sans text-xs leading-relaxed ${
            stats.status === 'safe'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : stats.status === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="font-semibold">{stats.message}</div>
          {stats.subMessage && (
            <div className="text-[11px] opacity-75 mt-0.5">{stats.subMessage}</div>
          )}
        </div>

        {/* Progressive Disclosure Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            SoundFX.playTick();
            setShowDetails(prev => !prev);
          }}
          className="w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-ghost/60 hover:text-white font-mono text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors mb-3 border border-white/5 cursor-pointer"
        >
          <span>{showDetails ? 'Hide Details' : 'View Details & Allowances'}</span>
          {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Expandable Details Drawer (Progressive Disclosure) */}
        {showDetails && (
          <div className="p-3.5 rounded-2xl bg-void-subtle border border-white/5 mb-3 space-y-3 animate-fadeIn font-sans text-xs">
            {/* Primary Actionable Metric: Current Safe Bunks */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
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
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="font-mono text-[10px] text-plasma-light font-bold uppercase tracking-wider mb-1">
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
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
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
            <div className="space-y-1.5 font-mono text-[11px]">
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
        )}
      </div>

      {/* Interactive Logging Buttons (Fast Daily Use) */}
      <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
        {/* Theory Actions */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-ghost/40 w-16 uppercase">Theory:</span>
          <button
            onClick={() => {
              SoundFX.playSuccess();
              onMark(subject.id, 'theory_attended');
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold flex items-center justify-center gap-1 transition-colors hover-lift"
          >
            <Plus size={13} />
            <span>Attended</span>
          </button>
          <button
            onClick={() => {
              SoundFX.playMiss();
              onMark(subject.id, 'theory_missed');
            }}
            className="flex-1 py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-mono text-xs font-semibold flex items-center justify-center gap-1 transition-colors hover-lift"
          >
            <span>+ Missed</span>
          </button>
          <button
            onClick={() => {
              SoundFX.playTap();
              onUndo(subject.id);
            }}
            title="Undo last action"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-ghost/60 hover:text-white transition-colors hover-lift"
          >
            <Undo2 size={13} />
          </button>
        </div>

        {/* Lab Actions (if applicable) */}
        {subject.hasLab && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ghost/40 w-16 uppercase">Lab:</span>
            <button
              onClick={() => {
                SoundFX.playSuccess();
                onMark(subject.id, 'lab_attended');
              }}
              className="flex-1 py-1.5 px-2 rounded-xl bg-plasma/20 hover:bg-plasma/30 border border-plasma/40 text-plasma-light font-mono text-xs font-semibold flex items-center justify-center gap-1 transition-colors hover-lift"
            >
              <Plus size={13} />
              <span>Attended</span>
            </button>
            <button
              onClick={() => {
                SoundFX.playMiss();
                onMark(subject.id, 'lab_missed');
              }}
              className="flex-1 py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-mono text-xs font-semibold flex items-center justify-center gap-1 transition-colors hover-lift"
            >
              <span>+ Missed</span>
            </button>
            <button
              onClick={() => {
                SoundFX.playTap();
                onUndo(subject.id);
              }}
              title="Undo last action"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-ghost/60 hover:text-white transition-colors hover-lift"
            >
              <Undo2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
