import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
} from "./ui/dialog";
import { Copy, Check, Share2, Send, Instagram, ArrowRight } from 'lucide-react';

const ShareDialog = ({ isOpen, onClose, flight }) => {
  const [copied, setCopied] = useState(false);

  if (!flight) return null;

  const shareUrl = window.location.origin; 
  
  // Minimal text for sharing
  const shareText = `Found a great flight: ${flight.airline} from ${flight.origin} to ${flight.destination} for $${flight.totalPrice || flight.price}`;

  // WhatsApp
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
  // Telegram
  const tgLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[320px] w-full p-0 bg-transparent border-none shadow-none outline-none">
        <div className="relative overflow-hidden rounded-[2rem] bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-white/20 shadow-2xl animate-scale-in">
          
          {/* Header & Flight Mini-Card */}
          <div className="p-6 pb-6 text-center relative z-10">
             <div className="mx-auto w-16 h-16 bg-white rounded-2xl p-3 shadow-lg shadow-black/5 mb-4 flex items-center justify-center">
                 <img 
                   src={`https://images.kiwi.com/airlines/64/${flight.airlineCode || 'ET'}.png`} 
                   alt={flight.airline}
                   className="w-full h-full object-contain"
                   onError={(e) => { e.target.src = 'https://www.gstatic.com/flights/airline_logos/70px/multi.png' }}
                 />
             </div>
             
             <h2 className="text-xl font-black text-text-primary tracking-tight leading-none mb-1">
               {flight.origin} <span className="opacity-40 px-1">→</span> {flight.destination}
             </h2>
             <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{flight.airline}</p>
             
             <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-xs font-black text-primary">${flight.totalPrice || flight.price}</span>
             </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-6">
             {/* WhatsApp */}
             <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
               <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366] border border-[#25D366]/20 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#25D366]/30">
                 <svg className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
               </div>
               <span className="text-[9px] font-bold text-text-muted">WhatsApp</span>
             </a>

             {/* Telegram */}
             <a href={tgLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
               <div className="w-12 h-12 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc] border border-[#0088cc]/20 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#0088cc]/30">
                 <Send className="w-4 h-4 text-[#0088cc] group-hover:text-white transition-colors -ml-0.5" />
               </div>
               <span className="text-[9px] font-bold text-text-muted">Telegram</span>
             </a>

             {/* Instagram */}
             <button onClick={handleCopy} className="flex flex-col items-center gap-1 group">
               <div className="w-12 h-12 rounded-2xl bg-pink-500/10 hover:bg-gradient-to-tr hover:from-orange-400 hover:to-pink-600 border border-pink-500/20 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-pink-500/30">
                 <Instagram className="w-4 h-4 text-pink-500 group-hover:text-white transition-colors" />
               </div>
               <span className="text-[9px] font-bold text-text-muted">Instagram</span>
             </button>

             {/* Copy */}
             <button onClick={handleCopy} className="flex flex-col items-center gap-1 group">
               <div className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg">
                 {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-text-primary" />}
               </div>
               <span className="text-[9px] font-bold text-text-muted">Copy Link</span>
             </button>
          </div>

          {/* Decorative Blur */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
