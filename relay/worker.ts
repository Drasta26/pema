// PeMA session relay (Cloudflare Worker). Holds the owner's Anthropic API key as a secret so app
// users need no key. It never logs or stores check-ins or sessions. It only accepts requests from
// the PeMA app, runs only PeMA's own prompts, caps sizes, and rate-limits each visitor.
// Plain fetch (no SDK) keeps the file small enough to paste into the Cloudflare dashboard.
import { LIBRARY_SCHEMA, LIBRARY_START_SYSTEM, LIBRARY_ADAPT_SYSTEM, assemble } from "../src/library";
import { detectCrisis } from "../src/safety";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5-5";
const MAX_BODY_BYTES = 16 * 1024;
// A start query is the check-in plus a short profile; an adapt query also carries the current session
export const MAX_QUERY_CHARS = { start: 3000, adapt: 12000 } as const;
const SYSTEMS = { start: LIBRARY_START_SYSTEM, adapt: LIBRARY_ADAPT_SYSTEM } as const;

export interface Env {
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  // Drasta's voice (ElevenLabs). Optional: without them, sessions are text only.
  ELEVENLABS_API_KEY?: string;
  VOICE_ID?: string;
  VOICE_MODEL?: string;
  // Store of lines already spoken in Drasta's voice (Cloudflare KV). Each line is recorded once, then reused for everyone.
  VOICE_CACHE?: {
    get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
    put(key: string, value: ArrayBuffer): Promise<void>;
  };
}

export interface Line { text: string; pause: number }
export interface Clip { id: string | null; pause: number }

// Spoken parts of a session, in play order: opening, each step, closing
export function spokenParts(s: any): { intro: string; steps: string[]; exit: string } {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const steps = Array.isArray(s?.steps) ? s.steps.map(str).slice(0, 8) : [];
  return { intro: `${str(s?.stateReflection)} ${str(s?.purpose)}`.trim(), steps, exit: str(s?.exitInstructions) };
}

// Splits a part into single lines. "[pause 4s]" becomes silence after the line (played by the app, costs nothing);
// a short natural gap follows every other sentence. Short single lines repeat across sessions, so they are reused.
export function toLines(text: string): Line[] {
  const out: Line[] = [];
  const chunks = text.split(/\[pause\s*(\d+(?:\.\d+)?)\s*s?\]/i);
  for (let i = 0; i < chunks.length; i += 2) {
    const pause = i + 1 < chunks.length ? Math.min(8, Number(chunks[i + 1]) || 0) : 0;
    const sentences = chunks[i].replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
    sentences.forEach((t, j) => out.push({ text: t.slice(0, 300), pause: j === sentences.length - 1 ? pause : 0.6 }));
  }
  return out.slice(0, 20);
}

// The same words always map to the same saved clip, whoever the session is for
export async function lineId(env: Env, text: string): Promise<string> {
  const key = `${env.VOICE_ID}|${env.VOICE_MODEL || "eleven_multilingual_v2"}|${text.toLowerCase().replace(/\s+/g, " ").trim()}`;
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return [...new Uint8Array(hash)].slice(0, 16).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Returns the saved clip id, recording the line in Drasta's voice only if it has never been recorded before.
// Only text Claude has just written for a session reaches here; the relay never voices text sent in by anyone.
async function ensureLine(env: Env, text: string, made: Map<string, Promise<boolean>>): Promise<string | null> {
  const id = await lineId(env, text);
  if (!made.has(id)) {
    made.set(id, (async () => {
      if (await env.VOICE_CACHE!.get(id, "arrayBuffer")) return true;
      try {
        const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${env.VOICE_ID}?output_format=mp3_44100_64`, {
          method: "POST",
          headers: { "content-type": "application/json", "xi-api-key": env.ELEVENLABS_API_KEY as string },
          body: JSON.stringify({ text, model_id: env.VOICE_MODEL || "eleven_multilingual_v2" }),
        });
        if (!r.ok) return false;
        await env.VOICE_CACHE!.put(id, await r.arrayBuffer());
        return true;
      } catch {
        return false;
      }
    })());
  }
  return (await made.get(id)) ? id : null;
}

async function voiceSession(env: Env, session: any) {
  if (!env.ELEVENLABS_API_KEY || !env.VOICE_ID || !env.VOICE_CACHE) return undefined;
  const p = spokenParts(session);
  const made = new Map<string, Promise<boolean>>();
  const clips = (text: string) => Promise.all(toLines(text).map(async l => ({ id: await ensureLine(env, l.text, made), pause: l.pause })));
  const [intro, exit, ...steps] = await Promise.all([clips(p.intro), clips(p.exit), ...p.steps.map(clips)]);
  return { intro, steps, exit };
}

// Serves a saved clip. It never records anything, so it costs no credits.
async function serveClip(env: Env, id: string, origin: string): Promise<Response> {
  const audio = env.VOICE_CACHE ? await env.VOICE_CACHE.get(id, "arrayBuffer") : null;
  if (!audio) return reply(404, { error: "not found" }, origin);
  return new Response(audio, {
    status: 200,
    headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=31536000, immutable", ...cors(origin) },
  });
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
    "access-control-allow-methods": "GET, POST, OPTIONS",
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
    const clip = new URL(request.url).pathname.match(/^\/voice\/([0-9a-f]{32})$/);
    if (request.method === "GET" && clip) return serveClip(env, clip[1], origin);
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
        max_tokens: 2048,
        fallbacks: "default",
        system: SYSTEMS[input.mode],
        tools: [{ name: "meditation_session", description: "Return the meditation session.", input_schema: LIBRARY_SCHEMA }],
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
    // Claude only chose library lines; the session is built from those recorded lines alone
    const session = assemble(block.input);
    if (!session) return reply(502, { error: "no session" }, origin);
    // Drasta's voice for each line (saved once, reused); if voicing fails, the session still comes back as text
    const voice = await voiceSession(env, session);
    return reply(200, voice ? { session, voice } : { session }, origin);
  },
};
