import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Check, ArrowRight, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RecoveryModal({ isOpen, onClose, bufferDaysRemaining = 2, totalBufferDays = 6, onClaimWin }) {
  const [hasClaimed, setHasClaimed] = useState(false);

  if (!isOpen) return null;

  const handleClaim = () => {
    setHasClaimed(true);
    confetti({
      particleCount: 60,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#22C55E', '#FDE047', '#0F3D23']
    });
    setTimeout(() => {
      onClaimWin?.();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border-2 border-emerald-300 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Mascot & Welcome Dialogue */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 shrink-0 breath-cycle">
            <img src="/assets/mascot.png" alt="Owlnudge Mentor" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-butterYellow-300 text-forest-950 font-display font-bold text-xs shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Shame Buffer Shield</span>
            </div>
            <h3 className="font-display font-extrabold text-forest-950 text-lg sm:text-xl">
              "Welcome back, Alex! Glad you're here."
            </h3>
            <p className="text-xs text-forest-800 leading-relaxed font-sans">
              Missing days happens to every learner. We automatically used <strong>Buffer Day 1</strong> so you did not fall behind. Your target date is 100% on schedule!
            </p>
          </div>
        </div>

        {/* Visual Buffer Absorption Ledger */}
        <div className="p-4 bg-[#f8faf7] border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-display font-bold">
            <span className="text-forest-900">Timeline Protection Status:</span>
            <span className="text-emerald-700 font-mono">1 Buffer Slot Absorbed (0 Days Behind)</span>
          </div>

          {/* Progress cushion bar */}
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="w-1/3 bg-owlGreen-600 h-full" title="Completed Tasks"></div>
            <div className="w-1/6 bg-butterYellow-400 h-full" title="Buffer Absorbed"></div>
            <div className="w-1/2 bg-slate-300 h-full" title="Remaining Tasks"></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Phase 1 Progress</span>
            <span className="text-amber-800 font-bold">🛡️ Buffer Absorbed Gap</span>
            <span>Target: Unchanged</span>
          </div>
        </div>

        {/* 60-Second Dopamine Restart Win */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-forest-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-owlGreen-700" />
              <span>60-Second Restart Win</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-butterYellow-300 text-forest-950 px-2 py-0.5 rounded-full">
              +15 Momentum Pts
            </span>
          </div>
          <p className="text-xs text-forest-800">
            "Read just 1 line of recursion intuition below to re-ignite your flow state."
          </p>
          <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs font-mono text-forest-950 shadow-inner">
            "Memoization = Remembering answers so you never repeat work for the same subproblem."
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleClaim}
            disabled={hasClaimed}
            className="flex-1 py-3 bg-owlGreen-600 hover:bg-owlGreen-700 text-white font-display font-bold text-xs sm:text-sm rounded-2xl shadow-md emil-btn flex items-center justify-center gap-1.5 transition"
          >
            {hasClaimed ? (
              <>
                <Check className="w-4 h-4" />
                <span>Momentum Restored! 🚀</span>
              </>
            ) : (
              <>
                <span>Claim Restart Win & Resume Flow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
