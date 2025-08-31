import React, { useState, useEffect } from 'react';
import { FaHospital, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaUser, FaCalendarAlt, FaClock, FaChevronDown, FaChevronUp, FaSpinner, FaFilter, FaEye, FaLeaf, FaYinYang, FaMosque } from 'react-icons/fa';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { API_CONFIG, buildUrl } from '../../config/api';

const DoctorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedDispensaries, setExpandedDispensaries] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDispensary, setSelectedDispensary] = useState(null);
  const [showDispensaryModal, setShowDispensaryModal] = useState(false);
  
  const { get } = useApi();
  const { error: showError } = useNotification();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    groupBookingsByDispensary();
  }, [bookings, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await get(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.BOOKINGS));
      setBookings(response || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      showError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupBookingsByDispensary = () => {
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
      const dispensaryId = booking.dispensary?.id || 'unknown';
      
      if (!acc[dispensaryId]) {
        acc[dispensaryId] = {
          dispensary: booking.dispensary || { 
            id: dispensaryId, 
            name: booking.dispensaryName || 'Unknown Dispensary',
            type: 'Unknown',
            address: 'N/A',
            contactNumber: 'N/A',
            email: 'N/A'
          },
          bookings: [],
          patients: new Set()
        };
      }
      
      acc[dispensaryId].bookings.push(booking);
      acc[dispensaryId].patients.add(booking.patientName);
      return acc;
    }, {});

    // Sort bookings within each dispensary by appointment date and time
    Object.keys(grouped).forEach(dispensaryId => {
      grouped[dispensaryId].bookings.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateA - dateB;
      });
    });

    setGroupedBookings(grouped);
  };

  const toggleDispensaryExpansion = (dispensaryId) => {
    const newExpanded = new Set(expandedDispensaries);
    if (newExpanded.has(dispensaryId)) {
      newExpanded.delete(dispensaryId);
    } else {
      newExpanded.add(dispensaryId);
    }
    setExpandedDispensaries(newExpanded);
  };

  const showDispensaryDetails = (dispensary) => {
    setSelectedDispensary(dispensary);
    setShowDispensaryModal(true);
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

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'ayurvedic':
        return <FaLeaf className="text-green-600" />;
      case 'homeopathy':
        return <FaYinYang className="text-blue-600" />;
      case 'western':
        return <FaHospital className="text-red-600" />;
      case 'unani':
        return <FaMosque className="text-purple-600" />;
      default:
        return <FaHospital className="text-gray-600" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary-600" />
        <span className="ml-3 text-lg text-gray-600">Loading your appointments...</span>
      </div>
    );
  }

  const totalBookings = bookings.length;
  const dispensaryCount = Object.keys(groupedBookings).length;
  const filteredBookings = Object.values(groupedBookings).reduce((total, group) => total + group.bookings.length, 0);
  const uniquePatients = new Set(bookings.map(b => b.patientName)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Practice Overview</h1>
          <p className="text-gray-600">
            {dispensaryCount} dispensaries • {uniquePatients} patients • {filteredBookings} appointments
            {statusFilter !== 'all' || dateFilter !== 'all' ? ` (filtered from ${totalBookings} total)` : ''}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaHospital className="text-3xl opacity-80" />
            <div className="ml-4">
              <p className="text-blue-100">Dispensaries</p>
              <p className="text-2xl font-bold">{dispensaryCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaUser className="text-3xl opacity-80" />
            <div className="ml-4">
              <p className="text-green-100">Unique Patients</p>
              <p className="text-2xl font-bold">{uniquePatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaCalendarAlt className="text-3xl opacity-80" />
            <div className="ml-4">
              <p className="text-purple-100">Total Appointments</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <FaClock className="text-3xl opacity-80" />
            <div className="ml-4">
              <p className="text-orange-100">Upcoming</p>
              <p className="text-2xl font-bold">
                {bookings.filter(b => new Date(b.appointmentDate) >= new Date()).length}
              </p>
            </div>
          </div>
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
          <FaHospital className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">No appointments match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBookings).map(([dispensaryId, { dispensary, bookings, patients }]) => (
            <div key={dispensaryId} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* Dispensary Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
                      {getTypeIcon(dispensary.type)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-900">{dispensary.name}</h3>
                        <span className="ml-3 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                          {dispensary.type}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-1" />
                        {dispensary.address}
                        <button
                          onClick={() => showDispensaryDetails(dispensary)}
                          className="ml-3 text-primary-600 hover:text-primary-700 flex items-center"
                        >
                          <FaEye className="mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{patients.size}</div>
                      <div className="text-sm text-gray-500">Patients</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{bookings.length}</div>
                      <div className="text-sm text-gray-500">Appointments</div>
                    </div>
                    
                    <button
                      onClick={() => toggleDispensaryExpansion(dispensaryId)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {expandedDispensaries.has(dispensaryId) ? (
                        <FaChevronUp className="text-gray-600" />
                      ) : (
                        <FaChevronDown className="text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              {expandedDispensaries.has(dispensaryId) && (
                <div className="divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No appointments found for this dispensary with current filters.
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.bookingId} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3">
                              <span className="font-semibold text-gray-900 mr-3">
                                #{booking.bookingId}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                  <FaUser className="text-primary-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{booking.patientName}</p>
                                  <p className="text-sm text-gray-500">Patient</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <FaCalendarAlt className="text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{formatDate(booking.appointmentDate)}</p>
                                  <p className="text-sm text-gray-500">Date</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <FaClock className="text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{formatTime(booking.appointmentTime)}</p>
                                  <p className="text-sm text-gray-500">Time</p>
                                </div>
                              </div>
                            </div>
                            
                            {booking.transactionId && (
                              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
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
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dispensary Details Modal */}
      {showDispensaryModal && selectedDispensary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mr-4">
                  {getTypeIcon(selectedDispensary.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDispensary.name}</h3>
                  <p className="text-primary-600 font-medium">{selectedDispensary.type} Medicine</p>
                </div>
              </div>
              <button
                onClick={() => setShowDispensaryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">{selectedDispensary.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaPhone className="text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Contact</p>
                    <p className="text-gray-600">{selectedDispensary.contactNumber}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{selectedDispensary.email}</p>
                  </div>
                </div>
                
                {selectedDispensary.website && (
                  <div className="flex items-center">
                    <FaGlobe className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={selectedDispensary.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {selectedDispensary.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {selectedDispensary.latitude && selectedDispensary.longitude && (
              <div className="mt-6">
                <p className="font-medium mb-2">Location</p>
                <p className="text-sm text-gray-600">
                  Coordinates: {selectedDispensary.latitude}, {selectedDispensary.longitude}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorBookings;
