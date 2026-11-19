import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedbackMailto } from './feedback.ts';

// Made-up address for testing only
const TO = 'pema.test@example.com';

test('positive feedback with text', () => {
  const url = feedbackMailto(TO, true, 'Lovely & calm', 'v3.1');
  assert.ok(url.startsWith(`mailto:${TO}?subject=`));
  const q = new URLSearchParams(url.split('?')[1]);
  assert.equal(q.get('subject'), 'PeMA feedback 👍');
  assert.match(q.get('body')!, /I like PeMA\.\n\nLovely & calm/);
});
test('negative feedback without text', () => {
  const q = new URLSearchParams(feedbackMailto(TO, false, '  ', 'v3.1').split('?')[1]);
  assert.equal(q.get('subject'), 'PeMA feedback 👎');
  assert.match(q.get('body')!, /\(no comment\)/);
});
