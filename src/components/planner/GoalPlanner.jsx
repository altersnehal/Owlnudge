import React, { useState } from 'react';

export default function GoalPlanner({ roadmap, onGenerateRoadmap, onSelectTaskForFocus, isGenerating }) {
  const [goalInput, setGoalInput] = useState(roadmap?.title || "Master Dynamic Programming & Recursion");
  const [targetWeeks, setTargetWeeks] = useState(3);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [openMilestoneId, setOpenMilestoneId] = useState(roadmap?.milestones?.[0]?.id || 'm1');

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;
    onGenerateRoadmap({ goalText: goalInput, targetWeeks, dailyMinutes });
  };

  const milestones = roadmap?.milestones || [
    {
      id: 'm1',
      weekNumber: 1,
      title: 'Week 1: Recursion Tree & Subproblem Memoization',
      description: 'Break mental blocks on recursive call stacks.',
      tasks: [
        { id: 't1', title: 'Recursion intuition video (12m)', durationMinutes: 15, type: 'TASK', intuitionTip: 'Call stacks visual tree intuition' },
        { id: 't2', title: 'Memoization pattern (Climbing Stairs)', durationMinutes: 20, type: 'TASK', intuitionTip: 'Remember previous results to avoid re-computation' },
        { id: 't3', title: '1-Sentence closure summary', durationMinutes: 5, type: 'TASK', intuitionTip: 'Lock in takeaway before resting' },
        { id: 't4', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
        { id: 't5', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
      ]
    },
    {
      id: 'm2',
      weekNumber: 2,
      title: 'Week 2: 1D & 2D Grid Dynamic Programming',
      description: 'Transition from top-down memoization to bottom-up tabular flow.',
      tasks: [
        { id: 't6', title: 'Unique Paths (2D Grid Intuition)', durationMinutes: 20, type: 'TASK', intuitionTip: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]' },
        { id: 't7', title: 'House Robber (1D Decision Tree)', durationMinutes: 25, type: 'TASK', intuitionTip: 'Rob current or skip to adjacent' },
        { id: 't8', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
        { id: 't9', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
      ]
    },
    {
      id: 'm3',
      weekNumber: 3,
      title: 'Week 3: System Design & Mock Interview Synthesis',
      description: 'Synthesize algorithms into full architectural interview solutions.',
      tasks: [
        { id: 't10', title: 'Rate Limiter (Token Bucket Algorithm)', durationMinutes: 30, type: 'TASK', intuitionTip: 'Redis leaky bucket vs token bucket' },
        { id: 't11', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
        { id: 't12', title: 'Buffer Day (Guilt-Free Rest / Spillover)', durationMinutes: 0, type: 'BUFFER' },
      ]
    }
  ];

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. Direct Question & Context */}
      <div className="space-y-1.5">
        <h2 className="font-display font-bold text-xl sm:text-2xl text-forest-950 tracking-tight">
          What is on your mind to learn?
        </h2>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          Owlnudge automatically slices any topic into micro-steps and reserves <strong>2 mandatory Buffer Days / week</strong> so you never fall behind.
        </p>
      </div>

      {/* 2. Natural, Tactile Input with Timeline Config */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <input
          type="text"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="e.g. Dynamic Programming, Docker basics, React hooks..."
          className="w-full px-5 py-4 rounded-2xl bg-white shadow-[0_4px_20px_-2px_rgba(15,61,35,0.03),0_1px_3px_0_rgba(0,0,0,0.02)] text-sm font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition placeholder:text-slate-300"
        />

        {/* Pacing Configuration */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
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
              <span>Cap:</span>
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
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition duration-100 disabled:opacity-50"
          >
            {isGenerating ? 'Slicing Plan...' : 'Slice Goal with Buffer Days'}
          </button>
        </div>
      </form>

      {/* 3. Progressive Deconstructed Milestones */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wide px-1">
          <span>AI Deconstructed Roadmap</span>
          <span className="text-emerald-700 font-sans normal-case font-semibold">{targetWeeks * 2} Buffer Days Injected 🛡️</span>
        </div>

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
                      <p className="text-[11px] text-slate-400 font-sans">{milestone.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {isOpen ? '−' : '+'}
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
                          <div className="flex items-center gap-2.5">
                            {isBuffer ? (
                              <span className="text-xs">🛡️</span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono flex items-center justify-center">
                                •
                              </span>
                            )}
                            <div>
                              <p className={`text-xs ${isBuffer ? 'font-bold text-amber-900' : 'font-semibold text-forest-950'}`}>
                                {task.title}
                              </p>
                              {task.intuitionTip && (
                                <p className="text-[10px] text-slate-400 font-sans italic">
                                  💡 {task.intuitionTip}
                                </p>
                              )}
                            </div>
                          </div>

                          {!isBuffer && (
                            <button
                              onClick={() => onSelectTaskForFocus(task)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold active:scale-95 transition duration-100 shadow-sm shrink-0"
                            >
                              Focus →
                            </button>
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

    </div>
  );
}
