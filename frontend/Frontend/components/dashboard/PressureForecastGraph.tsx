"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface PressureForecastGraphProps {
  pressureIndex: number
  pressureHistory: number[]
  predictionMinutes: number | null
}

export default function PressureForecastGraph({
  pressureIndex,
  pressureHistory,
  predictionMinutes,
}: PressureForecastGraphProps) {
  const { t } = useLanguage()
  // Generate chart data
  const generateChartData = () => {
    const data = []

    // Historical data: -20 to 0 minutes
    const historyLength = Math.min(pressureHistory.length, 20)
    for (let i = 0; i < historyLength; i++) {
      const minutesAgo = Math.floor((i - historyLength) * 15 / historyLength)
      data.push({
        time: minutesAgo,
        historical: pressureHistory[pressureHistory.length - historyLength + i],
        predicted: null,
      })
    }

    // Current point
    data.push({
      time: 0,
      historical: pressureIndex,
      predicted: pressureIndex,
    })

    // Predicted data: 0 to +15 minutes
    let currentPressure = pressureIndex
    const trend = pressureHistory.length >= 2
      ? pressureHistory[pressureHistory.length - 1] - pressureHistory[Math.max(0, pressureHistory.length - 5)]
      : 0

    for (let i = 1; i <= 15; i++) {
      let predictedValue = currentPressure + (trend * i) / 10
      
      // Add some natural variation
      predictedValue += (Math.sin(i) * 3)
      
      // Smooth towards threshold or away from it
      if (predictedValue > 70) {
        predictedValue = Math.min(100, predictedValue + 2)
      } else if (predictedValue > 60) {
        predictedValue = Math.min(70, predictedValue + 1)
      }

      data.push({
        time: i,
        historical: null,
        predicted: Math.max(0, Math.min(100, predictedValue)),
      })
    }

    return data
  }

  const chartData = generateChartData()

  // Find if predicted line crosses threshold
  const thresholdCrossing = chartData.find(
    d => d.predicted && d.predicted > 70 && d.time > 0
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      const value = payload[0].value
      return (
        <div className='bg-[rgba(10,14,26,0.95)] border border-[rgba(255,255,255,0.2)] rounded px-2 py-1 text-[10px]'>
          <p className='text-[#7A8BAD]'>
            {data.time === 0 ? t("status_now") : data.time > 0 ? `+${data.time}m` : `${data.time}m`}
          </p>
          <p style={{ color: '#EF4444' }} className='font-semibold'>
            {Math.round(value)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.section
      className='glass-card rounded-2xl p-5'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xs font-bold tracking-widest uppercase text-[#7A8BAD]'>
          {t("pressure_forecast_title")}
        </h2>
        {thresholdCrossing && (
          <motion.span
            className='text-[10px] font-semibold px-2 py-1 rounded'
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ⚠ {t("projected_breach")} {thresholdCrossing.time}m
          </motion.span>
        )}
      </div>

      <motion.div
        className='relative'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <ResponsiveContainer width='100%' height={220}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id='forecastGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='rgba(239,68,68,0.3)' />
                <stop offset='100%' stopColor='rgba(239,68,68,0.05)' />
              </linearGradient>
              <linearGradient id='historyGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='rgba(255,255,255,0.3)' />
                <stop offset='100%' stopColor='rgba(255,255,255,0.05)' />
              </linearGradient>
            </defs>

            <XAxis
              dataKey='time'
              type='number'
              domain={[-20, 15]}
              ticks={[-20, -10, 0, 10]}
              tickFormatter={v => v === 0 ? t("status_now") : v > 0 ? `+${v}m` : `${v}m`}
              stroke='rgba(255,255,255,0.15)'
              style={{ fontSize: '10px', fill: '#7A8BAD' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 70, 100]}
              tickFormatter={v => `${v}%`}
              stroke='rgba(255,255,255,0.15)'
              style={{ fontSize: '10px', fill: '#7A8BAD' }}
            />

            {/* Threshold line at 70 */}
            <Line
              type='linear'
              dataKey={() => 70}
              stroke='#EF4444'
              strokeWidth={1.5}
              strokeDasharray='4 4'
              dot={false}
              isAnimationActive={false}
              name={t("crush_threshold")}
            />

            {/* Historical data - solid white/light */}
            <Line
              type='monotone'
              dataKey='historical'
              stroke='rgba(255,255,255,0.6)'
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name={t("historical_label")}
            />

            {/* Predicted data - dashed amber */}
            <Line
              type='monotone'
              dataKey='predicted'
              stroke='#F59E0B'
              strokeWidth={2}
              strokeDasharray='5 3'
              dot={false}
              isAnimationActive={false}
              name={t("predicted_label")}
            />

            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Legend */}
      <div className='flex items-center justify-between gap-4 mt-4 text-[10px]'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-0.5' style={{ background: 'rgba(255,255,255,0.6)' }} />
          <span className='text-[#7A8BAD]'>{t("historical_label")}</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-0.5 border-t border-dashed' style={{ background: '#F59E0B' }} />
          <span className='text-[#7A8BAD]'>{t("predicted_label")}</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-0.5 border-t border-dashed' style={{ background: '#EF4444' }} />
          <span className='text-[#7A8BAD]'>{t("threshold_label")}</span>
        </div>
      </div>
    </motion.section>
  )
}
