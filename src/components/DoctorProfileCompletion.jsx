// components/DoctorProfileCompletion.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { API_CONFIG, buildUrl } from '../config/api'

const DOCTOR_TYPES = [
  { value: 'Aayurvedic', label: 'Aayurvedic' },
  { value: 'Western', label: 'Western' },
  { value: 'Homeopathic', label: 'Homeopathic' },
  { value: 'Unani', label: 'Unani' }
]

const SPECIALITIES = [
  'General Practice', 'Internal Medicine', 'Pediatrics', 'Cardiology', 
  'Dermatology', 'Neurology', 'Orthopedics', 'Psychiatry', 'Radiology',
  'Surgery', 'Gynecology', 'Oncology', 'Ophthalmology', 'ENT',
  'Anesthesiology', 'Emergency Medicine', 'Family Medicine', 'Pathology'
]

const DoctorProfileCompletion = ({ onComplete }) => {
  const { apiCall, updateUser } = useAuth()
  const notifications = useNotifications()
  
  const [formData, setFormData] = useState({
    education: '',
    experience: '',
    specialities: [],
    type: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.education.trim()) {
      newErrors.education = 'Education is required'
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required'
    }
    
    if (!formData.type) {
      newErrors.type = 'Doctor type is required'
    }
    
    if (!formData.specialities.length) {
      newErrors.specialities = 'At least one speciality is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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

  const handleSpecialityChange = (speciality) => {
    setFormData(prev => {
      const isSelected = prev.specialities.includes(speciality)
      const newSpecialities = isSelected
        ? prev.specialities.filter(s => s !== speciality)
        : [...prev.specialities, speciality]
      
      return {
        ...prev,
        specialities: newSpecialities
      }
    })
    
    // Clear specialities error when user selects at least one
    if (errors.specialities) {
      setErrors(prev => ({
        ...prev,
        specialities: ''
      }))
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
        specialities: formData.specialities.join(',') // Convert array to comma-separated string
      }
      
      const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.PROFILE), {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to complete profile')
      }
      
      // Handle both JSON and text responses
      let result
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        result = { message: await response.text() }
      }
      
      // Update user context to reflect profile completion
      updateUser({ profileCompleted: true })
      
      notifications.success('Profile completed successfully!')
      
      if (onComplete) {
        onComplete(result)
      }
      
    } catch (err) {
      console.error('Profile completion error:', err)
      notifications.error(err.message || 'Failed to complete profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Doctor Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide additional information to access your dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white shadow rounded-lg p-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Education */}
            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                Education *
              </label>
              <textarea
                id="education"
                name="education"
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.education ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your educational qualifications (e.g., MBBS from XYZ University, MD in Internal Medicine)"
                value={formData.education}
                onChange={handleInputChange}
              />
              {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                Experience *
              </label>
              <textarea
                id="experience"
                name="experience"
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.experience ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your professional experience (years of practice, previous positions, etc.)"
                value={formData.experience}
                onChange={handleInputChange}
              />
              {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
            </div>

            {/* Doctor Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Doctor Type *
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
                <option value="">Select doctor type</option>
                {DOCTOR_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Specialities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Specialities * (Select all that apply)
              </label>
              <div className={`border rounded-md p-4 max-h-60 overflow-y-auto ${
                errors.specialities ? 'border-red-300' : 'border-gray-300'
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPECIALITIES.map((speciality) => (
                    <label key={speciality} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        checked={formData.specialities.includes(speciality)}
                        onChange={() => handleSpecialityChange(speciality)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{speciality}</span>
                    </label>
                  ))}
                </div>
              </div>
              {errors.specialities && <p className="mt-1 text-sm text-red-600">{errors.specialities}</p>}
              {formData.specialities.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected: {formData.specialities.length} specialit{formData.specialities.length === 1 ? 'y' : 'ies'}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.specialities.map((speciality) => (
                      <span
                        key={speciality}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {speciality}
                        <button
                          type="button"
                          className="ml-1 inline-flex items-center justify-center w-4 h-4 text-indigo-400 hover:text-indigo-600"
                          onClick={() => handleSpecialityChange(speciality)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

export default DoctorProfileCompletion
