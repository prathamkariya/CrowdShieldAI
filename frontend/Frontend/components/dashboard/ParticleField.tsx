"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Use CSS size, not pixel size for performance
    let width = window.innerWidth
    let height = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance
    
    const resizeCanvas = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }
    resizeCanvas()
    
    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(resizeCanvas, 150)
    }
    window.addEventListener("resize", handleResize)

    // Reduced particle count for performance
    const particles: Particle[] = []
    const particleCount = 40

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.2 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
      })
    }

    let animationFrameId: number
    let lastTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)
      
      const delta = currentTime - lastTime
      if (delta < frameInterval) return
      lastTime = currentTime - (delta % frameInterval)

      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw connections - only check nearby particles (skip heavy O(n^2))
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)"
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 1; j < Math.min(i + 6, particles.length); j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy

          if (distSq < 14400) { // 120^2
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(resizeTimeout)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ 
        background: "transparent",
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    />
  )
}
