// pages/dashboard/PatientReports.jsx
import { useState, useRef } from 'react'
import { FaUpload, FaFileAlt, FaDownload, FaTrash, FaSpinner, FaCloudUploadAlt, FaExclamationCircle, FaCheckCircle, FaShare } from 'react-icons/fa'
import { usePatientReports } from '../../hooks/usePatientReports'
import ReportSharingModal from '../../components/ReportSharingModal'

const PatientReports = () => {
  const { 
    reports, 
    loading, 
    uploading, 
    reportError,
    successMessage,
    loadingDoctors,
    uploadReport, 
    fetchSharingOptions,
    shareReport,
    revokeReport,
    formatFileSize, 
    formatDate,
    clearMessages
  } = usePatientReports()
  
  const [dragActive, setDragActive] = useState(false)
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (files) => {
    if (files && files[0]) {
      clearMessages() // Clear any previous messages
      uploadReport(files[0])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleShareClick = (report) => {
    setSelectedReport(report)
    setShowSharingModal(true)
  }

  const handleSharingModalClose = () => {
    setShowSharingModal(false)
    setSelectedReport(null)
  }

  const getFileIcon = (contentType) => {
    if (contentType?.includes('pdf')) {
      return <FaFileAlt className="h-8 w-8 text-red-500" />
    } else if (contentType?.includes('image')) {
      return <FaFileAlt className="h-8 w-8 text-blue-500" />
    } else if (contentType?.includes('word') || contentType?.includes('document')) {
      return <FaFileAlt className="h-8 w-8 text-blue-600" />
    }
    return <FaFileAlt className="h-8 w-8 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sharing Modal */}
      <ReportSharingModal
        isOpen={showSharingModal}
        onClose={handleSharingModalClose}
        report={selectedReport}
        onFetchSharingOptions={fetchSharingOptions}
        onShare={shareReport}
        onRevoke={revokeReport}
        loading={uploading || loadingDoctors}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medical Reports</h1>
        <p className="text-gray-600 mt-2">Upload and manage your medical reports and documents</p>
      </div>

      {/* Error/Success Messages */}
      {reportError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <FaExclamationCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{reportError}</p>
            </div>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={clearMessages}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <FaCheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
            <button
              className="ml-auto text-green-400 hover:text-green-600"
              onClick={clearMessages}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Report</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center">
            <FaCloudUploadAlt className={`h-16 w-16 mb-4 ${dragActive ? 'text-primary-500' : 'text-gray-400'}`} />
            
            {uploading ? (
              <div className="flex items-center">
                <FaSpinner className="animate-spin h-5 w-5 text-primary-600 mr-2" />
                <span className="text-primary-600 font-medium">Uploading...</span>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your file here, or 
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 ml-1"
                    onClick={openFileDialog}
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Support for PDF, DOC, DOCX, JPG, PNG files up to 10MB
                </p>
                <button
                  type="button"
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  onClick={openFileDialog}
                  disabled={uploading}
                >
                  <FaUpload className="h-4 w-4 mr-2 inline" />
                  Choose File
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Reports</h2>
        </div>
        
        <div className="p-6">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FaFileAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports uploaded yet</h3>
              <p className="text-gray-500">Upload your first medical report to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      {getFileIcon(report.contentType)}
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={report.originalFileName}>
                          {report.originalFileName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatFileSize(report.sizeBytes)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => {
                          // TODO: Implement download functionality
                          console.log('Download report:', report.id)
                        }}
                      >
                        <FaDownload className="h-3 w-3 mr-1" />
                        Download
                      </button>
                      
                      <button
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => handleShareClick(report)}
                        disabled={loadingDoctors}
                      >
                        <FaShare className="h-3 w-3 mr-1" />
                        Share
                      </button>
                    </div>
                    
                    <button
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => {
                        // TODO: Implement delete functionality
                        console.log('Delete report:', report.id)
                      }}
                    >
                      <FaTrash className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientReports
