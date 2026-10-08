import { describe, it, expect } from 'vitest';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';

describe('Event Configuration & Safety Rules', () => {
  it('has initial configured fee set to 699 with 69900 paise', () => {
    expect(DEFAULT_EVENT_CONFIG.registrationFee).toBe(699);
    expect(DEFAULT_EVENT_CONFIG.registrationFeePaise).toBe(69900);
  });

  it('accurately specifies official E-Cell NEC discount comparison', () => {
    expect(DEFAULT_EVENT_CONFIG.officialDiscountFee).toBe(699);
    expect(DEFAULT_EVENT_CONFIG.discountDeadline).toContain('30 September 2026');
  });

  it('guarantees live payments are disabled by default for safety', () => {
    expect(DEFAULT_EVENT_CONFIG.livePaymentsEnabled).toBe(false);
  });

  it('sets minimum target of 70 participants without capping capacity', () => {
    expect(DEFAULT_EVENT_CONFIG.minimumTarget).toBe(70);
    expect(DEFAULT_EVENT_CONFIG.capacity).toBeNull(); // capacity is null/unrestricted until specifically configured
  });

  it('specifies confirmed workshop date and coordinator contact', () => {
    expect(DEFAULT_EVENT_CONFIG.date).toBe('22 October 2026');
    expect(DEFAULT_EVENT_CONFIG.localCoordinator?.name).toBe('Alan Albin');
    expect(DEFAULT_EVENT_CONFIG.localCoordinator?.phone).toBe('8848563266');
  });

  it('specifies genuine host institution and official contact', () => {
    expect(DEFAULT_EVENT_CONFIG.hostInstitution).toContain('KMCT');
    expect(DEFAULT_EVENT_CONFIG.locationCity).toBe('Kasaragod');
    expect(DEFAULT_EVENT_CONFIG.officialContact.name).toBe('Alan Albin');
    expect(DEFAULT_EVENT_CONFIG.officialContact.phone).toBe('8848563266');
  });
});
