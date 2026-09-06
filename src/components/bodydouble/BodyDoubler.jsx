import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

export default function BodyDoubler({ activeTask, onCompleteSession }) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showStuckModal, setShowStuckModal] = useState(false);

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
      setIsRunning(false);
      audioService.stop();
      setIsAudioPlaying(false);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
      onCompleteSession?.(25);
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
      setActiveStepIndex(index + 1);
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.75 },
        colors: ['#16A34A', '#FEF08A']
      });
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-10 text-center">
      
      {/* 1. Ambient Mascot Companion (Resting on canvas, no box) */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2">
        <div className={`w-20 h-20 rounded-full bg-emerald-50/70 p-2.5 flex items-center justify-center ${isRunning ? 'animate-[breath_5s_ease-in-out_infinite]' : ''}`}>
          <img src="/assets/mascot.png" alt="Owlnudge Companion" className="w-full h-full object-contain" />
        </div>
        <p className="text-xs text-forest-800/75 font-sans max-w-xs transition-opacity duration-200">
          {isRunning ? "I'm sitting beside you. Just finish Step 1." : "Ready when you are. Press start to focus."}
        </p>
      </div>

      {/* 2. Apple-Style Large Digital Focus Timer */}
      <div className="space-y-1 select-none">
        <div className="font-mono font-semibold text-6xl sm:text-7xl text-forest-950 tracking-tight">
          {formatTime(secondsLeft)}
        </div>
        <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
          {isRunning ? 'Focus Sprint Active' : '25 min Focus Block'}
        </p>
      </div>

      {/* 3. The Continuous Sequential Ladder (Depth-driven surface, NO borders) */}
      <div className="text-left space-y-2.5 max-w-lg mx-auto">
        {microSteps.map((step, idx) => {
          const isCurrent = idx === activeStepIndex;
          const isDone = idx < activeStepIndex;
          const isUpcoming = idx > activeStepIndex;

          const stepTitle = typeof step === 'string' ? step : step.title;
          const stepTime = typeof step === 'string' ? '2m' : step.time;

          if (isDone) {
            return (
              <div 
                key={idx} 
                className="px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <span className="line-through">{stepTitle}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700">Resolved</span>
              </div>
            );
          }

          if (isCurrent) {
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4 shadow-[0_12px_32px_-4px_rgba(15,61,35,0.06),0_2px_6px_0_rgba(0,0,0,0.02)] transition-all duration-200"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-forest-950 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-forest-950">{stepTitle}</p>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">Estimated time: {stepTime}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleStepComplete(idx)}
                  className="px-4 py-2 rounded-xl bg-forest-950 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 shrink-0"
                >
                  Done
                </button>
              </div>
            );
          }

          // Upcoming step
          return (
            <div 
              key={idx} 
              className={`px-5 py-3 flex items-center gap-3.5 transition-all duration-200 ${isUpcoming && idx === activeStepIndex + 1 ? 'opacity-40' : 'opacity-25'}`}
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-mono text-xs font-medium shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs text-slate-500 font-sans">{stepTitle}</span>
            </div>
          );
        })}
      </div>

      {/* 4. Quiet Floating Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        
        {/* Play / Pause Sprint */}
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm active:scale-95 transition-all duration-150 ${
            isRunning
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-forest-950 text-white hover:bg-forest-900'
          }`}
        >
          {isRunning ? 'Pause Sprint' : 'Start Sprint'}
        </button>

        {/* Brown Noise Toggle */}
        <button
          onClick={toggleAudio}
          className={`px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm active:scale-95 transition-all duration-150 ${
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 text-left">
            <div className="space-y-1">
              <h4 className="font-display font-bold text-forest-950 text-base">
                Take a breath. No judgment.
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Initiation friction happens. How can we make this moment easier?
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowStuckModal(false);
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98"
              >
                ✂️ Shrink to 10-second micro-read
              </button>
              <button
                onClick={() => {
                  setShowStuckModal(false);
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98"
              >
                🧘 60-second breathing pause
              </button>
            </div>

            <button
              onClick={() => setShowStuckModal(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-medium transition"
            >
              Back to focus
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
