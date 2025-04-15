"use client"
import { X, Clock, Plane, Calendar, ArrowRight, Users } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GateTimeline } from "@/components/gate-timeline"
import { PassengerStatisticsDialog } from "@/components/passenger-statistics-dialog"
import { UpcomingPassengerStatisticsDialog } from "@/components/upcoming-passenger-statistics-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect, useMemo } from "react"
import { DepartedPassengerStatisticsDialog } from "@/components/departed-passenger-statistics-dialog"
import AirCanadaPTSEventDrawer from "@/components/pts-events"
import { useTheme } from "@/components/theme-provider"

function GateCountdown({ scheduledDeparture }: { scheduledDeparture: string }) {
  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [progress, setProgress] = useState<number>(100)
  const { resolvedTheme, mounted } = useTheme()
  const isDark = mounted && resolvedTheme === "dark"

  useEffect(() => {
    // Parse the scheduled departure time (format: "HH:MM")
    const calculateTimeRemaining = () => {
      const now = new Date()
      const [hours, minutes] = scheduledDeparture.split(":").map(Number)

      // Create departure date object (assuming it's today)
      const departure = new Date()
      departure.setHours(hours, minutes, 0, 0)

      // If departure time is in the past, assume it's for tomorrow
      if (departure < now) {
        departure.setDate(departure.getDate() + 1)
      }

      // Calculate time difference in milliseconds
      const diffMs = departure.getTime() - now.getTime()

      // If departure time has passed
      if (diffMs <= 0) {
        setTimeRemaining("Departed")
        setProgress(0)
        return
      }

      // Calculate hours, minutes, and seconds remaining
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      // Format the time remaining
      setTimeRemaining(
        `${diffHours.toString().padStart(2, "0")}:${diffMinutes.toString().padStart(2, "0")}:${diffSeconds.toString().padStart(2, "0")}`,
      )

      // Calculate progress (assuming 4 hours is the maximum turnaround time)
      const maxTurnaroundMs = 4 * 60 * 60 * 1000
      const progressPercent = Math.min(100, (diffMs / maxTurnaroundMs) * 100)
      setProgress(progressPercent)
    }

    // Calculate immediately and then every second
    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    // Clean up interval on unmount
    return () => clearInterval(interval)
  }, [scheduledDeparture])

  return (
    <div className={`${isDark ? "bg-gray-800" : "bg-gray-100 shadow-sm border border-gray-200"} rounded-md p-3 my-3`}>
      <div className="flex justify-between items-center mb-2">
        <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"}`}>
          Remaining Time at Gate
        </div>
        <div className={`text-sm font-mono font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{timeRemaining}</div>
      </div>
      <div className={`w-full ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2.5`}>
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}

interface GateInfoDrawerProps {
  selectedGate: string | null
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  timelineDialogOpen: boolean
  setTimelineDialogOpen: (open: boolean) => void
  timelineData: any[]
  gateStatus: Record<string, { status: string; color: string }>
  onClose?: () => void // Add this new prop
  liveGseVehicles?: any[];
}

export function GateInfoDrawer({
  selectedGate,
  drawerOpen,
  setDrawerOpen,
  timelineDialogOpen,
  setTimelineDialogOpen,
  timelineData,
  gateStatus,
  onClose,
  liveGseVehicles = [], 
}: GateInfoDrawerProps) {
  const { resolvedTheme, mounted } = useTheme()
  // Important: Only apply light theme when explicitly set to light
  const isDark = !mounted || resolvedTheme !== "light"

  console.log("Selected Gate: " + selectedGate +".");

  // Force re-render when theme changes
  const [, forceUpdate] = useState({})
  useEffect(() => {
    if (mounted) {
      forceUpdate({})
    }
  }, [resolvedTheme, mounted])

  // Create GSE vehicle events for the PTS drawer
  const gseVehicleEvents = useMemo(() => {
    if (!liveGseVehicles.length) return [];
    
    return liveGseVehicles.map(vehicle => ({
      id: `vehicle-${vehicle.id}`,
      name: `GSE Vehicle ${vehicle.id}`,
      scheduledStart: new Date(),
      actualStart: new Date(),
      status: "in-progress",
      progress: 100,
      vehicleData: vehicle // Include the full vehicle data
    }));
  }, [liveGseVehicles]);

  // Create a GSE vehicles category for the PTS drawer
  const gseVehiclesCategory = useMemo(() => {
    if (!gseVehicleEvents.length) return null;
    
    return {
      name: "GSE Vehicles",
      id: "gse-vehicles",
      icon: "truck",
      expanded: true,
      events: gseVehicleEvents
    };
  }, [gseVehicleEvents]);

  // Mock data for departed aircraft - Air Canada aircraft
  const departedAircraft = [
    {
      registration: "C-FGKN", // Air Canada Boeing 737 MAX 8
      scheduledArrival: "08:15",
      actualArrival: "08:22",
      arrivalFlight: "AC123",
      departureFlight: "AC456",
      scheduledDeparture: "09:30",
      actualDeparture: "09:45",
      status: "Departed",
      statusColor: "green",
    },
    {
      registration: "C-GITU", // Air Canada Airbus A321
      scheduledArrival: "10:00",
      actualArrival: "10:05",
      arrivalFlight: "AC789",
      departureFlight: "AC012",
      scheduledDeparture: "11:15",
      actualDeparture: "11:30",
      status: "Departed",
      statusColor: "green",
    },
    {
      registration: "C-FJQL", // Air Canada Boeing 787-9
      scheduledArrival: "12:30",
      actualArrival: "12:45",
      arrivalFlight: "AC345",
      departureFlight: "AC678",
      scheduledDeparture: "13:45",
      actualDeparture: "14:10",
      status: "Delayed",
      statusColor: "red",
    },
  ]

  // Mock data for current aircraft - Air Canada aircraft
  const currentAircraft = {
    D41: {
      registration: "C-FHKQ", // Air Canada Airbus A330-300
      scheduledArrival: "14:30",
      actualArrival: "14:35",
      arrivalFlight: "AC901",
      departureFlight: "AC234",
      scheduledDeparture: new Date(Date.now() + 60 * 60 * 1000).toTimeString().slice(0, 5),
      status: "On Block",
      statusColor: "green",
    },
    "40 ": {
      registration: "C-FHKQ", // Air Canada Airbus A330-300
      scheduledArrival: "14:30",
      actualArrival: "14:35",
      arrivalFlight: "AC901",
      departureFlight: "AC234",
      scheduledDeparture: new Date(Date.now() + 60 * 60 * 1000).toTimeString().slice(0, 5),
      status: "On Block",
      statusColor: "green",
    },
    E75: {
      registration: "C-GKWJ", // Air Canada Boeing 777-300ER
      scheduledArrival: "15:00",
      actualArrival: "15:10",
      arrivalFlight: "AC567",
      departureFlight: "AC890",
      scheduledDeparture: "16:15",
      status: "Boarding",
      statusColor: "green",
    },
    F12: {
      registration: "C-GHPQ", // Air Canada Airbus A220-300
      scheduledArrival: "13:45",
      actualArrival: "13:50",
      arrivalFlight: "AC432",
      departureFlight: "AC433",
      scheduledDeparture: "14:45",
      status: "Final Checks",
      statusColor: "amber",
    },
  }

  // Mock data for upcoming aircraft - Air Canada aircraft
  const upcomingAircraft = [
    {
      registration: "C-FSKP", // Air Canada Boeing 737 MAX 8
      scheduledArrival: "17:30",
      arrivalFlight: "AC123",
      departureFlight: "AC456",
      status: "Enroute",
      statusColor: "green",
    },
    {
      registration: "C-GJWP", // Air Canada Airbus A320
      scheduledArrival: "19:15",
      arrivalFlight: "AC789",
      departureFlight: "AC012",
      status: "Delayed",
      statusColor: "red",
    },
    {
      registration: "C-FTJQ", // Air Canada Boeing 787-8
      scheduledArrival: "21:00",
      arrivalFlight: "AC345",
      departureFlight: "AC678",
      status: "Enroute",
      statusColor: "green",
    },
  ]

  const [passengerStatsDialogOpen, setPassengerStatsDialogOpen] = useState(false)
  const [upcomingPassengerStatsDialogOpen, setUpcomingPassengerStatsDialogOpen] = useState(false)
  const [departedPassengerStatsDialogOpen, setDepartedPassengerStatsDialogOpen] = useState(false)
  const [selectedUpcomingAircraft, setSelectedUpcomingAircraft] = useState<(typeof upcomingAircraft)[0] | null>(null)
  const [selectedDepartedAircraft, setSelectedDepartedAircraft] = useState<(typeof departedAircraft)[0] | null>(null)

  const handleDepartedPassengerClick = (aircraft: (typeof departedAircraft)[0]) => {
    setSelectedDepartedAircraft(aircraft)
    setDepartedPassengerStatsDialogOpen(true)
  }

  const handleUpcomingPassengerClick = (aircraft: (typeof upcomingAircraft)[0]) => {
    setSelectedUpcomingAircraft(aircraft)
    setUpcomingPassengerStatsDialogOpen(true)
  }

  if (!selectedGate) return null

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-[500px] z-40 overflow-y-auto transition-transform duration-300 ease-in-out",
          isDark ? "bg-black border-l border-gray-800" : "bg-white border-l border-gray-200 shadow-lg",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <button
          onClick={() => {
            setDrawerOpen(false)
            // Reset all gate marker styles to default
            document.querySelectorAll(".gate-icon.gate-selected").forEach((element) => {
              element.classList.remove("gate-selected")
            })
            if (onClose) onClose() // Call the onClose function if provided
          }}
          className={`absolute top-3 right-3 ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-black hover:bg-gray-100"} p-1 rounded-full z-50`}
        >
          <X size={20} />
        </button>
        {/* Header with close button */}
        <div
          className={`p-4 ${isDark ? "border-b border-gray-800" : "border-b border-gray-200"} flex justify-between items-center`}
        >
          <div>
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Gate {selectedGate}</h2>
            <div className="flex gap-3 mt-3">
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded p-3 flex-1`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"} mb-1`}>Status</div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      gateStatus && gateStatus[selectedGate]?.status === "green"
                        ? "bg-green-500"
                        : gateStatus && gateStatus[selectedGate]?.status === "amber"
                          ? "bg-amber-500"
                          : gateStatus && gateStatus[selectedGate]?.status === "red"
                            ? "bg-red-500"
                            : "bg-gray-500"
                    }`}
                  ></div>
                  <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {(gateStatus && gateStatus[selectedGate]?.status) || "Occupied"}
                  </span>
                </div>
              </div>
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded p-3 flex-1`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"} mb-1`}>
                  Gate Delay Index
                </div>
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>12.7</div>
              </div>
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded p-3 flex-1`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"} mb-1`}>
                  Gate Utilization
                </div>
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>72.3%</div>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded p-3 flex-1`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"} mb-1`}>
                  Gate Conflict Incidents
                </div>
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>1</div>
              </div>
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded p-3 flex-1`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"} mb-1`}>
                  Equipment Readiness
                </div>
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>98%</div>
              </div>
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded p-3 flex-1`}
              >
                <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"} mb-1`}>
                  Safety Incidents
                </div>
                <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline button */}
        <div className={`p-4 ${isDark ? "border-b border-gray-800" : "border-b border-gray-200"}`}>
          <Button
            onClick={() => setTimelineDialogOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Timeline
          </Button>
        </div>

        {/* Current Aircraft Section */}
        <div className={`p-4 ${isDark ? "border-b border-gray-800" : "border-b border-gray-200"}`}>
          <div className="flex items-center mb-3">
            <Plane className="mr-2 h-5 w-5 text-green-500" />
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Current Aircraft</h3>
          </div>
          {currentAircraft[selectedGate] ? (
            <div className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded-md p-4`}>
              <div className="flex justify-between items-center mb-3">
                <div className={`${isDark ? "text-white" : "text-gray-900"} font-mono text-lg font-bold`}>
                  {currentAircraft[selectedGate].registration}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPassengerStatsDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className={`text-xs font-medium ${isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-100"}`}
                  >
                    Passenger Info
                  </Button>
                  <div
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      currentAircraft[selectedGate].statusColor === "green" &&
                        "bg-green-500/30 border border-green-500 text-green-800",
                      currentAircraft[selectedGate].statusColor === "amber" &&
                        "bg-amber-500/30 border border-amber-500 text-amber-800",
                      currentAircraft[selectedGate].statusColor === "red" &&
                        "bg-red-500/30 border border-red-500 text-red-800",
                    )}
                  >
                    {currentAircraft[selectedGate].status}
                  </div>
                </div>
              </div>

              {/* Add countdown timer */}
              <GateCountdown scheduledDeparture={currentAircraft[selectedGate].scheduledDeparture} />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"}`}>Arrival</div>
                  <div className="text-sm text-blue-600 font-semibold mb-1">
                    {currentAircraft[selectedGate].arrivalFlight}
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="text-blue-500 mr-1" />
                    <div>
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        STA: {currentAircraft[selectedGate].scheduledArrival}
                      </div>
                      <div className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        ATA: {currentAircraft[selectedGate].actualArrival}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-700"}`}>Departure</div>
                  <div className="text-sm text-blue-600 font-semibold mb-1">
                    {currentAircraft[selectedGate].departureFlight}
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="text-blue-500 mr-1" />
                    <div>
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        ETD: {currentAircraft[selectedGate].scheduledDeparture}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded-md p-4 flex items-center justify-center`}
            >
              <span className={`${isDark ? "text-gray-400" : "text-gray-500"} font-medium`}>
                No aircraft currently at this gate
              </span>
            </div>
          )}
        </div>

        {/* Accordion Sections */}
        <Accordion
          type="single"
          collapsible
          className={isDark ? "border-b border-gray-800" : "border-b border-gray-200"}
        >
          {/* Upcoming Aircraft Section */}
          <AccordionItem
            value="upcoming-aircraft"
            className={isDark ? "border-b border-gray-800" : "border-b border-gray-200"}
          >
            <div className="px-4">
              <AccordionTrigger className="py-3">
                <div className="flex items-center">
                  <Plane className="mr-2 h-5 w-5 text-amber-500" />
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Upcoming Aircrafts
                  </h3>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="px-4 pb-4">
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded-md overflow-x-auto`}
              >
                <table className="min-w-full">
                  <thead>
                    <tr
                      className={`text-xs font-medium ${isDark ? "text-gray-400 border-b border-gray-800" : "text-gray-700 border-b border-gray-300"}`}
                    >
                      <th className="py-2 px-3 text-left">Registration</th>
                      <th className="py-2 px-3 text-left">Arrival</th>
                      <th className="py-2 px-3 text-left">Flights</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left">Passengers</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-200"}`}>
                    {upcomingAircraft.map((aircraft, index) => (
                      <tr key={index} className="text-xs">
                        <td className={`py-2 px-3 ${isDark ? "text-white" : "text-gray-900"} font-mono font-semibold`}>
                          {aircraft.registration}
                        </td>
                        <td className="py-2 px-3">
                          <div className={`${isDark ? "text-gray-400" : "text-gray-700"} font-medium`}>
                            ETA: {aircraft.scheduledArrival}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center">
                            <span className="text-blue-600 font-semibold">{aircraft.arrivalFlight}</span>
                            <ArrowRight size={12} className={`mx-1 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                            <span className="text-blue-600 font-semibold">{aircraft.departureFlight}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div
                            className={cn(
                              "px-2 py-1 rounded text-xs text-center font-medium",
                              aircraft.statusColor === "green" &&
                                "bg-green-500/30 border border-green-500 text-green-800",
                              aircraft.statusColor === "amber" &&
                                "bg-amber-500/30 border border-amber-500 text-amber-800",
                              aircraft.statusColor === "red" && "bg-red-500/30 border border-red-500 text-red-800",
                            )}
                          >
                            {aircraft.status}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-black hover:bg-gray-200"}`}
                            title="Passenger Information"
                            onClick={() => handleUpcomingPassengerClick(aircraft)}
                          >
                            <Users size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Departed Aircraft Section */}
          <AccordionItem value="departed-aircraft" className="border-b-0">
            <div className="px-4">
              <AccordionTrigger className="py-3">
                <div className="flex items-center">
                  <Plane className="mr-2 h-5 w-5 text-blue-500" />
                  <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Departed Aircrafts
                  </h3>
                </div>
              </AccordionTrigger>
            </div>
            <AccordionContent className="px-4 pb-4">
              <div
                className={`${isDark ? "bg-gray-900" : "bg-gray-50 border border-gray-200 shadow-sm"} rounded-md overflow-x-auto`}
              >
                <table className="min-w-full">
                  <thead>
                    <tr
                      className={`text-xs font-medium ${isDark ? "text-gray-400 border-b border-gray-800" : "text-gray-700 border-b border-gray-300"}`}
                    >
                      <th className="py-2 px-3 text-left">Registration</th>
                      <th className="py-2 px-3 text-left">Arrival</th>
                      <th className="py-2 px-3 text-left">Departure</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left">Passengers</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-200"}`}>
                    {departedAircraft.map((aircraft, index) => (
                      <tr key={index} className="text-xs">
                        <td className={`py-2 px-3 ${isDark ? "text-white" : "text-gray-900"} font-mono font-semibold`}>
                          {aircraft.registration}
                        </td>
                        <td className="py-2 px-3">
                          <div className="text-blue-600 font-semibold">{aircraft.arrivalFlight}</div>
                          <div className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            STA: {aircraft.scheduledArrival}
                          </div>
                          <div className={`${isDark ? "text-white" : "text-gray-900"} font-medium`}>
                            ATA: {aircraft.actualArrival}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="text-blue-600 font-semibold">{aircraft.departureFlight}</div>
                          <div className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            STD: {aircraft.scheduledDeparture}
                          </div>
                          <div className={`${isDark ? "text-white" : "text-gray-900"} font-medium`}>
                            ATD: {aircraft.actualDeparture}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div
                            className={cn(
                              "px-2 py-1 rounded text-xs text-center font-medium",
                              aircraft.statusColor === "green" &&
                                "bg-green-500/30 border border-green-500 text-green-800",
                              aircraft.statusColor === "amber" &&
                                "bg-amber-500/30 border border-amber-500 text-amber-800",
                              aircraft.statusColor === "red" && "bg-red-500/30 border border-red-500 text-red-800",
                            )}
                          >
                            {aircraft.status}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-black hover:bg-gray-200"}`}
                            title="Passenger Information"
                            onClick={() => handleDepartedPassengerClick(aircraft)}
                          >
                            <Users size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Timeline Dialog */}
      <Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}>
        <DialogContent
          className={`sm:max-w-[900px] ${isDark ? "bg-black border border-gray-800 text-white" : "bg-white border border-gray-200 text-gray-900 shadow-lg"} p-0`}
        >
          <div
            className={`p-4 ${isDark ? "border-b border-gray-800" : "border-b border-gray-200"} flex justify-between items-center`}
          >
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Gate {selectedGate} Timeline
            </h2>
            <button
              onClick={() => setTimelineDialogOpen(false)}
              className={`${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-black hover:bg-gray-100"} p-1 rounded-full`}
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <GateTimeline gateName={selectedGate || ""} flightData={[]} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Current Aircraft Passenger Statistics Dialog */}
      {selectedGate && currentAircraft[selectedGate] && (
        <PassengerStatisticsDialog
          open={passengerStatsDialogOpen}
          onOpenChange={setPassengerStatsDialogOpen}
          aircraft={currentAircraft[selectedGate]}
        />
        // <AirCanadaPTSEventDrawer
        //   open={passengerStatsDialogOpen} // Set to true to always show it, or use a state variable
        //   onOpenChange={(isOpen) => {
        //     setPassengerStatsDialogOpen(isOpen);
        //     // Handle close event if needed
        //     console.log("Modal open state changed to:", isOpen);
        //   }}
        //   ptsEvent={{
        //     flightNumber: "AC456",
        //     origin: "C-FSKP",
        //     status: {
        //       disruption: false,
        //       message: "No disruptions expected",
        //       level: "none" // none, low, medium, high
        //     },
        //     currentTime: new Date("2025-04-12T11:20:00"),
        //     ragSummary: {
        //       red: 2,
        //       amber: 3,
        //       green: 12,
        //     },
        //     categories: [
        //       {
        //         name: "Flight Movement",
        //         id: "flight-movement",
        //         icon: "plane",
        //         expanded: true,
        //         events: [
        //           {
        //             id: "arrival",
        //             name: "Arrival (STA)",
        //             scheduledStart: new Date("2025-04-12T08:30:00"),
        //             actualStart: new Date("2025-04-12T10:42:00"),
        //             isMilestone: true,
        //             status: "completed",
        //             progress: 100
        //           },
        //           {
        //             id: "parking",
        //             name: "Aircraft Parking",
        //             scheduledStart: new Date("2025-04-12T10:35:00"),
        //             actualStart: new Date("2025-04-12T10:47:00"),
        //             scheduledEnd: new Date("2025-04-12T10:45:00"),
        //             actualEnd: new Date("2025-04-12T10:55:00"),
        //             status: "completed",
        //             progress: 100
        //           },
        //           {
        //             id: "pushback",
        //             name: "Pushback",
        //             scheduledStart: new Date("2025-04-12T12:20:00"),
        //             scheduledEnd: new Date("2025-04-12T12:25:00"),
        //             actualStart: new Date("2025-04-12T12:55:00"),
        //             actualEnd: null,
        //             status: "in-progress",
        //             progress: 50
        //           },
        //           {
        //             id: "departure",
        //             name: "Departure (STD)",
        //             scheduledStart: new Date("2025-04-12T12:30:00"),
        //             scheduledEnd: new Date("2025-04-12T13:50:00"),
        //             actualStart: null,
        //             actualEnd: null,
        //             isMilestone: true,
        //             status: "scheduled",
        //             progress: 0
        //           }
        //         ]
        //       },
        //       {
        //         name: "Passenger Flow",
        //         id: "passenger-flow",
        //         icon: "users",
        //         expanded: true,
        //         events: [
        //           {
        //             id: "disembarkation",
        //             name: "Disembarkation",
        //             scheduledStart: new Date("2025-04-12T10:40:00"),
        //             actualStart: new Date("2025-04-12T10:50:00"),
        //             scheduledEnd: new Date("2025-04-12T10:55:00"),
        //             actualEnd: new Date("2025-04-12T11:05:00"),
        //             status: "completed",
        //             progress: 100
        //           },
        //           {
        //             id: "boarding",
        //             name: "Boarding",
        //             scheduledStart: new Date("2025-04-12T11:45:00"),
        //             scheduledEnd: new Date("2025-04-12T12:15:00"),
        //             actualStart: null,
        //             actualEnd: null,
        //             status: "scheduled",
        //             progress: 0
        //           }
        //         ]
        //       },
        //       {
        //         name: "Baggage Handling",
        //         id: "baggage",
        //         icon: "briefcase",
        //         expanded: true,
        //         events: [
        //           {
        //             id: "baggage-unloading",
        //             name: "Baggage Unloading",
        //             scheduledStart: new Date("2025-04-12T10:40:00"),
        //             actualStart: new Date("2025-04-12T10:52:00"),
        //             scheduledEnd: new Date("2025-04-12T10:55:00"),
        //             actualEnd: new Date("2025-04-12T11:12:00"),
        //             status: "completed",
        //             progress: 100
        //           },
        //           {
        //             id: "baggage-loading",
        //             name: "Baggage Loading",
        //             scheduledStart: new Date("2025-04-12T11:30:00"),
        //             scheduledEnd: new Date("2025-04-12T12:00:00"),
        //             actualStart: null,
        //             actualEnd: null,
        //             status: "scheduled",
        //             progress: 0
        //           }
        //         ]
        //       },
        //       {
        //         name: "Servicing",
        //         id: "servicing",
        //         icon: "coffee",
        //         expanded: true,
        //         events: [
        //           {
        //             id: "cleaning",
        //             name: "Cleaning",
        //             scheduledStart: new Date("2025-04-12T10:50:00"),
        //             scheduledEnd: new Date("2025-04-12T11:20:00"),
        //             actualStart: new Date("2025-04-12T11:00:00"),
        //             actualEnd: new Date("2025-04-12T11:30:00"),
        //             status: "completed",
        //             progress: 100
        //           },
        //           {
        //             id: "refueling",
        //             name: "Refueling",
        //             scheduledStart: new Date("2025-04-12T11:00:00"),
        //             scheduledEnd: new Date("2025-04-12T11:30:00"),
        //             actualStart: new Date("2025-04-12T11:05:00"),
        //             actualEnd: null,
        //             status: "in-progress",
        //             progress: 80
        //           },
        //           {
        //             id: "catering-load",
        //             name: "Catering Load",
        //             scheduledStart: new Date("2025-04-12T11:15:00"),
        //             scheduledEnd: new Date("2025-04-12T11:45:00"),
        //             actualStart: new Date("2025-04-12T11:25:00"),
        //             actualEnd: null,
        //             status: "in-progress",
        //             progress: 40
        //           }
        //         ]
        //       },
        //       {
        //         name: "Ops & Safety",
        //         id: "ops-safety",
        //         icon: "wrench",
        //         expanded: true,
        //         events: [
        //           {
        //             id: "cabin-ready-check",
        //             name: "Cabin Ready Check",
        //             scheduledStart: new Date("2025-04-12T12:10:00"),
        //             scheduledEnd: null,
        //             actualStart: null,
        //             actualEnd: null,
        //             isMilestone: true,
        //             status: "scheduled",
        //             progress: 0
        //           },
        //           {
        //             id: "load-sheet",
        //             name: "Load Sheet Finalized",
        //             scheduledStart: new Date("2025-04-12T12:15:00"),
        //             scheduledEnd: null,
        //             actualStart: null,
        //             actualEnd: null,
        //             isMilestone: true,
        //             status: "scheduled",
        //             progress: 0
        //           }
        //         ]
        //       },
        //       {
        //         name: "Final Departure Prep",
        //         id: "departure-prep",
        //         icon: "clipboard",
        //         expanded: true,
        //         events: [
        //           {
        //             id: "door-close",
        //             name: "Door Close",
        //             scheduledStart: new Date("2025-04-12T12:15:00"),
        //             scheduledEnd: null,
        //             actualStart: null,
        //             actualEnd: null,
        //             isMilestone: true,
        //             status: "scheduled",
        //             progress: 0
        //           },
        //           {
        //             id: "pushback-start",
        //             name: "Pushback Start",
        //             scheduledStart: new Date("2025-04-12T19:20:00"),
        //             scheduledEnd: null,
        //             actualStart: null,
        //             actualEnd: null,
        //             isMilestone: true,
        //             status: "scheduled",
        //             progress: 0
        //           }
        //         ]
        //       }
        //     ]
        //   }}
        //   vehicleId='GSE1016'
        // />
      )}

      {/* Upcoming Aircraft Passenger Statistics Dialog */}
      {selectedUpcomingAircraft && (
        <UpcomingPassengerStatisticsDialog
          open={upcomingPassengerStatsDialogOpen}
          onOpenChange={setUpcomingPassengerStatsDialogOpen}
          aircraft={selectedUpcomingAircraft}
        />
      )}

      {/* Departed Aircraft Passenger Statistics Dialog */}
      {selectedDepartedAircraft && (
        <DepartedPassengerStatisticsDialog
          open={departedPassengerStatsDialogOpen}
          onOpenChange={setDepartedPassengerStatsDialogOpen}
          aircraft={selectedDepartedAircraft}
        />
      )}
    </>
  )
}
