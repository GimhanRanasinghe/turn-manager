"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useTheme } from "next-themes"
import { Plane, ChevronRight, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TurnaroundControlBar } from "./turnaround-control-bar"
import TurnaroundListView from "./turnaround-list-view"

// Toronto Pearson International Airport coordinates
const TORONTO_PEARSON = {
  center: [-79.6248, 43.6777],
  zoom: 14,
}

// Map styles for dark theme
const MAP_STYLE = "mapbox://styles/mapbox/dark-v11"

// Mock data for aircraft at gates with maintenance status
const MOCK_AIRCRAFT = [
  {
    id: "AC1235",
    position: [-79.61579, 43.6792],
    status: "on-time",
    color: "#22c55e",
    registration: "C-GKLM",
    type: "A320",
    flight: "AC1235",
    outboundFlight: "AC827",
    origin: "YVR",
    destination: "YYZ",
    gate: "14",
    bay: "E60",
    statuses: {
      OTP: "green", // On-Time Performance
      HEALTH: "amber",
      OPS: "green", // Operations
      TCM: "green", // Turn Compliance Monitoring
      MCC: "green", // Maintenance Control Center
      ATA: "green", // Actual Time of Arrival
    },
  },
  {
    id: "AC456",
    position: [-79.61551, 43.6817],
    status: "on-time",
    color: "#22c55e",
    registration: "C-FGDX",
    type: "B787",
    flight: "AC456",
    outboundFlight: "AC902",
    origin: "LHR",
    destination: "YYZ",
    gate: "22",
    bay: "E45",
    statuses: {
      OTP: "green",
      HEALTH: "green",
      OPS: "green",
      TCM: "green",
      MCC: "green",
      ATA: "green",
    },
  },
  {
    id: "AC789",
    position: [-79.61261, 43.6789],
    status: "on-time",
    color: "#22c55e",
    registration: "C-GJZM",
    type: "B777",
    flight: "AC789",
    outboundFlight: "AC953",
    origin: "HKG",
    destination: "YYZ",
    gate: "25",
    bay: "E32",
    statuses: {
      OTP: "green",
      HEALTH: "green",
      OPS: "green",
      TCM: "green",
      MCC: "green",
      ATA: "green",
    },
  },
  {
    id: "AC234",
    position: [-79.61261, 43.6789],
    status: "delayed",
    color: "#f59e0b",
    registration: "C-FGDT",
    type: "A321",
    flight: "AC234",
    outboundFlight: "AC512",
    origin: "LAX",
    destination: "YYZ",
    gate: "18",
    bay: "E22",
    statuses: {
      OTP: "amber",
      HEALTH: "amber",
      OPS: "green",
      TCM: "green",
      MCC: "green",
      ATA: "green",
    },
  },
  {
    id: "AC567",
    position: [-79.61757, 43.67991],
    status: "delayed",
    color: "#f59e0b",
    registration: "C-GFZO",
    type: "B737",
    flight: "AC567",
    outboundFlight: "AC721",
    origin: "MEX",
    destination: "YYZ",
    gate: "32",
    bay: "E15",
    statuses: {
      OTP: "amber",
      HEALTH: "green",
      OPS: "amber",
      TCM: "amber",
      MCC: "green",
      ATA: "green",
    },
  },
  {
    id: "AC890",
    position: [-79.61671, 43.68292],
    status: "maintenance",
    color: "#ef4444",
    registration: "C-FSIQ",
    type: "A330",
    flight: "AC890",
    outboundFlight: "AC891",
    origin: "CDG",
    destination: "YYZ",
    gate: "45",
    bay: "E08",
    statuses: {
      OTP: "red",
      HEALTH: "red",
      OPS: "amber",
      TCM: "amber",
      MCC: "amber",
      ATA: "green",
    },
  },
]

