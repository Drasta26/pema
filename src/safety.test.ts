import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectCrisis } from './safety.ts';

const SHOULD_FLAG = [
  'I want to kill myself',
  'thinking about ending my life',
  'I feel suicidal tonight',
  "I don't want to live anymore",
  'I wish I was dead',
  'everyone would be better off without me',
  "I can't go on like this",
  'I just want to end it all',
  'I keep cutting myself',
  'I have been self-harming again',
  'I took an overdose',
  'I want to hurt someone',
  'I am being abused at home',
  "I don't feel safe",
  'I WANT TO DIE',
  'there is no point in living',
  'I want to take my own life',
];

const SHOULD_NOT_FLAG = [
  'A bit tense after a long day',
  'Feeling a little restless',
  'I am killing it at work today',
  'This deadline is killing me',
  "I'm dying to go on holiday",
  'So tired I could sleep for a week',
  'Happy and calm',
  'Stressed about my exams',
  'I feel safe and relaxed',
  '',
];

for (const text of SHOULD_FLAG) {
  test(`flags: ${text}`, () => assert.equal(detectCrisis(text), true));
}

for (const text of SHOULD_NOT_FLAG) {
  test(`does not flag: ${text || '(empty)'}`, () => assert.equal(detectCrisis(text), false));
}

test('handles null and undefined', () => {
  assert.equal(detectCrisis(null), false);
  assert.equal(detectCrisis(undefined), false);
});

test('handles curly apostrophes', () => {
  assert.equal(detectCrisis('I don’t want to live'), true);
});
