"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"

interface SettingsScreenProps {
  onClose: () => void
  onLogout?: () => void
  userRole?: "passenger" | "driver" | null
}

interface UserAccount {
  name: string
  email: string
  phone: string
}

interface AppSettings {
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  notifications: {
    tripAlerts: boolean
    busArrival: boolean
    getOffReminder: boolean
    emergencyAlerts: boolean
    promotions: boolean
    weeklyReport: boolean
  }
  accessibility: {
    largeText: boolean
    highContrast: boolean
    vibration: boolean
    voiceGuidance: boolean
    reduceMotion: boolean
  }
  preferences: {
    preferredRouteType: "fastest" | "safest" | "cheapest"
    walkingSpeed: "slow" | "normal" | "fast"
    language: string
    darkMode: boolean
    autoStartTrip: boolean
    saveHistory: boolean
    shareLocation: boolean
  }
  privacy: {
    shareUsageData: boolean
    locationHistory: boolean
    personalization: boolean
  }
}

const defaultAccount: UserAccount = {
  name: "",
  email: "",
  phone: ""
}

const defaultSettings: AppSettings = {
  emergencyContact: {
    name: "",
    phone: "",
    relationship: ""
  },
  notifications: {
    tripAlerts: true,
    busArrival: true,
    getOffReminder: true,
    emergencyAlerts: true,
    promotions: false,
    weeklyReport: true
  },
  accessibility: {
    largeText: false,
    highContrast: false,
    vibration: true,
    voiceGuidance: false,
    reduceMotion: false
  },
  preferences: {
    preferredRouteType: "fastest",
    walkingSpeed: "normal",
    language: "es",
    darkMode: false,
    autoStartTrip: false,
    saveHistory: true,
    shareLocation: true
  },
  privacy: {
    shareUsageData: false,
    locationHistory: true,
    personalization: true
  }
}

