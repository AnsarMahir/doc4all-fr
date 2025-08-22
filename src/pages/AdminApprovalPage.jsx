import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaUser, FaBuilding, FaFileAlt, FaDownload, FaCalendar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaIdBadge } from 'react-icons/fa';
import { useApi } from '../hooks/useApi';
import { useRoleGuard, useRoleCheck } from '../hooks/useRoleGuard';
import { useNotification, NotificationContainer } from '../hooks/useNotification.jsx';
import { API_CONFIG, buildUrl } from '../config/api';

const AdminApprovalPage = () => {
  // Authentication and API hooks
  const { get, post, loading: apiLoading, error: apiError, clearError } = useApi();
  const { isAdmin } = useRoleCheck();
  const isAdminValue = isAdmin();
  const { notifications, success, error: notifyError, removeNotification } = useNotification();
  
  // Component state
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [localError, setLocalError] = useState(null);

  // Role guard - redirect if not admin
  useRoleGuard('ADMIN');

  // API service functions using useApi hook
  // Helper to get admin id from localStorage
  const getAdminId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user'));
      return user?.id;
    } catch {
      return undefined;
    }
  };

  const adminAPI = {
    getPendingApprovals: async () => {
      try {
        clearError();
        setLocalError(null);
        const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.PENDING_APPROVALS);
        const data = await get(url);
        return data;
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
      }
    },

    approveUser: async (userId) => {
      try {
        clearError();
        setLocalError(null);
        const approvedBy = getAdminId();
        const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.APPROVE_USER(userId));
        // Use PUT instead of POST
        const data = await post(url, { approvedBy });
        return data;
      } catch (error) {
        console.error('Error approving user:', error);
        throw error;
      }
    },

    rejectUser: async (userId, reason) => {
      try {
        clearError();
        setLocalError(null);
        const rejectedBy = getAdminId();
        const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.REJECT_USER(userId));
        // Send rejectedBy and rejectionReason in body
        const data = await post(url, { rejectedBy, rejectionReason: reason });
        return data;
      } catch (error) {
        console.error('Error rejecting user:', error);
        throw error;
      }
    },

    getCertificate: (certificatePath) => {
      return buildUrl(API_CONFIG.ENDPOINTS.ADMIN.GET_CERTIFICATE(certificatePath));
    }
  };

  // Fetch pending approvals from API
  const fetchPendingApprovals = async () => {
    try {
      setLocalError(null);
      const data = await adminAPI.getPendingApprovals();
      setPendingApprovals(data);
    } catch (error) {
      setLocalError('Failed to fetch pending approvals. Please try again.');
      console.error('Error fetching pending approvals:', error);
    }
  };

  useEffect(() => {
    if (isAdminValue) {
      fetchPendingApprovals();
    }
  }, [isAdminValue]);

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveUser(id);
      setPendingApprovals(prev => prev.filter(approval => approval.id !== id));
      setLocalError(null);
      success('User approved successfully!');
    } catch (error) {
      setLocalError('Failed to approve user. Please try again.');
      notifyError('Failed to approve user. Please try again.');
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      setLocalError('Please provide a reason for rejection.');
      notifyError('Please provide a reason for rejection.');
      return;
    }
    
    try {
      await adminAPI.rejectUser(id, rejectionReason);
      setPendingApprovals(prev => prev.filter(approval => approval.id !== id));
      setIsRejecting(false);
      setRejectionReason('');
      setLocalError(null);
      success('User rejected successfully!');
    } catch (error) {
      setLocalError('Failed to reject user. Please try again.');
      notifyError('Failed to reject user. Please try again.');
      console.error('Error rejecting user:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredApprovals = pendingApprovals.filter(approval => 
    filterRole === 'ALL' || approval.role === filterRole
  );

  const getRoleIcon = (role) => {
    return role === 'DOCTOR' ? <FaUser className="text-blue-600" /> : <FaBuilding className="text-green-600" />;
  };

  const getRoleBadge = (role) => {
    return role === 'DOCTOR' 
      ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">Doctor</span>
      : <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">Dispensary</span>;
  };

  // Combine API loading with local error state
  const loading = apiLoading;
  const error = apiError || localError;

  // Early return if not admin (role guard will handle redirect)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={fetchPendingApprovals}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
          {(apiError || localError) && (
            <button
              onClick={() => {
                clearError();
                setLocalError(null);
              }}
              className="ml-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Error
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Review and approve pending registrations</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredApprovals.length} pending
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterRole('ALL')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterRole === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({pendingApprovals.length})
              </button>
              <button
                onClick={() => setFilterRole('DOCTOR')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterRole === 'DOCTOR'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Doctors ({pendingApprovals.filter(a => a.role === 'DOCTOR').length})
              </button>
              <button
                onClick={() => setFilterRole('DISPENSARY')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filterRole === 'DISPENSARY'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Dispensaries ({pendingApprovals.filter(a => a.role === 'DISPENSARY').length})
              </button>
            </div>
          </div>
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {filteredApprovals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No pending approvals found.</p>
            </div>
          ) : (
            filteredApprovals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getRoleIcon(approval.role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{approval.name}</h3>
                          {getRoleBadge(approval.role)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <FaEnvelope className="mr-2 text-sm" />
                            <span className="text-sm">{approval.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaCalendar className="mr-2 text-sm" />
                            <span className="text-sm">Applied: {formatDate(approval.createdAt)}</span>
                          </div>
                          {approval.licenseNumber && (
                            <div className="flex items-center text-gray-600">
                              <FaIdBadge className="mr-2 text-sm" />
                              <span className="text-sm">License: {approval.licenseNumber}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <FaFileAlt className="mr-1" />
                          <span>{approval.certificatePath ? 'Certificate submitted' : 'No certificate'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(approval)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <FaEye className="mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApproval(approval);
                          setIsModalOpen(true);
                          setIsRejecting(false);
                          setRejectionReason('');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                      >
                        <FaCheck className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApproval(approval);
                          setIsModalOpen(true);
                          setIsRejecting(true);
                          setRejectionReason('');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <FaTimes className="mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedApproval && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(selectedApproval.role)}
                  <h3 className="text-2xl font-bold text-gray-900">{selectedApproval.name}</h3>
                  {getRoleBadge(selectedApproval.role)}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">Contact Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Full Name:</strong> {selectedApproval.fullName}</p>
                    <p><strong>Email:</strong> {selectedApproval.email}</p>
                    <p><strong>Role:</strong> {selectedApproval.role}</p>
                    {selectedApproval.licenseNumber && (
                      <p><strong>License Number:</strong> {selectedApproval.licenseNumber}</p>
                    )}
                    <p><strong>Status:</strong> 
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {selectedApproval.status}
                      </span>
                    </p>
                    <p><strong>Applied:</strong> {formatDate(selectedApproval.createdAt)}</p>
                  </div>
                </div>

                {/* Certificate */}
                {selectedApproval.certificatePath && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-900">Submitted Certificate</h4>
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Professional Certificate</h5>
                        <p className="text-sm text-gray-600">File: {selectedApproval.certificatePath.split('/').pop()}</p>
                        <p className="text-sm text-gray-500">Uploaded: {formatDate(selectedApproval.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => window.open(adminAPI.getCertificate(selectedApproval.certificatePath), '_blank')}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <FaDownload className="mr-2" />
                        View Certificate
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t">
                  <button
                    onClick={() => {
                      handleApprove(selectedApproval.id);
                      setIsModalOpen(false);
                    }}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FaCheck className="mr-2" />
                    Approve Application
                  </button>
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTimes className="mr-2" />
                    Reject Application
                  </button>
                </div>

                {/* Rejection Reason Input */}
                {isRejecting && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection (Required)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                      placeholder="Please provide a detailed reason for rejecting this application..."
                    />
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => {
                          handleReject(selectedApproval.id);
                          setIsModalOpen(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => {
                          setIsRejecting(false);
                          setRejectionReason('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalPage;