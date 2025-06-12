export interface Card {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E';
  subject: string;
  difficulty: number;
  image_path?: string;
  created_at: string;
  updated_at: string;
  // Yeni alanlar - boşluk doldurma için
  question_type?: 'multiple_choice' | 'fill_in_blank';
  blank_answer?: string; // Boşluk doldurma cevabı
  hints?: string; // İpuçları
}

export interface StudySession {
  id: number;
  started_at: string;
  ended_at?: string;
  total_questions: number;
  correct_answers: number;
  session_type: 'practice' | 'test';
}

// Alias for compatibility with SQLite service
export type Session = StudySession;

export interface CardAttempt {
  id: number;
  card_id: number;
  session_id: number;
  user_answer: 'A' | 'B' | 'C' | 'D' | 'E' | string; // string for fill-in-blank
  is_correct: boolean;
  time_spent: number; // in seconds
  attempted_at: string;
}

// Alias for compatibility with SQLite service
export type Attempt = CardAttempt;

export interface CardStats {
  id: number;
  card_id: number;
  total_attempts: number;
  correct_attempts: number;
  last_attempt: string;
  next_review: string;
  ease_factor: number; // for SM-2 algorithm
  interval: number; // days until next review
  repetitions: number;
}

export interface Subject {
  name: string;
  total_cards: number;
  accuracy: number;
  last_studied: string;
  total_attempts: number;
}

export interface DailyStats {
  date: string;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  study_time: number; // in minutes
}
