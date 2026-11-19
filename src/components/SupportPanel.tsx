import { useState } from 'react';
import { Heart, Share2, X, ExternalLink } from 'lucide-react';
import { APP_URL, SOCIALS, SUPPORT_URL } from '../links';

// Ways to support PeMA: fund it, share it, follow along. Never nagging, never guilt.
export default function SupportPanel({ onClose }: { onClose: () => void }) {
  const [shared, setShared] = useState('');

  const sharePema = async () => {
    const text = 'PeMA: short, personalised meditations. Private by design: your data stays on your phone.';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PeMA', text, ...(APP_URL ? { url: APP_URL } : {}) });
        setShared('Thank you for sharing');
        return;
      }
      await navigator.clipboard.writeText(APP_URL ? `${text} ${APP_URL}` : text);
      setShared('Copied, ready to paste');
    } catch {
      /* the person closed the share sheet */
    }
  };

  return (
    <div className="px-4 pt-3">
      <div className="glass-panel rounded-2xl p-4 space-y-3 text-center">
        <div className="flex items-center gap-2 text-left">
          <Heart className="w-4 h-4 text-orange-600" />
          <h2 className="flex-1 font-display text-[18px] text-stone-900">Support PeMA</h2>
          <button type="button" onClick={onClose} aria-label="Close support" className="p-2 -m-1 rounded-full text-stone-500 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <p className="font-display text-[20px] text-amber-950">Built by one. Funded by many.</p>
        <p className="text-[14px] text-stone-600">Your app. Your data. Your choice. PeMA has no adverts and never sells your data. If it helps you, here's how you can help it.</p>

        {SUPPORT_URL && (
          <>
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="futuristic-btn flex items-center justify-center gap-2 w-full h-12 rounded-2xl font-display text-[16px] text-white">
              <Heart className="w-4 h-4" /> Support anonymously
            </a>
            <p className="text-[12px] text-stone-500">Payments are handled securely by our payment provider. We never see your card or store your details.</p>
          </>
        )}

        <button type="button" onClick={sharePema} className="w-full h-12 rounded-2xl border border-orange-200 bg-white/80 flex items-center justify-center gap-2 text-[15px] text-orange-700 cursor-pointer">
          <Share2 className="w-4 h-4" /> {shared || 'Share PeMA with a friend'}
        </button>

        {SOCIALS.map(s => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-[14px] text-orange-700 underline-offset-2 hover:underline">
            {s.label} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
