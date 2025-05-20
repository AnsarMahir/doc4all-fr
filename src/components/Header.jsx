import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaSearch, FaList } from 'react-icons/fa'

const Header = ({ openLoginModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold logo-text">Doc4All</Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-gray-700 hover:text-primary-600 font-medium ${location.pathname === '/' ? 'text-primary-600' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/browse-dispensaries" 
              className={`text-gray-700 hover:text-primary-600 font-medium ${location.pathname === '/browse-dispensaries' ? 'text-primary-600' : ''}`}
            >
              <span className="flex items-center">
                <FaList className="mr-1" /> Browse
              </span>
            </Link>
            <Link 
              to="/find-dispensaries" 
              className={`text-gray-700 hover:text-primary-600 font-medium ${location.pathname === '/find-dispensaries' ? 'text-primary-600' : ''}`}
            >
              <span className="flex items-center">
                <FaSearch className="mr-1" /> Find Nearby
              </span>
            </Link>
            <button 
              onClick={openLoginModal}
              className="btn-primary"
            >
              Login
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 focus:outline-none" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`text-gray-700 hover:text-primary-600 font-medium py-2 ${location.pathname === '/' ? 'text-primary-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/browse-dispensaries" 
                className={`text-gray-700 hover:text-primary-600 font-medium py-2 ${location.pathname === '/browse-dispensaries' ? 'text-primary-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <FaList className="mr-1" /> Browse
                </span>
              </Link>
              <Link 
                to="/find-dispensaries" 
                className={`text-gray-700 hover:text-primary-600 font-medium py-2 ${location.pathname === '/find-dispensaries' ? 'text-primary-600' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <FaSearch className="mr-1" /> Find Nearby
                </span>
              </Link>
              <button 
                onClick={() => {
                  openLoginModal()
                  setIsMenuOpen(false)
                }}
                className="btn-primary w-full"
              >
                Login
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header