/**
 * BunkWise - 75% Attendance & Learning Hours Tracker
 * Core Mathematical Engine (55m Theory + 115m Labs)
 * State Management, LocalStorage Sync & Modern UI Controller
 */

// ============================================================================
// Constants
// ============================================================================
const THEORY_MINUTES = 55;
const LAB_MINUTES = 115;

// ============================================================================
// Interactive Sound Engine (Web Audio API Synthesizer)
// ============================================================================
const SoundFX = {
  ctx: null,
  enabled: true,

  init() {
    this.enabled = localStorage.getItem('bunkwise_sound_enabled') !== 'false';
  },

  getContext() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  playTap() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  },

  playThud() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  },

  playChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.25);
      });
    } catch (e) {}
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('bunkwise_sound_enabled', this.enabled ? 'true' : 'false');
    return this.enabled;
  }
};

// ============================================================================
// Floating Particle FX Engine
// ============================================================================
function spawnParticle(originElement, text, type = 'attended') {
  if (!originElement) return;
  const rect = originElement.getBoundingClientRect();
  const particle = document.createElement('div');
  particle.className = `floating-particle particle-${type}`;
  particle.textContent = text;
  particle.style.left = `${rect.left + rect.width / 2}px`;
  particle.style.top = `${rect.top}px`;
  document.body.appendChild(particle);

  setTimeout(() => particle.remove(), 900);
}

// ============================================================================
// Mathematical Engine (Learning Hours Based)
// ============================================================================
const AttendanceCalc = {
  /**
   * Compute attendance statistics based on Total Learning Hours / Minutes
   * @param {Object} subject
   * @param {number} defaultTarget - e.g. 75
   */
  compute(subject, defaultTarget = 75) {
    const targetPercent = Number(subject.targetPercent || defaultTarget);
    const targetRatio = targetPercent / 100;
    const hasLab = Boolean(subject.hasLab);

    // Theory counts
    const theoryTotal = Math.max(1, Number(subject.theoryTotal || subject.totalSemClasses || 42));
    const theoryAttended = Math.max(0, Number(subject.theoryAttended !== undefined ? subject.theoryAttended : (subject.attended || 0)));
    const theoryMissed = Math.max(0, Number(subject.theoryMissed !== undefined ? subject.theoryMissed : (subject.missed || 0)));
    const theoryConducted = theoryAttended + theoryMissed;
    const theoryRemaining = Math.max(0, theoryTotal - theoryConducted);

    // Lab counts
    const labTotal = hasLab ? Math.max(0, Number(subject.labTotal || 0)) : 0;
    const labAttended = hasLab ? Math.max(0, Number(subject.labAttended || 0)) : 0;
    const labMissed = hasLab ? Math.max(0, Number(subject.labMissed || 0)) : 0;
    const labConducted = labAttended + labMissed;
    const labRemaining = Math.max(0, labTotal - labConducted);

    // Total Classes count
    const totalClassesSem = theoryTotal + labTotal;
    const totalClassesAttended = theoryAttended + labAttended;
    const totalClassesMissed = theoryMissed + labMissed;
    const totalClassesConducted = theoryConducted + labConducted;
    const totalClassesRemaining = theoryRemaining + labRemaining;

    // Total Learning Minutes & Hours Calculation
    const theoryAttendedMinutes = theoryAttended * THEORY_MINUTES;
    const theoryMissedMinutes = theoryMissed * THEORY_MINUTES;
    const theoryConductedMinutes = theoryConducted * THEORY_MINUTES;
    const theoryTotalMinutes = theoryTotal * THEORY_MINUTES;

    const labAttendedMinutes = labAttended * LAB_MINUTES;
    const labMissedMinutes = labMissed * LAB_MINUTES;
    const labConductedMinutes = labConducted * LAB_MINUTES;
    const labTotalMinutes = labTotal * LAB_MINUTES;

    const attendedMinutes = theoryAttendedMinutes + labAttendedMinutes;
    const missedMinutes = theoryMissedMinutes + labMissedMinutes;
    const conductedMinutes = attendedMinutes + missedMinutes;

    const customTotalHours = Number(subject.totalLearningHours);
    const totalSemMinutes = (!isNaN(customTotalHours) && customTotalHours > 0)
      ? Math.round(customTotalHours * 60)
      : (theoryTotalMinutes + labTotalMinutes);
    const remainingMinutes = Math.max(0, totalSemMinutes - conductedMinutes);

    // Converted to decimal hours
    const attendedHours = (attendedMinutes / 60).toFixed(1);
    const missedHours = (missedMinutes / 60).toFixed(1);
    const conductedHours = (conductedMinutes / 60).toFixed(1);
    const totalSemHours = (totalSemMinutes / 60).toFixed(1);

    // Attendance Percentage (Strictly Hour-Based)
    const currentRate = conductedMinutes === 0 ? 100 : (attendedMinutes / conductedMinutes) * 100;
    const formattedRate = conductedMinutes === 0 ? '100.0' : currentRate.toFixed(1);

    // Maximum allowed missed minutes in the entire semester
    const maxMissedMinutesSem = Math.floor(totalSemMinutes * (1 - targetRatio));
    const remainingAllowedMissedMinutes = Math.max(0, maxMissedMinutesSem - missedMinutes);

    // Maximum achievable final percentage if attending 100% of remaining time
    const maxPossibleRate = ((attendedMinutes + remainingMinutes) / totalSemMinutes) * 100;

    let status = 'safe'; // 'safe' | 'warning' | 'danger'
    let message = '';
    let subMessage = '';
    let safeTheorySkips = 0;
    let safeLabSkips = 0;
    let attendTheoryNeeded = 0;
    let attendLabNeeded = 0;
    let isImpossible = false;
    let bufferMinutes = 0;

    if (conductedMinutes === 0) {
      status = 'safe';
      const semTheorySkips = Math.floor(remainingAllowedMissedMinutes / THEORY_MINUTES);
      const semLabSkips = hasLab ? Math.floor(remainingAllowedMissedMinutes / LAB_MINUTES) : 0;
      message = `No classes conducted yet. <strong>${totalSemHours} learning hours</strong> ahead.`;
      subMessage = hasLab
        ? `You can safely miss up to <strong>${semTheorySkips} Theory classes</strong> OR <strong>${semLabSkips} Lab sessions</strong> this semester.`
        : `You can safely miss up to <strong>${semTheorySkips} classes</strong> this semester.`;
    } else if (currentRate >= targetPercent) {
      // Buffer in minutes: AttMin / (CondMin + X) >= targetRatio => X <= AttMin / targetRatio - CondMin
      bufferMinutes = Math.max(0, Math.floor(attendedMinutes / targetRatio - conductedMinutes));
      safeTheorySkips = Math.min(theoryRemaining, Math.floor(bufferMinutes / THEORY_MINUTES));
      safeLabSkips = hasLab ? Math.min(labRemaining, Math.floor(bufferMinutes / LAB_MINUTES)) : 0;

      const semTheorySkips = Math.floor(remainingAllowedMissedMinutes / THEORY_MINUTES);
      const semLabSkips = hasLab ? Math.floor(remainingAllowedMissedMinutes / LAB_MINUTES) : 0;

      if (safeTheorySkips > 0 || (hasLab && safeLabSkips > 0)) {
        status = 'safe';
        const bufferHours = (bufferMinutes / 60).toFixed(1);
        if (hasLab) {
          message = `🎉 Safe buffer: <strong>${bufferHours} hrs</strong>! Skip up to <strong>${safeTheorySkips} Theory</strong> OR <strong>${safeLabSkips} Lab</strong> next.`;
          subMessage = `Total sem skips left: <strong>${semTheorySkips} Theory</strong> or <strong>${semLabSkips} Labs</strong>. (1 Lab = 2.09× Theory).`;
        } else {
          message = `🎉 You can safely skip the next <strong>${safeTheorySkips} ${safeTheorySkips === 1 ? 'class' : 'classes'}</strong> in a row!`;
          subMessage = `Safe buffer: <strong>${bufferHours} hrs</strong>. Total semester skips left: <strong>${semTheorySkips} classes</strong>.`;
        }
      } else {
        // Borderline: Missing even 1 theory or lab will cause dip
        status = 'warning';
        const rateIfMissTheory = ((attendedMinutes / (conductedMinutes + THEORY_MINUTES)) * 100).toFixed(1);
        const rateIfMissLab = hasLab ? ((attendedMinutes / (conductedMinutes + LAB_MINUTES)) * 100).toFixed(1) : null;

        if (hasLab) {
          message = `⚠️ On the edge (${formattedRate}%)! Missing 1 Theory drops you to <strong>${rateIfMissTheory}%</strong>; 1 Lab drops you to <strong>${rateIfMissLab}%</strong>!`;
          subMessage = `Attend upcoming sessions to build your buffer. Total sem allowance: ${semTheorySkips} Theory or ${semLabSkips} Labs left.`;
        } else {
          message = `⚠️ On the edge (${formattedRate}%)! Missing the next class drops you to <strong>${rateIfMissTheory}%</strong>.`;
          subMessage = `Attend the next class to stay safe. Total sem allowance: ${semTheorySkips} classes left.`;
        }
      }
    } else {
      // Below target criteria!
      // (AttMin + Y) / (CondMin + Y) >= targetRatio => Y >= (targetRatio * CondMin - AttMin) / (1 - targetRatio)
      const neededMinutes = Math.ceil((targetRatio * conductedMinutes - attendedMinutes) / (1 - targetRatio));

      if (neededMinutes > remainingMinutes) {
        status = 'danger';
        isImpossible = true;
        message = `🚨 <strong>Shortage Alert!</strong> Target ${targetPercent}% is mathematically unreachable.`;
        subMessage = `Even with 100% future attendance, maximum achievable attendance is <strong>${maxPossibleRate.toFixed(1)}%</strong>.`;
      } else {
        status = 'danger';
        attendTheoryNeeded = Math.ceil(neededMinutes / THEORY_MINUTES);
        attendLabNeeded = hasLab ? Math.ceil(neededMinutes / LAB_MINUTES) : 0;
        const neededHours = (neededMinutes / 60).toFixed(1);

        if (hasLab) {
          message = `🚨 Below ${targetPercent}%! Need <strong>${neededHours} hrs</strong> of attendance: attend next <strong>${attendTheoryNeeded} Theory</strong> OR <strong>${attendLabNeeded} Labs</strong>.`;
          subMessage = `Attending Labs restores attendance >2× faster! (${theoryRemaining} theory & ${labRemaining} labs remaining).`;
        } else {
          message = `🚨 Below ${targetPercent}%! You must attend the next <strong>${attendTheoryNeeded} consecutive classes</strong>.`;
          subMessage = `Needs <strong>${neededHours} hrs</strong> of attendance to recover. (${theoryRemaining} classes remaining).`;
        }
      }
    }

    return {
      hasLab,
      theoryTotal,
      theoryAttended,
      theoryMissed,
      theoryConducted,
      theoryRemaining,
      labTotal,
      labAttended,
      labMissed,
      labConducted,
      labRemaining,

      totalClassesSem,
      totalClassesAttended,
      totalClassesMissed,
      totalClassesConducted,
      totalClassesRemaining,

      attendedMinutes,
      missedMinutes,
      conductedMinutes,
      totalSemMinutes,
      remainingMinutes,

      attendedHours,
      missedHours,
      conductedHours,
      totalSemHours,

      targetPercent,
      currentRate,
      formattedRate,
      status,
      message,
      subMessage,
      safeTheorySkips,
      safeLabSkips,
      attendTheoryNeeded,
      attendLabNeeded,
      bufferMinutes,
      isImpossible,
      maxPossibleRate: maxPossibleRate.toFixed(1)
    };
  }
};

