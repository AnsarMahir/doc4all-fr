import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaLeaf, FaYinYang, FaHospital, FaMosque, FaArrowLeft, FaStar, FaClock, FaCalendarAlt, FaUserMd, FaGraduationCap, FaStethoscope } from 'react-icons/fa'
import { API_CONFIG, buildUrl } from '../config/api'
import { useApi } from '../hooks/useApi'
import { useNotifications } from '../contexts/NotificationContext'

// Mock images for dispensaries (since we don't provide images)
const getDispensaryImage = (type) => {
  const images = {
    Ayurvedic: "https://images.unsplash.com/photo-1731597076108-f3bbe268162f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    Homeopathy: "https://images.unsplash.com/photo-1512867957657-38dbae50a35b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    Western: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    Unani: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
  return images[type] || images.Western
}

const getTypeIcon = (type) => {
  const icons = {
    Ayurvedic: <FaLeaf className="text-green-600" />,
    Homeopathy: <FaYinYang className="text-blue-600" />,
    Western: <FaHospital className="text-red-600" />,
    Unani: <FaMosque className="text-purple-600" />
  }
  return icons[type] || icons.Western
}

const DispensaryDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { get, post } = useApi()
  const notifications = useNotifications()
  
  const [dispensary, setDispensary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedScheduleForBooking, setSelectedScheduleForBooking] = useState(null)

  // Clear selected schedule and slots when date changes
  useEffect(() => {
    setSelectedSchedule(null)
    setSlots([])
  }, [selectedDate])

  useEffect(() => {
    const fetchDispensaryDetails = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        // Fetch initial data without date parameter to avoid re-renders
        const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.DISPENSARY_DETAILS_WITH_DOCTORS(id)))
        setDispensary(response)
      } catch (err) {
        setError('Failed to fetch dispensary details')
        console.error('Error fetching dispensary details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDispensaryDetails()
  }, [id, get]) // Now safe to include get since it's memoized with useCallback

  const fetchSlots = async (scheduleId) => {
    try {
      setLoadingSlots(true)
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.SCHEDULE_SLOTS(scheduleId, selectedDate)))
      
      // Transform the API response to include display time
      const slotsWithDisplay = (response || []).map(slot => ({
        ...slot,
        displayTime: `${formatTime(slot.start)} - ${formatTime(slot.end)}`
      }))
      
      setSlots(slotsWithDisplay)
      setSelectedSchedule(scheduleId)
    } catch (err) {
      console.error('Error fetching slots:', err)
      setSlots([])
      notifications.error('Failed to fetch available slots. Please try again.')
    } finally {
      setLoadingSlots(false)
    }
  }

  const bookAppointment = async (scheduleId, slotStartTime) => {
    try {
      setBookingLoading(true)
      
      const bookingData = {
        scheduleId: scheduleId,
        appointmentDate: selectedDate,
        slotStartTime: slotStartTime
      }

      await post(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.BOOKINGS), bookingData)
      
      setBookingSuccess(true)
      notifications.success('Appointment booked successfully!')
      
      // Reset success message after 5 seconds
      setTimeout(() => setBookingSuccess(false), 5000)
      
      // Refresh the slots to show updated availability
      await fetchSlots(scheduleId)
      
    } catch (err) {
      console.error('Error booking appointment:', err)
      notifications.error(err.message || 'Failed to book appointment. Please try again.')
    } finally {
      setBookingLoading(false)
      setShowConfirmDialog(false)
      setSelectedSlot(null)
      setSelectedScheduleForBooking(null)
    }
  }

  const handleSlotClick = (slot, scheduleId) => {
    if (!slot.available) return
    
    setSelectedSlot(slot)
    setSelectedScheduleForBooking(scheduleId)
    setShowConfirmDialog(true)
  }

  const confirmBooking = () => {
    if (selectedSlot && selectedScheduleForBooking) {
      bookAppointment(selectedScheduleForBooking, selectedSlot.start)
    }
  }

  const cancelBooking = () => {
    setShowConfirmDialog(false)
    setSelectedSlot(null)
    setSelectedScheduleForBooking(null)
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getDayName = (dayOfWeek) => {
    const days = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday', 
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
      'SATURDAY': 'Saturday',
      'SUNDAY': 'Sunday'
    }
    return days[dayOfWeek] || dayOfWeek
  }

  const getSelectedDateDayOfWeek = (dateString) => {
    const date = new Date(dateString)
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    return days[date.getDay()]
  }

  const isDoctorAvailableOnSelectedDate = (doctorDay, selectedDate) => {
    const selectedDayOfWeek = getSelectedDateDayOfWeek(selectedDate)
    return doctorDay === selectedDayOfWeek
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dispensary details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dispensary) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error || 'Dispensary not found'}</p>
            <button 
              onClick={() => navigate('/search-dispensaries')} 
              className="btn-primary"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> Your appointment has been booked successfully.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Image */}
          <div className="h-64 md:h-96 relative">
            <img
              src={getDispensaryImage(dispensary.type)}
              alt={dispensary.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{dispensary.name}</h1>
                <div className="flex items-center">
                  {getTypeIcon(dispensary.type)}
                  <span className="ml-2 text-lg">{dispensary.type} Medicine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Rating Display */}
            {dispensary.rating && (
              <div className="flex items-center justify-center mb-6">
                <div className="bg-yellow-50 rounded-lg p-4 flex items-center">
                  <FaStar className="text-yellow-400 text-2xl mr-3" />
                  <div>
                    <span className="text-2xl font-bold text-gray-800">{dispensary.rating.toFixed(1)}</span>
                    <span className="text-gray-600 ml-2">Overall Rating</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                {dispensary.description ? (
                  <p className="text-gray-600 mb-6">{dispensary.description}</p>
                ) : (
                  <p className="text-gray-600 mb-6 italic">No description available.</p>
                )}

                <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-primary-600 mr-3" />
                    <span>{dispensary.address}</span>
                  </div>
                  
                  {dispensary.contactNumber && (
                    <div className="flex items-center">
                      <FaPhone className="text-primary-600 mr-3" />
                      <a href={`tel:${dispensary.contactNumber}`} className="text-primary-600 hover:underline">
                        {dispensary.contactNumber}
                      </a>
                    </div>
                  )}
                  
                  {dispensary.website && (
                    <div className="flex items-center">
                      <FaEnvelope className="text-primary-600 mr-3" />
                      <a href={dispensary.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Location & Additional Info */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Location</h3>
                {dispensary.latitude && dispensary.longitude ? (
                  <div className="mb-6">
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-2">Coordinates:</p>
                      <p className="font-mono text-sm">
                        Lat: {dispensary.latitude}, Lng: {dispensary.longitude}
                      </p>
                      <button 
                        onClick={() => window.open(`https://maps.google.com?q=${dispensary.latitude},${dispensary.longitude}`, '_blank')}
                        className="mt-3 btn-primary"
                      >
                        View on Google Maps
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600">Location coordinates not available</p>
                      <button 
                        onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(dispensary.address)}`, '_blank')}
                        className="mt-3 btn-primary"
                      >
                        Search Address on Google Maps
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-3">Treatment Type</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    {getTypeIcon(dispensary.type)}
                    <div className="ml-3">
                      <h4 className="font-medium">{dispensary.type} Medicine</h4>
                      <p className="text-sm text-gray-600">
                        Specialized in {dispensary.type.toLowerCase()} treatments and therapies
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctors and Booking Section */}
            {dispensary.approvedDoctors && dispensary.approvedDoctors.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Available Doctors & Booking</h2>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-500 mr-2" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid gap-6">
                  {dispensary.approvedDoctors.map(doctor => (
                    <div key={doctor.scheduleId} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                            <FaUserMd className="text-primary-600 mr-2" />
                            {doctor.doctorName}
                          </h3>
                          <p className="text-gray-600 mb-2">{doctor.doctorEmail}</p>
                          
                          {doctor.specialities && (
                            <div className="mb-3">
                              <div className="flex items-center mb-1">
                                <FaStethoscope className="text-gray-500 mr-2 text-sm" />
                                <span className="font-medium text-sm">Specialities:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {doctor.specialities.split(',').map((specialty, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    {specialty.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {doctor.education && (
                            <div className="mb-3">
                              <div className="flex items-center">
                                <FaGraduationCap className="text-gray-500 mr-2 text-sm" />
                                <span className="text-sm text-gray-600">{doctor.education}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <FaClock className="mr-2" />
                            <span>
                              {getDayName(doctor.day)} • {formatTime(doctor.startTime)} - {formatTime(doctor.endTime)}
                            </span>
                          </div>

                          {doctor.rate && (
                            <div className="text-lg font-semibold text-green-600">
                              ${doctor.rate} per consultation
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        {isDoctorAvailableOnSelectedDate(doctor.day, selectedDate) ? (
                          <button
                            onClick={() => fetchSlots(doctor.scheduleId)}
                            className="btn-primary"
                            disabled={loadingSlots}
                          >
                            {loadingSlots && selectedSchedule === doctor.scheduleId ? 'Loading...' : 'View Available Slots'}
                          </button>
                        ) : (
                          <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-md">
                            Doctor not available on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}. 
                            Available on {getDayName(doctor.day)}s only.
                          </div>
                        )}
                      </div>

                      {/* Slots Display */}
                      {selectedSchedule === doctor.scheduleId && isDoctorAvailableOnSelectedDate(doctor.day, selectedDate) && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-3">Available Slots for {selectedDate}</h4>
                          {slots.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {slots.map((slot, index) => (
                                <button
                                  key={index}
                                  className={`p-3 text-sm border rounded-md transition-colors text-center ${
                                    slot.available 
                                      ? 'border-primary-300 hover:bg-primary-100 cursor-pointer' 
                                      : 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                                  } ${
                                    bookingLoading ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                  disabled={!slot.available || bookingLoading}
                                  onClick={() => handleSlotClick(slot, doctor.scheduleId)}
                                >
                                  <span className="block">{slot.displayTime}</span>
                                  {!slot.available && (
                                    <span className="text-xs text-gray-400 block mt-1">Not Available</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No available slots for this date.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Appointment Booking</h3>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to book this appointment?
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {selectedSlot.displayTime}</p>
                  <p><strong>Doctor:</strong> {dispensary?.approvedDoctors?.find(d => d.scheduleId === selectedScheduleForBooking)?.doctorName}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelBooking}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={bookingLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DispensaryDetailsPage