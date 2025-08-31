// pages/dashboard/DoctorDashboard.jsx
import { FaEnvelope, FaStethoscope, FaClipboardList, FaChartLine, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useDoctorProfileCompletion } from '../../hooks/useDoctorProfileCompletion'
import { useDoctorDashboard } from '../../hooks/useDoctorDashboard'
import DoctorProfileCompletion from '../../components/DoctorProfileCompletion'
import DashboardCharts from '../../components/DashboardCharts'

const DoctorDashboard = () => {
  const { isComplete, loading: profileLoading, markProfileComplete, recheckStatus } = useDoctorProfileCompletion()
  const { stats, recentBookings, invitations, chartData, loading: dashboardLoading, error, refetch } = useDoctorDashboard()
  
  // Show loading while checking profile status
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking profile status...</p>
        </div>
      </div>
    )
  }
  
  // Show profile completion form if profile is not complete
  if (!isComplete) {
    const handleProfileComplete = async () => {
      // Recheck the profile status after completion
      const newStatus = await recheckStatus()
      if (newStatus) {
        markProfileComplete()
      }
    }
    
    return <DoctorProfileCompletion onComplete={handleProfileComplete} />
  }

  const quickActions = [
    {
      title: 'View Invitations',
      description: 'Check new dispensary invitations',
      icon: FaEnvelope,
      link: '/dashboard/doctor/invitations',
      color: 'bg-blue-500',
      badge: stats.pendingInvitations > 0 ? stats.pendingInvitations.toString() : null
    },
    {
      title: 'Practice Overview',
      description: 'View dispensaries & patient appointments',
      icon: FaStethoscope,
      link: '/dashboard/doctor/bookings',
      color: 'bg-green-500'
    },
    {
      title: 'Analytics',
      description: 'Practice insights and statistics',
      icon: FaChartLine,
      link: '/dashboard/doctor/analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'Prescriptions',
      description: 'Create and manage prescriptions',
      icon: FaClipboardList,
      link: '/dashboard/doctor/prescriptions',
      color: 'bg-orange-500'
    }
  ]

  const statsConfig = [
    { label: 'Total Patients', value: stats.totalPatients, color: 'text-blue-600' },
    { label: 'Active Dispensaries', value: stats.activeDispensaries, color: 'text-green-600' },
    { label: 'Confirmed Appointments', value: stats.weeklyAppointments, color: 'text-purple-600' },
    { label: 'Pending Invitations', value: stats.pendingInvitations, color: 'text-orange-600' }
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your practice and connect with dispensaries.</p>
        {dashboardLoading && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <FaSpinner className="animate-spin mr-2" />
            Loading dashboard data...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>
                {dashboardLoading ? (
                  <FaSpinner className="animate-spin h-8 w-8 mx-auto" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {!dashboardLoading && chartData && (
        <DashboardCharts chartData={chartData} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group relative"
            >
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {action.badge}
                </span>
              )}
              <div className={`${action.color} rounded-md p-3 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
          </div>
          <div className="p-6">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.patient_name || `Patient #${booking.patient_id}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.dispensary_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent appointments</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Invitations</h3>
          </div>
          <div className="p-6">
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : invitations.length > 0 ? (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invitation.dispensary_name || 'Unknown Dispensary'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invitation.dispensary_location || 'Location not specified'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {invitation.created_at 
                          ? new Date(invitation.created_at).toLocaleDateString()
                          : 'Recently received'
                        }
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to="/dashboard/doctor/invitations"
                        className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending invitations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
