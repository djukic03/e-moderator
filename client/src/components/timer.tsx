import React , { useState, useEffect } from 'react'

interface TimerProps {
    seconds: number
    onComplete?: () => void;
}

const timer: React.FC<TimerProps> = ( { seconds, onComplete } ) => {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
    setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSecondsLeft(seconds);
    setIsCompleted(false);
  }, [seconds]);

  useEffect(() => {
    if (secondsLeft === 0 && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [secondsLeft, isCompleted, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const sign = totalSeconds < 0 ? '-' : '';
    const abs = Math.abs(totalSeconds);
    const mins = Math.floor(abs / 60);
    const secs = abs % 60;
    return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div>
      <h3>{formatTime(secondsLeft)}</h3>
    </div>
  );
}

export default timer