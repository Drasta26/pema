import { useState } from 'react';
import { ShieldCheck, X, Download, Trash2 } from 'lucide-react';

// Shows where the user's data lives, and lets them export it or delete all of it.
export default function YourDataPanel({ historyCount, onExport, onDeleteAll, onClose }: {
  historyCount: number;
  onExport: () => void;
  onDeleteAll: () => void;
  onClose: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="px-4 pt-3">
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <h2 className="flex-1 font-display text-base text-stone-900">Your data</h2>
          <button type="button" onClick={onClose} aria-label="Close your data" className="p-1 rounded-full text-stone-500 hover:text-stone-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-700 leading-relaxed">
          Your history is stored only on this device. There are no accounts and no tracking. To personalise a session, your check-in passes through PeMA's relay to Anthropic's AI. The session it writes, not your check-in, then goes to ElevenLabs to be spoken in Drasta's voice. We never store or log any of it.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onExport}
            disabled={historyCount === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-orange-200 text-orange-700 hover:bg-orange-50 cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <Download className="w-3.5 h-3.5" /> Export history ({historyCount})
          </button>
          <button
            type="button"
            onClick={() => (confirming ? (onDeleteAll(), setConfirming(false)) : setConfirming(true))}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
              confirming ? 'bg-red-50 border-red-300 text-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> {confirming ? 'Tap again to delete everything' : 'Delete all my data'}
          </button>
        </div>
        {confirming && (
          <p className="text-[13px] text-stone-600">
            This removes your history and streak from this device. It can’t be undone.{' '}
            <button type="button" onClick={() => setConfirming(false)} className="underline cursor-pointer">Cancel</button>
          </p>
        )}
      </div>
    </div>
  );
}
