import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';
import AttendanceDashboard from './components/dashboard/AttendanceDashboard';
import { AttendanceStore } from './engine/AttendanceStore';
import { SoundFX } from './engine/SoundFX';

import AmbientDotField from './components/dashboard/AmbientDotField';

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
    <div className="relative min-h-screen text-ghost overflow-x-hidden selection:bg-plasma selection:text-white">
      {/* Global Ambient Interactive Dot Field & Charcoal Environmental Layer */}
      <AmbientDotField isGlobal={true} zIndex={isDashboardModalOpen ? 9990 : 0} />

      {/* Floating Island Navbar */}
      <Navbar onOpenDashboard={openDashboard} />

      <main className="relative z-10 flex flex-col">
        {/* Section 1: Hero Opening Shot */}
        <Hero onOpenDashboard={openDashboard} />

        {/* Section 2: Attendance Cockpit (The Functional Core Product) */}
        <section id="dashboard-section" className="py-16 px-4 sm:px-8 border-t border-white/5 bg-transparent">
          {store && (
            <AttendanceDashboard
              store={store}
              subjects={subjects}
              settings={settings}
            />
          )}
        </section>

        {/* Section 3: Manifesto (The Closing Core Philosophy) */}
        <Philosophy />
      </main>

      {/* Section G: Footer */}
      <Footer onOpenDashboard={openDashboard} />

      {/* Fullscreen Interactive Dashboard Modal */}
      {isDashboardModalOpen && (
        <>
          {/* Opaque Cockpit Backdrop - completely obscures the underlying main website */}
          <div className="fixed inset-0 z-[9985] bg-[#08090C]" aria-hidden="true" />

          {/* Cockpit Interactive Content Layer */}
          <div className="fixed inset-0 z-[9999] overflow-y-auto p-2 sm:p-6 animate-fadeIn">
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
        </>
      )}
    </div>
  );
}
