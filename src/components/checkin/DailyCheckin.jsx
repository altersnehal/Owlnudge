import React, { useState, useEffect } from 'react';
import { Rocket, Zap, Mountain, Droplet, Wind, Eye, Moon, Check, Sparkles, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DailyCheckin({ onLaunchBodyDouble, activeTask }) {
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [somaticStep, setSomaticStep] = useState(0); // 0: unstarted, 1: water, 2: breath, 3: done
  const [breathCount, setBreathCount] = useState(4);
  const [eveningWin, setEveningWin] = useState('');
  const [eveningLogged, setEveningLogged] = useState(false);

  // 4-4-4 Box Breathing timer
  useEffect(() => {
    let interval = null;
    if (somaticStep === 2) {
      interval = setInterval(() => {
        setBreathCount((prev) => (prev > 1 ? prev - 1 : 4));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [somaticStep]);

  const handleEveningSubmit = (e) => {
    e.preventDefault();
    setEveningLogged(true);
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#22C55E', '#FDE047', '#14532D']
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* ================= 1. MORNING STATE TRIAGE ================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-card space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-owlGreen-500 animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-forest-800 uppercase">Phase 1 · Morning Check-in (09:30 AM)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-butterYellow-300 text-forest-950 font-display font-bold text-xs">
            1-Tap Triage
          </span>
        </div>

        {/* Coach Dialogue */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/90 to-white border border-emerald-200/90 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200/80 p-2 shrink-0 breath-cycle flex items-center justify-center shadow-sm">
            <img src="/assets/mascot.png" alt="Owlnudge Mentor" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-forest-950 text-base">
              "Good morning Alex! No pressure, how is your nervous system today?"
            </h3>
            <p className="text-xs text-forest-800 leading-relaxed font-sans">
              Today's planned micro-task: <strong>{activeTask?.title || "Climbing Stairs (Visualizing Base Cases)"}</strong>.
            </p>
          </div>
        </div>

        {/* 3 One-Tap Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          
          <button
            onClick={() => setSelectedEnergy('FLOW')}
            className={`p-4 rounded-2xl border text-left transition emil-btn flex flex-col justify-between space-y-3 ${
              selectedEnergy === 'FLOW'
                ? 'bg-owlGreen-100 border-2 border-owlGreen-600 shadow-sm'
                : 'bg-white border-slate-200 hover:border-owlGreen-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-owlGreen-500/20 text-owlGreen-700 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-forest-950">High Flow</div>
              <div className="text-[11px] text-forest-700">Ready for full 25m sprint</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedEnergy('MODERATE')}
            className={`p-4 rounded-2xl border text-left transition emil-btn flex flex-col justify-between space-y-3 ${
              selectedEnergy === 'MODERATE'
                ? 'bg-owlGreen-100 border-2 border-owlGreen-600 shadow-sm'
                : 'bg-white border-slate-200 hover:border-owlGreen-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-forest-950">Moderate Energy</div>
              <div className="text-[11px] text-forest-700">15m gentle warmup session</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedEnergy('FROZEN')}
            className={`p-4 rounded-2xl border text-left transition emil-btn flex flex-col justify-between space-y-3 ${
              selectedEnergy === 'FROZEN'
                ? 'bg-butterYellow-200 border-2 border-butterYellow-500 shadow-sm'
                : 'bg-butterYellow-50/60 border-butterYellow-300 hover:border-butterYellow-400'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-butterYellow-300 text-forest-950 flex items-center justify-center">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-forest-950">Frozen / Heavy</div>
              <div className="text-[11px] text-forest-800 font-semibold">2-min Body Double assist</div>
            </div>
          </button>

        </div>

        {/* Dynamic Coach Response */}
        {selectedEnergy && (
          <div className="p-4 rounded-2xl bg-forest-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="font-display font-bold text-sm text-butterYellow-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>
                  {selectedEnergy === 'FROZEN'
                    ? "Owlnudge: Completely valid. Let's shrink the task to 30 seconds."
                    : "Owlnudge: Excellent! Let's lock in your momentum."}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-sans">
                {selectedEnergy === 'FROZEN'
                  ? "We only need to open the tab and read 1 line. Owlnudge is holding the room with brown noise."
                  : "We queued your 25-minute sprint with background brown noise."}
              </p>
            </div>
            <button
              onClick={() => onLaunchBodyDouble(activeTask)}
              className="px-5 py-2.5 bg-butterYellow-300 hover:bg-butterYellow-400 text-forest-950 font-display font-bold text-xs sm:text-sm rounded-xl emil-btn shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Body Doubler →</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 2. MIDDAY SOMATIC RESET ================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-cyan-600" />
            <span className="font-mono text-xs font-bold text-forest-800 uppercase">Phase 2 · Midday Somatic Reset (01:45 PM)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Hyperfocus Guard</span>
        </div>

        <div className="p-5 bg-cyan-50/70 border border-cyan-200 rounded-2xl text-center space-y-3">
          <h4 className="font-display font-bold text-forest-950 text-base">
            90-Second Bio Reset Prompt
          </h4>
          <p className="text-xs text-cyan-900 max-w-xl mx-auto">
            Protect your afternoon dopamine reserves. A 90-second physical reset breaks tunnel-vision fatigue.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-xs">
            <div className="p-3 bg-white border border-cyan-200 rounded-xl shadow-sm space-y-1">
              <Droplet className="w-5 h-5 text-cyan-600 mx-auto" />
              <div className="font-display font-bold text-forest-950">1 Glass Water</div>
              <div className="text-[10px] text-slate-500 font-mono">Hydration</div>
            </div>
            <div className="p-3 bg-white border border-cyan-200 rounded-xl shadow-sm space-y-1">
              <Wind className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="font-display font-bold text-forest-950">4-4-4 Box Breath</div>
              <div className="text-[10px] text-emerald-700 font-mono font-bold">Tick: {breathCount}s</div>
            </div>
            <div className="p-3 bg-white border border-cyan-200 rounded-xl shadow-sm space-y-1">
              <Eye className="w-5 h-5 text-amber-600 mx-auto" />
              <div className="font-display font-bold text-forest-950">Look 20ft Away</div>
              <div className="text-[10px] text-slate-500 font-mono">Eye strain relief</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setSomaticStep(3)}
              className="px-5 py-2 bg-forest-900 text-white font-display font-bold text-xs rounded-xl emil-btn shadow-sm"
            >
              {somaticStep === 3 ? "✓ Bio Reset Completed!" : "Complete 90s Reset"}
            </button>
          </div>
        </div>
      </div>

      {/* ================= 3. EVENING REFLECTION & CLOSURE RITUAL ================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-600" />
            <span className="font-mono text-xs font-bold text-forest-800 uppercase">Phase 3 · Evening Closure (08:30 PM)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Sleep Guard</span>
        </div>

        {eveningLogged ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 bg-owlGreen-600 text-white rounded-full flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-forest-950 text-base">
              Evening Win Logged! Permission to Disconnect.
            </h4>
            <p className="text-xs text-forest-800">
              "You conquered initiation friction today. Rest well—tomorrow is fully protected."
            </p>
          </div>
        ) : (
          <form onSubmit={handleEveningSubmit} className="space-y-3">
            <label className="block text-xs font-display font-bold text-forest-950">
              What was 1 micro-win or breakthrough you experienced today?
            </label>
            <input
              type="text"
              value={eveningWin}
              onChange={(e) => setEveningWin(e.target.value)}
              placeholder="e.g. Cleared step 1 on DP stairs, worked for 25 mins without distraction..."
              className="w-full bg-[#f8faf7] border border-emerald-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-owlGreen-500"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-white font-display font-bold text-xs rounded-xl emil-btn shadow-sm transition"
            >
              Log Win & Close Day 🌙
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
