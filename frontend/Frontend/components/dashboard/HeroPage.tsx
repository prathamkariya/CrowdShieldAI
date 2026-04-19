"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import ParticleField from "./ParticleField"

interface HeroPageProps {
  onEnter: () => void
}

export default function HeroPage({ onEnter }: HeroPageProps) {
  const { t } = useLanguage()
  const [isExiting, setIsExiting] = useState(false)

  const handleEnter = () => {
    setIsExiting(true)
    setTimeout(() => {
      onEnter()
    }, 600)
  }

  const counterVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.8 + custom * 0.2,
      },
    }),
  }

  return (
    <motion.div
      className="absolute inset-0 bg-[#0A0E1A] overflow-hidden"
      style={{ 
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        willChange: "opacity, transform",
      }}
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0, scale: 1.15 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Particle field background */}
      <ParticleField />

      {/* Scan line overlay - CSS only, no animation */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)",
      }} />

      {/* Pulsing heartbeat circle gradient */}
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255,59,59,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Top left branding */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo.png" alt="CrowdShield Logo" className="w-12 h-12 object-contain scale-125" />
          <span className="text-white font-bold text-xl tracking-wide">{t("app_name")}</span>
        </div>
        <p className="text-[10px] font-mono text-[#7A8BAD] tracking-widest">
          {t("version")} · {t("classified")}
        </p>
      </motion.div>

      {/* Main content center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        {/* Badge */}
        <motion.div
          className="mb-8 px-4 py-2 rounded-full bg-[#FF3B3B]/20 border border-[#FF3B3B]/40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="text-[#FF3B3B] text-xs font-bold tracking-widest">
            ● {t("hero_live")} {t("hero_op_mode")}
          </span>
        </motion.div>

        {/* Main heading */}
        <div className="text-center mb-6 flex flex-col gap-1">
          {[t("hero_title_1"), t("hero_title_2"), t("hero_title_3")].map((word, idx) => (
            <motion.h1
              key={word}
              className="text-7xl font-bold text-white uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + idx * 0.15 }}
            >
              {word}
            </motion.h1>
          ))}
        </div>

        {/* Sub-heading */}
        <motion.p
          className="text-center text-[#B0B8C8] max-w-2xl mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          style={{ fontSize: "18px" }}
        >
          {t("hero_desc")}
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="flex items-center justify-center gap-12 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          {[
            { value: "1.2 Cr+", label: t("hero_pilgrims") },
            { value: "4", label: t("hero_corridors") },
            { value: "59m", label: t("hero_uptime") },
          ].map((stat, idx) => (
            <motion.div key={stat.label} className="text-center" custom={idx} variants={counterVariants}>
              <motion.div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </motion.div>
              <p className="text-xs text-[#7A8BAD] font-mono">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={handleEnter}
          className="mb-6 px-10 py-4 rounded-full bg-emerald-500 text-white font-bold text-lg tracking-widest cursor-pointer pointer-events-auto shadow-[0_4px_30px_rgba(16,185,129,0.4)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          whileHover={{ scale: 1.04, background: "#10B981" }}
          whileTap={{ scale: 0.98 }}
        >
          {t("hero_enter")} →
        </motion.button>
 
        <motion.p
          className="text-[10px] font-mono text-[#7A8BAD] text-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          {t("authorized_personnel")}
        </motion.p>
      </div>

      {/* Right side floating card - Pressure gauge preview */}
      <motion.div
        className="absolute right-12 top-1/2 z-10"
        initial={{ opacity: 0, x: 50, y: "-50%" }}
        animate={{ opacity: 1, x: 0, y: "-50%" }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ rotate: "-3deg", willChange: "transform" }}
      >
        <div
          className="p-6 rounded-2xl backdrop-blur-md border"
          style={{
            background: "rgba(255,59,59,0.08)",
            borderColor: "rgba(255,59,59,0.4)",
            boxShadow: "0 0 40px rgba(255,59,59,0.2), inset 0 0 40px rgba(255,59,59,0.05)",
          }}
        >
          {/* Mini gauge */}
          <svg width="120" height="120" viewBox="0 0 120 120" className="mb-4">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#FF3B3B"
              strokeWidth="8"
              strokeDasharray="157 314"
              strokeLinecap="round"
            />
            <text x="60" y="70" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
              74
            </text>
          </svg>
          <p className="text-[#FF3B3B] font-bold text-sm text-nowrap">{t("hero_crush_risk")} 9m 32s</p>
        </div>
      </motion.div>

      {/* Left side floating card - Agency status */}
      <motion.div
        className="absolute left-12 top-1/2 z-10"
        initial={{ opacity: 0, x: -50, y: "-50%" }}
        animate={{ opacity: 1, x: 0, y: "-50%" }}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{ rotate: "2deg", willChange: "transform" }}
      >
        <div
          className="p-6 rounded-2xl backdrop-blur-md border space-y-3"
          style={{
            background: "rgba(0,196,140,0.08)",
            borderColor: "rgba(0,196,140,0.3)",
            boxShadow: "0 0 30px rgba(0,196,140,0.1)",
          }}
        >
          {["agency_police", "agency_temple", "agency_transport"].map((agency) => (
            <div key={agency} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00C48C] animate-pulse" />
              <span className="text-[#00C48C] text-xs font-mono">{t(agency as any)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom marquee strip - CSS animation for better performance */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 py-3 bg-[#0A0E1A] border-t border-[#FF3B3B]/20 z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div 
          className="flex items-center gap-8 whitespace-nowrap font-mono text-xs animate-marquee"
          style={{ width: "fit-content" }}
        >
          <span className="text-[#00C48C]">AMBAJI · {t("status_stable")}</span>
          <span className="text-[#7A8BAD]">◆</span>
          <span className="text-[#FF9500]">DWARKA · 2 {t("status_inbound")}</span>
          <span className="text-[#7A8BAD]">◆</span>
          <span className="text-[#00C48C]">SOMNATH · {t("status_monitoring")}</span>
          <span className="text-[#7A8BAD]">◆</span>
          <span className="text-[#FF3B3B]">PAVAGADH · {t("status_elevated")}</span>
          <span className="text-[#7A8BAD]">◆</span>
          <span className="text-[#00C48C]">AMBAJI · {t("status_stable")}</span>
          <span className="text-[#7A8BAD]">◆</span>
          <span className="text-[#FF9500]">DWARKA · 2 {t("status_inbound")}</span>
          <span className="text-[#7A8BAD]">◆</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
