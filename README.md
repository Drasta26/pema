# PeMA: Personalised Mindfulness Assistant

PeMA is a web app for short, guided mindfulness and breathing sessions. You check in with how you feel, and PeMA builds a session to match, with a breathing guide, a timer and an optional journal note afterwards.

## Who it's for
Anyone who wants a quick, private mindfulness break: a few minutes of guided breathing or meditation between meetings, before sleep or whenever they need to pause.

## Built with
- React, TypeScript, Vite and Tailwind CSS (front end)
- Express (small local server)
- Claude API via the Anthropic SDK, to personalise sessions
- Built-in offline sessions when no API key is set

## How to run
Requires Node.js 20 or later.

```
npm install
cp .env.example .env.local   # then add your own ANTHROPIC_API_KEY (optional)
npm run dev                  # opens on http://localhost:3000
```

On a Mac you can also double-click `Start PeMA.command`. Without an API key, PeMA uses its built-in offline sessions.

## Tests

```
npm test        # unit tests
npm run lint    # TypeScript type check
```

## Install on your phone or computer
PeMA is an installable web app. Once installed it opens full screen like a normal app and works offline. Personalised sessions need internet, but the 60-second reset, the Mental SPA and your history all work without it.

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
- Your API key stays in `.env.local` on the server side and is never committed (see `.gitignore`).
- Support messages: if a check-in suggests someone may need urgent help, PeMA pauses the session, shows UK contact details for people who can help, and does not send that text to the AI.
- The offline cache never stores check-in text or session content: requests to `/api/` are never cached.
- The repository contains no real user data.

## History
First built in Google AI Studio with Gemini. In October 2026 it moved to the Claude API, sign-in and Firebase were removed, and support messages were added.

## Roadmap
See [ROADMAP.md](ROADMAP.md).

## Licence
MIT. See [LICENSE](LICENSE).
