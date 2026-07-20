export const PLAYER_IDS = [1, 2] as const;
export const ROUND_COUNT = 3;

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
  players: Record<PlayerId, PlayerMatchState>;
  lastRoundTime: RoundTime | null;
};

export type PlayfieldConfig = {
  width: number;
  height: number;
  blockSize: number;
  playerBottomOffset: number;
};
