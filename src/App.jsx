import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import FeatureSection from './components/FeatureSection'
import DisciplinesSection from './components/DisciplinesSection'
import HowItWorksSection from './components/HowItWorksSection'
import TestimonialsSection from './components/TestimonialsSection'
import FaqSection from './components/FaqSection'
import RegistrationSection from './components/RegistrationSection'
import LoginSection from './components/LoginSection'
import Footer from './components/Footer'
import DispensaryLocationPage from './pages/DispensaryLocationPage'
import FindDispensariesPage from './pages/FindDispensariesPage'
import BrowseDispensariesPage from './pages/BrowseDispensariesPage'
import SearchDispensariesPage from './pages/SearchDispensariesPage'
import DispensaryDetailsPage from './pages/DispensaryDetailsPage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  const [activeForm, setActiveForm] = useState('patient-doctor')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  const toggleForm = (formType) => {
    setActiveForm(formType)
  }

  const openLoginModal = () => {
    setShowLoginModal(true)
    setShowRegistrationModal(false)
  }

  const openRegistrationModal = () => {
    setShowRegistrationModal(true)
    setShowLoginModal(false)
  }

  const closeModals = () => {
    setShowLoginModal(false)
    setShowRegistrationModal(false)
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header openLoginModal={openLoginModal} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage openRegistrationModal={openRegistrationModal} />} />
            <Route path="/find-dispensaries" element={<FindDispensariesPage />} />
            <Route path="/browse-dispensaries" element={<BrowseDispensariesPage />} />
            <Route path="/search-dispensaries" element={<SearchDispensariesPage />} />
            <Route path="/dispensary/:id" element={<DispensaryDetailsPage />} />
          </Routes>
          
          {showRegistrationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button 
                  onClick={closeModals}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
                <RegistrationSection 
                  activeForm={activeForm} 
                  toggleForm={toggleForm} 
                />
              </div>
            </div>
          )}
          
          {showLoginModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button 
                  onClick={closeModals}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
                <LoginSection 
                  activeForm={activeForm} 
                  toggleForm={toggleForm} 
                />
              </div>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App