"use client"

import { useState, useEffect } from "react"
import { Plane, Clock, Eye, Grid } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"

// Toronto Pearson International Airport gate data with coordinates
const TORONTO_GATES = {
  // Terminal 1 Gates
  /*"T1-D1": { terminal: "Terminal 1", coordinates: [-79.6134, 43.6789] },
  "T1-D3": { terminal: "Terminal 1", coordinates: [-79.6138, 43.6791] },
  "T1-D5": { terminal: "Terminal 1", coordinates: [-79.6142, 43.6793] },
  "T1-D7": { terminal: "Terminal 1", coordinates: [-79.6146, 43.6795] },
  "T1-D20": { terminal: "Terminal 1", coordinates: [-79.615, 43.6797] },
  "T1-D22": { terminal: "Terminal 1", coordinates: [-79.6154, 43.6799] },
  "T1-E1": { terminal: "Terminal 1", coordinates: [-79.6158, 43.6801] },
  "T1-E2": { terminal: "Terminal 1", coordinates: [-79.6162, 43.6803] },
  "T1-E3": { terminal: "Terminal 1", coordinates: [-79.6166, 43.6805] },
  "T1-F1": { terminal: "Terminal 1", coordinates: [-79.617, 43.6807] },
  "T1-F3": { terminal: "Terminal 1", coordinates: [-79.6174, 43.6809] },
  // Terminal 3 Gates - Updated with more accurate coordinates
  "T3-A1": { terminal: "Terminal 3", coordinates: [-79.631, 43.6765] },
  "T3-A4": { terminal: "Terminal 3", coordinates: [-79.6315, 43.676] },
  "T3-A6": { terminal: "Terminal 3", coordinates: [-79.632, 43.6755] },
  "T3-B7": { terminal: "Terminal 3", coordinates: [-79.6325, 43.675] },
  "T3-B9": { terminal: "Terminal 3", coordinates: [-79.633, 43.6745] },
  "T3-B11": { terminal: "Terminal 3", coordinates: [-79.6335, 43.674] },
  "T3-C12": { terminal: "Terminal 3", coordinates: [-79.634, 43.6735] },
  "T3-C14": { terminal: "Terminal 3", coordinates: [-79.6345, 43.673] },
  "T3-C16": { terminal: "Terminal 3", coordinates: [-79.635, 43.6725] },*/
  "T1-D28": { terminal: "Terminal 1", coordinates: [-79.61704841154716, 43.68317115539478] },
  "T1-D26": { terminal: "Terminal 1", coordinates: [-79.6171178269482, 43.68281497948208] },
  "T1-D24": { terminal: "Terminal 1", coordinates: [-79.61682694336285, 43.682482706086525] },
  "T1-D22": { terminal: "Terminal 1", coordinates: [-79.61623525967298, 43.68198787825107] },
  "T1-D20": { terminal: "Terminal 1", coordinates: [-79.61557416059193, 43.68159822834153] },
  "T1-D30": { terminal: "Terminal 1", coordinates: [-79.615471690238, 43.681258776673026] },
  "T1-D31": { terminal: "Terminal 1", coordinates: [-79.61574274083804, 43.68108187855827] },
  "T1-D33": { terminal: "Terminal 1", coordinates: [-79.61616253873963, 43.680751986095714] },
  "T1-D35": { terminal: "Terminal 1", coordinates: [-79.61663522456583, 43.68048424595205] },
  "T1-D37": { terminal: "Terminal 1", coordinates: [-79.61714096541327, 43.68025475343562] },
  "T1-D39": { terminal: "Terminal 1", coordinates: [-79.6177623985274, 43.680006135567126] },
  "T1-D40": { terminal: "Terminal 1", coordinates: [-79.6179375898312, 43.67961169162591] },
  "T1-D41": { terminal: "Terminal 1", coordinates: [-79.61758720732956, 43.679233979247954] },
  "T1-D42": { terminal: "Terminal 1", coordinates: [-79.61728971275366, 43.67894949810817] },
  "T1-D43": { terminal: "Terminal 1", coordinates: [-79.61695255223427, 43.67881323355502] },
  "T1-D44": { terminal: "Terminal 1", coordinates: [-79.61678188758182, 43.67861373758253] },
  "T1-D45": { terminal: "Terminal 1", coordinates: [-79.61668857959347, 43.67868824857038] },
  "T1-D38": { terminal: "Terminal 1", coordinates: [-79.61649663646631, 43.67885227233957] },
  "T1-D36": { terminal: "Terminal 1", coordinates: [-79.6162336705942, 43.67887161295398] },
  "T1-F36": { terminal: "Terminal 1", coordinates: [-79.61613561552323, 43.6789038472975] },
  "T1-D34": { terminal: "Terminal 1", coordinates: [-79.61576122343412, 43.67922618978009] },
  "T1-F34": { terminal: "Terminal 1", coordinates: [-79.61562305492505, 43.679197179027554] },
  "T1-D32": { terminal: "Terminal 1", coordinates: [-79.61518626415443, 43.67939703059372] },
  "T1-F32": { terminal: "Terminal 1", coordinates: [-79.61495004057439, 43.6795839879078] },
  "T1-D51": { terminal: "Terminal 1", coordinates: [-79.61495004057439, 43.679719370426774] },
  "T1-F51": { terminal: "Terminal 1", coordinates: [-79.61478276873616, 43.68008533898254] },
  "T1-D53": { terminal: "Terminal 1", coordinates: [-79.61428573705984, 43.680363403550295] },
  "T1-F53": { terminal: "Terminal 1", coordinates: [-79.61381830800592, 43.68034123656104] },
  "T1-D55": { terminal: "Terminal 1", coordinates: [-79.61328702252383, 43.68029690255799] },
  "T1-F55": { terminal: "Terminal 1", coordinates: [-79.61305203086832, 43.680121413474374] },
  "T1-D57": { terminal: "Terminal 1", coordinates: [-79.61271231467065, 43.67993484030677] },
  "T1-F57": { terminal: "Terminal 1", coordinates: [-79.61233683887322, 43.679676223075354] },
  "T1-F61": { terminal: "Terminal 1", coordinates: [-79.61237088415191, 43.67929093957511] },
  "T1-F63": { terminal: "Terminal 1", coordinates: [-79.61235712996769, 43.67923577748416] },
  "T1-F65": { terminal: "Terminal 1", coordinates: [-79.61258219844521, 43.67880804347432] },
  "T1-E67": { terminal: "Terminal 1", coordinates: [-79.61239839252973, 43.67850057951439] },
  "T1-F67": { terminal: "Terminal 1", coordinates: [-79.61244090546279, 43.67848068473356] },
  "T1-E69": { terminal: "Terminal 1", coordinates: [-79.61249842297171, 43.67790373320803] },
  "T1-F69": { terminal: "Terminal 1", coordinates: [-79.61249842297171, 43.67790373320803] },
  "T1-E85": { terminal: "Terminal 1", coordinates: [-79.6130498407276, 43.67767222758888] },
  "T1-E70": { terminal: "Terminal 1", coordinates: [-79.61366937727891, 43.677303106845926] },
  "T1-E71": { terminal: "Terminal 1", coordinates: [-79.61437904834979, 43.67684740425243] },
  "T1-E72": { terminal: "Terminal 1", coordinates: [-79.61377027529132, 43.67657632678891] },
  "T1-E73": { terminal: "Terminal 1", coordinates: [-79.61324544272809, 43.676164511543575] },
  "T1-E74": { terminal: "Terminal 1", coordinates: [-79.61266119515771, 43.6759997846541] },
  "T1-E75": { terminal: "Terminal 1", coordinates: [-79.61177987255157, 43.67584938144704] },
  "T1-E76": { terminal: "Terminal 1", coordinates: [-79.61096786745375, 43.675888772799624] },
  "T1-E77": { terminal: "Terminal 1", coordinates: [-79.6103242048762, 43.67611437732074] },
  "T1-E78": { terminal: "Terminal 1", coordinates: [-79.60975976230822, 43.67644741101601] },
  "T1-E79": { terminal: "Terminal 1", coordinates: [-79.60932900350633, 43.6767374711156] },
  "T1-E80": { terminal: "Terminal 1", coordinates: [-79.60957656603323, 43.677002463095484] },
  "T1-E81": { terminal: "Terminal 1", coordinates: [-79.60982907981365, 43.677263872928314] },
  "T1-E82": { terminal: "Terminal 1", coordinates: [-79.61012615484943, 43.67745724385269] },
  "T1-E68": { terminal: "Terminal 1", coordinates: [-79.61069554865058, 43.677865469341725] },
  "T1-F68": { terminal: "Terminal 1", coordinates: [-79.61080942741431, 43.67820923599649] },
  "T1-E66": { terminal: "Terminal 1", coordinates: [-79.6107995249131, 43.67850286845449] },
  "T1-F66": { terminal: "Terminal 1", coordinates: [-79.61059652363866, 43.67880008033276] },
  "T1-F64": { terminal: "Terminal 1", coordinates: [-79.61063118239282, 43.67911877577136] },
  "T1-F62": { terminal: "Terminal 1", coordinates: [-79.6106905974, 43.679390918850906] },
  "T1-F60": { terminal: "Terminal 1", coordinates: [-79.61082923241669, 43.67968812633028] },
  "T1-F82": { terminal: "Terminal 1", coordinates: [-79.61010139859148, 43.6800533672552] },
  "T1-F83": { terminal: "Terminal 1", coordinates: [-79.60972510354615, 43.68010707896622] },
}

