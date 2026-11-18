import type React from 'react';
import { ShieldCheck } from 'lucide-react';
import { summarise, milestone } from '../progress';
import { moodLabel } from '../moods';

interface JourneyLog {
  id: string;
  date: string;
  technique: string;
  state?: string;
  endState?: string;
  notes: string;
}

// Gentle progress for returning users: what they have given themselves, what helps,
// and their last few sessions. No streaks to break, no guilt.
export default function Journey({ history, onOpenData, shareSlot }: { history: JourneyLog[]; onOpenData: () => void; shareSlot?: React.ReactNode }) {
  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-2 animate-fade-in">
        <h1 className="font-display text-[26px] text-amber-950">Your journey</h1>
        <p className="text-[15px] text-stone-600">After your first session, you'll see how you're looking after yourself here. It stays on this device.</p>
      </div>
    );
  }
  const s = summarise(history, new Date());
  const kind = milestone(s.total);

  return (
    <div className="h-full px-4 py-2 flex flex-col gap-3 animate-fade-in">
      <h1 className="font-display text-[26px] text-amber-950 text-center">Your journey</h1>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          [s.weekSessions, s.weekSessions === 1 ? 'session this week' : 'sessions this week'],
          [s.minutes, 'mindful minutes'],
          [s.days, s.days === 1 ? 'day you showed up' : 'days you showed up'],
        ].map(([n, label]) => (
          <div key={label as string} className="glass-panel rounded-2xl py-3 px-1">
            <span className="block font-display text-[26px] text-orange-600 leading-none">{n}</span>
            <span className="block mt-1 text-[12px] text-stone-600 leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {(kind || s.checked > 0) && (
        <div className="glass-panel rounded-2xl px-4 py-3 space-y-1">
          {kind && <p className="text-[15px] text-stone-800">{kind}</p>}
          {s.checked > 0 && (
            <p className="text-[13px] text-stone-600">
              You felt calmer, okay or happy after {s.settledAfter} of {s.checked} sessions
              {s.mostHelpful ? `. ${s.mostHelpful} seems to help you most.` : '.'}
            </p>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 space-y-2 overflow-hidden">
        <p className="text-[13px] text-stone-500">Recent</p>
        {history.slice(0, 3).map((log, i) => (
          // Fewer recent items on shorter phones, so nothing is cut off
          <div key={log.id} className={`glass-panel rounded-2xl px-4 py-2.5 ${i === 1 ? '[@media(max-height:700px)]:hidden' : ''} ${i === 2 ? '[@media(max-height:820px)]:hidden' : ''}`}>
            <div className="flex justify-between gap-2 text-[12px] text-stone-500">
              <span className="truncate">{log.technique}</span>
              <span className="shrink-0">{new Date(log.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            {log.state && log.endState ? (
              <p className="text-[15px] text-stone-800">{moodLabel(log.state)} → <strong className="text-orange-700">{moodLabel(log.endState)}</strong></p>
            ) : (
              <p className="text-[15px] text-stone-800">{log.state ? moodLabel(log.state) : 'Practice complete'}</p>
            )}
            {log.notes && <p className="text-[13px] italic text-stone-600 truncate">“{log.notes}”</p>}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        {shareSlot}
        <button type="button" onClick={onOpenData} className="ml-auto flex items-center gap-1 text-[13px] text-orange-700 cursor-pointer py-2">
          <ShieldCheck className="w-4 h-4" /> Export or delete
        </button>
      </div>
    </div>
  );
}
