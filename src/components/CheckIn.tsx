import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Wind } from 'lucide-react';
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
        {/* One clean dropdown; the phone shows its own picker */}
        <div className="relative">
          <label htmlFor="mood-select" className="sr-only">Choose a feeling</label>
          <select
            id="mood-select"
            value={selectedState ?? ''}
            onChange={e => setSelectedState((e.target.value || undefined) as EmotionalState | undefined)}
            className={`w-full h-12 pl-4 pr-10 rounded-2xl appearance-none bg-white/80 border border-orange-100 text-[16px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 ${selectedState ? 'text-stone-900' : 'text-stone-500'}`}
          >
            <option value="">Choose a feeling…</option>
            {MOODS.map(m => <option key={m.label} value={m.state}>{m.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
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
          placeholder="Or say it in your own words (optional)"
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
