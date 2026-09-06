import React from 'react';

export default function Navbar({ activeTab, setActiveTab, bufferCount, onSimulateMissedDay }) {
  const tabs = [
    { id: 'bodydouble', label: 'Focus' },
    { id: 'planner', label: 'Plan' },
    { id: 'checkin', label: 'Check-in' },
  ];

  return (
    <header className="w-full max-w-xl mx-auto sticky top-4 z-50 mb-8 px-4">
      <div className="bg-white/85 backdrop-blur-2xl rounded-full px-4 py-2 flex items-center justify-between shadow-[0_8px_32px_0_rgba(15,61,35,0.06),0_1px_2px_0_rgba(0,0,0,0.02)]">
        
        {/* Brand Minimal */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-50/80 flex items-center justify-center p-0.5 shrink-0">
            <img src="/assets/mascot.png" alt="Owlnudge" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-sm text-forest-950 tracking-tight">Owlnudge</span>
        </div>

        {/* Segmented Tab Controls (No borders, quiet surface) */}
        <nav className="flex items-center p-0.5 bg-black/[0.04] rounded-full text-xs font-medium text-forest-900/70">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'bg-white text-forest-950 font-semibold shadow-sm'
                    : 'hover:text-forest-950 text-forest-800/70'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Buffer Status / Demo Trigger */}
        <button
          onClick={onSimulateMissedDay}
          className="text-[11px] font-mono font-medium text-emerald-800 flex items-center gap-1.5 hover:text-emerald-950 transition active:scale-95"
          title="Simulate a missed day to test Zero-Shame Buffer Shield"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{bufferCount} Buffers</span>
        </button>

      </div>
    </header>
  );
}
