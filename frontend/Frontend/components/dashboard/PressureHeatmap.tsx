"use client"

import { motion } from "framer-motion"

interface HeatmapCell {
  corridor: string
  time: string
  index: number
  pressureIndex: number
}

const CORRIDORS = ["Ambaji", "Ropeway", "Entry B2", "Temple Gate"]

const generateHeatmapData = (): HeatmapCell[] => {
  const data: HeatmapCell[] = []
  let cellIndex = 0

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 12; col++) {
      const timeOffset = col * 5
      const hour = 14
      const minute = Math.max(0, 35 - timeOffset)
      data.push({
        corridor: CORRIDORS[row],
        time: `${hour}:${minute < 10 ? "0" : ""}${minute}`,
        index: cellIndex++,
        pressureIndex: Math.random() * 100,
      })
    }
  }

  return data
}

function getPressureColor(pressure: number): string {
  if (pressure < 30) return "#00C48C" // Green - safe
  if (pressure < 60) return "#FF9500" // Amber - warning
  return "#FF3B3B" // Red - critical
}

export default function PressureHeatmap() {
  const data = generateHeatmapData()

  return (
    <motion.section
      className="glass-card rounded-2xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.55 }}
    >
      <h2 className="text-xs font-bold tracking-widest uppercase text-[#7A8BAD] mb-4">60-Minute Pressure Heatmap</h2>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Time labels */}
          <div className="flex items-end mb-2">
            <div className="w-24" /> {/* Spacer for corridor names */}
            <div className="flex gap-0.5">
              {Array.from({ length: 12 }).map((_, col) => {
                const timeOffset = col * 5
                const minute = Math.max(0, 35 - timeOffset)
                return (
                  <div key={`time-${col}`} className="w-8 text-center text-[8px] text-[#7A8BAD] font-mono">
                    -{timeOffset}m
                  </div>
                )
              })}
            </div>
          </div>

          {/* Grid rows */}
          {CORRIDORS.map((corridor, row) => (
            <div key={corridor} className="flex items-center gap-2 mb-1">
              {/* Corridor label */}
              <div className="w-24 text-[9px] font-bold text-[#7A8BAD] truncate">{corridor}</div>

              {/* Cells */}
              <div className="flex gap-0.5">
                {data.slice(row * 12, (row + 1) * 12).map((cell, i) => {
                  const pressure = cell.pressureIndex
                  const color = getPressureColor(pressure)

                  return (
                    <motion.div
                      key={`${corridor}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (row * 12 + i) * 0.02 }}
                      whileHover={{ scale: 1.15 }}
                      className="w-8 h-8 rounded cursor-pointer group relative"
                      style={{
                        background: color,
                        opacity: 0.4 + (pressure / 100) * 0.6,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {/* Tooltip */}
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-[9px] font-mono whitespace-nowrap pointer-events-none"
                        style={{
                          background: "rgba(10, 14, 26, 0.95)",
                          border: `1px solid ${color}40`,
                          color: color,
                        }}
                      >
                        {corridor} · {cell.time} · Index: {Math.round(pressure)}
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-[9px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: "#00C48C" }} />
          <span className="text-[#7A8BAD]">Safe {"(<30)"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: "#FF9500" }} />
          <span className="text-[#7A8BAD]">Warning {"(30-60)"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ background: "#FF3B3B" }} />
          <span className="text-[#7A8BAD]">Critical {">60"}</span>
        </div>
      </div>
    </motion.section>
  )
}
