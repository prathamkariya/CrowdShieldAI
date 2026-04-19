"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import LoadingScreen from "@/components/dashboard/LoadingScreen"
import HeroPage from "@/components/dashboard/HeroPage"
import Navbar from "@/components/dashboard/Navbar"
import LeftColumn from "@/components/dashboard/LeftColumn"
import CenterColumn from "@/components/dashboard/CenterColumn"
import RightColumn from "@/components/dashboard/RightColumn"
import AgencyStrip from "@/components/dashboard/AgencyStrip"
import ReplayMode from "@/components/dashboard/ReplayMode"
import EventLogArchive from "@/components/dashboard/EventLogArchive"
import AuthPage from "@/components/dashboard/AuthPage"
import LanguageSelector from "@/components/dashboard/LanguageSelector"
import { useSimulation } from "@/hooks/useSimulation"
import { useLanguage } from "@/contexts/LanguageContext"

type Corridor = "Ambaji" | "Dwarka" | "Somnath" | "Pavagadh"
type ViewMode = "dashboard" | "events"
type ThemeMode = "day" | "night"

function DashboardView({ 
  activeCorridor, 
  handleLogout, 
  viewMode, 
  setViewMode, 
  themeMode, 
  setThemeMode, 
  replayMode, 
  setReplayMode 
}: any) {
  const simData = useSimulation(activeCorridor)

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Navbar - now with live pilgrim count */}
      <Navbar
        activeCorridor={activeCorridor}
        replayMode={replayMode}
        onReplayToggle={() => setReplayMode(!replayMode)}
        onEventLogToggle={() => setViewMode(viewMode === "events" ? "dashboard" : "events")}
        onThemeToggle={() => setThemeMode(themeMode === "day" ? "night" : "day")}
        themeMode={themeMode}
        onLogout={handleLogout}
        pilgrimCount={simData.totalPilgrims}
      />

      {/* Main content */}
      <main className="px-4 pt-4 pb-6">
        <AnimatePresence mode="wait">
          {viewMode === "dashboard" && (
            <motion.div
              key="dashboard-inner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[25%_45%_30%] gap-4 lg:max-h-[calc(100vh-140px)] items-start">
                <div className="lg:h-[calc(100vh-160px)] lg:overflow-y-auto lg:overscroll-contain custom-scrollbar">
                  <LeftColumn corridor={activeCorridor} simData={simData} />
                </div>
                <div className="lg:h-[calc(100vh-160px)] lg:overflow-y-auto lg:overscroll-contain custom-scrollbar">
                  <CenterColumn corridor={activeCorridor} simData={simData} />
                </div>
                <div className="lg:h-[calc(100vh-160px)] lg:overflow-y-auto lg:overscroll-contain custom-scrollbar">
                  <RightColumn corridor={activeCorridor} simData={simData} />
                </div>
              </div>
              <div className="mt-6 flex overflow-x-auto pb-4 lg:pb-0">
                <AgencyStrip pressureIndex={simData.pressureIndex} />
              </div>
            </motion.div>
          )}

          {viewMode === "events" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <EventLogArchive onBack={() => setViewMode("dashboard")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ReplayMode
        isOpen={replayMode}
        onClose={() => setReplayMode(false)}
        corridor={activeCorridor}
        replayData={{}}
      />

      {/* SOS MOBILE DRAWER — Slides in from bottom/side on mobile when SOS is active */}
      <AnimatePresence>
        {simData.sosAlert && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed inset-x-0 bottom-0 z-[100] lg:hidden p-4 bg-black/80 backdrop-blur-xl border-t border-red-500/30"
          >
            <div className="max-h-[80vh] overflow-y-auto">
              <RightColumn corridor={activeCorridor} simData={simData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLanguageSelect, setShowLanguageSelect] = useState(true)
  const [showHero, setShowHero] = useState(true)
  const { t } = useLanguage()
  const [activeCorridor, setActiveCorridor] = useState<Corridor>("Ambaji")
  const [replayMode, setReplayMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")
  const [themeMode, setThemeMode] = useState<ThemeMode>("day")

  const bgColor = themeMode === "night" ? "#0B1220" : "#111827"

  const handleLogin = (corridor: Corridor) => {
    setActiveCorridor(corridor)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowHero(true)
    setViewMode("dashboard")
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: bgColor }}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />
        ) : showLanguageSelect ? (
          <LanguageSelector key="lang" onComplete={() => setShowLanguageSelect(false)} />
        ) : !isAuthenticated ? (
          <AuthPage key="auth" onLogin={handleLogin} />
        ) : showHero ? (
          <HeroPage key="hero" onEnter={() => setShowHero(false)} />
        ) : (
          <DashboardView
            activeCorridor={activeCorridor}
            handleLogout={handleLogout}
            viewMode={viewMode}
            setViewMode={setViewMode}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            replayMode={replayMode}
            setReplayMode={setReplayMode}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
