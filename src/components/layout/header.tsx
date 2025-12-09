"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme-store";

export function Header() {
  const { data: session } = useSession();
  const { config } = useThemeStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 transition-all duration-300",
        config.sidebarCollapsed ? "left-[72px]" : "left-64",
      )}
    >
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-80 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {session?.user?.name ? (
                <span className="text-sm font-medium">
                  {session.user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user?.customerType || "Admin"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
