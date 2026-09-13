/**
 * BunkWise - Precision Contact Learning Hours Mathematical Engine
 * Strict calculation by contact minutes: 55m Theory + 115m Lab (2.09x ratio)
 */

export const THEORY_MINUTES = 55;
export const LAB_MINUTES = 115;

export const AttendanceCalc = {
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

    // Total counts
    const totalClassesSem = theoryTotal + labTotal;
    const totalClassesAttended = theoryAttended + labAttended;
    const totalClassesMissed = theoryMissed + labMissed;
    const totalClassesConducted = theoryConducted + labConducted;
    const totalClassesRemaining = theoryRemaining + labRemaining;

    // Minute calculations
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

    // Maximum allowed missed minutes in semester
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
      message = `No classes conducted yet. ${totalSemHours} learning hours ahead.`;
      subMessage = hasLab
        ? `You can safely miss up to ${semTheorySkips} Theory classes OR ${semLabSkips} Lab sessions this semester.`
        : `You can safely miss up to ${semTheorySkips} classes this semester.`;
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
          message = `🎉 Safe buffer: ${bufferHours} hrs! Skip up to ${safeTheorySkips} Theory OR ${safeLabSkips} Lab next.`;
          subMessage = `Total sem skips left: ${semTheorySkips} Theory or ${semLabSkips} Labs. (1 Lab = 2.09× Theory).`;
        } else {
          message = `🎉 You can safely skip the next ${safeTheorySkips} ${safeTheorySkips === 1 ? 'class' : 'classes'} in a row!`;
          subMessage = `Safe buffer: ${bufferHours} hrs. Total semester skips left: ${semTheorySkips} classes.`;
        }
      } else {
        // Borderline warning
        status = 'warning';
        const rateIfMissTheory = ((attendedMinutes / (conductedMinutes + THEORY_MINUTES)) * 100).toFixed(1);
        const rateIfMissLab = hasLab ? ((attendedMinutes / (conductedMinutes + LAB_MINUTES)) * 100).toFixed(1) : null;

        if (hasLab) {
          message = `⚠️ On the edge (${formattedRate}%)! Missing 1 Theory drops you to ${rateIfMissTheory}%; 1 Lab drops you to ${rateIfMissLab}%!`;
          subMessage = `Attend upcoming sessions to build your buffer. Total sem allowance: ${semTheorySkips} Theory or ${semLabSkips} Labs left.`;
        } else {
          message = `⚠️ On the edge (${formattedRate}%)! Missing the next class drops you to ${rateIfMissTheory}%.`;
          subMessage = `Attend the next class to stay safe. Total sem allowance: ${semTheorySkips} classes left.`;
        }
      }
    } else {
      // Below target criteria
      const neededMinutes = Math.ceil((targetRatio * conductedMinutes - attendedMinutes) / (1 - targetRatio));

      if (neededMinutes > remainingMinutes) {
        status = 'danger';
        isImpossible = true;
        message = `🚨 Shortage Alert! Target ${targetPercent}% is mathematically unreachable.`;
        subMessage = `Even with 100% future attendance, maximum achievable attendance is ${maxPossibleRate.toFixed(1)}%.`;
      } else {
        status = 'danger';
        attendTheoryNeeded = Math.ceil(neededMinutes / THEORY_MINUTES);
        attendLabNeeded = hasLab ? Math.ceil(neededMinutes / LAB_MINUTES) : 0;
        const neededHours = (neededMinutes / 60).toFixed(1);

        if (hasLab) {
          message = `🚨 Below ${targetPercent}%! Need ${neededHours} hrs of attendance: attend next ${attendTheoryNeeded} Theory OR ${attendLabNeeded} Labs.`;
          subMessage = `Attending Labs restores attendance >2× faster! (${theoryRemaining} theory & ${labRemaining} labs remaining).`;
        } else {
          message = `🚨 Below ${targetPercent}%! You must attend the next ${attendTheoryNeeded} consecutive classes.`;
          subMessage = `Needs ${neededHours} hrs of attendance to recover. (${theoryRemaining} classes remaining).`;
        }
      }
    }

    // 4-Tier Standardized Risk Classification:
    // Safe: >= 80.0% (or 0 conducted)
    // Caution: 75.0% - 79.9%
    // At Risk: 70.0% - 74.9%
    // Critical: < 70.0% or mathematically unrecoverable
    let riskTier = 'safe';
    let riskLabel = 'Safe';

    if (conductedMinutes === 0) {
      riskTier = 'safe';
      riskLabel = 'Safe';
    } else if (isImpossible || currentRate < 70.0) {
      riskTier = 'critical';
      riskLabel = 'Critical';
    } else if (currentRate < targetPercent) {
      riskTier = 'at_risk';
      riskLabel = 'At Risk';
    } else if (currentRate < 80.0) {
      riskTier = 'caution';
      riskLabel = 'Caution';
    } else {
      riskTier = 'safe';
      riskLabel = 'Safe';
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
      riskTier,
      riskLabel,
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
  },

  /**
   * Calculate exact percentage deltas for attending vs missing next Theory or Lab session
   */
  calculateDeltas(subject, defaultTarget = 75) {
    const stats = this.compute(subject, defaultTarget);
    const condMin = stats.conductedMinutes;
    const attMin = stats.attendedMinutes;

    // Next Theory
    const afterAttendTheory = condMin === 0 ? 100 : ((attMin + THEORY_MINUTES) / (condMin + THEORY_MINUTES)) * 100;
    const afterMissTheory = condMin === 0 ? 0 : (attMin / (condMin + THEORY_MINUTES)) * 100;

    // Next Lab
    const afterAttendLab = condMin === 0 ? 100 : ((attMin + LAB_MINUTES) / (condMin + LAB_MINUTES)) * 100;
    const afterMissLab = condMin === 0 ? 0 : (attMin / (condMin + LAB_MINUTES)) * 100;

    const cur = stats.currentRate;

    return {
      currentRate: cur,
      afterAttendTheory,
      afterMissTheory,
      deltaAttendTheory: +(afterAttendTheory - cur).toFixed(2),
      deltaMissTheory: +(afterMissTheory - cur).toFixed(2),
      afterAttendLab,
      afterMissLab,
      deltaAttendLab: +(afterAttendLab - cur).toFixed(2),
      deltaMissLab: +(afterMissLab - cur).toFixed(2)
    };
  },

  /**
   * Simulate a what-if scenario by projecting future attendance actions
   */
  simulateScenario(subject, simulation = {}, defaultTarget = 75) {
    const {
      addTheoryAttended = 0,
      addTheoryMissed = 0,
      addLabAttended = 0,
      addLabMissed = 0
    } = simulation;

    const baseAttended = Number(subject.theoryAttended !== undefined ? subject.theoryAttended : (subject.attended || 0));
    const baseMissed = Number(subject.theoryMissed !== undefined ? subject.theoryMissed : (subject.missed || 0));
    const baseLabAttended = Number(subject.labAttended || 0);
    const baseLabMissed = Number(subject.labMissed || 0);

    const simulatedSubject = {
      ...subject,
      theoryAttended: Math.max(0, baseAttended + addTheoryAttended),
      theoryMissed: Math.max(0, baseMissed + addTheoryMissed),
      labAttended: Math.max(0, baseLabAttended + addLabAttended),
      labMissed: Math.max(0, baseLabMissed + addLabMissed)
    };

    const originalStats = this.compute(subject, defaultTarget);
    const simulatedStats = this.compute(simulatedSubject, defaultTarget);

    return {
      original: originalStats,
      simulated: simulatedStats,
      rateDiff: +(simulatedStats.currentRate - originalStats.currentRate).toFixed(2),
      bufferDiffMinutes: simulatedStats.bufferMinutes - originalStats.bufferMinutes
    };
  },

  /**
   * Calculate step-by-step recovery milestone roadmap
   */
  calculateRecoveryRoadmap(subject, defaultTarget = 75) {
    const stats = this.compute(subject, defaultTarget);
    if (stats.currentRate >= stats.targetPercent) {
      return { inShortage: false, steps: [] };
    }

    const targetRatio = stats.targetPercent / 100;
    const theorySteps = [];
    const labSteps = [];

    // Theory trajectory
    let att = stats.attendedMinutes;
    let cond = stats.conductedMinutes;
    for (let i = 1; i <= Math.min(25, stats.attendTheoryNeeded + 2); i++) {
      att += THEORY_MINUTES;
      cond += THEORY_MINUTES;
      const rate = (att / cond) * 100;
      theorySteps.push({
        stepNumber: i,
        type: 'Theory',
        minutes: THEORY_MINUTES,
        projectedRate: +rate.toFixed(1),
        reachedTarget: rate >= stats.targetPercent
      });
      if (rate >= stats.targetPercent && theorySteps.length >= stats.attendTheoryNeeded) break;
    }

    // Lab trajectory (if applicable)
    if (stats.hasLab) {
      att = stats.attendedMinutes;
      cond = stats.conductedMinutes;
      for (let i = 1; i <= Math.min(15, stats.attendLabNeeded + 2); i++) {
        att += LAB_MINUTES;
        cond += LAB_MINUTES;
        const rate = (att / cond) * 100;
        labSteps.push({
          stepNumber: i,
          type: 'Lab',
          minutes: LAB_MINUTES,
          projectedRate: +rate.toFixed(1),
          reachedTarget: rate >= stats.targetPercent
        });
        if (rate >= stats.targetPercent && labSteps.length >= stats.attendLabNeeded) break;
      }
    }

    return {
      inShortage: true,
      targetPercent: stats.targetPercent,
      currentRate: stats.currentRate,
      attendTheoryNeeded: stats.attendTheoryNeeded,
      attendLabNeeded: stats.attendLabNeeded,
      theorySteps,
      labSteps,
      fasterWithLabRatio: '2.09×'
    };
  },

  /**
   * Generate prioritized actionable recommendations across all subjects
   */
  generateTacticalRecommendations(subjects = [], defaultTarget = 75) {
    if (!subjects.length) return [];

    const analyzed = subjects.map(sub => {
      const stats = this.compute(sub, defaultTarget);
      const deltas = this.calculateDeltas(sub, defaultTarget);
      return { subject: sub, stats, deltas };
    });

    // Sort by urgency: critical first, then at_risk, then caution, then safe
    analyzed.sort((a, b) => {
      const priorityOrder = { critical: 0, at_risk: 1, caution: 2, safe: 3 };
      const rankA = priorityOrder[a.stats.riskTier] ?? 4;
      const rankB = priorityOrder[b.stats.riskTier] ?? 4;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.stats.currentRate - b.stats.currentRate;
    });

    return analyzed.map(({ subject, stats, deltas }) => {
      let priority = 'SAFE';
      let tacticalHeadline = '';
      let actionDirective = '';

      if (stats.riskTier === 'critical') {
        priority = 'CRITICAL';
        tacticalHeadline = `Critical Detention Risk: ${stats.formattedRate}% (Goal: ${stats.targetPercent}%)`;
        actionDirective = stats.hasLab
          ? `Urgent: Attend next ${stats.attendTheoryNeeded} Theory or ${stats.attendLabNeeded} Lab sessions consecutively to avoid exam bar.`
          : `Urgent: Attend next ${stats.attendTheoryNeeded} consecutive classes without missing.`;
      } else if (stats.riskTier === 'at_risk') {
        priority = 'AT_RISK';
        tacticalHeadline = `Shortage Protocol Active: ${stats.formattedRate}%`;
        actionDirective = stats.hasLab
          ? `Deficit detected: Attend next ${stats.attendTheoryNeeded} Theory or ${stats.attendLabNeeded} Lab to cross 75%.`
          : `Deficit detected: Attend next ${stats.attendTheoryNeeded} consecutive classes to cross 75%.`;
      } else if (stats.riskTier === 'caution') {
        priority = 'CAUTION';
        tacticalHeadline = `Narrow Cushion (${stats.formattedRate}%)`;
        actionDirective = stats.hasLab
          ? `Caution: DO NOT miss Lab! 1 missed Lab drops you by ${Math.abs(deltas.deltaMissLab)}% directly into shortage.`
          : `Zero safe skips left. Attend next 2 classes to build a safe buffer.`;
      } else {
        priority = 'SAFE';
        tacticalHeadline = `Safe Surplus: ${stats.formattedRate}%`;
        actionDirective = stats.hasLab
          ? `Safe to miss up to ${stats.safeTheorySkips} Theory or ${stats.safeLabSkips} Lab. Buffer: ${(stats.bufferMinutes / 60).toFixed(1)} hrs.`
          : `Safe to miss up to ${stats.safeTheorySkips} classes. Buffer: ${(stats.bufferMinutes / 60).toFixed(1)} hrs.`;
      }

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code || '',
        currentRate: stats.currentRate,
        formattedRate: stats.formattedRate,
        status: stats.status,
        priority,
        tacticalHeadline,
        actionDirective,
        stats,
        deltas
      };
    });
  }
};
