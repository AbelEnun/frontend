import React from 'react';
import {
  Filter, X, DollarSign, Clock, Plane,
  GitMerge, Sunrise, Sun, Sunset, SlidersHorizontal
} from 'lucide-react';

/* ─── reusable pill button ─── */
const Pill = ({ active, onClick, icon: Icon, label, activeClass }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold
      border transition-all duration-200 whitespace-nowrap select-none
      ${active
        ? `${activeClass} shadow-md`
        : 'bg-white dark:bg-white/[0.04] text-gray-500 dark:text-white/40 border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.07] hover:border-gray-300 dark:hover:border-white/[0.14] hover:text-gray-700 dark:hover:text-white/60'
      }
    `}
  >
    {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
    {label}
  </button>
);

/* ─── divider ─── */
const Divider = () => (
  <div className="w-px h-5 bg-gray-200 dark:bg-white/[0.08] flex-shrink-0 mx-0.5" />
);

/* ─── section label ─── */
const SectionLabel = ({ children }) => (
  <span className="text-[9px] font-bold text-gray-300 dark:text-white/20 uppercase tracking-[0.18em] flex-shrink-0 self-center">
    {children}
  </span>
);

/* ─────────────────────────────────────────────
   FlightFilters
───────────────────────────────────────────── */
const FlightFilters = ({ activeFilters, onUpdateFilter, onClearFilters }) => {
  const toggle = (key, value) => {
    onUpdateFilter(key, activeFilters[key] === value ? null : value);
  };

  const hasActive =
    activeFilters.sortBy || activeFilters.stops || activeFilters.airline || activeFilters.time;

  const activeCount = [activeFilters.sortBy, activeFilters.stops, activeFilters.airline, activeFilters.time].filter(Boolean).length;

  return (
    <div className="sticky top-0 z-20 -mx-6 px-6 pb-3 pt-1 pointer-events-none">
      <div className="rounded-3xl border border-gray-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#1a1f2e]/90 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/40 overflow-hidden pointer-events-auto transition-all duration-500">
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform active:scale-90"
              style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">
                Filter & Sort
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1 h-1 rounded-full ${hasActive ? 'bg-indigo-500 animate-pulse' : 'bg-gray-300 dark:bg-white/10'}`} />
                <span className="text-[8px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-tight">
                  {hasActive ? `${activeCount} active` : 'No filters'}
                </span>
              </div>
            </div>
          </div>

          {hasActive && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-all active:scale-95 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Filter Rows */}
        <div className="px-5 py-3 space-y-3.5">
          {/* Sort & Stops Row */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
            {/* Sort Group */}
            <div className="flex items-center gap-2.5 min-w-0">
              <SectionLabel>Sort</SectionLabel>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
                <Pill
                  active={activeFilters.sortBy === 'price'}
                  onClick={() => toggle('sortBy', 'price')}
                  icon={DollarSign}
                  label="Cheapest"
                  activeClass="bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-indigo-500/25"
                />
                <Pill
                  active={activeFilters.sortBy === 'duration'}
                  onClick={() => toggle('sortBy', 'duration')}
                  icon={Clock}
                  label="Fastest"
                  activeClass="bg-amber-500 text-white border-amber-500 shadow-amber-500/25"
                />
                <Pill
                  active={activeFilters.sortBy === 'earliest'}
                  onClick={() => toggle('sortBy', 'earliest')}
                  icon={Sunrise}
                  label="Earliest"
                  activeClass="bg-sky-500 text-white border-sky-500 shadow-sky-500/25"
                />
              </div>
            </div>

            {/* Stops Group */}
            <div className="flex items-center gap-2.5 min-w-0">
              <SectionLabel>Stops</SectionLabel>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
                <Pill
                  active={activeFilters.stops === '0'}
                  onClick={() => toggle('stops', '0')}
                  icon={Plane}
                  label="Nonstop"
                  activeClass="bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-emerald-500/25"
                />
                <Pill
                  active={activeFilters.stops === '1'}
                  onClick={() => toggle('stops', '1')}
                  icon={GitMerge}
                  label="1 Stop"
                  activeClass="bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-emerald-500/25"
                />
              </div>
            </div>
          </div>

          {/* New Line: Departs */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <SectionLabel>Departs</SectionLabel>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
              <Pill
                active={activeFilters.time === 'morning'}
                onClick={() => toggle('time', 'morning')}
                icon={Sunrise}
                label="Morning"
                activeClass="bg-orange-500 text-white border-orange-500 shadow-orange-500/25"
              />
              <Pill
                active={activeFilters.time === 'afternoon'}
                onClick={() => toggle('time', 'afternoon')}
                icon={Sun}
                label="Afternoon"
                activeClass="bg-blue-500 text-white border-blue-500 shadow-blue-500/25"
              />
              <Pill
                active={activeFilters.time === 'evening'}
                onClick={() => toggle('time', 'evening')}
                icon={Sunset}
                label="Evening"
                activeClass="bg-violet-600 dark:bg-violet-500 text-white border-violet-600 dark:border-violet-500 shadow-violet-500/25"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default FlightFilters;
