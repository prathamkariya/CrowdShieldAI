"use client"

import { motion } from "framer-motion"
import React, { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { io } from "socket.io-client"
import { BACKEND_URL } from "@/lib/config"

type Corridor = "Ambaji" | "Dwarka" | "Somnath" | "Pavagadh"

interface CorridorOverviewProps {
  onSelectCorridor: (c: Corridor) => void
  onBack: () => void
}

const CORRIDORS: Corridor[] = ["Ambaji", "Dwarka", "Somnath", "Pavagadh"]

interface CorridorLiveData {
  pressure: number
  pilgrims: number
}

const DEFAULT_DATA: Record<Corridor, CorridorLiveData> = {
  Ambaji: { pressure: 0, pilgrims: 0 },
  Dwarka: { pressure: 0, pilgrims: 0 },
  Somnath: { pressure: 0, pilgrims: 0 },
  Pavagadh: { pressure: 0, pilgrims: 0 },
}

function getStatusColor(pressure: number) {
  if (pressure > 70) return "#FF3B3B"
  if (pressure > 50) return "#FF9500"
  return "#00C48C"
}

function getStatusLabel(pressure: number) {
  if (pressure > 70) return "status_critical"
  if (pressure > 50) return "status_buildup"
  return "status_safe"
}

function CorridorQuadrant({ corridor, data, onSelect }: { corridor: Corridor; data: CorridorLiveData; onSelect: () => void }) {
  const { t } = useLanguage()
  const statusColor = getStatusColor(data.pressure)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className="relative p-6 rounded-xl border-2 cursor-pointer transition-all group"
      style={{
        borderColor: statusColor,
        background: `rgba(${statusColor === "#FF3B3B" ? "255,59,59" : statusColor === "#FF9500" ? "255,149,0" : "0,196,140"},0.08)`,
        boxShadow: `0 0 20px ${statusColor}33, inset 0 1px 0 ${statusColor}20`,
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-1">{corridor}</h3>
        <p className="text-xs text-white/60">{data.pilgrims.toLocaleString()} {t("pilgrims_label")}</p>
      </div>

      {/* Mini gauge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">{t("pressure_monitoring")}</span>
          <span className="text-sm font-bold" style={{ color: statusColor }}>
            {data.pressure}/100
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.pressure}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full"
            style={{ background: statusColor }}
          />
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
        style={{ background: statusColor + "40", color: statusColor }}
      >
        ● {t(getStatusLabel(data.pressure) as any)}
      </motion.div>

      {/* Hover indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-colors"
        style={{ pointerEvents: "none" }}
      />
    </motion.div>
  )
}

export default function MultiCorridorOverview({ onSelectCorridor, onBack }: CorridorOverviewProps) {
  const { t } = useLanguage()
  const [liveData, setLiveData] = useState<Record<Corridor, CorridorLiveData>>(DEFAULT_DATA)

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    })

    socket.on("corridorUpdate", (update: any) => {
      if (update.name && CORRIDORS.includes(update.name)) {
        setLiveData(prev => ({
          ...prev,
          [update.name]: {
            pressure: update.pressureIndex ?? prev[update.name as Corridor].pressure,
            pilgrims: update.totalPilgrims ?? prev[update.name as Corridor].pilgrims,
          }
        }))
      }
    })

    return () => { socket.disconnect() }
  }, [])

  // Compute summary stats from live data
  const totalPilgrims = CORRIDORS.reduce((sum, c) => sum + liveData[c].pilgrims, 0)
  const criticalCount = CORRIDORS.filter(c => liveData[c].pressure > 70).length
  const warningCount = CORRIDORS.filter(c => liveData[c].pressure > 50 && liveData[c].pressure <= 70).length
  const safeCount = CORRIDORS.filter(c => liveData[c].pressure <= 50).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0A0E1A] p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 flex items-center gap-4"
        >
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t("back_to_dashboard")}
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-white">{t("multi_corridor_title")}</h1>
            <p className="text-white/60 text-sm">{t("multi_corridor_sub")}</p>
          </div>
        </motion.div>

        {/* 2x2 Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-6"
        >
          {CORRIDORS.map((corridor) => (
            <CorridorQuadrant
              key={corridor}
              corridor={corridor}
              data={liveData[corridor]}
              onSelect={() => onSelectCorridor(corridor)}
            />
          ))}
        </motion.div>

        {/* Summary stats at bottom — now live */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 rounded-xl border border-white/10 bg-white/5"
        >
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-1">
                {totalPilgrims >= 1000 ? `${(totalPilgrims / 1000).toFixed(1)}K` : totalPilgrims}
              </p>
              <p className="text-xs text-white/60 uppercase">{t("total_pilgrims_label")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500 mb-1">{criticalCount}</p>
              <p className="text-xs text-white/60 uppercase">{t("critical_zone")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500 mb-1">{warningCount}</p>
              <p className="text-xs text-white/60 uppercase">{t("warning_zone")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-500 mb-1">{safeCount}</p>
              <p className="text-xs text-white/60 uppercase">{t("safe_zones")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

