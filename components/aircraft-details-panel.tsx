"use client"

import { useState } from "react"
import { X, Phone, User, ArrowRight, Clock, AlertTriangle, Shield, Grid3X3, MessageCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface AircraftDetailsPanelProps {
  aircraft: {
    id: string
    registration: string
    type: string
    flight: string
    outboundFlight?: string
    origin: string
    destination: string
    gate: string
    bay?: string
    statuses: {
      OTP: string
      HEALTH: string
      OPS: string
      TCM: string
      MCC: string
      ATA: string
    }
  }
  open: boolean
  onClose: () => void
}

export default function AircraftDetailsPanel({ aircraft, open, onClose }: AircraftDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState("FLIGHT")
  const [showAlertPopup, setShowAlertPopup] = useState(false)
  const [showMessagePopup, setShowMessagePopup] = useState(false)
  const [showGridPopup, setShowGridPopup] = useState(false)

  if (!open) return null

  // Calculate mock remaining time (49 minutes in the example)
  const remainingMinutes = 49
  const remainingHours = Math.floor(remainingMinutes / 60)
  const remainingMins = remainingMinutes % 60

  // Mock data for the panel
  const today = new Date()
  const dateString = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Mock times
  const scheduledTime = "12:00"
  const actualTime = "12:04"
  const finalTime = "13:36"

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-black border-l border-gray-800 z-50 overflow-y-auto">
      {/* Header with close button */}
      <div className="p-3 border-b border-gray-800">
        <div className="grid grid-cols-3 w-full gap-4">
          <div>
            <div className="text-[10px] text-gray-400">A/C REG NO.</div>
            <div className="text-white font-mono text-sm">{aircraft.registration}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400">FLEET TYPE</div>
            <div className="text-white text-sm">{aircraft.type}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400">DEP. BAY NO.</div>
            <div className="text-white text-sm">{aircraft.bay || "E60"}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      {/* Aircraft visualization with progress */}
      <div className="p-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center">
          {/* Aircraft icon */}
          <div className="w-24 h-24 relative flex-shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <path
                  d="M50,20 L70,50 L60,55 L60,70 L50,75 L40,70 L40,55 L30,50 Z"
                  fill="#FF4500"
                  stroke="#FFD700"
                  strokeWidth="2"
                />
                <text x="45" y="48" fill="white" fontSize="10">
                  OUT
                </text>
                <text x="45" y="58" fill="white" fontSize="10">
                  IN
                </text>
              </svg>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1 ml-4">
            <div className="flex justify-between text-[10px] text-blue-400 mb-1">
              <div className="flex flex-col items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <span>START</span>
              </div>
              <div className="flex flex-col items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <span>FINAL</span>
              </div>
            </div>
            <div className="relative">
              <Progress value={30} className="h-3 bg-gray-700" indicatorClassName="bg-amber-500" />
              <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center text-[10px] text-white font-medium">
                {`${remainingHours}h${remainingMins}m Remaining`}
              </div>
            </div>
          </div>
        </div>

        {/* ETD and STD times */}
        <div className="mt-3 bg-gray-950 rounded-md p-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <Clock size={14} className="text-blue-400 mr-1" />
              <span className="text-[10px] text-blue-400 mr-1">ETD</span>
              <span className="text-xs text-white">{dateString}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="text-blue-400 mr-1" />
              <span className="text-[10px] text-blue-400 mr-1">STD</span>
              <span className="text-xs text-white">{dateString}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="p-3 bg-gray-900 border-b border-gray-800">
        <div className="flex justify-around">
          <div
            className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center cursor-pointer"
            onClick={() => setShowAlertPopup(true)}
          >
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Shield size={20} className="text-amber-500" />
          </div>
          <div
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer"
            onClick={() => setShowGridPopup(true)}
          >
            <Grid3X3 size={20} className="text-blue-500" />
          </div>
          <div
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer"
            onClick={() => setShowMessagePopup(true)}
          >
            <MessageCircle size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* Alert Popup */}
      {showAlertPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-md w-[500px] shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white text-lg font-medium">Mark Aircraft as AOG</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowAlertPopup(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Form content */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Aircraft Registration</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                  value={aircraft.registration}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Airport Location</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                  value="YYZ"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="emv-continuation" className="h-4 w-4 bg-gray-800 border-gray-700 rounded" />
                <label htmlFor="emv-continuation" className="ml-2 text-white text-sm">
                  L/R EMV Continuation
                </label>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Primary Root Cause</label>
                <div className="relative">
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white appearance-none">
                    <option value="">Select Primary Root Cause</option>
                    <option value="Parts">Parts</option>
                    <option value="Planning">Planning</option>
                    <option value="Findings">Findings</option>
                    <option value="Workload">Workload</option>
                    <option value="Damage">Damage</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Tooling">Tooling</option>
                    <option value="Weather">Weather</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Tech Records">Tech Records</option>
                    <option value="Powerplant">Powerplant</option>
                    <option value="SOC">SOC</option>
                    <option value="Airports">Airports</option>
                    <option value="Performance">Performance</option>
                    <option value="I/B Defect">I/B Defect</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Secondary Root Cause</label>
                <div className="relative">
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white appearance-none">
                    <option value="">Select Secondary Root Cause</option>
                    <option value="Parts">Parts</option>
                    <option value="Planning">Planning</option>
                    <option value="Findings">Findings</option>
                    <option value="Workload">Workload</option>
                    <option value="Damage">Damage</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Tooling">Tooling</option>
                    <option value="Weather">Weather</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Tech Records">Tech Records</option>
                    <option value="Powerplant">Powerplant</option>
                    <option value="SOC">SOC</option>
                    <option value="Airports">Airports</option>
                    <option value="Performance">Performance</option>
                    <option value="I/B Defect">I/B Defect</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs mb-1">Root Cause Reason</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white h-20"
                  placeholder="Enter reason..."
                ></textarea>
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="preventable" className="h-4 w-4 bg-gray-800 border-gray-700 rounded" />
                <label htmlFor="preventable" className="ml-2 text-white text-sm">
                  Was the AOG Preventable?
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-800">
              <button
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                onClick={() => setShowAlertPopup(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Popup */}
      {showGridPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-md w-[500px] shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-white text-lg font-medium">Messages</h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowGridPopup(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-center h-40">
                <span className="text-gray-400">Message content will be displayed here</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-800">
              <button
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                onClick={() => setShowGridPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Popup */}
      {showMessagePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-50 border border-gray-200 rounded-md w-[500px] shadow-lg flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
              <h3 className="text-gray-800 text-base font-medium">Aircraft Chat - {aircraft.registration}</h3>
              <div className="flex items-center gap-2">
                <button className="text-blue-500 hover:text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </button>
                <button className="text-blue-500 hover:text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </button>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowMessagePopup(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              {/* System Message 1 */}
              <div className="flex justify-end mb-4">
                <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-xs">
                  <p className="text-sm">Non routine maintenance needed</p>
                  <p className="text-xs text-right mt-1 text-blue-100">2:33</p>
                </div>
              </div>

              {/* System Message 2 */}
              <div className="flex justify-end mb-4">
                <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-xs">
                  <p className="text-sm">
                    Lubricate the main Landing Gear assembly and actuating mechanism – RH Gear is needed
                  </p>
                  <p className="text-xs text-right mt-1 text-blue-100">2:34</p>
                </div>
              </div>

              {/* User Message 1 */}
              <div className="flex mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 flex-shrink-0">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="bg-white rounded-lg py-2 px-4 shadow-sm max-w-xs">
                  <p className="text-sm font-medium text-blue-600">Jacob Anderson</p>
                  <p className="text-sm">Please refer Task Card Number: 8-12-090-00-02</p>
                  <p className="text-sm mt-2">Inspect below and adhere to method of application Zerk</p>
                  <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src="/placeholder.svg?height=150&width=250"
                      alt="Maintenance diagram"
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">2:35</p>
                </div>
              </div>

              {/* System Message 3 */}
              <div className="flex justify-end mb-4">
                <div className="bg-blue-500 text-white rounded-lg py-2 px-4 max-w-xs">
                  <p className="text-sm">Sure, will do and report</p>
                  <p className="text-xs text-right mt-1 text-blue-100">2:39</p>
                </div>
              </div>

              {/* User Message 2 */}
              <div className="flex mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 flex-shrink-0">
                  <User size={16} className="text-gray-600" />
                </div>
                <div className="bg-white rounded-lg py-2 px-4 shadow-sm max-w-xs">
                  <p className="text-sm font-medium text-blue-600">Jacob Anderson</p>
                  <p className="text-sm">Please refer below table</p>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-200 px-2 py-1">Item</th>
                          <th className="border border-gray-200 px-2 py-1">Description</th>
                          <th className="border border-gray-200 px-2 py-1">Location</th>
                          <th className="border border-gray-200 px-2 py-1">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-200 px-2 py-1">1</td>
                          <td className="border border-gray-200 px-2 py-1">Main Landing Gear</td>
                          <td className="border border-gray-200 px-2 py-1">RWB-335</td>
                          <td className="border border-gray-200 px-2 py-1">1</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 px-2 py-1">2</td>
                          <td className="border border-gray-200 px-2 py-1">Actuating Mechanism</td>
                          <td className="border border-gray-200 px-2 py-1">RWB-336</td>
                          <td className="border border-gray-200 px-2 py-1">1</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500">2:37</p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 bg-white">
              <div className="flex items-center">
                <button className="text-blue-500 p-1 hover:bg-gray-100 rounded-full mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="bg-blue-500 text-white p-2 rounded-full ml-2 hover:bg-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex overflow-x-auto">
          {["FLIGHT", "OTP", "HEALTH", "OPS", "TCM", "MCC", "ATA"].map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-3 py-2 text-xs font-medium whitespace-nowrap",
                activeTab === tab ? "text-white border-b-2 border-blue-500" : "text-blue-400 hover:text-white",
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content - conditionally render based on active tab */}
      <div className="p-3">
        {activeTab === "FLIGHT" && (
          <>
            {/* Inbound/Outbound flights */}
            <div className="border border-gray-800 rounded-md p-3 mb-3">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center text-blue-400 text-[10px] mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-1"
                    >
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    INBOUND
                  </div>
                  <div className="text-lg font-semibold text-white">{aircraft.flight}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end text-blue-400 text-[10px] mb-1">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-1"
                    >
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    OUTBOUND
                  </div>
                  <div className="text-lg font-semibold text-white">{aircraft.outboundFlight || "AC827"}</div>
                </div>
              </div>
            </div>

            {/* Origin/Destination */}
            <div className="flex justify-between mb-4">
              <div className="w-[45%] bg-gray-900 rounded-md p-3 flex items-center justify-center">
                <div className="text-xl font-semibold text-white">{aircraft.origin}</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center">
                  <ArrowRight size={16} className="text-white" />
                </div>
              </div>
              <div className="w-[45%] bg-gray-900 rounded-md p-3 flex items-center justify-center">
                <div className="text-xl font-semibold text-white">{aircraft.destination}</div>
              </div>
            </div>

            {/* Towing information */}
            <div className="border border-gray-800 rounded-md p-3 mb-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-blue-400 text-[10px] mb-2">
                    <Clock size={12} className="mr-1" />
                    PLANNED TOWING
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-800 rounded-md py-1 px-2 text-center text-white text-xs">E68</div>
                    <div className="bg-gray-800 rounded-md py-1 px-2 text-center text-white text-xs">E68</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold">{scheduledTime}</div>
                      <div className="text-[10px] text-gray-400">{dateString}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold">{scheduledTime}</div>
                      <div className="text-[10px] text-gray-400">{dateString}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-blue-400 text-[10px] mb-2">
                    <Clock size={12} className="mr-1" />
                    ACTUAL TOWING
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-800 rounded-md py-1 px-2 text-center text-white text-xs">E68</div>
                    <div className="bg-gray-800 rounded-md py-1 px-2 text-center text-white text-xs">E68</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold">{actualTime}</div>
                      <div className="text-[10px] text-gray-400">{dateString}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold">{finalTime}</div>
                      <div className="text-[10px] text-gray-400">{dateString}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flying engineer information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-800 rounded-md p-3">
                <div className="text-blue-400 text-[10px] mb-2">FLYING ENGINEER</div>
                <div className="flex items-center mb-1">
                  <User size={14} className="text-gray-400 mr-1" />
                  <span className="text-white text-xs">Daniel Smith</span>
                </div>
                <div className="flex items-center">
                  <Phone size={14} className="text-gray-400 mr-1" />
                  <span className="text-white text-xs">+1 416 234 4358</span>
                </div>
              </div>
              <div className="border border-gray-800 rounded-md p-3">
                <div className="text-blue-400 text-[10px] mb-2">FLYING ENGINEER</div>
                <div className="bg-gray-800 rounded-md py-1 px-3 flex items-center justify-center mt-3">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-1"
                  >
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                  <span className="text-white text-xs">Outbound</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "HEALTH" && (
          <>
            {/* Sub-tabs */}
            <div className="flex mb-4">
              <div className="flex items-center mr-4">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500 mr-2"></div>
                <span className="text-xs text-white">Task List</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full border-2 border-white mr-2"></div>
                <span className="text-xs text-gray-400">Other Information</span>
              </div>
            </div>

            {/* Task table */}
            <div className="bg-gray-900/50 rounded-md overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 bg-gray-800 py-2 px-3 text-[10px] text-gray-400 uppercase">
                <div className="col-span-3">Task ID</div>
                <div className="col-span-7">Task</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-gray-800">
                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-blue-400">100374192</div>
                  <div className="col-span-7 text-xs text-white">N038 L4 EMGY LT COME</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-blue-400">100374733</div>
                  <div className="col-span-7 text-xs text-white">N038 L4 EMGY LT COME</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-blue-400">100372854</div>
                  <div className="col-span-7 text-xs text-white">PANEL 511FB DAILY IN</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-blue-400">100382838</div>
                  <div className="col-span-7 text-xs text-white">TAIL NAV LT 1 LAMP I</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-blue-400">100381557</div>
                  <div className="col-span-7 text-xs text-white">R WING POS LT INOP</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-blue-400">100382839</div>
                  <div className="col-span-7 text-xs text-white">TAIL NAV LT 1 LAMP I</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-blue-400">100381556</div>
                  <div className="col-span-7 text-xs text-white">R WING POS LT INOP</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add other tab content here with similar conditional rendering */}
        {activeTab === "OTP" && (
          <div className="flex items-center justify-center h-40">
            <span className="text-gray-400">OTP content will be displayed here</span>
          </div>
        )}

        {activeTab === "OPS" && (
          <>
            {/* Filter dropdown */}
            <div className="mb-4">
              <div className="text-[10px] text-gray-400 mb-1">Filter by Department</div>
              <div className="relative">
                <select
                  className="w-full bg-transparent border border-blue-500 rounded-md py-1.5 px-3 text-white text-sm appearance-none"
                  defaultValue="LM"
                >
                  <option value="LM">LM</option>
                  <option value="ACM">ACM</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Messages table */}
            <div className="bg-gray-900/50 rounded-md overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 bg-gray-800 py-2 px-3 text-[10px] text-gray-400 uppercase">
                <div className="col-span-3">FLIGHT NO</div>
                <div className="col-span-3">DATE AND TIME</div>
                <div className="col-span-6">MESSAGE</div>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-gray-800">
                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-white flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    AC835
                  </div>
                  <div className="col-span-3 text-xs text-gray-400">14-Dec-23 16:24</div>
                  <div className="col-span-6 text-xs text-white">DURING WHEEL NBR 11 REPL...</div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-white flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    AC514
                  </div>
                  <div className="col-span-3 text-xs text-gray-400">14-Dec-23 14:45</div>
                  <div className="col-span-6 text-xs text-white">DURING WHEEL NBR 11 REPL...</div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-white flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    AC781
                  </div>
                  <div className="col-span-3 text-xs text-gray-400">22-Nov-23 14:51</div>
                  <div className="col-span-6 text-xs text-white">NO POWER TO IFE IN F/C AD...</div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-white flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    AC528
                  </div>
                  <div className="col-span-3 text-xs text-gray-400">22-Nov-23 14:26</div>
                  <div className="col-span-6 text-xs text-white">NO POWER TO IFE IN F/C T/S...</div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-white flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    AC161
                  </div>
                  <div className="col-span-3 text-xs text-gray-400">12-May-23 06:58</div>
                  <div className="col-span-6 text-xs text-white">L LANDING GEAR STRUT ACT...</div>
                </div>

                <div className="grid grid-cols-12 py-2 px-3 items-center">
                  <div className="col-span-3 text-xs text-white flex items-center">
                    <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    AC785
                  </div>
                  <div className="col-span-3 text-xs text-gray-400">09-May-23 00:21</div>
                  <div className="col-span-6 text-xs text-white">L LANDING GEAR STRUT ACT...</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "TCM" && (
          <div className="flex items-center justify-center h-40">
            <span className="text-gray-400">TCM content will be displayed here</span>
          </div>
        )}

        {activeTab === "MCC" && (
          <div className="bg-gray-900/50 rounded-md overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 bg-gray-800 py-2 px-3 text-[10px] text-gray-400 uppercase">
              <div className="col-span-3">CODE</div>
              <div className="col-span-4">FAULT</div>
              <div className="col-span-5">DESCRIPTION</div>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-gray-800">
              <div className="grid grid-cols-12 py-2 px-3 items-center">
                <div className="col-span-3 text-xs text-white flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  2100
                </div>
                <div className="col-span-4 text-xs text-gray-400">Hydraulic System 1...</div>
                <div className="col-span-5 text-xs text-white">The pressure in hydraulic syste...</div>
              </div>

              <div className="grid grid-cols-12 py-2 px-3 items-center">
                <div className="col-span-3 text-xs text-white flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  2150
                </div>
                <div className="col-span-4 text-xs text-gray-400">Hydraulic System 1...</div>
                <div className="col-span-5 text-xs text-white">The fluid level in hydraulic syst...</div>
              </div>

              <div className="grid grid-cols-12 py-2 px-3 items-center">
                <div className="col-span-3 text-xs text-white flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  2200
                </div>
                <div className="col-span-4 text-xs text-gray-400">Hydraulic System 2...</div>
                <div className="col-span-5 text-xs text-white">The pressure in hydraulic syste...</div>
              </div>

              <div className="grid grid-cols-12 py-2 px-3 items-center">
                <div className="col-span-3 text-xs text-white flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  2500
                </div>
                <div className="col-span-4 text-xs text-gray-400">Hydraulic Accumula...</div>
                <div className="col-span-5 text-xs text-white">The pressure in hydraulic accu...</div>
              </div>

              <div className="grid grid-cols-12 py-2 px-3 items-center">
                <div className="col-span-3 text-xs text-white flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  3000
                </div>
                <div className="col-span-4 text-xs text-gray-400">Engine System...</div>
                <div className="col-span-5 text-xs text-white">The engine temperature exceeds...</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ATA" && (
          <div className="flex items-center justify-center h-40">
            <span className="text-gray-400">ATA content will be displayed here</span>
          </div>
        )}
      </div>
    </div>
  )
}
