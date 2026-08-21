export const PLAYER_IDS = [1, 2] as const;
export const ROUND_COUNT = 1;

export type PlayerId = (typeof PLAYER_IDS)[number];

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameScreen =
  'start' | 'difficulty' | 'playing' | 'roundEnd' | 'handoff' | 'results';

export type RoundTime = {
  round: number;
  elapsedMs: number;
};

export type PlayerMatchState = {
  id: PlayerId;
  difficulty: Difficulty | null;
  roundTimes: RoundTime[];
};

export type MatchState = {
  screen: GameScreen;
  activePlayer: PlayerId;
  activeRound: number;
  isPaused: boolean;
  roundSessionId: number;
  players: Record<PlayerId, PlayerMatchState>;
  lastRoundTime: RoundTime | null;
};

export type PlayfieldConfig = {
  width: number;
  height: number;
  blockSize: number;
  playerBottomOffset: number;
  playerSpeed: number;
  spawnLaneGap: number;
};

export type DifficultyTuning = {
  fallingBlockSpeed: number;
  spawnIntervalMs: number;
};

export type HorizontalDirection = -1 | 0 | 1;

export const FALLING_BLOCK_COLORS = [
  'hazard',
  'pink',
  'orange',
  'yellow',
  'lime',
  'cyan',
] as const;

export type FallingBlockColor = (typeof FALLING_BLOCK_COLORS)[number];

export type FallingBlockState = {
  id: number;
  x: number;
  y: number;
  size: number;
  color?: FallingBlockColor;
};

export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};
