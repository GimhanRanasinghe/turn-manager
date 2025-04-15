"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { fetchFlightsByLocation, convertApiFlightToAppFlight } from "@/services/flight-api"
import { useTheme } from "next-themes"

// Toronto area coordinates
const TORONTO_CENTER = [-79.3832, 43.6532]

// Default location for fetching flights
const DEFAULT_LOCATION = {
  lat: 43.6532,
  lng: -79.3832,
  radius: 100, // radius in nautical miles
}

// Map styles for light and dark themes
const MAP_STYLES = {
  light: "mapbox://styles/mapbox/standard",
  dark: "mapbox://styles/mapbox/dark-v11",
  // dark: "mapbox://styles/mapbox/dark-v11",
  system: "mapbox://styles/mapbox/dark-v11", // Default to dark for system
}

// Interface for our app's flight format
interface AppFlight {
  id: string
  flightNumber: string
  lat: number
  lng: number
  heading: number
  altitude: number
  speed: number
  origin: {
    code: string
    name: string
    lat: number
    lng: number
  }
  destination: {
    code: string
    name: string
    lat: number
    lng: number
  }
  aircraft: string
  airline: string
  status: string
  path: [number, number][]
  updated: number
}

// Add this to the component props
interface MapProps {
  onSelectFlight?: (flightId: string | null) => void
}

