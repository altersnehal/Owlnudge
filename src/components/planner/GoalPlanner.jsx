import React, { useState } from 'react';

export default function GoalPlanner({ roadmap, onGenerateRoadmap, onSelectTaskForFocus, isGenerating, onNavigateTab }) {
  const [goalInput, setGoalInput] = useState(roadmap?.title || "Master Dynamic Programming & Recursion");
  const [targetWeeks, setTargetWeeks] = useState(3);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [openMilestoneId, setOpenMilestoneId] = useState(roadmap?.milestones?.[0]?.id || 'm1');

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;
    onGenerateRoadmap({ goalText: goalInput.trim(), targetWeeks, dailyMinutes });
  };

  const handlePresetSelect = (presetText) => {
    setGoalInput(presetText);
    onGenerateRoadmap({ goalText: presetText, targetWeeks, dailyMinutes });
  };

  const milestones = roadmap?.milestones || [
    {
      id: 'm1',
      weekNumber: 1,
      title: 'Week 1: Recursion Tree & Subproblem Memoization',
      description: 'Break mental blocks on recursive call stacks with 1D state patterns.',
      tasks: [
        { id: 't1', title: 'Recursion intuition video (12m)', durationMinutes: 15, type: 'TASK', intuitionTip: 'Call stacks visual tree intuition' },
        { id: 't2', title: 'Memoization pattern (Climbing Stairs)', durationMinutes: 20, type: 'TASK', intuitionTip: 'Remember previous results to avoid re-computation' },
        { id: 't3', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
        { id: 't4', title: 'House Robber (Binary Decision Tree)', durationMinutes: 25, type: 'TASK', intuitionTip: 'Rob current or skip to adjacent' },
        { id: 't5', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
      ]
    },
    {
      id: 'm2',
      weekNumber: 2,
      title: 'Week 2: 2D Grid Dynamic Programming',
      description: 'Transition from top-down memoization to bottom-up tabular matrices.',
      tasks: [
        { id: 't6', title: 'Unique Paths (2D Grid Intuition)', durationMinutes: 20, type: 'TASK', intuitionTip: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]' },
        { id: 't7', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
        { id: 't8', title: 'Longest Common Subsequence', durationMinutes: 25, type: 'TASK', intuitionTip: 'Match vs diagonal shift' },
        { id: 't9', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
      ]
    },
    {
      id: 'm3',
      weekNumber: 3,
      title: 'Week 3: System Design & Synthesis',
      description: 'Synthesize algorithms into full architectural interview solutions.',
      tasks: [
        { id: 't10', title: 'Rate Limiter (Token Bucket Algorithm)', durationMinutes: 30, type: 'TASK', intuitionTip: 'Redis leaky bucket vs token bucket' },
        { id: 't11', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
        { id: 't12', title: 'Mock Synthesis & Cheatsheet Polish', durationMinutes: 20, type: 'TASK', intuitionTip: 'Consolidate 3 core mental models' },
        { id: 't13', title: 'Final Buffer Day & Rest', durationMinutes: 0, type: 'BUFFER' },
      ]
    }
  ];

  return (
    <div className="space-y-8 text-left max-w-xl mx-auto">
      
      {/* Top Breadcrumb / Quick Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <button
          onClick={() => onNavigateTab?.('bodydouble')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          <span>←</span> Focus Room
        </button>
        <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
          AI Deconstruction Slicer
        </span>
        <button
          onClick={() => onNavigateTab?.('recovery')}
          className="hover:text-forest-950 font-medium flex items-center gap-1 transition active:scale-95"
        >
          Recovery 🛡️ <span>→</span>
        </button>
      </div>

      {/* 1. Header & Reassurance */}
      <div className="space-y-1.5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
          What is on your mind to learn?
        </h2>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          Search any skill or paste course links (<strong>Udemy, Medium, YouTube, Docs</strong>). Owlnudge automatically slices it into micro-actions with <strong>2 Buffer Days / week</strong>.
        </p>
      </div>

      {/* 2. Natural Tactile Input with Links & Topics */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Search topic or paste URL (e.g. udemy.com/..., medium.com/..., LeetCode DP)..."
              className="w-full pl-4 pr-10 py-3.5 sm:py-4 rounded-2xl bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03),0_1px_3px_0_rgba(0,0,0,0.02)] text-xs sm:text-sm font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition placeholder:text-slate-300"
            />
            {goalInput && (
              <button
                type="button"
                onClick={() => setGoalInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Clickable Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-mono text-slate-400 mr-1">Quick ideas:</span>
            <button
              type="button"
              onClick={() => handlePresetSelect('Master Dynamic Programming & Recursion')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-forest-900 shadow-xs transition active:scale-95"
            >
              🎯 Dynamic Programming
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('https://www.udemy.com/course/the-complete-react-guide')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-forest-900 shadow-xs transition active:scale-95"
            >
              🎓 Udemy React Link
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('https://medium.com/@engineering/system-design-primer')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-forest-900 shadow-xs transition active:scale-95"
            >
              📝 Medium System Design
            </button>
          </div>
        </div>

        {/* Pacing Configuration Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="text-slate-500 font-sans flex items-center gap-1.5">
              <span>Timeline:</span>
              <select
                value={targetWeeks}
                onChange={(e) => setTargetWeeks(Number(e.target.value))}
                className="bg-white rounded-lg px-2 py-1 font-semibold text-forest-950 shadow-sm focus:outline-none"
              >
                <option value={2}>2 Weeks</option>
                <option value={3}>3 Weeks (Recommended)</option>
                <option value={4}>4 Weeks</option>
              </select>
            </label>

            <label className="text-slate-500 font-sans flex items-center gap-1.5">
              <span>Max Cap:</span>
              <select
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="bg-white rounded-lg px-2 py-1 font-semibold text-forest-950 shadow-sm focus:outline-none"
              >
                <option value={30}>30 mins / day</option>
                <option value={45}>45 mins / day</option>
                <option value={60}>60 mins / day</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 disabled:opacity-50"
          >
            {isGenerating ? 'Slicing Plan & Buffer Days...' : 'Slice Plan with Buffers 🛡️'}
          </button>
        </div>
      </form>

      {/* 3. Progressive Deconstructed Milestones */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wide px-1">
          <span>Deconstructed Curriculum</span>
          <span className="text-emerald-700 font-sans normal-case font-semibold">{roadmap?.bufferDaysCount || targetWeeks * 2} Buffer Days Injected 🛡️</span>
        </div>

        {roadmap?.summary && (
          <div className="p-3.5 bg-white/70 rounded-2xl text-xs text-forest-900/80 font-sans leading-relaxed shadow-xs">
            {roadmap.summary}
          </div>
        )}

        <div className="space-y-3">
          {milestones.map((milestone) => {
            const isOpen = openMilestoneId === milestone.id;

            return (
              <div
                key={milestone.id}
                className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] overflow-hidden transition-all duration-200"
              >
                {/* Milestone Toggle Header */}
                <div
                  onClick={() => setOpenMilestoneId(isOpen ? null : milestone.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-[#F8FAF8] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      W{milestone.weekNumber}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-forest-950">
                        {milestone.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{milestone.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono px-2 py-1 bg-slate-50 rounded-lg">
                    {isOpen ? 'Collapse −' : 'Expand +'}
                  </span>
                </div>

                {/* Milestone Tasks */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 space-y-2 pt-1">
                    {milestone.tasks.map((task) => {
                      const isBuffer = task.type === 'BUFFER';

                      return (
                        <div
                          key={task.id}
                          className={`p-3.5 rounded-xl flex items-center justify-between gap-3 transition ${
                            isBuffer
                              ? 'bg-amber-50/70 text-amber-950'
                              : 'bg-[#F8FAF8] text-forest-950'
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-2.5">
                            {isBuffer ? (
                              <span className="text-xs shrink-0 mt-0.5 sm:mt-0">🛡️</span>
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
                              onClick={() => onSelectTaskForFocus(task)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold active:scale-95 transition duration-100 shadow-sm shrink-0"
                            >
                              Focus Now →
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
      </div>

      {/* Bottom Completion & Navigation Shortcut */}
      <div className="p-4 bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-sans text-center sm:text-left">
          Ready to jump into your first 25-minute focus sprint?
        </span>
        <button
          onClick={() => {
            const firstTask = milestones[0]?.tasks?.find(t => t.type !== 'BUFFER');
            if (firstTask) onSelectTaskForFocus(firstTask);
            else onNavigateTab?.('bodydouble');
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition text-center"
        >
          Launch First Task in Focus Room →
        </button>
      </div>

    </div>
  );
}
