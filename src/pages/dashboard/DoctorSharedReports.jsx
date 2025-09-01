import React from 'react'
import { FaFileAlt, FaDownload, FaSpinner, FaExclamationTriangle, FaSyncAlt, FaCalendarAlt, FaUser, FaUserCircle } from 'react-icons/fa'
import { useDoctorSharedReports } from '../../hooks/useDoctorSharedReports'

const DoctorSharedReports = () => {
  const { reports, loading, error, downloadReport, refreshReports } = useDoctorSharedReports()
  const [downloadingId, setDownloadingId] = React.useState(null)

  // Debug logging
  React.useEffect(() => {
    console.log('DoctorSharedReports component mounted')
    console.log('Reports:', reports)
    console.log('Loading:', loading)
    console.log('Error:', error)
  }, [reports, loading, error])

  const handleDownload = async (report) => {
    try {
      setDownloadingId(report.id)
      await downloadReport(report.id, report.originalFileName)
    } catch (err) {
      alert('Failed to download report: ' + err.message)
    } finally {
      setDownloadingId(null)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (contentType) => {
    if (contentType?.includes('pdf')) return '📄'
    if (contentType?.includes('image')) return '🖼️'
    if (contentType?.includes('text')) return '📝'
    return '📁'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshReports}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaSyncAlt className="inline mr-2" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shared Medical Reports</h1>
          <p className="text-gray-600 mt-2">
            View and download medical reports that patients have shared with you
          </p>
        </div>
        <button
          onClick={refreshReports}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FaSyncAlt className={`inline mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && reports.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading shared reports...</p>
          </div>
        </div>
      )}

      {/* Reports Grid */}
      {!loading && reports.length === 0 ? (
        <div className="text-center py-12">
          <FaFileAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Shared Reports</h3>
          <p className="text-gray-600">
            No patients have shared their medical reports with you yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Report Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getFileIcon(report.contentType)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {report.originalFileName}
                    </h3>
                    {report.patientName && (
                      <div className="flex items-center text-sm text-blue-600 font-medium mt-1">
                        <FaUserCircle className="mr-1 text-blue-500" />
                        Patient: {report.patientName}
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(report.sizeBytes)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {report.contentType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Details */}
              <div className="p-4 space-y-3">
                {report.patientName && (
                  <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    <span className="font-medium">{report.patientName}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  <span>Shared: {formatDate(report.createdAt)}</span>
                </div>
                
                {report.sharedWithMe && (
                  <div className="flex items-center text-sm text-green-600">
                    <FaUser className="mr-2 text-green-500" />
                    <span>Shared with you</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => handleDownload(report)}
                  disabled={downloadingId === report.id}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === report.id ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FaDownload className="mr-2" />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
              <p className="text-sm text-gray-500">Total Reports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.sharedWithMe).length}
              </p>
              <p className="text-sm text-gray-500">Shared With You</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(reports.reduce((acc, r) => acc + r.sizeBytes, 0) / (1024 * 1024))} MB
              </p>
              <p className="text-sm text-gray-500">Total Size</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorSharedReports
