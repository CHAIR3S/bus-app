"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface OnboardingScreenProps {
  onComplete: () => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0)
  const [locationGranted, setLocationGranted] = useState(false)
  const [notificationsGranted, setNotificationsGranted] = useState(false)

  const handleLocationPermission = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationGranted(true)
            setTimeout(() => setStep(1), 500)
          },
          () => {
            setLocationGranted(true)
            setTimeout(() => setStep(1), 500)
          }
        )
      } else {
        setLocationGranted(true)
        setTimeout(() => setStep(1), 500)
      }
    } catch {
      setLocationGranted(true)
      setTimeout(() => setStep(1), 500)
    }
  }

  const handleNotificationPermission = async () => {
    try {
      if ("Notification" in window) {
        await Notification.requestPermission()
      }
    } catch {
      // Notifications not supported
    }
    setNotificationsGranted(true)
    setTimeout(() => onComplete(), 500)
  }

  // Pantalla de bienvenida
  if (step === 0) {
    return (
      <div className="min-h-screen bg-teal-500 flex flex-col p-6 text-white">
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold mb-2">UbiBus</h1>
          <p className="text-teal-100 text-center text-lg">
            Tu transporte simplificado
          </p>
        </div>

        <div className="space-y-4">
          {/* Location Permission */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Ubicacion</h3>
                <p className="text-sm text-teal-100">
                  Para encontrar paradas cercanas y rastrear tu viaje
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLocationPermission}
            disabled={locationGranted}
            className="w-full h-14 text-base font-semibold bg-white text-teal-600 hover:bg-teal-50 rounded-xl"
          >
            {locationGranted ? "Ubicacion permitida" : "Permitir ubicacion"}
          </Button>
        </div>
      </div>
    )
  }

  // Pantalla de notificaciones
  return (
    <div className="min-h-screen bg-teal-500 flex flex-col p-6 text-white">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
        <p className="text-teal-100 text-center">
          Te avisamos cuando llegue tu autobus y cuando debas bajar
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleNotificationPermission}
          disabled={notificationsGranted}
          className="w-full h-14 text-base font-semibold bg-white text-teal-600 hover:bg-teal-50 rounded-xl"
        >
          {notificationsGranted ? "Notificaciones activadas" : "Activar notificaciones"}
        </Button>
        
        <button
          onClick={onComplete}
          className="w-full py-3 text-teal-100 hover:text-white text-sm font-medium"
        >
          Omitir
        </button>
      </div>
    </div>
  )
}
