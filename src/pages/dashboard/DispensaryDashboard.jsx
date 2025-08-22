// pages/dashboard/DispensaryDashboard.jsx
import { FaMapMarkerAlt, FaEnvelope, FaUserMd, FaClipboardList } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const DispensaryDashboard = () => {
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
      title: 'My Doctors',
      description: 'Manage associated doctors',
      icon: FaUserMd,
      link: '/dashboard/dispensary/doctors',
      color: 'bg-purple-500'
    },
    {
      title: 'Prescriptions',
      description: 'View all prescriptions',
      icon: FaClipboardList,
      link: '/dashboard/dispensary/prescriptions',
      color: 'bg-orange-500'
    }
  ]

  const stats = [
    { label: 'Active Doctors', value: '12', color: 'text-blue-600' },
    { label: 'Pending Invitations', value: '3', color: 'text-yellow-600' },
    { label: 'This Month Prescriptions', value: '145', color: 'text-green-600' },
    { label: 'Patient Visits', value: '89', color: 'text-purple-600' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dispensary Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your dispensary operations efficiently.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <h3 className="text-lg font-medium text-gray-900">Recent Doctor Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dr. Johnson prescribed medication</p>
                    <p className="text-sm text-gray-500">Patient: John Doe</p>
                    <p className="text-xs text-gray-400">{item} hours ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Tasks</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { task: 'Review Dr. Smith invitation response', priority: 'High' },
                { task: 'Update pharmacy hours', priority: 'Medium' },
                { task: 'Review monthly inventory', priority: 'Low' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.task}</p>
                    <p className="text-xs text-gray-400">Due today</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.priority === 'High' ? 'bg-red-100 text-red-800' :
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DispensaryDashboard
