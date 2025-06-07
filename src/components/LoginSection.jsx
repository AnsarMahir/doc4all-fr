import { useState } from 'react'


const LoginSection = ({
  activeForm,
  toggleForm,
  openRegistrationModal   // ← add this prop
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // …your authenticate logic…
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
      
      {/* Form Type Selector (removed earlier) */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="input-field"
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
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-primary-600 hover:underline">
            Forgot Password?
          </a>
        </div>
        
        <button type="submit" className="btn-primary w-full">
          Log In
        </button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{' '}
          {/* ↓ Replace <a href="#"> with a button (or <a> with onClick) ↓ */}
          <button
            type="button"
            onClick={openRegistrationModal}
            className="text-primary-600 hover:underline"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  )
}

export default LoginSection
