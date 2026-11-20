/**
 * State machine behind the Putar / Jeda / Sebelumnya / Berikutnya / Reset
 * controls. Pure, so the rules can be tested without a browser.
 */

export const SPEEDS = [0.5, 1, 2] as const;
export type Speed = (typeof SPEEDS)[number];

/** Time one step stays on screen at 1×. */
export const BASE_STEP_MS = 1200;

export interface PlayerState {
  index: number;
  total: number;
  playing: boolean;
  speed: Speed;
}

export type PlayerAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'reset' }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'toggle' }
  /** Autoplay timer fired. */
  | { type: 'tick' }
  | { type: 'jump'; index: number }
  /** New data → new list of steps. */
  | { type: 'load'; total: number }
  | { type: 'speed'; speed: number };

export function initialPlayerState(total: number, speed: Speed = 1): PlayerState {
  return { index: 0, total: Math.max(1, total), playing: false, speed };
}

const clamp = (index: number, total: number) => Math.min(Math.max(0, Math.trunc(index)), total - 1);

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  const last = state.total - 1;
  switch (action.type) {
    case 'next':
      return { ...state, index: Math.min(state.index + 1, last), playing: false };
    case 'prev':
      return { ...state, index: Math.max(state.index - 1, 0), playing: false };
    case 'reset':
      return { ...state, index: 0, playing: false };
    case 'play':
      if (last === 0) return state;
      // Pressing play on the last step starts over.
      return { ...state, index: state.index === last ? 0 : state.index, playing: true };
    case 'pause':
      return { ...state, playing: false };
    case 'toggle':
      return playerReducer(state, { type: state.playing ? 'pause' : 'play' });
    case 'tick': {
      if (!state.playing) return state;
      const index = Math.min(state.index + 1, last);
      return { ...state, index, playing: index < last };
    }
    case 'jump':
      return { ...state, index: clamp(action.index, state.total), playing: false };
    case 'load':
      return { ...state, index: 0, total: Math.max(1, action.total), playing: false };
    case 'speed':
      return (SPEEDS as readonly number[]).includes(action.speed) ? { ...state, speed: action.speed as Speed } : state;
  }
}

export function stepDelay(speed: Speed): number {
  return BASE_STEP_MS / speed;
}
