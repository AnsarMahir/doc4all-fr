import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import { API_CONFIG, buildUrl } from '../config/api'

export const useDoctorInvitationsReceived = () => {
  const { get, post, loading, error } = useApi()
  const [invitations, setInvitations] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  const [loadingSchedules, setLoadingSchedules] = useState(false)

  // Fetch received invitations
  const fetchInvitations = async () => {
    setLoadingInvitations(true)
    try {
      const data = await get(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.INVITATIONS))
      setInvitations(data || [])
      return data
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
      throw err
    } finally {
      setLoadingInvitations(false)
    }
  }

  // Fetch doctor schedules
  const fetchSchedules = async () => {
    setLoadingSchedules(true)
    try {
      const data = await get(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.SCHEDULES))
      setSchedules(data || [])
      return data
    } catch (err) {
      console.error('Failed to fetch schedules:', err)
      throw err
    } finally {
      setLoadingSchedules(false)
    }
  }

  // Respond to invitation
  const respondToInvitation = async (invitationId, response) => {
    try {
      const responseData = await post(buildUrl(API_CONFIG.ENDPOINTS.DOCTOR.RESPOND_INVITATION), {
        invitationId,
        response
      })
      await fetchInvitations() // Refresh invitations list
      await fetchSchedules() // Refresh schedules if accepted
      return responseData
    } catch (err) {
      console.error('Failed to respond to invitation:', err)
      throw err
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchInvitations()
    fetchSchedules()
  }, [])

  return {
    invitations,
    schedules,
    loadingInvitations,
    loadingSchedules,
    loading,
    error,
    respondToInvitation,
    refreshInvitations: fetchInvitations,
    refreshSchedules: fetchSchedules
  }
}
