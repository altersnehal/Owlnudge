import React from 'react';
import { HeartPulse, Shield } from 'lucide-react';

export default function Navbar({ onOpenCheckin, bufferCount = 5, activeGoalTitle }) {
  return (
    <header className="w-full max-w-3xl mx-auto sticky top-3 sm:top-4 z-40 mb-6 sm:mb-8 px-3 sm:px-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-full px-3.5 sm:px-4 py-2 flex items-center justify-between gap-3 shadow-[0_8px_32px_0_rgba(15,61,35,0.06),0_1px_2px_0_rgba(0,0,0,0.02)]">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-full bg-emerald-50/90 flex items-center justify-center p-0.5 shrink-0 shadow-sm">
            <img src="/assets/mascot.png" alt="Owlnudge Mascot" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-sm text-forest-950 tracking-tight">Owlnudge</span>
        </div>

        {/* Center: Quiet Active Goal Pill */}
        {activeGoalTitle && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/[0.03] rounded-full text-xs text-forest-900/80 font-medium truncate max-w-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate">{activeGoalTitle}</span>
          </div>
        )}

        {/* Right Actions: Standalone Check-in Button + Buffer Cushion Pill */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Prominent Quick Check-in CTA */}
          <button
            onClick={onOpenCheckin}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/60 shadow-sm active:scale-95 transition duration-150"
            title="1-Tap Nervous System & Somatic Reset"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="font-sans font-medium text-[11px] sm:text-xs">Check-in</span>
          </button>

          {/* Buffer Cushion Pill */}
          <div
            className="text-[11px] font-mono font-medium text-amber-800 bg-amber-50/90 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-200/50 shadow-xs"
            title="Active Buffer Days Cushion"
          >
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-bold">{bufferCount}</span>
            <span className="hidden md:inline font-sans text-amber-800/80">Buffers</span>
          </div>

        </div>

      </div>
    </header>
  );
}
