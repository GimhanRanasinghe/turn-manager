"use client"

import { useState } from "react"
import Map from "@/components/map"
import FlightInfoAccordion from "@/components/flight-info-accordion"
import { cn } from "@/lib/utils"

export default function FlightsPage() {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null)

  return (
    <div className="flex-1 flex h-full relative">
      <div className={cn("flex-1 relative", selectedFlight ? "flex-grow" : "")}>
        <Map onSelectFlight={setSelectedFlight} />
      </div>

      {selectedFlight && (
        <div className="absolute right-0 top-0 h-full z-30">
          <FlightInfoAccordion flightId={selectedFlight} onClose={() => setSelectedFlight(null)} />
        </div>
      )}
    </div>
  )
}
