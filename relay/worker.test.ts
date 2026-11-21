import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { checkInput, spokenParts, toLines, lineId } from './worker.ts';

const APP = 'https://drasta26.github.io';
// Made-up value; the real key is only ever a Cloudflare secret
const env = { ANTHROPIC_API_KEY: 'test-key-not-real', ALLOWED_ORIGINS: APP };
const post = (body: unknown, origin = APP) =>
  new Request('https://relay.test/', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });

// Stub Anthropic so tests never reach the network
function stubAnthropic(response: unknown, status = 200) {
  const calls: any[] = [];
  globalThis.fetch = (async (_url: any, init: any) => {
    calls.push(JSON.parse(init.body));
    return new Response(JSON.stringify(response), { status, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  return calls;
}
const toolReply = { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', stop_reason: 'tool_use', usage: { input_tokens: 1, output_tokens: 1 },
  content: [{ type: 'tool_use', id: 't1', name: 'meditation_session', input: { techniqueName: 'Box breathing' } }] };

test('accepts start and adapt requests within limits', () => {
  assert.deepEqual(checkInput({ mode: 'start', query: 'A bit stressed' }), { mode: 'start', query: 'A bit stressed' });
  assert.ok(checkInput({ mode: 'adapt', query: 'x'.repeat(5000) }));
});
test('rejects unknown modes, empty or oversized queries', () => {
  assert.equal(checkInput({ mode: 'chat', query: 'hi' }), null);
  assert.equal(checkInput({ mode: 'start', query: '  ' }), null);
  assert.equal(checkInput({ mode: 'start', query: 'x'.repeat(3001) }), null);
  assert.equal(checkInput('nope'), null);
});

test('refuses other websites', async () => {
  const res = await worker.fetch(post({ mode: 'start', query: 'hi' }, 'https://evil.example'), env);
  assert.equal(res.status, 403);
});

test('returns the session and uses only PeMA prompts and model', async () => {
  const calls = stubAnthropic(toolReply);
  const res = await worker.fetch(post({ mode: 'start', query: 'A bit stressed' }), env);
  assert.equal(res.status, 200);
  assert.deepEqual((await res.json()).session, { techniqueName: 'Box breathing' });
  assert.equal(calls[0].model, 'claude-sonnet-5-5');
  assert.match(calls[0].system, /Personalised Meditation Coach/);
  assert.equal(res.headers.get('access-control-allow-origin'), APP);
});

test('never sends crisis text to the AI', async () => {
  const calls = stubAnthropic(toolReply);
  const res = await worker.fetch(post({ mode: 'start', query: "I can't go on" }), env);
  assert.equal(res.status, 422);
  assert.equal(calls.length, 0);
});

test('reports an upstream failure without details', async () => {
  stubAnthropic({ type: 'error', error: { type: 'api_error', message: 'boom' } }, 500);
  const res = await worker.fetch(post({ mode: 'adapt', query: 'session' }), env);
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { error: 'upstream' });
});

test('is unavailable until the key secret is set', async () => {
  const res = await worker.fetch(post({ mode: 'start', query: 'hi' }), { ALLOWED_ORIGINS: APP });
  assert.equal(res.status, 503);
});

// Drasta's voice: every line is recorded once, then reused for everyone
function memoryStore() {
  const data = new Map<string, ArrayBuffer>();
  return { data, get: async (k: string) => data.get(k) ?? null, put: async (k: string, v: ArrayBuffer) => { data.set(k, v); } };
}
const voiceReply = (steps: string[]) => ({ ...toolReply, content: [{ type: 'tool_use', id: 't1', name: 'meditation_session',
  input: { stateReflection: 'I hear you. [pause 2s]', purpose: 'This practice helps you rest.', steps, exitInstructions: 'Open your eyes.' } }] });
function stubBoth(reply: unknown, ttsOk = true) {
  const tts: string[] = [];
  globalThis.fetch = (async (url: any, init: any) => {
    if (String(url).includes('elevenlabs')) { tts.push(JSON.parse(init.body).text); return ttsOk ? new Response(new Uint8Array([1, 2, 3]), { status: 200 }) : new Response('no', { status: 401 }); }
    return new Response(JSON.stringify(reply), { status: 200 });
  }) as typeof fetch;
  return tts;
}

test('splits parts into single lines with silent pauses', () => {
  assert.equal(spokenParts({ stateReflection: 'Hi.', purpose: 'Rest.', steps: ['A.'], exitInstructions: 'Bye.' }).intro, 'Hi. Rest.');
  assert.deepEqual(toLines('Breathe in. [pause 4s] Let your shoulders drop. Rest here.'), [
    { text: 'Breathe in.', pause: 4 },
    { text: 'Let your shoulders drop.', pause: 0.6 },
    { text: 'Rest here.', pause: 0 },
  ]);
});

test('the same words always give the same saved clip', async () => {
  const e = { VOICE_ID: 'v1' } as any;
  assert.equal(await lineId(e, 'Breathe in.'), await lineId(e, '  breathe   IN. '));
  assert.notEqual(await lineId(e, 'Breathe in.'), await lineId(e, 'Breathe out.'));
});

test('records each new line once and reuses saved lines at no cost', async () => {
  const store = memoryStore();
  const venv = { ...env, ELEVENLABS_API_KEY: 'test-not-real', VOICE_ID: 'voice-test', VOICE_CACHE: store };
  let tts = stubBoth(voiceReply(['Breathe in. [pause 4s]', 'Breathe in. [pause 4s]', 'Let go.']));
  const first: any = await (await worker.fetch(post({ mode: 'start', query: 'Tired' }), venv)).json();
  // "Breathe in." appears twice but is recorded once
  assert.deepEqual(tts.sort(), ['Breathe in.', 'I hear you.', 'Let go.', 'Open your eyes.', 'This practice helps you rest.']);
  assert.equal(first.voice.steps[0][0].id, first.voice.steps[1][0].id);
  assert.equal(first.voice.steps[0][0].pause, 4);
  // A second session with the same lines records nothing new
  tts = stubBoth(voiceReply(['Let go.', 'Breathe in. [pause 4s]']));
  const second: any = await (await worker.fetch(post({ mode: 'start', query: 'Stressed' }), venv)).json();
  assert.equal(tts.length, 0);
  assert.equal(second.voice.steps[1][0].id, first.voice.steps[0][0].id);
});

test('serves saved clips without recording anything', async () => {
  const store = memoryStore();
  const venv = { ...env, ELEVENLABS_API_KEY: 'test-not-real', VOICE_ID: 'voice-test', VOICE_CACHE: store };
  const id = await lineId(venv as any, 'Let go.');
  store.data.set(id, new Uint8Array([9, 9]).buffer);
  const tts = stubBoth(toolReply);
  const ok = await worker.fetch(new Request(`https://relay.test/voice/${id}`, { headers: { origin: APP } }), venv);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('content-type'), 'audio/mpeg');
  const missing = await worker.fetch(new Request(`https://relay.test/voice/${'0'.repeat(32)}`, { headers: { origin: APP } }), venv);
  assert.equal(missing.status, 404);
  const other = await worker.fetch(new Request(`https://relay.test/voice/${id}`, { headers: { origin: 'https://evil.example' } }), venv);
  assert.equal(other.status, 403);
  assert.equal(tts.length, 0);
});

test('session still returns as text if the voice fails or is not set up', async () => {
  stubBoth(voiceReply(['One.']), false);
  const failed: any = await (await worker.fetch(post({ mode: 'start', query: 'Tired' }), { ...env, ELEVENLABS_API_KEY: 'x', VOICE_ID: 'v', VOICE_CACHE: memoryStore() })).json();
  assert.ok(failed.session);
  assert.ok([...failed.voice.intro, ...failed.voice.steps.flat()].every((c: any) => c.id === null));
  stubBoth(voiceReply(['One.']));
  const plain: any = await (await worker.fetch(post({ mode: 'start', query: 'Tired' }), env)).json();
  assert.equal(plain.voice, undefined);
});
