import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import FocusPlanView from './components/unified/FocusPlanView';
import DailyCheckin from './components/checkin/DailyCheckin';
import RecoveryModal from './components/recovery/RecoveryModal';
// Note: RecoveryView and MomentumDashboard are parked/commented out for unified single-focus MVP
// import RecoveryView from './components/recovery/RecoveryView';
// import MomentumDashboard from './components/dashboard/MomentumDashboard';
import { generateRoadmap } from './services/aiEngine';
import { loadStoredState, saveStoredState } from './services/storageService';

export default function App() {
  const [roadmap, setRoadmap] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  
  const [stats, setStats] = useState({
    bounceBackScore: 100,
    focusMinutes: 50,
    buffersRemaining: 5,
    completedTasks: 3
  });

  // Load initial state or generate default roadmap
  useEffect(() => {
    const saved = loadStoredState();
    if (saved && saved.roadmap) {
      setRoadmap(saved.roadmap);
      setStats(saved.stats || stats);
      const firstTask = saved.roadmap.milestones?.[0]?.tasks?.find(t => t.type !== 'BUFFER') || saved.roadmap.milestones?.[0]?.tasks?.[0];
      setActiveTask(firstTask);
    } else {
      // Generate default
      handleGenerateRoadmap({
        goalText: "Master Dynamic Programming & Recursion",
        targetWeeks: 3,
        dailyMinutes: 45
      });
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (roadmap) {
      saveStoredState({ roadmap, stats });
    }
  }, [roadmap, stats]);

  const handleGenerateRoadmap = async ({ goalText, targetWeeks, dailyMinutes, fileData }) => {
    setIsGenerating(true);
    try {
      const result = await generateRoadmap({ goalText, targetWeeks, dailyMinutes, fileData });
      setRoadmap(result);
      const firstTask = result.milestones?.[0]?.tasks?.find(t => t.type !== 'BUFFER') || result.milestones?.[0]?.tasks?.[0];
      setActiveTask(firstTask);
      setStats((prev) => ({
        ...prev,
        buffersRemaining: result.bufferDaysCount || targetWeeks * 2
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTaskForFocus = (task) => {
    setActiveTask(task);
  };

  const handleLaunchFromCheckin = (task, energy) => {
    if (task) setActiveTask(task);
  };

  const handleCompleteSession = (minutesSpent) => {
    setStats((prev) => ({
      ...prev,
      focusMinutes: prev.focusMinutes + minutesSpent,
      completedTasks: prev.completedTasks + 1,
      bounceBackScore: 100
    }));
  };

  const handleAbsorbBuffer = () => {
    setStats((prev) => ({
      ...prev,
      buffersRemaining: Math.max(0, prev.buffersRemaining - 1),
      bounceBackScore: 100
    }));
  };

  const handleClaimWin = () => {
    setStats((prev) => ({
      ...prev,
      bounceBackScore: 100
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#0F3D23] flex flex-col font-sans antialiased selection:bg-emerald-100">
      
      {/* Top Dock Nav with Check-in Quick CTA & Buffer Status */}
      <Navbar
        onOpenCheckin={() => setIsCheckinOpen(true)}
        bufferCount={stats.buffersRemaining}
        activeGoalTitle={roadmap?.title}
      />

      {/* Main Unified Single-Focus Workspace (Focus + Plan Merged) */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-2 sm:py-4 pb-20">
        <FocusPlanView
          roadmap={roadmap}
          activeTask={activeTask}
          onSelectTaskForFocus={handleSelectTaskForFocus}
          onGenerateRoadmap={handleGenerateRoadmap}
          isGenerating={isGenerating}
          onCompleteSession={handleCompleteSession}
          onOpenCheckin={() => setIsCheckinOpen(true)}
          onAbsorbBuffer={handleAbsorbBuffer}
        />
      </main>

      {/* 1-Tap Nervous System & Somatic Check-in Modal */}
      <DailyCheckin
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onLaunchBodyDouble={handleLaunchFromCheckin}
        activeTask={activeTask}
      />

      {/* Zero-Shame Recovery Modal */}
      <RecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        bufferDaysRemaining={stats.buffersRemaining}
        totalBufferDays={roadmap?.bufferDaysCount || 6}
        onClaimWin={handleClaimWin}
      />

      {/* Quiet Single-Line Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 font-sans">
        Owlnudge · Designed for neurodivergent focus & zero-shame consistency
      </footer>

    </div>
  );
}
