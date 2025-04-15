"use client"

import { useEffect, useState } from "react"
import { Search, Filter, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchFlightsByLocation } from "@/services/flight-api"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Default location for fetching flights
const DEFAULT_LOCATION = {
  lat: 43.6532,
  lng: -79.3832,
  radius: 250, // radius in nautical miles
}

interface FlightDataPanelProps {
  onSelectFlight: (flightId: string) => void
}

export default function FlightDataPanel({ onSelectFlight }: FlightDataPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState({
    totalFlights: 0,
    onTime: 0,
    delayed: 0,
    cancelled: 0,
    onTimePerformance: "0%",
    averageDelay: "0 min",
  })
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  // Fetch flight data
  useEffect(() => {
    let isMounted = true

    const loadFlightData = async () => {
      // Throttle API requests to avoid rate limiting
      const now = Date.now()
      if (now - lastFetchTime < 5000) {
        // Don't fetch more than once every 5 seconds
        return
      }

      try {
        setLoading(true)
        setLastFetchTime(now)

        const data = await fetchFlightsByLocation(DEFAULT_LOCATION)

        if (isMounted) {
          // Convert API data to our app format
          const appFlights = data.ac
            .filter((flight) => flight.lat && flight.lon) // Only include flights with position data
            .map((flight) => ({
              id: flight.hex,
              flightNumber: flight.flight ? flight.flight.trim() : flight.hex,
              origin: flight.dep_icao || flight.dep_iata || "Unknown",
              destination: flight.arr_icao || flight.arr_iata || "Unknown",
              status: getFlightStatus(flight),
              departure: "N/A", // API doesn't provide scheduled times
              arrival: "N/A",
              aircraft: flight.t || "Unknown",
              gate: "N/A", // API doesn't provide gate information
              altitude: flight.alt_baro || 0,
              speed: flight.gs || flight.speed || 0,
              airline: flight.airline_icao || flight.airline_iata || extractAirlineFromFlight(flight.flight || ""),
            }))

          setFlights(appFlights)

          // Calculate metrics
          const total = appFlights.length
          const onTime = appFlights.filter((f) => f.status === "In Air").length
          const delayed = appFlights.filter((f) => f.status === "Delayed").length
          const cancelled = 0 // API doesn't provide this info

          setMetrics({
            totalFlights: total,
            onTime,
            delayed,
            cancelled,
            onTimePerformance: total ? `${Math.round((onTime / total) * 100)}%` : "0%",
            averageDelay: "N/A", // API doesn't provide this info
          })

          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load flight data")
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Load initial data
    loadFlightData()

    // Set up interval to refresh data
    const interval = setInterval(loadFlightData, 30000) // Refresh every 30 seconds

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [lastFetchTime])

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

  // Filter flights based on search term and status filter
  const filteredFlights = flights.filter((flight) => {
    const matchesSearch =
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || flight.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      setLoading(true)
      setLastFetchTime(Date.now())

      const data = await fetchFlightsByLocation(DEFAULT_LOCATION)

      // Convert API data to our app format
      const appFlights = data.ac
        .filter((flight) => flight.lat && flight.lon)
        .map((flight) => ({
          id: flight.hex,
          flightNumber: flight.flight ? flight.flight.trim() : flight.hex,
          origin: flight.dep_icao || flight.dep_iata || "CYYZ",
          destination: flight.arr_icao || flight.arr_iata || "Unknown",
          status: getFlightStatus(flight),
          departure: "N/A",
          arrival: "N/A",
          aircraft: flight.t || "Unknown",
          gate: "N/A",
          altitude: flight.alt_baro || 0,
          speed: flight.gs || flight.speed || 0,
          airline: flight.airline_icao || flight.airline_iata || extractAirlineFromFlight(flight.flight || ""),
        }))

      setFlights(appFlights)
      setError(null)
    } catch (err) {
      setError("Failed to refresh flight data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Flight Operations</h2>
      </div>

      <Tabs defaultValue="flights" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 justify-start">
          <TabsTrigger value="flights">Flights</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="flex-1 flex flex-col p-4 pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search flights..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in air">In Air</SelectItem>
                <SelectItem value="landing/takeoff">Landing/Takeoff</SelectItem>
                <SelectItem value="climbing/descending">Climbing/Descending</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" title="Refresh" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="space-y-2 overflow-auto flex-1">
            {loading && filteredFlights.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading flight data...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-destructive">
                {error}
                <Button size="sm" onClick={handleRefresh} className="ml-2">
                  Try Again
                </Button>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No flights match your search criteria
              </div>
            ) : (
              filteredFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="p-3 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => onSelectFlight(flight.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{flight.flightNumber}</div>
                    <Badge
                      variant={
                        flight.status === "In Air"
                          ? "default"
                          : flight.status === "Unknown"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {flight.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="font-semibold">
                        {flight.origin} → {flight.destination}
                      </div>
                      <div className="text-muted-foreground">
                        {flight.aircraft} • Alt: {Math.round(flight.altitude)} ft
                      </div>
                    </div>
                    <div className="text-right">
                      <div>Speed: {Math.round(flight.speed)} kts</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="flex-1 p-4 pt-2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Flights</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{metrics.totalFlights}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{metrics.onTimePerformance}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className={cn(isDark ? "bg-green-900/20" : "bg-green-50")}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                  In Air
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">{metrics.onTime}</div>
              </CardContent>
            </Card>
            <Card className={cn(isDark ? "bg-amber-900/20" : "bg-amber-50")}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-amber-500" />
                  Other Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">{metrics.delayed}</div>
              </CardContent>
            </Card>
            <Card className={cn(isDark ? "bg-red-900/20" : "bg-red-50")}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                  Unknown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">{metrics.cancelled}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
