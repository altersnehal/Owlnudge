import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import FocusPlanView from './components/unified/FocusPlanView';
import DailyCheckin from './components/checkin/DailyCheckin';
import RecoveryModal from './components/recovery/RecoveryModal';
import PresentationDeck from './components/deck/PresentationDeck';
import { Agentation } from 'agentation';
import { generateRoadmap } from './services/aiEngine';
import { loadStoredState, saveStoredState } from './services/storageService';
import { audioService } from './services/audioService';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [roadmap, setRoadmap] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  
  const [stats, setStats] = useState({
    bounceBackScore: 100,
    focusMinutes: 50,
    buffersRemaining: 5,
    completedTasks: 3
  });

  // Track path / routing
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isDeck = currentPath.startsWith('/deck') || window.location.hash === '#/deck' || window.location.search.includes('deck');

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

  const toggleGlobalAudio = () => {
    const next = !isAudioOn;
    setIsAudioOn(next);
    audioService.setTickingEnabled(next);
    if (!next) {
      audioService.stop();
    }
  };

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

  if (isDeck) {
    return <PresentationDeck />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#0F3D23] flex flex-col font-sans antialiased selection:bg-emerald-100">
      
      {/* Top Floating Dock Bar */}
      <Navbar
        onOpenCheckin={() => setIsCheckinOpen(true)}
        bufferCount={stats.buffersRemaining}
        isAudioOn={isAudioOn}
        onToggleAudio={toggleGlobalAudio}
      />

      {/* Main Unified Single-Focus Workspace */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-2 sm:py-3 pb-20">
        <FocusPlanView
          roadmap={roadmap}
          activeTask={activeTask}
          onSelectTaskForFocus={handleSelectTaskForFocus}
          onGenerateRoadmap={handleGenerateRoadmap}
          isGenerating={isGenerating}
          onCompleteSession={handleCompleteSession}
          onOpenCheckin={() => setIsCheckinOpen(true)}
          onAbsorbBuffer={handleAbsorbBuffer}
          isAudioMuted={!isAudioOn}
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

      {/* Agentation Visual Feedback Tool */}
      <Agentation />

      {/* Quiet Single-Line Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 font-sans flex items-center justify-center gap-3">
        <span>Owlnudge · Designed for neurodivergent focus & zero-shame consistency</span>
        <span>·</span>
        <a 
          href="/deck" 
          className="text-emerald-700 hover:text-emerald-900 font-medium underline flex items-center gap-1"
        >
          <span>Deck 📽️</span>
        </a>
      </footer>

    </div>
  );
}
