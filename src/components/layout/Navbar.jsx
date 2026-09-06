import React from 'react';
import { HeartPulse, Shield, Volume2, VolumeX } from 'lucide-react';

export default function Navbar({ 
  onOpenCheckin, 
  bufferCount = 5, 
  isAudioOn = true, 
  onToggleAudio 
}) {
  return (
    <header className="w-full max-w-xl mx-auto sticky top-3 sm:top-4 z-40 mb-4 sm:mb-6 px-3 sm:px-4">
      {/* Single, cohesive Apple-grade top bar */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-full px-4 py-2 flex items-center justify-between gap-3 border border-white/80 shadow-[0_10px_30px_-5px_rgba(15,61,35,0.05),0_1px_3px_0_rgba(0,0,0,0.02)]">
        
        {/* Left: Brand Logo & Mascot */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center p-0.5 shrink-0 border border-emerald-100">
            <img src="/assets/mascot.png" alt="Owlnudge" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-sm text-forest-950 tracking-tight">Owlnudge</span>
        </div>

        {/* Right Corner Controls (Audio toggle, Buffer pill, Green Check-in CTA) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Sound On/Off Toggle Button */}
          <button
            onClick={onToggleAudio}
            className={`p-1.5 sm:p-2 rounded-full border shadow-xs active:scale-95 transition duration-150 ${
              isAudioOn
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
            }`}
            title={isAudioOn ? "Sound & Tik-Tik (Active)" : "Sound (Muted)"}
          >
            {isAudioOn ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Buffer Cushion Badge */}
          <div
            className="text-[11px] font-mono font-medium text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-200/70 shadow-xs"
            title="Active Buffer Days Cushion"
          >
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-bold">{bufferCount}</span>
            <span className="hidden sm:inline font-sans text-amber-900/80">Buffers</span>
          </div>

          {/* Solid Green Check-in CTA Button */}
          <button
            onClick={onOpenCheckin}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition duration-150 shrink-0"
            title="1-Tap Nervous System Check-in"
          >
            <HeartPulse className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="font-sans font-medium text-[11px] sm:text-xs">Check-in</span>
          </button>

        </div>

      </div>
    </header>
  );
}
