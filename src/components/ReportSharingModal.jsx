// components/ReportSharingModal.jsx
import { useState, useEffect } from 'react'
import { FaTimes, FaUserMd, FaShare, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa'

const ReportSharingModal = ({ 
  isOpen, 
  onClose, 
  report, 
  onShare, 
  onRevoke, 
  loading,
  onFetchSharingOptions
}) => {
  const [sharingOptions, setSharingOptions] = useState({ alreadyShared: [], availableToShare: [] })
  const [loadingSharingOptions, setLoadingSharingOptions] = useState(false)
  const [error, setError] = useState(null)

  // Fetch sharing options when modal opens
  useEffect(() => {
    if (isOpen && report && onFetchSharingOptions) {
      fetchSharingOptions()
    }
  }, [isOpen, report])

  const fetchSharingOptions = async () => {
    try {
      setLoadingSharingOptions(true)
      setError(null)
      const options = await onFetchSharingOptions(report.id)
      setSharingOptions(options)
    } catch (err) {
      setError(err.message || 'Failed to load sharing options')
    } finally {
      setLoadingSharingOptions(false)
    }
  }

  const handleShare = async (doctorId) => {
    const success = await onShare(report.id, doctorId)
    if (success) {
      // Refresh sharing options to reflect the change
      await fetchSharingOptions()
    }
  }

  const handleRevoke = async (doctorId) => {
    const success = await onRevoke(report.id, doctorId)
    if (success) {
      // Refresh sharing options to reflect the change
      await fetchSharingOptions()
    }
  }

  const handleClose = () => {
    setSharingOptions({ alreadyShared: [], availableToShare: [] })
    setError(null)
    onClose()
  }

  if (!isOpen || !report) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Manage Report Sharing
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Report Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-900 truncate">
            {report.originalFileName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Uploaded: {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Loading State */}
        {loadingSharingOptions && (
          <div className="mt-4 flex items-center justify-center py-8">
            <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-3 text-gray-600">Loading sharing options...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchSharingOptions}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Sharing Options */}
        {!loadingSharingOptions && !error && (
          <>
            {/* Available to Share */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Available to Share ({sharingOptions.availableToShare.length})
              </h4>
              
              {sharingOptions.availableToShare.length === 0 ? (
                <div className="text-center py-4">
                  <FaUserMd className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No doctors available to share with
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sharingOptions.availableToShare.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {doctor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doctor.specialities || 'General Practice'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleShare(doctor.id)}
                        disabled={loading}
                        className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin h-3 w-3" />
                        ) : (
                          <>
                            <FaShare className="h-3 w-3 mr-1" />
                            Share
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Already Shared */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Already Shared ({sharingOptions.alreadyShared.length})
              </h4>
              
              {sharingOptions.alreadyShared.length === 0 ? (
                <div className="text-center py-4">
                  <FaCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    Not shared with any doctors yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {sharingOptions.alreadyShared.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border border-green-200 bg-green-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Dr. {doctor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {doctor.specialities || 'General Practice'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevoke(doctor.id)}
                        disabled={loading}
                        className="ml-3 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin h-3 w-3" />
                        ) : (
                          <>
                            <FaTimes className="h-3 w-3 mr-1" />
                            Revoke
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportSharingModal
