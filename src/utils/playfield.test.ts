import { describe, expect, it } from 'vitest';
import {
  advanceFallingBlocks,
  chooseFallingBlockSpawnX,
  clampPlayerX,
  createFallingBlock,
  getFallingBlockSpawnLanes,
  movePlayerX,
} from './playfield';

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

describe('falling block helpers', () => {
  it('builds spawn lanes that keep blocks inside the playfield', () => {
    const lanes = getFallingBlockSpawnLanes({
      playfieldWidth: 432,
      blockSize: 48,
      laneGap: 24,
    });

    expect(lanes[0]).toBe(0);
    expect(lanes[lanes.length - 1]).toBe(384);
    expect(lanes.every((lane) => lane >= 0 && lane <= 384)).toBe(true);
  });

  it('chooses a random lane without repeating the previous lane when possible', () => {
    const spawnX = chooseFallingBlockSpawnX({
      lanes: [0, 72, 144],
      previousX: 72,
      random: () => 0.5,
    });

    expect(spawnX).toBe(144);
  });

  it('creates a block just above the playfield', () => {
    expect(createFallingBlock({ id: 7, x: 72, size: 48 })).toEqual({
      id: 7,
      x: 72,
      y: -48,
      size: 48,
    });
  });

  it('advances falling blocks and clears blocks below the playfield', () => {
    const blocks = advanceFallingBlocks({
      blocks: [
        { id: 1, x: 0, y: 0, size: 48 },
        { id: 2, x: 72, y: 559, size: 48 },
      ],
      deltaMs: 1000,
      speed: 150,
      playfieldHeight: 560,
    });

    expect(blocks).toEqual([{ id: 1, x: 0, y: 150, size: 48 }]);
  });
});
