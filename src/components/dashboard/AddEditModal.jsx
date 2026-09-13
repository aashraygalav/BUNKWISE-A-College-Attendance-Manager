import React, { useState, useEffect } from 'react';
import { X, Clock, Calculator } from 'lucide-react';
import { THEORY_MINUTES, LAB_MINUTES } from '../../engine/AttendanceCalc';
import { SoundFX } from '../../engine/SoundFX';

export default function AddEditModal({ isOpen, onClose, onSave, subjectToEdit, defaultTarget = 75 }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hasLab, setHasLab] = useState(false);
  const [theoryTotal, setTheoryTotal] = useState(42);
  const [theoryAttended, setTheoryAttended] = useState(0);
  const [theoryMissed, setTheoryMissed] = useState(0);
  const [labTotal, setLabTotal] = useState(14);
  const [labAttended, setLabAttended] = useState(0);
  const [labMissed, setLabMissed] = useState(0);
  const [totalLearningHours, setTotalLearningHours] = useState('');
  const [targetPercent, setTargetPercent] = useState(defaultTarget);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name || '');
      setCode(subjectToEdit.code || '');
      setHasLab(Boolean(subjectToEdit.hasLab));
      setTheoryTotal(subjectToEdit.theoryTotal ?? 42);
      setTheoryAttended(subjectToEdit.theoryAttended ?? 0);
      setTheoryMissed(subjectToEdit.theoryMissed ?? 0);
      setLabTotal(subjectToEdit.labTotal ?? 14);
      setLabAttended(subjectToEdit.labAttended ?? 0);
      setLabMissed(subjectToEdit.labMissed ?? 0);
      setTotalLearningHours(subjectToEdit.totalLearningHours !== null ? String(subjectToEdit.totalLearningHours) : '');
      setTargetPercent(subjectToEdit.targetPercent ?? defaultTarget);
    } else {
      setName('');
      setCode('');
      setHasLab(false);
      setTheoryTotal(42);
      setTheoryAttended(0);
      setTheoryMissed(0);
      setLabTotal(14);
      setLabAttended(0);
      setLabMissed(0);
      setTotalLearningHours('38.5');
      setTargetPercent(defaultTarget);
    }
  }, [subjectToEdit, defaultTarget, isOpen]);

  // Two-way sync: Recalculate hours when class counts change
  const recalculateHoursFromClasses = (th, lb, labEnabled) => {
    const thMins = (parseInt(th, 10) || 0) * THEORY_MINUTES;
    const lbMins = labEnabled ? (parseInt(lb, 10) || 0) * LAB_MINUTES : 0;
    const hrs = ((thMins + lbMins) / 60).toFixed(1);
    setTotalLearningHours(hrs);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    SoundFX.playSuccess();
    onSave({
      name: name.trim(),
      code: code.trim(),
      hasLab,
      theoryTotal: parseInt(theoryTotal, 10) || 42,
      theoryAttended: parseInt(theoryAttended, 10) || 0,
      theoryMissed: parseInt(theoryMissed, 10) || 0,
      labTotal: hasLab ? parseInt(labTotal, 10) || 0 : 0,
      labAttended: hasLab ? parseInt(labAttended, 10) || 0 : 0,
      labMissed: hasLab ? parseInt(labMissed, 10) || 0 : 0,
      totalLearningHours: totalLearningHours ? parseFloat(totalLearningHours) : null,
      targetPercent: parseInt(targetPercent, 10) || defaultTarget
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <h2 className="font-sans font-bold text-xl text-white">
            {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* Subject Name & Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-ghost/70 font-semibold mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-plasma focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-ghost/70 font-semibold mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS302"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:border-plasma focus:outline-none"
              />
            </div>
          </div>

          {/* Has Lab Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div>
              <div className="text-white font-semibold">Includes Laboratory Session?</div>
              <div className="text-ghost/50 text-[11px]">Adds 115m lab tracking (2.09× theory weight)</div>
            </div>
            <input
              type="checkbox"
              id="hasLabCheckbox"
              checked={hasLab}
              onChange={(e) => {
                const checked = e.target.checked;
                setHasLab(checked);
                recalculateHoursFromClasses(theoryTotal, labTotal, checked);
              }}
              className="w-5 h-5 accent-plasma rounded cursor-pointer"
            />
          </div>

          {/* Total Learning Hours Field */}
          <div className="p-3.5 rounded-2xl bg-plasma/10 border border-plasma/20">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-plasma-light font-semibold flex items-center gap-1.5">
                <Clock size={13} />
                <span>Total Semester Learning Hours</span>
              </label>
              <span className="font-mono text-[10px] text-lime">
                {totalLearningHours ? `${Math.round(parseFloat(totalLearningHours) * 60)} mins` : ''}
              </span>
            </div>
            <input
              type="number"
              step="0.1"
              value={totalLearningHours}
              onChange={(e) => setTotalLearningHours(e.target.value)}
              placeholder="e.g. 97.1"
              className="w-full px-3.5 py-2 rounded-xl bg-void/70 border border-white/10 text-white font-mono text-sm focus:border-lime focus:outline-none"
            />
            <div className="text-[10px] text-ghost/50 mt-1">
              Synchronized with class counts: (Theory × 55m) + (Lab × 115m)
            </div>
          </div>

          {/* Theory Breakdown */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="font-semibold text-cyan-300">Theory Classes (55 mins / class)</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-ghost/50 text-[11px] mb-1">Total Sem</label>
                <input
                  type="number"
                  min="1"
                  value={theoryTotal}
                  onChange={(e) => {
                    setTheoryTotal(e.target.value);
                    recalculateHoursFromClasses(e.target.value, labTotal, hasLab);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-void border border-white/10 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-ghost/50 text-[11px] mb-1">Attended</label>
                <input
                  type="number"
                  min="0"
                  value={theoryAttended}
                  onChange={(e) => setTheoryAttended(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-void border border-white/10 text-emerald-400 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-ghost/50 text-[11px] mb-1">Missed</label>
                <input
                  type="number"
                  min="0"
                  value={theoryMissed}
                  onChange={(e) => setTheoryMissed(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-void border border-white/10 text-rose-400 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Lab Breakdown (if enabled) */}
          {hasLab && (
            <div className="p-3.5 rounded-2xl bg-plasma/10 border border-plasma/20 space-y-2">
              <div className="font-semibold text-plasma-light">Lab Sessions (115 mins / session)</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-ghost/50 text-[11px] mb-1">Total Sem</label>
                  <input
                    type="number"
                    min="1"
                    value={labTotal}
                    onChange={(e) => {
                      setLabTotal(e.target.value);
                      recalculateHoursFromClasses(theoryTotal, e.target.value, true);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-void border border-white/10 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-ghost/50 text-[11px] mb-1">Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={labAttended}
                    onChange={(e) => setLabAttended(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-void border border-white/10 text-emerald-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-ghost/50 text-[11px] mb-1">Missed</label>
                  <input
                    type="number"
                    min="0"
                    value={labMissed}
                    onChange={(e) => setLabMissed(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-void border border-white/10 text-rose-400 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Target Percent */}
          <div>
            <label className="block text-ghost/70 font-semibold mb-1">Target Criteria (%)</label>
            <input
              type="number"
              min="50"
              max="100"
              value={targetPercent}
              onChange={(e) => setTargetPercent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-plasma focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                SoundFX.playTap();
                onClose();
              }}
              className="px-5 py-2.5 rounded-full hover:bg-white/10 text-ghost/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-magnetic px-6 py-2.5 rounded-full bg-plasma text-white font-semibold shadow-[0_0_20px_rgba(123,97,255,0.4)]"
            >
              <span className="btn-sliding-bg bg-lime"></span>
              <span className="btn-content text-white font-bold hover:text-void">
                {subjectToEdit ? 'Update Subject' : 'Save Subject'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
