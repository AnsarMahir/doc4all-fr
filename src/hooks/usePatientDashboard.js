// hooks/usePatientDashboard.js
import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import { API_CONFIG } from '../config/api'

export const usePatientDashboard = () => {
  const { get, loading, error } = useApi()
  const [dashboardData, setDashboardData] = useState(null)
  const [chartData, setChartData] = useState(null)

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching patient dashboard data from multiple endpoints...')
      
      // Fetch data from multiple endpoints
      const [bookingsData, dispensariesData] = await Promise.all([
        get(API_CONFIG.ENDPOINTS.PATIENT.BOOKINGS).catch(err => {
          console.error('Failed to fetch bookings:', err)
          return []
        }),
        get(API_CONFIG.ENDPOINTS.DISPENSARY.DISPENSARIES).catch(err => {
          console.error('Failed to fetch dispensaries:', err)
          return []
        })
      ])

      console.log('Bookings data:', bookingsData)
      console.log('Dispensaries data:', dispensariesData)

      // Process the data into dashboard format
      const processedData = {
        stats: {
          totalAppointments: bookingsData?.length || 0,
          completedAppointments: bookingsData?.filter(b => b.status === 'COMPLETED').length || 0,
          cancelledAppointments: bookingsData?.filter(b => b.status === 'CANCELLED').length || 0
        },
        upcomingAppointments: bookingsData?.filter(booking => 
          (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && 
          new Date(booking.appointmentDate) >= new Date().setHours(0,0,0,0)
        ).slice(0, 5) || [],
        nearbyDispensaries: dispensariesData?.filter(d => d.rating !== null).slice(0, 5) || [],
        appointmentStats: calculateAppointmentStats(bookingsData || []),
        topDoctors: getTopDoctors(bookingsData || []),
        appointmentTrend: getAppointmentTrend(bookingsData || [])
      }

      console.log('Processed dashboard data:', processedData)
      setDashboardData(processedData)
      
      // Process data for charts
      const processedChartData = processChartData(processedData)
      setChartData(processedChartData)
    } catch (err) {
      console.error('Failed to fetch patient dashboard data:', err)
      // Set mock data if API fails for development
      const mockData = {
        stats: {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0
        },
        upcomingAppointments: [],
        nearbyDispensaries: [],
        appointmentStats: {
          completed: 0,
          cancelled: 0,
          confirmed: 0,
          pending: 0
        },
        topDoctors: [],
        appointmentTrend: []
      }
      console.log('Using mock data:', mockData)
      setDashboardData(mockData)
      const processedChartData = processChartData(mockData)
      setChartData(processedChartData)
    }
  }

  // Helper function to calculate appointment statistics
  const calculateAppointmentStats = (bookings) => {
    const stats = {
      completed: 0,
      cancelled: 0,
      confirmed: 0,
      pending: 0
    }

    bookings.forEach(booking => {
      const status = booking.status.toLowerCase()
      if (stats.hasOwnProperty(status)) {
        stats[status]++
      }
    })

    return stats
  }

  // Helper function to get top doctors by appointment count
  const getTopDoctors = (bookings) => {
    const doctorCounts = {}
    
    bookings.forEach(booking => {
      const doctorName = booking.doctorName || 'Unknown Doctor'
      doctorCounts[doctorName] = (doctorCounts[doctorName] || 0) + 1
    })

    return Object.entries(doctorCounts)
      .map(([name, count]) => ({ name, appointmentCount: count }))
      .sort((a, b) => b.appointmentCount - a.appointmentCount)
      .slice(0, 5)
  }

  // Helper function to get appointment trend (last 7 days)
  const getAppointmentTrend = (bookings) => {
    const last7Days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = bookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate).toISOString().split('T')[0]
        return bookingDate === dateStr
      }).length

      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      })
    }

    return last7Days
  }

  const processChartData = (data) => {
    const colors = {
      primary: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#8B5CF6'
    }

    // Process appointments by status
    const appointmentsByStatus = {
      labels: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
      datasets: [{
        data: [
          data.appointmentStats?.confirmed || 0,
          data.appointmentStats?.pending || 0,
          data.appointmentStats?.completed || 0,
          data.appointmentStats?.cancelled || 0
        ],
        backgroundColor: [
          colors.success,
          colors.warning,
          colors.primary,
          colors.danger
        ],
        borderWidth: 0
      }]
    }

    // Process appointments by doctor (top 5)
    const appointmentsByDoctor = {
      labels: data.topDoctors?.map(doctor => doctor.name) || [],
      datasets: [{
        label: 'Appointments',
        data: data.topDoctors?.map(doctor => doctor.appointmentCount) || [],
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        borderWidth: 1
      }]
    }

    // Process appointments by day (last 7 days)
    const appointmentsByDay = data.appointmentTrend ? {
      labels: data.appointmentTrend.map(item => item.date),
      datasets: [{
        label: 'Appointments',
        data: data.appointmentTrend.map(item => item.count),
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}20`,
        tension: 0.4,
        fill: true
      }]
    } : null

    return {
      appointmentsByStatus,
      appointmentsByDoctor,
      appointmentsByDay
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    dashboardData,
    chartData,
    loading,
    error,
    refetch: fetchDashboardData
  }
}
