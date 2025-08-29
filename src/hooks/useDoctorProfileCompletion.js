// hooks/useDoctorProfileCompletion.js
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_CONFIG, buildUrl } from '../config/api'

export const useDoctorProfileCompletion = () => {
  const { user, apiCall, hasRole, profileCompleted, setProfileCompletion } = useAuth()
  const [profileStatus, setProfileStatus] = useState({
    isComplete: profileCompleted === null ? false : profileCompleted,
    loading: profileCompleted === null,
    error: null
  })

  const checkProfileStatus = async () => {
    if (!user || !hasRole('DOCTOR')) return
    
    try {
      setProfileStatus(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.PROFILE_STATUS), {
        method: 'POST'
        // No email needed for doctor endpoint
      })
      
      if (!response.ok) {
        throw new Error('Failed to check profile status')
      }
      
      const data = await response.json()
      const isComplete = data.isComplete || false
      
      setProfileStatus({
        isComplete,
        loading: false,
        error: null
      })
      
      setProfileCompletion(isComplete)
      
      return isComplete
    } catch (error) {
      console.error('Doctor profile status check error:', error)
      setProfileStatus({
        isComplete: false,
        loading: false,
        error: error.message
      })
      setProfileCompletion(false)
      return false
    }
  }

  useEffect(() => {
    // Only check for doctor users
    if (!user) return
    
    if (!hasRole('DOCTOR')) {
      setProfileStatus({
        isComplete: true,
        loading: false,
        error: null
      })
      return
    }
    
    // If we already know the status, don't check again
    if (profileCompleted !== null) {
      setProfileStatus({
        isComplete: profileCompleted,
        loading: false,
        error: null
      })
      return
    }
    
    // Check profile status
    checkProfileStatus()
  }, [user, hasRole, profileCompleted])

  const markProfileComplete = () => {
    setProfileStatus(prev => ({
      ...prev,
      isComplete: true
    }))
    setProfileCompletion(true)
  }

  return {
    ...profileStatus,
    markProfileComplete,
    recheckStatus: checkProfileStatus
  }
}
