"use client"

import { motion, AnimatePresence } from "framer-motion"
import CorridorHillMap from "./CorridorHillMap"
import { useLanguage } from "@/contexts/LanguageContext"

import PressureForecastGraph from "./PressureForecastGraph"
import { useSimulation } from "@/hooks/useSimulation"

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: number
  status: "safe" | "warning" | "critical"
  delay?: number
}

function MetricCard({ label, value, unit, trend, status, delay = 0 }: MetricCardProps) {
  const { t } = useLanguage()
  const colors = {
    safe: "#22C55E",
    warning: "#F59E0B",
    critical: "#EF4444",
  }
  const color = colors[status]

  const cardClass = `rounded-2xl p-4 flex flex-col gap-2 glass-card ${
    status === "safe" ? "glass-card-safe" : status === "warning" ? "glass-card-warning" : "glass-card-critical"
  }`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cardClass}
    >
      <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A8BAD]">{label}</span>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold text-white tabular-nums leading-none">{value}</span>
        {unit && <span className="text-sm text-[#7A8BAD] mb-0.5">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium" style={{ color }}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-[10px] text-[#7A8BAD]">{t("vs_last_hour")}</span>
        </div>
      )}
      <div className="h-0.5 rounded-full" style={{ background: `${color}30` }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: status === "critical" ? "92%" : status === "warning" ? "67%" : "45%" }}
          transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.5 }}
          style={{ background: color }}
        />
      </div>
    </motion.div>
  )
}

// Live crowd flow chart using pressure history
function CrowdFlowChart({ simData }: { simData: any }) {
  const rawPoints = simData?.pressureHistory?.slice(-12)
  const points = rawPoints && rawPoints.length > 0 ? rawPoints : [42, 55, 61, 58, 70, 82, 91, 88, 85, 92, 87, 84]
  const max = Math.max(...points)
  const min = Math.min(...points)
  const h = 80
  const w = 280

  const toY = (v: number) => h - ((v - min) / (Math.max(max - min, 1))) * (h - 10) - 5
  const toX = (i: number) => (i / (points.length - 1)) * w

  const pathD = points
    .map((p: number, i: number) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p)}`)
    .join(" ")

  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`

  // Determine chart color from current pressure level
  const currentPressure = points[points.length - 1] || 0
  const chartColor = currentPressure >= 85 ? "#FF3B3B" : currentPressure >= 60 ? "#FF9500" : "#22C55E"

  return (
    <div className="relative">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
          </linearGradient>

        </defs>
        <motion.path
          d={areaD}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke={chartColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"

          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
        {points.map((p: number, i: number) => (
          <motion.circle
            key={i}
            cx={toX(i)}
            cy={toY(p)}
            r="3"
            fill={chartColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: (i / points.length) * 1.8 + 0.5 }}
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {["-24s", "-18s", "-12s", "-6s"].map(t => (
          <span key={t} className="text-[10px] text-[#7A8BAD]">{t}</span>
        ))}
      </div>
    </div>
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

export default function CenterColumn({ corridor, simData }: { corridor: string, simData: any }) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">

      {/* SECTION 1: Key Metrics */}
      <section>
        <SectionHeader title={t("key_metrics")} subtitle={t("today_stats")} />
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <MetricCard 
            label={t("total_pilgrims_label")} 
            value={simData.totalPilgrims.toLocaleString()} 
            trend={Math.round(simData.flowTrend)} 
            status={simData.totalPilgrims > 95000 ? "critical" : simData.totalPilgrims > 88000 ? "warning" : "safe"} 
            delay={0} 
          />
          <MetricCard 
            label={t("peak_density")} 
            value={simData.peakDensity} 
            unit="%" 
            trend={2} 
            status={simData.peakDensity > 70 ? "critical" : simData.peakDensity > 45 ? "warning" : "safe"} 
            delay={0.06} 
          />
          <MetricCard 
            label={t("avg_flow_rate")} 
            value={simData.avgFlowRate} 
            unit={t("unit_per_hr")} 
            trend={-3} 
            status="safe" 
            delay={0.12} 
          />
          <MetricCard 
            label={t("incidents_today")} 
            value={simData.incidentsToday} 
            trend={0} 
            status={simData.incidentsToday > 2 ? "warning" : "safe"} 
            delay={0.18} 
          />
        </motion.div>
      </section>

      {/* SECTION 2: Spatial Monitoring */}
      <section>
        <SectionHeader title={t("spatial_monitoring")} subtitle={t("spatial_sub")} />
        <div className="flex flex-col gap-4">


          <CorridorHillMap 
            corridor={corridor}
            pressureIndex={simData.pressureIndex}
          />
        </div>
      </section>

      {/* SECTION 3: Trends and Analytics */}
      <section>
        <SectionHeader title={t("trends_analytics")} subtitle={t("trends_sub")} />
        <div className="flex flex-col gap-4">
          <motion.div
            className="glass-card rounded-2xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-[#7A8BAD]">{t("crowd_flow_today")}</span>
              <span className="text-[10px] text-[#FF9500] font-semibold">{t("trending_up")}</span>
            </div>
            <CrowdFlowChart simData={simData} />
          </motion.div>

          <PressureForecastGraph
            pressureIndex={simData.pressureIndex}
            pressureHistory={simData.pressureHistory}
            predictionMinutes={simData.predictionMinutes}
          />
        </div>
      </section>


    </div>
  )
}
