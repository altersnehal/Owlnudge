import React, { useState } from 'react';

export default function DailyCheckin({ onLaunchBodyDouble, activeTask }) {
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [somaticDone, setSomaticDone] = useState(false);
  const [eveningWin, setEveningWin] = useState('');
  const [eveningLogged, setEveningLogged] = useState(false);

  const handleEveningSubmit = (e) => {
    e.preventDefault();
    if (!eveningWin.trim()) return;
    setEveningLogged(true);
  };

  return (
    <div className="space-y-10 text-left">
      
      {/* 1. Direct Triage Question */}
      <div className="space-y-1.5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
          How is your nervous system today?
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          One tap tunes the focus room to your current energy.
        </p>
      </div>

      {/* 2. 3 Tactile Energy Options (Depth-driven, NO borders) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        
        <button
          onClick={() => setSelectedEnergy('FLOW')}
          className={`p-5 rounded-2xl text-left space-y-3 transition-all duration-150 active:scale-95 ${
            selectedEnergy === 'FLOW'
              ? 'bg-white shadow-[0_12px_32px_-4px_rgba(15,61,35,0.08),0_0_0_2px_rgba(22,163,74,0.4)]'
              : 'bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)]'
          }`}
        >
          <span className="text-base">🚀</span>
          <div>
            <p className="text-xs font-bold text-forest-950">High Flow</p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">25m Sprint</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedEnergy('STEADY')}
          className={`p-5 rounded-2xl text-left space-y-3 transition-all duration-150 active:scale-95 ${
            selectedEnergy === 'STEADY'
              ? 'bg-white shadow-[0_12px_32px_-4px_rgba(15,61,35,0.08),0_0_0_2px_rgba(22,163,74,0.4)]'
              : 'bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)]'
          }`}
        >
          <span className="text-base">⚡</span>
          <div>
            <p className="text-xs font-bold text-forest-950">Steady</p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">15m Warmup</p>
          </div>
        </button>

        <button
          onClick={() => setSelectedEnergy('LOW')}
          className={`p-5 rounded-2xl text-left space-y-3 transition-all duration-150 active:scale-95 ${
            selectedEnergy === 'LOW'
              ? 'bg-white shadow-[0_12px_32px_-4px_rgba(15,61,35,0.08),0_0_0_2px_rgba(22,163,74,0.4)]'
              : 'bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)]'
          }`}
        >
          <span className="text-base">🏔️</span>
          <div>
            <p className="text-xs font-bold text-forest-950">Low Energy</p>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">30s Micro</p>
          </div>
        </button>

      </div>

      {/* 3. Inline Direct Feedback & CTA */}
      {selectedEnergy && (
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_-2px_rgba(15,61,35,0.04)] flex items-center justify-between gap-4 transition-all duration-200">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-forest-950">
              {selectedEnergy === 'LOW'
                ? "Pacing tuned: We'll do just 30 seconds."
                : "Pacing tuned: Brown noise focus room ready."}
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              Task: {activeTask?.title || "Recursion intuition"}
            </p>
          </div>

          <button
            onClick={() => onLaunchBodyDouble(activeTask)}
            className="px-4 py-2 rounded-xl bg-forest-950 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 shrink-0"
          >
            Start Focus →
          </button>
        </div>
      )}

      {/* 4. Optional Somatic Bio-Reset (Quiet Accordion Row) */}
      <div className="space-y-3 pt-4">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide px-1">
          Midday & Evening Care
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)]">
          <div>
            <p className="text-xs font-bold text-forest-950">90-Second Somatic Reset</p>
            <p className="text-[11px] text-slate-400 font-sans">Hydrate & 4-4-4 box breathing</p>
          </div>
          <button
            onClick={() => setSomaticDone(!somaticDone)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold active:scale-95 transition duration-100 ${
              somaticDone ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F8FAF8] hover:bg-slate-100 text-forest-950'
            }`}
          >
            {somaticDone ? '✓ Completed' : 'Reset (90s)'}
          </button>
        </div>

        {/* Evening Closure Form */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-3">
          <div>
            <p className="text-xs font-bold text-forest-950">Evening Closure</p>
            <p className="text-[11px] text-slate-400 font-sans">Acknowledge 1 win before unplugging.</p>
          </div>

          {eveningLogged ? (
            <p className="text-xs text-emerald-800 font-medium font-sans">
              ✓ Logged! Rest well—tomorrow is buffer protected.
            </p>
          ) : (
            <form onSubmit={handleEveningSubmit} className="flex gap-2">
              <input
                type="text"
                value={eveningWin}
                onChange={(e) => setEveningWin(e.target.value)}
                placeholder="What went well today?"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAF8] text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-forest-950 text-white text-xs font-semibold active:scale-95 transition duration-100 shrink-0"
              >
                Close Day
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
