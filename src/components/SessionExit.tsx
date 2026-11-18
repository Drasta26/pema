import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { MeditationSession, EmotionalState } from '../types';
import { MOODS, moodLabel, isSettled } from '../moods';

interface SessionExitProps {
  session: MeditationSession;
  onSaveFeedback: (feedback: { rating: 'up' | 'down' | null; notes: string; endState?: EmotionalState }) => void;
  onReturnToStart: () => void;
  // Optional: offer a private, shareable card of this moment
  shareSlot?: (endState?: EmotionalState) => React.ReactNode;
}

// Two calm pages: "How do you feel now?" (one tap), then a short closing moment.
export default function SessionExit({ session, onSaveFeedback, onReturnToStart, shareSlot }: SessionExitProps) {
  const [endState, setEndState] = useState<EmotionalState | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const save = (e?: React.FormEvent) => {
    e?.preventDefault();
    const before = session.state, after = endState;
    // A simple, honest signal: did the person move towards feeling settled?
    const rating = after ? (isSettled(after) && !isSettled(before) ? 'up' : null) : null;
    onSaveFeedback({ rating, notes: notes.trim(), endState: after });
    setSaved(true);
  };

  const takeaway = session.enhancements?.journalingPrompts?.[0];
  const before = moodLabel(session.state);
  const after = moodLabel(endState);

  if (!saved) {
    return (
      <form onSubmit={save} className="w-full h-full px-4 py-2 flex flex-col justify-evenly gap-3 animate-fade-in">
        <div className="text-center space-y-1">
          <h1 className="font-display text-[26px] text-amber-950">Welcome back</h1>
          <p className="text-[15px] text-stone-600 line-clamp-2">{session.exitInstructions || 'Slowly bring your awareness back.'}</p>
        </div>

        <div className="space-y-2">
          <p className="text-center text-[15px] text-stone-800">How do you feel now?</p>
          <div role="radiogroup" aria-label="How do you feel now?" className="grid grid-cols-3 gap-2">
            {MOODS.map(m => {
              const on = endState === m.state;
              return (
                <button
                  key={m.label}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setEndState(on ? undefined : m.state)}
                  className={`h-11 rounded-2xl text-[15px] border cursor-pointer transition-all duration-200 ${
                    on ? 'mood-chip-on border-transparent shadow-md' : 'bg-white/70 border-orange-100 text-stone-800 hover:bg-white'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="exit-note" className="sr-only">A note for yourself (optional)</label>
          <input
            id="exit-note"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="A note for yourself (optional)"
            className="w-full h-12 px-4 rounded-2xl bg-white/80 border border-orange-100 text-[15px] text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <p className="mt-1 text-center text-[12px] text-stone-500">Saved only on this device.</p>
        </div>

        <button type="submit" className="futuristic-btn h-12 rounded-2xl font-display text-[17px] text-white cursor-pointer flex items-center justify-center gap-2">
          {endState || notes.trim() ? 'Save and finish' : 'Finish'} <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    );
  }

  return (
    <div className="w-full h-full px-5 py-2 flex flex-col justify-evenly items-center text-center gap-4 animate-fade-in">
      <div className="w-16 h-16 rounded-full mood-chip-on flex items-center justify-center shadow-lg">
        <Check className="w-8 h-8 text-white" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-[26px] text-amber-950">You gave yourself five minutes</h1>
        {before && after ? (
          <p className="text-[16px] text-stone-700">
            {before} <span aria-hidden>→</span><span className="sr-only">to</span> <strong className="text-orange-700">{after}</strong>
          </p>
        ) : (
          <p className="text-[16px] text-stone-700">That is a real act of care.</p>
        )}
      </div>
      {takeaway && (
        <div className="glass-panel rounded-2xl px-4 py-3 w-full">
          <p className="text-[12px] text-orange-700 mb-1">Something to take with you</p>
          <p className="font-serif italic text-[15px] text-stone-800 leading-snug">{takeaway}</p>
        </div>
      )}
      <div className="w-full space-y-2">
        {shareSlot?.(endState)}
        <button type="button" onClick={onReturnToStart} className="futuristic-btn w-full h-12 rounded-2xl font-display text-[17px] text-white cursor-pointer">
          Back to home
        </button>
      </div>
    </div>
  );
}
