"use client"

import { useState, useEffect } from "react"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { LoginScreen, UserRole } from "@/components/login-screen"
import { HomeScreen } from "@/components/home-screen"
import { HistoryScreen } from "@/components/history-screen"
import { RouteOptionsScreen } from "@/components/route-options-screen"
import { WalkToStopScreen } from "@/components/walk-to-stop-screen"
import { WaitingScreen } from "@/components/waiting-screen"
import { OnTripScreen } from "@/components/on-trip-screen"
import { TripCompletedScreen } from "@/components/trip-completed-screen"
import { SettingsScreen } from "@/components/settings-screen"
import { DriverHomeScreen, TripSummary } from "@/components/driver-home-screen"
import { DriverRouteSummary } from "@/components/driver-route-summary"

// Estados de la app para PASAJERO:
// home -> route-options -> walk-to-stop -> waiting -> on-trip -> arrived -> trip-completed
export type AppState =
  | "onboarding"
  | "login"
  | "home"
  | "route-options"
  | "walk-to-stop"
  | "waiting"
  | "on-trip"
  | "arrived"
  | "trip-completed"
  | "history"
  | "settings"
  // Estados para CONDUCTOR:
  | "driver-home"
  | "driver-route-summary"

export interface Destination {
  name: string
  coordinates: [number, number]
}

export interface RouteOption {
  id: string
  name: string
  isRecommended: boolean
  stopName: string
  stopCoordinates: [number, number]
  walkingTimeToStop: number
  busArrivalTime: number
  totalTripTime: number
  stopsCount: number
  dropOffStop: string
}

export interface Trip {
  id: string
  destination: string
  date: Date
  duration: number
  route: string
  coordinates: [number, number]
}

