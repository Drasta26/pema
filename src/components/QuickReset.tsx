import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface QuickResetProps {
  onExit: () => void;
  onComplete: () => void;
}

const INHALE = 4;
const EXHALE = 6;
const TOTAL = 60; // six slow breaths

// One-tap, no-typing reset: six breaths with a longer out-breath. Runs fully
// on the device with no AI call.
export default function QuickReset({ onExit, onComplete }: QuickResetProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (elapsed >= TOTAL) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setElapsed(e => e + 1), 1000);
    return () => clearTimeout(timer);
  }, [elapsed]);

  const inCycle = elapsed % (INHALE + EXHALE);
  const isInhale = inCycle < INHALE;
  const phaseLeft = isInhale ? INHALE - inCycle : INHALE + EXHALE - inCycle;
  const breath = Math.floor(elapsed / (INHALE + EXHALE)) + 1;

  return (
    <div className="px-4 py-5 space-y-6 animate-slide-in text-center">
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-1 text-xs text-stone-500 cursor-pointer hover:text-stone-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="space-y-1">
        <h2 className="font-display text-2xl text-stone-900">60-second reset</h2>
        <p className="text-xs text-stone-500">Breath {Math.min(breath, 6)} of 6</p>
      </div>

      <div className="flex items-center justify-center h-56">
        <div
          className="rounded-full flex items-center justify-center shadow-xl"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle at 35% 30%, #fff 0%, #ffcd66 22%, #ff6b4a 60%, #e8458b 100%)',
            transform: `scale(${isInhale ? 1 : 0.6})`,
            transition: `transform ${isInhale ? INHALE : EXHALE}s ease-in-out`,
          }}
        >
          <span className="w-24 h-24 rounded-full bg-white/90 flex flex-col items-center justify-center">
            <span className="font-display text-xl text-orange-600">{phaseLeft}</span>
            <span className="text-[11px] text-stone-700">{isInhale ? 'Breathe in' : 'Breathe out'}</span>
          </span>
        </div>
      </div>

      <div className="mx-auto w-48 h-1.5 rounded-full bg-orange-100 overflow-hidden">
        <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(elapsed / TOTAL) * 100}%` }} />
      </div>
    </div>
  );
}
