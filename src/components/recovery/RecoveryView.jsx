import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function RecoveryView({ bufferDaysRemaining = 5, totalBufferDays = 6, onClaimWin, onResumeFocus }) {
  const [hasClaimed, setHasClaimed] = useState(false);
  const [simulatedGap, setSimulatedGap] = useState(true);

  const handleClaim = () => {
    setHasClaimed(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16A34A', '#FEF08A']
    });
    onClaimWin?.();
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. Header with Direct Reassurance */}
      <div className="space-y-1.5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
          Zero-Shame Recovery Engine
        </h2>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          Missing days happens to every learner. We automatically cushion missed days with Buffer Slots so you never fall behind.
        </p>
      </div>

      {/* 2. Visual Buffer Ledger Protection Bar (Depth-driven surface, NO borders) */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-4">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="font-display font-bold text-forest-950">Timeline Protection Status</span>
          <span className="font-mono text-emerald-800 font-semibold">{bufferDaysRemaining} of {totalBufferDays} Buffers Available</span>
        </div>

        {/* Visual Cushion Bar */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="w-1/2 bg-emerald-600 h-full rounded-l-full" title="Completed Tasks"></div>
          <div className="w-1/6 bg-amber-300 h-full" title="Buffer Slot Absorbed"></div>
          <div className="w-1/3 bg-slate-200 h-full rounded-r-full" title="Remaining Tasks"></div>
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span className="text-emerald-700 font-semibold">● Completed</span>
          <span className="text-amber-700 font-semibold">🛡️ 1 Buffer Absorbed</span>
          <span>Target Date: 100% Intact</span>
        </div>
      </div>

      {/* 3. 60-Second Dopamine Restart Win */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-forest-950">60-Second Re-ignition Win</span>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">+15 Momentum Pts</span>
        </div>
        
        <p className="text-xs text-slate-500 font-sans">
          "Read just 1 line of recursion intuition below to re-ignite your flow state without friction:"
        </p>

        <div className="p-3.5 bg-[#F8FAF8] rounded-xl text-xs font-mono text-forest-950">
          "Memoization = Remembering answers so you never repeat work for the same subproblem."
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClaim}
            disabled={hasClaimed}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 disabled:opacity-75"
          >
            {hasClaimed ? '✓ Win Claimed!' : 'Claim Micro-Win'}
          </button>

          <button
            onClick={onResumeFocus}
            className="px-4 py-2 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100"
          >
            Resume Focus Room →
          </button>
        </div>
      </div>

    </div>
  );
}
