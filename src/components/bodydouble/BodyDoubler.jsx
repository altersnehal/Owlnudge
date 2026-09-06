import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

export default function BodyDoubler({ activeTask, onCompleteSession, onNavigateTab }) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  const microSteps = activeTask?.microSteps || [
    { title: 'Open LeetCode #70 & read Example 1', time: '45s' },
    { title: 'Draw base cases n=1, n=2 on napkin', time: '2m' },
    { title: 'Write 3-line recurrence loop', time: '10m' }
  ];

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleComplete(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

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
        origin: { y: 0.75 },
        colors: ['#16A34A', '#FEF08A']
      });
      if (nextIndex >= microSteps.length) {
        handleComplete(false);
      }
    }
  };

  const handleComplete = (timerExpired = false) => {
    setIsRunning(false);
    audioService.stop();
    setIsAudioPlaying(false);
    setIsSessionCompleted(true);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#16A34A', '#34D399', '#FEF08A']
    });

    const elapsedMinutes = Math.max(1, Math.round((25 * 60 - secondsLeft) / 60));
    onCompleteSession?.(timerExpired ? 25 : elapsedMinutes);
  };

  const handleResetSession = () => {
    setIsSessionCompleted(false);
    setSecondsLeft(25 * 60);
    setActiveStepIndex(0);
    setIsRunning(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 sm:space-y-10 text-center max-w-lg mx-auto">
      
      {/* Top Breadcrumb & Quick Navigation (Never Feel Stuck) */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <button
          onClick={() => onNavigateTab?.('planner')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          <span>←</span> Back to Planner
        </button>
        <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded-full shadow-sm text-forest-900">
          {activeTask?.title || "Focus Sprint"}
        </span>
        <button
          onClick={() => onNavigateTab?.('dashboard')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          Momentum <span>→</span>
        </button>
      </div>

      {/* 1. Ambient Mascot Companion */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-1">
        <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-emerald-50/80 p-2.5 flex items-center justify-center transition-all duration-300 ${isRunning ? 'animate-[breath_5s_ease-in-out_infinite] scale-105' : ''}`}>
          <img src="/assets/mascot.png" alt="Owlnudge Companion" className="w-full h-full object-contain" />
        </div>
        <p className="text-xs text-forest-800/80 font-sans max-w-xs transition-opacity duration-200">
          {isSessionCompleted
            ? "Sprint completed! Notice how good closure feels."
            : isRunning
            ? "I'm sitting beside you. Just finish Step 1."
            : "Ready when you are. Press start sprint or done whenever you finish."}
        </p>
      </div>

      {/* 2. Apple-Style Large Digital Focus Timer */}
      <div className="space-y-1 select-none">
        <div className="font-mono font-semibold text-5xl sm:text-7xl text-forest-950 tracking-tight">
          {formatTime(secondsLeft)}
        </div>
        <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
          {isSessionCompleted ? 'Sprint Complete' : isRunning ? 'Focus Sprint Active' : '25 min Focus Block'}
        </p>
      </div>

      {/* Completion Banner (When session is marked Done) */}
      {isSessionCompleted && (
        <div className="bg-emerald-50 rounded-2xl p-5 shadow-[0_8px_24px_-4px_rgba(22,163,74,0.12)] space-y-3 text-left animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <span>🎉</span> Session Logged & Momentum Recorded
            </span>
            <span className="text-[11px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-full font-bold shadow-xs">
              +25 Pts
            </span>
          </div>
          <p className="text-xs text-emerald-900/80 font-sans leading-relaxed">
            Great work clearing activation friction. Take a quick somatic breath or jump to your next micro-task.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => onNavigateTab?.('planner')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition"
            >
              Choose Next Task in Planner →
            </button>
            <button
              onClick={() => onNavigateTab?.('checkin')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 text-xs font-medium shadow-xs active:scale-95 transition"
            >
              90s Somatic Reset
            </button>
            <button
              onClick={handleResetSession}
              className="px-3 py-2 text-xs text-emerald-800 hover:underline font-sans ml-auto"
            >
              Restart Timer
            </button>
          </div>
        </div>
      )}

      {/* 3. The Continuous Sequential Ladder */}
      <div className="text-left space-y-2.5 max-w-lg mx-auto">
        {microSteps.map((step, idx) => {
          const isCurrent = idx === activeStepIndex;
          const isDone = idx < activeStepIndex || isSessionCompleted;
          const isUpcoming = idx > activeStepIndex && !isSessionCompleted;

          const stepTitle = typeof step === 'string' ? step : step.title;
          const stepTime = typeof step === 'string' ? '2m' : step.time;

          if (isDone) {
            return (
              <div 
                key={idx} 
                className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <span className="line-through text-slate-400">{stepTitle}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-medium">Done</span>
              </div>
            );
          }

          if (isCurrent) {
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 shadow-[0_12px_32px_-4px_rgba(15,61,35,0.06),0_2px_6px_0_rgba(0,0,0,0.02)] transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-forest-950">{stepTitle}</p>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">Micro step · ~{stepTime}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStepComplete(idx)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 shrink-0"
                >
                  Done ✓
                </button>
              </div>
            );
          }

          // Upcoming step
          return (
            <div 
              key={idx} 
              className={`px-4 sm:px-5 py-3 flex items-center gap-3 transition-all duration-200 ${isUpcoming && idx === activeStepIndex + 1 ? 'opacity-40' : 'opacity-25'}`}
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-mono text-xs font-medium shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs text-slate-500 font-sans">{stepTitle}</span>
            </div>
          );
        })}
      </div>

      {/* 4. Tactile Floating Controls (Featuring explicit 'Done' button) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
        
        {/* Play / Pause Sprint */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm active:scale-95 transition-all duration-150 ${
            isRunning
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isRunning ? 'Pause Sprint' : 'Start Sprint'}
        </button>

        {/* Explicit Session Done Button */}
        <button
          onClick={() => handleComplete(false)}
          className="px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          title="Mark this session complete and log focus minutes"
        >
          <span>✓</span>
          <span>Done</span>
        </button>

        {/* Brown Noise Toggle */}
        <button
          onClick={toggleAudio}
          className={`px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm active:scale-95 transition-all duration-150 ${
            isAudioPlaying
              ? 'bg-emerald-100 text-emerald-900 font-semibold'
              : 'bg-white hover:bg-slate-50 text-forest-900'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isAudioPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'}`}></span>
          <span>{isAudioPlaying ? 'Brown Noise (On)' : 'Brown Noise'}</span>
        </button>

        {/* Stuck Helper Action */}
        <button
          onClick={() => setShowStuckModal(true)}
          className="px-3 py-2 text-xs text-slate-400 hover:text-slate-700 font-sans active:scale-95 transition duration-100"
        >
          I'm feeling stuck
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
                  onNavigateTab?.('checkin');
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98 flex items-center justify-between"
              >
                <span>🧘 90-second box breathing reset</span>
                <span className="text-slate-400 font-mono text-[11px]">Somatic</span>
              </button>

              <button
                onClick={() => {
                  setShowStuckModal(false);
                  onNavigateTab?.('recovery');
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-amber-50 rounded-2xl text-left text-xs font-semibold text-amber-950 transition active:scale-98 flex items-center justify-between"
              >
                <span>🛡️ Use a Buffer Slot (Zero Guilt)</span>
                <span className="text-amber-700 font-mono text-[11px]">Protected</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowStuckModal(false)}
                className="w-full py-2 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-medium transition text-center"
              >
                Back to Focus Room
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
