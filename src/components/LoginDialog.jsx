import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Mail, Lock, LogIn, Chrome, ArrowRight, User } from 'lucide-react';

const LoginDialog = ({ isOpen, onClose }) => {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs w-full p-0 bg-transparent border-none shadow-none outline-none sm:max-w-[340px]">
        {/* Minimal Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-white/20 shadow-2xl animate-scale-in">
          
          {/* Header Area */}
          <div className="pt-8 pb-6 text-center relative z-10 px-6">
             <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-accent to-accent/60 rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30 mb-5 rotate-3 group hover:rotate-6 transition-transform duration-500 cursor-pointer">
               <LogIn className="w-7 h-7 text-accent-foreground drop-shadow-md" />
             </div>
             <DialogTitle className="text-2xl font-black text-text-primary tracking-tight mb-1">
               Welcome
             </DialogTitle>
             <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-80">
               Sign in to continue
             </p>
          </div>

          {/* Form Area */}
          <div className="px-6 pb-8 space-y-3 relative z-10">
            
             <div className="group relative">
               <input type="email" placeholder="Email Address" className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-sm font-bold text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all shadow-inner" />
               <Mail className="w-4 h-4 absolute left-4 top-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
             </div>

             <div className="group relative">
               <input type="password" placeholder="Password" className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-sm font-bold text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all shadow-inner" />
               <Lock className="w-4 h-4 absolute left-4 top-3.5 text-text-muted group-focus-within:text-accent transition-colors" />
             </div>

             <div className="flex justify-end px-1">
                 <button className="text-[10px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wider">Forgot?</button>
             </div>

             <button className="w-full py-4 mt-2 bg-accent hover:opacity-90 active:scale-[0.98] text-accent-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-accent/25 transition-all flex items-center justify-center gap-2 group">
               Sign In
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>

             <div className="flex flex-col gap-3 pt-4">
               <button className="flex items-center justify-center gap-2 py-3.5 bg-accent hover:opacity-90 text-accent-foreground rounded-2xl transition-all group shadow-xl shadow-accent/20 hover:-translate-y-0.5 w-full">
                 <Chrome className="w-4 h-4 text-accent-foreground" />
                 <span className="text-xs font-black uppercase tracking-widest leading-none">Continue with Google</span>
               </button>
             </div>
          </div>


          {/* Decorative Blur */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-accent/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
