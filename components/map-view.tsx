"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface BusStop {
  id: string
  name: string
  position: [number, number]
  distance?: number
}

interface MapViewProps {
  center?: [number, number]
  zoom?: number
  markers?: Array<{
    position: [number, number]
    label?: string
    type?: "user" | "stop" | "destination" | "bus"
  }>
  route?: [number, number][]
  className?: string
  showUserLocation?: boolean
  allowFullscreen?: boolean
  busStops?: BusStop[]
  selectedStopId?: string | null
  onStopSelect?: (stop: BusStop) => void
  routeToStop?: [number, number][]
  isFullscreen?: boolean
  onToggleFullscreen?: (fullscreen: boolean) => void
}

export function MapView({
  center,
  zoom = 15,
  markers = [],
  route,
  className = "",
  showUserLocation = true,
  allowFullscreen = true,
  busStops = [],
  selectedStopId,
  onStopSelect,
  routeToStop,
  isFullscreen: externalIsFullscreen,
  onToggleFullscreen,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const routeLayerRef = useRef<any>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [internalFullscreen, setInternalFullscreen] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Use external fullscreen state if provided, otherwise use internal
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalFullscreen

  // Get user location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [position.coords.latitude, position.coords.longitude]
          setUserLocation(loc)
          setIsLoading(false)
        },
        () => {
          // Fallback to CDMX
          setUserLocation([19.4326, -99.1332])
          setIsLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    } else {
      setUserLocation(center || [19.4326, -99.1332])
      setIsLoading(false)
    }
  }, [showUserLocation, center])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isLoading || !userLocation) return

    // If map already exists, don't recreate
    if (mapInstanceRef.current) {
      return
    }

    let isMounted = true

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default
        await import("leaflet/dist/leaflet.css")
        
        // Store L globally for the route update effect
        ;(window as any).L = L

        if (!isMounted || !mapRef.current) {
          return
        }

        const container = mapRef.current
        
        // Check again if map was created while we were loading
        if (mapInstanceRef.current) {
          return
        }
        
        // Clear Leaflet's internal tracking if exists
        if ((container as any)._leaflet_id) {
          delete (container as any)._leaflet_id
        }

        // Wait for container to have dimensions
        const rect = container.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
          if (!isMounted || !mapRef.current || mapInstanceRef.current) {
            return
          }
        }

        const mapCenter = center || userLocation

        const map = L.map(mapRef.current, {
          center: [mapCenter[0], mapCenter[1]],
          zoom: zoom,
          zoomControl: false,
          attributionControl: false,
        })

        // Light style map
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map)

        // User location marker
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `
            <div style="position: relative; width: 44px; height: 44px;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 44px; height: 44px; background: rgba(20, 184, 166, 0.15); border-radius: 50%; animation: pulse 2s ease-out infinite;"></div>
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 22px; height: 22px; background: #14b8a6; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.2);"></div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -22],
        })

        if (showUserLocation && userLocation) {
          const popupContent = `
            <div style="padding: 8px 12px; min-width: 120px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
              <p style="margin: 0; font-weight: 600; color: #0f172a; font-size: 14px;">Tu ubicacion</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">GPS activo</p>
            </div>
          `
          L.marker([userLocation[0], userLocation[1]], { icon: userIcon })
            .addTo(map)
            .bindPopup(popupContent, {
              closeButton: false,
              className: 'custom-popup',
              offset: [0, -5],
            })
        }

        // Bus stop markers are handled by a separate effect to allow dynamic updates
        // without recreating the entire map

        // Add other markers (destinations, etc.)
        const stopIcon = L.divIcon({
          className: "stop-marker",
          html: `<div style="width: 14px; height: 14px; background: #64748b; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })

        const destinationIcon = L.divIcon({
          className: "destination-marker",
          html: `
            <div style="position: relative; width: 28px; height: 36px;">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.3 0 0 6.3 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.3 21.7 0 14 0Z" fill="#14b8a6"/>
                <circle cx="14" cy="14" r="6" fill="white"/>
              </svg>
            </div>
          `,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        })

        const busIcon = L.divIcon({
          className: "bus-marker",
          html: `
            <div style="width: 36px; height: 36px; background: #14b8a6; border-radius: 10px; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })

        markers.forEach((marker) => {
          let icon = stopIcon
          if (marker.type === "user") icon = userIcon
          if (marker.type === "destination") icon = destinationIcon
          if (marker.type === "bus") icon = busIcon

          const m = L.marker([marker.position[0], marker.position[1]], { icon }).addTo(map)
          if (marker.label) {
            const popupContent = `
              <div style="padding: 8px 12px; min-width: 100px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
                <p style="margin: 0; font-weight: 600; color: #0f172a; font-size: 13px;">${marker.label}</p>
              </div>
            `
            m.bindPopup(popupContent, {
              closeButton: false,
              className: 'custom-popup',
              offset: [0, -5],
            })
          }
        })

        // Route to selected stop is handled by a separate effect to allow dynamic updates

        // Draw main route (for destination routes)
        if (route && route.length > 1) {
          L.polyline(route, {
            color: "#0f172a",
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)
        }

        mapInstanceRef.current = map
        setMapReady(true)
        
        // Force Leaflet to recalculate container size
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize()
          }
        }, 100)

        // Fit bounds if we have markers
        if (markers.length > 0) {
          const bounds = L.latLngBounds(markers.map((m) => m.position))
          if (userLocation) {
            bounds.extend(userLocation)
          }
          map.fitBounds(bounds, { padding: [60, 60] })
        }
      } catch (err: unknown) {
        // Only set error if it's not the "already initialized" error (which we handle gracefully)
        const errorMessage = err instanceof Error ? err.message : String(err)
        if (errorMessage.includes("already initialized")) {
          // This is fine - map is already there
          return
        }
        if (isMounted) {
          setError("Error cargando el mapa")
        }
      }
    }

    initMap()

    return () => {
      isMounted = false
      markersRef.current = []
      // Note: We intentionally don't remove the map here to avoid the "already initialized" error
      // The map will be reused or cleaned up when the component fully unmounts
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, isLoading, isFullscreen])
  
  // Separate effect to update routes without recreating the map
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return
    
    const L = (window as any).L
    if (!L) return
    
    const map = mapInstanceRef.current
    
    // Clear previous route layer
    if (routeLayerRef.current) {
      try {
        map.removeLayer(routeLayerRef.current)
      } catch (e) {
        // Ignore
      }
      routeLayerRef.current = null
    }
    
    // Draw route to selected stop
    if (routeToStop && routeToStop.length > 1) {
      routeLayerRef.current = L.polyline(routeToStop, {
        color: "#3b82f6",
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)
    }
  }, [routeToStop, mapReady])
  
  // Effect to update bus stop marker styles when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return
    
    const L = (window as any).L
    if (!L) return
    
    const map = mapInstanceRef.current
    
    // Remove old markers
    markersRef.current.forEach(marker => {
      try {
        map.removeLayer(marker)
      } catch (e) {
        // Ignore
      }
    })
    markersRef.current = []
    
    // Re-add bus stop markers with updated styles
    busStops.forEach((stop) => {
      const isSelected = stop.id === selectedStopId
      const stopIcon = L.divIcon({
        className: "bus-stop-marker",
        html: `
          <div style="
            width: ${isSelected ? '38px' : '30px'}; 
            height: ${isSelected ? '38px' : '30px'}; 
            background: ${isSelected ? '#3b82f6' : '#64748b'}; 
            border-radius: ${isSelected ? '12px' : '10px'}; 
            border: ${isSelected ? '3px' : '2px'} solid white; 
            box-shadow: 0 3px 12px rgba(0,0,0,${isSelected ? '0.35' : '0.2'});
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" viewBox="0 0 24 24" fill="white">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
        `,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      })

      const distanceText = stop.distance !== undefined 
        ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #3b82f6; font-weight: 600;">${stop.distance < 1 ? `${Math.round(stop.distance * 1000)} m` : `${stop.distance.toFixed(1)} km`}</p>`
        : ''

      const marker = L.marker([stop.position[0], stop.position[1]], { icon: stopIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 12px 16px; min-width: 150px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 24px; height: 24px; background: #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
              </div>
              <p style="margin: 0; font-weight: 600; color: #0f172a; font-size: 13px;">${stop.name}</p>
            </div>
            ${distanceText}
            <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">Toca para trazar ruta</p>
          </div>
        `, {
          closeButton: false,
          className: 'custom-popup',
          offset: [0, -10],
        })

      marker.on('click', () => {
        if (onStopSelect) {
          onStopSelect(stop)
        }
      })

      markersRef.current.push(marker)
    })
  }, [busStops, selectedStopId, mapReady, onStopSelect])
  
  // Reinitialize map when fullscreen state changes
  useEffect(() => {
    if (mapInstanceRef.current && mapReady) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 100)
    }
  }, [isFullscreen, mapReady])

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null
      }
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    setMapReady(false)
    
    // Just toggle the state, don't destroy the map
    if (externalIsFullscreen !== undefined && onToggleFullscreen) {
      onToggleFullscreen(!externalIsFullscreen)
    } else {
      setInternalFullscreen(prev => !prev)
    }
    
    // Recalculate size after state changes
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
      setMapReady(true)
    }, 100)
  }, [externalIsFullscreen, onToggleFullscreen])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-teal-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 ${className}`}>
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[200] bg-white">
        <style jsx global>{`
          .custom-popup .leaflet-popup-content-wrapper {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            padding: 0;
          }
          .custom-popup .leaflet-popup-content {
            margin: 0;
          }
          .custom-popup .leaflet-popup-tip {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
          }
        `}</style>
        <div ref={mapRef} className="w-full h-full" />
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-[210]"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="absolute bottom-8 right-4 flex flex-col gap-2 z-[210]">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: "200px" }}>
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .leaflet-container {
          z-index: 1 !important;
        }
      `}</style>
      <div ref={mapRef} className="absolute inset-0" />
      {allowFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-20 hover:bg-slate-50 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}
    </div>
  )
}
