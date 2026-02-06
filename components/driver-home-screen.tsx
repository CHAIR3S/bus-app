"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"

export type RouteStatus = "not-started" | "in-progress" | "completed"

export interface BusRoute {
  id: string
  name: string
  stops: Array<{
    id: string
    name: string
    position: [number, number]
    reached: boolean
  }>
  path: [number, number][]
}

export interface TripSummary {
  totalTime: number
  distance: number
  stopsReached: number
  totalStops: number
}

interface NavStep {
  instruction: string
  distance: string
  type: number
  pointIndex: number
}

interface DriverHomeScreenProps {
  onOpenSettings: () => void
  onTripComplete: (summary: TripSummary) => void
}

const DEMO_ROUTE: BusRoute = {
  id: "ruta-42",
  name: "Ruta 42 Express",
  stops: [
    { id: "1", name: "Terminal Norte", position: [20.535, -100.82], reached: false },
    { id: "2", name: "Plaza Mayor", position: [20.53, -100.815], reached: false },
    { id: "3", name: "Centro Historico", position: [20.525, -100.81], reached: false },
    { id: "4", name: "Parque Juarez", position: [20.52, -100.805], reached: false },
    { id: "5", name: "Hospital General", position: [20.515, -100.8], reached: false },
    { id: "6", name: "Terminal Sur", position: [20.51, -100.795], reached: false },
  ],
  path: [],
}

const DRIVER_SCHEDULE = [
  { id: 1, departure: "06:00", arrival: "06:45", route: "Ruta 42", status: "completado" },
  { id: 2, departure: "07:00", arrival: "07:45", route: "Ruta 42", status: "completado" },
  { id: 3, departure: "08:15", arrival: "09:00", route: "Ruta 42", status: "en curso" },
  { id: 4, departure: "09:30", arrival: "10:15", route: "Ruta 42", status: "pendiente" },
  { id: 5, departure: "10:45", arrival: "11:30", route: "Ruta 42", status: "pendiente" },
  { id: 6, departure: "12:00", arrival: "12:45", route: "Ruta 42", status: "pendiente" },
  { id: 7, departure: "13:15", arrival: "14:00", route: "Ruta 42", status: "pendiente" },
  { id: 8, departure: "14:30", arrival: "15:15", route: "Ruta 42", status: "pendiente" },
]

function getNavIcon(type: number) {
  switch (type) {
    case 0:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      )
    case 1:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )
    case 2:
    case 4:
    case 12:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
      )
    case 3:
    case 5:
    case 13:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      )
    case 6:
    case 11:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    case 7:
    case 8:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    case 10:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    default:
      return (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
  }
}

// Helper: find closest stop index to a route point
function findClosestStopIndex(
  point: [number, number],
  stops: BusRoute["stops"],
  lastReachedIndex: number
): number {
  const THRESHOLD = 0.0008 // ~80 meters
  for (let i = lastReachedIndex + 1; i < stops.length; i++) {
    const dx = point[0] - stops[i].position[0]
    const dy = point[1] - stops[i].position[1]
    if (Math.sqrt(dx * dx + dy * dy) < THRESHOLD) {
      return i
    }
  }
  return -1
}

