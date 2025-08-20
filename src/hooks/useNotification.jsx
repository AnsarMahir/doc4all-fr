import { useState } from 'react'

export const useNotification = () => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const notification = { id, message, type, duration }
    
    setNotifications(prev => [...prev, notification])
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const success = (message, duration) => addNotification(message, 'success', duration)
  const error = (message, duration) => addNotification(message, 'error', duration)
  const warning = (message, duration) => addNotification(message, 'warning', duration)
  const info = (message, duration) => addNotification(message, 'info', duration)

  const clear = () => setNotifications([])

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clear
  }
}

// Notification component to display notifications
export const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            px-4 py-3 rounded-md shadow-lg max-w-sm
            ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
            ${notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : ''}
            ${notification.type === 'info' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => onRemove(notification.id)}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
