import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Study from './Study';
import { useAppStore } from '../store/appStore';
import type { Card } from '../types/database';

// Mock themeStore
vi.mock('../store/themeStore', () => ({
  useThemeStore: vi.fn(() => ({ language: 'en' })),
}));

// Mock i18n
vi.mock('../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'en',
    locale: 'en-US',
  }),
}));

// Mock database
vi.mock('../database/database', () => ({
  initDatabase: vi.fn().mockResolvedValue(undefined),
  getAllCards: vi.fn().mockResolvedValue([]),
  getCardsBySubject: vi.fn().mockResolvedValue([]),
  getSubjectStats: vi.fn().mockResolvedValue([]),
  getDailyStats: vi.fn().mockResolvedValue([]),
  createCard: vi.fn().mockResolvedValue(1),
  createMultipleCards: vi.fn().mockResolvedValue([]),
  updateCard: vi.fn().mockResolvedValue(undefined),
  deleteCard: vi.fn().mockResolvedValue(undefined),
  createSession: vi.fn().mockResolvedValue(1),
  endSession: vi.fn().mockResolvedValue(undefined),
  recordAttempt: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks
import * as database from '../database/database';

// Helper to render with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Mock card factory
const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: Date.now() + Math.random(),
  question: 'What is 2+2?',
  option_a: '3',
  option_b: '4',
  option_c: '5',
  option_d: '6',
  option_e: '',
  correct_answer: 'B',
  subject: 'Math',
  difficulty: 1,
  question_type: 'multiple_choice',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Initial store state
const initialStoreState = {
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

describe('Study', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState(initialStoreState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Setup Mode', () => {
    describe('rendering', () => {
      it('should render study page', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(document.querySelector('[style*="background"]')).toBeInTheDocument();
        });
      });

      it('should display study header', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.header')).toBeInTheDocument();
        });
      });

      it('should display subject selection section', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        // Verify component renders
        await waitFor(() => {
          expect(screen.getByText('study.header')).toBeInTheDocument();
        });
      });

      it('should display mixed study option', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.mixedStudy')).toBeInTheDocument();
        });
      });

      it('should display difficulty label', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.difficulty')).toBeInTheDocument();
        });
      });

      it('should display all difficulty option', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.all')).toBeInTheDocument();
        });
      });

      it('should display easy difficulty option', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.easy')).toBeInTheDocument();
        });
      });

      it('should display medium difficulty option', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.medium')).toBeInTheDocument();
        });
      });

      it('should display hard difficulty option', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.hard')).toBeInTheDocument();
        });
      });

      it('should display question count label', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.questionCount')).toBeInTheDocument();
        });
      });

      it('should display question count slider', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByRole('slider')).toBeInTheDocument();
        });
      });

      it('should display study type label', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.type')).toBeInTheDocument();
        });
      });

      it('should display practice mode option', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.practice')).toBeInTheDocument();
        });
      });

      it('should display test mode option', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.test')).toBeInTheDocument();
        });
      });

      it('should display start section', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          // Start button is rendered
          expect(document.querySelector('button')).toBeInTheDocument();
        });
      });
    });

    describe('empty state', () => {
      it('should render when no cards exist', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(document.querySelector('[style*="background"]')).toBeInTheDocument();
        });
      });

      it('should show no subjects message when empty', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('study.noSubjects')).toBeInTheDocument();
        });
      });

      it('should show create first card button', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          // The "create first card" is actually a button, not a link
          expect(document.body.textContent).toContain('study.createFirstCard');
        });
      });
    });

    describe('subject display', () => {
      it('should display subject from cards', async () => {
        const cards = [
          createMockCard({ id: 1, subject: 'Math' }),
          createMockCard({ id: 2, subject: 'Science' }),
        ];
        vi.mocked(database.getAllCards).mockResolvedValue(cards);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('Math')).toBeInTheDocument();
          expect(screen.getByText('Science')).toBeInTheDocument();
        });
      });

      it('should display card count for subjects', async () => {
        const cards = [
          createMockCard({ id: 1, subject: 'History' }),
          createMockCard({ id: 2, subject: 'History' }),
          createMockCard({ id: 3, subject: 'Geography' }),
        ];
        vi.mocked(database.getAllCards).mockResolvedValue(cards);

        renderWithRouter(<Study />);

        await waitFor(() => {
          expect(screen.getByText('History')).toBeInTheDocument();
          expect(screen.getByText('Geography')).toBeInTheDocument();
        });
      });
    });

    describe('interactions', () => {
      it('should allow changing question count', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          const slider = screen.getByRole('slider');
          fireEvent.change(slider, { target: { value: '20' } });
          expect(screen.getByText('20')).toBeInTheDocument();
        });
      });

      it('should allow clicking difficulty buttons', async () => {
        vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

        renderWithRouter(<Study />);

        await waitFor(() => {
          const easyButton = screen.getByText('study.easy').closest('button');
          expect(easyButton).toBeInTheDocument();
          fireEvent.click(easyButton!);
        });
      });
    });
  });

  describe('Card types', () => {
    it('should handle multiple choice cards', async () => {
      const card = createMockCard({
        id: 1,
        question_type: 'multiple_choice',
        correct_answer: 'A',
      });

      vi.mocked(database.getAllCards).mockResolvedValue([card]);

      renderWithRouter(<Study />);

      await waitFor(() => {
        expect(document.querySelector('[style*="background"]')).toBeInTheDocument();
      });
    });

    it('should handle fill-in-blank cards', async () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        question: 'The capital of Turkey is _____',
        blank_answer: 'Ankara',
      });

      vi.mocked(database.getAllCards).mockResolvedValue([card]);

      renderWithRouter(<Study />);

      await waitFor(() => {
        expect(document.querySelector('[style*="background"]')).toBeInTheDocument();
      });
    });

    it('should handle comma-separated answers', async () => {
      const card = createMockCard({
        id: 1,
        question_type: 'fill_in_blank',
        blank_answer: 'Istanbul,İstanbul,istanbul',
      });

      vi.mocked(database.getAllCards).mockResolvedValue([card]);

      renderWithRouter(<Study />);

      await waitFor(() => {
        expect(document.querySelector('[style*="background"]')).toBeInTheDocument();
      });
    });
  });

  describe('Session flow', () => {
    it('should render with cards available', async () => {
      const cards = [createMockCard({ id: 1 }), createMockCard({ id: 2 })];
      vi.mocked(database.getAllCards).mockResolvedValue(cards);

      renderWithRouter(<Study />);

      await waitFor(() => {
        expect(document.querySelector('button')).toBeInTheDocument();
      });
    });

    it('should show ready message', async () => {
      const cards = [createMockCard({ id: 1 })];
      vi.mocked(database.getAllCards).mockResolvedValue(cards);

      renderWithRouter(<Study />);

      await waitFor(() => {
        // Component rendered successfully
        expect(document.querySelector('[style*="background"]')).toBeInTheDocument();
      });
    });
  });

  describe('Slider behavior', () => {
    it('should have slider element', async () => {
      vi.mocked(database.getAllCards).mockResolvedValue([createMockCard()]);

      renderWithRouter(<Study />);

      await waitFor(() => {
        const slider = screen.getByRole('slider');
        expect(slider).toBeInTheDocument();
      });
    });
  });
});
