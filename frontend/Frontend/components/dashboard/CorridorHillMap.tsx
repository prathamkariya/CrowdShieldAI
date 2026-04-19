"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"

interface CorridorHillMapProps {
  corridor: string
  pressureIndex: number
}

// Waypoints calibrated to the mountain photo (base to peak)
const WAYPOINTS = [
  { x: 12, y: 88 },   // Base entrance
  { x: 25, y: 72 },   // Lower trail
  { x: 40, y: 60 },   // Mid slope
  { x: 35, y: 48 },   // Switchback
  { x: 52, y: 36 },   // Upper ridge
  { x: 48, y: 22 },   // Near peak
  { x: 46, y: 12 },   // Summit
]

// SVG path segments (quadratic bezier control points as percentages)
const PATH_SEGMENTS = [
  { id: 0, d: "M 12,88 Q 18,82 25,72" },
  { id: 1, d: "M 25,72 Q 34,64 40,60" },
  { id: 2, d: "M 40,60 Q 38,52 35,48" },
  { id: 3, d: "M 35,48 Q 46,40 52,36" },
  { id: 4, d: "M 52,36 Q 52,28 48,22" },
  { id: 5, d: "M 48,22 Q 46,16 46,12" },
]

// Full path for pilgrim animation
const FULL_PATH = "M 12,88 Q 18,82 25,72 Q 34,64 40,60 Q 38,52 35,48 Q 46,40 52,36 Q 52,28 48,22 Q 46,16 46,12"

// Chokepoints (segments with potential bottlenecks)
const CHOKEPOINTS = [
  { segIdx: 1, waypoint: WAYPOINTS[2], label: "Narrow Pass" },
  { segIdx: 3, waypoint: WAYPOINTS[4], label: "Ridge Squeeze" },
]

// Torch/lamp positions along the trail
const LAMP_POSITIONS = [
  { x: 15, y: 85 }, { x: 20, y: 78 }, { x: 28, y: 70 },
  { x: 35, y: 63 }, { x: 38, y: 55 }, { x: 36, y: 50 },
  { x: 42, y: 43 }, { x: 50, y: 38 }, { x: 51, y: 30 },
  { x: 49, y: 25 }, { x: 47, y: 18 },
]

