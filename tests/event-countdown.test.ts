import { describe, it, expect } from 'vitest';
import {
  calculateTimeRemaining,
  parseTargetTimestamp,
  getEffectiveTargetTimestamp,
} from '@/components/home/EventCountdown';

describe('Event Countdown Live Timer Logic', () => {
  it('accurately calculates remaining days, hours, minutes, and seconds from real timestamps', () => {
    const baseNow = new Date('2026-10-03T12:00:00Z').getTime();
    // 2 days, 3 hours, 15 minutes, 30 seconds ahead
    const target = baseNow + (2 * 86400 + 3 * 3600 + 15 * 60 + 30) * 1000;

    const remaining = calculateTimeRemaining(target, baseNow);

    expect(remaining.days).toBe(2);
    expect(remaining.hours).toBe(3);
    expect(remaining.minutes).toBe(15);
    expect(remaining.seconds).toBe(30);
    expect(remaining.isEnded).toBe(false);
  });

  it('marks isEnded as true and clamps all units to 0 if target timestamp has passed', () => {
    const baseNow = new Date('2026-10-03T12:00:00Z').getTime();
    const pastTarget = baseNow - 5000;

    const remaining = calculateTimeRemaining(pastTarget, baseNow);

    expect(remaining.days).toBe(0);
    expect(remaining.hours).toBe(0);
    expect(remaining.minutes).toBe(0);
    expect(remaining.seconds).toBe(0);
    expect(remaining.isEnded).toBe(true);
  });

  it('correctly parses valid target dates and rejects invalid ones', () => {
    expect(parseTargetTimestamp(null)).toBeNull();
    expect(parseTargetTimestamp(undefined)).toBeNull();
    expect(parseTargetTimestamp('invalid-date-xyz')).toBeNull();

    const isoStr = '2026-10-25T10:00:00.000Z';
    const parsed = parseTargetTimestamp(isoStr);
    expect(parsed).toBe(new Date(isoStr).getTime());
  });

  it('provides an effective target in the future even when no date is configured', () => {
    const target = getEffectiveTargetTimestamp(null);
    expect(target).toBeGreaterThan(Date.now());
  });
});
