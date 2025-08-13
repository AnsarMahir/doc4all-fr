// Example usage of useApi hook in AdminApprovalPage
import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useRoleCheck } from '../hooks/useRoleGuard'

const ExampleApiUsage = () => {
  const { get, post, loading, error, clearError } = useApi()
  const { isAdmin } = useRoleCheck()
  const [pendingApprovals, setPendingApprovals] = useState([])

  useEffect(() => {
    if (isAdmin) {
      loadPendingApprovals()
    }
  }, [isAdmin])

  const loadPendingApprovals = async () => {
    try {
      clearError()
      const data = await get('http://localhost:8005/api/admin/pending-approvals')
      setPendingApprovals(data)
    } catch (err) {
      console.error('Failed to load approvals:', err)
    }
  }

  const approveUser = async (userId) => {
    try {
      clearError()
      await post(`http://localhost:8005/api/admin/approve/${userId}`, { approved: true })
      // Refresh the list
      loadPendingApprovals()
    } catch (err) {
      console.error('Failed to approve user:', err)
    }
  }

  const rejectUser = async (userId, reason) => {
    try {
      clearError()
      await post(`http://localhost:8005/api/admin/reject/${userId}`, { reason })
      // Refresh the list
      loadPendingApprovals()
    } catch (err) {
      console.error('Failed to reject user:', err)
    }
  }

  if (!isAdmin) {
    return <div>Access denied. Admin role required.</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {pendingApprovals.map((approval) => (
          <div key={approval.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{approval.name}</h3>
                <p className="text-gray-600">{approval.email}</p>
                <p className="text-sm text-gray-500">Role: {approval.role}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => approveUser(approval.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectUser(approval.id, 'Application rejected')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pendingApprovals.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No pending approvals
        </div>
      )}
    </div>
  )
}

export default ExampleApiUsage
