import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Sparkles, 
  HeartPulse, 
  Shield, 
  Volume2, 
  VolumeX, 
  FileText, 
  X
} from 'lucide-react';
import { readLocalFile } from '../../services/contentFetcher';

export default function Navbar({ 
  onOpenCheckin, 
  bufferCount = 5, 
  isAudioOn = true, 
  onToggleAudio,
  onGenerateRoadmap,
  isGenerating = false,
  currentGoalTitle = ''
}) {
  const [goalInput, setGoalInput] = useState(currentGoalTitle || "Master Dynamic Programming & Recursion");
  const [targetWeeks, setTargetWeeks] = useState(3);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const fileInputRef = useRef(null);

  // Sync external roadmap title if updated
  useEffect(() => {
    if (currentGoalTitle && !uploadedFileName) {
      setGoalInput(currentGoalTitle);
    }
  }, [currentGoalTitle]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;
    onGenerateRoadmap?.({
      goalText: goalInput.trim(),
      targetWeeks: Number(targetWeeks) || 3,
      dailyMinutes: Number(dailyMinutes) || 45
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFileName(file.name);
      const fileData = await readLocalFile(file);
      setGoalInput(`Resource: ${fileData.title}`);
      onGenerateRoadmap?.({
        goalText: fileData.title,
        targetWeeks: Number(targetWeeks) || 3,
        dailyMinutes: Number(dailyMinutes) || 45,
        fileData: fileData
      });
    } catch (err) {
      console.error('File read error:', err);
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto sticky top-2 sm:top-3 z-40 mb-5 sm:mb-7 px-2 sm:px-4">
      {/* Single Unified Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-full px-3 py-2 sm:px-3.5 sm:py-2 border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(15,61,35,0.06),0_1px_3px_0_rgba(0,0,0,0.02)] flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-3 transition-all">
        
        {/* 1. Left: Brand Mascot & Logo */}
        <div className="flex items-center gap-2 shrink-0 select-none">
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center p-0.5 shrink-0 border border-emerald-100">
            <img src="/assets/mascot.png" alt="Owlnudge" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-sm text-forest-950 tracking-tight hidden sm:inline">
            Owlnudge
          </span>
        </div>

        {/* 2. Center: Unified Search, Doc Reader, Manual Timeline & Daily Cap Slicer Form */}
        <form 
          onSubmit={handleSubmit}
          className="flex-1 order-3 md:order-2 w-full md:w-auto flex items-center gap-1.5 bg-[#F8FAF8] rounded-xl sm:rounded-full px-2.5 py-1 border border-slate-200/60 transition focus-within:border-emerald-400 focus-within:bg-white"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Paste URL, syllabus, or topic to slice..."
            className="w-full bg-transparent text-xs font-medium text-forest-950 focus:outline-none placeholder:text-slate-400 min-w-[120px]"
          />

          {/* Doc Upload Input Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.txt,.pdf,.markdown"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 px-1.5 rounded-md hover:bg-slate-200/70 text-slate-500 hover:text-emerald-900 transition text-[11px] flex items-center gap-1 font-medium shrink-0"
            title="Upload .md / .pdf / .txt file"
          >
            <Upload className="w-3 h-3 text-emerald-700" />
            <span className="hidden lg:inline text-[11px]">Doc</span>
          </button>

          {goalInput && (
            <button
              type="button"
              onClick={() => {
                setGoalInput('');
                setUploadedFileName(null);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <div className="h-4 w-[1px] bg-slate-200 shrink-0 mx-0.5 hidden sm:block" />

          {/* Manual Entry Numeric Timeline Input */}
          <div className="flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/70 shrink-0" title="Weeks duration">
            <input
              type="number"
              min="1"
              max="16"
              value={targetWeeks}
              onChange={(e) => setTargetWeeks(Math.max(1, Math.min(16, Number(e.target.value) || 1)))}
              className="w-7 text-center font-mono font-bold text-xs text-forest-950 bg-transparent focus:outline-none"
            />
            <span className="text-[10px] font-mono text-slate-400 select-none">wks</span>
          </div>

          {/* Manual Entry Numeric Daily Cap Input */}
          <div className="flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-md border border-slate-200/70 shrink-0" title="Daily focus limit in minutes">
            <input
              type="number"
              min="10"
              max="180"
              step="5"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Math.max(5, Math.min(180, Number(e.target.value) || 15)))}
              className="w-8 text-center font-mono font-bold text-xs text-forest-950 bg-transparent focus:outline-none"
            />
            <span className="text-[10px] font-mono text-slate-400 select-none">m/d</span>
          </div>

          {/* Slice Goal CTA */}
          <button
            type="submit"
            disabled={isGenerating}
            className="px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition duration-100 disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">{isGenerating ? 'Slicing...' : 'Slice Goal 🛡️'}</span>
            <span className="sm:hidden">{isGenerating ? '...' : 'Slice'}</span>
          </button>
        </form>

        {/* 3. Right Corner Controls: Sound Toggle, Buffer Badge, Solid Green Check-in */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 order-2 md:order-3 ml-auto md:ml-0">
          
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
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Buffer Cushion Badge */}
          <div
            className="text-[11px] font-mono font-medium text-amber-900 bg-amber-50 px-2 sm:px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-amber-200/70 shadow-xs"
            title="Guilt-Free Buffer Days Remaining"
          >
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-bold">{bufferCount}</span>
            <span className="hidden sm:inline font-sans text-amber-900/80">Buffers</span>
          </div>

          {/* Solid Green Check-in CTA Button */}
          <button
            onClick={onOpenCheckin}
            className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition duration-150 shrink-0"
            title="1-Tap Nervous System Check-in"
          >
            <HeartPulse className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="font-sans font-medium text-[11px] sm:text-xs">Check-in</span>
          </button>

        </div>

      </div>

      {/* Uploaded File Notification Banner (if any file loaded) */}
      {uploadedFileName && (
        <div className="mt-1.5 px-3 py-1 bg-emerald-50/90 rounded-xl text-xs font-mono text-emerald-900 flex items-center justify-between border border-emerald-200/50 shadow-xs max-w-md mx-auto">
          <span className="flex items-center gap-1.5 truncate">
            <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">Resource: {uploadedFileName}</span>
          </span>
          <button
            type="button"
            onClick={() => setUploadedFileName(null)}
            className="text-emerald-700 underline text-[10px] ml-2 shrink-0 hover:text-emerald-900"
          >
            Clear
          </button>
        </div>
      )}
    </header>
  );
}
