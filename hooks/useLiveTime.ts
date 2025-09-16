
import { useState, useEffect } from 'react';

export const useLiveTime = (initialTime: Date): Date => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(prevTime => new Date(prevTime.getTime() + 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [initialTime]);

  return time;
};
