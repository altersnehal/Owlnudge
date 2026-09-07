import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  LifeBuoy, 
  ArrowRight, 
  Shield, 
  BookOpen, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sliders,
  Search,
  Upload,
  Sparkles,
  FileText,
  X,
  Compass,
  Zap,
  RotateCcw
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { readLocalFile } from '../../services/contentFetcher';
import confetti from 'canvas-confetti';

const INSPIRATION_CHIPS = [
  { label: "📺 Huberman Focus Podcast", query: "https://www.youtube.com/watch?v=lgZ0xU5FUuY" },
  { label: "⚡ System Design & Caching", query: "Distributed Caching & Load Balancing Architecture" },
  { label: "💻 LeetCode DP Patterns", query: "Dynamic Programming Memoization Patterns" },
  { label: "🏛️ Stoic Philosophy", query: "Philosophy of Marcus Aurelius & Dichotomy of Control" },
  { label: "🧠 ADHD Dopamine Engine", query: "Neurobiology of ADHD & Overcoming Initiation Paralysis" }
];

function formatInlineText(text) {
  if (!text) return '';
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono text-[11px] bg-emerald-100/70 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-200/50">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-forest-950">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-forest-900/90">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderFormattedReading(readingText) {
  if (!readingText) return null;
  const lines = readingText.split('\n');
  let inCodeBlock = false;
  let codeBuffer = [];
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. YouTube Video Embed Tag: [youtube:VIDEO_ID:START_SECONDS]
    if (trimmed.startsWith('[youtube:') && trimmed.endsWith(']')) {
      const parts = trimmed.slice(9, -1).split(':');
      const videoId = parts[0];
      const startSeconds = parseInt(parts[1], 10) || 0;
      if (videoId) {
        elements.push(
          <div key={`yt-${i}`} className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg my-4 border border-emerald-900/20 bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${startSeconds}&rel=0`}
              title="YouTube Video Player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      }
      continue;
    }

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="p-4 bg-forest-950 text-emerald-200 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-forest-900 shadow-md my-3">
            <pre className="whitespace-pre">{codeBuffer.join('\n')}</pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="font-display font-bold text-sm sm:text-base text-forest-950 pt-3 pb-1 border-b border-emerald-100/70">
          {trimmed.replace('### ', '')}
        </h4>
      );
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <h5 key={i} className="font-bold text-xs sm:text-sm text-forest-900 pt-2 text-emerald-900">
          {trimmed.replace('#### ', '')}
        </h5>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="p-3.5 my-2.5 bg-emerald-50/90 rounded-2xl border-l-4 border-emerald-600 text-xs text-emerald-950 leading-relaxed font-sans shadow-xs">
          {formatInlineText(trimmed.replace('> ', ''))}
        </blockquote>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-1 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
          <p className="flex-1 text-xs sm:text-sm text-forest-900/90 leading-relaxed font-sans">
            {formatInlineText(trimmed.replace(/^[-*]\s+/, ''))}
          </p>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s/);
      const num = match[1];
      const rest = trimmed.slice(match[0].length);
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-1 py-1">
          <span className="font-mono text-xs font-bold text-emerald-700 shrink-0 mt-0.5">{num}.</span>
          <p className="flex-1 text-xs sm:text-sm text-forest-900/90 leading-relaxed font-sans">
            {formatInlineText(rest)}
          </p>
        </div>
      );
    } else {
      elements.push(
        <p key={i} className="text-xs sm:text-sm text-forest-900/90 leading-relaxed font-sans">
          {formatInlineText(trimmed)}
        </p>
      );
    }
  }

  return <div className="space-y-2.5">{elements}</div>;
}

export default function FocusPlanView({ 
  roadmap, 
  activeTask, 
  onSelectTaskForFocus, 
  onGenerateRoadmap,
  isGenerating = false,
  onCompleteSession,
  onOpenCheckin,
  onAbsorbBuffer,
  isAudioMuted = false
}) {
  // Focus Room State
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBrownNoiseOn, setIsBrownNoiseOn] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [expandedStepIndex, setExpandedStepIndex] = useState(0);
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Custom Time State
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState(25);

  // Ingestion / Slicer Bar State
  const [goalInput, setGoalInput] = useState(roadmap?.title || "Master Dynamic Programming & Recursion");
  const [targetWeeks, setTargetWeeks] = useState(3);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const fileInputRef = useRef(null);

  const [openMilestoneId, setOpenMilestoneId] = useState(roadmap?.milestones?.[0]?.id || 'm1');
  const focusRoomRef = useRef(null);

  // Sync active task change
  useEffect(() => {
    setActiveStepIndex(0);
    setExpandedStepIndex(0);
    setIsSessionCompleted(false);
  }, [activeTask?.id]);

  // Sync external roadmap title
  useEffect(() => {
    if (roadmap?.title && !uploadedFileName) {
      setGoalInput(roadmap.title);
    }
  }, [roadmap?.title]);

  // Stopwatch Timer loop with mechanical "tik-tik" sound
  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) return 0;
          if (!isAudioMuted) {
            audioService.playTick(prev % 2 === 1, 0.08);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleCompleteSession(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, isAudioMuted]);

  const handleSelectBurstDuration = (minutes) => {
    setIsCustomTimeOpen(false);
    const totalSecs = minutes * 60;
    setTimerDuration(totalSecs);
    setSecondsLeft(totalSecs);
    setIsRunning(false);
  };

  const handleApplyCustomMinutes = (mins) => {
    const parsed = Math.max(1, Math.min(180, Number(mins) || 25));
    setCustomMinutesInput(parsed);
    const totalSecs = parsed * 60;
    setTimerDuration(totalSecs);
    setSecondsLeft(totalSecs);
    setIsRunning(false);
  };

  const toggleBrownNoise = () => {
    if (isBrownNoiseOn) {
      audioService.stop();
      setIsBrownNoiseOn(false);
    } else {
      audioService.start('brown', 0.18);
      setIsBrownNoiseOn(true);
    }
  };

  const handleStepComplete = (index) => {
    const nextIndex = index + 1;
    setActiveStepIndex(nextIndex);
    setExpandedStepIndex(nextIndex);
    
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#10B981', '#34D399', '#FEF08A']
    });

    const totalSteps = activeTask?.microSteps?.length || 3;
    if (nextIndex >= totalSteps) {
      handleCompleteSession(false);
    }
  };

  const handleCompleteSession = (timerExpired = false) => {
    setIsRunning(false);
    audioService.stop();
    setIsBrownNoiseOn(false);
    setIsSessionCompleted(true);
    
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#10B981', '#34D399', '#6EE7B7', '#FEF08A']
    });

    const elapsedMinutes = Math.max(1, Math.round((timerDuration - secondsLeft) / 60));
    onCompleteSession?.(timerExpired ? Math.round(timerDuration / 60) : elapsedMinutes);
  };

  const handleResetSession = () => {
    setIsSessionCompleted(false);
    setSecondsLeft(timerDuration);
    setActiveStepIndex(0);
    setExpandedStepIndex(0);
    setIsRunning(false);
  };

  const handleSelectTaskAndScroll = (task) => {
    onSelectTaskForFocus(task);
    handleResetSession();
    focusRoomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerate = async (e, customQuery = null) => {
    e?.preventDefault();
    const query = customQuery || goalInput;
    if (!query.trim()) return;
    
    if (customQuery) {
      setGoalInput(customQuery);
    }

    await onGenerateRoadmap?.({ 
      goalText: query.trim(), 
      targetWeeks: Number(targetWeeks) || 3, 
      dailyMinutes: Number(dailyMinutes) || 45 
    });
    handleResetSession();
    focusRoomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFileName(file.name);
      const fileData = await readLocalFile(file);
      setGoalInput(`Resource: ${fileData.title}`);
      await onGenerateRoadmap?.({
        goalText: fileData.title,
        targetWeeks: Number(targetWeeks) || 3,
        dailyMinutes: Number(dailyMinutes) || 45,
        fileData: fileData
      });
      handleResetSession();
      focusRoomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  // Format timer display
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, ((timerDuration - secondsLeft) / timerDuration) * 100));

  const milestones = roadmap?.milestones || [];
  const microSteps = activeTask?.microSteps || [
    {
      title: "1. Scan Core Objectives (45s)",
      time: "45s",
      readingMaterial: "### 🎯 Core Focus\n\nUnderstand the primary mental model before touching code or detailed implementation."
    },
    {
      title: "2. Deep Dive & Architectural Mechanics (2m)",
      time: "2m",
      readingMaterial: "### 💡 Key Mechanism\n\nStudy how state transitions occur and verify each edge case independently."
    },
    {
      title: "3. Synthesis & Applied Practice (5m)",
      time: "5m",
      readingMaterial: "### 🛠️ Execution & Synthesis\n\nWrite down 1 core takeaway in your own words. Click **Done & Complete Step** when ready!"
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. INTENT & INGESTION STAGE: What Are We Crushing Today?                  */}
      {/* ========================================================================= */}
      <section className="text-left space-y-3">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider font-semibold">
              ADHD-Guided Slicing Engine
            </span>
          </div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
            What are we mastering today?
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Paste a YouTube video/podcast, article link, upload a syllabus, or type any topic.
          </p>
        </div>

        {/* Unified Search / URL / Topic Input Bar */}
        <form 
          onSubmit={handleGenerate} 
          className="bg-white rounded-2xl sm:rounded-3xl p-2 shadow-[0_10px_30px_-5px_rgba(15,61,35,0.06),0_1px_3px_0_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/10"
        >
          {/* Main Input */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#F8FAF8] rounded-xl sm:rounded-2xl border border-slate-200/50">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Paste YouTube URL, article, or topic (e.g. Distributed Systems)..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-forest-950 focus:outline-none placeholder:text-slate-400 font-sans"
            />
            
            {/* File Upload Trigger */}
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
              className="p-1 px-2 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-emerald-900 transition text-xs flex items-center gap-1 font-medium shrink-0"
              title="Upload Syllabus (.md / .pdf / .txt)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Doc</span>
            </button>

            {goalInput && (
              <button
                type="button"
                onClick={() => {
                  setGoalInput('');
                  setUploadedFileName(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stepper Inputs + Slice CTA */}
          <div className="flex items-center gap-1.5 justify-between sm:justify-end shrink-0">
            
            {/* Weeks Input */}
            <div className="flex items-center gap-0.5 bg-[#F8FAF8] px-2.5 py-2 rounded-xl border border-slate-200/60 shrink-0" title="Target duration in weeks">
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

            {/* Daily Mins Input */}
            <div className="flex items-center gap-0.5 bg-[#F8FAF8] px-2.5 py-2 rounded-xl border border-slate-200/60 shrink-0" title="Daily focus sprint cap in minutes">
              <input
                type="number"
                min="5"
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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-emerald-600/20 active:scale-95 transition duration-150 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Slicing...' : 'Slice Goal 🛡️'}</span>
            </button>
          </div>

        </form>

        {/* 1-Tap Quick-Start Inspiration Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1 select-none">
            Quick Ideas:
          </span>
          {INSPIRATION_CHIPS.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => handleGenerate(e, chip.query)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-forest-900/80 hover:text-forest-950 text-[11px] font-medium border border-slate-200/70 shadow-xs hover:border-emerald-300 transition active:scale-95 shrink-0 flex items-center gap-1"
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Uploaded File Notification Pill */}
        {uploadedFileName && (
          <div className="px-3.5 py-2 bg-emerald-50 rounded-2xl text-xs font-mono text-emerald-900 flex items-center justify-between border border-emerald-200/60 shadow-xs">
            <span className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate font-semibold">Active Resource: {uploadedFileName}</span>
            </span>
            <button
              type="button"
              onClick={() => setUploadedFileName(null)}
              className="text-emerald-700 underline text-[11px] ml-2 shrink-0 hover:text-emerald-900 font-sans"
            >
              Remove
            </button>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 2. HERO EXECUTION UNIT: The Active Focus Room & In-App Reader             */}
      {/* ========================================================================= */}
      <section 
        ref={focusRoomRef}
        className={`bg-white rounded-3xl p-5 sm:p-7 shadow-[0_16px_40px_-6px_rgba(15,61,35,0.08),0_2px_8px_0_rgba(0,0,0,0.02)] text-left space-y-6 border transition-all duration-300 ${
          isRunning ? 'border-emerald-400 ring-2 ring-emerald-500/10' : 'border-slate-100'
        }`}
      >
        
        {/* Active Task Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-800 uppercase tracking-wider font-bold">
              Active Focus Sprint · Step {Math.min(activeStepIndex + 1, microSteps.length)} of {microSteps.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
              ~{Math.round(timerDuration / 60)}m Block
            </span>
          </div>
        </div>

        {/* Task Title & Working Memory Intuition Anchor */}
        <div className="space-y-2.5">
          <h3 className="text-lg sm:text-2xl font-bold text-forest-950 tracking-tight leading-snug">
            {activeTask?.title || "Foundational Overview & Key Mental Models"}
          </h3>

          {activeTask?.intuitionTip && (
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/50 flex items-start gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md shrink-0 shadow-xs">
                Intuition
              </span>
              <p className="text-xs text-forest-900/90 font-sans leading-relaxed">
                {activeTask.intuitionTip}
              </p>
            </div>
          )}
        </div>

        {/* Integrated Digital Stopwatch & Tactile Joystick Controls */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-[#F8FAF8] to-emerald-50/40 rounded-3xl border border-emerald-100/60 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Digital Timer Display */}
            <div className="flex items-center gap-3">
              <div className={`font-mono text-4xl sm:text-5xl font-extrabold tracking-tight transition duration-200 ${
                isRunning ? 'text-emerald-700 animate-pulse' : 'text-forest-950'
              }`}>
                {timerFormatted}
              </div>

              {/* Tactile Start / Stop Joystick Dial */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all duration-150 border-2 ${
                    isRunning
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 ring-4 ring-rose-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 ring-4 ring-emerald-500/20'
                  }`}
                  title={isRunning ? "Pause Sprint" : "Start Focus Sprint"}
                >
                  {isRunning ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  )}
                </button>

                <button
                  onClick={handleResetSession}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Burst Durations & Sound Ambience */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              {[10, 15, 25].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSelectBurstDuration(mins)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition active:scale-95 ${
                    timerDuration === mins * 60 && !isCustomTimeOpen
                      ? 'bg-forest-950 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {mins}m
                </button>
              ))}

              <button
                onClick={() => setIsCustomTimeOpen(!isCustomTimeOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition active:scale-95 flex items-center gap-1 ${
                  isCustomTimeOpen || (timerDuration !== 10 * 60 && timerDuration !== 15 * 60 && timerDuration !== 25 * 60)
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Custom</span>
              </button>

              {/* Brown Noise Ambient Sound */}
              <button
                onClick={toggleBrownNoise}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans transition active:scale-95 flex items-center gap-1 border ${
                  isBrownNoiseOn
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200/60 hover:bg-slate-100'
                }`}
                title="Brown Noise Focus Generator"
              >
                {isBrownNoiseOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span>Noise</span>
              </button>
            </div>

          </div>

          {/* Inline Custom Minutes Stepper */}
          {isCustomTimeOpen && (
            <div className="p-2.5 bg-white rounded-2xl max-w-xs mx-auto shadow-xs border border-slate-200/70 flex items-center justify-center gap-2 animate-in fade-in duration-150">
              <span className="text-xs text-slate-500 font-sans">Set duration:</span>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutesInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomMinutesInput(val);
                  handleApplyCustomMinutes(val);
                }}
                className="w-16 px-2 py-1 bg-[#F8FAF8] rounded-lg text-center font-mono font-bold text-forest-950 text-sm border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-xs font-mono text-slate-400">mins</span>
            </div>
          )}

          {/* Sprint Progress Bar */}
          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

        </div>

        {/* Sequential Micro-Steps & In-App Reading Modules */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Micro-Steps & In-App Material
            </span>
            <span className="text-xs font-mono text-emerald-800 font-semibold">
              {microSteps.filter((_, idx) => idx < activeStepIndex).length} / {microSteps.length} Complete
            </span>
          </div>

          {microSteps.map((step, idx) => {
            const isCurrent = idx === activeStepIndex;
            const isDone = idx < activeStepIndex || isSessionCompleted;
            const isExpanded = expandedStepIndex === idx;

            const stepTitle = typeof step === 'string' ? step : step.title;
            const stepTime = typeof step === 'string' ? '2m' : step.time;
            const reading = typeof step === 'object' ? step.readingMaterial : null;

            if (isDone) {
              return (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-2xl bg-slate-50/80 flex items-center justify-between text-xs text-slate-400 border border-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <span className="line-through text-slate-400 font-medium">{stepTitle}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">Done</span>
                </div>
              );
            }

            return (
              <div 
                key={idx} 
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCurrent 
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-sm ring-1 ring-emerald-500/10' 
                    : 'bg-[#F8FAF8] border-slate-100 opacity-60'
                }`}
              >
                {/* Step Header Toggle */}
                <div 
                  onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-emerald-50/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isCurrent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-forest-950">{stepTitle}</p>
                      <p className="text-[11px] text-slate-400 font-mono">~{stepTime} · Click to expand concept</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {reading && (
                      <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/50 shadow-xs">
                        <BookOpen className="w-3 h-3 text-emerald-700" />
                        <span>Reading</span>
                      </span>
                    )}
                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* Collapsible Reading Material Container */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-emerald-100 bg-white/95 space-y-4 text-left animate-in fade-in duration-150">
                    {reading ? (
                      <div className="p-4 sm:p-5 bg-[#F8FAF8] rounded-2xl border border-emerald-100/70 text-forest-950 font-sans shadow-xs">
                        {renderFormattedReading(reading)}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-sans italic p-2">
                        Execute this micro-step in your workspace, code editor, or notepad.
                      </p>
                    )}

                    {/* Explicit "Done & Complete Step" Button */}
                    {isCurrent && (
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-sans">Absorbed this section?</span>
                        <button
                          onClick={() => handleStepComplete(idx)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-emerald-600/20 active:scale-95 transition flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Done & Complete Step</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Safety Valve & Rescue Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowStuckModal(true)}
            className="text-xs text-slate-400 hover:text-slate-700 font-sans flex items-center gap-1.5 transition"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
            <span>I'm feeling stuck / overwhelmed</span>
          </button>

          <button
            onClick={() => handleCompleteSession(false)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-1.5 rounded-full border border-emerald-200/60 transition active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mark Full Session Done</span>
          </button>
        </div>

      </section>

      {/* Emergency Calm Stuck Dialog */}
      {showStuckModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h4 className="font-display font-bold text-forest-950 text-base">
                Take a breath. No judgment.
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Initiation friction is completely normal. How can we make this moment frictionless?
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowStuckModal(false);
                  handleStepComplete(activeStepIndex);
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98 flex items-center justify-between border border-slate-100"
              >
                <span>✂️ Shrink to 10-second micro-read</span>
                <span className="text-emerald-700 font-mono text-[11px]">Easy</span>
              </button>
              
              <button
                onClick={() => {
                  setShowStuckModal(false);
                  onOpenCheckin?.();
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98 flex items-center justify-between border border-slate-100"
              >
                <span>🧘 90-second box breathing reset</span>
                <span className="text-slate-400 font-mono text-[11px]">Somatic</span>
              </button>

              <button
                onClick={() => {
                  setShowStuckModal(false);
                  onAbsorbBuffer?.();
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-amber-50 rounded-2xl text-left text-xs font-semibold text-amber-950 transition active:scale-98 flex items-center justify-between border border-amber-200/50"
              >
                <span>🛡️ Absorb into Buffer Slot (Zero Guilt)</span>
                <span className="text-amber-700 font-mono text-[11px]">Protected</span>
              </button>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setShowStuckModal(false)}
                className="w-full py-2.5 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-medium transition text-center"
              >
                Back to Focus Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ANTI-BURNOUT ROADMAP: Weekly Milestones & Buffer Cushions              */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-slate-200/60 text-left">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <h3 className="font-display font-bold text-base sm:text-lg text-forest-950">
                Anti-Burnout Roadmap
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Structured across {milestones.length} weeks with {roadmap?.bufferDaysCount || targetWeeks * 2} built-in buffer cushions.
            </p>
          </div>

          <button
            onClick={onAbsorbBuffer}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 shadow-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 self-start sm:self-auto"
            title="Absorb 1 buffer day to protect streak"
          >
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>Absorb Buffer Day</span>
          </button>
        </div>

        {/* Milestone Accordion List */}
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const isOpen = openMilestoneId === milestone.id;

            return (
              <div
                key={milestone.id}
                className="bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] overflow-hidden transition-all duration-200 border border-slate-100"
              >
                {/* Milestone Toggle Header */}
                <div
                  onClick={() => setOpenMilestoneId(isOpen ? null : milestone.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#F8FAF8] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-2xl bg-emerald-50 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-100">
                      {milestone.weekNumber ? `W${milestone.weekNumber}` : 'M1'}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-forest-950">
                        {milestone.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{milestone.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono px-2.5 py-1 bg-slate-50 rounded-xl flex items-center gap-1 border border-slate-100">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </div>

                {/* Milestone Tasks */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 space-y-2 pt-1 border-t border-slate-50">
                    {milestone.tasks.map((task) => {
                      const isBuffer = task.type === 'BUFFER';
                      const isSelected = activeTask?.id === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition ${
                            isBuffer
                              ? 'bg-amber-50/70 border border-amber-200/50 text-amber-950'
                              : isSelected
                              ? 'bg-emerald-50/80 border border-emerald-300 text-forest-950 shadow-xs'
                              : 'bg-[#F8FAF8] hover:bg-slate-100/60 border border-slate-100 text-forest-950'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-2.5">
                            {isBuffer ? (
                              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                •
                              </span>
                            )}
                            <div>
                              <p className={`text-xs ${isBuffer ? 'font-bold text-amber-900' : 'font-semibold text-forest-950'}`}>
                                {task.title}
                              </p>
                              {task.intuitionTip && (
                                <p className="text-[10px] text-slate-400 font-sans italic mt-0.5">
                                  💡 {task.intuitionTip}
                                </p>
                              )}
                            </div>
                          </div>

                          {!isBuffer ? (
                            <button
                              onClick={() => handleSelectTaskAndScroll(task)}
                              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold active:scale-95 transition duration-100 shadow-xs shrink-0 flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-forest-950 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <span>{isSelected ? 'Active' : 'Load Sprint'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full shrink-0 font-semibold">
                              Guilt-free Rest
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
}
