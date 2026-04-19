"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Language } from "@/lib/translations"
import { useLanguage } from "@/contexts/LanguageContext"

const LANGUAGES: { code: Language; native: string; english: string; flag: string; script: string }[] = [
  {
    code: "en",
    native: "English",
    english: "English",
    flag: "🇬🇧",
    script: "The quick safety shield protects every pilgrim",
  },
  {
    code: "hi",
    native: "हिंदी",
    english: "Hindi",
    flag: "🇮🇳",
    script: "हर तीर्थयात्री की सुरक्षा हमारी जिम्मेदारी",
  },
  {
    code: "gu",
    native: "ગુજરાતી",
    english: "Gujarati",
    flag: "🇮🇳",
    script: "દરેક યાત્રાળુની સુરક્ષા આપણી જવાબદારી",
  },
]

const TITLES: Record<Language, { select: string; sub: string; btn: string }> = {
  en: { select: "Choose Your Language", sub: "Select the language to use CrowdShield AI in", btn: "Continue" },
  hi: { select: "अपनी भाषा चुनें", sub: "CrowdShield AI उपयोग के लिए भाषा चुनें", btn: "जारी रखें" },
  gu: { select: "તમારી ભાષા પસંદ કરો", sub: "CrowdShield AI ઉપયોગ માટે ભાષા પસંદ કરો", btn: "આગળ વધો" },
}

interface LanguageSelectorProps {
  onComplete: () => void
}

export default function LanguageSelector({ onComplete }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage()
  const [selected, setSelected] = useState<Language>(language)
  const [hovering, setHovering] = useState<Language | null>(null)

  const displayLang = hovering || selected
  const title = TITLES[displayLang]

  const handleConfirm = () => {
    setLanguage(selected)
    onComplete()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "#060A14" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.12) 0%, transparent 65%)",
        }}
      />

      {/* Animated grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Logo */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <img src="/logo.png" alt="CrowdShield AI" className="w-full h-full object-contain scale-125" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            CrowdShield <span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-[10px] text-[#7A8BAD] tracking-[0.3em] font-mono uppercase mt-1">
            {t("app_tagline")}
          </p>
        </motion.div>

        {/* Title — animated based on hover/selected */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={displayLang + "_title"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {title.select}
            </motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={displayLang + "_sub"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-[#7A8BAD]"
            >
              {title.sub}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Language Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {LANGUAGES.map((lang, i) => {
            const isSelected = selected === lang.code
            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => setSelected(lang.code)}
                onMouseEnter={() => setHovering(lang.code)}
                onMouseLeave={() => setHovering(null)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer"
                style={{
                  background: isSelected
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(255,255,255,0.04)",
                  border: isSelected
                    ? "2px solid rgba(16, 185, 129, 0.6)"
                    : "2px solid rgba(255,255,255,0.08)",
                  boxShadow: isSelected
                    ? "0 0 30px rgba(16,185,129,0.15), inset 0 1px 0 rgba(16,185,129,0.2)"
                    : "none",
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="lang-selection-dot"
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400"
                  />
                )}

                <div className="text-3xl mb-3">{lang.flag}</div>
                <div
                  className="text-xl font-bold mb-1"
                  style={{ color: isSelected ? "#10B981" : "#E8EEFF" }}
                >
                  {lang.native}
                </div>
                <div className="text-[10px] text-[#7A8BAD] mb-3">{lang.english}</div>
                <div
                  className="text-[9px] leading-relaxed"
                  style={{ color: isSelected ? "#6EE7B7" : "#4A5568" }}
                >
                  {lang.script}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleConfirm}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-12 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #059669, #10B981)",
              boxShadow: "0 4px 24px rgba(16,185,129,0.4)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={selected + "_btn"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {TITLES[selected].btn} →
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
