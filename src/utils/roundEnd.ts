import type { PlayerId } from '../types/game';

export function getRoundEndContinueLabel({
  playerId,
  completedRounds,
  totalRounds,
}: {
  playerId: PlayerId;
  completedRounds: number;
  totalRounds: number;
}) {
  if (completedRounds < totalRounds) {
    return `Start round ${completedRounds + 1}`;
  }

  return playerId === 1 ? 'Hand off to player 2' : 'View results';
}
