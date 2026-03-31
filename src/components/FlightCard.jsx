import React from 'react';
import { Plane, Shield, ChevronRight, Sparkles, Briefcase, Zap, Heart, Share2 } from 'lucide-react';

const ItineraryRow = ({ flight, isReturn = false }) => {
  if (!flight) return null;
  
  const airlineCode = flight.airlineCode || 'ET';
  const segments = typeof flight.segments === 'string' ? JSON.parse(flight.segments) : flight.segments;
  const stopsCount = Array.isArray(segments) ? Math.max(0, segments.length - 1) : (flight.stops || 0);

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    if (timeStr.includes('T')) {
      const time = timeStr.split('T')[1].slice(0, 5);
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes}${ampm}`;
    }
    return timeStr;
  };

  return (
    <div className={`flex flex-col gap-2.5 ${isReturn ? 'pt-3 border-t border-gray-100 dark:border-white/5' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0 group-hover:bg-accent/10 transition-colors border border-gray-100 dark:border-white/5">
             <img 
                src={`https://images.kiwi.com/airlines/64/${airlineCode}.png`} 
                alt={flight.airline}
                className="w-full h-full object-contain brightness-110 dark:opacity-90"
             />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.15em] truncate">{flight.airline}</span>
            <span className="text-sm md:text-base font-black text-gray-900 dark:text-white leading-tight">
              {formatTime(flight.departureTime)} – {formatTime(flight.arrivalTime)}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">{flight.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || '4h 20m'}</div>
          <div className={`text-[10px] font-black uppercase tracking-tight ${stopsCount === 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
            {stopsCount === 0 ? 'nonstop' : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 pl-[46px]">
        <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em]">
          <span className="bg-secondary px-2 py-0.5 rounded-lg border border-border">{flight.origin}</span>
          <div className="flex items-center gap-1 px-1">
            <div className="w-1 h-1 rounded-full bg-primary/30" />
            <div className="w-6 md:w-10 h-px border-t border-dashed border-border" />
            <div className="w-1 h-1 rounded-full bg-primary/30" />
          </div>
          <span className="bg-secondary px-2 py-0.5 rounded-lg border border-border">{flight.destination}</span>
        </div>
      </div>
    </div>
  );
};

const FlightCard = ({ flight, onSelect, onViewDetails, isSelected, isFavorited, onToggleFavorite, isCheapest, isFastest, isEarliest }) => {
  if (!flight) return null;

  const isRoundTrip = !!flight.returnFlight || flight.isRoundTrip;
  
  const dynamicTags = [];
  if (isCheapest) dynamicTags.push({ label: 'Cheapest', color: 'bg-emerald-500 shadow-emerald-500/20' });
  if (isFastest) dynamicTags.push({ label: 'Fastest', color: 'bg-amber-500 shadow-amber-500/20' });
  if (isEarliest) dynamicTags.push({ label: 'Earliest', color: 'bg-sky-500 shadow-sky-500/20' });

  const aiTags = Array.isArray(flight.aiTags) ? flight.aiTags : [];
  aiTags.forEach(tag => {
    if (!['Cheapest', 'Fastest', 'Earliest', 'Best Value'].includes(tag)) {
      dynamicTags.push({ label: tag, color: 'bg-accent shadow-accent/20 text-accent-foreground' });
    }
  });

  return (
    <div 
      onClick={() => onSelect(flight)}
      className={`
        relative overflow-hidden rounded-[2rem] p-4 md:p-6 transition-all duration-300 cursor-pointer group
        ${isSelected 
          ? 'bg-accent/5 border-accent shadow-2xl shadow-accent/10' 
          : 'bg-card border border-border hover:border-accent/30 hover:bg-secondary/50 hover:-translate-y-0.5 shadow-xl shadow-black/5 dark:shadow-none'}
      `}
    >
      {/* Dynamic Background Pattern */}
      {isSelected && (
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Plane className="w-24 h-24 rotate-45 text-accent" />
        </div>
      )}

      {/* Top Bar: Actions & Tags */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-1.5">
          {dynamicTags.map(tag => (
            <span key={tag.label} className={`
              px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 text-white
              ${tag.color}
            `}>
              <Sparkles className="w-2.5 h-2.5 md:w-3" />
              {tag.label}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(flight); }}
            className={`p-1.5 rounded-xl transition-all flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${isFavorited ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30 hover:text-red-500 hover:bg-red-50'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isFavorited ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
        {/* Left Side: Itinerary Info */}
        <div className="flex-1 space-y-3">
          <ItineraryRow flight={flight} />
          
          {isRoundTrip && flight.returnFlight && (
            <ItineraryRow flight={flight.returnFlight} isReturn={true} />
          )}

          {/* Sub Info Row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/[0.03]">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.15em]">
                  <Briefcase className="w-3 h-3" />
                  <span>Cabin Bag Incl.</span>
               </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-accent opacity-80 uppercase tracking-[0.15em]">
                  <Zap className="w-3 h-3" />
                  <span>AI Optimal</span>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Pricing & CTA */}
        <div className="flex flex-row lg:flex-col justify-between items-center lg:items-end p-4 lg:p-6 bg-secondary/80 rounded-2xl lg:rounded-[1.5rem] border border-border lg:pl-8 lg:w-48 gap-4">
          <div className="text-left lg:text-right">
            <div className="flex items-center lg:justify-end gap-1 text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-1">
              <Shield className="w-2.5 h-2.5 text-emerald-500" />
              Secure GDS
            </div>
            <div className="flex items-baseline gap-0.5">
               <span className="text-sm font-black text-gray-900 dark:text-white opacity-40">$</span>
               <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                 {flight.totalPrice || flight.price}
               </span>
            </div>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) onViewDetails(flight);
            }}
            className={`
             px-6 py-2.5 lg:w-full rounded-2xl font-black flex items-center justify-center gap-2 transition-all duration-300 text-xs uppercase tracking-widest shadow-lg
            ${isSelected 
              ? 'bg-accent text-accent-foreground shadow-accent/30 translate-y-[-2px]' 
              : 'bg-accent text-accent-foreground hover:opacity-90 lg:border-none shadow-black/5'}
          `}>
            {isSelected ? 'Active' : 'View'}
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};


export default FlightCard;
