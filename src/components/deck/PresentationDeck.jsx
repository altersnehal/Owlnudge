import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize, 
  Play, 
  Shield, 
  Sparkles, 
  Zap, 
  Clock, 
  Compass, 
  HeartPulse, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    badge: "The Problem",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    title: "The Streak Fallacy & The ADHD Guilt Spiral",
    subtitle: "Standard productivity tools are built for linear discipline, not human neurochemistry.",
    points: [
      {
        title: "The Punishment Loop",
        desc: "Missing a single day on rigid streak-based apps triggers guilt, cognitive overload, and eventual total abandonment."
      },
      {
        title: "The Activation Energy Wall",
        desc: "ADHD minds do not lack motivation—they suffer from overwhelming task-initiation friction and working memory overload."
      },
      {
        title: "The Context-Switching Trap",
        desc: "Jumping between YouTube, articles, notes, and timers fractures attention before learning even begins."
      }
    ],
    stat: { value: "78%", label: "of learners abandon courses after missing 2 consecutive days due to guilt" },
    gradient: "from-rose-950/40 via-[#0B1E13] to-[#06120B]"
  },
  {
    id: 2,
    badge: "The Solution",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    title: "Owlnudge: Buffer-First ADHD Accountability",
    subtitle: "An empathetic learning mentor that lowers activation energy to zero and refuses to let you burn out.",
    points: [
      {
        title: "Micro-Slices Over Overwhelm",
        desc: "Deconstructs massive goals, 2-hour podcasts, and dense syllabi into single-concept 2–5 minute actionable sprints."
      },
      {
        title: "Schedule Resilience by Design",
        desc: "Buffers are engineered into the roadmap before life happens—turning missed days into scheduled guilt-free rest."
      },
      {
        title: "Single-Screen Flow State",
        desc: "Timer, resource ingestion, embedded video players, and masterclass reading passages in one unified workspace."
      }
    ],
    stat: { value: "< 15s", label: "Average time from pasting a topic to starting the first focus sprint" },
    gradient: "from-emerald-950/40 via-[#0B1E13] to-[#06120B]"
  },
  {
    id: 3,
    badge: "The Ingestion Engine",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    title: "1-Click Ingestion to In-App Micro-Learning",
    subtitle: "Paste any link, upload a doc, or enter any open-ended topic. Owlnudge handles the rest.",
    points: [
      {
        title: "YouTube Video & Podcast Slicing",
        desc: "Automatically extracts chapters with exact timestamps and embeds responsive 16:9 video players inside task cards."
      },
      {
        title: "Domain-Adaptive Masterclass Essays",
        desc: "Generates 2–4 paragraph deep-dive reading modules with first-principles mental models, code blocks, and synthesis checklists."
      },
      {
        title: "Multi-Week Milestone Progression",
        desc: "Slices topics into structured progressive phases (Foundations → Mechanics → Edge Cases & Synthesis)."
      }
    ],
    stat: { value: "100%", label: "In-app execution without tab switching or fragmented tools" },
    gradient: "from-cyan-950/40 via-[#0B1E13] to-[#06120B]"
  },
  {
    id: 4,
    badge: "The Core Moat",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    title: "The Buffer Cushion Engine",
    subtitle: "Why streak protection is the ultimate retention and learning superpower.",
    points: [
      {
        title: "2 Automatic Buffer Days Every Week",
        desc: "Every milestone automatically reserves 2 rest days. Life friction is absorbed into buffers without guilt or date shifts."
      },
      {
        title: "Neural Consolidation Protection",
        desc: "Long-term memory formation requires downtime. Buffer days give the nervous system space to lock in learning."
      },
      {
        title: "Zero Shame, 100% Streak Continuity",
        desc: "Absorb buffers with a single tap to protect your bounce-back score and preserve momentum."
      }
    ],
    stat: { value: "2x / wk", label: "Guilt-free buffer days automatically engineered into every roadmap" },
    gradient: "from-amber-950/40 via-[#0B1E13] to-[#06120B]"
  },
  {
    id: 5,
    badge: "Sensory UX",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    title: "Apple-Grade Tactile Ergonomics",
    subtitle: "Hardware-inspired sensory cues that bypass executive resistance and keep dopamine steady.",
    points: [
      {
        title: "Tactile Start/Stop Joystick Dial",
        desc: "Physical joystick-inspired toggle positioned directly beside the stopwatch for frictionless micro-initiation."
      },
      {
        title: "Mechanical Acoustic Tik-Tik Pacing",
        desc: "Subtle rhythmic audio feedback anchors working memory and maintains pacing throughout the sprint."
      },
      {
        title: "1-Tap Nervous System Check-in",
        desc: "Solid green quick-access button to recalibrate cognitive load and energy levels in real-time."
      }
    ],
    stat: { value: "0 Click", label: "Friction to start focus sprints once a concept is opened" },
    gradient: "from-purple-950/40 via-[#0B1E13] to-[#06120B]"
  },
  {
    id: 6,
    badge: "Traction & Vision",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    title: "Turning Friction into Effortless Execution",
    subtitle: "Building the default operating system for neuro-inclusive learning and deep work.",
    points: [
      {
        title: "Production Live & Deployed",
        desc: "Fully operational web platform live at owlnudge.vercel.app with instant AI ingestion and offline deterministic failover."
      },
      {
        title: "Huge Neurodivergent Market",
        desc: "Over 350M+ neurodivergent adults, knowledge workers, and self-directed learners struggling with traditional task managers."
      },
      {
        title: "The Next Frontier",
        desc: "Personalized dopamine calibration, spaced buffer scheduling, and intelligent community cohort accountability."
      }
    ],
    stat: { value: "LIVE", label: "Deployed on Vercel & ready for scale" },
    gradient: "from-emerald-900/50 via-[#0B1E13] to-[#06120B]"
  }
];

