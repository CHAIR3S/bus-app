"use client"

import { useState, useEffect } from "react"
import type { Destination, RouteOption } from "@/app/page"
import { MapView } from "@/components/map-view"
import { calculateWalkingRoute } from "@/lib/route-service"
import { Button } from "@/components/ui/button"

interface WalkToStopScreenProps {
  destination: Destination
  route: RouteOption
  userLocation: [number, number] | null
  onArrivedAtStop: () => void
  onBack: () => void
}

export function WalkToStopScreen({
  destination,
  route,
  userLocation,
  onArrivedAtStop,
  onBack,
}: WalkToStopScreenProps) {
  const [walkingRoute, setWalkingRoute] = useState<[number, number][]>([])
  const [remainingTime, setRemainingTime] = useState(route.walkingTimeToStop)
  const [isNearStop, setIsNearStop] = useState(false)

  // Calcular ruta caminando usando OpenRouteService
  useEffect(() => {
    if (userLocation) {
      calculateWalkingRoute(userLocation, route.stopCoordinates).then((result) => {
        setWalkingRoute(result.route)
      })
    }
  }, [userLocation, route.stopCoordinates])

  // Simular progreso de caminata
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          setIsNearStop(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 15000) // Cada 15 segundos simula 1 minuto

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header compacto */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 relative z-20">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium">Paso 1 de 3</p>
          <p className="font-semibold text-slate-900">Camina a la parada</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{route.name}</p>
        </div>
      </div>

      {/* Mapa - ocupa la mayor parte de la pantalla */}
      <div className="flex-1 relative">
        <MapView
          className="w-full h-full"
          showUserLocation
          markers={[
            {
              position: route.stopCoordinates,
              type: "stop",
              label: route.stopName,
            },
          ]}
          routeToStop={walkingRoute}
          center={userLocation || route.stopCoordinates}
          zoom={16}
        />

        {/* Overlay con instruccion principal */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div 
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-slate-900">Camina a la parada</p>
                <p className="text-blue-600 font-semibold text-lg">{route.stopName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card con info y boton */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6 relative z-20">
        {/* Tiempo restante */}
        <div className="flex items-center justify-between mb-4 p-4 bg-slate-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Tiempo caminando</p>
              <p className="text-xl font-bold text-slate-900">
                {isNearStop ? "Llegaste" : `${remainingTime} minutos`}
              </p>
            </div>
          </div>
          {!isNearStop && (
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          )}
          {isNearStop && (
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Info adicional */}
        {!isNearStop && (
          <p className="text-center text-slate-500 text-sm mb-4">
            Sigue la linea azul en el mapa para llegar a la parada
          </p>
        )}

        {isNearStop && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <p className="text-center text-green-700 font-medium">
              Ya estas cerca de la parada. Presiona continuar cuando llegues.
            </p>
          </div>
        )}

        {/* Boton principal */}
        <Button
          onClick={onArrivedAtStop}
          disabled={!isNearStop && remainingTime > 1}
          className={`w-full h-14 text-lg font-bold rounded-2xl transition-all ${
            isNearStop || remainingTime <= 1
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isNearStop ? "Ya llegue a la parada" : "Caminando..."}
        </Button>

        {/* Skip para testing */}
        <button
          onClick={onArrivedAtStop}
          className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Saltar (ya estoy en la parada)
        </button>
      </div>
    </div>
  )
}
