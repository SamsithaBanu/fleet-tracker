// frontend/app/dashboard/notifications/page.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, Package, CheckCircle2, Clock, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { notificationApi } from '@/lib/orderApi'
import { useAuth } from '@/lib/authContext'

interface NotificationItem {
  _id: string
  title: string
  description: string
  orderId: string | null
  warehouse: string
  status: 'read' | 'unread'
  createdAt: string
}

const iconMap: Record<string, React.ReactNode> = {
  'Order Delivered':  <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  'Order Pending':    <Clock className="h-4 w-4 text-amber-500" />,
  'Order Assigned':   <Package className="h-4 w-4 text-blue-500" />,
  'Order Picked Up':  <Package className="h-4 w-4 text-purple-500" />,
}

// Format ISO date to readable relative/absolute time
const formatTime = (iso: string) => {
  const date = new Date(iso)
  const now  = new Date()
  const diffMs  = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1)  return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hr ago`

  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const query = user?.role === 'driver' ? `?driverId=${encodeURIComponent(user.id)}&role=driver` : ''
      const data = await notificationApi.getAll(query)

      if (data.success) {
        setNotifications(data.data.notifications)
      }
    } catch (err) {
      console.error('Notification fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  if (!user) return;

  const loadNotifications = async () => {
    await fetchNotifications();
  };

  loadNotifications();

  const interval = setInterval(loadNotifications, 15000);

  return () => clearInterval(interval);
}, [user]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length

  const markAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
    await notificationApi.markAllRead()
  }

  const markRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n._id === id ? { ...n, status: 'read' } : n))
    )
    await notificationApi.markRead(id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading notifications...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening with your fleet.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5
                rounded-full text-xs font-medium bg-[#088395]/10 text-[#088395]">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-1.5 text-[#088395] border-[#088395]/20
            bg-[#088395]/5 hover:bg-[#088395]/10 rounded-full px-4 py-1.5
            font-semibold text-xs disabled:opacity-40"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#088395] animate-pulse
            shadow-[0_0_6px_#088395]" />
          Mark all read
        </Button>
      </div>
      <Separator className="bg-[#088395]/10" />

      {/* Notification List */}
      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20
            text-gray-400 gap-3">
            <Inbox className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isUnread = notification.status === 'unread'
            return (
              <div
                key={notification._id}
                onClick={() => markRead(notification._id)}
                className={cn(
                  'flex items-start gap-4 p-2 rounded-xl border cursor-pointer transition-all duration-150',
                  isUnread
                    ? 'bg-[#088395]/5 border-[#088395]/20 hover:bg-[#088395]/10'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  isUnread ? 'bg-[#088395]/10' : 'bg-gray-100'
                )}>
                  {iconMap[notification.title] ?? (
                    <Bell className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'text-sm leading-snug',
                      isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                    )}>
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#088395]
                          shadow-[0_0_6px_#088395]" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Package className="h-3 w-3 text-gray-400" />
                    <span className="text-[11px] text-gray-400">
                      {notification.warehouse || notification.orderId} · {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}