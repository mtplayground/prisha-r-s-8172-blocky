import { describe, expect, it } from 'vitest';
import { clampPlayerX, movePlayerX } from './playfield';

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

describe('movePlayerX', () => {
  it('moves left using elapsed time and speed', () => {
    expect(
      movePlayerX({
        currentX: 192,
        direction: -1,
        deltaMs: 100,
        speed: 320,
        playfieldWidth: 432,
        blockSize: 48,
      }),
    ).toBe(160);
  });

  it('moves right using elapsed time and speed', () => {
    expect(
      movePlayerX({
        currentX: 192,
        direction: 1,
        deltaMs: 100,
        speed: 320,
        playfieldWidth: 432,
        blockSize: 48,
      }),
    ).toBe(224);
  });

  it('does not move when no horizontal direction is active', () => {
    expect(
      movePlayerX({
        currentX: 192,
        direction: 0,
        deltaMs: 100,
        speed: 320,
        playfieldWidth: 432,
        blockSize: 48,
      }),
    ).toBe(192);
  });

  it('clamps movement to the playfield edges', () => {
    expect(
      movePlayerX({
        currentX: 2,
        direction: -1,
        deltaMs: 100,
        speed: 320,
        playfieldWidth: 432,
        blockSize: 48,
      }),
    ).toBe(0);
    expect(
      movePlayerX({
        currentX: 380,
        direction: 1,
        deltaMs: 100,
        speed: 320,
        playfieldWidth: 432,
        blockSize: 48,
      }),
    ).toBe(384);
  });
});
