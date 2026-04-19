import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface CrushWindowCountdownProps {
  pressureIndex: number
  predictionMinutes: number | null
}

export default function CrushWindowCountdown({
  pressureIndex,
  predictionMinutes,
}: CrushWindowCountdownProps) {
  const { t } = useLanguage()
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [state, setState] = useState<'inactive' | 'watch' | 'critical'>('inactive')
  const totalSecondsRef = useRef<number | null>(null)
  const prevStateRef = useRef<string>('inactive')

  // Determine state based on pressure and prediction
  useEffect(() => {
    if (pressureIndex < 60) {
      setState('inactive')
    } else if (pressureIndex < 70 && predictionMinutes && predictionMinutes >= 8) {
      setState('watch')
    } else if (pressureIndex >= 70 || (predictionMinutes && predictionMinutes < 8)) {
      setState('critical')
    } else if (pressureIndex >= 60) {
      setState('watch')
    } else {
      setState('inactive')
    }
  }, [pressureIndex, predictionMinutes])

  // Countdown timer — seed once when state transitions from inactive
  useEffect(() => {
    if (state === 'inactive') {
      setTimeLeft('')
      totalSecondsRef.current = null
      prevStateRef.current = 'inactive'
      return
    }

    if (!predictionMinutes) {
      setTimeLeft('')
      return
    }

    // Only seed the countdown when state transitions from inactive to active
    if (prevStateRef.current === 'inactive' && state !== 'inactive') {
      totalSecondsRef.current = predictionMinutes * 60
    }
    prevStateRef.current = state

    if (totalSecondsRef.current === null) {
      totalSecondsRef.current = predictionMinutes * 60
    }

    const interval = setInterval(() => {
      if (totalSecondsRef.current !== null) {
        totalSecondsRef.current = Math.max(0, totalSecondsRef.current - 1)
        const mins = Math.floor(totalSecondsRef.current / 60)
        const secs = totalSecondsRef.current % 60
        setTimeLeft(`${mins}m ${secs.toString().padStart(2, '0')}s`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [state, predictionMinutes])

  const stateConfig = {
    inactive: {
      bg: 'glass-card',
      icon: '✓',
      color: '#00C48C',
      title: t('risk_none'),
      description: '',
      bgClass: 'bg-[rgba(0,196,140,0.03)] border-[rgba(0,196,140,0.15)]',
    },
    watch: {
      bg: 'glass-card-warning',
      icon: '⚠',
      color: '#FF9500',
      title: t('risk_window'),
      description: t('risk_monitor'),
      bgClass: 'bg-[rgba(255,149,0,0.08)] border-[rgba(255,149,0,0.25)]',
    },
    critical: {
      bg: 'glass-card-critical',
      icon: '🚨',
      color: '#FF3B3B',
      title: t('risk_act'),
      description: t('risk_imminent'),
      bgClass: 'bg-[rgba(255,59,59,0.1)] border-[rgba(255,59,59,0.3)]',
    },
  }

  const config = stateConfig[state]

  return (
    <motion.section
      className={`rounded-2xl p-5 border transition-all ${config.bgClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.42 }}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-2xl'>{config.icon}</span>
            <div>
              <h2 className='text-xs font-bold tracking-widest uppercase text-[#7A8BAD]'>
                {config.title}
              </h2>
              {config.description && (
                <p className='text-[10px] text-[#7A8BAD]'>{config.description}</p>
              )}
            </div>
          </div>

          {/* Status indicator dot */}
          <div className='flex items-center gap-1.5 mb-3'>
            <motion.span
              className='w-2 h-2 rounded-full'
              style={{ background: config.color }}
              animate={state === 'critical' ? { opacity: [0.6, 1] } : { opacity: 1 }}
              transition={{ duration: 1, repeat: state === 'critical' ? Infinity : 0 }}
            />
            <span className='text-[10px] font-mono text-[#7A8BAD]'>
              {state === 'inactive' && t('system_ok')}
              {state === 'watch' && t('watch_mode')}
              {state === 'critical' && t('critical_alert')}
            </span>
          </div>

          {/* Countdown display */}
          <AnimatePresence mode='wait'>
            {state !== 'inactive' && timeLeft && (
              <motion.div
                key='countdown'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className='mb-2'
              >
                <div
                  className='text-2xl font-bold font-mono tracking-tighter'
                  style={{ color: config.color }}
                >
                  {timeLeft}
                </div>
                {state === 'critical' && (
                  <motion.div
                    className='text-[10px] mt-1'
                    style={{ color: config.color }}
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {t('to_breach')}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className='text-[9px] text-[#7A8BAD] leading-tight'>
            {t('risk_basis')}
          </p>
        </div>

        {/* Right side visual indicator */}
        {state !== 'inactive' && (
          <motion.div
            className='ml-4'
            animate={state === 'critical' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: state === 'critical' ? Infinity : 0 }}
          >
            <div
              className='w-12 h-12 rounded-xl flex items-center justify-center'
              style={{
                background: `${config.color}15`,
                border: `1px solid ${config.color}30`,
              }}
            >
              <div
                className='w-8 h-8 rounded-lg flex items-center justify-center'
                style={{
                  background: `${config.color}25`,
                }}
              >
                <div
                  className='w-4 h-4 rounded-full'
                  style={{
                    background: config.color,
                    opacity: state === 'critical' ? 0.8 : 0.6,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Warning bar for critical state */}
      {state === 'critical' && (
        <motion.div
          className='mt-3 h-0.5 rounded-full overflow-hidden'
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <motion.div
            className='h-full rounded-full'
            style={{ background: config.color }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}
    </motion.section>
  )
}