export function DriverHomeScreen({ onOpenSettings, onTripComplete }: DriverHomeScreenProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const busMarkerRef = useRef<any>(null)
  const remainingRouteRef = useRef<any>(null)
  const stopMarkersRef = useRef<any[]>([])
  const animationRef = useRef<number | null>(null)

  const [routeStatus, setRouteStatus] = useState<RouteStatus>("not-started")
  const [route, setRoute] = useState<BusRoute>(DEMO_ROUTE)
  const [busPosition, setBusPosition] = useState<[number, number]>(DEMO_ROUTE.stops[0].position)
  const [currentPathIndex, setCurrentPathIndex] = useState(0)
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [tripStartTime, setTripStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [mapReady, setMapReady] = useState(false)
  const [isLoadingRoute, setIsLoadingRoute] = useState(true)
  const [routeDistance, setRouteDistance] = useState(0)
  const [navSteps, setNavSteps] = useState<NavStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [panelTab, setPanelTab] = useState<"ruta" | "horarios">("ruta")

  const touchStartY = useRef(0)

  // Fetch route
  useEffect(() => {
    const fetchDrivingRoute = async () => {
      setIsLoadingRoute(true)
      try {
        const stopPositions = DEMO_ROUTE.stops.map((s) => s.position)
        const response = await fetch("/api/driving-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stops: stopPositions }),
        })
        if (!response.ok) throw new Error("Failed to fetch route")
        const data = await response.json()
        setRoute((prev) => ({ ...prev, path: data.route }))
        setRouteDistance(data.distance)
        if (data.steps) setNavSteps(data.steps)
      } catch (error) {
        console.error("Error fetching driving route:", error)
        const fallbackPath = DEMO_ROUTE.stops.map((s) => s.position)
        setRoute((prev) => ({ ...prev, path: fallbackPath }))
      } finally {
        setIsLoadingRoute(false)
      }
    }
    fetchDrivingRoute()
  }, [])

  // Timer
  useEffect(() => {
    if (routeStatus !== "in-progress" || !tripStartTime) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - tripStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [routeStatus, tripStartTime])

  // Simulate speed
  useEffect(() => {
    if (routeStatus !== "in-progress") {
      setSpeed(0)
      return
    }
    const interval = setInterval(() => {
      setSpeed(Math.floor(20 + Math.random() * 30))
    }, 2500)
    return () => clearInterval(interval)
  }, [routeStatus])

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let isMounted = true
    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")
        ;(window as any).L = L
        if (!isMounted || !mapRef.current || mapInstanceRef.current) return
        const container = mapRef.current
        if ((container as any)._leaflet_id) delete (container as any)._leaflet_id
        const map = L.map(mapRef.current, {
          center: [20.5234, -100.8157],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        })
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map)
        mapInstanceRef.current = map
        setMapReady(true)
        const bounds = L.latLngBounds(DEMO_ROUTE.stops.map((s) => s.position))
        map.fitBounds(bounds, { padding: [50, 50] })
      } catch (err) {
        console.error("Error loading map:", err)
      }
    }
    initMap()
    return () => { isMounted = false }
  }, [])

  // Draw initial full route + stop markers (once route is loaded)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || route.path.length < 2) return
    const L = (window as any).L
    if (!L) return
    const map = mapInstanceRef.current

    // Remove old stop markers
    for (const m of stopMarkersRef.current) {
      try { map.removeLayer(m) } catch {}
    }
    stopMarkersRef.current = []

    // Draw full route (will be replaced by remaining route during animation)
    if (remainingRouteRef.current) {
      try { map.removeLayer(remainingRouteRef.current) } catch {}
    }
    remainingRouteRef.current = L.polyline(route.path, {
      color: "#3b82f6",
      weight: 6,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map)

    // Stop markers
    route.stops.forEach((stop, index) => {
      const stopIcon = L.divIcon({
        className: "stop-marker",
        html: `<div style="
          width: 18px; height: 18px;
          background: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })
      const marker = L.marker([stop.position[0], stop.position[1]], { icon: stopIcon })
        .addTo(map)
        .bindPopup(
          `<div style="padding:8px 12px;text-align:center;font-family:system-ui;">
            <p style="margin:0;font-weight:600;font-size:13px;">${stop.name}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#64748b;">Parada ${index + 1}</p>
          </div>`,
          { closeButton: false, className: "custom-popup" }
        )
      stopMarkersRef.current.push(marker)
    })

    // Bus marker at start
    if (busMarkerRef.current) {
      try { map.removeLayer(busMarkerRef.current) } catch {}
    }
    const busIcon = L.divIcon({
      className: "bus-marker",
      html: `<div style="
        width:44px;height:44px;
        background:#f97316;
        border-radius:12px;
        border:3px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    })
    busMarkerRef.current = L.marker([route.path[0][0], route.path[0][1]], { icon: busIcon, zIndexOffset: 1000 }).addTo(map)
  }, [route.path.length, mapReady])

  // ============ SMOOTH BUS ANIMATION ============
  useEffect(() => {
    if (routeStatus !== "in-progress" || route.path.length < 2) return

    const L = (window as any).L
    if (!L || !mapInstanceRef.current) return
    const map = mapInstanceRef.current

    let pathIdx = currentPathIndex
    let localStopIdx = currentStopIndex

    const MOVE_INTERVAL = 120 // ms between each point advance (smooth movement)

    const intervalId = setInterval(() => {
      if (pathIdx >= route.path.length - 1) {
        clearInterval(intervalId)
        // Trip complete
        setCurrentPathIndex(route.path.length - 1)
        setCurrentStopIndex(route.stops.length - 1)
        return
      }

      pathIdx += 1

      const newPos = route.path[pathIdx]

      // Move bus marker smoothly
      if (busMarkerRef.current) {
        busMarkerRef.current.setLatLng([newPos[0], newPos[1]])
      }

      // Update remaining route (erase traveled portion)
      const remainingPath = route.path.slice(pathIdx)
      if (remainingRouteRef.current) {
        remainingRouteRef.current.setLatLngs(remainingPath)
      }

      // Pan map to follow bus
      map.panTo([newPos[0], newPos[1]], { animate: true, duration: 0.1, noMoveStart: true })

      // Check if bus reached a stop
      const reachedStop = findClosestStopIndex(newPos, route.stops, localStopIdx)
      if (reachedStop > localStopIdx) {
        localStopIdx = reachedStop

        // Update stop marker to reached style
        const stopMarker = stopMarkersRef.current[reachedStop]
        if (stopMarker) {
          const reachedIcon = L.divIcon({
            className: "stop-marker",
            html: `<div style="
              width:22px;height:22px;
              background:#22c55e;
              border-radius:50%;
              border:3px solid white;
              box-shadow:0 2px 8px rgba(34,197,94,0.4);
            "></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          })
          stopMarker.setIcon(reachedIcon)
        }

        setCurrentStopIndex(localStopIdx)

        // If reached last stop, finish
        if (localStopIdx >= route.stops.length - 1) {
          clearInterval(intervalId)
        }
      }

      // Advance nav step
      if (navSteps.length > 0) {
        const nextStepIdx = navSteps.findIndex((s, i) => i > currentStepIndex && s.pointIndex <= pathIdx)
        if (nextStepIdx > 0) {
          setCurrentStepIndex(nextStepIdx)
        }
      }

      setCurrentPathIndex(pathIdx)
      setBusPosition(newPos)
    }, MOVE_INTERVAL)

    return () => clearInterval(intervalId)
    // Only re-run when routeStatus changes, not on every state update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeStatus, route.path.length])

  const handleStartRoute = () => {
    setRouteStatus("in-progress")
    setTripStartTime(Date.now())
    setCurrentPathIndex(0)
    setCurrentStopIndex(0)
    setCurrentStepIndex(0)
    setBusPosition(route.path[0] || DEMO_ROUTE.stops[0].position)
  }

  const handleFinishRoute = useCallback(() => {
    setRouteStatus("completed")
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    const summary: TripSummary = {
      totalTime: elapsedTime,
      distance: routeDistance > 0 ? routeDistance : 3.2,
      stopsReached: currentStopIndex + 1,
      totalStops: route.stops.length,
    }
    onTripComplete(summary)
  }, [elapsedTime, currentStopIndex, route.stops.length, onTripComplete, routeDistance])

  // Auto-finish when last stop reached
  useEffect(() => {
    if (routeStatus === "in-progress" && currentStopIndex >= route.stops.length - 1 && route.stops.length > 1) {
      const timeout = setTimeout(() => handleFinishRoute(), 1500)
      return () => clearTimeout(timeout)
    }
  }, [currentStopIndex, routeStatus, route.stops.length, handleFinishRoute])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = () => {
    switch (routeStatus) {
      case "not-started": return "bg-red-500"
      case "in-progress": return "bg-green-500"
      case "completed": return "bg-slate-400"
    }
  }

  const getStatusText = () => {
    switch (routeStatus) {
      case "not-started": return "No iniciado"
      case "in-progress": return "En recorrido"
      case "completed": return "Finalizado"
    }
  }

  const getScheduleStatusStyle = (status: string) => {
    switch (status) {
      case "completado": return "bg-green-100 text-green-700"
      case "en curso": return "bg-orange-100 text-orange-700"
      default: return "bg-slate-100 text-slate-600"
    }
  }

  const currentStep = navSteps[currentStepIndex]
  const nextStep = navSteps[currentStepIndex + 1]

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (delta > 60) setPanelExpanded(true)
    else if (delta < -60) setPanelExpanded(false)
  }

  const routeProgress = route.path.length > 1 ? Math.round((currentPathIndex / (route.path.length - 1)) * 100) : 0

  return (
    <div className="h-screen bg-slate-100 flex flex-col relative overflow-hidden">
      <style jsx global>{`
        @keyframes pulse-stop {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 8px rgba(249,115,22,0.4); }
          50% { transform: scale(1.15); box-shadow: 0 4px 16px rgba(249,115,22,0.6); }
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: white; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12); padding: 0;
        }
        .custom-popup .leaflet-popup-content { margin: 0; }
        .custom-popup .leaflet-popup-tip { background: white; }
        .leaflet-container { z-index: 1 !important; }
      `}</style>

      {/* Map */}
      <div className="absolute inset-0">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* ===== OVERLAY UI ===== */}

      {/* Nav instruction banner */}
      {routeStatus === "in-progress" && currentStep && (
        <div className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-4">
          <div className="bg-green-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center flex-shrink-0">
                {getNavIcon(currentStep.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-lg leading-tight truncate">
                  {currentStep.instruction}
                </p>
                <p className="text-green-200 text-sm mt-0.5">{currentStep.distance}</p>
              </div>
            </div>
            {nextStep && (
              <div className="bg-green-700/60 px-5 py-2 flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center opacity-70">
                  {getNavIcon(nextStep.type)}
                </div>
                <p className="text-green-100 text-sm truncate">{"Luego: " + nextStep.instruction}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoadingRoute && (
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 z-[1000]">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-600">Calculando ruta...</span>
        </div>
      )}

      {/* Settings button - only when NOT navigating (moves to avoid nav banner) */}
      {routeStatus !== "in-progress" && (
        <button
          onClick={onOpenSettings}
          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-[1000]"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Zoom controls */}
      <div className="absolute right-4 flex flex-col gap-2 z-[1000]" style={{ bottom: panelExpanded ? "55%" : "260px" }}>
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-slate-100"
        >
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-slate-100"
        >
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>

      {/* Speedometer */}
      {routeStatus === "in-progress" && (
        <div className="absolute left-4 z-[1000]" style={{ bottom: panelExpanded ? "55%" : "260px" }}>
          <div className="w-20 h-20 bg-slate-900 rounded-2xl shadow-xl flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white leading-none">{speed}</span>
            <span className="text-xs text-slate-400 mt-0.5">km/h</span>
          </div>
        </div>
      )}

      {/* ===== Bottom Slide-up Panel ===== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="absolute left-0 right-0 bottom-0 z-[1000] transition-all duration-300 ease-in-out"
        style={{ maxHeight: panelExpanded ? "60vh" : "240px" }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: panelExpanded ? "60vh" : "240px" }}>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 cursor-grab" onClick={() => setPanelExpanded(!panelExpanded)}>
            <div className="w-10 h-1.5 rounded-full bg-slate-300" />
          </div>

          {/* Tabs */}
          <div className="flex px-6 gap-1 mb-3">
            <button
              onClick={() => setPanelTab("ruta")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                panelTab === "ruta" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              Ruta
            </button>
            <button
              onClick={() => setPanelTab("horarios")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                panelTab === "horarios" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              Horarios
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {panelTab === "ruta" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{route.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`} />
                      <span className="text-sm text-slate-600">{getStatusText()}</span>
                      {routeDistance > 0 && (
                        <span className="text-sm text-slate-400 ml-1">({routeDistance.toFixed(1)} km)</span>
                      )}
                    </div>
                  </div>
                  {routeStatus === "in-progress" && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900 tabular-nums">{formatTime(elapsedTime)}</p>
                      <p className="text-xs text-slate-500">Tiempo</p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {routeStatus === "in-progress" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-1.5">
                      <span>Parada {currentStopIndex + 1} de {route.stops.length}</span>
                      <span className="font-medium">{routeProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 transition-all duration-300 rounded-full"
                        style={{ width: `${routeProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stops list */}
                {panelExpanded && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Paradas</p>
                    <div className="flex flex-col gap-0">
                      {route.stops.map((stop, i) => {
                        const isReached = i <= currentStopIndex && routeStatus === "in-progress"
                        const isCurrent = i === currentStopIndex && routeStatus === "in-progress"
                        return (
                          <div key={stop.id} className="flex items-center gap-3 py-2">
                            <div className="flex flex-col items-center w-6">
                              <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                                isReached ? "bg-green-500 border-green-500" :
                                isCurrent ? "bg-orange-500 border-orange-500" :
                                "bg-white border-slate-300"
                              }`} />
                              {i < route.stops.length - 1 && (
                                <div className={`w-0.5 h-6 ${isReached ? "bg-green-300" : "bg-slate-200"}`} />
                              )}
                            </div>
                            <span className={`text-sm ${
                              isReached && !isCurrent ? "text-slate-400 line-through" :
                              isCurrent ? "text-orange-600 font-semibold" :
                              "text-slate-700"
                            }`}>
                              {stop.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Action button */}
                {routeStatus === "not-started" && (
                  <Button
                    onClick={handleStartRoute}
                    disabled={isLoadingRoute || route.path.length < 2}
                    className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl shadow-lg disabled:opacity-50"
                  >
                    {isLoadingRoute ? "Cargando ruta..." : "Iniciar recorrido"}
                  </Button>
                )}
                {routeStatus === "in-progress" && (
                  <Button
                    onClick={handleFinishRoute}
                    className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-2xl shadow-lg"
                  >
                    Finalizar recorrido
                  </Button>
                )}
              </div>
            )}

            {panelTab === "horarios" && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Horarios del dia
                </p>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Salida</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Llegada</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-slate-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DRIVER_SCHEDULE.map((entry) => (
                        <tr key={entry.id} className="border-t border-slate-100">
                          <td className="px-3 py-2.5 font-medium text-slate-800 tabular-nums">{entry.departure}</td>
                          <td className="px-3 py-2.5 text-slate-600 tabular-nums">{entry.arrival}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getScheduleStatusStyle(entry.status)}`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
