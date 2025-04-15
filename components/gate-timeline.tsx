"use client"

import type React from "react"

import { useState } from "react"

interface TimelineStatus {
  aircraft: boolean
  passenger: boolean
  bags: boolean
  tech: boolean
}

interface FlightTimelineData {
  scheduled: {
    arrival: string
    departure: string
  }
  actual: {
    arrival: string
    departure: string
  }
  flightNumber: string
  aircraft: string
}

interface GateTimelineProps {
  gateName: string
  flightData: FlightTimelineData[]
  status?: TimelineStatus
}

interface FlightBarProps {
  flight: FlightInfo
  startHour: number
  endHour: number
  onInfoClick: (type: string, value: string) => void
}

interface FlightInfo {
  // Actual times
  actualArrival?: string
  actualDeparture?: string

  // Scheduled times
  scheduledArrival?: string
  scheduledDeparture?: string

  // Flight numbers
  arrivalFlight?: string
  departureFlight?: string

  // Aircraft info
  aircraftCode?: string
}

interface TimelineProps {
  flights: FlightInfo[]
  currentTime: string // Format: "HH:MM"
  startHour: number
  endHour: number
}

interface TimelineHeaderProps {
  startHour: number
  endHour: number
}

// Sample data matching the image
const sampleFlights: FlightInfo[] = [
  {
    actualArrival: "16:17",
    actualDeparture: "20:30",
    scheduledArrival: "16:10",
    scheduledDeparture: "20:30",
    arrivalFlight: "AC 1320",
    departureFlight: "AC 1321",
    aircraftCode: "CGELU",
  },
  {
    actualArrival: "20:57",
    actualDeparture: "01:15",
    scheduledArrival: "20:45",
    scheduledDeparture: "01:00",
    arrivalFlight: "AC 1399",
    departureFlight: "AC 1388",
    aircraftCode: "CGEXX",
  },
]