export default function PresentationDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slide = SLIDES[currentSlide];

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#07130C] text-slate-100 flex flex-col justify-between font-sans select-none overflow-hidden relative bg-gradient-to-br ${slide.gradient} transition-colors duration-700`}>
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center p-1">
            <img src="/assets/mascot.png" alt="Owlnudge" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <span>Owlnudge</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">Pitch Deck</span>
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 flex items-center gap-1.5 transition active:scale-95"
          >
            <span>Live App</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Slide Card Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-12 py-8 max-w-6xl mx-auto w-full">
        <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-300 key={slide.id}">
          
          {/* Badge & Title Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${slide.badgeColor}`}>
                {slide.badge}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Slide {currentSlide + 1} of {SLIDES.length}
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              {slide.title}
            </h2>

            <p className="text-base sm:text-xl text-slate-300 font-sans max-w-3xl leading-relaxed">
              {slide.subtitle}
            </p>
          </div>

          {/* Points Grid & Highlight Stat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {slide.points.map((pt, idx) => (
              <div 
                key={idx}
                className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-3xl p-6 backdrop-blur-xl transition duration-200 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center border border-emerald-400/20">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition">
                    {pt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Highlight Stat Box */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-emerald-900/40 to-transparent border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="font-display font-extrabold text-2xl sm:text-4xl text-emerald-400 font-mono shrink-0">
                {slide.stat.value}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-snug">
                {slide.stat.label}
              </p>
            </div>

            {currentSlide === SLIDES.length - 1 && (
              <a
                href="/"
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition active:scale-95 shrink-0"
              >
                <span>Launch Live App</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>

        </div>
      </main>

      {/* Bottom Navigation Toolbar */}
      <footer className="relative z-20 px-6 sm:px-12 py-5 flex items-center justify-between border-t border-white/5 backdrop-blur-md bg-black/30">
        
        {/* Slide Indicator Pills */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide 
                  ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`Jump to slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        {/* Previous / Next Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 border border-white/10 text-white transition active:scale-95"
            title="Previous Slide (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-mono text-slate-400 px-2 select-none">
            {currentSlide + 1} / {SLIDES.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentSlide === SLIDES.length - 1}
            className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition active:scale-95 shadow-md shadow-emerald-500/20"
            title="Next Slide (Right Arrow or Space)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </footer>

    </div>
  );
}
