import React from 'react';

/**
 * Clean Section Navigation:
 * - Vertical icon+label sidebar on desktop (all 8 sections visible at once, no scroll arrows)
 * - Clean horizontal pill strip on mobile
 */
export function SectionSidebar({ tabs, activeTab, onSelectTab }) {
  return (
    <>
      {/* Desktop Vertical Rail */}
      <aside
        aria-label="Resume Sections"
        className="hidden md:flex flex-col w-[128px] shrink-0 bg-[#FAF8F5] border-r border-ink/10 p-2 gap-1 overflow-y-auto select-none"
      >
        <span className="px-2.5 pt-1 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
          Sections
        </span>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-ink text-white shadow-[2px_2px_0_rgba(0,0,0,0.2)]'
                  : 'text-ink-muted hover:text-ink hover:bg-black/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-volt' : 'text-ink-muted'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Mobile Horizontal Pill Bar */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2 px-3 border-b border-ink/10 bg-[#FAF8F5] text-xs no-scrollbar shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer border shrink-0 ${
                isActive
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-ink-muted border-ink/20'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-volt' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