export function GateTimeline({ gateName, flightData, status }: GateTimelineProps) {
  const [flights, setFlights] = useState<FlightInfo[]>(sampleFlights)
  const [newFlight, setNewFlight] = useState<FlightInfo>({
    actualArrival: "",
    actualDeparture: "",
    scheduledArrival: "",
    scheduledDeparture: "",
    arrivalFlight: "",
    departureFlight: "",
    aircraftCode: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewFlight({ ...newFlight, [name]: value })
  }

  // Get current time in HH:MM format
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

  function TimelineHeader({ startHour, endHour }: TimelineHeaderProps) {
    // Calculate total hours in the timeline
    const totalHours = endHour > startHour ? endHour - startHour : 24 + endHour - startHour

    // Generate hour markers
    const hourMarkers = []
    for (let i = 0; i <= totalHours; i++) {
      const hour = (startHour + i) % 24
      hourMarkers.push(hour)
    }

    return (
      <div className="flex w-full border-b border-gray-300 pb-1 mb-4 relative">
        {hourMarkers.map((hour, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-gray-600"
            style={{
              position: "absolute",
              left: `${(index / totalHours) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {`${hour.toString().padStart(2, "0")}:00`}
          </div>
        ))}
      </div>
    )
  }

  function timeToDecimal(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours + minutes / 60
  }

  // Calculate position percentage based on time and timeline range
  function calculatePosition(time: string, startHour: number, endHour: number): number {
    const decimalTime = timeToDecimal(time)

    // Handle overnight timeline (e.g., 16:00 to 02:00)
    const totalHours = endHour > startHour ? endHour - startHour : 24 + endHour - startHour

    // Adjust time for overnight
    let adjustedTime = decimalTime
    if (endHour < startHour && decimalTime < startHour) {
      adjustedTime += 24 // Add 24 hours if we're past midnight
    }

    const position = ((adjustedTime - startHour) / totalHours) * 100
    return Math.max(0, Math.min(100, position))
  }

  // Calculate width percentage between two times
  function calculateWidth(startTime: string, endTime: string, startHour: number, endHour: number): number {
    const startPos = calculatePosition(startTime, startHour, endHour)
    let endPos = calculatePosition(endTime, startHour, endHour)

    // Handle overnight flights
    if (endPos < startPos) {
      endPos += 100
    }

    return endPos - startPos
  }

  // Format time for display (e.g., "16:10" to "STA 16:10")
  function formatTimeWithPrefix(time: string, prefix: string): string {
    return `${prefix} ${time}`
  }

  function FlightBar({ flight, startHour, endHour, onInfoClick }: FlightBarProps) {
    const [showTooltip, setShowTooltip] = useState(false)

    // Calculate positions for actual timeline
    const actualStartPos = flight.actualArrival ? calculatePosition(flight.actualArrival, startHour, endHour) : 0

    const actualEndPos = flight.actualDeparture ? calculatePosition(flight.actualDeparture, startHour, endHour) : 100

    const actualWidth =
      flight.actualArrival && flight.actualDeparture
        ? calculateWidth(flight.actualArrival, flight.actualDeparture, startHour, endHour)
        : 100

    // Calculate positions for scheduled timeline
    const scheduledStartPos = flight.scheduledArrival
      ? calculatePosition(flight.scheduledArrival, startHour, endHour)
      : 0

    const scheduledEndPos = flight.scheduledDeparture
      ? calculatePosition(flight.scheduledDeparture, startHour, endHour)
      : 100

    const scheduledWidth =
      flight.scheduledArrival && flight.scheduledDeparture
        ? calculateWidth(flight.scheduledArrival, flight.scheduledDeparture, startHour, endHour)
        : 100

    return (
      <div className="relative mb-8 h-16">
        {/* Actual timeline (blue) */}
        <div
          className="absolute h-8 bg-blue-500 rounded-md flex items-center justify-between px-2 text-white"
          style={{
            left: `${actualStartPos}%`,
            width: `${actualWidth}%`,
            minWidth: "200px", // Ensure minimum width for readability
          }}
        >
          {flight.actualArrival && (
            <button
              onClick={() => onInfoClick("actualArrival", flight.actualArrival)}
              className="text-xs font-semibold hover:underline"
            >
              ATA {flight.actualArrival}
            </button>
          )}

          {flight.arrivalFlight && (
            <button
              onClick={() => onInfoClick("arrivalFlight", flight.arrivalFlight)}
              className="bg-white text-blue-600 px-2 py-1 rounded-md text-xs font-semibold mx-1 hover:bg-blue-100"
            >
              {flight.arrivalFlight}
            </button>
          )}

          {flight.aircraftCode && (
            <button
              onClick={() => onInfoClick("aircraftCode", flight.aircraftCode)}
              className="text-xs font-semibold bg-white text-blue-600 px-2 py-1 rounded-md mx-1 hover:bg-blue-100"
            >
              {flight.aircraftCode}
            </button>
          )}

          {flight.departureFlight && (
            <button
              onClick={() => onInfoClick("departureFlight", flight.departureFlight)}
              className="bg-white text-blue-600 px-2 py-1 rounded-md text-xs font-semibold mx-1 hover:bg-blue-100"
            >
              {flight.departureFlight}
            </button>
          )}

          {flight.actualDeparture && (
            <button
              onClick={() => onInfoClick("actualDeparture", flight.actualDeparture)}
              className="text-xs font-semibold hover:underline"
            >
              ATD {flight.actualDeparture}
            </button>
          )}
        </div>

        {/* Scheduled timeline (white) */}
        <div
          className="absolute top-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-between px-2"
          style={{
            left: `${scheduledStartPos}%`,
            width: `${scheduledWidth}%`,
            minWidth: "200px", // Ensure minimum width for readability
          }}
        >
          {flight.scheduledArrival && (
            <button
              onClick={() => onInfoClick("scheduledArrival", flight.scheduledArrival)}
              className="text-xs font-semibold hover:underline text-black"
            >
              STA {flight.scheduledArrival}
            </button>
          )}

          <div className="flex-grow"></div>

          {flight.scheduledDeparture && (
            <button
              onClick={() => onInfoClick("scheduledDeparture", flight.scheduledDeparture)}
              className="text-xs font-semibold hover:underline text-black"
            >
              STD {flight.scheduledDeparture}
            </button>
          )}
        </div>
      </div>
    )
  }

  function AirportTimeline({ flights, currentTime, startHour, endHour }: TimelineProps) {
    const [selectedInfo, setSelectedInfo] = useState<{ type: string; value: string } | null>(null)

    const handleInfoClick = (type: string, value: string) => {
      setSelectedInfo({ type, value })
      // You could also trigger a modal or other action here
      console.log(`Clicked ${type}: ${value}`)
    }

    // Calculate current time position
    const nowPosition = calculatePosition(currentTime, startHour, endHour)

    // Calculate total hours in the timeline
    const totalHours = endHour > startHour ? endHour - startHour : 24 + endHour - startHour

    return (
      <div className="w-full bg-gray-100 p-4">
        <div className="relative">
          {/* Timeline header with hour markers */}
          <div className="h-8 relative mb-4">
            <TimelineHeader startHour={startHour} endHour={endHour} />
          </div>

          {/* Hour grid lines */}
          <div className="absolute top-8 left-0 w-full h-full">
            {Array.from({ length: totalHours + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-full border-l border-gray-300 border-dashed"
                style={{ left: `${(i / totalHours) * 100}%` }}
              />
            ))}
          </div>

          {/* Current time indicator */}
          <div className="absolute top-0 bottom-0 border-l-2 border-red-600 z-10" style={{ left: `${nowPosition}%` }}>
            <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm  transform -translate-x-1/2">
              NOW
            </div>
          </div>

          {/* Flight bars */}
          <div className="mt-8">
            {flights.map((flight, index) => (
              <FlightBar
                key={index}
                flight={flight}
                startHour={startHour}
                endHour={endHour}
                onInfoClick={handleInfoClick}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AirportTimeline
      flights={flights}
      currentTime="02:00" // Set to match the image
      startHour={16}
      endHour={2}
    />
  )
}
