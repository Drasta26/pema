# PeMA: Personalised Mindfulness Assistant

PeMA is a web app for short, guided mindfulness and breathing sessions. You check in with how you feel, and PeMA builds a session to match, with a breathing guide, a timer and an optional journal note afterwards.

## Who it's for
Anyone who wants a quick, private mindfulness break: a few minutes of guided breathing or meditation between meetings, before sleep or whenever they need to pause.

## Built with
- React, TypeScript, Vite and Tailwind CSS (front end)
- Express (small local server that only serves the app; any static host works)
- Claude API through the PeMA relay (`relay/`, a Cloudflare Worker that holds the owner's key), so users need no key or setup
- Fonts (Inter and Fraunces) bundled with the app
- Built-in on-device sessions when no key is added

## How to run
Requires Node.js 20 or later.

```
npm install
npm run dev                  # opens on http://localhost:3000
```

On a Mac you can also double-click `Start PeMA.command`. Without a key, PeMA builds sessions on your device.

## Personalised sessions
Personalised sessions use Claude through the PeMA relay. Users need no key or setup. If the relay is unavailable or you are offline, PeMA builds the session on your device. See [relay/README.md](relay/README.md) to deploy the relay.

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
- We never store or log your data. Your history stays on your device. To personalise a session, your check-in passes through the PeMA relay to Anthropic. The session text Claude writes (not the check-in) then goes to ElevenLabs to be spoken in Drasta's voice. The relay never logs or stores any of it.
- Support messages: if a check-in suggests someone may need urgent help, PeMA pauses the session, shows UK contact details for people who can help, and does not send that text to the AI.
- The offline cache stores only PeMA's own files, never check-in text or session content.
- No analytics, trackers or third-party requests: the only other address PeMA contacts is api.anthropic.com, and only when you have added a key.
- Export or delete: open **More**, then **Your data**, to download your history as a file or delete all your data (history and streak) from the device.
- The repository contains no real user data.

## History
First built in Google AI Studio with Gemini. In October 2026 it moved to the Claude API, sign-in and Firebase were removed, and support messages were added.

## Quality checks
Lighthouse 12, 17 Nov 2026 (v2.13), production build on localhost:

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 85 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Lighthouse 12 no longer has a PWA score. Chrome reports no manifest or installability errors.

## Roadmap
See [ROADMAP.md](ROADMAP.md).

## Licence
MIT. See [LICENSE](LICENSE).
