'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMotionValue, useTransform } from 'framer-motion'

interface HillPathMapProps {
  corridor: string
  pressureIndex: number
  pressureHistory: number[]
}

export default function HillPathMap({ corridor, pressureIndex, pressureHistory }: HillPathMapProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])
  const containerRef = useRef<HTMLDivElement>(null)

  // Hill shape based on corridor
  const hillShapes: Record<string, { pathD: string; steepness: number }> = {
    Pavagadh: {
      pathD: 'M 50 200 L 30 100 L 50 20 L 70 100 Z',
      steepness: 0.8,
    },
    Ambaji: {
      pathD: 'M 50 200 L 25 120 L 50 20 L 75 120 Z',
      steepness: 0.6,
    },
    Somnath: {
      pathD: 'M 50 200 L 28 110 L 50 20 L 72 110 Z',
      steepness: 0.65,
    },
    Dwarka: {
      pathD: 'M 50 200 L 32 130 L 50 20 L 68 130 Z',
      steepness: 0.55,
    },
  }

  const hillShape = hillShapes[corridor] || hillShapes.Ambaji

  // Define 6 path segments with their pressures
  const segments = [
    { id: 0, start: '50 200', end: '42 170', label: 'Segment 1' },
    { id: 1, start: '42 170', end: '35 140', label: 'Segment 2' },
    { id: 2, start: '35 140', end: '38 100', label: 'Segment 3' },
    { id: 3, start: '38 100', end: '45 60', label: 'Segment 4' },
    { id: 4, start: '45 60', end: '50 35', label: 'Segment 5' },
    { id: 5, start: '50 35', end: '50 20', label: 'Temple', isTemple: true },
  ]

  // Get pressure for each segment
  const getSegmentPressure = (segmentId: number): number => {
    if (pressureHistory.length === 0) return 0
    const offset = Math.floor((segmentId / 6) * pressureHistory.length)
    return pressureHistory[offset] || pressureIndex
  }

  // Get color for pressure
  const getPressureColor = (pressure: number): string => {
    if (pressure < 40) return '#00C48C'
    if (pressure < 55) return '#FFD60A'
    if (pressure < 70) return '#FF9500'
    return '#FF3B3B'
  }

  // Animate pilgrim dots along path
  const [pilgrims, setPilgrims] = useState<Array<{ id: string; progress: number }>>([])

  useEffect(() => {
    const pilgrims = Array.from({ length: 8 }, (_, i) => ({
      id: `pilgrim-${i}`,
      progress: (i / 8) * 100,
    }))
    setPilgrims(pilgrims)

    const interval = setInterval(() => {
      setPilgrims(prev =>
        prev.map(p => ({
          ...p,
          progress: (p.progress + 0.3) % 100,
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [pressureIndex])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  return (
    <motion.section
      className='glass-card rounded-2xl p-5'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.34 }}
    >
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xs font-bold tracking-widest uppercase text-[#7A8BAD]'>
          Live Corridor Density Map
        </h2>
        <span className='text-[10px] text-[#7A8BAD]'>6 Segments</span>
      </div>

      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          mouseX.set(0)
          mouseY.set(0)
        }}
        style={{
          perspective: 1000,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className='relative rounded-xl overflow-hidden bg-gradient-to-b from-[rgba(0,196,140,0.05)] to-[rgba(255,59,59,0.05)] p-4 mb-4'
      >
        <svg viewBox='0 0 100 220' className='w-full h-64'>
          <defs>
            <linearGradient id='hillGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='rgba(0,196,140,0.1)' />
              <stop offset='100%' stopColor='rgba(255,59,59,0.1)' />
            </linearGradient>
            <filter id='segmentGlow'>
              <feGaussianBlur stdDeviation='1.5' result='blur' />
              <feMerge>
                <feMergeNode in='blur' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
          </defs>

          {/* Hill background */}
          <motion.path
            d={hillShape.pathD}
            fill='url(#hillGrad)'
            stroke='rgba(255,255,255,0.1)'
            strokeWidth='0.5'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Path segments */}
          {segments.map((segment, idx) => {
            const pressure = getSegmentPressure(segment.id)
            const color = getPressureColor(pressure)
            const isChokepoint = pressure > 60 && !segment.isTemple
            const isPulsing = pressure > 70

            return (
              <motion.g key={segment.id}>
                {/* Segment line */}
                <motion.line
                  x1={segment.start.split(' ')[0]}
                  y1={segment.start.split(' ')[1]}
                  x2={segment.end.split(' ')[0]}
                  y2={segment.end.split(' ')[1]}
                  stroke={color}
                  strokeWidth={isPulsing ? '3' : '2.5'}
                  strokeLinecap='round'
                  filter='url(#segmentGlow)'
                  initial={{ strokeOpacity: 0 }}
                  animate={{ strokeOpacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setHoveredSegment(segment.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.3s ease',
                  }}
                />

                {/* Animated glow for critical segments */}
                {isPulsing && (
                  <motion.line
                    x1={segment.start.split(' ')[0]}
                    y1={segment.start.split(' ')[1]}
                    x2={segment.end.split(' ')[0]}
                    y2={segment.end.split(' ')[1]}
                    stroke={color}
                    strokeWidth='4'
                    opacity={0.3}
                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Chokepoint warning triangle */}
                {isChokepoint && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                  >
                    <polygon
                      points={`${parseInt(segment.start.split(' ')[0]) + 3},${parseInt(segment.start.split(' ')[1]) - 3} ${parseInt(segment.start.split(' ')[0]) + 8},${parseInt(segment.start.split(' ')[1]) + 3} ${parseInt(segment.start.split(' ')[0]) - 2},${parseInt(segment.start.split(' ')[1]) + 3}`}
                      fill={color}
                    />
                  </motion.g>
                )}

                {/* Hover tooltip */}
                {hoveredSegment === segment.id && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <rect
                      x={parseInt(segment.end.split(' ')[0]) + 2}
                      y={parseInt(segment.end.split(' ')[1]) - 8}
                      width='35'
                      height='14'
                      fill='rgba(10,14,26,0.9)'
                      stroke={color}
                      strokeWidth='0.5'
                      rx='2'
                    />
                    <text
                      x={parseInt(segment.end.split(' ')[0]) + 4}
                      y={parseInt(segment.end.split(' ')[1]) - 1}
                      fontSize='2.5'
                      fill={color}
                      fontWeight='600'
                    >
                      {Math.round(pressure)}%
                    </text>
                  </motion.g>
                )}
              </motion.g>
            )
          })}

          {/* Temple icon */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <circle cx='50' cy='20' r='5' fill='#FFD60A' opacity='0.8' />
            <polygon
              points='50,12 54,18 46,18'
              fill='#FFD60A'
            />
            <circle
              cx='50'
              cy='20'
              r='6'
              fill='none'
              stroke='#FFD60A'
              strokeWidth='0.5'
            />
          </motion.g>

          {/* Animated pilgrim dots */}
          {pilgrims.map(pilgrim => {
            const progress = (pilgrim.progress / 100) * 180
            const x = 50 - (progress / 180) * 0
            const y = 200 - (progress / 180) * 180
            const speedFactor = Math.max(0.3, 1 - pressureIndex / 100)

            return (
              <motion.circle
                key={pilgrim.id}
                cx={x}
                cy={y}
                r='1.2'
                fill='#00C48C'
                opacity={0.7}
                animate={{
                  cx: [50, 42, 35, 38, 45, 50],
                  cy: [200, 170, 140, 100, 60, 20],
                }}
                transition={{
                  duration: 20 / speedFactor,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: (pilgrim.progress / 100) * 20,
                }}
              />
            )
          })}
        </svg>
      </motion.div>

      {/* Color legend */}
      <div className='flex items-center justify-between gap-4 text-[10px]'>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full' style={{ background: '#00C48C' }} />
          <span className='text-[#7A8BAD]'>&lt; 40 (Safe)</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full' style={{ background: '#FFD60A' }} />
          <span className='text-[#7A8BAD]'>40–55 (Monitor)</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full' style={{ background: '#FF9500' }} />
          <span className='text-[#7A8BAD]'>55–70 (Alert)</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full' style={{ background: '#FF3B3B' }} />
          <span className='text-[#7A8BAD]'>&gt; 70 (Critical)</span>
        </div>
      </div>
    </motion.section>
  )
}
