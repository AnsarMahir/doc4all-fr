import React, { useState, useEffect } from 'react';
import { FaUserMd, FaCalendarAlt, FaClock, FaUser, FaGraduationCap, FaStethoscope, FaChevronDown, FaChevronUp, FaSpinner, FaFilter } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { API_CONFIG, buildUrl } from '../../config/api';

const DispensaryBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedDoctors, setExpandedDoctors] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const { get } = useApi();
  const { error: showError } = useNotification();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    groupBookingsByDoctor();
  }, [bookings, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.BOOKINGS));
      setBookings(response || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupBookingsByDoctor = () => {
    const filtered = bookings.filter(booking => {
      const statusMatch = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter.toLowerCase();
      
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const today = new Date();
        const appointmentDate = new Date(booking.appointmentDate);
        
        switch (dateFilter) {
          case 'today':
            dateMatch = appointmentDate.toDateString() === today.toDateString();
            break;
          case 'upcoming':
            dateMatch = appointmentDate >= today;
            break;
          case 'past':
            dateMatch = appointmentDate < today;
            break;
          default:
            dateMatch = true;
        }
      }
      
      return statusMatch && dateMatch;
    });

    const grouped = filtered.reduce((acc, booking) => {
      const doctorId = booking.doctor?.id || 'unknown';
      
      if (!acc[doctorId]) {
        acc[doctorId] = {
          doctor: booking.doctor || { 
            id: doctorId, 
            name: booking.doctorName || 'Unknown Doctor',
            type: 'Unknown',
            experience: 'N/A',
            specialities: 'N/A',
            education: 'N/A'
          },
          bookings: []
        };
      }
      
      acc[doctorId].bookings.push(booking);
      return acc;
    }, {});

    // Sort bookings within each doctor group by appointment date and time
    Object.keys(grouped).forEach(doctorId => {
      grouped[doctorId].bookings.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateA - dateB;
      });
    });

    setGroupedBookings(grouped);
  };

  const toggleDoctorExpansion = (doctorId) => {
    const newExpanded = new Set(expandedDoctors);
    if (newExpanded.has(doctorId)) {
      newExpanded.delete(doctorId);
    } else {
      newExpanded.add(doctorId);
    }
    setExpandedDoctors(newExpanded);
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

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'ayurvedic':
        return '🌿';
      case 'homeopathy':
        return '☯️';
      case 'western':
        return '🏥';
      case 'unani':
        return '🕌';
      default:
        return '👨‍⚕️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
        <span className="ml-3 text-lg text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  const totalBookings = bookings.length;
  const doctorCount = Object.keys(groupedBookings).length;
  const filteredBookings = Object.values(groupedBookings).reduce((total, group) => total + group.bookings.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Bookings</h1>
          <p className="text-gray-600">
            Manage appointments across {doctorCount} doctors • {filteredBookings} bookings
            {statusFilter !== 'all' || dateFilter !== 'all' ? ` (filtered from ${totalBookings} total)` : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 mr-3">Filters:</span>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 mr-2">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 mr-2">Date:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {Object.keys(groupedBookings).length === 0 ? (
        <div className="text-center py-12">
          <FaUserMd className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-600">No bookings match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBookings).map(([doctorId, { doctor, bookings }]) => (
            <div key={doctorId} className="bg-white rounded-lg shadow border border-gray-200">
              {/* Doctor Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleDoctorExpansion(doctorId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getTypeIcon(doctor.type)}</div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {doctor.name}
                        </h3>
                        <span className="ml-3 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                          {doctor.type}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaGraduationCap className="mr-1" />
                          {doctor.education}
                        </div>
                        <div className="flex items-center">
                          <FaStethoscope className="mr-1" />
                          {doctor.specialities}
                        </div>
                        <div>
                          Experience: {doctor.experience}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{bookings.length}</div>
                      <div className="text-sm text-gray-500">
                        {bookings.length === 1 ? 'Booking' : 'Bookings'}
                      </div>
                    </div>
                    
                    {expandedDoctors.has(doctorId) ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              {expandedDoctors.has(doctorId) && (
                <div className="border-t border-gray-200">
                  {bookings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No bookings found for this doctor with current filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <div key={booking.bookingId} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="font-medium text-gray-900 mr-3">
                                  Booking #{booking.bookingId}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                  {booking.paymentStatus}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <FaUser className="mr-2 text-primary-600" />
                                  <div>
                                    <p className="font-medium text-gray-900">{booking.patientName}</p>
                                    <p>Patient</p>
                                  </div>
                                </div>
                                
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
                              
                              {booking.transactionId && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Transaction ID: {booking.transactionId}
                                  {booking.refundTransactionId && (
                                    <span className="ml-2">
                                      | Refund ID: {booking.refundTransactionId}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DispensaryBookings;
