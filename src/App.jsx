// App.js - Enhanced with Auth Provider and Protected Routes
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import FindDispensariesPage from './pages/FindDispensariesPage'
import BrowseDispensariesPage from './pages/BrowseDispensariesPage'
import SearchDispensariesPage from './pages/SearchDispensariesPage'
import DispensaryDetailsPage from './pages/DispensaryDetailsPage'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal/AuthModal'
import AdminApprovalPage from './pages/AdminApprovalPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const openAuthModal = () => {
    setShowAuthModal(true)
  }

  const closeAuthModal = () => {
    setShowAuthModal(false)
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header openAuthModal={openAuthModal} />
          
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage openAuthModal={openAuthModal} />} />
              <Route path="/find-dispensaries" element={<FindDispensariesPage />} />
              <Route path="/browse-dispensaries" element={<BrowseDispensariesPage />} />
              <Route path="/search-dispensaries" element={<SearchDispensariesPage />} />
              <Route path="/dispensary/:id" element={<DispensaryDetailsPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Admin only routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Routes>
                    <Route path="pending-approval" element={<AdminApprovalPage />} />
                    {/* Add more admin routes here */}
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Doctor routes */}
              <Route path="/doctor/*" element={
                <ProtectedRoute requiredRole="DOCTOR">
                  <Routes>
                    {/* Add doctor-specific routes here */}
                    <Route path="dashboard" element={<div>Doctor Dashboard</div>} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Patient routes */}
              <Route path="/patient/*" element={
                <ProtectedRoute requiredRole="PATIENT">
                  <Routes>
                    {/* Add patient-specific routes here */}
                    <Route path="dashboard" element={<div>Patient Dashboard</div>} />
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Multiple roles allowed */}
              <Route path="/prescriptions" element={
                <ProtectedRoute requiredRoles={["DOCTOR", "PATIENT"]}>
                  <div>Prescriptions Page</div>
                </ProtectedRoute>
              } />

              {/* Any authenticated user */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div>Profile Page</div>
                </ProtectedRoute>
              } />

              {/* Legacy route for backward compatibility */}
              <Route path="/pending-approval" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminApprovalPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          
          <Footer />
        </div>
        
        {/* Render AuthModal outside of main to avoid z-index issues */}
        {showAuthModal && (
          <AuthModal onClose={closeAuthModal} />
        )}
      </Router>
    </AuthProvider>
  )
}

export default App