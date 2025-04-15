"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

// Mock timeline data
const TIMELINE_DATA = {
  currentTime: new Date("2023-09-15T14:30:00"),
  flights: [
    {
      id: "AC123",
      origin: "YYZ",
      destination: "YVR",
      scheduledDeparture: new Date("2023-09-15T08:30:00"),
      scheduledArrival: new Date("2023-09-15T11:45:00"),
      actualDeparture: new Date("2023-09-15T08:35:00"),
      estimatedArrival: new Date("2023-09-15T11:50:00"),
      status: "In Air",
      gate: "D12",
      aircraft: "Boeing 787-9",
    },
    {
      id: "AC456",
      origin: "YYZ",
      destination: "YUL",
      scheduledDeparture: new Date("2023-09-15T09:15:00"),
      scheduledArrival: new Date("2023-09-15T10:30:00"),
      actualDeparture: new Date("2023-09-15T09:45:00"),
      estimatedArrival: new Date("2023-09-15T11:00:00"),
      status: "In Air",
      gate: "B8",
      aircraft: "Airbus A320",
    },
    {
      id: "AC789",
      origin: "YYZ",
      destination: "JFK",
      scheduledDeparture: new Date("2023-09-15T10:45:00"),
      scheduledArrival: new Date("2023-09-15T12:15:00"),
      actualDeparture: new Date("2023-09-15T10:45:00"),
      estimatedArrival: new Date("2023-09-15T12:15:00"),
      status: "In Air",
      gate: "C4",
      aircraft: "Boeing 737-800",
    },
    {
      id: "AC234",
      origin: "YYZ",
      destination: "LHR",
      scheduledDeparture: new Date("2023-09-15T19:30:00"),
      scheduledArrival: new Date("2023-09-16T07:45:00"),
      status: "Scheduled",
      gate: "E7",
      aircraft: "Boeing 777-300ER",
    },
    {
      id: "AC567",
      origin: "YYZ",
      destination: "LAX",
      scheduledDeparture: new Date("2023-09-15T14:20:00"),
      scheduledArrival: new Date("2023-09-15T16:55:00"),
      status: "Boarding",
      gate: "D5",
      aircraft: "Boeing 787-8",
    },
    {
      id: "AC890",
      origin: "YYZ",
      destination: "YYC",
      scheduledDeparture: new Date("2023-09-15T11:00:00"),
      scheduledArrival: new Date("2023-09-15T13:15:00"),
      actualDeparture: new Date("2023-09-15T11:30:00"),
      estimatedArrival: new Date("2023-09-15T13:45:00"),
      status: "In Air",
      gate: "A9",
      aircraft: "Airbus A321",
    },
    {
      id: "AC321",
      origin: "YYZ",
      destination: "MIA",
      scheduledDeparture: new Date("2023-09-15T16:45:00"),
      scheduledArrival: new Date("2023-09-15T20:10:00"),
      status: "Scheduled",
      gate: "B3",
      aircraft: "Boeing 737 MAX 8",
    },
  ],
}

interface TimelineViewProps {
  onSelectFlight: (flightId: string) => void
}

export default function TimelineView({ onSelectFlight }: TimelineViewProps) {
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Timeline</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mb-4",
            isDark ? "bg-gray-800" : "bg-gray-100",
          )}
        >
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Timeline View</h3>
        <p className="text-muted-foreground text-center max-w-md">
          The timeline feature is currently under development and will be available in a future update.
        </p>
      </div>
    </div>
  )
}
