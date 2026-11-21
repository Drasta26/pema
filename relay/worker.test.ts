import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { checkInput, spokenParts, toLines, lineId } from './worker.ts';
import { LINES, GROUPS, IDS, assemble, LIBRARY_SCHEMA, LIBRARY_START_SYSTEM } from '../src/library.ts';

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
// What Claude returns now: only ids of library lines
const libInput = (over: any = {}) => ({
  detectedState: 'Tired / Burnout', techniqueName: 'Heavy and rested',
  reflection: ['r02'], purpose: 'p03',
  steps: [['s01', 's03'], ['b01', 'b02'], ['t01', 't02'], ['t03', 't04'], ['t05'], ['b03']],
  exit: ['c01', 'c04'], breathPacing: { inhale: 4, hold1: 0, exhale: 6, hold2: 0, type: 'extended' },
  enhancements: { journalingPrompts: ['a'], habitRoutine: ['b'], sleepWindDown: ['c'], breathworkProgression: ['d'] },
  ...over,
});
const replyWith = (input: unknown) => ({ id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', stop_reason: 'tool_use', usage: { input_tokens: 1, output_tokens: 1 },
  content: [{ type: 'tool_use', id: 't1', name: 'meditation_session', input }] });
const toolReply = replyWith(libInput());
const w = (id: string) => `${LINES[id].t} [pause ${LINES[id].p}s]`;


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
  const body: any = await res.json();
  assert.equal(body.session.stateReflection, w('r02'));
  assert.equal(body.session.purpose, LINES.p03.t);
  assert.equal(body.session.steps.length, 6);
  assert.equal(body.session.steps[0], `${w('s01')} ${w('s03')}`);
  assert.equal(body.session.exitInstructions, `${w('c01')} ${w('c04')}`);
  assert.equal(body.session.durationText, 'Duration: 5 minutes');
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

// Drasta's voice: every library line is recorded once, then reused for everyone
function memoryStore() {
  const data = new Map<string, ArrayBuffer>();
  return { data, get: async (k: string) => data.get(k) ?? null, put: async (k: string, v: ArrayBuffer) => { data.set(k, v); } };
}
function stubBoth(reply: unknown, ttsOk = true) {
  const tts: string[] = [];
  globalThis.fetch = (async (url: any, init: any) => {
    if (String(url).includes('elevenlabs')) { tts.push(JSON.parse(init.body).text); return ttsOk ? new Response(new Uint8Array([1, 2, 3]), { status: 200 }) : new Response('no', { status: 401 }); }
    return new Response(JSON.stringify(reply), { status: 200 });
  }) as typeof fetch;
  return tts;
}
const venvWith = (store: any) => ({ ...env, ELEVENLABS_API_KEY: 'test-not-real', VOICE_ID: 'voice-test', VOICE_CACHE: store });

test('every library line is one short sentence that becomes exactly one saved clip', () => {
  const banned = /journey|embrace|serenity|deep within|allow yourself/i;
  for (const [id, l] of Object.entries(LINES)) {
    const lines = toLines(`${l.t} [pause ${l.p}s]`);
    assert.equal(lines.length, 1, id);
    assert.equal(lines[0].text, l.t, id);
    assert.equal(lines[0].pause, l.p, id);
    assert.ok(l.t.length <= 80, `${id} is long`);
    assert.doesNotMatch(l.t, banned, id);
  }
  assert.ok(Object.keys(LINES).length >= 110);
  assert.ok(Object.values(LINES).every(l => l.p >= 2 && l.p <= 8), 'pauses leave room to breathe');
  assert.equal(Object.keys(LINES).length, GROUPS.flatMap(g => Object.keys(g.lines)).length, 'ids are unique');
  for (const id of IDS('purpose')) assert.match(LINES[id].t, /^This practice helps you /);
});

test('Claude can only name library lines', () => {
  const props: any = LIBRARY_SCHEMA.properties;
  assert.deepEqual(props.reflection.items.enum, IDS('reflection'));
  assert.deepEqual(props.purpose.enum, IDS('purpose'));
  assert.deepEqual(props.steps.items.items.enum, IDS('step'));
  assert.deepEqual(props.exit.items.enum, IDS('exit'));
  assert.match(LIBRARY_START_SYSTEM, /Samaritans|helpline/);
  assert.match(LIBRARY_START_SYSTEM, /not healthcare/);
  for (const id of Object.keys(LINES)) assert.ok(LIBRARY_START_SYSTEM.includes(`${id}: ${LINES[id].t}`), id);
});

