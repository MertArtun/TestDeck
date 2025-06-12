import { create } from 'zustand';
import { Card, StudySession, CardAttempt, Subject, DailyStats } from '../types/database';

interface AppState {
  // Cards
  cards: Card[];
  currentCard: Card | null;
  
  // Study Session
  currentSession: StudySession | null;
  currentQuestionIndex: number;
  sessionCards: Card[];
  userAnswers: Record<number, string>; // card_id -> answer
  
  // Stats
  subjects: Subject[];
  dailyStats: DailyStats[];
  
  // UI State
  isLoading: boolean;
  
  // Actions
  setCards: (cards: Card[]) => void;
  addCard: (card: Card) => void;
  updateCard: (card: Card) => void;
  deleteCard: (cardId: number) => void;
  
  // Study Session Actions
  startSession: (cards: Card[], sessionType: 'practice' | 'test') => void;
  answerQuestion: (cardId: number, answer: string) => void;
  nextQuestion: () => void;
  endSession: () => void;
  
  // Stats Actions
  updateSubjects: (subjects: Subject[]) => void;
  updateDailyStats: (stats: DailyStats[]) => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setCurrentCard: (card: Card | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  cards: [],
  currentCard: null,
  currentSession: null,
  currentQuestionIndex: 0,
  sessionCards: [],
  userAnswers: {},
  subjects: [],
  dailyStats: [],
  isLoading: false,
  
  // Actions
  setCards: (cards) => set({ cards }),
  
  addCard: (card) => set((state) => ({ 
    cards: [...state.cards, card] 
  })),
  
  updateCard: (card) => set((state) => ({
    cards: state.cards.map(c => c.id === card.id ? card : c)
  })),
  
  deleteCard: (cardId) => set((state) => ({
    cards: state.cards.filter(c => c.id !== cardId)
  })),
  
  // Study Session Actions
  startSession: (cards, sessionType) => {
    const session: StudySession = {
      id: Date.now(), // temporary ID
      started_at: new Date().toISOString(),
      total_questions: cards.length,
      correct_answers: 0,
      session_type: sessionType
    };
    
    set({
      currentSession: session,
      sessionCards: cards,
      currentQuestionIndex: 0,
      userAnswers: {}
    });
  },
  
  answerQuestion: (cardId, answer) => set((state) => ({
    userAnswers: {
      ...state.userAnswers,
      [cardId]: answer
    }
  })),
  
  nextQuestion: () => set((state) => {
    const nextIndex = state.currentQuestionIndex + 1;
    return {
      currentQuestionIndex: nextIndex
    };
  }),
  
  endSession: () => {
    const state = get();
    if (state.currentSession) {
      const correctAnswers = state.sessionCards.reduce((count, card) => {
        const userAnswer = state.userAnswers[card.id];
        
        // Check for fill-in-blank questions
        if (card.question_type === 'fill_in_blank') {
          const normalizeString = (str: string) => 
            str.toLowerCase().replace(/[.,;:!?]/g, '').trim();
          
          const normalizedUser = normalizeString(userAnswer || '');
          const normalizedCorrect = normalizeString(card.blank_answer || '');
          
          if (normalizedUser === normalizedCorrect) return count + 1;
          
          // Check multiple options (comma separated)
          if (card.blank_answer?.includes(',')) {
            const options = card.blank_answer.split(',').map(opt => normalizeString(opt));
            if (options.some(option => normalizedUser === option)) return count + 1;
          }
          
          return count;
        }
        
        // Check for multiple choice questions
        return userAnswer === card.correct_answer ? count + 1 : count;
      }, 0);
      
      const endedSession: StudySession = {
        ...state.currentSession,
        ended_at: new Date().toISOString(),
        correct_answers: correctAnswers
      };
      
      set({
        currentSession: endedSession,
        currentQuestionIndex: 0,
        sessionCards: [],
        userAnswers: {}
      });
    }
  },
  
  // Stats Actions
  updateSubjects: (subjects) => set({ subjects }),
  updateDailyStats: (stats) => set({ dailyStats: stats }),
  
  // UI Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentCard: (card) => set({ currentCard: card }),
}));
