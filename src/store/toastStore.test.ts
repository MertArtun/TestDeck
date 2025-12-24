import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToastStore } from './toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with empty toasts array', () => {
      const { toasts } = useToastStore.getState();
      expect(toasts).toEqual([]);
    });
  });

  describe('addToast', () => {
    it('should add a toast with generated id', () => {
      const { addToast } = useToastStore.getState();

      const id = addToast({ type: 'success', message: 'Test message' });

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('should return unique id for each toast', () => {
      const { addToast } = useToastStore.getState();

      const id1 = addToast({ type: 'success', message: 'First' });
      const id2 = addToast({ type: 'error', message: 'Second' });

      expect(id1).not.toBe(id2);
      expect(useToastStore.getState().toasts).toHaveLength(2);
    });

    it('should set default duration to 3000ms', () => {
      const { addToast } = useToastStore.getState();

      addToast({ type: 'info', message: 'Test' });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(3000);
    });

    it('should use provided duration', () => {
      const { addToast } = useToastStore.getState();

      addToast({ type: 'warning', message: 'Test', duration: 5000 });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].duration).toBe(5000);
    });

    it('should store all toast properties', () => {
      const { addToast } = useToastStore.getState();

      addToast({
        type: 'error',
        message: 'Error message',
        title: 'Error Title',
        duration: 4000,
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0]).toMatchObject({
        type: 'error',
        message: 'Error message',
        title: 'Error Title',
        duration: 4000,
      });
    });

    it('should support all toast types', () => {
      const { addToast } = useToastStore.getState();
      const types = ['success', 'error', 'info', 'warning'] as const;

      types.forEach((type) => {
        addToast({ type, message: `${type} message` });
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(4);
      types.forEach((type, index) => {
        expect(toasts[index].type).toBe(type);
      });
    });
  });

  describe('removeToast', () => {
    it('should remove toast by id', () => {
      const { addToast, removeToast } = useToastStore.getState();

      const id = addToast({ type: 'success', message: 'Test' });
      expect(useToastStore.getState().toasts).toHaveLength(1);

      removeToast(id);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should only remove the specified toast', () => {
      const { addToast, removeToast } = useToastStore.getState();

      const id1 = addToast({ type: 'success', message: 'First' });
      addToast({ type: 'error', message: 'Second' });
      addToast({ type: 'info', message: 'Third' });

      removeToast(id1);

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(2);
      expect(toasts.find((t) => t.id === id1)).toBeUndefined();
    });

    it('should do nothing if id does not exist', () => {
      const { addToast, removeToast } = useToastStore.getState();

      addToast({ type: 'success', message: 'Test' });

      removeToast('non-existent-id');

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all toasts', () => {
      const { addToast, clear } = useToastStore.getState();

      addToast({ type: 'success', message: 'First' });
      addToast({ type: 'error', message: 'Second' });
      addToast({ type: 'info', message: 'Third' });

      expect(useToastStore.getState().toasts).toHaveLength(3);

      clear();

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should work on empty toasts array', () => {
      const { clear } = useToastStore.getState();

      clear();

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-remove toast after duration', () => {
      const { addToast } = useToastStore.getState();

      addToast({ type: 'success', message: 'Test', duration: 3000 });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(3000);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should not auto-remove if duration is 0', () => {
      const { addToast } = useToastStore.getState();

      addToast({ type: 'success', message: 'Persistent', duration: 0 });

      vi.advanceTimersByTime(10000);

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('should handle multiple toasts with different durations', () => {
      const { addToast } = useToastStore.getState();

      addToast({ type: 'success', message: 'Fast', duration: 1000 });
      addToast({ type: 'info', message: 'Slow', duration: 5000 });

      expect(useToastStore.getState().toasts).toHaveLength(2);

      vi.advanceTimersByTime(1000);
      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].message).toBe('Slow');

      vi.advanceTimersByTime(4000);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });
});
