import test from 'node:test';
import assert from 'node:assert/strict';
import { canAdvance } from '../src/components/heroPlayback.mjs';
const base = { paused: false, hovered: false, hidden: false, reducedMotion: false, explicitPlay: false };
test('autoplay starts and pauses on hover', () => {
  assert.equal(canAdvance(base), true);
  assert.equal(canAdvance({ ...base, hovered: true }), false);
});
test('explicit Play resumes while pointer remains over slider', () => {
  assert.equal(canAdvance({ ...base, hovered: true, explicitPlay: true }), true);
});
test('Pause and hidden tabs always stop advancement', () => {
  assert.equal(canAdvance({ ...base, explicitPlay: true, paused: true }), false);
  assert.equal(canAdvance({ ...base, explicitPlay: true, hidden: true }), false);
});
test('reduced motion disables automatic start but allows explicit Play', () => {
  assert.equal(canAdvance({ ...base, reducedMotion: true }), false);
  assert.equal(canAdvance({ ...base, reducedMotion: true, explicitPlay: true }), true);
});
