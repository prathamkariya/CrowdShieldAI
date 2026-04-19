"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"
import LiveAlertFeed from "./LiveAlertFeed"
import AgencyAckPanel from "./AgencyAckPanel"
import { useToast } from "@/hooks/use-toast"
import { useSimulation } from "@/hooks/useSimulation"

function WeatherWidget() {
  const { t } = useLanguage()
  return (
    <motion.div
      className="glass-card rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#7A8BAD] mb-3">{t("weather_title")}</h2>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "🌡", label: "Temp", value: "38°C", color: "#F59E0B" },
          { icon: "💧", label: "Humidity", value: "71%", color: "#3B82F6" },
          { icon: "💨", label: "Wind", value: "12 km/h", color: "#22C55E" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 + 0.4 }}
            className="text-center rounded-xl py-3 px-2"
            style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}
          >
            <div className="text-base mb-1">{item.icon}</div>
            <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
            <div className="text-[9px] text-[#7A8BAD]">{item.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs p-2.5 rounded-lg"
        style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
        <span className="text-[#F59E0B]">⚠</span>
        <span className="text-[#9CA3AF] tracking-wide font-medium">{t("weather_heat_advisory")}</span>
      </div>
    </motion.div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 pb-2 border-b border-white/10">
      <h2 className="text-xs font-bold tracking-widest uppercase text-white/80">{title}</h2>
      {subtitle && <p className="text-[10px] text-[#7A8BAD] mt-0.5">{subtitle}</p>}
    </div>
  )
}

