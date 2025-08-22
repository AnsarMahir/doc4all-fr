// components/layout/DashboardHeader.jsx
import { useState } from 'react'
import { FaBars, FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

const DashboardHeader = ({ onMenuClick, user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <FaBars className="h-6 w-6" />
            </button>

            {/* Logo/Brand */}
            <div className="lg:flex lg:items-center lg:space-x-4">
              <Link to="/" className="text-xl font-bold text-primary-600 ml-4 lg:ml-0">
                Doc4All
              </Link>
              <span className="hidden lg:block text-gray-300">|</span>
              <span className="hidden lg:block text-gray-600 capitalize">
                {user.role.toLowerCase()} Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
              <FaBell className="h-6 w-6" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <FaUser className="h-4 w-4 text-primary-600" />
                </div>
                <span className="ml-3 text-gray-700 text-sm font-medium hidden sm:block">
                  {user.email}
                </span>
              </button>

              {dropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FaUser className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
