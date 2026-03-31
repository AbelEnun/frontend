import React, { useState, useRef } from 'react';
import {
  Plane, Sparkles, Lock, CheckCircle2, ArrowLeft, Loader2,
  Shield, CreditCard, User, Mail, Phone, ChevronRight, AlertCircle
} from 'lucide-react';
import ManualPaymentForm from './ManualPaymentForm';

/* ─────────────────────────────────────────────
   Minimal field component
───────────────────────────────────────────── */
const Field = ({ icon: Icon, label, id, type = 'text', value, onChange, placeholder, half, readOnly }) => (
  <div className={half ? '' : 'col-span-2'}>
    <label
      htmlFor={id}
      className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1.5"
    >
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 dark:text-white/20 pointer-events-none" />
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`
          w-full h-10 rounded-xl border text-sm font-medium text-gray-900 dark:text-white
          bg-white dark:bg-white/[0.04] placeholder:text-gray-300 dark:placeholder:text-white/15
          border-gray-200 dark:border-white/[0.08]
          focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
          transition-all
          ${Icon ? 'pl-9 pr-3' : 'px-3'}
          ${readOnly ? 'bg-gray-100 dark:bg-white/[0.08] opacity-70 cursor-not-allowed' : ''}
        `}
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Step indicator
───────────────────────────────────────────── */
const Steps = ({ current }) => (
  <div className="flex items-center gap-2">
    {[
      { n: 1, label: 'Passenger' },
      { n: 2, label: 'Payment' },
    ].map(({ n, label }, i) => (
      <React.Fragment key={n}>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
              ${current >= n
                ? 'bg-accent text-accent-foreground shadow-sm shadow-accent/30'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/25 border border-gray-200 dark:border-white/[0.08]'}`}
          >
            {current > n ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:inline
            ${current >= n ? 'text-gray-700 dark:text-white/70' : 'text-gray-400 dark:text-white/25'}`}>
            {label}
          </span>
        </div>
        {i === 0 && (
          <div className={`flex-1 h-px w-8 transition-all ${current > 1 ? 'bg-accent/60' : 'bg-gray-200 dark:border-white/[0.08]'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   Passport OCR via Lambda
───────────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL;

async function scanPassportWithAI(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target.result.split(',')[1];
        const mimeType = file.type || 'image/jpeg';
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'scan_passport',
            image: base64Data,
            mimeType,
            message: 'scan_passport',
            sessionId: 'passport_scan',
          }),
        });
        if (!response.ok) throw new Error('Scan failed');
        let data = await response.json();
        if (data && typeof data.body === 'string') {
          try { data = JSON.parse(data.body); } catch (_) { }
        } else if (data && typeof data.body === 'object' && data.body !== null) {
          data = data.body;
        }
        if (data && data.passport) resolve(data.passport);
        else reject(new Error(data?.error || 'Could not read passport data'));
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}


const BookingCheckout = ({ flight, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [bookingRef, setBookingRef] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [showPassportFields, setShowPassportFields] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    passportNumber: '', nationality: '',
    dob: '', gender: '',
    passportExpiry: '', issuingCountry: '',
    email: '', phone: '',
    cardNumber: '', expiry: '', cvc: '',
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);


  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setScanError(null);
    setIsScanning(true);
    try {
      const passport = await scanPassportWithAI(file);
      setForm(prev => ({
        ...prev,
        firstName: passport.firstName || prev.firstName,
        lastName: passport.lastName || prev.lastName,
        passportNumber: passport.passportNumber || prev.passportNumber,
        nationality: passport.nationality || prev.nationality,
        dob: passport.dob || prev.dob,
        gender: passport.gender || prev.gender,
        passportExpiry: passport.passportExpiry || prev.passportExpiry,
        issuingCountry: passport.issuingCountry || prev.issuingCountry,
      }));
      setShowPassportFields(false);
    } catch (err) {
      setScanError('⚠️ Couldn\'t extract data. Please fill manually.');
    } finally { setIsScanning(false); e.target.value = null; }
  };

  const set = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleCompletePayment = async () => {
    setBookingError(null);
    setIsBooking(true);
    try {
      const originDestinations = [{
        departure: { airportCode: flight.origin, date: (flight.departureTime || '').slice(0, 10) },
        arrival: { airportCode: flight.destination },
      }];
      if (flight.returnFlight) {
        originDestinations.push({
          departure: { airportCode: flight.returnFlight.origin || flight.destination, date: (flight.returnFlight.departureTime || '').slice(0, 10) },
          arrival: { airportCode: flight.returnFlight.destination || flight.origin },
        });
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'book_flight',
          offer: { offerId: flight.offerId, provider: flight.provider, totalPrice: flight.totalPrice || flight.price, currency: flight.currency || 'USD' },
          customer_info: form,
          card_info: { cardNumber: form.cardNumber, expiry: form.expiry, cvv: form.cvc },
          origin_destinations: originDestinations,
        }),
      });
      let data = await response.json();
      if (data && typeof data.body === 'string') data = JSON.parse(data.body);
      if (data?.success) {
        setBookingRef(data.bookingRef || 'OAT-' + Math.random().toString(36).substring(7).toUpperCase());
        setStep(3);
      } else { setBookingError(data?.error || 'Payment failed.'); }
    } catch (err) { setBookingError('Network error.');
    } finally { setIsBooking(false); }
  };

  if (step === 3) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Booking Confirmed!</h2>
          <p className="text-sm text-gray-500 dark:text-white/40">Your flight to {flight.destination} is booked.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200">
          <span className="text-xs font-bold text-emerald-700">Ref: {bookingRef}</span>
        </div>
        <button onClick={onComplete} className="px-8 py-3 rounded-xl text-sm font-bold text-accent-foreground bg-accent shadow-lg shadow-accent/20">Back to Search</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar h-full bg-gray-50 dark:bg-[#0a0f1e]">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={step === 1 ? onBack : () => setStep(1)} className="flex items-center gap-2 text-sm text-gray-500">
            <ArrowLeft className="w-4 h-4" /> <span>{step === 1 ? 'Back' : 'Passenger'}</span>
          </button>
          <Steps current={step} />
        </div>

        <div className="p-3 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20"><Plane className="w-4 h-4 text-accent-foreground" /></div>
          <div className="flex-1"><div className="text-xs font-bold">{flight.origin} → {flight.destination}</div></div>
          <div className="text-sm font-black">${flight.totalPrice || flight.price}</div>
        </div>

        {step === 1 && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.04] bg-indigo-50/20 flex items-center gap-2">
              <User className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold">Passenger Details</span>
            </div>
            <div className="p-4">
              {!showPassportFields && form.firstName ? (
                <div className="mb-5 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div><h3 className="text-sm font-black">Passport Details Extracted</h3><p className="text-[10px] text-emerald-600 uppercase">Auto-filled from scan</p></div>
                    </div>
                    <button onClick={() => setShowPassportFields(true)} className="text-[10px] font-bold text-accent">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-gray-400 font-bold uppercase text-[9px]">Name</p><p className="font-bold">{form.firstName} {form.lastName}</p></div>
                    <div><p className="text-gray-400 font-bold uppercase text-[9px]">Passport</p><p className="font-bold">{form.passportNumber}</p></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5 p-4 rounded-xl border-dashed border-2 border-indigo-100 dark:border-indigo-500/30 text-center">
                    {isScanning ? <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> : <Scan className="w-6 h-6 mx-auto mb-2 text-accent" />}
                    <h3 className="text-sm font-black">Upload Your Passport</h3>
                    <p className="text-[11px] text-gray-400 mb-3">Take a photo or upload your passport's data page. I'll auto-fill your info instantly.</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setScanError(null); cameraInputRef.current?.click(); }} className="flex-1 py-2 bg-accent/10 rounded-lg text-xs font-bold text-accent-foreground">Camera</button>
                      <button onClick={() => { setScanError(null); fileInputRef.current?.click(); }} className="flex-1 py-2 bg-gray-50 rounded-lg text-xs font-bold">Upload</button>
                    </div>
                    <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" className="hidden" />
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    {scanError && <p className="mt-2 text-xs text-amber-600">{scanError}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <Field id="firstName" label="First Name" value={form.firstName} onChange={set} placeholder="John" half />
                    <Field id="lastName" label="Last Name" value={form.lastName} onChange={set} placeholder="Doe" half />
                    <Field id="passportNumber" label="Passport No." value={form.passportNumber} onChange={set} half />
                    <Field id="nationality" label="Nationality" value={form.nationality} onChange={set} half />
                    <Field id="dob" type="date" label="DOB" value={form.dob} onChange={set} half />
                    <Field id="gender" label="Gender" value={form.gender} onChange={set} half />
                    <Field id="passportExpiry" type="date" label="Expiry" value={form.passportExpiry} onChange={set} half />
                    <Field id="issuingCountry" label="Issuing" value={form.issuingCountry} onChange={set} half />
                  </div>
                </>
              )}
              <div className="pt-4 border-t border-gray-100 mb-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contact</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="email" label="Email" value={form.email} onChange={set} type="email" half />
                  <Field id="phone" label="Phone" value={form.phone} onChange={set} half />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!form.firstName || !form.email} className="w-full py-3 rounded-2xl text-sm font-bold text-accent-foreground bg-accent shadow-xl shadow-accent/20 disabled:opacity-50">Continue to Payment</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <ManualPaymentForm 
              totalAmount={flight.totalPrice || flight.price}
              onPay={(cardData) => {
                // Bridge the data from ManualPaymentForm to our book_flight call
                setForm(prev => ({
                  ...prev,
                  cardNumber: cardData.cardNumber,
                  expiry: cardData.expiryDate,
                  cvc: cardData.cvv
                }));
                // We don't trigger payment immediately here to allow user to see Total
                // But the component handles the "Pay Now" UI.
                // Let's call handleCompletePayment directly if user clicks Pay Now in the form
                handleCompletePayment();
              }}
              isProcessing={isBooking}
              error={bookingError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCheckout;
