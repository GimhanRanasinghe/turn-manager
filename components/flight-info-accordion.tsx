"use client"
import { useEffect, useState } from "react"
import {
  Plane,
  AlertCircle,
  X,
  ChevronRight,
  Clock,
  ArrowRight,
  AlertTriangle,
  MailOpen,
  MapPin,
  Luggage,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchFlightsByLocation } from "@/services/flight-api"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface FlightInfoAccordionProps {
  flightId: string | null
  onClose: () => void
}

// Horizontal gauge component
const HorizontalGauge = ({ value, max, color = "bg-blue-500", height = "h-2", showLabel = false }) => {
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  const percentage = (value / max) * 100
  return (
    <div className="w-full">
      <div className={cn(`w-full rounded-full overflow-hidden ${height}`, isDark ? "bg-gray-700" : "bg-gray-200")}>
        <div className={`${height} rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
      {showLabel && (
        <div className="flex justify-end mt-1">
          <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            {value}/{max}
          </span>
        </div>
      )}
    </div>
  )
}

// Status badge with icon
const StatusBadge = ({ status, icon, variant = "default" }) => {
  let bgColor = "bg-blue-500/30 border border-blue-500"

  if (variant === "success") {
    bgColor = "bg-green-500/30 border border-green-500"
  } else if (variant === "warning") {
    bgColor = "bg-amber-500/30 border border-amber-500"
  } else if (variant === "danger") {
    bgColor = "bg-red-500/30 border border-red-500"
  } else if (variant === "outline") {
    bgColor = "bg-gray-800 border border-gray-700"
  }

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${bgColor}`}>
      {icon}
      <span>{status}</span>
    </div>
  )
}

// Card for displaying data with icon
const InfoCard = ({ icon, label, value, color = "text-white" }) => {
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-md", isDark ? "bg-gray-800" : "bg-gray-100")}>
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>{label}</p>
        <p className={cn(`text-sm font-semibold ${color}`, !isDark && color === "text-white" && "text-gray-900")}>
          {value}
        </p>
      </div>
    </div>
  )
}

