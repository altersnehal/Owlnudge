import React from 'react';
import { Award, Zap, Shield, FileDown, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { exportToMarkdown } from '../../services/storageService';
import confetti from 'canvas-confetti';

export default function MomentumDashboard({ roadmap, stats }) {
  const handleExport = () => {
    exportToMarkdown(roadmap, stats);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Banner with Stats */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-forest-800 uppercase tracking-wide">METRICS & ANALYTICS</span>
            <h2 className="text-2xl font-display font-black text-forest-950 mt-0.5">
              Momentum & Resilience Overview
            </h2>
            <p className="text-xs text-forest-700">Tracking bounce-back velocity over rigid consecutive streaks.</p>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-forest-900 hover:bg-forest-800 text-white font-display font-bold text-xs rounded-2xl shadow-sm emil-btn flex items-center gap-1.5 self-start sm:self-auto transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Roadmap (.md)</span>
          </button>
        </div>

        {/* 4 Primary Metric Cards (Moodboard Dashboard Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-forest-800 uppercase">Bounce-Back</span>
              <Award className="w-4 h-4 text-owlGreen-600" />
            </div>
            <div className="text-2xl font-display font-extrabold text-forest-950">
              {stats?.bounceBackScore || 100}%
            </div>
            <div className="text-[10px] text-owlGreen-800 font-bold bg-owlGreen-100 px-2 py-0.5 rounded-full inline-block">
              Fastest Recovery Rate
            </div>
          </div>

          <div className="p-4 bg-butterYellow-50/80 border border-butterYellow-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-forest-800 uppercase">Focus Minutes</span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-display font-extrabold text-forest-950">
              {stats?.focusMinutes || 50}m
            </div>
            <div className="text-[10px] text-amber-800 font-bold bg-butterYellow-200 px-2 py-0.5 rounded-full inline-block">
              Zero Overwhelm Blocks
            </div>
          </div>

          <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-forest-800 uppercase">Buffer Cushion</span>
              <Shield className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-display font-extrabold text-forest-950">
              {stats?.buffersRemaining || 5} Slots
            </div>
            <div className="text-[10px] text-cyan-800 font-bold bg-cyan-100 px-2 py-0.5 rounded-full inline-block">
              Guilt-Free Rest Available
            </div>
          </div>

          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-forest-800 uppercase">Target Date</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-display font-extrabold text-forest-950">
              100% On Track
            </div>
            <div className="text-[10px] text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded-full inline-block">
              Zero Timeline Delays
            </div>
          </div>

        </div>
      </div>

      {/* Competency Heatmap / Milestone Matrix (Moodboard Ref 2) */}
      {roadmap && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-forest-950 text-base">
                Learning Arc Competency Matrix
              </h3>
              <p className="text-xs text-forest-700">Deconstructed milestone modules and completion health.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-owlGreen-100 text-owlGreen-800 font-mono text-xs font-bold">
              3 Phases Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {roadmap.milestones.map((m) => (
              <div key={m.id} className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-xs text-forest-900">
                    Week {m.weekNumber} · {m.title.split(':')[0]}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-owlGreen-500"></span>
                </div>
                <div className="space-y-1.5">
                  {m.tasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 bg-white border border-emerald-100 rounded-xl text-xs flex items-center justify-between shadow-sm"
                    >
                      <span className="font-medium text-forest-950 truncate max-w-[180px]">
                        {t.title}
                      </span>
                      {t.type === 'BUFFER' ? (
                        <span className="text-[9px] font-display font-bold bg-butterYellow-200 text-forest-950 px-1.5 py-0.5 rounded">
                          🛡️ Buffer
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-forest-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {t.durationMinutes}m
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
