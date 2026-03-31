import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, X, Clock, Star, History, Search, Plane, Heart, Edit2, Check } from 'lucide-react';

/* ─────────────────────────────────────────────
   Trending Data
───────────────────────────────────────────── */
const TRENDING_ITEMS = [
  { icon: '✈️', label: 'London → Dubai',      query: 'Flights from London to Dubai' },
  { icon: '🛬', label: 'Addis Ababa → Dubai',  query: 'Flights from Addis Ababa to Dubai' },
  { icon: '🇸🇦', label: 'Via Saudi Arabia',     query: 'Flights via Saudi Arabia' },
  { icon: '🕌', label: 'Riyadh → Istanbul',     query: 'Flights from Riyadh to Istanbul' },
];

/* ─────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────── */
const Sidebar = ({
  isOpen, isVisible, onClose,
  chats, favorites = [], currentChatId,
  onNewChat, onSelectChat, onDeleteChat,
  onToggleFavorite, onSelectFavorite, onEditChat,
  onTrendingSelect
}) => {
  const show = isVisible || isOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 flex flex-col h-full
        ${show ? 'w-[272px]' : 'w-0 opacity-0 pointer-events-none'}
        bg-background border-r border-border
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-all duration-500 ease-in-out overflow-hidden
      `}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-accent shadow-accent/30">
              <Plane className="w-4 h-4 text-accent-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Simba Assistance AI</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-medium text-accent">
                  AI Concierge
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ color: 'rgba(107,114,128,0.7)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── New Chat button ── */}
        <div className="px-4 mb-5">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-accent/10 border border-accent/20 text-accent rounded-xl transition-all duration-300 group hover:bg-accent hover:text-accent-foreground"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-all bg-accent/15 group-hover:bg-accent-foreground/20">
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-semibold">New conversation</span>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 custom-scrollbar">

          {/* Saved Trips */}
          {favorites.length > 0 && (
            <section>
              <SectionLabel icon={<Star className="w-3 h-3 text-amber-400 fill-amber-400" />} label="Saved Trips" />
              <div className="space-y-0.5 mt-1.5">
                {favorites.map((flight, idx) => (
                  <FavoriteItem
                    key={flight.id}
                    flight={flight}
                    onSelect={() => onSelectFavorite(flight)}
                    onRemove={() => onToggleFavorite(flight)}
                    index={idx}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recent */}
          <section>
            <SectionLabel icon={<History className="w-3 h-3 text-blue-400" />} label="Recent" />
            <div className="space-y-0.5 mt-1.5">
              {Array.isArray(chats) && chats.length === 0 ? (
                <EmptyState />
              ) : (
                Array.isArray(chats) && chats.map((chat, idx) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChatId === chat.id}
                    onSelect={() => onSelectChat(chat.id)}
                    onDelete={() => onDeleteChat(chat.id)}
                    onEdit={(newTitle) => onEditChat(chat.id, newTitle)}
                    index={idx}
                  />
                ))
              )}
            </div>
          </section>

          {/* Trending */}
          <section>
            <SectionLabel icon={<Search className="w-3 h-3 text-purple-400" />} label="Trending" />
            <div className="space-y-0.5 mt-1.5">
              {TRENDING_ITEMS.map((item) => (
                <TrendingItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => onTrendingSelect?.(item.query)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-4 border-t border-border">
          <FooterPromo />
        </div>
      </aside>
    </>
  );
};


/* ─────────────────────────────────────────────
   Footer Promo
───────────────────────────────────────────── */
const FooterPromo = () => (
  <div
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group hover:bg-secondary"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary">
      <Star className="w-4 h-4 text-amber-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-text-primary">Promotions</p>
      <p className="text-[10px] text-muted-foreground">Exclusive deals</p>
    </div>
    <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-all text-accent">View →</span>
  </div>
);


/* ─────────────────────────────────────────────
   Section Label
───────────────────────────────────────────── */
const SectionLabel = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-2 mb-1">
    {icon}
    <span
      className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground opacity-60"
    >
      {label}
    </span>
  </div>
);


/* ─────────────────────────────────────────────
   Empty State
───────────────────────────────────────────── */
const EmptyState = () => (
  <div
    className="flex flex-col items-center justify-center py-7 px-4 rounded-xl border border-dashed border-border"
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-secondary">
      <Clock className="w-4.5 h-4.5 text-muted-foreground/40" />
    </div>
    <p className="text-[11px] font-medium text-muted-foreground/60">No recent trips</p>
  </div>
);


/* ─────────────────────────────────────────────
   Favorite Item
───────────────────────────────────────────── */
const FavoriteItem = ({ flight, onSelect, onRemove }) => (
  <div
    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-secondary"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary">
      <img
        src={`https://p-air-logo.s3.amazonaws.com/64/${flight.airlineCode}.png`}
        alt={flight.airline}
        className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 transition-all"
        onError={(e) => { e.target.src = 'https://www.gstatic.com/flights/airline_logos/70px/multi.png'; }}
      />
    </div>
    <div className="flex-1 min-w-0" onClick={onSelect}>
      <p className="text-xs font-bold text-text-primary truncate">
        {flight.origin} → {flight.destination}
      </p>
      <p className="text-[10px] text-muted-foreground truncate">{flight.airline}</p>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-bold text-accent">${flight.totalPrice || flight.price}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-red-500 hover:bg-red-500/10 transition-all"
      >
        <Heart className="w-3 h-3 fill-current" />
      </button>
    </div>
  </div>
);


/* ─────────────────────────────────────────────
   Chat Item
───────────────────────────────────────────── */
const ChatItem = ({ chat, isActive, onSelect, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(chat.title || '');

  const handleEdit = (e) => {
    e.stopPropagation();
    if (isEditing) {
      if (tempTitle.trim()) onEdit(tempTitle);
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setTempTitle(chat.title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEdit(e);
    else if (e.key === 'Escape') { setIsEditing(false); setTempTitle(chat.title); }
  };

  // Active bg: light = rgba(79,70,229,0.08), dark = rgba(99,102,241,0.12)
  const activeBg    = 'rgba(99,102,241,0.1)';
  const hoverBg     = 'rgba(107,114,128,0.08)';
  const activeDotBg = '#6366f1';

  return (
    <div
      onClick={isEditing ? null : onSelect}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 relative ${isActive ? 'bg-accent/10' : 'hover:bg-secondary'}`}
    >
      {/* Active bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-accent" />
      )}

      {/* Icon */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            className="w-full rounded-md px-2 py-0.5 text-xs font-semibold text-text-primary bg-background border border-primary outline-none"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className={`text-xs font-bold truncate transition-colors ${isActive ? 'text-accent' : 'text-text-primary opacity-70'}`}>
            {chat.title || 'New conversation'}
          </p>
        )}
        <p className="text-[10px] mt-0.5 text-muted-foreground opacity-60">
          {chat.messages?.length || 0} messages
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={handleEdit}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
        >
          {isEditing ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};


/* ─────────────────────────────────────────────
   Trending Item
───────────────────────────────────────────── */
const TrendingItem = ({ icon, label, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all group active:scale-95 hover:bg-primary/5"
  >
    <span className="text-sm flex-shrink-0">{icon}</span>
    <span
      className="text-xs font-bold truncate flex-1 transition-colors text-muted-foreground group-hover:text-primary"
    >
      {label}
    </span>
    <span
      className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all text-primary"
    >
      Search →
    </span>
  </div>
);


export default Sidebar;
