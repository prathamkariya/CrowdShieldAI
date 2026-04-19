"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"
import { useSimulation } from "@/hooks/useSimulation"

// ============================================
// COMPONENT 1: Corridor Pressure Gauge
// ============================================
export function PressureGauge({ pressureIndex, surgeDuration = 0 }: { pressureIndex: number; surgeDuration?: number }) {
  const { t } = useLanguage()
  const value = Math.min(100, Math.max(0, isNaN(pressureIndex) ? 0 : pressureIndex))

  const status = value > 70 ? "critical" : value > 40 ? "warning" : "safe"
  const statusColor = status === "critical" ? "#EF4444" : status === "warning" ? "#F59E0B" : "#22C55E"

  // ── SVG geometry ─────────────────────────────────────────────
  // Canvas: 280 × 170
  // Arc centre sits at (140, 155) so the arc sits near the bottom.
  // Arc sweeps from 210° to 330° (standard unit-circle degrees),
  // which is the classic speedometer shape: open gap at the bottom.
  //
  // Standard math angles (0° = right, CCW positive) mapped to SVG:
  //   SVG x = cx + r·cos(deg·π/180)
  //   SVG y = cy + r·sin(deg·π/180)   ← "+y is down" handled by signs
  //
  // Arc start = 210° (bottom-left)  Arc end = 330° (bottom-right)
  // 0% → 210°, 100% → 330°  (sweep = 120° for half-pipe shape)
  // ────────────────────────────────────────────────────────────

  const W = 280, H = 170
  const cx = 140, cy = 155   // arc centre
  const R = 108               // arc radius
  const SWG = 14              // stroke width of arc

  const START_DEG = 210
  const END_DEG   = 330
  const SWEEP     = END_DEG - START_DEG  // 120°

  const toRad = (d: number) => (d * Math.PI) / 180

  const pt = (deg: number, r = R) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  })

  // Background arc (full sweep)
  const s0 = pt(START_DEG), e0 = pt(END_DEG)
  const bgPath = `M ${s0.x.toFixed(2)} ${s0.y.toFixed(2)} A ${R} ${R} 0 0 1 ${e0.x.toFixed(2)} ${e0.y.toFixed(2)}`

  // Progress arc
  const progressDeg = START_DEG + (value / 100) * SWEEP
  const ep = pt(progressDeg)
  // large-arc flag: 1 if sweep > 180°, but our total SWEEP is 120° so always 0
  const progressPath = value > 0
    ? `M ${s0.x.toFixed(2)} ${s0.y.toFixed(2)} A ${R} ${R} 0 0 1 ${ep.x.toFixed(2)} ${ep.y.toFixed(2)}`
    : ""

  // Needle
  const NEEDLE_R = R - 22
  const needlePt = pt(progressDeg, NEEDLE_R)

  // Tick labels: 0 20 40 60 80 100
  const TICKS = [0, 20, 40, 60, 80, 100]
  const LABEL_R = R + 22

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`glass-card rounded-2xl p-4 relative ${
        status === "critical" ? "glass-card-critical" :
        status === "warning"  ? "glass-card-warning"  : "glass-card-safe"
      }`}
      style={{ overflow: "hidden" }}
    >
      {status === "critical" && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ animation: "criticalPulse 1.5s ease-in-out infinite", border: "2px solid rgba(255,59,59,0.5)" }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[10px] font-black tracking-[0.15em] uppercase text-[#7A8BAD]">
          {t("pressure_gauge_title")}
        </h3>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
          style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}
        >
          {t("hero_live")}
        </motion.span>
      </div>

      {/* SVG Gauge */}
      <div className="flex justify-center" style={{ lineHeight: 0 }}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: "block", overflow: "hidden" }}
        >
          <defs>
            <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#22C55E" />
              <stop offset="50%"  stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="gGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path d={bgPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={SWG} strokeLinecap="round" />

          {/* Progress arc */}
          {value > 0 && (
            <path
              d={progressPath}
              fill="none"
              stroke="url(#gGrad)"
              strokeWidth={SWG}
              strokeLinecap="round"
              filter={status === "critical" ? "url(#gGlow)" : undefined}
            />
          )}

          {/* Tick marks & labels */}
          {TICKS.map(tick => {
            const deg = START_DEG + (tick / 100) * SWEEP
            const inner = pt(deg, R - SWG / 2 - 2)
            const outer = pt(deg, R + SWG / 2 + 2)
            const label = pt(deg, LABEL_R)
            return (
              <g key={tick}>
                <line
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1.5}
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {tick}%
                </text>
              </g>
            )
          })}

          {/* Needle — animated */}
          <motion.line
            x1={cx} y1={cy}
            x2={cx} y2={cy}
            animate={{ x2: needlePt.x, y2: needlePt.y }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            stroke={statusColor}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={6} fill={statusColor} />
          <circle cx={cx} cy={cy} r={3} fill="#0A0E1A" />

          {/* Centre value */}
          <text
            x={cx}
            y={cy - 30}
            textAnchor="middle"
            fill={statusColor}
            fontSize="40"
            fontWeight="900"
            fontFamily="monospace"
          >
            {Math.round(value)}%
          </text>
        </svg>
      </div>

      {/* Zone labels */}
      <div className="flex justify-between items-center px-4 -mt-1">
        <span className="text-[10px] font-bold text-[#22C55E]">{t("status_safe")}</span>
        <span className="text-[8px] font-bold text-[#7A8BAD] uppercase tracking-wider">◉ {t("flow_state")}</span>
        <span className="text-[10px] font-bold text-[#EF4444]">{t("status_critical")}</span>
      </div>

      <style jsx>{`
        @keyframes criticalPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      <AnimatePresence>
        {status === "critical" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-red-500/20"
          >
            <div className="bg-gradient-to-r from-red-600/90 to-orange-600/90 p-3 rounded-xl shadow-lg flex items-center gap-3">
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-lg"
              >
                🚨
              </motion.span>
              <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{t("genuine_crush_alert")}</h4>
                <p className="text-[10px] text-red-100 font-medium">
                  {t("sustained_for")} {Math.floor(surgeDuration / 60)}m {(surgeDuration % 60).toString().padStart(2, '0')}s — buildup confirmed at {Math.round(value)}% threshold
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// COMPONENT 2: Surge vs Buildup Classifier Badge
// ============================================
function SurgeClassifierBadge({ classifier, duration }: {
  classifier: string
  duration: number
}) {
  const { t } = useLanguage()
  // Guard: ensure duration is a valid number to avoid NaN
  const safeDuration = isNaN(duration) || duration == null ? 0 : duration
  const mins = Math.floor(safeDuration / 60)
  const secs = Math.floor(safeDuration % 60)
  const durationStr = `${mins}m ${secs.toString().padStart(2, "0")}s`

  return (
    <AnimatePresence mode="wait">
      {classifier === "normal" || !classifier ? (
        <motion.div
          key="normal"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="glass-card glass-card-safe rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-[#00C48C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold text-[#22C55E]">{t("flow_normal")}</span>
          </div>
          <p className="text-xs text-[#7A8BAD] mt-1">{t("flow_no_surge")}</p>
        </motion.div>
      ) : classifier === "surge" ? (
        <motion.div
          key="surge"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="glass-card glass-card-warning rounded-xl p-4"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.svg
              className="w-5 h-5 text-[#FF9500]"
              fill="currentColor"
              viewBox="0 0 24 24"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </motion.svg>
            <span className="text-sm font-bold text-[#FF9500]">{t("surge_title")}</span>
            <motion.svg
              className="w-4 h-4 text-[#FF9500]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
          </div>
          <p className="text-xs text-[#B0BBCF] mt-2 text-center">
            {t("surge_detected")} {durationStr} ago
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="buildup"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="glass-card glass-card-critical rounded-xl p-4 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ background: "rgba(255,59,59,0.1)" }}
          />
          <div className="relative flex items-center justify-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-lg"
            >
              🚨
            </motion.span>
            <span className="text-sm font-bold text-[#FF3B3B]">{t("buildup_title")}</span>
          </div>
          <p className="relative text-xs text-[#FF9500] mt-2 text-center font-medium">
            {t("sustained_for")} {durationStr}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// MAIN LEFT COLUMN EXPORT
// ============================================
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 pb-2 border-b border-white/10">
      <h2 className="text-xs font-bold tracking-widest uppercase text-white/80">{title}</h2>
      {subtitle && <p className="text-[10px] text-[#7A8BAD] mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function LeftColumn({ corridor, simData }: { corridor: string, simData: any }) {
  const { t } = useLanguage()
  const simulation = simData

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-1">
      <section>
        <SectionHeader title={t("left_col_title")} subtitle={t("left_col_sub")} />
        <div className="flex flex-col gap-3">
          <PressureGauge pressureIndex={simulation.pressureIndex} surgeDuration={simulation.surgeDuration ?? 0} />
          <SurgeClassifierBadge
            classifier={simulation.surgeClassifier ?? "normal"}
            duration={simulation.surgeDuration ?? 0}
          />
        </div>
      </section>
    </div>
  )
}
