import React, { useState } from 'react';
import { exportToMarkdown } from '../../services/storageService';

export default function MomentumDashboard({ roadmap, stats, onNavigateTab }) {
  const [activeTipCategory, setActiveTipCategory] = useState('all');
  const [checkedPractices, setCheckedPractices] = useState({
    p1: true,
    p2: false,
    p3: true
  });

  const handleExport = () => {
    exportToMarkdown(roadmap, stats);
  };

  const togglePractice = (id) => {
    setCheckedPractices(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const tips = [
    {
      id: 'bounce',
      category: 'bounce',
      icon: '🚀',
      title: 'Maintain 100% Bounce-Back Velocity',
      subtitle: 'Defeat the "all-or-nothing" ADHD streak trap',
      advice: 'Never force a 3-hour marathon catch-up after missing a day. Shrink today into a single 30-second micro-read. Neural momentum cares about continuity, not volume.'
    },
    {
      id: 'buffer',
      category: 'buffer',
      icon: '🛡️',
      title: 'Treat Buffer Days as Planned Rest',
      subtitle: 'Neural consolidation prevents dopamine depletion',
      advice: 'Your roadmap reserves 2 Buffer Days every week. When life happens, absorb the delay into a buffer slot with zero guilt—your target completion date remains 100% intact.'
    },
    {
      id: 'focus',
      category: 'focus',
      icon: '⏱️',
      title: 'Calibrate Sprint Duration to Energy',
      subtitle: 'Brown noise + 25-minute caps for smooth activation',
      advice: 'Avoid marathon focus binges. Two 25-minute brown noise sprints with a 90-second somatic breath reset creates deeper memory retention than an exhausting 4-hour cram session.'
    },
    {
      id: 'somatic',
      category: 'somatic',
      icon: '🌿',
      title: '1-Tap Nervous System Triage',
      subtitle: 'Pacing that respects brain fog',
      advice: 'Tap Check-in at the top right before starting. On low-energy days, the app downshifts tasks to 30-second micro-steps so you never freeze at the starting line.'
    }
  ];

  const filteredTips = activeTipCategory === 'all' 
    ? tips 
    : tips.filter(t => t.category === activeTipCategory);

  return (
    <div className="space-y-8 text-left max-w-xl mx-auto">
      
      {/* Top Breadcrumb & Quick Nav */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <button
          onClick={() => onNavigateTab?.('bodydouble')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          <span>←</span> Focus Room
        </button>
        <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
          Momentum & Coaching Insights
        </span>
        <button
          onClick={() => onNavigateTab?.('planner')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          Planner <span>→</span>
        </button>
      </div>

      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
            Momentum Overview
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Bounce-back velocity and buffer health over rigid guilt-based streaks.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-forest-950 hover:bg-forest-900 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 flex items-center justify-center gap-1.5"
          title="Export plan and momentum metrics as clean Markdown file"
        >
          <span>📥</span>
          <span>Export Roadmap (.md)</span>
        </button>
      </div>

      {/* 3 Calm Metric Cards (Depth-driven surface, NO heavy borders) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider">Bounce-Back</span>
          <p className="text-xl sm:text-2xl font-display font-bold text-forest-950">{stats?.bounceBackScore || 100}%</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-sans block">Shield active</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider">Focus Time</span>
          <p className="text-xl sm:text-2xl font-display font-bold text-forest-950">{stats?.focusMinutes || 50}m</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-sans block">Zero burnout</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-1">
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider">Buffer Slots</span>
          <p className="text-xl sm:text-2xl font-display font-bold text-forest-950">{stats?.buffersRemaining ?? 5}</p>
          <span className="text-[10px] sm:text-[11px] text-amber-700 font-sans block">Rest protected</span>
        </div>
      </div>

      {/* Section: Actionable Tips to Improve Stats */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-forest-950">
              Personalized Tips to Improve Your Stats
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Tactical micro-adjustments for neurodivergent consistency.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
            <button
              onClick={() => setActiveTipCategory('all')}
              className={`px-2.5 py-1 rounded-full transition active:scale-95 whitespace-nowrap ${
                activeTipCategory === 'all'
                  ? 'bg-forest-950 text-white font-medium'
                  : 'bg-white text-slate-500 hover:text-forest-950'
              }`}
            >
              All Tips
            </button>
            <button
              onClick={() => setActiveTipCategory('bounce')}
              className={`px-2.5 py-1 rounded-full transition active:scale-95 whitespace-nowrap ${
                activeTipCategory === 'bounce'
                  ? 'bg-forest-950 text-white font-medium'
                  : 'bg-white text-slate-500 hover:text-forest-950'
              }`}
            >
              🚀 Velocity
            </button>
            <button
              onClick={() => setActiveTipCategory('buffer')}
              className={`px-2.5 py-1 rounded-full transition active:scale-95 whitespace-nowrap ${
                activeTipCategory === 'buffer'
                  ? 'bg-forest-950 text-white font-medium'
                  : 'bg-white text-slate-500 hover:text-forest-950'
              }`}
            >
              🛡️ Buffers
            </button>
            <button
              onClick={() => setActiveTipCategory('focus')}
              className={`px-2.5 py-1 rounded-full transition active:scale-95 whitespace-nowrap ${
                activeTipCategory === 'focus'
                  ? 'bg-forest-950 text-white font-medium'
                  : 'bg-white text-slate-500 hover:text-forest-950'
              }`}
            >
              ⏱️ Focus
            </button>
          </div>
        </div>

        {/* Tip Cards */}
        <div className="space-y-3">
          {filteredTips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-2 transition hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{tip.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-forest-950">{tip.title}</h4>
                  <p className="text-[10px] font-mono text-slate-400">{tip.subtitle}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-sans leading-relaxed pl-7">
                {tip.advice}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Section: ADHD Habit Checklist */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-3">
        <h4 className="text-xs font-bold text-forest-950">Daily ADHD Alignment Checklist</h4>
        
        <div className="space-y-2">
          <div 
            onClick={() => togglePractice('p1')}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAF8] hover:bg-emerald-50/50 cursor-pointer select-none transition"
          >
            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${checkedPractices.p1 ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
              {checkedPractices.p1 ? '✓' : ''}
            </span>
            <span className={`text-xs ${checkedPractices.p1 ? 'text-forest-950 font-medium' : 'text-slate-500'}`}>
              Completed 1-tap nervous system check-in before sprinting
            </span>
          </div>

          <div 
            onClick={() => togglePractice('p2')}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAF8] hover:bg-emerald-50/50 cursor-pointer select-none transition"
          >
            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${checkedPractices.p2 ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
              {checkedPractices.p2 ? '✓' : ''}
            </span>
            <span className={`text-xs ${checkedPractices.p2 ? 'text-forest-950 font-medium' : 'text-slate-500'}`}>
              Practiced 90s box breathing to restore dopamine
            </span>
          </div>

          <div 
            onClick={() => togglePractice('p3')}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAF8] hover:bg-emerald-50/50 cursor-pointer select-none transition"
          >
            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${checkedPractices.p3 ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
              {checkedPractices.p3 ? '✓' : ''}
            </span>
            <span className={`text-xs ${checkedPractices.p3 ? 'text-forest-950 font-medium' : 'text-slate-500'}`}>
              Absorbed life delay into buffer cushion with zero guilt
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Launch CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onNavigateTab?.('planner')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-forest-950 text-xs font-semibold shadow-xs active:scale-95 transition text-center"
        >
          Review Roadmap in Planner →
        </button>
        <button
          onClick={() => onNavigateTab?.('bodydouble')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition text-center"
        >
          Start 25m Focus Sprint →
        </button>
      </div>

    </div>
  );
}
