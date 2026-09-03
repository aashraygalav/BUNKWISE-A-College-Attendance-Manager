# BunkWise — Smart Attendance & Bunk Planner 🎓⚡

A modern, student-focused attendance and learning-hours management web application built to track the **75% college attendance criteria** based on **Contact Learning Minutes**.

BunkWise helps college students understand their attendance standing, accounts for the heavy impact of laboratory sessions versus theory classes, and calculates precisely how many classes they can safely skip—or how many consecutive sessions they must attend to recover.

---

## ⚡ Core Concept: The Learning Hours Model

In modern university curricula, classes carry different contact durations and academic weight:
- **Theory Class**: **55 minutes** (0.92 hrs)
- **Lab Session**: **115 minutes** (1.92 hrs)
- **Standard Weekly Format**: **1 Lab + 3 Theory classes per week** (e.g., 14 weeks $\implies$ 14 Labs + 42 Theory classes).

### ⚖️ The 2.09× Lab Weight Ratio
$$\frac{115\text{ minutes}}{55\text{ minutes}} \approx 2.0909$$

Because a single lab session spans **115 minutes**, missing one lab inflicts more than **double the attendance loss** of missing a theory class. Conversely, attending a lab recovers attendance twice as fast. Simple class-count formulas fail on courses with labs—BunkWise calculates attendance strictly using **total contact learning minutes**.

---

## 📐 Mathematical Methodology

### 1. Attended & Conducted Learning Minutes
$$\text{AttendedMinutes} = (A_{\text{theory}} \times 55) + (A_{\text{lab}} \times 115)$$
$$\text{MissedMinutes} = (M_{\text{theory}} \times 55) + (M_{\text{lab}} \times 115)$$
$$\text{ConductedMinutes} = \text{AttendedMinutes} + \text{MissedMinutes}$$

### 2. Contact Hours Attendance Percentage
$$\text{Attendance\%} = \begin{cases} 100.0\% & \text{if ConductedMinutes} = 0 \\ \left(\frac{\text{AttendedMinutes}}{\text{ConductedMinutes}}\right) \times 100\% & \text{if ConductedMinutes} > 0 \end{cases}$$

### 3. Safe Bunk Buffer (When Attendance $\ge 75\%$)
BunkWise determines the exact minute buffer $B$ before dropping below target ratio ($T = 0.75$):
$$B = \left\lfloor \frac{\text{AttendedMinutes}}{0.75} - \text{ConductedMinutes} \right\rfloor$$
- **Safe Next Theory Skips (55m each):** $\min\left(\text{Remaining}_{\text{theory}},\, \lfloor B / 55 \rfloor\right)$
- **Safe Next Lab Skips (115m each):** $\min\left(\text{Remaining}_{\text{lab}},\, \lfloor B / 115 \rfloor\right)$
- **Total Semester Bunk Allowance:** $\lfloor (\text{MaxMissedMinutes}_{\text{sem}} - \text{MissedMinutes}) / 55 \rfloor$

### 4. Catch-Up & Recovery Requirement (When Attendance $< 75\%$)
To recover to $75\%$ attendance, the required consecutive minutes $Y$ are:
$$\frac{\text{AttendedMinutes} + Y}{\text{ConductedMinutes} + Y} \ge 0.75 \implies Y = \lceil 3 \times \text{ConductedMinutes} - 4 \times \text{AttendedMinutes} \rceil$$
- **Consecutive Theory Classes Needed:** $\lceil Y / 55 \rceil$
- **Consecutive Lab Sessions Needed:** $\lceil Y / 115 \rceil$
- **Shortage Alert:** If $Y > \text{RemainingMinutes}$, BunkWise alerts the student that the 75% target is mathematically unreachable and displays their maximum achievable percentage.

---

## ✨ Application Features

- **Theory & Lab Tracking**: Independent counters and inputs for 55m theory classes and 115m lab sessions.
- **Total Learning Hours**: Real-time display of attended hours, missed hours, conducted hours, and semester planned hours.
- **Dual Safe-to-Bunk Guidance**: Instant advice on how many Theory classes **OR** Lab sessions can be safely skipped right now.
- **Interactive Daily Logging**:
  - `+ Attended` and `+ Missed` buttons for theory and lab.
  - One-click `Undo` button to revert accidental taps.
  - `Today's Log` modal for fast multi-subject logging in a single popup.
- **Search, Filters & Sorting**:
  - Filter by `All`, `Safe to Bunk (≥75%)`, `Need Attendance (<75%)`, or `Has Labs`.
  - Sort by `Needs Attention First`, `Lowest %`, `Highest %`, or `Alphabetical`.
  - Instant search across subject names and course codes.
- **Glassmorphism Aesthetic & Dynamic Background**:
  - Translucent frosted cards, responsive SVG dials, and accessible status colors.
  - UPES Bidholi Campus backdrop with subtle motion.
  - Lando Norris-inspired kinetic canvas particles and cursor tracking.
  - Audio feedback via Web Audio API (toggleable in header).
- **Privacy-First & Local Storage**:
  - All data is stored directly in browser `localStorage`. No accounts, no servers, no ads, no trackers.
  - Full JSON backup export and import for transferring data between devices.

---

## 🔒 Privacy & Data Storage

BunkWise runs **100% on your device**:
- No attendance records or schedules are transmitted across the network.
- Your data stays inside your browser's `localStorage` (`bunkwise_attendance_v3`).
- Clearing browser cache or site data will reset your tracker; use the **Export Data** feature in Settings to keep backups.

---

## 📁 Project Structure

```
.
├── index.html          # Semantic HTML5 layout and modal dialogs
├── style.css           # Glassmorphic design system and responsive styles
├── app.js              # Calculation engine, state store, and UI controller
├── favicon.svg         # Application icon
├── upes_bidholi_bg.jpg # Campus background visual asset
├── server.js           # Lightweight local development server (Node.js built-in)
├── package.json        # Project metadata and start script
└── README.md           # Documentation and mathematical specification
```

---

## 🚀 Local Development Setup

BunkWise has **zero third-party dependencies**. You can run it with any static file server:

### Option 1: Using the Included Node.js Server
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Using Python
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Direct File Opening
Simply double-click or open `index.html` directly in any modern web browser (Chrome, Firefox, Safari, Edge, Brave).

---

## 🌐 Free Public Deployment

Because BunkWise is a pure static web application, it can be deployed on any free static hosting platform:

### Deploying to Cloudflare Pages (Recommended)
1. Push your repository to GitHub: `https://github.com/aashraygalav/BUNKWISE-A-College-Attendance-Manager`
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select this repository.
4. Set build settings:
   - **Framework preset**: None
   - **Build command**: *(leave blank)*
   - **Build output directory**: `/` *(root)*
5. Click **Save and Deploy**. Cloudflare will provide a free `*.pages.dev` URL with global CDN caching and automatic HTTPS.

### Deploying to GitHub Pages
1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder, then click **Save**.
5. Your site will be live at `https://aashraygalav.github.io/BUNKWISE-A-College-Attendance-Manager/`.

---

## 🗺️ Roadmap

- [ ] Multi-semester archive and grade-credit calculator.
- [ ] Timetable schedule planner with automatic daily reminders.
- [ ] Offline Progressive Web App (PWA) manifest and service worker.
- [ ] Printable PDF attendance and bunk schedule report.

---

## 📄 License

MIT License — free for students, developers, and educators.
