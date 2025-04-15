"use client"

import { X, Users, Briefcase, AlertTriangle, Clock, ShieldCheck, UserCheck } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

interface UpcomingAircraftData {
  registration: string
  scheduledArrival: string
  arrivalFlight: string
  departureFlight: string
  status: string
  statusColor: string
}

interface UpcomingPassengerStatisticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aircraft: UpcomingAircraftData | null
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
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  textSize?: number
  color?: string
  showPercentage?: boolean
  theme?: string
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const bgColor = theme === "light" ? "#edf2f7" : "#1e293b"
  const textColor = theme === "light" ? "#1e293b" : "#f1f5f9"

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
          <span className="font-medium" style={{ fontSize: textSize, color: textColor }}>
            {percentage}%
          </span>
        </div>
      )}
    </div>
  )
}

// Horizontal gauge component
const HorizontalGauge = ({
  value,
  max,
  color,
  height = 8,
  showLabel = false,
  theme = "dark",
}: {
  value: number
  max: number
  color: string
  height?: number
  showLabel?: boolean
  theme?: string
}) => {
  const percentage = (value / max) * 100
  const bgColor = theme === "light" ? "#edf2f7" : "#334155"
  const labelColor = theme === "light" ? "#64748b" : "#94a3b8"

  return (
    <div className="w-full">
      <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: bgColor }}>
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
          <span className="text-xs" style={{ color: labelColor }}>
            {value}/{max}
          </span>
        </div>
      )}
    </div>
  )
}

// Status badge component
const StatusBadge = ({ status, theme = "dark" }: { status: string; theme?: string }) => {
  let backgroundColor, textColor, text

  switch (status.toLowerCase()) {
    case "none":
      backgroundColor = "bg-green-500"
      textColor = theme === "light" ? "text-green-900" : "text-green-100"
      text = "None"
      break
    case "warning":
      backgroundColor = "bg-amber-500"
      textColor = theme === "light" ? "text-amber-900" : "text-amber-100"
      text = "Warning"
      break
    case "alert":
      backgroundColor = "bg-red-500"
      textColor = theme === "light" ? "text-red-900" : "text-red-100"
      text = "Alert"
      break
    default:
      backgroundColor = theme === "light" ? "bg-slate-300" : "bg-slate-500"
      textColor = theme === "light" ? "text-slate-900" : "text-slate-100"
      text = status
  }

  return (
    <div className={`${backgroundColor} ${textColor} text-xs font-medium px-2 py-1 rounded-full inline-block`}>
      {text}
    </div>
  )
}

