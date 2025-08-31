import { useState } from 'react'
import { FaUserMd, FaEnvelope, FaClock, FaMoneyBillWave, FaCalendar, FaTimes, FaCheck } from 'react-icons/fa'
import { useDoctorInvitations } from '../../hooks/useDoctorInvitations'
import { useNotification } from '../../hooks/useNotification'

const InviteDoctorsPage = () => {
  const { doctors, invitations, loadingDoctors, loadingInvitations, sendInvitation, revokeInvitation } = useDoctorInvitations()
  const { success, error } = useNotification()
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [activeTab, setActiveTab] = useState('available') // 'available' or 'invited'
  const [validationError, setValidationError] = useState('')

  const daysOfWeek = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
  ]

  const [invitationForm, setInvitationForm] = useState({
    doctorId: '',
    day: '',
    startTime: '',
    endTime: '',
    perPatientMinutes: '',
    offerRate: '',
    perPatientRate: '',
    status: 'PENDING'
  })

  const handleInviteDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setInvitationForm({
      ...invitationForm,
      doctorId: doctor.id
    })
    setValidationError('')
    setShowInviteModal(true)
  }

  const handleFormChange = (field, value) => {
    const updatedForm = { ...invitationForm, [field]: value }
    setInvitationForm(updatedForm)
    
    // Clear validation error when user makes changes
    if (validationError) {
      setValidationError('')
    }
    
    // If we have start and end time filled, validate in real-time
    if (updatedForm.startTime && updatedForm.endTime) {
      const validation = validateTimeSlotForForm(updatedForm)
      if (!validation.isValid) {
        setValidationError(validation.message)
      }
    }
  }

  const validateTimeSlotForForm = (form) => {
    const { startTime, endTime, perPatientMinutes } = form
    
    // If we don't have start and end time, no validation needed
    if (!startTime || !endTime) {
      return { isValid: true, message: '' }
    }

    // Convert times to minutes for easier calculation
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    // Check if end time is after start time
    if (endMinutes <= startMinutes) {
      return { isValid: false, message: 'End time must be after start time.' }
    }
    
    // Calculate duration in minutes
    const durationMinutes = endMinutes - startMinutes
    
    // Check if duration exceeds 6 hours (360 minutes) - show this error first
    if (durationMinutes > 360) {
      return { 
        isValid: false, 
        message: 'Time slot duration cannot exceed 6 hours.' 
      }
    }
    
    // Check if end time crosses midnight (after 11:59 PM)
    if (endHour >= 24 || (endHour === 23 && endMin === 59)) {
      return { 
        isValid: false, 
        message: 'End time cannot cross midnight. Please create a separate invitation for the next day.' 
      }
    }
    
    // Only check per patient minutes if it's selected
    if (perPatientMinutes && durationMinutes < perPatientMinutes) {
      return { 
        isValid: false, 
        message: `Time slot duration (${durationMinutes} minutes) must be at least ${perPatientMinutes} minutes per patient.` 
      }
    }
    
    return { isValid: true, message: '' }
  }

  const handleSubmitInvitation = async (e) => {
    e.preventDefault()
    
    // Validate time slot
    const validation = validateTimeSlot()
    if (!validation.isValid) {
      error(validation.message)
      return
    }
    
    try {
      await sendInvitation(invitationForm)
      success('Invitation sent successfully!')
      setShowInviteModal(false)
      setInvitationForm({
        doctorId: '',
        day: '',
        startTime: '',
        endTime: '',
        perPatientMinutes: '',
        offerRate: '',
        perPatientRate: '',
        status: 'PENDING'
      })
      setSelectedDoctor(null)
    } catch (err) {
      error('Failed to send invitation. Please try again.')
    }
  }

  const handleRevokeInvitation = async (invitationId) => {
    try {
      await revokeInvitation(invitationId)
      success('Invitation revoked successfully!')
    } catch (err) {
      error('Failed to revoke invitation. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const validateTimeSlot = () => {
    const { startTime, endTime, perPatientMinutes } = invitationForm
    
    if (!startTime || !endTime || !perPatientMinutes) {
      return { isValid: false, message: 'Please fill in all time fields.' }
    }

    // Convert times to minutes for easier calculation
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    // Check if end time is after start time
    if (endMinutes <= startMinutes) {
      return { isValid: false, message: 'End time must be after start time.' }
    }
    
    // Calculate duration in minutes
    const durationMinutes = endMinutes - startMinutes
    
    // Check if duration is less than per patient minutes
    if (durationMinutes < perPatientMinutes) {
      return { 
        isValid: false, 
        message: `Time slot duration (${durationMinutes} minutes) must be at least ${perPatientMinutes} minutes per patient.` 
      }
    }
    
    // Check if duration exceeds 6 hours (360 minutes)
    if (durationMinutes > 360) {
      return { 
        isValid: false, 
        message: 'Time slot duration cannot exceed 6 hours.' 
      }
    }
    
    // Check if end time crosses midnight (after 11:59 PM)
    if (endHour >= 24 || (endHour === 23 && endMin === 59)) {
      return { 
        isValid: false, 
        message: 'End time cannot cross midnight. Please create a separate invitation for the next day.' 
      }
    }
    
    return { isValid: true, message: '' }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Invitations</h1>
          <p className="text-gray-600 mt-2">Manage doctor invitations for your dispensary.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Doctors
          </button>
          <button
            onClick={() => setActiveTab('invited')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invited'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sent Invitations
          </button>
        </nav>
      </div>

      {/* Available Doctors Tab */}
      {activeTab === 'available' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Doctors</h2>
          {loadingDoctors ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading doctors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <FaUserMd className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-gray-600 text-sm">{doctor.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Experience:</span> {doctor.experience}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Specialities:</span> {doctor.specialities}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Education:</span> {doctor.education}
                    </p>
                  </div>

                  <button
                    onClick={() => handleInviteDoctor(doctor)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaEnvelope className="mr-2 h-4 w-4" />
                    Send Invitation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sent Invitations Tab */}
      {activeTab === 'invited' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sent Invitations</h2>
          {loadingInvitations ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading invitations...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offer Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invitation.doctorId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invitation.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(invitation.startTime)} - {formatTime(invitation.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invitation.perPatientMinutes} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invitation.offerRate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                            {invitation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {invitation.status === 'PENDING' && (
                            <button
                              onClick={() => handleRevokeInvitation(invitation.id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <FaTimes className="mr-1 h-3 w-3" />
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invitations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No invitations sent yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Invitation Modal */}
      {showInviteModal && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Invite Dr. {selectedDoctor.name}
              </h3>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setValidationError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={invitationForm.day}
                  onChange={(e) => handleFormChange('day', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={invitationForm.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={invitationForm.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Validation Error Display - moved here after time inputs */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaTimes className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{validationError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minutes per Patient
                </label>
                <select
                  value={invitationForm.perPatientMinutes}
                  onChange={(e) => handleFormChange('perPatientMinutes', parseInt(e.target.value) || '')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select duration</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invitationForm.offerRate}
                  onChange={(e) => handleFormChange('offerRate', parseFloat(e.target.value) || '')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter doctor's offer rate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Per Patient Rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invitationForm.perPatientRate}
                  onChange={(e) => handleFormChange('perPatientRate', parseFloat(e.target.value) || '')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter per patient rate"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false)
                    setValidationError('')
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaEnvelope className="mr-2 h-4 w-4" />
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InviteDoctorsPage
