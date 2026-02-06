"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Destination, Route } from "@/app/page"
import { MapView } from "@/components/map-view"

interface RouteDetailsScreenProps {
  destination: Destination
  route: Route
  onConfirm: () => void
  onBack: () => void
}

export function RouteDetailsScreen({ destination, route, onConfirm, onBack }: RouteDetailsScreenProps) {
  return (
    <div className="min-h-screen bg-teal-50/50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium">{route.name}</p>
          <p className="font-semibold text-slate-800">{destination.name}</p>
        </div>
      </div>

      {/* Map */}
      <div className="h-48 relative">
        <MapView
          className="w-full h-full"
          markers={[
            { position: destination.coordinates, type: "destination", label: destination.name }
          ]}
          route={route.geometry || undefined}
          allowFullscreen={true}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 bg-gradient-to-b from-teal-50/60 to-teal-50/30 rounded-t-3xl -mt-4 pt-6">
        
        {/* Trip Summary Card - More visual */}
        <Card className="p-0 rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium">Tu viaje en</p>
                <p className="text-xl font-bold">{route.name}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-3xl font-bold text-slate-800">{route.totalTime}</p>
                  <p className="text-sm text-slate-500">min</p>
                </div>
                <p className="text-xs text-slate-500 font-medium">Duracion total</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-3xl font-bold text-slate-800">{route.distance}</p>
                  <p className="text-sm text-slate-500">km</p>
                </div>
                <p className="text-xs text-slate-500 font-medium">Distancia</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <p className="text-3xl font-bold text-amber-500">{route.nextBusIn}</p>
                  <p className="text-sm text-amber-500">min</p>
                </div>
                <p className="text-xs text-slate-500 font-medium">Llega en</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step by step instructions */}
        <Card className="p-4 rounded-2xl border-0 shadow-sm bg-white">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Instrucciones del viaje
          </h3>
          
          <div className="space-y-4">
            {/* Step 1: Walk to stop */}
            <div className="flex gap-3 p-3 bg-teal-50 rounded-xl">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Camina a la parada</p>
                <p className="text-sm text-slate-600">{route.walkingTime} min caminando a <span className="font-medium">{route.stops[0]}</span></p>
              </div>
            </div>

            {/* Step 2: Take bus */}
            <div className="flex gap-3 p-3 bg-amber-50 rounded-xl">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Toma el autobus</p>
                <p className="text-sm text-slate-600">Llega en <span className="font-medium text-amber-600">{route.nextBusIn} min</span> - Viaja {route.stops.length - 2} paradas</p>
              </div>
            </div>

            {/* Step 3: Arrive */}
            <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Llegaste a tu destino</p>
                <p className="text-sm text-slate-600">Baja en <span className="font-medium">{route.stops[route.stops.length - 1]}</span></p>
              </div>
            </div>
          </div>
        </Card>

        {/* Route timeline - collapsible */}
        <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
          <details className="group">
            <summary className="p-4 flex items-center justify-between cursor-pointer list-none">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">Ver todas las paradas</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {route.stops.length} paradas
                </span>
              </div>
              <svg className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4">
              <div className="space-y-0">
                {route.stops.map((stop, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-teal-500 text-white"
                            : index === route.stops.length - 1
                              ? "bg-green-500 text-white"
                              : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {index === 0 || index === route.stops.length - 1 ? (
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        ) : (
                          index
                        )}
                      </div>
                      {index < route.stops.length - 1 && (
                        <div className="w-0.5 h-6 bg-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`text-sm ${
                        index === 0 || index === route.stops.length - 1 
                          ? "font-semibold text-slate-800" 
                          : "text-slate-600"
                      }`}>
                        {stop}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </Card>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
        <Button
          onClick={onConfirm}
          className="w-full h-14 text-base font-bold bg-teal-500 hover:bg-teal-600 text-white rounded-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Iniciar viaje
        </Button>
      </div>
    </div>
  )
}
