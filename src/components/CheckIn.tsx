import React, { useState, useEffect } from 'react';
import { EmotionalState } from '../types';
import { Sparkles, Compass, Smile, Eye, Coffee, HelpCircle, Activity, ChevronRight, ChevronLeft, Quote, Sun, Zap, Heart, ChevronDown, Check } from 'lucide-react';

const INSPIRING_QUOTES = [
  {
    text: "Throughout this day, you can return to your breathing at any time to find sanctuary.",
    author: "Zen Guidance"
  },
  {
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    author: "Thich Nhat Hanh"
  },
  {
    text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.",
    author: "Hermann Hesse"
  },
  {
    text: "The present moment is filled with joy. If you are attentive, you will see it.",
    author: "Vietnamese Wisdom"
  },
  {
    text: "Begin at once to live, and count each separate day as a separate life.",
    author: "Seneca"
  },
  {
    text: "Peace is not a destination. It is the very method of your footsteps.",
    author: "Ancient Paths"
  }
];

interface CheckInProps {
  onSubmit: (data: { description: string; explicitState?: EmotionalState }) => void;
  isLoading: boolean;
}

const STATE_CARDS: { state: EmotionalState; label: string; icon: any; category: 'needs-balance' | 'positive' | 'neutral' }[] = [
  // Hard cases
  {
    state: 'Anxious / Overthinking',
    label: 'Anxious / Overthinking',
    icon: Sparkles,
    category: 'needs-balance'
  },
  {
    state: 'Stressed / Overwhelmed',
    label: 'Stressed / Overwhelmed',
    icon: Compass,
    category: 'needs-balance'
  },
  {
    state: 'Sad / Low mood',
    label: 'Sad / Low mood',
    icon: Smile,
    category: 'needs-balance'
  },
  {
    state: 'Angry / Irritated',
    label: 'Angry / Irritated',
    icon: Activity,
    category: 'needs-balance'
  },
  {
    state: 'Restless / Distracted',
    label: 'Restless / Distracted',
    icon: HelpCircle,
    category: 'needs-balance'
  },
  {
    state: 'Tired / Burnout',
    label: 'Tired / Burnout',
    icon: Coffee,
    category: 'needs-balance'
  },
  // Neutrals / Positives
  {
    state: 'Neutral / Balanced',
    label: 'Neutral / Balanced',
    icon: Eye,
    category: 'neutral'
  },
  {
    state: 'Happy / Joyful',
    label: 'Happy / Joyful',
    icon: Sun,
    category: 'positive'
  },
  {
    state: 'Euphoric / High-Energy',
    label: 'Euphoric / High-Energy',
    icon: Zap,
    category: 'positive'
  },
  {
    state: 'Calm / Content',
    label: 'Calm / Content',
    icon: Heart,
    category: 'positive'
  }
];

