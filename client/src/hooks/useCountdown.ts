import { useState, useEffect } from 'react';

const useCountdown = (targetDate: string | Date | undefined) => {
  if (!targetDate) {
    return { hours: -1, minutes: -1, seconds: -1 };
  }
  
  const countDownDate = new Date(targetDate).getTime();
  const [countDown, setCountDown] = useState(countDownDate - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
  if (countDown < 0) {
    return { hours: -1, minutes: -1, seconds: -1 };
  }
  
  // SỬA LỖI Ở ĐÂY: Tính tổng số giờ thay vì giờ trong ngày
  const hours = Math.floor(countDown / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
  
  const format = (num: number) => String(num).padStart(2, '0');

  return { hours: format(hours), minutes: format(minutes), seconds: format(seconds) };
};

export { useCountdown };