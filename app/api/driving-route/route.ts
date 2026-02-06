import { NextRequest, NextResponse } from "next/server"

// Use the same API key that works for walking routes
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA4Yzg3NzNkNWFjZDkyYjI1M2NiNTg4Zjk2ZjQ2YTgyNzdjNzFjNWY2NGZhN2FiZTgwNmUzMmMyIiwiaCI6Im11cm11cjY0In0="

interface StepInstruction {
  instruction: string
  distance: number // meters
  duration: number // seconds
  type: number
  name: string
  way_points: number[]
}

// ORS instruction type to Spanish text
function translateInstructionType(type: number, name: string): string {
  const streetName = name && name !== "-" ? ` por ${name}` : ""
  switch (type) {
    case 0: return `Gira a la izquierda${streetName}`
    case 1: return `Gira a la derecha${streetName}`
    case 2: return `Gira fuerte a la izquierda${streetName}`
    case 3: return `Gira fuerte a la derecha${streetName}`
    case 4: return `Gira ligeramente a la izquierda${streetName}`
    case 5: return `Gira ligeramente a la derecha${streetName}`
    case 6: return `Continua recto${streetName}`
    case 7: return `Entra a la glorieta${streetName}`
    case 8: return `Sal de la glorieta${streetName}`
    case 9: return `Retorno en U${streetName}`
    case 10: return `Has llegado a tu destino`
    case 11: return `Inicia el recorrido${streetName}`
    case 12: return `Mantente a la izquierda${streetName}`
    case 13: return `Mantente a la derecha${streetName}`
    default: return `Continua${streetName}`
  }
}

function formatStepDistance(meters: number): string {
  if (meters < 1000) {
    return `En ${Math.round(meters)} m`
  }
  return `En ${(meters / 1000).toFixed(1)} km`
}

// Fetch route between two points using GET method
async function getRouteBetweenPoints(
  origin: [number, number],
  destination: [number, number]
): Promise<{ route: [number, number][]; distance: number; duration: number; steps: StepInstruction[] }> {
  const startLon = origin[1]
  const startLat = origin[0]
  const endLon = destination[1]
  const endLat = destination[0]

  const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}&start=${startLon},${startLat}&end=${endLon},${endLat}`

  const response = await fetch(url, {
    headers: {
      Accept: "application/json, application/geo+json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouteService error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (!data.features || !data.features[0] || !data.features[0].geometry) {
    throw new Error("Invalid response format from OpenRouteService")
  }

  const feature = data.features[0]
  const geometry = feature.geometry.coordinates
  const distance = feature.properties.summary.distance / 1000
  const duration = Math.round(feature.properties.summary.duration / 60)

  // Extract step-by-step instructions
  const steps: StepInstruction[] = []
  if (feature.properties.segments) {
    for (const segment of feature.properties.segments) {
      if (segment.steps) {
        for (const step of segment.steps) {
          steps.push({
            instruction: translateInstructionType(step.type, step.name),
            distance: step.distance,
            duration: step.duration,
            type: step.type,
            name: step.name || "",
            way_points: step.way_points || [],
          })
        }
      }
    }
  }

  return {
    route: geometry.map((coord: number[]) => [coord[1], coord[0]]),
    distance,
    duration,
    steps,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { stops } = await request.json()

    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return NextResponse.json(
        { error: "At least 2 stops are required" },
        { status: 400 }
      )
    }

    const allRoutePoints: [number, number][] = []
    const allSteps: Array<{ instruction: string; distance: string; type: number; pointIndex: number }> = []
    let totalDistance = 0
    let totalDuration = 0
    let pointOffset = 0

    for (let i = 0; i < stops.length - 1; i++) {
      const origin = stops[i] as [number, number]
      const destination = stops[i + 1] as [number, number]

      try {
        const segmentResult = await getRouteBetweenPoints(origin, destination)

        // Convert steps to a simpler format with global point indices
        for (const step of segmentResult.steps) {
          allSteps.push({
            instruction: step.instruction,
            distance: formatStepDistance(step.distance),
            type: step.type,
            pointIndex: pointOffset + (step.way_points[0] || 0),
          })
        }

        if (i === 0) {
          allRoutePoints.push(...segmentResult.route)
          pointOffset = segmentResult.route.length
        } else {
          allRoutePoints.push(...segmentResult.route.slice(1))
          pointOffset += segmentResult.route.length - 1
        }

        totalDistance += segmentResult.distance
        totalDuration += segmentResult.duration
      } catch (segmentError) {
        console.error(`Error fetching segment ${i} to ${i + 1}:`, segmentError)
        if (i === 0) {
          allRoutePoints.push(origin)
          pointOffset = 1
        }
        allRoutePoints.push(destination)
        pointOffset += 1
      }
    }

    return NextResponse.json({
      route: allRoutePoints,
      distance: totalDistance,
      duration: totalDuration,
      steps: allSteps,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Driving route API error:", errorMessage)
    return NextResponse.json(
      { error: `No se pudo calcular la ruta: ${errorMessage}` },
      { status: 500 }
    )
  }
}
