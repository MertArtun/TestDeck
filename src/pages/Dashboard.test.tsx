import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as database from '../database/database';

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

// Helper to render with router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

// Mock card factory
const createMockCard = (overrides = {}) => ({
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

// Mock subject stats factory
const createMockSubjectStats = (overrides = {}) => ({
  subject: 'Math',
  totalCards: 10,
  correctPercentage: 80,
  lastStudied: new Date().toISOString(),
  ...overrides,
});

// Mock daily stats factory
const createMockDailyStats = (date: string, overrides = {}) => ({
  date,
  questions_answered: 10,
  accuracy: 80,
  ...overrides,
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render dashboard', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(document.querySelector('[style*="background"]')).toBeInTheDocument();
      });
    });

    it('should display dashboard title', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        // Title contains the key
        expect(document.body.textContent).toContain('dash.title');
      });
    });

    it('should display welcome message', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('dash.welcome')).toBeInTheDocument();
      });
    });
  });

  describe('stats display', () => {
    it('should display total cards count', async () => {
      const cards = [createMockCard({ id: 1 }), createMockCard({ id: 2 }), createMockCard({ id: 3 })];

      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue(cards);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should display total cards label', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('dash.totalCards')).toBeInTheDocument();
      });
    });

    it('should display today studied label', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('dash.todayStudied')).toBeInTheDocument();
      });
    });

    it('should display weekly streak label', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('dash.weeklyStreak')).toBeInTheDocument();
      });
    });
  });

  describe('subject display', () => {
    it('should display subject stats', async () => {
      const subjectStats = [
        createMockSubjectStats({ subject: 'Math', totalCards: 10 }),
        createMockSubjectStats({ subject: 'Science', totalCards: 5 }),
      ];

      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue(subjectStats);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Math')).toBeInTheDocument();
        expect(screen.getByText('Science')).toBeInTheDocument();
      });
    });

    it('should display subject percentage', async () => {
      const subjectStats = [createMockSubjectStats({ subject: 'History', correctPercentage: 75 })];

      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue(subjectStats);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should limit displayed subjects to 6', async () => {
      const subjectStats = Array.from({ length: 10 }, (_, i) =>
        createMockSubjectStats({ subject: `Subject ${i + 1}`, totalCards: 5 })
      );

      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue(subjectStats);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Subject 1')).toBeInTheDocument();
        expect(screen.getByText('Subject 6')).toBeInTheDocument();
        expect(screen.queryByText('Subject 7')).not.toBeInTheDocument();
      });
    });
  });

  describe('empty state', () => {
    it('should show empty state when no cards exist', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        // Check that the empty state container renders with expected content
        expect(document.body.textContent).toContain('dash.noDecks');
      });
    });

    it('should show create prompt when empty', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(document.body.textContent).toContain('dash.createFirstDeck');
      });
    });
  });

  describe('navigation links', () => {
    it('should have link to create card page', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const createLink = links.find((link) => link.getAttribute('href') === '/create');
        expect(createLink).toBeInTheDocument();
      });
    });

    it('should have link to stats page', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const statsLink = links.find((link) => link.getAttribute('href') === '/stats');
        expect(statsLink).toBeInTheDocument();
      });
    });

    it('should have link to card manager', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([createMockSubjectStats()]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const managerLink = links.find((link) => link.getAttribute('href') === '/manager');
        expect(managerLink).toBeInTheDocument();
      });
    });
  });

  describe('quick actions', () => {
    it('should render quick actions section', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(document.body.textContent).toContain('dash.quickActions');
      });
    });

    it('should render create card action', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('dash.createCard')).toBeInTheDocument();
      });
    });

    it('should render view stats action', async () => {
      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue([]);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('dash.viewStats')).toBeInTheDocument();
      });
    });
  });

  describe('daily stats', () => {
    it('should display today stats when available', async () => {
      const today = new Date().toISOString().split('T')[0];
      const dailyStats = [createMockDailyStats(today, { questions_answered: 15, accuracy: 85 })];

      vi.mocked(database.initDatabase).mockResolvedValue(undefined);
      vi.mocked(database.getAllCards).mockResolvedValue([]);
      vi.mocked(database.getSubjectStats).mockResolvedValue([]);
      vi.mocked(database.getDailyStats).mockResolvedValue(dailyStats);

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        // Check that the daily stats value is in the document
        expect(document.body.textContent).toContain('15');
      });
    });
  });

  describe('error handling', () => {
    it('should handle database error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(database.initDatabase).mockRejectedValue(new Error('DB Error'));

      renderWithRouter(<Dashboard />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });
});
