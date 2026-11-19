import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, Check, Ellipsis, Share, SquarePlus, X } from 'lucide-react';
import { currentlyInstalled, currentlyIos } from '../pwa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// "Install app" on Android and desktop; a Share hint on iPhone; nothing once installed.
export default function InstallHelp() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => currentlyInstalled());
  const [hidden, setHidden] = useState(false);
  const [guide, setGuide] = useState(false);
  const isIos = currentlyIos();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || hidden || (!installEvent && !isIos)) return null;

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallEvent(null);
  };

  return (
    <div className="install-tip">
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-3">
        {/* Same meditation mark as the header */}
        <span aria-hidden className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-lg mood-chip-on shadow-sm">🧘</span>
        {/* Reads "[Add] PeMA to your home screen", where "Add" is the button. */}
        <button
          type="button"
          onClick={installEvent ? install : () => setGuide(true)}
          aria-label="Add PeMA to your home screen"
          className="futuristic-btn px-4 py-2 rounded-full text-sm font-semibold text-white cursor-pointer shrink-0"
        >
          Add
        </button>
        <span className="flex-1 text-[13px] text-stone-700">PeMA to your home screen</span>
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Hide install help"
          className="p-1 rounded-full text-stone-500 hover:text-stone-800 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {guide && createPortal(<IosGuide onClose={() => setGuide(false)} />, document.body)}
    </div>
  );
}

// iPhone and iPad do not let websites install themselves, so show a short picture guide
// with an arrow pointing at Safari's toolbar.
function IosGuide({ onClose }: { onClose: () => void }) {
  const safari = !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const step = 'w-10 h-10 rounded-xl grid place-items-center shrink-0 bg-[#e8458b]/10 text-[#e8458b]';
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-guide-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-[#2a1036]/40 px-4 pt-4 pb-[calc(84px+env(safe-area-inset-bottom))]"
    >
      <div className="rounded-3xl p-5 w-full max-w-sm text-center text-[#2a1036] bg-white/95 shadow-2xl">
        <img src="/icons/icon-192.png" alt="" className="w-14 h-14 rounded-2xl mx-auto" />
        <h2 id="install-guide-title" className="font-display text-lg mt-2 mb-3">Add PeMA to your home screen</h2>
        <ol className="grid gap-2.5 text-left text-sm mb-4">
          <li className="flex items-center gap-3">
            <span className={step}><Share className="w-5 h-5" /></span>
            <span>
              Tap <b>Share</b>{safari ? ' in the bar below.' : ' in your browser’s menu.'}
              {safari && <small className="block text-xs text-stone-500">Can’t see it? Tap <Ellipsis className="inline w-3.5 h-3.5" aria-label="more" /> first.</small>}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className={step}><SquarePlus className="w-5 h-5" /></span>
            <span>Tap <b>Add to Home Screen</b>.<small className="block text-xs text-stone-500">Scroll down or tap “View more” if needed.</small></span>
          </li>
          <li className="flex items-center gap-3">
            <span className={step}><Check className="w-5 h-5" /></span>
            <span>Tap <b>Add</b>. PeMA appears on your home screen.</span>
          </li>
        </ol>
        <button type="button" autoFocus onClick={onClose} className="futuristic-btn w-full py-3 rounded-full text-white cursor-pointer">Got it</button>
      </div>
      {safari && (
        <div aria-hidden="true" className="install-arrow absolute left-1/2 bottom-[calc(16px+env(safe-area-inset-bottom))] w-13 h-13 rounded-full grid place-items-center text-white futuristic-btn">
          <ArrowDown className="w-7 h-7" />
        </div>
      )}
    </div>
  );
}
