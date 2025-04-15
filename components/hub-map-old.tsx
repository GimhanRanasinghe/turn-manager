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

// Map styles for dark theme (we'll use dark by default for this view)
const DARK_MAP_STYLE = "mapbox://styles/mapbox/dark-v11"
//const LIGHT_MAP_STYLE = "mapbox://styles/garagetwothree/cm4tzzclh007l01qwfouh5b8l"
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
  const [mapLoaded, setMapLoaded] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [selectedGate, setSelectedGate] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false)
  const [selectedAircraftPopup, setSelectedAircraftPopup] = useState<{
    id: string
    position: [number, number]
    registration?: string
    flightNumber?: string
    outbound?: string
    gate?: string
    statuses?: {
      OTP: string
      HEALTH: string
      OPS: string
      TCM: string
      MCC: string
      ATA: string
    }
  } | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [selectedAircraftDetails, setSelectedAircraftDetails] = useState<{
    id: string
    registration: string
    flightNumber: string
    type: string
    origin: string
    destination: string
    gate: string
    statuses: {
      OTP: string
      HEALTH: string
      OPS: string
      TCM: string
      MCC: string
      ATA: string
    }
  } | null>(null)
  const [selectedGseVehicle, setSelectedGseVehicle] = useState<string | null>(null)
  const [gseVehicleDrawerOpen, setGseVehicleDrawerOpen] = useState(false)
  const [liveGseVehicles, setLiveGseVehicles] = useState<GSEVehicle[]>([])
  const gseVehicleMarkersRef = useRef<{ [id: string]: mapboxgl.Marker }>({})

  const [markerCreationMode, setMarkerCreationMode] = useState(false)
  const [customMarkers, setCustomMarkers] = useState<
    Array<{
      id: string
      coordinates: [number, number]
      label: string
      color: string
    }>
  >([])
  const [markerLabelInput, setMarkerLabelInput] = useState("")
  const [showMarkerDialog, setShowMarkerDialog] = useState(false)
  const [pendingMarkerCoordinates, setPendingMarkerCoordinates] = useState<[number, number] | null>(null)

  const [vehiclePathData, setVehiclePathData] = useState([]);
  const [isVehicleAnimating, setIsVehicleAnimating] = useState(false);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const vehicleMarkerRef = useRef(null);
  const vehicleAnimationTimerRef = useRef(null);

  // Function to fly to a location
  const flyToLocation = useCallback((coordinates: [number, number], options = {}) => {
    if (!map.current) return

    try {
      console.log("Flying to coordinates:", coordinates)
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

  // Function to calculate heading angle between two points
  const calculateHeading = useCallback((lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    lat1 = lat1 * (Math.PI / 180);
    lat2 = lat2 * (Math.PI / 180);
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * (180 / Math.PI);
    
    // Convert to 0-360 degrees
    return ((bearing + 360) % 360);
  }, []);

  // Function to load CSV data
  const loadVehiclePathData = useCallback(async () => {
    try {
      console.log("Attempting to load flight.csv...");
      const response = await fetch('flight.csv'); // Replace with your actual CSV path
      const csvText = await response.text();
      
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true, // Automatically convert numeric values
          complete: (results) => {
            const data = results.data.filter(row => 
              row.latitude && row.longitude && row.seconds !== undefined && row.flightId
            );
            setVehiclePathData(data);
            console.log("Loaded vehicle path data:", data.length, "points");
            resolve();
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error loading vehicle path CSV:", error);
    }
  }, []);

  // Function to initialize vehicle marker
  const initializeVehicleMarker = useCallback(() => {
    if (!map.current || vehiclePathData.length === 0) return;
    
    // Remove existing vehicle marker if it exists
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.remove();
      vehicleMarkerRef.current = null;
    }
    
    // Create a DOM element for the vehicle marker
    const el = document.createElement("div");
    el.className = "gse-vehicle-marker";
    
    // Set initial heading (0 degrees or calculate from first two points)
    let initialHeading = 0;
    if (vehiclePathData.length > 1) {
      const p1 = vehiclePathData[0];
      const p2 = vehiclePathData[1];
      initialHeading = calculateHeading(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }
    
    // Create the vehicle icon
    el.innerHTML = `
      <div class="gse-vehicle-icon" style="transform: rotate(${initialHeading}deg)">
        <img src="${resolvedTheme === "light" ? "/aircraft-icon-black.svg" : "/aircraft-icon.svg"}" 
            width="24" height="16" alt="aircraft-icon" />
      </div>
    `;
    
    // Create the path line
    if (map.current.getSource('vehicle-path')) {
      // Update existing source
      const source = map.current.getSource('vehicle-path');
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: vehiclePathData.map(point => [point.longitude, point.latitude])
        }
      });
    } else {
      // Add new source and layer
      map.current.addSource('vehicle-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: vehiclePathData.map(point => [point.longitude, point.latitude])
          }
        }
      });
      
      map.current.addLayer({
        id: 'vehicle-path-layer',
        type: 'line',
        source: 'vehicle-path',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': 'transparent',
          'line-width': 3,
          'line-opacity': 0.7
        }
      });
    }
    
    // Set initial position
    const initialPosition = [
      vehiclePathData[0].longitude,
      vehiclePathData[0].latitude
    ];
    
    // Add marker to map
    vehicleMarkerRef.current = new mapboxgl.Marker({
      element: el,
      anchor: "center",
      rotationAlignment: "map",
    })
      .setLngLat(initialPosition)
      .addTo(map.current);
    
    // Add click event handler
    el.addEventListener("click", () => {
      console.log("CSV-based vehicle clicked");
      // Close any open drawers or panels
      setDrawerOpen(false);
      setSidePanelOpen(false);
      setSelectedAircraftPopup(null);
      
      // Set selected GSE vehicle and open drawer
      setSelectedGseVehicle("csv-vehicle");
      setGseVehicleDrawerOpen(true);
      
      // Fly to the vehicle position
      flyToLocation(initialPosition, {
        zoom: 18.5,
        pitch: 30,
        duration: 1500,
      });
    });
    
    // Reset animation index
    setCurrentVehicleIndex(0);

  }, [vehiclePathData, resolvedTheme, calculateHeading]);

  // Function to start vehicle animation
  const startVehicleAnimation = useCallback(() => {
    if (vehiclePathData.length === 0) {
      console.warn("No vehicle path data available");
      return;
    }
    
    // Make sure we have a vehicle marker
    if (!vehicleMarkerRef.current && map.current) {
      initializeVehicleMarker();
    }
    
    // Clear any existing timer
    if (vehicleAnimationTimerRef.current !== null) {
      clearInterval(vehicleAnimationTimerRef.current);
    }
    
    // Set up the animation timer (1 second intervals)
    vehicleAnimationTimerRef.current = setInterval(() => {
      setCurrentVehicleIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= vehiclePathData.length) {
          // Loop back to start when reaching the end
          return 0;
        }
        return nextIndex;
      });
    }, 10); // Update every second
    
    setIsVehicleAnimating(true);
  }, [vehiclePathData, initializeVehicleMarker]);

  // Update vehicle marker position based on current index
  useEffect(() => {
    if (!vehicleMarkerRef.current || vehiclePathData.length === 0 || 
        currentVehicleIndex >= vehiclePathData.length) return;
    
    const currentPoint = vehiclePathData[currentVehicleIndex];
    const nextPoint = vehiclePathData[
      currentVehicleIndex + 1 < vehiclePathData.length ? currentVehicleIndex + 1 : 0
    ];
    
    // Update marker position
    vehicleMarkerRef.current.setLngLat([currentPoint.longitude, currentPoint.latitude]);
    
    // Calculate rotation angle for the vehicle icon
    if (nextPoint) {
      const heading = calculateHeading(
        currentPoint.latitude, 
        currentPoint.longitude, 
        nextPoint.latitude, 
        nextPoint.longitude
      );
      
      // Rotate the icon
      const icon = vehicleMarkerRef.current.getElement();
      if (icon) {
        const iconDiv = icon.querySelector('.gse-vehicle-icon');
        if (iconDiv) {
          iconDiv.style.transform = `rotate(${heading}deg)`;
        }
      }
    }
 
  }, [currentVehicleIndex, vehiclePathData, isVehicleAnimating, calculateHeading]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (vehicleAnimationTimerRef.current !== null) {
        clearInterval(vehicleAnimationTimerRef.current);
      }
    };
  }, []);

  // and also when the page is refreshed
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    console.log("Map loaded, initializing vehicle data");
    
    // Force map to recalculate its size - critical for refresh issues
    map.current.resize();
    
    // Load the CSV data and start animation
    loadVehiclePathData()
      .then((data) => {
        if (data && data.length > 0) {
          console.log("CSV data loaded successfully, initializing vehicle");
          
          // Add a small delay to ensure everything is ready
          setTimeout(() => {
            initializeVehicleMarker();
            startVehicleAnimation();
          }, 1000);
        } else {
          console.error("No valid CSV data loaded");
        }
      })
      .catch(err => {
        console.error("Failed to load vehicle path data:", err);
      });
      
    // Add event listener for style.load which happens on theme changes and sometimes on refresh
    map.current.on('style.load', () => {
      console.log("Map style reloaded, reinitializing vehicle");
      
      // If we already have data, reinitialize the vehicle
      if (vehiclePathData.length > 0) {
        setTimeout(() => {
          initializeVehicleMarker();
          startVehicleAnimation();
        }, 1000);
      }
    });
    
  }, [mapLoaded, loadVehiclePathData, initializeVehicleMarker, startVehicleAnimation, vehiclePathData]);
  //////////////////////////////////////////////////////////
  // Function to create a new marker
  // const createNewMarker = () => {
  //   if (!pendingMarkerCoordinates) return

  //   const newMarker = {
  //     id: `marker-${Date.now()}`,
  //     coordinates: pendingMarkerCoordinates,
  //     label: markerLabelInput,
  //     color: "blue", // You can customize the color
  //   }

  //   setCustomMarkers([...customMarkers, newMarker])
  //   setShowMarkerDialog(false)
  //   setMarkerLabelInput("")
  //   setPendingMarkerCoordinates(null)
  // }

  // Function to add markers to the map
  const addMarkersToMap = useCallback(() => {
    if (!map.current || markersAdded.current) return

    console.log("Adding markers to map")

    // Add aircraft markers
    // MOCK_AIRCRAFT.forEach((aircraft) => {
    //   // Create a DOM element for the marker
    //   const el = document.createElement("div")
    //   el.className = "aircraft-marker"
    //   el.innerHTML = `
    //     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${aircraft.color}" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    //       <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    //     </svg>
    //   `

    //   // Add marker to map
    //   new mapboxgl.Marker(el).setLngLat(aircraft.position).addTo(map.current!)

    //   // Add click event handler
    //   el.addEventListener("click", () => {
    //     if (onSelectAircraft) {
    //       // First zoom to the aircraft position
    //       flyToLocation(aircraft.position, {
    //         zoom: 18.5,
    //         pitch: 30,
    //         duration: 1500,
    //       })

    //       // Wait for the animation to complete before showing the popup
    //       setTimeout(() => {
    //         const aircraftData = {
    //           id: aircraft.id,
    //           position: aircraft.position,
    //           registration: `C-${aircraft.id.substring(2)}`,
    //           flightNumber: aircraft.id,
    //           outbound: "YYZ",
    //           gate: `${Math.floor(Math.random() * 50) + 1}`,
    //           statuses: {
    //             OTP: Math.random() > 0.5 ? "green" : "orange",
    //             HEALTH: Math.random() > 0.5 ? "green" : "orange",
    //             OPS: Math.random() > 0.5 ? "green" : "orange",
    //             TCM: Math.random() > 0.5 ? "green" : "orange",
    //             MCC: Math.random() > 0.5 ? "green" : "orange",
    //             ATA: Math.random() > 0.5 ? "green" : "orange",
    //           },
    //         }

    //         setSelectedAircraftPopup(aircraftData)

    //         // Calculate popup position
    //         if (map.current) {
    //           const pos = map.current.project(aircraft.position)
    //           setPopupPosition({
    //             x: pos.x,
    //             y: pos.y - 180,
    //           })
    //         }
    //       }, 1000) // Match the duration of the flyTo animation
    //     }
    //   })
    // })

    // Add gate markers
    Object.entries(TORONTO_GATES).forEach(([gateId, gateInfo]) => {
      if (!gateInfo || !gateInfo.coordinates) {
        console.error(`Invalid gate info for ${gateId}:`, gateInfo)
        return
      }

      // Create a DOM element for the gate marker
      const el = document.createElement("div")
      const id = gateId?.split(":")[1]
      el.className = "gate-marker"
      el.innerHTML = `
<div class="gate-icon">
  <div class="gate-label">${id}</div>
</div>
`

      // Add marker to map
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat(gateInfo.coordinates)
        .addTo(map.current!)

      // Add click event
      el.addEventListener("click", () => {
        console.log(
          `Gate ${id} clicked, coordinates:\`, gateInfo.coordinates  () => {
        console.log(\`Gate ${id} clicked, coordinates:`,
          gateInfo.coordinates,
        )

        if (onSelectAircraft) {
          // You could pass gate information here instead
          onSelectAircraft(gateId)
        }

        // Close GSE vehicle drawer if open
        setGseVehicleDrawerOpen(false)

        // Set selected gate and open drawer
        setSelectedGate(id)
        setDrawerOpen(true)

        // Fly to the gate with enhanced zoom effect
        flyToLocation(gateInfo.coordinates, {
          zoom: 18.5,
          pitch: 45,
          duration: 2000,
        })

        // Highlight the selected gate
        el.querySelector(".gate-icon")?.classList.add("gate-selected")

        // Remove highlight from previously selected gates
        document.querySelectorAll(".gate-selected").forEach((element) => {
          if (element !== el.querySelector(".gate-icon")) {
            element.classList.remove("gate-selected")
          }
        })
      })
    })

    markersAdded.current = true
  }, [onSelectAircraft, flyToLocation, resolvedTheme])

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return

    // Reset the markersAdded flag when the component mounts
    markersAdded.current = false

    // Preload the GSE vehicle icons
    const preloadLightIcon = document.createElement("link")
    preloadLightIcon.rel = "preload"
    preloadLightIcon.href = "/gse-vehicle-icon.svg"
    preloadLightIcon.as = "image"
    document.head.appendChild(preloadLightIcon)

    const preloadDarkIcon = document.createElement("link")
    preloadDarkIcon.rel = "preload"
    preloadDarkIcon.href = "/gse-vehicle-icon-dark.svg"
    preloadDarkIcon.as = "image"
    document.head.appendChild(preloadDarkIcon)

    // Initialize Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""
    console.log("Initializing hub map with token:", mapboxgl.accessToken ? "Token exists" : "No token")

    // Pre-load the TORONTO_GATES data to ensure it's available
    console.log("Pre-loading TORONTO_GATES data:", Object.keys(TORONTO_GATES).length, "gates")

    const currentTheme = resolvedTheme || theme
    const mapStyle = currentTheme === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: TORONTO_PEARSON.center,
      zoom: TORONTO_PEARSON.zoom,
      pitch: 0, // Flat view for airport layout
      bearing: TORONTO_PEARSON.bearing || 0,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Set up aircraft markers when the map loads
    map.current.on("load", () => {
      console.log("Hub map loaded")
      setMapLoaded(true)
      setLoading(false)

      // Add a small delay to ensure the map is fully rendered
      setTimeout(() => {
        addMarkersToMap()
        // Load the CSV data and start animation automatically
        loadVehiclePathData().then(() => {
          setTimeout(() => {
            initializeVehicleMarker();
            startVehicleAnimation();
          }, 1000);
        });
      }, 500)
    })

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
      }
      if (vehicleAnimationTimerRef.current !== null) {
        clearInterval(vehicleAnimationTimerRef.current);
      }
    }
  }, [addMarkersToMap, resolvedTheme, theme])

  // Add click handler for marker creation
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const handleClick = (e) => {
      if (!markerCreationMode) return

      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      setPendingMarkerCoordinates(coordinates)
      setShowMarkerDialog(true)
    }

    map.current.on("click", handleClick)

    return () => {
      if (map.current) {
        map.current.off("click", handleClick)
      }
    }
  }, [mapLoaded, markerCreationMode])

  // Update map style when satelliteView or theme changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      const currentTheme = resolvedTheme || theme
      const newStyle = satelliteView
        ? "mapbox://styles/mapbox/satellite-v9"
        : currentTheme === "light"
          ? LIGHT_MAP_STYLE
          : DARK_MAP_STYLE

      map.current.setStyle(newStyle)

      // Re-add markers when style changes, as they get removed
      map.current.once("styledata", () => {
        markersAdded.current = false
        addMarkersToMap()
      })
    }
  }, [satelliteView, mapLoaded, addMarkersToMap, theme, resolvedTheme])

  // Zoom to gate when coordinates change
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
