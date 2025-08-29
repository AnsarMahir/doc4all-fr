// hooks/useProfileCompletion.js

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { API_CONFIG, buildUrl } from '../config/api'


export const useProfileCompletion = () => {
  const { user, apiCall, hasRole, profileCompleted, setProfileCompletion } = useAuth()
  const [profileStatus, setProfileStatus] = useState({
    isComplete: profileCompleted === null ? false : profileCompleted,
    loading: profileCompleted === null,
    error: null
  })

  useEffect(() => {
    // Only check for dispensary and doctor users and if profileCompleted is null (unknown)
    if (!user) return;
    if (!hasRole('DISPENSARY') && !hasRole('DOCTOR')) {
      setProfileStatus({
        isComplete: true,
        loading: false,
        error: null
      })
      return
    }
    if (profileCompleted !== null) {
      setProfileStatus({
        isComplete: profileCompleted,
        loading: false,
        error: null
      })
      return
    }
    // Only call API if unknown
    const checkProfileStatus = async () => {
      try {
        let endpoint, body = {}
        
        if (hasRole('DISPENSARY')) {
          endpoint = buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.CHECK_PROFILE_STATUS)
          body = { email: user?.email }
        } else if (hasRole('DOCTOR')) {
          endpoint = buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.PROFILE_STATUS)
          // For doctor, no email needed according to requirements
        }
        
        const response = await apiCall(endpoint, {
          method: 'POST',
          body: JSON.stringify(body)
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
        setProfileCompletion(data.isComplete || false)
      } catch (error) {
        console.error('Profile status check error:', error)
        setProfileStatus({
          isComplete: false,
          loading: false,
          error: error.message
        })
        setProfileCompletion(false)
      }
    }
    checkProfileStatus()
  }, [user, apiCall, hasRole, profileCompleted, setProfileCompletion])

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
