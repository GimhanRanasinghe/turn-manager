// Types for the API response
export interface FlightData {
  hex: string
  flight?: string
  r?: string // Registration
  t?: string // Aircraft type
  desc?: string // Aircraft description
  alt_baro?: number
  gs?: number // Ground speed
  track?: number // Track/heading
  lat?: number
  lon?: number
  dir?: number
  speed?: number
  flight_number?: string
  flight_icao?: string
  flight_iata?: string
  dep_icao?: string
  dep_iata?: string
  arr_icao?: string
  arr_iata?: string
  airline_icao?: string
  airline_iata?: string
  aircraft_icao?: string
  updated?: number
  status?: string
  lastPosition?: {
    lat?: number
    lon?: number
  }
}

export interface ApiResponse {
  ac: FlightData[]
  total: number
  ctime: number
  ptime: number
}

// Default Toronto coordinates
const DEFAULT_LOCATION = {
  lat: 43.6777,
  lng: -79.6248,
  radius: 100, // radius in nautical miles
}

// Function to fetch flights around a specific location
export async function fetchFlightsByLocation(location = DEFAULT_LOCATION) {
  try {
    // Use the airplanes.live API
    const apiUrl = `https://api.airplanes.live/v2/point/${location.lat}/${location.lng}/${location.radius}`
    console.log(`Fetching flights from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Disable caching to ensure fresh data
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Received data with ${data.ac?.length || 0} flights`)

    // Log a sample flight to see the structure
    if (data.ac && data.ac.length > 0) {
      console.log("Sample flight data:", JSON.stringify(data.ac[0], null, 2))
    }

    // Normalize the flight data to ensure we have coordinates
    const normalizedFlights = data.ac.map((flight: FlightData) => {
      // Check if coordinates are in the lastPosition object (some APIs structure it this way)
      if (flight.lastPosition && flight.lastPosition.lat !== undefined && flight.lastPosition.lon !== undefined) {
        console.log(
          `Flight ${flight.hex} has coordinates in lastPosition: ${flight.lastPosition.lat}, ${flight.lastPosition.lon}`,
        )
        return {
          ...flight,
          lat: flight.lastPosition.lat,
          lon: flight.lastPosition.lon,
          lng: flight.lastPosition.lon, // Standardize to lng for our app
        }
      }
      // Check if we have direct lat/lon properties
      else if (flight.lat !== undefined && flight.lon !== undefined) {
        // console.log(`Flight ${flight.hex} has direct coordinates: ${flight.lat}, ${flight.lon}`)
        return {
          ...flight,
          lng: flight.lon, // Standardize to lng for our app
        }
      }
      // No valid coordinates found
      else {
        console.warn(`Flight ${flight.hex} has no valid coordinates`)
        return flight
      }
    })

    // Count flights with valid coordinates
    const validFlights = normalizedFlights.filter(
      (f) => f.lat !== undefined && (f.lng !== undefined || f.lon !== undefined),
    )
    console.log(`Found ${validFlights.length} flights with valid coordinates out of ${normalizedFlights.length} total`)

    return { ...data, ac: normalizedFlights }
  } catch (error) {
    console.error("Error fetching flight data:", error)
    // Return test flights as a fallback
    return generateTestFlights()
  }
}

