import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarise, milestone, minutesFor } from './progress.ts';

const now = new Date('2026-11-18T20:00:00');
const day = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
// Made-up sample history
const logs = [
  { date: day(0), technique: 'Box breathing', state: 'Anxious / Overthinking', endState: 'Calm / Content' },
  { date: day(1), technique: 'Box breathing', state: 'Stressed / Overwhelmed', endState: 'Calm / Content' },
  { date: day(2), technique: '60-second reset' },
  { date: day(10), technique: 'Body scan', state: 'Tired / Burnout', endState: 'Tired / Burnout' },
];

test('counts minutes, this week and days', () => {
  const s = summarise(logs, now);
  assert.equal(s.total, 4);
  assert.equal(s.minutes, 5 + 5 + 1 + 5);
  assert.equal(s.weekSessions, 3);
  assert.equal(s.weekMinutes, 11);
  assert.equal(s.days, 4);
});
test('reports how often sessions ended feeling settled', () => {
  const s = summarise(logs, now);
  assert.equal(s.checked, 3);
  assert.equal(s.settledAfter, 2);
});
test('names the most helpful practice only with enough evidence', () => {
  assert.equal(summarise(logs, now).mostHelpful, 'Box breathing');
  assert.equal(summarise(logs.slice(1), now).mostHelpful, undefined);
});
test('kind milestones', () => {
  assert.equal(milestone(0), undefined);
  assert.match(milestone(1)!, /first/);
  assert.match(milestone(12)!, /Ten/);
});
test('reset counts as one minute', () => assert.equal(minutesFor('60-second reset'), 1));
