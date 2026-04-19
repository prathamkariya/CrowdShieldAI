"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { PressureGauge } from "./LeftColumn"
import CorridorHillMap from "./CorridorHillMap"
import LiveAlertFeed from "./LiveAlertFeed"
import { useLanguage } from "@/contexts/LanguageContext"
import { TranslationKey } from "@/lib/translations"

interface ReplayMarker {
  time: number
  labelKey: TranslationKey
  color: string
}

interface ReplayModeProps {
  isOpen: boolean
  onClose: () => void
  corridor: string
  replayData: any
}

const MARKERS: ReplayMarker[] = [
  { time: 0, labelKey: "marker_start", color: "#7A8BAD" },
  { time: 4 * 60, labelKey: "marker_rising", color: "#FF9500" },
  { time: 7 * 60, labelKey: "marker_surge", color: "#FF3B3B" },
  { time: 9 * 60, labelKey: "marker_alert", color: "#FF3B3B" },
  { time: 10.5 * 60, labelKey: "marker_police", color: "#4A90E2" },
  { time: 11 * 60, labelKey: "marker_darshan", color: "#FF6B35" },
  { time: 14 * 60, labelKey: "marker_vehicle", color: "#00C48C" },
  { time: 16 * 60, labelKey: "marker_resolved", color: "#00C48C" },
]

const TOTAL_DURATION = 20 * 60 // 20 minutes in seconds

export default function ReplayMode({ isOpen, onClose, corridor, replayData }: ReplayModeProps) {
  const { t } = useLanguage()
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    let interval: any
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false)
            return TOTAL_DURATION
          }
          return prev + speed
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, speed, isOpen])

  const progress = (currentTime / TOTAL_DURATION) * 100

  // Calculate simulated pressure index based on timeline marker simulation
  let simulatedPressure = 35
  if (currentTime > 240 && currentTime < 420) simulatedPressure = 35 + ((currentTime - 240) / 180) * 35 // Rising
  else if (currentTime >= 420 && currentTime < 840) simulatedPressure = 70 + ((currentTime - 420) / 420) * 20 // Surge/Crush
  else if (currentTime >= 840 && currentTime < 960) simulatedPressure = 90 - ((currentTime - 840) / 120) * 45 // Resolving
  else if (currentTime >= 960) simulatedPressure = 45 // Stable

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0A0E1A] overflow-hidden flex flex-col"
        >
          {/* Background Ambient Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.05),transparent)] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <span className="text-xl">⏪</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                  {t("replay_title")} <span className="text-orange-500 italic">{t("replay_analysis")}</span>
                </h2>
                <p className="text-xs text-[#7A8BAD] tracking-widest uppercase">
                  {t("historical_telemetry")}: {corridor} · 01 MAR 2024 · 18:45
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 transition-all"
            >
              {t("exit_replay")}
            </motion.button>
          </div>

          {/* Replay Panels */}
          <div className="flex-1 overflow-hidden px-8 py-8">
            <div className="grid gap-6 h-full" style={{ gridTemplateColumns: "32% 34% 32%" }}>
              {/* Left Column: Pressure */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-3xl p-6 flex flex-col border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                   <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black tracking-widest border border-orange-500/20">{t("replay_data_tag")}</span>
                </div>
                <h3 className="text-xs font-black tracking-widest uppercase text-[#7A8BAD] mb-8">{t("pressure_telemetry")}</h3>
                <div className="flex-1 flex items-center justify-center scale-110">
                   <PressureGauge pressureIndex={simulatedPressure} />
                </div>
              </motion.div>

              {/* Center Column: Terrain Map */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-3xl p-6 flex flex-col border border-white/5"
              >
                <h3 className="text-xs font-black tracking-widest uppercase text-[#7A8BAD] mb-6">{t("critical_chokepoints")}</h3>
                <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden">
                   <CorridorHillMap corridor={corridor} pressureIndex={simulatedPressure} />
                   <div className="absolute bottom-4 left-4 right-4 p-4 bg-orange-950/40 backdrop-blur-md rounded-xl border border-orange-500/20">
                      <p className="text-xs text-orange-200 font-bold italic">
                        {t("scenario_analysis_label")}: {simulatedPressure > 80 ? t("critical_crush_event") : t("normalizing_flow")}
                      </p>
                   </div>
                </div>
              </motion.div>

              {/* Right Column: Alerts */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-3xl p-6 flex flex-col border border-white/5"
              >
                <h3 className="text-xs font-black tracking-widest uppercase text-[#7A8BAD] mb-6">{t("historical_events")}</h3>
                <div className="flex-1 overflow-hidden">
                   <LiveAlertFeed activeCorridor={corridor} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Timeline Controller */}
          <div className="px-10 py-10 bg-black/60 border-t border-white/5 backdrop-blur-3xl shrink-0">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <motion.button
                    onClick={() => setIsPlaying(!isPlaying)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                       isPlaying ? "bg-orange-600" : "bg-orange-500"
                    }`}
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg className="w-8 h-8 translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </motion.button>

                  <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1.5 border border-white/10">
                    {[1, 2, 5, 10].map(s => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          speed === s ? "bg-orange-500 text-white shadow-lg" : "text-white/40 hover:text-white"
                        }`}
                      >
                        {s}X
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-black text-white tabular-nums tracking-tighter italic">
                    {Math.floor(currentTime / 60).toString().padStart(2, "0")}:
                    {(currentTime % 60).toString().padStart(2, "0")}
                  </div>
                  <p className="text-[10px] text-[#7A8BAD] tracking-widest uppercase">{t("elapsed_time")}</p>
                </div>
              </div>

              {/* Scrubber */}
              <div className="relative group px-1">
                {/* Scale Markers */}
                <div className="absolute -top-6 left-0 right-0 flex justify-between px-1">
                   {MARKERS.map((m, i) => (
                      <div 
                        key={i} 
                        className="flex flex-col items-center group/m cursor-pointer"
                        style={{ position: 'absolute', left: `${(m.time / TOTAL_DURATION) * 100}%`, transform: 'translateX(-50%)' }}
                        onClick={() => setCurrentTime(m.time)}
                      >
                         <div className="w-1 h-3 rounded-full mb-1 transition-all" style={{ background: m.color }} />
                         <span className="hidden group-hover/m:block absolute -top-8 bg-black/90 border border-white/10 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50 shadow-2xl" style={{ color: m.color }}>
                           {t(m.labelKey)}
                         </span>
                      </div>
                   ))}
                </div>

                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10">
                   <motion.div 
                     className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                     animate={{ width: `${progress}%` }}
                     transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                   />
                </div>

                <input
                  type="range"
                  min="0"
                  max={TOTAL_DURATION}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-10"
                />
              </div>
              
              <div className="flex justify-between mt-3 text-[10px] font-black tracking-widest text-[#7A8BAD] uppercase">
                 <span>T-00:00:00</span>
                 <span>{t("total_duration_label")}: 20 {t("unit_min")}</span>
                 <span>T-00:20:00</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
