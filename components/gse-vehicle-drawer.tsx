"use client"

import {
  Activity,
  Clock,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Thermometer,
  BellRing,
  Battery,
  ClockIcon,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// Add these imports at the top of the file
import { useEffect, useState } from "react"
import type { GSEVehicle } from "@/services/gse-vehicle-api"
import { gseVehicleDetailWebSocket } from "@/services/gse-vehicle-api"
import { useTheme } from "@/components/theme-provider"

// Update the GSEVehicleDrawerProps interface
interface GSEVehicleDrawerProps {
  vehicleId: string | null
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  onClose?: () => void
  liveVehicles?: GSEVehicle[] // Add this line
}

interface GSEVehicleData {
  id: string
  type: string
  assetTag: string
  vin: string
  location: string
  status: string
  lastUpdated: string
  powerType: string
  batteryLevel: number
  engineHours: number
  currentAssignment: {
    flight: string
    operator: string
    startTime: string
    endTime: string
    remainingTime: number
    conflictStatus: "none" | "warning" | "critical"
    conflictMessage?: string
  } | null
  upcomingAssignments: Array<{
    flight: string
    gate: string
    time: string
    duration: string
    status: "normal" | "warning" | "critical"
    statusMessage?: string
  }>
  // Add these new properties
  utilizationRate: number
  uptime: number
  avgUsagePerDay: number
  activeAlerts: Array<{
    type: "warning" | "error" | "info"
    message: string
    timestamp: string
  }>
  temperatures: {
    engine: number
    battery: number
    hydraulics: number
  }
}

// Mock data for GSE vehicles
const GSE_VEHICLES_DATA: Record<string, GSEVehicleData> = {
  GSE001: {
    id: "GSE001",
    type: "Baggage Tractor",
    assetTag: "AC-GSE-YYZ-BT-042",
    vin: "ACBT42YYZ2021T1",
    location: "Terminal 1 / Gate D32",
    status: "In Use",
    lastUpdated: "2 minutes ago",
    powerType: "Electric",
    batteryLevel: 68,
    engineHours: 3245,
    currentAssignment: {
      flight: "AC123",
      operator: "James Wilson",
      startTime: "08:30 AM",
      endTime: "10:15 AM",
      remainingTime: 22,
      conflictStatus: "warning",
      conflictMessage: "AC123 delayed by 15 minutes. May conflict with upcoming AC856 assignment at 12:30 PM.",
    },
    upcomingAssignments: [
      {
        flight: "AC856",
        gate: "D45",
        time: "12:30 PM",
        duration: "1.5h",
        status: "warning",
        statusMessage: "Current assignment delay may impact availability",
      },
      {
        flight: "AC791",
        gate: "E61",
        time: "3:15 PM",
        duration: "2h",
        status: "normal",
      },
      {
        flight: "AC1234",
        gate: "F64",
        time: "5:45 PM",
        duration: "1h",
        status: "critical",
        statusMessage: "Aircraft delayed, arrival conflicts with maintenance",
      },
    ],
    // Add the new data
    utilizationRate: 78,
    uptime: 97,
    avgUsagePerDay: 5.2,
    activeAlerts: [
      {
        type: "warning",
        message: "Rear right tire pressure low (27 PSI)",
        timestamp: "2024-04-16 09:30:12",
      },
      {
        type: "error",
        message: "Battery cell 3 degradation detected",
        timestamp: "2024-04-16 08:15:45",
      },
      {
        type: "info",
        message: "Firmware update available",
        timestamp: "2024-04-15 22:30:00",
      },
    ],
    temperatures: {
      engine: 65,
      battery: 42,
      hydraulics: 58,
    },
  },
  GSE002: {
    id: "GSE002",
    type: "Fuel Truck",
    assetTag: "AC-GSE-YYZ-FT-018",
    vin: "ACFT18YYZ2020T1",
    location: "Terminal 1 / Gate F53",
    status: "Idle",
    lastUpdated: "5 minutes ago",
    powerType: "Diesel",
    batteryLevel: 100,
    engineHours: 5678,
    currentAssignment: null,
    upcomingAssignments: [
      {
        flight: "AC456",
        gate: "F53",
        time: "11:45 AM",
        duration: "1h",
        status: "normal",
      },
      {
        flight: "AC789",
        gate: "D28",
        time: "2:30 PM",
        duration: "1h",
        status: "normal",
      },
    ],
    utilizationRate: 62,
    uptime: 99,
    avgUsagePerDay: 7.1,
    activeAlerts: [],
    temperatures: {
      engine: 72,
      battery: 38,
      hydraulics: 61,
    },
  },
  GSE003: {
    id: "GSE003",
    type: "Catering Truck",
    assetTag: "AC-GSE-YYZ-CT-027",
    vin: "ACCT27YYZ2022T1",
    location: "Terminal 1 / Gate E75",
    status: "In Use",
    lastUpdated: "10 minutes ago",
    powerType: "Electric",
    batteryLevel: 42,
    engineHours: 1876,
    currentAssignment: {
      flight: "AC567",
      operator: "Sarah Johnson",
      startTime: "09:15 AM",
      endTime: "10:30 AM",
      remainingTime: 37,
      conflictStatus: "none",
    },
    upcomingAssignments: [
      {
        flight: "AC890",
        gate: "E82",
        time: "11:15 AM",
        duration: "1h",
        status: "normal",
      },
    ],
    utilizationRate: 85,
    uptime: 95,
    avgUsagePerDay: 6.8,
    activeAlerts: [
      {
        type: "warning",
        message: "Refrigeration unit temperature fluctuating",
        timestamp: "2024-04-16 10:00:00",
      },
    ],
    temperatures: {
      engine: 58,
      battery: 45,
      hydraulics: 55,
    },
  },
  GSE004: {
    id: "GSE004",
    type: "Pushback Tug",
    assetTag: "AC-GSE-YYZ-PT-015",
    vin: "ACPT15YYZ2021T1",
    location: "Terminal 1 / Gate D41",
    status: "Maintenance",
    lastUpdated: "1 hour ago",
    powerType: "Diesel",
    batteryLevel: 100,
    engineHours: 4532,
    currentAssignment: null,
    upcomingAssignments: [
      {
        flight: "AC234",
        gate: "D41",
        time: "2:15 PM",
        duration: "45m",
        status: "warning",
        statusMessage: "Maintenance scheduled to complete at 1:30 PM",
      },
    ],
    utilizationRate: 55,
    uptime: 90,
    avgUsagePerDay: 4.5,
    activeAlerts: [
      {
        type: "error",
        message: "Hydraulic fluid leak detected",
        timestamp: "2024-04-15 16:45:00",
      },
    ],
    temperatures: {
      engine: 75,
      battery: 40,
      hydraulics: 68,
    },
  },
  GSE005: {
    id: "GSE005",
    type: "Passenger Bus",
    assetTag: "AC-GSE-YYZ-PB-008",
    vin: "ACPB08YYZ2019T1",
    location: "Remote Stand R22",
    status: "In Use",
    lastUpdated: "15 minutes ago",
    powerType: "Electric",
    batteryLevel: 53,
    engineHours: 8765,
    currentAssignment: {
      flight: "AC901",
      operator: "Michael Chen",
      startTime: "09:00 AM",
      endTime: "10:45 AM",
      remainingTime: 52,
      conflictStatus: "none",
    },
    upcomingAssignments: [
      {
        flight: "AC345",
        gate: "Remote Stand R15",
        time: "11:30 AM",
        duration: "1h",
        status: "normal",
      },
    ],
    utilizationRate: 92,
    uptime: 98,
    avgUsagePerDay: 8.2,
    activeAlerts: [],
    temperatures: {
      engine: 60,
      battery: 48,
      hydraulics: 52,
    },
  },
}

// Update the component function signature
export function GSEVehicleDrawer({
  vehicleId,
  drawerOpen,
  setDrawerOpen,
  onClose,
  liveVehicles = [],
}: GSEVehicleDrawerProps) {
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [liveVehicleData, setLiveVehicleData] = useState(null)
  const [vehicleDetailData, setVehicleDetailData] = useState<any>(null)
  const { theme } = useTheme()
  const isLightTheme = theme === "light"

  // Get vehicle data based on ID
  const vehicleData = vehicleId ? GSE_VEHICLES_DATA[vehicleId] || null : null

  // Find live vehicle data if available
  useEffect(() => {
    if (vehicleId && liveVehicles.length > 0) {
      const foundVehicle = liveVehicles.find((v) => v.id === vehicleId)
      if (foundVehicle) {
        setLiveVehicleData(foundVehicle)
        console.log("Found live vehicle data:", foundVehicle)
      } else {
        setLiveVehicleData(null)
      }
    } else {
      setLiveVehicleData(null)
    }
  }, [vehicleId, liveVehicles])

  // Connect to vehicle-specific WebSocket when drawer opens
  useEffect(() => {
    if (drawerOpen && vehicleId) {
      // Set up WebSocket callbacks
      gseVehicleDetailWebSocket.onMessage((data) => {
        console.log("Received vehicle detail data:", data)
        setVehicleDetailData(data)
      })

      gseVehicleDetailWebSocket.onConnect(() => {
        console.log(`Connected to vehicle ${vehicleId} WebSocket`)
      })

      gseVehicleDetailWebSocket.onError((error) => {
        console.error(`Vehicle ${vehicleId} WebSocket error:`, error)
      })

      // Connect to the vehicle-specific WebSocket
      gseVehicleDetailWebSocket.connect(vehicleId)
    }

    // Cleanup when drawer closes or component unmounts
    return () => {
      if (!drawerOpen) {
        gseVehicleDetailWebSocket.disconnect()
        setVehicleDetailData(null)
      }
    }
  }, [drawerOpen, vehicleId])

  // Count alerts
  useEffect(() => {
    if (vehicleData) {
      let alertCount = 0

      // Check current assignment for conflicts
      if (
        vehicleData.currentAssignment?.conflictStatus === "warning" ||
        vehicleData.currentAssignment?.conflictStatus === "critical"
      ) {
        alertCount++
      }

      // Check upcoming assignments for warnings or critical issues
      vehicleData.upcomingAssignments.forEach((assignment) => {
        if (assignment.status === "warning" || assignment.status === "critical") {
          alertCount++
        }
      })

      // Check battery level if electric
      if (vehicleData.powerType === "Electric" && vehicleData.batteryLevel < 30) {
        alertCount++
      }

      setAlerts(alertCount)
    }
  }, [vehicleData])

  // Update remaining time
  useEffect(() => {
    if (vehicleData?.currentAssignment) {
      setRemainingTime(vehicleData.currentAssignment.remainingTime)

      // Simulate countdown
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [vehicleData])

  // Display vehicle detail data if available
  useEffect(() => {
    if (vehicleDetailData) {
      console.log("VVVVVVehicle detail data updated:", vehicleDetailData)
      // You can update UI elements with this data
    }
  }, [vehicleDetailData])

  // if (!vehicleId || !vehicleData) return null
  if (!vehicleId || (!vehicleData && !liveVehicleData)) return null
  console.log(vehicleDetailData)

  const batteryLevel = vehicleDetailData?.power?.battery_level
  const formattedLevel = typeof batteryLevel === "number" ? batteryLevel.toFixed(1) : "89"
  const batteryBarColor =
    batteryLevel != null
      ? batteryLevel > 60
        ? isLightTheme
          ? "bg-green-600"
          : "bg-green-500"
        : batteryLevel > 30
          ? isLightTheme
            ? "bg-amber-600"
            : "bg-amber-500"
          : isLightTheme
            ? "bg-red-600"
            : "bg-red-500"
      : isLightTheme
        ? "bg-green-600"
        : "bg-green-500" // fallback if batteryLevel is null
  const batteryBarWidth = `${formattedLevel}%`

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-[500px] z-40 overflow-y-auto transition-transform duration-300 ease-in-out",
        isLightTheme ? "bg-white border-l border-gray-200" : "bg-black border-l border-gray-800",
        drawerOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 p-4 flex justify-between items-center",
          isLightTheme ? "bg-white border-b border-gray-200 shadow-sm" : "bg-black border-b border-gray-800",
        )}
      >
        <h2 className={cn("text-xl font-bold", isLightTheme ? "text-gray-900" : "text-white")}>
          {vehicleDetailData?.type} - {vehicleDetailData?.id}
        </h2>
        <button
          onClick={() => {
            setDrawerOpen(false)
            gseVehicleDetailWebSocket.disconnect()
            if (onClose) onClose()
          }}
          className={cn(
            "p-1 rounded-full",
            isLightTheme
              ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <X size={20} />
        </button>
      </div>

      <div className={cn("p-4 border-b", isLightTheme ? "border-gray-200" : "border-gray-800")}>
        <div className={cn("rounded-md p-4 mb-4", isLightTheme ? "bg-gray-50 border border-gray-200" : "bg-gray-900")}>
          <h3 className={cn("text-sm font-medium mb-3", isLightTheme ? "text-gray-600" : "text-gray-400")}>
            Basic Information
          </h3>

          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className={isLightTheme ? "text-gray-600" : "text-gray-400"}>Equipment Type</div>
            <div className={isLightTheme ? "text-gray-900" : "text-white"}>
              {vehicleDetailData?.type ?? "Lavatory Service"}
            </div>

            <div className={isLightTheme ? "text-gray-600" : "text-gray-400"}>GSE ID / Asset Tag</div>
            <div className={cn("font-mono", isLightTheme ? "text-gray-900" : "text-white")}>
              {vehicleDetailData?.id ?? "GSE1019"}
            </div>

            <div className={isLightTheme ? "text-gray-600" : "text-gray-400"}>VIN</div>
            <div className={cn("font-mono", isLightTheme ? "text-gray-900" : "text-white")}>
              {vehicleDetailData?.vehicle_info?.vin ?? "5TDBT1111C1001019"}
            </div>

            <div className={isLightTheme ? "text-gray-600" : "text-gray-400"}>Current Location</div>
            <div className={isLightTheme ? "text-gray-900" : "text-white"}>{`Remote Stand R22`}</div>

            <div className={isLightTheme ? "text-gray-600" : "text-gray-400"}>Status</div>
            <div className="flex items-center">
              <span className={isLightTheme ? "text-gray-900" : "text-white"}>
                {vehicleDetailData?.status?.state ?? "active"}
              </span>
              <span className={cn("text-xs ml-2", isLightTheme ? "text-gray-500" : "text-gray-500")}>
                Updated: {vehicleDetailData?.timestamp.split(".")[0].replace("T", " ")}
              </span>
            </div>

            <div className={isLightTheme ? "text-gray-600" : "text-gray-400"}>Power Type</div>
            <div className={isLightTheme ? "text-gray-900" : "text-white"}>{vehicleDetailData?.power_type}</div>
          </div>
        </div>

        <div className="flex gap-3">
          {/*<Button variant="outline" className="flex-1 border-gray-700 bg-gray-800 hover:bg-gray-700">
            <MapPin size={16} className="mr-2" />
            Locate on Map
          </Button>*/}
          <Button
            variant={isLightTheme ? "outline" : "outline"}
            className={cn(
              "flex-1",
              isLightTheme
                ? "border-gray-300 bg-white hover:bg-gray-50"
                : "border-gray-700 bg-gray-800 hover:bg-gray-700",
            )}
          >
            <BellRing size={16} className="mr-2" />
            Alerts ({alerts})
          </Button>
        </div>
      </div>

      <div className={cn("p-4 border-b", isLightTheme ? "border-gray-200" : "border-gray-800")}>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={cn("rounded-md p-4", isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900")}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className={cn("text-sm font-medium", isLightTheme ? "text-gray-600" : "text-gray-400")}>
                Battery Level
              </h3>
              <Battery size={16} className={isLightTheme ? "text-gray-600" : "text-gray-400"} />
            </div>
            <div className={cn("text-2xl font-bold mb-2", isLightTheme ? "text-gray-900" : "text-white")}>
              {formattedLevel > 0 ? `${formattedLevel}%` : 'N/A'}
            </div>
            <div className={cn("w-full rounded-full h-2", isLightTheme ? "bg-gray-200" : "bg-gray-700")}>
              <div className={cn("h-2 rounded-full", batteryBarColor)} style={{ width: batteryBarWidth }}></div>
            </div>
          </div>

          <div
            className={cn("rounded-md p-4", isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-gray-900")}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className={cn("text-sm font-medium", isLightTheme ? "text-gray-600" : "text-gray-400")}>
                Engine Hours
              </h3>
              <ClockIcon size={16} className={isLightTheme ? "text-gray-600" : "text-gray-400"} />
            </div>
            <div className={cn("text-2xl font-bold", isLightTheme ? "text-gray-900" : "text-white")}>
              {vehicleDetailData?.time?.engine_hours?.toLocaleString() ?? 1437}
            </div>
          </div>
        </div>
      </div>
      {/*}
      {vehicleData.currentAssignment && (
        <div className="p-4 border-b border-gray-800">
          <div className="bg-gray-900 rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-400">Current Assignment</h3>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">Conflict Status:</span>
                <span
                  className={cn(
                    "inline-block w-3 h-3 rounded-full",
                    vehicleData.currentAssignment.conflictStatus === "warning"
                      ? "bg-amber-500"
                      : vehicleData.currentAssignment.conflictStatus === "critical"
                        ? "bg-red-500"
                        : "bg-green-500",
                  )}
                ></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
              <div className="text-gray-400">Flight</div>
              <div className="text-blue-400 font-medium">{vehicleData.currentAssignment.flight}</div>

              <div className="text-gray-400">Operator</div>
              <div className="text-white">{vehicleData.currentAssignment.operator}</div>

              <div className="text-gray-400">Since</div>
              <div className="text-white">{vehicleData.currentAssignment.startTime}</div>

              <div className="text-gray-400">Until</div>
              <div className="text-white">{vehicleData.currentAssignment.endTime}</div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Time Remaining:</span>
                <span className="text-sm text-amber-400 font-medium">{remainingTime} min</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{
                    width: `${((remainingTime || 0) / (vehicleData.currentAssignment.remainingTime || 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {vehicleData.currentAssignment.conflictMessage && (
              <div className="mt-3 p-3 bg-amber-900/30 border border-amber-700/50 rounded-md">
                <p className="text-xs text-amber-300">
                  <span className="font-medium">Potential Conflict:</span>{" "}
                  {vehicleData.currentAssignment.conflictMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
        */}

      <div className={cn("p-4", isLightTheme ? "" : "")}>
        <h3 className={cn("text-sm font-medium mb-3", isLightTheme ? "text-gray-600" : "text-gray-400")}>
          Upcoming Assignments
        </h3>
        {/*
        {vehicleData.upcomingAssignments.length > 0 ? (
          <div className="space-y-3">
            {vehicleData.upcomingAssignments.map((assignment, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-md",
                  assignment.status === "normal"
                    ? "bg-gray-900"
                    : assignment.status === "warning"
                      ? "bg-amber-900/30 border border-amber-700/50"
                      : "bg-red-900/30 border border-red-700/50",
                )}
              >
                <div className="flex items-center mb-1">
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full mr-2",
                      assignment.status === "normal"
                        ? "bg-green-500"
                        : assignment.status === "warning"
                          ? "bg-amber-500"
                          : "bg-red-500",
                    )}
                  ></span>
                  <span className="text-blue-400 font-medium">{assignment.flight}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">
                    Gate {assignment.gate} · {assignment.time}
                  </div>
                  <div className="text-white font-medium">{assignment.duration}</div>
                </div>

                {assignment.statusMessage && (
                  <p
                    className={cn("text-xs mt-1", assignment.status === "warning" ? "text-amber-300" : "text-red-300")}
                  >
                    {assignment.statusMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-md p-4 flex items-center justify-center">
            <span className="text-gray-400">No upcoming assignments</span>
          </div>*/}
      </div>
      <div className={cn("p-4 border-t", isLightTheme ? "border-gray-200" : "border-gray-800")}>
        <div className="space-y-2">
          {/* Overview Accordion */}
          <div
            className={cn(
              "rounded-md overflow-hidden",
              isLightTheme ? "bg-gray-50 border border-gray-200" : "bg-gray-900",
            )}
          >
            <button
              className={cn(
                "w-full px-4 py-3 flex justify-between items-center text-left",
                isLightTheme ? "hover:bg-gray-100 transition-colors duration-150" : "",
              )}
              onClick={() => setActiveTab(activeTab === "overview" ? "" : "overview")}
            >
              <span className={cn("text-sm font-medium", isLightTheme ? "text-gray-900" : "text-white")}>Overview</span>
              <span
                className={`transform transition-transform duration-200 ${activeTab === "overview" ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isLightTheme ? "text-gray-600" : "text-gray-400"}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>

            {activeTab === "overview" && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={cn(
                      "rounded-md p-4",
                      isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-white bg-opacity-5",
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={cn("text-sm font-medium", isLightTheme ? "text-gray-600" : "text-gray-400")}>
                        Utilization Rate
                      </h3>
                      <Activity size={16} className="text-green-500" />
                    </div>
                    <div className={cn("text-2xl font-bold", isLightTheme ? "text-gray-900" : "text-white")}>
                      {vehicleDetailData?.status?.utilization_rate ?? "60.74"}%
                    </div>
                    <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>Last 7 days</div>
                  </div>

                  <div
                    className={cn(
                      "rounded-md p-4",
                      isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-white bg-opacity-5",
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={cn("text-sm font-medium", isLightTheme ? "text-gray-600" : "text-gray-400")}>
                        Engine Hours
                      </h3>
                      <Clock size={16} className={isLightTheme ? "text-gray-600" : "text-gray-400"} />
                    </div>
                    <div className={cn("text-2xl font-bold", isLightTheme ? "text-gray-900" : "text-white")}>
                      {vehicleDetailData?.status?.engine_health ?? "90.28"}
                    </div>
                    <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                      Total lifetime
                    </div>
                  </div>

                  <div
                    className={cn(
                      "rounded-md p-4",
                      isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-white bg-opacity-5",
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={cn("text-sm font-medium", isLightTheme ? "text-gray-600" : "text-gray-400")}>
                        Uptime
                      </h3>
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <div className={cn("text-2xl font-bold", isLightTheme ? "text-gray-900" : "text-white")}>
                      {vehicleDetailData?.status?.uptime ?? "76.99"}%
                    </div>
                    <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>Last 30 days</div>
                  </div>

                  <div
                    className={cn(
                      "rounded-md p-4",
                      isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-white bg-opacity-5",
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={cn("text-sm font-medium", isLightTheme ? "text-gray-600" : "text-gray-400")}>
                        Avg. Usage/Day
                      </h3>
                      <BarChart3 size={16} className="text-blue-400" />
                    </div>
                    <div className={cn("text-2xl font-bold", isLightTheme ? "text-gray-900" : "text-white")}>
                      {vehicleDetailData?.status?.avg_use_per_day ?? "76.99"}h
                    </div>
                    <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>Last 30 days</div>
                  </div>
                </div>

                {/* <div className="bg-amber-900/20 border border-amber-800/30 rounded-md p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle size={16} className="text-amber-500 mr-2" />
                    <h3 className="text-sm font-medium text-amber-400">Active Alerts</h3>
                  </div>

                  <div className="space-y-2">
                    {vehicleData.activeAlerts.map((alert, index) => (
                      <div key={index} className="flex items-start py-2 border-t border-amber-800/30">
                        <div className="mt-0.5 mr-2">
                          {alert.type === "warning" && <AlertTriangle size={14} className="text-amber-500" />}
                          {alert.type === "error" && <AlertCircle size={14} className="text-red-500" />}
                          {alert.type === "info" && <Info size={14} className="text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm",
                              alert.type === "warning"
                                ? "text-amber-400"
                                : alert.type === "error"
                                  ? "text-red-400"
                                  : "text-blue-400",
                            )}
                          >
                            {alert.message}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {alert.timestamp.split(" ")[1]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}

                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-white bg-opacity-5",
                  )}
                >
                  <h3 className={cn("text-sm font-medium mb-3", isLightTheme ? "text-gray-600" : "text-gray-400")}>
                    Temperature Status
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-gray-400")}>Engine</div>
                      <div className="flex items-center justify-center">
                        <Thermometer size={14} className="text-green-500 mr-1" />
                        <span className={cn("text-lg font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                          {vehicleDetailData?.temperature?.engine ?? "95.49"}°C
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Battery
                      </div>
                      <div className="flex items-center justify-center">
                        <Thermometer size={14} className="text-green-500 mr-1" />
                        <span className={cn("text-lg font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                          {vehicleDetailData?.temperature?.battery ?? "21.44"}°C
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Hydraulics
                      </div>
                      <div className="flex items-center justify-center">
                        <Thermometer size={14} className="text-green-500 mr-1" />
                        <span className={cn("text-lg font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                          {vehicleDetailData?.temperature?.hydraulics ?? "21.44"}°C
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tracking Accordion */}
          <div
            className={cn(
              "rounded-md overflow-hidden",
              isLightTheme ? "bg-gray-50 border border-gray-200" : "bg-gray-900",
            )}
          >
            <button
              className={cn(
                "w-full px-4 py-3 flex justify-between items-center text-left",
                isLightTheme ? "hover:bg-gray-100 transition-colors duration-150" : "",
              )}
              onClick={() => setActiveTab(activeTab === "tracking" ? "" : "tracking")}
            >
              <span className={cn("text-sm font-medium", isLightTheme ? "text-gray-900" : "text-white")}>Tracking</span>
              <span
                className={`transform transition-transform duration-200 ${activeTab === "tracking" ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isLightTheme ? "text-gray-600" : "text-gray-400"}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {activeTab === "tracking" && (
              <div className="px-4 pb-4 space-y-4">
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Movement Data
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Last Known Location
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        Terminal 1
                      </div>
                      <div className="text-xs text-blue-400 mt-1">Updated: 2024-04-16 09:45:22</div>
                    </div>

                    <div>
                      <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Current Speed
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-blue-400 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                          {vehicleDetailData?.speed?.current ?? "9"} km/h
                        </span>
                      </div>
                      <div className="text-xs text-blue-400 mt-1">Direction: North-East</div>
                    </div>

                    <div>
                      <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Distance Today
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.distance?.today ?? "31"} km
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Distance This Week
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.distance?.week ?? "291"} km
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>Top Speed</div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.speed?.top ?? "28.57"} km/h
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Average Speed
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.speed?.average ?? "19.88"} km/h
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Speed Infractions
                      </div>
                      <div className="text-red-400 font-medium">{"2"}</div>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Geofencing Alerts
                  </h4>

                  <div className="space-y-3">
                    <div
                      className={cn(
                        "rounded-md p-3",
                        isLightTheme
                          ? "bg-red-50 border border-red-200 shadow-sm"
                          : "bg-red-900/20 border border-red-800/30",
                      )}
                    >
                      <div className="text-red-400 text-sm">Entered restricted area at 08:32 AM (Authorized)</div>
                    </div>

                    <div
                      className={cn(
                        "rounded-md p-3",
                        isLightTheme
                          ? "bg-red-50 border border-red-200 shadow-sm"
                          : "bg-red-900/20 border border-red-800/30",
                      )}
                    >
                      <div className="text-red-400 text-sm">Exited designated zone at 07:15 AM (Unauthorized)</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    className={cn(
                      "flex items-center px-4 py-2 rounded-md transition-colors duration-150",
                      isLightTheme
                        ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                        : "bg-transparent border border-red-800/50 text-red-400 hover:bg-red-900/20",
                    )}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    View Historical Path
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Health Accordion */}
          <div
            className={cn(
              "rounded-md overflow-hidden",
              isLightTheme ? "bg-gray-50 border border-gray-200" : "bg-gray-900",
            )}
          >
            <button
              className={cn(
                "w-full px-4 py-3 flex justify-between items-center text-left",
                isLightTheme ? "hover:bg-gray-100 transition-colors duration-150" : "",
              )}
              onClick={() => setActiveTab(activeTab === "health" ? "" : "health")}
            >
              <span className={cn("text-sm font-medium", isLightTheme ? "text-gray-900" : "text-white")}>Health</span>
              <span
                className={`transform transition-transform duration-200 ${activeTab === "health" ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isLightTheme ? "text-gray-600" : "text-gray-400"}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {activeTab === "health" && (
              <div className="px-4 pb-4 space-y-4">
                {/* Engine & Power Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Engine & Power
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={cn("", isLightTheme ? "text-gray-500" : "text-gray-400")}>Engine Health</span>
                        <span className={cn("", isLightTheme ? "text-gray-900" : "text-white")}>
                          {vehicleDetailData?.status?.engine_health ?? "60.74"} %
                        </span>
                      </div>
                      <div className={cn("w-full rounded-full h-2", isLightTheme ? "bg-gray-200" : "bg-gray-700")}>
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${vehicleDetailData?.status?.engine_health ?? 60.74}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={cn("", isLightTheme ? "text-gray-500" : "text-gray-400")}>Battery Level</span>
                        <span className={cn("", isLightTheme ? "text-gray-900" : "text-white")}>
                          {vehicleDetailData?.status?.battery_health ?? "50.74"}%
                        </span>
                      </div>
                      <div className={cn("w-full rounded-full h-2", isLightTheme ? "bg-gray-200" : "bg-gray-700")}>
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${vehicleDetailData?.status?.battery_health ?? 50.74}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className={cn("text-xs mb-2", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                      Diagnostic Alerts
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <AlertTriangle size={14} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-red-400 text-sm">Check engine light - P0456 code</span>
                      </div>
                      <div className="flex items-start">
                        <AlertTriangle size={14} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-red-400 text-sm">Battery cell 3 degradation detected</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={cn("text-xs mb-2", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Hydraulic System
                      </div>
                      <div
                        className={cn(
                          "inline-block px-3 py-1 rounded-full",
                          isLightTheme
                            ? "bg-green-50 border border-green-200 shadow-sm"
                            : "bg-green-900/30 border border-green-800/50",
                        )}
                      >
                        <span className="text-green-400 text-xs font-medium">GOOD</span>
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-2", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Brake Condition
                      </div>
                      <div
                        className={cn(
                          "inline-block px-3 py-1 rounded-full",
                          isLightTheme
                            ? "bg-amber-50 border border-amber-200 shadow-sm"
                            : "bg-amber-900/30 border border-amber-800/50",
                        )}
                      >
                        <span className="text-amber-400 text-xs font-medium">WARNING</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tire Status Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Tire Status
                  </h4>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <div className={cn("text-xs mb-2", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Tire Pressure
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                            {vehicleDetailData?.tire_pressure?.front_left ?? "32.75"} PSI
                          </div>
                          <div className="text-xs text-blue-400">Front Left</div>
                        </div>
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                            {vehicleDetailData?.tire_pressure?.front_right ?? "32.96"} PSI
                          </div>
                          <div className="text-xs text-blue-400">Front Right</div>
                        </div>
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                            {vehicleDetailData?.tire_pressure?.rear_left ?? "34.02"} PSI
                          </div>
                          <div className="text-xs text-blue-400">Rear Left</div>
                        </div>
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                            {vehicleDetailData?.tire_pressure?.rear_right ?? "34.06"} PSI
                          </div>
                          <div className="text-xs text-blue-400">Rear Right</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-2", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Tire Wear (%)
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>45%</div>
                          <div className="text-xs text-blue-400">Front Left</div>
                        </div>
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>48%</div>
                          <div className="text-xs text-blue-400">Front Right</div>
                        </div>
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>32%</div>
                          <div className="text-xs text-blue-400">Rear Left</div>
                        </div>
                        <div>
                          <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>35%</div>
                          <div className="text-xs text-blue-400">Rear Right</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance Schedule Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Maintenance Schedule
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Last Maintenance
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>2024-03-15</div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                        Next Scheduled
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>2024-06-20</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <div className={cn("text-xs", isLightTheme ? "text-gray-500" : "text-gray-400")}>
                      Time until next maintenance
                    </div>
                    <div className="flex justify-end">
                      {/*<button className="flex items-center px-4 py-2 bg-red-900/30 border border-red-800/50 rounded-md text-red-400 hover:bg-red-900/50">
                        <span className="mr-2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        Schedule Service
                      </button>
                      */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usage Accordion */}
          <div
            className={cn(
              "rounded-md overflow-hidden",
              isLightTheme ? "bg-gray-50 border border-gray-200" : "bg-gray-900",
            )}
          >
            <button
              className={cn(
                "w-full px-4 py-3 flex justify-between items-center text-left",
                isLightTheme ? "hover:bg-gray-100 transition-colors duration-150" : "",
              )}
              onClick={() => setActiveTab(activeTab === "usage" ? "" : "usage")}
            >
              <span className={cn("text-sm font-medium", isLightTheme ? "text-gray-900" : "text-white")}>Usage</span>
              <span
                className={`transform transition-transform duration-200 ${activeTab === "usage" ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isLightTheme ? "text-gray-600" : "text-gray-400"}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {activeTab === "usage" && (
              <div className="px-4 pb-4 space-y-4">
                {/* Usage Metrics Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Usage Metrics
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Runtime Today
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.time?.runtime_today.split(".")[0] ?? "8"}
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Runtime This Week
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.time?.runtime_week.split(".")[0] ?? "89"}
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Idle Time
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.time?.idle_time.split(".")[0] ?? "12"}
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Active Time
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        {vehicleDetailData?.time?.active_time.split(".")[0] ?? "9"}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-400">Usage Efficiency</span>
                      <span className={cn("", isLightTheme ? "text-gray-900" : "text-white")}>73%</span>
                    </div>
                    <div className={cn("w-full rounded-full h-2", isLightTheme ? "bg-gray-200" : "bg-gray-700")}>
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "73%" }}></div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="text-xs text-blue-400 mr-2">Performance Trend:</div>
                    <div
                      className={cn(
                        "inline-block px-3 py-0.5 rounded-full",
                        isLightTheme
                          ? "bg-green-50 border border-green-200 shadow-sm"
                          : "bg-green-900/30 border border-green-800/50",
                      )}
                    >
                      <span className="text-green-400 text-xs font-medium">IMPROVING</span>
                    </div>
                  </div>
                </div>

                {/* Recent Usage Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Recent Usage
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>AC123</div>
                        <div className="text-xs text-gray-400">James Wilson - 2024-04-15</div>
                      </div>
                      <div className={cn("", isLightTheme ? "text-gray-900" : "text-white")}>2.5 hours</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>AC789</div>
                        <div className="text-xs text-gray-400">Emma Davis - 2024-04-14</div>
                      </div>
                      <div className={cn("", isLightTheme ? "text-gray-900" : "text-white")}>3 hours</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>AC456</div>
                        <div className="text-xs text-gray-400">Michael Brown - 2024-04-13</div>
                      </div>
                      <div className={cn("", isLightTheme ? "text-gray-900" : "text-white")}>1.5 hours</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>AC321</div>
                        <div className="text-xs text-gray-400">Lisa Wong - 2024-04-12</div>
                      </div>
                      <div className={cn("", isLightTheme ? "text-gray-900" : "text-white")}>4 hours</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Connectivity Accordion */}
          <div
            className={cn(
              "rounded-md overflow-hidden",
              isLightTheme ? "bg-gray-50 border border-gray-200" : "bg-gray-900",
            )}
          >
            <button
              className={cn(
                "w-full px-4 py-3 flex justify-between items-center text-left",
                isLightTheme ? "hover:bg-gray-100 transition-colors duration-150" : "",
              )}
              onClick={() => setActiveTab(activeTab === "connectivity" ? "" : "connectivity")}
            >
              <span className={cn("text-sm font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                Connectivity
              </span>
              <span
                className={`transform transition-transform duration-200 ${activeTab === "connectivity" ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isLightTheme ? "text-gray-600" : "text-gray-400"}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {activeTab === "connectivity" && (
              <div className="px-4 pb-4 space-y-4">
                {/* IoT & Connectivity Status Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    IoT & Connectivity Status
                  </h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        IoT Sensor Status
                      </div>
                      <div className="flex items-center">
                        <div
                          className={cn("w-2 h-2 rounded-full mr-2", isLightTheme ? "bg-green-600" : "bg-green-500")}
                        ></div>
                        <span className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>Active</span>
                      </div>
                      <div className="text-xs text-blue-400 mt-2">Last Update: 2024-04-16 09:47:15</div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Remote Control
                      </div>
                      <div className="flex items-center">
                        <div
                          className={cn("w-2 h-2 rounded-full mr-2", isLightTheme ? "bg-green-600" : "bg-green-500")}
                        ></div>
                        <span className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                          Available
                        </span>
                      </div>
                      <div className="text-xs text-blue-400 mt-2">Remote control enabled</div>
                    </div>
                  </div>

                  <div>
                    <div className={cn("text-xs mb-2", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                      Communication Networks
                    </div>
                    <div className="flex gap-2">
                      <div
                        className={cn(
                          "px-3 py-1.5 flex items-center rounded-md",
                          isLightTheme
                            ? "bg-blue-50 border border-blue-200 shadow-sm"
                            : "bg-blue-900/30 border border-blue-800/50",
                        )}
                      >
                        <svg
                          className="w-4 h-4 mr-1.5 text-blue-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 12.55a11 11 0 0 1 14.08 0"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1.42 9a16 16 0 0 1 21.16 0"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8.53 16.11a6 6 0 0 1 6.95 0"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 20h.01"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className={cn("text-xs", isLightTheme ? "text-gray-900" : "text-white")}>WiFi</span>
                      </div>

                      <div
                        className={cn(
                          "px-3 py-1.5 flex items-center rounded-md",
                          isLightTheme
                            ? "bg-blue-50 border border-blue-200 shadow-sm"
                            : "bg-blue-900/30 border border-blue-800/50",
                        )}
                      >
                        <svg
                          className="w-4 h-4 mr-1.5 text-blue-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.5 12.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 12.5c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10c.5 0 1-.034 1.485-.101"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className={cn("text-xs", isLightTheme ? "text-gray-900" : "text-white")}>5G</span>
                      </div>

                      <div
                        className={cn(
                          "px-3 py-1.5 flex items-center rounded-md",
                          isLightTheme
                            ? "bg-blue-50 border border-blue-200 shadow-sm"
                            : "bg-blue-900/30 border border-blue-800/50",
                        )}
                      >
                        <svg
                          className="w-4 h-4 mr-1.5 text-blue-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="m12 7 5 10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="m7 17 5-10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className={cn("text-xs", isLightTheme ? "text-gray-900" : "text-white")}>Bluetooth</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connectivity Actions Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Connectivity Actions
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={cn(
                        "flex items-center px-4 py-2 rounded-md transition-colors duration-150",
                        isLightTheme
                          ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                          : "bg-transparent border border-red-800/50 text-red-400 hover:bg-red-900/20",
                      )}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Ping Device</span>
                    </button>

                    <button
                      className={cn(
                        "flex items-center px-4 py-2 rounded-md transition-colors duration-150",
                        isLightTheme
                          ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                          : "bg-transparent border border-red-800/50 text-red-400 hover:bg-red-900/20",
                      )}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M21 2v6h-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 12a9 9 0 0 1 15-6.7L21 8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 22v-6h6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 12a9 9 0 0 1-15 6.7L3 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Refresh Data</span>
                    </button>

                    <button
                      className={cn(
                        "flex items-center px-4 py-2 rounded-md transition-colors duration-150",
                        isLightTheme
                          ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                          : "bg-transparent border border-red-800/50 text-red-400 hover:bg-red-900/20",
                      )}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Security Check</span>
                    </button>

                    <button
                      className={cn(
                        "flex items-center px-4 py-2 rounded-md transition-colors duration-150",
                        isLightTheme
                          ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                          : "bg-transparent border border-red-800/50 text-red-400 hover:bg-red-900/20",
                      )}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 2v6h6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 13H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 17H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 9H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>Diagnostic Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Specs Accordion */}
          <div
            className={cn(
              "rounded-md overflow-hidden",
              isLightTheme ? "bg-gray-50 border border-gray-200" : "bg-gray-900",
            )}
          >
            <button
              className={cn(
                "w-full px-4 py-3 flex justify-between items-center text-left",
                isLightTheme ? "hover:bg-gray-100 transition-colors duration-150" : "",
              )}
              onClick={() => setActiveTab(activeTab === "specs" ? "" : "specs")}
            >
              <span className={cn("text-sm font-medium", isLightTheme ? "text-gray-900" : "text-white")}>Specs</span>
              <span
                className={`transform transition-transform duration-200 ${activeTab === "specs" ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isLightTheme ? "text-gray-600" : "text-gray-400"}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {activeTab === "specs" && (
              <div className="px-4 pb-4">
                {/* Equipment Specifications Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Equipment Specifications
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>Model</div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        TractorPro X450
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Manufacturer
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        AirportTech Industries
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>Year</div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>2021</div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Power Type
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>Electric</div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        AC Asset ID
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>
                        AC-GSE-YYZ-BT-042
                      </div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Max Capacity
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>6,000 kg</div>
                    </div>

                    <div>
                      <div className={cn("text-xs mb-1", isLightTheme ? "text-gray-500" : "text-blue-400")}>
                        Max Speed
                      </div>
                      <div className={cn("font-medium", isLightTheme ? "text-gray-900" : "text-white")}>25 km/h</div>
                    </div>
                  </div>
                </div>

                {/* Documentation Section */}
                <div
                  className={cn(
                    "rounded-md p-4",
                    isLightTheme ? "bg-white border border-gray-200 shadow-sm" : "bg-black bg-opacity-30",
                  )}
                >
                  <h4 className={cn("text-sm font-medium mb-4", isLightTheme ? "text-gray-700" : "text-gray-300")}>
                    Documentation
                  </h4>

                  <div className="space-y-3">
                    <button
                      className={cn(
                        "w-full flex items-center px-4 py-3 transition-colors rounded-md",
                        isLightTheme
                          ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                          : "bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70",
                      )}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 2v6h6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 13H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 17H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 9H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>AC User Manual</span>
                    </button>

                    <button
                      className={cn(
                        "w-full flex items-center px-4 py-3 transition-colors rounded-md",
                        isLightTheme
                          ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                          : "bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70",
                      )}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 2v6h6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 13H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 17H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 9H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>AC Maintenance Guide</span>
                    </button>

                    <button
                      className={cn(
                        "w-full flex items-center px-4 py-3 transition-colors rounded-md",
                        isLightTheme
                          ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200"
                          : "bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70",
                      )}
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 2v6h6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 13H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 17H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 9H8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>YYZ GSE Procedures</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
