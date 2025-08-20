// contexts/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'
import { useNotifications } from './NotificationContext.jsx'

// Auth reducer to manage state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
}

// Create contexts
const AuthContext = createContext()

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  
  // Use notifications - but only if available (to avoid circular dependency)
  let notifications = null
  try {
    notifications = useNotifications()
  } catch (error) {
    // NotificationContext not available, that's okay during initial setup
  }

  // Check for existing session on app load
  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      // Check localStorage for persisted token and user data
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('auth_user')
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              token, 
              user 
            } 
          })
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError)
          // Clear corrupted data
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('http://localhost:8005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Login failed')
      }

      const data = await response.json()
      
      // Structure the user data according to your LoginResponse
      const userData = {
        token: data.token,
        user: {
          id: data.id,
          email: data.email,
          role: data.role
        }
      }

      // Store token and user data persistently
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(userData.user))

      dispatch({ type: 'LOGIN_SUCCESS', payload: userData })
      
      // Show success notification
      if (notifications) {
        notifications.success('Welcome back! You have been logged in successfully.')
      }
      
      return userData
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message })
      
      // Show error notification
      if (notifications) {
        notifications.error(error.message || 'Login failed. Please try again.')
      }
      
      throw error
    }
  }

  const logout = async () => {
    try {
      // Optional: Call logout endpoint with current token
      if (state.token) {
        await fetch('http://localhost:8005/api/auth/logout', { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${state.token}` }
        })
      }
      
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      dispatch({ type: 'LOGOUT' })
      
      // Show logout notification
      if (notifications) {
        notifications.info('You have been logged out successfully.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      dispatch({ type: 'LOGOUT' })
    }
  }

  // API service with automatic token injection
  const apiCall = async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    }

    // Add auth token if available
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }

    const response = await fetch(url, config)

    // Handle unauthorized responses
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      dispatch({ type: 'LOGOUT' })
      throw new Error('Session expired. Please login again.')
    }

    return response
  }

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Role-based permission checks
  const hasRole = (requiredRole) => {
    return state.user?.role === requiredRole
  }

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role)
  }

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    apiCall,
    hasRole,
    hasAnyRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hooks for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}