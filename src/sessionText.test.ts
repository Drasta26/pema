import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripPauseMarkers } from './sessionText.ts';

test('removes pause cues from text', () => assert.equal(stripPauseMarkers('Breathe in. [pause 2s] Breathe out.'), 'Breathe in. Breathe out.'));
test('removes pause cues inside nested session objects', () =>
  assert.deepEqual(stripPauseMarkers({ steps: ['Sit [pause 4s] still'], n: 3 }), { steps: ['Sit still'], n: 3 }));
