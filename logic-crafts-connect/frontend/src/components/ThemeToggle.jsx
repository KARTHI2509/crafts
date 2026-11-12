import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
    >
      <span className="theme-toggle-icon">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      <span className="theme-toggle-track">
        <span className={`theme-toggle-thumb ${isDarkMode ? 'dark' : 'light'}`}></span>
      </span>
    </button>
  );
};

export default ThemeToggle;