// Toronto Pearson International Airport gate data with coordinates
const TORONTO_GATES = {
  // Terminal 1 Gates
  "T1-D1": { terminal: "Terminal 1", coordinates: [-79.6134, 43.6789] },
  "T1-D3": { terminal: "Terminal 1", coordinates: [-79.6138, 43.6791] },
  "T1-D5": { terminal: "Terminal 1", coordinates: [-79.6142, 43.6793] },
  "T1-D7": { terminal: "Terminal 1", coordinates: [-79.6146, 43.6795] },
  "T1-D20": { terminal: "Terminal 1", coordinates: [-79.615, 43.6797] },
  // Terminal 3 Gates
  "T3-A1": { terminal: "Terminal 3", coordinates: [-79.631, 43.6765] },
  "T3-A4": { terminal: "Terminal 3", coordinates: [-79.6315, 43.676] },
  "T3-A6": { terminal: "Terminal 3", coordinates: [-79.632, 43.6755] },
  "T3-B7": { terminal: "Terminal 3", coordinates: [-79.6325, 43.675] },
  "T3-B9": { terminal: "Terminal 3", coordinates: [-79.633, 43.6745] },
}

interface TurnaroundMapProps {
  onSelectAircraft?: (aircraftId: string) => void
  onViewDetails?: (aircraft: any) => void
}

