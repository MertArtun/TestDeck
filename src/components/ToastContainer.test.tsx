import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastContainer from './ToastContainer';
import { useToastStore } from '../store/toastStore';

// Mock i18n
vi.mock('../i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'en',
    locale: 'en-US',
  }),
}));

describe('ToastContainer', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render without crashing when no toasts', () => {
      render(<ToastContainer />);

      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toBeInTheDocument();
    });

    it('should render nothing visible when toasts array is empty', () => {
      render(<ToastContainer />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should render a single toast', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Test message',
      });

      render(<ToastContainer />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render multiple toasts', () => {
      useToastStore.getState().addToast({ type: 'success', message: 'First' });
      useToastStore.getState().addToast({ type: 'error', message: 'Second' });
      useToastStore.getState().addToast({ type: 'info', message: 'Third' });

      render(<ToastContainer />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should render toast with title', () => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Success Title',
        message: 'Success message',
      });

      render(<ToastContainer />);

      expect(screen.getByText('Success Title')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should render toast without title', () => {
      useToastStore.getState().addToast({
        type: 'info',
        message: 'Info only',
      });

      render(<ToastContainer />);

      expect(screen.getByText('Info only')).toBeInTheDocument();
    });
  });

  describe('toast types and styles', () => {
    it('should render success toast', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Success message',
      });

      render(<ToastContainer />);

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });

    it('should render error toast', () => {
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Error message',
      });

      render(<ToastContainer />);

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });

    it('should render info toast', () => {
      useToastStore.getState().addToast({
        type: 'info',
        message: 'Info message',
      });

      render(<ToastContainer />);

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });

    it('should render warning toast', () => {
      useToastStore.getState().addToast({
        type: 'warning',
        message: 'Warning message',
      });

      render(<ToastContainer />);

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });
  });

  describe('close button interaction', () => {
    it('should render close button for each toast', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Test message',
      });

      render(<ToastContainer />);

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should remove toast when close button is clicked', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Message to close',
      });

      render(<ToastContainer />);

      expect(screen.getByText('Message to close')).toBeInTheDocument();

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(screen.queryByText('Message to close')).not.toBeInTheDocument();
    });

    it('should only remove the specific toast when clicked', () => {
      useToastStore.getState().addToast({ type: 'success', message: 'First' });
      useToastStore.getState().addToast({ type: 'error', message: 'Second' });

      render(<ToastContainer />);

      const closeButtons = screen.getAllByRole('button');
      fireEvent.click(closeButtons[0]);

      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-live polite attribute on container', () => {
      render(<ToastContainer />);

      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toBeInTheDocument();
    });

    it('should have aria-atomic true on container', () => {
      render(<ToastContainer />);

      const container = document.querySelector('[aria-atomic="true"]');
      expect(container).toBeInTheDocument();
    });

    it('should have role status on each toast', () => {
      useToastStore.getState().addToast({ type: 'success', message: 'Test' });

      render(<ToastContainer />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label on close button', () => {
      useToastStore.getState().addToast({ type: 'success', message: 'Test' });

      render(<ToastContainer />);

      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });

  describe('dynamic updates', () => {
    it('should update when new toast is added', () => {
      const { rerender } = render(<ToastContainer />);

      expect(screen.queryByText('New toast')).not.toBeInTheDocument();

      useToastStore.getState().addToast({ type: 'success', message: 'New toast' });
      rerender(<ToastContainer />);

      expect(screen.getByText('New toast')).toBeInTheDocument();
    });

    it('should update when toast is removed', () => {
      const id = useToastStore.getState().addToast({ type: 'success', message: 'To remove' });

      const { rerender } = render(<ToastContainer />);
      expect(screen.getByText('To remove')).toBeInTheDocument();

      useToastStore.getState().removeToast(id);
      rerender(<ToastContainer />);

      expect(screen.queryByText('To remove')).not.toBeInTheDocument();
    });

    it('should update when all toasts are cleared', () => {
      useToastStore.getState().addToast({ type: 'success', message: 'First' });
      useToastStore.getState().addToast({ type: 'error', message: 'Second' });

      const { rerender } = render(<ToastContainer />);
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();

      useToastStore.getState().clear();
      rerender(<ToastContainer />);

      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.queryByText('Second')).not.toBeInTheDocument();
    });
  });

  describe('positioning and layout', () => {
    it('should be fixed position', () => {
      render(<ToastContainer />);

      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toHaveStyle({ position: 'fixed' });
    });

    it('should be positioned at top right', () => {
      render(<ToastContainer />);

      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toHaveStyle({ top: '16px', right: '16px' });
    });

    it('should have high z-index', () => {
      render(<ToastContainer />);

      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toHaveStyle({ zIndex: '9999' });
    });
  });
});
