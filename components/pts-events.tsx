import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, Circle, AlertTriangle, ChevronDown, ChevronUp,
Plane, Users, Briefcase, Coffee, Wrench, Clipboard, ToggleRight } from 'lucide-react';
import { gseVehicleDetailWebSocket } from "@/services/gse-vehicle-api"

const AirCanadaPTSEventDrawer = ({ open, onOpenChange, ptsEvent,vehicleId }) => {
  // Sample data - would be connected to real data in production
  const blinkAnimation = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

  console.log("222222222222222222211111111111111")
  const [vehicleDetailData, setVehicleDetailData] = useState<any>(null)
  const [flightData, setFlightData] = useState({
    flightNumber: "AC4564",
    origin: "C-FSKP",
    status: {
      disruption: false,
      message: "No disruptions expected",
      level: "none" // none, low, medium, high
    },
    currentTime: new Date("2025-04-11T11:20:00"),
    ragSummary: {
      red: 2,
      amber: 3,
      green: 12,
    },
    categories: [
      {
        name: vehicleDetailData?.timestamp ?? "test",
        id: "flight-movement",
        icon: "plane",
        expanded: true,
        events: [
          {
            id: "arrival",
            name: "Arrival (STA)",
            scheduledStart: new Date("2025-04-11T10:30:00"),
            actualStart: new Date("2025-04-11T10:42:00"),
            isMilestone: true,
            status: "completed",
            progress: 100
          },
          {
            id: "parking",
            name: "Aircraft Parking",
            scheduledStart: new Date("2025-04-11T10:35:00"),
            actualStart: new Date("2025-04-11T10:47:00"),
            scheduledEnd: new Date("2025-04-11T10:45:00"),
            actualEnd: new Date("2025-04-11T10:55:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "pushback",
            name: "Pushback",
            scheduledStart: new Date("2025-04-11T12:20:00"),
            scheduledEnd: new Date("2025-04-11T12:25:00"),
            actualStart: null,
            actualEnd: null,
            status: "scheduled",
            progress: 0
          },
          {
            id: "departure",
            name: "Departure (STD)",
            scheduledStart: new Date("2025-04-11T12:30:00"),
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
        name: "Passenger Flow",
        id: "passenger-flow",
        icon: "users",
        expanded: true,
        events: [
          {
            id: "disembarkation",
            name: "Disembarkation",
            scheduledStart: new Date("2025-04-11T10:40:00"),
            actualStart: new Date("2025-04-11T10:50:00"),
            scheduledEnd: new Date("2025-04-11T10:55:00"),
            actualEnd: new Date("2025-04-11T11:05:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "boarding",
            name: "Boarding",
            scheduledStart: new Date("2025-04-11T11:45:00"),
            scheduledEnd: new Date("2025-04-11T12:15:00"),
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
            scheduledStart: new Date("2025-04-11T10:40:00"),
            actualStart: new Date("2025-04-11T10:52:00"),
            scheduledEnd: new Date("2025-04-11T10:55:00"),
            actualEnd: new Date("2025-04-11T11:12:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "baggage-loading",
            name: "Baggage Loading",
            scheduledStart: new Date("2025-04-11T11:30:00"),
            scheduledEnd: new Date("2025-04-11T12:00:00"),
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
            scheduledStart: new Date("2025-04-11T10:50:00"),
            scheduledEnd: new Date("2025-04-11T11:20:00"),
            actualStart: new Date("2025-04-11T11:00:00"),
            actualEnd: new Date("2025-04-11T11:30:00"),
            status: "completed",
            progress: 100
          },
          {
            id: "refueling",
            name: "Refueling",
            scheduledStart: new Date("2025-04-11T11:00:00"),
            scheduledEnd: new Date("2025-04-11T11:30:00"),
            actualStart: new Date("2025-04-11T11:05:00"),
            actualEnd: null,
            status: "in-progress",
            progress: 80
          },
          {
            id: "catering-load",
            name: "Catering Load",
            scheduledStart: new Date("2025-04-11T11:15:00"),
            scheduledEnd: new Date("2025-04-11T11:45:00"),
            actualStart: new Date("2025-04-11T11:25:00"),
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
            scheduledStart: new Date("2025-04-11T12:10:00"),
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
            scheduledStart: new Date("2025-04-11T12:15:00"),
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
            scheduledStart: new Date("2025-04-11T12:15:00"),
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
            scheduledStart: new Date("2025-04-11T12:20:00"),
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
  });

  useEffect(() => {
    if (open && vehicleId) {
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
      if (!open) {
        gseVehicleDetailWebSocket.disconnect()
        setVehicleDetailData(null)
      }
    }
  }, [open, vehicleId])

  // Update flight data when ptsEvent changes
  useEffect(() => {
    if (ptsEvent) {
      setFlightData(ptsEvent);
    }
  }, [ptsEvent]);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setFlightData({
      ...flightData,
      categories: flightData.categories.map(category =>
        category.id === categoryId
          ? { ...category, expanded: !category.expanded }
          : category
      )
    });
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate timeline parameters
  const timelineStart = new Date(flightData.categories[0].events[0].scheduledStart);
  timelineStart.setHours(timelineStart.getHours() - 0.5);
  const timelineEnd = new Date(flightData.categories[0].events[flightData.categories[0].events.length-1].scheduledStart.getTime() + 1000 * 1000);
  timelineEnd.setHours(timelineEnd.getHours() + 0.5);
  const timelineDuration = timelineEnd - timelineStart;

  // Calculate position on timeline
  const calculatePosition = (time) => {
    if (!time) return 0;
    const eventTime = new Date(time);
    const position = ((eventTime - timelineStart) / timelineDuration) * 100;
    return Math.max(0, Math.min(position, 100));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in-progress': return 'bg-blue-600';
      case 'delayed': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  // Get status color for gradient
  const getStatusGradient = (status) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-green-700';
      case 'in-progress': return 'from-blue-500 to-blue-700';
      case 'delayed': return 'from-yellow-500 to-yellow-700';
      case 'critical': return 'from-red-500 to-red-700';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'in-progress': return <Clock size={16} className="text-blue-500" />;
      case 'delayed': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'critical': return <AlertTriangle size={16} className="text-red-500" />;
      default: return <Circle size={16} className="text-gray-400" />;
    }
  };

  // Get category icon
  const getCategoryIcon = (iconName, className = "mr-2") => {
    switch (iconName) {
      case 'plane': return <Plane size={18} className={`text-blue-600 ${className}`} />;
      case 'users': return <Users size={18} className={`text-purple-600 ${className}`} />;
      case 'briefcase': return <Briefcase size={18} className={`text-yellow-600 ${className}`} />;
      case 'coffee': return <Coffee size={18} className={`text-green-600 ${className}`} />;
      case 'wrench': return <Wrench size={18} className={`text-gray-600 ${className}`} />;
      case 'clipboard': return <Clipboard size={18} className={`text-indigo-600 ${className}`} />;
      case 'toggle': return <ToggleRight size={18} className={`text-red-600 ${className}`} />;
      default: return null;
    }
  };

  // Calculate RAG status based on scheduled vs actual times
  const calculateRAGStatus = (event) => {
    // If the event is already completed, no need for RAG
    if (event.status === 'completed') return null;
    // If the event hasn't started yet
    if (!event.actualStart && event.scheduledStart) {
      const schedStart = new Date(event.scheduledStart);
      const diff = schedStart - flightData.currentTime;
      const diffMinutes = diff / (1000 * 60);
      // Calculate minutes until scheduled start
      if (diffMinutes < -15) return { status: 'red', message: 'Start overdue' };
      if (diffMinutes < 0) return { status: 'amber', message: 'Start delayed' };
      if (diffMinutes < 15) return { status: 'amber', message: 'Starting soon' };
      return { status: 'green', message: 'On schedule' };
    }
    // If the event is in progress
    if (event.actualStart && !event.actualEnd && event.scheduledEnd) {
      const schedEnd = new Date(event.scheduledEnd);
      const diff = schedEnd - flightData.currentTime;
      const diffMinutes = diff / (1000 * 60);
      const expectedProgress = (flightData.currentTime - new Date(event.actualStart)) /
        (new Date(event.scheduledEnd) - new Date(event.actualStart)) * 100;
      // Check if progress is behind schedule by more than 20%
      if (diffMinutes < -10) return { status: 'red', message: 'Critically delayed' };
      if (diffMinutes < 0) return { status: 'red', message: 'End overdue' };
      if (event.progress && expectedProgress - event.progress > 20) return { status: 'amber', message: 'Behind schedule' };
      if (diffMinutes < 5) return { status: 'amber', message: 'Tight completion' };
      return { status: 'green', message: 'On track' };
    }
    return { status: 'green', message: 'On schedule' };
  };

  // Generate time markers
  const generateTimeMarkers = () => {
    const markers = [];
    const hours = Math.ceil(timelineDuration / (60 * 60 * 1000)) + 1;
    const startHour = timelineStart.getHours();
    const startMinute = timelineStart.getMinutes();
    // Add a marker for each half hour
    for (let i = 0; i < hours * 2; i++) {
      const markerTime = new Date(timelineStart);
      markerTime.setMinutes(startMinute + (i * 30));
      const position = calculatePosition(markerTime);
      const isHour = markerTime.getMinutes() === 0;
      markers.push(
        <div
          key={i}
          className={`absolute top-0 bottom-0 border-l ${isHour ? 'border-gray-300' : 'border-gray-200'}`}
          style={{ left: `${position}%` }}
        >
          <div className={`relative -top-6 -left-4 text-xs ${isHour ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>
            {markerTime.getHours()}:{markerTime.getMinutes().toString().padStart(2, '0')}
            </div>
        </div>
      );
    }
    return markers;
  };

  // Legend for RAG indicators
  const RAGLegend = () => (
    <div className="border-t border-gray-200 px-4 py-2 bg-white">
      <div className="text-xs text-gray-700 mb-2">Status Indicators:</div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-xs text-gray-600">On Track</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-xs text-gray-600">At Risk</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-xs text-gray-600">Delayed</span>
        </div>
      </div>
    </div>
  );

  // Air Canada colors
  const airCanadaRed = "#d8252c";

  // If the modal is not open, don't render anything
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="h-full w-full max-w-md bg-gray-50 shadow-lg flex flex-col overflow-auto relative">
        {/* Header */}
        <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center">
            {/* Air Canada logo */}
            <div className="w-8 h-8 mr-2 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill={airCanadaRed} d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8 s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z" />
                <path fill={airCanadaRed} d="M14.8,8L12,13.2L9.2,8H7l4,8h2l4-8H14.8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Flight Events</h2>
              <div className="flex text-xs text-gray-500">
                <span>{flightData.origin}</span>
                <span className="mx-1">•</span>
                <span>{flightData.flightNumber}</span>
              </div>
            </div>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => onOpenChange(false)}
          >
            <X size={20} />
          </button>
        </div>
        {/* Status Section */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock size={18} className="text-blue-700 mr-2" />
              <span className="text-sm font-medium">Flight Status:</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-white text-sm font-medium shadow-sm ${
              flightData.status.level === 'high' ? 'bg-red-600' :
              flightData.status.level === 'medium' ? 'bg-yellow-600' :
              flightData.status.level === 'low' ? 'bg-blue-600' :
              'bg-green-600'
            }`}>
              {flightData.status.level === 'none' ? 'On Time' : flightData.status.level}
            </div>
          </div>
          {/* Current Time Indicator */}
          <div className="flex items-center mt-2 text-xs text-gray-700 bg-red-50 rounded-full px-3 py-1.5 border border-red-200 inline-block">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-1.5"></div>
            <span className="font-medium">Current Time:{formatTime(flightData?.currentTime)} </span>
            {/* {formatTime(flightData.currentTime)} */}
          </div>
          {/* RAG Summary */}
          {/* <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Task Status Summary:</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-green-100 px-2 py-1 rounded-full border border-green-200">
                  <div className="h-3 w-3 rounded-full bg-green-600 mr-1"></div>
                  <span className="text-xs text-green-800 font-medium">{flightData.ragSummary.green}</span>
                </div>
                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200">
                  <div className="h-3 w-3 rounded-full bg-yellow-600 mr-1"></div>
                  <span className="text-xs text-yellow-700 font-medium">{flightData.ragSummary.amber}</span>
                </div>
                <div className="flex items-center bg-red-100 px-2 py-1 rounded-full border border-red-200">
                  <div className="h-3 w-3 rounded-full bg-red-600 mr-1"></div>
                  <span className="text-xs text-red-800 font-medium">{flightData.ragSummary.red}</span>
                </div>
              </div>
            </div>
          </div> */}
        </div>
        {/* RAG Legend */}
        {/* <div className="sticky top-20 z-20 bg-gray-100 p-2 border-y border-gray-300 shadow-sm">
          <div className="border-t border-gray-200 px-4 py-3 bg-white shadow-sm">
            <div className="text-xs font-medium text-gray-700 mb-2">Test Status Indicators:</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-xs text-gray-600">On Track</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-xs text-gray-600">At Risk</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-xs text-gray-600">Delayed</span>
              </div>
            </div>
          </div>
        </div> */}
        {/* Timeline Header */}
        {/* <div className="sticky top-40 z-20 bg-gray-100 p-2 border-y border-gray-300 mt-4 shadow-sm">
          <div className="relative h-8">
            {generateTimeMarkers()}
            <div
              className="absolute top-0 bottom-0 border-l-2 border-red-600 z-20"
              style={{ left: `${calculatePosition(flightData?.currentTime)}%` }}
            >
              <div className="relative -top-6 -left-8 bg-red-600 text-white text-xs py-0.5 px-2 rounded-full shadow-sm">
                Current
              </div>
            </div>
          </div>
        </div> */}
        {/* Event Categories */}
        <div className="flex-grow p-5 pb-16 bg-gray-100">
          {flightData.categories.map((category) => (
            <div key={category.id} className="mb-6 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              {/* Category Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-l-4 border-blue-600 rounded-l bg-gradient-to-r from-blue-50 to-white"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center">
                  {getCategoryIcon(category.icon)}
                  <span className="font-medium">{category.name}</span>
                  {/* Show RAG indicators for category */}
                  {(() => {
                    // Count RAG status for this category
                    const categoryRAG = {
                      red: 0,
                      amber: 0,
                      green: 0
                    };
                    category.events.forEach(event => {
                      if (event.status !== 'completed') {
                        const status = calculateRAGStatus(event);
                        if (status) {
                          categoryRAG[status.status]++;
                        }
                      }
                    });
                    // Only show indicators if there are uncompleted events
                    if (categoryRAG.red + categoryRAG.amber + categoryRAG.green > 0) {
                      return (
                        <div className="flex items-center ml-3 space-x-2">
                          {categoryRAG.red > 0 && (
                            <div className="flex items-center bg-red-100 px-2 py-0.5 rounded-full">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              <span className="text-xs text-red-700 ml-1 font-medium">{categoryRAG.red}</span>
                            </div>
                          )}
                          {categoryRAG.amber > 0 && (
                            <div className="flex items-center bg-yellow-100 px-2 py-0.5 rounded-full">
                              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                              <span className="text-xs text-yellow-700 ml-1 font-medium">{categoryRAG.amber}</span>
                            </div>
                          )}
                          {categoryRAG.green > 0 && (
                            <div className="flex items-center bg-green-100 px-2 py-0.5 rounded-full">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-xs text-green-700 ml-1 font-medium">{categoryRAG.green}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                {category.expanded ?
                  <ChevronUp size={18} className="text-gray-500" /> :
                  <ChevronDown size={18} className="text-gray-500" />
                }
              </div>
              {/* Event List */}
              {category.expanded && (
                <div className="px-4 pb-4 pt-1">
                  {category.events.map((event) => (
                    <div key={event.id} className="mb-5">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          {getStatusIcon(event.status)}
                          <span className="text-sm font-medium ml-2">{event.name}</span>
                          {/* RAG Status Indicator */}
                          {event.status !== 'completed' && (
                            (() => {
                              const ragStatus = calculateRAGStatus(event);
                              if (!ragStatus) return null;
                              return (
                                <div className="ml-2 flex items-center" title={ragStatus.message}>
                                  <div className={`h-3 w-3 rounded-full mr-1 ${
                                    ragStatus.status === 'red' ? 'bg-red-500' :
                                    ragStatus.status === 'amber' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{animation: ragStatus.status === 'red' ? 'blink 0.25s infinite' : 'none'}}
                                  ></div>
                                  <span className="text-xs text-gray-600">{ragStatus.message}</span>
                                </div>
                              );
                            })()
                          )}
                        </div>
                        <div className="text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm">
                          {event.isMilestone ? (
                            formatTime(event.actualStart || event.scheduledStart)
                          ) : (
                            <>
                              {formatTime(event.actualStart || event.scheduledStart)}
                              {" - "}
                              {formatTime(event.actualEnd || event.scheduledEnd)}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden my-3 border border-gray-200 shadow-sm">
                        {/* Timeline markers for reference */}
                        {generateTimeMarkers().map((marker, i) => (
                          <div
                            key={`event-${event.id}-marker-${i}`}
                            className="absolute top-0 bottom-0 border-l border-gray-200 opacity-20"
                            style={{ left: marker.props.style.left }}
                          />
                        ))}
                        {/* Current time vertical line inside this timeline bar only */}
                        <div
                          className="absolute top-0 bottom-0 border-l-2 border-red-600 border-dashed z-1000"
                          style={{ left: `${calculatePosition(flightData.currentTime)}%` }}
                        ></div>
                        {/* Scheduled time bar */}
                        {event.scheduledStart && event.scheduledEnd && (
                          <div
                            className="absolute top-2 h-3 bg-gray-300 rounded-full opacity-60"
                            style={{
                              left: `${calculatePosition(event.scheduledStart)}%`,
                              width: `${calculatePosition(event.scheduledEnd) - calculatePosition(event.scheduledStart)}%`
                            }}
                          />
                        )}
                        {/* Scheduled milestone marker */}
                        {event.isMilestone && (
                          <div
                            className="absolute top-0 h-12 w-2 bg-gray-400 rounded opacity-50"
                            style={{ left: `${calculatePosition(event.scheduledStart)}%` }}
                          />
                        )}
                        {/* Actual time progress bar */}
                        {event.actualStart && event.status !== 'scheduled' && (
                          <div
                          className={`absolute top-6 h-4 rounded-full bg-gradient-to-r ${getStatusGradient(event.status)}`}
                          style={{
                            left: `${calculatePosition(event.actualStart)}%`,
                            width: event.actualEnd
                              ? `${calculatePosition(event.actualEnd) - calculatePosition(event.actualStart)}%`
                              : event.progress && !event.isMilestone
                                ? `${(calculatePosition(flightData.currentTime) - calculatePosition(event.actualStart)) * (100 / 100)}%`
                                : '0px',
                            animation: event.status === 'in-progress' ? 'blink 0.25s infinite' : 'none'
                          }}
                        >
                            {/* Progress percentage display for active tasks */}
                            {/* {event.status === 'in-progress' && !event.isMilestone && (
                              <span className="absolute inset-0 flex items-center justify-center text-xs text-black font-bold">
                                {event.progress}%
                              </span>
                            )} */}
                            <style>{blinkAnimation}</style>
                          </div>
                        )}
                        {/* Actual milestone marker */}
                        {event.isMilestone && event.actualStart && (
                          <div
                            className={`absolute top-0 h-12 w-2 rounded ${getStatusColor(event.status)}`}
                            style={{ left: `${calculatePosition(event.actualStart)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AirCanadaPTSEventDrawer;