/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from "react";

export const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "te" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
