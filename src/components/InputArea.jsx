import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, MicOff, Clock, X, Trash2 } from 'lucide-react';

const InputArea = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse recent searches:', err);
      }
    }

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => {
        const newText = prev ? `${prev.trim()} ${transcript}` : transcript;
        return newText;
      });
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const saveSearch = (term) => {
    if (!term.trim()) return;
    const filtered = recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase());
    const newSearches = [term, ...filtered].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recent_searches', JSON.stringify(newSearches));
  };

  const removeSearch = (e, term) => {
    e.stopPropagation();
    const newSearches = recentSearches.filter(s => s !== term);
    setRecentSearches(newSearches);
    localStorage.setItem('recent_searches', JSON.stringify(newSearches));
  };

  const clearAllSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      const searchTerm = input.trim();
      onSend(searchTerm);
      saveSearch(searchTerm);
      setInput('');
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-20 w-full max-w-4xl mx-auto px-4 bg-background/95 backdrop-blur-md border-t border-border pt-4 pb-2 shadow-sm">
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="relative flex items-center bg-card backdrop-blur-2xl border border-border rounded-2xl shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all h-14 px-2">
          <button 
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all ${
              isListening 
                ? 'text-red-500 bg-red-500/10 animate-pulse' 
                : 'text-text-secondary hover:text-accent hover:bg-secondary'
            }`}
            title={isListening ? "Stop Listening" : "Voice Input"}
            disabled={!isSupported || disabled}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-muted-foreground px-4 py-3 text-base font-medium"
            placeholder={isListening ? "Listening..." : "Where would you like to go?"}
            disabled={disabled}
            autoFocus
          />
          
          <button 
            type="submit" 
            disabled={!input.trim() || disabled}
            className={`w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center ${
              input.trim() && !disabled 
                ? 'bg-accent text-accent-foreground hover:shadow-lg hover:opacity-90' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {input.trim() && recentSearches.filter(s => s.toLowerCase().includes(input.toLowerCase())).length > 0 && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">Suggestions</span>
            </div>
            <button 
              onClick={clearAllSearches}
              className="text-[10px] text-text-muted hover:text-red-400 transition-colors flex items-center gap-1 uppercase tracking-tighter"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {recentSearches
              .filter(search => search.toLowerCase().includes(input.toLowerCase()))
              .map((search, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (!disabled) {
                      setInput(search);
                    }
                  }}
                  className="group flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all whitespace-nowrap"
                >
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors max-w-[150px] truncate">
                    {search}
                  </span>
                  <button
                    onClick={(e) => removeSearch(e, search)}
                    className="p-0.5 rounded-md hover:bg-white/10 text-text-muted hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputArea;
