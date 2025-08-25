// hooks/useDispensary.js
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { API_CONFIG, buildUrl } from '../config/api'

export const useDispensary = () => {
  const { apiCall, user } = useAuth()
  const notifications = useNotifications()
  const [loading, setLoading] = useState(false)

  const completeProfile = async (profileData) => {
    setLoading(true)
    try {
      const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.COMPLETE_PROFILE), {
        method: 'POST',
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to complete profile')
      }

      const result = await response.json()
      notifications.success('Profile completed successfully!')
      return result
    } catch (error) {
      notifications.error(error.message || 'Failed to complete profile')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getProfile = async () => {
    try {
      const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.PROFILE))
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      
      return await response.json()
    } catch (error) {
      notifications.error(error.message || 'Failed to fetch profile')
      throw error
    }
  }

  const updateProfile = async (profileData) => {
    setLoading(true)
    try {
      const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.PROFILE), {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to update profile')
      }

      const result = await response.json()
      notifications.success('Profile updated successfully!')
      return result
    } catch (error) {
      notifications.error(error.message || 'Failed to update profile')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const checkProfileStatus = async () => {
    try {
      const response = await apiCall(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.CHECK_PROFILE_STATUS), {
        method: 'POST',
        body: JSON.stringify({ email: user?.email })
      })
      
      if (!response.ok) {
        throw new Error('Failed to check profile status')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Profile status check error:', error)
      throw error
    }
  }

  return {
    completeProfile,
    getProfile,
    updateProfile,
    checkProfileStatus,
    loading
  }
}
