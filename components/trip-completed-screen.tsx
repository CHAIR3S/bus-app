"use client"

import { useState, useEffect } from "react"
import type { Destination, RouteOption } from "@/app/page"
import { Button } from "@/components/ui/button"

interface TripCompletedScreenProps {
  destination: Destination
  route: RouteOption
  onBackToHome: () => void
}

interface RatingCategory {
  id: string
  name: string
  description: string
  icon: string
  rating: number
}

const RATING_CATEGORIES: RatingCategory[] = [
  {
    id: "safety",
    name: "Seguridad",
    description: "Te sentiste seguro durante el viaje?",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    rating: 0
  },
  {
    id: "punctuality",
    name: "Puntualidad",
    description: "El autobus llego a tiempo?",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    rating: 0
  },
  {
    id: "comfort",
    name: "Comodidad",
    description: "El viaje fue comodo y agradable?",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    rating: 0
  }
]

export function TripCompletedScreen({
  destination,
  route,
  onBackToHome,
}: TripCompletedScreenProps) {
  const [categories, setCategories] = useState<RatingCategory[]>(RATING_CATEGORIES)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  // Mostrar notificacion despues de 1 segundo
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true)
      // Vibrar si esta disponible
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100])
      }
      // Intentar mostrar notificacion real si tenemos permiso
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Viaje completado", {
          body: "Como estuvo tu viaje? Dejanos tu calificacion!",
          icon: "/icon.svg"
        })
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleCategoryRating = (categoryId: string, rating: number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, rating } : cat
      )
    )
  }

  const getAverageRating = () => {
    const rated = categories.filter(c => c.rating > 0)
    if (rated.length === 0) return 0
    return Math.round(rated.reduce((acc, c) => acc + c.rating, 0) / rated.length * 10) / 10
  }

  const handleSubmit = () => {
    // Guardar calificacion en localStorage
    const ratings = JSON.parse(localStorage.getItem("ubibus_ratings") || "[]")
    ratings.push({
      destination: destination.name,
      route: route.name,
      ratings: categories.reduce((acc, c) => ({ ...acc, [c.id]: c.rating }), {}),
      averageRating: getAverageRating(),
      comment,
      date: new Date().toISOString()
    })
    localStorage.setItem("ubibus_ratings", JSON.stringify(ratings))
    setSubmitted(true)
  }

  const handleSkip = () => {
    onBackToHome()
  }

  const hasAnyRating = categories.some(c => c.rating > 0)

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-black/20 animate-in zoom-in duration-300">
            <svg className="w-14 h-14 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">Gracias!</h1>
            <p className="text-teal-100 text-lg">Tu opinion nos ayuda a mejorar</p>
          </div>
          <Button
            onClick={onBackToHome}
            className="bg-white text-teal-600 hover:bg-teal-50 font-bold px-8 py-4 h-auto text-lg rounded-2xl shadow-lg mt-4"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-600 flex flex-col">
      {/* Notificacion flotante */}
      {showNotification && (
        <div 
          className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300"
          onClick={() => setShowNotification(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">Viaje completado!</p>
              <p className="text-sm text-slate-500">Califica tu experiencia</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-white text-center pt-10 pb-6 px-6">
        <div className="w-18 h-18 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-2xl shadow-black/20 w-[72px] h-[72px]">
          <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1">Tu viaje termino!</h1>
        <p className="text-teal-100 text-sm">{destination.name} - Ruta {route.name}</p>
      </div>

      {/* Card de calificacion */}
      <div className="flex-1 bg-white rounded-t-[32px] px-5 pt-6 pb-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-5">
          {/* Titulo de la encuesta */}
          <div className="text-center mb-2">
            <h2 className="text-lg font-bold text-slate-900">Como estuvo tu viaje?</h2>
            <p className="text-slate-500 text-sm">Califica cada aspecto del viaje</p>
          </div>

          {/* Categorias de calificacion */}
          <div className="space-y-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="bg-slate-50 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{category.name}</p>
                    <p className="text-xs text-slate-500">{category.description}</p>
                  </div>
                </div>
                
                {/* Estrellas */}
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleCategoryRating(category.id, star)}
                      className="transition-all duration-200 active:scale-90 p-0.5"
                    >
                      <svg
                        className={`w-9 h-9 transition-colors duration-200 ${
                          star <= category.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-slate-200 fill-slate-200"
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>

                {category.rating > 0 && (
                  <p className="text-center text-slate-600 text-xs mt-2 font-medium animate-in fade-in duration-200">
                    {category.rating === 1 && "Malo"}
                    {category.rating === 2 && "Regular"}
                    {category.rating === 3 && "Bueno"}
                    {category.rating === 4 && "Muy bueno"}
                    {category.rating === 5 && "Excelente!"}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Promedio */}
          {hasAnyRating && (
            <div className="bg-teal-50 rounded-2xl p-4 flex items-center justify-between animate-in fade-in duration-300">
              <div>
                <p className="text-sm text-teal-700 font-medium">Calificacion promedio</p>
                <p className="text-xs text-teal-600">Basada en tus respuestas</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-teal-700">{getAverageRating()}</span>
                <svg className="w-7 h-7 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          )}

          {/* Campo de comentario */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Comentarios adicionales (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuentanos mas sobre tu experiencia..."
              className="w-full h-20 px-4 py-3 bg-slate-100 rounded-xl border-0 resize-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 text-sm"
            />
          </div>

          {/* Opciones rapidas */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Etiquetas rapidas:</p>
            <div className="flex flex-wrap gap-2">
              {["Chofer amable", "Limpio", "Puntual", "Comodo", "Seguro", "Recomendable"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setComment(prev => prev ? `${prev}, ${tag.toLowerCase()}` : tag)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-teal-100 hover:text-teal-700 rounded-full text-xs text-slate-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3 pt-2 pb-4">
            <Button
              onClick={handleSubmit}
              disabled={!hasAnyRating}
              className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar calificacion
            </Button>
            <button
              onClick={handleSkip}
              className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Omitir y volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