// ============================================================================
// Sample Demo Dataset (With 1 Lab + 3 Theory per week college courses)
// ============================================================================
const SAMPLE_DATA = [
  {
    id: 'sub-sample-1',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    hasLab: true,
    theoryTotal: 42, // 14 weeks x 3 theory
    theoryAttended: 32,
    theoryMissed: 3,
    labTotal: 14,    // 14 weeks x 1 lab (115 min)
    labAttended: 11,
    labMissed: 1,
    targetPercent: 75
  },
  {
    id: 'sub-sample-2',
    name: 'Computer Networks',
    code: 'CS302',
    hasLab: true,
    theoryTotal: 42,
    theoryAttended: 24,
    theoryMissed: 7,
    labTotal: 14,
    labAttended: 7,
    labMissed: 3,
    targetPercent: 75
  },
  {
    id: 'sub-sample-3',
    name: 'Operating Systems',
    code: 'CS303',
    hasLab: true,
    theoryTotal: 45,
    theoryAttended: 36,
    theoryMissed: 2,
    labTotal: 15,
    labAttended: 13,
    labMissed: 0,
    targetPercent: 75
  },
  {
    id: 'sub-sample-4',
    name: 'Database Management Systems',
    code: 'CS304',
    hasLab: true,
    theoryTotal: 42,
    theoryAttended: 16,
    theoryMissed: 10,
    labTotal: 14,
    labAttended: 5,
    labMissed: 4,
    targetPercent: 75
  },
  {
    id: 'sub-sample-5',
    name: 'Discrete Mathematics',
    code: 'MA205',
    hasLab: false,
    theoryTotal: 45,
    theoryAttended: 28,
    theoryMissed: 5,
    labTotal: 0,
    labAttended: 0,
    labMissed: 0,
    targetPercent: 75
  }
];

// ============================================================================
// State Management & LocalStorage
class AttendanceStore {
  constructor() {
    this.STORAGE_KEY = 'bunkwise_attendance_v3'; // fresh start with 0 subjects
    this.SETTINGS_KEY = 'bunkwise_settings_v2';
    this.THEME_KEY = 'bunkwise_theme_v2';

    this.subjects = this.loadSubjects();
    this.settings = this.loadSettings();
    this.history = [];
  }