export default function FlightInfoAccordion({ flightId, onClose }: FlightInfoAccordionProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flightData, setFlightData] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mock data for visualization
  const mockPassengerData = {
    totalCapacity: 156,
    totalBoarded: 142,
    notBoarded: 11,
    standbyAccepted: 2,
    specialAssistance: 7,
    boardingCompletion: 91,
    lastScan: "15:32 EDT",
  }

  const mockBaggageData = {
    totalChecked: 187,
    missing: 0,
    oversized: 4,
    preloaded: 162,
    inTransit: 25,
  }

  const mockOtpData = {
    scheduledDeparture: "09:30",
    estimatedDeparture: "09:45",
    variance: "+15",
    delayReason: "Weather conditions",
    onTimePerformance: "92%",
  }

  const mockConnectionData = {
    tight: 8,
    late: 3,
    total: 32,
  }

  useEffect(() => {
    let isMounted = true

    const loadFlightData = async () => {
      if (!flightId) return

      try {
        setLoading(true)
        // In a real app, we would fetch specific flight data by ID
        // For now, we'll fetch all flights and find the one we need
        const data = await fetchFlightsByLocation()
        const flight = data.ac.find((f) => f.hex === flightId)

        if (isMounted && flight) {
          setFlightData({
            id: flightId,
            number: flight.flight ? flight.flight.trim() : flight.hex,
            origin: flight.dep_icao || flight.dep_iata || "Unknown",
            destination: flight.arr_icao || flight.arr_iata || "Unknown",
            departureTime: "09:30", // Mocked for visualization
            arrivalTime: "11:45", // Mocked for visualization
            status: getFlightStatus(flight),
            aircraft: flight.t || flight.desc || "Unknown",
            gate: "B22", // Mocked for visualization
            altitude: flight.alt_baro || "N/A",
            speed: flight.gs || flight.speed || "N/A",
            heading: flight.track || flight.dir || "N/A",
            squawk: flight.squawk || "N/A",
            registration: flight.r || "N/A",
            airline: flight.airline_icao || flight.airline_iata || extractAirlineFromFlight(flight.flight || ""),
            passengers: mockPassengerData,
            baggage: mockBaggageData,
            otp: mockOtpData,
            connections: mockConnectionData,
            crew: {
              flightCrew: 2,
              cabinCrew: 5,
              total: 7,
            },
            maintenance: [
              { id: 1, issue: "Routine Check", status: "Scheduled", priority: "low" },
              { id: 2, issue: "APU Maintenance", status: "Completed", priority: "medium" },
            ],
            flightDistance: "1,267 km",
            flightTime: "2h 15m",
            completionPercentage: 30, // Assume flight is 30% complete
          })
          setError(null)
        } else if (isMounted) {
          setError("Flight data not found")
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load flight details")
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (flightId) {
      loadFlightData()
    }

    return () => {
      isMounted = false
    }
  }, [flightId])

  // Helper function to determine flight status
  function getFlightStatus(flight: any): string {
    const alt = flight.alt_baro || 0
    if (!alt) return "Unknown"
    if (alt < 1000) return "Landing/Takeoff"
    if (alt < 5000) return "Climbing/Descending"
    return "In Air"
  }

  // Helper function to extract airline code from flight number
  function extractAirlineFromFlight(flightNumber: string): string {
    // Extract letters from the beginning of the flight number
    const match = flightNumber.match(/^[A-Z]+/)
    return match ? match[0] : "Unknown"
  }

  if (!flightId) {
    return null
  }

  // Default styling for dark theme until component is mounted
  if (!isMounted) {
    return (
      <div className="w-96 h-full bg-black border-l border-gray-800 overflow-auto z-30 relative">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Loading...</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin mb-4 mx-auto">
            <ChevronRight className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-400">Loading flight information...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-96 h-full overflow-auto z-30 relative",
        isDark ? "bg-black border-l border-gray-800" : "bg-white border-l border-gray-200",
      )}
    >
      <div
        className={cn(
          "p-4 flex items-center justify-between",
          isDark ? "border-b border-gray-800" : "border-b border-gray-200",
        )}
      >
        <div className="flex items-center gap-2">
          <Plane className={cn("h-5 w-5", isDark ? "text-white" : "text-gray-700")} />
          <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
            {loading ? "Loading..." : error ? "Error" : `Flight ${flightData?.number}`}
          </h2>
          {flightData && (
            <div
              className={cn(
                "px-2 py-1 rounded text-xs",
                isDark ? "text-white" : "text-gray-700",
                flightData.status === "In Air" && "bg-green-500/30 border border-green-500",
                flightData.status === "Unknown" && "bg-red-500/30 border border-red-500",
                flightData.status === "Climbing/Descending" && "bg-amber-500/30 border border-amber-500",
                flightData.status === "Landing/Takeoff" && "bg-blue-500/30 border border-blue-500",
              )}
            >
              {flightData.status}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cn(
            isDark
              ? "text-gray-400 hover:text-white hover:bg-gray-800"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
          )}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin mb-4 mx-auto">
            <ChevronRight className={cn("h-8 w-8", isDark ? "text-gray-400" : "text-gray-500")} />
          </div>
          <p className={cn(isDark ? "text-gray-400" : "text-gray-500")}>Loading flight information...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="p-4">
          <Accordion type="single" collapsible defaultValue="summary" className="w-full">
            <AccordionItem value="summary" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Summary
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div
                  className={cn(
                    "rounded-lg border overflow-hidden mb-4",
                    isDark ? "border-gray-800" : "border-gray-200",
                  )}
                >
                  <div className={cn("p-3 flex justify-between items-center", isDark ? "bg-gray-900" : "bg-gray-100")}>
                    <div className="flex items-center gap-2">
                      <MapPin className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                      <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.origin}
                      </span>
                    </div>
                    <ArrowRight className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                    <div className="flex items-center gap-2">
                      <MapPin className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                      <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.destination}
                      </span>
                    </div>
                  </div>
                  <div className={cn("p-3", isDark ? "bg-gray-800" : "bg-gray-50")}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Flight</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.number}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Status</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.status}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>ETD</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.departureTime}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>ETA</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.arrivalTime}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Aircraft</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.aircraft}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Gate</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.gate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="route" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Route
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2">
                  <div className="flex justify-between mb-4">
                    <div className="text-center">
                      <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.origin}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                        Scheduled: {flightData.departureTime}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.destination}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                        Scheduled: {flightData.arrivalTime}
                      </p>
                    </div>
                  </div>
                  <div className={cn("h-2 rounded-full w-full my-3 relative", isDark ? "bg-gray-700" : "bg-gray-200")}>
                    <div
                      className="absolute h-3 w-3 bg-blue-500 rounded-full top-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{ left: `${flightData.completionPercentage}%` }}
                    >
                      <Plane className="h-2 w-2 text-white" />
                    </div>
                    <div
                      className="h-2 rounded-l-full bg-blue-500"
                      style={{ width: `${flightData.completionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div
                      className={cn("flex items-center gap-2 p-2 rounded-md", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <Clock className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Flight Time</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.flightTime}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn("flex items-center gap-2 p-2 rounded-md", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Distance</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.flightDistance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="otp" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                OTP
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2 space-y-3">
                  <div className="flex justify-between">
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                      On-Time Performance
                    </p>
                    <div
                      className={cn(
                        "px-2 py-1 rounded text-xs",
                        isDark
                          ? "text-white bg-gray-800 border border-gray-700"
                          : "text-gray-700 bg-gray-100 border border-gray-200",
                      )}
                    >
                      {flightData.otp.onTimePerformance}
                    </div>
                  </div>

                  <div
                    className={cn("rounded-lg border overflow-hidden", isDark ? "border-gray-800" : "border-gray-200")}
                  >
                    <div className={cn("p-3 grid grid-cols-3 gap-3", isDark ? "bg-gray-800" : "bg-gray-50")}>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Scheduled</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.otp.scheduledDeparture}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Estimated</p>
                        <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.otp.estimatedDeparture}
                        </p>
                      </div>
                      <div>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Variance</p>
                        <p className="text-sm font-semibold text-amber-500">{flightData.otp.variance} min</p>
                      </div>
                    </div>
                  </div>

                  {flightData.otp.delayReason && (
                    <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <p className={cn("text-xs font-medium", isDark ? "text-white" : "text-gray-900")}>
                          Delay Reason
                        </p>
                        <p className={cn("text-xs", isDark ? "text-gray-300" : "text-gray-600")}>
                          {flightData.otp.delayReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="baggage" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Baggage
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.baggage.totalChecked}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Total bags</span>
                    </div>
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className="text-xl font-bold text-green-500">{flightData.baggage.missing}</span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Missing</span>
                    </div>
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.baggage.oversized}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Special</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn("text-sm", isDark ? "text-white" : "text-gray-900")}>Loading status</span>
                      <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.baggage.preloaded}/{flightData.baggage.totalChecked}
                      </span>
                    </div>
                    <HorizontalGauge
                      value={flightData.baggage.preloaded}
                      max={flightData.baggage.totalChecked}
                      color="bg-green-500"
                    />
                  </div>

                  <div
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg",
                      isDark ? "bg-gray-800" : "bg-gray-100",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Luggage className={cn("h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                      <span className={cn("text-sm", isDark ? "text-white" : "text-gray-900")}>Bags per passenger</span>
                    </div>
                    <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {(flightData.baggage.totalChecked / flightData.passengers.totalBoarded).toFixed(1)}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="passenger" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Passenger
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16">
                        <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={isDark ? "#334155" : "#e2e8f0"}
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={flightData.passengers.boardingCompletion >= 90 ? "#10b981" : "#3b82f6"}
                            strokeWidth="3"
                            strokeDasharray={`${flightData.passengers.boardingCompletion}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                            {flightData.passengers.boardingCompletion}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className={cn("text-sm", isDark ? "text-white" : "text-gray-900")}>Boarded</span>
                        <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                          {flightData.passengers.totalBoarded}/{flightData.passengers.totalCapacity}
                        </span>
                      </div>
                      <HorizontalGauge
                        value={flightData.passengers.totalBoarded}
                        max={flightData.passengers.totalCapacity}
                      />
                      <div className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                        Last scan: {flightData.passengers.lastScan}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-lg font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.passengers.notBoarded}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Not Boarded</span>
                    </div>
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-lg font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.passengers.standbyAccepted}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Standby</span>
                    </div>
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-lg font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.passengers.specialAssistance}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Special Assist</span>
                    </div>
                  </div>

                  {/* Connection status */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                        Connection Status
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className={cn("text-xs", isDark ? "text-white" : "text-gray-900")}>
                              Tight connections
                            </span>
                          </div>
                          <span className={cn("text-xs font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {flightData.connections.tight}
                          </span>
                        </div>
                        <HorizontalGauge
                          value={flightData.connections.tight}
                          max={flightData.connections.total}
                          color="bg-amber-500"
                          height="h-1"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className={cn("text-xs", isDark ? "text-white" : "text-gray-900")}>
                              Late connections
                            </span>
                          </div>
                          <span className="text-xs font-medium text-red-500">{flightData.connections.late}</span>
                        </div>
                        <HorizontalGauge
                          value={flightData.connections.late}
                          max={flightData.connections.total}
                          color="bg-red-500"
                          height="h-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="aircraft" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Aircraft
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>Type</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {flightData.aircraft}
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                      Registration
                    </p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {flightData.registration}
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>Altitude</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {flightData.altitude} ft
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>Speed</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {flightData.speed} kts
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>Heading</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {flightData.heading}°
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>Squawk</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>{flightData.squawk}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="techops" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Tech Ops
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2 space-y-3">
                  <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                    Maintenance Items
                  </p>

                  {flightData.maintenance.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "border rounded-md p-2",
                        isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50",
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                          {item.issue}
                        </span>
                        <div
                          className={cn(
                            "px-2 py-1 rounded text-xs",
                            isDark ? "text-white" : "text-gray-700",
                            item.status === "Completed" && "bg-green-500/30 border border-green-500",
                            item.status === "In Progress" && "bg-blue-500/30 border border-blue-500",
                            item.status === "Scheduled" &&
                              (isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"),
                          )}
                        >
                          {item.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Priority:</span>
                        <div
                          className={cn(
                            "px-2 py-1 rounded text-xs",
                            isDark ? "text-white" : "text-gray-700",
                            item.priority === "high" && "bg-red-500/30 border border-red-500",
                            item.priority === "medium" && "bg-amber-500/30 border border-amber-500",
                            item.priority === "low" &&
                              (isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"),
                          )}
                        >
                          {item.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="crew" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Crew
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-lg font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.crew.flightCrew}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Flight Crew</span>
                    </div>
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-lg font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.crew.cabinCrew}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Cabin Crew</span>
                    </div>
                    <div
                      className={cn("flex flex-col items-center rounded p-2", isDark ? "bg-gray-800" : "bg-gray-100")}
                    >
                      <span className={cn("text-lg font-medium", isDark ? "text-white" : "text-gray-900")}>
                        {flightData.crew.total}
                      </span>
                      <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Total Crew</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lopa" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                LOPA
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2">
                  <p className={cn("text-sm font-medium mb-2", isDark ? "text-white" : "text-gray-900")}>
                    Layout of Passenger Accommodations
                  </p>
                  <div
                    className={cn(
                      "border rounded-md p-3 text-center flex flex-col items-center justify-center h-36",
                      isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50",
                    )}
                  >
                    <MailOpen className={cn("h-8 w-8 mb-2", isDark ? "text-gray-400" : "text-gray-500")} />
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                      Cabin layout viewer unavailable
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="airport" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Airport
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>Origin</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>{flightData.origin}</p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>Destination</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {flightData.destination}
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                      Gate (Origin)
                    </p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      {flightData.gate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
                      Gate (Destination)
                    </p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>C17</p>
                  </div>

                  <div className="col-span-2 mt-2">
                    <p className={cn("text-sm font-medium mb-2", isDark ? "text-gray-400" : "text-gray-500")}>
                      Terminal Map
                    </p>
                    <div
                      className={cn(
                        "border rounded-md p-3 text-center flex flex-col items-center justify-center h-24",
                        isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50",
                      )}
                    >
                      <MapPin className={cn("h-6 w-6 mb-1", isDark ? "text-gray-400" : "text-gray-500")} />
                      <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                        Map viewer not available
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security" className={cn("border-b", isDark ? "border-gray-800" : "border-gray-200")}>
              <AccordionTrigger
                className={cn(
                  "py-4 text-sm font-medium hover:no-underline",
                  isDark ? "text-white hover:text-white" : "text-gray-900 hover:text-gray-900",
                )}
              >
                Security/Compliance
              </AccordionTrigger>
              <AccordionContent className={cn(isDark ? "text-gray-300" : "text-gray-700")}>
                <div className="py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div
                        className={cn(
                          "p-2 rounded-md flex flex-col items-center",
                          isDark ? "bg-gray-800" : "bg-gray-100",
                        )}
                      >
                        <div className="mb-1">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        </div>
                        <div className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>2</div>
                        <div className={cn("text-xs text-center", isDark ? "text-gray-400" : "text-gray-500")}>
                          Additional
                          <br />
                          Screening
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        className={cn(
                          "p-2 rounded-md flex flex-col items-center",
                          isDark ? "bg-gray-800" : "bg-gray-100",
                        )}
                      >
                        <div className="mb-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                        <div className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>1</div>
                        <div className={cn("text-xs text-center", isDark ? "text-gray-400" : "text-gray-500")}>
                          Visa
                          <br />
                          Issues
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "border rounded-md p-3",
                      isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50",
                    )}
                  >
                    <p className={cn("text-sm font-medium mb-2", isDark ? "text-white" : "text-gray-900")}>
                      Security Notes
                    </p>
                    <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                      <p>• Additional screening required for 2 passengers at gate</p>
                      <p>• 1 passenger with visa verification pending</p>
                      <p>• No prohibited items detected in baggage screening</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}