export default function CorridorHillMap({ corridor, pressureIndex }: CorridorHillMapProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [segmentPressures, setSegmentPressures] = useState<number[]>([40, 45, 60, 40, 65, 30])
  const [hoveredSeg, setHoveredSeg] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const [grainSeed, setGrainSeed] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Simulate pressure changes
  useEffect(() => {
    const interval = setInterval(() => {
      setSegmentPressures(prev =>
        prev.map((_, i) => {
          let base = pressureIndex
          if (i === 1 || i === 3) base += 10
          base += Math.random() * 10 - 5
          return Math.max(0, Math.min(100, base))
        })
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [pressureIndex])

  // Film grain animation
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setGrainSeed(s => (s + 1) % 100)
    }, 80)
    return () => clearInterval(interval)
  }, [mounted])

  const getColor = useCallback((p: number) => {
    if (p < 40) return { color: "#22C55E", glow: "rgba(34,197,94,0.6)", status: "SAFE" }
    if (p < 70) return { color: "#F59E0B", glow: "rgba(245,158,11,0.6)", status: "CAUTION" }
    return { color: "#EF4444", glow: "rgba(239,68,68,0.6)", status: "CRITICAL" }
  }, [])

  const handleSegHover = useCallback((segIdx: number | null, e?: React.MouseEvent) => {
    setHoveredSeg(segIdx)
    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }, [])

  // Unique pilgrim offsets for staggered motion
  const pilgrimOffsets = useMemo(() => [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87], [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-xs font-bold tracking-widest uppercase text-[#7A8BAD]">{t("live_path")}</span>
        <div className="flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ background: pressureIndex > 70 ? '#EF4444' : pressureIndex > 40 ? '#F59E0B' : '#22C55E' }}
          />
          <span className="text-[10px] text-[#7A8BAD]">{t("status_live")}</span>
        </div>
      </div>

      {/* Main Map Container */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-white/5"
        style={{ paddingBottom: "62.5%" /* 16:10 aspect ratio */ }}
        onMouseLeave={() => setHoveredSeg(null)}
      >
        {/* LAYER 1: Real Mountain Photograph */}
        <img 
          src="/mountain-terrain.png"
          alt="Mountain terrain"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            filter: "brightness(0.85) contrast(1.15) saturate(1.1)",
          }}
          draggable={false}
        />

        {/* LAYER 2: Color Grading — warm daylight tint */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(30,60,90,0.15) 0%, rgba(20,40,30,0.1) 40%, rgba(40,60,30,0.2) 100%)",
            mixBlendMode: "multiply",
          }}
        />

        {/* LAYER 3: Sunlight radial glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 75% 15%, rgba(255,240,180,0.18) 0%, transparent 60%)",
          }}
        />

        {/* LAYER 4: Atmospheric haze at base */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(180,200,170,0.25) 0%, transparent 25%)",
          }}
        />

        {/* LAYER 5: Vignette */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* LAYER 6: Film Grain */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            opacity: 0.06,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch' seed='${grainSeed}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* LAYER 7: SVG Overlay — Paths, Markers, Pilgrims, Temple */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            {/* Path shadow filter */}
            <filter id="pathShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.4" stdDeviation="0.6" floodColor="rgba(0,0,0,0.7)" />
            </filter>

            {/* Glow filter for chokepoints */}
            <filter id="chokeGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gold glow for temple */}
            <filter id="templeGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Lamp glow gradient */}
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,240,180,0.35)" />
              <stop offset="60%" stopColor="rgba(255,220,130,0.08)" />
              <stop offset="100%" stopColor="rgba(255,200,100,0)" />
            </radialGradient>

            {/* Pressure color gradients */}
            <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
            <linearGradient id="cautionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>

          {/* Path — Shadow Layer */}
          <path
            d={FULL_PATH}
            fill="none"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pathShadow)"
          />

          {/* Path — Stone surface base */}
          <path
            d={FULL_PATH}
            fill="none"
            stroke="rgba(80,65,45,0.85)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Path — Gravel texture dash */}
          <path
            d={FULL_PATH}
            fill="none"
            stroke="rgba(120,100,70,0.5)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="0.6 1.2"
          />

          {/* Path — Pressure-colored segments */}
          {PATH_SEGMENTS.map((seg, i) => {
            const p = segmentPressures[i]
            const meta = getColor(p)
            const isHovered = hoveredSeg === i
            return (
              <g key={seg.id}>
                {/* Pressure-glow backdrop */}
                {isHovered && (
                  <path
                    d={seg.d}
                    fill="none"
                    stroke={meta.glow}
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                )}
                {/* Pressure color line */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke={meta.color}
                  strokeWidth={isHovered ? "2.2" : "1.4"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isHovered ? "0.95" : "0.75"}
                  style={{ 
                    pointerEvents: "stroke", 
                    cursor: "pointer",
                    transition: "stroke-width 0.2s, opacity 0.2s",
                  }}
                  onMouseEnter={(e) => handleSegHover(i, e as unknown as React.MouseEvent)}
                  onMouseMove={(e) => handleSegHover(i, e as unknown as React.MouseEvent)}
                  onMouseLeave={() => handleSegHover(null)}
                />
              </g>
            )
          })}

          {/* Path — Moonlit/Sunlit highlight */}
          <path
            d={FULL_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform="translate(-0.15,-0.15)"
          />

          {/* Lamp glows along the trail */}
          {LAMP_POSITIONS.map((lamp, i) => (
            <circle
              key={`lamp-${i}`}
              cx={lamp.x}
              cy={lamp.y}
              r="2.5"
              fill="url(#lampGlow)"
              opacity="0.5"
            >
              <animate 
                attributeName="opacity"
                values="0.4;0.7;0.4"
                dur={`${2 + (i % 3) * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* Chokepoint markers */}
          {CHOKEPOINTS.map((cp, i) => {
            const p = segmentPressures[cp.segIdx]
            if (p <= 55) return null
            const meta = getColor(p)
            const wp = cp.waypoint
            return (
              <g key={`choke-${i}`} filter="url(#chokeGlow)">
                {/* Pulsing ring */}
                <circle cx={wp.x} cy={wp.y} r="2" fill="none" stroke={meta.color} strokeWidth="0.3" opacity="0.8">
                  <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Second pulse (offset) */}
                <circle cx={wp.x} cy={wp.y} r="2" fill="none" stroke={meta.color} strokeWidth="0.2" opacity="0.5">
                  <animate attributeName="r" values="2;4;2" dur="2s" begin="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" begin="1s" repeatCount="indefinite" />
                </circle>
                {/* Warning triangle */}
                <polygon
                  points={`${wp.x},${wp.y - 2.2} ${wp.x + 1.8},${wp.y + 1} ${wp.x - 1.8},${wp.y + 1}`}
                  fill={meta.color}
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="0.2"
                />
                {/* Exclamation mark */}
                <line x1={wp.x} y1={wp.y - 1.3} x2={wp.x} y2={wp.y + 0.1} stroke="white" strokeWidth="0.4" strokeLinecap="round" />
                <circle cx={wp.x} cy={wp.y + 0.6} r="0.2" fill="white" />
                {/* Label */}
                <rect x={wp.x - 4.5} y={wp.y + 2.2} width="9" height="2.2" rx="0.5" fill="rgba(0,0,0,0.75)" />
                <text x={wp.x} y={wp.y + 3.8} textAnchor="middle" fontSize="1.2" fill={meta.color} fontWeight="bold" fontFamily="Inter, system-ui, sans-serif">
                  {t(cp.label === "Narrow Pass" ? "narrow_pass" : "ridge_squeeze").toUpperCase()}
                </text>
              </g>
            )
          })}

          {/* Pilgrim dots with animateMotion */}
          {mounted && pilgrimOffsets.map((offset, i) => {
            const totalSegments = PATH_SEGMENTS.length
            const segFloat = (offset * totalSegments) % totalSegments
            const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1)
            const segP = segmentPressures[segIdx]
            const speed = segP > 70 ? 18 : segP > 55 ? 12 : segP > 40 ? 8 : 5
            return (
              <g key={`pilgrim-${i}`}>
                {/* Red aura for high-pressure */}
                {segP >= 70 && (
                  <circle r="1.5" fill="none" opacity="0.3">
                    <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
                    <animateMotion
                      dur={`${speed}s`}
                      begin={`-${offset * speed}s`}
                      repeatCount="indefinite"
                      path={FULL_PATH}
                    />
                    <set attributeName="stroke" to="rgba(239,68,68,0.5)" />
                  </circle>
                )}
                {/* Pilgrim shadow */}
                <ellipse rx="0.5" ry="0.25" fill="rgba(0,0,0,0.35)">
                  <animateMotion
                    dur={`${speed}s`}
                    begin={`-${offset * speed}s`}
                    repeatCount="indefinite"
                    path={FULL_PATH}
                  />
                </ellipse>
                {/* Pilgrim dot */}
                <circle r="0.55" fill="#fff9e6" opacity="0.9">
                  <animateMotion
                    dur={`${speed}s`}
                    begin={`-${offset * speed}s`}
                    repeatCount="indefinite"
                    path={FULL_PATH}
                  />
                </circle>
                {/* Pilgrim glow */}
                <circle r="1.2" fill="rgba(255,249,230,0.15)">
                  <animateMotion
                    dur={`${speed}s`}
                    begin={`-${offset * speed}s`}
                    repeatCount="indefinite"
                    path={FULL_PATH}
                  />
                </circle>
              </g>
            )
          })}

          {/* TEMPLE at the summit */}
          <g transform={`translate(${WAYPOINTS[6].x}, ${WAYPOINTS[6].y})`} filter="url(#templeGlow)">
            {/* Golden aura */}
            <circle cx="0" cy="-3" r="6" fill="rgba(255,215,0,0.08)">
              <animate attributeName="r" values="5;7;5" dur="4s" repeatCount="indefinite" />
            </circle>
            {/* Foundation */}
            <rect x="-2.8" y="0" width="5.6" height="1" fill="#8b6914" rx="0.1" />
            <rect x="-2.4" y="-0.6" width="4.8" height="0.7" fill="#c8a96e" rx="0.1" />
            {/* Temple body */}
            <polygon points="-2,-0.6 2,-0.6 1.8,-3 -1.8,-3" fill="#c8a96e" />
            {/* Horizontal bands */}
            <line x1="-1.9" y1="-1.3" x2="1.9" y2="-1.3" stroke="rgba(0,0,0,0.2)" strokeWidth="0.12" />
            <line x1="-1.9" y1="-2.2" x2="1.9" y2="-2.2" stroke="rgba(0,0,0,0.2)" strokeWidth="0.12" />
            {/* Arched doorway */}
            <path d="M -0.5,0 L -0.5,-1 Q 0,-1.8 0.5,-1 L 0.5,0 Z" fill="#060810" />
            {/* Shikhara (main spire) */}
            <path d="M -1.8,-3 C -1.2,-4.5 -0.7,-6 0,-7.5 C 0.7,-6 1.2,-4.5 1.8,-3 Z" fill="#c8a96e" />
            {/* Shikhara highlight */}
            <path d="M -1.8,-3 C -1.2,-4.5 -0.7,-6 0,-7.5 C 0.7,-6 1.2,-4.5 1.8,-3 Z" fill="rgba(200,170,90,0.5)" clipPath="url(#leftHalf)" />
            {/* Amalaka disc */}
            <ellipse cx="0" cy="-7.5" rx="0.7" ry="0.25" fill="#FFD700" />
            {/* Kalash */}
            <circle cx="0" cy="-8" r="0.4" fill="#FFD700" />
            {/* Flag pole */}
            <line x1="0" y1="-8" x2="0" y2="-10" stroke="#FFD700" strokeWidth="0.12" />
            {/* Waving flag */}
            <polygon points="0,-10 1.8,-9.5 0,-9" fill="#FF9500">
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-5,0,-10;5,0,-10;-5,0,-10"
                dur="3s"
                repeatCount="indefinite"
              />
            </polygon>
            {/* Sub spirelets */}
            <path d="M -1.8,-3 C -1.8,-4 -1.3,-5 -1.3,-5 C -1,-4 -0.9,-3.5 -0.9,-3 Z" fill="#c8a96e" opacity="0.8" />
            <path d="M 1.8,-3 C 1.8,-4 1.3,-5 1.3,-5 C 1,-4 0.9,-3.5 0.9,-3 Z" fill="#c8a96e" opacity="0.8" />
          </g>

          {/* START marker */}
          <g>
            <rect x={WAYPOINTS[0].x - 4} y={WAYPOINTS[0].y + 1.5} width="8" height="2.5" rx="0.5" fill="rgba(34,197,94,0.2)" stroke="#22C55E" strokeWidth="0.15" />
            <text x={WAYPOINTS[0].x} y={WAYPOINTS[0].y + 3.3} textAnchor="middle" fontSize="1.3" fill="#22C55E" fontWeight="bold" fontFamily="Inter, system-ui, sans-serif">
              {t("base_label")}
            </text>
          </g>

          {/* PEAK marker */}
          <g>
            <rect x={WAYPOINTS[6].x + 3} y={WAYPOINTS[6].y - 1} width="8" height="2.5" rx="0.5" fill="rgba(255,215,0,0.15)" stroke="#FFD700" strokeWidth="0.15" />
            <text x={WAYPOINTS[6].x + 7} y={WAYPOINTS[6].y + 0.9} textAnchor="middle" fontSize="1.3" fill="#FFD700" fontWeight="bold" fontFamily="Inter, system-ui, sans-serif">
              {t("peak_label")}
            </text>
          </g>

          {/* Segment pressure labels (small pills) */}
          {PATH_SEGMENTS.map((seg, i) => {
            const p = segmentPressures[i]
            const meta = getColor(p)
            // Position label at midpoint of segment
            const wp1 = WAYPOINTS[i]
            const wp2 = WAYPOINTS[i + 1]
            const mx = (wp1.x + wp2.x) / 2 + 4
            const my = (wp1.y + wp2.y) / 2 - 1
            return (
              <g key={`label-${i}`} opacity={hoveredSeg === i ? 1 : 0.7} style={{ transition: "opacity 0.2s" }}>
                <rect x={mx - 2} y={my - 1} width="4.5" height="2" rx="0.5" fill="rgba(0,0,0,0.6)" stroke={meta.color} strokeWidth="0.12" />
                <text x={mx + 0.25} y={my + 0.5} textAnchor="middle" fontSize="1" fill={meta.color} fontWeight="bold" fontFamily="Inter, system-ui, sans-serif">
                  {Math.round(p)}%
                </text>
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredSeg !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 pointer-events-none"
              style={{
                left: Math.min(mousePos.x + 12, (containerRef.current?.offsetWidth ?? 400) - 180),
                top: Math.min(mousePos.y + 12, (containerRef.current?.offsetHeight ?? 300) - 120),
              }}
            >
              <div
                className="rounded-lg px-4 py-3 min-w-[155px] border border-white/10"
                style={{
                  background: "rgba(10,14,26,0.92)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <div className="text-[11px] font-bold text-white mb-2">{t("segment")} {hoveredSeg + 1}</div>
                <div className="space-y-1">
                  <div className="text-[10px] text-[#9CA3AF] text-nowrap">{t("flow_min")}</div>
                  <div className="text-[10px] text-[#9CA3AF] text-nowrap">{t("width_m")}</div>
                  <div 
                    className="text-[11px] font-bold mt-1.5"
                    style={{ color: getColor(segmentPressures[hoveredSeg]).color }}
                  >
                    {t("pressure_monitoring").split(" ")[0]}: {Math.round(segmentPressures[hoveredSeg])}%
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: getColor(segmentPressures[hoveredSeg]).color }}
                    />
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: getColor(segmentPressures[hoveredSeg]).color }}
                    >
                      {t(getColor(segmentPressures[hoveredSeg]).status.toLowerCase() as any)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Legend */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <div
            className="w-2 h-2 rounded-full border border-white/20 shadow-sm"
            style={{ background: segmentPressures[0] < 55 ? "#22C55E" : "#EF4444" }}
          />
          <span className="text-[10px] font-semibold text-white/80 tracking-wide uppercase">{t("main_entry_gate")}</span>
        </div>

        <div className="flex items-center justify-center gap-5 pt-3 border-t border-white/5">
          {[
            { label: "Safe (< 40)", color: "#22C55E" },
            { label: "Caution (40-70)", color: "#F59E0B" },
            { label: "Critical (> 70)", color: "#EF4444" },
          ].map((leg) => (
            <div key={leg.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: leg.color }} />
              <span className="text-[10px] text-[#7A8BAD] font-medium uppercase tracking-wide">{leg.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <span className="text-[9px] text-[#7A8BAD]/60 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
            <span>{t("showing_label")}: {corridor}</span>
            <span>·</span>
            <span>6 {t("segments_monitored")}</span>
            <span>·</span>
            <span>2 {t("chokepoints_label")}</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