function SOSAlertPanel({ sosAlert, onClear }: { sosAlert: any; onClear: () => void }) {
  const { t } = useLanguage()
  const [ackedIndex, setAckedIndex] = useState(-1)
  
  const agencies = [
    { id: "police", name: "DISTRICT POLICE", action: "Deploy crowd control units", icon: "🚓" },
    { id: "temple", name: "TEMPLE TRUST", action: "Activate darshan hold", icon: "🏛" },
    { id: "gsrtc", name: "GSRTC TRANSPORT", action: "Hold incoming vehicles", icon: "🚌" },
    { id: "collector", name: "DISTRICT COLLECTOR", action: "Emergency coordination", icon: "👔" },
  ]

  // Automated "ticking" sequence
  useEffect(() => {
    if (sosAlert) {
      setAckedIndex(-1)
      const timers = agencies.map((_, i) => 
        setTimeout(() => setAckedIndex(i), (i + 1) * 1500)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [sosAlert])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden border border-red-500/30 flex flex-col shadow-[0_0_40px_rgba(239,68,68,0.15)]"
      style={{ background: "rgba(10, 10, 18, 0.95)" }}
    >
      {/* Header */}
      <div className="bg-[#EF4444] px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-sm tracking-widest">{t("sos_emergency_alert")}</h2>
          <p className="text-red-100 text-[10px] font-medium mt-0.5">
            Pressure: {Math.round(sosAlert.pressure)}% — {sosAlert.corridor} Corridor
          </p>
        </div>
        <div className="bg-black/20 px-2 py-1 rounded border border-white/20">
          <motion.span 
            animate={{ opacity: [1, 0.4, 1] }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="text-[9px] font-black text-white"
          >
            {t("sos_active") || "SOS ACTIVE"}
          </motion.span>
        </div>
      </div>

      {/* Agency List */}
      <div className="p-3 space-y-2">
        {agencies.map((agency, i) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-colors"
            style={{ 
              background: i <= ackedIndex ? "rgba(34, 197, 94, 0.08)" : "rgba(255, 255, 255, 0.03)",
              borderColor: i <= ackedIndex ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.05)"
            }}
          >
            <div className="text-xl opacity-80">{agency.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black text-[#7A8BAD] tracking-wider truncate">
                {agency.name} <span className="text-[8px] font-medium opacity-50 ml-1">{new Date().toTimeString().slice(0, 8)}</span>
              </h4>
              <p className="text-xs text-white/90 font-medium leading-tight">
                SOS: {agency.action} at {sosAlert.corridor}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {i <= ackedIndex ? (
                <motion.div
                  key="acked"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#22C55E] text-white text-[9px] font-black px-2 py-1 rounded flex items-center gap-1"
                >
                  ✓ {t("ack_officials")}
                </motion.div>
              ) : (
                <div className="w-12 h-5 bg-white/5 rounded border border-white/10" />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={onClear}
        className="mx-3 mb-3 py-2 bg-white/5 hover:bg-white/10 text-[#7A8BAD] text-[10px] font-bold rounded-lg border border-white/10 transition-colors"
      >
        {t("sos_dismiss")}
      </button>
    </motion.div>
  )
}

export default function RightColumn({ corridor, simData }: { corridor: string, simData: any }) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const simulation = simData

  // ML risk colour mapping
  const mlColors: Record<string, string> = {
    Low: "#22C55E",
    Moderate: "#F59E0B",
    High: "#FF7A00",
    Critical: "#EF4444",
  }
  const mlRiskKey: Record<string, string> = {
    Low: "ml_low",
    Moderate: "ml_moderate",
    High: "ml_high",
    Critical: "ml_critical",
  }
  const mlColor = mlColors[(simulation as any).mlRiskLevel] ?? "#7A8BAD"

  const handleAction = (label: string, color: string) => {
    toast({
      title: t("actions_title"),
      description: `${label}`,
      style: { borderLeft: `4px solid ${color}`, backgroundColor: "#0f172a", color: "#fff" }
    })
    simulation.executeAction(label)
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <AnimatePresence mode="wait">
        {simulation.sosAlert ? (
          <SOSAlertPanel 
            key="sos-panel" 
            sosAlert={simulation.sosAlert} 
            onClear={() => simulation.clearSos()} 
          />
        ) : (
          <motion.div
            key="standard-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {/* SECTION 1: Alerts and Agency Status */}
            <section>
              <SectionHeader title={t("right_col_alerts")} subtitle={t("right_col_alerts_sub")} />
              <div className="flex flex-col gap-3">
                <LiveAlertFeed activeCorridor={corridor} />
                <AgencyAckPanel sharedSocket={simulation.socket} />
              </div>
            </section>

            {/* SECTION 4: Quick Actions and Weather */}
            <section>
              <SectionHeader title={t("right_col_env")} subtitle={t("right_col_env_sub")} />
              <div className="flex flex-col gap-3">
                <WeatherWidget />

                {/* ML Risk Assessment Card */}
                {(simulation as any).mlRiskLevel && (
                  <motion.div
                    className="glass-card rounded-2xl p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ border: `1px solid ${mlColor}30` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#7A8BAD" }}>
                        🤖 {t("ml_risk_label")}
                      </h2>
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                        style={{ background: `${mlColor}18`, color: mlColor, border: `1px solid ${mlColor}40` }}
                      >
                        {t((mlRiskKey[(simulation as any).mlRiskLevel] || "ml_low") as any)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl p-2.5 text-center" style={{ background: `${mlColor}0D`, border: `1px solid ${mlColor}20` }}>
                        <div className="text-xl font-black" style={{ color: mlColor }}>
                          {(simulation as any).mlCrushWindowMin != null
                            ? `${Math.round((simulation as any).mlCrushWindowMin)} ${t("ml_minutes_label")}`
                            : "—"}
                        </div>
                        <div className="text-[9px] text-[#7A8BAD] mt-0.5">{t("ml_crush_window")}</div>
                      </div>
                      <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="text-xl font-black text-white">
                          {(simulation as any).mlConfidence != null
                            ? `${Math.round((simulation as any).mlConfidence * 100)}%`
                            : "—"}
                        </div>
                        <div className="text-[9px] text-[#7A8BAD] mt-0.5">{t("ml_confidence")}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <motion.div
                  className="glass-card rounded-2xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <span className="text-xs font-bold tracking-widest uppercase text-[#7A8BAD] block mb-3">{t("actions_title")}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: t("action_pa"), color: "#EF4444", icon: "P" },
                      { label: t("action_med"), color: "#22C55E", icon: "M" },
                      { label: t("action_gate"), color: "#F59E0B", icon: "G" },
                      { label: t("action_police"), color: "#3B82F6", icon: "A" },
                    ].map((action, i) => (
                      <motion.button
                        key={action.label}
                        onClick={() => handleAction(action.label, action.color)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 + 0.25 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="py-2.5 px-3 rounded-lg text-[10px] font-semibold text-left flex items-center gap-2 transition-all cursor-pointer"
                        style={{
                          background: `${action.color}10`,
                          border: `1px solid ${action.color}25`,
                          color: action.color,
                        }}
                      >
                        <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold" style={{ background: `${action.color}20` }}>{action.icon}</span>
                        <span className="leading-tight">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
