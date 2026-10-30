# PeMA roadmap

Planned work, in priority order. Hours are rough estimates (about 35-50 hours in total).

## 1. Clean-up after the move from AI Studio (4-6 h)
- [x] Rename the package from `react-example`.
- [ ] Remove leftover AI Studio settings and comments.
- [ ] Rename the misleading "CDN cache" (it is an in-memory map) and add a size limit.
- [ ] Code-split the large JavaScript bundle.

## 2. Tests (6-8 h)
- [x] Unit tests for the crisis-language safety checks.
- [ ] Tests for the session request and response handling on the server, including the offline fallback.
- [ ] Component tests for check-in, session player and session exit.
- [ ] Run tests automatically on every push.

## 3. Your data, your control (4-6 h)
- [ ] Export session history as a file.
- [ ] Delete all history in one step, with confirmation.
- [ ] Plain-English privacy page describing what stays on the device and what is sent to the AI.

## 4. Safety and wording (3-5 h)
- [ ] Review the crisis phrase list and UK support numbers before each release.
- [ ] Keep all wording non-clinical (wellness, not treatment) and check it before any public release.

## 5. Sessions (6-8 h)
- [ ] Expand the offline session library.
- [ ] Session length and voice/sound options.
- [ ] Simple streaks and weekly summary from local history.

## 6. Accessibility (3-4 h)
- [ ] Keyboard use, screen-reader labels, reduced-motion support for the breathing animation, colour contrast.

## 7. Hosting (5-7 h)
- [ ] Choose hosting; keep the API key server-side.
- [ ] Rate limiting and a monthly API cost cap.
- [ ] Tag v1.0 and write a short user guide.
