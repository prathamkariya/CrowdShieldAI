"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Language, translations, TranslationKey } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("crowdshield_lang", lang)
    }
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] ?? translations.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
