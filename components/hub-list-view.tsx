"use client"

import { useState } from "react"
import { Eye, Share2, Settings, Trash2, Printer } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Mock data for the list view
const MOCK_FLIGHTS = [
  {
    id: "AC1239",
    date: "01-Jan-24",
    callSign: "AC1239",
    registration: "C-GJZM",
    destination: "YYZ",
    type: "",
    bay: "F82",
    tobt: "10:15",
    sobt: "10:15",
    eobt: "10:15",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "AC1235",
    date: "24-Jan-24",
    callSign: "AC1235",
    registration: "C-GKLM",
    destination: "YYZ",
    type: "",
    bay: "D26",
    tobt: "14:46",
    sobt: "14:46",
    eobt: "14:46",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "AC1236",
    date: "24-Jan-24",
    callSign: "AC1236",
    registration: "C-FGDX",
    destination: "YYZ",
    type: "",
    bay: "D24",
    tobt: "09:45",
    sobt: "09:45",
    eobt: "09:45",
    aircraft: "green",
    pax: "orange",
    bag: "orange",
    techops: "green",
  },
  {
    id: "AC1239",
    date: "01-Jan-24",
    callSign: "AC1239",
    registration: "C-GFZL",
    destination: "YYZ",
    type: "",
    bay: "F82",
    tobt: "10:15",
    sobt: "10:15",
    eobt: "10:15",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "AC1240",
    date: "01-Jan-24",
    callSign: "AC1240",
    registration: "C-GFZO",
    destination: "YYZ",
    type: "",
    bay: "F83",
    tobt: "10:45",
    sobt: "10:45",
    eobt: "10:45",
    aircraft: "green",
    pax: "orange",
    bag: "red",
    techops: "green",
  },
  {
    id: "AC1241",
    date: "01-Jan-24",
    callSign: "AC1241",
    registration: "C-GJZM",
    destination: "YYZ",
    type: "",
    bay: "F60",
    tobt: "11:45",
    sobt: "11:45",
    eobt: "11:45",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "ACA105",
    date: "01-Jan-24",
    callSign: "ACA105",
    registration: "C-FGDZ",
    destination: "YYZ",
    type: "",
    bay: "D24",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "ACA113",
    date: "01-Jan-24",
    callSign: "ACA113",
    registration: "C-FSIQ",
    destination: "YYZ",
    type: "",
    bay: "26",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "ACA113",
    date: "01-Jan-24",
    callSign: "ACA113",
    registration: "C-GTZH",
    destination: "YYZ",
    type: "",
    bay: "26",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "ACA140",
    date: "01-Jan-24",
    callSign: "ACA140",
    registration: "C-FCZF",
    destination: "YYZ",
    type: "",
    bay: "12",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "orange",
    techops: "green",
  },
  {
    id: "ACA34",
    date: "01-Jan-24",
    callSign: "ACA34",
    registration: "C-FNND",
    destination: "YYZ",
    type: "",
    bay: "12",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "green",
    techops: "green",
  },
  {
    id: "ACA61",
    date: "01-Jan-24",
    callSign: "ACA61",
    registration: "C-GWUU",
    destination: "YYZ",
    type: "",
    bay: "12",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "green",
    techops: "green",
  },
  {
    id: "ACA130",
    date: "01-Jan-24",
    callSign: "ACA130",
    registration: "C-GJWD",
    destination: "YYZ",
    type: "",
    bay: "12",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "green",
    techops: "green",
  },
  {
    id: "ACA130",
    date: "01-Jan-24",
    callSign: "ACA130",
    registration: "C-FGKP",
    destination: "YYZ",
    type: "",
    bay: "12",
    tobt: "06:45",
    sobt: "06:45",
    eobt: "06:45",
    aircraft: "green",
    pax: "green",
    bag: "green",
    techops: "green",
  },
]

interface HubListViewProps {
  onSelectAircraft?: (aircraftId: string) => void
}

