import { describe, expect, it } from 'vitest';
import { formatCm, formatKm, parseCmToMm } from '@/lib/config/units';

describe('cm → mm conversion', () => {
  it('accepts decimal comma and decimal point equally', () => {
    expect(parseCmToMm('3,5')).toEqual({ ok: true, mm: 35 });
    expect(parseCmToMm('3.5')).toEqual({ ok: true, mm: 35 });
    expect(parseCmToMm(' 150 ')).toEqual({ ok: true, mm: 1500 });
    expect(parseCmToMm('72,0')).toEqual({ ok: true, mm: 720 });
  });

  it('rejects invalid input instead of guessing', () => {
    for (const bad of ['', 'abc', '-3', '0', '0,0', '1e3', 'NaN', 'Infinity', '3,55', '3..5', '3,5,1', '12345']) {
      expect(parseCmToMm(bad).ok, bad).toBe(false);
    }
  });

  it('formats mm as cm with a decimal comma', () => {
    expect(formatCm(35)).toBe('3,5');
    expect(formatCm(1500)).toBe('150');
    expect(formatCm(725)).toBe('72,5');
  });

  it('formats money from integer fenings', () => {
    expect(formatKm(2500)).toBe('25,00 KM');
    expect(formatKm(5005)).toBe('50,05 KM');
  });
});
