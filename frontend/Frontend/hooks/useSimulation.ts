import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { BACKEND_URL } from "@/lib/config"

export interface SimulationData {
  baseEntryRate: number
  transportBurst: number
  corridorWidthFactor: number
  pressureIndex: number
  pressureHistory: number[]
  surgeClassifier: string
  surgeDuration: number
  predictionMinutes: number | null
  pressureSources: {
    entryFlow: number
    transportBurst: number
    widthConstraint: number
  }
  vehicleArrivals: any[]
  timestamp: number
  totalPilgrims: number
  peakDensity: number
  avgFlowRate: string
  incidentsToday: number
  flowTrend: number
}



export function useSimulation(corridor: string = "Ambaji") {
  const [data, setData] = useState<SimulationData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [sosAlert, setSosAlert] = useState<any | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      transports: ["websocket"],
      timeout: 10000,
    })
    socketRef.current = socket

    socket.on("connect", () => {
      console.log(`✅ Connected to CrowdShield AI Backend: ${socket.id}`)
      setIsConnected(true)
      socket.emit("subscribe", corridor)
    })

    socket.on("corridorUpdate", (corridorObj: any) => {
      if (corridorObj.name === corridor) {
        // Map backend ML field to frontend interface field
        setData({
          ...corridorObj,
          predictionMinutes: corridorObj.mlCrushWindowMin ?? null,
        });
      }
    });

    socket.on("alertUpdate", (alert: any) => {
      if (alert.corridor === corridor) {
         // handle toast or alerts globally if needed
      }
    });

    socket.on("sosTrigger", (alert: any) => {
      if (alert.corridor === corridor) {
        console.log(`🚨 [FRONTEND] SOS TRIGGERED for ${alert.corridor}`, alert);
        setSosAlert(alert);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("connect_error", () => {
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [corridor])

  const executeAction = (action: string) => {
    if (socketRef.current && isConnected) {
      console.log(`📤 Dispatching Action: ${action} for ${corridor}`)
      socketRef.current.emit("action", { corridor, action })
    } else {
      console.error("🚫 Cannot execute action: Socket not connected")
    }
  }

  // Fallback while connecting or if offline
  const fallbackData: SimulationData = {
    baseEntryRate: 0,
    transportBurst: 0,
    corridorWidthFactor: 0.7,
    pressureIndex: 0,
    pressureHistory: Array(60).fill(0),
    surgeClassifier: "offline",
    surgeDuration: 0,
    predictionMinutes: null,
    pressureSources: { entryFlow: 0, transportBurst: 0, widthConstraint: 0 },
    vehicleArrivals: [],
    timestamp: Date.now(),
    totalPilgrims: 0,
    peakDensity: 0,
    avgFlowRate: "0.0k",
    incidentsToday: 0,
    flowTrend: 0
  }

  return {
    ...(data || fallbackData),
    isConnected,
    sosAlert,
    clearSos: () => setSosAlert(null),
    executeAction,
    socket: socketRef.current
  }
}
