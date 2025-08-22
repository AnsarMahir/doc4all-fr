// pages/dashboard/ProfilePage.jsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = () => {
    // In a real app, this would make an API call
    updateUser(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    })
    setIsEditing(false)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              >
                <FaSave className="mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="md:col-span-2 flex items-center space-x-6">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <FaUser className="h-10 w-10 text-primary-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {(formData.firstName || formData.lastName) ?
                    `${formData.firstName} ${formData.lastName}`.trim() :
                    'User'
                  }
                </h4>
                <p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{formData.firstName || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                  <span className="text-gray-900">{formData.lastName || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                <FaEnvelope className="mr-3 text-gray-400" />
                <span className="text-gray-900">{formData.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter phone number"
                  />
                </div>
              ) : (
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                  <FaPhone className="mr-3 text-gray-400" />
                  <span className="text-gray-900">{formData.phone || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              {isEditing ? (
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-gray-400 self-start mt-3" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your address"
                  />
                </div>
              ) : (
                <div className="flex items-start px-3 py-2 bg-gray-50 rounded-md">
                  <FaMapMarkerAlt className="mr-3 text-gray-400 mt-1" />
                  <span className="text-gray-900">{formData.address || 'Not set'}</span>
                </div>
              )}
            </div>

            {/* Role Badge */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {user.role.toLowerCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
