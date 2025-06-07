// RegistrationForm.jsx - Updated version
import { useState } from 'react'

const RegistrationForm = ({ switchToLogin, closeModal }) => {
  const [userType, setUserType] = useState('patient')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    medicalCertification: null,
    dispensaryName: '',
    location: '',
    licenseNumber: '',
    dispensaryLicense: null
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData({ ...formData, [name]: files[0] })
  }

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value)
    // Clear form when switching user types
    setFormData({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      name: '',
      medicalCertification: null,
      dispensaryName: '',
      location: '',
      licenseNumber: '',
      dispensaryLicense: null
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const role = userType
    const payload = new FormData()
    payload.append('role', role)
    payload.append('email', formData.email)
    payload.append('password', formData.password)
    payload.append('confirmPassword', formData.confirmPassword)

    if (role === 'dispensary') {
      if (!formData.dispensaryName || !formData.location || !formData.licenseNumber || !formData.dispensaryLicense) {
        setError('Please fill all dispensary fields and upload license.')
        setLoading(false)
        return
      }
      payload.append('name', formData.dispensaryName)
      payload.append('address', formData.location)
      payload.append('licenseNumber', formData.licenseNumber)
      payload.append('certificate', formData.dispensaryLicense)
    } else {
      if (!formData.name) {
        setError('Please enter your full name.')
        setLoading(false)
        return
      }
      payload.append('name', formData.name)
      if (role === 'doctor') {
        if (!formData.medicalCertification) {
          setError('Please upload your medical certification.')
          setLoading(false)
          return
        }
        payload.append('medicalCertification', formData.medicalCertification)
      }
    }

    try {
      const res = await fetch('http://localhost:8005/api/auth/register', {
        method: 'POST',
        body: payload
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Registration failed')
      }
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* User type selection with better styling */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Account Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['patient', 'doctor', 'dispensary'].map(type => (
            <label 
              key={type} 
              className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                userType === type 
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name="userType"
                value={type}
                checked={userType === type}
                onChange={handleUserTypeChange}
              />
              <span className="text-sm font-medium capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamic fields based on user type */}
        {userType === 'dispensary' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispensary Name
              </label>
              <input
                name="dispensaryName"
                value={formData.dispensaryName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispensary License (PDF)
              </label>
              <input
                type="file"
                name="dispensaryLicense"
                onChange={handleFileChange}
                accept=".pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={userType === 'doctor' ? "Doctor's Name" : "Your Name"}
                required
              />
            </div>
            {userType === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Certification (PDF)
                </label>
                <input
                  type="file"
                  name="medicalCertification"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={switchToLogin}
          className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
        >
          Log in
        </button>
      </p>
    </div>
  )
}

export default RegistrationForm