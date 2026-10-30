# PeMA v2 — Claude edition (30 Oct 2026)

Personalised Mindfulness Assistant, moved from Google AI Studio (v1) to the Claude API.

## Run
1. Open `.env.local` and replace `YOUR_ANTHROPIC_API_KEY` with your key (keep it private; never commit or share it).
2. Double-click `Start PeMA.command`. First run installs dependencies, then opens http://localhost:3000.

Without a key, PeMA still runs using its built-in offline sessions.

## Changes from v1
- `server/geminiService.ts` → `server/claudeService.ts` (Anthropic SDK, structured output via tool use; model set by `CLAUDE_MODEL`, default `claude-sonnet-5-5`).
- `@google/genai` removed; `@anthropic-ai/sdk` added. `.env.local` loaded via dotenv.
- Google/Microsoft sign-in and Firebase unchanged.
