import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaUserMd, FaHospital, FaCalendarAlt, FaClock, FaSpinner, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { API_CONFIG, buildUrl } from '../../config/api';

const PatientReviews = () => {
  const [completedBookings, setCompletedBookings] = useState([]);
  const [reviewableStatus, setReviewableStatus] = useState({}); // Store reviewable status for each booking
  const [loading, setLoading] = useState(true);
  const [submittingReviews, setSubmittingReviews] = useState(new Set());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewType, setReviewType] = useState(''); // 'doctor' or 'dispensary'
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [dispensaryRatings, setDispensaryRatings] = useState({
    cleanliness: 0,
    staffSupport: 0,
    accessibility: 0
  });
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  
  const { get, post } = useApi();
  const { error: showError, success: showSuccess } = useNotification();

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      setLoading(true);
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.BOOKINGS));
      
      // Filter only completed and paid bookings
      const completedPaidBookings = (response || []).filter(
        booking => booking.status === 'COMPLETED' && booking.paymentStatus === 'PAID'
      );
      
      setCompletedBookings(completedPaidBookings);
      
      // Fetch reviewable status for each completed booking
      await fetchReviewableStatus(completedPaidBookings);
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showError('Failed to load completed appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewableStatus = async (bookings) => {
    const statusPromises = bookings.map(async (booking) => {
      try {
        const response = await get(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.CHECK_REVIEWABLE(booking.bookingId)));
        return {
          bookingId: booking.bookingId,
          doctorReviewable: response.Doctorreviewable || false,
          dispensaryReviewable: response.Dispensaryreviewable || false
        };
      } catch (err) {
        console.error(`Error fetching reviewable status for booking ${booking.bookingId}:`, err);
        return {
          bookingId: booking.bookingId,
          doctorReviewable: false,
          dispensaryReviewable: false
        };
      }
    });

    const statusResults = await Promise.all(statusPromises);
    
    // Convert array to object for easy lookup
    const statusMap = {};
    statusResults.forEach(result => {
      statusMap[result.bookingId] = {
        doctorReviewable: result.doctorReviewable,
        dispensaryReviewable: result.dispensaryReviewable
      };
    });
    
    setReviewableStatus(statusMap);
  };

  const isReviewable = (bookingId, type) => {
    const status = reviewableStatus[bookingId];
    if (!status) return false;
    
    return type === 'doctor' ? status.doctorReviewable : status.dispensaryReviewable;
  };

  const openReviewModal = (booking, type) => {
    setSelectedBooking(booking);
    setReviewType(type);
    setShowReviewModal(true);
    setRating(0);
    setDispensaryRatings({
      cleanliness: 0,
      staffSupport: 0,
      accessibility: 0
    });
    setComment('');
    setAnonymous(false);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    setReviewType('');
    setRating(0);
    setDispensaryRatings({
      cleanliness: 0,
      staffSupport: 0,
      accessibility: 0
    });
    setComment('');
    setAnonymous(false);
  };

  const submitReview = async () => {
    if (!selectedBooking || !reviewType) return;

    // Validation for doctor reviews
    if (reviewType === 'doctor') {
      if (rating === 0) {
        showError('Please select a rating before submitting.');
        return;
      }
    }

    // Validation for dispensary reviews
    if (reviewType === 'dispensary') {
      if (dispensaryRatings.cleanliness === 0 || dispensaryRatings.staffSupport === 0 || dispensaryRatings.accessibility === 0) {
        showError('Please rate all categories before submitting.');
        return;
      }
    }

    if (comment.trim().length < 10) {
      showError('Please provide a comment with at least 10 characters.');
      return;
    }

    try {
      const reviewKey = `${selectedBooking.bookingId}-${reviewType}`;
      setSubmittingReviews(prev => new Set([...prev, reviewKey]));

      if (reviewType === 'doctor') {
        const reviewData = {
          bookingId: selectedBooking.bookingId,
          rating: rating,
          comment: comment.trim(),
          anonymous: anonymous
        };
        await post(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.DOCTOR_REVIEW), reviewData);
        showSuccess('Doctor review submitted successfully!');
      } else if (reviewType === 'dispensary') {
        const reviewData = {
          bookingId: selectedBooking.bookingId,
          cleanliness: dispensaryRatings.cleanliness,
          staffSupport: dispensaryRatings.staffSupport,
          accessibility: dispensaryRatings.accessibility,
          comment: comment.trim(),
          anonymous: anonymous
        };
        await post(buildUrl(API_CONFIG.ENDPOINTS.PATIENT.DISPENSARY_REVIEW), reviewData);
        showSuccess('Dispensary review submitted successfully!');
      }

      closeReviewModal();
      
      // Refresh reviewable status after successful submission
      await fetchReviewableStatus([selectedBooking]);

    } catch (err) {
      console.error('Error submitting review:', err);
      showError('Failed to submit review. Please try again.');
    } finally {
      const reviewKey = `${selectedBooking.bookingId}-${reviewType}`;
      setSubmittingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewKey);
        return newSet;
      });
    }
  };

  const renderStarRating = (currentRating, onStarClick = null, size = 'text-xl') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onStarClick && onStarClick(i)}
          className={`${size} ${onStarClick ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            i <= currentRating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          disabled={!onStarClick}
        >
          <FaStar />
        </button>
      );
    }
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
        <span className="ml-3 text-lg text-gray-600">Loading completed appointments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-600">
            Share your experience with doctors and dispensaries from your completed appointments
          </p>
        </div>
      </div>

      {completedBookings.length === 0 ? (
        <div className="text-center py-12">
          <FaCheck className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Completed Appointments</h3>
          <p className="text-gray-600">You haven't completed any paid appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedBookings.map((booking) => (
            <div key={booking.bookingId} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900 mr-3">
                      Appointment #{booking.bookingId}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {booking.status}
                    </span>
                    <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {booking.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(booking.appointmentDate)}</p>
                        <p>Appointment Date</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{formatTime(booking.appointmentTime)}</p>
                        <p>Appointment Time</p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor and Dispensary Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Doctor Section */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FaUserMd className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Dr. {booking.doctor.name}</h4>
                            <p className="text-sm text-gray-600">{booking.doctor.type}</p>
                            <p className="text-xs text-gray-500">{booking.doctor.specialities}</p>
                          </div>
                        </div>
                        {isReviewable(booking.bookingId, 'doctor') ? (
                          <button
                            onClick={() => openReviewModal(booking, 'doctor')}
                            disabled={submittingReviews.has(`${booking.bookingId}-doctor`)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            {submittingReviews.has(`${booking.bookingId}-doctor`) ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              'Review Doctor'
                            )}
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-md">
                            Already Reviewed
                          </span>
                        )}
                      </div>

                      {/* Dispensary Section */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FaHospital className="text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.dispensary.name}</h4>
                            <p className="text-sm text-gray-600">{booking.dispensary.address}</p>
                            <p className="text-xs text-gray-500">{booking.dispensary.contactNumber}</p>
                          </div>
                        </div>
                        {isReviewable(booking.bookingId, 'dispensary') ? (
                          <button
                            onClick={() => openReviewModal(booking, 'dispensary')}
                            disabled={submittingReviews.has(`${booking.bookingId}-dispensary`)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            {submittingReviews.has(`${booking.bookingId}-dispensary`) ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              'Review Dispensary'
                            )}
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-md">
                            Already Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review {reviewType === 'doctor' ? 'Doctor' : 'Dispensary'}
                </h3>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Review Target Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${reviewType === 'doctor' ? 'bg-blue-100' : 'bg-green-100'} rounded-lg`}>
                    {reviewType === 'doctor' ? (
                      <FaUserMd className={`${reviewType === 'doctor' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <FaHospital className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {reviewType === 'doctor' 
                        ? `Dr. ${selectedBooking.doctor.name}`
                        : selectedBooking.dispensary.name
                      }
                    </h4>
                    <p className="text-sm text-gray-600">
                      Appointment on {formatDate(selectedBooking.appointmentDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                {reviewType === 'doctor' ? (
                  // Doctor rating - single overall rating
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Rating *
                    </label>
                    {renderStarRating(rating, setRating, 'text-2xl')}
                    <p className="text-xs text-gray-500 mt-1">Click to rate from 1 to 5 stars</p>
                  </>
                ) : (
                  // Dispensary rating - multiple categories
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Rate Each Category *
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Cleanliness</label>
                        {renderStarRating(
                          dispensaryRatings.cleanliness, 
                          (rating) => setDispensaryRatings(prev => ({...prev, cleanliness: rating})), 
                          'text-lg'
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Staff Support</label>
                        {renderStarRating(
                          dispensaryRatings.staffSupport, 
                          (rating) => setDispensaryRatings(prev => ({...prev, staffSupport: rating})), 
                          'text-lg'
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Accessibility</label>
                        {renderStarRating(
                          dispensaryRatings.accessibility, 
                          (rating) => setDispensaryRatings(prev => ({...prev, accessibility: rating})), 
                          'text-lg'
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Please rate all categories from 1 to 5 stars</p>
                  </>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Share your experience with this ${reviewType}...`}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  minLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
              </div>

              {/* Anonymous Option */}
              <div className="mb-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Submit anonymously</span>
                  {anonymous ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {anonymous 
                    ? 'Your name will not be displayed with this review'
                    : 'Your name will be displayed with this review'
                  }
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={closeReviewModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={
                    (reviewType === 'doctor' && (rating === 0 || comment.trim().length < 10)) ||
                    (reviewType === 'dispensary' && (
                      dispensaryRatings.cleanliness === 0 || 
                      dispensaryRatings.staffSupport === 0 || 
                      dispensaryRatings.accessibility === 0 || 
                      comment.trim().length < 10
                    )) ||
                    submittingReviews.has(`${selectedBooking.bookingId}-${reviewType}`)
                  }
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center"
                >
                  {submittingReviews.has(`${selectedBooking.bookingId}-${reviewType}`) ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReviews;
