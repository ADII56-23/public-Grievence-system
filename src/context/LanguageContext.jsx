import React, { createContext, useContext, useState, useEffect } from "react";
import {
  translations,
  SUPPORTED_LANGUAGES,
  getTranslation
} from "../translations";

const LanguageContext = createContext();

// Helper to trigger Google Website Translator across the whole website
export function applyGoogleTranslate(targetCode) {
  try {
    const code = targetCode || "en";
    const googleCookie = code === "en" ? "/en/en" : `/en/${code}`;
    const hostname = window.location.hostname;

    // Set cookies so Google Translate remembers and uses the selected language
    document.cookie = `googtrans=${googleCookie}; path=/;`;
    if (hostname) {
      document.cookie = `googtrans=${googleCookie}; path=/; domain=${hostname};`;
      document.cookie = `googtrans=${googleCookie}; path=/; domain=.${hostname};`;
    }

    if (code === "en") {
      // Also clear cookie when reverting to original English
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      if (hostname) {
        document.cookie = `googtrans=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        document.cookie = `googtrans=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      }
    }

    const triggerSelect = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        if (select.value !== code) {
          select.value = code;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return true;
      }
      return false;
    };

    if (!triggerSelect()) {
      // Retry in case Google script is still initializing in the background
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (triggerSelect() || attempts >= 20) {
          clearInterval(interval);
        }
      }, 250);
    }
  } catch (err) {
    console.warn("Google Translate sync notice:", err);
  }
}

export function LanguageProvider({ children }) {
  // Read initial language code from localStorage or default to "en"
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("civicflow_language");
      if (saved) {
        // Match either code or name
        const match = SUPPORTED_LANGUAGES.find(
          (l) => l.code.toLowerCase() === saved.toLowerCase() || l.name.toLowerCase() === saved.toLowerCase()
        );
        if (match) return match.code;
      }
    } catch {
      // Ignore localStorage read errors
    }
    return "en";
  });

  // Current language details object
  const currentLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Helper function to change language by code or name
  const setLanguage = (langCodeOrName) => {
    if (!langCodeOrName) return;
    const match = SUPPORTED_LANGUAGES.find(
      (l) =>
        l.code.toLowerCase() === langCodeOrName.toLowerCase() ||
        l.name.toLowerCase() === langCodeOrName.toLowerCase()
    );

    const targetCode = match ? match.code : "en";
    setLanguageState(targetCode);

    try {
      localStorage.setItem("civicflow_language", targetCode);
    } catch {
      // Ignore localStorage write errors
    }

    // Sync Google Translate API across the whole website
    applyGoogleTranslate(targetCode);

    // Update document HTML lang attribute
    try {
      document.documentElement.lang = targetCode;
      if (targetCode === "ur") {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }
    } catch {
      // Ignore DOM errors
    }
  };

  useEffect(() => {
    // If a non-English language was persisted, sync Google Translate
    if (language && language !== "en") {
      applyGoogleTranslate(language);
    }
  }, []);

  useEffect(() => {
    // Sync document element lang attribute on mount or change
    try {
      document.documentElement.lang = language;
      if (language === "ur") {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }
    } catch {
      // Ignore DOM errors
    }
  }, [language]);

  // Translation helper function
  const t = (key, fallback = "") => {
    return getTranslation(language, key, fallback);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguageObj,
        setLanguage,
        t,
        SUPPORTED_LANGUAGES,
        translations
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export default LanguageContext;
