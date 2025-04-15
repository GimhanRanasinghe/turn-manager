"use client"

import { Clock, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Mock data for aircraft
const MOCK_AIRCRAFT = [
  {
    id: "AC1235",
    registration: "C-FGDZ",
    fleetType: "B777-300ER",
    remainingTime: "0h49m",
    depBayNo: "D24",
    inbound: "AC 105",
    outbound: "AC827",
    route: {
      origin: "YYZ",
      destination: "YVR",
    },
    direction: "OUTBOUND",
    flyingEng: "Daniel Smith",
    engMobNo: "+1 416 234 4358",
    etd: "13:45 January 29, 2025",
    std: "13:45 January 29, 2025",
    plannedTowing: {
      from: "E68",
      to: "E68",
    },
    plannedDate: {
      start: "12:00 January 29, 2025",
      end: "13:25 January 29, 2025",
    },
    actualTowing: {
      from: "E68",
      to: "E68",
    },
    actualDate: {
      start: "12:04 January 29, 2025",
      end: "13:36 January 29, 2025",
    },
    statuses: {
      flight: true,
      otp: true,
      health: true,
      ops: true,
      tcm: true,
      mcc: true,
      ata: true,
    },
  },
  {
    id: "AC456",
    registration: "C-FSIQ",
    fleetType: "B777-300ER",
    remainingTime: "0h49m",
    depBayNo: "F83",
    inbound: "AC 113",
    outbound: "AC827",
    route: {
      origin: "YYZ",
      destination: "YVR",
    },
    direction: "OUTBOUND",
    flyingEng: "Daniel Smith",
    engMobNo: "+1 416 234 4358",
    etd: "13:45 January 29, 2025",
    std: "13:45 January 29, 2025",
    plannedTowing: {
      from: "E68",
      to: "E68",
    },
    plannedDate: {
      start: "12:00 January 29, 2025",
      end: "13:25 January 29, 2025",
    },
    actualTowing: {
      from: "E68",
      to: "E68",
    },
    actualDate: {
      start: "12:04 January 29, 2025",
      end: "13:36 January 29, 2025",
    },
    statuses: {
      flight: true,
      otp: true,
      health: true,
      ops: true,
      tcm: true,
      mcc: true,
      ata: true,
    },
  },
  {
    id: "AC789",
    registration: "C-FGKP",
    fleetType: "B777-300ER",
    remainingTime: "0h49m",
    depBayNo: "D28",
    inbound: "AC 130",
    outbound: "AC827",
    route: {
      origin: "YYZ",
      destination: "YVR",
    },
    direction: "OUTBOUND",
    flyingEng: "Daniel Smith",
    engMobNo: "+1 416 234 4358",
    etd: "13:45 January 29, 2025",
    std: "13:45 January 29, 2025",
    plannedTowing: {
      from: "E68",
      to: "E68",
    },
    plannedDate: {
      start: "12:00 January 29, 2025",
      end: "13:25 January 29, 2025",
    },
    actualTowing: {
      from: "E68",
      to: "E68",
    },
    actualDate: {
      start: "12:04 January 29, 2025",
      end: "13:36 January 29, 2025",
    },
    statuses: {
      flight: true,
      otp: true,
      health: true,
      ops: true,
      tcm: true,
      mcc: true,
      ata: true,
    },
  },
  {
    id: "AC890",
    registration: "C-GJWD",
    fleetType: "B777-300ER",
    remainingTime: "0h49m",
    depBayNo: "D28",
    inbound: "AC 130",
    outbound: "AC827",
    route: {
      origin: "YYZ",
      destination: "YVR",
    },
    direction: "OUTBOUND",
    flyingEng: "Daniel Smith",
    engMobNo: "+1 416 234 4358",
    etd: "13:45 January 29, 2025",
    std: "13:45 January 29, 2025",
    plannedTowing: {
      from: "E68",
      to: "E68",
    },
    plannedDate: {
      start: "12:00 January 29, 2025",
      end: "13:25 January 29, 2025",
    },
    actualTowing: {
      from: "E68",
      to: "E68",
    },
    actualDate: {
      start: "12:04 January 29, 2025",
      end: "13:36 January 29, 2025",
    },
    statuses: {
      flight: true,
      otp: true,
      health: true,
      ops: true,
      tcm: true,
      mcc: true,
      ata: true,
    },
  },
]

export default function TurnaroundListView() {
  // Add state to track active tab for each aircraft
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({})

  // Function to handle tab click
  const handleTabClick = (aircraftId: string, tabName: string) => {
    setActiveTabs((prev) => ({
      ...prev,
      [aircraftId]: tabName,
    }))
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-black">
      {MOCK_AIRCRAFT.map((aircraft) => {
        // Default to "Flight" tab if none selected
        const activeTab = activeTabs[aircraft.id] || "Flight"
        return (
          <div key={aircraft.id} className="border-b border-gray-800 p-4">
            <div className="flex">
              {/* Left Section - Aircraft Info */}
              <div className="w-1/4 flex">
                <div className="mr-4">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <path d="M30,10 L50,45 L30,40 L10,45 Z" fill="#ff4d00" stroke="#ff8c00" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
                    <div className="flex flex-col items-center mr-4">
                      <div className="text-xs text-gray-400">START</div>
                      <div className="flex items-center">
                        <Plane className="h-3 w-3 mr-1" />
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 w-16 rounded-full"></div>
                      </div>
                      <div className="text-xs text-blue-400">{aircraft.remainingTime} Remaining</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-400">FINAL</div>
                      <Plane className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <span className="w-8 text-gray-400">ETD</span>
                      <span>{aircraft.etd.split(" ")[0]}</span>
                      <span className="text-xs text-gray-500 ml-1">{aircraft.etd.split(" ").slice(1).join(" ")}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-8 text-gray-400">STD</span>
                      <span>{aircraft.std.split(" ")[0]}</span>
                      <span className="text-xs text-gray-500 ml-1">{aircraft.std.split(" ").slice(1).join(" ")}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-400">A/C Reg No.</span>
                      <span>{aircraft.registration}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 text-gray-400">Fleet type</span>
                      <span>{aircraft.fleetType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section - Flight Details */}
              <div className="w-1/3 border-l border-r border-gray-800 px-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Plane className="h-3 w-3 mr-2 rotate-45" />
                    <span className="w-24 text-gray-400">Dep. Bay No.</span>
                    <span>{aircraft.depBayNo}</span>
                  </div>
                  <div className="flex items-center">
                    <Plane className="h-3 w-3 mr-2 -rotate-45" />
                    <span className="w-24 text-gray-400">Inbound</span>
                    <span>{aircraft.inbound}</span>
                  </div>
                  <div className="flex items-center">
                    <Plane className="h-3 w-3 mr-2 rotate-45" />
                    <span className="w-24 text-gray-400">Outbound</span>
                    <span>{aircraft.outbound}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 flex items-center justify-center">
                      <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="w-24 text-gray-400">Route</span>
                    <span className="flex items-center">
                      <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{aircraft.route.origin}</span>
                      <span className="mx-2">-</span>
                      <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{aircraft.route.destination}</span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 flex items-center justify-center">
                      <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="w-24 text-gray-400">Direction</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{aircraft.direction}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 flex items-center justify-center">
                      <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="w-24 text-gray-400">Flying Eng.</span>
                    <span>{aircraft.flyingEng}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 mr-2 flex items-center justify-center">
                      <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="w-24 text-gray-400">Eng. Mob. No.</span>
                    <span>{aircraft.engMobNo}</span>
                  </div>
                </div>
              </div>

              {/* Right Section - Status */}
              <div className="w-5/12 pl-4">
                <div className="mb-4">
                  <div className="flex border-b border-gray-800 pb-2">
                    <div
                      className={cn(
                        "w-16 font-medium cursor-pointer",
                        activeTab === "Flight" ? "text-blue-400" : "text-gray-500",
                      )}
                      onClick={() => handleTabClick(aircraft.id, "Flight")}
                    >
                      Flight
                    </div>
                    <div
                      className={cn(
                        "w-12 font-medium cursor-pointer",
                        activeTab === "OTP" ? "text-blue-400" : "text-gray-500",
                      )}
                      onClick={() => handleTabClick(aircraft.id, "OTP")}
                    >
                      OTP
                    </div>
                    <div
                      className={cn(
                        "w-14 font-medium cursor-pointer",
                        activeTab === "Health" ? "text-blue-400" : "text-gray-500",
                      )}
                      onClick={() => handleTabClick(aircraft.id, "Health")}
                    >
                      Health
                    </div>
                    <div
                      className={cn(
                        "w-12 font-medium cursor-pointer",
                        activeTab === "OPS" ? "text-blue-400" : "text-gray-500",
                      )}
                      onClick={() => handleTabClick(aircraft.id, "OPS")}
                    >
                      OPS
                    </div>
                    <div
                      className={cn(
                        "w-12 font-medium cursor-pointer",
                        activeTab === "TCM" ? "text-blue-400" : "text-gray-500",
                      )}
                      onClick={() => handleTabClick(aircraft.id, "TCM")}
                    >
                      TCM
                    </div>
                    <div
                      className={cn(
                        "w-12 font-medium cursor-pointer",
                        activeTab === "MCC" ? "text-blue-400" : "text-gray-500",
                      )}
                      onClick={() => handleTabClick(aircraft.id, "MCC")}
                    >
                      MCC
                    </div>
                    <div
                      className={cn(
                        "w-12 font-medium cursor-pointer",
                        activeTab === "ATA" ? "text-blue-400" : "text-gray-500",
                      )}
                      onClick={() => handleTabClick(aircraft.id, "ATA")}
                    >
                      ATA
                    </div>
                  </div>
                  <div className="w-full h-1 bg-blue-500 mt-1"></div>
                </div>

                {/* Tab content */}
                {activeTab === "Flight" ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      <span className="w-28 text-gray-400">Planned towing</span>
                      <div className="flex items-center">
                        <span className="bg-gray-800 px-2 py-0.5 rounded text-white">
                          {aircraft.plannedTowing.from}
                        </span>
                        <span className="mx-2">-</span>
                        <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{aircraft.plannedTowing.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      <span className="w-28 text-gray-400">Planned date</span>
                      <div className="flex items-center">
                        <span>{aircraft.plannedDate.start.split(" ")[0]}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          {aircraft.plannedDate.start.split(" ").slice(1).join(" ")}
                        </span>
                        <span className="mx-2">-</span>
                        <span>{aircraft.plannedDate.end.split(" ")[0]}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          {aircraft.plannedDate.end.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      <span className="w-28 text-gray-400">Actual towing</span>
                      <div className="flex items-center">
                        <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{aircraft.actualTowing.from}</span>
                        <span className="mx-2">-</span>
                        <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{aircraft.actualTowing.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      <span className="w-28 text-gray-400">Actual date</span>
                      <div className="flex items-center">
                        <span>{aircraft.actualDate.start.split(" ")[0]}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          {aircraft.actualDate.start.split(" ").slice(1).join(" ")}
                        </span>
                        <span className="mx-2">-</span>
                        <span>{aircraft.actualDate.end.split(" ")[0]}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          {aircraft.actualDate.end.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    {activeTab} content will be displayed here
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
