import { useState } from 'react'

const LoginSection = ({ activeForm, toggleForm }) => {
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
    console.log('Login form submitted:', formData)
    // Here you would typically authenticate the user
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
      
      {/* Form Type Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeForm === 'patient-doctor'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-300`}
            onClick={() => toggleForm('patient-doctor')}
          >
            Patient & Doctor
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeForm === 'dispensary'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-300`}
            onClick={() => toggleForm('dispensary')}
          >
            Dispensary
          </button>
        </div>
      </div>

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
          Don't have an account? <a href="#" className="text-primary-600 hover:underline">Sign up</a>
        </p>
      </form>
    </div>
  )
}

export default LoginSection