export default function HubListView({ onSelectAircraft }: HubListViewProps) {
  const [selectedRow, setSelectedRow] = useState<string | null>(null)

  const handleRowClick = (aircraftId: string) => {
    setSelectedRow(aircraftId)
    if (onSelectAircraft) {
      onSelectAircraft(aircraftId)
    }
  }

  // Function to render status cell with appropriate color
  const renderStatusCell = (status: string) => {
    const bgColor =
      status === "green"
        ? "bg-green-600"
        : status === "orange"
          ? "bg-orange-500"
          : status === "red"
            ? "bg-red-600"
            : "bg-gray-500"

    return (
      <div className="flex justify-center">
        <div className={`w-14 h-5 ${bgColor} rounded-sm flex items-center justify-center text-white text-[10px]`}>
          •••
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <Table className="border-collapse">
        <TableHeader className="bg-muted sticky top-0 z-10">
          <TableRow>
            <TableHead className="text-white font-medium text-left text-xs p-2">FLT</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">DATE</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">CALL SIGN</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">ACC REG</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">DEST</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">TYPE</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">BAY</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">TOBT</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">SOBT</TableHead>
            <TableHead className="text-white font-medium text-left text-xs p-2">EOBT</TableHead>
            <TableHead className="text-white font-medium text-center text-xs p-2">ACTIONS</TableHead>
            <TableHead className="text-white font-medium text-center text-xs p-2">AIRCRAFT</TableHead>
            <TableHead className="text-white font-medium text-center text-xs p-2">PAX</TableHead>
            <TableHead className="text-white font-medium text-center text-xs p-2">BAG</TableHead>
            <TableHead className="text-white font-medium text-center text-xs p-2">TECHOPS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_FLIGHTS.map((flight) => (
            <TableRow
              key={`${flight.id}-${flight.registration}`}
              className={cn(
                "border-b border-border hover:bg-muted/50 cursor-pointer",
                selectedRow === flight.id ? "bg-muted" : "",
              )}
              onClick={() => handleRowClick(flight.id)}
            >
              <TableCell className="text-blue-400 font-medium text-xs p-2">{flight.id}</TableCell>
              <TableCell className="text-xs p-2">{flight.date}</TableCell>
              <TableCell className="text-xs p-2">{flight.callSign}</TableCell>
              <TableCell className="text-xs p-2">{flight.registration}</TableCell>
              <TableCell className="text-xs p-2">{flight.destination}</TableCell>
              <TableCell className="text-xs p-2">{flight.type}</TableCell>
              <TableCell className="text-xs p-2">{flight.bay}</TableCell>
              <TableCell className="text-xs p-2">{flight.tobt}</TableCell>
              <TableCell className="text-xs p-2">{flight.sobt}</TableCell>
              <TableCell className="text-xs p-2">{flight.eobt}</TableCell>
              <TableCell className="p-2">
                <div className="flex items-center justify-center space-x-1">
                  <button className="p-0.5 rounded-full hover:bg-gray-700">
                    <Eye className="h-3 w-3 text-gray-400" />
                  </button>
                  <button className="p-0.5 rounded-full hover:bg-gray-700">
                    <Share2 className="h-3 w-3 text-gray-400" />
                  </button>
                  <button className="p-0.5 rounded-full hover:bg-gray-700">
                    <Settings className="h-3 w-3 text-gray-400" />
                  </button>
                  <button className="p-0.5 rounded-full hover:bg-gray-700">
                    <Trash2 className="h-3 w-3 text-gray-400" />
                  </button>
                  <button className="p-0.5 rounded-full hover:bg-gray-700">
                    <Printer className="h-3 w-3 text-gray-400" />
                  </button>
                </div>
              </TableCell>
              <TableCell>{renderStatusCell(flight.aircraft)}</TableCell>
              <TableCell>{renderStatusCell(flight.pax)}</TableCell>
              <TableCell>{renderStatusCell(flight.bag)}</TableCell>
              <TableCell>{renderStatusCell(flight.techops)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
