import React from 'react';
import { HeartPulse, Shield, Volume2, VolumeX } from 'lucide-react';

export default function Navbar({ 
  onOpenCheckin, 
  bufferCount = 5, 
  isAudioOn = true, 
  onToggleAudio 
}) {
  return (
    <header className="w-full max-w-2xl mx-auto sticky top-3 sm:top-4 z-40 mb-6 sm:mb-8 px-3 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left: Brand Pill */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-full px-4 py-2 flex items-center gap-2.5 border border-white/80 shadow-[0_8px_24px_-4px_rgba(15,61,35,0.04)] select-none">
          <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center p-0.5 shrink-0">
            <img src="/assets/mascot.png" alt="Owlnudge" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-sm text-forest-950 tracking-tight">Owlnudge</span>
        </div>

        {/* Right Corner Group: Sound Toggle, Buffer Pill & Solid Green Check-in Button */}
        <div className="flex items-center gap-2">
          
          {/* Top-Right Sound On/Off Toggle Button */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-full border shadow-xs active:scale-95 transition duration-150 ${
              isAudioOn
                ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200/60 hover:bg-emerald-100'
                : 'bg-white/90 text-slate-400 border-slate-200/60 hover:text-slate-600'
            }`}
            title={isAudioOn ? "Sound Effects & Tik-Tik (On)" : "Sound Effects (Muted)"}
          >
            {isAudioOn ? (
              <Volume2 className="w-4 h-4 text-emerald-700 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Buffer Cushion Pill */}
          <div
            className="text-[11px] font-mono font-medium text-amber-900 bg-amber-50/90 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-amber-200/60 shadow-xs backdrop-blur-md"
            title="Active Buffer Days Cushion"
          >
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-bold">{bufferCount}</span>
            <span className="hidden sm:inline font-sans text-amber-900/80">Buffers</span>
          </div>

          {/* Standalone Solid Green Check-in Button at Top Right */}
          <button
            onClick={onOpenCheckin}
            className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition duration-150 shrink-0"
            title="1-Tap Nervous System & Somatic Check-in"
          >
            <HeartPulse className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="font-sans font-medium text-[11px] sm:text-xs">Check-in</span>
          </button>

        </div>

      </div>
    </header>
  );
}
