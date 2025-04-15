"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { AircraftSidePanel } from "./aircraft-side-panel"
import { GateInfoDrawer } from "./gate-info-drawer"
import { AircraftPopup } from "./aircraft-popup"
import { GSEVehicleDrawer } from "./gse-vehicle-drawer"
import {
  MOCK_AIRCRAFT,
  TORONTO_GATES,
  GATE_TIMELINE_DATA,
  GATE_STATUS,
  TORONTO_PEARSON,
  GSE_VEHICLES,
} from "@/lib/data/hub-mock-data"
import { gseVehicleWebSocket, type GSEVehicle } from "@/services/gse-vehicle-api"
import Papa from 'papaparse';

// Map styles
const DARK_MAP_STYLE = "mapbox://styles/mapbox/dark-v11"
const LIGHT_MAP_STYLE = "mapbox://styles/mapbox/standard"

interface HubMapProps {
  onSelectAircraft?: (aircraftId: string | null) => void
  satelliteView?: boolean
  gateCoordinates?: [number, number] | null
}

export default function HubMap({ onSelectAircraft, satelliteView = false, gateCoordinates = null }: HubMapProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersAdded = useRef(false)
  const [loading, setLoading] = useState(true)
  const [pts,setPTS] = useState({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false)
  const [selectedAircraftPopup, setSelectedAircraftPopup] = useState<any>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [selectedAircraftDetails, setSelectedAircraftDetails] = useState<any>(null)
  const [selectedGseVehicle, setSelectedGseVehicle] = useState<string | null>(null)
  const [gseVehicleDrawerOpen, setGseVehicleDrawerOpen] = useState(false)
  const [liveGseVehicles, setLiveGseVehicles] = useState<GSEVehicle[]>([])
  const gseVehicleMarkersRef = useRef<{ [id: string]: mapboxgl.Marker }>({})
  const [showMarkerDialog, setShowMarkerDialog] = useState(false)

  // Flight animation state
  const [flightsData, setFlightsData] = useState<Record<string, any[]>>({})
  const flightMarkersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const flightAnimationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const flightIndicesRef = useRef<Record<string, number>>({})

  const flyToLocation = useCallback((coordinates: [number, number], options = {}) => {
    if (!map.current) return

    try {
      map.current.flyTo({
        center: coordinates,
        zoom: 18.5,
        pitch: 45,
        bearing: TORONTO_PEARSON.bearing || 0,
        speed: 1.2,
        curve: 1.8,
        essential: true,
        duration: 2000,
        ...options,
      })
    } catch (error) {
      console.error("Error during flyTo animation:", error)
    }
  }, [])

  const calculateHeading = useCallback((lat1, lon1, lat2, lon2,flightId="flight") => {
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    lat1 = lat1 * (Math.PI / 180)
    lat2 = lat2 * (Math.PI / 180)
    
    const y = Math.sin(dLon) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
    const bearing = Math.atan2(y, x) * (180 / Math.PI)
    let heading_off_set = 0
    if (flightId.startsWith("flight")) {
      heading_off_set= 0 
    } else if (flightId.startsWith("vehicle")) {
      heading_off_set = 270
    }
    
    return (((bearing + 360) % 360)+heading_off_set)
  }, [])

  const loadFlightPathData = useCallback(async () => {
    try {
      const response = await fetch('flight.csv')
      const csvText = await response.text()
      
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const data = results.data.filter(row => 
              row.latitude && row.longitude && row.seconds !== undefined && row.flightId
            )
            
            // Group data by flightId
            const flights: Record<string, any[]> = {}
            data.forEach(row => {
              if (!flights[row.flightId]) {
                flights[row.flightId] = []
              }
              flights[row.flightId].push(row)
            })
            
            setFlightsData(flights)
            console.log("Loaded flight path data:", Object.keys(flights).length, "flights")
            resolve(flights)
          },
          error: (error) => {
            console.error("Error parsing CSV:", error)
            resolve({})
          }
        })
      })
    } catch (error) {
      console.error("Error loading flight path CSV:", error)
      return {}
    }
  }, [])

  const initializeFlightMarkers = useCallback(() => {
    if (!map.current || Object.keys(flightsData).length === 0) return

    // Clear existing markers
    Object.values(flightMarkersRef.current).forEach(marker => marker.remove())
    flightMarkersRef.current = {}

    // Initialize markers for each flight
    Object.entries(flightsData).forEach(([flightId, flightPath]) => {

      if (flightPath.length === 0) return

      const el = document.createElement("div")
      let dark_icon = "";
      let light_icon = "";
      let heading_off_set = 0
      if (flightId.startsWith("flight")) {
        el.className = "flight-marker"
        dark_icon = 'aircraft-icon-black.svg'
        light_icon = 'aircraft-icon.svg'
        heading_off_set = 0
      } else if (flightId.startsWith("vehicle")) {
        el.className = "gse-vehicle-marker"
        dark_icon = 'gse-vehicle-icon-dark.svg'
        light_icon = 'gse-vehicle-icon.svg'
        heading_off_set = 20
      } else if (flightId.startsWith("gate")) {
        // Do something for gate
      }

      
      // el.className = "flight-marker"
      
      // Calculate initial heading
      let initialHeading = 0
      if (flightPath.length > 1) {
        const p1 = flightPath[0]
        const p2 = flightPath[1]
        initialHeading = calculateHeading(p1.latitude, p1.longitude, p2.latitude, p2.longitude,flightId)
      }
      
      const icon = resolvedTheme === "light" ? dark_icon : light_icon;
      el.innerHTML = `
        <div class="flight-icon" style="transform: rotate(${initialHeading}deg)">
          <img src="${icon}" 
              width="24" height="16" alt="flight-icon" />
        </div>
      `

      // Create marker at first position
      const initialPosition = [flightPath[0].longitude, flightPath[0].latitude]
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
        rotationAlignment: "map",
      })
        .setLngLat(initialPosition)
        .addTo(map.current)

      flightMarkersRef.current[flightId] = marker

      if (flightId.startsWith("flight")) {
        // Add click handler
        // Add click event handler
        let aircraft = { id: "AC123", position: [-79.61579, 43.6792], status: "on-time", color: "green" }
        el.addEventListener("click", () => {
          if (true) {
            // onSelectAircraft
            // First zoom to the aircraft position
            // flyToLocation(aircraft.position, {
            //   zoom: 18.5,
            //   pitch: 30,
            //   duration: 1500,
            // })

            // Wait for the animation to complete before showing the popup
            setTimeout(() => {
              const aircraftData = {
                id: aircraft.id,
                position: aircraft.position,
                registration: `C-${aircraft.id.substring(2)}`,
                flightNumber: aircraft.id,
                outbound: "YYZ",
                gate: `${Math.floor(Math.random() * 50) + 1}`,
                statuses: {
                  OTP: Math.random() > 0.5 ? "green" : "orange",
                  HEALTH: Math.random() > 0.5 ? "green" : "orange",
                  OPS: Math.random() > 0.5 ? "green" : "orange",
                  TCM: Math.random() > 0.5 ? "green" : "orange",
                  MCC: Math.random() > 0.5 ? "green" : "orange",
                  ATA: Math.random() > 0.5 ? "green" : "orange",
                },
              }

              setSelectedAircraftPopup(aircraftData)

              // Calculate popup position
              if (map.current) {
                const pos = map.current.project(aircraft.position)
                setPopupPosition({
                  x: pos.x,
                  y: pos.y - 180,
                })
              }
            }, 1000) // Match the duration of the flyTo animation
          }
        })
      } else if (flightId.startsWith("vehicle")) {
        // Add click event handler
        el.addEventListener("click", () => {
          console.log(`Live GSE vehicle ${'GSE1007'} clicked`)

          // Close any open drawers or panels
          setDrawerOpen(false)
          setSidePanelOpen(false)
          setSelectedAircraftPopup(null)

          // Set selected GSE vehicle and open drawer
          setSelectedGseVehicle('GSE1007')
          setGseVehicleDrawerOpen(true)

          // Fly to the vehicle position
          // flyToLocation([vehicle.longitude, vehicle.latitude], {
          //   zoom: 18.5,
          //   pitch: 30,
          //   duration: 1500,
          // })
        })
      }
    })

    // Initialize indices
    const indices: Record<string, number> = {}
    Object.keys(flightsData).forEach(flightId => {
      indices[flightId] = 0
    })
    flightIndicesRef.current = indices
  }, [flightsData, resolvedTheme, calculateHeading])

  function getPTSStatus(progress) {
    if (progress == 0) return "scheduled";
    if (progress == 100) return "completed";
    return "in-progress";
  }

  const startFlightsAnimation = useCallback(() => {
    if (Object.keys(flightsData).length === 0) return

    // Clear existing timer
    if (flightAnimationTimerRef.current !== null) {
      clearInterval(flightAnimationTimerRef.current)
    }

    flightAnimationTimerRef.current = setInterval(() => {
      const newIndices = {...flightIndicesRef.current}

      Object.entries(flightsData).forEach(([flightId, flightPath]) => {
        const currentIndex = newIndices[flightId]
        const nextIndex = (currentIndex + 1) % flightPath.length
        newIndices[flightId] = nextIndex

        const currentPoint = flightPath[currentIndex]
        const nextPoint = flightPath[nextIndex]
        const marker = flightMarkersRef.current[flightId]

        if (marker) {
          // Update position
          marker.setLngLat([currentPoint.longitude, currentPoint.latitude])

          // Update rotation if there's a next point
          if (nextPoint) {
            const heading = calculateHeading(
              currentPoint.latitude, 
              currentPoint.longitude, 
              nextPoint.latitude, 
              nextPoint.longitude,
              flightId
            )

          let current_time = new Date("2025-04-12T10:31:00")
          if (flightId == 'flight1'){
            setPTS({
              flightNumber: "AC45611 "+currentPoint.parking_progress+" "+currentPoint.seconds,
              origin: "C-FSKP",
              status: {
                disruption: false,
                message: "No disruptions expected",
                level: "none" // none, low, medium, high
              },
              currentTime: new Date(current_time.getTime() + currentPoint.seconds * 1000),
              ragSummary: {
                red: 2,
                amber: 3,
                green: 12,
              },
              categories: [
                {
                  name: "Flight Movement",
                  id: "flight-movement",
                  icon: "plane",
                  expanded: true,
                  events: [
                    {
                      id: "arrival",
                      name: "Arrival (STA)",
                      scheduledStart: new Date("2025-04-12T10:31:00"),
                      actualStart: currentPoint.arrival_progress < 100 ? null : new Date("2025-04-12T10:42:51"),
                      isMilestone: true,
                      status: getPTSStatus(currentPoint.arrival_progress),
                      progress: currentPoint.arrival_progress
                    },
                    {
                      id: "parking",
                      name: "Aircraft Parking",
                      scheduledStart: new Date("2025-04-12T10:35:00"),
                      actualStart: currentPoint.parking_progress == 0 ? null : new Date("2025-04-12T10:43:00"),
                      scheduledEnd: new Date("2025-04-12T10:45:00"),
                      actualEnd: currentPoint.parking_progress < 100 ? null : new Date("2025-04-12T10:55:00"),
                      status: getPTSStatus(currentPoint.parking_progress),
                      progress: currentPoint.parking_progress
                    },
                    {
                      id: "pushback",
                      name: "Pushback",
                      scheduledStart: new Date("2025-04-12T12:20:00"),
                      scheduledEnd: new Date("2025-04-12T12:25:00"),
                      actualStart: currentPoint.pushback_progress == 0 ? null : new Date("2025-04-12T12:20:00"),
                      actualEnd: currentPoint.pushback_progress < 100 ? null : new Date("2025-04-12T12:30:00") ,
                      status: getPTSStatus(currentPoint.pushback_progress),
                      progress: currentPoint.pushback_progress
                    },
                    {
                      id: "departure",
                      name: "Departure (STD)",
                      scheduledStart: new Date("2025-04-12T12:50:00"),
                      actualStart: currentPoint.departure_progress < 100 ? null : new Date("2025-04-12T12:50:00"),
                      isMilestone: true,
                      status:getPTSStatus(currentPoint.departure_progress),
                      progress: currentPoint.departure_progress
                    }
                  ]
                },
                {
                  name: "Passenger Flow",
                  id: "passenger-flow",
                  icon: "users",
                  expanded: true,
                  events: [
                    {
                      id: "disembarkation",
                      name: "Disembarkation",
                      scheduledStart: new Date("2025-04-12T10:40:00"),
                      actualStart: new Date("2025-04-12T10:50:00"),
                      scheduledEnd: new Date("2025-04-12T10:55:00"),
                      actualEnd: new Date("2025-04-12T11:05:00"),
                      status: "completed",
                      progress: 100
                    },
                    {
                      id: "boarding",
                      name: "Boarding",
                      scheduledStart: new Date("2025-04-12T11:45:00"),
                      scheduledEnd: new Date("2025-04-12T12:15:00"),
                      actualStart: null,
                      actualEnd: null,
                      status: "scheduled",
                      progress: 0
                    }
                  ]
                },
                {
                  name: "Baggage Handling",
                  id: "baggage",
                  icon: "briefcase",
                  expanded: true,
                  events: [
                    {
                      id: "baggage-unloading",
                      name: "Baggage Unloading",
                      scheduledStart: new Date("2025-04-12T10:40:00"),
                      actualStart: new Date("2025-04-12T10:52:00"),
                      scheduledEnd: new Date("2025-04-12T10:55:00"),
                      actualEnd: new Date("2025-04-12T11:12:00"),
                      status: "completed",
                      progress: 100
                    },
                    {
                      id: "baggage-loading",
                      name: "Baggage Loading",
                      scheduledStart: new Date("2025-04-12T11:30:00"),
                      scheduledEnd: new Date("2025-04-12T12:00:00"),
                      actualStart: null,
                      actualEnd: null,
                      status: "scheduled",
                      progress: 0
                    }
                  ]
                },
                {
                  name: "Servicing",
                  id: "servicing",
                  icon: "coffee",
                  expanded: true,
                  events: [
                    {
                      id: "cleaning",
                      name: "Cleaning",
                      scheduledStart: new Date("2025-04-12T10:50:00"),
                      scheduledEnd: new Date("2025-04-12T11:20:00"),
                      actualStart: new Date("2025-04-12T11:00:00"),
                      actualEnd: new Date("2025-04-12T11:30:00"),
                      status: "completed",
                      progress: 100
                    },
                    {
                      id: "refueling",
                      name: "Refueling",
                      scheduledStart: new Date("2025-04-12T11:00:00"),
                      scheduledEnd: new Date("2025-04-12T11:30:00"),
                      actualStart: new Date("2025-04-12T11:05:00"),
                      actualEnd: null,
                      status: "in-progress",
                      progress: 80
                    },
                    {
                      id: "catering-load",
                      name: "Catering Load",
                      scheduledStart: new Date("2025-04-12T11:15:00"),
                      scheduledEnd: new Date("2025-04-12T11:45:00"),
                      actualStart: new Date("2025-04-12T11:25:00"),
                      actualEnd: null,
                      status: "in-progress",
                      progress: 40
                    }
                  ]
                },
                {
                  name: "Ops & Safety",
                  id: "ops-safety",
                  icon: "wrench",
                  expanded: true,
                  events: [
                    {
                      id: "cabin-ready-check",
                      name: "Cabin Ready Check",
                      scheduledStart: new Date("2025-04-12T12:10:00"),
                      scheduledEnd: null,
                      actualStart: null,
                      actualEnd: null,
                      isMilestone: true,
                      status: "scheduled",
                      progress: 0
                    },
                    {
                      id: "load-sheet",
                      name: "Load Sheet Finalized",
                      scheduledStart: new Date("2025-04-12T12:15:00"),
                      scheduledEnd: null,
                      actualStart: null,
                      actualEnd: null,
                      isMilestone: true,
                      status: "scheduled",
                      progress: 0
                    }
                  ]
                },
                {
                  name: "Final Departure Prep",
                  id: "departure-prep",
                  icon: "clipboard",
                  expanded: true,
                  events: [
                    {
                      id: "door-close",
                      name: "Door Close",
                      scheduledStart: new Date("2025-04-12T12:15:00"),
                      scheduledEnd: new Date("2025-04-12T12:20:00"),
                      actualStart: null,
                      actualEnd: null,
                      isMilestone: true,
                      status: "scheduled",
                      progress: 0
                    },
                    {
                      id: "pushback-start",
                      name: "Pushback Start",
                      scheduledStart: new Date("2025-04-12T12:20:00"),
                      scheduledEnd: new Date("2025-04-12T12:25:00"),
                      actualStart: null,
                      actualEnd: null,
                      isMilestone: true,
                      status: "scheduled",
                      progress: 0
                    }
                  ]
                }
              ]
            })}
            
            const icon = marker.getElement()
            if (icon) {
              const iconDiv = icon.querySelector('.flight-icon')
              if (iconDiv) {
                iconDiv.style.transform = `rotate(${heading}deg)`
              }
            }
          }
        }
      })

      flightIndicesRef.current = newIndices
    }, 5) // Update every 100ms
  }, [flightsData, calculateHeading])

  const addMarkersToMap = useCallback(() => {
    if (!map.current || markersAdded.current) return

    console.log("Adding markers to map")

    // Add gate markers
    Object.entries(TORONTO_GATES).forEach(([gateId, gateInfo]) => {
      if (!gateInfo || !gateInfo.coordinates) return

      const el = document.createElement("div")
      const id = gateId?.split(":")[1]
      el.className = "gate-marker"
      el.innerHTML = `
        <div class="gate-icon">
          <div class="gate-label">${id}</div>
        </div>
      `

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat(gateInfo.coordinates)
        .addTo(map.current!)

      el.addEventListener("click", () => {
        if (onSelectAircraft) {
          onSelectAircraft(gateId)
        }

        setGseVehicleDrawerOpen(false)
        setSelectedGate(id)
        setDrawerOpen(true)

        flyToLocation(gateInfo.coordinates, {
          zoom: 18.5,
          pitch: 45,
          duration: 2000,
        })

        el.querySelector(".gate-icon")?.classList.add("gate-selected")
        document.querySelectorAll(".gate-selected").forEach((element) => {
          if (element !== el.querySelector(".gate-icon")) {
            element.classList.remove("gate-selected")
          }
        })
      })
    })

    markersAdded.current = true
  }, [onSelectAircraft, flyToLocation])

  useEffect(() => {
    if (!mapContainer.current) return

    markersAdded.current = false

    // Initialize Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""
    const currentTheme = resolvedTheme || theme
    const mapStyle = currentTheme === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: TORONTO_PEARSON.center,
      zoom: TORONTO_PEARSON.zoom,
      pitch: 0,
      bearing: TORONTO_PEARSON.bearing || 0,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    map.current.on("load", () => {
      console.log("Hub map loaded")
      setMapLoaded(true)
      setLoading(false)

      setTimeout(() => {
        addMarkersToMap()
        loadFlightPathData().then(() => {
          setTimeout(() => {
            initializeFlightMarkers()
            startFlightsAnimation()
          }, 1000)
        })
      }, 500)
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
      if (flightAnimationTimerRef.current !== null) {
        clearInterval(flightAnimationTimerRef.current)
      }
    }
  }, [addMarkersToMap, resolvedTheme, theme])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const currentTheme = resolvedTheme || theme
    const newStyle = satelliteView
      ? "mapbox://styles/mapbox/satellite-v9"
      : currentTheme === "light"
        ? LIGHT_MAP_STYLE
        : DARK_MAP_STYLE

    map.current.setStyle(newStyle)

    map.current.once("styledata", () => {
      markersAdded.current = false
      addMarkersToMap()
      if (Object.keys(flightsData).length > 0) {
        initializeFlightMarkers()
        startFlightsAnimation()
      }
    })
  }, [satelliteView, mapLoaded, addMarkersToMap, theme, resolvedTheme, flightsData, initializeFlightMarkers, startFlightsAnimation])

  useEffect(() => {
    if (map.current && mapLoaded && gateCoordinates) {
      flyToLocation(gateCoordinates, {
        zoom: 17,
        pitch: 30,
        speed: 1.5,
        curve: 1.5,
      })
    }
  }, [gateCoordinates, mapLoaded, flyToLocation])

  // Get timeline data for the selected gate
  const getTimelineData = () => {
    if (!selectedGate) return null
    return GATE_TIMELINE_DATA[selectedGate] || null
  }

  // Add a function to reset the map to initial view
  const resetMapView = useCallback(() => {
    if (map.current) {
      flyToLocation(TORONTO_PEARSON.center, {
        zoom: TORONTO_PEARSON.zoom,
        pitch: 0,
        bearing: TORONTO_PEARSON.bearing || 0,
        duration: 1500,
      })
    }
  }, [flyToLocation])

  const timelineData = getTimelineData()

  // Update popup position when map moves
  useEffect(() => {
    if (!map.current || !selectedAircraftPopup) return

    const updatePopupPosition = () => {
      if (map.current && selectedAircraftPopup) {
        const pos = map.current.project(selectedAircraftPopup.position)
        setPopupPosition({
          x: pos.x,
          y: pos.y - 180,
        })
      }
    }

    map.current.on("move", updatePopupPosition)

    return () => {
      if (map.current) {
        map.current.off("move", updatePopupPosition)
      }
    }
  }, [selectedAircraftPopup])

  // Handle opening the side panel with aircraft details
  const handleViewDetails = (aircraft: any) => {
    // Create detailed aircraft object
    setSelectedAircraftDetails({
      id: aircraft.id,
      registration: aircraft.registration || `C-${aircraft.id.substring(2)}`,
      flightNumber: aircraft.flightNumber || aircraft.id,
      type: "B737-800",
      origin: "YYZ",
      destination: aircraft.outbound || "YVR",
      gate: aircraft.gate || "32",
      statuses: aircraft.statuses || {
        OTP: "green",
        HEALTH: "green",
        OPS: "orange",
        TCM: "orange",
        MCC: "green",
        ATA: "green",
      },
    })

    // Open the side panel
    setSidePanelOpen(true)

    // Close the popup
    setSelectedAircraftPopup(null)
  }

  // Handle closing the aircraft popup
  const handleClosePopup = () => {
    setSelectedAircraftPopup(null)
    resetMapView() // Reset map to default view when closing popup
  }

  // Add this effect to handle the WebSocket connection
  useEffect(() => {
    if (!mapLoaded) return

    // Connect to the GSE vehicle WebSocket
    gseVehicleWebSocket.onMessage((data) => {
      console.log("Received GSE vehicle data:", data.vehicles.length, "vehicles")
      setLiveGseVehicles(data.vehicles)
    })

    gseVehicleWebSocket.onConnect(() => {
      console.log("Connected to GSE vehicle WebSocket")
    })

    gseVehicleWebSocket.onError((error) => {
      console.error("GSE vehicle WebSocket error:", error)
    })

    gseVehicleWebSocket.connect()

    // Clean up on unmount
    return () => {
      gseVehicleWebSocket.disconnect()
    }
  }, [mapLoaded])

  // Add this effect to update the GSE vehicle markers
  useEffect(() => {
    if (!map.current || !mapLoaded || liveGseVehicles.length === 0) return

    console.log("Updating GSE vehicle markers:", liveGseVehicles.length)

    // Update or create markers for each vehicle
    liveGseVehicles.forEach((vehicle) => {
      const markerId = vehicle.id
      const markerExists = gseVehicleMarkersRef.current[markerId]

      if (markerExists) {
        // Update existing marker position
        gseVehicleMarkersRef.current[markerId].setLngLat([vehicle.longitude, vehicle.latitude])
      } else {
        // Create a new marker
        const el = document.createElement("div")
        el.className = "gse-vehicle-marker"
        vehicle.heading = 100
        el.innerHTML = `
                        <div class="gse-vehicle-icon" style="transform: rotate(${vehicle.heading}deg)">
                          <img src="${resolvedTheme === "light" ? "/gse-vehicle-icon-dark.svg" : "/gse-vehicle-icon.svg"}" width="24" height="16" alt="GSE Vehicle" />
                        </div>
                      `

        // Add marker to map
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
          //rotationAlignment: "map",
        })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .addTo(map.current!)

        // Add click event handler
        el.addEventListener("click", () => {
          console.log(`Live GSE vehicle ${vehicle.id} clicked`)

          // Close any open drawers or panels
          setDrawerOpen(false)
          setSidePanelOpen(false)
          setSelectedAircraftPopup(null)

          // Set selected GSE vehicle and open drawer
          setSelectedGseVehicle(vehicle.id)
          setGseVehicleDrawerOpen(true)

          // Fly to the vehicle position
          flyToLocation([vehicle.longitude, vehicle.latitude], {
            zoom: 18.5,
            pitch: 30,
            duration: 1500,
          })
        })

        // Store the marker reference
        gseVehicleMarkersRef.current[markerId] = marker
      }
    })

    // Remove markers for vehicles that are no longer in the data
    Object.keys(gseVehicleMarkersRef.current).forEach((id) => {
      if (!liveGseVehicles.some((vehicle) => vehicle.id === id)) {
        gseVehicleMarkersRef.current[id].remove()
        delete gseVehicleMarkersRef.current[id]
      }
    })
  }, [liveGseVehicles, mapLoaded, flyToLocation, resolvedTheme])

  return (
    <>
      <div ref={mapContainer} className="h-full w-full" />

      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <span>Loading map...</span>
        </div>
      )}

      {/* Gate Info Drawer */}
      <GateInfoDrawer
        selectedGate={selectedGate}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        timelineDialogOpen={timelineDialogOpen}
        setTimelineDialogOpen={setTimelineDialogOpen}
        timelineData={timelineData}
        gateStatus={GATE_STATUS}
        onClose={resetMapView}
        liveGseVehicles={liveGseVehicles}
      />

      {/* GSE Vehicle Drawer */}
      <GSEVehicleDrawer
        vehicleId={selectedGseVehicle}
        drawerOpen={gseVehicleDrawerOpen}
        setDrawerOpen={setGseVehicleDrawerOpen}
        onClose={resetMapView}
        liveVehicles={liveGseVehicles}
      />

      {/* Aircraft Popup - Now using the separate component */}
      {selectedAircraftPopup && popupPosition && (
        <AircraftPopup
          aircraft={selectedAircraftPopup}
          position={popupPosition}
          onClose={handleClosePopup}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Aircraft Side Panel with Accordion */}
      {sidePanelOpen && selectedAircraftDetails && (
        <AircraftSidePanel
          aircraft={selectedAircraftDetails}
          open={sidePanelOpen}
          onClose={() => {
            setSidePanelOpen(false)
            resetMapView() // Reset map zoom when closing the panel
          }}
          pts={pts}
        />
      )}

      {/*<div className="absolute bottom-4 left-4 z-10">
        <Button
          onClick={() => setMarkerCreationMode(!markerCreationMode)}
          variant={markerCreationMode ? "default" : "outline"}
          className={`${markerCreationMode ? "bg-blue-600 hover:bg-blue-700" : "bg-black/50 hover:bg-black/70"} text-white`}
          size="sm"
        >
          {markerCreationMode ? "Cancel Marker" : "Create Marker"}
        </Button>
      </div>*/}

      {/* Marker Creation Dialog */}
      {showMarkerDialog && (
        <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 border border-gray-700 rounded-md shadow-lg w-180 p-4">
          <h3 className="text-white text-lg font-medium mb-4">Marker</h3>

          {pendingMarkerCoordinates && (
            <div className="mb-4 p-3 bg-gray-800/70 rounded-md">
              <div className="grid grid-cols-[1fr,auto] gap-2 text-sm items-center">
                <div className="text-gray-400">Longitude, Latitude:</div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono">
                    [{pendingMarkerCoordinates[0].toFixed(6)},{pendingMarkerCoordinates[1].toFixed(6)}]
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `[${pendingMarkerCoordinates[0].toFixed(6)},${pendingMarkerCoordinates[1].toFixed(6)}]`,
                      )
                      // Optional: Add visual feedback
                      const button = document.querySelector(".copy-btn")
                      if (button) {
                        button.classList.add("copied")
                        setTimeout(() => button.classList.remove("copied"), 1000)
                      }
                    }}
                    className="copy-btn p-1 rounded hover:bg-gray-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-300"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowMarkerDialog(false)
                setPendingMarkerCoordinates(null)
              }}
              className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .vehicle-path {
          stroke: #3b82f6;
          stroke-width: 3;
          stroke-opacity: 0.7;
          fill: none;
        }
        .aircraft-marker {
          cursor: pointer;
          width: 24px;
          height: 24px;
        }
        
        .aircraft-marker:hover {
          transform: scale(1.2);
        }

        .gate-marker {
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gate-icon {
          background-color: ${resolvedTheme === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.7)"};
          border: 2px solid #3b82f6;
          border-radius: 4px;
          min-width: 32px;  
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;  
          transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 0 0 rgba(59, 130, 246, 0.5);
        }

        .gate-label {
          color: ${resolvedTheme === "light" ? "black" : "white"};
          font-size: 12px;
          white-space: nowrap;
          letter-spacing: -0.5px;
        }

        .gate-marker:hover .gate-icon {
          transform: scale(1.1);
          background-color: ${resolvedTheme === "light" ? "rgba(255,255,255,0.95)" : "rgba(0, 0, 0, 0.85)"};
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
          border-color: #60a5fa;
        }

        .gate-selected {
          background-color: rgba(0, 0, 0, 0.85) !important;
          border-color: #f59e0b !important;
        }

        .gate-icon.gate-selected {
          background-color: ${resolvedTheme === "light" ? "rgba(255,255,255,0.95)" : "rgba(0, 0, 0, 0.85)"};
          border: 2px solid #f59e0b;
          transform: scale(1.15);
        }

        .custom-marker {
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-marker-icon {
          background-color: rgba(255, 87, 51, 0.8);
          border: 2px solid white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .custom-marker-label {
          color: white;
          font-size: 8px;
          font-weight: bold;
          white-space: nowrap;
        }

        .custom-marker:hover .custom-marker-icon {
          transform: scale(1.2);
        }

        .copy-btn.copied {
          background-color: rgba(34, 197, 94, 0.5); /* green-500 with opacity */
        }
        
        .copy-btn:active {
          transform: scale(0.95);
        }

        .gate-selected {
          background-color: rgba(179,175, 175, 0.9) !important; /* Yellow highlight */
        }

        .gate-icon.gate-selected {
          background-color: rgba(255, 165, 0, 0.9);
          border: 2px solid #ffffff;
        
          transform: scale(1.3);
        }
        
        .gse-vehicle-marker {
          cursor: pointer;
          width: 24px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .gse-vehicle-icon {
          width: 24px;
          height: 16px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .gse-vehicle-marker:hover {
          transform: scale(1.2);
        }

        .gse-vehicle-marker:hover .gse-vehicle-icon {
          ${
            resolvedTheme === "light"
              ? `
              background-color: rgba(59, 130, 246, 0.2);
              box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
              border: 1px solid #3b82f6;
            `
              : `
              filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.7));
            `
          }
        }
      `}</style>
    </>
  )
}