export function SettingsScreen({ onClose, onLogout }: SettingsScreenProps) {
  const [account, setAccount] = useState<UserAccount>(defaultAccount)
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const { theme, setTheme } = useTheme()

  // Cargar configuracion guardada
  useEffect(() => {
    const savedSettings = localStorage.getItem("ubibus_settings")
    const savedAccount = localStorage.getItem("ubibus_account")
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
        // Sincronizar tema con configuracion guardada
        if (parsed.preferences?.darkMode !== undefined) {
          setTheme(parsed.preferences.darkMode ? "dark" : "light")
        }
      } catch (e) {
        console.error("Error loading settings:", e)
      }
    }
    
    if (savedAccount) {
      try {
        const parsed = JSON.parse(savedAccount)
        setAccount({ ...defaultAccount, ...parsed })
      } catch (e) {
        console.error("Error loading account:", e)
      }
    }
  }, [setTheme])

  // Guardar configuracion
  const saveSettings = () => {
    localStorage.setItem("ubibus_settings", JSON.stringify(settings))
    localStorage.setItem("ubibus_account", JSON.stringify(account))
    setSaved(true)
    if (navigator.vibrate) navigator.vibrate(50)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateAccount = (field: keyof UserAccount, value: string) => {
    setAccount(prev => ({ ...prev, [field]: value }))
  }

  const updateEmergencyContact = (field: "name" | "phone" | "relationship", value: string) => {
    setSettings(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }))
  }

  const updateNotification = (key: keyof AppSettings["notifications"]) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const updateAccessibility = (key: keyof AppSettings["accessibility"]) => {
    setSettings(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: !prev.accessibility[key]
      }
    }))
  }

  const updatePreference = <K extends keyof AppSettings["preferences"]>(
    key: K,
    value: AppSettings["preferences"][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
    
    // Cambiar tema cuando se cambia modo oscuro
    if (key === "darkMode") {
      setTheme(value ? "dark" : "light")
    }
  }

  const updatePrivacy = (key: keyof AppSettings["privacy"]) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }))
  }

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert("Las contrasenas no coinciden")
      return
    }
    if (passwords.new.length < 6) {
      alert("La contrasena debe tener al menos 6 caracteres")
      return
    }
    // Simular cambio de contrasena
    alert("Contrasena actualizada correctamente")
    setShowPasswordModal(false)
    setPasswords({ current: "", new: "", confirm: "" })
  }

  const resetOnboarding = () => {
    localStorage.removeItem("ubibus_onboarded")
    localStorage.removeItem("ubibus_history")
    localStorage.removeItem("ubibus_settings")
    localStorage.removeItem("ubibus_ratings")
    localStorage.removeItem("ubibus_account")
    window.location.reload()
  }

  const testEmergencyContact = () => {
    if (!settings.emergencyContact.phone) {
      alert("Primero agrega un contacto de emergencia")
      return
    }
    
    const message = `[PRUEBA] Este es un mensaje de prueba de UbiBus. Tu contacto ha configurado este numero para emergencias.`
    window.location.href = `sms:${settings.emergencyContact.phone}?body=${encodeURIComponent(message)}`
  }

  const exportData = () => {
    const data = {
      account,
      settings,
      history: JSON.parse(localStorage.getItem("ubibus_history") || "[]"),
      ratings: JSON.parse(localStorage.getItem("ubibus_ratings") || "[]")
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ubibus_backup.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background min-h-screen flex flex-col">
      {/* Header fijo */}
      <div className="bg-background border-b border-border px-4 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-foreground flex-1">Configuracion</h1>
        {saved && (
          <span className="text-sm text-teal-600 font-medium animate-in fade-in">
            Guardado!
          </span>
        )}
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto pb-24 bg-muted/30">
        
        {/* Seccion: Cuenta */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "account" ? null : "account")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Mi Cuenta</p>
              <p className="text-sm text-muted-foreground">
                {account.email || "Configura tu perfil"}
              </p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "account" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "account" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => updateAccount("name", e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Correo electronico
                </label>
                <input
                  type="email"
                  value={account.email}
                  onChange={(e) => updateAccount("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={account.phone}
                  onChange={(e) => updateAccount("phone", e.target.value)}
                  placeholder="+52 461 123 4567"
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 bg-transparent"
              >
                Cambiar contrasena
              </Button>
            </div>
          )}
        </div>

        {/* Seccion: Apariencia */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "appearance" ? null : "appearance")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Apariencia</p>
              <p className="text-sm text-muted-foreground">Modo oscuro y tema</p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "appearance" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "appearance" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Modo oscuro</p>
                  <p className="text-sm text-muted-foreground">Reducir brillo de la pantalla</p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    updatePreference("darkMode", checked)
                  }}
                />
              </div>
              <div className="h-px bg-border" />
              <div>
                <p className="font-medium text-foreground mb-3">Seleccionar tema</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "light", label: "Claro", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" },
                    { value: "dark", label: "Oscuro", icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" },
                    { value: "system", label: "Sistema", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        theme === option.value
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <svg className={`w-6 h-6 mx-auto mb-1 ${
                        theme === option.value ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                      </svg>
                      <p className={`text-xs font-medium ${
                        theme === option.value ? "text-teal-700 dark:text-teal-300" : "text-foreground"
                      }`}>{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seccion: Contacto de Emergencia */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "emergency" ? null : "emergency")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Contacto de Emergencia</p>
              <p className="text-sm text-muted-foreground">
                {settings.emergencyContact.name || "No configurado"}
              </p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "emergency" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "emergency" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nombre del contacto
                </label>
                <input
                  type="text"
                  value={settings.emergencyContact.name}
                  onChange={(e) => updateEmergencyContact("name", e.target.value)}
                  placeholder="Ej: Mama, Papa, Pareja"
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Numero de telefono
                </label>
                <input
                  type="tel"
                  value={settings.emergencyContact.phone}
                  onChange={(e) => updateEmergencyContact("phone", e.target.value)}
                  placeholder="Ej: +52 461 123 4567"
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Relacion
                </label>
                <select
                  value={settings.emergencyContact.relationship}
                  onChange={(e) => updateEmergencyContact("relationship", e.target.value)}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground"
                >
                  <option value="">Seleccionar...</option>
                  <option value="parent">Padre/Madre</option>
                  <option value="sibling">Hermano/a</option>
                  <option value="spouse">Esposo/a o Pareja</option>
                  <option value="friend">Amigo/a</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <Button
                onClick={testEmergencyContact}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 bg-transparent"
              >
                Enviar mensaje de prueba
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Este contacto recibira tu ubicacion en caso de emergencia (toca con 3 dedos para activar)
              </p>
            </div>
          )}
        </div>

        {/* Seccion: Notificaciones */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "notifications" ? null : "notifications")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Notificaciones</p>
              <p className="text-sm text-muted-foreground">Alertas de viaje y autobus</p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "notifications" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "notifications" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Alertas de viaje</p>
                  <p className="text-sm text-muted-foreground">Inicio y fin de viaje</p>
                </div>
                <Switch
                  checked={settings.notifications.tripAlerts}
                  onCheckedChange={() => updateNotification("tripAlerts")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Llegada del autobus</p>
                  <p className="text-sm text-muted-foreground">Cuando el autobus este cerca</p>
                </div>
                <Switch
                  checked={settings.notifications.busArrival}
                  onCheckedChange={() => updateNotification("busArrival")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Recordatorio para bajar</p>
                  <p className="text-sm text-muted-foreground">Cuando llegues a tu destino</p>
                </div>
                <Switch
                  checked={settings.notifications.getOffReminder}
                  onCheckedChange={() => updateNotification("getOffReminder")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Alertas de emergencia</p>
                  <p className="text-sm text-muted-foreground">Notificaciones criticas</p>
                </div>
                <Switch
                  checked={settings.notifications.emergencyAlerts}
                  onCheckedChange={() => updateNotification("emergencyAlerts")}
                />
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Promociones</p>
                  <p className="text-sm text-muted-foreground">Ofertas y descuentos</p>
                </div>
                <Switch
                  checked={settings.notifications.promotions}
                  onCheckedChange={() => updateNotification("promotions")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Resumen semanal</p>
                  <p className="text-sm text-muted-foreground">Estadisticas de tus viajes</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReport}
                  onCheckedChange={() => updateNotification("weeklyReport")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Seccion: Accesibilidad */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "accessibility" ? null : "accessibility")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Accesibilidad</p>
              <p className="text-sm text-muted-foreground">Ajustes visuales y de audio</p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "accessibility" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "accessibility" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Texto grande</p>
                  <p className="text-sm text-muted-foreground">Aumentar tamano de fuente</p>
                </div>
                <Switch
                  checked={settings.accessibility.largeText}
                  onCheckedChange={() => updateAccessibility("largeText")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Alto contraste</p>
                  <p className="text-sm text-muted-foreground">Colores mas definidos</p>
                </div>
                <Switch
                  checked={settings.accessibility.highContrast}
                  onCheckedChange={() => updateAccessibility("highContrast")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Vibracion</p>
                  <p className="text-sm text-muted-foreground">Retroalimentacion haptica</p>
                </div>
                <Switch
                  checked={settings.accessibility.vibration}
                  onCheckedChange={() => updateAccessibility("vibration")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Guia por voz</p>
                  <p className="text-sm text-muted-foreground">Instrucciones habladas</p>
                </div>
                <Switch
                  checked={settings.accessibility.voiceGuidance}
                  onCheckedChange={() => updateAccessibility("voiceGuidance")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Reducir movimiento</p>
                  <p className="text-sm text-muted-foreground">Menos animaciones</p>
                </div>
                <Switch
                  checked={settings.accessibility.reduceMotion}
                  onCheckedChange={() => updateAccessibility("reduceMotion")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Seccion: Preferencias de Viaje */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "preferences" ? null : "preferences")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Preferencias de Viaje</p>
              <p className="text-sm text-muted-foreground">Tipo de ruta y velocidad</p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "preferences" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "preferences" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <p className="font-medium text-foreground mb-2">Tipo de ruta preferida</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "fastest", label: "Mas rapida", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                    { value: "safest", label: "Mas segura", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
                    { value: "cheapest", label: "Mas barata", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updatePreference("preferredRouteType", option.value as "fastest" | "safest" | "cheapest")}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        settings.preferences.preferredRouteType === option.value
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <svg className={`w-6 h-6 mx-auto mb-1 ${
                        settings.preferences.preferredRouteType === option.value ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                      </svg>
                      <p className={`text-xs font-medium ${
                        settings.preferences.preferredRouteType === option.value ? "text-teal-700 dark:text-teal-300" : "text-foreground"
                      }`}>{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-medium text-foreground mb-2">Velocidad caminando</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "slow", label: "Lento", desc: "~3 km/h" },
                    { value: "normal", label: "Normal", desc: "~5 km/h" },
                    { value: "fast", label: "Rapido", desc: "~7 km/h" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updatePreference("walkingSpeed", option.value as "slow" | "normal" | "fast")}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        settings.preferences.walkingSpeed === option.value
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <p className={`text-sm font-medium ${
                        settings.preferences.walkingSpeed === option.value ? "text-teal-700 dark:text-teal-300" : "text-foreground"
                      }`}>{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Iniciar viaje automatico</p>
                  <p className="text-sm text-muted-foreground">Al subir al autobus</p>
                </div>
                <Switch
                  checked={settings.preferences.autoStartTrip}
                  onCheckedChange={(checked) => updatePreference("autoStartTrip", checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Guardar historial</p>
                  <p className="text-sm text-muted-foreground">Recordar viajes anteriores</p>
                </div>
                <Switch
                  checked={settings.preferences.saveHistory}
                  onCheckedChange={(checked) => updatePreference("saveHistory", checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Compartir ubicacion</p>
                  <p className="text-sm text-muted-foreground">Para mejorar rutas</p>
                </div>
                <Switch
                  checked={settings.preferences.shareLocation}
                  onCheckedChange={(checked) => updatePreference("shareLocation", checked)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Seccion: Privacidad */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "privacy" ? null : "privacy")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Privacidad y Datos</p>
              <p className="text-sm text-muted-foreground">Control de tu informacion</p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "privacy" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "privacy" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Compartir datos de uso</p>
                  <p className="text-sm text-muted-foreground">Ayudanos a mejorar la app</p>
                </div>
                <Switch
                  checked={settings.privacy.shareUsageData}
                  onCheckedChange={() => updatePrivacy("shareUsageData")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Historial de ubicacion</p>
                  <p className="text-sm text-muted-foreground">Guardar lugares visitados</p>
                </div>
                <Switch
                  checked={settings.privacy.locationHistory}
                  onCheckedChange={() => updatePrivacy("locationHistory")}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground">Personalizacion</p>
                  <p className="text-sm text-muted-foreground">Recomendaciones basadas en ti</p>
                </div>
                <Switch
                  checked={settings.privacy.personalization}
                  onCheckedChange={() => updatePrivacy("personalization")}
                />
              </div>
              <div className="h-px bg-border" />
              <Button
                onClick={exportData}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 bg-transparent"
              >
                Exportar mis datos
              </Button>
            </div>
          )}
        </div>

        {/* Seccion: Acerca de */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={() => setActiveSection(activeSection === "about" ? null : "about")}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Acerca de UbiBus</p>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
            <svg 
              className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${activeSection === "about" ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {activeSection === "about" && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4 animate-in slide-in-from-top-2 duration-200">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">UbiBus</h3>
                <p className="text-muted-foreground">Tu transporte simplificado</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Version</span>
                  <span className="text-foreground font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Desarrollado por</span>
                  <span className="text-foreground font-medium">UbiBus Team</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button className="w-full text-left px-4 py-3 bg-muted rounded-xl text-foreground hover:bg-muted/70 transition-colors">
                  Terminos y condiciones
                </button>
                <button className="w-full text-left px-4 py-3 bg-muted rounded-xl text-foreground hover:bg-muted/70 transition-colors">
                  Politica de privacidad
                </button>
                <button className="w-full text-left px-4 py-3 bg-muted rounded-xl text-foreground hover:bg-muted/70 transition-colors">
                  Contactar soporte
                </button>
              </div>
              
              <Button
                onClick={resetOnboarding}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 mt-4 bg-transparent"
              >
                Restablecer aplicacion
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Esto borrara todos tus datos y configuracion
              </p>
            </div>
          )}
        </div>

        {/* Seccion: Cerrar Sesion */}
        <div className="bg-background mt-4 mx-4 rounded-2xl overflow-hidden shadow-sm border border-border">
          <button
            onClick={onLogout}
            className="w-full px-4 py-4 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="w-11 h-11 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-red-600 dark:text-red-400">Cerrar sesion</p>
              <p className="text-sm text-muted-foreground">
                Cambiar de perfil o cuenta
              </p>
            </div>
            <svg 
              className="w-5 h-5 text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Espacio para el boton fijo */}
        <div className="h-8" />
      </div>

      {/* Boton guardar fijo en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-40">
        <Button
          onClick={saveSettings}
          className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-xl"
        >
          Guardar cambios
        </Button>
      </div>

      {/* Modal de cambio de contrasena */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative bg-background rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-4">Cambiar contrasena</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Contrasena actual
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nueva contrasena
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmar contrasena
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full px-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-teal-500 focus:bg-background transition-all text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowPasswordModal(false)}
                variant="outline"
                className="flex-1 h-12 rounded-xl bg-transparent"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleChangePassword}
                className="flex-1 h-12 rounded-xl bg-teal-500 hover:bg-teal-600 text-white"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
