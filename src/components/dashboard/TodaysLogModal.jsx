import React, { useState } from 'react';
import { X, Check, CheckCheck } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';

export default function TodaysLogModal({ isOpen, onClose, subjects, onBatchMark }) {
  // Store selections per subject: { [subjectId]: { theory: 'attended' | 'missed' | null, lab: 'attended' | 'missed' | null } }
  const [selections, setSelections] = useState({});

  if (!isOpen) return null;

  const handleSelect = (subId, type, status) => {
    SoundFX.playTap();
    setSelections((prev) => {
      const current = prev[subId] || { theory: null, lab: null };
      const nextStatus = current[type] === status ? null : status;
      return {
        ...prev,
        [subId]: {
          ...current,
          [type]: nextStatus
        }
      };
    });
  };

  const handleApplyAll = () => {
    SoundFX.playSuccess();
    onBatchMark(selections);
    setSelections({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full border border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h2 className="font-sans font-bold text-xl text-white">Today's Attendance Log</h2>
            <p className="font-sans text-xs text-ghost/60 font-light mt-0.5">
              Rapid multi-subject logging. Tap your attendance for today's classes:
            </p>
          </div>
          <button
            onClick={() => {
              SoundFX.playTap();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-ghost/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable list of subjects */}
        <div className="overflow-y-auto space-y-3 pr-1 my-2 flex-1">
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-ghost/50 text-xs">
              No subjects added yet. Add subjects to log today's attendance.
            </div>
          ) : (
            subjects.map((sub) => {
              const current = selections[sub.id] || { theory: null, lab: null };

              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-sans font-bold text-sm text-white">{sub.name}</div>
                    <div className="font-mono text-[10px] text-ghost/50">
                      {sub.code ? `${sub.code} • ` : ''}
                      {sub.hasLab ? 'Theory + Lab' : 'Theory Only'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {/* Theory option */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-ghost/40 w-14">Theory:</span>
                      <button
                        onClick={() => handleSelect(sub.id, 'theory', 'attended')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          current.theory === 'attended'
                            ? 'bg-emerald-500 text-void font-bold shadow-[0_0_10px_#10B981]'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        Attended
                      </button>
                      <button
                        onClick={() => handleSelect(sub.id, 'theory', 'missed')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                          current.theory === 'missed'
                            ? 'bg-rose-500 text-white font-bold shadow-[0_0_10px_#F43F5E]'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        Missed
                      </button>
                    </div>

                    {/* Lab option if applicable */}
                    {sub.hasLab && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-ghost/40 w-14">Lab:</span>
                        <button
                          onClick={() => handleSelect(sub.id, 'lab', 'attended')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                            current.lab === 'attended'
                              ? 'bg-plasma text-white font-bold shadow-[0_0_10px_#7B61FF]'
                              : 'bg-plasma/10 text-plasma-light border border-plasma/20'
                          }`}
                        >
                          Attended
                        </button>
                        <button
                          onClick={() => handleSelect(sub.id, 'lab', 'missed')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                            current.lab === 'missed'
                              ? 'bg-rose-500 text-white font-bold shadow-[0_0_10px_#F43F5E]'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}
                        >
                          Missed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-2">
          <button
            onClick={() => {
              SoundFX.playTap();
              onClose();
            }}
            className="px-5 py-2.5 rounded-full hover:bg-white/10 text-ghost/70 hover:text-white transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyAll}
            disabled={Object.keys(selections).length === 0}
            className="btn-magnetic px-6 py-2.5 rounded-full bg-plasma text-white text-xs font-bold shadow-[0_0_20px_rgba(123,97,255,0.4)] disabled:opacity-40"
          >
            <span className="btn-sliding-bg bg-lime"></span>
            <span className="btn-content flex items-center gap-1.5">
              <CheckCheck size={14} />
              <span>Apply Today's Log</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
