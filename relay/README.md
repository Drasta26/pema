# PeMA session relay

Live at https://pema-relay.rentuk.workers.dev/ (deployed 17 Nov 2026 through the Cloudflare dashboard with the CEO's approval; key added by the CEO as a secret; rate limit binding 10 per 60 s, namespace 1002; logs off). ALLOWED_ORIGINS currently also includes http://localhost:3000 and http://192.168.0.226:3000 for testing; remove them at launch.

Lets PeMA personalise sessions with Claude without users ever entering a key. The owner's Anthropic key is stored as a Cloudflare secret and is never in the app, this repository or the browser. Same pattern as the RentUK chat relay.

## What it does
- Accepts requests only from the PeMA site (`ALLOWED_ORIGINS` in `wrangler.toml`).
- Runs only PeMA's two prompts (`src/library.ts`): starting a session and adapting one. Claude only chooses ids of lines from PeMA's fixed library of about 100 spoken lines; it cannot write words of its own. The relay builds the session from those lines. The model and output format are fixed; users cannot change them.
- Voice (optional): each library line is recorded once in the owner's voice with ElevenLabs, saved in a Cloudflare KV store (`VOICE_CACHE`), and served at `GET /voice/<id>` to every user. A line is never recorded twice, so the most the library can ever cost is the one-off recording of all its lines. Needs the secret `ELEVENLABS_API_KEY`, the variable `VOICE_ID` and the `VOICE_CACHE` binding; without them, sessions are text only.
- `src/prompts.ts` is the earlier free-wording version and is no longer used by the relay.
- Caps sizes: 3,000 characters to start a session, 12,000 to adapt one (it includes the current session).
- Rate-limits each visitor to about 10 requests a minute (approximate, per Cloudflare location).
- Backstop safety check: crisis text is never sent to the AI (the app checks first).
- Never logs or stores check-ins or sessions.

The site check stops other websites, not scripts that fake the origin, so the monthly spend limit on the key is the real cost control.

## Deploying (each step needs the CEO's approval)
1. In the Anthropic Console, create a key just for PeMA and set a monthly spend limit on it.
2. Build the single file: `npm run relay:build` (creates `relay/dist/worker.js`).
3. In the Cloudflare dashboard: Workers & Pages > Create > Worker, name it `pema-relay`, paste `relay/dist/worker.js`, and deploy.
4. In the Worker's Settings: add the secret `ANTHROPIC_API_KEY` (paste the key yourself; never put it in a file), the variable `ALLOWED_ORIGINS` (the PeMA site address), and a rate-limit binding named `RATE_LIMITER` (10 per 60 seconds). Turn request logs off.
5. Check the Worker's address matches `SESSION_RELAY` in `src/claudeService.ts` (expected `https://pema-relay.rentuk.workers.dev/`); if not, update it, rebuild and test.

## Tests
`npm test` runs `relay/worker.test.ts` against a stubbed Anthropic API.
