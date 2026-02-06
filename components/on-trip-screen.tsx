"use client"

import { useState, useEffect } from "react"
import type { AppState, Destination, RouteOption } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface OnTripScreenProps {
  appState: AppState
  destination: Destination
  route: RouteOption
  onTripComplete: () => void
  onBackToHome: () => void
  onFinishTrip: () => void
  onOpenSettings: () => void
}

// Generar nombres de paradas simuladas
function generateStopNames(count: number, finalStop: string): string[] {
  const stopPrefixes = [
    "Av. Juarez",
    "Blvd. Adolfo Lopez Mateos",
    "Calle Hidalgo",
    "Plaza Principal",
    "Parque Alameda",
    "Av. Tecnologico",
    "Calle Morelos",
    "Av. Constituyentes",
    "Centro Historico",
    "Terminal Central"
  ]
  
  const stops: string[] = []
  for (let i = 0; i < count - 1; i++) {
    stops.push(stopPrefixes[i % stopPrefixes.length])
  }
  stops.push(finalStop)
  return stops
}

export function OnTripScreen({
  appState,
  destination,
  route,
  onTripComplete,
  onBackToHome,
  onFinishTrip,
  onOpenSettings,
}: OnTripScreenProps) {
  const [stops] = useState(() => generateStopNames(route.stopsCount, route.dropOffStop))
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [stopsRemaining, setStopsRemaining] = useState(route.stopsCount)
  const [timeRemaining, setTimeRemaining] = useState(route.totalTripTime - route.walkingTimeToStop)
  const [showGetOffAlert, setShowGetOffAlert] = useState(false)

  // Simulacion del viaje
  useEffect(() => {
    if (appState !== "on-trip") return

    const interval = setInterval(() => {
      setCurrentStopIndex((prev) => {
        const next = prev + 1
        if (next >= stops.length) {
          clearInterval(interval)
          return prev
        }
        
        const remaining = stops.length - next
        setStopsRemaining(remaining)
        
        // Mostrar alerta cuando quedan 2 o menos paradas
        if (remaining <= 2) {
          setShowGetOffAlert(true)
        }
        
        return next
      })
      
      setTimeRemaining((prev) => {
        const timePerStop = (route.totalTripTime - route.walkingTimeToStop) / route.stopsCount
        return Math.max(0, prev - timePerStop)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [appState, stops.length, route])

  // =====================================================
  // PANTALLA FINAL: BAJA DEL AUTOBUS (0 paradas restantes)
  // =====================================================
  if (stopsRemaining === 0 || appState === "arrived") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header Verde - Indicador de exito */}
        <div className="bg-green-500 px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Llegaste a tu destino</h1>
          <p className="text-green-100">{route.dropOffStop}</p>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Info del destino */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tu destino</p>
                <p className="font-bold text-slate-900 text-lg">{destination.name}</p>
              </div>
            </div>
          </div>

          {/* Instruccion */}
          <div className="text-center mb-8">
            <p className="text-slate-600">
              Baja del autobus y camina hacia tu destino final.
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Boton Principal */}
          <Button
            onClick={onFinishTrip}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 h-auto text-lg rounded-2xl"
          >
            Ya me baje del autobus
          </Button>

          <p className="text-center text-slate-400 text-sm mt-3">
            Califica tu viaje y ayudanos a mejorar
          </p>
        </div>
      </div>
    )
  }

  // =====================================================
  // PANTALLA: PREPARATE PARA BAJAR (1-2 paradas restantes)
  // =====================================================
  if (stopsRemaining <= 2 && stopsRemaining > 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header Naranja - Alerta */}
        <div className="bg-amber-500 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Preparate para bajar</p>
              <p className="text-white font-bold text-lg">{route.name}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white">{Math.round(timeRemaining)}</p>
              <p className="text-amber-100 text-sm">min</p>
            </div>
          </div>
        </div>

        {/* Indicador Grande */}
        <div className="bg-amber-50 px-6 py-8">
          <div className="flex items-center justify-center gap-6">
            <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-5xl font-black text-white">{stopsRemaining}</span>
            </div>
            <div>
              <p className="text-amber-800 font-bold text-2xl">
                {stopsRemaining === 1 ? "parada" : "paradas"}
              </p>
              <p className="text-amber-600">para bajar</p>
            </div>
          </div>
        </div>

        {/* Alerta de siguiente parada */}
        {stopsRemaining === 1 && (
          <div className="mx-4 -mt-4 mb-4">
            <div className="bg-red-500 text-white p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">La siguiente es tu parada</p>
                <p className="text-red-100">Prepara tus cosas</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de paradas */}
        <div className="flex-1 px-4 py-4">
          <p className="text-slate-500 text-sm font-medium mb-3 px-2">Proximas paradas</p>
          <div className="space-y-2">
            {stops.slice(currentStopIndex, currentStopIndex + 3).map((stop, index) => {
              const isFinal = currentStopIndex + index === stops.length - 1
              
              return (
                <div
                  key={`${stop}-${index}`}
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    isFinal 
                      ? 'bg-green-50 border-2 border-green-300' 
                      : 'bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isFinal
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isFinal ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isFinal ? 'text-green-700' : 'text-slate-700'}`}>
                      {stop}
                    </p>
                    {isFinal && (
                      <p className="text-green-600 text-sm font-medium">Tu destino</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Destino final */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Destino final</p>
              <p className="font-bold text-slate-900">{destination.name}</p>
            </div>
          </div>

          {/* Boton para terminar viaje */}
          <Button
            onClick={onFinishTrip}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 h-auto text-base rounded-xl"
          >
            Ya llegue, termine mi viaje
          </Button>
        </div>
      </div>
    )
  }

  // =====================================================
  // PANTALLA NORMAL: EN VIAJE (mas de 2 paradas)
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Verde */}
      <div className="bg-emerald-500 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">En camino</p>
            <p className="font-bold text-lg">{route.name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{Math.round(timeRemaining)}</p>
            <p className="text-emerald-100 text-xs">min restantes</p>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-4">
        <Card className="p-5 rounded-2xl bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Paradas restantes</p>
              <p className="text-5xl font-bold">{stopsRemaining}</p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Stop List */}
      <div className="flex-1 px-4">
        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Proximas paradas
          </h3>
          
          <div className="space-y-2">
            {stops.slice(currentStopIndex, currentStopIndex + 4).map((stop, index) => {
              const isNext = index === 0
              const isFinal = currentStopIndex + index === stops.length - 1
              
              return (
                <div
                  key={`${stop}-${index}`}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isFinal 
                      ? 'bg-green-50 border border-green-200' 
                      : isNext 
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      isFinal
                        ? 'bg-green-500 text-white'
                        : isNext
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isFinal ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      isFinal 
                        ? 'text-green-700' 
                        : isNext 
                          ? 'text-emerald-700'
                          : 'text-slate-700'
                    }`}>
                      {stop}
                    </p>
                    {isNext && !isFinal && (
                      <p className="text-xs text-emerald-600">Proxima parada</p>
                    )}
                    {isFinal && (
                      <p className="text-xs text-green-600 font-medium">Tu destino</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Destination Reminder */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tu destino</p>
            <p className="font-bold text-slate-900">{destination.name}</p>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6">
        <div className="text-center text-slate-500 text-sm">
          Te avisaremos cuando sea momento de bajar
        </div>
      </div>
    </div>
  )
}
