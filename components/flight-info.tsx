"use client"
import { useEffect, useState } from "react"
import { Plane, AlertCircle, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { fetchFlightsByLocation } from "@/services/flight-api"

interface FlightInfoProps {
  flightId: string
  open: boolean
  onClose: () => void
}

export default function FlightInfo({ flightId, open, onClose }: FlightInfoProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flightData, setFlightData] = useState<any>(null)

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
            departureTime: "N/A", // API doesn't provide scheduled times
            arrivalTime: "N/A",
            status: getFlightStatus(flight),
            aircraft: flight.t || flight.desc || "Unknown",
            gate: "N/A", // API doesn't provide gate information
            altitude: flight.alt_baro || "N/A",
            speed: flight.gs || flight.speed || "N/A",
            heading: flight.track || flight.dir || "N/A",
            squawk: flight.squawk || "N/A",
            registration: flight.r || "N/A",
            airline: flight.airline_icao || flight.airline_iata || extractAirlineFromFlight(flight.flight || ""),
            passengers: "N/A", // Not available from API
            crew: "N/A", // Not available from API
            fuel: "N/A", // Not available from API
            maintenance: [{ id: 1, issue: "Routine Check", status: "Scheduled", priority: "low" }],
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

    if (open) {
      loadFlightData()
    }

    return () => {
      isMounted = false
    }
  }, [flightId, open])

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

  if (!flightData && !loading && !error) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            {loading ? (
              "Loading flight details..."
            ) : error ? (
              `Error: ${error}`
            ) : (
              <>
                Flight {flightData.number} Details
                <Badge
                  variant={
                    flightData.status === "In Air"
                      ? "default"
                      : flightData.status === "Unknown"
                        ? "destructive"
                        : "secondary"
                  }
                  className="ml-2"
                >
                  {flightData.status}
                </Badge>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-center">Loading flight information...</div>
        ) : error ? (
          <div className="py-6 text-center text-destructive">{error}</div>
        ) : (
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Flight Info</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Origin</p>
                  <p className="text-lg font-semibold">{flightData.origin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destination</p>
                  <p className="text-lg font-semibold">{flightData.destination}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aircraft</p>
                  <p className="text-lg font-semibold">{flightData.aircraft}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registration</p>
                  <p className="text-lg font-semibold">{flightData.registration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Airline</p>
                  <p className="text-lg font-semibold">{flightData.airline}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Altitude</p>
                  <p className="text-lg font-semibold">{flightData.altitude} ft</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Speed</p>
                  <p className="text-lg font-semibold">{flightData.speed} kts</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Heading</p>
                  <p className="text-lg font-semibold">{flightData.heading}°</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Squawk</p>
                  <p className="text-lg font-semibold">{flightData.squawk}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="space-y-4 py-4">
                <div className="text-center text-muted-foreground italic">
                  Maintenance data not available from live API
                </div>
                {flightData.maintenance.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-md border p-3">
                    {item.status === "Completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle
                        className={`h-5 w-5 ${item.priority === "high" ? "text-red-500" : "text-amber-500"}`}
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.issue}</p>
                      <p className="text-sm text-muted-foreground">Status: {item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
