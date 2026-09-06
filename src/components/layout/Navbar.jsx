import React from 'react';
import { Target, CheckCircle2, Headphones, ShieldAlert, BarChart3 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, bufferCount, onSimulateMissedDay }) {
  const navItems = [
    { id: 'planner', label: 'Goal & Buffer Plan', icon: Target },
    { id: 'checkin', label: 'Daily Check-in', icon: CheckCircle2 },
    { id: 'bodydouble', label: 'Body Doubler 🎧', icon: Headphones },
    { id: 'dashboard', label: 'Momentum Dashboard', icon: BarChart3 },
  ];

  return (
    <header className="bg-white/95 backdrop-blur border-b border-emerald-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Brand with Mascot */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-owlGreen-500/15 border border-owlGreen-500/30 flex items-center justify-center p-1 shadow-sm overflow-hidden shrink-0">
            <img src="/assets/mascot.png" alt="Owlnudge Mascot" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-xl text-forest-900 tracking-tight">Owlnudge</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-butterYellow-300 text-forest-950 font-display text-xs font-bold border border-forest-900/10 shadow-sm">
                MVP Checkpoint 1
              </span>
            </div>
            <p className="text-[11px] text-forest-700/80 font-medium">ADHD Accountability & Gentle Recovery Mentor</p>
          </div>
        </div>

        {/* Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-[#f2f6f3] p-1 rounded-2xl border border-emerald-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-display text-xs font-bold flex items-center gap-1.5 transition emil-btn whitespace-nowrap ${
                    isActive
                      ? 'bg-forest-900 text-white shadow-sm'
                      : 'text-forest-800/80 hover:text-forest-950 hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Simulate Missed Day Trigger for Demo */}
          <button
            onClick={onSimulateMissedDay}
            className="px-3 py-1.5 rounded-xl bg-butterYellow-200 hover:bg-butterYellow-300 text-forest-950 font-display text-xs font-bold border border-butterYellow-400/60 flex items-center gap-1.5 transition emil-btn shrink-0 shadow-sm"
            title="Test the Zero-Shame Recovery Flow"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-forest-900" />
            <span>Simulate Missed Day</span>
          </button>
        </div>

      </div>
    </header>
  );
}
