import React, { useState } from 'react';
import { MapPin, Calendar, Globe, ArrowRight, Plane, ShieldCheck, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import TripSearchDialog from './TripSearchDialog';


/* ─── Single Card ─── */
const DestinationCard = ({ destination, onSearch }) => {
  const [hovered, setHovered] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const city = destination.city || destination.name || 'Unknown';
  const country = destination.country || '';
  const priceRange = destination.priceRange || destination.price || '';
  const description = destination.description || destination.desc || '';
  const bestSeason = destination.bestSeason || destination.season || '';
  const visaInfo = destination.visaInfo || destination.visa || '';

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex flex-col rounded-[1.5rem] overflow-hidden border transition-all duration-500 
                   ${hovered ? '-translate-y-1 shadow-2xl border-accent/20 bg-white' 
                             : 'shadow-sm border-gray-100 bg-white'}
                   group cursor-default`}
        style={{ minWidth: 0 }}
      >
        {/* ── Card Body ── */}
        <div className="flex flex-col h-full gap-3 p-5 flex-1 relative bg-card">
          <div className="flex-1 space-y-3">
            {/* City & Country Row */}
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-text-primary tracking-tight leading-none group-hover:text-accent transition-colors">
                  {city}
                </h3>
                {country && (
                  <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">
                    {country}
                  </p>
                )}
              </div>

              {/* Price Tag - Standardized Blue */}
              {priceRange && (
                <div className="text-right">
                  <div className="text-sm font-black text-accent tracking-tight">
                    ${priceRange}
                  </div>
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter px-0.5">per trip</div>
                </div>
              )}
            </div>

            {description && (
              <p className="text-[11px] text-text-primary/70 font-medium leading-relaxed line-clamp-2">
                {description}
              </p>
            )}

            {/* Minimal Meta Row */}
            <div className="flex items-center gap-3">
              {bestSeason && (
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5 opacity-40" />
                  {bestSeason}
                </div>
              )}
              {visaInfo && (
                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {visaInfo}
                </div>
              )}
            </div>
          </div>

          {/* CTA — Minimal Blue Action Button */}
          <button
            onClick={() => setDialogOpen(true)}
            className={`
              mt-2 w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] 
              flex items-center justify-center gap-2 transition-all duration-300
              bg-accent text-accent-foreground shadow-md hover:shadow-lg hover:opacity-90
              active:scale-[0.98] group/btn
            `}
          >
            <span>Explore Trip</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Trip Search Dialog (Portal) ── */}
      {dialogOpen && (
        <TripSearchDialog
          destination={city}
          country={country}
          onClose={() => setDialogOpen(false)}
          onSearch={(query) => {
            setDialogOpen(false);
            onSearch && onSearch(query);
          }}
        />
      )}
    </>
  );
};

/* ─── Cards Grid ─── */
const DestinationCards = ({ destinations, onSearch }) => {
  if (!destinations || destinations.length === 0) return null;

  return (
    <div className="w-full mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-white/30 uppercase tracking-widest">
          <Star className="w-3 h-3 text-amber-400" />
          Suggested Destinations
        </div>
        <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
        <span className="text-[10px] font-black text-gray-300 dark:text-white/20 uppercase tracking-widest">
          {destinations.length} found
        </span>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {destinations.map((dest, idx) => (
          <DestinationCard
            key={`${dest.city || dest.name || idx}`}
            destination={dest}
            onSearch={onSearch}
          />
        ))}
      </div>
    </div>
  );
};

export { DestinationCard, DestinationCards };
export default DestinationCards;
