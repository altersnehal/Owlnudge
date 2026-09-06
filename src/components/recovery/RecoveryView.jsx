import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function RecoveryView({ 
  bufferDaysRemaining = 5, 
  totalBufferDays = 6, 
  onClaimWin, 
  onAbsorbBuffer, 
  onResumeFocus, 
  onNavigateTab 
}) {
  const [hasClaimed, setHasClaimed] = useState(false);
  const [selectedRecoveryOption, setSelectedRecoveryOption] = useState(null);
  const [recoveredMessage, setRecoveredMessage] = useState('');

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

  const handleApplyRecovery = (option) => {
    setSelectedRecoveryOption(option);
    if (option === 'buffer') {
      onAbsorbBuffer?.();
      setRecoveredMessage('🛡️ Buffer Day absorbed seamlessly! Your target date is 100% protected and your streak shame is cleared.');
    } else if (option === 'shrink') {
      setRecoveredMessage('✂️ Today is trimmed to a single 30-second micro-read. No heavy cognitive lift needed.');
    } else if (option === 'rebalance') {
      setRecoveredMessage('🔄 Schedule rebalanced with zero crunch. Take a breath and proceed at your pace.');
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#16A34A', '#F59E0B']
    });
  };

  const absorbedCount = Math.max(0, totalBufferDays - bufferDaysRemaining);

  return (
    <div className="space-y-8 text-left max-w-xl mx-auto">
      
      {/* Top Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <button
          onClick={() => onNavigateTab?.('planner')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          <span>←</span> Planner
        </button>
        <span className="font-mono text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
          Zero-Shame Recovery Engine
        </span>
        <button
          onClick={() => onNavigateTab?.('dashboard')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          Momentum <span>→</span>
        </button>
      </div>

      {/* 1. Header with Direct Reassurance */}
      <div className="space-y-1.5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
          Zero-Shame Recovery & Buffer Ledger
        </h2>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          In traditional apps, missing a day resets your streak and triggers guilt. In Owlnudge, <strong>every plan has built-in Buffer Days</strong> so missed days are absorbed without falling behind.
        </p>
      </div>

      {/* 2. Visual Buffer Ledger Protection Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-4">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="font-display font-bold text-forest-950">Timeline Cushion Status</span>
          <span className="font-mono text-emerald-800 font-semibold">{bufferDaysRemaining} of {totalBufferDays} Buffers Available</span>
        </div>

        {/* Visual Cushion Bar */}
        <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5">
          <div className="w-1/2 bg-emerald-600 h-full rounded-l-full transition-all duration-300" title="Completed Tasks"></div>
          <div 
            style={{ width: `${Math.max(10, (absorbedCount / totalBufferDays) * 30)}%` }} 
            className="bg-amber-400 h-full transition-all duration-300" 
            title="Absorbed Buffer Slots"
          ></div>
          <div className="flex-1 bg-emerald-200/80 h-full rounded-r-full transition-all duration-300" title="Available Cushion"></div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <span className="text-emerald-700 font-semibold">● Completed</span>
          <span className="text-amber-700 font-semibold">🛡️ {absorbedCount} Buffer{absorbedCount === 1 ? '' : 's'} Absorbed</span>
          <span className="text-forest-950 font-semibold">Target Date: 100% Intact</span>
        </div>
      </div>

      {/* 3. Interactive Shame-Free Re-entry Options */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-forest-950">
            Fell off schedule or missed a day? Choose your re-entry:
          </h4>
          <span className="text-[10px] font-mono text-slate-400">Zero penalties</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          
          <button
            onClick={() => handleApplyRecovery('buffer')}
            className={`p-3.5 rounded-xl text-left space-y-1.5 transition active:scale-95 ${
              selectedRecoveryOption === 'buffer'
                ? 'bg-amber-50 shadow-sm border border-amber-300/60'
                : 'bg-[#F8FAF8] hover:bg-amber-50/50'
            }`}
          >
            <span className="text-base">🛡️</span>
            <p className="text-xs font-bold text-forest-950">Absorb Day</p>
            <p className="text-[10px] text-slate-500 font-sans leading-tight">
              Use 1 buffer slot. Keep roadmap completely unchanged.
            </p>
          </button>

          <button
            onClick={() => handleApplyRecovery('shrink')}
            className={`p-3.5 rounded-xl text-left space-y-1.5 transition active:scale-95 ${
              selectedRecoveryOption === 'shrink'
                ? 'bg-emerald-50 shadow-sm border border-emerald-300/60'
                : 'bg-[#F8FAF8] hover:bg-emerald-50/50'
            }`}
          >
            <span className="text-base">✂️</span>
            <p className="text-xs font-bold text-forest-950">Shrink Goal</p>
            <p className="text-[10px] text-slate-500 font-sans leading-tight">
              Trim today to a 30s micro-read to defeat inertia.
            </p>
          </button>

          <button
            onClick={() => handleApplyRecovery('rebalance')}
            className={`p-3.5 rounded-xl text-left space-y-1.5 transition active:scale-95 ${
              selectedRecoveryOption === 'rebalance'
                ? 'bg-emerald-50 shadow-sm border border-emerald-300/60'
                : 'bg-[#F8FAF8] hover:bg-emerald-50/50'
            }`}
          >
            <span className="text-base">🔄</span>
            <p className="text-xs font-bold text-forest-950">Rebalance</p>
            <p className="text-[10px] text-slate-500 font-sans leading-tight">
              Shift remaining steps smoothly without cramming.
            </p>
          </button>

        </div>

        {recoveredMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl text-xs font-medium font-sans flex items-center justify-between animate-in fade-in duration-150">
            <span>{recoveredMessage}</span>
          </div>
        )}
      </div>

      {/* 4. 60-Second Dopamine Re-ignition Win */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-forest-950">60-Second Dopamine Flash Win</span>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">+15 Momentum Pts</span>
        </div>
        
        <p className="text-xs text-slate-500 font-sans">
          "Read just 1 line of recursion intuition below to re-ignite your flow state without friction:"
        </p>

        <div className="p-3.5 bg-[#F8FAF8] rounded-xl text-xs font-mono text-forest-950">
          "Memoization = Remembering answers so you never repeat work for the same subproblem."
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleClaim}
            disabled={hasClaimed}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 disabled:opacity-75"
          >
            {hasClaimed ? '✓ Micro-Win Claimed!' : 'Claim Micro-Win'}
          </button>

          <button
            onClick={() => onResumeFocus?.()}
            className="px-4 py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 ml-auto"
          >
            Resume Focus Room →
          </button>
        </div>
      </div>

      {/* Bottom Help & Navigation */}
      <div className="text-center">
        <button
          onClick={() => onNavigateTab?.('dashboard')}
          className="text-xs text-slate-400 hover:text-forest-950 font-medium transition active:scale-95"
        >
          View Bounce-Back Velocity on Momentum Dashboard →
        </button>
      </div>

    </div>
  );
}
