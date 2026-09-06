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
  X
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { readLocalFile } from '../../services/contentFetcher';
import confetti from 'canvas-confetti';

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

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="p-3 bg-forest-950 text-emerald-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-forest-900 shadow-xs my-2">
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
        <h4 key={i} className="font-display font-bold text-sm sm:text-base text-forest-950 pt-2 pb-1 border-b border-emerald-100/60">
          {trimmed.replace('### ', '')}
        </h4>
      );
    } else if (trimmed.startsWith('#### ')) {
      elements.push(
        <h5 key={i} className="font-bold text-xs sm:text-sm text-forest-900 pt-1.5">
          {trimmed.replace('#### ', '')}
        </h5>
      );
    } else if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="p-3 my-2 bg-emerald-50/80 rounded-xl border-l-2 border-emerald-500 text-xs text-emerald-950 leading-relaxed">
          {formatInlineText(trimmed.replace('> ', ''))}
        </blockquote>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-1 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
          <p className="flex-1 text-xs sm:text-sm text-forest-900/90 leading-relaxed">
            {formatInlineText(trimmed.replace(/^[-*]\s+/, ''))}
          </p>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s/);
      const num = match[1];
      const rest = trimmed.slice(match[0].length);
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-1 py-0.5">
          <span className="font-mono text-xs font-bold text-emerald-700 shrink-0 mt-0.5">{num}.</span>
          <p className="flex-1 text-xs sm:text-sm text-forest-900/90 leading-relaxed">
            {formatInlineText(rest)}
          </p>
        </div>
      );
    } else {
      elements.push(
        <p key={i} className="text-xs sm:text-sm text-forest-900/90 leading-relaxed">
          {formatInlineText(trimmed)}
        </p>
      );
    }
  }

  return <div className="space-y-2">{elements}</div>;
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

  // Custom / Manual Time Selection State
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState(false);
  const [customMinutesInput, setCustomMinutesInput] = useState(25);

  // Ingestion / Slicer Bar State (Positioned below the time block)
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
    if (index === activeStepIndex) {
      const nextIndex = index + 1;
      setActiveStepIndex(nextIndex);
      setExpandedStepIndex(nextIndex);
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#16A34A', '#FEF08A']
      });

      const totalSteps = activeTask?.microSteps?.length || 3;
      if (nextIndex >= totalSteps) {
        handleCompleteSession(false);
      }
    }
  };

  const handleCompleteSession = (timerExpired = false) => {
    setIsRunning(false);
    audioService.stop();
    setIsBrownNoiseOn(false);
    setIsSessionCompleted(true);
    confetti({
      particleCount: 85,
      spread: 95,
      origin: { y: 0.55 },
      colors: ['#16A34A', '#34D399', '#FEF08A']
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

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;
    await onGenerateRoadmap?.({ 
      goalText: goalInput.trim(), 
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
      console.error('File read error:', err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const microSteps = activeTask?.microSteps || [
    {
      title: 'Scan Core Objectives & Thesis (45s)',
      time: '45s',
      readingMaterial: `### 🎯 Core Focus Objectives - Foundational Overview & Key Mental Models

The primary goal of this sprint is establishing a rock-solid mental framework without getting trapped in cognitive overload or premature rabbit holes.

#### Key Principles:
1. **The 80/20 Foundation**: 80% of real-world outcomes in this subject stem from mastering 3 core primitives. Our focus is zeroing in on those foundational primitives before touching secondary edge cases.
2. **First-Principles Thinking**: Rather than memorizing rules or steps by rote, understand the root problem that forced the creation of this paradigm. When you understand *why* a constraint exists, the solution becomes self-evident.
3. **Working Memory Conservation**: Neurodivergent learners excel when concepts are chunked into self-contained units. Read this overview once to form an overarching mental map, then move directly to step 2.`
    },
    {
      title: 'Deep Concept Reading: The Execution Architecture (2m)',
      time: '2m',
      readingMaterial: `### 💡 Primary Architecture & Framework

To master this subject, break the entire domain into three continuous operational layers:

#### 1. Input & Initiation Layer
Every effective system starts with unambiguous inputs. In this domain, failure to define boundary conditions early leads to cognitive friction and analysis paralysis. Always ask: *"What are the non-negotiable inputs required to trigger execution?"*

#### 2. Processing & State Transition
At its core, this concept transforms raw inputs into structured outcomes through a series of deterministic state changes. When dissecting any complex problem:
- Isolate the individual transformations one step at a time.
- Verify each intermediate state independently before coupling them together.
- Keep state mutations localized and predictable.

#### 3. Output Validation & Feedback Loops
Without an immediate feedback loop, learning decay occurs within hours. Build a micro-verification checkpoint after each concept to prove that your mental model matches reality.

> **💡 Mental Model Takeaway:**
> A simple model that you can execute under stress is 10x more valuable than a complex model you abandon.`
    },
    {
      title: 'Practical Synthesis & Reflection Prompt (5m)',
      time: '5m',
      readingMaterial: `### 🛠️ Synthesis & Real-World Application

Now that the core principles and architecture are clear, let's cement the knowledge into long-term memory.

#### Reflection Checklist:
- Can you explain the core mechanism in 2 sentences to someone outside the field?
- Where is the single biggest point of friction when applying this concept, and how does the framework bypass it?
- What is one tangible project or problem you can test this on today?

Once you have read and internalized these three pillars, hit **Done & Complete Step** below to seal the loop!`
    }
  ];

  const milestones = roadmap?.milestones || [];

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      
      {/* ========================================================================= */}
      {/* 1. TOP: COMPANION MASCOT & BIG STOPWATCH TIMER                            */}
      {/* ========================================================================= */}
      <section ref={focusRoomRef} className="space-y-4 text-center pt-2">
        
        {/* Companion Mascot & Ambient Prompt */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50/80 p-2 flex items-center justify-center transition-all duration-300 ${isRunning ? 'animate-breath scale-105' : ''}`}>
            <img src="/assets/mascot.png" alt="Owlnudge Companion" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs text-forest-800/80 font-sans max-w-xs transition-opacity duration-200">
            {isSessionCompleted
              ? "Sprint completed! Notice how good closure feels."
              : isRunning
              ? "I'm sitting beside you. Read Step 1 and press Done."
              : "Ready when you are. Press Start Sprint to begin."}
          </p>
        </div>

        {/* Apple-Style Stopwatch Digital Timer with Tactile Start/Stop Joystick Dial */}
        <div className="space-y-3 select-none">
          <div className="flex items-center justify-center gap-3.5 sm:gap-5">
            {/* Big Digital Timer Display */}
            <div className="font-mono font-semibold text-6xl sm:text-7xl text-forest-950 tracking-tight">
              {formatTime(secondsLeft)}
            </div>

            {/* Tactile Start / Stop Joystick Switch Button */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`group relative flex items-center justify-center transition-all duration-200 active:scale-90 focus:outline-none shrink-0 ${
                isRunning
                  ? 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-amber-500 text-white shadow-[0_8px_20px_-3px_rgba(245,158,11,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-amber-300'
                  : 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-emerald-600 text-white shadow-[0_8px_24px_-4px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border-2 border-emerald-400 hover:bg-emerald-500'
              }`}
              title={isRunning ? "Pause Sprint" : "Start Sprint"}
            >
              {/* Internal Bezel Depth */}
              <span className="absolute inset-1 rounded-xl sm:rounded-2xl border border-white/30 pointer-events-none" />
              
              {/* Joystick Icon & Label */}
              <div className={`flex flex-col items-center justify-center transition-transform duration-150 ${isRunning ? 'scale-95' : 'group-hover:scale-105'}`}>
                {isRunning ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                )}
                <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider font-bold mt-0.5 opacity-90">
                  {isRunning ? "PAUSE" : "START"}
                </span>
              </div>

              {/* Gentle Active Glow Ring */}
              {isRunning && (
                <span className="absolute -inset-1 rounded-2xl sm:rounded-3xl border-2 border-amber-400/50 animate-ping pointer-events-none" />
              )}
            </button>
          </div>

          {/* Attention Burst Pacing Selectors */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
            <button
              onClick={() => handleSelectBurstDuration(10)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition active:scale-95 ${
                timerDuration === 10 * 60 && !isCustomTimeOpen
                  ? 'bg-forest-950 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-500'
              }`}
            >
              10m Burst
            </button>
            <button
              onClick={() => handleSelectBurstDuration(15)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition active:scale-95 ${
                timerDuration === 15 * 60 && !isCustomTimeOpen
                  ? 'bg-forest-950 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-500'
              }`}
            >
              15m Steady
            </button>
            <button
              onClick={() => handleSelectBurstDuration(25)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition active:scale-95 ${
                timerDuration === 25 * 60 && !isCustomTimeOpen
                  ? 'bg-forest-950 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-500'
              }`}
            >
              25m Sprint
            </button>

            {/* Manual / Custom Time Button */}
            <button
              onClick={() => setIsCustomTimeOpen(!isCustomTimeOpen)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition active:scale-95 flex items-center gap-1 ${
                isCustomTimeOpen || (timerDuration !== 10 * 60 && timerDuration !== 15 * 60 && timerDuration !== 25 * 60)
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-500'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Manual</span>
            </button>
          </div>

          {/* Inline Custom Minutes Stepper / Input */}
          {isCustomTimeOpen && (
            <div className="p-2.5 bg-white rounded-2xl max-w-xs mx-auto shadow-sm border border-slate-100 flex items-center justify-center gap-2 animate-in fade-in duration-150">
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
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. MIDDLE: RESOURCE & GOAL SLICER BAR (Between Timer & Active Task)       */}
      {/* ========================================================================= */}
      <section className="text-left">
        <form 
          onSubmit={handleGenerate} 
          className="bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-[0_8px_24px_-4px_rgba(15,61,35,0.04)] border border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 transition-all focus-within:border-emerald-300"
        >
          {/* Search / URL / Topic Input */}
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#F8FAF8] rounded-xl sm:rounded-2xl border border-slate-200/50">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Paste article URL, course link, or topic..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-forest-950 focus:outline-none placeholder:text-slate-400"
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
              className="p-1 px-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-emerald-900 transition text-[11px] flex items-center gap-1 font-medium shrink-0"
              title="Upload .md / .pdf / .txt file"
            >
              <Upload className="w-3 h-3 text-emerald-700" />
              <span className="text-xs">Doc</span>
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
          </div>

          {/* Integrated Manual Timeline & Daily Cap Numeric Inputs + Slice CTA */}
          <div className="flex items-center gap-1.5 justify-between sm:justify-end shrink-0">
            
            {/* Manual Timeline Input (Weeks) */}
            <div className="flex items-center gap-0.5 bg-[#F8FAF8] px-2 py-1.5 rounded-xl border border-slate-200/60 shrink-0" title="Timeline duration in weeks">
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

            {/* Manual Daily Cap Input (Mins) */}
            <div className="flex items-center gap-0.5 bg-[#F8FAF8] px-2 py-1.5 rounded-xl border border-slate-200/60 shrink-0" title="Daily focus cap in minutes">
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
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition duration-100 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Slicing...' : 'Slice Goal 🛡️'}</span>
            </button>
          </div>

        </form>

        {/* Uploaded File Notification Pill */}
        {uploadedFileName && (
          <div className="mt-2 px-3 py-1.5 bg-emerald-50 rounded-xl text-xs font-mono text-emerald-900 flex items-center justify-between border border-emerald-200/50 shadow-xs">
            <span className="flex items-center gap-1.5 truncate">
              <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">Resource: {uploadedFileName}</span>
            </span>
            <button
              type="button"
              onClick={() => setUploadedFileName(null)}
              className="text-emerald-700 underline text-[11px] ml-2 shrink-0 hover:text-emerald-900"
            >
              Remove
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. ACTIVE FOCUS TASK CARD (Execution Hero)                                */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_12px_32px_-4px_rgba(15,61,35,0.06),0_2px_6px_0_rgba(0,0,0,0.02)] text-left space-y-4 border border-slate-100">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider font-semibold">
              Active Focus Task
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            ~{Math.round(timerDuration / 60)} mins
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-forest-950 leading-snug">
            {activeTask?.title || "Foundational Overview & Key Mental Models"}
          </h3>

          {/* Slop-Free Typography-First Working Memory Anchor */}
          {activeTask?.intuitionTip && (
            <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 select-none">
                Intuition
              </span>
              <p className="text-xs text-forest-900/80 font-sans leading-relaxed">
                {activeTask.intuitionTip}
              </p>
            </div>
          )}
        </div>

        {/* Sequential Micro-Steps with Expandable Reading Passages */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Micro-Steps & Reading Material
          </span>

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
                  className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs text-slate-400 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <span className="line-through text-slate-400">{stepTitle}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-medium">Completed</span>
                </div>
              );
            }

            return (
              <div 
                key={idx} 
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCurrent 
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-xs' 
                    : 'bg-[#F8FAF8] border-slate-100 opacity-60'
                }`}
              >
                {/* Step Header Toggle */}
                <div 
                  onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-emerald-50/70 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-forest-950">{stepTitle}</p>
                      <p className="text-[10px] text-slate-400 font-mono">~{stepTime} · Click to view concept</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {reading && (
                      <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/50">
                        <BookOpen className="w-3 h-3" />
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
                  <div className="px-4 pb-4 pt-2.5 border-t border-emerald-100 bg-white/95 space-y-3.5 text-left animate-in fade-in duration-150">
                    {reading ? (
                      <div className="p-4 bg-[#F8FAF8] rounded-2xl border border-emerald-100/70 text-forest-950 font-sans shadow-xs">
                        {renderFormattedReading(reading)}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-sans italic p-2">
                        Execute this micro-step in your workspace, code editor, or notepad.
                      </p>
                    )}

                    {/* Explicit "Done & Complete Step" Button */}
                    {isCurrent && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-sans">Finished absorbing this section?</span>
                        <button
                          onClick={() => handleStepComplete(idx)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
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

      </section>

      {/* ========================================================================= */}
      {/* 4. TACTILE CONTROL BAR (Brown Noise, Stuck, Done)                         */}
      {/* ========================================================================= */}
      <section className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        
        {/* Brown Noise Generator */}
        <button
          onClick={toggleBrownNoise}
          className={`px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition-all duration-150 ${
            isBrownNoiseOn
              ? 'bg-emerald-100 text-emerald-900 font-semibold'
              : 'bg-white hover:bg-slate-50 text-forest-900 border border-slate-200/60'
          }`}
        >
          {isBrownNoiseOn ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{isBrownNoiseOn ? 'Brown Noise (On)' : 'Brown Noise'}</span>
        </button>

        {/* I'm Feeling Stuck Helper */}
        <button
          onClick={() => setShowStuckModal(true)}
          className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-700 font-sans active:scale-95 transition duration-100 flex items-center gap-1.5"
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>I'm feeling stuck</span>
        </button>

        {/* Session Complete Button */}
        <button
          onClick={() => handleCompleteSession(false)}
          className="px-4 py-2.5 rounded-full text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm active:scale-95 transition-all duration-150 flex items-center gap-1.5"
          title="Mark session complete and record focus time"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Done</span>
        </button>

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
                Initiation friction happens to everyone. How can we make this moment easier?
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowStuckModal(false);
                  handleStepComplete(activeStepIndex);
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98 flex items-center justify-between"
              >
                <span>✂️ Shrink to 10-second micro-read</span>
                <span className="text-emerald-700 font-mono text-[11px]">Easy</span>
              </button>
              
              <button
                onClick={() => {
                  setShowStuckModal(false);
                  onOpenCheckin?.();
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-emerald-50 rounded-2xl text-left text-xs font-semibold text-forest-950 transition active:scale-98 flex items-center justify-between"
              >
                <span>🧘 90-second box breathing reset</span>
                <span className="text-slate-400 font-mono text-[11px]">Somatic</span>
              </button>

              <button
                onClick={() => {
                  setShowStuckModal(false);
                  onAbsorbBuffer?.();
                }}
                className="w-full p-3.5 bg-[#F8FAF8] hover:bg-amber-50 rounded-2xl text-left text-xs font-semibold text-amber-950 transition active:scale-98 flex items-center justify-between"
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
      {/* 5. THE LIVING CURRICULUM ROADMAP (Weekly Milestone Drawer)                 */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-6 border-t border-slate-200/60 text-left">
        
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <h3 className="font-display font-bold text-sm sm:text-base text-forest-950">
              Curriculum Roadmap Overview
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click any task to load into Focus Room
          </span>
        </div>

        {/* Milestone Accordion List */}
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const isOpen = openMilestoneId === milestone.id;

            return (
              <div
                key={milestone.id}
                className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] overflow-hidden transition-all duration-200 border border-slate-100"
              >
                {/* Milestone Toggle Header */}
                <div
                  onClick={() => setOpenMilestoneId(isOpen ? null : milestone.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#F8FAF8] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {milestone.weekNumber ? `M${milestone.weekNumber}` : 'M1'}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-forest-950">
                        {milestone.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{milestone.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-50 rounded-lg flex items-center gap-1">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </div>

                {/* Milestone Tasks */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 space-y-2 pt-1">
                    {milestone.tasks.map((task) => {
                      const isBuffer = task.type === 'BUFFER';
                      const isSelected = activeTask?.id === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-xl flex items-center justify-between gap-3 transition ${
                            isBuffer
                              ? 'bg-amber-50/70 text-amber-950'
                              : isSelected
                              ? 'bg-emerald-50/80 border border-emerald-300/80 text-forest-950'
                              : 'bg-[#F8FAF8] hover:bg-slate-100/60 text-forest-950'
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
                              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold active:scale-95 transition duration-100 shadow-sm shrink-0 flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-forest-950 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <span>{isSelected ? 'Active' : 'Focus & Read'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md shrink-0">
                              Guilt-free
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
