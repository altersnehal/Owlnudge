import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function RecoveryModal({ isOpen, onClose, bufferDaysRemaining = 2, totalBufferDays = 6, onClaimWin }) {
  const [hasClaimed, setHasClaimed] = useState(false);

  if (!isOpen) return null;

  const handleClaim = () => {
    setHasClaimed(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16A34A', '#FEF08A']
    });
    setTimeout(() => {
      onClaimWin?.();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Top Companion & Dialogue */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 p-2 shrink-0 flex items-center justify-center">
            <img src="/assets/mascot.png" alt="Owlnudge Mentor" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-forest-950">
              Welcome back. Glad you're here.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Missing days happens to everyone. We automatically absorbed yesterday into <strong>Buffer Day 1</strong>. Your timeline is 100% on schedule.
            </p>
          </div>
        </div>

        {/* Quiet Buffer Status Bar */}
        <div className="p-4 bg-[#F8FAF8] rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 font-sans">Buffer Cushion Status</span>
            <span className="font-mono text-emerald-800 font-semibold">{bufferDaysRemaining} slots available</span>
          </div>
          <div className="h-2 bg-black/[0.05] rounded-full overflow-hidden flex">
            <div className="w-1/2 bg-emerald-500 h-full rounded-full"></div>
            <div className="w-1/4 bg-amber-300 h-full"></div>
          </div>
        </div>

        {/* 60-Second Re-ignition */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-forest-950">60-Second Restart Win</span>
          <p className="text-xs text-slate-500 font-sans italic">
            "Memoization = Remembering answers so you never repeat work for the same subproblem."
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClaim}
          disabled={hasClaimed}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm active:scale-95 transition duration-100"
        >
          {hasClaimed ? '✓ Momentum Restored' : 'Resume Flow →'}
        </button>

      </div>
    </div>
  );
}
