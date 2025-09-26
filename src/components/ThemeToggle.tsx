'use client';

import { useEffect, useState } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Track if theme is loaded
  const { saveSetting, getSetting, isLoading } = useIndexedDB();

  useEffect(() => {
    const loadTheme = async () => {
      if (isLoading) return;
      
      try {
        const savedTheme = await getSetting('theme', 'light');
        const isDarkMode = savedTheme === 'dark';
        
        // Apply theme immediately to prevent flash
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        setIsDark(isDarkMode);
        setIsLoaded(true); // Mark as loaded
        
        console.log('🎨 Theme loaded:', savedTheme);
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Fallback to light theme
        document.documentElement.classList.remove('dark');
        setIsDark(false);
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, [isLoading, getSetting]);

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    const newIsDark = !isDark;
    
    // Apply theme change immediately for instant feedback
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsDark(newIsDark);
    
    try {
      await saveSetting('theme', newTheme);
      console.log('🎨 Theme saved:', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
      // Revert on error
      if (!newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setIsDark(!newIsDark);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      disabled={!isLoaded} // Disable until theme is loaded
      className={`flex items-center gap-2 px-4 py-2 theme-button theme-button-text rounded-lg hover:opacity-80 transition-colors duration-200 ${
        !isLoaded ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {!isLoaded ? (
        <>
          <div className="w-5 h-5 border-2 theme-border border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </>
      ) : isDark ? (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          Light
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          Dark
        </>
      )}
    </button>
  );
};
