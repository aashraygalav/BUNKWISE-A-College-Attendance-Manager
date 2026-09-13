/**
 * State Management & LocalStorage Persistence for BunkWise
 */

export const SAMPLE_DATA = [
  {
    id: 'sub-sample-1',
    name: 'Operating Systems',
    code: 'CS302',
    hasLab: false,
    theoryTotal: 40,
    theoryAttended: 11,
    theoryMissed: 4,
    labTotal: 0,
    labAttended: 0,
    labMissed: 0,
    targetPercent: 75
  },
  {
    id: 'sub-sample-2',
    name: 'ITCS',
    code: 'CS301',
    hasLab: true,
    theoryTotal: 62,
    theoryAttended: 16,
    theoryMissed: 4,
    labTotal: 21,
    labAttended: 4,
    labMissed: 1,
    targetPercent: 75
  },
  {
    id: 'sub-sample-3',
    name: 'Data Communication Networks',
    code: 'CS304',
    hasLab: true,
    theoryTotal: 42,
    theoryAttended: 10,
    theoryMissed: 8,
    labTotal: 14,
    labAttended: 2,
    labMissed: 2,
    targetPercent: 75
  }
];

export class AttendanceStore {
  constructor(onUpdate) {
    this.STORAGE_KEY = 'bunkwise_attendance_v3';
    this.SETTINGS_KEY = 'bunkwise_settings_v2';
    this.THEME_KEY = 'bunkwise_theme_v2';

    this.onUpdate = onUpdate || (() => {});
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
    return [];
  }

  saveSubjects() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.subjects));
      this.onUpdate(this.subjects);
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

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
      this.onUpdate(this.subjects);
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
        theoryTotal: Math.max(1, parseInt(updatedFields.theoryTotal, 10) || 42),
        theoryAttended: Math.max(0, parseInt(updatedFields.theoryAttended, 10) || 0),
        theoryMissed: Math.max(0, parseInt(updatedFields.theoryMissed, 10) || 0),
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
      default:
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
          theoryTotal: s.theoryTotal || s.totalSemClasses || 42,
          theoryAttended: s.theoryAttended !== undefined ? s.theoryAttended : (s.attended || 0),
          theoryMissed: s.theoryMissed !== undefined ? s.theoryMissed : (s.missed || 0),
          labTotal: s.labTotal || 0,
          labAttended: s.labAttended || 0,
          labMissed: s.labMissed || 0
        }));
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
          localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
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
