"use client"

import { useState, useRef, useCallback } from "react"

interface EmergencyModalProps {
  isOpen: boolean
  onClose: () => void
  userLocation: [number, number] | null
}

export function EmergencyModal({ isOpen, onClose, userLocation }: EmergencyModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp4" })
        const audioUrl = URL.createObjectURL(audioBlob)
        const link = document.createElement("a")
        link.href = audioUrl
        link.download = `emergency-audio-${Date.now()}.mp4`
        link.click()
        audioChunksRef.current = []
      }
      
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)
      
      // Timer para mostrar tiempo de grabación
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("No se pudo acceder al micrófono")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const shareLocation = useCallback(() => {
    if (!userLocation) {
      alert("Ubicación no disponible")
      return
    }

    const message = `🆘 EMERGENCIA - Mi ubicación: ${userLocation[0]}, ${userLocation[1]} - Google Maps: https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}`
    
    if (navigator.share) {
      navigator.share({
        title: "Ubicación de Emergencia",
        text: message,
      }).catch(err => console.log("Error sharing:", err))
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(message)
      alert("Ubicación copiada al portapapeles")
    }
  }, [userLocation])

  const callEmergency = useCallback(() => {
    window.location.href = "tel:911"
  }, [])

  const sendSOS = useCallback(() => {
    const message = `🆘 NECESITO AYUDA - Estoy en: ${userLocation ? `${userLocation[0]}, ${userLocation[1]}` : "ubicación desconocida"}`
    window.location.href = `sms:?body=${encodeURIComponent(message)}`
  }, [userLocation])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/60 z-[300]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[301] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-white text-center">
            <div className="text-5xl mb-3">🆘</div>
            <h2 className="text-2xl font-bold">¿Estás bien?</h2>
            <p className="text-sm mt-2 opacity-90">Accede a opciones de emergencia</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Recording Status */}
            {isRecording && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-700 font-semibold">Grabando...</span>
                </div>
                <p className="text-2xl font-mono text-red-600">{String(Math.floor(recordingTime / 60)).padStart(2, '0')}:{String(recordingTime % 60).padStart(2, '0')}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              {/* Llamar Emergencia */}
              <button
                onClick={callEmergency}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="text-xl">☎️</span>
                Llamar a Emergencia (911)
              </button>

              {/* Compartir Ubicación */}
              <button
                onClick={shareLocation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="text-xl">📍</span>
                Compartir Ubicación
              </button>

              {/* Grabar Audio */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                  isRecording 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                <span className="text-xl">{isRecording ? "⏹️" : "🎙️"}</span>
                {isRecording ? "Detener Grabación" : "Grabar Audio"}
              </button>

              {/* Enviar SOS por SMS */}
              <button
                onClick={sendSOS}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <span className="text-xl">💬</span>
                Enviar SOS por SMS
              </button>

              {/* Cerrar */}
              <button
                onClick={onClose}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 px-4 rounded-xl transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>

            {/* Ayuda */}
            <p className="text-xs text-slate-500 text-center mt-4">
              💡 Comparte tu ubicación con contactos de confianza para mayor seguridad
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
