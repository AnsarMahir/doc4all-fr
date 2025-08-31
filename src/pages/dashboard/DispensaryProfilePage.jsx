// pages/dashboard/DispensaryProfilePage.jsx
import { useState, useEffect } from 'react'
import { useDispensary } from '../../hooks/useDispensary'
import { useNotifications } from '../../contexts/NotificationContext'

const DISPENSARY_TYPES = [
  { value: 'Western', label: 'Western' },
  { value: 'Unani', label: 'Unani' },
  { value: 'Homeopathy', label: 'Homeopathy' },
  { value: 'Aayurvedic', label: 'Aayurvedic' }
]

const DispensaryProfilePage = () => {
  const { getProfile, updateProfile, loading } = useDispensary()
  const notifications = useNotifications()
  
  const [profile, setProfile] = useState({
    address: '',
    longitude: '',
    latitude: '',
    description: '',
    phone: '', // Changed from contactNumber to phone
    website: '',
    type: ''
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setProfileLoading(true)
      const profileData = await getProfile()
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!profile.address.trim()) {
      newErrors.address = 'Address is required'
    }
    
    if (!profile.phone.trim()) {
      newErrors.phone = 'Contact number is required'
    }
    
    if (!profile.description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (profile.longitude && (isNaN(profile.longitude) || profile.longitude < -180 || profile.longitude > 180)) {
      newErrors.longitude = 'Please enter a valid longitude (-180 to 180)'
    }
    
    if (profile.latitude && (isNaN(profile.latitude) || profile.latitude < -90 || profile.latitude > 90)) {
      newErrors.latitude = 'Please enter a valid latitude (-90 to 90)'
    }
    
    if (profile.website && !isValidUrl(profile.website)) {
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
    setProfile(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const profileData = {
        ...profile,
        longitude: profile.longitude ? parseFloat(profile.longitude) : null,
        latitude: profile.latitude ? parseFloat(profile.latitude) : null
      }
      
      await updateProfile(profileData)
      setIsEditing(false)
      await loadProfile() // Reload to get updated data
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
          notifications.success('Location captured successfully!')
        },
        (error) => {
          notifications.error('Unable to get location. Please enter manually.')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      notifications.error('Geolocation is not supported by this browser.')
    }
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dispensary Profile</h1>
          <p className="text-gray-600 mt-2">Manage your dispensary information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address *
            </label>
            {isEditing ? (
              <textarea
                id="address"
                name="address"
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your dispensary's complete address"
                value={profile.address}
                onChange={handleInputChange}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                {profile.address || 'Not provided'}
              </p>
            )}
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Contact Number *
            </label>
            {isEditing ? (
              <input
                type="tel"
                id="phone"
                name="phone"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your contact number"
                value={profile.phone}
                onChange={handleInputChange}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                {profile.phone || 'Not provided'}
              </p>
            )}
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Dispensary Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Dispensary Type
            </label>
            <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
              {DISPENSARY_TYPES.find(t => t.value === profile.type)?.label || 'Not provided'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            {isEditing ? (
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your dispensary, services offered, specializations, etc."
                value={profile.description}
                onChange={handleInputChange}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                {profile.description || 'Not provided'}
              </p>
            )}
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              {isEditing ? (
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  step="any"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.latitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 40.7128"
                  value={profile.latitude}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                  {profile.latitude || 'Not provided'}
                </p>
              )}
              {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
            </div>
            
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              {isEditing ? (
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  step="any"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.longitude ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., -74.0060"
                  value={profile.longitude}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                  {profile.longitude || 'Not provided'}
                </p>
              )}
              {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                📍 Get Current Location
              </button>
            </div>
          )}

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website (Optional)
            </label>
            {isEditing ? (
              <input
                type="url"
                id="website"
                name="website"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.website ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://www.yourdispensary.com"
                value={profile.website}
                onChange={handleInputChange}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                {profile.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                    {profile.website}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            )}
            {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setErrors({})
                  loadProfile() // Reset form data
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default DispensaryProfilePage
