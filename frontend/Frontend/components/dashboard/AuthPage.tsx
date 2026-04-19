"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { BACKEND_URL } from "@/lib/config"

const CORRIDORS = ["Ambaji", "Dwarka", "Somnath", "Pavagadh"] as const
type Corridor = typeof CORRIDORS[number]

interface AuthPageProps {
  onLogin: (corridor: Corridor) => void
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const { t } = useLanguage()
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>("Ambaji")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError(false)

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corridor: selectedCorridor, password }),
      })

      const data = await response.json()

      if (data.success) {
         onLogin(selectedCorridor)
      } else {
        setError(true)
      }
    } catch (err) {
      console.error("Auth server unreachable:", err)
      // Don't fallback to client-side password check — show server error
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center bg-[#0B1220] overflow-hidden">
      {/* Background aesthetics */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.3), transparent 60%)",
        }}
      />
      
      {/* Moving grid background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4"
      >
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl shadow-blue-900/20 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-50" />
          
          <div className="text-center mb-6 md:mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img src="/logo.png" alt="CrowdShield Logo" className="w-full h-full object-contain scale-125" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-1 uppercase italic">{t("app_name")}</h1>
            <p className="text-[10px] text-[#7A8BAD] tracking-[0.3em] font-mono uppercase">{t("auth_title")}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#7A8BAD] tracking-widest uppercase ml-1">
                {t("auth_select_corridor")}
              </label>
              <div className="relative">
                <select 
                  value={selectedCorridor}
                  onChange={(e) => setSelectedCorridor(e.target.value as Corridor)}
                  className="w-full bg-[#0A0E1A]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none font-medium"
                >
                  {CORRIDORS.map(c => (
                    <option key={c} value={c}>{t(`corridor_${c.toLowerCase()}` as any)}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#7A8BAD] tracking-widest uppercase ml-1">
                {t("auth_name_label")}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full bg-[#0A0E1A]/80 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors`}
                placeholder="••••••"
              />
              {error && <p className="text-red-500 text-xs mt-1 ml-1">{t("auth_error")}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center disabled:opacity-70 disabled:hover:bg-emerald-600 tracking-widest text-sm"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : t("auth_btn")}
            </button>
            <p className="text-center text-[10px] text-[#7A8BAD] tracking-widest uppercase mt-4">
              {t("auth_secure")}
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
