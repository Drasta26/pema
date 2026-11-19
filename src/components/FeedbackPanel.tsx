import { useState } from 'react';
import { MessageCircle, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { FEEDBACK_EMAIL } from '../links';
import { feedbackMailto } from '../feedback';

export default function FeedbackPanel({ onClose }: { onClose: () => void }) {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [text, setText] = useState('');

  const send = () => {
    if (liked === null || !FEEDBACK_EMAIL) return;
    window.location.href = feedbackMailto(FEEDBACK_EMAIL, liked, text, 'v3.1');
  };

  const thumb = (value: boolean) =>
    `flex-1 h-14 rounded-2xl border flex items-center justify-center gap-2 text-[15px] cursor-pointer transition-all ${
      liked === value ? 'mood-chip-on border-transparent shadow-md' : 'bg-white/80 border-orange-100 text-stone-800'
    }`;

  return (
    <div className="px-4 pt-3">
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-orange-600" />
          <h2 className="flex-1 font-display text-[18px] text-stone-900">How is PeMA for you?</h2>
          <button type="button" onClick={onClose} aria-label="Close feedback" className="p-2 -m-1 rounded-full text-stone-500 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Your rating">
          <button type="button" role="radio" aria-checked={liked === true} onClick={() => setLiked(true)} className={thumb(true)}>
            <ThumbsUp className="w-5 h-5" /> I like it
          </button>
          <button type="button" role="radio" aria-checked={liked === false} onClick={() => setLiked(false)} className={thumb(false)}>
            <ThumbsDown className="w-5 h-5" /> Could be better
          </button>
        </div>
        <label htmlFor="feedback-text" className="sr-only">Tell us more (optional)</label>
        <textarea
          id="feedback-text"
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Tell us more (optional). Please don't include personal details."
          className="w-full px-3 py-2 rounded-2xl bg-white/80 border border-orange-100 text-[15px] text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={liked === null}
          className="futuristic-btn w-full h-12 rounded-2xl font-display text-[16px] text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send feedback
        </button>
        <p className="text-[12px] text-stone-500 leading-snug">
          This opens your email app with your message ready to send. It goes to PeMA's private feedback inbox. We'll see the address you send from, and nothing else about you.
        </p>
      </div>
    </div>
  );
}
