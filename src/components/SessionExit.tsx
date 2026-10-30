import React, { useState } from 'react';
import { MeditationSession, EmotionalState } from '../types';
import { ThumbsUp, ThumbsDown, Notebook, Clock, SunDim, BookOpen, Star, Sparkles, Compass, Smile, Eye, Coffee, HelpCircle, Activity, Sun, Zap, Heart, ChevronDown, Check } from 'lucide-react';

interface SessionExitProps {
  session: MeditationSession;
  onSaveFeedback: (feedback: { rating: 'up' | 'down' | null; notes: string; endState?: EmotionalState }) => void;
  onReturnToStart: () => void;
}

const EMOTIONS_LIST: { state: EmotionalState; label: string; icon: any }[] = [
  { state: 'Calm / Content', label: 'Calm / Content', icon: Heart },
  { state: 'Neutral / Balanced', label: 'Neutral / Balanced', icon: Eye },
  { state: 'Happy / Joyful', label: 'Happy / Joyful', icon: Sun },
  { state: 'Euphoric / High-Energy', label: 'Euphoric / High-Energy', icon: Zap },
  { state: 'Tired / Burnout', label: 'Tired / Burnout', icon: Coffee },
  { state: 'Anxious / Overthinking', label: 'Anxious / Overthinking', icon: Sparkles },
  { state: 'Stressed / Overwhelmed', label: 'Stressed / Overwhelmed', icon: Compass },
  { state: 'Sad / Low mood', label: 'Sad / Low mood', icon: Smile },
  { state: 'Angry / Irritated', label: 'Angry / Irritated', icon: Activity },
  { state: 'Restless / Distracted', label: 'Restless / Distracted', icon: HelpCircle },
];

