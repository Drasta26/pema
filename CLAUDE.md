# PeMA — Claude Code briefing

PeMA = PErsonalised Mindfulness Assistant: picks and adapts a short guided meditation to the user's current emotional state, with breathing pacing, audio, post-session mood tracking and journal notes.
Owner: Dr Asta Ratna Prajapati (CEO, NutriBlend Health / Tara International Ltd). UK English. Keep replies concise; put any owner action in a table: Action | Recommendation and reason | Importance and urgency.

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
React 19 + Vite 6 + Tailwind 4 (src/), Express server (server.ts) serving Vite in dev, Claude via `@anthropic-ai/sdk` in `server/claudeService.ts` (structured output through forced tool use; model from CLAUDE_MODEL, default claude-sonnet-5-5). No accounts: session history is kept in the browser's localStorage on the user's device. Offline rule-based sessions are used when no API key is set.
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
8. Hosting not chosen; API key must stay server-side; add rate limiting and API cost limits.
9. Wellness claims: keep wording non-clinical; get a regulatory check that PeMA stays a wellness product and not a medical device before marketing.
11. Done 30 Oct (v2.8): Mental SPA signature practice (src/components/MentalSpa.tsx; step names from the "5 Steps of Mental SPA" video description, guidance wording approved by owner 30 Oct) and "Guided by Dr Asta" library (src/content.ts, src/components/GuidedLibrary.tsx) using click-to-load youtube-nocookie embeds and local colour tiles, so nothing loads from YouTube until play. Footer credit: Built by द्रष्टा (DrAsta).
