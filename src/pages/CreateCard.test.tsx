import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToastStore } from '../store/toastStore';
import CreateCard from './CreateCard';
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

describe('CreateCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', () => {
      renderWithRouter(<CreateCard />);
      // Title uses emoji prefix
      expect(screen.getByText(/create\.title/)).toBeInTheDocument();
    });

    it('should render quick actions section', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.quickActions')).toBeInTheDocument();
    });

    it('should render JSON import button', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.jsonImport')).toBeInTheDocument();
    });

    it('should render file upload button', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.fromFile')).toBeInTheDocument();
    });

    it('should render sample download button', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.sampleDownload')).toBeInTheDocument();
    });

    it('should render drag and drop area', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.dragDrop.title')).toBeInTheDocument();
    });

    it('should render manual card creation section', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.manualTitle')).toBeInTheDocument();
    });
  });

  describe('question type selection', () => {
    it('should have multiple choice button', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.multipleChoice')).toBeInTheDocument();
    });

    it('should have fill-in-blank button', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.fillInBlank')).toBeInTheDocument();
    });

    it('should show options input fields', () => {
      renderWithRouter(<CreateCard />);
      // Check that option inputs exist
      const optionInputs = screen.getAllByRole('textbox');
      expect(optionInputs.length).toBeGreaterThan(4);
    });

    it('should show radio buttons for correct answer selection', () => {
      renderWithRouter(<CreateCard />);
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(5); // A, B, C, D, E
    });
  });

  describe('form elements', () => {
    it('should have question textarea', () => {
      renderWithRouter(<CreateCard />);
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBeGreaterThan(0);
    });

    it('should have difficulty select', () => {
      renderWithRouter(<CreateCard />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have A selected by default', () => {
      renderWithRouter(<CreateCard />);
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toBeChecked();
    });

    it('should have difficulty 1 selected by default', () => {
      renderWithRouter(<CreateCard />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('1');
    });
  });

  describe('correct answer selection', () => {
    it('should allow changing correct answer to B', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const radios = screen.getAllByRole('radio');
      await user.click(radios[1]); // B option

      expect(radios[1]).toBeChecked();
    });

    it('should allow changing correct answer to C', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const radios = screen.getAllByRole('radio');
      await user.click(radios[2]); // C option

      expect(radios[2]).toBeChecked();
    });
  });

  describe('difficulty selection', () => {
    it('should allow changing difficulty to 2', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '2');

      expect(select).toHaveValue('2');
    });

    it('should allow changing difficulty to 3', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '3');

      expect(select).toHaveValue('3');
    });
  });

  describe('save button', () => {
    it('should have save button', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.save')).toBeInTheDocument();
    });

    it('should be disabled initially', () => {
      renderWithRouter(<CreateCard />);
      const saveButton = screen.getByText('create.save').closest('button');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('JSON import', () => {
    it('should toggle JSON import panel when button clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const importButton = screen.getByText('create.jsonImport').closest('button')!;
      await user.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('create.importTitle')).toBeInTheDocument();
      });
    });

    it('should have import action button in import panel', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const importButton = screen.getByText('create.jsonImport').closest('button')!;
      await user.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('create.import')).toBeInTheDocument();
      });
    });
  });

  describe('file input', () => {
    it('should have hidden file input', () => {
      renderWithRouter(<CreateCard />);
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('should accept JSON files', () => {
      renderWithRouter(<CreateCard />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', '.json');
    });
  });

  describe('sample JSON download', () => {
    it('should call URL.createObjectURL when download button clicked', async () => {
      const user = userEvent.setup();
      const createObjectURLMock = vi.fn(() => 'blob:url');
      const revokeObjectURLMock = vi.fn();

      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      renderWithRouter(<CreateCard />);

      const downloadButton = screen.getByText('create.sampleDownload').closest('button')!;
      await user.click(downloadButton);

      expect(createObjectURLMock).toHaveBeenCalled();
    });
  });

  describe('drag and drop zone', () => {
    it('should have drop zone container', () => {
      renderWithRouter(<CreateCard />);
      expect(screen.getByText('create.dragDrop.sub')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call createCard when form is valid and submitted', async () => {
      vi.mocked(database.createCard).mockResolvedValue(1);
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      // Get all textboxes
      const textboxes = screen.getAllByRole('textbox');

      // Fill question (first textarea)
      await user.type(textboxes[0], 'Test question');

      // Fill options (next 5 text inputs)
      await user.type(textboxes[1], 'Option A');
      await user.type(textboxes[2], 'Option B');
      await user.type(textboxes[3], 'Option C');
      await user.type(textboxes[4], 'Option D');

      // Fill subject (last text input before difficulty)
      await user.type(textboxes[6], 'Math');

      // Find and click save button
      const saveButton = screen.getByText('create.save').closest('button')!;
      expect(saveButton).not.toBeDisabled();
      await user.click(saveButton);

      await waitFor(() => {
        expect(database.createCard).toHaveBeenCalled();
      });
    });

    it('should show success toast after successful save', async () => {
      vi.mocked(database.createCard).mockResolvedValue(1);
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const textboxes = screen.getAllByRole('textbox');

      await user.type(textboxes[0], 'Test question');
      await user.type(textboxes[1], 'Option A');
      await user.type(textboxes[2], 'Option B');
      await user.type(textboxes[3], 'Option C');
      await user.type(textboxes[4], 'Option D');
      await user.type(textboxes[6], 'Math');

      const saveButton = screen.getByText('create.save').closest('button')!;
      await user.click(saveButton);

      await waitFor(() => {
        const toasts = useToastStore.getState().toasts;
        expect(toasts.some((t) => t.type === 'success')).toBe(true);
      });
    });

    it('should show error toast on save failure', async () => {
      vi.mocked(database.createCard).mockRejectedValue(new Error('DB Error'));
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const textboxes = screen.getAllByRole('textbox');

      await user.type(textboxes[0], 'Test question');
      await user.type(textboxes[1], 'Option A');
      await user.type(textboxes[2], 'Option B');
      await user.type(textboxes[3], 'Option C');
      await user.type(textboxes[4], 'Option D');
      await user.type(textboxes[6], 'Math');

      const saveButton = screen.getByText('create.save').closest('button')!;
      await user.click(saveButton);

      await waitFor(() => {
        const toasts = useToastStore.getState().toasts;
        expect(toasts.some((t) => t.type === 'error')).toBe(true);
      });
    });
  });

  describe('JSON import functionality', () => {
    it('should render import panel with textarea and button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      // Open import panel
      const importButton = screen.getByText('create.jsonImport').closest('button')!;
      await user.click(importButton);

      // Wait for panel to open
      await waitFor(() => {
        expect(screen.getByPlaceholderText('create.pasteJson')).toBeInTheDocument();
        expect(screen.getByText('create.import')).toBeInTheDocument();
      });
    });

    it('should have disabled import button when textarea is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      // Open import panel
      const importButton = screen.getByText('create.jsonImport').closest('button')!;
      await user.click(importButton);

      await waitFor(() => {
        const importActionButton = screen.getByText('create.import').closest('button')!;
        expect(importActionButton).toBeDisabled();
      });
    });

    it('should show import title when panel is open', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateCard />);

      const importButton = screen.getByText('create.jsonImport').closest('button')!;
      await user.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('create.importTitle')).toBeInTheDocument();
      });
    });
  });
});
