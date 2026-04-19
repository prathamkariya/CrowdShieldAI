"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { io } from "socket.io-client"
import { BACKEND_URL } from "@/lib/config"



interface EventLogEvent {
  timestamp: string
  corridor: string
  event: string
  pressureIndex: number
  severity: string
  type: string
}

interface EventLogArchiveProps {
  onBack: () => void
}

export default function EventLogArchive({ onBack }: EventLogArchiveProps) {
  const { t } = useLanguage()
  const [events, setEvents] = useState<EventLogEvent[]>([])
  const [corridor, setCorridor] = useState("all")
  const [severity, setSeverity] = useState("all")

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket"]
    })

    const addEvent = (data: any) => {
      setEvents(prev => [{
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        corridor: data.corridor || "Unknown",
        event: data.message || "System Event",
        pressureIndex: data.pressure || 0,
        severity: data.severity || "green",
        type: data.type || "status"
      }, ...prev].slice(0, 100))
    }

    socket.on("alertUpdate", addEvent)
    socket.on("sosTrigger", (sos: any) => {
      addEvent({ ...sos, severity: "red", type: "crush alert", message: `🚨 SOS: ${sos.message}` })
    })
    socket.on("corridorUpdate", (update: any) => {
      // Only log significant pressure changes
      if (update.pressureIndex > 80 || update.pressureIndex < 20) {
        addEvent({
          corridor: update.name,
          severity: update.pressureIndex > 80 ? "red" : "green",
          message: update.pressureIndex > 80 
            ? `Pressure elevated: ${update.pressureIndex}%`
            : `Pressure normalized: ${update.pressureIndex}%`,
          pressure: update.pressureIndex,
          type: "status"
        })
      }
    })

    return () => { socket.disconnect() }
  }, [])

  const filtered = events.filter(e => {
    if (corridor !== "all" && e.corridor !== corridor) return false
    if (severity !== "all" && e.severity !== severity) return false
    return true
  })

  const getSeverityColor = (sev: string) => {
    if (sev === "red") return "#EF4444"
    if (sev === "amber") return "#F59E0B"
    return "#22C55E"
  }

  const downloadCSV = () => {
    if (filtered.length === 0) return
    const headers = ["Timestamp", "Corridor", "Event", "Severity", "Type"]
    const rows = filtered.map(e => [
      e.timestamp,
      e.corridor,
      `"${e.event.replace(/"/g, '""')}"`,
      e.severity.toUpperCase(),
      e.type
    ])
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `crowdshield_events_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0A0E1A] p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex items-center gap-4"
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
            {t("archive_back")}
          </motion.button>

          <motion.button
            onClick={downloadCSV}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("archive_export")}
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("archive_title")}</h1>
            <p className="text-white/60 text-sm">{t("archive_sub")}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#00C48C]"
            />
            <span className="text-xs text-[#00C48C] font-mono">{events.length} {t("archive_count")}</span>
          </div>
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-4 p-4 rounded-lg border border-white/10 bg-white/5"
        >
          <div>
            <label className="block text-xs text-white/60 mb-1 uppercase">{t("archive_corridor")}</label>
            <select
              value={corridor}
              onChange={e => setCorridor(e.target.value)}
              className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
            >
              <option value="all">{t("archive_all_corridors")}</option>
              <option value="Ambaji">{t("corridor_ambaji")}</option>
              <option value="Dwarka">{t("corridor_dwarka")}</option>
              <option value="Somnath">{t("corridor_somnath")}</option>
              <option value="Pavagadh">{t("corridor_pavagadh")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1 uppercase">{t("archive_severity")}</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
            >
              <option value="all">{t("archive_all_levels")}</option>
              <option value="red">{t("status_critical")}</option>
              <option value="amber">{t("status_amber")}</option>
              <option value="green">{t("status_safe")}</option>
            </select>
          </div>
        </motion.div>

        {/* Table */}
        {filtered.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto rounded-lg border border-white/10 bg-white/5"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left text-white/80 font-semibold">{t("archive_col_time")}</th>
                  <th className="px-4 py-3 text-left text-white/80 font-semibold">{t("archive_col_corridor")}</th>
                  <th className="px-4 py-3 text-left text-white/80 font-semibold">{t("archive_col_event")}</th>
                  <th className="px-4 py-3 text-left text-white/80 font-semibold">{t("archive_col_severity")}</th>
                  <th className="px-4 py-3 text-left text-white/80 font-semibold">{t("archive_col_type")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, i) => (
                  <motion.tr
                    key={`${event.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white/80 font-mono text-xs">{event.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                        {event.corridor}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/80">{event.event}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ 
                          color: getSeverityColor(event.severity), 
                          background: `${getSeverityColor(event.severity)}20` 
                        }}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs">{event.type}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 text-white/60"
          >
            <p className="text-lg mb-2">{t("archive_waiting")}</p>
            <p className="text-sm">{t("archive_waiting_sub")}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
