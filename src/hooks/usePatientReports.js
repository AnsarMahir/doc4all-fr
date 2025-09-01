// hooks/usePatientReports.js
import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import { useAuth } from '../contexts/AuthContext'
import { API_CONFIG } from '../config/api'
import { useNotification } from './useNotification'

export const usePatientReports = () => {
  const { get, loading, error } = useApi()
  const { apiCall } = useAuth()
  const [reports, setReports] = useState([])
  const [uploading, setUploading] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [completedDoctors, setCompletedDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  const fetchReports = async () => {
    try {
      console.log('Fetching patient reports...')
      const data = await get(API_CONFIG.ENDPOINTS.PATIENT.REPORTS)
      console.log('Reports data received:', data)
      setReports(data || [])
      setReportError(null) // Clear any previous errors
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      
      // Show specific error message
      let errorMessage = 'Failed to fetch reports'
      
      if (err.message) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running on localhost:8005.'
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your connection.'
        } else if (err.message.includes('Session expired')) {
          errorMessage = 'Session expired. Please login again.'
        } else {
          errorMessage = err.message
        }
      }
      
      setReportError(errorMessage)
    }
  }

  const uploadReport = async (file) => {
    if (!file) {
      setReportError('Please select a file to upload')
      return false
    }

    // Clear previous messages
    setReportError(null)
    setSuccessMessage(null)

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setReportError('File size must be less than 10MB')
      return false
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      setReportError('Please upload only PDF, DOC, DOCX, or image files')
      return false
    }

    setUploading(true)
    try {
      console.log('Uploading report file:', file.name)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Use apiCall from AuthContext for file upload
      const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PATIENT.UPLOAD_REPORT}`
      
      const response = await apiCall(fullUrl, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for FormData
          // Authorization will be added by apiCall
        }
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        
        try {
          // Try to get error message from response
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || `Upload failed with status ${response.status}`
        } catch (parseError) {
          // If we can't parse the error, use status
          errorMessage = `Upload failed with status ${response.status}: ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Upload successful:', result)
      
      setSuccessMessage('Report uploaded successfully!')
      
      // Refresh reports list
      await fetchReports()
      
      return true
    } catch (err) {
      console.error('Upload failed:', err)
      
      // Show specific error message
      let errorMessage = 'Failed to upload report. Please try again.'
      
      if (err.message) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.'
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your connection.'
        } else if (err.message.includes('Session expired')) {
          errorMessage = 'Session expired. Please login again.'
        } else {
          errorMessage = err.message
        }
      }
      
      setReportError(errorMessage)
      return false
    } finally {
      setUploading(false)
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

  // Fetch sharing options for a specific report
  const fetchSharingOptions = async (reportId) => {
    try {
      console.log('Fetching sharing options for report:', reportId)
      
      const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PATIENT.SHARING_OPTIONS(reportId)}`
      const response = await apiCall(fullUrl, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sharing options')
      }

      const data = await response.json()
      console.log('Sharing options received:', data)
      
      return {
        alreadyShared: data.alreadyShared || [],
        availableToShare: data.availableToShare || []
      }
      
    } catch (err) {
      console.error('Failed to fetch sharing options:', err)
      throw new Error(err.message || 'Failed to fetch sharing options')
    }
  }

  // Share report with a single doctor
  const shareReport = async (reportId, doctorId) => {
    if (!reportId || !doctorId) {
      setReportError('Invalid report or doctor selection')
      return false
    }

    try {
      console.log('Sharing report:', reportId, 'with doctor:', doctorId)
      
      const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PATIENT.SHARE_REPORT(reportId)}`
      const response = await apiCall(fullUrl, {
        method: 'POST',
        body: JSON.stringify({ doctorId }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        let errorMessage = 'Failed to share report'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || `Share failed with status ${response.status}`
        } catch (parseError) {
          errorMessage = `Share failed with status ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      setSuccessMessage('Report shared successfully!')
      await fetchReports() // Refresh reports to update sharing status
      return true
      
    } catch (err) {
      console.error('Failed to share report:', err)
      setReportError(err.message || 'Failed to share report')
      return false
    }
  }

  // Revoke report access from a single doctor
  const revokeReport = async (reportId, doctorId) => {
    if (!reportId || !doctorId) {
      setReportError('Invalid report or doctor selection')
      return false
    }

    try {
      console.log('Revoking report:', reportId, 'from doctor:', doctorId)
      
      const fullUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PATIENT.REVOKE_REPORT(reportId)}`
      const response = await apiCall(fullUrl, {
        method: 'POST',
        body: JSON.stringify({ doctorId }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        let errorMessage = 'Failed to revoke report access'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || `Revoke failed with status ${response.status}`
        } catch (parseError) {
          errorMessage = `Revoke failed with status ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      setSuccessMessage('Report access revoked successfully!')
      await fetchReports() // Refresh reports to update sharing status
      return true
      
    } catch (err) {
      console.error('Failed to revoke report access:', err)
      setReportError(err.message || 'Failed to revoke report access')
      return false
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return {
    reports,
    loading,
    error,
    uploading,
    reportError,
    successMessage,
    loadingDoctors,
    uploadReport,
    fetchReports,
    fetchSharingOptions,
    shareReport,
    revokeReport,
    formatFileSize,
    formatDate,
    clearMessages: () => {
      setReportError(null)
      setSuccessMessage(null)
    }
  }
}
