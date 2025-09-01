import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'
import { useAuth } from '../contexts/AuthContext'
import { API_CONFIG } from '../config/api'

export const useDoctorSharedReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { get } = useApi()
  const { apiCall } = useAuth()

  const fetchSharedReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching shared reports for doctor...')
      console.log('API endpoint:', API_CONFIG.ENDPOINTS.DOCTOR.SHARED_REPORTS)
      console.log('Full URL will be:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCTOR.SHARED_REPORTS}`)
      
      const data = await get(API_CONFIG.ENDPOINTS.DOCTOR.SHARED_REPORTS)
      console.log('Shared reports response:', data)
      console.log('First report sample:', data?.[0])
      
      if (data && Array.isArray(data)) {
        setReports(data)
      } else if (data && data.data && Array.isArray(data.data)) {
        setReports(data.data)
      } else {
        console.warn('Unexpected response format:', data)
        setReports(data || [])
      }
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Error fetching shared reports:', err)
      
      // Show specific error message
      let errorMessage = 'Failed to fetch shared reports'
      
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
      
      setError(errorMessage)
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [get])

  const downloadReport = useCallback(async (reportId, fileName) => {
    try {
      console.log('Downloading report:', reportId)
      
      const downloadUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOCTOR.DOWNLOAD_REPORT(reportId)}`
      
      // Use the authenticated apiCall function to get the blob
      const response = await apiCall(downloadUrl, {
        method: 'GET'
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `report_${reportId}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (err) {
      console.error('Error downloading report:', err)
      throw new Error(err.message || 'Failed to download report')
    }
  }, [apiCall])

  const refreshReports = useCallback(() => {
    fetchSharedReports()
  }, [fetchSharedReports])

  useEffect(() => {
    fetchSharedReports()
  }, [fetchSharedReports])

  return {
    reports,
    loading,
    error,
    downloadReport,
    refreshReports
  }
}
