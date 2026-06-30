/* eslint-disable react-refresh/only-export-components */

import { createContext, useState } from "react";

// Create Language Context
export const LanguageContext = createContext();

/**
 * LanguageProvider Component
 *
 * Handles:
 * - Current selected language
 * - Switching between languages
 */
export function LanguageProvider({ children }) {
  // Default language is English
  const [language, setLanguage] = useState("en");

  // -----------------------------------
  // Toggle language
  // Current support:
  // en = English
  // te = Telugu
  // -----------------------------------
  const toggleLanguage = () => {
    setLanguage((prevLanguage) =>
      prevLanguage === "en" ? "te" : "en"
    );
  };

  // Context values
  const value = {
    language,
    setLanguage,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}