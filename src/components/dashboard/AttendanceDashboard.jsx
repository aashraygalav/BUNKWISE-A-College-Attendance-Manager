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
  X
} from 'lucide-react';
import SubjectCard from './SubjectCard';
import AddEditModal from './AddEditModal';
import TodaysLogModal from './TodaysLogModal';
import SettingsModal from './SettingsModal';
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
      attendedHours: (totalAttendedMins / 60).toFixed(1),
      missedHours: (totalMissedMins / 60).toFixed(1),
      conductedHours: (conductedMins / 60).toFixed(1),
      totalSemHours: (totalSemMins / 60).toFixed(1),
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-plasma to-lime flex items-center justify-center shadow-[0_0_20px_rgba(123,97,255,0.4)]">
            <Clock size={20} className="text-void" />
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Attendance Cockpit
            </h1>
            <p className="font-mono text-xs text-ghost/50">
              UPES Bidholi • 55m Theory + 115m Labs Contact Hours Engine
            </p>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => {
              SoundFX.playTap();
              setIsTodaysLogOpen(true);
            }}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-sans text-xs font-semibold flex items-center gap-2 hover-lift"
          >
            <CalendarCheck size={14} className="text-lime" />
            <span>Today's Log</span>
          </button>

          <button
            onClick={() => {
              SoundFX.playTap();
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-ghost/70 hover:text-white hover-lift"
            title="Settings"
          >
            <Settings size={16} />
          </button>

          <button
            onClick={() => {
              SoundFX.playTap();
              setSubjectToEdit(null);
              setIsAddEditOpen(true);
            }}
            className="btn-magnetic px-5 py-2 rounded-full bg-plasma text-white font-sans text-xs font-bold shadow-[0_0_25px_rgba(123,97,255,0.5)] flex items-center gap-1.5"
          >
            <span className="btn-sliding-bg bg-lime"></span>
            <span className="btn-content text-white flex items-center gap-1.5">
              <Plus size={15} />
              <span>Add Subject</span>
            </span>
          </button>

          {isModalView && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white ml-2"
              title="Close Dashboard"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* OVERVIEW STATS HERO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Main Overall Percentage Card */}
        <div className="lg:col-span-5 glass-panel rounded-[2.5rem] p-8 flex items-center justify-between relative overflow-hidden border border-white/10">
          <div className="z-10">
            <span className="font-mono text-xs text-ghost/50 tracking-wider uppercase">
              OVERALL LEARNING HOURS
            </span>
            <div className="flex items-baseline gap-3 my-2">
              <span className="font-mono text-5xl font-extrabold text-white tracking-tight">
                {overallStats.currentRate}%
              </span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                  overallStats.rateNumber >= 75
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {overallStats.rateNumber >= 75 ? 'Safe Criteria (≥75%)' : 'Below Criteria (<75%)'}
              </span>
            </div>
            <p className="font-sans text-xs text-ghost/60 max-w-xs font-light">
              Overall contact hours calculation. Attending labs restores percentage &gt;2× faster than theory.
            </p>
          </div>

          {/* Large Overall Progress Dial */}
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={dialRadius}
                className="stroke-void-surface"
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
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute font-mono text-sm font-bold text-white">
              {Math.round(overallStats.rateNumber)}%
            </span>
          </div>
        </div>

        {/* 4 Mini Stat Blocks */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-white/5">
            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider">
              Attended
            </span>
            <div className="font-mono text-2xl font-extrabold text-white my-1">
              {overallStats.attendedHours} <span className="text-xs font-normal text-ghost/50">hrs</span>
            </div>
            <span className="font-sans text-[11px] text-ghost/40">
              {overallStats.totalClassesAttended} sessions
            </span>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-white/5">
            <span className="font-mono text-[10px] text-rose-400 uppercase tracking-wider">
              Missed
            </span>
            <div className="font-mono text-2xl font-extrabold text-white my-1">
              {overallStats.missedHours} <span className="text-xs font-normal text-ghost/50">hrs</span>
            </div>
            <span className="font-sans text-[11px] text-ghost/40">
              {overallStats.totalClassesMissed} bungs
            </span>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-white/5">
            <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider">
              Conducted
            </span>
            <div className="font-mono text-2xl font-extrabold text-white my-1">
              {overallStats.conductedHours} <span className="text-xs font-normal text-ghost/50">hrs</span>
            </div>
            <span className="font-sans text-[11px] text-ghost/40">
              {overallStats.conductedClasses} held
            </span>
          </div>

          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-white/5">
            <span className="font-mono text-[10px] text-plasma-light uppercase tracking-wider">
              Semester
            </span>
            <div className="font-mono text-2xl font-extrabold text-white my-1">
              {overallStats.totalSemHours} <span className="text-xs font-normal text-ghost/50">hrs</span>
            </div>
            <span className="font-sans text-[11px] text-ghost/40">
              {overallStats.totalClassesPlanned} planned
            </span>
          </div>
        </div>
      </div>

      {/* FILTER, SEARCH & SORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/5">
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
              className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-plasma text-white shadow-md'
                  : 'text-ghost/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Input */}
        <div className="flex items-center gap-3 flex-1 sm:flex-initial">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost/40" />
            <input
              type="text"
              placeholder="Search subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-xs focus:border-plasma focus:outline-none"
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
              targetPercent={settings.defaultTarget || 75}
            />
          ))}
        </div>
      )}

      {/* Modals */}
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
