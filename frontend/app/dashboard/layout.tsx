'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { navItems } from '@/data/data'
import { useAuth } from '@/lib/authContext'
import {ProtectedRoute} from '../../components/ProtectedRoute';
import { FiLogOut } from "react-icons/fi";
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
    <div className="flex h-screen bg-[#f0f9fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#088395]/15 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-[#088395]/10">
          <div className="flex items-center gap-2.5 cursor-pointer"   onClick={() => router.push('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#088395] to-[#2C687B] flex items-center justify-center shadow-lg shadow-[#088395]/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">FleetTracker</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">
            Main Menu
          </p>
          {navItems.slice(0, 6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive
                      ? 'bg-[#088395]/10 text-[#088395] font-semibold border border-[#088395]/20 shadow-sm'
                      : 'text-gray-600 hover:bg-[#088395]/5 hover:text-[#088395]'
                      }`}
                  >
                    <span className={`shrink-0 transition-colors ${isActive ? 'text-[#088395]' : 'text-gray-400 group-hover:text-[#088395]'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.label === 'Notifications' && (
                      <Badge className="ml-auto h-4 min-w-4 px-1 text-[10px] bg-red-500 hover:bg-red-500 text-white rounded-full">
                        3
                      </Badge>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}

          <Separator className="my-2 bg-[#088395]/10" />

          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-1">
            System
          </p>
          {navItems.slice(6).map((item) => {
            const isActive = pathname === item.href
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive
                      ? 'bg-[#088395]/10 text-[#088395] font-semibold border border-[#088395]/20 shadow-sm'
                      : 'text-gray-600 hover:bg-[#088395]/5 hover:text-[#088395]'
                      }`}
                  >
                    <span className={`shrink-0 transition-colors ${isActive ? 'text-[#088395]' : 'text-gray-400 group-hover:text-[#088395]'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        {/* Footer */}
        <Separator className="bg-[#088395]/10" />
        <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-green-100 flex
                items-center justify-center text-green-700 text-xs font-bold">
                {user?.name?.charAt(0) ?? 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-red-500
                  transition-colors px-1"
                title="Sign out"
              >
                <FiLogOut size={20} color='black' />
              </button>
            </div>
          </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  )
}