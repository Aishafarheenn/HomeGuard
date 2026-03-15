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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={actingId === 'all'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-violet-200 text-violet-700 font-medium hover:bg-violet-50 transition shrink-0 disabled:opacity-50"
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
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">My notifications</h2>
              <p className="text-slate-500 text-sm mt-0.5">Your notification history</p>
            </div>
          </div>
        </div>
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading notifications…</p>
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No notifications yet</p>
            <p className="text-sm mt-1 text-slate-500">Notifications will appear here.</p>
          </div>
        )}
        {!loading && notifications.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`px-6 py-4 flex items-start justify-between gap-4 transition-colors ${
                  !n.is_read ? 'bg-violet-50/30' : 'hover:bg-slate-50/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{n.message}</p>
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
