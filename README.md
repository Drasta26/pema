# PeMA: Personalised Mindfulness Assistant

PeMA is a web app for short, guided mindfulness and breathing sessions. You check in with how you feel, and PeMA builds a session to match, with a breathing guide, a timer and an optional journal note afterwards.

## Who it's for
Anyone who wants a quick, private mindfulness break: a few minutes of guided breathing or meditation between meetings, before sleep or whenever they need to pause.

## Built with
- React, TypeScript, Vite and Tailwind CSS (front end)
- Express (small local server that only serves the app; any static host works)
- Claude API via the Anthropic SDK, called straight from the app with the user's own key
- Fonts (Inter and Fraunces) bundled with the app
- Built-in on-device sessions when no key is added

## How to run
Requires Node.js 20 or later.

```
npm install
npm run dev                  # opens on http://localhost:3000
```

On a Mac you can also double-click `Start PeMA.command`. Without a key, PeMA builds sessions on your device.

## Your AI key
Personalised sessions use Claude with your own Anthropic key. Tap the key button at the top of PeMA, paste your key and tap **Save**. Get a key at console.anthropic.com and set a spending limit there; Anthropic bills your account directly. You can remove the key at any time from the same place.

## Tests

```
npm test        # unit tests
npm run lint    # TypeScript type check
```

## Install on your phone or computer
PeMA is an installable web app. Once installed it opens full screen like a normal app and works offline. Personalised Claude sessions need internet; offline, PeMA builds sessions on your device, and the 60-second reset, the Mental SPA and your history all work without it.

- **iPhone or iPad (Safari):** open PeMA, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open PeMA and tap **Install app** on the home screen, or use the menu (⋮), then **Install app**.
- **Computer (Chrome or Edge):** click **Install app** in PeMA, or the install icon in the address bar.

When a new version is ready, PeMA shows "New version available, tap to update".

Installing needs PeMA served over HTTPS (or `localhost`). To try it locally, run a production build, because the offline cache is switched off in development:

```
npm run build
NODE_ENV=production npm start
```

## Privacy
- Private by design: no accounts or cloud storage. Session history stays in your browser on your device.
- We never see your data. Your AI key is stored only in your browser on your device, and your check-in goes straight from your device to Anthropic. PeMA has no server of its own in between, and nothing is logged.
- Support messages: if a check-in suggests someone may need urgent help, PeMA pauses the session, shows UK contact details for people who can help, and does not send that text to the AI.
- The offline cache stores only PeMA's own files, never check-in text or session content.
- No analytics, trackers or third-party requests: the only other address PeMA contacts is api.anthropic.com, and only when you have added a key.
- The repository contains no real user data.

## History
First built in Google AI Studio with Gemini. In October 2026 it moved to the Claude API, sign-in and Firebase were removed, and support messages were added.

## Quality checks
Lighthouse 12, 17 Nov 2026, production build on localhost:

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 87 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Lighthouse 12 no longer has a PWA score. Chrome reports no manifest or installability errors.

## Roadmap
See [ROADMAP.md](ROADMAP.md).

## Licence
MIT. See [LICENSE](LICENSE).
