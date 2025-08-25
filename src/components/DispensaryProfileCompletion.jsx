// components/DispensaryProfileCompletion.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { API_CONFIG, buildUrl } from '../config/api'

const DISPENSARY_TYPES = [
  { value: 'Aayurvedic', label: 'Aayurvedic' },
  { value: 'Western', label: 'Western' },
  { value: 'Unani', label: 'Unani' },
  { value: 'Homeopathic', label: 'Homeopathic' }
]

const DispensaryProfileCompletion = ({ onComplete }) => {
  const { apiCall, updateUser } = useAuth()
  const notifications = useNotifications()
  
  const [formData, setFormData] = useState({
    address: '',
    longitude: '',
    latitude: '',
    description: '',
    contactNumber: '',
    website: '',
    type: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    }
    
    if (!formData.type) {
      newErrors.type = 'Dispensary type is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Please enter a valid longitude (-180 to 180)'
    }
    
    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Please enter a valid latitude (-90 to 90)'
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
          setLoading(false)
          notifications.success('Location captured successfully!')
        },
        (error) => {
          setLoading(false)
          notifications.error('Unable to get location. Please enter manually.')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      notifications.error('Geolocation is not supported by this browser.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const profileData = {
        ...formData,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null
      }
      
      const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.COMPLETE_PROFILE), {
        method: 'POST',
        body: JSON.stringify(profileData)
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to complete profile')
      }
      
      const result = await response.json()
      
      // Update user context to reflect profile completion
      updateUser({ profileCompleted: true })
      
      notifications.success('Profile completed successfully!')
      
      if (onComplete) {
        onComplete(result)
      }
      
    } catch (error) {
      console.error('Profile completion error:', error)
      notifications.error(error.message || 'Failed to complete profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Dispensary Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide additional information to access your dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white shadow rounded-lg p-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your dispensary's complete address"
                value={formData.address}
                onChange={handleInputChange}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                Contact Number *
              </label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.contactNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your contact number"
                value={formData.contactNumber}
                onChange={handleInputChange}
              />
              {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
            </div>

            {/* Dispensary Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Dispensary Type *
              </label>
              <select
                id="type"
                name="type"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.type ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="">Select dispensary type</option>
                {DISPENSARY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your dispensary, services offered, specializations, etc."
                value={formData.description}
                onChange={handleInputChange}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  step="any"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.latitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 40.7128"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
                {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  step="any"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.longitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., -74.0060"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
                {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                📍 Get Current Location
              </button>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website (Optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.website ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://www.yourdispensary.com"
                value={formData.website}
                onChange={handleInputChange}
              />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DispensaryProfileCompletion
