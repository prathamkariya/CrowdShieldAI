"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import { BACKEND_URL } from "@/lib/config"

interface Alert {
  id: string
  timestamp: string
  corridor: string
  eventType: string
  severity: "green" | "amber" | "red"
}



const SEVERITY_COLORS = {
  green: { bg: "transparent", border: "rgba(34, 197, 94, 0.25)", text: "#22C55E", dot: "#22C55E" },
  amber: { bg: "transparent", border: "rgba(245, 158, 11, 0.25)", text: "#F59E0B", dot: "#F59E0B" },
  red:   { bg: "rgba(239, 68, 68, 0.05)", border: "rgba(239, 68, 68, 0.3)", text: "#EF4444", dot: "#EF4444" },
}

function AlertCard({ alert }: { alert: Alert }) {
  const { t } = useLanguage()
  const severity = SEVERITY_COLORS[alert.severity] ?? SEVERITY_COLORS.green

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      layout
      transition={{ duration: 0.25 }}
      className="rounded-lg p-3 flex items-center gap-3"
      style={{ background: severity.bg, border: `1px solid ${severity.border}` }}
    >
      {/* Pulsing dot */}
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: severity.dot }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-mono text-[#7A8BAD]">{alert.timestamp}</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: `${severity.dot}20`, color: severity.text }}
          >
            {alert.corridor}
          </span>
        </div>
        <p className="text-xs text-[#E8EEFF] font-medium leading-tight">{alert.eventType}</p>
      </div>

      <span
        className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: `${severity.dot}20`, color: severity.text }}
      >
        {t(`status_${alert.severity}` as any).toUpperCase()}
      </span>
    </motion.div>
  )
}

export default function LiveAlertFeed({ activeCorridor }: { activeCorridor: string }) {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [connected, setConnected] = useState(false)

  // Re-connect whenever activeCorridor actually changes
  useEffect(() => {
    // Clear old alerts for previous corridor
    setAlerts([])

    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    const addAlert = (raw: any, overrideSeverity?: "green" | "amber" | "red") => {
      // Show events for the active corridor only
      if (!activeCorridor || raw.corridor !== activeCorridor) return

      const sev: "green" | "amber" | "red" = overrideSeverity ?? raw.severity ?? "amber"
      const entry: Alert = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        }),
        corridor: raw.corridor,
        eventType: raw.message ? raw.message : t("pressure_event"),
        severity: sev,
      }
      setAlerts(prev => [entry, ...prev].slice(0, 25))
    }

    socket.on("alertUpdate", (data: any) => addAlert(data))
    socket.on("sosTrigger", (data: any) => addAlert(
      { ...data, message: `🚨 SOS: ${data.message ? data.message : t("sos_critical")}` },
      "red"
    ))

    return () => { socket.disconnect() }
  }, [activeCorridor]) // Re-run when corridor changes

  return (
    <motion.section
      className="glass-card rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold tracking-widest uppercase text-[#7A8BAD]">
          {t("live_feed_title")}
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#7A8BAD]">{activeCorridor || "—"}</span>
          <motion.span
            animate={{ opacity: connected ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: connected ? "#00C48C" : "#EF4444" }}
          />
        </div>
      </div>

      {/* Feed list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {alerts.length > 0 ? (
            alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-[#7A8BAD] text-xs"
            >
              {connected
                ? `${t("feed_monitoring")} ${activeCorridor || "corridor"}…`
                : t("feed_connecting")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
