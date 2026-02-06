"use client"

import { Card } from "@/components/ui/card"
import type { Route } from "@/app/page"

interface RouteSelectionCardProps {
  route: Route
  isBest: boolean
  onClick: () => void
}

export function RouteSelectionCard({ route, isBest, onClick }: RouteSelectionCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all rounded-xl border-0 active:scale-[0.98] ${
        isBest
          ? "bg-white ring-2 ring-teal-500 shadow-md"
          : "bg-white shadow-sm hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Route Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isBest ? "bg-teal-500" : "bg-slate-100"
        }`}>
          <svg className={`w-6 h-6 ${isBest ? "text-white" : "text-slate-500"}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              {isBest && (
                <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                  Recomendada
                </span>
              )}
              <h3 className="font-bold text-slate-800">{route.name}</h3>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-teal-600">{route.totalTime}</p>
              <p className="text-xs text-slate-500">min</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{route.distance} km</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{route.stops.length} paradas</span>
            </div>
          </div>

          {/* Bus arrival */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">
                Autobus en <span className="font-bold text-amber-600">{route.nextBusIn} min</span>
              </span>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  )
}
