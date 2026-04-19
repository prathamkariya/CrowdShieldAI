"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { io, Socket } from "socket.io-client"
import { BACKEND_URL } from "@/lib/config"

interface AgencyStatus {
  id: string
  name: string
  icon: string
  color: string
  alertSent: string
  acknowledged: string | null
  responseTime: number | null
  actionTaken: string
  officerName?: string
}

const INITIAL_AGENCIES: AgencyStatus[] = [
  {
    id: "police",
    name: "District Police",
    icon: "🚔",
    color: "#3B82F6",
    alertSent: new Date().toTimeString().slice(0, 8),
    acknowledged: new Date().toTimeString().slice(0, 8),
    responseTime: 26,
    actionTaken: "12 officers deployed to Gate 3",
  },
  {
    id: "temple",
    name: "Temple Trust",
    icon: "🏛",
    color: "#F59E0B",
    alertSent: new Date().toTimeString().slice(0, 8),
    acknowledged: null,
    responseTime: null,
    actionTaken: "Pending acknowledgement",
  },
  {
    id: "gsrtc",
    name: "GSRTC Transport",
    icon: "🚌",
    color: "#22C55E",
    alertSent: new Date().toTimeString().slice(0, 8),
    acknowledged: new Date().toTimeString().slice(0, 8),
    responseTime: 46,
    actionTaken: "3 buses redirected from Entry B2",
  },
]



function AgencyCard({
  agency,
  onAck,
}: {
  agency: AgencyStatus
  onAck: (id: string) => void
}) {
  const { t } = useLanguage()
  const isAcknowledged = !!agency.acknowledged
  const escalationTime = 90
  const isEscalating = !isAcknowledged && agency.responseTime !== null && agency.responseTime > escalationTime
  const responseColor = agency.responseTime === null ? "#9CA3AF" : agency.responseTime < 90 ? "#22C55E" : "#EF4444"

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: isEscalating ? "1px solid #EF4444" : `1px solid ${agency.color}30`,
      }}
    >
      {/* Escalation pulse border */}
      {isEscalating && (
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: "2px solid rgba(239, 68, 68, 0.5)" }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{agency.icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: agency.color }}>
          {agency.name}
        </h3>
      </div>

      {/* Alert and Ack timestamps */}
      <div className="space-y-2 text-[9px] mb-3">
        <div className="flex items-center justify-between text-[#7A8BAD]">
          <span>{t("alert_sent")}</span>
          <span className="font-mono font-bold">{agency.alertSent}</span>
        </div>
        <div className="flex items-center justify-between">
          {isAcknowledged ? (
            <>
              <span className="text-[#7A8BAD]">{t("acknowledged")}</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono font-bold"
                style={{ color: agency.color }}
              >
                {agency.acknowledged}
                {agency.officerName && (
                  <span className="text-[#7A8BAD] font-normal ml-1">· {agency.officerName}</span>
                )}
              </motion.span>
            </>
          ) : (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1.5"
              style={{ color: "#EF4444" }}
            >
              <motion.span className="w-1.5 h-1.5 rounded-full bg-current" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <span className="font-bold">{t("status_pending")}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Response time */}
      <div className="flex items-center justify-between mb-3 p-2 rounded-lg" style={{ background: `${responseColor}12`, border: `1px solid ${responseColor}25` }}>
        <span className="text-[9px] text-[#7A8BAD]">{t("response_time")}</span>
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          key={agency.responseTime}
          className="text-xs font-bold font-mono"
          style={{ color: responseColor }}
        >
          {agency.responseTime === null ? "—" : `${agency.responseTime}s`}
        </motion.span>
      </div>

      {/* Action taken */}
      <p className="text-[9px] text-[#B0BBCF] mb-3">{agency.actionTaken}</p>

      {/* Ack button or acknowledged status */}
      {isAcknowledged ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          disabled
          className="w-full py-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2"
          style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#22C55E" }}
        >
          <span>✓</span> {t("ack_agencies_label")} — {t("ack_officials")}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAck(agency.id)}
          className="w-full py-2 rounded-lg font-bold text-[10px] uppercase transition-all"
          style={{
            background: `${agency.color}20`,
            border: `1px solid ${agency.color}40`,
            color: agency.color,
          }}
        >
          {t("btn_ack_now")}
        </motion.button>
      )}

      {/* Escalation warning */}
      {isEscalating && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2 rounded-lg bg-[rgba(255,59,59,0.15)] border border-[rgba(255,59,59,0.3)]"
        >
          <div className="text-[9px] font-bold text-[#EF4444] flex items-center gap-1">
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>⚠</motion.span>
            {t("escalation_warning")}
          </div>
          <motion.div
            animate={{ width: "100%" }}
            initial={{ width: "0%" }}
            transition={{ duration: 30, ease: "linear" }}
            className="h-1 bg-[#EF4444] rounded-full mt-1 opacity-50"
          />
        </motion.div>
      )}
    </motion.div>
  )
}

export default function AgencyAckPanel({ sharedSocket }: { sharedSocket?: Socket | null }) {
  const { t } = useLanguage()
  const [agencies, setAgencies] = useState<AgencyStatus[]>(INITIAL_AGENCIES)
  const internalSocketRef = useRef<Socket | null>(null)
  const activeSocket = sharedSocket || internalSocketRef.current

  useEffect(() => {
    // Only connect if no shared socket is provided
    if (!sharedSocket) {
      const socket = io(BACKEND_URL, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
      })
      internalSocketRef.current = socket
      
      return () => { socket.disconnect() }
    }
  }, [sharedSocket])

  useEffect(() => {
    if (!activeSocket) return

    const handleAckConfirmed = ({ agency, timestamp, officerName }: any) => {
      setAgencies(prev =>
        prev.map(a =>
          a.id === agency
            ? {
                ...a,
                acknowledged: timestamp,
                responseTime: data.responseMs ? Math.round((Date.now() - data.responseMs) / 1000) : Math.floor(Math.random() * 50) + 20,
                officerName,
                actionTaken: a.actionTaken === "Pending acknowledgement"
                  ? `Acknowledged by ${officerName}`
                  : a.actionTaken,
              }
            : a
        )
      )
    }

    activeSocket.on("agencyAckConfirmed", handleAckConfirmed)
    return () => { activeSocket.off("agencyAckConfirmed", handleAckConfirmed) }
  }, [activeSocket])

  const handleAck = (agencyId: string) => {
    const ts = new Date().toTimeString().slice(0, 8)
    const officerName = "Field Officer"

    // Optimistic local update
    setAgencies(prev =>
      prev.map(a =>
        a.id === agencyId
          ? { ...a, acknowledged: ts, responseTime: 0, officerName }
          : a
      )
    )

    // Emit to backend → broadcasts to all clients
    if (activeSocket?.connected) {
      activeSocket.emit("agencyAck", {
        agency: agencyId,
        corridor: "Active",
        officerName,
      })
    }
  }

  return (
    <motion.section
      className="glass-card rounded-2xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold tracking-widest uppercase text-[#7A8BAD]">{t("agency_tracker_title")}</h2>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[9px] text-[#22C55E] font-bold">{t("agencies_connected")}</span>
        </div>
      </div>
      <div className="space-y-3">
        {agencies.map((agency, i) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <AgencyCard agency={agency} onAck={handleAck} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
