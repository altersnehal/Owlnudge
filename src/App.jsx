import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import GoalPlanner from './components/planner/GoalPlanner';
import DailyCheckin from './components/checkin/DailyCheckin';
import BodyDoubler from './components/bodydouble/BodyDoubler';
import MomentumDashboard from './components/dashboard/MomentumDashboard';
import RecoveryModal from './components/recovery/RecoveryModal';
import { generateRoadmap } from './services/aiEngine';
import { loadStoredState, saveStoredState } from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner');
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
        goalText: "Master Dynamic Programming & System Design for Tech Interviews",
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
      const firstTask = result.milestones?.[0]?.tasks?.[0];
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
      focusMinutes: prev.focusMinutes + minutesSpent
    }));
    setActiveTab('dashboard');
  };

  const handleSimulateMissedDay = () => {
    setShowRecoveryModal(true);
  };

  const handleClaimWin = () => {
    setStats((prev) => ({
      ...prev,
      buffersRemaining: Math.max(0, prev.buffersRemaining - 1),
      bounceBackScore: 100
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] text-slate-900 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bufferCount={stats.buffersRemaining}
        onSimulateMissedDay={handleSimulateMissedDay}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'planner' && (
          <GoalPlanner
            roadmap={roadmap}
            onGenerateRoadmap={handleGenerateRoadmap}
            onSelectTaskForFocus={handleSelectTaskForFocus}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'checkin' && (
          <DailyCheckin
            activeTask={activeTask}
            onLaunchBodyDouble={handleLaunchBodyDouble}
          />
        )}

        {activeTab === 'bodydouble' && (
          <BodyDoubler
            activeTask={activeTask}
            onCompleteSession={handleCompleteSession}
          />
        )}

        {activeTab === 'dashboard' && (
          <MomentumDashboard
            roadmap={roadmap}
            stats={stats}
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

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white/60 py-6 text-center text-xs text-forest-800/80 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-forest-950">Owlnudge</span>
            <span>· ADHD Accountability & Recovery Mentor</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-display font-medium text-forest-700">
            <a href="/storyboard.html" target="_blank" className="hover:text-forest-950 underline">View Storyboard</a>
            <a href="/visual-direction.html" target="_blank" className="hover:text-forest-950 underline">Visual Direction Lab</a>
            <a href="/plan.html" target="_blank" className="hover:text-forest-950 underline">Architecture Plan</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
