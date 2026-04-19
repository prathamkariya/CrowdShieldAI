"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const CORRIDORS = ["Ambaji", "Dwarka", "Somnath", "Pavagadh"] as const
type Corridor = typeof CORRIDORS[number]

interface NavbarProps {
  activeCorridor: Corridor
  replayMode: boolean
  onReplayToggle: () => void
  onEventLogToggle?: () => void
  onThemeToggle?: () => void
  themeMode?: "day" | "night"
  onLogout: () => void
  pilgrimCount: number
}

function BrandLogo() {
  return (
    <img src="/logo.png" alt="CrowdShield AI Logo" className="w-16 h-16 object-contain scale-110" />
  )
}

export default function Navbar({ 
  activeCorridor, 
  replayMode, 
  onReplayToggle, 
  onEventLogToggle, 
  onThemeToggle, 
  themeMode = "day", 
  onLogout,
  pilgrimCount
}: NavbarProps) {
  const { t } = useLanguage()
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toTimeString().slice(0, 8))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Main navbar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(10,14,26,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 md:gap-3 flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BrandLogo />
          <div className="hidden sm:block">
            <span className="text-white font-bold text-base md:text-lg tracking-tight leading-none block">
              {t("app_name")}
            </span>
            <span className="text-[9px] md:text-[10px] text-[#7A8BAD] tracking-widest uppercase leading-none">
              {activeCorridor} {t("nav_control_center")}
            </span>
          </div>
        </motion.div>

        {/* Right controls */}
        <motion.div
          className="flex items-center gap-2 md:gap-4 flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Clock - Hidden on very small screens or abbreviated */}
          <div className="text-right hidden xs:block">
            <div className="text-white font-mono text-xs md:text-sm font-semibold tracking-widest">
              {time}
            </div>
            <div className="text-[8px] md:text-[10px] text-[#7A8BAD] text-right uppercase tracking-[0.2em]">{t("hero_uptime")}</div>
          </div>

          {/* Replay Mode */}
          <motion.button
            onClick={onReplayToggle}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-2 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold tracking-wider uppercase transition-all duration-300"
            style={
              replayMode
                ? { background: "#F59E0B", color: "#ffffff", border: "1px solid #F59E0B" }
                : { background: "transparent", color: "#F59E0B", border: "1px solid #F59E0B" }
            }
          >
            <span className="md:inline">{replayMode ? "⏮" : "⏮"}</span>
            <span className="hidden md:inline ml-1">{t("nav_replay")} {replayMode ? "ON" : "OFF"}</span>
          </motion.button>

          {/* Event Log button */}
          {onEventLogToggle && (
            <motion.button
              onClick={onEventLogToggle}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-2 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold tracking-wider uppercase transition-all duration-300 bg-transparent text-violet-400 border border-violet-400/35 hover:bg-violet-400/10"
            >
              📋<span className="hidden md:inline ml-1">{t("nav_eventlog")}</span>
            </motion.button>
          )}

          {/* Logout button */}
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-2 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold tracking-wider uppercase transition-all duration-300 bg-red-500/10 text-red-500 border border-red-500/35 hover:bg-red-500/20"
          >
            🚪<span className="hidden md:inline ml-1">{t("nav_logout")}</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Status strip */}
      <motion.div
        className="flex items-center gap-6 px-6 py-1.5 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span className="flex items-center gap-2 font-semibold text-[#00C48C]">
          <span className="live-dot inline-block w-2 h-2 rounded-full bg-[#00C48C]" />
          {t("hero_live")}
        </span>
        <span className="text-[#7A8BAD]">|</span>
        <span className="text-[#E8EEFF]">
          {t("nav_pilgrims")}:{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={pilgrimCount}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="font-bold text-[#FF9500] tabular-nums"
            >
              {pilgrimCount.toLocaleString("en-IN")}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-[#7A8BAD]">|</span>
        <span className="text-[#7A8BAD]">
          {t("archive_corridor")}: <span className="text-[#E8EEFF] font-medium">{activeCorridor}</span>
        </span>
      </motion.div>
    </header>
  )
}
