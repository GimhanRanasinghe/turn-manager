"use client"

import { useState, Suspense } from "react"
import HubMap from "@/components/hub-map"
import HubListView from "@/components/hub-list-view"
import HubControlBar from "@/components/hub-control-bar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plane } from "lucide-react"
//import { TORONTO_GATES } from "@/lib/data/hub-mock-data"
import { TORONTO_GATES } from "@/lib/data/toronto-gates"
import { useTheme } from "@/components/theme-provider"

function HubOperationsContent() {
  const { theme, mounted } = useTheme()
  const isDarkTheme = theme === "dark"

  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [view, setView] = useState("")
  const [gate, setGate] = useState("")
  const [time, setTime] = useState(180)
  const [displayMode, setDisplayMode] = useState("map")
  const [satelliteView, setSatelliteView] = useState(false)
  const [gateCoordinates, setGateCoordinates] = useState<[number, number] | null>(null)

  const handleGateChange = (gate: string, coordinates?: [number, number]) => {
    setGate(gate)
    setGateCoordinates(coordinates || null)

    // If this is a gate ID from the map, update the dropdown selection
    if (gate.startsWith("T1-") || gate.startsWith("T3-")) {
      setGate(gate)
    }
  }

  return (
    <div className={`flex-1 flex flex-col h-full ${isDarkTheme ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Control Bar */}
      <div className={`p-2 ${isDarkTheme ? "bg-black" : "bg-white border-b border-gray-200"}`}>
        <HubControlBar
          onFilterChange={setFilter}
          onViewChange={setView}
          onGateChange={handleGateChange}
          onTimeChange={setTime}
          onDisplayModeChange={setDisplayMode}
          onSatelliteViewChange={setSatelliteView}
        />
      </div>

      {/* Content - Toggle between Map and List view */}
      <div className="flex-1 relative">
        {displayMode === "map" ? (
          <HubMap
            onSelectAircraft={(id) => {
              // Check if this is a gate ID
              console.log("GateID:" + id?.split(":")[1])
              if (id.startsWith("T1-") || id.startsWith("T3-") || id.startsWith("Gate")) {
                const gateInfo = TORONTO_GATES[id as keyof typeof TORONTO_GATES]
                console.log("Selected Aircraft:" + selectedAircraft)

                if (gateInfo) {
                  handleGateChange(id?.split(":")[1], gateInfo.coordinates as [number, number])
                }
              } else {
                setSelectedAircraft(id)
              }
            }}
            satelliteView={satelliteView}
            gateCoordinates={gateCoordinates}
          />
        ) : (
          <HubListView onSelectAircraft={setSelectedAircraft} />
        )}
      </div>

      {/* Aircraft Details Dialog */}
      <Dialog open={!!selectedAircraft} onOpenChange={(open) => !open && setSelectedAircraft(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Aircraft {selectedAircraft} Details
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Flight</p>
              <p className="text-lg font-semibold">{selectedAircraft}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">At Gate</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gate</p>
              <p className="text-lg font-semibold">B12</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Destination</p>
              <p className="text-lg font-semibold">YVR</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scheduled Departure</p>
              <p className="text-lg font-semibold">14:30</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Departure</p>
              <p className="text-lg font-semibold">14:45</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function HubOperationsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <HubOperationsContent />
    </Suspense>
  )
}
