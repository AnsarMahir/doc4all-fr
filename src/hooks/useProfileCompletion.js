// hooks/useProfileCompletion.js
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_CONFIG, buildUrl } from '../config/api'

export const useProfileCompletion = () => {
  const { user, apiCall, hasRole } = useAuth()
  const [profileStatus, setProfileStatus] = useState({
    isComplete: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    const checkProfileStatus = async () => {
      // Only check for dispensary users
      if (!hasRole('DISPENSARY')) {
        setProfileStatus({
          isComplete: true, // Non-dispensary users don't need profile completion
          loading: false,
          error: null
        })
        return
      }

      try {
        const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.CHECK_PROFILE_STATUS), {
          method: 'POST',
          body: JSON.stringify({ email: user?.email })
        })
        
        if (!response.ok) {
          throw new Error('Failed to check profile status')
        }
        
        const data = await response.json()
        
        setProfileStatus({
          isComplete: data.isComplete || false,
          loading: false,
          error: null
        })
        
      } catch (error) {
        console.error('Profile status check error:', error)
        setProfileStatus({
          isComplete: false,
          loading: false,
          error: error.message
        })
      }
    }

    if (user) {
      checkProfileStatus()
    }
  }, [user, apiCall, hasRole])

  const markProfileComplete = () => {
    setProfileStatus(prev => ({
      ...prev,
      isComplete: true
    }))
  }

  return {
    ...profileStatus,
    markProfileComplete
  }
}
