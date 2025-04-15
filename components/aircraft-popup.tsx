"use client"

import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"

interface AircraftPopupProps {
  aircraft: {
    id: string
    position: [number, number]
    registration?: string
    flightNumber?: string
    outbound?: string
    gate?: string
    statuses?: {
      OTP: string
      HEALTH: string
      OPS: string
      TCM: string
      MCC: string
      ATA: string
    }
  }
  position: { x: number; y: number }
  onClose: () => void
  onViewDetails: (aircraft: any) => void
}

export function AircraftPopup({ aircraft, position, onClose, onViewDetails }: AircraftPopupProps) {
  const { theme, mounted } = useTheme()
  const [isLightTheme, setIsLightTheme] = useState(false)

  useEffect(() => {
    setIsLightTheme(theme === "light")
  }, [theme])

  // Only render theme-specific styles after mounting to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div
      className={`fixed z-50 ${isLightTheme ? "bg-white/95 border-gray-300" : "bg-gray-900/95 border-gray-700"} border rounded-md shadow-lg w-64 aircraft-popup`}
      style={{
        left: position.x + "px",
        top: position.y + "px",
      }}
    >
      <div className="p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className={`${isLightTheme ? "text-gray-900" : "text-white"} font-mono`}>
              {aircraft.registration}
            </span>
            <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded">B737</span>
          </div>
          <button
            onClick={onClose}
            className={`${isLightTheme ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}
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
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
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
                className="text-blue-400"
              >
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
              <span className={`${isLightTheme ? "text-gray-600" : "text-gray-300"} text-sm`}>Flight</span>
            </div>
            <span className={`${isLightTheme ? "text-gray-900" : "text-white"} text-sm`}>{aircraft.flightNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
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
                className="text-blue-400"
              >
                <path d="m6 19 5-5-5-5" />
              </svg>
              <span className={`${isLightTheme ? "text-gray-600" : "text-gray-300"} text-sm`}>Inbound</span>
            </div>
            <span className={`${isLightTheme ? "text-gray-900" : "text-white"} text-sm`}>{aircraft.inbound}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
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
                className="text-blue-400"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className={`${isLightTheme ? "text-gray-600" : "text-gray-300"} text-sm`}>Gate</span>
            </div>
            <span className={`${isLightTheme ? "text-gray-900" : "text-white"} text-sm`}>{aircraft.gate}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            className={`text-xs py-1 px-2 rounded ${aircraft.statuses?.OTP === "green" ? "bg-green-600" : "bg-orange-500"} text-white`}
          >
            OTP
          </button>
          <button
            className={`text-xs py-1 px-2 rounded ${aircraft.statuses?.HEALTH === "green" ? "bg-green-600" : "bg-orange-500"} text-white`}
          >
            HEALTH
          </button>
          <button
            className={`text-xs py-1 px-2 rounded ${aircraft.statuses?.OPS === "green" ? "bg-green-600" : "bg-orange-500"} text-white`}
          >
            OPS
          </button>
          <button
            className={`text-xs py-1 px-2 rounded ${aircraft.statuses?.TCM === "green" ? "bg-green-600" : "bg-orange-500"} text-white`}
          >
            TCM
          </button>
          <button
            className={`text-xs py-1 px-2 rounded ${aircraft.statuses?.MCC === "green" ? "bg-green-600" : "bg-orange-500"} text-white`}
          >
            MCC
          </button>
          <button
            className={`text-xs py-1 px-2 rounded ${aircraft.statuses?.ATA === "green" ? "bg-green-600" : "bg-orange-500"} text-white`}
          >
            ATA
          </button>
        </div>

        <button
          onClick={() => onViewDetails(aircraft)}
          className={`w-full py-2 px-3 ${isLightTheme ? "bg-gray-200/80 hover:bg-gray-300/80 text-gray-900" : "bg-black/50 hover:bg-black/70 text-white"} text-sm rounded flex items-center justify-between`}
        >
          <span>View Details</span>
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
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
