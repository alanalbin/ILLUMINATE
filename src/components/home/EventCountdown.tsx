'use client';

import React, { useState, useEffect } from 'react';

export default function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-zinc-300">
      <span className="font-semibold text-white tracking-wider">
        {String(timeLeft.days).padStart(2, '0')}d
      </span>
      <span className="text-zinc-600">:</span>
      <span className="font-semibold text-white tracking-wider">
        {String(timeLeft.hours).padStart(2, '0')}h
      </span>
      <span className="text-zinc-600">:</span>
      <span className="font-semibold text-white tracking-wider">
        {String(timeLeft.minutes).padStart(2, '0')}m
      </span>
      <span className="text-zinc-600">:</span>
      <span className="font-semibold text-violet-400 tracking-wider">
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}
