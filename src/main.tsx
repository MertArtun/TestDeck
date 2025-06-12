import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Import the CSS file

// Theme system initialization
import { useThemeStore } from './store/themeStore';
import { applyTheme } from './utils/themeUtils';

console.log('🚀 TestDeck başlatılıyor...');

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element bulunamadı!");
}

// Initialize theme on app start
const initTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme-settings');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state) {
        console.log('🎨 Saved theme found:', parsed.state);
        applyTheme({
          mode: parsed.state.mode || 'auto',
          colorScheme: parsed.state.colorScheme || 'blue',
          fontSize: parsed.state.fontSize || 'medium',
        });
        // Update store without causing re-render
        useThemeStore.setState(parsed.state);
      }
    } else {
      console.log('🎨 No saved theme, applying default.');
      applyTheme({ mode: 'auto', colorScheme: 'blue', fontSize: 'medium' });
    }
  } catch (error) {
    console.error("Failed to initialize theme:", error);
    // Fallback to default theme
    applyTheme({ mode: 'auto', colorScheme: 'blue', fontSize: 'medium' });
  }
};

initTheme();

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 