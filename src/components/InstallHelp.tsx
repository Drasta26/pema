import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
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
    <div className="px-4 pt-3">
      <div className="glass-panel rounded-2xl p-3 flex items-center gap-3">
        <img src="/icons/icon-192.png" alt="" className="w-9 h-9 rounded-xl shrink-0" />
        {installEvent ? (
          <>
            <span className="flex-1 text-xs text-stone-700">Add PeMA to your home screen. It works offline too.</span>
            <button
              type="button"
              onClick={install}
              className="futuristic-btn flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-white cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Install app
            </button>
          </>
        ) : (
          <span className="flex-1 text-xs text-stone-700">
            Install PeMA: tap Share <Share className="inline w-3.5 h-3.5 -mt-0.5" aria-label="Share" />, then Add to Home Screen.
          </span>
        )}
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Hide install help"
          className="p-1 rounded-full text-stone-500 hover:text-stone-800 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
