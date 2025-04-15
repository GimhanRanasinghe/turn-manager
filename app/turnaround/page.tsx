"use client"

import { useState, Suspense } from "react"
import TurnaroundMap from "@/components/turnaround-map"
import FlightInfo from "@/components/flight-info"
import AircraftDetailsPanel from "@/components/aircraft-details-panel"

function TurnaroundContent() {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [showFlightInfo, setShowFlightInfo] = useState(false)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [selectedAircraft, setSelectedAircraft] = useState<any>(null)

  const handleSelectAircraft = (aircraftId: string) => {
    // For the popup, we don't need to do anything as it's handled in the map component
    // But we'll store the ID for when the user clicks "View Details"
    setSelectedFlightId(aircraftId)
  }

  const handleViewDetails = (aircraft: any) => {
    setSelectedAircraft(aircraft)
    setShowDetailsPanel(true)
    setShowFlightInfo(false) // Close the flight info dialog if it's open
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 relative">
        <TurnaroundMap onSelectAircraft={handleSelectAircraft} onViewDetails={handleViewDetails} />

        {/* Flight Info Dialog (legacy) */}
        {selectedFlightId && showFlightInfo && (
          <FlightInfo flightId={selectedFlightId} open={showFlightInfo} onClose={() => setShowFlightInfo(false)} />
        )}

        {/* Aircraft Details Side Panel */}
        {selectedAircraft && (
          <AircraftDetailsPanel
            aircraft={selectedAircraft}
            open={showDetailsPanel}
            onClose={() => setShowDetailsPanel(false)}
          />
        )}
      </div>
    </div>
  )
}

export default function TurnaroundPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <TurnaroundContent />
    </Suspense>
  )
}
