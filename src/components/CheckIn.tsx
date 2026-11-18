import React, { useState } from 'react';
import { ChevronRight, Wind } from 'lucide-react';
import { EmotionalState } from '../types';
import { MOODS, greeting, reminderFor } from '../moods';

interface CheckInProps {
  installTip?: React.ReactNode;
  onSubmit: (data: { description: string; explicitState?: EmotionalState }) => void;
  onQuickReset: () => void;
  isLoading: boolean;
}

// Home: one question, one tap. Pick a mood and/or add a few words, then begin.
export default function CheckIn({ onSubmit, isLoading, installTip, onQuickReset }: CheckInProps) {
  const [description, setDescription] = useState('');
  const [selectedState, setSelectedState] = useState<EmotionalState | undefined>(undefined);
  const now = new Date();
  const canBegin = !isLoading && (!!description.trim() || !!selectedState);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canBegin) return;
    onSubmit({ description, explicitState: selectedState });
  };

  return (
    <div className="checkin-page w-full h-full px-4 py-1 animate-fade-in flex flex-col justify-evenly gap-3">
      <div className="text-center">
        <p className="text-[13px] text-stone-500">{greeting(now.getHours())}</p>
        <h1 className="font-display text-[26px] leading-tight text-amber-950">How are you feeling?</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div role="radiogroup" aria-label="Choose a feeling" className="grid grid-cols-3 gap-2">
          {MOODS.map(m => {
            const on = selectedState === m.state;
            return (
              <button
                key={m.label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSelectedState(on ? undefined : m.state)}
                className={`h-11 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer border ${
                  on
                    ? 'mood-chip-on text-white border-transparent shadow-md scale-[1.02]'
                    : 'bg-white/70 border-orange-100 text-stone-800 hover:bg-white'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <label htmlFor="mood-description-input" className="sr-only">Anything else on your mind? (optional)</label>
        <textarea
          id="mood-description-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          enterKeyHint="go"
          rows={2}
          placeholder="Anything on your mind? A few words help (optional)"
          className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border border-orange-100 text-[15px] text-stone-800 placeholder-stone-400 resize-none leading-snug focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <button
          type="submit"
          disabled={!canBegin}
          className="futuristic-btn w-full flex items-center justify-center gap-2 h-12 rounded-2xl font-display text-[17px] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Preparing your session…' : <>Begin your 5 minutes <ChevronRight className="w-5 h-5" /></>}
        </button>

        <p className="text-center text-[12px] text-stone-500">For relaxation and wellness only. This is NOT a health service.</p>
      </form>

      <button
        type="button"
        onClick={onQuickReset}
        className="mx-auto flex items-center gap-1.5 text-[14px] text-orange-700 cursor-pointer hover:underline"
      >
        <Wind className="w-4 h-4" /> Short on time? Try a 60-second reset
      </button>

      {installTip}

      <p className="daily-reminder text-center text-[13px] italic font-serif text-stone-600 px-4">
        “{reminderFor(now)}”
      </p>
    </div>
  );
}
