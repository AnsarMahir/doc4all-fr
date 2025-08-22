// pages/dashboard/AdminDashboard.jsx
import { FaUsers, FaHospital, FaClipboardList, FaChartBar } from 'react-icons/fa'

const AdminDashboard = () => {
  // Sample data - in real app, this would come from API
  const stats = [
    { label: 'Total Users', value: '1,234', icon: FaUsers, color: 'bg-blue-500' },
    { label: 'Dispensaries', value: '45', icon: FaHospital, color: 'bg-green-500' },
    { label: 'Pending Approvals', value: '12', icon: FaClipboardList, color: 'bg-yellow-500' },
    { label: 'Active Prescriptions', value: '789', icon: FaChartBar, color: 'bg-purple-500' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage the Doc4All platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Registrations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Dispensary Registration</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Update Available</p>
                    <p className="text-sm text-gray-500">1 day ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Info
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

export default AdminDashboard