export default function SessionExit({ session, onSaveFeedback, onReturnToStart }: SessionExitProps) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [notes, setNotes] = useState('');
  const [endState, setEndState] = useState<EmotionalState | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'journal' | 'habits' | 'sleep' | 'breath'>('journal');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFeedback({ rating, notes, endState: endState || undefined });
    setIsSaved(true);
  };

  const enhancements = session.enhancements || {
    journalingPrompts: [
      "What thoughts kept arising and how did you relate to them?",
      "Where in your body did you feel physical release?",
      "How can you bring this exact feeling into your next conversation?"
    ],
    habitRoutine: [
      "Morning Transition: 3 deep extended exhalations immediately upon walking-up.",
      "Lunch Check-in: 1 minute conscious box breathing before eating.",
      "Evening Reflection: Acknowledge three clean events before shutdown."
    ],
    sleepWindDown: [
      "Systematic 2-to-1 breathing ratio before turning off bedroom lighting.",
      "Soft physical scan releasing tongue and soft palate.",
      "Disconnect active screens exactly 45 minutes prior to rest."
    ],
    breathworkProgression: [
      "Stage 1: Sustain current Box Breathing baseline for 10 consecutive days.",
      "Stage 2: Transition to 5-5-5-5 breathing, extending inhalation limits slightly.",
      "Stage 3: Advanced breathwork holds (6s inhale, 4s hold, 8s exhale)."
    ]
  };

  return (
    <div className="w-full px-3 py-4 space-y-5 animate-fade-in text-stone-800">
      
      {/* Title greeting */}
      <div className="text-center space-y-2 mt-2">
        <h1 className="text-2xl md:text-3xl font-serif italic font-medium text-amber-950 tracking-tight animate-float-zen drop-shadow-[0_2px_15px_rgba(249,115,22,0.1)]">
          Welcome back
        </h1>
        <p className="text-stone-500 text-xs font-sans max-w-sm mx-auto leading-relaxed">
          {session.exitInstructions || "Slowly bring your physical awareness back, smooth and complete."}
        </p>
      </div>

      {/* Integration Review Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-orange-100/50 shadow-lg space-y-4">
        <div className="border-b border-black/5 pb-3">
          <h2 className="text-sm font-display font-medium text-stone-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-orange-600 animate-spin" />
            <span>Session Feedback</span>
          </h2>
          <p className="text-[10px] text-amber-900 mt-0.5 font-sans leading-normal font-bold">
            Take a moment to check in and save your local notes.
          </p>
        </div>

        {!isSaved ? (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Rating Buttons */}
            <div className="space-y-2">
              <label className="block text-[9px] font-mono tracking-wider font-bold text-orange-600 uppercase">
                How do you feel?
              </label>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRating('up')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-display font-medium transition-all duration-300 cursor-pointer ${
                    rating === 'up'
                      ? 'bg-orange-50 border-orange-600 text-stone-900 font-bold shadow-xs'
                      : 'bg-white border-orange-100/30 hover:border-orange-200/50 hover:bg-orange-50 text-orange-800'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${rating === 'up' ? 'scale-115 text-orange-600' : ''}`} />
                  <span>Better</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRating('down')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-display font-medium transition-all duration-300 cursor-pointer ${
                    rating === 'down'
                      ? 'bg-orange-50 border-orange-600 text-stone-900 font-bold shadow-xs'
                      : 'bg-white border-orange-100/30 hover:border-orange-200/50 hover:bg-orange-50 text-orange-850'
                  }`}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${rating === 'down' ? 'scale-115 text-orange-600' : ''}`} />
                  <span>No Change</span>
                </button>
              </div>
            </div>

            {/* Retrospective Emotion Tracker */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-mono tracking-wider font-bold text-orange-600 uppercase">
                  Ending Emotion (Retrospective)
                </label>
                <span className="text-[10px] font-mono text-stone-500">
                  Started: <strong className="text-orange-600">{session.state}</strong>
                </span>
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-xl border border-orange-100 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/50 transition-all duration-300 text-left cursor-pointer text-xs"
                >
                  {endState ? (
                    (() => {
                      const matched = EMOTIONS_LIST.find(c => c.state === endState);
                      if (!matched) return <span className="text-stone-400 italic font-sans text-xs">Record current emotion...</span>;
                      const Icon = matched.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <div className="p-0.5 px-1 rounded bg-orange-50 text-orange-600 shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-display font-semibold text-xs text-stone-800">
                            {matched.label}
                          </span>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-stone-400 italic font-sans text-xs">How do you feel emotionally now?</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-orange-100 rounded-xl shadow-lg max-h-44 overflow-y-auto scroller-none animate-slide-in">
                    <div className="p-1 space-y-0.5">
                      {EMOTIONS_LIST.map((card) => {
                        const Icon = card.icon;
                        const isSelected = endState === card.state;
                        return (
                          <button
                            key={card.state}
                            type="button"
                            onClick={() => {
                              setEndState(card.state);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-150 hover:bg-orange-50 cursor-pointer ${
                              isSelected ? 'bg-orange-50 text-orange-700 font-medium' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1 rounded bg-orange-50 text-orange-600 shrink-0 border border-orange-100">
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

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono tracking-wider font-bold text-orange-600 uppercase">
                Journal Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write down any insights or thoughts during practice..."
                className="w-full text-xs p-3 border border-orange-100/50 rounded-lg bg-white text-stone-800 placeholder-slate-400 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={rating === null && !notes.trim() && endState === null}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-display font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4.5 text-center text-xs animate-fade-in shadow-inner text-orange-700">
            🧘 Thank you. Your session reflection has been saved in your local log notes.
          </div>
        )}
      </div>

      {/* Habits & Growth Checklist */}
      <div className="glass-panel rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-4">
        <div>
          <h2 className="text-xs font-display font-bold text-stone-800 uppercase tracking-wider">
            Recommendations
          </h2>
          <p className="text-[10px] text-amber-900 mt-0.5 font-sans leading-normal font-bold">
            Personalized routines based on your session.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-black/5 gap-1 overflow-x-auto scroller-none pb-0.5">
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[9px] font-mono font-bold tracking-wide uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'journal'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-600 hover:text-orange-700'
            }`}
          >
            <Notebook className="w-3 h-3" />
            <span>Journal</span>
          </button>
          
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[9px] font-mono font-bold tracking-wide uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'habits'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-600 hover:text-orange-700'
            }`}
          >
            <SunDim className="w-3 h-3" />
            <span>Daily Routines</span>
          </button>

          <button
            onClick={() => setActiveTab('sleep')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[9px] font-mono font-bold tracking-wide uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'sleep'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-600 hover:text-orange-700'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Sleep Support</span>
          </button>

          <button
            onClick={() => setActiveTab('breath')}
            className={`flex items-center gap-1.5 px-3 py-2 text-[9px] font-mono font-bold tracking-wide uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'breath'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-stone-600 hover:text-orange-700'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Breath Progression</span>
          </button>
        </div>

        {/* Tab View */}
        <div className="bg-white/40 rounded-xl p-4 border border-orange-100/40 min-h-[120px] flex flex-col justify-center">
          <ul className="space-y-3 font-sans text-xs text-stone-800">
            {activeTab === 'journal' && enhancements.journalingPrompts.map((line, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed items-start">
                <span className="font-mono text-[9px] font-black text-white bg-orange-600 h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {i+1}
                </span>
                <span className="text-xs">{line}</span>
              </li>
            ))}

            {activeTab === 'habits' && enhancements.habitRoutine.map((line, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed items-start">
                <span className="font-mono text-[9px] font-black text-white bg-orange-600 h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {i+1}
                </span>
                <span className="text-xs">{line}</span>
              </li>
            ))}

            {activeTab === 'sleep' && enhancements.sleepWindDown.map((line, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed items-start">
                <span className="font-mono text-[9px] font-black text-white bg-orange-600 h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {i+1}
                </span>
                <span className="text-xs">{line}</span>
              </li>
            ))}

            {activeTab === 'breath' && enhancements.breathworkProgression.map((line, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed items-start">
                <span className="font-mono text-[9px] font-black text-white bg-orange-600 h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {i+1}
                </span>
                <span className="text-xs">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Return to Start Dashboard CTA */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onReturnToStart}
          className="w-full py-3.5 futuristic-btn text-white text-xs font-display font-medium uppercase tracking-wider rounded-xl shadow-md transition-all duration-300 cursor-pointer text-center"
        >
          Back to Dashboard
        </button>
      </div>

    </div>
  );
}
