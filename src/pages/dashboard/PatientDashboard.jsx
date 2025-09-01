// pages/dashboard/PatientDashboard.jsx
import { FaSearch, FaMapMarkerAlt, FaUserMd, FaStar, FaCalendarAlt, FaHeart, FaClipboardList } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { usePatientDashboard } from '../../hooks/usePatientDashboard'
import DashboardCharts from '../../components/DashboardCharts'

const PatientDashboard = () => {
  const { dashboardData, chartData, loading, error } = usePatientDashboard()
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    )
  }

  const stats = dashboardData?.stats || {}
  const nearbyDispensaries = dashboardData?.nearbyDispensaries || []
  const upcomingAppointments = dashboardData?.upcomingAppointments || []

  console.log('PatientDashboard render:', { dashboardData, chartData, loading, error })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your health overview.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-md p-3">
              <FaCalendarAlt className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Appointments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAppointments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-md p-3">
              <FaClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedAppointments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-md p-3">
              <FaHeart className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cancelledAppointments || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData && <DashboardCharts chartData={chartData} />}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/dashboard/patient/find-dispensaries"
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
        >
          <div className="bg-green-500 rounded-md p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
            <FaMapMarkerAlt className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Dispensaries</h3>
          <p className="text-gray-600 text-sm">Find dispensaries near you with map view</p>
        </Link>

        <Link
          to="/dashboard/patient/search-dispensaries"
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
        >
          <div className="bg-blue-500 rounded-md p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
            <FaSearch className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Dispensaries</h3>
          <p className="text-gray-600 text-sm">Search dispensaries by criteria</p>
        </Link>

        <Link
          to="/dashboard/patient/appointments"
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
        >
          <div className="bg-orange-500 rounded-md p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
            <FaUserMd className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments</h3>
          <p className="text-gray-600 text-sm">Manage your appointments</p>
        </Link>

        <Link
          to="/dashboard/patient/reviews"
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 group"
        >
          <div className="bg-yellow-500 rounded-md p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
            <FaStar className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews & Ratings</h3>
          <p className="text-gray-600 text-sm">Rate doctors and dispensaries</p>
        </Link>
      </div>

      {/* Recent Activity & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
          </div>
          <div className="p-6">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.bookingId} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Dr. {appointment.doctorName}</p>
                      <p className="text-sm text-gray-500">{appointment.dispensaryName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent appointments</p>
            )}
          </div>
        </div>

        {/* Top Rated Dispensaries */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Rated Dispensaries</h3>
          </div>
          <div className="p-6">
            {nearbyDispensaries.length > 0 ? (
              <div className="space-y-4">
                {nearbyDispensaries.slice(0, 3).map((dispensary) => (
                  <div key={dispensary.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{dispensary.name}</p>
                      <p className="text-sm text-gray-500">{dispensary.address}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <FaStar className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>{dispensary.rating?.toFixed(1) || 'No rating'}</span>
                        {dispensary.review_count && (
                          <span className="ml-1">({dispensary.review_count} reviews)</span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/dispensary/${dispensary.id}`}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No dispensaries found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
