"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export type UserRole = "passenger" | "driver"

interface LoginScreenProps {
  onLogin: (role: UserRole) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = () => {
    if (!selectedRole) return
    setIsLoading(true)
    // Simular login
    setTimeout(() => {
      onLogin(selectedRole)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6">
          <svg className="w-14 h-14 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">UbiBus</h1>
        <p className="text-teal-100 text-center mb-12">Tu transporte, en tiempo real</p>

        {/* Role Selection */}
        <div className="w-full max-w-sm space-y-4">
          <p className="text-white text-center font-medium mb-4">Selecciona tu perfil</p>
          
          {/* Passenger Option */}
          <button
            onClick={() => setSelectedRole("passenger")}
            className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 ${
              selectedRole === "passenger"
                ? "bg-white border-white shadow-lg"
                : "bg-white/10 border-white/30 hover:bg-white/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedRole === "passenger" ? "bg-teal-100" : "bg-white/20"
              }`}>
                <svg className={`w-7 h-7 ${selectedRole === "passenger" ? "text-teal-600" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className={`font-bold text-lg ${selectedRole === "passenger" ? "text-slate-900" : "text-white"}`}>
                  Pasajero
                </p>
                <p className={`text-sm ${selectedRole === "passenger" ? "text-slate-500" : "text-teal-100"}`}>
                  Busca rutas y viaja
                </p>
              </div>
              {selectedRole === "passenger" && (
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>

          {/* Driver Option */}
          <button
            onClick={() => setSelectedRole("driver")}
            className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 ${
              selectedRole === "driver"
                ? "bg-white border-white shadow-lg"
                : "bg-white/10 border-white/30 hover:bg-white/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedRole === "driver" ? "bg-orange-100" : "bg-white/20"
              }`}>
                <svg className={`w-7 h-7 ${selectedRole === "driver" ? "text-orange-600" : "text-white"}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className={`font-bold text-lg ${selectedRole === "driver" ? "text-slate-900" : "text-white"}`}>
                  Conductor
                </p>
                <p className={`text-sm ${selectedRole === "driver" ? "text-slate-500" : "text-teal-100"}`}>
                  Maneja tu ruta
                </p>
              </div>
              {selectedRole === "driver" && (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-6 pb-10">
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          className="w-full h-14 bg-white text-teal-600 hover:bg-teal-50 font-bold text-lg rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          ) : (
            "Continuar"
          )}
        </Button>
      </div>
    </div>
  )
}
