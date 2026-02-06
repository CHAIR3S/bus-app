"use client"

import { useState, useEffect } from "react"
import type { Destination, RouteOption } from "@/app/page"
import { Card } from "@/components/ui/card"

interface RouteOptionsScreenProps {
  destination: Destination
  userLocation: [number, number] | null
  onRouteSelect: (route: RouteOption) => void
  onBack: () => void
}

// Generar rutas basadas en el destino
function generateRouteOptions(
  destination: Destination,
  userLocation: [number, number] | null
): RouteOption[] {
  // Ubicacion base (Celaya)
  const baseLocation = userLocation || [20.5234, -100.8157]
  
  // Nombres de paradas realistas para Celaya
  const stopNames = [
    "Parada Av. Juarez",
    "Parada Centro",
    "Parada Alameda",
    "Parada Plaza Mayor",
    "Parada Tecnologico",
    "Parada Hospital",
    "Parada Terminal",
  ]
  
  const routes: RouteOption[] = [
    {
      id: "1",
      name: "Ruta 42 Express",
      isRecommended: true,
      stopName: stopNames[Math.floor(Math.random() * stopNames.length)],
      stopCoordinates: [
        baseLocation[0] + (Math.random() - 0.5) * 0.01,
        baseLocation[1] + (Math.random() - 0.5) * 0.01
      ],
      walkingTimeToStop: 3 + Math.floor(Math.random() * 4),
      busArrivalTime: 2 + Math.floor(Math.random() * 5),
      totalTripTime: 15 + Math.floor(Math.random() * 10),
      stopsCount: 4 + Math.floor(Math.random() * 3),
      dropOffStop: `Parada ${destination.name.split(" ")[0]}`,
    },
    {
      id: "2",
      name: "Ruta 15 Local",
      isRecommended: false,
      stopName: stopNames[Math.floor(Math.random() * stopNames.length)],
      stopCoordinates: [
        baseLocation[0] + (Math.random() - 0.5) * 0.015,
        baseLocation[1] + (Math.random() - 0.5) * 0.015
      ],
      walkingTimeToStop: 5 + Math.floor(Math.random() * 5),
      busArrivalTime: 1 + Math.floor(Math.random() * 4),
      totalTripTime: 22 + Math.floor(Math.random() * 12),
      stopsCount: 6 + Math.floor(Math.random() * 4),
      dropOffStop: `Parada ${destination.name.split(" ")[0]}`,
    },
    {
      id: "3",
      name: "Ruta 88 Rapido",
      isRecommended: false,
      stopName: stopNames[Math.floor(Math.random() * stopNames.length)],
      stopCoordinates: [
        baseLocation[0] + (Math.random() - 0.5) * 0.02,
        baseLocation[1] + (Math.random() - 0.5) * 0.02
      ],
      walkingTimeToStop: 7 + Math.floor(Math.random() * 5),
      busArrivalTime: 4 + Math.floor(Math.random() * 6),
      totalTripTime: 18 + Math.floor(Math.random() * 8),
      stopsCount: 3 + Math.floor(Math.random() * 3),
      dropOffStop: `Parada ${destination.name.split(" ")[0]}`,
    },
  ]

  // Ordenar por tiempo total
  return routes.sort((a, b) => a.totalTripTime - b.totalTripTime)
}

export function RouteOptionsScreen({
  destination,
  userLocation,
  onRouteSelect,
  onBack,
}: RouteOptionsScreenProps) {
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de rutas
    setLoading(true)
    const timer = setTimeout(() => {
      const generatedRoutes = generateRouteOptions(destination, userLocation)
      setRoutes(generatedRoutes)
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [destination, userLocation])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Como llegar a</p>
            <p className="text-lg font-bold text-slate-900">{destination.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Title */}
        <div className="text-center py-2">
          <h2 className="text-xl font-bold text-slate-900">Elige una ruta</h2>
          <p className="text-sm text-slate-500 mt-1">Selecciona la mejor opcion para ti</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Buscando rutas...</p>
            <p className="text-sm text-slate-400 mt-1">Calculando las mejores opciones</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <Card
                key={route.id}
                className="p-0 overflow-hidden border-0 shadow-md bg-white cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.99]"
                onClick={() => onRouteSelect(route)}
              >
                {/* Recommended Badge */}
                {route.isRecommended && (
                  <div className="bg-blue-500 text-white px-4 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-sm font-bold">Recomendada</span>
                  </div>
                )}

                <div className="p-4 space-y-4">
                  {/* Route Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${route.isRecommended ? 'bg-blue-500' : 'bg-slate-600'}`}>
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{route.name}</p>
                        <p className="text-sm text-slate-500">{route.stopsCount} paradas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{route.totalTripTime}</p>
                      <p className="text-xs text-slate-500">min total</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100" />

                  {/* Stop Info - OBLIGATORIO */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-3">
                    {/* Parada exacta */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Camina a</p>
                        <p className="font-semibold text-slate-800">{route.stopName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{route.walkingTimeToStop} min</p>
                        <p className="text-xs text-slate-400">caminando</p>
                      </div>
                    </div>

                    {/* Tiempo de llegada del autobus */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">El autobus llega en</p>
                        <p className="font-semibold text-amber-600">{route.busArrivalTime} minutos</p>
                      </div>
                    </div>
                  </div>

                  {/* Action hint */}
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <span className="text-sm font-medium">Seleccionar esta ruta</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
