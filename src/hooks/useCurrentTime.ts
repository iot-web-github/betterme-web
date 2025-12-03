import { useState, useEffect } from 'react';

export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const percentOfDay = ((hours * 60 + minutes) / (24 * 60)) * 100;

  return {
    currentTime,
    hours,
    minutes,
    seconds,
    timeString,
    percentOfDay,
  };
};
