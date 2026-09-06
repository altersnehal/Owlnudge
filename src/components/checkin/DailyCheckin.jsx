import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Zap, 
  Coffee, 
  Wind, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Moon, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DailyCheckin({ isOpen, onClose, onLaunchBodyDouble, activeTask }) {
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [showSomatic, setShowSomatic] = useState(false);
  const [breathCount, setBreathCount] = useState(4);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [eveningWin, setEveningWin] = useState('');
  const [eveningLogged, setEveningLogged] = useState(false);

  // 4-4-4 Box Breathing cycle timer
  useEffect(() => {
    let interval = null;
    if (showSomatic && isOpen) {
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
  }, [showSomatic, isOpen]);

  if (!isOpen) return null;

  const handleEveningSubmit = (e) => {
    e.preventDefault();
    if (!eveningWin.trim()) return;
    setEveningLogged(true);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#16A34A', '#34D399']
    });
  };

  const handleSelectEnergyAndStart = (energy) => {
    setSelectedEnergy(energy);
    onLaunchBodyDouble?.(activeTask, energy);
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#16A34A', '#FEF08A']
    });
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
        
        {/* Header with Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h2 className="font-display font-bold text-lg sm:text-xl text-forest-950 tracking-tight">
                1-Tap Nervous System Check-in
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              Tuning your focus pacing to your actual cognitive energy prevents initiation paralysis and dopamine crashes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. 3 Tactile Energy Pacing Options */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide block">
            Select Current Energy Level
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            <button
              onClick={() => handleSelectEnergyAndStart('FLOW')}
              className={`p-4 rounded-2xl text-left space-y-2 transition active:scale-95 border ${
                selectedEnergy === 'FLOW'
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                  : 'bg-[#F8FAF8] hover:bg-slate-100/70 border-transparent'
              }`}
            >
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-forest-950">High Flow</p>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">25m deep sprint</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectEnergyAndStart('STEADY')}
              className={`p-4 rounded-2xl text-left space-y-2 transition active:scale-95 border ${
                selectedEnergy === 'STEADY'
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                  : 'bg-[#F8FAF8] hover:bg-slate-100/70 border-transparent'
              }`}
            >
              <Coffee className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-forest-950">Steady</p>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">15m warmup</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectEnergyAndStart('LOW')}
              className={`p-4 rounded-2xl text-left space-y-2 transition active:scale-95 border ${
                selectedEnergy === 'LOW'
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-sm'
                  : 'bg-[#F8FAF8] hover:bg-slate-100/70 border-transparent'
              }`}
            >
              <Wind className="w-5 h-5 text-sky-500" />
              <div>
                <p className="text-xs font-bold text-forest-950">Low / Fog</p>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">30s micro-read</p>
              </div>
            </button>

          </div>
        </div>

        {/* 2. Interactive Somatic Reset (4-4-4 Box Breathing) */}
        <div className="p-4 bg-[#F8FAF8] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-forest-950 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-emerald-700" />
                <span>90-Second Somatic Reset</span>
              </p>
              <p className="text-[11px] text-slate-400 font-sans">4-4-4 box breathing to settle nervous restlessness</p>
            </div>
            
            <button
              onClick={() => setShowSomatic(!showSomatic)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-forest-950 shadow-xs active:scale-95 transition"
            >
              {showSomatic ? 'Pause' : 'Start Reset'}
            </button>
          </div>

          {showSomatic && (
            <div className="p-4 bg-white rounded-xl text-center space-y-2 transition animate-in fade-in">
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest">
                {breathPhase}
              </span>
              <div className="text-3xl font-mono font-bold text-forest-950 animate-pulse">
                {breathCount}s
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Relax your shoulders, drink a sip of water, and follow the rhythm.
              </p>
            </div>
          )}
        </div>

        {/* 3. Evening Closure Micro-Win */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Evening Closure</span>
          </div>

          {eveningLogged ? (
            <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
              <span>✓ Win logged: "{eveningWin}"</span>
              <button 
                onClick={() => setEveningLogged(false)}
                className="text-[11px] text-emerald-700 underline"
              >
                Edit
              </button>
            </div>
          ) : (
            <form onSubmit={handleEveningSubmit} className="flex gap-2">
              <input
                type="text"
                value={eveningWin}
                onChange={(e) => setEveningWin(e.target.value)}
                placeholder="What is 1 micro-win from today?"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8FAF8] text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-semibold active:scale-95 transition shrink-0"
              >
                Log Win
              </button>
            </form>
          )}
        </div>

        {/* Bottom CTA to Return */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition text-center"
          >
            Done & Return to Workspace →
          </button>
        </div>

      </div>
    </div>
  );
}
