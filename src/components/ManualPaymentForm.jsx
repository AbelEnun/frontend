import React, { useState } from 'react';
import { Shield, CreditCard, User, Calendar, Lock, Sparkles, Loader2 } from 'lucide-react';

const ManualPaymentForm = ({ 
  totalAmount = "350.00", 
  onPay = (data) => console.log('Payment data:', data),
  isProcessing = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(.{2})/, '$1/').trim().slice(0, 5);
      if (value.length === 3 && !value.includes('/')) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getCardType = (number) => {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    return 'Card';
  };

  const formatCardNumber = (num) => {
    const raw = num.replace(/\s/g, '');
    const masked = raw.padEnd(16, '•');
    return masked.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#0f172a] rounded-[2rem] border border-gray-100 dark:border-white/[0.05] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Payment</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">256-bit encrypted</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-accent" />
        </div>
      </div>

      {/* Card Preview */}
      <div className="relative mb-8 group perspective-1000">
        <div className={`
          relative w-full aspect-[1.6/1] rounded-2xl p-6 overflow-hidden transition-all duration-500 transform-style-3d
          bg-gradient-to-br from-[#1e293b] to-[#0f172a]
          shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)]
          ${focusedField === 'cvv' ? '[transform:rotateY(180deg)]' : ''}
        `}>
          {/* Front Side */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between backface-hidden">
            <div className="flex justify-between items-start">
              <div className="w-12 h-8 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-80" />
              <div className="text-white/80 font-bold italic text-lg">{getCardType(formData.cardNumber)}</div>
            </div>
            
            <div className="space-y-4">
              <div className="text-xl sm:text-2xl font-mono tracking-[0.2em] text-white drop-shadow-sm">
                {formatCardNumber(formData.cardNumber)}
              </div>
              
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Card Holder</p>
                  <p className="text-sm font-medium text-white tracking-wide uppercase truncate max-w-[150px]">
                    {formData.cardholderName || 'Your Name'}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Expires</p>
                  <p className="text-sm font-medium text-white tracking-wide">
                    {formData.expiryDate || 'MM/YY'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Back Side (CVV Only) */}
          <div className="absolute inset-0 flex flex-col justify-center [transform:rotateY(180deg)] backface-hidden">
            <div className="w-full h-10 bg-black/40 mt-4" />
            <div className="p-6">
              <div className="w-full h-8 bg-white/20 rounded flex items-center justify-end px-3">
                <span className="text-white font-mono font-bold italic tracking-wider">{formData.cvv || '•••'}</span>
              </div>
              <p className="text-[8px] text-white/30 uppercase mt-4 text-center tracking-widest leading-relaxed">
                This card is issued by your bank. Unauthorized use is strictly prohibited and subject to legal action.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('cardNumber')}
              onBlur={() => setFocusedField(null)}
              placeholder="Card Number"
              className="w-full h-12 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('cardholderName')}
              onBlur={() => setFocusedField(null)}
              placeholder="Cardholder Name"
              className="w-full h-12 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all dark:text-white uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 ml-1">
              Expiry Date
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('expiryDate')}
                onBlur={() => setFocusedField(null)}
                placeholder="MM/YY"
                className="w-full h-12 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 ml-1">
              CVV
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('cvv')}
                onBlur={() => setFocusedField(null)}
                placeholder="•••"
                className="w-full h-12 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all dark:text-white"
              />
            </div>
          </div>
        </div>


        {/* Pay Button */}
        <button
          onClick={() => onPay(formData)}
          disabled={!formData.cardNumber || isProcessing}
          className="group relative w-full h-12 mt-2 bg-accent hover:opacity-90 text-accent-foreground rounded-2xl font-bold text-sm shadow-[0_10px_20px_-5px_rgba(244,180,0,0.4)] transition-all active:scale-[0.98] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Place Booking ${totalAmount}
                <Sparkles className="w-4 h-4 hidden group-hover:block animate-pulse" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent via-[#D4A017] to-accent bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>
      </div>

      <style jsx>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ManualPaymentForm;
