import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export const useRoleGuard = (requiredRole, redirectPath = '/unauthorized') => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user?.role !== requiredRole) {
      navigate(redirectPath, { replace: true })
    }
  }, [user, isAuthenticated, requiredRole, redirectPath, navigate])

  return user?.role === requiredRole
}

export const useRoleCheck = () => {
  const { user } = useAuth()

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  const isAdmin = () => hasRole('ADMIN')
  const isDoctor = () => hasRole('DOCTOR')
  const isPatient = () => hasRole('PATIENT')
  const isDispensary = () => hasRole('DISPENSARY')

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isDoctor,
    isPatient,
    isDispensary,
    userRole: user?.role
  }
}
