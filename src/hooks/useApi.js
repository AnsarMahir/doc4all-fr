import { useAuth } from '../contexts/AuthContext.jsx'
import { useState, useCallback } from 'react'
import { API_CONFIG } from '../config/api'

export const useApi = () => {
  const { apiCall } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (url, options = {}) => {
    // Construct full URL if it's a relative path
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.BASE_URL}${url}`
    console.log('useApi.request called:', { url, fullUrl, options })
    setLoading(true)
    setError(null)
    
    try {
      console.log('Making API call via apiCall function...')
      const response = await apiCall(fullUrl, options)
      console.log('API response received:', response)
      
      if (!response.ok) {
        let errorMessage = 'Request failed'
        
        try {
          // First try to parse as JSON (most APIs return JSON errors)
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)
        } catch (jsonError) {
          // If JSON parsing fails, fall back to text
          try {
            errorMessage = await response.text() || 'Request failed'
          } catch (textError) {
            errorMessage = `Request failed with status ${response.status}`
          }
        }
        
        throw new Error(errorMessage)
      }
      
      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      
      // If there's no content or content-length is 0, return a success object
      if (contentLength === '0' || contentLength === 0) {
        return { success: true, message: 'Operation completed successfully' }
      }
      
      // If content-type indicates JSON and there's content, parse it
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await response.json()
          return data
        } catch (jsonError) {
          // If JSON parsing fails but request was successful, return success
          console.warn('Response was successful but could not parse JSON:', jsonError)
          return { success: true, message: 'Operation completed successfully' }
        }
      }
      
      // For non-JSON responses that are successful, return success
      return { success: true, message: 'Operation completed successfully' }
      
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const get = useCallback((url) => {
    console.log('useApi.get called with URL:', url)
    return request(url)
  }, [request])
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