// Update the function signature
export default function Map({ onSelectFlight }: MapProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [flights, setFlights] = useState<AppFlight[]>([])
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [showAllPaths, setShowAllPaths] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [aircraftLayerAdded, setAircraftLayerAdded] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = theme === "system" ? resolvedTheme : theme

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""
    console.log("Initializing map with token:", mapboxgl.accessToken ? "Token exists" : "No token")

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[currentTheme as keyof typeof MAP_STYLES] || MAP_STYLES.dark, // Use theme-based style
      center: TORONTO_CENTER,
      zoom: 9,
      pitch: 30, // Add some 3D perspective
      bearing: 0,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Add scale
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")

    // Add toggle for flight paths
    const togglePathsButton = document.createElement("button")
    togglePathsButton.className = "mapboxgl-ctrl mapboxgl-ctrl-group"
    togglePathsButton.innerHTML = `
      <button title="Toggle All Flight Paths">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
        </svg>
      </button>
    `
    togglePathsButton.addEventListener("click", () => {
      setShowAllPaths(!showAllPaths)
    })

    const customControl = document.createElement("div")
    customControl.className = "mapboxgl-ctrl-top-right"
    customControl.style.marginTop = "50px"
    customControl.appendChild(togglePathsButton)
    mapContainer.current.appendChild(customControl)

    // Add a button to generate test flights for debugging
    const testFlightsButton = document.createElement("button")
    testFlightsButton.className = "mapboxgl-ctrl mapboxgl-ctrl-group"
    testFlightsButton.innerHTML = `
      <button title="Generate Test Flights">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </button>
    `
    testFlightsButton.addEventListener("click", () => {
      console.log("Generating test flights")
      generateTestFlights()
    })

    const testControl = document.createElement("div")
    testControl.className = "mapboxgl-ctrl-top-right"
    testControl.style.marginTop = "100px"
    testControl.appendChild(testFlightsButton)
    mapContainer.current.appendChild(testControl)

    // Update map center when map moves
    map.current.on("moveend", () => {
      if (map.current) {
        const center = map.current.getCenter()
        setMapCenter({
          lat: center.lat,
          lng: center.lng,
          radius: DEFAULT_LOCATION.radius, // Keep the same radius
        })
      }
    })

    // Set up aircraft layer when the map loads
    map.current.on("load", () => {
      console.log("Map loaded")
      setMapLoaded(true)

      // Add aircraft source
      map.current.addSource("aircraft", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      })

      // Load aircraft icon based on theme
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = currentTheme === "dark" ? "/aircraft-icon.svg" : "/aircraft-icon-black.svg"
      console.log(`Loading aircraft icon for ${currentTheme} theme: ${img.src}`)
      img.onerror = (e) => {
        console.error("Error loading aircraft icon:", e)
        console.error("Image src:", img.src)
        // Try to continue anyway
        setAircraftLayerAdded(true)
      }

      // Set a timeout to ensure we don't get stuck waiting for the icon
      setTimeout(() => {
        if (!aircraftLayerAdded) {
          console.warn("Aircraft icon load timed out, continuing anyway")
          setAircraftLayerAdded(true)
        }
      }, 5000) // 5 second timeout

      img.onload = () => {
        if (!map.current) return

        console.log("Aircraft icon loaded successfully")

        try {
          // Add the image to the map
          map.current.addImage("aircraft-icon", img)

          // Add aircraft layer
          map.current.addLayer({
            id: "aircraft",
            type: "symbol",
            source: "aircraft",
            layout: {
              "icon-image": "aircraft-icon",
              "icon-size": 0.9,
              "icon-rotate": ["get", "heading"],
              "icon-rotation-alignment": "map",
              "icon-allow-overlap": true,
              "text-field": ["get", "flightNumber"],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 1],
              "text-anchor": "top",
              "text-size": 12,
            },
            paint: {
              "text-color": currentTheme === "light" ? "#000000" : "#ffffff",
              "text-halo-color": currentTheme === "light" ? "#ffffff" : "#000000",
              "text-halo-width": 1,
            },
          })

          // Add click event to the aircraft layer
          map.current.on("click", "aircraft", (e) => {
            if (!e.features || e.features.length === 0) return

            const feature = e.features[0]
            const flightId = feature.properties?.id

            if (flightId) {
              setSelectedFlightId(flightId)
              onSelectFlight?.(flightId)
            }
          })

          // Change cursor to pointer when hovering over aircraft
          map.current.on("mouseenter", "aircraft", () => {
            if (map.current) map.current.getCanvas().style.cursor = "pointer"
          })

          map.current.on("mouseleave", "aircraft", () => {
            if (map.current) map.current.getCanvas().style.cursor = ""
          })

          setAircraftLayerAdded(true)
          console.log("Aircraft layer added")
        } catch (err) {
          console.error("Error adding aircraft layer:", err)
          // Try to continue anyway
          setAircraftLayerAdded(true)
        }
      }

      // Add flight paths source
      map.current.addSource("flight-paths", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      })

      // Add flight paths layer
      /*
      map.current.addLayer({
        id: "flight-paths",
        type: "line",
        source: "flight-paths",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 2,
          "line-opacity": ["case", ["==", ["get", "selected"], true], 0.8, ["==", ["get", "showAll"], true], 0.8, 0],
        },
      })
      */
    })

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [currentTheme])

  // Update when theme changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !aircraftLayerAdded) return

    console.log("Theme changed to:", currentTheme)

    // Update aircraft icon when theme changes
    const newImg = new Image()
    newImg.crossOrigin = "anonymous"
    newImg.src = currentTheme === "dark" ? "/aircraft-icon.svg" : "/aircraft-icon-black.svg"

    newImg.onload = () => {
      if (!map.current) return

      try {
        // Remove existing image if it exists
        if (map.current.hasImage("aircraft-icon")) {
          map.current.removeImage("aircraft-icon")
        }

        // Add the new image
        map.current.addImage("aircraft-icon", newImg)
        console.log(`Updated aircraft icon for ${currentTheme} theme`)

        // Update text color based on theme
        if (map.current.getLayer("aircraft")) {
          map.current.setPaintProperty("aircraft", "text-color", currentTheme === "dark" ? "#ffffff" : "#000000")
          map.current.setPaintProperty("aircraft", "text-halo-color", currentTheme === "dark" ? "#000000" : "#ffffff")
        }
      } catch (err) {
        console.error("Error updating aircraft icon:", err)
      }
    }
  }, [currentTheme, mapLoaded, aircraftLayerAdded])

  // Function to generate test flights for debugging
  const generateTestFlights = () => {
    if (!map.current || !mapLoaded) return

    console.log("Generating test flights")

    const center = map.current.getCenter()
    const testFlights: AppFlight[] = []

    // Generate 10 test flights around the current center
    for (let i = 0; i < 10; i++) {
      // Random position around center
      const lat = center.lat + (Math.random() - 0.5) * 1
      const lng = center.lng + (Math.random() - 0.5) * 1

      // Random altitude between 10000 and 40000 feet
      const alt = Math.floor(10000 + Math.random() * 30000)

      // Random heading between 0 and 359 degrees
      const heading = Math.floor(Math.random() * 360)

      // Random speed between 300 and 600 knots
      const speed = Math.floor(300 + Math.random() * 300)

      // Generate a flight number
      const flightNumber = `TEST${1000 + Math.floor(Math.random() * 9000)}`

      // Generate a hex code
      const id = `TEST${Math.random().toString(16).substring(2, 8).toUpperCase()}`

      // Generate a path
      const path: [number, number][] = [
        [lng, lat],
        [lng + Math.sin(heading * (Math.PI / 180)) * 0.5, lat + Math.cos(heading * (Math.PI / 180)) * 0.5],
      ]

      testFlights.push({
        id,
        flightNumber,
        lat,
        lng,
        heading,
        altitude: alt,
        speed,
        origin: {
          code: "TEST",
          name: "Test Origin",
          lat: 0,
          lng: 0,
        },
        destination: {
          code: "DEST",
          name: "Test Destination",
          lat: 0,
          lng: 0,
        },
        aircraft: "TEST",
        airline: "TEST",
        status: "In Air",
        path,
        updated: Date.now() / 1000,
      })
    }

    setFlights(testFlights)
    console.log("Generated", testFlights.length, "test flights")
  }

  // Fetch flight data based on map center
  useEffect(() => {
    let isMounted = true

    const loadFlightData = async () => {
      // Throttle API requests to avoid rate limiting
      const now = Date.now()
      if (now - lastFetchTime < 5000) {
        // Don't fetch more than once every 5 seconds
        return
      }

      try {
        setLoading(true)
        setLastFetchTime(now)

        const data = await fetchFlightsByLocation(mapCenter)

        if (isMounted) {
          // Convert API data to our app format
          const appFlights = data.ac
            .filter((flight) => {
              // Check if flight has valid coordinates
              const hasLat = flight.lat !== undefined && !isNaN(Number(flight.lat))
              const hasLon = flight.lon !== undefined && !isNaN(Number(flight.lon))
              const hasLastPositionLat =
                flight.lastPosition?.lat !== undefined && !isNaN(Number(flight.lastPosition.lat))
              const hasLastPositionLon =
                flight.lastPosition?.lon !== undefined && !isNaN(Number(flight.lastPosition.lon))

              const hasValidCoords = (hasLat && hasLon) || (hasLastPositionLat && hasLastPositionLon)

              if (!hasValidCoords) {
                console.warn(`Filtering out flight ${flight.hex} due to missing coordinates`)
              }

              return hasValidCoords
            })
            .map(convertApiFlightToAppFlight)

          console.log(`Converted ${appFlights.length} flights with valid coordinates`)

          // Log a sample of the converted flights
          if (appFlights.length > 0) {
            console.log("Sample converted flight:", appFlights[0])
          }

          setFlights(appFlights)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load flight data")
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Only load flight data if the map is loaded
    if (mapLoaded && aircraftLayerAdded) {
      console.log("Map and aircraft layer are ready, loading flight data...")
      // Load initial data immediately
      loadFlightData()

      // Set up interval to refresh data
      const interval = setInterval(loadFlightData, 15000) // Refresh every 15 seconds

      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }
  }, [mapCenter, lastFetchTime, mapLoaded, aircraftLayerAdded])

  // Add a useEffect to trigger data loading when the aircraft layer is added
  useEffect(() => {
    if (mapLoaded && aircraftLayerAdded && flights.length === 0) {
      console.log("Aircraft layer added, triggering initial data load")
      // Force a refresh by updating lastFetchTime
      setLastFetchTime(0)
    }
  }, [mapLoaded, aircraftLayerAdded, flights.length])

  // Update aircraft and flight paths on the map
  useEffect(() => {
    if (!map.current || !mapLoaded || !aircraftLayerAdded || flights.length === 0) return

    console.log(`Updating map with ${flights.length} flights`)

    try {
      // Convert flights to GeoJSON features for aircraft
      const aircraftFeatures = flights.map((flight) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [flight.lng, flight.lat],
        },
        properties: {
          id: flight.id,
          flightNumber: flight.flightNumber,
          heading: flight.heading,
          altitude: flight.altitude,
          speed: flight.speed,
          origin: flight.origin.code,
          destination: flight.destination.code,
          aircraft: flight.aircraft,
          airline: flight.airline,
          status: flight.status,
        },
      }))

      // Update aircraft source
      const aircraftSource = map.current.getSource("aircraft") as mapboxgl.GeoJSONSource
      aircraftSource.setData({
        type: "FeatureCollection",
        features: aircraftFeatures,
      })

      // Convert flight paths to GeoJSON features
      const pathFeatures = flights.map((flight) => ({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: flight.path,
        },
        properties: {
          id: flight.id,
          selected: flight.id === selectedFlightId,
          showAll: showAllPaths,
        },
      }))

      // Update flight paths source
      const pathsSource = map.current.getSource("flight-paths") as mapboxgl.GeoJSONSource
      pathsSource.setData({
        type: "FeatureCollection",
        features: pathFeatures,
      })

      console.log("Updated aircraft and flight paths on map")
    } catch (err) {
      console.error("Error updating map:", err)
    }
  }, [flights, selectedFlightId, showAllPaths, mapLoaded, aircraftLayerAdded])

  // Update flight path visibility when selection or showAllPaths changes
  useEffect(() => {
    if (!map.current || !mapLoaded || flights.length === 0) return

    try {
      // Get the flight paths source
      const pathsSource = map.current.getSource("flight-paths") as mapboxgl.GeoJSONSource
      if (!pathsSource) return

      // Get the current data
      const data = (pathsSource as any)._data as {
        type: string
        features: Array<{
          type: string
          geometry: any
          properties: {
            id: string
            selected: boolean
            showAll: boolean
          }
        }>
      }

      // Update the properties
      const updatedFeatures = data.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          selected: feature.properties.id === selectedFlightId,
          showAll: showAllPaths,
        },
      }))

      // Set the updated data
      pathsSource.setData({
        type: "FeatureCollection",
        features: updatedFeatures,
      })
    } catch (err) {
      console.error("Error updating flight path visibility:", err)
    }
  }, [selectedFlightId, showAllPaths, mapLoaded])

  // Function to manually refresh data
  const handleRefresh = async () => {
    try {
      setLoading(true)
      setLastFetchTime(Date.now())

      const data = await fetchFlightsByLocation(mapCenter)

      // Convert API data to our app format
      const appFlights = data.ac
        .filter((flight) => {
          // Check if flight has valid coordinates
          const hasLat = flight.lat !== undefined && !isNaN(Number(flight.lat))
          const hasLon = flight.lon !== undefined && !isNaN(Number(flight.lon))
          const hasLastPositionLat = flight.lastPosition?.lat !== undefined && !isNaN(Number(flight.lastPosition.lat))
          const hasLastPositionLon = flight.lastPosition?.lon !== undefined && !isNaN(Number(flight.lastPosition.lon))

          const hasValidCoords = (hasLat && hasLon) || (hasLastPositionLat && hasLastPositionLon)

          if (!hasValidCoords) {
            console.warn(`Filtering out flight ${flight.hex} due to missing coordinates`)
          }

          return hasValidCoords
        })
        .map(convertApiFlightToAppFlight)

      console.log(`Refreshed data: Found ${appFlights.length} flights with valid coordinates`)

      setFlights(appFlights)
      setError(null)
    } catch (err) {
      setError("Failed to refresh flight data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div ref={mapContainer} className="h-full w-full" />

      {loading && flights.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md">
          Loading flight data...
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-md flex flex-col items-center">
          <div>{error}</div>
          <button onClick={handleRefresh} className="mt-2 px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 text-sm">
            Try Again
          </button>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-md text-sm">
        <div>
          Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
        </div>
        <div>Radius: {mapCenter.radius} nm</div>
        <div>Flights: {flights.length}</div>
        <button
          onClick={handleRefresh}
          className="mt-2 px-3 py-1 bg-blue-500/50 rounded-md hover:bg-blue-500/70 text-xs"
        >
          Refresh Data
        </button>
      </div>

      <style jsx global>{`
        .flight-marker {
          position: relative;
        }
        
        .flight-icon {
          width: 24px;
          height: 24px;
          color: #3b82f6;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .flight-marker:hover .flight-icon {
          transform: scale(1.2) rotate(${flights[0]?.heading || 0}deg) !important;
        }
        
        .flight-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        
        .flight-marker:hover .flight-tooltip {
          opacity: 1;
        }
        
        .test-marker {
          position: relative;
        }
        
        .test-icon {
          width: 24px;
          height: 24px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .test-marker:hover .test-icon {
          transform: scale(1.2);
        }
        
        .test-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        
        .test-marker:hover .test-tooltip {
          opacity: 1;
        }
      `}</style>
    </>
  )
}
