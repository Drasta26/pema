import { useEffect, useState } from 'react';
import { ArrowLeft, Pause, Play, SkipForward } from 'lucide-react';
import { MENTAL_SPA_STEPS } from '../content';

interface MentalSpaProps {
  onExit: () => void;
  onComplete: () => void;
}

// Dr Asta's signature five-step practice, one minute per step.
export default function MentalSpa({ onExit, onComplete }: MentalSpaProps) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(MENTAL_SPA_STEPS[0].seconds);
  const [isPlaying, setIsPlaying] = useState(true);
  const step = MENTAL_SPA_STEPS[index];
  const isLast = index === MENTAL_SPA_STEPS.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setRemaining(MENTAL_SPA_STEPS[index + 1].seconds);
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (remaining <= 0) {
      goNext();
      return;
    }
    const timer = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, remaining]);

  const progress = 1 - remaining / step.seconds;

  return (
    <div className="px-4 py-5 space-y-5 animate-slide-in">
      <button
        type="button"
        onClick={onExit}
        className="flex items-center gap-1 text-xs text-stone-500 cursor-pointer hover:text-stone-800"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="text-center space-y-1">
        <span className="block text-xs text-blue-600">The Mental SPA</span>
        <span className="block text-xs text-stone-500">Step {index + 1} of {MENTAL_SPA_STEPS.length}</span>
      </div>

      <div className="flex justify-center gap-1.5">
        {MENTAL_SPA_STEPS.map((s, i) => (
          <span
            key={s.title}
            className={`h-1.5 rounded-full transition-all duration-500 ${i < index ? 'w-5 bg-orange-400' : i === index ? 'w-8 bg-orange-500' : 'w-5 bg-orange-100'}`}
          />
        ))}
      </div>

      <div key={index} className="glass-panel rounded-3xl p-6 text-center space-y-4 animate-fade-in">
        <div
          className="mx-auto w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(#ff6b4a ${progress * 360}deg, #ffe1d6 0deg)` }}
        >
          <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
            <span className="font-display text-2xl text-orange-600">{remaining}s</span>
          </div>
        </div>
        <h2 className="font-display text-2xl text-stone-900">{step.title}</h2>
        <p className="text-sm text-stone-700 leading-relaxed">{step.guidance}</p>
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-orange-200 bg-white/80 text-sm text-orange-600 cursor-pointer hover:bg-white"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={goNext}
          className="futuristic-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-white cursor-pointer"
        >
          {isLast ? 'Finish' : 'Next step'} <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