export default function CheckIn({ onSubmit, isLoading }: CheckInProps) {
  const [description, setDescription] = useState('');
  const [selectedState, setSelectedState] = useState<EmotionalState | undefined>(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Quotes Slider Carousel state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeTrigger, setFadeTrigger] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeTrigger(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
        setFadeTrigger(true);
      }, 300);
    }, 10000); // Slowed down from 5500 to 10000 for serene mindfulness reading
    return () => clearInterval(interval);
  }, []);

  const handleNextQuote = () => {
    setFadeTrigger(false);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
      setFadeTrigger(true);
    }, 250);
  };

  const handlePrevQuote = () => {
    setFadeTrigger(false);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev - 1 + INSPIRING_QUOTES.length) % INSPIRING_QUOTES.length);
      setFadeTrigger(true);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !selectedState) return;
    onSubmit({
      description,
      explicitState: selectedState
    });
  };

  const handleSelectState = (state: EmotionalState) => {
    // If selecting a state, we clear or keep description. Let's toggle.
    setSelectedState(selectedState === state ? undefined : state);
  };

  return (
    <div className="w-full px-3 py-2 animate-fade-in space-y-4">
      
      {/* Zen Futuristic Slogan */}
      <div className="text-center mt-1">
        <h1 className="text-xl md:text-2xl font-serif italic font-medium text-amber-950 tracking-tight animate-float-zen drop-shadow-[0_2px_15px_rgba(249,115,22,0.1)]">
          Mind Check-In
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Unified Prompt Hub - Futuristic Zen Input */}
        <div className="glass-panel rounded-2xl p-4 border border-orange-100/50 shadow-md space-y-3">

          {/* Emotional Anchors Custom Dropdown Selector */}
          <div className="space-y-1 relative">
            <label className="block text-[9px] font-mono tracking-wider font-bold text-amber-900 uppercase text-center">
              Select an Emotion
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl border border-orange-100/50 bg-white/90 text-slate-700 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300 text-left cursor-pointer"
              >
                {selectedState ? (
                  (() => {
                    const matched = STATE_CARDS.find(c => c.state === selectedState);
                    if (!matched) return <span className="text-xs text-slate-400 font-sans italic">Choose emotion...</span>;
                    const Icon = matched.icon;
                    return (
                      <div className="flex items-center gap-2">
                        <div className="p-0.5 px-1 rounded bg-orange-50 text-orange-600 shrink-0">
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="font-display font-semibold text-xs text-stone-800">
                          {matched.label}
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  <span className="text-xs text-slate-400 font-sans italic">Choose emotion...</span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-300" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-orange-100 rounded-xl shadow-lg max-h-44 overflow-y-auto scroller-none animate-slide-in">
                  <div className="p-1 space-y-0.5">
                    {STATE_CARDS.map((card) => {
                      const Icon = card.icon;
                      const isSelected = selectedState === card.state;
                      return (
                        <button
                          type="button"
                          key={card.state}
                          onClick={() => {
                            setSelectedState(card.state);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-150 hover:bg-orange-50 cursor-pointer ${
                            isSelected ? 'bg-orange-50 text-orange-700 font-medium' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="p-1 rounded bg-orange-50 text-orange-600 shrink-0">
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className="block text-xs font-semibold truncate">{card.label}</span>
                          </div>
                          {isSelected && <Check className="w-3 h-3 text-orange-600 shrink-0 mr-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OR Separator line beautifully blended */}
          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-orange-100/50"></div>
            <span className="flex-shrink mx-3 text-[11px] font-mono font-black text-custom-blue bg-blue-50 border border-blue-100 px-3 py-1 rounded-full shadow-xs tracking-wider">
              OR
            </span>
            <div className="flex-grow border-t border-orange-100/50"></div>
          </div>

          <div className="relative">
            <textarea
              id="mood-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How do you feel right now?"
              className="w-full h-18 px-4 py-2 border border-orange-100/50 rounded-xl bg-white/90 text-stone-800 placeholder-slate-400 font-sans text-xs sm:text-xs transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none leading-relaxed shadow-inner"
            />
          </div>

        </div>

        {/* Action Trigger Submit */}
        <div className="flex justify-center pt-0.5">
          <button
            type="submit"
            disabled={isLoading || (!description.trim() && !selectedState)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer ${
              isLoading || (!description.trim() && !selectedState)
                ? 'bg-orange-100/40 text-orange-300 border border-orange-100/30 cursor-not-allowed opacity-75'
                : 'futuristic-btn text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <span>Begin</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Moving Screen: Mindfulness Inspiring Quotes Carousel */}
      <div className="pt-2 border-t border-orange-100/30 space-y-2">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-widest text-custom-blue bg-blue-50 border border-blue-100 uppercase font-black">
            <Sparkles className="w-2.5 h-2.5 text-blue-500 animate-spin" />
            <span>Daily Reminder</span>
          </span>
        </div>

        {/* Quotes Carousel Glass Card */}
        <div className="glass-panel rounded-2xl p-3 border border-orange-100/50 shadow-sm relative min-h-[85px] flex flex-col justify-between overflow-hidden transition-all duration-500 hover:shadow-md">
          
          {/* Subtle Watermark Quotes icon */}
          <div className="absolute right-3.5 top-2.5 opacity-10 pointer-events-none text-orange-500">
            <Quote className="w-5 h-5 transform scale-x-[-1]" />
          </div>

          {/* Core Animating Quote Text */}
          <div className="flex-1 flex flex-col justify-center py-0.5 select-none">
            <p 
              className={`text-xs font-serif italic text-blue-950 text-center leading-relaxed transition-all duration-300 ${
                fadeTrigger ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform -translate-y-1 scale-98'
              }`}
            >
              "{INSPIRING_QUOTES[currentQuoteIndex].text}"
            </p>
            <p
              className={`text-[9px] font-mono tracking-wider text-custom-blue text-center mt-1 font-black uppercase transition-all duration-300 ${
                fadeTrigger ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-1'
              }`}
            >
              — {INSPIRING_QUOTES[currentQuoteIndex].author}
            </p>
          </div>

          {/* Stepper Dot & Arrow Controls */}
          <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-orange-100/30">
            {/* Left Nav Button */}
            <button
              type="button"
              onClick={handlePrevQuote}
              className="p-1 rounded bg-white border border-orange-200/50 hover:bg-orange-50/50 text-orange-600 hover:text-orange-700 hover:border-orange-300 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
              title="Previous Quote"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>

            {/* Stepper Dot Indicators */}
            <div className="flex gap-1.5 justify-center items-center">
              {INSPIRING_QUOTES.map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setFadeTrigger(false);
                    setTimeout(() => {
                      setCurrentQuoteIndex(idx);
                      setFadeTrigger(true);
                    }, 250);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentQuoteIndex ? 'w-3.5 bg-orange-600' : 'w-1.5 bg-orange-200/50 hover:bg-orange-300/50'
                  }`}
                  aria-label={`Go to quote ${idx + 1}`}
                />
              ))}
            </div>

            {/* Right Nav Button */}
            <button
              type="button"
              onClick={handleNextQuote}
              className="p-1 rounded bg-white border border-orange-200/50 hover:bg-orange-50/50 text-orange-600 hover:text-orange-700 hover:border-orange-300 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
              title="Next Quote"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
