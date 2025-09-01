// components/ReportSharingModal.jsx
import { useState } from 'react'
import { FaTimes, FaUserMd, FaShare, FaSpinner, FaCheck } from 'react-icons/fa'

const ReportSharingModal = ({ 
  isOpen, 
  onClose, 
  report, 
  doctors, 
  onShare, 
  onRevoke, 
  loading 
}) => {
  const [selectedDoctors, setSelectedDoctors] = useState([])
  const [operation, setOperation] = useState('share') // 'share' or 'revoke'

  const handleDoctorToggle = (doctorId) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    )
  }

  const handleSubmit = async () => {
    if (selectedDoctors.length === 0) {
      return
    }

    const success = operation === 'share' 
      ? await onShare(report.id, selectedDoctors)
      : await onRevoke(report.id, selectedDoctors)

    if (success) {
      setSelectedDoctors([])
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedDoctors([])
    setOperation('share')
    onClose()
  }

  if (!isOpen || !report) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Share Report
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

        {/* Operation Toggle */}
        <div className="mt-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setOperation('share')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                operation === 'share'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Share Access
            </button>
            <button
              onClick={() => setOperation('revoke')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                operation === 'revoke'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Revoke Access
            </button>
          </div>
        </div>

        {/* Doctor Selection */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Select Doctors to {operation === 'share' ? 'Share With' : 'Revoke From'}:
          </h4>
          
          {doctors.length === 0 ? (
            <div className="text-center py-8">
              <FaUserMd className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No completed appointments found. You can only share with doctors you've had appointments with.
              </p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {doctors.map((doctor) => (
                <label key={doctor.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDoctors.includes(doctor.id)}
                    onChange={() => handleDoctorToggle(doctor.id)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Dr. {doctor.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doctor.specialities || 'General Practice'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedDoctors.length === 0 || loading}
            className={`flex-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              operation === 'share'
                ? 'text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300'
                : 'text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {operation === 'share' ? <FaShare className="h-4 w-4 mr-2" /> : <FaTimes className="h-4 w-4 mr-2" />}
                {operation === 'share' ? 'Share' : 'Revoke'} ({selectedDoctors.length})
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportSharingModal
