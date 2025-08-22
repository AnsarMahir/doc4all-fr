// components/layout/DashboardLayout.jsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import DashboardHeader from './DashboardHeader'

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
