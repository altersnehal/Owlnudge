import React from 'react';
import { exportToMarkdown } from '../../services/storageService';

export default function MomentumDashboard({ roadmap, stats }) {
  const handleExport = () => {
    exportToMarkdown(roadmap, stats);
  };

  return (
    <div className="space-y-8 text-left">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
            Momentum Overview
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Bounce-back velocity over rigid streak counters.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-forest-950 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100"
        >
          Export (.md)
        </button>
      </div>

      {/* 3 Calm Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Bounce-Back</span>
          <p className="text-xl font-display font-bold text-forest-950">{stats?.bounceBackScore || 100}%</p>
          <span className="text-[10px] text-emerald-700 font-sans">Shield active</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Focus Time</span>
          <p className="text-xl font-display font-bold text-forest-950">{stats?.focusMinutes || 50}m</p>
          <span className="text-[10px] text-emerald-700 font-sans">Zero overwhelm</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Buffer Slots</span>
          <p className="text-xl font-display font-bold text-forest-950">{stats?.buffersRemaining || 5}</p>
          <span className="text-[10px] text-emerald-700 font-sans">Rest protected</span>
        </div>
      </div>

    </div>
  );
}
