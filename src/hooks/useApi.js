import { useAuth } from '../contexts/AuthContext.jsx'
import { useState } from 'react'

export const useApi = () => {
  const { apiCall } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = async (url, options = {}) => {
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
  }

  const get = (url) => request(url)
  const post = (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) })
  const put = (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) })
  const patch = (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) })
  const del = (url) => request(url, { method: 'DELETE' })

  const clearError = () => setError(null)

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
