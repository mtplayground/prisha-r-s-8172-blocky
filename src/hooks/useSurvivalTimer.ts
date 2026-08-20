import { useCallback, useEffect, useRef, useState } from 'react';

export function useSurvivalTimer({ enabled = true, paused = false } = {}) {
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const elapsedMsRef = useRef(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(enabled && !paused);
  const isStoppedRef = useRef(!enabled);

  const stopTimer = useCallback(() => {
    isStoppedRef.current = true;
    lastFrameTimeRef.current = null;
    setIsRunning(false);

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return elapsedMsRef.current;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopTimer();
      return;
    }

    if (paused || isStoppedRef.current) {
      lastFrameTimeRef.current = null;
      setIsRunning(false);
      return;
    }

    setIsRunning(true);

    function tick(frameTime: number) {
      const previousFrameTime = lastFrameTimeRef.current ?? frameTime;
      const deltaMs = Math.max(0, frameTime - previousFrameTime);
      lastFrameTimeRef.current = frameTime;
      elapsedMsRef.current += deltaMs;
      setElapsedMs(elapsedMsRef.current);
      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, paused, stopTimer]);

  return {
    elapsedMs,
    isRunning,
    stopTimer,
  };
}
