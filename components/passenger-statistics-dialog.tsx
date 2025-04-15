"use client"
import { useState, useEffect } from "react"
import { X, Clock, Users, Briefcase, Shield, Clock2, UserCheck, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useTheme } from "@/components/theme-provider"

interface AircraftData {
  registration: string
  arrivalFlight: string
  departureFlight: string
  scheduledArrival: string
  actualArrival: string
  scheduledDeparture: string
  status: string
  statusColor: string
}

interface PassengerStatisticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aircraft: AircraftData | null
}

// Custom circular progress component using SVG
const CircularProgress = ({
  percentage,
  size = 80,
  strokeWidth = 8,
  textSize = 16,
  color = "#60a5fa",
  showPercentage = true,
  theme = "dark",
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const bgColor = theme === "light" ? "#e5e7eb" : "#1e293b"
  const textColor = theme === "light" ? "#1e293b" : "#f8fafc"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      {/* Text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={theme === "light" ? "text-slate-900 font-medium" : "text-slate-100 font-medium"}
            style={{ fontSize: textSize }}
          >
            {percentage}%
          </span>
        </div>
      )}
    </div>
  )
}

// Horizontal gauge component
const HorizontalGauge = ({ value, max, color, height = 8, showLabel = false, theme = "dark" }) => {
  const percentage = (value / max) * 100
  const bgColor = theme === "light" ? "bg-slate-100" : "bg-slate-700"
  const textColor = theme === "light" ? "text-slate-600" : "text-slate-400"

  return (
    <div className="w-full">
      <div className={`w-full ${bgColor} rounded-full overflow-hidden`} style={{ height }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        ></div>
      </div>
      {showLabel && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${textColor}`}>
            {value}/{max}
          </span>
        </div>
      )}
    </div>
  )
}

// Dot indicator component
const DotIndicator = ({ type }) => {
  let color
  switch (type) {
    case "primary":
      color = "bg-blue-500"
      break
    case "success":
      color = "bg-green-500"
      break
    case "warning":
      color = "bg-amber-500"
      break
    case "danger":
      color = "bg-red-500"
      break
    case "neutral":
      color = "bg-slate-500"
      break
    default:
      color = "bg-blue-500"
  }

  return <div className={`w-2 h-2 rounded-full ${color}`}></div>
}

export function PassengerStatisticsDialog({ open, onOpenChange, aircraft }: PassengerStatisticsDialogProps) {
  const { theme, mounted } = useTheme()
  const currentTheme = mounted ? theme : "dark"
  const isLightTheme = currentTheme === "light"

  // Add countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60) // 15 minutes in seconds

  // Timer effect
  useEffect(() => {
    // Only run the timer if the dialog is open
    if (open) {
      const timer = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 0) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      // Cleanup on unmount or when dialog closes
      return () => {
        clearInterval(timer)
      }
    } else {
      // Reset timer when dialog reopens
      setRemainingSeconds(15 * 60)
    }
  }, [open])

  // Format the remaining time
  const formatRemainingTime = () => {
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Theme-based styling
  const styles = {
    bg: isLightTheme ? "bg-white" : "bg-slate-900",
    border: isLightTheme ? "border-slate-200" : "border-slate-800",
    text: isLightTheme ? "text-slate-900" : "text-slate-100",
    textMuted: isLightTheme ? "text-slate-600" : "text-slate-400",
    cardBg: isLightTheme ? "bg-slate-50" : "bg-slate-800",
    blockBg: isLightTheme ? "bg-white" : "bg-slate-700",
    headerBorder: isLightTheme ? "border-slate-200" : "border-slate-800",
    closeButtonHoverBg: isLightTheme ? "hover:bg-slate-100" : "hover:bg-slate-800",
    closeButtonText: isLightTheme ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-100",
    shadow: isLightTheme ? "shadow-sm" : "",
    divider: isLightTheme ? "border-slate-200" : "border-slate-700",
    secondaryText: isLightTheme ? "text-slate-700" : "text-slate-300",
  }

  if (!aircraft) return null

  // Gate data
  const gateData = {
    passengerCounts: {
      totalBoarded: 142,
      capacity: 156,
      notBoarded: 11,
      standbyAccepted: 2,
      specialAssistance: 7,
    },
    boardingStatus: {
      completionPercentage: 91,
      lastScan: "15:32 EDT",
    },
    baggageStats: {
      totalChecked: 187,
      missing: 0,
      oversized: 4,
      byClass: {
        J: 42, // Business class
        Y: 145, // Economy class
      },
    },
    security: {
      additionalScreening: 2,
      visaIssues: 1,
    },
    connections: {
      tight: 8,
      late: 3,
    },
  }

  // Special assistance details
  const specialAssistanceDetails = [
    { type: "Wheelchair", count: 3, icon: "🦽" },
    { type: "Visual impairment", count: 1, icon: "👁️" },
    { type: "Hearing impairment", count: 1, icon: "👂" },
    { type: "Elderly assistance", count: 2, icon: "🧓" },
  ]

  // Calculate some derived metrics
  const totalConnectionIssues = gateData.connections.tight + gateData.connections.late
  const remainingToBoard = gateData.passengerCounts.capacity - gateData.passengerCounts.totalBoarded
  const bagsPerPassenger = (gateData.baggageStats.totalChecked / gateData.passengerCounts.totalBoarded).toFixed(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[500px] ${styles.bg} border ${styles.border} ${styles.text} p-0 max-h-[90vh] overflow-y-auto ${isLightTheme ? "shadow-md" : ""}`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${styles.headerBorder} flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${styles.text}`}>
            Passenger Information
            <div className={`text-sm font-normal ${styles.textMuted} mt-1`}>
              {aircraft.registration} • {aircraft.departureFlight}
            </div>
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className={`${styles.closeButtonText} p-1 rounded-full ${styles.closeButtonHoverBg}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Passenger Status Section */}
          <div className={`${styles.cardBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-blue-500 font-medium text-sm">Passenger Status</h2>
              <Users className="h-4 w-4 text-blue-500" />
            </div>

            <div className="flex justify-between mb-4">
              <div className="relative">
                <CircularProgress
                  percentage={gateData.boardingStatus.completionPercentage}
                  size={80}
                  strokeWidth={8}
                  color={gateData.boardingStatus.completionPercentage >= 90 ? "#10b981" : "#60a5fa"}
                  theme={currentTheme}
                />
                <div className="absolute top-0 right-0 bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div className={`text-xs ${styles.textMuted}`}>Boarded</div>
                  <div className={`text-xl font-bold ${styles.text}`}>
                    {gateData.passengerCounts.totalBoarded}/{gateData.passengerCounts.capacity}
                  </div>
                </div>
                <div>
                  <div className={`text-xs ${styles.textMuted}`}>Remaining</div>
                  <div className="text-xl font-bold text-amber-500">{remainingToBoard}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className={`flex items-center ${styles.secondaryText}`}>
                  <Clock className="h-3 w-3 mr-1 text-blue-500" />
                  <span>Last scan: {gateData.boardingStatus.lastScan}</span>
                </div>
                <div className={`flex items-center ${styles.secondaryText}`}>
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                  <span>{formatRemainingTime()} remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className={`${styles.blockBg} p-2 rounded-md flex flex-col items-center border ${styles.border}`}>
                  <div className={`text-xl font-semibold ${styles.text}`}>
                    {gateData.passengerCounts.standbyAccepted}
                  </div>
                  <div className={`text-xs ${styles.secondaryText}`}>Standby</div>
                </div>
                <div
                  className={`${styles.blockBg} p-2 rounded-md flex flex-col items-center relative group border ${styles.border}`}
                >
                  <div
                    className={`text-xl font-semibold ${styles.text} cursor-help`}
                    aria-describedby="special-assistance-tooltip"
                  >
                    {gateData.passengerCounts.specialAssistance}
                  </div>
                  <div className={`text-xs ${styles.secondaryText}`}>Special Assistance</div>

                  {/* Special assistance details popup - shown on hover */}
                  <div
                    id="special-assistance-tooltip"
                    className={`absolute top-full left-0 right-0 mt-2 p-3 ${styles.bg} border ${styles.border} rounded-md ${isLightTheme ? "shadow-lg" : "shadow-md"} z-10 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200`}
                    style={{ transform: "translateX(-25%)" }}
                    role="tooltip"
                  >
                    <div className="text-sm font-medium mb-2">Special Assistance Types:</div>
                    <div className="space-y-2">
                      {specialAssistanceDetails.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="mr-2">{item.icon}</span>
                            <span className={`text-xs ${styles.text}`}>{item.type}</span>
                          </div>
                          <span className={`text-xs font-medium ${styles.text}`}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
                      <div
                        className={`w-3 h-3 rotate-45 ${styles.bg} border-t ${styles.border} border-l ${styles.border}`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Baggage Statistics Section */}
          <div className={`${styles.cardBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-blue-500 font-medium text-sm">Baggage Statistics</h2>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </div>

            <div className="space-y-3">
              {/* Class breakdown */}
              <div className={`${styles.blockBg} p-3 rounded-md border ${styles.border}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${styles.text}`}>Baggage by Class</span>
                  <span className={`text-xs ${styles.textMuted}`}>Total: {gateData.baggageStats.totalChecked}</span>
                </div>

                {/* J Class (Business) */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
                      <span className={`text-xs ${styles.secondaryText}`}>J Class:</span>
                    </div>
                    <span className={`text-xs font-medium ${styles.text}`}>{gateData.baggageStats.byClass.J}</span>
                  </div>
                  <HorizontalGauge
                    value={gateData.baggageStats.byClass.J}
                    max={gateData.baggageStats.totalChecked}
                    color="#6366f1" // indigo-500
                    height={4}
                    theme={currentTheme}
                  />
                </div>

                {/* Y Class (Economy) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className={`text-xs ${styles.secondaryText}`}>Y Class:</span>
                    </div>
                    <span className={`text-xs font-medium ${styles.text}`}>{gateData.baggageStats.byClass.Y}</span>
                  </div>
                  <HorizontalGauge
                    value={gateData.baggageStats.byClass.Y}
                    max={gateData.baggageStats.totalChecked}
                    color="#3b82f6" // blue-500
                    height={4}
                    theme={currentTheme}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={`${styles.blockBg} p-2 rounded-md flex flex-col items-center border ${styles.border}`}>
                  <div className={`text-xl font-semibold ${styles.text}`}>{gateData.baggageStats.totalChecked}</div>
                  <div className={`text-xs text-center ${styles.secondaryText}`}>Total</div>
                </div>
                <div className={`${styles.blockBg} p-2 rounded-md flex flex-col items-center border ${styles.border}`}>
                  <div className="text-xl font-semibold text-green-500">{gateData.baggageStats.missing}</div>
                  <div className={`text-xs text-center ${styles.secondaryText}`}>Missing</div>
                </div>
                <div className={`${styles.blockBg} p-2 rounded-md flex flex-col items-center border ${styles.border}`}>
                  <div className={`text-xl font-semibold ${styles.text}`}>{gateData.baggageStats.oversized}</div>
                  <div className={`text-xs text-center ${styles.secondaryText}`}>Special</div>
                </div>
              </div>

              {/* Bags per passenger indicator */}
              <div className={`${styles.blockBg} p-2 rounded-md border ${styles.border}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs ${styles.secondaryText}`}>Bags per passenger:</span>
                  <span className={`text-xs font-medium ${styles.text}`}>{bagsPerPassenger}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(Math.ceil(Number.parseFloat(bagsPerPassenger) * 2), 5))].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-blue-500 rounded-sm opacity-80"></div>
                  ))}
                  {[...Array(5 - Math.min(Math.ceil(Number.parseFloat(bagsPerPassenger) * 2), 5))].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 ${isLightTheme ? "bg-slate-300" : "bg-slate-600"} rounded-sm`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security/Compliance Section */}
          <div className={`${styles.cardBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-blue-500 font-medium text-sm">Security/Compliance</h2>
              <Shield className="h-4 w-4 text-blue-500" />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className={`${styles.blockBg} p-2 rounded-md flex flex-col items-center border ${styles.border}`}>
                  <div className="mb-1">
                    <DotIndicator type="warning" />
                  </div>
                  <div className={`text-lg font-semibold ${styles.text}`}>{gateData.security.additionalScreening}</div>
                  <div className={`text-xs text-center ${styles.secondaryText}`}>
                    Additional
                    <br />
                    Screening
                  </div>
                </div>

                <div className={`${styles.blockBg} p-2 rounded-md flex flex-col items-center border ${styles.border}`}>
                  <div className="mb-1">
                    <DotIndicator type="danger" />
                  </div>
                  <div className={`text-lg font-semibold ${styles.text}`}>{gateData.security.visaIssues}</div>
                  <div className={`text-xs text-center ${styles.secondaryText}`}>
                    Visa
                    <br />
                    Issues
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status Section */}
          <div className={`${styles.cardBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-blue-500 font-medium text-sm">Connection Status</h2>
              <Clock2 className="h-4 w-4 text-blue-500" />
            </div>

            <div className="space-y-3">
              {/* Visual representation of connections */}
              <div className="relative h-20">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 100 50" width="100%" height="100%">
                    {/* Base flight line */}
                    <line
                      x1="0"
                      y1="25"
                      x2="100"
                      y2="25"
                      stroke={isLightTheme ? "#cbd5e1" : "#475569"}
                      strokeWidth="1"
                    />

                    {/* Flight icon */}
                    <path d="M90,25 L100,25 L95,20 Z" fill="#60a5fa" />

                    {/* Tight connections */}
                    {[...Array(gateData.connections.tight)].map((_, i) => (
                      <g key={`tight-${i}`}>
                        <line
                          x1={(60 + i * 3) % 80}
                          y1="25"
                          x2={(70 + i * 3) % 80}
                          y2="15"
                          stroke="#facc15"
                          strokeWidth="1.5"
                        />
                        <circle cx={(70 + i * 3) % 80} cy="15" r="2" fill="#facc15" />
                      </g>
                    ))}

                    {/* Late connections */}
                    {[...Array(gateData.connections.late)].map((_, i) => (
                      <g key={`late-${i}`}>
                        <line
                          x1={(50 + i * 5) % 70}
                          y1="25"
                          x2={(60 + i * 5) % 70}
                          y2="35"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                        />
                        <circle cx={(60 + i * 5) % 70} cy="35" r="2" fill="#f43f5e" />
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
                      <span className={`text-xs ${styles.secondaryText}`}>Tight:</span>
                    </div>
                    <span className={`text-xs font-medium ${styles.text}`}>{gateData.connections.tight}</span>
                  </div>
                  <HorizontalGauge
                    value={gateData.connections.tight}
                    max={totalConnectionIssues}
                    color="#facc15"
                    height={4}
                    theme={currentTheme}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className={`text-xs ${styles.secondaryText}`}>Late:</span>
                    </div>
                    <span className="text-xs font-medium text-red-500">{gateData.connections.late}</span>
                  </div>
                  <HorizontalGauge
                    value={gateData.connections.late}
                    max={totalConnectionIssues}
                    color="#f43f5e"
                    height={4}
                    theme={currentTheme}
                  />
                </div>
              </div>

              {/* Connection risk assessment */}
              <div className={`pt-2 border-t ${styles.divider}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${styles.secondaryText}`}>Connection risk:</span>
                  <span
                    className={`text-xs font-medium ${
                      gateData.connections.late > 0 ? "text-red-500" : "text-yellow-500"
                    }`}
                  >
                    {gateData.connections.late > 0 ? "High" : "Moderate"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
