import React, { useEffect, useRef, useState } from 'react';
import FlightCard from './FlightCard';
import FlightDetails from './FlightDetails';
import ShareDialog from './ShareDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Plane, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

/* ─── comparison helpers ─── */
const getComparisons = (results) => {
  if (!results || results.length <= 1)
    return { cheapestId: null, fastestId: null, earliestId: null };

  let cheapest = results[0], fastest = results[0], earliest = results[0];
  const getMins = (d) => {
    if (!d) return Infinity;
    return parseInt(d.match(/(\d+)H/)?.[1] || 0) * 60 + parseInt(d.match(/(\d+)M/)?.[1] || 0);
  };
  results.forEach(f => {
    if (parseFloat(f.totalPrice) < parseFloat(cheapest.totalPrice)) cheapest = f;
    if (getMins(f.duration)      < getMins(fastest.duration))      fastest  = f;
    if (parseInt(f.departureHour) < parseInt(earliest.departureHour)) earliest = f;
  });
  return { cheapestId: cheapest.id, fastestId: fastest.id, earliestId: earliest.id };
};

/* ─── Results header ─── */
const ResultsHeader = ({ count, cheapestPrice, activeFilters }) => {
  const getSortLabel = () => {
    if (activeFilters?.sortBy === 'price') return 'Cheapest First';
    if (activeFilters?.sortBy === 'duration') return 'Fastest First';
    if (activeFilters?.sortBy === 'earliest') return 'Earliest First';
    return null;
  };

  const sortLabel = getSortLabel();

  return (
    <div className="flex items-center justify-between px-1 mb-4 pt-1">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent shadow-lg shadow-accent/20"
          >
            <Plane className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-black text-text-primary leading-none truncate">
              {count} Flight{count !== 1 ? 's' : ''} Found
            </p>
            {sortLabel && (
              <p className="text-[9px] text-accent font-bold mt-1 tracking-wider uppercase truncate">
                {sortLabel}
              </p>
            )}
            {!sortLabel && (
              <p className="text-[9px] text-muted-foreground mt-1 font-medium truncate uppercase tracking-tighter">
                Tap a flight to book instantly
              </p>
            )}
          </div>
        </div>
      </div>

      {cheapestPrice && (
        <div className="flex flex-col items-end flex-shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20 shadow-lg shadow-accent/5 transition-transform active:scale-95">
            <TrendingDown className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-tight">
              From ${cheapestPrice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── FlightResults ─── */
const FlightResults = ({ results, onSelect, selectedId, favorites = [], onToggleFavorite, activeFilters, onStartBooking }) => {
  const containerRef = useRef(null);
  const [flightToShare, setFlightToShare] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [detailsFlight, setDetailsFlight] = useState(null);

  const comps = getComparisons(results);

  const cheapestPrice = results?.length > 0
    ? Math.min(...results.map(f => parseFloat(f.totalPrice || f.price || Infinity))).toFixed(0)
    : null;

  useEffect(() => {
    if (containerRef.current && results?.length > 0) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [results]);

  // Reset showAll when results change
  useEffect(() => {
    setShowAll(false);
  }, [results]);

  if (!results || results.length === 0) return null;

  // Show only the first result unless "Show More" is clicked
  const visibleResults = showAll ? results : results.slice(0, 1);
  const hiddenCount = results.length - 1;

  const handleFlightClick = (flight) => {
    // Directly start booking — no details page
    if (onStartBooking) {
      onStartBooking(flight);
    } else if (onSelect) {
      onSelect(flight);
    }
  };

  return (
    <div ref={containerRef} className="animate-slide-up pb-24 px-4 md:px-0">

      <ResultsHeader count={results.length} cheapestPrice={cheapestPrice} activeFilters={activeFilters} />

      {/* Card list */}
      <div className="flex flex-col gap-4">
        {visibleResults.map((flight, index) => {
          const isCheapest = flight.id === comps.cheapestId;
          const isFastest  = flight.id === comps.fastestId;
          const isEarliest = flight.id === comps.earliestId;

          return (
            <FlightCard
              key={flight.id || index}
              flight={flight}
              onSelect={handleFlightClick}
              onViewDetails={(f) => setDetailsFlight(f)}
              isSelected={selectedId === flight.id}
              isFavorited={favorites.some(f => f.id === flight.id)}
              onToggleFavorite={onToggleFavorite}
              onShare={(f) => setFlightToShare(f)}
              isCheapest={isCheapest}
              isFastest={isFastest}
              isEarliest={isEarliest}
            />
          );
        })}
      </div>

      {/* Show More / Show Less button */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(prev => !prev)}
          className="mt-4 w-full py-3.5 rounded-2xl border border-border bg-card/80 hover:bg-secondary hover:border-accent/30 transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 text-accent group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-xs font-bold text-accent uppercase tracking-widest">
                Show Less
              </span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-accent group-hover:translate-y-0.5 transition-transform" />
              <span className="text-xs font-bold text-accent uppercase tracking-widest">
                Show {hiddenCount} More Flight{hiddenCount !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </button>
      )}

      {flightToShare && (
        <ShareDialog
          isOpen={!!flightToShare}
          onClose={() => setFlightToShare(null)}
          flight={flightToShare}
        />
      )}

      {/* ── Details Dialog modal ── */}
      <Dialog open={!!detailsFlight} onOpenChange={(open) => !open && setDetailsFlight(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl h-[90dvh] p-0 border-0 overflow-hidden flex flex-col rounded-3xl shadow-2xl bg-white dark:bg-[#0a0f1e]">
          {detailsFlight && (
            <>
              <div
                className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b border-border bg-card"
              >
                <DialogHeader className="flex-1 min-w-0">
                  <DialogTitle className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent shadow-lg shadow-accent/30"
                    >
                      <Plane className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary leading-none">
                        {detailsFlight.origin} → {detailsFlight.destination} · {detailsFlight.airline}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-normal uppercase tracking-widest">
                        Flight Details
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <FlightDetails
                  flight={detailsFlight}
                  isFavorited={favorites.some(f => f.id === detailsFlight.id)}
                  onToggleFavorite={onToggleFavorite}
                  onShare={(f) => setFlightToShare(f)}
                  onStartBooking={onStartBooking ? (fl) => { setDetailsFlight(null); onStartBooking(fl); } : undefined}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlightResults;
