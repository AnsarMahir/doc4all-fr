// API configuration and endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register'
    },
    // Admin endpoints
    ADMIN: {
      PENDING_APPROVALS: '/admin/pending-approvals',
      APPROVE_USER: (userId) => `/admin/approve/${userId}`,
      REJECT_USER: (userId) => `/admin/reject/${userId}`,
      GET_CERTIFICATE: (certificatePath) => `/files/${certificatePath}`
    },
    // Doctor endpoints
    DOCTOR: {
      DASHBOARD: '/doctor/dashboard',
      PRESCRIPTIONS: '/doctor/prescriptions'
    },
    // Patient endpoints
    PATIENT: {
      DASHBOARD: '/patient/dashboard',
      PRESCRIPTIONS: '/patient/prescriptions',
      LOCATION: '/patient/location',
      UPDATE_LOCATION: '/patient/update-location'
    },
    // Dispensary endpoints
    DISPENSARY: {
      DASHBOARD: '/dispensary/dashboard',
      DISPENSARIES: '/dispensaries',
      DISPENSARY_DETAILS: (id) => `/dispensaries/${id}`,
      PROFILE: '/dispensary/profile',
      COMPLETE_PROFILE: '/dispensary/complete-profile',
      CHECK_PROFILE_STATUS: '/dispensary/profile-status'
    }
  }
}

// Helper function to build full URLs
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

export default API_CONFIG
