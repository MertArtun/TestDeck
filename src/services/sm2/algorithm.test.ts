import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateSM2,
  convertAnswerToQuality,
  calculateNextReviewDate,
  shouldReviewCard,
  sortCardsByPriority,
  analyzeStudyProgress,
  SM2Params,
} from './algorithm';

describe('calculateSM2', () => {
  it('should return interval=1, repetitions=1 for first successful review', () => {
    const params: SM2Params = {
      quality: 4,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
    };
    const result = calculateSM2(params);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it('should return interval=6, repetitions=2 for second successful review', () => {
    const params: SM2Params = {
      quality: 4,
      repetitions: 1,
      easeFactor: 2.5,
      interval: 1,
    };
    const result = calculateSM2(params);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('should calculate interval using formula for third+ successful review', () => {
    const params: SM2Params = {
      quality: 4,
      repetitions: 2,
      easeFactor: 2.5,
      interval: 6,
    };
    const result = calculateSM2(params);
    // interval = round(6 * 2.5) = 15
    expect(result.interval).toBe(15);
    expect(result.repetitions).toBe(3);
  });

  it('should reset repetitions and interval on failed review (quality < 3)', () => {
    const params: SM2Params = {
      quality: 2,
      repetitions: 5,
      easeFactor: 2.5,
      interval: 30,
    };
    const result = calculateSM2(params);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('should handle zero quality score', () => {
    const params: SM2Params = {
      quality: 0,
      repetitions: 3,
      easeFactor: 2.5,
      interval: 15,
    };
    const result = calculateSM2(params);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('should enforce minimum ease factor of 1.3', () => {
    const params: SM2Params = {
      quality: 0, // low quality causes EF decrease
      repetitions: 0,
      easeFactor: 1.3,
      interval: 1,
    };
    const result = calculateSM2(params);
    expect(result.easeFactor).toBe(1.3);
  });

  it('should increase ease factor on perfect quality (5)', () => {
    const params: SM2Params = {
      quality: 5,
      repetitions: 2,
      easeFactor: 2.5,
      interval: 6,
    };
    const result = calculateSM2(params);
    // EF' = 2.5 + (0.1 - (5-5) * (0.08 + (5-5) * 0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBe(2.6);
  });

  it('should decrease ease factor on quality 3', () => {
    const params: SM2Params = {
      quality: 3,
      repetitions: 2,
      easeFactor: 2.5,
      interval: 6,
    };
    const result = calculateSM2(params);
    // EF' = 2.5 + (0.1 - (5-3) * (0.08 + (5-3) * 0.02))
    // = 2.5 + (0.1 - 2 * (0.08 + 0.04))
    // = 2.5 + (0.1 - 0.24) = 2.36
    expect(result.easeFactor).toBeCloseTo(2.36, 2);
  });
});

describe('convertAnswerToQuality', () => {
  it('should return 0 for incorrect answer', () => {
    expect(convertAnswerToQuality(false)).toBe(0);
    expect(convertAnswerToQuality(false, 5)).toBe(0);
    expect(convertAnswerToQuality(false, 100)).toBe(0);
  });

  it('should return 4 for correct answer without time', () => {
    expect(convertAnswerToQuality(true)).toBe(4);
  });

  it('should return 5 for fast correct answer (<=10s)', () => {
    expect(convertAnswerToQuality(true, 0)).toBe(5);
    expect(convertAnswerToQuality(true, 5)).toBe(5);
    expect(convertAnswerToQuality(true, 10)).toBe(5);
  });

  it('should return 4 for medium speed correct answer (10-30s)', () => {
    expect(convertAnswerToQuality(true, 11)).toBe(4);
    expect(convertAnswerToQuality(true, 20)).toBe(4);
    expect(convertAnswerToQuality(true, 30)).toBe(4);
  });

  it('should return 3 for slow correct answer (>30s)', () => {
    expect(convertAnswerToQuality(true, 31)).toBe(3);
    expect(convertAnswerToQuality(true, 60)).toBe(3);
    expect(convertAnswerToQuality(true, 120)).toBe(3);
  });
});

describe('calculateNextReviewDate', () => {
  it('should add interval days to current date by default', () => {
    const now = new Date();
    const result = calculateNextReviewDate(5);
    const expected = new Date(now);
    expected.setDate(expected.getDate() + 5);

    // Compare date parts only (ignoring milliseconds difference)
    expect(result.toDateString()).toBe(expected.toDateString());
  });

  it('should add interval days to provided base date', () => {
    const baseDate = new Date('2025-01-01');
    const result = calculateNextReviewDate(10, baseDate);
    expect(result.toISOString().split('T')[0]).toBe('2025-01-11');
  });

  it('should handle interval of 0', () => {
    const baseDate = new Date('2025-06-15');
    const result = calculateNextReviewDate(0, baseDate);
    expect(result.toISOString().split('T')[0]).toBe('2025-06-15');
  });

  it('should handle large intervals', () => {
    const baseDate = new Date('2025-01-01');
    const result = calculateNextReviewDate(365, baseDate);
    expect(result.toISOString().split('T')[0]).toBe('2026-01-01');
  });
});

describe('shouldReviewCard', () => {
  it('should return true for past review date', () => {
    const pastDate = new Date('2024-01-01');
    const currentDate = new Date('2025-01-01');
    expect(shouldReviewCard(pastDate, currentDate)).toBe(true);
  });

  it('should return false for future review date', () => {
    const futureDate = new Date('2026-01-01');
    const currentDate = new Date('2025-01-01');
    expect(shouldReviewCard(futureDate, currentDate)).toBe(false);
  });

  it('should return true when review date equals current date', () => {
    const sameDate = new Date('2025-01-01T12:00:00');
    const currentDate = new Date('2025-01-01T12:00:00');
    expect(shouldReviewCard(sameDate, currentDate)).toBe(true);
  });

  it('should return true when current date is after review date on same day', () => {
    const reviewDate = new Date('2025-01-01T08:00:00');
    const currentDate = new Date('2025-01-01T20:00:00');
    expect(shouldReviewCard(reviewDate, currentDate)).toBe(true);
  });
});

describe('sortCardsByPriority', () => {
  const now = new Date('2025-01-15');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should put cards needing review first', () => {
    const cards = [
      { id: 1, next_review: '2025-01-20' }, // future - doesn't need review
      { id: 2, next_review: '2025-01-10' }, // past - needs review
      { id: 3, next_review: '2025-01-12' }, // past - needs review
    ];

    const sorted = sortCardsByPriority(cards);

    expect(sorted[0].id).toBe(2); // oldest past date first
    expect(sorted[1].id).toBe(3);
    expect(sorted[2].id).toBe(1); // future date last
  });

  it('should handle empty array', () => {
    const result = sortCardsByPriority([]);
    expect(result).toEqual([]);
  });

  it('should handle single element array', () => {
    const cards = [{ id: 1, next_review: '2025-01-10' }];
    const result = sortCardsByPriority(cards);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should sort by date when all need review', () => {
    const cards = [
      { id: 1, next_review: '2025-01-13' },
      { id: 2, next_review: '2025-01-10' },
      { id: 3, next_review: '2025-01-12' },
    ];

    const sorted = sortCardsByPriority(cards);

    expect(sorted[0].id).toBe(2); // oldest first
    expect(sorted[1].id).toBe(3);
    expect(sorted[2].id).toBe(1);
  });

  it('should sort by date when none need review', () => {
    const cards = [
      { id: 1, next_review: '2025-01-25' },
      { id: 2, next_review: '2025-01-20' },
      { id: 3, next_review: '2025-01-30' },
    ];

    const sorted = sortCardsByPriority(cards);

    expect(sorted[0].id).toBe(2); // closest date first
    expect(sorted[1].id).toBe(1);
    expect(sorted[2].id).toBe(3);
  });
});

describe('analyzeStudyProgress', () => {
  const now = new Date('2025-01-15');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return correct stats for cards', () => {
    const cards = [
      { next_review: '2025-01-10', repetitions: 1, interval_days: 5, ease_factor: 2.5 },
      { next_review: '2025-01-20', repetitions: 5, interval_days: 30, ease_factor: 2.8 },
      { next_review: '2025-01-12', repetitions: 2, interval_days: 10, ease_factor: 2.3 },
    ];

    const stats = analyzeStudyProgress(cards);

    expect(stats.total).toBe(3);
    expect(stats.needsReview).toBe(2); // Jan 10 and Jan 12 are in past
    expect(stats.learning).toBe(2); // repetitions < 3
    expect(stats.review).toBe(1); // repetitions >= 3
    expect(stats.mastered).toBe(1); // interval_days >= 30
  });

  it('should handle empty array', () => {
    const stats = analyzeStudyProgress([]);

    expect(stats.total).toBe(0);
    expect(stats.needsReview).toBe(0);
    expect(stats.learning).toBe(0);
    expect(stats.review).toBe(0);
    expect(stats.mastered).toBe(0);
    expect(stats.averageEaseFactor).toBe(0);
    expect(stats.averageInterval).toBe(0);
  });

  it('should calculate averages correctly', () => {
    const cards = [
      { next_review: '2025-01-20', repetitions: 3, interval_days: 10, ease_factor: 2.0 },
      { next_review: '2025-01-25', repetitions: 4, interval_days: 20, ease_factor: 3.0 },
    ];

    const stats = analyzeStudyProgress(cards);

    expect(stats.averageEaseFactor).toBe(2.5); // (2.0 + 3.0) / 2
    expect(stats.averageInterval).toBe(15); // (10 + 20) / 2
  });

  it('should use default values for missing fields', () => {
    const cards = [
      { next_review: '2025-01-20', repetitions: 1 }, // missing interval_days, ease_factor
    ];

    const stats = analyzeStudyProgress(cards);

    expect(stats.averageEaseFactor).toBe(2.5); // default
    expect(stats.averageInterval).toBe(1); // default
  });

  it('should categorize learning vs review correctly', () => {
    const cards = [
      { next_review: '2025-01-20', repetitions: 0, interval_days: 1 },
      { next_review: '2025-01-20', repetitions: 2, interval_days: 6 },
      { next_review: '2025-01-20', repetitions: 3, interval_days: 15 },
      { next_review: '2025-01-20', repetitions: 10, interval_days: 60 },
    ];

    const stats = analyzeStudyProgress(cards);

    expect(stats.learning).toBe(2); // repetitions 0 and 2
    expect(stats.review).toBe(2); // repetitions 3 and 10
    expect(stats.mastered).toBe(1); // only interval_days 60 >= 30
  });
});
