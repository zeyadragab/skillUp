import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { translations } from "../../i18n/translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem("lang") || "en");

  const setLang = useCallback((l) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key) => translations[lang]?.[key] ?? translations.en[key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, isRTL: lang === "ar" }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