  loadSubjects() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading subjects from localStorage', e);
    }
    // Start completely fresh with zero subjects (user adds their own)
    return [];
  }

  saveSubjects() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.subjects));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  loadSettings() {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return { defaultTarget: 75 };
  }

  saveSettings() {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }

  addSubject(subject) {
    const hasLab = Boolean(subject.hasLab);
    const newSubject = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      name: subject.name.trim(),
      code: (subject.code || '').trim(),
      hasLab,
      totalLearningHours: subject.totalLearningHours ? parseFloat(subject.totalLearningHours) : null,
      theoryTotal: Math.max(1, parseInt(subject.theoryTotal, 10) || 42),
      theoryAttended: Math.max(0, parseInt(subject.theoryAttended, 10) || 0),
      theoryMissed: Math.max(0, parseInt(subject.theoryMissed, 10) || 0),
      labTotal: hasLab ? Math.max(0, parseInt(subject.labTotal, 10) || 0) : 0,
      labAttended: hasLab ? Math.max(0, parseInt(subject.labAttended, 10) || 0) : 0,
      labMissed: hasLab ? Math.max(0, parseInt(subject.labMissed, 10) || 0) : 0,
      targetPercent: parseInt(subject.targetPercent, 10) || this.settings.defaultTarget
    };
    this.subjects.push(newSubject);
    this.saveSubjects();
    return newSubject;
  }

  updateSubject(id, updatedFields) {
    const index = this.subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      const hasLab = Boolean(updatedFields.hasLab);
      this.subjects[index] = {
        ...this.subjects[index],
        name: updatedFields.name ? updatedFields.name.trim() : this.subjects[index].name,
        code: updatedFields.code !== undefined ? updatedFields.code.trim() : this.subjects[index].code,
        hasLab,
        totalLearningHours: updatedFields.totalLearningHours ? parseFloat(updatedFields.totalLearningHours) : null,
        theoryTotal: Math.max(1, parseInt(updatedFields.theoryTotal, 10)),
        theoryAttended: Math.max(0, parseInt(updatedFields.theoryAttended, 10)),
        theoryMissed: Math.max(0, parseInt(updatedFields.theoryMissed, 10)),
        labTotal: hasLab ? Math.max(0, parseInt(updatedFields.labTotal, 10) || 0) : 0,
        labAttended: hasLab ? Math.max(0, parseInt(updatedFields.labAttended, 10) || 0) : 0,
        labMissed: hasLab ? Math.max(0, parseInt(updatedFields.labMissed, 10) || 0) : 0,
        targetPercent: parseInt(updatedFields.targetPercent, 10) || this.settings.defaultTarget
      };
      this.saveSubjects();
    }
  }

  deleteSubject(id) {
    this.subjects = this.subjects.filter(s => s.id !== id);
    this.saveSubjects();
  }

  markAttendance(id, actionType) {
    const subject = this.subjects.find(s => s.id === id);
    if (!subject) return;

    // Snapshot for undo
    this.history.push({
      id: subject.id,
      prevTheoryAttended: subject.theoryAttended,
      prevTheoryMissed: subject.theoryMissed,
      prevLabAttended: subject.labAttended,
      prevLabMissed: subject.labMissed,
      action: actionType
    });

    switch (actionType) {
      case 'theory_attended':
        subject.theoryAttended = (subject.theoryAttended || 0) + 1;
        break;
      case 'theory_missed':
        subject.theoryMissed = (subject.theoryMissed || 0) + 1;
        break;
      case 'lab_attended':
        subject.labAttended = (subject.labAttended || 0) + 1;
        break;
      case 'lab_missed':
        subject.labMissed = (subject.labMissed || 0) + 1;
        break;
    }

    this.saveSubjects();
  }

  undo(id) {
    const lastIndex = this.history.map(h => h.id).lastIndexOf(id);
    if (lastIndex === -1) return false;

    const entry = this.history.splice(lastIndex, 1)[0];
    const subject = this.subjects.find(s => s.id === id);
    if (subject) {
      subject.theoryAttended = entry.prevTheoryAttended;
      subject.theoryMissed = entry.prevTheoryMissed;
      subject.labAttended = entry.prevLabAttended;
      subject.labMissed = entry.prevLabMissed;
      this.saveSubjects();
      return true;
    }
    return false;
  }

  loadSampleData() {
    this.subjects = JSON.parse(JSON.stringify(SAMPLE_DATA));
    this.saveSubjects();
  }

  clearAllData() {
    this.subjects = [];
    this.history = [];
    this.saveSubjects();
  }

  exportJSON() {
    const data = {
      version: '2.0',
      type: 'bunkwise_learning_hours_backup',
      exportedAt: new Date().toISOString(),
      settings: this.settings,
      subjects: this.subjects
    };
    return JSON.stringify(data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.subjects)) {
        this.subjects = data.subjects.map(s => ({
          ...s,
          hasLab: Boolean(s.hasLab),
          theoryTotal: s.theoryTotal || s.totalSemClasses || 45,
          theoryAttended: s.theoryAttended !== undefined ? s.theoryAttended : (s.attended || 0),
          theoryMissed: s.theoryMissed !== undefined ? s.theoryMissed : (s.missed || 0),
          labTotal: s.labTotal || 0,
          labAttended: s.labAttended || 0,
          labMissed: s.labMissed || 0
        }));
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
          this.saveSettings();
        }
        this.saveSubjects();
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }
}

