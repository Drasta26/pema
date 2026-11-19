# PeMA — Claude Code briefing

PeMA = PErsonalised Mindfulness Assistant: picks and adapts a short guided meditation to the user's current emotional state, with breathing pacing, audio, post-session mood tracking and journal notes.
Owner: द्रष्टा (Drasta), personally. PeMA is a personal project: never link it to any company or employer (owner's rule, 19 Nov 2026). UK English. Keep replies concise; put any owner action in a table: Action | Recommendation and reason | Importance and urgency.

## Non-negotiables
- Truth first: never invent facts, figures, sources, approvals, completion or capabilities. Mark unverified things as unverified.
- Never read, print, log or commit secrets. `.env.local` (no longer used since v2.12) holds the owner's old ANTHROPIC_API_KEY: do not open or echo it. Never type a real key into the app; only users do.
- Never handle passwords or bank details.
- Nothing is published, deployed, shared, purchased or deleted without the owner's explicit approval for that exact action.
- AI review is not legal, clinical or regulatory clearance; flag those for a qualified professional.

## History
- Built in Google AI Studio (Gemini). Exported 30 Oct 2026 → `../v1-aistudio-2026-10-30/` (original ZIP alongside, SHA-256 309f7a8f…31afb7). v1 node_modules was installed on Linux and won't run on the Mac.
- This folder = v2 (30 Oct 2026): Gemini replaced with Claude.
- Versioning: owner wants every iteration saved as a new dated version. Use git tags (e.g. `v2-claude-2026-10-30`) plus dated folders/ZIPs for major milestones.

## Stack
React 19 + Vite 6 + Tailwind 4 (src/), Express server (server.ts) only serves the app. Personalised sessions (v2.16, 17 Nov): the app posts {mode, query} to the PeMA relay (`relay/worker.ts`, Cloudflare Worker, `SESSION_RELAY` in `src/claudeService.ts`), which holds the owner's key as a secret and runs only the prompts in `src/prompts.ts`; model claude-sonnet-5-5, tool_choice auto, fallbacks default. Users never enter a key. Single-file build for the Cloudflare dashboard: `npm run relay:build` -> `relay/dist/worker.js`. No accounts: session history is kept in the browser's localStorage on the user's device. On-device rule-based sessions are used when the relay is unreachable.
Run: `npm run dev` (port 3000) or double-click `Start PeMA.command`. The owner views it in the Claude app browser pane.
30 Oct: Claude sessions verified live (key fixed; tool_choice switched to auto because claude-sonnet-5-5 rejects forced tool choice).

## Known gaps before any deployment (owner says a lot of work is needed)
1. Done 30 Oct: git set up; tags `v2-claude-2026-10-30` (baseline) and `v2.1-private-2026-10-30` (no sign-in).
2. Done 30 Oct: local sign-in and Firebase removed (owner approved "private by design": no accounts, data on the device). Optional sync/accounts only later if users ask.
3. Done 30 Oct: crisis safety net. `src/safety.ts` (rule-based, shared by app and server, `npm test`), `CrisisSupport` screen with UK numbers, crisis text never sent to Claude, safety rules in both prompts. Owner to re-verify helpline numbers before each release; a clinical safety reviewer should check wording and phrase list.
4. Data protection: mood, journal and sleep notes per user = wellbeing data under UK GDPR. Needs a privacy notice, lawful basis/consent, retention, export/delete, and a DPIA. Owner sign-off required.
5. Done 30 Oct: Firebase files and package deleted with three owner confirmations.
6. Google/Microsoft sign-in: dropped for now under the private-by-design direction.
7. Code quality: partly done 30 Oct (cache renamed to sessionCache, tests added for safety). Still: code-split the bundle, package name "react-example", DISABLE_HMR comments.
10. Done 30 Oct: design pass v2.4 (palette via Tailwind theme overrides in src/index.css; v2.7 "Sunrise energy" palette chosen by owner: coral #ff6b4a, magenta #e8458b, gold #ffb547, plum text #2a1036, Fraunces display font, Enter submits check-in, [pause] cues stripped server-side, unmatched descriptions no longer default to Insight Meditation).
8. Hosting not chosen; any static host works now there is no server key.
9. Wellness claims: keep wording non-clinical; get a regulatory check that PeMA stays a wellness product and not a medical device before marketing.
11. Done 30 Oct (v2.8): Mental SPA signature practice (src/components/MentalSpa.tsx; step names from the "5 Steps of Mental SPA" video description, guidance wording approved by owner 30 Oct) and "Guided by द्रष्टा (Drasta)" library (src/content.ts, src/components/GuidedLibrary.tsx) using click-to-load youtube-nocookie embeds and local colour tiles, so nothing loads from YouTube until play. Footer credit: Built by द्रष्टा (Drasta). v2.18 (18 Nov): each Mental SPA step is narrated in Drasta's own voice (ElevenLabs Instant Voice Clone "Drasta" on the owner's account, model Eleven v4, files public/audio/spa-1..5.mp3, cached offline by sw.js; Voice/Muted switch remembered as pema.spaVoice). Name in the app is always द्रष्टा (Drasta), never Dr Asta.
12. Done 30 Oct (v2.10): 60-second reset (src/components/QuickReset.tsx, on-device, 4s in / 6s out x6); Mental SPA and reset count towards the streak via recordPractice (log.state optional); all forced capitals removed and labels in sentence case; wrapper uses overflow: clip to stop sideways scroll.

## v3.0 structure (18 Nov 2026)
Home = src/components/CheckIn.tsx (moods from src/moods.ts), Preparing.tsx while the relay works, SessionPlayer, SessionExit (one-tap end mood, closing), Journey.tsx (progress from src/progress.ts; tab label Journey), ShareButton.tsx (canvas card, APP_URL empty until hosted). No streak badge by design.

## Design rules from the owner (17 Nov 2026)
- No vertical scrolling: one page at a time. More content goes on another page via the bottom menu or a Next step, never below the fold. Sideways swipe rows are fine.
- Keep the Sunrise colours. Sentence case, no forced capitals. Name: द्रष्टा (Drasta).
- Header: "PeMA © 2026 · Built by द्रष्टा (Drasta)" on one line (PeMA not repeated). Footer: tagline only.

## Foundation (applies to all of Asta's apps; adopted 1 Nov 2026)
Tagline: "Your app. Your data. Your choice."

The 3 USPs, which are non-negotiable:
1. **We never see your data.** Everything stays on the user's device. No accounts, no tracking, no tracking ads, nothing to breach.
2. **You own everything.** Your app, your data. Export, delete or take it anywhere. Open-source code anyone can check.
3. **Fair by design.** Free core. Pay what you want or one-off upgrades. No subscription traps. Open costs page.

Build rules: **never ask users for an API key or any AI setup** (rule from Asta, 17 Nov 2026, replaces "bring your own key"; AI features must work with no setup, using on-device logic or the app's own server-side key with no logging); local-first storage; no analytics, trackers, ad networks or data-leaking third-party scripts; never log prompts or user content; always offer export and delete-all; never commit secrets (scan history before any push); made-up sample data only; MIT licence unless Asta says otherwise; truthful privacy claims ("we never see or store your data" if text goes to an AI provider). No adverts. A support button uses "Support privately", not "Donate" or "Support anonymously" (owner approved 19 Nov 2026), with the copy "Built by one. Funded by many." and "Your name is never shown publicly. Payments are handled securely by [provider]; we never see your card details." UK English. If a request conflicts with this foundation, say so and suggest a compliant alternative.
