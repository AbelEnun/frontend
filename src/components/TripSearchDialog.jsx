import React, { useState, useRef, useEffect } from 'react';
import {
  Plane, Calendar, MapPin, X, ArrowRight,
  Search, ArrowLeftRight, Sparkles
} from 'lucide-react';

/* ─── Popular Airports (quick suggestions) ─── */
const POPULAR_AIRPORTS = [
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', name: 'Bole International' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo International' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', name: 'JKIA' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', name: 'O.R. Tambo' },
  { code: 'LHR', city: 'London', country: 'UK', name: 'Heathrow' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle' },
  { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi' },
];

/* ─── Airport Dropdown ─── */
const AirportDropdown = ({ value, onChange, placeholder, id }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = POPULAR_AIRPORTS.filter(a =>
    !query ||
    a.city.toLowerCase().includes(query.toLowerCase()) ||
    a.code.toLowerCase().includes(query.toLowerCase()) ||
    a.country.toLowerCase().includes(query.toLowerCase()) ||
    a.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (airport) => {
    onChange(`${airport.city} (${airport.code})`);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={open ? query : value}
          onChange={(e) => { setQuery(e.target.value); onChange(''); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer"
        />
        {value && !open && (
          <button
            onClick={() => { onChange(''); setQuery(''); setOpen(true); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
          >
            <X className="w-3 h-3 text-gray-400 dark:text-white/40" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden max-h-56 overflow-y-auto no-scrollbar">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-white/30 font-medium">
              No airports found
            </div>
          ) : (
            filtered.map((airport) => (
              <button
                key={airport.code}
                onMouseDown={() => handleSelect(airport)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-white/5 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-wider">{airport.code}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{airport.city}</div>
                  <div className="text-[10px] text-gray-400 dark:text-white/30 font-medium truncate">{airport.name} · {airport.country}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Date Picker Field ─── */
const DateField = ({ label, id, value, onChange, min }) => (
  <div className="flex-1">
    <label htmlFor={id} className="block text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none z-10" />
      <input
        id={id}
        type="date"
        value={value}
        min={min || new Date().toISOString().split('T')[0]}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 pl-10 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
      />
    </div>
  </div>
);

/* ─── Trip Type Toggle ─── */
const TripTypeToggle = ({ value, onChange }) => (
  <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
    {['One-way', 'Round trip'].map((type) => (
      <button
        key={type}
        onClick={() => onChange(type)}
        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
          value === type
            ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
            : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50'
        }`}
      >
        {type === 'Round trip' && <ArrowLeftRight className="inline w-2.5 h-2.5 mr-1" />}
        {type}
      </button>
    ))}
  </div>
);

/* ─── Main Dialog ─── */
const TripSearchDialog = ({ destination, country, onClose, onSearch }) => {
  const [tripType, setTripType] = useState('Round trip');
  const [departureAirport, setDepartureAirport] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const isValid = departureAirport && departureDate;

  const handleContinue = () => {
    if (!isValid) return;

    // Extract IATA code from the airport picker value e.g. "Dubai (DXB)" → "DXB"
    const originMatch = departureAirport.match(/\(([A-Z]{3})\)/);
    const originIata = originMatch ? originMatch[1] : '';

    // Find the destination IATA from the POPULAR_AIRPORTS list by city name
    const destAirport = POPULAR_AIRPORTS.find(a =>
      a.city.toLowerCase() === (destination || '').toLowerCase()
    );
    const destinationIata = destAirport ? destAirport.code : '';

    const tripTypeLabel = tripType === 'Round trip' ? 'round-trip' : 'one-way';
    const tripTypeValue = tripType === 'Round trip' ? 'round_trip' : 'one_way';
    const returnPart    = tripType === 'Round trip' && returnDate ? `, returning ${returnDate}` : '';
    const query = `Find ${tripTypeLabel} flights from ${departureAirport} to ${destination}${country ? `, ${country}` : ''} on ${departureDate}${returnPart}`;

    // Pass both a human-readable query AND structured machine-readable fields
    onSearch({
      query,
      origin_iata:      originIata,
      destination_iata: destinationIata,
      departure_date:   departureDate,
      return_date:      tripType === 'Round trip' ? returnDate : '',
      trip_type:        tripTypeValue,
    });
    onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl shadow-2xl shadow-black/30 border border-gray-200/80 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/20 rounded-full blur-xl" />
          </div>
          <div className="relative px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">AI Powered Search</span>
                </div>
                <h2 className="text-lg font-black text-white leading-tight tracking-tighter">
                  Flight to {destination}
                </h2>
                {country && (
                  <p className="text-[11px] text-white/50 font-medium">{country}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Trip Type */}
          <TripTypeToggle value={tripType} onChange={setTripType} />

          {/* Departure Airport */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest mb-1.5">
              Departure Airport
            </label>
            <AirportDropdown
              id="departure-airport"
              value={departureAirport}
              onChange={setDepartureAirport}
              placeholder="Search airport or city..."
            />
          </div>

          {/* Date Fields - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3">
            <DateField
              id="departure-date"
              label="Departure Date"
              value={departureDate}
              onChange={setDepartureDate}
            />
            {tripType === 'Round trip' && (
              <DateField
                id="return-date"
                label="Return Date"
                value={returnDate}
                onChange={setReturnDate}
                min={departureDate || undefined}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-bold text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-300 dark:hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!isValid}
              className="flex-1 h-11 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                background: isValid
                  ? 'linear-gradient(135deg, #6366f1, #7c3aed)'
                  : undefined,
                backgroundColor: !isValid ? '#e5e7eb' : undefined
              }}
            >
              <Search className="w-4 h-4" />
              Search Flights
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripSearchDialog;
