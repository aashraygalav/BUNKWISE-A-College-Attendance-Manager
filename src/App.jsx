import React, { useState, useEffect } from 'react';
import AttendanceDashboard from './components/dashboard/AttendanceDashboard';
import AboutMethodologyModal from './components/AboutMethodologyModal';
import { AttendanceStore } from './engine/AttendanceStore';
import { SoundFX } from './engine/SoundFX';
import { Volume2, VolumeX, Compass, ShieldCheck } from 'lucide-react';

export default function App() {
  const [store, setStore] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState({ defaultTarget: 75 });
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  useEffect(() => {
    SoundFX.init();
    const inst = new AttendanceStore((updatedSubjects) => {
      setSubjects([...updatedSubjects]);
    });
    setStore(inst);
    setSubjects(inst.subjects);
    setSettings(inst.settings);
  }, []);

  const toggleSound = () => {
    const nextState = SoundFX.toggleSound();
    setIsAudioEnabled(nextState);
  };

  return (
    <div className="relative bg-void text-ghost min-h-screen selection:bg-plasma selection:text-white flex flex-col justify-between">
      {/* Dynamic Background Ambient Glow (Subtle & Restrained) */}
      <div className="fixed top-[-10vw] left-[15vw] w-[45vw] h-[45vw] rounded-full bg-plasma/5 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-10vw] w-[50vw] h-[50vw] rounded-full bg-lime/5 blur-[160px] pointer-events-none -z-10" />

      {/* Utility-First Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-void/80 backdrop-blur-xl border-b border-white/5 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-plasma to-lime flex items-center justify-center font-sans font-extrabold text-xs text-void shadow-[0_0_15px_rgba(123,97,255,0.4)] group-hover:scale-105 transition-transform">
                BW
              </div>
              <span className="font-sans font-extrabold text-lg text-white tracking-tight">
                Bunk<span className="text-plasma-light">Wise</span>
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-plasma/20 border border-plasma/40 text-plasma-light">
                75%
              </span>
            </a>

            {/* Campus Telemetry Tag */}
            <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono text-ghost/60">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse shadow-[0_0_6px_#E4F900]" />
              <span>UPES BIDHOLI // 2.09× LAB WEIGHT ACTIVE</span>
            </div>
          </div>

          {/* Utility Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Academic Methodology Modal Trigger */}
            <button
              onClick={() => {
                SoundFX.playTap();
                setIsMethodologyOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-ghost/80 hover:text-white font-sans text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="View UPES Contact Hours & 2.09x Calculation Rules"
            >
              <Compass size={14} className="text-plasma-light" />
              <span className="hidden sm:inline">Methodology</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full border transition-colors ${
                isAudioEnabled
                  ? 'bg-plasma/20 border-plasma/40 text-plasma-light'
                  : 'bg-white/5 border-white/10 text-ghost/40 hover:text-ghost'
              }`}
              title={isAudioEnabled ? 'Mute Interface Sound' : 'Enable Interface Sound'}
            >
              {isAudioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Primary Experience: Attendance Cockpit */}
      <main className="flex-1 w-full">
        {store ? (
          <AttendanceDashboard
            store={store}
            subjects={subjects}
            settings={settings}
          />
        ) : (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 rounded-full border-2 border-plasma border-t-transparent animate-spin mb-3" />
            <p className="font-mono text-xs text-ghost/40">Initializing Contact Hours Engine...</p>
          </div>
        )}
      </main>

      {/* Restrained Terminal Utility Footer */}
      <footer className="w-full border-t border-white/5 bg-void-surface py-6 px-4 sm:px-8 mt-12 text-xs font-mono text-ghost/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse shadow-[0_0_8px_#E4F900]" />
            <span>BunkWise v2.2.0 • UPES Academic Contact Hours Engine</span>
          </div>

          <div className="flex items-center gap-4 text-ghost/60">
            <button
              onClick={() => {
                SoundFX.playTap();
                setIsMethodologyOpen(true);
              }}
              className="hover:text-white transition-colors"
            >
              Calculation Rules
            </button>
            <span>•</span>
            <span className="text-ghost/40">LocalStorage: bunkwise_attendance_v3</span>
            <span>•</span>
            <a
              href="https://github.com/aashraygalav/BUNKWISE-A-College-Attendance-Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Academic Methodology Modal */}
      <AboutMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
