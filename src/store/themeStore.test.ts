import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useThemeStore } from './themeStore';

// Mock applyTheme from themeUtils
vi.mock('../utils/themeUtils', () => ({
  applyTheme: vi.fn(),
  getColorSchemeVariables: vi.fn(() => ({})),
  getFontSizeVariables: vi.fn(() => ({})),
}));

// Default settings for comparison
const defaultSettings = {
  mode: 'auto',
  colorScheme: 'blue',
  fontSize: 'medium',
  language: 'tr',
  soundEnabled: true,
  animationsEnabled: true,
  autoSave: true,
  questionsPerSession: 10,
  timePerQuestion: 0,
  showHints: true,
  showProgress: true,
  studyReminders: true,
  achievementNotifications: true,
};

describe('themeStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset store to default state
    useThemeStore.setState(defaultSettings);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have default theme mode as auto', () => {
      expect(useThemeStore.getState().mode).toBe('auto');
    });

    it('should have default color scheme as blue', () => {
      expect(useThemeStore.getState().colorScheme).toBe('blue');
    });

    it('should have default font size as medium', () => {
      expect(useThemeStore.getState().fontSize).toBe('medium');
    });

    it('should have default language as Turkish', () => {
      expect(useThemeStore.getState().language).toBe('tr');
    });

    it('should have sound enabled by default', () => {
      expect(useThemeStore.getState().soundEnabled).toBe(true);
    });

    it('should have animations enabled by default', () => {
      expect(useThemeStore.getState().animationsEnabled).toBe(true);
    });

    it('should have auto save enabled by default', () => {
      expect(useThemeStore.getState().autoSave).toBe(true);
    });

    it('should have 10 questions per session by default', () => {
      expect(useThemeStore.getState().questionsPerSession).toBe(10);
    });

    it('should have 0 time per question by default (no limit)', () => {
      expect(useThemeStore.getState().timePerQuestion).toBe(0);
    });

    it('should have hints enabled by default', () => {
      expect(useThemeStore.getState().showHints).toBe(true);
    });

    it('should have progress enabled by default', () => {
      expect(useThemeStore.getState().showProgress).toBe(true);
    });

    it('should have study reminders enabled by default', () => {
      expect(useThemeStore.getState().studyReminders).toBe(true);
    });

    it('should have achievement notifications enabled by default', () => {
      expect(useThemeStore.getState().achievementNotifications).toBe(true);
    });
  });

  describe('Theme Settings', () => {
    describe('setThemeMode', () => {
      it('should set theme mode to light', () => {
        useThemeStore.getState().setThemeMode('light');

        expect(useThemeStore.getState().mode).toBe('light');
      });

      it('should set theme mode to dark', () => {
        useThemeStore.getState().setThemeMode('dark');

        expect(useThemeStore.getState().mode).toBe('dark');
      });

      it('should set theme mode to auto', () => {
        useThemeStore.setState({ mode: 'light' });

        useThemeStore.getState().setThemeMode('auto');

        expect(useThemeStore.getState().mode).toBe('auto');
      });

      it('should call applyTheme after setting mode', async () => {
        const { applyTheme } = await import('../utils/themeUtils');

        useThemeStore.getState().setThemeMode('dark');
        vi.runAllTimers();

        expect(applyTheme).toHaveBeenCalled();
      });
    });

    describe('setColorScheme', () => {
      it('should set color scheme to blue', () => {
        useThemeStore.getState().setColorScheme('blue');

        expect(useThemeStore.getState().colorScheme).toBe('blue');
      });

      it('should set color scheme to purple', () => {
        useThemeStore.getState().setColorScheme('purple');

        expect(useThemeStore.getState().colorScheme).toBe('purple');
      });

      it('should set color scheme to green', () => {
        useThemeStore.getState().setColorScheme('green');

        expect(useThemeStore.getState().colorScheme).toBe('green');
      });

      it('should set color scheme to orange', () => {
        useThemeStore.getState().setColorScheme('orange');

        expect(useThemeStore.getState().colorScheme).toBe('orange');
      });

      it('should set color scheme to pink', () => {
        useThemeStore.getState().setColorScheme('pink');

        expect(useThemeStore.getState().colorScheme).toBe('pink');
      });

      it('should call applyTheme after setting color scheme', async () => {
        const { applyTheme } = await import('../utils/themeUtils');

        useThemeStore.getState().setColorScheme('purple');
        vi.runAllTimers();

        expect(applyTheme).toHaveBeenCalled();
      });
    });

    describe('setFontSize', () => {
      it('should set font size to small', () => {
        useThemeStore.getState().setFontSize('small');

        expect(useThemeStore.getState().fontSize).toBe('small');
      });

      it('should set font size to medium', () => {
        useThemeStore.setState({ fontSize: 'small' });

        useThemeStore.getState().setFontSize('medium');

        expect(useThemeStore.getState().fontSize).toBe('medium');
      });

      it('should set font size to large', () => {
        useThemeStore.getState().setFontSize('large');

        expect(useThemeStore.getState().fontSize).toBe('large');
      });

      it('should call applyTheme after setting font size', async () => {
        const { applyTheme } = await import('../utils/themeUtils');

        useThemeStore.getState().setFontSize('large');
        vi.runAllTimers();

        expect(applyTheme).toHaveBeenCalled();
      });
    });
  });

  describe('App Settings', () => {
    describe('setLanguage', () => {
      it('should set language to English', () => {
        useThemeStore.getState().setLanguage('en');

        expect(useThemeStore.getState().language).toBe('en');
      });

      it('should set language to Turkish', () => {
        useThemeStore.setState({ language: 'en' });

        useThemeStore.getState().setLanguage('tr');

        expect(useThemeStore.getState().language).toBe('tr');
      });
    });

    describe('setSoundEnabled', () => {
      it('should disable sound', () => {
        useThemeStore.getState().setSoundEnabled(false);

        expect(useThemeStore.getState().soundEnabled).toBe(false);
      });

      it('should enable sound', () => {
        useThemeStore.setState({ soundEnabled: false });

        useThemeStore.getState().setSoundEnabled(true);

        expect(useThemeStore.getState().soundEnabled).toBe(true);
      });
    });

    describe('setAnimationsEnabled', () => {
      it('should disable animations', () => {
        useThemeStore.getState().setAnimationsEnabled(false);

        expect(useThemeStore.getState().animationsEnabled).toBe(false);
      });

      it('should enable animations', () => {
        useThemeStore.setState({ animationsEnabled: false });

        useThemeStore.getState().setAnimationsEnabled(true);

        expect(useThemeStore.getState().animationsEnabled).toBe(true);
      });
    });

    describe('setAutoSave', () => {
      it('should disable auto save', () => {
        useThemeStore.getState().setAutoSave(false);

        expect(useThemeStore.getState().autoSave).toBe(false);
      });

      it('should enable auto save', () => {
        useThemeStore.setState({ autoSave: false });

        useThemeStore.getState().setAutoSave(true);

        expect(useThemeStore.getState().autoSave).toBe(true);
      });
    });
  });

  describe('Study Settings', () => {
    describe('setQuestionsPerSession', () => {
      it('should set questions per session', () => {
        useThemeStore.getState().setQuestionsPerSession(20);

        expect(useThemeStore.getState().questionsPerSession).toBe(20);
      });

      it('should allow setting to 5', () => {
        useThemeStore.getState().setQuestionsPerSession(5);

        expect(useThemeStore.getState().questionsPerSession).toBe(5);
      });

      it('should allow setting to 50', () => {
        useThemeStore.getState().setQuestionsPerSession(50);

        expect(useThemeStore.getState().questionsPerSession).toBe(50);
      });
    });

    describe('setTimePerQuestion', () => {
      it('should set time per question', () => {
        useThemeStore.getState().setTimePerQuestion(30);

        expect(useThemeStore.getState().timePerQuestion).toBe(30);
      });

      it('should allow setting to 0 (no limit)', () => {
        useThemeStore.setState({ timePerQuestion: 60 });

        useThemeStore.getState().setTimePerQuestion(0);

        expect(useThemeStore.getState().timePerQuestion).toBe(0);
      });

      it('should allow setting to 120 seconds', () => {
        useThemeStore.getState().setTimePerQuestion(120);

        expect(useThemeStore.getState().timePerQuestion).toBe(120);
      });
    });

    describe('setShowHints', () => {
      it('should disable hints', () => {
        useThemeStore.getState().setShowHints(false);

        expect(useThemeStore.getState().showHints).toBe(false);
      });

      it('should enable hints', () => {
        useThemeStore.setState({ showHints: false });

        useThemeStore.getState().setShowHints(true);

        expect(useThemeStore.getState().showHints).toBe(true);
      });
    });

    describe('setShowProgress', () => {
      it('should disable progress', () => {
        useThemeStore.getState().setShowProgress(false);

        expect(useThemeStore.getState().showProgress).toBe(false);
      });

      it('should enable progress', () => {
        useThemeStore.setState({ showProgress: false });

        useThemeStore.getState().setShowProgress(true);

        expect(useThemeStore.getState().showProgress).toBe(true);
      });
    });
  });

  describe('Notification Settings', () => {
    describe('setStudyReminders', () => {
      it('should disable study reminders', () => {
        useThemeStore.getState().setStudyReminders(false);

        expect(useThemeStore.getState().studyReminders).toBe(false);
      });

      it('should enable study reminders', () => {
        useThemeStore.setState({ studyReminders: false });

        useThemeStore.getState().setStudyReminders(true);

        expect(useThemeStore.getState().studyReminders).toBe(true);
      });
    });

    describe('setAchievementNotifications', () => {
      it('should disable achievement notifications', () => {
        useThemeStore.getState().setAchievementNotifications(false);

        expect(useThemeStore.getState().achievementNotifications).toBe(false);
      });

      it('should enable achievement notifications', () => {
        useThemeStore.setState({ achievementNotifications: false });

        useThemeStore.getState().setAchievementNotifications(true);

        expect(useThemeStore.getState().achievementNotifications).toBe(true);
      });
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', () => {
      // Change all settings
      useThemeStore.setState({
        mode: 'dark',
        colorScheme: 'purple',
        fontSize: 'large',
        language: 'en',
        soundEnabled: false,
        animationsEnabled: false,
        autoSave: false,
        questionsPerSession: 25,
        timePerQuestion: 60,
        showHints: false,
        showProgress: false,
        studyReminders: false,
        achievementNotifications: false,
      });

      useThemeStore.getState().resetToDefaults();

      const state = useThemeStore.getState();
      expect(state.mode).toBe('auto');
      expect(state.colorScheme).toBe('blue');
      expect(state.fontSize).toBe('medium');
      expect(state.language).toBe('tr');
      expect(state.soundEnabled).toBe(true);
      expect(state.animationsEnabled).toBe(true);
      expect(state.autoSave).toBe(true);
      expect(state.questionsPerSession).toBe(10);
      expect(state.timePerQuestion).toBe(0);
      expect(state.showHints).toBe(true);
      expect(state.showProgress).toBe(true);
      expect(state.studyReminders).toBe(true);
      expect(state.achievementNotifications).toBe(true);
    });

    it('should call applyTheme after reset', async () => {
      const { applyTheme } = await import('../utils/themeUtils');

      useThemeStore.getState().resetToDefaults();
      vi.runAllTimers();

      expect(applyTheme).toHaveBeenCalled();
    });
  });
});
