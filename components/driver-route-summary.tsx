"use client"

import { Button } from "@/components/ui/button"
import { TripSummary } from "./driver-home-screen"

interface DriverRouteSummaryProps {
  summary: TripSummary
  onStartNewRoute: () => void
}

export function DriverRouteSummary({ summary, onStartNewRoute }: DriverRouteSummaryProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Success icon */}
        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8">
          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Recorrido guardado</h1>
        <p className="text-green-100 text-center mb-10">Has completado tu ruta exitosamente</p>

        {/* Stats cards */}
        <div className="w-full max-w-sm space-y-4">
          {/* Time */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-100 text-sm">Tiempo total</p>
              <p className="text-2xl font-bold text-white">{formatTime(summary.totalTime)}</p>
            </div>
          </div>

          {/* Distance */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-100 text-sm">Distancia recorrida</p>
              <p className="text-2xl font-bold text-white">{summary.distance.toFixed(1)} km</p>
            </div>
          </div>

          {/* Stops */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-green-100 text-sm">Paradas completadas</p>
              <p className="text-2xl font-bold text-white">{summary.stopsReached} de {summary.totalStops}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom button */}
      <div className="p-6 pb-10">
        <Button
          onClick={onStartNewRoute}
          className="w-full h-14 bg-white text-green-600 hover:bg-green-50 font-bold text-lg rounded-2xl shadow-lg"
        >
          Iniciar nuevo recorrido
        </Button>
      </div>
    </div>
  )
}
