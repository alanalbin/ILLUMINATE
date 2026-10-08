'use client';

import React, { useState, useEffect } from 'react';

export interface EventCountdownProps {
  targetDate?: string | Date | null;
  className?: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

export function parseTargetTimestamp(targetDate?: string | Date | null): number | null {
  if (!targetDate) return null;
  const parsed = new Date(targetDate).getTime();
  return isNaN(parsed) ? null : parsed;
}

export function getEffectiveTargetTimestamp(targetDate?: string | Date | null): number {
  const parsed = parseTargetTimestamp(targetDate);
  if (parsed !== null && parsed > Date.now()) {
    return parsed;
  }

  // Authoritative Workshop Date: 22nd of October 2026 (23:59:59 IST)
  const october22Target = new Date('2026-10-22T23:59:59+05:30').getTime();
  if (october22Target > Date.now()) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('illuminate_countdown_target', october22Target.toString());
      } catch {
        // Storage access blocked or restricted
      }
    }
    return october22Target;
  }

  // Fallback to persistent deadline in localStorage so it doesn't reset on every refresh
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('illuminate_countdown_target');
      if (stored) {
        const parsedStored = parseInt(stored, 10);
        if (!isNaN(parsedStored) && parsedStored > Date.now()) {
          return parsedStored;
        }
      }
    } catch {
      // Storage access blocked or restricted
    }
  }

  // Create rolling target 14 days from now aligned to end of day if past Oct 2026
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 14);
  fallback.setHours(23, 59, 59, 999);
  const fallbackTs = fallback.getTime();

  return fallbackTs;
}

export function calculateTimeRemaining(targetTs: number, currentNow: number = Date.now()): TimeLeft {
  const diff = targetTs - currentNow;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isEnded: false,
  };
}

export default function EventCountdown({ targetDate, className = '' }: EventCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const targetTs = getEffectiveTargetTimestamp(targetDate);
    return calculateTimeRemaining(targetTs);
  });

  useEffect(() => {
    setMounted(true);
    const targetTs = getEffectiveTargetTimestamp(targetDate);

    // Initial exact calculation
    setTimeLeft(calculateTimeRemaining(targetTs));

    const interval = setInterval(() => {
      const updated = calculateTimeRemaining(targetTs);
      setTimeLeft(updated);
      if (updated.isEnded) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: 'Days', val: String(timeLeft.days).padStart(2, '0') },
    { label: 'Hours', val: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Mins', val: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Secs', val: String(timeLeft.seconds).padStart(2, '0'), isSec: true },
  ];

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {units.map((item, idx) => (
        <div
          key={idx}
          className={`flex flex-col items-center justify-center min-w-[54px] sm:min-w-[62px] py-2 px-1.5 rounded-xl bg-purple-950/40 border backdrop-blur-md shadow-inner transition-all duration-300 ${
            item.isSec
              ? 'border-purple-600/60 shadow-purple-900/20'
              : 'border-purple-700/40 hover:border-purple-500/60'
          }`}
        >
          <span
            suppressHydrationWarning
            className="text-lg sm:text-xl font-black font-mono tabular-nums tracking-tight text-white transition-colors"
          >
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
