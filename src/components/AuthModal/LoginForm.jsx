import { useState } from "react";
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const LoginForm = ({ switchToRegister, switchToOtpVerification, closeModal }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Use the auth context
  const { login } = useAuth()
  const notifications = useNotifications()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Use the context's login method instead of direct fetch
      await login({
        email: formData.email,
        password: formData.password
      })
      
      closeModal()
    } catch (err) {
      setError(err.message)
      // Note: Error notification is already handled in AuthContext
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="loginEmail"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="loginPassword"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={switchToRegister}
          className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
        >
          Sign up
        </button>
      </p>

      {/* NEW: OTP verification link */}
      <p className="text-center text-sm text-gray-600 mt-2">
        Need to verify your email?{' '}
        <button
          type="button"
          onClick={() => switchToOtpVerification()}
          className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
        >
          Verify OTP
        </button>
      </p>
    </div>
  )
}

export default LoginForm