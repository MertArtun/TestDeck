// SM-2 (SuperMemo-2) Algoritması Implementation
// Spaced Repetition için kullanılır

export interface SM2Result {
  interval: number;     // Gün cinsinden bir sonraki tekrar aralığı
  repetitions: number;  // Ardışık doğru tekrar sayısı
  easeFactor: number;   // Kolaylık faktörü
}

export interface SM2Params {
  quality: number;      // 0-5 arası kalite puanı (0: tamamen yanlış, 5: mükemmel)
  repetitions: number;  // Mevcut ardışık doğru tekrar sayısı
  easeFactor: number;   // Mevcut kolaylık faktörü
  interval: number;     // Mevcut aralık
}

/**
 * SM-2 algoritması hesaplama fonksiyonu
 * @param params SM2Params - algoritma parametreleri
 * @returns SM2Result - hesaplanmış değerler
 */
export function calculateSM2(params: SM2Params): SM2Result {
  const { quality, repetitions, easeFactor, interval } = params;

  let newEaseFactor = easeFactor;
  let newRepetitions = repetitions;
  let newInterval = interval;

  // Kalite < 3 ise hata olarak kabul edilir
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions += 1;
    
    // İlk iki doğru cevap için sabit aralıklar
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      // Üçüncü ve sonraki doğru cevaplar için formül
      newInterval = Math.round(interval * easeFactor);
    }
  }

  // Ease Factor güncelleme
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ease Factor minimum 1.3 olmalı
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor
  };
}

/**
 * Kullanıcı cevabını SM-2 kalite puanına çevirir
 * @param isCorrect boolean - cevap doğru mu?
 * @param timeSpent number - saniye cinsinden harcanan süre (opsiyonel)
 * @returns number - 0-5 arası kalite puanı
 */
export function convertAnswerToQuality(isCorrect: boolean, timeSpent?: number): number {
  if (!isCorrect) {
    return 0; // Yanlış cevap
  }

  // Doğru cevaplar için süreye göre kalite belirleme
  if (timeSpent === undefined) {
    return 4; // Varsayılan: iyi
  }

  // Hızlı cevap (0-10 saniye): Mükemmel
  if (timeSpent <= 10) {
    return 5;
  }
  // Orta hızda cevap (10-30 saniye): İyi
  else if (timeSpent <= 30) {
    return 4;
  }
  // Yavaş cevap (30+ saniye): Orta
  else {
    return 3;
  }
}

/**
 * Sonraki gözden geçirme tarihini hesaplar
 * @param interval number - gün cinsinden aralık
 * @param baseDate Date - başlangıç tarihi (varsayılan: şimdi)
 * @returns Date - sonraki gözden geçirme tarihi
 */
export function calculateNextReviewDate(interval: number, baseDate: Date = new Date()): Date {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + interval);
  return nextDate;
}

/**
 * Kartın tekrarlanması gerekip gerekmediğini kontrol eder
 * @param nextReviewDate Date - sonraki gözden geçirme tarihi
 * @param currentDate Date - mevcut tarih (varsayılan: şimdi)
 * @returns boolean - tekrarlanması gerekli mi?
 */
export function shouldReviewCard(nextReviewDate: Date, currentDate: Date = new Date()): boolean {
  return currentDate >= nextReviewDate;
}

/**
 * Kartları öncelikle göre sıralar (tekrar edilmesi gerekenleri öne alır)
 * @param cards Array - kart dizisi (next_review alanı içermeli)
 * @returns Array - sıralanmış kart dizisi
 */
export function sortCardsByPriority(cards: any[]): any[] {
  const now = new Date();
  
  return cards.sort((a, b) => {
    const aReviewDate = new Date(a.next_review);
    const bReviewDate = new Date(b.next_review);
    
    const aNeedsReview = shouldReviewCard(aReviewDate, now);
    const bNeedsReview = shouldReviewCard(bReviewDate, now);
    
    // Tekrar edilmesi gerekenleri öne al
    if (aNeedsReview && !bNeedsReview) return -1;
    if (!aNeedsReview && bNeedsReview) return 1;
    
    // Her ikisi de tekrar edilmesi gerekiyorsa, tarihe göre sırala (eski olan öne)
    if (aNeedsReview && bNeedsReview) {
      return aReviewDate.getTime() - bReviewDate.getTime();
    }
    
    // Hiçbiri tekrar edilmesi gerekmiyorsa, tarihe göre sırala (yakın olan öne)
    return aReviewDate.getTime() - bReviewDate.getTime();
  });
}

/**
 * Mevcut kartlardaki öğrenme durumunu analiz eder
 * @param cards Array - kart dizisi
 * @returns Object - analiz sonuçları
 */
export function analyzeStudyProgress(cards: any[]) {
  const now = new Date();
  
  const stats = {
    total: cards.length,
    needsReview: 0,
    learning: 0,    // repetitions < 3
    review: 0,      // repetitions >= 3
    mastered: 0,    // interval >= 30
    averageEaseFactor: 0,
    averageInterval: 0
  };

  let totalEaseFactor = 0;
  let totalInterval = 0;

  cards.forEach(card => {
    const reviewDate = new Date(card.next_review);
    
    if (shouldReviewCard(reviewDate, now)) {
      stats.needsReview++;
    }

    if (card.repetitions < 3) {
      stats.learning++;
    } else {
      stats.review++;
    }

    if (card.interval_days >= 30) {
      stats.mastered++;
    }

    totalEaseFactor += card.ease_factor || 2.5;
    totalInterval += card.interval_days || 1;
  });

  if (cards.length > 0) {
    stats.averageEaseFactor = Number((totalEaseFactor / cards.length).toFixed(2));
    stats.averageInterval = Number((totalInterval / cards.length).toFixed(1));
  }

  return stats;
}
