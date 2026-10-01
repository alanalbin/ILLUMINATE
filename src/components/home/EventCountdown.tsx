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
    // Target date: 14 days from initial load or configured future date
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
    <div className="flex items-center gap-2 sm:gap-3">
      {[
        { label: 'Days', val: String(timeLeft.days).padStart(2, '0') },
        { label: 'Hours', val: String(timeLeft.hours).padStart(2, '0') },
        { label: 'Mins', val: String(timeLeft.minutes).padStart(2, '0') },
        { label: 'Secs', val: String(timeLeft.seconds).padStart(2, '0') },
      ].map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] py-2 px-1.5 rounded-xl bg-purple-950/40 border border-purple-700/40 backdrop-blur-md shadow-inner group hover:border-purple-400 transition-colors"
        >
          <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-white group-hover:text-purple-300 transition-colors">
            {item.val}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400/80 mt-0.5">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
