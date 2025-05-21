import { useState } from 'react'

const RegistrationSection = ({ activeForm, toggleForm }) => {
  const [userType, setUserType] = useState('patient')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    medicalCertification: null,
    dispensaryName: '',
    location: '',
    licenseNumber: '',
    dispensaryLicense: null
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData({
      ...formData,
      [name]: files[0]
    })
  }

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (activeForm === 'dispensary') {
      // Create FormData object for multipart/form-data submission
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('name', formData.dispensaryName)
      formDataToSubmit.append('email', formData.email)
      formDataToSubmit.append('password', formData.password)
      formDataToSubmit.append('address', formData.location)
      formDataToSubmit.append('certificate', formData.dispensaryLicense)
      
      // Send POST request to the backend
      fetch('http://localhost:8005/api/auth/register', {
        method: 'POST',
        body: formDataToSubmit,
      })
        .then(response => response.text())
        .then(data => {
          console.log('Success:', data)
          // Handle successful registration (e.g., show success message, redirect)
          alert('Registration successful!')
        })
        .catch(error => {
          console.error('Error:', error)
          // Handle error (e.g., show error message)
          alert('Registration failed. Please try again.')
        })
    } else {
      // Handle patient/doctor registration (not implemented in this update)
      console.log('Form submitted:', formData)
    }
  }

  return (
    <div className="py-6 relative max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
      
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

      {/* Scrollable form container */}
      <div className="max-h-[60vh] overflow-y-auto px-4 py-2 border border-gray-200 rounded-lg">
        {activeForm === 'patient-doctor' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div className="flex space-x-4 mb-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary-600"
                  name="userType"
                  value="patient"
                  checked={userType === 'patient'}
                  onChange={handleUserTypeChange}
                />
                <span className="ml-2">Patient</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary-600"
                  name="userType"
                  value="doctor"
                  checked={userType === 'doctor'}
                  onChange={handleUserTypeChange}
                />
                <span className="ml-2">Doctor</span>
              </label>
            </div>

            {/* Common Fields */}
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
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
            
            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
            {/* Doctor-specific Fields */}
            {userType === 'doctor' && (
              <div>
                <label htmlFor="medicalCertification" className="form-label">
                  Medical Certification (PDF)
                </label>
                <input
                  type="file"
                  id="medicalCertification"
                  name="medicalCertification"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100"
                  accept=".pdf"
                  required
                />
              </div>
            )}
            
            <button type="submit" className="btn-primary w-full">
              Create Account
            </button>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account? <a href="#" className="text-primary-600 hover:underline">Log in</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="dispensaryName" className="form-label">Dispensary Name</label>
              <input
                type="text"
                id="dispensaryName"
                name="dispensaryName"
                value={formData.dispensaryName}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
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
              <label htmlFor="location" className="form-label">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label htmlFor="licenseNumber" className="form-label">License Number</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dispensaryLicense" className="form-label">
                Dispensary License (PDF)
              </label>
              <input
                type="file"
                id="dispensaryLicense"
                name="dispensaryLicense"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
                accept=".pdf"
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
            
            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary w-full">
              Register Dispensary
            </button>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account? <a href="#" className="text-primary-600 hover:underline">Log in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default RegistrationSection