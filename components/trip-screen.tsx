"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AppState, Destination, Route } from "@/app/page"
import { MapView } from "@/components/map-view"

interface TripScreenProps {
  appState: AppState
  destination: Destination
  route: Route
  onBusBoarding: () => void
  onTripComplete: () => void
  onCancel: () => void
}

export function TripScreen({ appState, destination, route, onBusBoarding, onTripComplete, onCancel }: TripScreenProps) {
  const [timeUntilBus, setTimeUntilBus] = useState(route.nextBusIn)
  const [timeToDestination, setTimeToDestination] = useState(route.totalTime - route.walkingTime)
  const [currentStop, setCurrentStop] = useState(0)
  const [stopsRemaining, setStopsRemaining] = useState(route.stops.length)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false)
  const [locationSent, setLocationSent] = useState(false)
  
  // Three-finger double tap detection
  const lastTapRef = useRef<number>(0)
  const tapCountRef = useRef<number>(0)
  
  const handleThreeFingerTap = useCallback((e: TouchEvent) => {
    // Only active when on bus
    if (appState !== "on-bus") return
    
    // Check if exactly 3 fingers
    if (e.touches.length === 3) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTapRef.current
      
      // If within 500ms of last tap, count as double tap
      if (timeSinceLastTap < 500 && tapCountRef.current >= 1) {
        setShowEmergencyModal(true)
        tapCountRef.current = 0
      } else {
        tapCountRef.current = 1
      }
      lastTapRef.current = now
    }
  }, [appState])
  
  useEffect(() => {
    if (appState === "on-bus") {
      document.addEventListener("touchstart", handleThreeFingerTap)
      return () => {
        document.removeEventListener("touchstart", handleThreeFingerTap)
      }
    }
  }, [appState, handleThreeFingerTap])
  
  const handleSendEmergency = () => {
    setEmergencyConfirmed(true)
    // Simulate sending location
    setTimeout(() => {
      setLocationSent(true)
    }, 1500)
  }
  
  const closeEmergencyModal = () => {
    setShowEmergencyModal(false)
    setEmergencyConfirmed(false)
    setLocationSent(false)
  }

  // Simulacion de espera del autobus
  useEffect(() => {
    if (appState === "waiting") {
      const interval = setInterval(() => {
        setTimeUntilBus((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimeout(() => onBusBoarding(), 2000)
            return 0
          }
          return prev - 1
        })
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [appState, onBusBoarding])

  // Simulacion del viaje en autobus
  useEffect(() => {
    if (appState === "on-bus") {
      const interval = setInterval(() => {
        setTimeToDestination((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            onTripComplete()
            return 0
          }
          return prev - 1
        })

        setCurrentStop((prev) => {
          const next = prev + 1
          if (next < route.stops.length) {
            setStopsRemaining(route.stops.length - next)
            return next
          }
          return prev
        })
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [appState, route.stops.length, onTripComplete])

  // Pantalla de llegada
  if (appState === "arrived") {
    return (
      <div className="min-h-screen bg-teal-500 flex flex-col items-center justify-center p-6 text-white">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center">
            <svg className="w-14 h-14 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Llegaste</h1>
            <p className="text-lg text-teal-100 mt-2">{destination.name}</p>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm text-teal-100">Regresando al inicio...</span>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de espera
  if (appState === "waiting") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500 font-medium">Esperando autobus</p>
            <p className="font-semibold text-slate-800">{destination.name}</p>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map */}
        <div className="h-48">
          <MapView
            className="w-full h-full"
            markers={[
              { position: destination.coordinates, type: "destination", label: destination.name }
            ]}
            route={route.geometry || undefined}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Timer Card */}
          <Card className="p-6 rounded-2xl bg-teal-500 text-white border-0">
            <div className="text-center">
              <p className="text-sm text-teal-100 font-medium mb-1">Proximo autobus en</p>
              <p className="text-6xl font-bold">{timeUntilBus}</p>
              <p className="text-lg text-teal-100">minutos</p>
              
              {timeUntilBus <= 2 && timeUntilBus > 0 && (
                <div className="mt-4 pt-4 border-t border-teal-400 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  <span className="font-medium">El autobus esta llegando</span>
                </div>
              )}
              
              {timeUntilBus === 0 && (
                <div className="mt-4 pt-4 border-t border-teal-400">
                  <span className="font-bold text-lg">Abordando...</span>
                </div>
              )}
            </div>
          </Card>

          {/* Route Info */}
          <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Ruta</span>
                <span className="font-semibold text-slate-800">{route.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Tiempo total</span>
                <span className="font-semibold text-teal-600">{route.totalTime} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Paradas</span>
                <span className="font-semibold text-slate-800">{route.stops.length}</span>
              </div>
            </div>
          </Card>

          {/* Info */}
          <div className="text-center py-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700 font-medium">
              Detectaremos automaticamente cuando abordes
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Emergency Modal Component
  const EmergencyModal = () => {
    if (!showEmergencyModal) return null
    
    return (
      <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
          {!emergencyConfirmed ? (
            <>
              {/* Header */}
              <div className="bg-red-500 px-6 py-5 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Alerta de Seguridad</h2>
                <p className="text-red-100 text-sm mt-1">Estas en peligro?</p>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-center text-slate-600 text-sm">
                  Si te encuentras en una situacion de riesgo, podemos alertar a tu contacto de emergencia y compartir tu ubicacion en tiempo real.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSendEmergency}
                    className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Enviar mi ubicacion
                  </button>
                  
                  <button
                    onClick={() => {
                      // Simular llamada
                      window.location.href = "tel:911"
                    }}
                    className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-amber-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Llamar al 911
                  </button>
                  
                  <button
                    onClick={closeEmergencyModal}
                    className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Estoy bien, cancelar
                  </button>
                </div>
              </div>
            </>
          ) : !locationSent ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold text-slate-800">Enviando ubicacion...</p>
              <p className="text-sm text-slate-500 mt-1">Notificando a tu contacto de emergencia</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800">Alerta enviada</h3>
              <p className="text-sm text-slate-600 mt-2">
                Tu contacto de emergencia ha sido notificado y puede ver tu ubicacion en tiempo real.
              </p>
              <div className="mt-4 p-3 bg-slate-100 rounded-xl">
                <p className="text-xs text-slate-500">Contacto notificado</p>
                <p className="font-semibold text-slate-800">Mama (55 1234 5678)</p>
              </div>
              <button
                onClick={closeEmergencyModal}
                className="mt-6 w-full bg-slate-800 text-white py-3 rounded-xl font-medium"
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Pantalla en el autobus
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Emergency Modal */}
      <EmergencyModal />
      
      {/* Header */}
      <div className="bg-emerald-500 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-100 font-medium">En camino a</p>
          <p className="font-semibold">{destination.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{timeToDestination}</p>
          <p className="text-xs text-emerald-100">min restantes</p>
        </div>
      </div>

      {/* Map */}
      <div className="h-40">
        <MapView
          className="w-full h-full"
          markers={[
            { position: destination.coordinates, type: "destination", label: destination.name }
          ]}
          route={route.geometry || undefined}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Progress Card */}
        <Card className="p-5 rounded-2xl bg-emerald-500 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100 font-medium">Llegada estimada</p>
              <p className="text-4xl font-bold">{timeToDestination} min</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-100 font-medium">Paradas</p>
              <p className="text-2xl font-bold">{stopsRemaining}</p>
              <p className="text-xs text-emerald-200">restantes</p>
            </div>
          </div>
        </Card>

        {/* Next Stops */}
        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
          <h3 className="font-bold text-slate-800 mb-3">Proximas paradas</h3>
          <div className="space-y-2">
            {route.stops.slice(currentStop, currentStop + 3).map((stop, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  index === 0 ? "bg-emerald-50" : "bg-slate-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${index === 0 ? "text-emerald-700" : "text-slate-700"}`}>
                    {stop}
                  </p>
                  {index === 0 && (
                    <p className="text-xs text-emerald-600 font-medium">Proxima parada</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alert when close */}
        {stopsRemaining <= 2 && (
          <Card className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-amber-800">Preparate para bajar</p>
                <p className="text-sm text-amber-700">Tu destino esta cerca</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
