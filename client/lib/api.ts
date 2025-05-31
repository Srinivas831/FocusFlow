// Base API URL - centralized configuration
export const API_BASE_URL = "https://focusflow-server.vercel.app"

// API endpoints
export const API_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  SESSION_ACTIVE: "/session/active",
  SESSION_START: "/session/start",
  SESSION_END: "/session/end",
  SESSION_ABORT: "/session/abort",
  BLOCKLIST: "/blocklist",
  ANALYTICS: "/session/analytics", // Add analytics endpoint
} as const

// Helper function for API requests
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from localStorage if available
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(url, config)
  const data = await response.json()

  // Console log all API responses for debugging
  console.log(`API Response [${endpoint}]:`, data)

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

// Auth-specific API functions
export const authAPI = {
  register: async (userData: { userName: string; email: string; password: string }) => {
    return apiRequest(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },
}

// Session-specific API functions
export const sessionAPI = {
  getActiveSession: async () => {
    return apiRequest(API_ENDPOINTS.SESSION_ACTIVE, {
      method: "GET",
    })
  },

  startSession: async (sessionData: { workDuration: number; breakDuration: number; title?: string }) => {
    return apiRequest(API_ENDPOINTS.SESSION_START, {
      method: "POST",
      body: JSON.stringify(sessionData),
    })
  },

  endSession: async (sessionId: string) => {
    return apiRequest(API_ENDPOINTS.SESSION_END, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
  },

  abortSession: async (sessionId: string, abortReason: string) => {
    return apiRequest(API_ENDPOINTS.SESSION_ABORT, {
      method: "POST",
      body: JSON.stringify({ sessionId, abortReason }),
    })
  },

  getBlocklist: async () => {
    return apiRequest(API_ENDPOINTS.BLOCKLIST, {
      method: "GET",
    })
  },

  addToBlocklist: async (websites: string[]) => {
    return apiRequest(API_ENDPOINTS.BLOCKLIST, {
      method: "POST",
      body: JSON.stringify({ website: websites }),
    })
  },

  removeFromBlocklist: async (blocklistItemId: string) => {
    return apiRequest(`${API_ENDPOINTS.BLOCKLIST}/${blocklistItemId}`, {
      method: "DELETE",
    })
  },

  getAnalytics: async () => {
    return apiRequest(API_ENDPOINTS.ANALYTICS, {
      method: "GET",
    })
  },
}
