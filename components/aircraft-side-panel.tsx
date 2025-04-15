"use client"

import { useEffect, useState } from "react"
import { X, Plane, Calendar, Clock, ArrowRight, MapPin, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTheme } from "@/components/theme-provider"
import AirCanadaPTSEventDrawer from "./pts-events"

interface AircraftSidePanelProps {
  aircraft: {
    id: string
    registration: string
    flightNumber: string
    type: string
    origin: string
    destination: string
    gate: string
    statuses: {
      OTP: string
      HEALTH: string
      OPS: string
      TCM: string
      MCC: string
      ATA: string
    }
    scheduledDeparture?: string
    estimatedDeparture?: string
  }
  open: boolean
  onClose: () => void
  pts : {}
}

export function AircraftSidePanel({ aircraft, open, onClose,pts }: AircraftSidePanelProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [showAlertPopup, setShowAlertPopup] = useState(false)
  const [showMessagePopup, setShowMessagePopup] = useState(false)
  const [showGridPopup, setShowGridPopup] = useState(false)
  const [passengerStatsDialogOpen, setPassengerStatsDialogOpen] = useState(false)
  
  
  const [localPts,setLocalPts] = useState({
    flightNumber: "AC45611",
    origin: "C-FSKP",
    status: {
      disruption: false,
      message: "No disruptions expected",
      level: "none" // none, low, medium, high
    },
    currentTime: new Date("2025-04-12T11:20:00"),
    ragSummary: {
      red: 2,
      amber: 3,
      green: 12,
    },
    categories: [
      {
        name: "Flight Movement",
        id: "flight-movement",
        icon: "plane",
        expanded: true,
        events: [
          {
            id: "arrival",
            name: "Arrival (STA)",
            scheduledStart: new Date("2025-04-12T08:30:00"),
            actualStart: new Date("2025-04-12T10:42:00"),
            isMilestone: true,
            status: "completed",
            progress: 100
          },
          {
            id: "parking",
            name: "Aircraft Parking",
            scheduledStart: new Date("2025-04-12T10:35:00"),
            actualStart: new Date("2025-04-12T10:47:00"),
            scheduledEnd: new Date("2025-04-12T10:45:00"),
            actualEnd: new Date("2025-04-12T10:55:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "pushback",
            name: "Pushback",
            scheduledStart: new Date("2025-04-12T12:20:00"),
            scheduledEnd: new Date("2025-04-12T12:25:00"),
            actualStart: new Date("2025-04-12T12:55:00"),
            actualEnd: null,
            status: "in-progress",
            progress: 50
          },
          {
            id: "departure",
            name: "Departure (STD)",
            scheduledStart: new Date("2025-04-12T12:30:00"),
            scheduledEnd: new Date("2025-04-12T13:50:00"),
            actualStart: null,
            actualEnd: null,
            isMilestone: true,
            status: "scheduled",
            progress: 0
          }
        ]
      },
      {
        name: "Passenger Flow",
        id: "passenger-flow",
        icon: "users",
        expanded: true,
        events: [
          {
            id: "disembarkation",
            name: "Disembarkation",
            scheduledStart: new Date("2025-04-12T10:40:00"),
            actualStart: new Date("2025-04-12T10:50:00"),
            scheduledEnd: new Date("2025-04-12T10:55:00"),
            actualEnd: new Date("2025-04-12T11:05:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "boarding",
            name: "Boarding",
            scheduledStart: new Date("2025-04-12T11:45:00"),
            scheduledEnd: new Date("2025-04-12T12:15:00"),
            actualStart: null,
            actualEnd: null,
            status: "scheduled",
            progress: 0
          }
        ]
      },
      {
        name: "Baggage Handling",
        id: "baggage",
        icon: "briefcase",
        expanded: true,
        events: [
          {
            id: "baggage-unloading",
            name: "Baggage Unloading",
            scheduledStart: new Date("2025-04-12T10:40:00"),
            actualStart: new Date("2025-04-12T10:52:00"),
            scheduledEnd: new Date("2025-04-12T10:55:00"),
            actualEnd: new Date("2025-04-12T11:12:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "baggage-loading",
            name: "Baggage Loading",
            scheduledStart: new Date("2025-04-12T11:30:00"),
            scheduledEnd: new Date("2025-04-12T12:00:00"),
            actualStart: null,
            actualEnd: null,
            status: "scheduled",
            progress: 0
          }
        ]
      },
      {
        name: "Servicing",
        id: "servicing",
        icon: "coffee",
        expanded: true,
        events: [
          {
            id: "cleaning",
            name: "Cleaning",
            scheduledStart: new Date("2025-04-12T10:50:00"),
            scheduledEnd: new Date("2025-04-12T11:20:00"),
            actualStart: new Date("2025-04-12T11:00:00"),
            actualEnd: new Date("2025-04-12T11:30:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "refueling",
            name: "Refueling",
            scheduledStart: new Date("2025-04-12T11:00:00"),
            scheduledEnd: new Date("2025-04-12T11:30:00"),
            actualStart: new Date("2025-04-12T11:05:00"),
            actualEnd: null,
            status: "in-progress",
            progress: 80
          },
          {
            id: "catering-load",
            name: "Catering Load",
            scheduledStart: new Date("2025-04-12T11:15:00"),
            scheduledEnd: new Date("2025-04-12T11:45:00"),
            actualStart: new Date("2025-04-12T11:25:00"),
            actualEnd: null,
            status: "in-progress",
            progress: 40
          }
        ]
      },
      {
        name: "Ops & Safety",
        id: "ops-safety",
        icon: "wrench",
        expanded: true,
        events: [
          {
            id: "cabin-ready-check",
            name: "Cabin Ready Check",
            scheduledStart: new Date("2025-04-12T12:10:00"),
            scheduledEnd: null,
            actualStart: null,
            actualEnd: null,
            isMilestone: true,
            status: "scheduled",
            progress: 0
          },
          {
            id: "load-sheet",
            name: "Load Sheet Finalized",
            scheduledStart: new Date("2025-04-12T12:15:00"),
            scheduledEnd: null,
            actualStart: null,
            actualEnd: null,
            isMilestone: true,
            status: "scheduled",
            progress: 0
          }
        ]
      },
      {
        name: "Final Departure Prep",
        id: "departure-prep",
        icon: "clipboard",
        expanded: true,
        events: [
          {
            id: "door-close",
            name: "Door Close",
            scheduledStart: new Date("2025-04-12T12:15:00"),
            scheduledEnd: null,
            actualStart: null,
            actualEnd: null,
            isMilestone: true,
            status: "scheduled",
            progress: 0
          },
          {
            id: "pushback-start",
            name: "Pushback Start",
            scheduledStart: new Date("2025-04-12T19:20:00"),
            scheduledEnd: null,
            actualStart: null,
            actualEnd: null,
            isMilestone: true,
            status: "scheduled",
            progress: 0
          }
        ]
      }
    ]
  })

  const { theme, mounted } = useTheme()
  const isLightTheme = mounted && theme === "light"

  if (!open) return null

  // Calculate turnaround progress (mock data)
  const turnaroundProgress = 65 // 65% complete

  // Mock scheduled times
  const scheduledDeparture = "14:45"
  const estimatedDeparture = "14:55"
  const boardingTime = "14:15"
  const doorClosureTime = "14:35"

  // Mock turnaround activities with status
  const turnaroundActivities = [
    { name: "Deboarding", status: "completed", startTime: "12:30", endTime: "12:45" },
    { name: "Cleaning", status: "completed", startTime: "12:45", endTime: "13:15" },
    { name: "Catering", status: "completed", startTime: "13:00", endTime: "13:30" },
    { name: "Fueling", status: "in-progress", startTime: "13:15", endTime: "13:45" },
    { name: "Baggage Loading", status: "in-progress", startTime: "13:30", endTime: "14:00" },
    { name: "Boarding", status: "scheduled", startTime: "14:15", endTime: "14:35" },
    { name: "Final Checks", status: "scheduled", startTime: "14:35", endTime: "14:45" },
  ]

  // Mock crew information
  const crewInfo = {
    captain: "John Smith",
    firstOfficer: "Sarah Johnson",
    cabinCrew: 5,
    reportingTime: "13:15",
    status: "On Duty",
  }

  // Mock passenger information
  const passengerInfo = {
    total: 178,
    boarded: 0,
    business: 24,
    economy: 154,
    specialAssistance: 3,
    connectingFlights: 42,
  }

  // Mock baggage information
  const baggageInfo = {
    total: 143,
    loaded: 28,
    transferBags: 37,
    oversized: 5,
  }

  // Mock date for display
  const today = new Date()
  const dateString = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Update flight data when ptsEvent changes
  useEffect(() => {
    if (pts) {
      setLocalPts(pts);
    }
  }, [pts]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700';
      case 'delayed':
        return 'bg-yellow-50 text-yellow-700';
      case 'critical':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[500px] ${
        isLightTheme
          ? "bg-white border-l border-gray-200 shadow-xl"
          : "bg-gray-900/95 border-l border-gray-700 shadow-xl"
      } z-40 overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-5 ${
          isLightTheme ? "border-b border-gray-200" : "border-b border-gray-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`${isLightTheme ? "bg-blue-50 text-blue-600" : "bg-blue-900/50 text-blue-400"} p-2 rounded-full`}
          >
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <h2
              className={`text-xl font-semibold ${
                isLightTheme ? "text-gray-900" : "text-white"
              } flex items-center gap-2`}
            >
              {aircraft.registration}
              <span className={`text-sm font-normal ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>
                ({aircraft.type})
              </span>
            </h2>
            <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
              Flight {aircraft.flightNumber}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={`${
            isLightTheme
              ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <div className={`px-4 ${isLightTheme ? "border-b border-gray-200" : "border-b border-gray-800"}`}>
          <TabsList
            className={`${isLightTheme ? "bg-gray-50" : "bg-gray-800/50"} w-full justify-start gap-2 p-1 h-auto mt-2`}
          >
            <TabsTrigger
              value="details"
              className={`data-[state=active]:${
                isLightTheme ? "bg-blue-50 text-blue-700" : "bg-blue-900/30 text-blue-400"
              } rounded-md px-4 py-2`}
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className={`data-[state=active]:${
                isLightTheme ? "bg-blue-50 text-blue-700" : "bg-blue-900/30 text-blue-400"
              } rounded-md px-4 py-2`}
            >
              Status
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={`data-[state=active]:${
                isLightTheme ? "bg-blue-50 text-blue-700" : "bg-blue-900/30 text-blue-400"
              } rounded-md px-4 py-2`}
            >
              History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Details Tab */}
        <TabsContent value="details" className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Flight Information */}
          <div
            className={`${
              isLightTheme ? "bg-gray-50 border border-gray-200 shadow-sm" : "bg-gray-800/50"
            } rounded-lg p-5 space-y-4`}
          >
            <h3 className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"} mb-4`}>
              Flight Information
            </h3>

            <div className="space-y-4">
  {/* Top Static Aircraft Info */}
  <div className="grid grid-cols-3 gap-6">
    <div>
      <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Aircraft Type</p>
      <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
        {aircraft.type}
      </p>
    </div>
    <div>
      <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Registration</p>
      <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
        {aircraft.registration}
      </p>
    </div>
    <div>
      <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Gate</p>
      <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
        {aircraft.gate}
      </p>
    </div>
  </div>

  {/* Accordion Full Width */}
  <Accordion type="single" collapsible className="w-full">
    {/* Inbound Accordion */}
    <AccordionItem value="item-1" className={isLightTheme ? "border-gray-200" : "border-gray-700"}>
      <AccordionTrigger
        className={`py-3 ${
          isLightTheme ? "text-gray-900 hover:text-gray-900 hover:bg-gray-50" : "text-white hover:text-white"
        } hover:no-underline`}
      >
        <div className="flex items-center gap-3">
          <span>Inbound</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">
        <div className="space-y-3 pl-2">
          <div>
            <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Inbound Flight Number</p>
            <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
              {aircraft.flightNumber}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Route</p>
            <div className={`flex items-center gap-2 text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
              <span>{aircraft.destination}</span>
              <ArrowRight className={`h-4 w-4 ${isLightTheme ? "text-gray-400" : "text-gray-500"}`} />
              <span>{aircraft.origin}</span>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Scheduled Arrival</p>
              <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                {aircraft.scheduledDeparture || "14:30"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Actual Arrival</p>
              <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                {aircraft.estimatedDeparture || "14:45"}
              </p>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>

    {/* Outbound Accordion */}
    <AccordionItem value="item-2" className={isLightTheme ? "border-gray-200" : "border-gray-700"}>
      <AccordionTrigger
        className={`py-3 ${
          isLightTheme ? "text-gray-900 hover:text-gray-900 hover:bg-gray-50" : "text-white hover:text-white"
        } hover:no-underline`}
      >
        <div className="flex items-center gap-3">
          <span>Outbound</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">
        <div className="space-y-3 pl-2">
          <div>
            <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Outbound Flight Number</p>
            <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
              {"AC131"}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Route</p>
            <div className={`flex items-center gap-2 text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
              <span>{aircraft.origin}</span>
              <ArrowRight className={`h-4 w-4 ${isLightTheme ? "text-gray-400" : "text-gray-500"}`} />
              <span>{'YYC'}</span>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Scheduled Departure</p>
              <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                {aircraft.scheduledDeparture || "15:30"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"} mb-1`}>Estimated Departure</p>
              <p className={`text-base font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                {aircraft.estimatedDeparture || "15:45"}
              </p>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>

          </div>

          {/* Turnaround Status */}
          <div
            className={`${
              isLightTheme ? "bg-gray-50 border border-gray-200 shadow-sm" : "bg-gray-800/50"
            } rounded-lg p-5`}
          >
            <h3 className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"} mb-4`}>
              Turnaround Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isLightTheme ? "text-gray-700" : "text-gray-300"}`}>Fueling</span>
                <span
                  className={`px-3 py-1 ${
                    isLightTheme ? getStatusColor(localPts?.categories[3].events[1].status) : "bg-green-600/20 text-green-400"
                  } text-xs font-medium rounded-full`}
                >
                  {localPts?.categories[3].events[1].status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isLightTheme ? "text-gray-700" : "text-gray-300"}`}>Catering</span>
                <span
                  className={`px-3 py-1 ${
                    isLightTheme ? getStatusColor(localPts?.categories[3].events[2].status) : "bg-yellow-600/20 text-yellow-400"
                  } text-xs font-medium rounded-full`}
                >
                  {localPts?.categories[3].events[2].status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isLightTheme ? "text-gray-700" : "text-gray-300"}`}>Cleaning</span>
                <span
                  className={`px-3 py-1 ${
                    isLightTheme ? getStatusColor(localPts?.categories[3].events[0].status) : "bg-green-600/20 text-green-400"
                  } text-xs font-medium rounded-full`}
                >
                  {localPts?.categories[3].events[0].status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isLightTheme ? "text-gray-700" : "text-gray-300"}`}>Baggage Unloading</span>
                <span
                  className={`px-3 py-1 ${
                    isLightTheme ? getStatusColor(localPts?.categories[2].events[0].status) : "bg-yellow-600/20 text-yellow-400"
                  } text-xs font-medium rounded-full`}
                >
                  {localPts?.categories[2].events[0].status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isLightTheme ? "text-gray-700" : "text-gray-300"}`}>Baggage Loading</span>
                <span
                  className={`px-3 py-1 ${
                    isLightTheme ? getStatusColor(localPts?.categories[2].events[1].status) : "bg-yellow-600/20 text-yellow-400"
                  } text-xs font-medium rounded-full`}
                >
                  {localPts?.categories[2].events[1].status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isLightTheme ? "text-gray-700" : "text-gray-300"}`}>Boarding</span>
                <span
                  className={`px-3 py-1 ${
                    isLightTheme ? getStatusColor(localPts?.categories[1].events[1].status)  : "bg-gray-600/20 text-gray-400"
                  } text-xs font-medium rounded-full`}
                >
                  {localPts?.categories[1].events[1].status}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="flex-1 overflow-y-auto p-5 space-y-6">
          <div
            className={`${
              isLightTheme ? "bg-gray-50 border border-gray-200 shadow-sm" : "bg-gray-800/50"
            } rounded-lg p-5`}
          >
            <h3 className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"} mb-4`}>
              Status Indicators
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`${
                  isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900/70"
                } p-4 rounded-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                    On-Time Performance
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      aircraft.statuses.OTP === "green" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></span>
                </div>
                <p className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                  {aircraft.statuses.OTP === "green" ? "On Time" : "Delayed"}
                </p>
              </div>
              <div
                className={`${
                  isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900/70"
                } p-4 rounded-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>Health Status</span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      aircraft.statuses.HEALTH === "green" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></span>
                </div>
                <p className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                  {aircraft.statuses.HEALTH === "green" ? "Normal" : "Attention Required"}
                </p>
              </div>
              <div
                className={`${
                  isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900/70"
                } p-4 rounded-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>Operations</span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      aircraft.statuses.OPS === "green" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></span>
                </div>
                <p className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                  {aircraft.statuses.OPS === "green" ? "Normal" : "Attention Required"}
                </p>
              </div>
              <div
                className={`${
                  isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900/70"
                } p-4 rounded-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                    Turnaround Control
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      aircraft.statuses.TCM === "green" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></span>
                </div>
                <p className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                  {aircraft.statuses.TCM === "green" ? "On Schedule" : "Delayed"}
                </p>
              </div>
              <div
                className={`${
                  isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900/70"
                } p-4 rounded-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                    Maintenance Control
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      aircraft.statuses.MCC === "green" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></span>
                </div>
                <p className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                  {aircraft.statuses.MCC === "green" ? "No Issues" : "Maintenance Required"}
                </p>
              </div>
              <div
                className={`${
                  isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900/70"
                } p-4 rounded-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>ATA Status</span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      aircraft.statuses.ATA === "green" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></span>
                </div>
                <p className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                  {aircraft.statuses.ATA === "green" ? "On Time" : "Delayed"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-y-auto p-5">
          <div
            className={`${
              isLightTheme ? "bg-gray-50 border border-gray-200 shadow-sm" : "bg-gray-800/50"
            } rounded-lg p-5`}
          >
            <h3 className={`text-lg font-medium ${isLightTheme ? "text-gray-900" : "text-white"} mb-4`}>
              Flight History
            </h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className={isLightTheme ? "border-gray-200" : "border-gray-700"}>
                <AccordionTrigger
                  className={`py-3 ${
                    isLightTheme ? "text-gray-900 hover:text-gray-900 hover:bg-gray-50" : "text-white hover:text-white"
                  } hover:no-underline`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-4 w-4 ${isLightTheme ? "text-blue-600" : "text-blue-400"}`} />
                    <span>Today</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3 pl-7">
                    <div className="flex items-center gap-3">
                      <Clock className={`h-4 w-4 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`} />
                      <div>
                        <p className={`text-sm ${isLightTheme ? "text-gray-900" : "text-white"}`}>AC 456 YYZ → YVR</p>
                        <p className={`text-xs ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                          Departed 08:45, Arrived 11:30
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className={`h-4 w-4 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`} />
                      <div>
                        <p className={`text-sm ${isLightTheme ? "text-gray-900" : "text-white"}`}>AC 457 YVR → YYZ</p>
                        <p className={`text-xs ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                          Departed 12:45, Arrived 15:30
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className={isLightTheme ? "border-gray-200" : "border-gray-700"}>
                <AccordionTrigger
                  className={`py-3 ${
                    isLightTheme ? "text-gray-900 hover:text-gray-900 hover:bg-gray-50" : "text-white hover:text-white"
                  } hover:no-underline`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-4 w-4 ${isLightTheme ? "text-blue-600" : "text-blue-400"}`} />
                    <span>Yesterday</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-3 pl-7">
                    <div className="flex items-center gap-3">
                      <Clock className={`h-4 w-4 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`} />
                      <div>
                        <p className={`text-sm ${isLightTheme ? "text-gray-900" : "text-white"}`}>AC 123 YYZ → YUL</p>
                        <p className={`text-xs ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                          Departed 07:30, Arrived 08:45
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className={`h-4 w-4 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`} />
                      <div>
                        <p className={`text-sm ${isLightTheme ? "text-gray-900" : "text-white"}`}>AC 124 YUL → YYZ</p>
                        <p className={`text-xs ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                          Departed 09:30, Arrived 10:45
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className={`h-4 w-4 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`} />
                      <div>
                        <p className={`text-sm ${isLightTheme ? "text-gray-900" : "text-white"}`}>AC 789 YYZ → YYC</p>
                        <p className={`text-xs ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>
                          Departed 14:15, Arrived 16:45
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div
        className={`p-4 ${isLightTheme ? "border-t border-gray-200" : "border-t border-gray-800"} flex justify-between`}
      >
        <Button
          variant="outline"
          size="sm"
          className={`${
            isLightTheme
              ? "text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              : "text-gray-300 border-gray-700 hover:bg-gray-800"
          }`}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Track
        </Button>
        <Button
          onClick={() => setPassengerStatsDialogOpen(true)}
          variant="outline"
          size="sm"
          className={`${
            isLightTheme
              ? "text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              : "text-gray-300 border-gray-700 hover:bg-gray-800"
          }`}
        >
          <BarChart2 className="h-4 w-4 mr-2" />
          PTS Events
        </Button>
      </div>
      <AirCanadaPTSEventDrawer
          open={passengerStatsDialogOpen} // Set to true to always show it, or use a state variable
          onOpenChange={(isOpen) => {
            setPassengerStatsDialogOpen(isOpen);
            // Handle close event if needed
            console.log("Modal open state changed to:", isOpen);
          }}
          ptsEvent={localPts}
          vehicleId='GSE1016'
        />
    </div>
  )
}
