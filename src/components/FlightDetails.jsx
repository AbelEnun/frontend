import React, { useState } from 'react';
import FlightChat from './FlightChat';
import { Button } from './ui/button';
import { checkLayoverPermission } from '../services/layoverService';
import { verifyFlightTransit, extractLayoverAirports } from '../services/transitService';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { ArrowLeft, Clock, Plane, Share2, Heart, Shield, ExternalLink, ChevronRight, Sparkles, MapPin, X, AlertTriangle, CheckCircle } from 'lucide-react';

const FlightDetails = ({ flight, onBack, isFavorited, onToggleFavorite, onShare, onStartBooking }) => {
  const [passport, setPassport] = useState({ label: '🇪🇹 Ethiopia', value: 'Ethiopia' });
  const [layoverStatuses, setLayoverStatuses] = useState({});
  const [checkingStatus, setCheckingStatus] = useState(false);

  const options = countryList().getData().map(country => ({
    label: `${getFlagEmoji(country.value)} ${country.label}`,
    value: country.label
  }));

  function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  }

  if (!flight) return null;

  let segments = [];
  try {
    const rawSegments = flight.segments || flight.itinerary || [];
    if (typeof rawSegments === 'string') {
      segments = JSON.parse(rawSegments);
    } else if (Array.isArray(rawSegments)) {
      segments = rawSegments;
    } else if (typeof rawSegments === 'object' && rawSegments !== null) {
      segments = [rawSegments];
    }
  } catch (e) {
    console.error("Error parsing segments:", e);
  }

  const airlineCode = flight.airlineCode || segments[0]?.airlineCode || 'ET';

  const checkAllLayovers = async (passportCountry) => {
    setCheckingStatus(true);
    const statuses = {};
    const uniqueLayovers = [...new Set(segments.slice(0, -1).map(s => s.arrivalAirportName || s.arrivalAirport))];
    
    let hasRestrictions = false;
    const restrictedLocations = [];
    
    for (const loc of uniqueLayovers) {
      const result = await checkLayoverPermission(loc, passportCountry.value);
      if (result) {
        statuses[loc] = result;
        
        // Check if this location is restricted
        if (result.allowed === false || result.permission_level === 'denied') {
          hasRestrictions = true;
          restrictedLocations.push({
            location: loc,
            country: result.layover_country,
            message: result.message
          });
        }
      }
    }
    
    setLayoverStatuses(statuses);
    setCheckingStatus(false);
    
    // Log restriction info for debugging
    if (hasRestrictions) {
      console.log('[Transit Check] Restrictions found:', restrictedLocations);
    }
  };
  
  
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateDuration = (startIso, endIso) => {
    if (!startIso || !endIso) return null;
    const start = new Date(startIso);
    const end = new Date(endIso);
    const diffMs = end - start;
    if (diffMs <= 0) return null;
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let parts = [];
    if (diffHrs > 0) parts.push(`${diffHrs}h`);
    if (diffMins > 0) parts.push(`${diffMins}m`);
    return parts.join(' ');
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar px-3 md:px-6 py-4 pb-24 animate-slide-up h-full bg-background transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Search Results
          </button>
        )}

        {/* Hero Section Card */}
        <div className="bg-card p-4 md:p-5 rounded-[1.5rem] border border-border shadow-2xl overflow-hidden relative backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
             <button 
               onClick={() => onToggleFavorite(flight)}
               className={`p-2 rounded-full transition-all duration-300 ${isFavorited ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-secondary hover:bg-muted text-muted-foreground hover:text-red-500'}`}
             >
               <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
             </button>
             <button 
               onClick={() => onShare && onShare(flight)}
               className="p-2 rounded-full bg-secondary hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
             >
               <Share2 className="w-5 h-5" />
             </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1.5 rounded-xl shadow-inner flex items-center justify-center">
                <img 
                  src={`https://images.kiwi.com/airlines/64/${airlineCode}.png`} 
                  alt={flight.airline}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-0.5">{flight.origin} → {flight.destination} · {flight.airline}</h1>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <span>{flight.trip_type || 'One-way'}</span>
                  <span>•</span>
                  <span>1 Adult</span>
                  <span>•</span>
                  <span>Economy</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Flight Itinerary
            </h3>

            {/* Micro-Minimal Layover Permission Checker */}
            <div className="mb-6 p-3 bg-secondary border border-border rounded-xl transition-all hover:bg-muted">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                       <Shield className="w-3.5 h-3.5 text-primary" />
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Transit Verification</span>
                    </div>
                    
                    <div className="flex-1 w-full md:max-w-[220px]">
                        <Select 
                          options={options}
                          value={passport}
                          onChange={setPassport}
                          placeholder="Nationality..."
                          className="nationality-select"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderColor: state.isFocused ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                              borderRadius: '0.5rem',
                              minHeight: '32px',
                              height: '32px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              boxShadow: 'none',
                              '&:hover': { borderColor: 'rgba(255, 255, 255, 0.2)' }
                            }),
                            valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: '#1a1a1a',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '0.75rem',
                              overflow: 'hidden',
                              zIndex: 50,
                              width: 'max-content',
                              minWidth: '180px'
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '11px',
                              padding: '6px 10px'
                            }),
                            singleValue: (base) => ({ ...base, color: '#888888' }), // Default color, check theme
                            input: (base) => ({ ...base, color: 'white' }),
                            dropdownIndicator: (base) => ({ ...base, padding: '2px', color: '#666' }),
                            indicatorSeparator: () => ({ display: 'none' })
                          }}
                        />
                    </div>

                    <Button 
                        onClick={() => checkAllLayovers(passport)}
                        disabled={checkingStatus}
                        className="h-8 px-4 bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest rounded-lg transition-all active:scale-95 flex-shrink-0"
                    >
                        {checkingStatus ? '...' : 'Check Status'}
                    </Button>
                </div>

                {Object.keys(layoverStatuses).length > 0 && (
                   <div className="mt-3 space-y-1.5 border-t border-border pt-3 animate-fade-in">
                      {Object.entries(layoverStatuses).map(([loc, status]) => {
                         const getStatusColor = (level) => {
                           switch(level) {
                             case 'visa_free': return 'text-green-600 dark:text-green-500';
                             case 'special_program': return 'text-blue-500 dark:text-blue-400';
                             case 'visa_on_arrival': return 'text-green-500 dark:text-green-400';
                             case 'airside_only': return 'text-yellow-600 dark:text-yellow-500';
                             case 'denied': return 'text-red-600 dark:text-red-500';
                             default: return 'text-gray-500 dark:text-text-muted';
                           }
                         };
                         
                         const getStatusLabel = (level) => {
                           switch(level) {
                             case 'visa_free': return 'Visa-Free';
                             case 'special_program': return 'Transit Program';
                             case 'visa_on_arrival': return 'Visa on Arrival';
                             case 'airside_only': return 'Airside Only';
                             case 'denied': return 'Entry Denied';
                             case 'visa_required_exit_possible': return 'Visa Required';
                             default: return 'Restricted';
                           }
                         };

                         return (
                           <div key={loc} className="flex flex-col gap-1 py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${status.allowed === false ? 'bg-red-500' : 'bg-green-500'}`} />
                                    <span className="text-[11px] font-black text-gray-800 dark:text-text-primary uppercase tracking-tight">{loc}</span>
                                 </div>
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(status.permission_level)}`}>
                                    {getStatusLabel(status.permission_level)}
                                 </span>
                              </div>
                              <div className="flex flex-col gap-1 pl-3.5">
                                 <p className="text-[10px] text-gray-500 dark:text-text-muted font-medium italic">
                                    {status.message || 'Verification complete.'}
                                 </p>
                                 {status.notes && (
                                    <p className="text-[9px] text-gray-400 dark:text-white/30 font-bold uppercase tracking-tight">
                                       Note: {status.notes}
                                    </p>
                                 )}
                              </div>
                           </div>
                         );
                      })}
                   </div>
                )}
            </div>

            {segments.length > 1 && (
              <div className="flex flex-wrap items-center gap-3 mb-8 animate-slide-up">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Layovers:</span>
                {segments.slice(0, -1).map((seg, i) => {
                  const nextSeg = segments[i + 1];
                  const layoverTime = calculateDuration(seg.arrivalDateTime || seg.arrivalTime, nextSeg.departureDateTime || nextSeg.departureTime);
                  return (
                    <button key={i} className="group relative flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 rounded-[1rem] transition-all hover:-translate-y-0.5 shadow-sm active:scale-95">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[11px] font-black text-primary uppercase tracking-tight">
                        {seg.arrivalAirport} {layoverTime && <span className="opacity-60 ml-1">({layoverTime})</span>}
                      </span>
                      <ChevronRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="space-y-0">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Outbound Flight</span>
                  <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
                </div>
                {Array.isArray(segments) && segments.length > 0 ? segments.map((segment, idx) => {
                  const depTime = segment.departureDateTime || segment.departureTime;
                  const arrTime = segment.arrivalDateTime || segment.arrivalTime;
                  const depAirport = segment.departureAirportName ? `${segment.departureAirport} (${segment.departureAirportName})` : segment.departureAirport;
                  const arrAirport = segment.arrivalAirportName ? `${segment.arrivalAirport} (${segment.arrivalAirportName})` : segment.arrivalAirport;
                  const isLast = idx === segments.length - 1;
                  
                  return (
                    <React.Fragment key={idx}>
                      {/* Segment Card */}
                      <div className={`relative pl-8 md:pl-12 ${isLast ? 'pb-4' : 'pb-16'} border-l-2 border-dashed border-border last:border-l-0`}>
                        {/* Timeline Dots */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-background bg-primary shadow-lg shadow-primary/20" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3">
                            <div className="text-lg font-black text-gray-900 dark:text-text-primary tracking-tight">{formatTime(depTime)}</div>
                            <div className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider">{formatDate(depTime)}</div>
                          </div>
                          
                          <div className="md:col-span-6">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="p-1 rounded-md bg-primary/10">
                                <MapPin className="w-3 h-3 text-primary" />
                              </div>
                              <span className="text-sm font-bold text-gray-800 dark:text-text-primary tracking-tight">{depAirport} → {arrAirport}</span>
                            </div>
                            <div className="text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-[0.1em] flex items-center gap-2">
                              <span className="text-primary">{segment.airlineName}</span>
                              <span className="opacity-30">•</span>
                              <span>Flight {segment.flightNumber}</span>
                            </div>
                          </div>

                          <div className="md:col-span-3 md:text-right">
                            <div className="text-lg font-black text-gray-900 dark:text-text-primary tracking-tight">{formatTime(arrTime)}</div>
                            <div className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider">{formatDate(arrTime)}</div>
                          </div>
                        </div>

                        {!isLast && (
                          <div className="mt-10 relative -ml-4 md:-ml-8 group/layover-btn">
                             <div className="inline-flex items-center gap-3 px-5 py-3 bg-secondary border border-border rounded-[1.5rem] text-[11px] font-black text-primary uppercase tracking-widest hover:bg-muted hover:scale-[1.02] transition-all cursor-default shadow-lg">
                               <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                               <Clock className="w-4 h-4" />
                               <span>Layover in {segment.arrivalAirport} {calculateDuration(segment.arrivalDateTime || segment.arrivalTime, segments[idx + 1]?.departureDateTime || segments[idx + 1]?.departureTime)}</span>
                             </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                }) : <div className="py-8 text-center text-text-muted italic text-sm">No itinerary.</div>}

                {/* Return Flight Section */}
                {flight.returnFlight && (
                  <>
                    <div className="my-10 flex items-center gap-3">
                      <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
                      <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Return Flight</span>
                      <div className="h-px bg-gray-200 dark:bg-white/10 flex-1" />
                    </div>
                    {(() => {
                      const rSegments = typeof flight.returnFlight.segments === 'string' ? JSON.parse(flight.returnFlight.segments) : flight.returnFlight.segments || [];
                      return rSegments.map((segment, idx) => {
                        const depTime = segment.departureDateTime || segment.departureTime;
                        // ... (Logic for return segments similar to outbound)
                        // Note: For brevity in this replacement, I'll ensure the return segment structure mirrors the outbound updates if I were strictly copying all logic, but here I'm replacing the wrapper structure.
                        // Wait, I need to make sure I don't break the return loop logic.
                        // I will copy the return flight logic structure carefully.
                        const arrTime = segment.arrivalDateTime || segment.arrivalTime;
                         const isLast = idx === rSegments.length - 1;
                        return (
                          <div key={idx} className={`relative pl-8 md:pl-12 ${isLast ? 'pb-4' : 'pb-16'} border-l-2 border-dashed border-gray-200 dark:border-white/10 last:border-l-0`}>
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-gray-50 dark:border-bg-primary bg-accent shadow-lg shadow-accent/20" />
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-3">
                                <div className="text-lg font-black text-gray-900 dark:text-text-primary tracking-tight">{formatTime(depTime)}</div>
                                <div className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider">{formatDate(depTime)}</div>
                              </div>
                              <div className="md:col-span-6">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="p-1 rounded-md bg-accent/10">
                                    <MapPin className="w-3 h-3 text-accent" />
                                  </div>
                                  <span className="text-sm font-bold text-gray-800 dark:text-text-primary tracking-tight">{segment.departureAirport} → {segment.arrivalAirport}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-[0.1em] flex items-center gap-2">
                                  <span className="text-accent">{segment.airlineName}</span>
                                  <span className="opacity-30">•</span>
                                  <span>Flight {segment.flightNumber}</span>
                                </div>
                              </div>
                              <div className="md:col-span-3 md:text-right">
                                <div className="text-lg font-black text-gray-900 dark:text-text-primary tracking-tight">{formatTime(arrTime)}</div>
                                <div className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider">{formatDate(arrTime)}</div>
                              </div>
                            </div>
                            {!isLast && (
                              <div className="mt-10 relative -ml-4 md:-ml-8 group/layover-btn">
                                 <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/80 dark:bg-white/[0.03] border border-gray-200 dark:border-orange-500/20 rounded-[1.5rem] text-[11px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-orange-500/[0.08]">
                                   <span>Layover in {segment.arrivalAirport} {calculateDuration(segment.arrivalDateTime || segment.arrivalTime, rSegments[idx + 1]?.departureDateTime || rSegments[idx + 1]?.departureTime)}</span>
                                 </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Final Booking Action */}
        <div className="pt-5">
           <Button 
             onClick={() => onStartBooking && onStartBooking(flight)}
             className="w-full py-8 bg-primary text-primary-foreground font-black text-xl rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-0.5 uppercase tracking-tighter"
           >
              <span className="text-xs opacity-90 font-bold">Total Price: ${flight.totalPrice || flight.price}</span>
              <div className="flex items-center gap-2">
                Confirm & Book Now
                <ChevronRight className="w-1 h-4" />
              </div>
           </Button>
           <p className="text-center text-[10px] text-gray-400 dark:text-text-muted mt-4 font-bold uppercase tracking-widest">Secure checkout enabled • No hidden fees</p>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
