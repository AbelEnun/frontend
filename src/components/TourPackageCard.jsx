import React, { useState } from 'react';
import {
  MapPin, Clock, CheckCircle2, XCircle, DollarSign, Baby,
  AlertTriangle, CalendarRange, Phone, Globe2, Sparkles,
  ArrowRight, Users, Star, Shield, Coffee, Bus, Ticket,
  ChevronDown, ChevronUp
} from 'lucide-react';

/* ── Section Wrapper ── */
const Section = ({ icon: Icon, title, color = 'blue', children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
        color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-500/15' :
        color === 'red' ? 'bg-red-100 dark:bg-red-500/15' :
        color === 'amber' ? 'bg-amber-100 dark:bg-amber-500/15' :
        color === 'violet' ? 'bg-violet-100 dark:bg-violet-500/15' :
        color === 'indigo' ? 'bg-accent/15' :
        'bg-accent/15'
      }`}>
        <Icon className={`w-3.5 h-3.5 ${
          color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
          color === 'red' ? 'text-red-500 dark:text-red-400' :
          color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
          color === 'violet' ? 'text-violet-600 dark:text-violet-400' :
          color === 'indigo' ? 'text-accent' :
          'text-accent'
        }`} />
      </div>
      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">{title}</h4>
    </div>
    {children}
  </div>
);

const TourPackageCard = ({ tour, onBookTour }) => {
  const [expanded, setExpanded] = useState(false);

  if (!tour) return null;

  return (
    <div className="max-w-2xl mt-4 animate-fade-in-zoom">
      <div className="rounded-[1.5rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-xl">

        {/* ── Hero Header ── */}
        <div className="relative px-6 py-8 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F4B400 0%, #D4A017 100%)',
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-4 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
            <Globe2 className="w-3 h-3 text-white/80" />
            <span className="text-[9px] font-black text-accent-foreground uppercase tracking-widest">Tour Package</span>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-2">
              <MapPin className="w-3 h-3 text-white/70" />
              <span className="text-[10px] font-bold text-accent-foreground/80 uppercase tracking-wider">{tour.country}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-accent-foreground tracking-tight leading-tight">
              {tour.city}
            </h2>

            <p className="text-base text-accent-foreground/80 font-semibold">{tour.title}</p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10">
                <Clock className="w-3.5 h-3.5 text-white/70" />
                <span className="text-xs font-bold text-accent-foreground">{tour.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10">
                <Ticket className="w-3.5 h-3.5 text-white/70" />
                <span className="text-xs font-bold text-accent-foreground">{tour.code}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/20">
                <span className="text-xs font-bold text-accent-foreground">From ${Math.min(...tour.pricing.map(p => p.price))}/person</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-6">

          {/* Introduction */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-widest">About this Experience</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed font-medium">
              {tour.introduction}
            </p>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/5" />

          {/* Included / Not Included Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section icon={CheckCircle2} title="What's Included" color="emerald">
              <ul className="space-y-2">
                {tour.included.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-white/60 font-medium leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section icon={XCircle} title="Not Included" color="red">
              <ul className="space-y-2">
                {tour.notIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-xs text-gray-700 dark:text-white/60 font-medium leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/5" />

          {/* Pricing Grid */}
          <Section icon={DollarSign} title="Pricing (Per Person)" color="blue">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tour.pricing.map((tier, i) => (
                <div
                  key={i}
                  className={`relative p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] ${
                    i === 0
                      ? 'border-accent/30 bg-accent/10'
                      : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]'
                  }`}
                >
                  {i === tour.pricing.length - 1 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white uppercase tracking-wider">
                      Best Value
                    </div>
                  )}
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                    ${tier.price}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 dark:text-white/40 mt-1 uppercase tracking-wider">
                    {tier.persons}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Expandable Details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-accent hover:opacity-80 transition-colors"
          >
            {expanded ? 'Show Less' : 'Show More Details'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="h-px bg-gray-100 dark:bg-white/5" />

              {/* Child Policy */}
              <Section icon={Baby} title="Child Policy" color="violet">
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                    <div className="text-[9px] font-black text-violet-500 dark:text-violet-400 uppercase tracking-widest mb-0.5">Under 5</div>
                    <div className="text-sm font-black text-violet-700 dark:text-violet-300">{tour.childPolicy.under5}</div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
                    <div className="text-[9px] font-black text-violet-500 dark:text-violet-400 uppercase tracking-widest mb-0.5">Age 5–12</div>
                    <div className="text-sm font-black text-violet-700 dark:text-violet-300">{tour.childPolicy.age5to12}</div>
                  </div>
                </div>
              </Section>

              <div className="h-px bg-gray-100 dark:bg-white/5" />

              {/* Important Notes */}
              <Section icon={AlertTriangle} title="Important Notes" color="amber">
                <ul className="space-y-2">
                  {tour.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                      </div>
                      <span className="text-xs text-gray-700 dark:text-white/60 font-medium leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <div className="h-px bg-gray-100 dark:bg-white/5" />

              {/* Availability & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section icon={CalendarRange} title="Availability" color="indigo">
                  <div className="px-4 py-3 rounded-2xl bg-accent/10 border border-accent/20">
                    <span className="text-xs font-bold text-accent">
                      {tour.availability.from} — {tour.availability.to}
                    </span>
                  </div>
                </Section>

                <Section icon={Phone} title="On Arrival" color="blue">
                  <p className="text-xs text-gray-600 dark:text-white/50 font-medium leading-relaxed">
                    {tour.contact}
                  </p>
                </Section>
              </div>
            </div>
          )}

          {/* ── Add-On Services Preview ── */}
          <div className="h-px bg-gray-100 dark:bg-white/5" />
          <Section icon={Star} title="Optional Add-On Services" color="amber">
            <div className="flex flex-wrap gap-2">
              {tour.addOns.map((addon, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <span className="text-xs font-semibold text-gray-700 dark:text-white/60">{addon.name}</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">${addon.price}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── CTA Button ── */}
          <button
            onClick={() => onBookTour && onBookTour(tour)}
            className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-accent-foreground flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] group"
            style={{
              background: 'linear-gradient(135deg, #F4B400 0%, #D4A017 100%)',
              boxShadow: '0 8px 32px rgba(244, 180, 0, 0.35)',
            }}
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Book This Tour
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourPackageCard;
