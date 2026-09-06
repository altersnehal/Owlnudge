import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function DailyCheckin({ onLaunchBodyDouble, activeTask, onNavigateTab }) {
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [showSomatic, setShowSomatic] = useState(false);
  const [breathCount, setBreathCount] = useState(4);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [eveningWin, setEveningWin] = useState('');
  const [eveningLogged, setEveningLogged] = useState(false);

  // 4-4-4 Box Breathing cycle timer
  useEffect(() => {
    let interval = null;
    if (showSomatic) {
      interval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            setBreathPhase((p) => {
              if (p === 'Inhale') return 'Hold';
              if (p === 'Hold') return 'Exhale';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSomatic]);

  const handleEveningSubmit = (e) => {
    e.preventDefault();
    if (!eveningWin.trim()) return;
    setEveningLogged(true);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#16A34A', '#34D399']
    });
  };

  return (
    <div className="space-y-8 text-left max-w-xl mx-auto">
      
      {/* Top Breadcrumbs & Navigation (Never Feel Stuck) */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <button
          onClick={() => onNavigateTab?.('bodydouble')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          <span>←</span> Focus Room
        </button>
        <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
          1-Tap Nervous System Triage
        </span>
        <button
          onClick={() => onNavigateTab?.('planner')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          Planner <span>→</span>
        </button>
      </div>

      {/* 1. Direct Triage Question */}
      <div className="space-y-1.5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
          How is your nervous system today?
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          One tap tunes the focus room pacing to your actual cognitive energy.
        </p>
      </div>

      {/* 2. 3 Tactile Energy Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <button
          onClick={() => setSelectedEnergy('FLOW')}
          className={`p-4 sm:p-5 rounded-2xl text-left space-y-2.5 transition-all duration-150 active:scale-95 ${
            selectedEnergy === 'FLOW'
              ? 'bg-white shadow-[0_12px_32px_-4px_rgba(15,61,35,0.08),0_0_0_2px_rgba(22,163,74,0.4)]'
              : 'bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)]'
          }`}
        >
          <span className="text-xl">🚀</span>
          <div>
            <p className="text-xs font-bold text-forest-950">High Flow</p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">25m deep sprint</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedEnergy('STEADY')}
          className={`p-4 sm:p-5 rounded-2xl text-left space-y-2.5 transition-all duration-150 active:scale-95 ${
            selectedEnergy === 'STEADY'
              ? 'bg-white shadow-[0_12px_32px_-4px_rgba(15,61,35,0.08),0_0_0_2px_rgba(22,163,74,0.4)]'
              : 'bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)]'
          }`}
        >
          <span className="text-xl">⚡</span>
          <div>
            <p className="text-xs font-bold text-forest-950">Steady Pace</p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">15m gentle warmup</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedEnergy('LOW')}
          className={`p-4 sm:p-5 rounded-2xl text-left space-y-2.5 transition-all duration-150 active:scale-95 ${
            selectedEnergy === 'LOW'
              ? 'bg-white shadow-[0_12px_32px_-4px_rgba(15,61,35,0.08),0_0_0_2px_rgba(22,163,74,0.4)]'
              : 'bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)]'
          }`}
        >
          <span className="text-xl">🏔️</span>
          <div>
            <p className="text-xs font-bold text-forest-950">Low / Brain Fog</p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">30s micro-read</p>
          </div>
        </button>

      </div>

      {/* 3. Inline Direct Feedback & Launch CTA */}
      {selectedEnergy && (
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_-2px_rgba(15,61,35,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 animate-in fade-in duration-150">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-forest-950">
              {selectedEnergy === 'LOW'
                ? "Pacing tuned: We'll start with just 30 seconds."
                : selectedEnergy === 'STEADY'
                ? "Pacing tuned: 15-minute gentle brown noise session ready."
                : "Pacing tuned: 25-minute deep flow session primed."}
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              Task: {activeTask?.title || "Recursion intuition & memoization"}
            </p>
          </div>

          <button
            onClick={() => onLaunchBodyDouble(activeTask)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 shrink-0 text-center"
          >
            Launch Focus Sprint →
          </button>
        </div>
      )}

      {/* 4. Somatic Bio-Reset (Interactive 4-4-4 Box Breathing) */}
      <div className="space-y-3 pt-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide px-1">
          Midday Somatic Care & Evening Closure
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-forest-950">90-Second Somatic Reset</p>
              <p className="text-[11px] text-slate-400 font-sans">4-4-4 box breathing to restore dopamine reserves</p>
            </div>
            <button
              onClick={() => setShowSomatic(!showSomatic)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F8FAF8] hover:bg-slate-100 text-forest-950 active:scale-95 transition duration-100 shrink-0"
            >
              {showSomatic ? 'Close' : 'Start 90s Reset'}
            </button>
          </div>

          {showSomatic && (
            <div className="p-5 bg-[#F8FAF8] rounded-xl text-center space-y-3 transition-all duration-200 animate-in fade-in">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  {breathPhase}
                </span>
                <div className="text-3xl font-mono font-bold text-forest-950 animate-pulse">
                  {breathCount}s
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-sans max-w-xs mx-auto">
                Drink a sip of water, relax your jaw, look 20 feet away, and follow the 4-second rhythm.
              </p>
            </div>
          )}
        </div>

        {/* Evening Closure Form */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-3">
          <div>
            <p className="text-xs font-bold text-forest-950">Evening Closure</p>
            <p className="text-[11px] text-slate-400 font-sans">Acknowledge 1 micro-win before unplugging.</p>
          </div>

          {eveningLogged ? (
            <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
              <span>✓ Win logged: "{eveningWin}" — Tomorrow is buffer protected!</span>
              <button 
                onClick={() => setEveningLogged(false)}
                className="text-[11px] text-emerald-700 underline ml-2"
              >
                Edit
              </button>
            </div>
          ) : (
            <form onSubmit={handleEveningSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={eveningWin}
                onChange={(e) => setEveningWin(e.target.value)}
                placeholder="What went well today? (e.g. read 1 problem, did 15m focus)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAF8] text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold active:scale-95 transition duration-100 shrink-0"
              >
                Log Win & Close Day
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
