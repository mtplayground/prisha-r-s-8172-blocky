import { useCallback, useEffect, useRef, useState } from 'react';

export function useSurvivalTimer({ enabled = true } = {}) {
  const startTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const elapsedMsRef = useRef(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(enabled);

  const stopTimer = useCallback(() => {
    const elapsed = Math.max(0, performance.now() - startTimeRef.current);
    elapsedMsRef.current = elapsed;
    setElapsedMs(elapsed);
    setIsRunning(false);

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return elapsed;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopTimer();
      return;
    }

    if (!isRunning) {
      return;
    }

    function tick() {
      const elapsed = Math.max(0, performance.now() - startTimeRef.current);
      elapsedMsRef.current = elapsed;
      setElapsedMs(elapsed);
      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, isRunning, stopTimer]);

  return {
    elapsedMs,
    isRunning,
    stopTimer,
  };
}
