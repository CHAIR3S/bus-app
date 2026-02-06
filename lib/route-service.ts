import type { Route } from "@/app/page"

// Tu API key de OpenRouteService
const ORS_API_KEY = "5b3ce3597851110001cf6248f6fd4b1c31b64eb8ab3b2c5e8b0c97a5"

// Ubicacion default (Ciudad de Mexico)
const DEFAULT_LOCATION: [number, number] = [19.4326, -99.1332]

interface ORSResponse {
  features: Array<{
    properties: {
      summary: {
        distance: number
        duration: number
      }
      segments: Array<{
        steps: Array<{
          instruction: string
          name: string
          distance: number
          duration: number
        }>
      }>
    }
    geometry: {
      coordinates: number[][]
    }
  }>
}

export async function calculateRoute(
  destination: [number, number], 
  userLocation?: [number, number]
): Promise<Route[]> {
  const origin = userLocation || DEFAULT_LOCATION
  
  try {
    // OpenRouteService usa formato [lon, lat] pero nosotros usamos [lat, lon]
    const startLon = origin[1]
    const startLat = origin[0]
    const endLon = destination[1]
    const endLat = destination[0]

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startLon},${startLat}&end=${endLon},${endLat}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json, application/geo+json",
      },
    })

    if (!response.ok) {
      return generateMockRoutes(destination, origin)
    }

    const data: ORSResponse = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const distanceKm = feature.properties.summary.distance / 1000
      const durationMin = Math.round(feature.properties.summary.duration / 60)
      const geometry = feature.geometry.coordinates

      return generateRoutesFromRealData(durationMin, distanceKm, destination, geometry)
    }

    return generateMockRoutes(destination, origin)
  } catch (error) {
    return generateMockRoutes(destination, origin)
  }
}

// Calculate walking route to a bus stop using OpenRouteService (via API)
export async function calculateWalkingRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<{
  route: [number, number][]
  distance: number
  duration: number
}> {
  const response = await fetch("/api/walking-route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ origin, destination }),
  })

  if (!response.ok) {
    throw new Error("No se pudo calcular ruta caminando")
  }

  const data = await response.json()

  return {
    route: data.route,
    distance: data.distance,
    duration: data.duration,
  }
}

// Haversine formula for distance calculation
export function calculateHaversineDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((point2[0] - point1[0]) * Math.PI) / 180
  const dLon = ((point2[1] - point1[1]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1[0] * Math.PI) / 180) *
      Math.cos((point2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Alias for backwards compatibility
export const calculateDistance = calculateHaversineDistance

function generateRoutesFromRealData(
  baseDuration: number, 
  distance: number, 
  destination: [number, number],
  geometry: number[][]
): Route[] {
  // Convertir coordenadas de [lon, lat] a [lat, lon]
  const routeCoords = geometry.map(coord => [coord[1], coord[0]] as [number, number])
  
  const routes: Route[] = [
    {
      id: "1",
      name: "Ruta 42 Express",
      totalTime: Math.round(baseDuration * 1.3), // Ajuste para transporte publico
      walkingTime: 3,
      nextBusIn: Math.floor(Math.random() * 6) + 2,
      distance: Math.round(distance * 10) / 10,
      geometry: routeCoords,
      stops: [
        "Tu ubicacion",
        "Av. Insurgentes Sur",
        "Metro Chapultepec",
        "Reforma",
        "Destino",
      ],
    },
    {
      id: "2",
      name: "Ruta 15 Local",
      totalTime: Math.round(baseDuration * 1.6),
      walkingTime: 5,
      nextBusIn: Math.floor(Math.random() * 4) + 1,
      distance: Math.round((distance * 1.2) * 10) / 10,
      geometry: routeCoords,
      stops: [
        "Tu ubicacion",
        "Centro Historico",
        "Av. Juarez",
        "Paseo de la Reforma",
        "Polanco",
        "Destino",
      ],
    },
    {
      id: "3",
      name: "Ruta 88 Rapido",
      totalTime: Math.round(baseDuration * 1.4),
      walkingTime: 7,
      nextBusIn: Math.floor(Math.random() * 8) + 5,
      distance: Math.round((distance * 1.1) * 10) / 10,
      geometry: routeCoords,
      stops: [
        "Tu ubicacion",
        "Estacion Metro",
        "Universidad",
        "Destino",
      ],
    },
  ]

  return routes.sort((a, b) => a.totalTime - b.totalTime)
}

function generateMockRoutes(destination: [number, number], origin: [number, number]): Route[] {
  const baseTime = 20 + Math.floor(Math.random() * 15)
  const baseDistance = 4 + Math.random() * 6

  // Crear ruta simple entre origen y destino
  const mockGeometry: [number, number][] = [
    origin,
    [(origin[0] + destination[0]) / 2, (origin[1] + destination[1]) / 2],
    destination
  ]

  return [
    {
      id: "1",
      name: "Ruta 42 Express",
      totalTime: baseTime,
      walkingTime: 3,
      nextBusIn: Math.floor(Math.random() * 5) + 2,
      distance: Math.round(baseDistance * 10) / 10,
      geometry: mockGeometry,
      stops: [
        "Tu ubicacion",
        "Av. Insurgentes",
        "Metro Chapultepec",
        "Reforma",
        "Destino",
      ],
    },
    {
      id: "2",
      name: "Ruta 15 Local",
      totalTime: baseTime + 8,
      walkingTime: 5,
      nextBusIn: Math.floor(Math.random() * 3) + 1,
      distance: Math.round((baseDistance + 2) * 10) / 10,
      geometry: mockGeometry,
      stops: [
        "Tu ubicacion",
        "Plaza del Sol",
        "Centro Historico",
        "Av. Universidad",
        "Parque Central",
        "Destino",
      ],
    },
    {
      id: "3",
      name: "Ruta 88 Rapido",
      totalTime: baseTime + 4,
      walkingTime: 7,
      nextBusIn: Math.floor(Math.random() * 7) + 4,
      distance: Math.round((baseDistance + 1) * 10) / 10,
      geometry: mockGeometry,
      stops: [
        "Tu ubicacion",
        "Estacion Metro",
        "Plaza Mayor",
        "Destino",
      ],
    },
  ].sort((a, b) => a.totalTime - b.totalTime)
}
