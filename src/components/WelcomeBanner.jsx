import React from 'react';
import { Plane, Zap, Lock, Sparkles, Globe2, ArrowRight, Clock, Shield, Search, MapPin } from 'lucide-react';

const WelcomeBanner = ({ onStartChat, onStartTourism }) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 md:px-10">
      {/* Hero Section */}
      <div className="bg-transparent text-center relative overflow-hidden mb-10 animate-slide-down">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded-full text-[10px] text-muted-foreground mb-6 uppercase tracking-widest font-black animate-float">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>AI Travel Assistant</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-black mb-3 text-text-primary leading-tight tracking-tighter">
            Hi! I'm your travel <br className="hidden md:block" />assistant 😊
          </h1>

          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
            What would you like to do today?
          </p>

          {/* Two Main Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Book a Flight */}
            <button
              onClick={() => onStartChat()}
              className="group relative p-6 md:p-8 rounded-[1.5rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-accent/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/10 text-left overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-[#D4A017] flex items-center justify-center shadow-xl shadow-accent/25 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Plane className="w-6 h-6 text-accent-foreground" />
                </div>

                <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">
                  ✈️ Book a Flight
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-5">
                  Search and book the best flight deals powered by AI intelligence.
                </p>

                <div className="inline-flex items-center gap-2 text-xs font-black text-accent uppercase tracking-widest group-hover:gap-3 transition-all">
                  Start Searching
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Visit a Country */}
            <button
              onClick={() => onStartTourism && onStartTourism()}
              className="group relative p-6 md:p-8 rounded-[1.5rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-accent/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/10 text-left overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-[#D4A017] flex items-center justify-center shadow-xl shadow-accent/25 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Globe2 className="w-6 h-6 text-accent-foreground" />
                </div>

                <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">
                  🌍 Visit a Country
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-5">
                  Explore curated tourism experiences and guided tour packages.
                </p>

                <div className="inline-flex items-center gap-2 text-xs font-black text-accent uppercase tracking-widest group-hover:gap-3 transition-all">
                  Explore Now
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 px-2">
        <ValueCard icon={<Zap className="w-4 h-4" />} title="Fast" desc="Instant Results" />
        <ValueCard icon={<Shield className="w-4 h-4" />} title="Smart" desc="AI Powered" />
        <ValueCard icon={<Lock className="w-4 h-4" />} title="Secure" desc="Verified APIs" />
        <ValueCard icon={<Globe2 className="w-4 h-4" />} title="Global" desc="All Routes" />
        <ValueCard icon={<Clock className="w-4 h-4" />} title="24/7" desc="Always On" />
      </div>
    </div>
  );
};

const ValueCard = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="w-10 h-10 bg-secondary border border-border rounded-xl flex items-center justify-center mb-2 group-hover:bg-accent/20 group-hover:border-accent/40 transition-all duration-300 text-accent">
      {icon}
    </div>
    <h4 className="font-extrabold text-[11px] text-text-primary uppercase tracking-widest mb-0.5">{title}</h4>
    <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60">{desc}</p>
  </div>
);

export default WelcomeBanner;
