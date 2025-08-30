import React, { useState } from 'react'
import { 
  FaEnvelope, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaCalendarAlt,
  FaDollarSign,
  FaMapMarkerAlt,
  FaEye,
  FaCalendarCheck
} from 'react-icons/fa'
import { useDoctorInvitationsReceived } from '../../hooks/useDoctorInvitationsReceived'
import { useNotification } from '../../hooks/useNotification'

const DoctorInvitationsPage = () => {
  const {
    invitations,
    schedules,
    loadingInvitations,
    loadingSchedules,
    respondToInvitation,
    updateScheduleStatus
  } = useDoctorInvitationsReceived()
  
  const { showSuccess, showError } = useNotification()
  const [respondingId, setRespondingId] = useState(null)
  const [updatingScheduleId, setUpdatingScheduleId] = useState(null)
  const [activeTab, setActiveTab] = useState('invitations')

  // Filter invitations by status
  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING')
  const rejectedInvitations = invitations.filter(inv => inv.status === 'REJECTED')

  // Filter schedules by status
  const acceptedSchedules = schedules.filter(schedule => 
    schedule.status?.toString().toUpperCase().trim() === 'ACCEPTED'
  )
  const pendingSchedules = schedules.filter(schedule => 
    schedule.status?.toString().toUpperCase().trim() === 'PENDING'
  )

  const handleResponse = async (invitationId, response) => {
    setRespondingId(invitationId)
    try {
      await respondToInvitation(invitationId, response)
      showSuccess(`Invitation ${response.toLowerCase()}ed successfully!`)
    } catch (error) {
      showError(`Failed to ${response.toLowerCase()} invitation`)
    } finally {
      setRespondingId(null)
    }
  }

  const handleToggleScheduleStatus = async (scheduleId, currentStatus) => {
    setUpdatingScheduleId(scheduleId)
    try {
      await updateScheduleStatus(scheduleId)
      const newStatus = currentStatus === 'PENDING' ? 'activated' : 'marked as pending'
      showSuccess(`Schedule ${newStatus} successfully!`)
    } catch (error) {
      showError('Failed to update schedule status')
    } finally {
      setUpdatingScheduleId(null)
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDay = (day) => {
    if (!day) return 'N/A'
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Invitations & Schedules</h1>
        <p className="text-gray-600 mt-2">Manage your dispensary invitations and view your schedules.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('invitations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invitations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaEnvelope className="inline-block mr-2" />
            Pending Invitations ({pendingInvitations.length})
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaCalendarCheck className="inline-block mr-2" />
            My Schedules ({acceptedSchedules.length} Active, {pendingSchedules.length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaTimes className="inline-block mr-2" />
            Rejected ({rejectedInvitations.length})
          </button>
        </nav>
      </div>

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div>
          {loadingInvitations ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-center py-12">
              <FaEnvelope className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending invitations</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any pending dispensary invitations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dispensary #{invitation.dispensaryId}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span className="font-medium">Day:</span>
                      <span className="ml-1">{formatDay(invitation.day)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-green-500" />
                      <span className="font-medium">Time:</span>
                      <span className="ml-1">
                        {formatTime(invitation.startTime)} - {formatTime(invitation.endTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-orange-500" />
                      <span className="font-medium">Per Patient:</span>
                      <span className="ml-1">{invitation.perPatientMinutes} minutes</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaDollarSign className="mr-2 text-purple-500" />
                      <span className="font-medium">Offer Rate:</span>
                      <span className="ml-1">${invitation.offerRate}</span>
                    </div>
                  </div>

                  {invitation.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleResponse(invitation.id, 'ACCEPT')}
                        disabled={respondingId === invitation.id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <FaCheck className="mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(invitation.id, 'REJECT')}
                        disabled={respondingId === invitation.id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-8">
          {loadingSchedules ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any schedules yet.</p>
            </div>
          ) : (
            <>
              {/* Active Schedules */}
              {acceptedSchedules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Active Schedules ({acceptedSchedules.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {acceptedSchedules.map((schedule) => (
                      <div key={schedule.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dispensary #{schedule.dispensaryId}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {schedule.status}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2 text-blue-500" />
                            <span className="font-medium">Day:</span>
                            <span className="ml-1">{formatDay(schedule.day)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <FaClock className="mr-2 text-green-500" />
                            <span className="font-medium">Time:</span>
                            <span className="ml-1">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <FaClock className="mr-2 text-orange-500" />
                            <span className="font-medium">Per Patient:</span>
                            <span className="ml-1">{schedule.perPatientMinutes} minutes</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <FaDollarSign className="mr-2 text-purple-500" />
                            <span className="font-medium">Agreed Rate:</span>
                            <span className="ml-1">${schedule.agreedRate}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleScheduleStatus(schedule.id, schedule.status)}
                          disabled={updatingScheduleId === schedule.id}
                          className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {updatingScheduleId === schedule.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <FaClock className="mr-2" />
                          )}
                          Mark as Pending
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Schedules */}
              {pendingSchedules.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    Pending Schedules ({pendingSchedules.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingSchedules.map((schedule) => (
                      <div key={schedule.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Dispensary #{schedule.dispensaryId}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            {schedule.status}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2 text-blue-500" />
                            <span className="font-medium">Day:</span>
                            <span className="ml-1">{formatDay(schedule.day)}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <FaClock className="mr-2 text-green-500" />
                            <span className="font-medium">Time:</span>
                            <span className="ml-1">
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <FaClock className="mr-2 text-orange-500" />
                            <span className="font-medium">Per Patient:</span>
                            <span className="ml-1">{schedule.perPatientMinutes} minutes</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <FaDollarSign className="mr-2 text-purple-500" />
                            <span className="font-medium">Agreed Rate:</span>
                            <span className="ml-1">${schedule.agreedRate}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleScheduleStatus(schedule.id, schedule.status)}
                          disabled={updatingScheduleId === schedule.id}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {updatingScheduleId === schedule.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <FaCheck className="mr-2" />
                          )}
                          Activate Schedule
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No schedules message */}
              {acceptedSchedules.length === 0 && pendingSchedules.length === 0 && (
                <div className="text-center py-12">
                  <FaCalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any schedules yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Rejected Invitations Tab */}
      {activeTab === 'rejected' && (
        <div>
          {loadingInvitations ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : rejectedInvitations.length === 0 ? (
            <div className="text-center py-12">
              <FaTimes className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rejected invitations</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any rejected invitations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedInvitations.map((invitation) => (
                <div key={invitation.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 opacity-75">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dispensary #{invitation.dispensaryId}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span className="font-medium">Day:</span>
                      <span className="ml-1">{formatDay(invitation.day)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-green-500" />
                      <span className="font-medium">Time:</span>
                      <span className="ml-1">
                        {formatTime(invitation.startTime)} - {formatTime(invitation.endTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-orange-500" />
                      <span className="font-medium">Per Patient:</span>
                      <span className="ml-1">{invitation.perPatientMinutes} minutes</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <FaDollarSign className="mr-2 text-purple-500" />
                      <span className="font-medium">Offer Rate:</span>
                      <span className="ml-1">${invitation.offerRate}</span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500 italic">
                    This invitation was rejected
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DoctorInvitationsPage
