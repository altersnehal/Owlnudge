import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import GoalPlanner from './components/planner/GoalPlanner';
import DailyCheckin from './components/checkin/DailyCheckin';
import BodyDoubler from './components/bodydouble/BodyDoubler';
import MomentumDashboard from './components/dashboard/MomentumDashboard';
import RecoveryModal from './components/recovery/RecoveryModal';
import RecoveryView from './components/recovery/RecoveryView';
import { generateRoadmap } from './services/aiEngine';
import { loadStoredState, saveStoredState } from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('bodydouble');
  const [roadmap, setRoadmap] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
      const firstTask = saved.roadmap.milestones?.[0]?.tasks?.[0];
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

  const handleGenerateRoadmap = async ({ goalText, targetWeeks, dailyMinutes }) => {
    setIsGenerating(true);
    try {
      const result = await generateRoadmap({ goalText, targetWeeks, dailyMinutes });
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
    setActiveTab('bodydouble');
  };

  const handleLaunchBodyDouble = (task) => {
    if (task) setActiveTask(task);
    setActiveTab('bodydouble');
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
      
      {/* Floating Dock Nav with Prominent Check-in Button */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bufferCount={stats.buffersRemaining}
      />

      {/* Main Single-Focus Content Workspace */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24">
        {activeTab === 'bodydouble' && (
          <BodyDoubler
            activeTask={activeTask}
            onCompleteSession={handleCompleteSession}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'planner' && (
          <GoalPlanner
            roadmap={roadmap}
            onGenerateRoadmap={handleGenerateRoadmap}
            onSelectTaskForFocus={handleSelectTaskForFocus}
            isGenerating={isGenerating}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'checkin' && (
          <DailyCheckin
            activeTask={activeTask}
            onLaunchBodyDouble={handleLaunchBodyDouble}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'recovery' && (
          <RecoveryView
            bufferDaysRemaining={stats.buffersRemaining}
            totalBufferDays={roadmap?.bufferDaysCount || 6}
            onClaimWin={handleClaimWin}
            onAbsorbBuffer={handleAbsorbBuffer}
            onResumeFocus={() => setActiveTab('bodydouble')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'dashboard' && (
          <MomentumDashboard
            roadmap={roadmap}
            stats={stats}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

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
        Owlnudge · Designed for neurodivergent focus
      </footer>

    </div>
  );
}
