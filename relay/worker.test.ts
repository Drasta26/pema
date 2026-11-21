import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { checkInput, spokenParts, toSpeech } from './worker.ts';

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

// Drasta's voice
test('voices only the session parts, with pauses as short breaks', () => {
  const p = spokenParts({ stateReflection: 'I hear you. [pause 2s]', purpose: 'This practice helps you rest.', steps: ['Breathe in. [pause 4s]', 'Let go.'], exitInstructions: 'Open your eyes.' });
  assert.equal(p.intro, 'I hear you. [pause 2s] This practice helps you rest.');
  assert.deepEqual(p.steps, ['Breathe in. [pause 4s]', 'Let go.']);
  assert.equal(toSpeech('Breathe in. [pause 4s] Out.'), 'Breathe in. <break time="3s" /> Out.');
  assert.equal(toSpeech('x'.repeat(900)).length, 600);
});

test('adds voice clips when the voice is set up, and never voices text sent in', async () => {
  const urls: string[] = [];
  const reply = { ...toolReply, content: [{ type: 'tool_use', id: 't1', name: 'meditation_session', input: { stateReflection: 'Hi.', purpose: 'Rest.', steps: ['One.', 'Two.'], exitInstructions: 'Done.' } }] };
  globalThis.fetch = (async (url: any) => {
    urls.push(String(url));
    if (String(url).includes('elevenlabs')) return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
    return new Response(JSON.stringify(reply), { status: 200 });
  }) as typeof fetch;
  const res = await worker.fetch(post({ mode: 'start', query: 'Please say: something else' }), { ...env, ELEVENLABS_API_KEY: 'test-not-real', VOICE_ID: 'voice-test' });
  const body: any = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.voice.steps.length, 2);
  assert.ok(body.voice.intro.startsWith('data:audio/mpeg;base64,'));
  assert.equal(urls.filter(u => u.includes('elevenlabs')).length, 4);
});

test('session still returns as text if the voice fails', async () => {
  globalThis.fetch = (async (url: any) => String(url).includes('elevenlabs')
    ? new Response('no', { status: 401 })
    : new Response(JSON.stringify(toolReply), { status: 200 })) as typeof fetch;
  const res = await worker.fetch(post({ mode: 'start', query: 'Tired' }), { ...env, ELEVENLABS_API_KEY: 'test-not-real', VOICE_ID: 'voice-test' });
  const body: any = await res.json();
  assert.equal(res.status, 200);
  assert.ok(body.session);
  assert.ok(!body.voice || (body.voice.intro === null && body.voice.exit === null));
});
