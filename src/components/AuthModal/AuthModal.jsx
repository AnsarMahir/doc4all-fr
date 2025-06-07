import { useState } from 'react'
import LoginForm from './LoginForm'
import RegistrationForm from './RegistrationForm'

const AuthModal = ({ onClose }) => {
  const [view, setView] = useState('login')

  const showLogin = () => setView('login')
  const showRegister = () => setView('register')

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Fixed header with tabs */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex justify-center">
            <div className="flex space-x-8">
              <button
                onClick={showLogin}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  view === 'login'
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Log In
                {view === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
              <button
                onClick={showRegister}
                className={`px-4 py-2 font-medium transition-colors relative ${
                  view === 'register'
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                Sign Up
                {view === 'register' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {view === 'login' ? (
            <LoginForm switchToRegister={showRegister} closeModal={onClose} />
          ) : (
            <RegistrationForm switchToLogin={showLogin} closeModal={onClose} />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal