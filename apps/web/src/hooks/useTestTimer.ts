import { useEffect, useState } from "react";

export function useTestTimer(testId: string, timeLimit: number | undefined, onTimeUp: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!timeLimit || !testId) return;

    const startTimeKey = `test_timer_${testId}`;
    let startTime = localStorage.getItem(startTimeKey);
    const currentTime = Date.now();

    if (!startTime) {
      startTime = currentTime.toString();
      try {
        localStorage.setItem(startTimeKey, startTime);
      } catch (error) {
        console.error('Error saving start time:', error);
      }
    }

    const elapsedSeconds = Math.floor((currentTime - parseInt(startTime)) / 1000);
    const initialTimeLeft = Math.max(0, (timeLimit * 60) - elapsedSeconds);
    
    if (initialTimeLeft <= 0) {
      onTimeUp();
      return;
    }

    setTimeLeft(initialTimeLeft);

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - parseInt(startTime)) / 1000);
      const remaining = Math.max(0, (timeLimit * 60) - elapsed);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [testId, timeLimit, onTimeUp]);

  return timeLeft;
}