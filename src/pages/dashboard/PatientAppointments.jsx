import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserMd, FaExclamationTriangle, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { API_CONFIG, buildUrl } from '../../config/api';

const PatientAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const { get, post } = useApi();
  const { success, error: showError } = useNotification();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.BOOKINGS));
      setBookings(response || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canCancelBooking = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDay = new Date(appointmentDate);
    appointmentDay.setHours(0, 0, 0, 0);
    
    return appointmentDay > today;
  };

  const handleCancelClick = (booking) => {
    if (!canCancelBooking(booking.appointmentDate)) {
      showError('You can only cancel appointments before the appointment day.');
      return;
    }
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setCancellingBookingId(selectedBooking.bookingId);
      
      await post(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.CANCEL_BOOKING(selectedBooking.bookingId)));
      
      success('Appointment cancelled successfully! Your refund will be processed shortly.');
      
      // Refresh the bookings list
      await fetchBookings();
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showError(err.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setCancellingBookingId(null);
      setShowCancelDialog(false);
      setSelectedBooking(null);
    }
  };

  const cancelDialog = () => {
    setShowCancelDialog(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
        <span className="ml-3 text-lg text-gray-600">Loading your appointments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">Manage your upcoming and past appointments</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600 mb-6">You haven't booked any appointments yet.</p>
          <a
            href="/dashboard/patient/find-dispensaries"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <FaMapMarkerAlt className="mr-2" />
            Find Dispensaries
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.bookingId} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        Appointment #{booking.bookingId}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <FaUserMd className="mr-3 text-primary-600" />
                          <div>
                            <p className="font-medium text-gray-900">Dr. {booking.doctorName}</p>
                            <p className="text-sm">Doctor</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="mr-3 text-primary-600" />
                          <div>
                            <p className="font-medium text-gray-900">{booking.dispensaryName}</p>
                            <p className="text-sm">Dispensary</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="mr-3 text-primary-600" />
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(booking.appointmentDate)}</p>
                            <p className="text-sm">Appointment Date</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FaClock className="mr-3 text-primary-600" />
                          <div>
                            <p className="font-medium text-gray-900">{formatTime(booking.appointmentTime)}</p>
                            <p className="text-sm">Appointment Time</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {booking.status?.toLowerCase() === 'confirmed' && canCancelBooking(booking.appointmentDate) && (
                    <button
                      onClick={() => handleCancelClick(booking)}
                      disabled={cancellingBookingId === booking.bookingId}
                      className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {cancellingBookingId === booking.bookingId ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimes className="mr-2" />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Doctor:</strong> Dr. {selectedBooking.doctorName}</p>
                <p><strong>Dispensary:</strong> {selectedBooking.dispensaryName}</p>
                <p><strong>Date:</strong> {formatDate(selectedBooking.appointmentDate)}</p>
                <p><strong>Time:</strong> {formatTime(selectedBooking.appointmentTime)}</p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <FaCheckCircle className="text-blue-500 mt-0.5 mr-2" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Refund Policy:</p>
                    <p>You can cancel and get a full refund only before the appointment day. After cancellation, the refund will be processed automatically.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDialog}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={cancellingBookingId === selectedBooking.bookingId}
              >
                Keep Appointment
              </button>
              <button
                onClick={confirmCancelBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={cancellingBookingId === selectedBooking.bookingId}
              >
                {cancellingBookingId === selectedBooking.bookingId ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <FaTimes className="mr-2" />
                    Cancel & Refund
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
