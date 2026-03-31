import React, { useEffect, useRef } from 'react';
import DestinationCards from './DestinationCard';
import InlinePassportUpload from './InlinePassportUpload';
import InlinePaymentForm from './InlinePaymentForm';
import TourPackageCard from './TourPackageCard';
import TourAddOnsSelector from './TourAddOnsSelector';
import FlightResults from './FlightResults';
import {
  CheckCircle2, Shield, User, Globe, Calendar, FileText, Sparkles, Plane
} from 'lucide-react';

const ChatInterface = ({
  messages, isTyping, onSendMessage,
  onPassportScanned, onPaymentComplete,
  favorites, onToggleFavorite, onStartBooking,
  onBookTour, onTourAddOnsSelected, tourBookingHandler
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  /* ─────────────────────────────────────
     Passport Data Card
  ───────────────────────────────────── */
  const PassportDataCard = ({ data }) => {
    const fields = [
      { icon: User,     label: 'Full Name',      value: `${data.firstName || ''} ${data.lastName || ''}`.trim(), wide: true },
      { icon: FileText, label: 'Passport No.',   value: data.passportNumber },
      { icon: Globe,    label: 'Nationality',    value: data.nationality },
      { icon: Calendar, label: 'Date of Birth',  value: data.dob },
      { icon: User,     label: 'Gender',         value: data.gender },
      { icon: Calendar, label: 'Expiry',         value: data.passportExpiry },
      { icon: Globe,    label: 'Issuing Country',value: data.issuingCountry },
    ].filter(f => f.value);

    return (
      <div className="max-w-4xl mt-5 rounded-3xl border border-border bg-card overflow-hidden shadow-2xl animate-fade-in-zoom">
        {/* Header */}
        <div className="px-6 py-5 bg-accent text-accent-foreground flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-accent-foreground" />
          </div>
          <div>
            <div className="text-xs font-black text-accent-foreground tracking-tight">Passport Details Extracted</div>
            <div className="text-[10px] text-accent-foreground/70">Auto-filled via scan</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-accent-foreground/80 ml-auto" />
        </div>

        {/* Fields grid - Responsive */}
        <div className="p-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5">
          {fields.map(({ icon: Icon, label, value, wide }) => (
            <div key={label} className={`flex items-start gap-2 ${wide ? 'col-span-2' : 'col-span-1'}`}>
              <div className="w-5 h-5 rounded-md bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-2.5 h-2.5 text-accent" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  {label}
                </div>
                <div className="text-xs font-semibold text-text-primary mt-0.5 truncate max-w-[120px]">
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────
     Booking Confirmed Card
  ───────────────────────────────────── */
  const BookingConfirmedCard = ({ bookingRef, flight, travelerInfo, isTour }) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
      <div className="max-w-4xl mt-5 animate-fade-in-zoom w-full">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
          {/* Header - Success Message */}
          <div className="px-6 md:px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between bg-accent text-accent-foreground relative overflow-hidden gap-6">
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl bg-white/20 backdrop-blur-xl border border-white/20">
                <CheckCircle2 className="w-8 h-8 text-accent-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-accent-foreground tracking-widest uppercase mb-1">
                  {isTour ? 'Tour Booked!' : 'Booking Confirmed'}
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  <span className="text-[10px] font-black text-white tracking-widest uppercase opacity-90">REF: {bookingRef}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent-foreground/10 border border-accent-foreground/20 backdrop-blur-md relative z-10 group/eticket">
              <Shield className="w-4 h-4 text-accent-foreground group-hover/eticket:scale-110 transition-transform" />
              <span className="text-[10px] font-black text-accent-foreground tracking-widest uppercase">
                {isTour ? 'Tour Voucher Ready' : 'E-Ticket Ready'}
              </span>
            </div>
            {/* Dynamic Glow effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[40px]" />
          </div>

          <div className="flex flex-col md:grid md:grid-cols-12 min-h-[240px]">
            {/* Traveler Section */}
            <div className="md:col-span-3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border bg-primary/[0.03] flex flex-col justify-center">
              <div className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em] mb-5">Traveler Information</div>
              <div className="flex flex-col gap-6">
                <div className="group cursor-default">
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Primary Email</div>
                  <div className="flex items-center gap-2.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-bold text-text-primary tracking-tight">{travelerInfo?.email || 'traveler@email.com'}</span>
                  </div>
                </div>
                <div className="group cursor-default">
                  <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Contact Phone</div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[11px] font-bold text-text-primary tracking-tight">{travelerInfo?.phone || ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary Section */}
            <div className="md:col-span-5 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center">
              <div className="text-[9px] font-black text-accent/50 uppercase tracking-[0.2em] mb-8">
                {isTour ? 'Tour Details' : 'Flight Itinerary'}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-4xl font-black text-accent tracking-tighter drop-shadow-sm">{flight?.origin || 'ADD'}</span>
                  <span className="text-[11px] font-black text-accent/40 uppercase tracking-widest">
                    {isTour ? 'Destination' : 'Departure'}
                  </span>
                  <span className="text-xs font-bold text-accent-foreground/70 bg-accent/20 px-2 py-0.5 rounded-lg w-fit mt-1">
                    {isTour ? flight?.tourTitle || 'City Tour' : formatDate(flight?.departureTime) || ''}
                  </span>
                </div>

                {!isTour && (
                  <>
                    <div className="flex-1 px-8 flex flex-col items-center justify-center gap-2">
                      <div className="relative w-full h-1 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/10 rounded-full" />
                        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-card border-2 border-primary/20 flex items-center justify-center z-10 shadow-lg shadow-primary/10">
                          <Plane className="w-4 h-4 text-accent" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 text-right items-end">
                      <span className="text-4xl font-black text-accent tracking-tighter drop-shadow-sm">{flight?.destination || 'DXB'}</span>
                      <span className="text-[11px] font-black text-accent/40 uppercase tracking-widest">Arrival</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Price section */}
            <div className="md:col-span-4 p-6 md:p-8 bg-accent/5 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-[1.25rem] bg-white border border-border flex items-center justify-center mb-5 shadow-xl shadow-primary/5 p-2">
                {isTour ? (
                  <Globe className="w-8 h-8 text-accent" />
                ) : (
                  <img
                    src={`https://images.kiwi.com/airlines/64/${flight?.airlineCode || 'ET'}.png`}
                    alt={flight?.airline || 'Airline'}
                    className="w-full h-full object-contain brightness-110"
                  />
                )}
              </div>
              <span className="text-[10px] font-black text-accent/40 uppercase tracking-[0.3em] mb-2">Grand Total</span>
              <span className="text-4xl font-black text-accent tracking-tighter leading-none mb-4 tracking-[-0.05em]">${flight?.totalPrice || '0'}</span>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/10">
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {isTour ? flight?.tourCode || 'ETHS22' : `${flight?.airlineCode || 'ET'} ${flight?.flightNumber || '600'}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {Array.isArray(messages) && messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex flex-col gap-4 w-full animate-fade-in-up ${
            msg.role === 'user' ? 'items-end' : 'items-start'
          }`}
        >
          <div className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {/* ── Assistant Message ── */}
            {msg.role === 'assistant' && (
              <div className="flex flex-col flex-1 gap-3">

                {/* Text bubble — hide upload/payment prompts once completed */}
                {msg.content && !(msg.type === 'passport_upload' && msg.completed) && (
                  <div className="max-w-[95%] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-2xl text-base leading-relaxed text-text-primary shadow-sm dark:shadow-none whitespace-pre-line">
                    {msg.content}
                  </div>
                )}

                {/* ✈️ Destination Cards */}
                {Array.isArray(msg.destinations) && msg.destinations.length > 0 && (
                  <DestinationCards
                    destinations={msg.destinations}
                    onSearch={(query) => onSendMessage && onSendMessage(query)}
                  />
                )}

                {/* 🌍 Tour Package Card */}
                {msg.type === 'tour_package' && msg.tourData && (
                  <TourPackageCard
                    tour={msg.tourData}
                    onBookTour={onBookTour}
                  />
                )}

                {/* 🎯 Tour Add-Ons Selector */}
                {msg.type === 'tour_addons' && msg.addOnsData && (
                  <TourAddOnsSelector
                    addOns={msg.addOnsData.addOns}
                    travelers={msg.addOnsData.travelers}
                    pricePerPerson={msg.addOnsData.pricePerPerson}
                    onAddOnsSelected={onTourAddOnsSelected}
                    completed={msg.completed}
                  />
                )}

                {/* 📷 Passport Upload Widget — hidden once completed */}
                {msg.type === 'passport_upload' && !msg.completed && (
                  <InlinePassportUpload
                    onPassportScanned={onPassportScanned}
                    completed={false}
                  />
                )}

                {/* ✅ Compact "Passport uploaded" badge when completed */}
                {msg.type === 'passport_upload' && msg.completed && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-secondary border border-border max-w-sm animate-fade-in-up">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                    <span className="text-xs font-bold text-text-primary">Passport uploaded &amp; verified ✓</span>
                  </div>
                )}

                {/* ✅ Passport Data Card */}
                {msg.type === 'passport_confirmed' && msg.passportData && (
                  <PassportDataCard data={msg.passportData} />
                )}

                {/* 💳 Payment Form — hidden once completed */}
                {msg.type === 'payment_form' && !msg.completed && (
                  <InlinePaymentForm
                    flight={msg.flight}
                    passengerData={msg.passengerData}
                    onPaymentComplete={onPaymentComplete}
                    completed={false}
                    bookingHandler={msg.bookingHandler || null}
                  />
                )}

                {/* 💳 Payment done badge */}
                {msg.type === 'payment_form' && msg.completed && (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-secondary border border-border max-w-sm animate-fade-in-up">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                    <span className="text-xs font-bold text-text-primary">Payment completed ✓</span>
                  </div>
                )}

                {/* 🎉 Booking Confirmed */}
                {msg.type === 'booking_confirmed' && (
                  <BookingConfirmedCard
                    bookingRef={msg.bookingRef}
                    flight={msg.flight}
                    travelerInfo={msg.travelerInfo}
                    isTour={msg.isTour}
                  />
                )}

                {/* Flight results snapshot */}
                {msg.action === 'view_results' && msg.attachedResults && msg.attachedResults.offers && (
                  <div className="mt-2 w-full">
                    <FlightResults
                      results={msg.attachedResults.offers}
                      favorites={favorites}
                      onToggleFavorite={onToggleFavorite}
                      onStartBooking={onStartBooking}
                    />
                  </div>
                )}

                {/* Quick-reply buttons */}
                {Array.isArray(msg.buttons) && msg.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.buttons.map((label, buttonIdx) => (
                      <button
                        key={`${idx}_${buttonIdx}_${label}`}
                        onClick={() => onSendMessage && onSendMessage(label)}
                        className="text-xs bg-white dark:bg-white/10 border border-gray-300 dark:border-white/15 text-text-primary px-3 py-2 rounded-xl hover:border-accent hover:text-accent transition-all"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── User Message ── */}
            {msg.role === 'user' && (
              <div className="flex flex-col gap-2 items-end max-w-[85%] ml-auto">
                <div className="p-4 px-6 rounded-2xl bg-accent text-accent-foreground text-base shadow-sm">
                  {msg.content}
                </div>
                {msg.detectedFilters && msg.detectedFilters.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {msg.detectedFilters.map(filter => (
                      <span
                        key={filter}
                        className="px-2 py-0.5 rounded-full bg-secondary border border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest"
                      >
                        {filter}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm self-start animate-fade-in-up">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce delay-150" />
            <span className="w-2 h-2 rounded-full bg-accent animate-bounce delay-300" />
          </div>
        </div>
      )}

      <div ref={scrollRef} className="h-4" />
    </div>
  );
};

export default ChatInterface;
