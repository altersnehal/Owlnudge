import React from 'react';

export default function Navbar({ activeTab, setActiveTab, bufferCount = 5 }) {
  const tabs = [
    { id: 'bodydouble', label: 'Focus' },
    { id: 'planner', label: 'Planner' },
    { id: 'recovery', label: 'Recovery 🛡️' },
    { id: 'dashboard', label: 'Momentum' },
  ];

  return (
    <header className="w-full max-w-3xl mx-auto sticky top-3 sm:top-4 z-50 mb-6 sm:mb-8 px-3 sm:px-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-full px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-[0_8px_32px_0_rgba(15,61,35,0.06),0_1px_2px_0_rgba(0,0,0,0.02)]">
        
        {/* Brand */}
        <button
          onClick={() => setActiveTab('bodydouble')}
          className="flex items-center gap-2 text-left shrink-0 active:scale-95 transition"
          title="Owlnudge Home"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-50/90 flex items-center justify-center p-0.5 shrink-0 shadow-sm">
            <img src="/assets/mascot.png" alt="Owlnudge Mascot" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-sm text-forest-950 tracking-tight hidden md:inline">Owlnudge</span>
        </button>

        {/* Central Segmented Tab Controls */}
        <nav className="flex items-center p-0.5 bg-black/[0.04] rounded-full text-xs font-medium text-forest-900/70 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-full transition-all duration-150 active:scale-95 whitespace-nowrap text-[11px] sm:text-xs ${
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

        {/* Right Actions: Prominent Check-in Button + Buffer Cushion Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Prominent Quick Check-in Button */}
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm ${
              activeTab === 'checkin'
                ? 'bg-emerald-700 text-white shadow-emerald-900/20'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/50'
            }`}
            title="1-Tap Nervous System & Energy Check-in"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-sans font-medium text-[11px] sm:text-xs">Check-in</span>
          </button>

          {/* Buffer Ledger Indicator */}
          <button
            onClick={() => setActiveTab('recovery')}
            className="text-[11px] font-mono font-medium text-amber-800 bg-amber-50/90 hover:bg-amber-100/90 px-2 sm:px-2.5 py-1.5 rounded-full flex items-center gap-1 transition active:scale-95 border border-amber-200/40"
            title="View Zero-Shame Buffer Cushion Status"
          >
            <span>🛡️</span>
            <span className="hidden sm:inline font-bold">{bufferCount}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
