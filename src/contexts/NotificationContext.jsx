import { createContext, useContext } from 'react'
import { useNotification, NotificationContainer } from '../hooks/useNotification.jsx'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const notificationMethods = useNotification()

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {children}
      <NotificationContainer 
        notifications={notificationMethods.notifications} 
        onRemove={notificationMethods.removeNotification} 
      />
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
