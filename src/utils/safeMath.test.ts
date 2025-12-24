import { describe, it, expect } from 'vitest';
import {
  safePercentage,
  safeRound,
  safeAverage,
  safeDivision,
  isSafeNumber,
} from './safeMath';

describe('safePercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(safePercentage(50, 100)).toBe(50);
    expect(safePercentage(25, 100)).toBe(25);
    expect(safePercentage(1, 3)).toBe(33); // rounds to 33%
    expect(safePercentage(2, 3)).toBe(67); // rounds to 67%
  });

  it('should return default when denominator is 0', () => {
    expect(safePercentage(50, 0)).toBe(0);
    expect(safePercentage(50, 0, -1)).toBe(-1);
  });

  it('should return default when denominator is negative', () => {
    expect(safePercentage(50, -100)).toBe(0);
  });

  it('should return default when numerator is negative', () => {
    expect(safePercentage(-50, 100)).toBe(0);
  });

  it('should handle NaN numerator', () => {
    // NaN is converted to 0 by Number(NaN) || 0, so it returns 0 (0/100 = 0%)
    expect(safePercentage(NaN, 100)).toBe(0);
    // Custom default is not used because num becomes 0 which is valid
    expect(safePercentage(NaN, 100, 42)).toBe(0);
  });

  it('should handle NaN denominator', () => {
    expect(safePercentage(50, NaN)).toBe(0);
  });

  it('should handle Infinity', () => {
    expect(safePercentage(Infinity, 100)).toBe(0);
    expect(safePercentage(50, Infinity)).toBe(0);
  });

  it('should handle string inputs by converting to number', () => {
    expect(safePercentage('50', '100')).toBe(50);
    expect(safePercentage('invalid', 100)).toBe(0);
  });

  it('should use custom default value', () => {
    expect(safePercentage(0, 0, 99)).toBe(99);
    expect(safePercentage(-1, 100, 77)).toBe(77);
  });

  it('should round percentage result', () => {
    expect(safePercentage(1, 7)).toBe(14); // 14.28... rounds to 14
    expect(safePercentage(6, 7)).toBe(86); // 85.71... rounds to 86
  });
});

describe('safeRound', () => {
  it('should round numbers correctly', () => {
    expect(safeRound(4.4)).toBe(4);
    expect(safeRound(4.5)).toBe(5);
    expect(safeRound(4.6)).toBe(5);
    expect(safeRound(-2.5)).toBe(-2);
    expect(safeRound(-2.6)).toBe(-3);
  });

  it('should return default for NaN', () => {
    expect(safeRound(NaN)).toBe(0);
    expect(safeRound(NaN, 42)).toBe(42);
  });

  it('should return default for Infinity', () => {
    expect(safeRound(Infinity)).toBe(0);
    expect(safeRound(Infinity, -1)).toBe(-1);
  });

  it('should return default for -Infinity', () => {
    expect(safeRound(-Infinity)).toBe(0);
  });

  it('should handle string inputs', () => {
    expect(safeRound('4.6')).toBe(5);
    expect(safeRound('invalid')).toBe(0);
  });

  it('should use custom default value', () => {
    expect(safeRound(NaN, 100)).toBe(100);
    expect(safeRound(Infinity, -5)).toBe(-5);
  });

  it('should handle zero', () => {
    expect(safeRound(0)).toBe(0);
    expect(safeRound(0.4)).toBe(0);
  });
});

