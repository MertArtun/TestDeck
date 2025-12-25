import { describe, it, expect, beforeEach } from 'vitest';
import type { Card, Subject, DailyStats } from '../types/database';
import { useAppStore } from './appStore';

// Mock card factory
const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: Date.now() + Math.random(),
  question: 'What is 2+2?',
  option_a: '3',
  option_b: '4',
  option_c: '5',
  option_d: '6',
  option_e: '7',
  correct_answer: 'B',
  subject: 'Math',
  difficulty: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Initial state for reset
const initialState = {
  cards: [],
  currentCard: null,
  currentSession: null,
  currentQuestionIndex: 0,
  sessionCards: [],
  userAnswers: {},
  subjects: [],
  dailyStats: [],
  isLoading: false,
};

describe('appStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState(initialState);
  });

  describe('initial state', () => {
    it('should have empty cards array', () => {
      expect(useAppStore.getState().cards).toEqual([]);
    });

    it('should have null currentCard', () => {
      expect(useAppStore.getState().currentCard).toBeNull();
    });

    it('should have null currentSession', () => {
      expect(useAppStore.getState().currentSession).toBeNull();
    });

    it('should have currentQuestionIndex as 0', () => {
      expect(useAppStore.getState().currentQuestionIndex).toBe(0);
    });

    it('should have empty sessionCards', () => {
      expect(useAppStore.getState().sessionCards).toEqual([]);
    });

    it('should have empty userAnswers', () => {
      expect(useAppStore.getState().userAnswers).toEqual({});
    });

    it('should have isLoading as false', () => {
      expect(useAppStore.getState().isLoading).toBe(false);
    });
  });

  describe('Card CRUD', () => {
    describe('setCards', () => {
      it('should set cards array', () => {
        const cards = [createMockCard({ id: 1 }), createMockCard({ id: 2 })];

        useAppStore.getState().setCards(cards);

        expect(useAppStore.getState().cards).toHaveLength(2);
        expect(useAppStore.getState().cards).toEqual(cards);
      });

      it('should replace existing cards', () => {
        useAppStore.setState({ cards: [createMockCard({ id: 1 })] });
        const newCards = [createMockCard({ id: 2 }), createMockCard({ id: 3 })];

        useAppStore.getState().setCards(newCards);

        expect(useAppStore.getState().cards).toHaveLength(2);
        expect(useAppStore.getState().cards[0].id).toBe(2);
      });
    });

    describe('addCard', () => {
      it('should add a new card to the array', () => {
        const card = createMockCard({ id: 1 });

        useAppStore.getState().addCard(card);

        expect(useAppStore.getState().cards).toHaveLength(1);
        expect(useAppStore.getState().cards[0]).toEqual(card);
      });

      it('should append to existing cards', () => {
        const card1 = createMockCard({ id: 1 });
        const card2 = createMockCard({ id: 2 });

        useAppStore.getState().addCard(card1);
        useAppStore.getState().addCard(card2);

        expect(useAppStore.getState().cards).toHaveLength(2);
        expect(useAppStore.getState().cards[1]).toEqual(card2);
      });
    });

    describe('updateCard', () => {
      it('should update existing card', () => {
        const card = createMockCard({ id: 1, question: 'Original question' });
        useAppStore.setState({ cards: [card] });

        const updatedCard = { ...card, question: 'Updated question' };
        useAppStore.getState().updateCard(updatedCard);

        expect(useAppStore.getState().cards[0].question).toBe('Updated question');
      });

      it('should only update the matching card', () => {
        const cards = [
          createMockCard({ id: 1, question: 'Q1' }),
          createMockCard({ id: 2, question: 'Q2' }),
          createMockCard({ id: 3, question: 'Q3' }),
        ];
        useAppStore.setState({ cards });

        const updatedCard = { ...cards[1], question: 'Updated Q2' };
        useAppStore.getState().updateCard(updatedCard);

        expect(useAppStore.getState().cards[0].question).toBe('Q1');
        expect(useAppStore.getState().cards[1].question).toBe('Updated Q2');
        expect(useAppStore.getState().cards[2].question).toBe('Q3');
      });

      it('should not modify array if card id not found', () => {
        const cards = [createMockCard({ id: 1 })];
        useAppStore.setState({ cards });

        const nonExistentCard = createMockCard({ id: 999 });
        useAppStore.getState().updateCard(nonExistentCard);

        expect(useAppStore.getState().cards).toHaveLength(1);
        expect(useAppStore.getState().cards[0].id).toBe(1);
      });
    });

    describe('deleteCard', () => {
      it('should remove card by id', () => {
        const cards = [createMockCard({ id: 1 }), createMockCard({ id: 2 })];
        useAppStore.setState({ cards });

        useAppStore.getState().deleteCard(1);

        expect(useAppStore.getState().cards).toHaveLength(1);
        expect(useAppStore.getState().cards[0].id).toBe(2);
      });

      it('should not modify array if card id not found', () => {
        const cards = [createMockCard({ id: 1 })];
        useAppStore.setState({ cards });

        useAppStore.getState().deleteCard(999);

        expect(useAppStore.getState().cards).toHaveLength(1);
      });

      it('should handle deleting from empty array', () => {
        useAppStore.getState().deleteCard(1);

        expect(useAppStore.getState().cards).toHaveLength(0);
      });
    });
  });

  describe('Session Management', () => {
    describe('startSession', () => {
      it('should create a new session', () => {
        const cards = [createMockCard({ id: 1 }), createMockCard({ id: 2 })];

        useAppStore.getState().startSession(cards, 'practice');

        const { currentSession } = useAppStore.getState();
        expect(currentSession).not.toBeNull();
        expect(currentSession?.session_type).toBe('practice');
        expect(currentSession?.total_questions).toBe(2);
      });

      it('should set session type correctly', () => {
        const cards = [createMockCard()];

        useAppStore.getState().startSession(cards, 'test');

        expect(useAppStore.getState().currentSession?.session_type).toBe('test');
      });

      it('should initialize sessionCards', () => {
        const cards = [createMockCard({ id: 1 }), createMockCard({ id: 2 })];

        useAppStore.getState().startSession(cards, 'practice');

        expect(useAppStore.getState().sessionCards).toEqual(cards);
      });

      it('should reset question index to 0', () => {
        useAppStore.setState({ currentQuestionIndex: 5 });
        const cards = [createMockCard()];

        useAppStore.getState().startSession(cards, 'practice');

        expect(useAppStore.getState().currentQuestionIndex).toBe(0);
      });

      it('should reset userAnswers', () => {
        useAppStore.setState({ userAnswers: { 1: 'A', 2: 'B' } });
        const cards = [createMockCard()];

        useAppStore.getState().startSession(cards, 'practice');

        expect(useAppStore.getState().userAnswers).toEqual({});
      });

      it('should set started_at timestamp', () => {
        const cards = [createMockCard()];

        useAppStore.getState().startSession(cards, 'practice');

        const { currentSession } = useAppStore.getState();
        expect(currentSession?.started_at).toBeDefined();
        expect(new Date(currentSession!.started_at).getTime()).toBeLessThanOrEqual(Date.now());
      });
    });

    describe('answerQuestion', () => {
      it('should record user answer', () => {
        useAppStore.getState().answerQuestion(1, 'A');

        expect(useAppStore.getState().userAnswers[1]).toBe('A');
      });

      it('should handle multiple answers', () => {
        useAppStore.getState().answerQuestion(1, 'A');
        useAppStore.getState().answerQuestion(2, 'B');
        useAppStore.getState().answerQuestion(3, 'C');

        const { userAnswers } = useAppStore.getState();
        expect(userAnswers[1]).toBe('A');
        expect(userAnswers[2]).toBe('B');
        expect(userAnswers[3]).toBe('C');
      });

      it('should overwrite previous answer for same card', () => {
        useAppStore.getState().answerQuestion(1, 'A');
        useAppStore.getState().answerQuestion(1, 'B');

        expect(useAppStore.getState().userAnswers[1]).toBe('B');
      });

      it('should handle fill-in-blank text answers', () => {
        useAppStore.getState().answerQuestion(1, 'Istanbul');

        expect(useAppStore.getState().userAnswers[1]).toBe('Istanbul');
      });
    });

    describe('nextQuestion', () => {
      it('should increment question index', () => {
        expect(useAppStore.getState().currentQuestionIndex).toBe(0);

        useAppStore.getState().nextQuestion();

        expect(useAppStore.getState().currentQuestionIndex).toBe(1);
      });

      it('should increment multiple times', () => {
        useAppStore.getState().nextQuestion();
        useAppStore.getState().nextQuestion();
        useAppStore.getState().nextQuestion();

        expect(useAppStore.getState().currentQuestionIndex).toBe(3);
      });
    });

    describe('endSession', () => {
      it('should do nothing if no current session', () => {
        useAppStore.getState().endSession();

        expect(useAppStore.getState().currentSession).toBeNull();
      });

      it('should calculate correct answers for multiple choice', () => {
        const cards = [
          createMockCard({ id: 1, correct_answer: 'A' }),
          createMockCard({ id: 2, correct_answer: 'B' }),
          createMockCard({ id: 3, correct_answer: 'C' }),
        ];

        useAppStore.getState().startSession(cards, 'test');
        useAppStore.getState().answerQuestion(1, 'A'); // correct
        useAppStore.getState().answerQuestion(2, 'B'); // correct
        useAppStore.getState().answerQuestion(3, 'A'); // wrong

        useAppStore.getState().endSession();

        expect(useAppStore.getState().currentSession?.correct_answers).toBe(2);
      });

      it('should set ended_at timestamp', () => {
        const cards = [createMockCard()];
        useAppStore.getState().startSession(cards, 'test');

        useAppStore.getState().endSession();

        expect(useAppStore.getState().currentSession?.ended_at).toBeDefined();
      });

      it('should reset sessionCards', () => {
        const cards = [createMockCard()];
        useAppStore.getState().startSession(cards, 'test');

        useAppStore.getState().endSession();

        expect(useAppStore.getState().sessionCards).toEqual([]);
      });

      it('should reset userAnswers', () => {
        const cards = [createMockCard({ id: 1 })];
        useAppStore.getState().startSession(cards, 'test');
        useAppStore.getState().answerQuestion(1, 'A');

        useAppStore.getState().endSession();

        expect(useAppStore.getState().userAnswers).toEqual({});
      });

      it('should reset currentQuestionIndex', () => {
        const cards = [createMockCard()];
        useAppStore.getState().startSession(cards, 'test');
        useAppStore.getState().nextQuestion();
        useAppStore.getState().nextQuestion();

        useAppStore.getState().endSession();

        expect(useAppStore.getState().currentQuestionIndex).toBe(0);
      });
    });
  });

  describe('Fill-in-blank answer checking', () => {
    it('should match exact answer case-insensitively', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'Istanbul',
      });

      useAppStore.getState().startSession([card], 'test');
      useAppStore.getState().answerQuestion(1, 'istanbul');
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(1);
    });

    it('should ignore punctuation in answers', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'Hello!',
      });

      useAppStore.getState().startSession([card], 'test');
      useAppStore.getState().answerQuestion(1, 'hello');
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(1);
    });

    it('should trim whitespace', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'answer',
      });

      useAppStore.getState().startSession([card], 'test');
      useAppStore.getState().answerQuestion(1, '  answer  ');
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(1);
    });

    it('should accept any of comma-separated options', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'cat,dog,bird',
      });

      useAppStore.getState().startSession([card], 'test');
      useAppStore.getState().answerQuestion(1, 'dog');
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(1);
    });

    it('should accept first option from comma-separated list', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'apple,orange,banana',
      });

      useAppStore.getState().startSession([card], 'test');
      useAppStore.getState().answerQuestion(1, 'apple');
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(1);
    });

    it('should accept last option from comma-separated list', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'red,green,blue',
      });

      useAppStore.getState().startSession([card], 'test');
      useAppStore.getState().answerQuestion(1, 'blue');
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(1);
    });

    it('should reject wrong answer for fill-in-blank', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'correct',
      });

      useAppStore.getState().startSession([card], 'test');
      useAppStore.getState().answerQuestion(1, 'wrong');
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(0);
    });

    it('should handle empty user answer', () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'answer',
      });

      useAppStore.getState().startSession([card], 'test');
      // No answer provided
      useAppStore.getState().endSession();

      expect(useAppStore.getState().currentSession?.correct_answers).toBe(0);
    });
  });

  describe('Stats Actions', () => {
    describe('updateSubjects', () => {
      it('should update subjects array', () => {
        const subjects: Subject[] = [
          {
            name: 'Math',
            total_cards: 10,
            accuracy: 85,
            last_studied: '2024-01-01',
            total_attempts: 50,
          },
          {
            name: 'Science',
            total_cards: 15,
            accuracy: 90,
            last_studied: '2024-01-02',
            total_attempts: 75,
          },
        ];

        useAppStore.getState().updateSubjects(subjects);

        expect(useAppStore.getState().subjects).toEqual(subjects);
      });
    });

    describe('updateDailyStats', () => {
      it('should update dailyStats array', () => {
        const stats: DailyStats[] = [
          {
            date: '2024-01-01',
            questions_answered: 20,
            correct_answers: 15,
            accuracy: 75,
            study_time: 30,
          },
        ];

        useAppStore.getState().updateDailyStats(stats);

        expect(useAppStore.getState().dailyStats).toEqual(stats);
      });
    });
  });

  describe('UI Actions', () => {
    describe('setLoading', () => {
      it('should set loading to true', () => {
        useAppStore.getState().setLoading(true);

        expect(useAppStore.getState().isLoading).toBe(true);
      });

      it('should set loading to false', () => {
        useAppStore.setState({ isLoading: true });

        useAppStore.getState().setLoading(false);

        expect(useAppStore.getState().isLoading).toBe(false);
      });
    });

    describe('setCurrentCard', () => {
      it('should set current card', () => {
        const card = createMockCard({ id: 1 });

        useAppStore.getState().setCurrentCard(card);

        expect(useAppStore.getState().currentCard).toEqual(card);
      });

      it('should set current card to null', () => {
        useAppStore.setState({ currentCard: createMockCard() });

        useAppStore.getState().setCurrentCard(null);

        expect(useAppStore.getState().currentCard).toBeNull();
      });
    });
  });
});
