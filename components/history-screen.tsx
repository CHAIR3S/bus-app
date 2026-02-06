"use client"

import { Card } from "@/components/ui/card"
import type { Trip, Destination } from "@/app/page"

interface HistoryScreenProps {
  trips: Trip[]
  onBack: () => void
  onSelectDestination: (destination: Destination) => void
}

export function HistoryScreen({ trips, onBack, onSelectDestination }: HistoryScreenProps) {
  // Calcular destinos frecuentes
  const frequentDestinations = trips.reduce(
    (acc, trip) => {
      if (!acc[trip.destination]) {
        acc[trip.destination] = {
          count: 0,
          avgDuration: 0,
          totalDuration: 0,
          coordinates: trip.coordinates,
        }
      }
      acc[trip.destination].count += 1
      acc[trip.destination].totalDuration += trip.duration
      acc[trip.destination].avgDuration = Math.round(acc[trip.destination].totalDuration / acc[trip.destination].count)
      return acc
    },
    {} as Record<string, { count: number; avgDuration: number; totalDuration: number; coordinates: [number, number] }>
  )

  const sortedDestinations = Object.entries(frequentDestinations)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  const handleQuickSelect = (destName: string, coordinates: [number, number]) => {
    onSelectDestination({ name: destName, coordinates })
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-bold text-slate-800 text-lg">Historial</h1>
          <p className="text-xs text-slate-500">{trips.length} viajes completados</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Destinos frecuentes */}
        {sortedDestinations.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Destinos frecuentes
            </h2>
            <div className="space-y-2">
              {sortedDestinations.map(([destination, data]) => (
                <Card
                  key={destination}
                  className="p-4 cursor-pointer transition-all rounded-xl border-0 shadow-sm bg-white hover:shadow-md active:scale-[0.98]"
                  onClick={() => handleQuickSelect(destination, data.coordinates)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{destination}</p>
                      <p className="text-sm text-slate-500">
                        {data.count} {data.count === 1 ? "viaje" : "viajes"} - {data.avgDuration} min promedio
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Viajes recientes */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Viajes recientes
          </h2>
          
          {trips.length === 0 ? (
            <Card className="p-8 text-center rounded-xl border-0 shadow-sm bg-white">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium text-slate-700">Sin viajes todavia</p>
              <p className="text-sm text-slate-500 mt-1">Tus viajes apareceran aqui</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {trips.map((trip) => (
                <Card
                  key={trip.id}
                  className="p-4 rounded-xl border-0 shadow-sm bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800">{trip.destination}</p>
                      <p className="text-sm text-slate-500">{trip.route}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(trip.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-teal-600">{trip.duration}</p>
                      <p className="text-xs text-slate-500">min</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
