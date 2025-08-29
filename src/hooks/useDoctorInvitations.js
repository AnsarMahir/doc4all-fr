import { useState, useEffect } from 'react'
import { useApi } from './useApi'
import { API_CONFIG, buildUrl } from '../config/api'

export const useDoctorInvitations = () => {
  const { get, post, loading, error } = useApi()
  const [doctors, setDoctors] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingInvitations, setLoadingInvitations] = useState(false)

  // Fetch available doctors
  const fetchDoctors = async () => {
    setLoadingDoctors(true)
    try {
      const data = await get(buildUrl(API_CONFIG.ENDPOINTS.DOCTORS))
      setDoctors(data)
    } catch (err) {
      console.error('Failed to fetch doctors:', err)
    } finally {
      setLoadingDoctors(false)
    }
  }

  // Fetch sent invitations
  const fetchInvitations = async () => {
    setLoadingInvitations(true)
    try {
      const data = await get(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.INVITATIONS))
      setInvitations(data)
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
    } finally {
      setLoadingInvitations(false)
    }
  }

  // Send invitation
  const sendInvitation = async (invitationData) => {
    try {
      const response = await post(buildUrl(API_CONFIG.ENDPOINTS.DISPENSARY.INVITATIONS), invitationData)
      await fetchInvitations() // Refresh invitations list
      return response
    } catch (err) {
      console.error('Failed to send invitation:', err)
      throw err
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchDoctors()
    fetchInvitations()
  }, [])

  return {
    doctors,
    invitations,
    loadingDoctors,
    loadingInvitations,
    loading,
    error,
    sendInvitation,
    refreshDoctors: fetchDoctors,
    refreshInvitations: fetchInvitations
  }
}
