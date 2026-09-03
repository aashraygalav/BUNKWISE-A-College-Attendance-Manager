# BunkWise — 75% Attendance & Learning Hours Tracker 🎓

A minimal, modern, and high-precision college attendance management website built to track the **75% attendance criteria** based on **Total Learning Hours / Contact Minutes**.

---

## ⚡ The Learning Hours Algorithm

In college, classes are not all created equal:
- **Theory Class**: **55 minutes** (0.92 hrs)
- **Lab Session**: **115 minutes** (1.92 hrs) — counts as **2.09×** the weight of a theory class!
- **Weekly Schedule Format**: **1 Lab + 3 Theory classes per week** (e.g. 14 weeks $\implies$ 14 Labs + 42 Theory classes).

Because Labs take up more of the learning hours than Theory classes, missing a single Lab causes more than **double the attendance loss** compared to missing a Theory class!

### 📐 Mathematical Formulation

1. **Total Attended Learning Minutes**:
   $$\text{AttendedMinutes} = (A_{\text{theory}} \times 55) + (A_{\text{lab}} \times 115)$$

2. **Total Missed Learning Minutes**:
   $$\text{MissedMinutes} = (M_{\text{theory}} \times 55) + (M_{\text{lab}} \times 115)$$

3. **Total Conducted Learning Minutes**:
   $$\text{ConductedMinutes} = \text{AttendedMinutes} + \text{MissedMinutes}$$

4. **Total Attendance Percentage (Hours-Based)**:
   $$\text{Attendance\%} = \frac{\text{AttendedMinutes}}{\text{ConductedMinutes}} \times 100\%$$

5. **Safe Bunk Buffer (in minutes)**:
   $$\text{BufferMinutes} = \max\left(0, \left\lfloor \frac{\text{AttendedMinutes}}{0.75} - \text{ConductedMinutes} \right\rfloor\right)$$
   - **Safe Theory Skips (55m each)**: $\lfloor \text{BufferMinutes} / 55 \rfloor$
   - **Safe Lab Skips (115m each)**: $\lfloor \text{BufferMinutes} / 115 \rfloor$

6. **Catch-Up Requirement (if $< 75\%$)**:
   $$\text{NeededMinutes} = \lceil 3 \times \text{ConductedMinutes} - 4 \times \text{AttendedMinutes} \rceil$$
   - Consecutive **Theory classes** needed: $\lceil \text{NeededMinutes} / 55 \rceil$
   - Consecutive **Lab sessions** needed: $\lceil \text{NeededMinutes} / 115 \rceil$ *(Labs recover attendance >2× faster!)*

---

## ✨ Features

- **Theory + Lab Breakdown**:
  - Independent counters for Theory classes (55m) and Lab sessions (115m).
  - Quick semester format generator (e.g. 14 weeks $\times$ 1 Lab + 3 Theory $\implies$ 14 Labs + 42 Theory).
  - Total learning hours display (attended, missed, conducted, and planned).
- **Dual Safe-to-Bunk Guidance**:
  - Recommends both how many Theory classes **OR** Lab sessions you can safely miss right now.
- **Interactive Daily Logging**:
  - Separate `+ Attended` and `+ Missed` buttons for Theory and Lab.
  - `Undo` button to revert mistakes.
  - `Today's Log` modal for fast multi-subject logging.
- **Aesthetics & Performance**:
  - Sleek Dark / Light mode with glassmorphic cards and SVG progress dials.
  - LocalStorage persistence with JSON Export and Import.
  - Pre-loaded with realistic college demo courses.

---

## 🚀 Running the Web App

1. Open [`index.html`](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/attendance-tracker/index.html) directly in any browser.
2. Or use the local web server:
   ```bash
   python -m http.server 3000
   ```
   Navigate to `http://localhost:3000`.