// ============================================================================
// UI Controller
// ============================================================================
class UIController {
  constructor(store) {
    this.store = store;
    this.currentFilter = 'all';
    this.currentSort = 'criticalFirst';
    this.searchQuery = '';

    this.initElements();
    this.initTheme();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Header & Stats
    this.targetBadge = document.getElementById('targetBadge');
    this.overallRate = document.getElementById('overallRate');
    this.overallStatusPill = document.getElementById('overallStatusPill');
    this.overallRateSubtext = document.getElementById('overallRateSubtext');
    this.overallRadialFill = document.getElementById('overallRadialFill');
    this.overallRadialText = document.getElementById('overallRadialText');

    this.totalAttendedHours = document.getElementById('totalAttendedHours');
    this.totalAttendedClasses = document.getElementById('totalAttendedClasses');
    this.totalMissedHours = document.getElementById('totalMissedHours');
    this.totalMissedClasses = document.getElementById('totalMissedClasses');
    this.totalConductedHours = document.getElementById('totalConductedHours');
    this.totalConductedClasses = document.getElementById('totalConductedClasses');
    this.totalSemesterHours = document.getElementById('totalSemesterHours');
    this.totalSemesterClasses = document.getElementById('totalSemesterClasses');

    // Controls
    this.subjectsContainer = document.getElementById('subjectsContainer');
    this.emptyState = document.getElementById('emptyState');
    this.filterTabs = document.querySelectorAll('.filter-tab');
    this.searchInput = document.getElementById('searchInput');
    this.sortSelect = document.getElementById('sortSelect');
    this.countAll = document.getElementById('countAll');
    this.countSafe = document.getElementById('countSafe');
    this.countDanger = document.getElementById('countDanger');
    this.countLabs = document.getElementById('countLabs');

    // Add / Edit Modal
    this.subjectModal = document.getElementById('subjectModal');
    this.subjectForm = document.getElementById('subjectForm');
    this.modalTitle = document.getElementById('modalTitle');
    this.editSubjectId = document.getElementById('editSubjectId');
    this.subjectNameInput = document.getElementById('subjectName');
    this.subjectCodeInput = document.getElementById('subjectCode');
    this.subjectTargetInput = document.getElementById('subjectTarget');

    this.subjectHasLab = document.getElementById('subjectHasLab');
    this.weeklyPresetBox = document.getElementById('weeklyPresetBox');
    this.semesterWeeksInput = document.getElementById('semesterWeeksInput');
    this.applyWeeklyPresetBtn = document.getElementById('applyWeeklyPresetBtn');

    this.subjectTotalHours = document.getElementById('subjectTotalHours');
    this.liveMinutesCalc = document.getElementById('liveMinutesCalc');

    this.subjectTheoryTotal = document.getElementById('subjectTheoryTotal');
    this.subjectTheoryAttended = document.getElementById('subjectTheoryAttended');
    this.subjectTheoryMissed = document.getElementById('subjectTheoryMissed');

    this.labFormSection = document.getElementById('labFormSection');
    this.subjectLabTotal = document.getElementById('subjectLabTotal');
    this.subjectLabAttended = document.getElementById('subjectLabAttended');
    this.subjectLabMissed = document.getElementById('subjectLabMissed');

    // Quick Log & Settings Modals
    this.quickLogModal = document.getElementById('quickLogModal');
    this.quickLogList = document.getElementById('quickLogList');
    this.settingsModal = document.getElementById('settingsModal');
    this.globalTargetInput = document.getElementById('globalTargetInput');

    // Buttons
    this.openAddSubjectBtn = document.getElementById('openAddSubjectBtn');
    this.closeSubjectModalBtn = document.getElementById('closeSubjectModalBtn');
    this.cancelSubjectModalBtn = document.getElementById('cancelSubjectModalBtn');
    this.emptyAddBtn = document.getElementById('emptyAddBtn');
    this.loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
    this.quickLogBtn = document.getElementById('quickLogBtn');
    this.closeQuickLogModalBtn = document.getElementById('closeQuickLogModalBtn');
    this.doneQuickLogBtn = document.getElementById('doneQuickLogBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundOnIcon = this.soundToggleBtn ? this.soundToggleBtn.querySelector('.sound-on-icon') : null;
    this.soundOffIcon = this.soundToggleBtn ? this.soundToggleBtn.querySelector('.sound-off-icon') : null;
    this.exportDataBtn = document.getElementById('exportDataBtn');
    this.importFileInput = document.getElementById('importFileInput');
    this.reloadDemoBtn = document.getElementById('reloadDemoBtn');
    this.clearAllDataBtn = document.getElementById('clearAllDataBtn');
    this.toastContainer = document.getElementById('toastContainer');

    SoundFX.init();
    this.syncSoundIcon();
  }

  syncSoundIcon() {
    if (this.soundOnIcon && this.soundOffIcon) {
      this.soundOnIcon.style.display = SoundFX.enabled ? 'block' : 'none';
      this.soundOffIcon.style.display = SoundFX.enabled ? 'none' : 'block';
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem(this.store.THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(this.store.THEME_KEY, next);
    this.showToast(`Switched to ${next} mode`, 'success');
  }

  bindEvents() {
    // Theme
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Sound toggle
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const enabled = SoundFX.toggle();
        this.syncSoundIcon();
        if (enabled) SoundFX.playTap();
        this.showToast(`Sound feedback ${enabled ? 'enabled 🔊' : 'muted 🔇'}`, 'success');
      });
    }

    // Add / Edit Modal
    this.openAddSubjectBtn.addEventListener('click', () => this.openAddModal());
    this.emptyAddBtn.addEventListener('click', () => this.openAddModal());
    this.closeSubjectModalBtn.addEventListener('click', () => this.subjectModal.close());
    this.cancelSubjectModalBtn.addEventListener('click', () => this.subjectModal.close());
    this.subjectForm.addEventListener('submit', (e) => this.handleSubjectSubmit(e));

    // Total Learning Hours Direct Input Sync
    this.subjectTotalHours.addEventListener('input', () => {
      const hours = parseFloat(this.subjectTotalHours.value) || 0;
      const totalMins = Math.round(hours * 60);
      this.liveMinutesCalc.textContent = `(= ${totalMins.toLocaleString()} mins)`;

      // Auto-suggest class distribution if user directly modifies learning hours
      if (this.subjectHasLab.checked) {
        // 1 week = 3 theory (165m) + 1 lab (115m) = 280m
        const weeks = Math.max(1, Math.round(totalMins / 280));
        this.subjectTheoryTotal.value = weeks * 3;
        this.subjectLabTotal.value = weeks * 1;
        this.semesterWeeksInput.value = weeks;
        this.applyWeeklyPresetBtn.textContent = `Apply (${weeks} Labs + ${weeks * 3} Theory)`;
      } else {
        this.subjectTheoryTotal.value = Math.max(1, Math.round(totalMins / 55));
      }
    });

    const syncHoursFromClasses = () => {
      const th = parseInt(this.subjectTheoryTotal.value, 10) || 0;
      const lb = this.subjectHasLab.checked ? (parseInt(this.subjectLabTotal.value, 10) || 0) : 0;
      const mins = (th * 55) + (lb * 115);
      this.subjectTotalHours.value = (mins / 60).toFixed(1);
      this.liveMinutesCalc.textContent = `(= ${mins.toLocaleString()} mins)`;
    };

    this.subjectTheoryTotal.addEventListener('input', syncHoursFromClasses);
    this.subjectLabTotal.addEventListener('input', syncHoursFromClasses);

    // Has Lab toggle handler in modal
    this.subjectHasLab.addEventListener('change', () => {
      this.syncLabFormVisibility();
      syncHoursFromClasses();
    });

    // Weekly Preset button handler
    this.applyWeeklyPresetBtn.addEventListener('click', () => {
      const weeks = parseInt(this.semesterWeeksInput.value, 10) || 14;
      this.subjectTheoryTotal.value = weeks * 3;
      this.subjectLabTotal.value = weeks * 1;
      const mins = (weeks * 3 * 55) + (weeks * 1 * 115);
      this.subjectTotalHours.value = (mins / 60).toFixed(1);
      this.liveMinutesCalc.textContent = `(= ${mins.toLocaleString()} mins)`;
      this.showToast(`Applied ${weeks} weeks: ${weeks * 3} Theory + ${weeks} Labs (${(mins / 60).toFixed(1)} hrs)`, 'success');
    });

    this.semesterWeeksInput.addEventListener('input', () => {
      const weeks = parseInt(this.semesterWeeksInput.value, 10) || 14;
      this.applyWeeklyPresetBtn.textContent = `Apply (${weeks} Labs + ${weeks * 3} Theory)`;
    });

    // Sample data
    if (this.loadSampleDataBtn) {
      this.loadSampleDataBtn.addEventListener('click', () => {
        this.store.loadSampleData();
        this.render();
        this.showToast('Loaded sample courses (Theory + Labs) successfully!', 'success');
      });
    }

    this.reloadDemoBtn.addEventListener('click', () => {
      if (confirm('Load sample courses? Any custom changes will be replaced.')) {
        this.store.loadSampleData();
        this.settingsModal.close();
        this.render();
        this.showToast('Sample courses reloaded', 'success');
      }
    });

    // Quick Log Modal
    this.quickLogBtn.addEventListener('click', () => this.openQuickLogModal());
    this.closeQuickLogModalBtn.addEventListener('click', () => this.quickLogModal.close());
    this.doneQuickLogBtn.addEventListener('click', () => {
      this.quickLogModal.close();
      this.render();
    });

    // Settings Modal
    this.settingsBtn.addEventListener('click', () => {
      this.globalTargetInput.value = this.store.settings.defaultTarget;
      this.settingsModal.showModal();
    });
    this.closeSettingsModalBtn.addEventListener('click', () => this.settingsModal.close());

    this.globalTargetInput.addEventListener('change', () => {
      const val = parseInt(this.globalTargetInput.value, 10) || 75;
      this.store.settings.defaultTarget = Math.min(100, Math.max(50, val));
      this.store.saveSettings();
      this.render();
      this.showToast(`Default target set to ${this.store.settings.defaultTarget}%`, 'success');
    });

    // Export / Import
    this.exportDataBtn.addEventListener('click', () => this.handleExport());
    this.importFileInput.addEventListener('change', (e) => this.handleImport(e));

    // Clear All
    this.clearAllDataBtn.addEventListener('click', () => {
      if (confirm('Clear ALL subjects? This cannot be undone.')) {
        this.store.clearAllData();
        this.settingsModal.close();
        this.render();
        this.showToast('All subjects cleared', 'warning');
      }
    });

    // Filter tabs
    this.filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.renderSubjects();
      });
    });

    // Search & Sort
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderSubjects();
    });

    this.sortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.renderSubjects();
    });

    // Event delegation for subject cards
    this.subjectsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.subject-card');
      if (!card) return;
      const id = card.dataset.id;

      if (e.target.closest('.btn-th-attend')) {
        const btn = e.target.closest('.btn-th-attend');
        SoundFX.playTap();
        spawnParticle(btn, '+55m Attended ✨', 'attended');
        this.store.markAttendance(id, 'theory_attended');
        this.render();
        this.showToast('Theory class marked attended (+55m)', 'success');
      } else if (e.target.closest('.btn-th-miss')) {
        const btn = e.target.closest('.btn-th-miss');
        SoundFX.playThud();
        spawnParticle(btn, '-55m Missed ⚠️', 'missed');
        this.store.markAttendance(id, 'theory_missed');
        this.render();
        this.showToast('Theory class marked missed (-55m)', 'danger');
      } else if (e.target.closest('.btn-lab-attend')) {
        const btn = e.target.closest('.btn-lab-attend');
        SoundFX.playTap();
        spawnParticle(btn, '+115m Lab Attended 🚀', 'lab');
        this.store.markAttendance(id, 'lab_attended');
        this.render();
        this.showToast('Lab session marked attended (+115m)', 'success');
      } else if (e.target.closest('.btn-lab-miss')) {
        const btn = e.target.closest('.btn-lab-miss');
        SoundFX.playThud();
        spawnParticle(btn, '-115m Lab Missed ⚠️', 'missed');
        this.store.markAttendance(id, 'lab_missed');
        this.render();
        this.showToast('Lab session marked missed (-115m)', 'danger');
      } else if (e.target.closest('.btn-undo')) {
        const undone = this.store.undo(id);
        if (undone) {
          this.render();
          this.showToast('Last action undone', 'warning');
        } else {
          this.showToast('Nothing to undo for this subject', 'warning');
        }
      } else if (e.target.closest('.btn-edit')) {
        this.openEditModal(id);
      } else if (e.target.closest('.btn-delete')) {
        const subject = this.store.subjects.find(s => s.id === id);
        if (confirm(`Delete "${subject.name}"?`)) {
          this.store.deleteSubject(id);
          this.render();
          this.showToast('Subject deleted', 'warning');
        }
      }
    });
  }

  syncLabFormVisibility() {
    const isLab = this.subjectHasLab.checked;
    this.weeklyPresetBox.style.display = isLab ? 'flex' : 'none';
    this.labFormSection.style.display = isLab ? 'flex' : 'none';
    if (!isLab) {
      this.subjectLabTotal.value = 0;
      this.subjectLabAttended.value = 0;
      this.subjectLabMissed.value = 0;
    } else if (parseInt(this.subjectLabTotal.value, 10) === 0) {
      this.subjectLabTotal.value = 14;
    }
  }

  // ==========================================================================
  // Render Engine
  // ==========================================================================
  render() {
    this.targetBadge.textContent = `${this.store.settings.defaultTarget}% Target`;
    this.renderOverview();
    this.renderSubjects();
  }

  renderOverview() {
    const subjects = this.store.subjects;
    let totalAttMinutes = 0;
    let totalMissMinutes = 0;
    let totalSemMinutes = 0;

    let totalAttClasses = 0;
    let totalMissClasses = 0;
    let totalCondClasses = 0;
    let totalPlanClasses = 0;

    let safeCount = 0;
    let dangerCount = 0;
    let labCount = 0;

    subjects.forEach(sub => {
      const stats = AttendanceCalc.compute(sub, this.store.settings.defaultTarget);
      totalAttMinutes += stats.attendedMinutes;
      totalMissMinutes += stats.missedMinutes;
      totalSemMinutes += stats.totalSemMinutes;

      totalAttClasses += stats.totalClassesAttended;
      totalMissClasses += stats.totalClassesMissed;
      totalCondClasses += stats.totalClassesConducted;
      totalPlanClasses += stats.totalClassesSem;

      if (stats.hasLab) labCount++;
      if (stats.currentRate >= stats.targetPercent) {
        safeCount++;
      } else {
        dangerCount++;
      }
    });

    const totalCondMinutes = totalAttMinutes + totalMissMinutes;
    const overallRateVal = totalCondMinutes === 0 ? 0 : (totalAttMinutes / totalCondMinutes) * 100;
    const target = this.store.settings.defaultTarget;

    // Mini stats display
    this.totalAttendedHours.textContent = `${(totalAttMinutes / 60).toFixed(1)} hrs`;
    this.totalAttendedClasses.textContent = totalAttClasses;

    this.totalMissedHours.textContent = `${(totalMissMinutes / 60).toFixed(1)} hrs`;
    this.totalMissedClasses.textContent = totalMissClasses;

    this.totalConductedHours.textContent = `${(totalCondMinutes / 60).toFixed(1)} hrs`;
    this.totalConductedClasses.textContent = totalCondClasses;

    this.totalSemesterHours.textContent = `${(totalSemMinutes / 60).toFixed(1)} hrs`;
    this.totalSemesterClasses.textContent = totalPlanClasses;

    // Filters count
    this.countAll.textContent = subjects.length;
    this.countSafe.textContent = safeCount;
    this.countDanger.textContent = dangerCount;
    this.countLabs.textContent = labCount;

    if (subjects.length === 0) {
      this.overallRate.textContent = '0.0%';
      this.overallStatusPill.className = 'rate-status-pill';
      this.overallStatusPill.textContent = 'No Subjects';
      this.overallRateSubtext.textContent = 'Add your subjects below to calculate your learning hours criteria.';
      this.updateRadial(this.overallRadialFill, this.overallRadialText, 0, '#6366f1');
      return;
    }

    this.overallRate.textContent = `${overallRateVal.toFixed(1)}%`;

    let color = '#10b981';
    if (overallRateVal >= target) {
      this.overallStatusPill.className = 'rate-status-pill status-safe';
      this.overallStatusPill.textContent = `Safe (>= ${target}%)`;
      color = '#10b981';
      this.overallRateSubtext.textContent = `Overall learning hours are above ${target}%! 55m Theory + 115m Labs are accurately weighted.`;
    } else {
      this.overallStatusPill.className = 'rate-status-pill status-danger';
      this.overallStatusPill.textContent = `Below Criteria (< ${target}%)`;
      color = '#f43f5e';
      this.overallRateSubtext.textContent = `Overall learning hours under ${target}%. Attending Labs will boost your % more than twice as fast!`;
    }

    this.updateRadial(this.overallRadialFill, this.overallRadialText, overallRateVal, color);
  }

  updateRadial(fillEl, textEl, percentage, strokeColor) {
    const circumference = 263.89; // 2 * pi * 42
    const clamped = Math.min(100, Math.max(0, percentage));
    const offset = circumference - (clamped / 100) * circumference;
    fillEl.style.strokeDashoffset = offset;
    fillEl.style.stroke = strokeColor;
    textEl.textContent = `${Math.round(clamped)}%`;
  }

  renderSubjects() {
    const subjects = this.store.subjects;

    if (subjects.length === 0) {
      this.subjectsContainer.style.display = 'none';
      this.emptyState.style.display = 'block';
      return;
    }

    this.emptyState.style.display = 'none';
    this.subjectsContainer.style.display = 'grid';

    let list = subjects.map(sub => {
      const stats = AttendanceCalc.compute(sub, this.store.settings.defaultTarget);
      return { subject: sub, stats };
    });

    // Search filter
    if (this.searchQuery) {
      list = list.filter(item => {
        const nameMatch = item.subject.name.toLowerCase().includes(this.searchQuery);
        const codeMatch = item.subject.code && item.subject.code.toLowerCase().includes(this.searchQuery);
        return nameMatch || codeMatch;
      });
    }

    // Category filter
    if (this.currentFilter === 'safe') {
      list = list.filter(item => item.stats.currentRate >= item.stats.targetPercent);
    } else if (this.currentFilter === 'danger') {
      list = list.filter(item => item.stats.currentRate < item.stats.targetPercent);
    } else if (this.currentFilter === 'labs') {
      list = list.filter(item => item.stats.hasLab);
    }

    // Sort
    list.sort((a, b) => {
      if (this.currentSort === 'criticalFirst') {
        if (a.stats.currentRate < a.stats.targetPercent && b.stats.currentRate >= b.stats.targetPercent) return -1;
        if (b.stats.currentRate < b.stats.targetPercent && a.stats.currentRate >= a.stats.targetPercent) return 1;
        return a.stats.currentRate - b.stats.currentRate;
      }
      if (this.currentSort === 'attendanceLow') return a.stats.currentRate - b.stats.currentRate;
      if (this.currentSort === 'attendanceHigh') return b.stats.currentRate - a.stats.currentRate;
      if (this.currentSort === 'mostBunks') return b.stats.bufferMinutes - a.stats.bufferMinutes;
      if (this.currentSort === 'name') return a.subject.name.localeCompare(b.subject.name);
      return 0;
    });

    if (list.length === 0) {
      this.subjectsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          No subjects matched your filter or search query.
        </div>
      `;
      return;
    }

    this.subjectsContainer.innerHTML = list.map((item, idx) => this.createCardHTML(item, idx)).join('');
  }

  createCardHTML({ subject, stats }, index = 0) {
    const statusClass = stats.status === 'safe' ? 'is-safe' : stats.status === 'warning' ? 'is-warning' : 'is-danger';
    const bannerClass = stats.status === 'safe' ? 'banner-safe' : stats.status === 'warning' ? 'banner-warning' : 'banner-danger';

    const strokeColor = stats.status === 'safe' ? '#10b981' : stats.status === 'warning' ? '#f59e0b' : '#f43f5e';
    const strokeGrad = stats.status === 'safe'
      ? 'url(#emeraldGrad)'
      : stats.status === 'warning'
      ? 'url(#amberGrad)'
      : 'url(#roseGrad)';
    const glowDrop = stats.status === 'safe'
      ? 'rgba(16, 185, 129, 0.4)'
      : stats.status === 'warning'
      ? 'rgba(245, 158, 11, 0.4)'
      : 'rgba(244, 63, 94, 0.4)';

    const circumference = 2 * Math.PI * 26; // r = 26 => ~163.36
    const clampedRate = Math.min(100, Math.max(0, stats.currentRate));
    const offset = circumference - (clampedRate / 100) * circumference;

    const semPercent = Math.min(100, Math.round((stats.conductedMinutes / stats.totalSemMinutes) * 100));

    let bannerIcon = '';
    if (stats.status === 'safe') {
      bannerIcon = `<svg class="bunk-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (stats.status === 'warning') {
      bannerIcon = `<svg class="bunk-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      bannerIcon = `<svg class="bunk-banner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    const typeTag = stats.hasLab
      ? `<span class="card-type-tag pill-lab">Theory + Lab (55m + 115m)</span>`
      : `<span class="card-type-tag pill-theory">Theory Only (55m)</span>`;

    return `
      <article class="subject-card ${statusClass}" data-id="${subject.id}" style="animation-delay: ${index * 0.05}s;">
        <!-- Header -->
        <div class="card-header">
          <div class="card-title-group">
            <h4 class="card-subject-name">${this.escapeHTML(subject.name)}</h4>
            <div class="card-tags">
              ${subject.code ? `<span class="card-subject-code">${this.escapeHTML(subject.code)}</span>` : ''}
              ${typeTag}
            </div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="card-menu-btn btn-edit" title="Edit Subject Details" aria-label="Edit subject">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="card-menu-btn btn-delete" title="Delete Subject" aria-label="Delete subject">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <!-- Metric Radial & % -->
        <div class="card-metric-row">
          <div class="card-radial">
            <svg class="radial-chart" width="68" height="68" viewBox="0 0 64 64">
              <circle class="radial-bg" cx="32" cy="32" r="26" stroke-width="6"/>
              <circle class="radial-fill" cx="32" cy="32" r="26" stroke-width="6"
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}; stroke: ${strokeGrad}; filter: drop-shadow(0 0 4px ${glowDrop});"/>
              <text x="32" y="35" class="radial-center-text" style="font-size: 13px;">${Math.round(clampedRate)}%</text>
            </svg>
          </div>
          <div class="card-percent-info">
            <span class="card-percent-val" style="color: ${strokeColor};">${stats.formattedRate}%</span>
            <span class="card-hours-sub">${stats.attendedHours} / ${stats.conductedHours} Learning Hours</span>
            <span class="card-target-sub">Target: ${stats.targetPercent}% learning hours criteria</span>
          </div>
        </div>

        <!-- Bunk Decision Box -->
        <div class="bunk-banner ${bannerClass}">
          ${bannerIcon}
          <div>
            ${stats.message}
            <span class="bunk-subline">${stats.subMessage}</span>
          </div>
        </div>

        <!-- Theory & Lab Breakdown Box -->
        <div class="breakdown-box">
          <div class="breakdown-row">
            <span class="breakdown-label">
              <span class="hours-pill pill-theory">Theory (55m)</span>
              <span>${stats.theoryAttended}/${stats.theoryConducted}</span>
            </span>
            <span class="breakdown-vals">
              <span class="val-attended">${stats.theoryAttended} att</span>
              <span class="val-missed">${stats.theoryMissed} miss</span>
              <span class="val-hours">(${stats.theoryTotal} total)</span>
            </span>
          </div>

          ${stats.hasLab ? `
            <div class="breakdown-row">
              <span class="breakdown-label">
                <span class="hours-pill pill-lab">Lab (115m)</span>
                <span>${stats.labAttended}/${stats.labConducted}</span>
              </span>
              <span class="breakdown-vals">
                <span class="val-attended">${stats.labAttended} att</span>
                <span class="val-missed">${stats.labMissed} miss</span>
                <span class="val-hours">(${stats.labTotal} total)</span>
              </span>
            </div>
          ` : ''}
        </div>

        <!-- Semester Syllabus Hours Progress -->
        <div class="sem-progress-wrap">
          <div class="sem-progress-labels">
            <span>Semester Learning Hours</span>
            <span>${stats.conductedHours} / ${stats.totalSemHours} hrs (${semPercent}%)</span>
          </div>
          <div class="sem-progress-track">
            <div class="sem-progress-bar" style="width: ${semPercent}%;"></div>
          </div>
        </div>

        <!-- Action Buttons Group -->
        <div class="card-actions-group">
          <!-- Theory Row Actions -->
          <div class="action-row">
            <span class="action-row-label">Theory:</span>
            <button class="btn btn-th-attend" title="Mark Theory attended (+55m)">+ Attended</button>
            <button class="btn btn-miss btn-th-miss" title="Mark Theory missed / bunked (-55m)">+ Missed</button>
            ${!stats.hasLab ? `
              <button class="btn-card-util btn-undo" title="Undo last attendance increment" aria-label="Undo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
              </button>
            ` : ''}
          </div>

          <!-- Lab Row Actions (if hasLab) -->
          ${stats.hasLab ? `
            <div class="action-row">
              <span class="action-row-label">Lab:</span>
              <button class="btn btn-lab-attend" title="Mark Lab attended (+115m)">+ Attended</button>
              <button class="btn btn-miss btn-lab-miss" title="Mark Lab missed / bunked (-115m)">+ Missed</button>
              <button class="btn-card-util btn-undo" title="Undo last attendance increment" aria-label="Undo">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
              </button>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  // ==========================================================================
  // Modal Handlers
  // ==========================================================================
  openAddModal() {
    this.modalTitle.textContent = 'Add New Subject';
    this.editSubjectId.value = '';
    this.subjectForm.reset();
    this.subjectTargetInput.value = this.store.settings.defaultTarget;
    this.subjectHasLab.checked = true;
    this.semesterWeeksInput.value = 14;

    this.subjectTotalHours.value = '65.3';
    this.liveMinutesCalc.textContent = '(= 3,920 mins)';

    this.subjectTheoryTotal.value = 42;
    this.subjectTheoryAttended.value = 0;
    this.subjectTheoryMissed.value = 0;

    this.subjectLabTotal.value = 14;
    this.subjectLabAttended.value = 0;
    this.subjectLabMissed.value = 0;

    this.syncLabFormVisibility();
    this.subjectModal.showModal();
    this.subjectNameInput.focus();
  }

  openEditModal(id) {
    const subject = this.store.subjects.find(s => s.id === id);
    if (!subject) return;

    this.modalTitle.textContent = 'Edit Subject';
    this.editSubjectId.value = subject.id;
    this.subjectNameInput.value = subject.name;
    this.subjectCodeInput.value = subject.code || '';
    this.subjectTargetInput.value = subject.targetPercent || this.store.settings.defaultTarget;

    const hasLab = Boolean(subject.hasLab);
    this.subjectHasLab.checked = hasLab;

    const thTot = subject.theoryTotal || subject.totalSemClasses || 42;
    const lbTot = hasLab ? (subject.labTotal || 0) : 0;
    const computedHours = ((thTot * 55 + lbTot * 115) / 60).toFixed(1);

    this.subjectTotalHours.value = subject.totalLearningHours || computedHours;
    const currentMins = Math.round(parseFloat(this.subjectTotalHours.value) * 60);
    this.liveMinutesCalc.textContent = `(= ${currentMins.toLocaleString()} mins)`;

    this.subjectTheoryTotal.value = thTot;
    this.subjectTheoryAttended.value = subject.theoryAttended !== undefined ? subject.theoryAttended : (subject.attended || 0);
    this.subjectTheoryMissed.value = subject.theoryMissed !== undefined ? subject.theoryMissed : (subject.missed || 0);

    this.subjectLabTotal.value = lbTot;
    this.subjectLabAttended.value = subject.labAttended || 0;
    this.subjectLabMissed.value = subject.labMissed || 0;

    this.syncLabFormVisibility();
    this.subjectModal.showModal();
    this.subjectNameInput.focus();
  }

  handleSubjectSubmit(e) {
    e.preventDefault();

    const id = this.editSubjectId.value;
    const name = this.subjectNameInput.value.trim();
    const code = this.subjectCodeInput.value.trim();
    const targetPercent = parseInt(this.subjectTargetInput.value, 10) || this.store.settings.defaultTarget;
    const hasLab = this.subjectHasLab.checked;
    const totalLearningHours = parseFloat(this.subjectTotalHours.value) || null;

    const theoryTotal = parseInt(this.subjectTheoryTotal.value, 10);
    const theoryAttended = parseInt(this.subjectTheoryAttended.value, 10);
    const theoryMissed = parseInt(this.subjectTheoryMissed.value, 10);

    const labTotal = hasLab ? parseInt(this.subjectLabTotal.value, 10) : 0;
    const labAttended = hasLab ? parseInt(this.subjectLabAttended.value, 10) : 0;
    const labMissed = hasLab ? parseInt(this.subjectLabMissed.value, 10) : 0;

    if (!name) {
      this.showToast('Please enter a subject name', 'warning');
      return;
    }

    if (isNaN(theoryTotal) || theoryTotal < 1) {
      this.showToast('Please enter valid theory total classes (min 1)', 'warning');
      return;
    }

    const payload = {
      name,
      code,
      hasLab,
      targetPercent,
      totalLearningHours,
      theoryTotal,
      theoryAttended,
      theoryMissed,
      labTotal,
      labAttended,
      labMissed
    };

    if (id) {
      this.store.updateSubject(id, payload);
      this.showToast('Subject updated successfully', 'success');
    } else {
      this.store.addSubject(payload);
      this.showToast('New subject added', 'success');
    }

    this.subjectModal.close();
    this.render();
  }

  openQuickLogModal() {
    const subjects = this.store.subjects;
    if (subjects.length === 0) {
      this.showToast('Add subjects first before using Quick Log', 'warning');
      return;
    }

    this.quickLogList.innerHTML = subjects.map(sub => {
      const stats = AttendanceCalc.compute(sub, this.store.settings.defaultTarget);
      return `
        <div class="quick-log-item" data-id="${sub.id}">
          <div class="quick-log-header">
            <div>
              <span class="quick-log-sub-name">${this.escapeHTML(sub.name)}</span>
              ${sub.hasLab ? `<span class="hours-pill pill-lab" style="margin-left: 6px;">Lab+Theory</span>` : ''}
            </div>
            <span class="quick-log-sub-rate" style="color: ${stats.status === 'safe' ? '#10b981' : stats.status === 'warning' ? '#f59e0b' : '#f43f5e'};">
              ${stats.formattedRate}% (${stats.attendedHours}h / ${stats.conductedHours}h)
            </span>
          </div>

          <div class="quick-log-actions-wrap">
            <div class="action-row">
              <span class="action-row-label">Theory:</span>
              <button class="btn btn-th-attend btn-ql-action" data-id="${sub.id}" data-type="theory_attended">+ Attended (55m)</button>
              <button class="btn btn-miss btn-ql-action" data-id="${sub.id}" data-type="theory_missed">+ Missed (55m)</button>
            </div>

            ${sub.hasLab ? `
              <div class="action-row">
                <span class="action-row-label">Lab:</span>
                <button class="btn btn-lab-attend btn-ql-action" data-id="${sub.id}" data-type="lab_attended">+ Attended (115m)</button>
                <button class="btn btn-miss btn-ql-action" data-id="${sub.id}" data-type="lab_missed">+ Missed (115m)</button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.quickLogList.querySelectorAll('.btn-ql-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const type = e.currentTarget.dataset.type;
        if (type.includes('attended')) {
          SoundFX.playTap();
          spawnParticle(e.currentTarget, type.includes('lab') ? '+115m Lab ✨' : '+55m Theory ✨', type.includes('lab') ? 'lab' : 'attended');
        } else {
          SoundFX.playThud();
          spawnParticle(e.currentTarget, type.includes('lab') ? '-115m Lab ⚠️' : '-55m Theory ⚠️', 'missed');
        }
        this.store.markAttendance(id, type);
        this.openQuickLogModal(); // re-render modal list
        this.render();
        this.showToast(`Logged ${type.replace('_', ' ')}`, type.includes('attended') ? 'success' : 'danger');
      });
    });

    this.quickLogModal.showModal();
  }

  // ==========================================================================
  // Backup & Restore
  // ==========================================================================
  handleExport() {
    const jsonStr = this.store.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunkwise-learning-hours-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully', 'success');
  }

  handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = this.store.importJSON(event.target.result);
      if (success) {
        this.settingsModal.close();
        this.render();
        this.showToast('Data imported successfully!', 'success');
      } else {
        this.showToast('Invalid backup file format', 'danger');
      }
      this.importFileInput.value = '';
    };
    reader.readAsText(file);
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${this.escapeHTML(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// ============================================================================
// Lando Norris Cyber Racing Background Engine (Canvas Particles & Mouse Spotlight)
// ============================================================================
const CyberBackgroundFX = {
  canvas: null,
  ctx: null,
  particles: [],
  speedLines: [],
  width: 0,
  height: 0,
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  targetMouseX: window.innerWidth / 2,
  targetMouseY: window.innerHeight / 2,
  animationId: null,

  init() {
    this.canvas = document.getElementById('cyberCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse Spotlight Tracker
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    });

    // Generate Cyber Particles (LN4 Neon Lime, Cyan, Violet)
    const count = Math.min(50, Math.floor(window.innerWidth / 28));
    this.particles = [];
    const colors = ['#e4f900', '#00f0ff', '#a855f7', '#38bdf8'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6 - 0.2, // gentle upward drift
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.25,
        pulse: Math.random() * Math.PI
      });
    }

    // F1 Kinetic Speed Lines
    this.speedLines = [];
    for (let i = 0; i < 6; i++) {
      this.resetSpeedLine(i);
    }

    this.animate();
  },

  resetSpeedLine(i) {
    this.speedLines[i] = {
      x: Math.random() * (this.width + 400) - 200,
      y: -100 - Math.random() * 300,
      length: Math.random() * 180 + 80,
      speed: Math.random() * 7 + 5,
      angle: 0.65, // ~37 degrees
      color: Math.random() > 0.4 ? '#e4f900' : '#a855f7',
      alpha: Math.random() * 0.4 + 0.15
    };
  },

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  animate() {
    // Smooth lag interpolation for mouse spotlight
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    const mouseGlow = document.getElementById('mouseGlow');
    if (mouseGlow) {
      mouseGlow.style.left = `${this.mouseX}px`;
      mouseGlow.style.top = `${this.mouseY}px`;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Speed Lines
    for (let i = 0; i < this.speedLines.length; i++) {
      const line = this.speedLines[i];
      line.x += Math.cos(line.angle) * line.speed;
      line.y += Math.sin(line.angle) * line.speed;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(line.x, line.y);
      this.ctx.lineTo(line.x - Math.cos(line.angle) * line.length, line.y - Math.sin(line.angle) * line.length);
      this.ctx.strokeStyle = line.color;
      this.ctx.globalAlpha = line.alpha;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      this.ctx.restore();

      if (line.y > this.height + 200 || line.x > this.width + 200) {
        this.resetSpeedLine(i);
      }
    }

    // Draw Particles & Linking Web
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.03;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Mouse repulsion
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (140 - dist) / 140;
        p.x -= (dx / dist) * force * 2.2;
        p.y -= (dy / dist) * force * 2.2;
      }

      const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = currentAlpha;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();

      // Connecting links
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const linkDx = p.x - p2.x;
        const linkDy = p.y - p2.y;
        const linkDist = Math.sqrt(linkDx * linkDx + linkDy * linkDy);
        if (linkDist < 85) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = '#e4f900';
          this.ctx.globalAlpha = (1 - linkDist / 85) * 0.14;
          this.ctx.lineWidth = 0.75;
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const store = new AttendanceStore();
  window.app = new UIController(store);
  CyberBackgroundFX.init();
});
