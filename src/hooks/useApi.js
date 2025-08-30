import { useAuth } from '../contexts/AuthContext.jsx'
import { useState, useCallback } from 'react'

export const useApi = () => {
  const { apiCall } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiCall(url, options)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Request failed')
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const get = useCallback((url) => request(url), [request])
  const post = useCallback((url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }), [request])
  const put = useCallback((url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }), [request])
  const patch = useCallback((url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }), [request])
  const del = useCallback((url) => request(url, { method: 'DELETE' }), [request])

  const clearError = useCallback(() => setError(null), [])

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    loading,
    error,
    clearError
  }
}
