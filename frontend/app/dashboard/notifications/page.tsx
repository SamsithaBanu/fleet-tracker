'use client'

import { useState } from 'react'
import { notificationData } from '@/data/data'
import { Button } from '@/components/ui/button'
import { Bell, Package, CheckCircle2, Clock, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const iconMap: Record<string, React.ReactNode> = {
    'Order Delivered': <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    'Order Pending': <Clock className="h-4 w-4 text-amber-500" />,
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(notificationData)

    const unreadCount = notifications.filter((n) => n.status === 'unread').length

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })))
    }

    const markRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
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
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#088395]/10 text-[#088395]">
                                {unreadCount} unread
                            </span>
                        )}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-1.5 text-[#088395] border-[#088395]/20 bg-[#088395]/5 hover:bg-[#088395]/10 rounded-full px-4 py-1.5 font-semibold text-xs disabled:opacity-40"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#088395] animate-pulse shadow-[0_0_6px_#088395]" />
                    Mark all read
                </Button>
            </div>
            <Separator className=" bg-[#088395]/10" />

            {/* Notification List */}
            <div className="flex flex-col gap-2">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                        <Inbox className="h-10 w-10 opacity-40" />
                        <p className="text-sm font-medium">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const isUnread = notification.status === 'unread'
                        return (
                            <div
                                key={notification.id}
                                onClick={() => markRead(notification.id)}
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
                                            <span className="text-xs text-gray-400">{notification.time}</span>
                                            {isUnread && (
                                                <span className="w-2 h-2 rounded-full bg-[#088395] shadow-[0_0_6px_#088395]" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {notification.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Package className="h-3 w-3 text-gray-400" />
                                        <span className="text-[11px] text-gray-400">{notification.Warehouse} · {notification.date}</span>
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