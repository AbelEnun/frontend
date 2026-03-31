import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

const FlightChat = ({ flight }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your AI travel assistant. I see you're looking at the flight to ${flight.destination || 'your destination'}. How can I help you with this specific flight?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulated AI response
    setTimeout(() => {
      const botMsg = { 
        role: 'assistant', 
        content: `That's a great question about the ${flight.airline} flight. Based on current trends, this is a competitive price for ${flight.origin} to ${flight.destination}. Would you like me to check baggage policies or seat availability for you?`
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[400px] bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-border">
      <div className="p-3 border-b border-border flex items-center justify-between bg-secondary/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary text-opacity-80">Flight Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex max-w-[90%] animate-fade-in-up",
              msg.role === 'user' ? 'ml-auto' : 'mr-auto'
            )}
          >
            <div className={cn(
              "p-3 rounded-xl text-sm font-medium leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary border border-border text-text-primary opacity-90'
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="p-4 rounded-xl bg-secondary flex gap-1 items-center mr-auto animate-fade-in-up">
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce delay-150" />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce delay-300" />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 border-t border-border bg-secondary/30">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="bg-background border-border focus:border-primary/50 text-[11px] h-9 font-bold"
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FlightChat;
