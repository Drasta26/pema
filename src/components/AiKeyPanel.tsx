import { useState } from 'react';
import { KeyRound, X, ExternalLink } from 'lucide-react';
import { getApiKey, saveApiKey, removeApiKey, looksLikeAnthropicKey, maskKey } from '../apiKey';

// Lets the user add, see (masked) and remove their own Anthropic key. Nothing leaves the device
// except the requests the app makes directly to Anthropic with that key.
export default function AiKeyPanel({ onClose, onChange, rejected }: { onClose: () => void; onChange: () => void; rejected?: boolean }) {
  const [saved, setSaved] = useState(() => getApiKey());
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!looksLikeAnthropicKey(draft)) {
      setError('That doesn’t look like an Anthropic key. It should start with sk-ant-');
      return;
    }
    saveApiKey(draft);
    setSaved(getApiKey());
    setDraft('');
    setError(null);
    onChange();
  };

  const remove = () => {
    removeApiKey();
    setSaved(null);
    onChange();
  };

  return (
    <div className="px-4 pt-3">
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-orange-600" />
          <h2 className="flex-1 font-display text-base text-stone-900">Your AI key</h2>
          <button type="button" onClick={onClose} aria-label="Close AI key settings" className="p-1 rounded-full text-stone-500 hover:text-stone-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {rejected && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2">
            Anthropic didn’t accept your key. Check it or add a new one.
          </p>
        )}

        <p className="text-xs text-stone-700 leading-relaxed">
          Personalised sessions use Claude with your own Anthropic key. The key stays on this device, and your check-in goes straight from here to Anthropic. We never see your data. Without a key, PeMA builds sessions on your device.
        </p>

        {saved ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-stone-800 bg-white/60 rounded-lg px-2 py-1.5">{maskKey(saved)}</code>
            <button type="button" onClick={remove} className="text-xs text-red-700 px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 cursor-pointer">
              Remove key
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="ai-key" className="sr-only">Anthropic API key</label>
            <div className="flex gap-2">
              <input
                id="ai-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="sk-ant-…"
                className="flex-1 min-w-0 text-xs bg-white/70 border border-orange-200 rounded-lg px-2 py-1.5 text-stone-900"
              />
              <button type="button" onClick={save} className="futuristic-btn text-xs text-white px-3 py-1.5 rounded-full cursor-pointer shrink-0">
                Save
              </button>
            </div>
            {error && <p className="text-xs text-red-700">{error}</p>}
          </div>
        )}

        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-orange-700 underline"
        >
          Get a key from Anthropic <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-[11px] text-stone-500 leading-relaxed">
          Anthropic charges your account for what you use. Set a spending limit in their console.
        </p>
      </div>
    </div>
  );
}
