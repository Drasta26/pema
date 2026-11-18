# PeMA roadmap

Planned work, in priority order. Hours are rough estimates (about 60-80 hours in total).

## 1. More mindfulness techniques (8-10 h)
- [ ] Body scan
- [ ] Box breathing and other paced-breathing patterns, with a visual guide for each
- [ ] Loving-kindness (metta)
- [ ] Mindful walking
- [ ] Guided visualisation
- [ ] Gratitude and noting practices
- [ ] Choose a technique directly, or let PeMA suggest one

## 2. Personal audio guide (10-12 h)
- [ ] Narrated sessions with a choice of voice and pace
- [ ] Ambient soundscapes (rain, forest, waves) mixed under the voice
- [ ] Record your own guide voice for personal sessions
- [ ] Offline audio for the built-in sessions

## 3. Mindfulness resources library (6-8 h)
- [ ] Short guides for each technique: what it is, how to practise, tips for beginners
- [ ] Glossary of common mindfulness terms
- [ ] "Start here" path for beginners
- [ ] All content written for PeMA or openly licensed, with sources credited

## 4. Unique features (10-12 h)
- [ ] Custom session builder: pick technique, length, sound and closing reflection
- [ ] Themed journeys: multi-day series (for example, "7 days of focus")
- [ ] One-minute micro-sessions for busy moments
- [ ] Daily intention and end-of-day reflection
- [ ] Streaks and weekly summary from local history

## 5. Clean-up after the move from AI Studio (4-6 h)
- [x] Rename the package from `react-example`.
- [ ] Remove leftover AI Studio settings and comments.
- [ ] Rename the misleading "CDN cache" (it is an in-memory map) and add a size limit.
- [ ] Code-split the large JavaScript bundle.

## 6. Tests (6-8 h)
- [x] Unit tests for the safety checks.
- [ ] Tests for the session request and response handling on the server, including the offline fallback.
- [ ] Component tests for check-in, session player and session exit.
- [ ] Run tests automatically on every push.

## 7. Your data, your control (4-6 h)
- [ ] Export session history as a file.
- [ ] Delete all history in one step, with confirmation.
- [ ] Plain-English privacy page describing what stays on the device and what is sent to the AI.

## 8. Content review (2-3 h)
- [ ] Review support messages and contact details before each release.
- [ ] Keep all wording focused on mindfulness practice.

## 9. Installable app (done 5 Nov 2026)
- [x] Web app manifest, icons and splash screen; opens full screen.
- [x] Service worker: works offline, caches only PeMA's own files.
- [x] Install button (Android/desktop) and Share hint (iPhone), hidden once installed.
- [x] "New version available, tap to update" message.
- [x] Lighthouse audit and fixes (17 Nov): mobile 87/100/100/100, desktop 100 in all four.
- [x] Fonts self-hosted, so no request goes to Google (17 Nov).
- [ ] Mobile performance: split the code so the first screen loads less JavaScript, and serve files compressed (most hosts do this).

## 9b. No key for users (done 17 Nov 2026)
- [x] Bring-your-own-key removed (owner rule: never ask users for an API key). Old keys are cleared from devices.
- [x] PeMA relay (`relay/worker.ts`, Cloudflare Worker): owner's key as a secret, PeMA prompts only, origin check, rate limit, size caps, crisis backstop, no logging; 7 tests.
- [x] Relay live at https://pema-relay.rentuk.workers.dev/ (17 Nov): owner's PeMA key as a secret, rate limit 10/min, logs off; real session verified (~6 s).
- [ ] At launch, remove the test origins (localhost, 192.168.0.226) from ALLOWED_ORIGINS.
- [ ] Host PeMA (GitHub Pages at drasta26.github.io/pema needs a `/pema/` base path) and add that site to the relay's allowed origins.
- [ ] Test a full Claude session through the deployed relay on a phone.

## 9c. Foundation check (done 17 Nov 2026)
- [x] "Your data" panel: export history, delete all data (history, streak, key).
- [x] Tagline in the footer; truthful privacy wording.
- [x] Name shown as द्रष्टा (Drasta) everywhere; Devanagari font bundled.
- [x] Claude code loads only when a session starts (first screen faster) and is still cached for offline use.
- [x] One page at a time, no scrolling (17 Nov): bottom menu (Check-in, Practise, Guided, History); session player, end-of-session (two pages) and support screens fit on one screen; settings open over the page; two-line footer.
- [ ] Remove AI Studio leftovers `security_spec.md` (Firebase) and `metadata.json` (Gemini), with owner approval.

## 10. Accessibility and hosting (6-8 h)
- [ ] Keyboard use, screen-reader labels, reduced-motion support for the breathing animation, colour contrast.
- [ ] Choose a static host (no server key, so no rate limiting or cost cap needed on our side).
- [ ] Tag v1.0 and write a short user guide.

## 11. Your own voice (done 18 Nov 2026)
- [x] Mental SPA narrated in द्रष्टा (Drasta)'s cloned voice; clean audio (no clipping, noise about -87 dB); works offline; Voice/Muted switch.
- [ ] Optional: replace the YouTube "5 steps" tile's AI voice by re-editing the video.
