"use client"

import { useState, useEffect } from "react"
import type { Destination, RouteOption } from "@/app/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WaitingScreenProps {
  destination: Destination
  route: RouteOption
  onBusBoarding: () => void
  onCancel: () => void
}

export function WaitingScreen({
  destination,
  route,
  onBusBoarding,
  onCancel,
}: WaitingScreenProps) {
  const [timeUntilBus, setTimeUntilBus] = useState(route.busArrivalTime)
  const [busArriving, setBusArriving] = useState(false)
  const [busHere, setBusHere] = useState(false)

  // Contador regresivo del autobus
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilBus((prev) => {
        if (prev <= 1) {
          setBusArriving(true)
          clearInterval(interval)
          // Simular llegada del autobus
          setTimeout(() => {
            setBusHere(true)
          }, 3000)
          return 0
        }
        return prev - 1
      })
    }, 4000) // Cada 4 segundos simula 1 minuto

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm text-blue-100 font-medium">Paso 2 de 3</p>
          <p className="font-semibold">Esperando autobus</p>
        </div>
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        {/* Animated Bus Icon */}
        <div className={`relative mb-8 ${busArriving ? 'animate-bounce' : ''}`}>
          <div className="w-28 h-28 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-black/20">
            <svg className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
          {busArriving && !busHere && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-ping" />
          )}
          {busHere && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Timer or Status */}
        {!busArriving && !busHere && (
          <>
            <p className="text-blue-100 text-lg font-medium mb-2">El autobus llega en</p>
            <div className="text-white text-center">
              <p className="text-8xl font-bold tracking-tight">{timeUntilBus}</p>
              <p className="text-2xl text-blue-100 font-medium -mt-2">minutos</p>
            </div>
          </>
        )}

        {busArriving && !busHere && (
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              <p className="text-amber-300 text-xl font-bold">El autobus esta llegando</p>
            </div>
            <p className="text-blue-100 text-lg">Preparate para abordar</p>
          </div>
        )}

        {busHere && (
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <p className="text-green-300 text-xl font-bold">El autobus esta aqui</p>
            </div>
            <p className="text-blue-100 text-lg">Sube al autobus</p>
          </div>
        )}

        {/* Route Name */}
        <div className="mt-8 px-6 py-3 bg-white/20 rounded-full">
          <p className="text-white font-semibold">{route.name}</p>
        </div>
      </div>

      {/* Bottom Card */}
      <div className="bg-white rounded-t-3xl p-5 pb-8">
        {/* Info Card */}
        <Card className="p-4 mb-4 bg-slate-50 border-0 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500 font-medium">Estas en</p>
              <p className="font-bold text-slate-900">{route.stopName}</p>
            </div>
          </div>
        </Card>

        {/* Destination reminder */}
        <div className="flex items-center gap-3 mb-4 p-3 border border-slate-200 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Tu destino</p>
            <p className="font-semibold text-slate-800">{destination.name}</p>
          </div>
        </div>

        {/* Board Button */}
        <Button
          onClick={onBusBoarding}
          disabled={!busHere}
          className={`w-full h-14 text-lg font-bold rounded-2xl transition-all ${
            busHere
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {busHere ? "Ya subi al autobus" : "Esperando autobus..."}
        </Button>

        {/* Skip para testing */}
        <button
          onClick={onBusBoarding}
          className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Saltar (ya estoy en el autobus)
        </button>
      </div>
    </div>
  )
}
