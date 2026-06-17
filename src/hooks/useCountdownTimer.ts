import { useState, useEffect, useRef } from 'react';

interface UseCountdownTimerProps {
  initialSeconds: number;
  isActive: boolean;
  onTimeUp: () => void;
}

export function useCountdownTimer({
  initialSeconds,
  isActive,
  onTimeUp,
}: UseCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp callback fresh to avoid stale closures
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Sync is needed when initialSeconds changes (e.g. starting a new exam)
  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0 && isActive) {
        onTimeUpRef.current();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          // Let the state hit 0 for display, then trigger onTimeUp slightly later
          setTimeout(() => {
            onTimeUpRef.current();
          }, 50);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, timeLeft]);

  return {
    timeLeft,
    setTimeLeft,
  };
}
