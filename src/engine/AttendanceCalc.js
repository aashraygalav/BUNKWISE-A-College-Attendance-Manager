/**
 * BunkWise - Precision Contact Learning Hours Mathematical Engine
 * Strict calculation by contact minutes: 55m Theory + 115m Lab (2.0909x weight ratio)
 * Calibrated for UPES attendance regulations and criteria planning.
 */

export const THEORY_MINUTES = 55;
export const LAB_MINUTES = 115;
export const LAB_THEORY_RATIO = +(LAB_MINUTES / THEORY_MINUTES).toFixed(2); // 2.09

export const AttendanceCalc = {
  /**
   * Compute comprehensive attendance statistics and dual-horizon bunk allowances.
   * @param {Object} subject
   * @param {number} defaultTarget - e.g. 75
   * @returns {Object} Comprehensive calculation model
   */
  compute(subject, defaultTarget = 75) {
    const targetPercent = Number(subject.targetPercent || defaultTarget);
    const targetRatio = targetPercent / 100;
    const hasLab = Boolean(subject.hasLab);

    // Theory session counts
    const theoryTotal = Math.max(1, Number(subject.theoryTotal || subject.totalSemClasses || 42));
    const theoryAttended = Math.max(0, Number(subject.theoryAttended !== undefined ? subject.theoryAttended : (subject.attended || 0)));
    const theoryMissed = Math.max(0, Number(subject.theoryMissed !== undefined ? subject.theoryMissed : (subject.missed || 0)));
    const theoryConducted = theoryAttended + theoryMissed;
    const theoryRemaining = Math.max(0, theoryTotal - theoryConducted);

    // Lab session counts
    const labTotal = hasLab ? Math.max(0, Number(subject.labTotal || 0)) : 0;
    const labAttended = hasLab ? Math.max(0, Number(subject.labAttended || 0)) : 0;
    const labMissed = hasLab ? Math.max(0, Number(subject.labMissed || 0)) : 0;
    const labConducted = labAttended + labMissed;
    const labRemaining = Math.max(0, labTotal - labConducted);

    // Aggregated session totals
    const totalClassesSem = theoryTotal + labTotal;
    const totalClassesAttended = theoryAttended + labAttended;
    const totalClassesMissed = theoryMissed + labMissed;
    const totalClassesConducted = theoryConducted + labConducted;
    const totalClassesRemaining = theoryRemaining + labRemaining;

    // Contact minute calculations
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

    // Custom learning hours precision (supports up to 2 decimal places e.g. 40.32, 63.57)
    const customTotalHours = (subject.totalLearningHours !== null && subject.totalLearningHours !== undefined && subject.totalLearningHours !== '')
      ? parseFloat(subject.totalLearningHours)
      : NaN;

    const totalSemMinutes = (!isNaN(customTotalHours) && customTotalHours > 0)
      ? Math.round(customTotalHours * 60)
      : (theoryTotalMinutes + labTotalMinutes);

    const remainingMinutes = Math.max(0, totalSemMinutes - conductedMinutes);

    // Learning hours formatted to 2 decimal places
    const attendedHours = (attendedMinutes / 60).toFixed(2);
    const missedHours = (missedMinutes / 60).toFixed(2);
    const conductedHours = (conductedMinutes / 60).toFixed(2);
    const totalSemHours = (totalSemMinutes / 60).toFixed(2);

    // Current Attendance Percentage
    const currentRate = conductedMinutes === 0 ? 100 : (attendedMinutes / conductedMinutes) * 100;
    const formattedRate = conductedMinutes === 0 ? '100.0' : currentRate.toFixed(1);

    // Maximum achievable rate if student attends 100% of remaining time
    const maxPossibleRate = totalSemMinutes === 0 ? 100 : ((attendedMinutes + remainingMinutes) / totalSemMinutes) * 100;

    // 1. SEMESTER THEORETICAL BUNK ALLOWANCE (from Day 1 across full course)
    const maxMissedMinutesSem = Math.floor(totalSemMinutes * (1 - targetRatio));
    const semesterMaxTheorySkips = Math.floor(maxMissedMinutesSem / THEORY_MINUTES);
    const semesterMaxLabSkips = hasLab ? Math.floor(maxMissedMinutesSem / LAB_MINUTES) : 0;

    // Semester skips still available (taking past misses into account)
    const remainingAllowedMissedMinutes = Math.max(0, maxMissedMinutesSem - missedMinutes);
    const remainingSemesterTheorySkips = Math.floor(remainingAllowedMissedMinutes / THEORY_MINUTES);
    const remainingSemesterLabSkips = hasLab ? Math.floor(remainingAllowedMissedMinutes / LAB_MINUTES) : 0;

    // 2. CURRENT SAFE BUNK MARGIN (consecutive misses allowed today before dropping below target)
    let bufferMinutes = 0;
    let currentSafeTheorySkips = 0;
    let currentSafeLabSkips = 0;

    if (conductedMinutes > 0 && currentRate >= targetPercent) {
      // AttMin / (CondMin + X) >= targetRatio => X <= (AttMin / targetRatio) - CondMin
      bufferMinutes = Math.max(0, Math.floor(attendedMinutes / targetRatio - conductedMinutes));
      currentSafeTheorySkips = Math.min(theoryRemaining, Math.floor(bufferMinutes / THEORY_MINUTES));
      currentSafeLabSkips = hasLab ? Math.min(labRemaining, Math.floor(bufferMinutes / LAB_MINUTES)) : 0;
    }

    // 3. SHORTAGE RECOVERY PLANNING (for subjects below target criteria)
    let attendTheoryNeeded = 0;
    let attendLabNeeded = 0;
    let isImpossible = false;
    let postRecoveryRate = +formattedRate;
    let postRecoveryBufferMinutes = 0;
    let postRecoverySafeTheorySkips = 0;
    let postRecoverySafeLabSkips = 0;
    const mostEfficientOption = hasLab ? 'Lab' : 'Theory';

    if (currentRate < targetPercent && conductedMinutes > 0) {
      const neededMinutes = Math.ceil((targetRatio * conductedMinutes - attendedMinutes) / (1 - targetRatio));

      if (neededMinutes > remainingMinutes) {
        isImpossible = true;
      } else {
        attendTheoryNeeded = Math.ceil(neededMinutes / THEORY_MINUTES);
        attendLabNeeded = hasLab ? Math.ceil(neededMinutes / LAB_MINUTES) : 0;

        // Theory recovery projection
        const recThAttMin = attendedMinutes + attendTheoryNeeded * THEORY_MINUTES;
        const recThCondMin = conductedMinutes + attendTheoryNeeded * THEORY_MINUTES;
        const recThRate = (recThAttMin / recThCondMin) * 100;
        const recThBufMin = Math.max(0, Math.floor(recThAttMin / targetRatio - recThCondMin));

        // Lab recovery projection
        let recLbRate = recThRate;
        let recLbBufMin = recThBufMin;
        if (hasLab && attendLabNeeded > 0) {
          const recLbAttMin = attendedMinutes + attendLabNeeded * LAB_MINUTES;
          const recLbCondMin = conductedMinutes + attendLabNeeded * LAB_MINUTES;
          recLbRate = (recLbAttMin / recLbCondMin) * 100;
          recLbBufMin = Math.max(0, Math.floor(recLbAttMin / targetRatio - recLbCondMin));
        }

        // Return post-recovery figures (default to efficient option or theory)
        postRecoveryRate = (hasLab && attendLabNeeded > 0) ? +recLbRate.toFixed(1) : +recThRate.toFixed(1);
        postRecoveryBufferMinutes = (hasLab && attendLabNeeded > 0) ? recLbBufMin : recThBufMin;
        postRecoverySafeTheorySkips = Math.floor(postRecoveryBufferMinutes / THEORY_MINUTES);
        postRecoverySafeLabSkips = hasLab ? Math.floor(postRecoveryBufferMinutes / LAB_MINUTES) : 0;
      }
    }

    // 4. GROUNDED MATHEMATICAL RISK CLASSIFICATION & RECOMMENDATIONS
    let riskState = 'SAFE'; // 'SAFE' | 'CAUTION' | 'AT RISK' | 'CRITICAL'
    let status = 'safe'; // 'safe' | 'warning' | 'danger' (for backward-compatible CSS styling)
    let message = '';
    let subMessage = '';

    if (conductedMinutes === 0) {
      riskState = 'SAFE';
      status = 'safe';
      message = `No classes conducted yet. ${totalSemHours} learning hours ahead.`;
      subMessage = hasLab
        ? `Semester bunk allowance: up to ${semesterMaxTheorySkips} Theory or ${semesterMaxLabSkips} Lab classes.`
        : `Semester bunk allowance: up to ${semesterMaxTheorySkips} classes.`;
    } else if (currentRate >= targetPercent) {
      if (currentSafeTheorySkips > 0 || (hasLab && currentSafeLabSkips > 0)) {
        riskState = 'SAFE';
        status = 'safe';
        const bufHours = (bufferMinutes / 60).toFixed(2);
        if (hasLab) {
          message = `Safe margin: ${bufHours} hrs. Skip up to ${currentSafeTheorySkips} Theory or ${currentSafeLabSkips} Lab next.`;
          subMessage = `Semester allowance remaining: ${remainingSemesterTheorySkips} Theory or ${remainingSemesterLabSkips} Lab sessions.`;
        } else {
          message = `You can safely miss ${currentSafeTheorySkips} ${currentSafeTheorySkips === 1 ? 'class' : 'classes'} in a row.`;
          subMessage = `Safe margin: ${bufHours} hrs. Semester allowance remaining: ${remainingSemesterTheorySkips} classes.`;
        }
      } else {
        // Borderline condition: >= target, but missing 1 class drops below target
        riskState = 'CAUTION';
        status = 'warning';
        const rateIfMissTheory = ((attendedMinutes / (conductedMinutes + THEORY_MINUTES)) * 100).toFixed(1);
        const rateIfMissLab = hasLab ? ((attendedMinutes / (conductedMinutes + LAB_MINUTES)) * 100).toFixed(1) : null;

        if (hasLab) {
          message = `On the margin (${formattedRate}%). Missing 1 Theory drops to ${rateIfMissTheory}%; 1 Lab drops to ${rateIfMissLab}%.`;
          subMessage = `Zero safe skips left right now. Attend upcoming sessions to build your buffer.`;
        } else {
          message = `On the margin (${formattedRate}%). Missing the next class drops to ${rateIfMissTheory}%.`;
          subMessage = `Zero safe skips left right now. Attend the next class to build your buffer.`;
        }
      }
    } else {
      if (isImpossible) {
        riskState = 'CRITICAL';
        status = 'danger';
        message = `Target ${targetPercent}% is mathematically unreachable with remaining sessions.`;
        subMessage = `Maximum achievable attendance with 100% future presence is ${maxPossibleRate.toFixed(1)}%.`;
      } else {
        riskState = 'AT RISK';
        status = 'danger';
        const neededHours = ((Math.ceil((targetRatio * conductedMinutes - attendedMinutes) / (1 - targetRatio))) / 60).toFixed(2);

        if (hasLab) {
          message = `Below ${targetPercent}%. Attend next ${attendTheoryNeeded} Theory or ${attendLabNeeded} Lab sessions to recover.`;
          subMessage = `Labs recover attendance 2.09× faster. Post-recovery attendance will be ${postRecoveryRate}%.`;
        } else {
          message = `Below ${targetPercent}%. Attend next ${attendTheoryNeeded} consecutive classes to recover.`;
          subMessage = `Requires ${neededHours} hrs. Post-recovery attendance will be ${postRecoveryRate}%.`;
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
      riskState,
      riskLabel: riskState,
      message,
      subMessage,

      // Semester Theoretical Allowance
      semesterMaxTheorySkips,
      semesterMaxLabSkips,
      remainingSemesterTheorySkips,
      remainingSemesterLabSkips,

      // Current Safe Bunks
      currentSafeTheorySkips,
      currentSafeLabSkips,
      safeTheorySkips: currentSafeTheorySkips, // Backward-compatible alias
      safeLabSkips: currentSafeLabSkips,       // Backward-compatible alias

      // Recovery Planning Metrics
      attendTheoryNeeded,
      attendLabNeeded,
      mostEfficientOption,
      postRecoveryRate,
      postRecoveryBufferMinutes,
      postRecoverySafeTheorySkips,
      postRecoverySafeLabSkips,

      bufferMinutes,
      isImpossible,
      maxPossibleRate: maxPossibleRate.toFixed(1)
    };
  },

  /**
   * Project future attendance for a combined scenario of future attended/missed sessions.
   * Pure calculation function answering:
   * "What will my attendance be if I make this combination of choices?"
   * @param {Object} subject
   * @param {Object} simulation
   * @param {number} defaultTarget
   * @returns {Object}
   */
  projectCombinedScenario(
    subject,
    {
      attendTheory = 0,
      missTheory = 0,
      attendLab = 0,
      missLab = 0
    } = {},
    defaultTarget = 75
  ) {
    const targetPercent = Number(subject.targetPercent || defaultTarget);
    const targetRatio = targetPercent / 100;
    const hasLab = Boolean(subject.hasLab);

    const baseStats = this.compute(subject, defaultTarget);

    const safeAttendTh = Math.max(0, parseInt(attendTheory, 10) || 0);
    const safeMissTh = Math.max(0, parseInt(missTheory, 10) || 0);
    const safeAttendLb = hasLab ? Math.max(0, parseInt(attendLab, 10) || 0) : 0;
    const safeMissLb = hasLab ? Math.max(0, parseInt(missLab, 10) || 0) : 0;

    const deltaAttendedMin = (safeAttendTh * THEORY_MINUTES) + (safeAttendLb * LAB_MINUTES);
    const deltaMissedMin = (safeMissTh * THEORY_MINUTES) + (safeMissLb * LAB_MINUTES);
    const deltaConductedMin = deltaAttendedMin + deltaMissedMin;

    const newAttendedMin = baseStats.attendedMinutes + deltaAttendedMin;
    const newConductedMin = baseStats.conductedMinutes + deltaConductedMin;

    const projectedRate = newConductedMin === 0 ? 100 : (newAttendedMin / newConductedMin) * 100;
    const deltaRate = +(projectedRate - baseStats.currentRate).toFixed(2);
    const maintainsTarget = projectedRate >= targetPercent;

    let newBufferMin = 0;
    let newSafeTheorySkips = 0;
    let newSafeLabSkips = 0;
    let newAttendTheoryNeeded = 0;
    let newAttendLabNeeded = 0;

    if (projectedRate >= targetPercent && newConductedMin > 0) {
      newBufferMin = Math.max(0, Math.floor(newAttendedMin / targetRatio - newConductedMin));
      newSafeTheorySkips = Math.floor(newBufferMin / THEORY_MINUTES);
      newSafeLabSkips = hasLab ? Math.floor(newBufferMin / LAB_MINUTES) : 0;
    } else if (newConductedMin > 0) {
      const neededMin = Math.ceil((targetRatio * newConductedMin - newAttendedMin) / (1 - targetRatio));
      newAttendTheoryNeeded = Math.ceil(neededMin / THEORY_MINUTES);
      newAttendLabNeeded = hasLab ? Math.ceil(neededMin / LAB_MINUTES) : 0;
    }

    let projectedRiskState = 'SAFE';
    if (projectedRate < targetPercent) {
      projectedRiskState = 'AT RISK';
    } else if (newSafeTheorySkips === 0 && (!hasLab || newSafeLabSkips === 0)) {
      projectedRiskState = 'CAUTION';
    }

    return {
      currentRate: baseStats.currentRate,
      formattedCurrentRate: baseStats.formattedRate,
      projectedRate: +projectedRate.toFixed(1),
      formattedProjectedRate: projectedRate.toFixed(1),
      deltaRate,
      maintainsTarget,
      projectedRiskState,
      projectedSafeTheorySkips: newSafeTheorySkips,
      projectedSafeLabSkips: newSafeLabSkips,
      projectedAttendTheoryNeeded: newAttendTheoryNeeded,
      projectedAttendLabNeeded: newAttendLabNeeded,
      projectedBufferHours: +(newBufferMin / 60).toFixed(2),
      newAttendedMinutes: newAttendedMin,
      newConductedMinutes: newConductedMin
    };
  },

  /**
   * Pure projection for Theory session changes.
   */
  projectTheoryChange(subject, { attend = 0, miss = 0 } = {}, defaultTarget = 75) {
    return this.projectCombinedScenario(subject, { attendTheory: attend, missTheory: miss }, defaultTarget);
  },

  /**
   * Pure projection for Laboratory session changes.
   */
  projectLabChange(subject, { attend = 0, miss = 0 } = {}, defaultTarget = 75) {
    return this.projectCombinedScenario(subject, { attendLab: attend, missLab: miss }, defaultTarget);
  },

  /**
   * Calculate exact percentage deltas for attending vs missing next Theory or Lab session.
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
   * Simulate a what-if scenario by projecting future attendance actions.
   * Backward-compatible with ScenarioSimulatorModal.
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
   * Calculate step-by-step recovery milestone roadmap for shortage recovery.
   */
  calculateRecoveryRoadmap(subject, defaultTarget = 75) {
    const stats = this.compute(subject, defaultTarget);
    if (stats.currentRate >= stats.targetPercent) {
      return { inShortage: false, steps: [] };
    }

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
      postRecoveryRate: stats.postRecoveryRate,
      postRecoveryBufferMinutes: stats.postRecoveryBufferMinutes,
      theorySteps,
      labSteps,
      fasterWithLabRatio: '2.09×'
    };
  },

  /**
   * Generate prioritized actionable recommendations across all subjects.
   */
  generateTacticalRecommendations(subjects = [], defaultTarget = 75) {
    if (!subjects.length) return [];

    const analyzed = subjects.map(sub => {
      const stats = this.compute(sub, defaultTarget);
      const deltas = this.calculateDeltas(sub, defaultTarget);
      return { subject: sub, stats, deltas };
    });

    // Sort by urgency: CRITICAL first, then AT RISK, CAUTION, SAFE
    analyzed.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, 'AT RISK': 1, CAUTION: 2, SAFE: 3 };
      const pA = priorityOrder[a.stats.riskState] ?? 2;
      const pB = priorityOrder[b.stats.riskState] ?? 2;
      if (pA !== pB) return pA - pB;
      return a.stats.currentRate - b.stats.currentRate;
    });

    return analyzed.map(({ subject, stats, deltas }) => {
      let priority = 'LOW';
      let tacticalHeadline = '';
      let actionDirective = '';

      if (stats.riskState === 'CRITICAL') {
        priority = 'CRITICAL';
        tacticalHeadline = `Unrecoverable Shortage: ${stats.formattedRate}%`;
        actionDirective = `Target ${stats.targetPercent}% unreachable. Max achievable is ${stats.maxPossibleRate}%.`;
      } else if (stats.riskState === 'AT RISK') {
        priority = 'HIGH_ALERT';
        tacticalHeadline = `Recovery Protocol: ${stats.formattedRate}% (Goal: ${stats.targetPercent}%)`;
        actionDirective = stats.hasLab
          ? `Attend next ${stats.attendTheoryNeeded} Theory or ${stats.attendLabNeeded} Lab sessions to reach ${stats.postRecoveryRate}%.`
          : `Attend next ${stats.attendTheoryNeeded} consecutive classes to reach ${stats.postRecoveryRate}%.`;
      } else if (stats.riskState === 'CAUTION') {
        priority = 'ELEVATED';
        tacticalHeadline = `Margin Alert: ${stats.formattedRate}%`;
        actionDirective = stats.hasLab
          ? `Zero safe skips left. Missing 1 Lab drops to ${((stats.attendedMinutes / (stats.conductedMinutes + LAB_MINUTES)) * 100).toFixed(1)}%.`
          : `Zero safe skips left. Attend next class to rebuild buffer.`;
      } else {
        priority = 'OPTIMAL';
        tacticalHeadline = `Safe Margin: ${stats.formattedRate}%`;
        actionDirective = stats.hasLab
          ? `Safe to miss ${stats.currentSafeTheorySkips} Theory or ${stats.currentSafeLabSkips} Lab next. Semester allowance: ${stats.remainingSemesterTheorySkips} Theory.`
          : `Safe to miss ${stats.currentSafeTheorySkips} classes in a row. Semester allowance: ${stats.remainingSemesterTheorySkips} classes.`;
      }

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code || '',
        currentRate: stats.currentRate,
        formattedRate: stats.formattedRate,
        status: stats.status,
        riskState: stats.riskState,
        priority,
        tacticalHeadline,
        actionDirective,
        stats,
        deltas
      };
    });
  }
};
