// pages/dashboard/DashboardPage.jsx
import { useAuth } from '../../contexts/AuthContext'
import AdminDashboard from './AdminDashboard'
import PatientDashboard from './PatientDashboard'
import DispensaryDashboard from './DispensaryDashboard'
import DoctorDashboard from './DoctorDashboard'

const DashboardPage = () => {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard />
      case 'PATIENT':
        return <PatientDashboard />
      case 'DISPENSARY':
        return <DispensaryDashboard />
      case 'DOCTOR':
        return <DoctorDashboard />
      default:
        return <div>Unknown user role</div>
    }
  }

  return (
    <div>
      {renderDashboard()}
    </div>
  )
}

export default DashboardPage
