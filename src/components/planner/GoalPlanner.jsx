import React, { useState } from 'react';
import { Wand2, Shield, Sparkles, ChevronDown, ChevronUp, Play, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GoalPlanner({ roadmap, onGenerateRoadmap, onSelectTaskForFocus, isGenerating }) {
  const [goalInput, setGoalInput] = useState(roadmap?.title || "Master Dynamic Programming & System Design for Tech Interviews");
  const [targetWeeks, setTargetWeeks] = useState(3);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [openMilestoneId, setOpenMilestoneId] = useState(roadmap?.milestones?.[0]?.id || 'm1');

  const handleGenerate = (e) => {
    e?.preventDefault();
    if (!goalInput.trim()) return;
    onGenerateRoadmap({ goalText: goalInput, targetWeeks, dailyMinutes });
  };

  const handleTaskCheck = (milestoneId, taskId) => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#22C55E', '#FDE047', '#15803D']
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner with Mascot & Goal Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-butterYellow-300 text-forest-950 font-display text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-forest-900" />
              <span>Anti-Overwhelm Goal Slicer</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-forest-950 tracking-tight">
              What ambitious goal are you ready to conquer?
            </h2>
            <p className="text-xs sm:text-sm text-forest-800 leading-relaxed max-w-2xl font-sans">
              Don't worry about the scope. Owlnudge automatically breaks your goal into 1 micro-task per day and injects <strong>2 mandatory Buffer Days / week</strong> so you never fail.
            </p>

            {/* Input Form */}
            <form onSubmit={handleGenerate} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-display font-bold text-forest-900 mb-1.5">
                  Target Goal or Project
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="e.g. Master React & Redux, Complete AWS Certification..."
                    className="flex-1 bg-[#f8faf7] border border-emerald-300 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-owlGreen-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-5 py-3 bg-owlGreen-600 hover:bg-owlGreen-700 text-white font-display font-bold text-xs sm:text-sm rounded-2xl shadow-md emil-btn flex items-center justify-center gap-2 shrink-0 transition"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{isGenerating ? 'Slicing Plan...' : 'Generate Roadmap'}</span>
                  </button>
                </div>
              </div>

              {/* Sliders / Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-display font-bold text-forest-900 block">Target Timeline</span>
                    <span className="text-[11px] text-forest-700">{targetWeeks} Weeks ({targetWeeks * 7} Days)</span>
                  </div>
                  <select
                    value={targetWeeks}
                    onChange={(e) => setTargetWeeks(Number(e.target.value))}
                    className="bg-white border border-emerald-300 text-forest-900 rounded-xl px-2.5 py-1.5 text-xs font-display font-bold"
                  >
                    <option value={2}>2 Weeks (Light)</option>
                    <option value={3}>3 Weeks (Balanced)</option>
                    <option value={4}>4 Weeks (Deep)</option>
                  </select>
                </div>

                <div className="p-3 bg-butterYellow-100/60 rounded-2xl border border-butterYellow-300 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-display font-bold text-forest-900 block">Daily Energy Cap</span>
                    <span className="text-[11px] text-forest-700">{dailyMinutes} min focus max</span>
                  </div>
                  <select
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="bg-white border border-butterYellow-400 text-forest-900 rounded-xl px-2.5 py-1.5 text-xs font-display font-bold"
                  >
                    <option value={30}>30 mins (Gentle)</option>
                    <option value={45}>45 mins (Recommended)</option>
                    <option value={60}>60 mins (Intense)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Mascot Coaching Widget */}
          <div className="lg:col-span-4 bg-gradient-to-b from-white to-emerald-50/70 border border-emerald-200/90 rounded-3xl p-6 text-center space-y-3.5 shadow-sm">
            <div className="w-32 h-32 mx-auto breath-cycle flex items-center justify-center p-2">
              <img src="/assets/mascot.png" alt="Owlnudge Mascot" className="w-full h-full object-contain filter drop-shadow-md" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-forest-950 text-sm">Buffer Day Guarantee</h3>
              <p className="text-[11px] text-forest-800 leading-relaxed">
                "We automatically reserved <strong className="text-owlGreen-700 font-bold font-mono">{targetWeeks * 2} Buffer Days</strong>. If you need to rest, your timeline stays 100% on schedule!"
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Generated Roadmap Display */}
      {roadmap && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-forest-800 uppercase tracking-wide">ROADMAP ACTIVE</span>
              <h3 className="text-xl font-display font-bold text-forest-900 mt-0.5">{roadmap.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-butterYellow-300 text-forest-950 font-display font-bold text-xs shadow-sm flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{roadmap.bufferDaysCount} Buffer Slots Active</span>
              </span>
            </div>
          </div>

          {/* Progressive Disclosure Milestones */}
          <div className="space-y-3">
            {roadmap.milestones.map((milestone, mIndex) => {
              const isOpen = openMilestoneId === milestone.id;
              const isFirst = mIndex === 0;

              return (
                <div
                  key={milestone.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                    isOpen ? 'border-2 border-owlGreen-500 shadow-card' : 'border-emerald-200/80 shadow-sm opacity-90'
                  }`}
                >
                  {/* Milestone Header / Toggle */}
                  <div
                    onClick={() => setOpenMilestoneId(isOpen ? null : milestone.id)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-white via-white to-emerald-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl font-display font-extrabold text-xs flex items-center justify-center ${
                        isFirst ? 'bg-owlGreen-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {milestone.weekNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm sm:text-base text-forest-950">
                            {milestone.title}
                          </h4>
                          {isFirst && (
                            <span className="px-2 py-0.5 rounded-full bg-owlGreen-100 text-owlGreen-800 text-[10px] font-display font-bold">
                              Current Active Phase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-forest-700">{milestone.description}</p>
                      </div>
                    </div>

                    <div className="text-forest-700">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Milestone Task List */}
                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-emerald-100/60 space-y-2.5">
                      {milestone.tasks.map((task) => {
                        const isBuffer = task.type === 'BUFFER';

                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isBuffer
                                ? 'bg-butterYellow-100/50 border-butterYellow-300'
                                : 'bg-white border-slate-200 hover:border-owlGreen-400 shadow-sm'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-xs sm:text-sm text-forest-950">
                                  {task.title}
                                </span>
                                {isBuffer ? (
                                  <span className="px-2 py-0.5 rounded-full bg-butterYellow-300 text-forest-950 font-display font-bold text-[10px] border border-butterYellow-400">
                                    🛡️ Buffer Day (Guilt-Free Rest)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-owlGreen-800 text-[10px] font-mono font-bold">
                                    ⏱️ {task.durationMinutes}m
                                  </span>
                                )}
                              </div>
                              {task.intuitionTip && (
                                <p className="text-xs text-forest-700 italic">
                                  💡 {task.intuitionTip}
                                </p>
                              )}
                            </div>

                            {/* Task Action CTAs */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              {!isBuffer && (
                                <button
                                  onClick={() => onSelectTaskForFocus(task)}
                                  className="px-3.5 py-1.5 bg-forest-900 hover:bg-forest-800 text-white font-display font-bold text-xs rounded-xl shadow-sm emil-btn flex items-center gap-1.5 transition"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Body Double</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleTaskCheck(milestone.id, task.id)}
                                className={`p-2 rounded-xl border transition emil-btn ${
                                  isBuffer
                                    ? 'bg-butterYellow-200 border-butterYellow-400 text-forest-900'
                                    : 'bg-emerald-50 hover:bg-owlGreen-500 hover:text-white border-emerald-200 text-owlGreen-700'
                                }`}
                                title="Mark Complete"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
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
      )}

    </div>
  );
}
