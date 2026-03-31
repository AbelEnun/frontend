import React, { useState, useRef, useEffect } from 'react';
import {
  CreditCard, Lock, Shield, CheckCircle2, Loader2, AlertCircle,
  Camera, Upload, Scan, Plane, Mail, Phone, ChevronRight, Sparkles, ShieldCheck
} from 'lucide-react';
import ManualPaymentForm from './ManualPaymentForm';

const API_URL = import.meta.env.VITE_API_URL;


/* ── Animated Step Completion Badge ── */
const StepDone = ({ label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-fade-in-up">
    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30 flex-shrink-0">
      <CheckCircle2 className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{label}</div>
      <div className="text-xs font-semibold text-gray-800 dark:text-white/70 truncate">{value}</div>
    </div>
  </div>
);

/* ── Animated field wrapper ── */
const FadeIn = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
    >
      {children}
    </div>
  );
};

/* ── Input field ── */
const InputField = ({ id, type = 'text', placeholder, value, onChange, icon: Icon, autoFocus }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-white/20 pointer-events-none" />}
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={`w-full h-12 rounded-2xl border text-sm font-medium text-gray-900 dark:text-white
        bg-white dark:bg-white/[0.05] placeholder:text-gray-300 dark:placeholder:text-white/20
        border-gray-200 dark:border-white/[0.1]
        focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
        transition-all shadow-sm
        ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
    />
  </div>
);

/* ── Continue button ── */
const ContinueBtn = ({ onClick, disabled, label = 'Continue', loading }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full h-12 rounded-2xl text-sm font-bold text-accent-foreground flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed mt-1"
    style={{ background: 'linear-gradient(135deg,#F4B400,#D4A017)', boxShadow: '0 4px 20px rgba(244,180,0,0.35)' }}
  >
    {loading
      ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
      : <>{label}<ChevronRight className="w-4 h-4" /></>}
  </button>
);

/* ── Section label ── */
const SectionHeading = ({ icon: Icon, title, subtitle, color = 'indigo' }) => {
  const colors = {
    indigo: { bg: 'bg-accent', text: 'text-accent', sub: 'from-accent/[0.06]' },
    violet: { bg: 'bg-accent', text: 'text-accent', sub: 'from-accent/[0.06]' },
  };
  const c = colors[color];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/[0.05] bg-gradient-to-r ${c.sub} to-transparent`}>
      <div className={`w-7 h-7 rounded-xl ${c.bg} flex items-center justify-center shadow-sm`}>
        <Icon className="w-3.5 h-3.5 text-accent-foreground" />
      </div>
      <div>
        <div className={`text-xs font-bold ${c.text}`}>{title}</div>
        {subtitle && <div className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   InlinePaymentForm — Step-by-step wizard
───────────────────────────────────────── */
const InlinePaymentForm = ({ flight, passengerData, onPaymentComplete, completed, bookingHandler }) => {
  const [subStep, setSubStep] = useState('contact');
  const [form, setForm] = useState({ email: '', phone: '' });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePay = async (cardData) => {
    setBookingError(null);
    setIsBooking(true);
    setSubStep('paying');
    try {
      // Custom booking handler (e.g., for tourism packages)
      if (bookingHandler) {
        const result = await bookingHandler(cardData, form);
        if (result && result.success) {
          onPaymentComplete(result.bookingRef, form.email, form.phone);
        } else {
          setBookingError(result?.error || 'Payment could not be processed. Please try again.');
          setSubStep('payment');
        }
        return;
      }

      const originDestinations = [];
      if (flight.origin && flight.destination) {
        originDestinations.push({
          departure: { airportCode: flight.origin, date: (flight.departureTime || '').slice(0, 10) },
          arrival: { airportCode: flight.destination },
        });
      }
      if (flight.returnFlight) {
        const rf = flight.returnFlight;
        originDestinations.push({
          departure: { airportCode: rf.origin || flight.destination, date: (rf.departureTime || '').slice(0, 10) },
          arrival: { airportCode: rf.destination || flight.origin },
        });
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'book_flight',
          message: 'book_flight',
          sessionId: 'booking_session',
          offer: {
            offerId: flight.offerId,
            provider: flight.provider || '',
            totalPrice: flight.totalPrice || flight.price || 0,
            currency: flight.currency || 'USD',
            owner: flight.owner || 'CP',
            itineraryIdList: flight.itineraryIdList || [],
          },
          customer_info: {
            firstName: passengerData?.firstName || '',
            lastName: passengerData?.lastName || '',
            passportNumber: passengerData?.passportNumber || '',
            nationality: passengerData?.nationality || '',
            dob: passengerData?.dob || '',
            gender: passengerData?.gender || '',
            passportExpiry: passengerData?.passportExpiry || '',
            issuingCountry: passengerData?.issuingCountry || '',
            email: form.email,
            phone: form.phone,
          },
          card_info: { cardNumber: cardData.cardNumber, expiry: cardData.expiryDate, cvv: cardData.cvv },
          origin_destinations: originDestinations,
        }),
      });

      let data = await response.json();
      if (data && typeof data.body === 'string') { try { data = JSON.parse(data.body); } catch (_) {} }
      else if (data && typeof data.body === 'object' && data.body !== null) { data = data.body; }

      if (data && data.success) {
        const ref = data.bookingRef || `OAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        onPaymentComplete(ref, form.email, form.phone);
      } else {
        setBookingError(data?.error || 'Payment could not be processed. Please try again.');
        setSubStep('payment');
      }
    } catch (err) {
      console.error('[BookFlight]', err);
      setBookingError('A network error occurred. Please try again.');
      setSubStep('payment');
    } finally { setIsBooking(false); }
  };

  // ── If already completed (from chat history), show small badge ──
  if (completed) {
    return (
      <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 animate-fade-in-up">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Payment completed!</span>
      </div>
    );
  }

  const maskedCard = form.cardNumber
    ? form.cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    : '•••• •••• •••• ••••';

  return (
    <div className="max-w-md mt-3 space-y-3">

      {/* ── Flight summary pill ── */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] shadow-sm">
        <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F4B400,#D4A017)', boxShadow: '0 4px 12px rgba(244,180,0,0.3)' }}>
          <Plane className="w-4.5 h-4.5 text-accent-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-800 dark:text-white/75 truncate">{flight.origin} → {flight.destination}</div>
          <div className="text-[10px] text-gray-400 dark:text-white/30">{flight.airline} · {flight.trip_type || 'One-way'}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-base font-black text-gray-900 dark:text-white">${flight.totalPrice || flight.price}</div>
          <div className="text-[9px] text-gray-400 dark:text-white/25">incl. fees</div>
        </div>
      </div>

      {/* ══ STEP: Contact ══ */}
      {subStep === 'contact' && (
        <FadeIn>
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] overflow-hidden shadow-sm">
            <SectionHeading icon={Mail} title="Contact" subtitle="Where we'll send your ticket" color="indigo" />
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1.5">Email Address</label>
                <InputField id="email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} icon={Mail} autoFocus />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1.5">Phone Number</label>
                <InputField id="phone" type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} icon={Phone} />
              </div>
              <ContinueBtn
                onClick={() => setSubStep('payment')}
                disabled={!form.email || !form.phone}
                label="Continue to Payment"
              />
            </div>
          </div>
        </FadeIn>
      )}

      {/* Contact done badge */}
      {subStep !== 'contact' && (
        <FadeIn>
          <StepDone label="Contact" value={form.email} />
        </FadeIn>
      )}

      {/* ══ STEP: Manual Payment Entry ══ */}
      {subStep === 'payment' && (
        <FadeIn delay={100}>
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <ManualPaymentForm 
              totalAmount={flight.totalPrice || flight.price}
              onPay={handlePay}
              isProcessing={isBooking}
              error={bookingError}
            />
          </div>
        </FadeIn>
      )}

      {/* ══ STEP: Paying animation ══ */}
      {subStep === 'paying' && isBooking && (
        <FadeIn>
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-yellow-500/5 p-6 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg,#F4B400,#D4A017)', boxShadow: '0 8px 28px rgba(244,180,0,0.35)' }}>
              <Loader2 className="w-7 h-7 text-accent-foreground animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Processing payment…</p>
              <p className="text-[11px] text-gray-500 dark:text-white/40 mt-0.5">Please don't close this window.</p>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">256-bit encrypted · Secure</span>
            </div>
          </div>
        </FadeIn>
      )}

    </div>
  );
};

export default InlinePaymentForm;
