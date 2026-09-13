import React from 'react';
import { Edit2, Trash2, Undo2, Plus, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { AttendanceCalc } from '../../engine/AttendanceCalc';
import { SoundFX } from '../../engine/SoundFX';

export default function SubjectCard({
  subject,
  onMark,
  onUndo,
  onEdit,
  onDelete,
  targetPercent = 75
}) {
  const stats = AttendanceCalc.compute(subject, targetPercent);

  const getStatusBorder = () => {
    if (stats.status === 'safe') return 'border-emerald-500/40 hover:border-emerald-400/70';
    if (stats.status === 'warning') return 'border-amber-500/40 hover:border-amber-400/70';
    return 'border-rose-500/50 hover:border-rose-400/80';
  };

  const getDialColor = () => {
    if (stats.status === 'safe') return '#10B981';
    if (stats.status === 'warning') return '#F59E0B';
    return '#F43F5E';
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
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-sans font-bold text-xl text-white tracking-tight flex items-center gap-2">
              <span>{subject.name}</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {subject.code && (
                <span className="font-mono text-xs text-ghost/60 font-semibold">{subject.code}</span>
              )}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  subject.hasLab
                    ? 'bg-plasma/20 border-plasma/40 text-plasma-light'
                    : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                }`}
              >
                {subject.hasLab ? 'Theory + Lab (55m + 115m)' : 'Theory Only (55m)'}
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 text-ghost/50">
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

        {/* Rate & Dial Row */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-void-subtle/80 border border-white/5 mb-4">
          <div>
            <div className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {stats.formattedRate}%
            </div>
            <div className="font-sans text-xs text-ghost/60 mt-0.5">
              <strong className="text-white">{stats.attendedHours}</strong> / {stats.conductedHours} Learning Hours
            </div>
            <div className="font-mono text-[10px] text-ghost/40 mt-0.5">
              Target: {stats.targetPercent}% contact hours
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

        {/* Recommendation / Buffer Status Box */}
        <div
          className={`p-3 rounded-2xl border mb-4 font-sans text-xs leading-relaxed ${
            stats.status === 'safe'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : stats.status === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="font-semibold mb-0.5">{stats.message}</div>
          <div className="text-[11px] opacity-80">{stats.subMessage}</div>
        </div>

        {/* Class Ledger Badges */}
        <div className="space-y-2 mb-4 font-sans text-xs">
          {/* Theory Breakdown */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                THEORY (55M)
              </span>
              <span className="text-ghost/80">
                {stats.theoryAttended}/{stats.theoryConducted}
              </span>
            </div>
            <div className="font-mono text-[11px] flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{stats.theoryAttended} att</span>
              <span className="text-rose-400 font-bold">{stats.theoryMissed} miss</span>
              <span className="text-ghost/40">({stats.theoryTotal} total)</span>
            </div>
          </div>

          {/* Lab Breakdown (if applicable) */}
          {subject.hasLab && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-plasma/20 text-plasma-light">
                  LAB (115M)
                </span>
                <span className="text-ghost/80">
                  {stats.labAttended}/{stats.labConducted}
                </span>
              </div>
              <div className="font-mono text-[11px] flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{stats.labAttended} att</span>
                <span className="text-rose-400 font-bold">{stats.labMissed} miss</span>
                <span className="text-ghost/40">({stats.labTotal} total)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Logging Buttons */}
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