describe('safeAverage', () => {
  it('should calculate average correctly', () => {
    expect(safeAverage([10, 20, 30])).toBe(20);
    expect(safeAverage([1, 2, 3, 4, 5])).toBe(3);
  });

  it('should return default for empty array', () => {
    expect(safeAverage([])).toBe(0);
    expect(safeAverage([], 99)).toBe(99);
  });

  it('should return default for non-array input', () => {
    expect(safeAverage(null as unknown as number[])).toBe(0);
    expect(safeAverage(undefined as unknown as number[])).toBe(0);
  });

  it('should filter out NaN values', () => {
    expect(safeAverage([10, NaN, 20, NaN, 30])).toBe(20);
  });

  it('should filter out Infinity values', () => {
    expect(safeAverage([10, Infinity, 20, -Infinity, 30])).toBe(20);
  });

  it('should return default when all values are invalid', () => {
    expect(safeAverage([NaN, NaN, NaN])).toBe(0);
    expect(safeAverage([Infinity, -Infinity], 42)).toBe(42);
  });

  it('should handle string values by converting to number', () => {
    expect(safeAverage(['10', '20', '30'] as unknown as number[])).toBe(20);
    expect(safeAverage(['invalid', '10', '20'] as unknown as number[])).toBe(15);
  });

  it('should round the result', () => {
    expect(safeAverage([1, 2])).toBe(2); // 1.5 rounds to 2
    expect(safeAverage([1, 1, 2])).toBe(1); // 1.33 rounds to 1
  });

  it('should use custom default value', () => {
    expect(safeAverage([], 100)).toBe(100);
    expect(safeAverage([NaN], -1)).toBe(-1);
  });
});

describe('safeDivision', () => {
  it('should divide correctly', () => {
    expect(safeDivision(10, 2)).toBe(5);
    expect(safeDivision(7, 2)).toBe(3.5);
    expect(safeDivision(0, 5)).toBe(0);
  });

  it('should return default for division by zero', () => {
    expect(safeDivision(10, 0)).toBe(0);
    expect(safeDivision(10, 0, -1)).toBe(-1);
  });

  it('should handle NaN numerator', () => {
    expect(safeDivision(NaN, 5)).toBe(0);
  });

  it('should handle NaN denominator', () => {
    expect(safeDivision(10, NaN)).toBe(0);
  });

  it('should handle Infinity', () => {
    expect(safeDivision(Infinity, 5)).toBe(0);
    expect(safeDivision(5, Infinity)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(safeDivision(-10, 2)).toBe(-5);
    expect(safeDivision(10, -2)).toBe(-5);
    expect(safeDivision(-10, -2)).toBe(5);
  });

  it('should handle string inputs', () => {
    expect(safeDivision('10', '2')).toBe(5);
    expect(safeDivision('invalid', 2)).toBe(0);
  });

  it('should use custom default value', () => {
    expect(safeDivision(10, 0, 999)).toBe(999);
    expect(safeDivision(NaN, NaN, -100)).toBe(-100);
  });
});

describe('isSafeNumber', () => {
  it('should return true for valid numbers', () => {
    expect(isSafeNumber(0)).toBe(true);
    expect(isSafeNumber(42)).toBe(true);
    expect(isSafeNumber(-100)).toBe(true);
    expect(isSafeNumber(3.14)).toBe(true);
    expect(isSafeNumber(Number.MAX_VALUE)).toBe(true);
    expect(isSafeNumber(Number.MIN_VALUE)).toBe(true);
  });

  it('should return false for NaN', () => {
    expect(isSafeNumber(NaN)).toBe(false);
  });

  it('should return false for Infinity', () => {
    expect(isSafeNumber(Infinity)).toBe(false);
  });

  it('should return false for -Infinity', () => {
    expect(isSafeNumber(-Infinity)).toBe(false);
  });

  it('should return false for non-numeric strings', () => {
    expect(isSafeNumber('hello')).toBe(false);
    // Note: Number('') = 0, which is a valid number
    expect(isSafeNumber('')).toBe(true);
  });

  it('should return true for numeric strings', () => {
    expect(isSafeNumber('42')).toBe(true);
    expect(isSafeNumber('3.14')).toBe(true);
  });

  it('should return true for null (Number(null) = 0)', () => {
    // Note: Number(null) = 0, which is a valid number
    expect(isSafeNumber(null)).toBe(true);
  });

  it('should return false for undefined', () => {
    expect(isSafeNumber(undefined)).toBe(false);
  });

  it('should handle objects', () => {
    // Number({}) = NaN, so false
    expect(isSafeNumber({})).toBe(false);
    // Number([]) = 0, which is valid
    expect(isSafeNumber([])).toBe(true);
  });

  it('should return true for boolean converted to number', () => {
    // Note: Number(true) = 1, Number(false) = 0
    expect(isSafeNumber(true)).toBe(true);
    expect(isSafeNumber(false)).toBe(true);
  });
});
