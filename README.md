# PeMA: Personalised Mindfulness Assistant

PeMA is a web app for short, guided mindfulness and breathing sessions. You check in with how you feel, and PeMA builds a session to match, with a breathing guide, a timer and an optional journal note afterwards.

## Who it's for
Adults who want a quick, private mindfulness break. PeMA is a wellness tool: it is not therapy or a medical device, and it does not diagnose or treat anything.

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
npm test        # unit tests for the safety checks
npm run lint    # TypeScript type check
```

## Privacy and safety
- Private by design: no accounts or cloud storage. Session history stays in your browser on your device.
- Your API key stays in `.env.local` on the server side and is never committed (see `.gitignore`).
- Crisis safety net: if a check-in contains crisis language, PeMA stops the session, shows UK support contacts, and does not send that text to the AI.
- The repository contains no real user data.

## History
First built in Google AI Studio with Gemini. In October 2026 it moved to the Claude API, sign-in and Firebase were removed, and the crisis safety net was added.

## Roadmap
See [ROADMAP.md](ROADMAP.md).

## Licence
MIT. See [LICENSE](LICENSE).
