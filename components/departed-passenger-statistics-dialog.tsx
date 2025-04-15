"use client"

import { X, Clock, Users, Briefcase, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useTheme } from "@/components/theme-provider"

interface AircraftData {
  registration: string
  arrivalFlight: string
  departureFlight: string
  scheduledArrival: string
  actualArrival: string
  scheduledDeparture: string
  actualDeparture: string
  status: string
  statusColor: string
}

interface DepartedPassengerStatisticsDialogProps {
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

  // Theme-aware background color
  const bgStrokeColor = theme === "dark" ? "#1e293b" : "#e2e8f0"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgStrokeColor} strokeWidth={strokeWidth} />
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
            className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            style={{ fontSize: textSize }}
          >
            {percentage}%
          </span>
        </div>
      )}
    </div>
  )
}

// Better satisfaction score visualization component
const SatisfactionScore = ({ score, maxScore = 5, theme = "dark" }) => {
  const numericScore = Number.parseFloat(score)
  const percentage = (numericScore / maxScore) * 100

  // Color selection based on score
  let color = "#ef4444" // red-500
  if (numericScore >= 4)
    color = "#10b981" // green-500
  else if (numericScore >= 3) color = "#f59e0b" // amber-500

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center mb-1">
        <span className="text-lg font-bold" style={{ color }}>
          {score}
        </span>
        <span className={`text-xs ml-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>/{maxScore}</span>
      </div>
      <div className={`w-full rounded-full h-1.5 mt-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

// Horizontal gauge component
const HorizontalGauge = ({ value, max, color, height = 8, showLabel = false, theme = "dark" }) => {
  const percentage = (value / max) * 100
  return (
    <div className="w-full">
      <div
        className={`w-full rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
        style={{ height }}
      >
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
          <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {value}/{max}
          </span>
        </div>
      )}
    </div>
  )
}

// Time difference component
const TimeDifference = ({ scheduledTime, actualTime, variance, theme = "dark" }) => {
  const isDelay = variance.includes("+")
  const color = isDelay ? "text-amber-500" : "text-green-500"

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 flex items-center">
        <div className={`w-3 h-3 rounded-full ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}></div>
        <div className={`w-full h-0.5 ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}></div>
        <div className={`w-3 h-3 rounded-full ${isDelay ? "bg-amber-500" : "bg-green-500"}`}></div>
      </div>
      <div className={`font-medium ${color}`}>{variance}</div>
    </div>
  )
}

export function DepartedPassengerStatisticsDialog({
  open,
  onOpenChange,
  aircraft,
}: DepartedPassengerStatisticsDialogProps) {
  const { theme, mounted } = useTheme()

  // Determine if we're in light or dark mode
  const currentTheme = mounted && theme ? theme : "dark"
  const isLightTheme = currentTheme === "light"

  // Theme-aware styling
  const styles = {
    // Backgrounds
    dialogBg: isLightTheme ? "bg-white" : "bg-black",
    sectionBg: isLightTheme ? "bg-slate-50" : "bg-gray-800",
    cardBg: isLightTheme ? "bg-white border border-slate-200" : "bg-gray-700",
    highlightBg: isLightTheme ? "bg-blue-50" : "bg-gray-700",

    // Text colors
    textPrimary: isLightTheme ? "text-gray-900" : "text-white",
    textSecondary: isLightTheme ? "text-gray-600" : "text-gray-300",
    textMuted: isLightTheme ? "text-gray-500" : "text-gray-400",
    textHighlight: isLightTheme ? "text-blue-600" : "text-blue-400",

    // Borders
    border: isLightTheme ? "border-slate-200" : "border-gray-800",
    divider: isLightTheme ? "border-gray-200" : "border-gray-700",

    // Hover states
    hoverBg: isLightTheme ? "hover:bg-slate-100" : "hover:bg-gray-800",
    hoverText: isLightTheme ? "hover:text-gray-900" : "hover:text-white",

    // Shadows
    shadow: isLightTheme ? "shadow-sm" : "",
  }

  if (!aircraft) return null

  // Calculate delay in minutes
  const getDelayMinutes = () => {
    if (!aircraft.scheduledDeparture || !aircraft.actualDeparture) return 0

    const scheduled = new Date(`2023-01-01T${aircraft.scheduledDeparture}:00`)
    const actual = new Date(`2023-01-01T${aircraft.actualDeparture}:00`)
    return Math.floor((actual.getTime() - scheduled.getTime()) / 60000)
  }

  const delayMinutes = getDelayMinutes()
  const isDelayed = delayMinutes > 15

  // Flight data
  const flightData = {
    flightCode: `${aircraft.registration} • ${aircraft.departureFlight}`,
    passengerStats: {
      totalDeparted: 142,
      missed: 3,
      lastMinuteChanges: "5 (2 upgrades, 3 downgrades)",
    },
    baggageReconciliation: {
      totalLoaded: 187,
      mishandled: 1,
      leftBehind: 0,
    },
    onTimePerformance: {
      scheduledDeparture: aircraft.scheduledDeparture,
      actualDeparture: aircraft.actualDeparture,
      variance: delayMinutes > 0 ? `+${delayMinutes} minutes` : "On time",
    },
    irregularities: {
      deniedBoarding: 0,
      voluntaryOffloads: 1,
      involuntaryOffloads: 0,
    },
    feedback: {
      complaints: 2,
      issuesCategory: "Seating (1), Baggage (1)",
      satisfactionScore: "4.2/5.0",
    },
  }

  // Calculate passenger satisfaction as percentage
  const satisfactionPercentage = (Number.parseFloat(flightData.feedback.satisfactionScore) / 5) * 100
  const satisfactionScore = Number.parseFloat(flightData.feedback.satisfactionScore)

  // Calculate time efficiency
  const timeEfficiency = Math.max(100 - delayMinutes * 2, 0) // 15 min delay = 70% efficiency

  // Calculate baggage efficiency
  const totalBaggage = flightData.baggageReconciliation.totalLoaded
  const problematicBaggage = flightData.baggageReconciliation.mishandled + flightData.baggageReconciliation.leftBehind
  const baggageEfficiency = ((totalBaggage - problematicBaggage) / totalBaggage) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[500px] ${styles.dialogBg} border ${styles.border} ${styles.textPrimary} p-0 ${isLightTheme ? "shadow-md" : ""}`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${styles.border} flex justify-between items-center`}>
          <h2 className={`text-xl font-bold ${styles.textPrimary}`}>
            Passenger Information
            <div className={`text-sm font-normal ${styles.textMuted} mt-1`}>{flightData.flightCode}</div>
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className={`${styles.textMuted} ${styles.hoverText} p-1 rounded-full ${styles.hoverBg}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Key Performance Indicators */}
          <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.shadow} border ${styles.border} mb-4`}>
            <div className="grid grid-cols-3 gap-3">
              {/* Passenger Satisfaction */}
              {/*<div className="flex flex-col items-center">
                <div className="relative">
                  <CircularProgress
                    percentage={Math.round(satisfactionPercentage)}
                    size={60}
                    strokeWidth={6}
                    showPercentage={false}
                    color={satisfactionScore >= 4 ? "#10b981" : satisfactionScore >= 3 ? "#f59e0b" : "#ef4444"}
                    theme={currentTheme}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-base font-bold ${styles.textPrimary}`}>{satisfactionScore.toFixed(1)}</span>
                  </div>
                </div>
                <div className={`text-xs text-center mt-1 ${styles.textSecondary}`}>Satisfaction</div>
              </div>*/}

              {/* On-Time Performance */}
              <div className="flex flex-col items-center">
                <CircularProgress
                  percentage={timeEfficiency}
                  size={60}
                  strokeWidth={6}
                  textSize={14}
                  color={timeEfficiency >= 90 ? "#10b981" : "#f59e0b"}
                  theme={currentTheme}
                />
                <div className={`text-xs text-center mt-1 ${styles.textSecondary}`}>Punctuality</div>
              </div>

              {/* Baggage Performance */}
              <div className="flex flex-col items-center">
                <CircularProgress
                  percentage={Math.round(baggageEfficiency)}
                  size={60}
                  strokeWidth={6}
                  textSize={14}
                  color={baggageEfficiency >= 99 ? "#10b981" : "#f59e0b"}
                  theme={currentTheme}
                />
                <div className={`text-xs text-center mt-1 ${styles.textSecondary}`}>Baggage</div>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-base">
            {/* Final Passenger Stats */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Final Passenger Stats</h2>
                <Users className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="space-y-3">
                {/* Total passengers departed */}
                <div className="flex justify-between mb-2">
                  <span className={`text-sm ${styles.textSecondary}`}>Total passengers departed:</span>
                  <span className={`text-sm font-medium ${styles.textPrimary}`}>
                    {flightData.passengerStats.totalDeparted}
                  </span>
                </div>

                {/* Offloaded passenger visualization */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${styles.textSecondary}`}>Missed passengers:</span>
                    <span className="text-sm font-medium text-amber-500">{flightData.passengerStats.missed}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-1 rounded-full ${i < 30 - flightData.passengerStats.missed ? "bg-blue-500" : "bg-amber-500"}`}
                        style={{ opacity: i % 3 === 0 ? 1 : 0.7 }}
                      ></div>
                    ))}
                    <span className={`text-xs ${styles.textMuted}`}>•••</span>
                  </div>
                </div>

                {/* Last-minute changes */}
                <div className={`flex items-start space-x-2 mt-3 ${styles.cardBg} p-2 rounded`}>
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <div className={`text-sm ${styles.textSecondary}`}>Last-minute changes:</div>
                    <div className="text-xs mt-1">
                      <span className={isLightTheme ? "text-green-600" : "text-green-400"}>2 upgrades</span>,{" "}
                      <span className={isLightTheme ? "text-red-600" : "text-red-400"}>3 downgrades</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Baggage Reconciliation */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Baggage Reconciliation</h2>
                <Briefcase className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center`}>
                  <span className={`text-xl font-semibold ${styles.textPrimary}`}>
                    {flightData.baggageReconciliation.totalLoaded}
                  </span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Total Bags</span>
                </div>
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center`}>
                  <span
                    className={
                      isLightTheme ? "text-xl font-semibold text-amber-500" : "text-xl font-semibold text-amber-400"
                    }
                  >
                    {flightData.baggageReconciliation.mishandled}
                  </span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Mishandled</span>
                </div>
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center`}>
                  <span
                    className={
                      isLightTheme ? "text-xl font-semibold text-green-600" : "text-xl font-semibold text-green-400"
                    }
                  >
                    {flightData.baggageReconciliation.leftBehind}
                  </span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Left Behind</span>
                </div>
              </div>

              {/* Bags per passenger ratio */}
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${styles.textSecondary}`}>Bags per passenger:</span>
                  <span className={`text-xs font-medium ${styles.textPrimary}`}>
                    {(flightData.baggageReconciliation.totalLoaded / flightData.passengerStats.totalDeparted).toFixed(
                      1,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* On-Time Performance */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>On-Time Performance</h2>
                <Clock className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className={`${styles.cardBg} rounded-md p-2`}>
                    <div className={`text-xs ${styles.textMuted}`}>Scheduled</div>
                    <div className={`text-lg font-semibold ${styles.textPrimary}`}>
                      {flightData.onTimePerformance.scheduledDeparture}
                    </div>
                  </div>
                  <div className={`${styles.cardBg} rounded-md p-2`}>
                    <div className={`text-xs ${styles.textMuted}`}>Actual</div>
                    <div className={`text-lg font-semibold ${styles.textPrimary}`}>
                      {flightData.onTimePerformance.actualDeparture}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className={`text-xs ${styles.textSecondary} mb-1`}>Departure variance:</div>
                  <TimeDifference
                    scheduledTime={flightData.onTimePerformance.scheduledDeparture}
                    actualTime={flightData.onTimePerformance.actualDeparture}
                    variance={flightData.onTimePerformance.variance}
                    theme={currentTheme}
                  />
                </div>

                {isDelayed && (
                  <div className={`${styles.cardBg} p-2 rounded mt-2`}>
                    <div className={`text-xs ${styles.textSecondary}`}>Delay reasons:</div>
                    <div className={`text-sm mt-1 ${styles.textPrimary}`}>Late connecting passengers (2)</div>
                  </div>
                )}
              </div>
            </div>

            {/* Irregularities */}
            <div className={`${styles.sectionBg} rounded-lg p-4 ${styles.shadow} border ${styles.border}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className={`${styles.textHighlight} font-medium text-sm`}>Post-Flight Irregularities</h2>
                <AlertTriangle className={`h-4 w-4 ${styles.textHighlight}`} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center`}>
                  <span className={`text-lg font-semibold ${styles.textPrimary}`}>
                    {flightData.irregularities.deniedBoarding}
                  </span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Denied Boarding</span>
                </div>
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center`}>
                  <span className={`text-lg font-semibold ${styles.textPrimary}`}>
                    {flightData.irregularities.voluntaryOffloads}
                  </span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Voluntary Offloads</span>
                </div>
                <div className={`${styles.cardBg} rounded-md p-2 flex flex-col items-center`}>
                  <span className={`text-lg font-semibold ${styles.textPrimary}`}>
                    {flightData.irregularities.involuntaryOffloads}
                  </span>
                  <span className={`text-xs text-center ${styles.textSecondary}`}>Involuntary Offloads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
