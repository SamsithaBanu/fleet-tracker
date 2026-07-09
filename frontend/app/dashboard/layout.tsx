"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { navItems } from "@/data/data";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { notificationApi } from "@/lib/orderApi";
import { setupForegroundNotifications } from "@/lib/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [railOpen, setRailOpen] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const railRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
    // Request permission automatically when dashboard loads
    const requestPermission = async () => {
      if (typeof window === 'undefined') return
      if (!('Notification' in window)) return

      if (Notification.permission === 'default') {
        // Small delay so it doesn't popup instantly on page load
        await new Promise(resolve => setTimeout(resolve, 2000))
        const permission = await Notification.requestPermission()
        console.log('Notification permission:', permission)
      }

      // Set up foreground notifications
      import('@/lib/firebase').then(({ setupForegroundNotifications }) => {
        setupForegroundNotifications()
      })
    }

    requestPermission()
  }, [])

  // Close rail on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRailOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRailOpen(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = railOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [railOpen]);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user) return;
      const query =
        user.role === "driver"
          ? `?driverId=${encodeURIComponent(user.id)}&role=driver`
          : "";
      try {
        const res = await notificationApi.getAll(query);
        if (res.success) {
          const unread = (res.data.notifications || []).filter(
            (n: any) => n.status === "unread",
          ).length;
          setNotificationCount(unread);
        }
      } catch (err) {
        console.error("Notification count fetch failed:", err);
      }
    };

    fetchCount();
    const interval = window.setInterval(fetchCount, 15000);
    return () => window.clearInterval(interval);
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin", "driver"]}>
      <div className="flex h-screen bg-[#f0f9fa] relative overflow-hidden">
        <aside className="hidden md:flex w-64 bg-white border-r border-[#088395]/15 flex-col shadow-sm flex-shrink-0">
          <div className="p-5 border-b border-[#088395]/10">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#088395] to-[#2C687B] flex items-center justify-center shadow-lg shadow-[#088395]/20">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 tracking-tight text-lg">
                FleetTracker
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">
              Main Menu
            </p>
            {navItems.slice(0, 6).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                        isActive
                          ? "bg-[#088395]/10 text-[#088395] font-semibold border border-[#088395]/20 shadow-sm"
                          : "text-gray-600 hover:bg-[#088395]/5 hover:text-[#088395]"
                      }`}
                    >
                      <span
                        className={`shrink-0 transition-colors ${isActive ? "text-[#088395]" : "text-gray-400 group-hover:text-[#088395]"}`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                      {item.label === "Notifications" &&
                        notificationCount > 0 && (
                          <Badge className="ml-auto h-4 min-w-4 px-1 text-[10px] bg-red-500 hover:bg-red-500 text-white rounded-full">
                            {notificationCount > 9 ? "9+" : notificationCount}
                          </Badge>
                        )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}

            <Separator className="my-2 bg-[#088395]/10" />

            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-1 pb-1">
              System
            </p>
            {navItems.slice(6).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                        isActive
                          ? "bg-[#088395]/10 text-[#088395] font-semibold border border-[#088395]/20 shadow-sm"
                          : "text-gray-600 hover:bg-[#088395]/5 hover:text-[#088395]"
                      }`}
                    >
                      <span
                        className={`shrink-0 transition-colors ${isActive ? "text-[#088395]" : "text-gray-400 group-hover:text-[#088395]"}`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Footer */}
          <Separator className="bg-[#088395]/10" />
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                {user?.name?.charAt(0) ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                title="Sign out"
              >
                <FiLogOut size={20} color="black" />
              </button>
            </div>
          </div>
        </aside>

        {railOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setRailOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          ref={railRef}
          className={`
            fixed top-0 left-0 h-full z-40 md:hidden
            w-[60px] bg-white border-r border-[#088395]/15 shadow-lg
            flex flex-col
            transition-transform duration-250 ease-in-out
            ${railOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Mobile navigation rail"
        >
          <div className="flex justify-center items-center py-4 border-b border-[#088395]/10">
            <div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#088395] to-[#2C687B] flex items-center justify-center shadow-md cursor-pointer"
              onClick={() => {
                router.push("/");
                setRailOpen(false);
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
              </svg>
            </div>
          </div>
          <nav className="flex-1 flex flex-col items-center gap-1 py-3 overflow-y-auto">
            <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest mb-1">
              Menu
            </p>
            {navItems.slice(0, 6).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={() => setRailOpen(false)}
                      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-[#088395]/10 text-[#088395] border border-[#088395]/20"
                          : "text-gray-400 hover:bg-[#088395]/5 hover:text-[#088395]"
                      }`}
                      aria-label={item.label}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {item.label === "Notifications" && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
            <Separator className="my-1.5 w-8 bg-[#088395]/10" />
            <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest mb-1">
              Sys
            </p>
            {navItems.slice(6).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={() => setRailOpen(false)}
                      className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-[#088395]/10 text-[#088395] border border-[#088395]/20"
                          : "text-gray-400 hover:bg-[#088395]/5 hover:text-[#088395]"
                      }`}
                      aria-label={item.label}
                    >
                      <span className="shrink-0">{item.icon}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
          <Separator className="bg-[#088395]/10" />
          <div className="flex flex-col items-center gap-2 py-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold cursor-default">
                  {user?.name?.charAt(0) ?? "A"}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user?.name} · {user?.role}
              </TooltipContent>
            </Tooltip>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar
            onMenuClick={() => setRailOpen((prev) => !prev)}
            menuOpen={railOpen}
            unreadCount={notificationCount}
          />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
