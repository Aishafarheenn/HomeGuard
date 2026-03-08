import React, { useEffect, useState, useCallback } from 'react'
import { Bell, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react'
import { notificationsService } from '../../services/requests/notificationsService'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actingId, setActingId] = useState(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await notificationsService.getMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to load notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id) => {
    setActingId(id)
    try {
      const updated = await notificationsService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to mark as read'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setActingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    setActingId('all')
    try {
      await notificationsService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to mark all as read'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setActingId(null)
    }
  }

  const handleDelete = async (id) => {
    setActingId(id)
    try {
      await notificationsService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to delete'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setActingId(null)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={actingId === 'all'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#A78BFA] text-[#7C3AED] font-medium hover:bg-[#EDE9FE] transition shadow-sm shrink-0 disabled:opacity-50"
          >
            {actingId === 'all' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#1F2937]">My notifications</h2>
          <p className="text-slate-500 text-sm mt-0.5">Your notification history</p>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No notifications yet.</p>
          </div>
        )}
        {!loading && notifications.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`px-6 py-4 flex items-start justify-between gap-4 ${
                  !n.is_read ? 'bg-[#F5F3FF]/50' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#1F2937]">{n.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {n.sent_at ? new Date(n.sent_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.id)}
                      disabled={actingId === n.id}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED] disabled:opacity-50"
                      title="Mark as read"
                    >
                      {actingId === n.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    disabled={actingId === n.id}
                    className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Delete"
                  >
                    {actingId === n.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Notifications
