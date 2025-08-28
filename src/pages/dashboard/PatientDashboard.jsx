// pages/dashboard/PatientDashboard.jsx
import { FaSearch, FaMapMarkerAlt, FaClipboardList, FaUserMd } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const PatientDashboard = () => {
  const quickActions = [
    {
      title: 'Find Dispensaries',
      description: 'Find dispensaries near you with map view',
      icon: FaMapMarkerAlt,
      link: '/dashboard/patient/find-dispensaries',
      color: 'bg-green-500'
    },
    {
      title: 'Search Dispensaries',
      description: 'Search dispensaries by criteria',
      icon: FaSearch,
      link: '/dashboard/patient/search-dispensaries',
      color: 'bg-blue-500'
    },
    {
      title: 'Browse by Location',
      description: 'Explore dispensaries by area',
      icon: FaMapMarkerAlt,
      link: '/dashboard/patient/browse-dispensaries',
      color: 'bg-indigo-500'
    },
    {
      title: 'My Prescriptions',
      description: 'View your prescriptions',
      icon: FaClipboardList,
      link: '/dashboard/patient/my-prescriptions',
      color: 'bg-purple-500'
    },
    {
      title: 'Appointments',
      description: 'Manage your appointments',
      icon: FaUserMd,
      link: '/dashboard/patient/appointments',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what you can do today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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

      {/* Recent Activity & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Prescriptions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Prescription #{item}23456</p>
                    <p className="text-sm text-gray-500">Prescribed by Dr. Smith</p>
                    <p className="text-xs text-gray-400">2 days ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Nearby Dispensaries</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">HealthCare Pharmacy {item}</p>
                    <p className="text-sm text-gray-500">0.{item} km away</p>
                    <p className="text-xs text-gray-400">Open until 9:00 PM</p>
                  </div>
                  <Link
                    to={`/dispensary/${item}`}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
