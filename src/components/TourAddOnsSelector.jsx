import React, { useState } from 'react';
import {
  CheckCircle2, Plus, Minus, Sparkles, ArrowRight,
  ShieldCheck, Bed, Crown, FileText
} from 'lucide-react';

const addonIcons = {
  sleeping_bag: Bed,
  portal_vip: Crown,
  evisa: FileText,
};

const TourAddOnsSelector = ({ addOns, travelers, pricePerPerson, onAddOnsSelected, completed }) => {
  const [selected, setSelected] = useState({});

  if (completed) {
    const selectedAddOns = addOns.filter(a => selected[a.id]);
    return (
      <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-fade-in-up max-w-sm">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {selectedAddOns.length > 0
            ? `${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? 's' : ''} selected ✓`
            : 'No add-ons selected ✓'}
        </span>
      </div>
    );
  }

  const toggle = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedAddOns = addOns.filter(a => selected[a.id]);
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0) * travelers;
  const baseTotal = travelers * pricePerPerson;
  const grandTotal = baseTotal + addOnsTotal;

  return (
    <div className="max-w-md mt-3 space-y-3 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20">
        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-500/30">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-amber-800 dark:text-amber-300">Optional Add-On Services</div>
          <div className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-0.5">Select any extras for your trip</div>
        </div>
      </div>

      {/* Add-On Cards */}
      <div className="space-y-2">
        {addOns.map((addon) => {
          const isActive = !!selected[addon.id];
          const Icon = addonIcons[addon.id] || Plus;
          return (
            <button
              key={addon.id}
              onClick={() => toggle(addon.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left group ${
                isActive
                  ? 'border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 shadow-md shadow-blue-500/10'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.05]'
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-100 dark:bg-white/10 group-hover:bg-gray-200 dark:group-hover:bg-white/15'
              }`}>
                <Icon className={`w-4.5 h-4.5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-500 dark:text-white/40'
                }`} />
              </div>

              {/* Name & Description */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold transition-colors ${
                  isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-white/70'
                }`}>
                  {addon.name}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">
                  Per person · {travelers} traveler{travelers > 1 ? 's' : ''}
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <div className={`text-base font-black transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white/50'
                }`}>
                  ${addon.price}
                </div>
                {travelers > 1 && (
                  <div className="text-[9px] text-gray-400 dark:text-white/25">
                    ${addon.price * travelers} total
                  </div>
                )}
              </div>

              {/* Check indicator */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-blue-500 scale-100'
                  : 'bg-gray-200 dark:bg-white/10 scale-90'
              }`}>
                {isActive ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Plus className="w-3 h-3 text-gray-400 dark:text-white/30" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Price Summary */}
      <div className="p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest">Tour ({travelers}×${pricePerPerson})</span>
          <span className="text-sm font-bold text-gray-700 dark:text-white/60">${baseTotal}</span>
        </div>
        {selectedAddOns.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 dark:text-white/40 uppercase tracking-widest">Add-ons</span>
            <span className="text-sm font-bold text-gray-700 dark:text-white/60">+${addOnsTotal}</span>
          </div>
        )}
        <div className="h-px bg-gray-200 dark:bg-white/10" />
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Grand Total</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">${grandTotal}</span>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => onAddOnsSelected && onAddOnsSelected(selectedAddOns, grandTotal)}
        className="w-full h-12 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] group"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
        }}
      >
        Continue to Payment
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span className="text-[10px] font-semibold text-gray-400 dark:text-white/30">Secure checkout · Free cancellation up to 48hrs</span>
      </div>
    </div>
  );
};

export default TourAddOnsSelector;
