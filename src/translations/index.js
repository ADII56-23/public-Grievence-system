import en from "./en";
import or from "./or";
import hi from "./hi";
import bn from "./bn";
import te from "./te";
import mr from "./mr";
import ta from "./ta";
import kn from "./kn";
import ml from "./ml";
import gu from "./gu";
import pa from "./pa";
import ur from "./ur";

export const translations = {
  en,
  or,
  hi,
  bn,
  te,
  mr,
  ta,
  kn,
  ml,
  gu,
  pa,
  ur
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", nativeName: "اردو" }
];

/**
 * Resolve a dot-notated key (e.g. 'nav.brandTitle' or 'home.heroTitle')
 * from the dictionary for the specified language.
 * Falls back to English if missing, then to fallback text, then to key itself.
 */
export function getTranslation(langCode, key, fallback = "") {
  const activeLang = translations[langCode] || translations.en;
  const englishLang = translations.en;

  const getNested = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== "object") {
        return undefined;
      }
      current = current[part];
    }
    return current;
  };

  const val = getNested(activeLang, key);
  if (val !== undefined && val !== null) return val;

  const enVal = getNested(englishLang, key);
  if (enVal !== undefined && enVal !== null) return enVal;

  return fallback || key;
}
