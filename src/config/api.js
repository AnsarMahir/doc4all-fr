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
      GET_CERTIFICATE: (certificatePath) => `/files/${certificatePath}`,
      DOWNLOAD_CERTIFICATE: '/admin/download'
    },
    // Doctor endpoints
    DOCTOR: {
      DASHBOARD: '/doctor/dashboard',
      PRESCRIPTIONS: '/doctor/prescriptions',
      PROFILE: '/doctor/profile',
      PROFILE_STATUS: '/doctor/profile-status',
      INVITATIONS: '/doctor/invitations',
      RESPOND_INVITATION: '/doctor/invitations/respond',
      SCHEDULES: '/doctor/schedules',
      UPDATE_SCHEDULE_STATUS: (id) => `/doctor/remove-schedule/${id}`,
      BOOKINGS: '/doctor/bookings'
    },
    // Patient endpoints
    PATIENT: {
      DASHBOARD: '/patient/dashboard',
      PRESCRIPTIONS: '/patient/prescriptions',
      LOCATION: '/patient/location',
      UPDATE_LOCATION: '/patient/update-location',
      BOOKINGS: '/patient/bookings',
      CANCEL_BOOKING: (bookingId) => `/patient/${bookingId}/cancel`,
      DOCTOR_REVIEW: '/patient/reviews/doctor',
      DISPENSARY_REVIEW: '/patient/reviews/dispensary',
      CHECK_REVIEWABLE: (bookingId) => `/patient/${bookingId}/is-reviewable`
    },
    // Payment endpoints
    PAYMENTS: {
      TOKEN: '/payments/token'
    },
    // Dispensary endpoints
    DISPENSARY: {
      DASHBOARD: '/dispensary/dashboard',
      DISPENSARIES: '/dispensary',
      DISPENSARY_DETAILS: (id) => `/dispensary/${id}`,
      DISPENSARY_DETAILS_WITH_DOCTORS: (id, date) => `/dispensary/${id}/details${date ? `?date=${date}` : ''}`,
      SCHEDULE_SLOTS: (scheduleId, date) => `/dispensary/schedules/${scheduleId}/slots?date=${date}`,
      PROFILE: '/dispensary/profile',
      COMPLETE_PROFILE: '/dispensary/complete-profile',
      CHECK_PROFILE_STATUS: '/dispensary/profile-status',
      INVITATIONS: '/dispensary/invitations',
      REVOKE_INVITATION: (id) => `/dispensary/revoke/${id}`,
      BOOKINGS: '/dispensary/bookings',
      COMPLETE_BOOKING: (bookingId) => `/dispensary/${bookingId}/complete`,
      REVIEWS: (dispensaryId) => `/dispensary/${dispensaryId}/reviews`
    },
    // Doctor list endpoint
    DOCTORS: '/doctor'
  }
}

// Helper function to build full URLs
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

export default API_CONFIG
