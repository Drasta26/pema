import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greeting, moodLabel, reminderFor, REMINDERS, isSettled } from './moods.ts';

test('greets by time of day', () => {
  assert.equal(greeting(7), 'Good morning');
  assert.equal(greeting(14), 'Good afternoon');
  assert.equal(greeting(20), 'Good evening');
  assert.equal(greeting(2), 'Hello, night owl');
});
test('mood labels are short and friendly', () => {
  assert.equal(moodLabel('Stressed / Overwhelmed'), 'Stressed');
  assert.equal(moodLabel('Emotionally numb / Disconnected'), 'Emotionally numb');
  assert.equal(moodLabel(undefined), '');
});
test('one reminder per day, changing the next day', () => {
  const a = reminderFor(new Date(2026, 10, 18, 8));
  assert.equal(reminderFor(new Date(2026, 10, 18, 22)), a);
  assert.notEqual(reminderFor(new Date(2026, 10, 19, 8)), a);
  assert.ok(REMINDERS.includes(a));
});
test('settled moods', () => {
  assert.equal(isSettled('Calm / Content'), true);
  assert.equal(isSettled('Anxious / Overthinking'), false);
});
