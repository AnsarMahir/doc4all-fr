import { useAuth } from '../../contexts/AuthContext.jsx'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, requiredRole, requiredRoles, fallback }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location, showAuth: true }} replace />
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    return fallback || <Navigate to="/unauthorized" replace />
  }

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return fallback || <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
