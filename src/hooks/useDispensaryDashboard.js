// hooks/useDispensaryDashboard.js
import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import { API_CONFIG, buildUrl } from '../config/api'

export const useDispensaryDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeDoctors: 0,
      pendingInvitations: 0,
      totalBookings: 0,
      todayAppointments: 0
    },
    recentBookings: [],
    invitations: [],
    chartData: {
      bookingsByDoctor: {
        labels: [],
        datasets: []
      },
      bookingsByStatus: {
        labels: [],
        datasets: []
      },
      appointmentsByDay: {
        labels: [],
        datasets: []
      }
    },
    dispensaryInfo: {
      name: '',
      address: '',
      latitude: null,
      longitude: null,
      contactNumber: '',
      website: '',
      type: ''
    },
    loading: true,
    error: null
  })

  const { request } = useApi()

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))

      // Fetch dispensary bookings
      const bookingsResponse = await request(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.BOOKINGS))
      const bookings = bookingsResponse || []
      console.log('Dispensary bookings response:', bookings)

      // Fetch dispensary invitations
      const invitationsResponse = await request(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.INVITATIONS))
      const invitations = invitationsResponse || []
      console.log('Dispensary invitations response:', invitations)

      // Fetch dispensary profile for location data
      const profileResponse = await request(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.PROFILE))
      const dispensaryInfo = profileResponse || {}
      console.log('Dispensary profile response:', dispensaryInfo)

      // Process data for statistics and charts
      const stats = calculateStats(bookings, invitations)
      const chartData = generateChartData(bookings)
      const recentBookings = getRecentBookings(bookings, 5)

      setDashboardData({
        stats,
        recentBookings,
        invitations: invitations.slice(0, 3), // Show only recent 3
        chartData,
        dispensaryInfo: {
          name: dispensaryInfo.name || '',
          address: dispensaryInfo.address || '',
          latitude: dispensaryInfo.latitude || null,
          longitude: dispensaryInfo.longitude || null,
          contactNumber: dispensaryInfo.contactNumber || '',
          website: dispensaryInfo.website || '',
          type: dispensaryInfo.type || ''
        },
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching dispensary dashboard data:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }))
    }
  }

  const calculateStats = (bookings, invitations) => {
    // Get unique doctors from bookings
    const uniqueDoctors = new Set()
    let totalBookings = 0
    let todayAppointments = 0

    const today = new Date().toISOString().split('T')[0]

    // Process flat array of bookings
    if (Array.isArray(bookings)) {
      totalBookings = bookings.length
      
      bookings.forEach(booking => {
        if (booking.doctorName) {
          uniqueDoctors.add(booking.doctorName)
        }
        
        // Count today's appointments
        if (booking.appointmentDate === today) {
          todayAppointments++
        }
      })
    }

    // Count pending invitations
    const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING').length

    return {
      activeDoctors: uniqueDoctors.size,
      pendingInvitations,
      totalBookings,
      todayAppointments
    }
  }

  const generateChartData = (bookings) => {
    const appointmentsByDoctor = getBookingsByDoctor(bookings)
    const appointmentsByStatus = getBookingsByStatus(bookings)
    const appointmentsByDay = getAppointmentsByDay(bookings)

    return {
      appointmentsByDoctor,
      appointmentsByStatus,
      appointmentsByDay
    }
  }

  const getBookingsByDoctor = (bookings) => {
    const doctorCount = {}

    // Process flat array of bookings
    if (Array.isArray(bookings)) {
      bookings.forEach(booking => {
        if (booking.doctorName) {
          doctorCount[booking.doctorName] = (doctorCount[booking.doctorName] || 0) + 1
        }
      })
    }

    const sortedDoctors = Object.entries(doctorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Top 5 doctors

    // Always return a valid structure, even if empty
    if (sortedDoctors.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Appointments',
          data: [0],
          backgroundColor: ['rgba(229, 231, 235, 0.8)']
        }]
      }
    }

    return {
      labels: sortedDoctors.map(([name]) => name),
      datasets: [{
        label: 'Appointments',
        data: sortedDoctors.map(([,count]) => count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }]
    }
  }

  const getBookingsByStatus = (bookings) => {
    const statusCount = {
      'PENDING': 0,
      'CONFIRMED': 0,
      'CANCELLED': 0,
      'COMPLETED': 0
    }

    // Process flat array of bookings
    if (Array.isArray(bookings)) {
      bookings.forEach(booking => {
        if (statusCount.hasOwnProperty(booking.status)) {
          statusCount[booking.status]++
        }
      })
    }

    // Always return valid structure
    return {
      labels: Object.keys(statusCount),
      datasets: [{
        label: 'Appointments',
        data: Object.values(statusCount),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // PENDING - Yellow
          'rgba(34, 197, 94, 0.8)',  // CONFIRMED - Green
          'rgba(239, 68, 68, 0.8)',  // CANCELLED - Red
          'rgba(59, 130, 246, 0.8)'  // COMPLETED - Blue
        ]
      }]
    }
  }

  const getAppointmentsByDay = (bookings) => {
    const dayCount = {}
    const next7Days = []
    
    // Initialize next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dayKey = date.toISOString().split('T')[0]
      next7Days.push(dayKey)
      dayCount[dayKey] = 0
    }

    // Process flat array of bookings
    if (Array.isArray(bookings)) {
      bookings.forEach(booking => {
        if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
          const bookingDay = booking.appointmentDate
          if (bookingDay && dayCount.hasOwnProperty(bookingDay)) {
            dayCount[bookingDay]++
          }
        }
      })
    }

    // Always return valid structure
    return {
      labels: next7Days.map(day => {
        const date = new Date(day)
        const today = new Date().toDateString()
        const isToday = date.toDateString() === today
        return isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      }),
      datasets: [{
        label: 'Confirmed Appointments',
        data: next7Days.map(day => dayCount[day]),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    }
  }

  const getRecentBookings = (bookings, limit) => {
    if (!Array.isArray(bookings)) {
      return []
    }

    // Sort by appointment date (most recent first) and limit
    return bookings
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
      .slice(0, limit)
      .map(booking => ({
        id: booking.bookingId,
        patient_name: booking.patientName,
        doctor_name: booking.doctorName,
        booking_date: booking.appointmentDate,
        booking_time: booking.appointmentTime,
        status: booking.status
      }))
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    ...dashboardData,
    refetch: fetchDashboardData
  }
}
