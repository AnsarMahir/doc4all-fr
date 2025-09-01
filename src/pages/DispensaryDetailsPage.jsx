import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaLeaf, FaYinYang, FaHospital, FaMosque, FaArrowLeft, FaStar, FaClock, FaCalendarAlt, FaUserMd, FaGraduationCap, FaStethoscope, FaUser, FaUsers, FaUserShield, FaAccessibleIcon, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash } from 'react-icons/fa'
import { API_CONFIG, buildUrl } from '../config/api'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import BookingWithPayment from '../components/BookingWithPayment'

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
  const { user } = useAuth()
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedScheduleForBooking, setSelectedScheduleForBooking] = useState(null)
  
  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState(null)
  const [currentReviewPage, setCurrentReviewPage] = useState(0)
  const [totalReviewPages, setTotalReviewPages] = useState(0)
  const [reviewsTotal, setReviewsTotal] = useState(0)
  
  // Doctor reviews state
  const [doctorReviews, setDoctorReviews] = useState({}) // { doctorId: { reviews: [], loading: false, error: null, page: 0, totalPages: 0, total: 0 } }
  const [expandedDoctorReviews, setExpandedDoctorReviews] = useState({}) // { doctorId: boolean }

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

  // Fetch reviews when dispensary data is available
  useEffect(() => {
    if (id) {
      fetchReviews(0) // Start with first page
    }
  }, [id, get])

  const fetchReviews = async (page = 0) => {
    try {
      setReviewsLoading(true)
      setReviewsError(null)
      const url = buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.REVIEWS(id))
      const response = await get(`${url}?page=${page}&size=5`) // 5 reviews per page
      
      if (response && response.content) {
        setReviews(response.content)
        setCurrentReviewPage(response.number)
        setTotalReviewPages(response.totalPages)
        setReviewsTotal(response.totalElements)
      }
    } catch (err) {
      setReviewsError('Failed to fetch reviews')
      console.error('Error fetching reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchSlots = async (scheduleId) => {
    try {
      setLoadingSlots(true)
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.SCHEDULE_SLOTS(scheduleId, selectedDate)))
      
      // Transform the API response to include display time and check if slot is in the past
      const slotsWithDisplay = (response || []).map(slot => {
        const isSlotInPast = isSlotPast(slot.start, selectedDate)
        return {
          ...slot,
          displayTime: `${formatTime(slot.start)} - ${formatTime(slot.end)}`,
          available: slot.available && !isSlotInPast // Disable if originally unavailable OR if in the past
        }
      })
      
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

  const handleSlotClick = (slot, scheduleId) => {
    if (!slot.available) return
    
    setSelectedSlot(slot)
    setSelectedScheduleForBooking(scheduleId)
    setShowConfirmDialog(true)
  }

  const confirmBooking = () => {
    // Close confirmation dialog and open payment dialog
    setShowConfirmDialog(false)
    setShowPaymentDialog(true)
  }

  const cancelBooking = () => {
    setShowConfirmDialog(false)
    setShowPaymentDialog(false)
    setSelectedSlot(null)
    setSelectedScheduleForBooking(null)
  }

  const handleBookingSuccess = async (response) => {
    setShowPaymentDialog(false)
    setBookingSuccess(true)
    notifications.success('Appointment booked and payment processed successfully!')
    
    // Reset success message after 5 seconds
    setTimeout(() => setBookingSuccess(false), 5000)
    
    // Refresh the slots to show updated availability
    if (selectedScheduleForBooking) {
      await fetchSlots(selectedScheduleForBooking)
    }
    
    // Reset selected items
    setSelectedSlot(null)
    setSelectedScheduleForBooking(null)
  }

  const handleBookingError = (error) => {
    setShowPaymentDialog(false)
    notifications.error(error.message || 'Failed to book appointment. Please try again.')
    
    // Reset selected items
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

  // Helper function to check if a slot time has passed
  const isSlotPast = (slotStartTime, appointmentDate) => {
    const now = new Date()
    const slotDateTime = new Date(`${appointmentDate}T${slotStartTime}`)
    return slotDateTime <= now
  }

  // Helper function to check if any future booking is possible
  const getNextAvailableBookingDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Helper functions for reviews
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating, size = 'text-base') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className={`text-yellow-400 ${size}`} />)
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className={`text-yellow-400 ${size} opacity-50`} />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className={`text-gray-300 ${size}`} />)
    }

    return stars
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cleanliness':
        return <FaUserShield className="text-blue-500" />
      case 'staffSupport':
        return <FaUsers className="text-green-500" />
      case 'accessibility':
        return <FaAccessibleIcon className="text-purple-500" />
      default:
        return <FaStar className="text-yellow-500" />
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'cleanliness':
        return 'Cleanliness'
      case 'staffSupport':
        return 'Staff Support'
      case 'accessibility':
        return 'Accessibility'
      default:
        return category
    }
  }

  const handleReviewPageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalReviewPages) {
      fetchReviews(newPage)
    }
  }

  // Doctor reviews functions
  const fetchDoctorReviews = async (doctorId, page = 0) => {
    try {
      setDoctorReviews(prev => ({
        ...prev,
        [doctorId]: {
          ...prev[doctorId],
          loading: true,
          error: null
        }
      }))

      const url = buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.REVIEWS(doctorId))
      const response = await get(`${url}?page=${page}&size=3`) // 3 reviews per page for doctors
      
      if (response && response.content) {
        setDoctorReviews(prev => ({
          ...prev,
          [doctorId]: {
            reviews: response.content,
            loading: false,
            error: null,
            page: response.number,
            totalPages: response.totalPages,
            total: response.totalElements
          }
        }))
      }
    } catch (err) {
      setDoctorReviews(prev => ({
        ...prev,
        [doctorId]: {
          ...prev[doctorId],
          loading: false,
          error: 'Failed to fetch doctor reviews'
        }
      }))
      console.error('Error fetching doctor reviews:', err)
    }
  }

  const toggleDoctorReviews = (doctorId) => {
    const isExpanded = expandedDoctorReviews[doctorId]
    
    if (!isExpanded) {
      // Expanding - fetch reviews if not already loaded
      if (!doctorReviews[doctorId]) {
        fetchDoctorReviews(doctorId, 0)
      }
    }
    
    setExpandedDoctorReviews(prev => ({
      ...prev,
      [doctorId]: !isExpanded
    }))
  }

  const handleDoctorReviewPageChange = (doctorId, newPage) => {
    const doctorReviewData = doctorReviews[doctorId]
    if (doctorReviewData && newPage >= 0 && newPage < doctorReviewData.totalPages) {
      fetchDoctorReviews(doctorId, newPage)
    }
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
                      max={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Booking Information */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaClock className="text-blue-600 mt-1" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 mb-1">Booking Information</h3>
                      <div className="text-sm text-blue-700">
                        <p>• You can book appointments up to 5 days in advance</p>
                        <p>• Past time slots are automatically disabled</p>
                        <p>• Each doctor has specific available days and hours</p>
                      </div>
                    </div>
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
                            <>
                              {/* Check if all slots are unavailable due to past time */}
                              {slots.every(slot => !slot.available) && new Date(selectedDate).toDateString() === new Date().toDateString() && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <div className="flex items-center text-yellow-800">
                                    <FaClock className="mr-2 text-yellow-600" />
                                    <span className="text-sm font-medium">
                                      All slots for today have passed. You can start booking from {getNextAvailableBookingDate()}.
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {slots.map((slot, index) => {
                                  const isSlotInPast = isSlotPast(slot.start, selectedDate)
                                  return (
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
                                        <span className="text-xs text-gray-400 block mt-1">
                                          {isSlotInPast ? 'Time Passed' : 'Not Available'}
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-500 text-sm">No available slots for this date.</p>
                          )}
                        </div>
                      )}

                      {/* Doctor Reviews Section */}
                      <div className="mt-6 border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => toggleDoctorReviews(doctor.doctorId)}
                            className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
                          >
                            {expandedDoctorReviews[doctor.doctorId] ? (
                              <>
                                <FaEyeSlash className="mr-2" />
                                Hide Doctor Reviews
                              </>
                            ) : (
                              <>
                                <FaEye className="mr-2" />
                                View Doctor Reviews
                              </>
                            )}
                            {doctorReviews[doctor.doctorId]?.total > 0 && (
                              <span className="ml-2 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs">
                                {doctorReviews[doctor.doctorId].total}
                              </span>
                            )}
                          </button>
                        </div>

                        {expandedDoctorReviews[doctor.doctorId] && (
                          <div className="mt-4">
                            {doctorReviews[doctor.doctorId]?.loading ? (
                              <div className="flex justify-center items-center py-6">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                                <span className="ml-3 text-gray-600 text-sm">Loading doctor reviews...</span>
                              </div>
                            ) : doctorReviews[doctor.doctorId]?.error ? (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <p className="text-red-600 text-sm">{doctorReviews[doctor.doctorId].error}</p>
                                <button 
                                  onClick={() => fetchDoctorReviews(doctor.doctorId, 0)}
                                  className="mt-2 text-red-600 hover:text-red-700 underline text-sm"
                                >
                                  Try again
                                </button>
                              </div>
                            ) : !doctorReviews[doctor.doctorId]?.reviews || doctorReviews[doctor.doctorId].reviews.length === 0 ? (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                                <FaStar className="text-gray-300 text-2xl mx-auto mb-2" />
                                <p className="text-gray-600 text-sm">No reviews yet for this doctor</p>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-4">
                                  {doctorReviews[doctor.doctorId].reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center">
                                          <div className="bg-blue-100 rounded-full p-2 mr-3">
                                            <FaUser className="text-blue-600 text-sm" />
                                          </div>
                                          <div>
                                            <h5 className="font-medium text-gray-900 text-sm">
                                              {review.anonymous ? 'Anonymous Patient' : review.patientName || 'Patient'}
                                            </h5>
                                            <p className="text-gray-500 text-xs">{formatDate(review.createdAt)}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center">
                                          <div className="flex items-center mr-1">
                                            {renderStars(review.rating, 'text-sm')}
                                          </div>
                                          <span className="text-sm font-semibold text-gray-700">
                                            {review.rating}
                                          </span>
                                        </div>
                                      </div>

                                      {review.comment && (
                                        <div className="bg-white border-l-4 border-blue-400 p-3 rounded-r-lg">
                                          <p className="text-gray-700 text-sm italic leading-relaxed">"{review.comment}"</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Doctor Reviews Pagination */}
                                {doctorReviews[doctor.doctorId].totalPages > 1 && (
                                  <div className="flex items-center justify-center mt-4 space-x-2">
                                    <button
                                      onClick={() => handleDoctorReviewPageChange(doctor.doctorId, doctorReviews[doctor.doctorId].page - 1)}
                                      disabled={doctorReviews[doctor.doctorId].page === 0}
                                      className="flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <FaChevronLeft className="mr-1 text-xs" />
                                      Prev
                                    </button>

                                    <div className="flex items-center space-x-1">
                                      {Array.from({ length: doctorReviews[doctor.doctorId].totalPages }, (_, index) => (
                                        <button
                                          key={index}
                                          onClick={() => handleDoctorReviewPageChange(doctor.doctorId, index)}
                                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                            index === doctorReviews[doctor.doctorId].page
                                              ? 'bg-primary-600 text-white'
                                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                          }`}
                                        >
                                          {index + 1}
                                        </button>
                                      ))}
                                    </div>

                                    <button
                                      onClick={() => handleDoctorReviewPageChange(doctor.doctorId, doctorReviews[doctor.doctorId].page + 1)}
                                      disabled={doctorReviews[doctor.doctorId].page === doctorReviews[doctor.doctorId].totalPages - 1}
                                      className="flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      Next
                                      <FaChevronRight className="ml-1 text-xs" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Patient Reviews</h2>
                {reviewsTotal > 0 && (
                  <span className="text-gray-600 text-sm">
                    {reviewsTotal} review{reviewsTotal !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600">Loading reviews...</span>
                </div>
              ) : reviewsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-600">{reviewsError}</p>
                  <button 
                    onClick={() => fetchReviews(0)}
                    className="mt-2 text-red-600 hover:text-red-700 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <FaStar className="text-gray-300 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No reviews yet</p>
                  <p className="text-gray-500 text-sm">Be the first to leave a review after your appointment!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        {/* Review Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-primary-100 rounded-full p-3 mr-4">
                              <FaUser className="text-primary-600 text-lg" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {review.anonymous ? 'Anonymous Patient' : review.patientName || 'Patient'}
                              </h4>
                              <p className="text-gray-500 text-sm">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center mr-2">
                              {renderStars(review.overallRating)}
                            </div>
                            <span className="text-lg font-semibold text-gray-700">
                              {review.overallRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center">
                              {getCategoryIcon('cleanliness')}
                              <span className="ml-2 text-sm font-medium">Cleanliness</span>
                            </div>
                            <div className="flex items-center">
                              {renderStars(review.cleanliness, 'text-sm')}
                              <span className="ml-1 text-sm text-gray-600">({review.cleanliness})</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center">
                              {getCategoryIcon('staffSupport')}
                              <span className="ml-2 text-sm font-medium">Staff Support</span>
                            </div>
                            <div className="flex items-center">
                              {renderStars(review.staffSupport, 'text-sm')}
                              <span className="ml-1 text-sm text-gray-600">({review.staffSupport})</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center">
                              {getCategoryIcon('accessibility')}
                              <span className="ml-2 text-sm font-medium">Accessibility</span>
                            </div>
                            <div className="flex items-center">
                              {renderStars(review.accessibility, 'text-sm')}
                              <span className="ml-1 text-sm text-gray-600">({review.accessibility})</span>
                            </div>
                          </div>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                            <div className="flex">
                              <FaQuoteLeft className="text-blue-400 text-lg mr-3 mt-1 flex-shrink-0" />
                              <p className="text-gray-700 italic leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalReviewPages > 1 && (
                    <div className="flex items-center justify-center mt-8 space-x-4">
                      <button
                        onClick={() => handleReviewPageChange(currentReviewPage - 1)}
                        disabled={currentReviewPage === 0}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaChevronLeft className="mr-2" />
                        Previous
                      </button>

                      <div className="flex items-center space-x-2">
                        {Array.from({ length: totalReviewPages }, (_, index) => (
                          <button
                            key={index}
                            onClick={() => handleReviewPageChange(index)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              index === currentReviewPage
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handleReviewPageChange(currentReviewPage + 1)}
                        disabled={currentReviewPage === totalReviewPages - 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                        <FaChevronRight className="ml-2" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
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
                  {bookingLoading ? 'Booking...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Dialog */}
        {showPaymentDialog && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Complete Your Booking</h3>
                <button
                  onClick={cancelBooking}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <BookingWithPayment
                scheduleId={selectedScheduleForBooking}
                appointmentDate={selectedDate}
                slotStartTime={selectedSlot.start}
                onSuccess={handleBookingSuccess}
                onError={handleBookingError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DispensaryDetailsPage