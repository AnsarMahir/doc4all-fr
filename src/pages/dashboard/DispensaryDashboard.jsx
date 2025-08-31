// pages/dashboard/DispensaryDashboard.jsx
import { FaMapMarkerAlt, FaEnvelope, FaUserMd, FaCalendarCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useDispensaryDashboard } from '../../hooks/useDispensaryDashboard'
import DashboardCharts from '../../components/DashboardCharts'
import LocationMap from '../../components/LocationMap'

const DispensaryDashboard = () => {
  const { 
    stats, 
    recentBookings, 
    invitations, 
    chartData, 
    dispensaryInfo, 
    loading, 
    error, 
    refetch 
  } = useDispensaryDashboard()

  const quickActions = [
    {
      title: 'Update Location',
      description: 'Manage your dispensary location',
      icon: FaMapMarkerAlt,
      link: '/dashboard/dispensary/location',
      color: 'bg-blue-500'
    },
    {
      title: 'Invite Doctors',
      description: 'Send invitations to doctors',
      icon: FaEnvelope,
      link: '/dashboard/dispensary/invite-doctors',
      color: 'bg-green-500'
    },
    {
      title: 'Doctor Bookings',
      description: 'View all doctor appointments',
      icon: FaCalendarCheck,
      link: '/dashboard/dispensary/bookings',
      color: 'bg-indigo-500'
    }
  ]

  const statsConfig = [
    { label: 'Active Doctors', value: stats.activeDoctors, color: 'text-blue-600' },
    { label: 'Pending Invitations', value: stats.pendingInvitations, color: 'text-yellow-600' },
    { label: 'Total Bookings', value: stats.totalBookings, color: 'text-green-600' },
    { label: 'Today\'s Appointments', value: stats.todayAppointments, color: 'text-purple-600' }
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
        <h1 className="text-3xl font-bold text-gray-900">Dispensary Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your dispensary operations efficiently - {dispensaryInfo.name || 'Your Dispensary'}
        </p>
        {loading && (
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
                {loading ? (
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

      {/* Charts and Location */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Charts Section */}
        <div className="xl:col-span-2">
          {!loading && chartData && (
            <DashboardCharts chartData={chartData} />
          )}
        </div>

        {/* Location Map */}
        <div className="xl:col-span-1">
          <LocationMap 
            latitude={dispensaryInfo.latitude}
            longitude={dispensaryInfo.longitude}
            address={dispensaryInfo.address}
            name={dispensaryInfo.name}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
            >
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
            {loading ? (
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
                        Dr. {booking.doctor_name}
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
                        : booking.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : invitations.length > 0 ? (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Doctor Invitation #{invitation.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invitation.day} • {invitation.startTime} - {invitation.endTime}
                      </p>
                      <p className="text-xs text-gray-400">
                        Rate: ${invitation.offerRate} • {invitation.perPatientMinutes}min per patient
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      invitation.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : invitation.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invitation.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent invitations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DispensaryDashboard
