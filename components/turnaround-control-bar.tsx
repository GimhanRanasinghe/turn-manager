"use client"

import { Plane, Clock, Filter, ChevronRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

interface TurnaroundControlBarProps {
  showAll: boolean
  showDelayed: boolean
  selectedAirport: string
  selectedView: string
  selectedGate: string
  timeValue: number
  mapViewEnabled: boolean
  onFilterToggle: (value: string) => void
  onAirportChange: (value: string) => void
  onViewChange: (value: string) => void
  onGateChange: (value: string) => void
  onTimeChange: (value: number[]) => void
  onSatelliteViewChange?: (enabled: boolean) => void
  torontoGates: Record<string, { terminal: string; coordinates: [number, number] }>
  selectedViewMode?: string
  onViewModeChange?: (mode: string) => void
}

export function TurnaroundControlBar({
  showAll,
  showDelayed,
  selectedAirport,
  selectedView,
  selectedGate,
  timeValue,
  mapViewEnabled,
  onFilterToggle,
  onAirportChange,
  onViewChange,
  onGateChange,
  onTimeChange,
  onSatelliteViewChange,
  torontoGates,
  selectedViewMode = "map",
  onViewModeChange,
}: TurnaroundControlBarProps) {
  const [satelliteView, setSatelliteView] = useState(false)

  const handleSatelliteViewChange = (checked: boolean) => {
    setSatelliteView(checked)
    if (onSatelliteViewChange) onSatelliteViewChange(checked)
  }

  return (
    <div className="p-2 bg-black/80 border-b border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <ToggleGroup type="single" value={showAll ? "all" : "delayed"} onValueChange={onFilterToggle}>
            <ToggleGroupItem value="all" aria-label="All aircraft">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>All</span>
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem value="delayed" aria-label="Delayed aircraft">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span>Delayed</span>
              </div>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Airport Selector */}
          <Select value={selectedAirport} onValueChange={onAirportChange}>
            <SelectTrigger className="w-[180px] h-9 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-1">
                <Plane className="h-4 w-4" />
                <SelectValue placeholder="Airport" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="YYZ">YYZ</SelectItem>
              <SelectItem value="YVR">YVR</SelectItem>
              <SelectItem value="YUL">YUL</SelectItem>
            </SelectContent>
          </Select>

          {/* Views Selector */}
          <Select value={selectedView} onValueChange={onViewChange}>
            <SelectTrigger className="w-[180px] h-9 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Select View" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="terminal1">Terminal 1</SelectItem>
              <SelectItem value="terminal3">Terminal 3</SelectItem>
              <SelectItem value="all">All Terminals</SelectItem>
            </SelectContent>
          </Select>

          {/* Gates Selector */}
          <Select value={selectedGate} onValueChange={onGateChange}>
            <SelectTrigger className="w-[180px] h-9 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4" />
                <SelectValue placeholder="Select Gate" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Gates</SelectItem>
              <SelectItem value="terminal1" disabled className="font-semibold">
                Terminal 1
              </SelectItem>
              {Object.entries(torontoGates)
                .filter(([key]) => key.startsWith("T1"))
                .map(([key]) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              <SelectItem value="terminal3" disabled className="font-semibold">
                Terminal 3
              </SelectItem>
              {Object.entries(torontoGates)
                .filter(([key]) => key.startsWith("T3"))
                .map(([key]) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Time Slider */}
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md min-w-[220px]">
            <Clock className="h-4 w-4 shrink-0" />
            <Slider value={[timeValue]} max={720} step={30} className="w-[100px]" onValueChange={onTimeChange} />
            <span className="text-sm whitespace-nowrap">
              {Math.floor(timeValue / 60)}:{(timeValue % 60).toString().padStart(2, "0")} hrs
            </span>
          </div>

          {/* Map View Toggle */}
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-md">
            <span className="text-sm">Satellite</span>
            <Switch
              checked={satelliteView}
              onCheckedChange={handleSatelliteViewChange}
              aria-label="Toggle satellite view"
            />
          </div>
        </div>

        {/* View Mode Toggle Buttons - Aligned Right */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded ${
              selectedViewMode === "square" ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => onViewModeChange?.("square")}
            aria-label="Square view"
          >
            <div className="w-4 h-4 bg-current rounded-sm" />
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded ${
              selectedViewMode === "up" ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
            }`}
            onClick={() => onViewModeChange?.("up")}
            aria-label="Up view"
          >
            <div className="transform rotate-90">➤</div>
          </button>
          <ToggleGroup
            type="single"
            value={selectedViewMode === "list" ? "list" : "map"}
            onValueChange={(value) => {
              if (value) onViewModeChange?.(value)
            }}
            className="bg-gray-800 rounded-md"
          >
            <ToggleGroupItem value="map" aria-label="Map view" className="px-3 py-1 text-xs">
              Map
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="px-3 py-1 text-xs">
              List
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  )
}