export default function Page() {
  const [appState, setAppState] = useState<AppState>("onboarding")
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [destination, setDestination] = useState<Destination | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)
  const [tripHistory, setTripHistory] = useState<Trip[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [driverTripSummary, setDriverTripSummary] = useState<TripSummary | null>(null)

  // Obtener ubicacion del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          // Fallback a Celaya, Guanajuato
          setUserLocation([20.5234, -100.8157])
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    }
  }, [])

  useEffect(() => {
    const onboarded = localStorage.getItem("ubibus_onboarded")
    const savedRole = localStorage.getItem("ubibus_role") as UserRole | null
    const history = localStorage.getItem("ubibus_history")

    if (onboarded === "true") {
      if (savedRole) {
        setUserRole(savedRole)
        setAppState(savedRole === "driver" ? "driver-home" : "home")
      } else {
        setAppState("login")
      }
    }

    if (history) {
      try {
        const parsed = JSON.parse(history)
        setTripHistory(parsed.map((t: Trip) => ({ ...t, date: new Date(t.date) })))
      } catch (e) {
        console.error("Error parsing history:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (tripHistory.length > 0) {
      localStorage.setItem("ubibus_history", JSON.stringify(tripHistory))
    }
  }, [tripHistory])

  const handleOnboardingComplete = () => {
    localStorage.setItem("ubibus_onboarded", "true")
    setAppState("login")
  }

  const handleLogin = (role: UserRole) => {
    setUserRole(role)
    localStorage.setItem("ubibus_role", role)
    setAppState(role === "driver" ? "driver-home" : "home")
  }

  const handleLogout = () => {
    setUserRole(null)
    localStorage.removeItem("ubibus_role")
    setShowSettings(false)
    setAppState("login")
  }

  // FLUJO PASAJERO: Destino seleccionado -> Mostrar opciones de ruta
  const handleDestinationSelect = (dest: Destination) => {
    setDestination(dest)
    setAppState("route-options")
  }

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route)
    setAppState("walk-to-stop")
  }

  const handleArrivedAtStop = () => {
    setAppState("waiting")
  }

  const handleBusBoarding = () => {
    setAppState("on-trip")
  }

  const handleTripComplete = () => {
    // Usuario debe presionar boton manualmente
  }

  const handleFinishTrip = () => {
    if (destination && selectedRoute) {
      const trip: Trip = {
        id: Date.now().toString(),
        destination: destination.name,
        date: new Date(),
        duration: selectedRoute.totalTripTime,
        route: selectedRoute.name,
        coordinates: destination.coordinates,
      }
      setTripHistory([trip, ...tripHistory.slice(0, 9)])
    }
    setAppState("trip-completed")
  }

  const handleBackToHome = () => {
    setDestination(null)
    setSelectedRoute(null)
    setAppState(userRole === "driver" ? "driver-home" : "home")
  }

  const handleViewHistory = () => {
    setAppState("history")
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  // FLUJO CONDUCTOR
  const handleDriverTripComplete = (summary: TripSummary) => {
    setDriverTripSummary(summary)
    setAppState("driver-route-summary")
  }

  const handleStartNewRoute = () => {
    setDriverTripSummary(null)
    setAppState("driver-home")
  }

  // ONBOARDING
  if (appState === "onboarding") {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  // LOGIN
  if (appState === "login") {
    return <LoginScreen onLogin={handleLogin} />
  }

  // ================== FLUJO CONDUCTOR ==================
  
  if (userRole === "driver") {
    // Driver Home
    if (appState === "driver-home") {
      return (
        <div className="relative">
          <DriverHomeScreen
            onOpenSettings={handleOpenSettings}
            onTripComplete={handleDriverTripComplete}
          />
          {showSettings && (
            <SettingsScreen 
              onClose={handleCloseSettings} 
              onLogout={handleLogout}
              userRole={userRole}
            />
          )}
        </div>
      )
    }

    // Driver Route Summary
    if (appState === "driver-route-summary" && driverTripSummary) {
      return (
        <DriverRouteSummary
          summary={driverTripSummary}
          onStartNewRoute={handleStartNewRoute}
        />
      )
    }
  }

  // ================== FLUJO PASAJERO ==================

  // HISTORIAL
  if (appState === "history") {
    return (
      <HistoryScreen 
        trips={tripHistory} 
        onBack={handleBackToHome} 
        onSelectDestination={handleDestinationSelect} 
      />
    )
  }

  // HOME - Buscar destino
  if (appState === "home") {
    return (
      <div className="relative">
        <HomeScreen
          onDestinationSelect={handleDestinationSelect}
          onViewHistory={handleViewHistory}
          onOpenSettings={handleOpenSettings}
          userLocation={userLocation}
        />
        {showSettings && (
          <SettingsScreen 
            onClose={handleCloseSettings} 
            onLogout={handleLogout}
            userRole={userRole}
          />
        )}
      </div>
    )
  }

  // PANTALLA 1: Opciones de ruta
  if (appState === "route-options" && destination) {
    return (
      <RouteOptionsScreen
        destination={destination}
        userLocation={userLocation}
        onRouteSelect={handleRouteSelect}
        onBack={handleBackToHome}
      />
    )
  }

  // PANTALLA 2: Ir a la parada
  if (appState === "walk-to-stop" && destination && selectedRoute) {
    return (
      <WalkToStopScreen
        destination={destination}
        route={selectedRoute}
        userLocation={userLocation}
        onArrivedAtStop={handleArrivedAtStop}
        onBack={() => setAppState("route-options")}
      />
    )
  }

  // PANTALLA 3: Esperar autobus
  if (appState === "waiting" && destination && selectedRoute) {
    return (
      <WaitingScreen
        destination={destination}
        route={selectedRoute}
        onBusBoarding={handleBusBoarding}
        onCancel={handleBackToHome}
      />
    )
  }

  // PANTALLA 4 y 5: En viaje y Llegada
  if ((appState === "on-trip" || appState === "arrived") && destination && selectedRoute) {
    return (
      <div className="relative">
        <OnTripScreen
          appState={appState}
          destination={destination}
          route={selectedRoute}
          onTripComplete={handleTripComplete}
          onBackToHome={handleBackToHome}
          onFinishTrip={handleFinishTrip}
          onOpenSettings={handleOpenSettings}
        />
        {showSettings && (
          <SettingsScreen 
            onClose={handleCloseSettings} 
            onLogout={handleLogout}
            userRole={userRole}
          />
        )}
      </div>
    )
  }

  // PANTALLA 6: Viaje terminado - Calificacion
  if (appState === "trip-completed" && destination && selectedRoute) {
    return (
      <TripCompletedScreen
        destination={destination}
        route={selectedRoute}
        onBackToHome={handleBackToHome}
      />
    )
  }

  return null
}
