// Installable-app helpers. Pure functions take their inputs so they can be tested.

// iPhone/iPad Safari has no install prompt; iPadOS reports itself as a Mac with touch.
export function isIosDevice(userAgent: string, platform: string, maxTouchPoints: number): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function isRunningInstalled(displayModeStandalone: boolean, iosStandalone: boolean | undefined): boolean {
  return displayModeStandalone || iosStandalone === true;
}

export function currentlyInstalled(): boolean {
  return isRunningInstalled(
    window.matchMedia('(display-mode: standalone)').matches,
    (navigator as Navigator & { standalone?: boolean }).standalone
  );
}

export function currentlyIos(): boolean {
  return isIosDevice(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
}

// Registers the service worker in production builds only (it would fight Vite's
// dev server). Calls onUpdate with a function that applies the waiting update.
export function registerServiceWorker(onUpdate: (applyUpdate: () => void) => void): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      const offerUpdate = (worker: ServiceWorker) => onUpdate(() => worker.postMessage('SKIP_WAITING'));

      // An update already downloaded while the app was closed
      if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          // Only an update if a previous version was already in control
          if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(worker);
        });
      });

      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });

      // Check for a new version when the app comes back to the foreground
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {});
      });
    } catch (err) {
      console.error('Service worker registration failed', err);
    }
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
