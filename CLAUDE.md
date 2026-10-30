# PeMA — Claude Code briefing

PeMA = PErsonalised Mindfulness Assistant: picks and adapts a short guided meditation to the user's current emotional state, with breathing pacing, audio, post-session mood tracking and journal notes.
Owner: Dr Asta Ratna Prajapati (CEO, NutriBlend Health / Tara International Ltd). UK English. Keep replies concise; put any owner action in a table: Action | Importance | Due date.

## Non-negotiables
- Truth first: never invent facts, figures, sources, approvals, completion or capabilities. Mark unverified things as unverified.
- Never read, print, log or commit secrets. `.env.local` holds the owner's ANTHROPIC_API_KEY: do not open or echo it.
- Never handle passwords or bank details.
- Nothing is published, deployed, shared, purchased or deleted without the owner's explicit approval for that exact action.
- AI review is not legal, clinical or regulatory clearance; flag those for a qualified professional.

## History
- Built in Google AI Studio (Gemini). Exported 30 Oct 2026 → `../v1-aistudio-2026-10-30/` (original ZIP alongside, SHA-256 309f7a8f…31afb7). v1 node_modules was installed on Linux and won't run on the Mac.
- This folder = v2 (30 Oct 2026): Gemini replaced with Claude.
- Versioning: owner wants every iteration saved as a new dated version. Use git tags (e.g. `v2-claude-2026-10-30`) plus dated folders/ZIPs for major milestones.

## Stack
React 19 + Vite 6 + Tailwind 4 (src/), Express server (server.ts) serving Vite in dev, Claude via `@anthropic-ai/sdk` in `server/claudeService.ts` (structured output through forced tool use; model from CLAUDE_MODEL, default claude-sonnet-5-5), Firebase Auth + Firestore (src/firebase.ts, firestore.rules). Offline rule-based sessions are used when no API key is set.
Run: `npm run dev` (port 3000) or double-click `Start PeMA.command`. The owner views it in the Claude app browser pane.
Verified 30 Oct: tsc passes, production build passes, the API endpoints return sessions, and the app runs on the owner's Mac with a key.

## Known gaps before any deployment (owner says a lot of work is needed)
1. Git not initialised yet: first task is `git init`, commit, tag `v2-claude-2026-10-30` (check .gitignore covers .env*, node_modules, dist, server/users.json).
2. Auth: server.ts local email/password uses unsalted SHA-256 and a plain `server/users.json`. Replace (Firebase Auth or proper hashing such as argon2/bcrypt with rate limiting) or remove.
3. Safety: users type free-text feelings. Add crisis-language detection with UK signposting (e.g. NHS 111, Samaritans 116 123, 999 in an emergency), and never let the model give medical advice. Keep the "not medical advice" disclaimer.
4. Data protection: mood, journal and sleep notes per user = wellbeing data under UK GDPR. Needs a privacy notice, lawful basis/consent, retention, export/delete, and a DPIA. Owner sign-off required.
5. Firestore rules and `firebase-applet-config.json` (a public web key by design) need review. Confirm which Firebase project PeMA uses.
6. Google/Microsoft sign-in: owner wants these kept. VITE_GOOGLE_CLIENT_ID / VITE_MICROSOFT_CLIENT_ID are not yet configured.
7. Code quality: rename the misleading "Cloudflare CDN cache" (it is an in-memory Map), add tests, code-split the large JS bundle, clean up AI Studio leftovers (package name "react-example", DISABLE_HMR comments).
8. Hosting not chosen; API key must stay server-side; add rate limiting and API cost limits.
9. Wellness claims: keep wording non-clinical; get a regulatory check that PeMA stays a wellness product and not a medical device before marketing.
