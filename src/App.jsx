import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Philosophy from './components/Philosophy';
import Protocol from './components/Protocol';
import Membership from './components/Membership';
import Footer from './components/Footer';
import AttendanceDashboard from './components/dashboard/AttendanceDashboard';
import { AttendanceStore } from './engine/AttendanceStore';
import { SoundFX } from './engine/SoundFX';
import { X, ArrowRight, Activity } from 'lucide-react';

export default function App() {
  const [store, setStore] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState({ defaultTarget: 75 });
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);

  useEffect(() => {
    SoundFX.init();
    const inst = new AttendanceStore((updatedSubjects) => {
      setSubjects([...updatedSubjects]);
    });
    setStore(inst);
    setSubjects(inst.subjects);
    setSettings(inst.settings);
  }, []);

  const openDashboard = () => {
    SoundFX.playSuccess();
    setIsDashboardModalOpen(true);
  };

  const closeDashboard = () => {
    SoundFX.playTap();
    setIsDashboardModalOpen(false);
  };

  return (
    <div className="relative bg-void text-ghost min-h-screen overflow-x-hidden selection:bg-plasma selection:text-white">
      {/* Dynamic Background Ambient Light Orbs */}
      <div className="fixed top-[-10vw] left-[15vw] w-[45vw] h-[45vw] rounded-full bg-plasma/10 blur-[120px] pointer-events-none -z-10 animate-pulse-beacon" />
      <div className="fixed bottom-0 right-[-10vw] w-[50vw] h-[50vw] rounded-full bg-lime/5 blur-[140px] pointer-events-none -z-10" />

      {/* Floating Island Navbar */}
      <Navbar onOpenDashboard={openDashboard} />

      <main className="relative z-10 flex flex-col">
        {/* Section B: Hero Opening Shot */}
        <Hero onOpenDashboard={openDashboard} />

        {/* Live Attendance Cockpit Quick Jump Banner */}
        <section className="px-6 sm:px-12 md:px-20 max-w-7xl mx-auto -mt-10 mb-8 z-20 w-full">
          <div className="glass-panel rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-plasma/30 shadow-[0_15px_40px_rgba(123,97,255,0.2)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-plasma/20 border border-plasma/40 flex items-center justify-center text-plasma-light flex-shrink-0">
                <Activity size={24} className="text-lime animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-white">
                  Live Attendance Ledger ({subjects.length} Subjects Active)
                </h3>
                <p className="font-sans text-xs text-ghost/60 font-light">
                  Direct contact-hour tracking running locally in your browser.
                </p>
              </div>
            </div>

            <button
              onClick={openDashboard}
              className="btn-magnetic px-6 py-3 rounded-full bg-plasma text-white font-sans text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(123,97,255,0.4)] whitespace-nowrap"
            >
              <span className="btn-sliding-bg bg-lime"></span>
              <span className="btn-content text-white flex items-center gap-2">
                <span>Open Attendance Cockpit</span>
                <ArrowRight size={14} className="text-lime" />
              </span>
            </button>
          </div>
        </section>

        {/* Section C: Features (Interactive Artifacts) */}
        <Features />

        {/* Section D: Philosophy Manifesto */}
        <Philosophy />

        {/* Section E: Protocol Sticky Stacking Archive */}
        <Protocol />

        {/* Embedded Full Dashboard Section */}
        <section id="dashboard-section" className="py-16 px-4 sm:px-8 border-t border-white/5 bg-void">
          {store && (
            <AttendanceDashboard
              store={store}
              subjects={subjects}
              settings={settings}
            />
          )}
        </section>

        {/* Section F: Membership & Tiers */}
        <Membership onOpenDashboard={openDashboard} />
      </main>

      {/* Section G: Footer */}
      <Footer onOpenDashboard={openDashboard} />

      {/* Fullscreen Interactive Dashboard Modal */}
      {isDashboardModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-void/95 backdrop-blur-2xl animate-fadeIn p-2 sm:p-6">
          <div className="relative min-h-screen">
            {store && (
              <AttendanceDashboard
                store={store}
                subjects={subjects}
                settings={settings}
                isModalView={true}
                onClose={closeDashboard}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
