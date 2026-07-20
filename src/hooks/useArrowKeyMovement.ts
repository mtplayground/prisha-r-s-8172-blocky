import { useEffect, useRef, useState } from 'react';
import { INITIAL_PLAYER_X, PLAYFIELD_CONFIG } from '../config/playfield';
import type { HorizontalDirection } from '../types/game';
import { clampPlayerX, movePlayerX } from '../utils/playfield';

function getDirection({
  left,
  right,
}: {
  left: boolean;
  right: boolean;
}): HorizontalDirection {
  if (left === right) {
    return 0;
  }

  return left ? -1 : 1;
}

export function useArrowKeyMovement() {
  const [playerX, setPlayerX] = useState(() =>
    clampPlayerX({
      x: INITIAL_PLAYER_X,
      playfieldWidth: PLAYFIELD_CONFIG.width,
      blockSize: PLAYFIELD_CONFIG.blockSize,
    }),
  );
  const heldKeysRef = useRef({ left: false, right: false });
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        heldKeysRef.current.left = true;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        heldKeysRef.current.right = true;
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        heldKeysRef.current.left = false;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        heldKeysRef.current.right = false;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        heldKeysRef.current = { left: false, right: false };
        lastFrameTimeRef.current = null;
      }
    }

    function tick(frameTime: number) {
      const previousFrameTime = lastFrameTimeRef.current ?? frameTime;
      const deltaMs = frameTime - previousFrameTime;
      lastFrameTimeRef.current = frameTime;

      const direction = getDirection(heldKeysRef.current);

      if (direction !== 0) {
        setPlayerX((currentX) =>
          movePlayerX({
            currentX,
            direction,
            deltaMs,
            speed: PLAYFIELD_CONFIG.playerSpeed,
            playfieldWidth: PLAYFIELD_CONFIG.width,
            blockSize: PLAYFIELD_CONFIG.blockSize,
          }),
        );
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return playerX;
}
