import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  LifeBuoy, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Shield, 
  Search, 
  Link2, 
  BookOpen, 
  Lightbulb, 
  Check, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

export default function FocusPlanView({ 
  roadmap, 
  activeTask, 
  onSelectTaskForFocus, 
  onGenerateRoadmap, 
  isGenerating,
  onCompleteSession,
  onOpenCheckin,
  onAbsorbBuffer
}) {
  // Focus Room State
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Planner State
  const [goalInput, setGoalInput] = useState(roadmap?.title || "Master Dynamic Programming & Recursion");
  const [targetWeeks, setTargetWeeks] = useState(3);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [openMilestoneId, setOpenMilestoneId] = useState(roadmap?.milestones?.[0]?.id || 'm1');

  const focusRoomRef = useRef(null);

  // Sync timer with active task or preset selection
  useEffect(() => {
    setActiveStepIndex(0);
    setIsSessionCompleted(false);
  }, [activeTask?.id]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleCompleteSession(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleSelectBurstDuration = (minutes) => {
    const totalSecs = minutes * 60;
    setTimerDuration(totalSecs);
    setSecondsLeft(totalSecs);
    setIsRunning(false);
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      audioService.stop();
      setIsAudioPlaying(false);
    } else {
      audioService.start('brown', 0.18);
      setIsAudioPlaying(true);
    }
  };

  const handleStepComplete = (index) => {
    if (index === activeStepIndex) {
      const nextIndex = index + 1;
      setActiveStepIndex(nextIndex);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#16A34A', '#FEF08A']
      });
      if (nextIndex >= (activeTask?.microSteps?.length || 3)) {
        handleCompleteSession(false);
      }
    }
  };

  const handleCompleteSession = (timerExpired = false) => {
    setIsRunning(false);
    audioService.stop();
    setIsAudioPlaying(false);
    setIsSessionCompleted(true);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#16A34A', '#34D399', '#FEF08A']
    });

    const elapsedMinutes = Math.max(1, Math.round((timerDuration - secondsLeft) / 60));
    onCompleteSession?.(timerExpired ? Math.round(timerDuration / 60) : elapsedMinutes);
  };

  const handleResetSession = () => {
    setIsSessionCompleted(false);
    setSecondsLeft(timerDuration);
    setActiveStepIndex(0);
    setIsRunning(false);
  };

  const handleSelectTaskAndScroll = (task) => {
    onSelectTaskForFocus(task);
    handleResetSession();
    focusRoomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;
    onGenerateRoadmap({ goalText: goalInput.trim(), targetWeeks, dailyMinutes });
  };

  const handlePresetSelect = (presetText) => {
    setGoalInput(presetText);
    onGenerateRoadmap({ goalText: presetText, targetWeeks, dailyMinutes });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const microSteps = activeTask?.microSteps || [
    'Open problem description and read Example 1 only (30 secs)',
    'Write down base cases n=1 and n=2 on a napkin (2 mins)',
    'Write loop recurrence: dp[i] = dp[i-1] + dp[i-2] (10 mins)'
  ];

  const milestones = roadmap?.milestones || [];

  return (
    <div className="space-y-12 max-w-xl mx-auto">
      
      {/* ========================================================================= */}
      {/* SECTION 1: THE BODY DOUBLER FOCUS ROOM (Tactile ADHD Activation Engine)  */}
      {/* ========================================================================= */}
      <section ref={focusRoomRef} className="space-y-8 text-center pt-2">
        
        {/* Companion Mascot & Ambient Dialogue */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-emerald-50/80 p-2.5 flex items-center justify-center transition-all duration-300 ${isRunning ? 'animate-[breath_5s_ease-in-out_infinite] scale-105' : ''}`}>
            <img src="/assets/mascot.png" alt="Owlnudge Companion" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs text-forest-800/80 font-sans max-w-xs transition-opacity duration-200">
            {isSessionCompleted
              ? "Session completed! Celebrate this micro-win."
              : isRunning
              ? "I'm sitting beside you. Just finish Step 1."
              : "Ready when you are. Press Start Sprint to initiate flow."}
          </p>
        </div>

        {/* Apple-Style Digital Timer & Attention Pacing Selector */}
        <div className="space-y-3 select-none">
          <div className="font-mono font-semibold text-5xl sm:text-7xl text-forest-950 tracking-tight">
            {formatTime(secondsLeft)}
          </div>

          {/* Attention Burst Pacing Selector (Addressing Attention Pendulum) */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <button
              onClick={() => handleSelectBurstDuration(10)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition active:scale-95 ${
                timerDuration === 10 * 60
                  ? 'bg-forest-950 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-500'
              }`}
            >
              10m Burst
            </button>
            <button
              onClick={() => handleSelectBurstDuration(15)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition active:scale-95 ${
                timerDuration === 15 * 60
                  ? 'bg-forest-950 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-500'
              }`}
            >
              15m Steady
            </button>
            <button
              onClick={() => handleSelectBurstDuration(25)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition active:scale-95 ${
                timerDuration === 25 * 60
                  ? 'bg-forest-950 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-500'
              }`}
            >
              25m Sprint
            </button>
          </div>
        </div>

        {/* Active Task Card with Intuition Callout (Defeating Leaky Bucket) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_12px_32px_-4px_rgba(15,61,35,0.06),0_2px_6px_0_rgba(0,0,0,0.02)] text-left space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-wide font-semibold">
                Active Focus Task
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ~{activeTask?.durationMinutes || 25} mins
            </span>
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-forest-950">
              {activeTask?.title || "Climbing Stairs (Visualizing Base Cases)"}
            </h3>

            {/* Working Memory Anchor Flashcard */}
            {activeTask?.intuitionTip && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#F8FAF8] flex items-start gap-2.5 border-l-2 border-emerald-500">
                <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-forest-900/90 font-sans leading-relaxed">
                  <strong>Intuition:</strong> {activeTask.intuitionTip}
                </p>
              </div>
            )}
          </div>

          {/* Sequential Dopamine Ladder (Micro-Steps to Conquer Wall of Awful) */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
              Sequential Micro-Steps
            </span>

            {microSteps.map((step, idx) => {
              const isCurrent = idx === activeStepIndex;
              const isDone = idx < activeStepIndex || isSessionCompleted;
              const isUpcoming = idx > activeStepIndex && !isSessionCompleted;
              const stepTitle = typeof step === 'string' ? step : step.title;

              if (isDone) {
                return (
                  <div 
                    key={idx} 
                    className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs text-slate-400 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        ✓
                      </span>
                      <span className="line-through">{stepTitle}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700">Done</span>
                  </div>
                );
              }

              if (isCurrent) {
                return (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-forest-950">{stepTitle}</p>
                    </div>
                    <button
                      onClick={() => handleStepComplete(idx)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition shrink-0 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                  </div>
                );
              }

              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl flex items-center gap-2.5 transition ${isUpcoming && idx === activeStepIndex + 1 ? 'opacity-45' : 'opacity-25'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-mono text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-500 font-sans">{stepTitle}</span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Tactile Control Bar with Lucide Icons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          
          {/* Start / Pause Sprint */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm active:scale-95 transition-all duration-150 flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'Pause Sprint' : 'Start Sprint'}</span>
          </button>

          {/* Explicit Session Done Button */}
          <button
            onClick={() => handleCompleteSession(false)}
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm active:scale-95 transition-all duration-150 flex items-center gap-1.5"
            title="Mark session complete and record focus time"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>

          {/* Brown Noise Audio Generator */}
          <button
            onClick={toggleAudio}
            className={`px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm active:scale-95 transition-all duration-150 ${
              isAudioPlaying
                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                : 'bg-white hover:bg-slate-50 text-forest-900'
            }`}
          >
            {isAudioPlaying ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isAudioPlaying ? 'Brown Noise (On)' : 'Brown Noise'}</span>
          </button>

          {/* I'm Feeling Stuck Emergency Helper */}
          <button
            onClick={() => setShowStuckModal(true)}
            className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-700 font-sans active:scale-95 transition duration-100 flex items-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>I'm feeling stuck</span>
          </button>
        </div>

        {/* Emergency Calm Stuck Dialog */}
        {showStuckModal && (
          <div className="fixed inset-0 z-50 bg-forest-950/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-forest-950 text-base">
                  Take a breath. No judgment.
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Initiation friction happens to everyone. How can we make this moment easier?
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowStuckModal(false);
                    handleStepComplete(activeStepIndex);
                  }}
                  className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98 flex items-center justify-between"
                >
                  <span>✂️ Shrink to 10-second micro-read</span>
                  <span className="text-emerald-700 font-mono text-[11px]">Easy</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowStuckModal(false);
                    onOpenCheckin?.();
                  }}
                  className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98 flex items-center justify-between"
                >
                  <span>🧘 90-second box breathing reset</span>
                  <span className="text-slate-400 font-mono text-[11px]">Somatic</span>
                </button>

                <button
                  onClick={() => {
                    setShowStuckModal(false);
                    onAbsorbBuffer?.();
                  }}
                  className="w-full p-3.5 bg-[#F8FAF8] hover:bg-amber-50 rounded-2xl text-left text-xs font-semibold text-amber-950 transition active:scale-98 flex items-center justify-between"
                >
                  <span>🛡️ Absorb into Buffer Slot (Zero Guilt)</span>
                  <span className="text-amber-700 font-mono text-[11px]">Protected</span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => setShowStuckModal(false)}
                  className="w-full py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-medium transition text-center"
                >
                  Back to Focus Room
                </button>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: THE LIVING PLAN & DECONSTRUCTED ROADMAP (Anti-Overwhelm Slicer) */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-6 border-t border-slate-200/60 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-forest-950 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>Your Living Curriculum Roadmap</span>
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Paste any course URL or topic. We slice it with <strong>2 Buffer Days / week</strong> so you never fall behind.
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold shrink-0">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{roadmap?.bufferDaysCount || targetWeeks * 2} Buffer Days Injected</span>
          </div>
        </div>

        {/* Natural Search / URL Slicer Form */}
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Search topic or paste link (Udemy, Medium, YouTube, Docs, LeetCode)..."
              className="w-full pl-4 pr-10 py-3.5 sm:py-4 rounded-2xl bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03),0_1px_3px_0_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition placeholder:text-slate-300"
            />
            {goalInput && (
              <button
                type="button"
                onClick={() => setGoalInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Clickable Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-mono text-slate-400 mr-0.5">Quick ideas:</span>
            <button
              type="button"
              onClick={() => handlePresetSelect('Master Dynamic Programming & Recursion')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-forest-900 shadow-xs transition active:scale-95"
            >
              🎯 Dynamic Programming
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('https://www.udemy.com/course/the-complete-react-guide')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-forest-900 shadow-xs transition active:scale-95"
            >
              🎓 Udemy React Link
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('https://medium.com/@engineering/system-design-primer')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-forest-900 shadow-xs transition active:scale-95"
            >
              📝 Medium System Design
            </button>
          </div>

          {/* Pacing Configuration Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="text-slate-500 font-sans flex items-center gap-1.5">
                <span>Timeline:</span>
                <select
                  value={targetWeeks}
                  onChange={(e) => setTargetWeeks(Number(e.target.value))}
                  className="bg-white rounded-lg px-2 py-1 font-semibold text-forest-950 shadow-sm focus:outline-none"
                >
                  <option value={2}>2 Weeks</option>
                  <option value={3}>3 Weeks (Recommended)</option>
                  <option value={4}>4 Weeks</option>
                </select>
              </label>

              <label className="text-slate-500 font-sans flex items-center gap-1.5">
                <span>Daily Cap:</span>
                <select
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="bg-white rounded-lg px-2 py-1 font-semibold text-forest-950 shadow-sm focus:outline-none"
                >
                  <option value={30}>30 mins / day</option>
                  <option value={45}>45 mins / day</option>
                  <option value={60}>60 mins / day</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Slicing Plan & Buffers...' : 'Slice Plan with Buffers 🛡️'}</span>
            </button>
          </div>
        </form>

        {/* Milestone Cards List */}
        <div className="space-y-3 pt-2">
          {milestones.map((milestone) => {
            const isOpen = openMilestoneId === milestone.id;

            return (
              <div
                key={milestone.id}
                className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] overflow-hidden transition-all duration-200"
              >
                {/* Milestone Toggle Header */}
                <div
                  onClick={() => setOpenMilestoneId(isOpen ? null : milestone.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#F8FAF8] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      W{milestone.weekNumber}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-forest-950">
                        {milestone.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{milestone.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-50 rounded-lg flex items-center gap-1">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </div>

                {/* Milestone Tasks */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 space-y-2 pt-1">
                    {milestone.tasks.map((task) => {
                      const isBuffer = task.type === 'BUFFER';
                      const isSelected = activeTask?.id === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-xl flex items-center justify-between gap-3 transition ${
                            isBuffer
                              ? 'bg-amber-50/70 text-amber-950'
                              : isSelected
                              ? 'bg-emerald-50/80 border border-emerald-300/80 text-forest-950'
                              : 'bg-[#F8FAF8] hover:bg-slate-100/60 text-forest-950'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-2.5">
                            {isBuffer ? (
                              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                •
                              </span>
                            )}
                            <div>
                              <p className={`text-xs ${isBuffer ? 'font-bold text-amber-900' : 'font-semibold text-forest-950'}`}>
                                {task.title}
                              </p>
                              {task.intuitionTip && (
                                <p className="text-[10px] text-slate-400 font-sans italic mt-0.5">
                                  💡 {task.intuitionTip}
                                </p>
                              )}
                            </div>
                          </div>

                          {!isBuffer ? (
                            <button
                              onClick={() => handleSelectTaskAndScroll(task)}
                              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold active:scale-95 transition duration-100 shadow-sm shrink-0 flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-forest-950 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <span>{isSelected ? 'Active' : 'Focus Now'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md shrink-0">
                              Guilt-free
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
}
