import { Truck, ShoppingCart, Users, CheckCircle2 } from "lucide-react";
import { Bell, House, Store, Package, MapPin, BarChart3, Settings, Motorbike } from 'lucide-react'

export const dashboardData = [
    { label: "Active Drivers", value: "0" },
    { label: "Orders today", value: "0" },
    { label: "Drivers online", value: "0" },
    { label: "Deliveries done", value: "0" },
]

export const allOrders = [
    {
        id: 1,
        orderId: 'ORD-2024-001',
        customerName: 'John Doe',
        status: 'Pending',
        date: '2024-01-15',
        time: '10:00 AM',
        Warehouse: 'Koramangala',
        driverName: 'John Doe',
    },
    {
        id: 2,
        orderId: 'ORD-2024-002',
        customerName: 'Jane Doe',
        status: 'Delivered',
        date: '2024-01-15',
        time: '10:00 AM',
        Warehouse: 'Whitefield',
        driverName: 'Jane Doe',
    },
    {
        id: 3,
        orderId: 'ORD-2024-003',
        customerName: 'Bob Smith',
        status: 'Pending',
        date: '2024-01-15',
        time: '10:00 AM',
        Warehouse: 'Koramangala',
        driverName: 'Bob Smith',
    },
    {
        id: 4,
        orderId: 'ORD-2024-004',
        customerName: 'Alice Johnson',
        status: 'Delivered',
        date: '2024-01-15',
        time: '10:00 AM',
        Warehouse: 'Indiranagar',
        driverName: 'Alice Johnson',
    },
];

export const notificationData = [
    {
        id: 1,
        title: 'Order Delivered',
        description: 'Order ORD-2024-002 has been delivered',
        date: '2026-05-23',
        time: '10:00 AM',
        Warehouse: 'Whitefield',
        status: 'read'
    },
    {
        id: 2,
        title: 'Order Pending',
        description: 'Order ORD-2024-003 is pending',
        date: '2026-05-23',
        time: '11:00 AM',
        Warehouse: 'Koramangala',
        status: 'read'
    },
    {
        id: 3,
        title: 'Order Delivered',
        description: 'Order ORD-2024-004 has been delivered',
        date: '2026-05-23',
        time: '10:30 AM',
        Warehouse: 'Indiranagar',
        status: 'unread'
    },
    {
        id: 4,
        title: 'Order #437 picked up from Koramangala warehouse',
        description: 'Order ORD-2024-004 has been delivered',
        date: '2026-05-23',
        time: '10:30 AM',
        Warehouse: 'Indiranagar',
        status: 'unread'
    },
];

export const warehouseList = [
    {
        id: 1,
        name: 'Koramangala',
        location: '28th Main Rd, Koramangala 1st Block, Koramangala',
        status: 'Operational',
        ordersToday: 143,
        delivered: 118,
        activeDrivers: 18,
        pending: 7
    },
    {
        id: 2,
        name: 'Whitefield',
        location: 'Whitefield Main Rd, Whitefield',
        status: 'Operational',
        ordersToday: 143,
        delivered: 118,
        activeDrivers: 18,
        pending: 7
    },
    {
        id: 3,
        name: 'Indiranagar',
        location: 'ITPL Main Rd, Garudachar Palya, Whitefield',
        status: 'Operational',
        ordersToday: 143,
        delivered: 118,
        activeDrivers: 18,
        pending: 7
    },
];

export const driverList = [
    {
        id: 1,
        name: 'John Doe',
        warehouse: 'Koramangala',
        status: 'Online',
        delivered: 118,
        rating: 4.8
    },
    {
        id: 2,
        name: 'Jane Doe',
        warehouse: 'Whitefield',
        status: 'Online',
        delivered: 118,
        rating: 4.8
    },
    {
        id: 3,
        name: 'Bob Smith',
        warehouse: 'Indiranagar',
        status: 'Offline',
        delivered: 118,
        rating: 4.8
    },
    {
        id: 4,
        name: 'Bob Smith',
        warehouse: 'Indiranagar',
        status: 'Online',
        delivered: 118,
        rating: 4.8
    },
    {
        id: 5,
        name: 'Alice Johnson',
        warehouse: 'Indiranagar',
        status: 'Online',
        delivered: 118,
        rating: 4.8
    },
];

export const statMeta: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    "Active Drivers": {
        icon: <Truck className="h-4 w-4" />,
        color: "text-[#088395]",
        bg: "bg-[#088395]/10",
    },
    "Orders today": {
        icon: <ShoppingCart className="h-4 w-4" />,
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    "Drivers online": {
        icon: <Users className="h-4 w-4" />,
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
    "Deliveries done": {
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
};

export const statusConfig: Record<string, { label: string; className: string }> = {
    Pending: {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    },
    Delivered: {
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    },
    "In Transit": {
        label: "In Transit",
        className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
    },
    Cancelled: {
        label: "Cancelled",
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    },
    Online: {
        label: "Online",
        className: "bg-emerald-100 text-emerald-700",
    },
    Offline: {
        label: "Offline",
        className: "bg-gray-100 text-gray-600",
    }
};

export const navItems = [
    { href: '/dashboard', label: 'Overview', icon: <House size={16} /> },
    { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { href: '/dashboard/warehouses', label: 'Warehouses', icon: <Store size={16} /> },
    { href: '/dashboard/drivers', label: 'Drivers', icon: <Motorbike size={16} /> },
    { href: '/dashboard/orders', label: 'Orders', icon: <Package size={16} /> },
    { href: '/dashboard/livemap', label: 'Live Map', icon: <MapPin size={16} /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings size={16} /> },
]