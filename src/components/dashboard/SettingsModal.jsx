import React, { useState } from 'react';
import { X, Download, Upload, Trash2, Database, Volume2, Shield } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onLoadSampleData,
  onClearData,
  onExportJSON,
  onImportJSON
}) {
  const [target, setTarget] = useState(settings.defaultTarget || 75);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleSaveTarget = (e) => {
    e.preventDefault();
    SoundFX.playSuccess();
    onSaveSettings({ defaultTarget: parseInt(target, 10) || 75 });
    onClose();
  };

  const handleExport = () => {
    SoundFX.playTap();
    const jsonStr = onExportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunkwise_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const ok = onImportJSON(content);
        if (ok) {
          SoundFX.playSuccess();
          setImportError('');
          onClose();
        } else {
          SoundFX.playMiss();
          setImportError('Invalid backup file structure.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <h2 className="font-sans font-bold text-xl text-white">Application Settings</h2>
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

        <div className="space-y-6 font-sans text-xs">
          {/* Target Criteria Setting */}
          <form onSubmit={handleSaveTarget} className="space-y-3">
            <label className="block text-ghost/80 font-semibold">
              Global Attendance Target Criteria (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="50"
                max="100"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-28 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-plasma focus:outline-none"
              />
              <button
                type="submit"
                className="btn-magnetic px-4 py-2 rounded-xl bg-plasma/30 hover:bg-plasma/40 border border-plasma/40 text-plasma-light font-bold"
              >
                Update Default
              </button>
            </div>
            <p className="text-[11px] text-ghost/40">
              Standard university criteria is 75%. Applied to newly tracked subjects.
            </p>
          </form>

          {/* Backup & Restore */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <span className="block font-semibold text-ghost/80">Data Portability (JSON)</span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium hover-lift"
              >
                <Download size={14} className="text-lime" />
                <span>Export Backup</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium cursor-pointer hover-lift">
                <Upload size={14} className="text-plasma-light" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
            {importError && (
              <div className="text-rose-400 text-[11px]">{importError}</div>
            )}
          </div>

          {/* Preset Sample Data & Reset */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <span className="block font-semibold text-ghost/80">Schedule Presets & Reset</span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  SoundFX.playSuccess();
                  onLoadSampleData();
                  onClose();
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-ghost/80 hover:text-white transition-colors"
              >
                <Database size={14} className="text-cyan-400" />
                <span>Load Sample Subjects</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all tracked subjects?')) {
                    SoundFX.playMiss();
                    onClearData();
                    onClose();
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-colors"
              >
                <Trash2 size={14} />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
