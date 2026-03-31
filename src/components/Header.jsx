import React, { useState } from 'react';
import { Sparkles, RotateCw, Moon, Sun, Menu, User } from 'lucide-react';
import LoginDialog from './LoginDialog';

const Header = ({ onClear, onToggleTheme, isDark, onToggleSidebar, isSidebarVisible }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center px-6 py-3 mb-8 bg-card backdrop-blur-md border border-border rounded-full animate-slide-down z-10 relative max-w-4xl mx-auto shadow-lg shadow-black/5 dark:shadow-black/10 transition-colors duration-500">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-full bg-secondary border border-border text-muted-foreground flex items-center justify-center transition-all hover:bg-muted hover:text-accent active:scale-95 group"
          >
            <Menu className={`w-4 h-4 transition-transform duration-300 ${isSidebarVisible ? 'rotate-90' : ''}`} />
          </button>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-2xl font-black text-text-primary tracking-tighter leading-none">
                Simba<span className="text-accent"></span> Assistance
              </h1>
              <p className="text-[8px] text-text-muted font-black uppercase tracking-[0.4em] mt-1">Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center transition-all hover:bg-accent/20 hover:scale-105 active:scale-95 shadow-sm shadow-accent/10 group"
            title="Sign In"
          >
            <User className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border mx-2" />
          <button
            onClick={onClear}
            className="w-9 h-9 rounded-full bg-secondary border border-border text-text-secondary flex items-center justify-center transition-all hover:bg-muted hover:text-accent active:scale-95"
            title="New Conversation"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full bg-secondary border border-border text-text-secondary flex items-center justify-center transition-all hover:bg-muted hover:text-accent active:scale-95"
            title="Toggle Mode"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Header;