// Fallback airport data in case the API call fails
const FALLBACK_AIRPORTS = [
  { key: "YYZ", value: "Toronto Pearson (YYZ)" },
  { key: "YVR", value: "Vancouver (YVR)" },
  { key: "YUL", value: "Montreal (YUL)" },
  { key: "YYC", value: "Calgary (YYC)" },
  { key: "YOW", value: "Ottawa (YOW)" },
]

interface AirportOption {
  key: string
  value: string
}

interface HubControlBarProps {
  onFilterChange?: (filter: string) => void
  onViewChange?: (view: string) => void
  onGateChange?: (gate: string, coordinates?: [number, number]) => void
  onTimeChange?: (time: number) => void
  onDisplayModeChange?: (mode: string) => void
  onSatelliteViewChange?: (enabled: boolean) => void
}

export default function HubControlBar({
  onFilterChange,
  onViewChange,
  onGateChange,
  onTimeChange,
  onDisplayModeChange,
  onSatelliteViewChange,
}: HubControlBarProps) {
  const [filter, setFilter] = useState("all")
  const [view, setView] = useState("")
  const [gate, setGate] = useState("")
  const [time, setTime] = useState(180) // 3 hours in minutes
  const [displayMode, setDisplayMode] = useState("map")
  const [satelliteView, setSatelliteView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // After initial client-side render, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine if we're in light mode
  const isLightTheme = mounted && theme === "light"

  const [airports, setAirports] = useState<AirportOption[]>(FALLBACK_AIRPORTS)
  const [selectedAirport, setSelectedAirport] = useState("YYZ")
  const [airportsLoading, setAirportsLoading] = useState(true)

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setAirportsLoading(true)
        const baseUrl = process.env.TURN_MANAGER_BACKEND_BASE_URL

        if (!baseUrl) {
          console.error("Backend base URL environment variable is not set")
          setAirportsLoading(false)
          return
        }

        const endpoint = `${baseUrl}/api/airports/selectList`
        console.log(`Fetching airports from: ${endpoint}`)

        try {
          // Attempt to fetch with credentials included (for CORS)
          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            mode: "cors", // Explicit CORS mode
            cache: "no-cache", // Bypass cache for fresh data
          })

          if (!response.ok) {
            //throw new Error(`Failed to fetch airports: ${response.status} ${response.statusText}`)
          }

          const data: AirportOption[] = await response.json()
          console.log("Successfully fetched airports:", data)

          if (Array.isArray(data) && data.length > 0) {
            setAirports(data)
          } else {
            console.warn("API returned empty or invalid data, using fallback airports")
            setAirports(FALLBACK_AIRPORTS)
          }
        } catch (fetchError) {
          // console.error("Fetch error:", fetchError)
          // Use fallback data
          console.log("Using fallback airport data due to fetch error")
          setAirports(FALLBACK_AIRPORTS)
        }
      } catch (error) {
        console.error("Error in airport fetch process:", error)
        // Ensure we have fallback data
        setAirports(FALLBACK_AIRPORTS)
      } finally {
        setAirportsLoading(false)
      }
    }

    fetchAirports()
  }, [])

  const handleFilterChange = (value: string) => {
    setFilter(value)
    if (onFilterChange) onFilterChange(value)
  }

  const handleViewChange = (value: string) => {
    setView(value)
    if (onViewChange) onViewChange(value)
  }

  const handleGateChange = (value: string) => {
    setGate(value)
    if (onGateChange) {
      const gateInfo = TORONTO_GATES[value as keyof typeof TORONTO_GATES]
      if (gateInfo) {
        onGateChange(value, gateInfo.coordinates as [number, number])
      } else {
        onGateChange(value)
      }
    }
  }

  const handleTimeChange = (value: number[]) => {
    setTime(value[0])
    if (onTimeChange) onTimeChange(value[0])
  }

  const handleDisplayModeChange = (value: string) => {
    setDisplayMode(value)
    if (onDisplayModeChange) onDisplayModeChange(value)
  }

  const handleSatelliteViewChange = (checked: boolean) => {
    setSatelliteView(checked)
    if (onSatelliteViewChange) onSatelliteViewChange(checked)
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 ${isLightTheme ? "bg-white/90 border-gray-300" : "bg-background/90 border-border"} border rounded-lg`}
    >
      {/* Status Filter */}
      <ToggleGroup type="single" value={filter} onValueChange={handleFilterChange}>
        <ToggleGroupItem value="all" aria-label="All flights">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span>All</span>
          </div>
        </ToggleGroupItem>
        <ToggleGroupItem value="delayed" aria-label="Delayed flights">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <span>Delayed</span>
          </div>
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Airport Selector */}
      <Select value={selectedAirport} onValueChange={setSelectedAirport} disabled={airportsLoading}>
        <SelectTrigger className="w-auto min-w-[140px] h-9">
          <div className="flex items-center gap-1">
            <Plane className="h-4 w-4" />
            <SelectValue placeholder={airportsLoading ? "Loading..." : "Select Airport"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          {airports.map((airport) => (
            <SelectItem key={airport.key} value={airport.key}>
              {airport.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Views Selector */}
      <Select value={view} onValueChange={handleViewChange}>
        <SelectTrigger className="w-[180px] h-9">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <SelectValue placeholder="Select View" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="terminal1">Terminal 1</SelectItem>
          <SelectItem value="terminal3">Terminal 3</SelectItem>
          <SelectItem value="all">All Terminals</SelectItem>
        </SelectContent>
      </Select>

      {/* Gates Selector */}
      <Select value={gate} onValueChange={handleGateChange}>
        <SelectTrigger className="w-[180px] h-9">
          <div className="flex items-center gap-1">
            <Grid className="h-4 w-4" />
            <SelectValue placeholder="Select Gate" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Gates</SelectItem>
          <SelectItem value="terminal1" disabled className="font-semibold">
            Terminal 1
          </SelectItem>
          {Object.entries(TORONTO_GATES)
            .filter(([key]) => key.startsWith("T1"))
            .map(([key]) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          <SelectItem value="terminal3" disabled className="font-semibold">
            Terminal 3
          </SelectItem>
          {Object.entries(TORONTO_GATES)
            .filter(([key]) => key.startsWith("T3"))
            .map(([key]) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Time Slider */}
      <div
        className={`flex items-center gap-2 ${isLightTheme ? "bg-gray-200" : "bg-gray-800"} px-3 py-1.5 rounded-md min-w-[220px]`}
      >
        <Clock className="h-4 w-4 shrink-0" />
        <Slider value={[time]} max={720} step={30} className="w-[100px]" onValueChange={handleTimeChange} />
        <span className="text-sm whitespace-nowrap">
          {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")} hrs
        </span>
      </div>

      {/* Satellite View Toggle */}
      <div className={`flex items-center gap-2 ${isLightTheme ? "bg-gray-200" : "bg-gray-800"} px-3 py-1.5 rounded-md`}>
        <span className="text-sm">Map View</span>
        <Switch
          checked={satelliteView}
          onCheckedChange={handleSatelliteViewChange}
          aria-label="Toggle satellite view"
        />
      </div>

      {/* Display Mode */}
      <ToggleGroup type="single" value={displayMode} onValueChange={handleDisplayModeChange}>
        <ToggleGroupItem value="map" aria-label="Map View">
          Map
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List View">
          List
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
