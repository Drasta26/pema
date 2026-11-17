import { test } from 'node:test';
import assert from 'node:assert/strict';
import { looksLikeAnthropicKey, maskKey } from './apiKey.ts';

// Made-up values that only have the shape of a key
const FAKE = 'sk-ant-api03-' + 'x'.repeat(40) + 'AbCd';

test('accepts a key with the Anthropic shape', () => assert.equal(looksLikeAnthropicKey(FAKE), true));
test('ignores spaces around a pasted key', () => assert.equal(looksLikeAnthropicKey(`  ${FAKE}\n`), true));
test('rejects a stray character before the key', () => assert.equal(looksLikeAnthropicKey('Y' + FAKE), false));
test('rejects another provider key', () => assert.equal(looksLikeAnthropicKey('sk-proj-' + 'x'.repeat(40)), false));
test('rejects an empty value', () => assert.equal(looksLikeAnthropicKey(''), false));
test('mask shows only the last four characters', () => assert.equal(maskKey(FAKE), 'sk-ant-…AbCd'));