export function UpcomingPassengerStatisticsDialog({
  open,
  onOpenChange,
  aircraft,
}: UpcomingPassengerStatisticsDialogProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!aircraft) return null

  // Theme-aware styles
  const styles = {
    // Background colors
    dialogBg: theme === "light" ? "bg-white" : "bg-black",
    sectionBg: theme === "light" ? "bg-slate-50" : "bg-gray-900",
    cardBg: theme === "light" ? "bg-white" : "bg-gray-800",

    // Text colors
    textPrimary: theme === "light" ? "text-gray-900" : "text-white",
    textSecondary: theme === "light" ? "text-gray-700" : "text-gray-300",
    textMuted: theme === "light" ? "text-gray-500" : "text-gray-400",
    textHighlight: theme === "light" ? "text-blue-600" : "text-blue-400",

    // Borders
    border: theme === "light" ? "border-gray-200" : "border-gray-800",
    divider: theme === "light" ? "border-gray-200" : "border-gray-700",

    // Hover states
    hoverBg: theme === "light" ? "hover:bg-gray-100" : "hover:bg-gray-800",

    // Shadows
    shadow: theme === "light" ? "shadow-sm" : "",
    cardShadow: theme === "light" ? "shadow-sm" : "",
  }

  // Mock data for the pre-flight dashboard
  const flightData = {
    passengerLoad: {
      totalBooked: 186,
      noShowRate: "4.2%",
      standbyCount: 5,
    },
    checkInStatus: {
      passengersCheckedIn: "62%",
      passengersSecurityCleared: "38%",
    },
    specialHandling: {
      wheelchairAssistance: 3,
      vipPassengers: 2,
      unaccompaniedMinors: 1,
    },
    baggageForecast: {
      estimatedCount: 214,
      preloadedBaggage: 0,
    },
    disruptions: {
      overbookingStatus: "None",
      expectedDelays: aircraft.status === "Delayed" ? "Warning" : "None",
      delayBreakdown: {
        controllable: aircraft.status === "Delayed" ? 12 : 0, // Minutes of controllable delay
        uncontrollable: aircraft.status === "Delayed" ? 8 : 0, // Minutes of uncontrollable delay
      },
    },
  }

  // Calculate some derived metrics for visualization
  const checkedInPercent = Number.parseInt(flightData.checkInStatus.passengersCheckedIn)
  const securityClearedPercent = Number.parseInt(flightData.checkInStatus.passengersSecurityCleared)
  const estimatedBagsPerPassenger = flightData.baggageForecast.estimatedCount / flightData.passengerLoad.totalBooked
  const totalSpecialHandling =
    flightData.specialHandling.wheelchairAssistance +
    flightData.specialHandling.vipPassengers +
    flightData.specialHandling.unaccompaniedMinors
  const totalDelayMinutes =
    flightData.disruptions.delayBreakdown.controllable + flightData.disruptions.delayBreakdown.uncontrollable

  // Don't render with theme-specific styles until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[500px] ${styles.dialogBg} border ${styles.border} ${styles.textPrimary} p-0 max-h-[90vh] overflow-hidden flex flex-col ${styles.shadow}`}
      >
        <div className={`p-4 border-b ${styles.border} flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${styles.textPrimary}`}>
            Passenger Information
            <div className={`text-sm font-normal ${styles.textMuted} mt-1`}>
              {aircraft.registration} • {aircraft.departureFlight}
            </div>
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className={`${styles.textMuted} ${styles.hoverBg} p-1 rounded-full`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Status Dashboard */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.cardShadow} border ${styles.border}`}>
              <div className="grid grid-cols-2 gap-3">
                {/* Check-in Progress */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <CircularProgress
                      percentage={checkedInPercent}
                      size={70}
                      strokeWidth={7}
                      color="#60a5fa"
                      theme={theme || "dark"}
                    />
                    <div className="absolute top-0 left-0 bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center">
                      <UserCheck className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className={`text-xs text-center mt-1 ${styles.textSecondary}`}>Check-in</div>
                </div>

                {/* Security Clearance */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <CircularProgress
                      percentage={securityClearedPercent}
                      size={70}
                      strokeWidth={7}
                      color={securityClearedPercent >= 50 ? "#10b981" : "#f59e0b"}
                      theme={theme || "dark"}
                    />
                    <div className="absolute top-0 left-0 bg-amber-500 w-5 h-5 rounded-full flex items-center justify-center">
                      <ShieldCheck className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className={`text-xs text-center mt-1 ${styles.textSecondary}`}>Security</div>
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t ${styles.divider}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-green-400" />
                    <span className={`text-xs ${styles.textSecondary}`}>Status:</span>
                  </div>
                  <StatusBadge status={flightData.disruptions.expectedDelays} theme={theme || "dark"} />
                </div>
                <div className={`text-xs ${styles.textMuted} mt-1`}>
                  {aircraft.status === "Delayed" ? "Potential delay expected" : "No disruptions expected"}
                </div>
              </div>
            </div>

            {/* Expected Passenger Load */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.cardShadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Expected Passenger Load</h2>
                <Users className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="space-y-3">
                {/* Total booked visualization */}
                <div className="flex items-center">
                  <div
                    className={`${styles.cardBg} rounded-lg mr-3 border ${styles.border} w-16 h-16 flex items-center justify-center`}
                  >
                    <span className="text-2xl font-bold">{flightData.passengerLoad.totalBooked}</span>
                  </div>
                  <div>
                    <div className={`text-sm ${styles.textSecondary}`}>Total booked passengers</div>
                  </div>
                </div>

                {/* Passenger load visualization */}
                {/* 
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs ${styles.textMuted}`}>Expected passengers:</span>
                    <span className="text-xs font-medium">
                      {Math.round(
                        flightData.passengerLoad.totalBooked *
                          (1 - Number.parseInt(flightData.passengerLoad.noShowRate) / 100),
                      )}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="h-3 w-1 rounded-sm"
                        style={{
                          backgroundColor: i < 19 ? "#60a5fa" : "#f87171",
                          opacity: i % 3 === 0 ? 1 : 0.7,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                */}
              </div>
            </div>

            {/* Check-in & Security Status */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.cardShadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Check-in & Security Status</h2>
                <ShieldCheck className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${styles.textSecondary}`}>Passengers checked in:</span>
                    <span className="text-sm font-medium">{flightData.checkInStatus.passengersCheckedIn}</span>
                  </div>
                  <HorizontalGauge value={checkedInPercent} max={100} color="#60a5fa" theme={theme || "dark"} />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${styles.textSecondary}`}>Passengers cleared security:</span>
                    <span className="text-sm font-medium">{flightData.checkInStatus.passengersSecurityCleared}</span>
                  </div>
                  <HorizontalGauge
                    value={securityClearedPercent}
                    max={100}
                    color={securityClearedPercent >= 50 ? "#10b981" : "#f59e0b"}
                    theme={theme || "dark"}
                  />
                </div>
              </div>
            </div>

            {/* Special Handling Requirements */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.cardShadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Special Handling Requirements</h2>
                <UserCheck className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center border ${styles.border}`}>
                  <span className="text-lg font-semibold">{flightData.specialHandling.wheelchairAssistance}</span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Wheelchair</span>
                </div>
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center border ${styles.border}`}>
                  <span className="text-lg font-semibold">{flightData.specialHandling.vipPassengers}</span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>VIP</span>
                </div>
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center border ${styles.border}`}>
                  <span className="text-lg font-semibold">{flightData.specialHandling.unaccompaniedMinors}</span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Minors</span>
                </div>
              </div>

              {/* Special handling indicator */}
              {totalSpecialHandling > 0 && (
                <div className={`mt-3 ${styles.cardBg} p-2 rounded-md border ${styles.border}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${styles.textSecondary}`}>Special handling ratio:</span>
                    <span className="text-xs font-medium">
                      {((totalSpecialHandling / flightData.passengerLoad.totalBooked) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <HorizontalGauge
                    value={totalSpecialHandling}
                    max={flightData.passengerLoad.totalBooked}
                    color="#a855f7"
                    height={4}
                    theme={theme || "dark"}
                  />
                </div>
              )}
            </div>

            {/* Baggage Forecast */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.cardShadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Baggage Forecast</h2>
                <Briefcase className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="flex items-center mb-3">
                <div className="relative w-14 h-14 mr-3">
                  <CircularProgress
                    percentage={Math.min(
                      (flightData.baggageForecast.preloadedBaggage / flightData.baggageForecast.estimatedCount) * 100,
                      100,
                    )}
                    size={56}
                    strokeWidth={6}
                    showPercentage={false}
                    color="#60a5fa"
                    theme={theme || "dark"}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Briefcase className={`h-6 w-6 ${styles.textMuted}`} />
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <span className="text-2xl font-bold">{flightData.baggageForecast.estimatedCount}</span>
                    <span className={`text-xs ${styles.textMuted} ml-1 self-end mb-1`}>estimated</span>
                  </div>
                  <div className={`text-sm ${styles.textSecondary}`}>bags total</div>
                </div>
              </div>

              {/* Bags per passenger stat */}
              <div className={`${styles.cardBg} p-2 rounded-md border ${styles.border}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs ${styles.textSecondary}`}>Bags per passenger:</span>
                  <span className="text-xs font-medium">{estimatedBagsPerPassenger.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(Math.ceil(estimatedBagsPerPassenger * 2), 5))].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-blue-500 rounded-sm opacity-80"></div>
                  ))}
                  {[...Array(5 - Math.min(Math.ceil(estimatedBagsPerPassenger * 2), 5))].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 ${theme === "light" ? "bg-gray-300" : "bg-gray-600"} rounded-sm`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Potential Disruptions */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.cardShadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Potential Disruptions</h2>
                <AlertTriangle className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="space-y-3">
                <div className={`flex justify-between items-center pb-2 border-b ${styles.divider}`}>
                  <span className={`text-sm ${styles.textSecondary}`}>Overbooking status:</span>
                  <StatusBadge status={flightData.disruptions.overbookingStatus} theme={theme || "dark"} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${styles.textSecondary}`}>Expected delays:</span>
                    <StatusBadge status={flightData.disruptions.expectedDelays} theme={theme || "dark"} />
                  </div>

                  {totalDelayMinutes > 0 && (
                    <div className={`${styles.cardBg} p-2 rounded-md mt-2 border ${styles.border}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs ${styles.textSecondary}`}>Delay breakdown:</span>
                        <span className="text-xs font-medium">{totalDelayMinutes} min total</span>
                      </div>

                      {/* Controllable delays */}
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                            <span className={`text-xs ${styles.textSecondary}`}>Controllable:</span>
                          </div>
                          <span className="text-xs font-medium">
                            {flightData.disruptions.delayBreakdown.controllable} min
                          </span>
                        </div>
                        <HorizontalGauge
                          value={flightData.disruptions.delayBreakdown.controllable}
                          max={totalDelayMinutes}
                          color="#f97316"
                          height={4}
                          theme={theme || "dark"}
                        />
                      </div>

                      {/* Uncontrollable delays */}
                      <div className="mt-2">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                            <span className={`text-xs ${styles.textSecondary}`}>Uncontrollable:</span>
                          </div>
                          <span className="text-xs font-medium">
                            {flightData.disruptions.delayBreakdown.uncontrollable} min
                          </span>
                        </div>
                        <HorizontalGauge
                          value={flightData.disruptions.delayBreakdown.uncontrollable}
                          max={totalDelayMinutes}
                          color="#3b82f6"
                          height={4}
                          theme={theme || "dark"}
                        />
                      </div>

                      <div className={`text-xs ${styles.textMuted} mt-2`}>
                        {flightData.disruptions.delayBreakdown.controllable >
                        flightData.disruptions.delayBreakdown.uncontrollable
                          ? "Majority of delay is controllable"
                          : "Majority of delay is due to external factors"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
