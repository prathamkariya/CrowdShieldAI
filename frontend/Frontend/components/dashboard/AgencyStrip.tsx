"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Icons
function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3L5 7v6c0 5 3 9.5 9 11 6-1.5 9-6 9-11V7L14 3z" fill={`${color}20`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 14l3 3 5-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TempleIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3l2 4h4v2H8V7h4L14 3z" fill={`${color}30`} stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="9" y="11" width="3" height="7" rx="0.5" fill={`${color}20`} stroke={color} strokeWidth="1"/>
      <rect x="16" y="11" width="3" height="7" rx="0.5" fill={`${color}20`} stroke={color} strokeWidth="1"/>
      <rect x="8" y="18" width="12" height="2" rx="0.5" fill={`${color}20`} stroke={color} strokeWidth="1"/>
      <path d="M13 11h2v4h-2z" fill={`${color}20`} stroke={color} strokeWidth="0.8"/>
    </svg>
  )
}

function BusIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="5" y="8" width="18" height="12" rx="2" fill={`${color}20`} stroke={color} strokeWidth="1.2"/>
      <rect x="7" y="10" width="5" height="3.5" rx="0.5" fill={`${color}30`} stroke={color} strokeWidth="0.8"/>
      <rect x="16" y="10" width="5" height="3.5" rx="0.5" fill={`${color}30`} stroke={color} strokeWidth="0.8"/>
      <line x1="5" y1="15" x2="23" y2="15" stroke={color} strokeWidth="0.8"/>
      <circle cx="9" cy="21" r="2" fill={`${color}30`} stroke={color} strokeWidth="1"/>
      <circle cx="19" cy="21" r="2" fill={`${color}30`} stroke={color} strokeWidth="1"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Action log entry type
interface ActionLog {
  id: string
  time: string
  description: string
  details?: string
}

