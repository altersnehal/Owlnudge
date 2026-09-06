import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export default function GoalPlanner({ roadmap, onGenerateRoadmap, onSelectTaskForFocus, isGenerating }) {
  const [goalInput, setGoalInput] = useState(roadmap?.title || "Master Dynamic Programming & Recursion");

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;
    onGenerateRoadmap({ goalText: goalInput, targetWeeks: 3, dailyMinutes: 45 });
  };

  const tasks = roadmap?.milestones?.[0]?.tasks || [
    { id: 't1', title: 'Recursion intuition video (12m)', durationMinutes: 15, type: 'TASK' },
    { id: 't2', title: 'Memoization pattern (Climbing Stairs)', durationMinutes: 20, type: 'TASK' },
    { id: 't3', title: '1-Sentence closure summary', durationMinutes: 5, type: 'TASK' },
  ];

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. Direct Question & Context */}
      <div className="space-y-1.5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
          What is on your mind to learn?
        </h2>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          Owlnudge slices any topic into 3 micro-steps and automatically reserves 2 Buffer Days.
        </p>
      </div>

      {/* 2. Natural, Tactile Input */}
      <form onSubmit={handleGenerate} className="space-y-3">
        <input
          type="text"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="e.g. Dynamic Programming, Docker basics, React hooks..."
          className="w-full px-5 py-4 rounded-2xl bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03),0_1px_3px_0_rgba(0,0,0,0.02)] text-sm font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition placeholder:text-slate-300"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-mono text-emerald-800">
            🛡️ 2 Buffer Days / week active
          </span>
          <button
            type="submit"
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 disabled:opacity-50"
          >
            {isGenerating ? 'Slicing Plan...' : 'Slice Goal'}
          </button>
        </div>
      </form>

      {/* 3. Sliced Micro-Steps (Sitting directly on canvas with quiet surface) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wide px-1">
          <span>Today's 3 Micro-Steps</span>
          <span className="text-emerald-700 font-sans normal-case">100% on schedule</span>
        </div>

        <div className="space-y-2.5">
          {tasks.slice(0, 3).map((task, idx) => (
            <div
              key={task.id || idx}
              className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03),0_1px_3px_0_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_-4px_rgba(15,61,35,0.06)] transition duration-150"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-forest-950">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {task.durationMinutes || 15} min block
                  </p>
                </div>
              </div>

              {idx === 0 ? (
                <button
                  onClick={() => onSelectTaskForFocus(task)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold active:scale-95 transition duration-100 shadow-sm shrink-0"
                >
                  Start →
                </button>
              ) : (
                <span className="text-[11px] font-mono text-slate-300">Queued</span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
