import React, { useState, useMemo } from 'react';
import {
  Plus,
  CalendarCheck,
  Settings,
  Search,
  SlidersHorizontal,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowDownUp,
  X,
  Sliders,
  ShieldAlert,
  Zap,
  TrendingUp
} from 'lucide-react';
import SubjectCard from './SubjectCard';
import AddEditModal from './AddEditModal';
import TodaysLogModal from './TodaysLogModal';
import SettingsModal from './SettingsModal';
import ScenarioSimulatorModal from './ScenarioSimulatorModal';
import RecoveryPlannerModal from './RecoveryPlannerModal';
import { AttendanceCalc, THEORY_MINUTES, LAB_MINUTES } from '../../engine/AttendanceCalc';
import { SoundFX } from '../../engine/SoundFX';

export default function AttendanceDashboard({
  store,
  subjects,
  settings,
  onClose,
  isModalView = false
}) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('criticalFirst');
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [isTodaysLogOpen, setIsTodaysLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorSubjectId, setSimulatorSubjectId] = useState(null);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoverySubjectId, setRecoverySubjectId] = useState(null);

  // Compute Overall Aggregate Statistics across all subjects
  const overallStats = useMemo(() => {
    let totalAttendedMins = 0;
    let totalMissedMins = 0;
    let totalSemMins = 0;
    let totalClassesAttended = 0;
    let totalClassesMissed = 0;
    let totalClassesPlanned = 0;

    subjects.forEach((sub) => {
      const stats = AttendanceCalc.compute(sub, settings.defaultTarget || 75);
      totalAttendedMins += stats.attendedMinutes;
      totalMissedMins += stats.missedMinutes;
      totalSemMins += stats.totalSemMinutes;
      totalClassesAttended += stats.totalClassesAttended;
      totalClassesMissed += stats.totalClassesMissed;
      totalClassesPlanned += stats.totalClassesSem;
    });

    const conductedMins = totalAttendedMins + totalMissedMins;
    const currentRate = conductedMins === 0 ? 100 : (totalAttendedMins / conductedMins) * 100;

    return {
      attendedHours: (totalAttendedMins / 60).toFixed(2),
      missedHours: (totalMissedMins / 60).toFixed(2),
      conductedHours: (conductedMins / 60).toFixed(2),
      totalSemHours: (totalSemMins / 60).toFixed(2),
      currentRate: currentRate.toFixed(1),
      rateNumber: currentRate,
      conductedClasses: totalClassesAttended + totalClassesMissed,
      totalClassesAttended,
      totalClassesMissed,
      totalClassesPlanned
    };
  }, [subjects, settings]);

  // Filter & Sort Logic
  const filteredAndSortedSubjects = useMemo(() => {
    let list = [...subjects];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (filter === 'safe') {
      list = list.filter((s) => {
        const res = AttendanceCalc.compute(s, settings.defaultTarget || 75);
        return res.currentRate >= (s.targetPercent || settings.defaultTarget || 75);
      });
    } else if (filter === 'need') {
      list = list.filter((s) => {
        const res = AttendanceCalc.compute(s, settings.defaultTarget || 75);
        return res.currentRate < (s.targetPercent || settings.defaultTarget || 75);
      });
    } else if (filter === 'hasLab') {
      list = list.filter((s) => Boolean(s.hasLab));
    }

    // Sorting
    list.sort((a, b) => {
      const statsA = AttendanceCalc.compute(a, settings.defaultTarget || 75);
      const statsB = AttendanceCalc.compute(b, settings.defaultTarget || 75);

      if (sort === 'criticalFirst') {
        return statsA.currentRate - statsB.currentRate;
      } else if (sort === 'highestFirst') {
        return statsB.currentRate - statsA.currentRate;
      } else if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [subjects, filter, sort, search, settings]);

  // Overall Circular Dial calculations (radius = 38, circumference = 2 * PI * 38 = 238.76)
  const dialRadius = 38;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const dialClamped = Math.min(100, Math.max(0, overallStats.rateNumber));
  const dialOffset = dialCircumference - (dialClamped / 100) * dialCircumference;

  const getDialColor = () => {
    if (overallStats.rateNumber >= 75) return '#10B981';
    if (overallStats.rateNumber >= 65) return '#F59E0B';
    return '#F43F5E';
  };

  // Actions
  const handleMark = (id, action) => {
    store.markAttendance(id, action);
  };

  const handleUndo = (id) => {
    store.undo(id);
  };

  const handleEdit = (sub) => {
    setSubjectToEdit(sub);
    setIsAddEditOpen(true);
  };

  const handleDelete = (id) => {
    store.deleteSubject(id);
  };

  const handleBatchMark = (batchSelections) => {
    Object.entries(batchSelections).forEach(([subId, choices]) => {
      if (choices.theory === 'attended') store.markAttendance(subId, 'theory_attended');
      if (choices.theory === 'missed') store.markAttendance(subId, 'theory_missed');
      if (choices.lab === 'attended') store.markAttendance(subId, 'lab_attended');
      if (choices.lab === 'missed') store.markAttendance(subId, 'lab_missed');
    });
  };

  const tacticalRecommendations = useMemo(() => {
    return AttendanceCalc.generateTacticalRecommendations(subjects, settings.defaultTarget || 75);
  }, [subjects, settings]);

  const handleApplySimulated = (subjectId, simulation) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return;
    const updated = {
      ...sub,
      theoryAttended: (sub.theoryAttended || 0) + simulation.addTheoryAttended,
      theoryMissed: (sub.theoryMissed || 0) + simulation.addTheoryMissed,
      labAttended: (sub.labAttended || 0) + simulation.addLabAttended,
      labMissed: (sub.labMissed || 0) + simulation.addLabMissed
    };
    store.updateSubject(subjectId, updated);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      {/* Cockpit Instrument Faceplate Hairline Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none instrument-grid opacity-15" />

      {/* Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-ghost/80 shadow-sm">
            <Clock size={18} className="text-ghost/90" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Attendance Cockpit
            </h1>
            <p className="font-mono text-xs text-ghost/50">
              UPES Bidholi • 55m Theory + 115m Labs Contact Hours Engine
            </p>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <button
            onClick={() => {
              SoundFX.playTick();
              setSimulatorSubjectId(subjects[0]?.id);
              setIsSimulatorOpen(true);
            }}
            className="btn-tactile px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-ghost/80 hover:text-white font-sans text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
            title="Simulate future attendance and what-if scenarios"
          >
            <Sliders size={13} className="text-ghost/60" />
            <span>Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              SoundFX.playWarning();
              setRecoverySubjectId(null);
              setIsRecoveryOpen(true);
            }}
            className="btn-tactile px-3.5 py-2 rounded-xl bg-danger-crimson/15 hover:bg-danger-crimson/25 border border-danger-crimson/30 text-danger-crimson font-sans text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
            title="Shortage recovery roadmap"
          >
            <ShieldAlert size={13} className="text-danger-crimson" />
            <span>Recovery</span>
          </button>

          <button
            onClick={() => {
              SoundFX.playTap();
              setIsTodaysLogOpen(true);
            }}
            className="btn-tactile px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-ghost/80 hover:text-white font-sans text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <CalendarCheck size={13} className="text-ghost/60" />
            <span>Today's Log</span>
          </button>

          <button
            onClick={() => {
              SoundFX.playTap();
              setIsSettingsOpen(true);
            }}
            className="btn-tactile p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-ghost/60 hover:text-white flex items-center justify-center"
            title="Settings"
          >
            <Settings size={15} />
          </button>

          <button
            onClick={() => {
              SoundFX.playTap();
              setSubjectToEdit(null);
              setIsAddEditOpen(true);
            }}
            className="btn-tactile px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <Plus size={14} />
            <span>Add Subject</span>
          </button>

          {isModalView && onClose && (
            <button
              onClick={onClose}
              className="btn-tactile p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white ml-1 flex-shrink-0"
              title="Close Dashboard"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* REFINED OVERVIEW TELEMETRY HUD */}
      <div className="instrument-card rounded-[2rem] p-5 sm:p-6 mb-8 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Main Overall Percentage & Dial Block */}
          <div className="flex items-center gap-5">
            {/* Large Progress Dial */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={dialRadius}
                  className="stroke-white/5"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={dialRadius}
                  stroke={getDialColor()}
                  strokeWidth="8"
                  strokeDasharray={dialCircumference}
                  strokeDashoffset={dialOffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute font-mono text-sm sm:text-base font-extrabold text-white">
                {Math.round(overallStats.rateNumber)}%
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-ghost/50 tracking-wider uppercase">
                  OVERALL LEARNING HOURS
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    overallStats.rateNumber >= 75
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {overallStats.rateNumber >= 75 ? 'Safe Criteria (≥75%)' : 'Below Criteria (<75%)'}
                </span>
              </div>
              <div className="flex items-baseline gap-3 my-1">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {overallStats.currentRate}%
                </span>
                <span className="font-mono text-xs text-ghost/50">
                  Target: <strong className="text-white">{settings.defaultTarget || 75}%</strong>
                </span>
              </div>
              <p className="font-sans text-xs text-ghost/50 font-light max-w-sm">
                Calculated on contact hours with <span className="text-plasma-light font-mono font-medium">2.09× Lab weight</span> (115m vs 55m).
              </p>
            </div>
          </div>

          {/* 4 Telemetry Cells */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-auto flex-1 lg:max-w-2xl border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider font-semibold">
                Attended
              </span>
              <div className="font-mono text-lg sm:text-xl font-extrabold text-white my-0.5">
                {overallStats.attendedHours}<span className="text-[10px] font-normal text-ghost/50 ml-0.5">h</span>
              </div>
              <span className="font-mono text-[10px] text-ghost/40">
                {overallStats.totalClassesAttended} sessions
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="font-mono text-[9px] text-rose-400 uppercase tracking-wider font-semibold">
                Missed
              </span>
              <div className="font-mono text-lg sm:text-xl font-extrabold text-white my-0.5">
                {overallStats.missedHours}<span className="text-[10px] font-normal text-ghost/50 ml-0.5">h</span>
              </div>
              <span className="font-mono text-[10px] text-ghost/40">
                {overallStats.totalClassesMissed} bungs
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
                Conducted
              </span>
              <div className="font-mono text-lg sm:text-xl font-extrabold text-white my-0.5">
                {overallStats.conductedHours}<span className="text-[10px] font-normal text-ghost/50 ml-0.5">h</span>
              </div>
              <span className="font-mono text-[10px] text-ghost/40">
                {overallStats.conductedClasses} held
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="font-mono text-[9px] text-plasma-light uppercase tracking-wider font-semibold">
                Semester
              </span>
              <div className="font-mono text-lg sm:text-xl font-extrabold text-white my-0.5">
                {overallStats.totalSemHours}<span className="text-[10px] font-normal text-ghost/50 ml-0.5">h</span>
              </div>
              <span className="font-mono text-[10px] text-ghost/40">
                {overallStats.totalClassesPlanned} planned
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TACTICAL DECISION COPILOT BANNER */}
      {tacticalRecommendations.length > 0 && (
        <div className="mb-8 rounded-2xl p-5 instrument-card border border-white/10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`p-2.5 rounded-xl border flex-shrink-0 ${
                  tacticalRecommendations[0].status === 'danger'
                    ? 'bg-danger-crimson/15 border-danger-crimson/30 text-danger-crimson'
                    : tacticalRecommendations[0].status === 'warning'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-lime/15 border-lime/30 text-lime'
                }`}
              >
                {tacticalRecommendations[0].status === 'danger' ? (
                  <ShieldAlert size={22} />
                ) : tacticalRecommendations[0].status === 'warning' ? (
                  <AlertTriangle size={22} />
                ) : (
                  <CheckCircle2 size={22} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-ghost/60 font-semibold">
                    TACTICAL DIRECTIVE
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      tacticalRecommendations[0].status === 'danger'
                        ? 'text-danger-crimson'
                        : tacticalRecommendations[0].status === 'warning'
                        ? 'text-amber-400'
                        : 'text-lime'
                    }`}
                  >
                    {tacticalRecommendations[0].tacticalHeadline}
                  </span>
                </div>
                <h4 className="font-sans font-bold text-base text-ghost mb-0.5">
                  {tacticalRecommendations[0].name}: {tacticalRecommendations[0].actionDirective}
                </h4>
                <p className="font-sans text-xs text-ghost/50">
                  {tacticalRecommendations[0].status === 'danger'
                    ? 'Attendance is below target criteria. Attend upcoming sessions to restore your buffer above 75%.'
                    : tacticalRecommendations[0].status === 'warning'
                    ? 'Attendance buffer exhausted. Missing a single laboratory session (115m) drops status directly into shortage.'
                    : 'Attendance buffer healthy across semester learning hours. Safe skips available within calculated criteria.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
              {tacticalRecommendations[0].status === 'danger' ? (
                <button
                  type="button"
                  onClick={() => {
                    SoundFX.playWarning();
                    setRecoverySubjectId(tacticalRecommendations[0].id);
                    setIsRecoveryOpen(true);
                  }}
                  className="btn-tactile px-4 py-2 rounded-xl bg-danger-crimson hover:bg-danger-crimson/90 text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldAlert size={14} />
                  <span>View Recovery Steps</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    SoundFX.playTick();
                    setSimulatorSubjectId(tacticalRecommendations[0].id);
                    setIsSimulatorOpen(true);
                  }}
                  className="btn-tactile px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Sliders size={14} />
                  <span>Test In Simulator</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FILTER, SEARCH & SORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          {[
            { id: 'all', label: `All (${subjects.length})` },
            { id: 'safe', label: 'Safe to Bunk' },
            { id: 'need', label: 'Need Attendance' },
            { id: 'hasLab', label: 'Has Labs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                SoundFX.playTap();
                setFilter(tab.id);
              }}
              className={`btn-tactile px-3.5 py-1.5 rounded-lg font-sans text-xs font-medium transition-all ${
                filter === tab.id
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-ghost/60 hover:text-white border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Input */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost/40" />
            <input
              type="text"
              placeholder="Search course or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-void-surface border border-white/10 text-white font-sans text-xs placeholder:text-ghost/40 focus:border-plasma focus:outline-none w-48 sm:w-60"
            />
          </div>

          {/* Sort Select */}
          <select
            value={sort}
            onChange={(e) => {
              SoundFX.playTap();
              setSort(e.target.value);
            }}
            className="px-3.5 py-2 rounded-xl bg-void-surface border border-white/10 text-white font-sans text-xs cursor-pointer focus:border-plasma focus:outline-none"
          >
            <option value="criticalFirst">Sort: Needs Attention First</option>
            <option value="highestFirst">Sort: Highest % First</option>
            <option value="name">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* SUBJECT CARDS GRID */}
      {filteredAndSortedSubjects.length === 0 ? (
        <div className="glass-panel rounded-[3rem] p-16 text-center border border-white/10">
          <BookOpen size={48} className="mx-auto text-ghost/30 mb-4" />
          <h3 className="font-sans font-bold text-xl text-white mb-2">No subjects found</h3>
          <p className="font-sans text-xs text-ghost/60 max-w-md mx-auto mb-6 font-light">
            {search
              ? 'No courses match your search query.'
              : 'You have not added any subjects yet. Click below to add your first semester course or load sample presets.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                SoundFX.playTap();
                setSubjectToEdit(null);
                setIsAddEditOpen(true);
              }}
              className="px-5 py-2.5 rounded-full bg-plasma text-white font-sans text-xs font-bold shadow-[0_0_20px_rgba(123,97,255,0.4)]"
            >
              + Add First Subject
            </button>
            <button
              onClick={() => {
                SoundFX.playSuccess();
                store.loadSampleData();
              }}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-ghost font-sans text-xs"
            >
              Load Sample Data
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onMark={handleMark}
              onUndo={handleUndo}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpenSimulator={(id) => {
                setSimulatorSubjectId(id);
                setIsSimulatorOpen(true);
              }}
              onOpenRecovery={(id) => {
                setRecoverySubjectId(id);
                setIsRecoveryOpen(true);
              }}
              targetPercent={settings.defaultTarget || 75}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        subjects={subjects}
        selectedSubjectId={simulatorSubjectId}
        targetPercent={settings.defaultTarget || 75}
        onApplySimulated={handleApplySimulated}
      />

      <RecoveryPlannerModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        subjects={subjects}
        selectedSubjectId={recoverySubjectId}
        targetPercent={settings.defaultTarget || 75}
      />

      <AddEditModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={(data) => {
          if (subjectToEdit) {
            store.updateSubject(subjectToEdit.id, data);
          } else {
            store.addSubject(data);
          }
        }}
        subjectToEdit={subjectToEdit}
        defaultTarget={settings.defaultTarget || 75}
      />

      <TodaysLogModal
        isOpen={isTodaysLogOpen}
        onClose={() => setIsTodaysLogOpen(false)}
        subjects={subjects}
        onBatchMark={handleBatchMark}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => store.saveSettings(newSettings)}
        onLoadSampleData={() => store.loadSampleData()}
        onClearData={() => store.clearAllData()}
        onExportJSON={() => store.exportJSON()}
        onImportJSON={(str) => store.importJSON(str)}
      />
    </div>
  );
}