// Police Card
function PoliceCard({ hasAlert }: { hasAlert: boolean }) {
  const { t } = useLanguage()
  const color = "#4A9EFF"
  const [formOpen, setFormOpen] = useState(false)
  const [officerCount, setOfficerCount] = useState(4)
  const [gate, setGate] = useState("Gate 3")
  const [notes, setNotes] = useState("")
  const [logs, setLogs] = useState<ActionLog[]>([
    { id: "1", time: "14:23:15", description: "8 officers deployed", details: "Gate 3" },
    { id: "2", time: "14:18:42", description: "4 officers deployed", details: "Gate 1" },
    { id: "3", time: "14:05:30", description: "6 officers deployed", details: "Gate 2" },
  ])

  const handleSubmit = () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB")
    setLogs(prev => [
      { id: Date.now().toString(), time: timeStr, description: `${officerCount} officers deployed`, details: gate + (notes ? ` - ${notes}` : "") },
      ...prev.slice(0, 4)
    ])
    setFormOpen(false)
    setNotes("")
  }

  return (
    <motion.div
      className="flex-1 rounded-2xl p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      style={{
        background: hasAlert ? `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)` : "rgba(255,255,255,0.02)",
        border: `1px solid ${hasAlert ? color + "40" : "rgba(255,255,255,0.06)"}`,
        boxShadow: hasAlert ? `0 0 40px ${color}20, 0 0 80px ${color}10` : "none",
      }}
    >
      {/* Animated glow border */}
      {hasAlert && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `2px solid ${color}` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl" style={{ background: `${color}15` }}>
          <ShieldIcon color={color} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">{t("agency_police")}</h3>
          <p className="text-[10px] text-[#7A8BAD]">{t("agency_police_sub")}</p>
        </div>
        <motion.div
          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
          style={{ background: hasAlert ? `${color}25` : "rgba(255,255,255,0.05)", color: hasAlert ? color : "#7A8BAD" }}
          animate={hasAlert ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ background: hasAlert ? color : "#7A8BAD" }}
            animate={hasAlert ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          {hasAlert ? t("status_active") : t("status_standby")}
        </motion.div>
      </div>

      {/* Alert Box */}
      <motion.div
        className="rounded-xl p-4 mb-4"
        style={{
          background: hasAlert ? `linear-gradient(135deg, #FF3B3B15 0%, #FF3B3B08 100%)` : "rgba(255,255,255,0.03)",
          border: `1px solid ${hasAlert ? "#FF3B3B40" : "rgba(255,255,255,0.06)"}`,
        }}
        animate={hasAlert ? { borderColor: ["#FF3B3B40", "#FF3B3B80", "#FF3B3B40"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">{hasAlert ? "🚨" : "✓"}</span>
          <div>
            <p className="text-xs font-semibold text-white">
              {hasAlert ? t("police_alert") : t("no_alerts")}
            </p>
            {hasAlert && (
              <p className="text-[10px] text-[#B0BBCF] mt-1">{t("immediate_response")}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recommended Action */}
      {hasAlert && (
        <motion.div
          className="rounded-lg px-4 py-3 mb-4 flex items-center gap-2"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold">{t("recommended")}:</span>
          <span className="text-xs text-white font-semibold">{t("police_recom")}</span>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        onClick={() => setFormOpen(!formOpen)}
        className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all"
        style={{
          background: formOpen ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
          color: formOpen ? "#7A8BAD" : "white",
          border: formOpen ? "1px solid rgba(255,255,255,0.1)" : "none",
          boxShadow: formOpen ? "none" : `0 4px 20px ${color}40`,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {formOpen ? t("btn_cancel") : t("police_log_btn")}
      </motion.button>

      {/* Inline Form */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold block mb-1.5">{t("label_officers")}</label>
                  <input
                    type="number"
                    value={officerCount}
                    onChange={e => setOfficerCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white font-semibold"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold block mb-1.5">{t("label_gate")}</label>
                  <select
                    value={gate}
                    onChange={e => setGate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white font-semibold appearance-none cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={`Gate ${g}`} style={{ background: "#0A0E1A" }}>Gate {g}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold block mb-1.5">{t("label_notes")}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t("placeholder_notes")}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-[#7A8BAD]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#7A8BAD]">{t("timestamp")}: {new Date().toLocaleTimeString("en-GB")}</span>
                <motion.button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg font-bold text-sm"
                  style={{ background: "#00C48C", color: "white" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("btn_submit")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Log */}
      <div className="mt-4">
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#7A8BAD] mb-2">{t("recent_actions")}</h4>
        <div className="space-y-1.5">
          {logs.slice(0, 5).map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[11px]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-[#7A8BAD] font-mono">{log.time}</span>
              <span className="text-white flex-1">{log.description}</span>
              <span className="text-[#7A8BAD]">{log.details}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Temple Trust Card
function TempleCard({ hasAlert }: { hasAlert: boolean }) {
  const { t } = useLanguage()
  const color = "#FF9500"
  const [darshanHold, setDarshanHold] = useState(false)
  const [redirected, setRedirected] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [logs, setLogs] = useState<ActionLog[]>([
    { id: "1", time: "14:20:00", description: "Queue redirected to Gate B", details: "" },
    { id: "2", time: "14:12:30", description: "Darshan hold released", details: "" },
  ])

  const handleHold = () => {
    setDarshanHold(true)
    const now = new Date()
    setLogs(prev => [
      { id: Date.now().toString(), time: now.toLocaleTimeString("en-GB"), description: "Darshan hold activated", details: "" },
      ...prev.slice(0, 4)
    ])
  }

  const handleRedirect = () => {
    setRedirected(true)
    const now = new Date()
    setLogs(prev => [
      { id: Date.now().toString(), time: now.toLocaleTimeString("en-GB"), description: "Queue redirected to Gate B", details: "" },
      ...prev.slice(0, 4)
    ])
  }

  const handleConfirm = () => {
    if (confirmText.trim()) {
      const now = new Date()
      setLogs(prev => [
        { id: Date.now().toString(), time: now.toLocaleTimeString("en-GB"), description: confirmText, details: "" },
        ...prev.slice(0, 4)
      ])
      setConfirmText("")
    }
  }

  return (
    <motion.div
      className="flex-1 rounded-2xl p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      style={{
        background: hasAlert ? `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)` : "rgba(255,255,255,0.02)",
        border: `1px solid ${hasAlert ? color + "40" : "rgba(255,255,255,0.06)"}`,
        boxShadow: hasAlert ? `0 0 40px ${color}20, 0 0 80px ${color}10` : "none",
      }}
    >
      {hasAlert && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `2px solid ${color}` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl" style={{ background: `${color}15` }}>
          <TempleIcon color={color} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">{t("agency_temple")}</h3>
          <p className="text-[10px] text-[#7A8BAD]">{t("agency_temple_sub")}</p>
        </div>
        <motion.div
          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
          style={{ background: hasAlert ? `${color}25` : "rgba(255,255,255,0.05)", color: hasAlert ? color : "#7A8BAD" }}
          animate={hasAlert ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ background: hasAlert ? color : "#7A8BAD" }}
            animate={hasAlert ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          {hasAlert ? t("status_active") : t("status_standby")}
        </motion.div>
      </div>

      {/* Alert Box */}
      <motion.div
        className="rounded-xl p-4 mb-4"
        style={{
          background: hasAlert ? `linear-gradient(135deg, #FF3B3B15 0%, #FF3B3B08 100%)` : "rgba(255,255,255,0.03)",
          border: `1px solid ${hasAlert ? "#FF3B3B40" : "rgba(255,255,255,0.06)"}`,
        }}
        animate={hasAlert ? { borderColor: ["#FF3B3B40", "#FF3B3B80", "#FF3B3B40"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">{hasAlert ? "🚨" : "✓"}</span>
          <div>
            <p className="text-xs font-semibold text-white">
              {hasAlert ? t("temple_alert") : t("no_alerts")}
            </p>
            {hasAlert && (
              <p className="text-[10px] text-[#B0BBCF] mt-1">{t("immediate_response")}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recommended Action */}
      {hasAlert && (
        <motion.div
          className="rounded-lg px-4 py-3 mb-4 flex items-center gap-2"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold">{t("recommended")}:</span>
          <span className="text-xs text-white font-semibold">{t("temple_recom")}</span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.button
          onClick={handleHold}
          className="py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
          style={{
            background: darshanHold ? "#22C55E" : "rgba(255,255,255,0.05)",
            color: darshanHold ? "white" : "#7A8BAD",
            border: darshanHold ? "none" : "1px solid rgba(255,255,255,0.1)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {darshanHold && <CheckIcon />}
          {darshanHold ? t("hold_active") : t("darshan_hold")}
        </motion.button>
        <motion.button
          onClick={handleRedirect}
          disabled={redirected}
          className="py-3 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
          style={{
            background: redirected ? "#00C48C" : `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
            color: "white",
            boxShadow: redirected ? "none" : `0 4px 20px ${color}40`,
          }}
          whileHover={!redirected ? { scale: 1.02 } : {}}
          whileTap={!redirected ? { scale: 0.98 } : {}}
        >
          {redirected && <CheckIcon />}
          {redirected ? t("redirect_done") : t("redirect_btn")}
        </motion.button>
      </div>

      {/* Confirmation Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder={t("log_placeholder")}
          className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-[#7A8BAD]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        <motion.button
          onClick={handleConfirm}
          className="px-4 py-2 rounded-lg font-bold text-sm"
          style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
          whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.15)" }}
          whileTap={{ scale: 0.95 }}
        >
          {t("log_btn")}
        </motion.button>
      </div>

      {/* Action Log */}
      <div>
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#7A8BAD] mb-2">{t("recent_actions")}</h4>
        <div className="space-y-1.5">
          {logs.slice(0, 5).map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[11px]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-[#7A8BAD] font-mono">{log.time}</span>
              <span className="text-white flex-1">{log.description}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// GSRTC Transport Card
function TransportCard({ hasAlert }: { hasAlert: boolean }) {
  const { t } = useLanguage()
  const color = "#00C48C"
  const [holdConfirmed, setHoldConfirmed] = useState(false)
  const [holdDuration, setHoldDuration] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [logs, setLogs] = useState<ActionLog[]>([
    { id: "1", time: "14:15:00", description: "Vehicle hold released", details: "20 min" },
    { id: "2", time: "13:55:00", description: "Vehicle hold confirmed", details: "20 min" },
  ])

  const currentPressure = 72
  const reducedPressure = 54

  useEffect(() => {
    if (holdDuration && countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [holdDuration, countdown])

  const handleConfirmHold = () => {
    setHoldConfirmed(true)
  }

  const handleSelectDuration = (mins: number) => {
    setHoldDuration(mins)
    setCountdown(mins * 60)
    const now = new Date()
    setLogs(prev => [
      { id: Date.now().toString(), time: now.toLocaleTimeString("en-GB"), description: "Vehicle hold confirmed", details: `${mins} min` },
      ...prev.slice(0, 4)
    ])
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleCancelHold = () => {
    setHoldConfirmed(false)
    setHoldDuration(null)
    setCountdown(0)
    const now = new Date()
    setLogs(prev => [
      { id: Date.now().toString(), time: now.toLocaleTimeString("en-GB"), description: "Vehicle hold cancelled", details: "" },
      ...prev.slice(0, 4)
    ])
  }

  return (
    <motion.div
      className="flex-1 rounded-2xl p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      style={{
        background: hasAlert ? `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)` : "rgba(255,255,255,0.02)",
        border: `1px solid ${hasAlert ? color + "40" : "rgba(255,255,255,0.06)"}`,
        boxShadow: hasAlert ? `0 0 40px ${color}20, 0 0 80px ${color}10` : "none",
      }}
    >
      {hasAlert && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `2px solid ${color}` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl" style={{ background: `${color}15` }}>
          <BusIcon color={color} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm">{t("agency_gsrtc")}</h3>
          <p className="text-[10px] text-[#7A8BAD]">{t("agency_gsrtc_sub")}</p>
        </div>
        <motion.div
          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full"
          style={{ background: hasAlert ? `${color}25` : "rgba(255,255,255,0.05)", color: hasAlert ? color : "#7A8BAD" }}
          animate={hasAlert ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ background: hasAlert ? color : "#7A8BAD" }}
            animate={hasAlert ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          {hasAlert ? t("status_active") : t("status_standby")}
        </motion.div>
      </div>

      {/* Alert Box */}
      <motion.div
        className="rounded-xl p-4 mb-4"
        style={{
          background: hasAlert ? `linear-gradient(135deg, #FF950015 0%, #FF950008 100%)` : "rgba(255,255,255,0.03)",
          border: `1px solid ${hasAlert ? "#FF950040" : "rgba(255,255,255,0.06)"}`,
        }}
        animate={hasAlert ? { borderColor: ["#FF950040", "#FF950080", "#FF950040"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">{hasAlert ? "🚌" : "✓"}</span>
          <div>
            <p className="text-xs font-semibold text-white">
              {hasAlert ? t("gsrtc_alert") : t("no_alerts")}
            </p>
            {hasAlert && (
              <p className="text-[10px] text-[#B0BBCF] mt-1">{t("immediate_response")}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recommended Action */}
      {hasAlert && (
        <motion.div
          className="rounded-lg px-4 py-3 mb-4 flex items-center gap-2"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold">{t("recommended")}:</span>
          <span className="text-xs text-white font-semibold">{t("gsrtc_recom")}</span>
        </motion.div>
      )}

      {/* Action Button / Duration Selector */}
      {!holdConfirmed ? (
        <motion.button
          onClick={handleConfirmHold}
          className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase"
          style={{ background: color, color: "white", boxShadow: `0 8px 30px ${color}40` }}
          whileHover={{ scale: 1.02, boxShadow: `0 12px 40px ${color}60` }}
          whileTap={{ scale: 0.98 }}
        >
          {t("gsrtc_hold_btn")}
        </motion.button>
      ) : !holdDuration ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          <p className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold">{t("gsrtc_select_duration")}</p>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map(mins => (
              <motion.button
                key={mins}
                onClick={() => handleSelectDuration(mins)}
                className="py-3 rounded-xl font-bold text-sm"
                style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}
                whileHover={{ scale: 1.05, background: `${color}30` }}
                whileTap={{ scale: 0.95 }}
              >
                {mins} {t("unit_min")}
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-3 rounded-xl flex flex-col items-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <p className="text-[10px] text-[#7A8BAD] uppercase tracking-wider font-bold mb-1">{t("gsrtc_hold_active")}</p>
          <p className="text-2xl font-bold font-mono mb-2" style={{ color }}>{formatCountdown(countdown)}</p>
          <motion.button
            onClick={handleCancelHold}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[9px] font-bold px-3 py-1 rounded transition-colors border"
            style={{ 
              borderColor: `${color}40`, 
              color: color, 
              background: 'rgba(255,255,255,0.02)' 
            }}
          >
            {t("btn_cancel_hold")}
          </motion.button>
        </motion.div>
      )}

      {/* Impact Preview */}
      {hasAlert && (
        <motion.div
          className="mt-4 p-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] text-[#7A8BAD] mb-2">
            {t("gsrtc_impact_reduction")} <span className="text-[#00C48C] font-bold">-18 points</span>
          </p>
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: "#FF3B3B" }}
              initial={{ width: `${currentPressure}%` }}
              animate={{ width: holdDuration ? `${reducedPressure}%` : `${currentPressure}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-y-0 rounded-full"
              style={{ background: "#00C48C", left: `${reducedPressure}%`, width: `${currentPressure - reducedPressure}%`, opacity: 0.4 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: holdDuration ? 0 : 0.4 }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-[#7A8BAD]">
            <span>{t("current_pressure")}: {currentPressure}</span>
            <span>{t("after_hold_pressure")}: {reducedPressure}</span>
          </div>
        </motion.div>
      )}

      {/* Action Log */}
      <div className="mt-4">
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-[#7A8BAD] mb-2">{t("recent_actions")}</h4>
        <div className="space-y-1.5">
          {logs.slice(0, 5).map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[11px]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-[#7A8BAD] font-mono">{log.time}</span>
              <span className="text-white flex-1">{log.description}</span>
              <span className="text-[#7A8BAD]">{log.details}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function AgencyStrip({ pressureIndex = 0 }: { pressureIndex?: number }) {
  const { t } = useLanguage()
  const hasAlert = pressureIndex >= 70 // Derive from real pressure data

  return (
    <motion.section
      className="mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header with connected indicator */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#7A8BAD]">{t("agency_hub_title")}</h2>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "rgba(0,196,140,0.1)", border: "1px solid rgba(0,196,140,0.3)" }}
          animate={{ boxShadow: ["0 0 10px rgba(0,196,140,0.2)", "0 0 20px rgba(0,196,140,0.4)", "0 0 10px rgba(0,196,140,0.2)"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-[#00C48C]"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[11px] font-bold text-[#00C48C]">{t("agencies_connected")}</span>
        </motion.div>
      </div>

      {/* 3 Agency Cards - Now responsive */}
      <div className="flex flex-col lg:flex-row gap-4 pb-4">
        <PoliceCard hasAlert={hasAlert} />
        <TempleCard hasAlert={hasAlert} />
        <TransportCard hasAlert={hasAlert} />
      </div>
    </motion.section>
  )
}
