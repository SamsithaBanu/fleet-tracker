'use client'

import { Search, Bell, Settings, X, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function TopBar({ onMenuClick, menuOpen }: { onMenuClick: () => void; menuOpen: boolean }) {
  return (
    <header className="h-16 bg-white border-b border-[#088395]/15 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      {/* Left side: Search */}
      <div className="flex items-center gap-4 flex-1 max-w-sm">
        <button
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-[#088395]/5 hover:text-[#088395] transition-colors"
        onClick={onMenuClick}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#088395]/60 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search vehicles, orders..."
            className="pl-9 bg-[#088395]/5 border-[#088395]/15 focus-visible:border-[#088395]/40 focus-visible:ring-[#088395]/15 text-sm placeholder:text-gray-400 rounded-xl"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-1">
        {/* Live status badge */}
        <Badge
          variant="outline"
          className="hidden sm:flex items-center gap-1.5 text-[#088395] border-[#088395]/20 bg-[#088395]/5 rounded-full px-3 py-1 mr-2 font-semibold text-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#088395] animate-pulse shadow-[0_0_6px_#088395]" />
          Live tracking
        </Badge>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 hover:text-[#088395] hover:bg-[#088395]/10 rounded-lg"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 border-2 border-white rounded-full" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Notifications</TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-[#088395] hover:bg-[#088395]/10 rounded-lg"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="h-8 w-px bg-[#088395]/15 mx-2" />

        {/* Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">Samsitha Banu</p>
            <p className="text-xs text-[#088395] font-medium">Fleet Manager</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-[#088395]/20 hover:ring-[#088395]/50 transition-all">
                <AvatarFallback className="bg-gradient-to-br from-[#088395] to-[#2C687B] text-white text-sm font-bold">
                  SB
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">My Profile</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}
