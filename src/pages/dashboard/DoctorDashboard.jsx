// pages/dashboard/DoctorDashboard.jsx
import { FaEnvelope, FaStethoscope, FaClipboardList, FaChartLine } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useDoctorProfileCompletion } from '../../hooks/useDoctorProfileCompletion'
import DoctorProfileCompletion from '../../components/DoctorProfileCompletion'

const DoctorDashboard = () => {
  const { isComplete, loading, markProfileComplete, recheckStatus } = useDoctorProfileCompletion()
  
  // Show loading while checking profile status
  if (loading) {
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
      badge: '3' // New invitations
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

  const stats = [
    { label: 'Total Patients', value: '67', color: 'text-blue-600' },
    { label: 'Active Dispensaries', value: '4', color: 'text-green-600' },
    { label: 'This Week Prescriptions', value: '23', color: 'text-purple-600' },
    { label: 'Pending Invitations', value: '3', color: 'text-orange-600' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your practice and connect with dispensaries.</p>
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
            <h3 className="text-lg font-medium text-gray-900">Recent Prescriptions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Prescription for Jane Doe</p>
                    <p className="text-sm text-gray-500">Medication: Amoxicillin 500mg</p>
                    <p className="text-xs text-gray-400">{item} days ago</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Fulfilled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">New Invitations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { dispensary: 'MediCare Pharmacy', location: 'Downtown', date: '2 hours ago' },
                { dispensary: 'HealthPlus Dispensary', location: 'Mall Area', date: '1 day ago' },
                { dispensary: 'City Medical Center', location: 'North Side', date: '2 days ago' }
              ].map((invitation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invitation.dispensary}</p>
                    <p className="text-sm text-gray-500">{invitation.location}</p>
                    <p className="text-xs text-gray-400">{invitation.date}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200">
                      Accept
                    </button>
                    <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
