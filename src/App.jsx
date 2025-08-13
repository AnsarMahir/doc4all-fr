// App.js - Fixed version
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import FindDispensariesPage from './pages/FindDispensariesPage'
import BrowseDispensariesPage from './pages/BrowseDispensariesPage'
import SearchDispensariesPage from './pages/SearchDispensariesPage'
import DispensaryDetailsPage from './pages/DispensaryDetailsPage'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal/AuthModal'
import AdminApprovalPage from './pages/AdminApprovalPage'

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const openAuthModal = () => {
    setShowAuthModal(true)
  }

  const closeAuthModal = () => {
    setShowAuthModal(false)
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header openAuthModal={openAuthModal} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage openAuthModal={openAuthModal} />} />
            <Route path="/find-dispensaries" element={<FindDispensariesPage />} />
            <Route path="/browse-dispensaries" element={<BrowseDispensariesPage />} />
            <Route path="/search-dispensaries" element={<SearchDispensariesPage />} />
            <Route path="/pending-approval" element={<AdminApprovalPage/>} />
            <Route path="/dispensary/:id" element={<DispensaryDetailsPage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
      
      {/* Render AuthModal outside of main to avoid z-index issues */}
      {showAuthModal && (
        <AuthModal onClose={closeAuthModal} />
      )}
    </Router>
  )
}

export default App