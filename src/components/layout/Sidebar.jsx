// components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom'
import {
  FaTimes,
  FaUser,
  FaHome,
  FaSearch,
  FaMapMarkerAlt,
  FaHospital,
  FaUserMd,
  FaEnvelope,
  FaUsers,
  FaClipboardList,
  FaCog,
  FaChartBar,
  FaStar,
  FaFileAlt
} from 'react-icons/fa'

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation()

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: FaHome }
    ]

    const roleBasedItems = {
      ADMIN: [
        ...commonItems,
        { path: '/dashboard/profile', label: 'Profile', icon: FaUser },
        { path: '/dashboard/admin/pending-approval', label: 'Pending Approvals', icon: FaClipboardList },
        { path: '/dashboard/admin/users', label: 'Manage Users', icon: FaUsers },
        { path: '/dashboard/admin/dispensaries', label: 'Manage Dispensaries', icon: FaHospital },
        { path: '/dashboard/admin/analytics', label: 'Analytics', icon: FaChartBar },
        { path: '/dashboard/admin/settings', label: 'System Settings', icon: FaCog }
      ],
      PATIENT: [
        ...commonItems,
        { path: '/dashboard/profile', label: 'Profile', icon: FaUser },
        { path: '/dashboard/patient/find-dispensaries', label: 'Find Dispensaries', icon: FaMapMarkerAlt },
        { path: '/dashboard/patient/search-dispensaries', label: 'Search Dispensaries', icon: FaSearch },
        { path: '/dashboard/patient/appointments', label: 'Appointments', icon: FaUserMd },
        { path: '/dashboard/patient/reports', label: 'Medical Reports', icon: FaFileAlt },
        { path: '/dashboard/patient/reviews', label: 'Reviews & Ratings', icon: FaStar }
      ],
      DISPENSARY: [
        ...commonItems,
        { path: '/dashboard/dispensary/profile', label: 'Profile', icon: FaUser },
        { path: '/dashboard/dispensary/location', label: 'Update Location', icon: FaMapMarkerAlt },
        { path: '/dashboard/dispensary/invite-doctors', label: 'Invite Doctors', icon: FaEnvelope },
        { path: '/dashboard/dispensary/bookings', label: 'Doctor Bookings', icon: FaUserMd }
      ],
      DOCTOR: [
        ...commonItems,
        { path: '/dashboard/profile', label: 'Profile', icon: FaUser },
        { path: '/dashboard/doctor/invitations', label: 'Invitations', icon: FaEnvelope },
        { path: '/dashboard/doctor/bookings', label: 'Practice Overview', icon: FaChartBar },
        { path: '/dashboard/doctor/prescriptions', label: 'Prescriptions', icon: FaClipboardList }
      ]
    }

    return roleBasedItems[userRole] || [...commonItems, { path: '/dashboard/profile', label: 'Profile', icon: FaUser }]
  }

  const navigationItems = getNavigationItems()

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 flex z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 z-50`}>

        {/* Close button for mobile */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-primary-600">
          <span className="text-white font-semibold">Menu</span>
          <button
            type="button"
            className="text-white hover:text-gray-300"
            onClick={onClose}
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {userRole.toLowerCase()} Portal
            </h3>
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.path)
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-700'
                  }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Logged in as: <span className="font-medium capitalize">{userRole.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
