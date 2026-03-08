import api from '../api'
import { endpoint } from '../endpoints'

export const notificationsService = {
  getMyNotifications: async () => {
    const response = await api.get(endpoint.notifications.my)
    return response.data
  },

  getUnread: async () => {
    const response = await api.get(endpoint.notifications.unread)
    return response.data
  },

  markAsRead: async (id) => {
    const response = await api.put(endpoint.notifications.read(id))
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.put(endpoint.notifications.markAllRead)
    return response.data
  },

  deleteNotification: async (id) => {
    const response = await api.delete(endpoint.notifications.delete(id))
    return response.data
  },
}