test('builds the session only from library lines and drops anything else', () => {
  const s = assemble(libInput({ steps: [['s01', 'NOPE'], ['b01'], ['b01', 'b02'], ['t01'], ['t02'], ['t03'], ['t04']], purpose: 'r01', reflection: ['r02', 'r03', 'r04'] }));
  assert.equal(s, null, 'a purpose that is not a purpose line is not usable');
  const ok = assemble(libInput({ steps: [['s01', 'NOPE'], ['b01'], ['b01', 'b02'], ['t01'], ['t02'], ['t03'], ['t04']], reflection: ['r02', 'r03', 'r04'] }))!;
  assert.equal(ok.stateReflection, `${w('r02')} ${w('r03')}`);
  assert.equal(ok.steps.length, 6);
  assert.ok(!ok.steps.join(' ').includes('NOPE'));
  assert.equal(ok.steps[1], w('b01'));
  assert.equal(ok.steps[2], w('b02'), 'a line is never used twice in one session');
  assert.equal(assemble(libInput({ steps: [['s01'], ['b01']] })), null);
  assert.equal(assemble(libInput({ exit: [] })), null);
  assert.equal(assemble('nonsense'), null);
});

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

test('records each library line once; a repeat session costs nothing', async () => {
  const store = memoryStore();
  const venv = venvWith(store);
  let tts = stubBoth(replyWith(libInput()));
  const first: any = await (await worker.fetch(post({ mode: 'start', query: 'Tired' }), venv)).json();
  // reflection 1 + purpose 1 + steps 10 lines + exit 2 = 14 distinct lines, each recorded once
  assert.equal(tts.length, 14);
  assert.equal(new Set(tts).size, 14);
  assert.equal(store.data.size, 14);
  // A different person gets the same session: nothing new is recorded
  tts = stubBoth(replyWith(libInput()));
  const second: any = await (await worker.fetch(post({ mode: 'start', query: 'Very tired after work' }), venv)).json();
  assert.equal(tts.length, 0);
  assert.deepEqual(second.voice, first.voice);
  // A different session that shares lines only records the lines it has never used
  tts = stubBoth(replyWith(libInput({ steps: [['s01', 's03'], ['b01', 'b02'], ['t01', 't02'], ['t03', 't04'], ['t05'], ['j02']], exit: ['c01', 'c06'] })));
  await worker.fetch(post({ mode: 'start', query: 'Happy' }), venv);
  assert.deepEqual(tts.sort(), [LINES.j02.t, LINES.c06.t].sort());
});

test('the same clip ids come back for the same words, so every user hears the same recording', async () => {
  const venv = venvWith(memoryStore());
  stubBoth(replyWith(libInput()));
  const a: any = await (await worker.fetch(post({ mode: 'start', query: 'one' }), venv)).json();
  const b: any = await (await worker.fetch(post({ mode: 'start', query: 'two' }), venv)).json();
  assert.equal(a.voice.steps[0][0].id, b.voice.steps[0][0].id);
  assert.equal(a.voice.steps[0][0].pause, LINES.s01.p);
});

test('serves saved clips without recording anything', async () => {
  const store = memoryStore();
  const venv = venvWith(store);
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
  stubBoth(replyWith(libInput()), false);
  const failed: any = await (await worker.fetch(post({ mode: 'start', query: 'Tired' }), venvWith(memoryStore()))).json();
  assert.ok(failed.session);
  assert.ok([...failed.voice.intro, ...failed.voice.steps.flat()].every((c: any) => c.id === null));
  stubBoth(replyWith(libInput()));
  const plain: any = await (await worker.fetch(post({ mode: 'start', query: 'Tired' }), env)).json();
  assert.equal(plain.voice, undefined);
  assert.ok(plain.session);
});

test('an unusable answer from Claude gives no session, so the app builds one on the device', async () => {
  stubBoth(replyWith({ steps: [['s01']] }));
  const res = await worker.fetch(post({ mode: 'start', query: 'Tired' }), venvWith(memoryStore()));
  assert.equal(res.status, 502);
});
