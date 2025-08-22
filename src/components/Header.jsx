// Header.jsx - Enhanced version with better styling
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaSearch, FaList, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'

const Header = ({ openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/browse-dispensaries', label: 'Browse', icon: FaList },
    { path: '/find-dispensaries', label: 'Find Nearby', icon: FaSearch }
  ]

  const handleMobileMenuClick = () => {
    setIsMenuOpen(false)
  }

  const handleAuthClick = () => {
    openAuthModal()
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setProfileDropdownOpen(false)
    navigate('/')
  }

  const handleDashboardClick = () => {
    navigate('/dashboard')
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
            Doc4All
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${location.pathname === path
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                  }`}
              >
                {Icon && <Icon className="mr-2 text-sm" />}
                {label}
              </Link>
            ))}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDashboardClick}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Dashboard
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaUser className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="ml-2 text-gray-700 text-sm font-medium">
                      {user.email}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link
                          to="/dashboard/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileDropdownOpen(false)}
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
            ) : (
              <button
                onClick={openAuthModal}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Login / Sign Up
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={handleMobileMenuClick}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                >
                  {Icon && <Icon className="mr-3 text-sm" />}
                  {label}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="pt-4 space-y-2">
                  <button
                    onClick={handleDashboardClick}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-md"
                  >
                    Dashboard
                  </button>
                  <Link
                    to="/dashboard/profile"
                    onClick={handleMobileMenuClick}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-md"
                  >
                    <FaUser className="mr-3 text-sm" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md"
                  >
                    <FaSignOutAlt className="mr-3 text-sm" />
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="w-full mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
