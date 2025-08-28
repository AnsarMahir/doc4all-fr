// App.js - Enhanced with Auth Provider and Protected Routes
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
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
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import DispensaryProfilePage from './pages/dashboard/DispensaryProfilePage'

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const openAuthModal = () => {
    setShowAuthModal(true)
  }

  const closeAuthModal = () => {
    setShowAuthModal(false)
  }

  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">

            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <>
                    <Header openAuthModal={openAuthModal} />
                    <HomePage openAuthModal={openAuthModal} />
                    <Footer />
                  </>
                } />
                <Route path="/find-dispensaries" element={
                  <>
                    <Header openAuthModal={openAuthModal} />
                    <FindDispensariesPage />
                    <Footer />
                  </>
                } />
                <Route path="/browse-dispensaries" element={
                  <>
                    <Header openAuthModal={openAuthModal} />
                    <BrowseDispensariesPage />
                    <Footer />
                  </>
                } />
                <Route path="/search-dispensaries" element={
                  <>
                    <Header openAuthModal={openAuthModal} />
                    <SearchDispensariesPage />
                    <Footer />
                  </>
                } />
                <Route path="/dispensary/:id" element={
                  <>
                    <Header openAuthModal={openAuthModal} />
                    <DispensaryDetailsPage />
                    <Footer />
                  </>
                } />
                <Route path="/unauthorized" element={
                  <>
                    <Header openAuthModal={openAuthModal} />
                    <UnauthorizedPage />
                    <Footer />
                  </>
                } />

                {/* Dashboard routes - All authenticated users */}
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Admin routes */}
                        <Route path="/admin/*" element={
                          <ProtectedRoute requiredRole="ADMIN">
                            <Routes>
                              <Route path="/pending-approval" element={<AdminApprovalPage />} />
                              <Route path="/users" element={<div>Manage Users (Coming Soon)</div>} />
                              <Route path="/dispensaries" element={<div>Manage Dispensaries (Coming Soon)</div>} />
                              <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
                              <Route path="/settings" element={<div>System Settings (Coming Soon)</div>} />
                            </Routes>
                          </ProtectedRoute>
                        } />

                        {/* Patient routes */}
                        <Route path="/patient/*" element={
                          <ProtectedRoute requiredRole="PATIENT">
                            <Routes>
                              <Route path="/find-dispensaries" element={<FindDispensariesPage />} />
                              <Route path="/search-dispensaries" element={<SearchDispensariesPage />} />
                              <Route path="/browse-dispensaries" element={<BrowseDispensariesPage />} />
                              <Route path="/my-prescriptions" element={<div>My Prescriptions (Coming Soon)</div>} />
                              <Route path="/appointments" element={<div>Appointments (Coming Soon)</div>} />
                            </Routes>
                          </ProtectedRoute>
                        } />

                        {/* Dispensary routes */}
                        <Route path="/dispensary/*" element={
                          <ProtectedRoute requiredRole="DISPENSARY">
                            <Routes>
                              <Route path="/profile" element={<DispensaryProfilePage />} />
                              <Route path="/location" element={<div>Update Location (Coming Soon)</div>} />
                              <Route path="/invite-doctors" element={<div>Invite Doctors (Coming Soon)</div>} />
                              <Route path="/doctors" element={<div>My Doctors (Coming Soon)</div>} />
                              <Route path="/prescriptions" element={<div>Prescriptions (Coming Soon)</div>} />
                              <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                            </Routes>
                          </ProtectedRoute>
                        } />

                        {/* Doctor routes */}
                        <Route path="/doctor/*" element={
                          <ProtectedRoute requiredRole="DOCTOR">
                            <Routes>
                              <Route path="/invitations" element={<div>Invitations (Coming Soon)</div>} />
                              <Route path="/dispensaries" element={<div>My Dispensaries (Coming Soon)</div>} />
                              <Route path="/patients" element={<div>My Patients (Coming Soon)</div>} />
                              <Route path="/prescriptions" element={<div>Prescriptions (Coming Soon)</div>} />
                            </Routes>
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Legacy routes for backward compatibility */}
                <Route path="/admin/*" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <>
                      <Header openAuthModal={openAuthModal} />
                      <Routes>
                        <Route path="pending-approval" element={<AdminApprovalPage />} />
                      </Routes>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />

                <Route path="/doctor/*" element={
                  <ProtectedRoute requiredRole="DOCTOR">
                    <>
                      <Header openAuthModal={openAuthModal} />
                      <Routes>
                        <Route path="dashboard" element={<div>Doctor Dashboard</div>} />
                      </Routes>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />

                <Route path="/patient/*" element={
                  <ProtectedRoute requiredRole="PATIENT">
                    <>
                      <Header openAuthModal={openAuthModal} />
                      <Routes>
                        <Route path="dashboard" element={<div>Patient Dashboard</div>} />
                      </Routes>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />

                <Route path="/prescriptions" element={
                  <ProtectedRoute requiredRoles={["DOCTOR", "PATIENT"]}>
                    <>
                      <Header openAuthModal={openAuthModal} />
                      <div>Prescriptions Page</div>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <>
                      <Header openAuthModal={openAuthModal} />
                      <div>Profile Page</div>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />

                <Route path="/pending-approval" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <>
                      <Header openAuthModal={openAuthModal} />
                      <AdminApprovalPage />
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>

          {/* Render AuthModal outside of main to avoid z-index issues */}
          {showAuthModal && (
            <AuthModal onClose={closeAuthModal} />
          )}
        </Router>
      </AuthProvider>
    </NotificationProvider>
  )
}

export default App