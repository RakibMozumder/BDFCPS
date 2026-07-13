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
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUpRef.current();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          // Trigger onTimeUp but do it safely
          setTimeout(() => {
            onTimeUpRef.current();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive]);

  return {
    timeLeft,
    setTimeLeft,
  };
}
