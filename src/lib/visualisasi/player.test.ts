import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { initialPlayerState, playerReducer, stepDelay, type PlayerAction, type PlayerState } from './player.ts';

const run = (state: PlayerState, ...actions: PlayerAction[]) => actions.reduce(playerReducer, state);

describe('playerReducer', () => {
  it('starts paused on the first step', () => {
    assert.deepEqual(initialPlayerState(5), { index: 0, total: 5, playing: false, speed: 1 });
  });

  it('cannot go before the first or past the last step', () => {
    const start = initialPlayerState(3);
    assert.equal(run(start, { type: 'prev' }).index, 0);
    assert.equal(run(start, { type: 'next' }, { type: 'next' }, { type: 'next' }, { type: 'next' }).index, 2);
  });

  it('autoplay advances on each tick and stops by itself on the last step', () => {
    let state = run(initialPlayerState(3), { type: 'play' });
    assert.equal(state.playing, true);
    state = run(state, { type: 'tick' });
    assert.deepEqual([state.index, state.playing], [1, true]);
    state = run(state, { type: 'tick' });
    assert.deepEqual([state.index, state.playing], [2, false]);
    state = run(state, { type: 'tick' });
    assert.deepEqual([state.index, state.playing], [2, false]);
  });

  it('ignores ticks while paused', () => {
    const state = run(initialPlayerState(4), { type: 'tick' });
    assert.equal(state.index, 0);
  });

  it('play on the last step starts over', () => {
    const state = run(initialPlayerState(3), { type: 'jump', index: 2 }, { type: 'play' });
    assert.deepEqual([state.index, state.playing], [0, true]);
  });

  it('does not play when there is only one step', () => {
    assert.equal(run(initialPlayerState(1), { type: 'play' }).playing, false);
  });

  it('manual next, prev, jump and reset pause playback', () => {
    const playing = run(initialPlayerState(5), { type: 'play' }, { type: 'tick' });
    for (const action of [{ type: 'next' }, { type: 'prev' }, { type: 'jump', index: 3 }, { type: 'reset' }] as const) {
      assert.equal(run(playing, action).playing, false, action.type);
    }
    assert.equal(run(playing, { type: 'reset' }).index, 0);
  });

  it('toggle switches between play and pause', () => {
    const state = run(initialPlayerState(3), { type: 'toggle' });
    assert.equal(state.playing, true);
    assert.equal(run(state, { type: 'toggle' }).playing, false);
  });

  it('jump clamps to the available steps', () => {
    const start = initialPlayerState(4);
    assert.equal(run(start, { type: 'jump', index: 10 }).index, 3);
    assert.equal(run(start, { type: 'jump', index: -2 }).index, 0);
  });

  it('loading new data goes back to the first step and stops playback', () => {
    const state = run(initialPlayerState(6), { type: 'play' }, { type: 'tick' }, { type: 'tick' }, { type: 'load', total: 3 });
    assert.deepEqual(state, { index: 0, total: 3, playing: false, speed: 1 });
  });

  it('accepts only the offered speeds', () => {
    const start = initialPlayerState(3);
    assert.equal(run(start, { type: 'speed', speed: 2 }).speed, 2);
    assert.equal(run(start, { type: 'speed', speed: 0.5 }).speed, 0.5);
    assert.equal(run(start, { type: 'speed', speed: 3 }).speed, 1);
    assert.equal(stepDelay(0.5), 2400);
    assert.equal(stepDelay(2), 600);
  });
});
