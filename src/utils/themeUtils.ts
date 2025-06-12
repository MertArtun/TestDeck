// Theme Utilities - Çembersel import problemini önlemek için ayrı dosya

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'pink';
export type FontSize = 'small' | 'medium' | 'large';

// Theme color schemes
export const getColorSchemeVariables = (scheme: ColorScheme) => {
  const schemes = {
    blue: {
      '--color-primary-50': '#eff6ff',
      '--color-primary-100': '#dbeafe',
      '--color-primary-200': '#bfdbfe',
      '--color-primary-300': '#93c5fd',
      '--color-primary-400': '#60a5fa',
      '--color-primary-500': '#3b82f6',
      '--color-primary-600': '#2563eb',
      '--color-primary-700': '#1d4ed8',
      '--color-primary-800': '#1e40af',
      '--color-primary-900': '#1e3a8a',
    },
    purple: {
      '--color-primary-50': '#faf5ff',
      '--color-primary-100': '#f3e8ff',
      '--color-primary-200': '#e9d5ff',
      '--color-primary-300': '#d8b4fe',
      '--color-primary-400': '#c084fc',
      '--color-primary-500': '#a855f7',
      '--color-primary-600': '#9333ea',
      '--color-primary-700': '#7c3aed',
      '--color-primary-800': '#6b21a8',
      '--color-primary-900': '#581c87',
    },
    green: {
      '--color-primary-50': '#ecfdf5',
      '--color-primary-100': '#d1fae5',
      '--color-primary-200': '#a7f3d0',
      '--color-primary-300': '#6ee7b7',
      '--color-primary-400': '#34d399',
      '--color-primary-500': '#10b981',
      '--color-primary-600': '#059669',
      '--color-primary-700': '#047857',
      '--color-primary-800': '#065f46',
      '--color-primary-900': '#064e3b',
    },
    orange: {
      '--color-primary-50': '#fff7ed',
      '--color-primary-100': '#ffedd5',
      '--color-primary-200': '#fed7aa',
      '--color-primary-300': '#fdba74',
      '--color-primary-400': '#fb923c',
      '--color-primary-500': '#f97316',
      '--color-primary-600': '#ea580c',
      '--color-primary-700': '#c2410c',
      '--color-primary-800': '#9a3412',
      '--color-primary-900': '#7c2d12',
    },
    pink: {
      '--color-primary-50': '#fdf2f8',
      '--color-primary-100': '#fce7f3',
      '--color-primary-200': '#fbcfe8',
      '--color-primary-300': '#f9a8d4',
      '--color-primary-400': '#f472b6',
      '--color-primary-500': '#ec4899',
      '--color-primary-600': '#db2777',
      '--color-primary-700': '#be185d',
      '--color-primary-800': '#9d174d',
      '--color-primary-900': '#831843',
    },
  };
  
  return schemes[scheme];
};

// Font size variables
export const getFontSizeVariables = (size: FontSize) => {
  const sizes = {
    small: {
      '--font-size-xs': '0.625rem',
      '--font-size-sm': '0.75rem',
      '--font-size-base': '0.825rem',
      '--font-size-lg': '0.95rem',
      '--font-size-xl': '1.1rem',
      '--font-size-2xl': '1.35rem',
      '--font-size-3xl': '1.65rem',
    },
    medium: {
      '--font-size-xs': '0.75rem',
      '--font-size-sm': '0.875rem',
      '--font-size-base': '1rem',
      '--font-size-lg': '1.125rem',
      '--font-size-xl': '1.25rem',
      '--font-size-2xl': '1.5rem',
      '--font-size-3xl': '1.875rem',
    },
    large: {
      '--font-size-xs': '0.875rem',
      '--font-size-sm': '1rem',
      '--font-size-base': '1.125rem',
      '--font-size-lg': '1.25rem',
      '--font-size-xl': '1.375rem',
      '--font-size-2xl': '1.625rem',
      '--font-size-3xl': '2rem',
    },
  };
  
  return sizes[size];
};

// System theme detection listener
let systemThemeListener: ((e: MediaQueryListEvent) => void) | null = null;

// Apply theme to document
export const applyTheme = (settings: { mode: ThemeMode; colorScheme: ColorScheme; fontSize: FontSize }) => {
  console.log('🎨 Applying theme:', settings);
  
  try {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply color scheme variables
    const colorVars = getColorSchemeVariables(settings.colorScheme);
    Object.entries(colorVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Apply font size variables
    const fontVars = getFontSizeVariables(settings.fontSize);
    Object.entries(fontVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Remove previous system theme listener
    if (systemThemeListener) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.removeEventListener('change', systemThemeListener);
      systemThemeListener = null;
    }
    
    // Apply theme mode to both html and body
    if (settings.mode === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      console.log('🌙 Dark mode applied');
    } else if (settings.mode === 'light') {
      root.classList.remove('dark');
      body.classList.remove('dark');
      console.log('☀️ Light mode applied');
    } else {
      // Auto mode - use system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark = mediaQuery.matches;
      
      if (isDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        console.log('🌙 Auto mode: Dark applied');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        console.log('☀️ Auto mode: Light applied');
      }
      
      // Listen for system theme changes (only for auto mode)
      systemThemeListener = (e: MediaQueryListEvent) => {
        console.log('🔄 System theme changed:', e.matches ? 'dark' : 'light');
        
        // Re-get current settings to ensure we're still in auto mode
        const currentThemeData = localStorage.getItem('theme-settings');
        if (currentThemeData) {
          try {
            const parsed = JSON.parse(currentThemeData);
            if (parsed.state && parsed.state.mode === 'auto') {
              if (e.matches) {
                root.classList.add('dark');
                body.classList.add('dark');
                console.log('🌙 System changed to dark (auto mode)');
              } else {
                root.classList.remove('dark');
                body.classList.remove('dark');
                console.log('☀️ System changed to light (auto mode)');
              }
            }
          } catch (error) {
            console.error('Error parsing theme settings:', error);
          }
        }
      };
      
      mediaQuery.addEventListener('change', systemThemeListener);
    }
    
    console.log('✅ Theme applied successfully');
  } catch (error) {
    console.error('❌ Error applying theme:', error);
  }
}; 