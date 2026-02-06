import { NextRequest, NextResponse } from "next/server"

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA4Yzg3NzNkNWFjZDkyYjI1M2NiNTg4Zjk2ZjQ2YTgyNzdjNzFjNWY2NGZhN2FiZTgwNmUzMmMyIiwiaCI6Im11cm11cjY0In0="

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json()

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      )
    }

    const startLon = origin[1]
    const startLat = origin[0]
    const endLon = destination[1]
    const endLat = destination[0]

    const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}&start=${startLon},${startLat}&end=${endLon},${endLat}`

    console.log("Calling ORS API:", url)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json, application/geo+json",
      },
    })

    console.log("ORS Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ORS Error response:", errorText)
      throw new Error(`OpenRouteService error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    console.log("ORS Data received:", JSON.stringify(data).substring(0, 500))

    if (!data.features || !data.features[0] || !data.features[0].geometry) {
      throw new Error("Invalid response format from OpenRouteService")
    }

    const geometry = data.features[0].geometry.coordinates
    const distance = data.features[0].properties.summary.distance / 1000
    const duration = Math.round(data.features[0].properties.summary.duration / 60)

    const result = {
      route: geometry.map((coord: number[]) => [coord[1], coord[0]]),
      distance,
      duration,
    }

    console.log("Returning route result:", {
      routeLength: result.route.length,
      distance: result.distance,
      duration: result.duration,
    })

    return NextResponse.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Walking route API error:", errorMessage)
    return NextResponse.json(
      { error: `No se pudo calcular ruta caminando: ${errorMessage}` },
      { status: 500 }
    )
  }
}
