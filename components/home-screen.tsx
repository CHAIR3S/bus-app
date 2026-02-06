"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Destination } from "@/app/page"
import { MapView } from "@/components/map-view"
import { EmergencyModal } from "@/components/emergency-modal"
import { calculateWalkingRoute, calculateDistance } from "@/lib/route-service"

interface BusInfo {
  routeNumber: string
  routeName: string
  color: string
  nextArrival: number
}

interface BusStop {
  id: string
  name: string
  position: [number, number]
  distance?: number
  buses?: BusInfo[]
}

interface HomeScreenProps {
  onDestinationSelect: (destination: Destination) => void
  onViewHistory: () => void
  onOpenSettings: () => void
  userLocation: [number, number] | null
}

// Destinos populares/favoritos
const FAVORITE_DESTINATIONS: Destination[] = [
  { name: "Plaza Principal", coordinates: [20.5234, -100.8157] },
  { name: "Terminal de Autobuses", coordinates: [20.5180, -100.8080] },
]

const POPULAR_DESTINATIONS: Destination[] = [
  { name: "Centro Historico", coordinates: [20.5220, -100.8130] },
  { name: "Hospital General", coordinates: [20.5300, -100.8200] },
  { name: "Tecnologico de Celaya", coordinates: [20.5350, -100.8350] },
  { name: "Plaza Galerias", coordinates: [20.5100, -100.8050] },
  { name: "Parque Alameda", coordinates: [20.5250, -100.8170] },
  { name: "Mercado Hidalgo", coordinates: [20.5215, -100.8145] },
]

// Generar buses aleatorios para cada parada
function generateBusesForStop(): BusInfo[] {
  const routes = [
    { number: "12", name: "Centro - Norte", color: "#ef4444" },
    { number: "27", name: "Perisur - Buenavista", color: "#f97316" },
    { number: "15", name: "Tacuba - Xochimilco", color: "#8b5cf6" },
    { number: "56", name: "Santa Fe - Centro", color: "#3b82f6" },
    { number: "88", name: "Rapido Terminal", color: "#10b981" },
    { number: "34", name: "Circuito Norte", color: "#ec4899" },
  ]
  
  const count = 2 + Math.floor(Math.random() * 3)
  const selectedRoutes = routes.sort(() => Math.random() - 0.5).slice(0, count)
  
  return selectedRoutes.map(r => ({
    routeNumber: r.number,
    routeName: r.name,
    color: r.color,
    nextArrival: 1 + Math.floor(Math.random() * 12)
  })).sort((a, b) => a.nextArrival - b.nextArrival)
}

// Generar paradas aleatorias cerca de la ubicacion
function generateNearbyStops(center: [number, number]): BusStop[] {
  const stopNames = [
    "Av. Juarez", "Metro Balderas", "Calle Hidalgo", "Blvd. Lopez Mateos",
    "Plaza Central", "Av. Insurgentes", "Calle Morelos", "Terminal Norte",
    "Parque Alameda", "Centro Historico"
  ]
  
  const stops: BusStop[] = []
  const usedNames = new Set<string>()
  
  for (let i = 0; i < 8; i++) {
    let name = stopNames[Math.floor(Math.random() * stopNames.length)]
    while (usedNames.has(name)) {
      name = stopNames[Math.floor(Math.random() * stopNames.length)]
    }
    usedNames.add(name)
    
    const offsetLat = (Math.random() - 0.5) * 0.015
    const offsetLng = (Math.random() - 0.5) * 0.015
    const position: [number, number] = [center[0] + offsetLat, center[1] + offsetLng]
    
    stops.push({
      id: `stop-${i}`,
      name,
      position,
      distance: calculateDistance(center, position),
      buses: generateBusesForStop()
    })
  }
  
  return stops.sort((a, b) => (a.distance || 0) - (b.distance || 0))
}

