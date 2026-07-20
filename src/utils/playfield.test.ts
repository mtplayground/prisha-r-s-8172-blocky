import { describe, expect, it } from 'vitest';
import { clampPlayerX } from './playfield';

describe('clampPlayerX', () => {
  it('keeps the player inside the left edge', () => {
    expect(clampPlayerX({ x: -20, playfieldWidth: 432, blockSize: 48 })).toBe(
      0,
    );
  });

  it('keeps the player inside the right edge', () => {
    expect(clampPlayerX({ x: 500, playfieldWidth: 432, blockSize: 48 })).toBe(
      384,
    );
  });

  it('preserves an in-bounds player position', () => {
    expect(clampPlayerX({ x: 192, playfieldWidth: 432, blockSize: 48 })).toBe(
      192,
    );
  });
});
