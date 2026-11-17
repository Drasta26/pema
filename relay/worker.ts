// PeMA session relay (Cloudflare Worker). Holds the owner's Anthropic API key as a secret so app
// users need no key. It never logs or stores check-ins or sessions. It only accepts requests from
// the PeMA app, runs only PeMA's own prompts, caps sizes, and rate-limits each visitor.
// Plain fetch (no SDK) keeps the file small enough to paste into the Cloudflare dashboard.
import { MEDITATION_SCHEMA, START_SYSTEM, ADAPT_SYSTEM } from "../src/prompts";
import { detectCrisis } from "../src/safety";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5-5";
const MAX_BODY_BYTES = 16 * 1024;
// A start query is the check-in plus a short profile; an adapt query also carries the current session
export const MAX_QUERY_CHARS = { start: 3000, adapt: 12000 } as const;
const SYSTEMS = { start: START_SYSTEM, adapt: ADAPT_SYSTEM } as const;

export interface Env {
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

type Mode = keyof typeof SYSTEMS;

// Returns the checked request, or null if it is not a valid PeMA request
export function checkInput(input: unknown): { mode: Mode; query: string } | null {
  if (!input || typeof input !== "object") return null;
  const { mode, query } = input as { mode?: unknown; query?: unknown };
  if (mode !== "start" && mode !== "adapt") return null;
  if (typeof query !== "string" || !query.trim() || query.length > MAX_QUERY_CHARS[mode]) return null;
  return { mode, query };
}

function cors(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}

function reply(status: number, body: unknown, origin?: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...(origin ? cors(origin) : {}) },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = String(env.ALLOWED_ORIGINS || "https://drasta26.github.io").split(",").map(s => s.trim()).filter(Boolean);
    const origin = request.headers.get("origin") || "";
    const ok = allowed.includes(origin);
    if (request.method === "OPTIONS") return ok ? new Response(null, { status: 204, headers: cors(origin) }) : new Response(null, { status: 403 });
    if (!ok) return reply(403, { error: "forbidden" });
    if (request.method !== "POST") return reply(405, { error: "method" }, origin);
    if (!env.ANTHROPIC_API_KEY) return reply(503, { error: "not configured" }, origin);

    if (env.RATE_LIMITER) {
      const who = request.headers.get("cf-connecting-ip") || "unknown";
      const { success } = await env.RATE_LIMITER.limit({ key: who });
      if (!success) return reply(429, { error: "slow down" }, origin);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return reply(413, { error: "too large" }, origin);
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return reply(400, { error: "bad json" }, origin); }
    const input = checkInput(parsed);
    if (!input) return reply(400, { error: "bad request" }, origin);
    // Backstop for the app's own check: crisis text is never sent to the AI
    if (detectCrisis(input.query)) return reply(422, { crisis: true }, origin);

    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "server-side-fallback-2026-07-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        fallbacks: "default",
        system: SYSTEMS[input.mode],
        tools: [{ name: "meditation_session", description: "Return the meditation session.", input_schema: MEDITATION_SCHEMA }],
        // This model rejects forced tool_choice; "auto" plus the instruction below still returns the tool call
        tool_choice: { type: "auto" },
        messages: [{ role: "user", content: `${input.query}\n\nRespond only by calling the meditation_session tool.` }],
      }),
    });
    // Status only; the check-in is never logged
    if (!upstream.ok) return reply(upstream.status === 429 ? 429 : 502, { error: "upstream" }, origin);
    const msg: any = await upstream.json();
    if (msg.stop_reason === "refusal") return reply(502, { error: "declined" }, origin);
    const block = (msg.content || []).find((b: any) => b.type === "tool_use");
    if (!block) return reply(502, { error: "no session" }, origin);
    return reply(200, { session: block.input }, origin);
  },
};
