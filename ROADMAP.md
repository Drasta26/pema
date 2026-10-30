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

## 9. Accessibility and hosting (6-8 h)
- [ ] Keyboard use, screen-reader labels, reduced-motion support for the breathing animation, colour contrast.
- [ ] Choose hosting; keep the API key server-side; rate limiting and a monthly API cost cap.
- [ ] Tag v1.0 and write a short user guide.
