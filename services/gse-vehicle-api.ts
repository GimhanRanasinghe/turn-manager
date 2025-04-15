// Types for the GSE vehicle API response
export interface GSEVehicle {
  id: string
  timestamp: string
  type: string
  latitude: number
  longitude: number
  speed: number
  battery_level: number
  state: string
  movement_mode: string
  path: string
}

export interface GSEVehicleResponse {
  vehicles: GSEVehicle[]
}

// WebSocket connection for GSE vehicles
export class GSEVehicleWebSocket {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds
  private onMessageCallback: ((data: GSEVehicleResponse) => void) | null = null
  private onConnectCallback: (() => void) | null = null
  private onErrorCallback: ((error: Event) => void) | null = null

  constructor(private url: string) {}

  public connect(): void {
    try {
      console.log(`Connecting to GSE vehicle WebSocket: ${this.url}`)
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("GSE vehicle WebSocket connection established")
        this.reconnectAttempts = 0
        if (this.onConnectCallback) {
          this.onConnectCallback()
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as GSEVehicleResponse
          if (this.onMessageCallback) {
            this.onMessageCallback(data)
          }
        } catch (error) {
          console.error("Error parsing GSE vehicle WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("GSE vehicle WebSocket error:", error)
        if (this.onErrorCallback) {
          this.onErrorCallback(error)
        }
      }

      this.ws.onclose = () => {
        console.log("GSE vehicle WebSocket connection closed")
        this.attemptReconnect()
      }
    } catch (error) {
      console.error("Error creating GSE vehicle WebSocket:", error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect to GSE vehicle WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      )

      this.reconnectTimer = setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)
    } else {
      console.error("Maximum GSE vehicle WebSocket reconnect attempts reached")
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  public onMessage(callback: (data: GSEVehicleResponse) => void): void {
    this.onMessageCallback = callback
  }

  public onConnect(callback: () => void): void {
    this.onConnectCallback = callback
  }

  public onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// services/gse-vehicle-api.ts
// Add this class to handle vehicle-specific WebSocket connections

export class GSEVehicleDetailWebSocket {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds
  private onMessageCallback: ((data: any) => void) | null = null
  private onConnectCallback: (() => void) | null = null
  private onErrorCallback: ((error: Event) => void) | null = null
  private vehicleId: string | null = null
  private apiKey = "SHIFT-nFR5Fak39ag4jV9sMKJ1rdBvTCRoHmx7pjn9lz1gOe38yXu47xboqPUSGJ"
  private baseUrl = "wss://simulation.dev.shiftfleet.ai/ws/vehicles"

  constructor() {}

  public connect(vehicleId: string): void {
    if (this.ws) {
      this.disconnect() // Disconnect from previous vehicle if any
    }

    this.vehicleId = vehicleId
    const url = `${this.baseUrl}/${vehicleId}?api_key=${this.apiKey}`

    try {
      console.log(`Connecting to GSE vehicle detail WebSocket for vehicle ${vehicleId}: ${url}`)
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log(`GSE vehicle detail WebSocket connection established for vehicle ${vehicleId}`)
        this.reconnectAttempts = 0
        if (this.onConnectCallback) {
          this.onConnectCallback()
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log(`Received data for vehicle ${vehicleId}:`, data)
          if (this.onMessageCallback) {
            this.onMessageCallback(data)
          }
        } catch (error) {
          console.error(`Error parsing GSE vehicle detail WebSocket message for vehicle ${vehicleId}:`, error)
        }
      }

      this.ws.onerror = (error) => {
        console.error(`GSE vehicle detail WebSocket error for vehicle ${vehicleId}:`, error)
        if (this.onErrorCallback) {
          this.onErrorCallback(error)
        }
      }

      this.ws.onclose = () => {
        console.log(`GSE vehicle detail WebSocket connection closed for vehicle ${vehicleId}`)
        this.attemptReconnect()
      }
    } catch (error) {
      console.error(`Error creating GSE vehicle detail WebSocket for vehicle ${vehicleId}:`, error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    if (!this.vehicleId) {
      return // Don't reconnect if no vehicle ID is set
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect to GSE vehicle detail WebSocket for vehicle ${this.vehicleId} (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      )
      this.reconnectTimer = setTimeout(() => {
        this.connect(this.vehicleId!)
      }, this.reconnectDelay)
    } else {
      console.error(`Maximum GSE vehicle detail WebSocket reconnect attempts reached for vehicle ${this.vehicleId}`)
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.vehicleId = null
    console.log("GSE vehicle detail WebSocket disconnected")
  }

  public onMessage(callback: (data: any) => void): void {
    this.onMessageCallback = callback
  }

  public onConnect(callback: () => void): void {
    this.onConnectCallback = callback
  }

  public onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  public getVehicleId(): string | null {
    return this.vehicleId
  }
}

// Create and export a singleton instance
export const gseVehicleDetailWebSocket = new GSEVehicleDetailWebSocket()

// Create and export a singleton instance
export const gseVehicleWebSocket = new GSEVehicleWebSocket(
  "wss://simulation.dev.shiftfleet.ai/ws/vehicles?api_key=SHIFT-nFR5Fak39ag4jV9sMKJ1rdBvTCRoHmx7pjn9lz1gOe38yXu47xboqPUSGJ",
)