export default function TurnaroundMap({ onSelectAircraft, onViewDetails }: TurnaroundMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  // UI state
  const [showAll, setShowAll] = useState(true)
  const [showDelayed, setShowDelayed] = useState(false)
  const [selectedAirport, setSelectedAirport] = useState("YYZ")
  const [selectedView, setSelectedView] = useState("")
  const [selectedGate, setSelectedGate] = useState("")
  const [timeValue, setTimeValue] = useState(180) // 3 hours in minutes
  const [mapViewEnabled, setMapViewEnabled] = useState(true)
  const [satelliteView, setSatelliteView] = useState(false)
  const [viewMode, setViewMode] = useState("map")

  // Popup state
  const [selectedAircraftData, setSelectedAircraftData] = useState<(typeof MOCK_AIRCRAFT)[0] | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)

  // Initialize map when component mounts and viewMode is "map"
  useEffect(() => {
    // Only initialize the map if we're in map view mode
    if (!mapContainer.current || viewMode !== "map") return

    // Initialize Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""
    console.log("Initializing turnaround map with token:", mapboxgl.accessToken ? "Token exists" : "No token")

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: TORONTO_PEARSON.center,
      zoom: TORONTO_PEARSON.zoom,
      pitch: 0, // Flat view for airport layout
      bearing: 0,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Set up aircraft markers when the map loads
    map.current.on("load", () => {
      console.log("Turnaround map loaded")
      setMapLoaded(true)
      setLoading(false)

      // Add aircraft markers
      MOCK_AIRCRAFT.forEach((aircraft) => {
        // Create a DOM element for the marker
        const el = document.createElement("div")
        el.className = "aircraft-marker"
        el.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="${aircraft.color}" 
                  d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        `

        // Create a marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
          rotationAlignment: "viewport",
          pitchAlignment: "viewport",
          scale: 1,
        })
          .setLngLat(aircraft.position)
          .addTo(map.current!)

        // Add click event
        el.addEventListener("click", (e) => {
          e.stopPropagation() // Prevent map click

          // Get marker position on screen
          const markerElement = marker.getElement()
          const rect = markerElement.getBoundingClientRect()

          // Set popup position slightly above the marker
          setPopupPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          })

          // Set selected aircraft data
          setSelectedAircraftData(aircraft)

          // Also call the parent callback if provided
          if (onSelectAircraft) {
            onSelectAircraft(aircraft.id)
          }
        })
      })

      // Close popup when clicking elsewhere on the map
      map.current.on("click", () => {
        setSelectedAircraftData(null)
        setPopupPosition(null)
      })
    })

    // Clean up on unmount or when viewMode changes
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onSelectAircraft, viewMode]) // Add viewMode as a dependency

  useEffect(() => {
    if (map.current && mapLoaded) {
      const newStyle = satelliteView ? "mapbox://styles/mapbox/satellite-v9" : MAP_STYLE
      map.current.setStyle(newStyle)
    }
  }, [satelliteView, mapLoaded])

  // Handle filter toggle
  const handleFilterToggle = (value: string) => {
    if (value === "all") {
      setShowAll(true)
      setShowDelayed(false)
    } else if (value === "delayed") {
      setShowAll(false)
      setShowDelayed(true)
    }
  }

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-500"
      case "amber":
        return "bg-amber-500"
      case "red":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Handle View Details button click
  const handleViewDetailsClick = () => {
    if (selectedAircraftData && onViewDetails) {
      onViewDetails(selectedAircraftData)
      setSelectedAircraftData(null)
      setPopupPosition(null)
    }
  }

  const handleViewModeChange = (mode: string) => {
    console.log("View mode changed to:", mode)
    setViewMode(mode)

    // Reset map state when switching views
    if (mode === "list" && map.current) {
      map.current.remove()
      map.current = null
      setMapLoaded(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Control Bar */}
      <TurnaroundControlBar
        showAll={showAll}
        showDelayed={showDelayed}
        selectedAirport={selectedAirport}
        selectedView={selectedView}
        selectedGate={selectedGate}
        timeValue={timeValue}
        mapViewEnabled={mapViewEnabled}
        onFilterToggle={handleFilterToggle}
        onAirportChange={setSelectedAirport}
        onViewChange={setSelectedView}
        onGateChange={setSelectedGate}
        onTimeChange={(value) => setTimeValue(value[0])}
        onSatelliteViewChange={setSatelliteView}
        torontoGates={TORONTO_GATES}
        selectedViewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Content Container */}
      <div className="flex-1 relative">
        {viewMode === "map" ? (
          // Map View
          <div ref={mapContainer} className="h-full w-full" />
        ) : (
          // List View - Using the new TurnaroundListView component
          <TurnaroundListView />
        )}

        {/* Loading Indicator */}
        {loading && viewMode === "map" && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <span>Loading map...</span>
          </div>
        )}

        {/* Aircraft Popup */}
        {selectedAircraftData && popupPosition && (
          <div
            className="fixed z-50 w-72 bg-black border border-gray-800 rounded-md shadow-lg"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-mono">{selectedAircraftData.registration}</span>
                <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded">{selectedAircraftData.type}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedAircraftData(null)
                  setPopupPosition(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Info Rows */}
            <div className="p-3 bg-gray-900">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="flex items-center gap-2">
                  <Plane size={14} className="text-blue-400" />
                  <span className="text-gray-400 text-sm">Flight</span>
                </div>
                <div className="text-right text-white text-sm font-medium">{selectedAircraftData.flight}</div>

                <div className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-blue-400" />
                  <span className="text-gray-400 text-sm">Outbound</span>
                </div>
                <div className="text-right text-white text-sm font-medium">{selectedAircraftData.destination}</div>

                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-400 rotate-45"></div>
                  </div>
                  <span className="text-gray-400 text-sm">Gate</span>
                </div>
                <div className="text-right text-white text-sm font-medium">{selectedAircraftData.gate}</div>
              </div>
            </div>

            {/* Status Buttons */}
            <div className="p-3 grid grid-cols-3 gap-2">
              <div
                className={cn(
                  "rounded-full py-1 px-3 flex items-center justify-center text-xs font-medium text-white",
                  getStatusColorClass(selectedAircraftData.statuses.OTP),
                )}
              >
                OTP
              </div>
              <div
                className={cn(
                  "rounded-full py-1 px-3 flex items-center justify-center text-xs font-medium text-white",
                  getStatusColorClass(selectedAircraftData.statuses.HEALTH),
                )}
              >
                HEALTH
              </div>
              <div
                className={cn(
                  "rounded-full py-1 px-3 flex items-center justify-center text-xs font-medium text-white",
                  getStatusColorClass(selectedAircraftData.statuses.OPS),
                )}
              >
                OPS
              </div>
              <div
                className={cn(
                  "rounded-full py-1 px-3 flex items-center justify-center text-xs font-medium text-white",
                  getStatusColorClass(selectedAircraftData.statuses.TCM),
                )}
              >
                TCM
              </div>
              <div
                className={cn(
                  "rounded-full py-1 px-3 flex items-center justify-center text-xs font-medium text-white",
                  getStatusColorClass(selectedAircraftData.statuses.MCC),
                )}
              >
                MCC
              </div>
              <div
                className={cn(
                  "rounded-full py-1 px-3 flex items-center justify-center text-xs font-medium text-white",
                  getStatusColorClass(selectedAircraftData.statuses.ATA),
                )}
              >
                ATA
              </div>
            </div>

            {/* View Details Button */}
            <div className="p-3 pt-0">
              <Button
                variant="outline"
                className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={handleViewDetailsClick}
              >
                <span>View Details</span>
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .aircraft-marker {
          cursor: pointer;
          width: 24px;
          height: 24px;
          transition: transform 0.2s ease;
        }
        
        .aircraft-marker:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}
