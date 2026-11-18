import { useEffect, useState } from 'react';

// Shown while a personalised session is being prepared (a few seconds), so the
// wait becomes the first slow breath rather than a spinner.
export default function Preparing({ mood }: { mood?: string }) {
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p === 'in' ? 'out' : 'in')), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 px-6 text-center animate-fade-in" role="status" aria-live="polite">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <div className={`prep-orb absolute inset-0 rounded-full ${phase === 'in' ? 'prep-orb-in' : 'prep-orb-out'}`} />
        <span className="relative font-display text-xl text-amber-950">
          {phase === 'in' ? 'Breathe in' : 'Breathe out'}
        </span>
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-[22px] text-amber-950">Let's arrive first</p>
        <p className="text-[15px] text-stone-600">
          {mood ? `Shaping a session for feeling ${mood.toLowerCase()}…` : 'Shaping a session around your words…'}
        </p>
      </div>
    </div>
  );
}
