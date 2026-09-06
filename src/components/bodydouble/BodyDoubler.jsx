import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, AlertCircle, Sparkles, Check, HeartHandshake } from 'lucide-react';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

export default function BodyDoubler({ activeTask, onCompleteSession }) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [soundType, setSoundType] = useState('brown');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showStuckModal, setShowStuckModal] = useState(false);

  const microSteps = activeTask?.microSteps || [
    'Open LeetCode #70 & read example 1 (30 secs)',
    'Draw base cases n=1, n=2 on a napkin (2 mins)',
    'Write loop recurrence: dp[i] = dp[i-1] + dp[i-2] (10 mins)'
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
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Handle Audio toggle
  const toggleAudio = (type = soundType) => {
    if (isAudioPlaying) {
      audioService.stop();
      setIsAudioPlaying(false);
    } else {
      audioService.start(type, 0.18);
      setIsAudioPlaying(true);
      setSoundType(type);
    }
  };

  const handleStepComplete = (index) => {
    if (index === activeStepIndex) {
      setActiveStepIndex(index + 1);
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#22C55E', '#FDE047']
      });
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Banner / Focus Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-emerald-200/80 shadow-sm">
        <div>
          <span className="text-[10px] font-mono font-bold text-forest-800 uppercase tracking-wide">FOCUS SESSION ACTIVE</span>
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-forest-950">
            {activeTask?.title || "Climbing Stairs (Visualizing Base Cases)"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-butterYellow-300 text-forest-950 font-display font-bold text-xs shadow-sm flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Co-Working with Owlnudge</span>
          </span>
        </div>
      </div>

      {/* Main Focus Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Companion & Focus Timer */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-card flex flex-col items-center text-center space-y-5">
          
          {/* Avatar with Gentle Breath */}
          <div className="relative">
            <div className={`w-36 h-36 mx-auto ${isRunning ? 'breath-cycle' : ''} bg-gradient-to-b from-white to-emerald-50/60 border border-emerald-200/80 rounded-3xl p-3 flex items-center justify-center shadow-sm`}>
              <img src="/assets/mascot.png" alt="Owlnudge Companion" className="w-full h-full object-contain filter drop-shadow-md" />
            </div>
            {isRunning && (
              <span className="absolute -bottom-2 right-4 px-2.5 py-0.5 rounded-full bg-owlGreen-600 text-white font-mono text-[10px] font-bold shadow-sm border border-white">
                Quietly with you
              </span>
            )}
          </div>

          <div>
            <h3 className="font-display font-bold text-forest-950 text-base">Owlnudge Companion</h3>
            <p className="text-xs text-forest-800">
              {isRunning
                ? "Working silently beside you. Only focus on current step."
                : "Ready when you are. Press Start to begin."}
            </p>
          </div>

          {/* Big Digital Focus Timer */}
          <div className="bg-[#f8faf7] border border-emerald-200 rounded-3xl px-8 py-4 shadow-inner">
            <div className="font-mono text-4xl sm:text-5xl font-black text-forest-950 tracking-widest">
              {formatTime(secondsLeft)}
            </div>
            <span className="text-[10px] font-mono text-forest-700 uppercase tracking-wider block mt-1">
              {isRunning ? "Focus Sprint Active" : "25m Focus Block"}
            </span>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-5 py-2.5 font-display font-bold text-xs rounded-xl emil-btn shadow-md flex items-center gap-1.5 transition ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-owlGreen-600 hover:bg-owlGreen-700 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? "Pause Session" : "Start Sprint"}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(25 * 60);
              }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl emil-btn border border-slate-200"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Web Audio Procedural Synthesizer Bar */}
          <div className="w-full pt-2 border-t border-emerald-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-bold text-forest-900">Neuro-Acoustic Audio:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setSoundType('brown');
                    if (isAudioPlaying) audioService.start('brown');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                    soundType === 'brown' ? 'bg-forest-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Brown Noise
                </button>
                <button
                  onClick={() => {
                    setSoundType('pink');
                    if (isAudioPlaying) audioService.start('pink');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                    soundType === 'pink' ? 'bg-forest-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Pink Noise
                </button>
              </div>
            </div>

            <button
              onClick={() => toggleAudio()}
              className={`w-full py-2 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-1.5 transition emil-btn shadow-sm ${
                isAudioPlaying
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-forest-900 border border-emerald-200'
              }`}
            >
              {isAudioPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isAudioPlaying ? "Stop Synthesizer Audio" : "Play Real-Time Synthesizer"}</span>
            </button>
          </div>

        </div>

        {/* Right: The Sequential Dopamine Ladder */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-emerald-200/80 shadow-card space-y-5">
          
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-forest-800 uppercase">PROGRESSIVE UNLOCKING</span>
              <h3 className="font-display font-bold text-forest-950 text-base">
                Sequential Dopamine Ladder
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-butterYellow-300 text-forest-950 font-display font-bold text-xs">
              Step {Math.min(activeStepIndex + 1, microSteps.length)} of {microSteps.length}
            </span>
          </div>

          <p className="text-xs text-forest-800 leading-relaxed font-sans">
            Only the current micro-step is unlocked. Clear it in 30 seconds to trigger your dopamine release and unlock the next action.
          </p>

          {/* Step Items */}
          <div className="space-y-3">
            {microSteps.map((stepText, idx) => {
              const isCompleted = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              const isLocked = idx > activeStepIndex;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-white border-2 border-owlGreen-500 shadow-md ring-2 ring-owlGreen-500/20'
                      : isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                      : 'bg-slate-50 border-slate-200 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStepComplete(idx)}
                      disabled={isLocked}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition emil-btn ${
                        isCompleted
                          ? 'bg-owlGreen-600 border-owlGreen-600 text-white'
                          : isCurrent
                          ? 'bg-white border-owlGreen-500 text-transparent hover:text-owlGreen-600'
                          : 'bg-slate-200 border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isCompleted
                          ? 'line-through text-slate-400 font-sans'
                          : isCurrent
                          ? 'text-forest-950 font-display font-bold'
                          : 'text-slate-400 font-sans'
                      }`}
                    >
                      {stepText}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-owlGreen-600 text-white font-display font-bold text-[10px] shrink-0">
                      Active Step
                    </span>
                  )}
                  {isCompleted && (
                    <span className="text-owlGreen-700 text-xs font-mono font-bold shrink-0">
                      ✓ Done
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Emergency Helper & No-Guilt Early Exit */}
          <div className="pt-4 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <button
              onClick={() => setShowStuckModal(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-display font-bold rounded-xl border border-rose-200 emil-btn flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>I'm Feeling Stuck</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                audioService.stop();
                setIsAudioPlaying(false);
                onCompleteSession(25 - Math.floor(secondsLeft / 60));
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-forest-900 font-display font-bold rounded-xl emil-btn"
            >
              Finish Early (No Guilt) 🌿
            </button>
          </div>

        </div>

      </div>

      {/* Emergency Stuck Helper Modal */}
      {showStuckModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-emerald-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 p-2 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/assets/mascot.png" alt="Mascot" className="w-full h-full object-contain filter drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-display font-bold text-forest-950 text-base">"Hey Alex, take a breath."</h4>
                <p className="text-xs text-forest-800">Paralysis happens. How can we make this step easier?</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  alert("Step shrunk: 'Read first line of code problem only (10 seconds)'");
                  setShowStuckModal(false);
                }}
                className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left font-display font-bold text-forest-950 transition"
              >
                ✂️ Shrink this step even smaller (10 seconds)
              </button>
              <button
                onClick={() => {
                  alert("60-second breathing timer started. Inhale... Exhale...");
                  setShowStuckModal(false);
                }}
                className="w-full p-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl text-left font-display font-bold text-forest-950 transition"
              >
                🧘 60-second mental reset before continuing
              </button>
            </div>

            <button
              onClick={() => setShowStuckModal(false)}
              className="w-full py-2 bg-slate-100 text-slate-700 font-display font-bold text-xs rounded-xl"
            >
              Back to Room
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
