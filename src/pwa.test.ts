import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isIosDevice, isRunningInstalled } from './pwa.ts';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

test('detects iPhone', () => assert.equal(isIosDevice(IPHONE, 'iPhone', 5), true));
test('detects iPad that reports as a Mac with touch', () => assert.equal(isIosDevice(MAC, 'MacIntel', 5), true));
test('a real Mac is not iOS', () => assert.equal(isIosDevice(MAC, 'MacIntel', 0), false));
test('Android is not iOS', () => assert.equal(isIosDevice(ANDROID, 'Linux armv8l', 5), false));

test('installed when display mode is standalone', () => assert.equal(isRunningInstalled(true, undefined), true));
test('installed when iOS reports standalone', () => assert.equal(isRunningInstalled(false, true), true));
test('not installed in a normal browser tab', () => assert.equal(isRunningInstalled(false, undefined), false));
