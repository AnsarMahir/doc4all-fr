// hooks/useDoctorDashboard.js
import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import { API_CONFIG, buildUrl } from '../config/api'

export const useDoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 0,
      activeDispensaries: 0,
      weeklyAppointments: 0,
      pendingInvitations: 0
    },
    recentBookings: [],
    invitations: [],
    chartData: {
      appointmentsByDay: [],
      appointmentsByDispensary: [],
      patientsByAge: []
    },
    loading: true,
    error: null
  })

  const { request } = useApi()

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))

      // Fetch doctor bookings
      const bookingsResponse = await request(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.BOOKINGS))
      const bookings = bookingsResponse || []
      console.log('Bookings response:', bookings)

      // Fetch doctor invitations
      const invitationsResponse = await request(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.INVITATIONS))
      const invitations = invitationsResponse || []
      console.log('Invitations response:', invitations)

      // Process booking data for statistics
      const stats = calculateStats(bookings, invitations)
      const chartData = generateChartData(bookings)
      const recentBookings = getRecentBookings(bookings, 5)

      setDashboardData({
        stats,
        recentBookings,
        invitations: invitations.slice(0, 3), // Show only recent 3
        chartData,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }))
    }
  }

  const calculateStats = (bookings, invitations) => {
    // Get unique patients from bookings
    const uniquePatients = new Set()
    const uniqueDispensaries = new Set()
    let upcomingAppointments = 0

    const today = new Date()
    const oneWeekFromNow = new Date()
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)

    // Process bookings array (only count CONFIRMED and COMPLETED)
    bookings.forEach(booking => {
      uniquePatients.add(booking.patientName)
      uniqueDispensaries.add(booking.dispensaryName)
      
      // Check if booking is within the next week and has valid status
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        const bookingDate = new Date(booking.appointmentDate)
        if (bookingDate >= today && bookingDate <= oneWeekFromNow) {
          upcomingAppointments++
        }
      }
    })

    // Count pending invitations/schedules
    const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING').length

    return {
      totalPatients: uniquePatients.size,
      activeDispensaries: uniqueDispensaries.size,
      weeklyAppointments: upcomingAppointments,
      pendingInvitations
    }
  }

  const generateChartData = (bookings) => {
    const appointmentsByDay = getAppointmentsByDay(bookings)
    const appointmentsByDispensary = getAppointmentsByDispensary(bookings)
    const appointmentsByStatus = getAppointmentsByStatus(bookings)

    return {
      appointmentsByDay,
      appointmentsByDispensary,
      appointmentsByStatus
    }
  }

  const getAppointmentsByDay = (bookings) => {
    const dayCount = {}
    const next7Days = []
    
    // Initialize next 7 days (including today)
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dayKey = date.toISOString().split('T')[0]
      next7Days.push(dayKey)
      dayCount[dayKey] = 0
    }

    // Count appointments by day (only CONFIRMED and COMPLETED)
    bookings.forEach(booking => {
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        const bookingDay = booking.appointmentDate
        if (dayCount.hasOwnProperty(bookingDay)) {
          dayCount[bookingDay]++
        }
      }
    })

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

  const getAppointmentsByDispensary = (bookings) => {
    const dispensaryCount = {}

    // Count appointments by dispensary (only CONFIRMED and COMPLETED)
    bookings.forEach(booking => {
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        const dispensaryName = booking.dispensaryName
        dispensaryCount[dispensaryName] = (dispensaryCount[dispensaryName] || 0) + 1
      }
    })

    const sortedDispensaries = Object.entries(dispensaryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Top 5 dispensaries

    return {
      labels: sortedDispensaries.map(([name]) => name),
      datasets: [{
        label: 'Confirmed Appointments',
        data: sortedDispensaries.map(([,count]) => count),
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

  const getAppointmentsByStatus = (bookings) => {
    // Chart for appointment status distribution
    const statusCount = {
      'PENDING': 0,
      'CONFIRMED': 0,
      'CANCELLED': 0,
      'COMPLETED': 0
    }

    bookings.forEach(booking => {
      const status = booking.status
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++
      }
    })

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

  const getRecentBookings = (bookings, limit) => {
    // Sort by appointment date (most recent first) and limit
    return bookings
      .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
      .slice(0, limit)
      .map(booking => ({
        id: booking.bookingId,
        patient_name: booking.patientName,
        dispensary_name: booking.dispensaryName,
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
