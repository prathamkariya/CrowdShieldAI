"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"

interface LeaderboardEntry {
  agency: string
  medal: string
  avgResponseTime: number
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (displayValue === value) return

    const diff = value - displayValue
    const step = diff / 10
    let current = displayValue

    const timer = setInterval(() => {
      current += step
      if ((step > 0 && current >= value) || (step < 0 && current <= value)) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.round(current))
      }
    }, 50)

    return () => clearInterval(timer)
  }, [value, displayValue])

  return (
    <motion.span
      key={displayValue}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="font-bold font-mono"
    >
      {displayValue}s
    </motion.span>
  )
}

export default function AckLeaderboard() {
  const { t } = useLanguage()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { agency: "agency_police", medal: "🥇", avgResponseTime: 42 },
    { agency: "agency_temple", medal: "🥈", avgResponseTime: 61 },
    { agency: "agency_transport", medal: "🥉", avgResponseTime: 78 },
  ])

  // Simulate live updates
  useEffect(() => {
    const timer = setInterval(() => {
      setLeaderboard(prev =>
        prev.map(entry => ({
          ...entry,
          avgResponseTime: Math.max(10, entry.avgResponseTime + (Math.random() - 0.5) * 8),
        }))
      )
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  return (
    <motion.section
      className="glass-card rounded-2xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <h2 className="text-xs font-bold tracking-widest uppercase text-[#7A8BAD] mb-4">{t("leaderboard_title")}</h2>

      <div className="space-y-2">
        <AnimatePresence mode="wait">
          {leaderboard.map((entry, index) => {
            const colors = ["#4A9EFF", "#FF9500", "#00C48C"]
            const color = colors[index]

            return (
              <motion.div
                key={entry.agency}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}20`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{entry.medal}</span>
                  <span className="text-xs font-bold" style={{ color }}>
                    {t(entry.agency as any)}
                  </span>
                </div>

                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-xs"
                  style={{ color }}
                >
                  <AnimatePresence mode="wait">
                    <AnimatedNumber value={Math.round(entry.avgResponseTime)} />
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-2 rounded-lg text-[9px] text-[#7A8BAD] text-center"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {t("lower_better_desc")}
      </motion.div>
    </motion.section>
  )
}