// Function to generate test flights when API fails
function generateTestFlights(): ApiResponse {
  console.log("Generating test flights around Toronto")

  const testFlights: FlightData[] = []

  // Generate 20 test flights around Toronto
  for (let i = 0; i < 20; i++) {
    // Random position around Toronto
    const lat = DEFAULT_LOCATION.lat + (Math.random() - 0.5) * 2
    const lng = DEFAULT_LOCATION.lng + (Math.random() - 0.5) * 2

    // Random altitude between 10000 and 40000 feet
    const alt = Math.floor(10000 + Math.random() * 30000)

    // Random heading between 0 and 359 degrees
    const dir = Math.floor(Math.random() * 360)

    // Random speed between 300 and 600 knots
    const speed = Math.floor(300 + Math.random() * 300)

    // Generate a flight number
    const flightNumber = `AC${1000 + Math.floor(Math.random() * 9000)}`

    // Generate a hex code
    const hex = Math.random().toString(16).substring(2, 8).toUpperCase()

    testFlights.push({
      hex,
      lat,
      lon: lng,
      alt_baro: alt,
      dir,
      speed,
      flight: flightNumber,
      r: `C-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      t: ["B77W", "B788", "A320", "A321", "B38M"][Math.floor(Math.random() * 5)],
      desc: "TEST AIRCRAFT",
    })
  }

  return {
    ac: testFlights,
    total: testFlights.length,
    ctime: Date.now() / 1000,
    ptime: 0,
  }
}

// Function to convert API flight data to our app's format
export function convertApiFlightToAppFlight(flight: FlightData) {
  // Extract flight number and clean it
  const flightNumber = flight.flight ? flight.flight.trim() : flight.hex

  // Extract origin and destination
  const origin = {
    code: flight.dep_icao || flight.dep_iata || "Unknown",
    name: flight.dep_icao
      ? `${flight.dep_icao} Airport`
      : flight.dep_iata
        ? `${flight.dep_iata} Airport`
        : "Unknown Origin",
    lat: 0,
    lng: 0,
  }

  const destination = {
    code: flight.arr_icao || flight.arr_iata || "Unknown",
    name: flight.arr_icao
      ? `${flight.arr_icao} Airport`
      : flight.arr_iata
        ? `${flight.arr_iata} Airport`
        : "Unknown Destination",
    lat: 0,
    lng: 0,
  }

  // Get coordinates, checking both direct properties and lastPosition
  let lat = 0
  let lng = 0

  if (flight.lat !== undefined && !isNaN(Number(flight.lat))) {
    lat = Number(flight.lat)
  } else if (flight.lastPosition?.lat !== undefined && !isNaN(Number(flight.lastPosition.lat))) {
    lat = Number(flight.lastPosition.lat)
  }

  if (flight.lon !== undefined && !isNaN(Number(flight.lon))) {
    lng = Number(flight.lon)
  } else if (flight.lng !== undefined && !isNaN(Number(flight.lng))) {
    lng = Number(flight.lng)
  } else if (flight.lastPosition?.lon !== undefined && !isNaN(Number(flight.lastPosition.lon))) {
    lng = Number(flight.lastPosition.lon)
  }

  // Generate a path based on current position and heading
  const path = generateFlightPath({
    ...flight,
    lat,
    lon: lng,
  })

  return {
    id: flight.hex,
    flightNumber,
    lat,
    lng,
    heading: flight.track || flight.dir || 0,
    altitude: flight.alt_baro || 0,
    speed: flight.gs || flight.speed || 0,
    origin,
    destination,
    aircraft: flight.t || "Unknown",
    airline: flight.airline_icao || flight.airline_iata || extractAirlineFromFlight(flightNumber),
    status: getFlightStatus(flight),
    path,
    updated: flight.updated || Date.now() / 1000,
  }
}

// Helper function to extract airline code from flight number
function extractAirlineFromFlight(flightNumber: string): string {
  // Extract letters from the beginning of the flight number
  const match = flightNumber.match(/^[A-Z]+/)
  return match ? match[0] : "Unknown"
}

// Helper function to determine flight status
function getFlightStatus(flight: FlightData): string {
  if (!flight.alt_baro) return "Unknown"
  if (flight.alt_baro < 1000) return "Landing/Takeoff"
  if (flight.alt_baro < 5000) return "Climbing/Descending"
  return "In Air"
}

// Helper function to generate a simple flight path
function generateFlightPath(flight: FlightData): [number, number][] {
  if (!flight.lat || !flight.lon) return []

  // If we have origin and destination coordinates, we could create a more accurate path
  // For now, we'll just create a simple path based on current position and heading
  const path: [number, number][] = []
  const currentPos: [number, number] = [flight.lon, flight.lat]
  path.push(currentPos)

  // If we have a direction, add a point in that direction
  if (flight.track || flight.dir) {
    const distance = 0.5 // degrees
    const angle = (flight.track || flight.dir || 0) * (Math.PI / 180)
    const destLng = flight.lon + distance * Math.sin(angle)
    const destLat = flight.lat + distance * Math.cos(angle)
    path.push([destLng, destLat])
  }

  return path
}
