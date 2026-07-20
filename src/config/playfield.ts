import type { PlayfieldConfig } from '../types/game';

export const PLAYFIELD_CONFIG: PlayfieldConfig = {
  width: 432,
  height: 560,
  blockSize: 48,
  playerBottomOffset: 28,
};

export const INITIAL_PLAYER_X =
  (PLAYFIELD_CONFIG.width - PLAYFIELD_CONFIG.blockSize) / 2;