export function HomeScreen({
  onDestinationSelect,
  onViewHistory,
  onOpenSettings,
  userLocation,
}: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [filteredDestinations, setFilteredDestinations] = useState([...FAVORITE_DESTINATIONS, ...POPULAR_DESTINATIONS])
  
  // Estado del mapa y paradas
  const [busStops, setBusStops] = useState<BusStop[]>([])
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null)
  const [routeToStop, setRouteToStop] = useState<[number, number][] | null>(null)
  const [walkingDuration, setWalkingDuration] = useState(0)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const touchStartRef = useRef<number>(0)
  
  // Estado para el popup de buses
  const [showBusList, setShowBusList] = useState(false)
  const [selectedBusIndex, setSelectedBusIndex] = useState(0)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Detector de 3 dedos para emergencia
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 3) {
        touchStartRef.current = Date.now()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0 && Date.now() - touchStartRef.current < 500) {
        setShowEmergencyModal(true)
        touchStartRef.current = 0
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Inicializar paradas cuando tenemos ubicacion
  useEffect(() => {
    if (userLocation) {
      const stops = generateNearbyStops(userLocation)
      setBusStops(stops)
      // Auto-seleccionar la parada mas cercana
      if (stops.length > 0) {
        setSelectedStop(stops[0])
      }
    }
  }, [userLocation])

  // Calcular ruta cuando cambia la parada seleccionada
  useEffect(() => {
    if (userLocation && selectedStop) {
      calculateWalkingRoute(userLocation, selectedStop.position).then(result => {
        setRouteToStop(result.route)
        setWalkingDuration(result.duration)
      })
    }
  }, [userLocation, selectedStop])

  // Filtrar destinos
  useEffect(() => {
    if (searchQuery) {
      const allDestinations = [...FAVORITE_DESTINATIONS, ...POPULAR_DESTINATIONS]
      const filtered = allDestinations.filter((dest) =>
        dest.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDestinations(filtered)
    } else {
      setFilteredDestinations([...FAVORITE_DESTINATIONS, ...POPULAR_DESTINATIONS])
    }
  }, [searchQuery])

  const handleStopSelect = useCallback((stopOrId: BusStop | string) => {
    if (typeof stopOrId === 'string') {
      const stop = busStops.find(s => s.id === stopOrId)
      if (stop) {
        setSelectedStop(stop)
      }
    } else {
      setSelectedStop(stopOrId)
    }
  }, [busStops])

  const handleDestinationSelect = (dest: Destination) => {
    setShowSearch(false)
    setSearchQuery("")
    onDestinationSelect(dest)
  }

  // Long press handlers
  const handleTouchStart = useCallback(() => {
    setIsLongPressing(true)
    longPressTimer.current = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate([10, 30, 10])
      }
      setSelectedBusIndex(0)
      setShowBusList(true)
    }, 400)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsLongPressing(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleMouseDown = useCallback(() => {
    setIsLongPressing(true)
    longPressTimer.current = setTimeout(() => {
      setSelectedBusIndex(0)
      setShowBusList(true)
    }, 400)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsLongPressing(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const nextBus = selectedStop?.buses?.[0]

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      {!isMapFullscreen && (
        <div className="bg-white px-5 pt-4 pb-3 flex items-center justify-between relative z-30">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">UbiBus</h1>
            <p className="text-sm text-slate-500">Tu transporte simplificado</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewHistory}
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={onOpenSettings}
              className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Minimal Search Bar */}
      {!isMapFullscreen && (
        <div className="bg-white px-5 pb-3 relative z-30">
          <button
            className="w-full flex items-center gap-3 bg-slate-100 hover:bg-slate-200 rounded-2xl px-4 py-3.5 transition-colors text-left"
            onClick={() => setShowSearch(true)}
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-slate-500 font-medium">A donde quieres ir?</span>
          </button>
        </div>
      )}

      {/* Map Area */}
      <div className="flex-1 relative z-10">
        <MapView
          className="w-full h-full"
          showUserLocation
          center={userLocation || [20.5234, -100.8157]}
          zoom={15}
          busStops={busStops}
          selectedStopId={selectedStop?.id}
          onStopSelect={handleStopSelect}
          routeToStop={routeToStop || undefined}
          isFullscreen={isMapFullscreen}
          onToggleFullscreen={setIsMapFullscreen}
        />
        
        {/* Expand Map Button */}
        {!isMapFullscreen && (
          <button 
            onClick={() => setIsMapFullscreen(true)}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center z-20 hover:bg-slate-50 transition-colors active:scale-90"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Card - Stop Info */}
      {!isMapFullscreen && (
        <div className="bg-white border-t border-slate-100 px-5 py-4 relative z-30">
          {selectedStop ? (
          <>
            {/* Selected Stop Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium">Parada seleccionada</p>
                <p className="font-semibold text-slate-800">{selectedStop.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">
                  {selectedStop.distance && selectedStop.distance < 1 
                    ? `${Math.round(selectedStop.distance * 1000)} m` 
                    : `${selectedStop.distance?.toFixed(1)} km`}
                </p>
                <p className="text-xs text-slate-500">
                  {walkingDuration > 0 ? `${walkingDuration} min caminando` : "Calculando..."}
                </p>
              </div>
            </div>

            {/* Next Bus Card with Long Press */}
            <div className="relative">
              <div 
                className={`flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 cursor-pointer select-none transition-all duration-200 ${isLongPressing ? 'scale-[0.97] bg-blue-100' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div>
                  <p className="text-xs text-blue-600 font-medium">Proximo autobus</p>
                  <p className="text-2xl font-bold text-blue-700">{nextBus?.nextArrival || "--"} min</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Ruta {nextBus?.routeNumber || "--"}</p>
                  <p className="text-sm font-medium text-slate-700">{nextBus?.routeName || "Cargando..."}</p>
                </div>
              </div>
              
              {/* iOS Liquid Glass Popup */}
              {showBusList && selectedStop.buses && (
                <>
                  <div 
                    className="fixed inset-0 z-[150] animate-in fade-in duration-300"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.25)',
                      backdropFilter: 'blur(10px) saturate(120%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(120%)',
                      WebkitTransition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                    onClick={() => setShowBusList(false)}
                  />
                  
                  <div 
                    className="absolute bottom-full left-0 right-0 mb-3 z-[200] px-4"
                    style={{ 
                      animation: 'slideUp 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
                      WebkitTransition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Main Glass Container */}
                    <div 
                      className="rounded-[32px] overflow-hidden shadow-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.55) 100%)',
                        backdropFilter: 'blur(30px) saturate(200%) brightness(105%)',
                        WebkitBackdropFilter: 'blur(30px) saturate(200%) brightness(105%)',
                        border: '1.5px solid rgba(255, 255, 255, 0.6)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 1px 2px rgba(255, 255, 255, 0.8) inset',
                      }}
                    >
                      {/* Header */}
                      <div className="px-5 py-5 flex items-center gap-3 bg-gradient-to-b from-white/20 to-transparent">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                            boxShadow: '0 8px 16px rgba(0, 122, 255, 0.4), 0 0 1px rgba(255, 255, 255, 0.3) inset'
                          }}
                        >
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[16px] font-bold text-slate-900">Autobuses disponibles</p>
                          <p className="text-[13px] text-slate-500 font-medium">{selectedStop.name}</p>
                        </div>
                      </div>
                      
                      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />
                      
                      {/* Picker */}
                      <div className="relative h-[200px] py-4">
                        {/* Selection Indicator */}
                        <div 
                          className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-14 rounded-[20px] pointer-events-none z-10 transition-all duration-200"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(0, 122, 255, 0.08) 100%)',
                            border: '2px solid rgba(0, 122, 255, 0.25)',
                            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.1) inset',
                          }}
                        />
                        
                        {/* Top Fade */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-12 z-20 pointer-events-none"
                          style={{ 
                            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0%, transparent 100%)',
                          }}
                        />
                        {/* Bottom Fade */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-12 z-20 pointer-events-none"
                          style={{ 
                            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.8) 0%, transparent 100%)',
                          }}
                        />
                        
                        <div 
                          ref={pickerRef}
                          className="h-full overflow-y-auto scrollbar-hide"
                          style={{ scrollSnapType: 'y mandatory' }}
                          onScroll={(e) => {
                            const container = e.currentTarget
                            const itemHeight = 56
                            const scrollTop = container.scrollTop
                            const index = Math.round(scrollTop / itemHeight)
                            if (index !== selectedBusIndex && index >= 0 && index < (selectedStop.buses?.length || 0)) {
                              setSelectedBusIndex(index)
                              if (navigator.vibrate) navigator.vibrate(3)
                            }
                          }}
                        >
                          <div className="h-[72px]" />
                          {selectedStop.buses.map((bus, index) => {
                            const isSelected = index === selectedBusIndex
                            return (
                              <div 
                                key={`${bus.routeNumber}-${index}`}
                                className="h-14 flex items-center gap-3 px-5 transition-all duration-200 ease-out"
                                style={{
                                  scrollSnapAlign: 'center',
                                  opacity: isSelected ? 1 : 0.35,
                                  transform: isSelected ? 'scale(1)' : 'scale(0.9)',
                                  filter: isSelected ? 'brightness(1)' : 'brightness(0.9)',
                                }}
                              >
                                <div 
                                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg transition-all duration-200"
                                  style={{ 
                                    backgroundColor: bus.color,
                                    boxShadow: isSelected 
                                      ? `0 8px 16px ${bus.color}40, 0 0 1px rgba(255, 255, 255, 0.5) inset` 
                                      : `0 3px 8px ${bus.color}25`,
                                  }}
                                >
                                  {bus.routeNumber}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-semibold truncate text-base transition-all duration-200 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{bus.routeName}</p>
                                  <p className={`text-xs font-medium transition-all duration-200 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>Ruta {bus.routeNumber}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="flex items-baseline gap-1">
                                    <span 
                                      className="font-bold text-2xl transition-all duration-200"
                                      style={{ color: isSelected ? bus.color : 'rgba(0,0,0,0.2)' }}
                                    >
                                      {bus.nextArrival}
                                    </span>
                                    <span className={`text-xs font-medium transition-all duration-200 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>min</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          <div className="h-[72px]" />
                        </div>
                      </div>
                      
                      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />
                      
                      {/* Footer */}
                      <div className="p-4 bg-gradient-to-t from-white/10 to-transparent">
                        <button
                          onClick={() => setShowBusList(false)}
                          className="w-full py-3 rounded-[14px] font-semibold text-white text-base active:scale-[0.96] active:opacity-85 transition-all duration-150"
                          style={{ 
                            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                            boxShadow: '0 6px 16px rgba(0, 122, 255, 0.35), 0 0 1px rgba(255, 255, 255, 0.3) inset'
                          }}
                        >
                          Listo
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <p className="text-xs text-slate-400 text-center mt-2">Mantener presionado para ver todos los camiones</p>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-slate-500 font-medium">Cargando paradas cercanas...</p>
          </div>
        )}
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="bg-white px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowSearch(false); setSearchQuery("") }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar destino..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 rounded-xl px-4 py-3 text-base font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
          </div>

          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {/* Favoritos */}
            {!searchQuery && FAVORITE_DESTINATIONS.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide px-1 mb-3">Favoritos</p>
                <div className="space-y-2">
                  {FAVORITE_DESTINATIONS.map((dest, index) => (
                    <button
                      key={dest.name}
                      onClick={() => handleDestinationSelect(dest)}
                      className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        {index === 0 ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{dest.name}</p>
                        <p className="text-xs text-slate-500">{index === 0 ? 'Mas visitado' : 'Favorito'}</p>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Destinos populares o resultados de busqueda */}
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide px-1 mb-3">
                {searchQuery ? 'Resultados' : 'Destinos populares'}
              </p>
              
              {filteredDestinations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 font-medium">No encontramos ese destino</p>
                  <p className="text-sm text-slate-400 mt-1">Intenta con otro nombre</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(searchQuery ? filteredDestinations : POPULAR_DESTINATIONS).map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() => handleDestinationSelect(dest)}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{dest.name}</p>
                        <p className="text-xs text-slate-500">Celaya, Guanajuato</p>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyModal 
          isOpen={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          userLocation={userLocation}
        />
      )}
    </div>
  )
}
