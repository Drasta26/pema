import { Phone, MessageCircle, Heart } from 'lucide-react';
import { UK_SUPPORT } from '../safety';

interface CrisisSupportProps {
  onContinue: () => void;
  onBack: () => void;
}

// Shown instead of a meditation when crisis language is detected. Nothing is
// sent to the AI from this screen.
export default function CrisisSupport({ onContinue, onBack }: CrisisSupportProps) {
  return (
    <div className="px-4 py-6 space-y-5 animate-slide-in" role="alertdialog" aria-labelledby="crisis-title">
      <div className="text-center space-y-2">
        <div className="mx-auto w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-500" />
        </div>
        <h2 id="crisis-title" className="font-display text-xl font-semibold text-stone-900">
          You don't have to face this alone
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          It sounds like things are really hard right now. Talking to someone can help. These services are free and confidential.
        </p>
      </div>

      <div className="space-y-2.5">
        {UK_SUPPORT.map(s => (
          <a
            key={s.name}
            href={s.href}
            className="glass-panel rounded-2xl p-3.5 flex items-center gap-3 hover:border-rose-200 transition-colors"
          >
            <span className="w-9 h-9 shrink-0 rounded-full bg-white border border-rose-100 flex items-center justify-center">
              {s.href.startsWith('sms') ? <MessageCircle className="w-4 h-4 text-rose-500" /> : <Phone className="w-4 h-4 text-rose-500" />}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-stone-900">{s.name} · {s.contact}</span>
              <span className="block text-[11px] text-stone-500 leading-snug">{s.detail}</span>
            </span>
          </a>
        ))}
      </div>

      <p className="text-[11px] text-stone-500 text-center leading-relaxed">
        PeMA is a relaxation tool and can't provide crisis support.
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold cursor-pointer hover:bg-stone-800 transition-colors"
        >
          Back to check-in
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-2 text-xs text-stone-500 underline underline-offset-2 cursor-pointer hover:text-stone-700"
        >
          I'm safe, continue to a calming breath
        </button>
      </div>
    </div>
  );
}
