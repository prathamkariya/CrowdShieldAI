"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

const STATUS_MESSAGES = [
  "loading_init",
  "loading_boot",
  "loading_sync",
  "loading_ready",
  "loading_enter",
]

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useLanguage()
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Rotate status messages every 600ms
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length)
    }, 600)
    return () => clearInterval(messageInterval)
  }, [])

  // Animate progress bar over 3 seconds
  useEffect(() => {
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, (elapsed / 3000) * 100)
      setProgress(newProgress)
    }, 50)
    return () => clearInterval(progressInterval)
  }, [])

  // Complete loading after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onComplete])

  // Calculate color for progress bar (red -> amber -> green)
  const getProgressColor = () => {
    if (progress < 33) {
      const ratio = progress / 33
      const r = Math.round(255)
      const g = Math.round(59 + (155 * ratio))
      const b = Math.round(59)
      return `rgb(${r}, ${g}, ${b})`
    } else if (progress < 66) {
      const ratio = (progress - 33) / 33
      const r = Math.round(255)
      const g = Math.round(214 - (14 * ratio))
      const b = Math.round(0)
      return `rgb(${r}, ${g}, ${b})`
    } else {
      const ratio = (progress - 66) / 34
      const r = Math.round(255 - (255 * ratio))
      const g = Math.round(200 + (56 * ratio))
      const b = Math.round(0 + (140 * ratio))
      return `rgb(${r}, ${g}, ${b})`
    }
  }

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0A0E1A" }}
      exit={{ y: "-100vh" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" style={{ opacity: 0.08 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <motion.rect
            width="100%"
            height="100%"
            fill="url(#grid)"
            animate={{ opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Shield SVG with stroke animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
            <defs>
              <filter id="shield-glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M 60 10 C 60 10, 20 30, 20 70 C 20 110, 60 130, 60 130 C 60 130, 100 110, 100 70 C 100 30, 60 10, 60 10"
              stroke="url(#shield-gradient)"
              strokeWidth="2.5"
              fill="none"
              filter="url(#shield-glow)"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, stroke: "rgba(255, 59, 59, 1)" }}
              animate={{
                pathLength: 1,
                stroke: ["rgba(255, 59, 59, 1)", "rgba(0, 196, 140, 1)"],
              }}
              transition={{
                pathLength: { duration: 1.5, ease: "easeInOut" },
                stroke: { duration: 1.5, times: [0, 1], ease: "easeInOut" },
              }}
            />
            <defs>
              <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <motion.stop
                  offset="0%"
                  stopColor="rgba(255, 59, 59, 0.6)"
                  animate={{
                    stopColor: ["rgba(255, 59, 59, 0.6)", "rgba(0, 196, 140, 0.6)"],
                  }}
                  transition={{ duration: 1.5 }}
                />
                <motion.stop
                  offset="100%"
                  stopColor="rgba(255, 149, 0, 0.3)"
                  animate={{
                    stopColor: ["rgba(255, 149, 0, 0.3)", "rgba(0, 196, 140, 0.3)"],
                  }}
                  transition={{ duration: 1.5 }}
                />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <div className="overflow-hidden">
          <motion.div
            className="text-5xl font-black tracking-tight"
            style={{ color: "white" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {t("app_name").split("").map((letter, idx) => {
              return (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + idx * 0.06,
                    ease: "easeOut",
                  }}
                  className="inline-block"
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              )
            })}
          </motion.div>
        </div>
 
        {/* Subtitle */}
        <motion.p
          className="text-sm tracking-widest uppercase"
          style={{ color: "rgba(122, 139, 173, 0.9)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {t("tagline")}
        </motion.p>
 
        {/* Progress bar */}
        <motion.div
          className="w-80 h-1.5 rounded-full overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: getProgressColor(),
              boxShadow: `0 0 20px ${getProgressColor()}`,
            }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
 
        {/* Status messages */}
        <motion.div
          className="h-6 text-xs tracking-wider"
          style={{ color: "rgba(122, 139, 173, 0.8)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.div
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {t(STATUS_MESSAGES[currentMessageIndex] as any)}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom footer */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
        <p className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(122, 139, 173, 0.6)" }}>
          Government of Gujarat · Smart City Mission
        </p>

        {/* Heartbeat dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((idx) => (
            <motion.div
              key={idx}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "rgba(0, 196, 140, 0.8)" }}
              animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                delay: idx * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
