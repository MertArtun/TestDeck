// Theme Store - Tema ve Kullanıcı Ayarları Yönetimi
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTheme, type ThemeMode, type ColorScheme, type FontSize } from '../utils/themeUtils';

export type Language = 'tr' | 'en';

export interface ThemeState {
  // Theme settings
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  
  // App settings
  language: Language;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoSave: boolean;
  
  // Study settings
  questionsPerSession: number;
  timePerQuestion: number; // seconds, 0 for no limit
  showHints: boolean;
  showProgress: boolean;
  
  // Notification settings
  studyReminders: boolean;
  achievementNotifications: boolean;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setFontSize: (size: FontSize) => void;
  setLanguage: (language: Language) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setQuestionsPerSession: (count: number) => void;
  setTimePerQuestion: (seconds: number) => void;
  setShowHints: (enabled: boolean) => void;
  setShowProgress: (enabled: boolean) => void;
  setStudyReminders: (enabled: boolean) => void;
  setAchievementNotifications: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  mode: 'auto' as ThemeMode,
  colorScheme: 'blue' as ColorScheme,
  fontSize: 'medium' as FontSize,
  language: 'tr' as Language,
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

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      setThemeMode: (mode) => {
        console.log('🎯 Setting theme mode:', mode);
        set({ mode });
        // Apply theme immediately
        const state = get();
        setTimeout(() => {
          applyTheme({ mode, colorScheme: state.colorScheme, fontSize: state.fontSize });
        }, 0);
      },
      setColorScheme: (colorScheme) => {
        console.log('🎨 Setting color scheme:', colorScheme);
        set({ colorScheme });
        // Apply theme immediately
        const state = get();
        setTimeout(() => {
          applyTheme({ mode: state.mode, colorScheme, fontSize: state.fontSize });
        }, 0);
      },
      setFontSize: (fontSize) => {
        console.log('📝 Setting font size:', fontSize);
        set({ fontSize });
        // Apply theme immediately
        const state = get();
        setTimeout(() => {
          applyTheme({ mode: state.mode, colorScheme: state.colorScheme, fontSize });
        }, 0);
      },
      setLanguage: (language) => set({ language }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setQuestionsPerSession: (questionsPerSession) => set({ questionsPerSession }),
      setTimePerQuestion: (timePerQuestion) => set({ timePerQuestion }),
      setShowHints: (showHints) => set({ showHints }),
      setShowProgress: (showProgress) => set({ showProgress }),
      setStudyReminders: (studyReminders) => set({ studyReminders }),
      setAchievementNotifications: (achievementNotifications) => set({ achievementNotifications }),
      resetToDefaults: () => {
        set(defaultSettings);
        // Apply default theme immediately
        setTimeout(() => {
          applyTheme({ 
            mode: defaultSettings.mode, 
            colorScheme: defaultSettings.colorScheme, 
            fontSize: defaultSettings.fontSize 
          });
        }, 0);
      },
    }),
    {
      name: 'theme-settings',
      version: 1,
    }
  )
);

// Export theme utilities from utils file
export { getColorSchemeVariables, getFontSizeVariables } from '../utils/themeUtils'; 