// app/members/_components/AppShell.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useShellConfig } from "./ShellConfig"
import { getInboxUnreadIndicator } from "@/app/members/inbox/inbox-indicator-actions"

const STORAGE_KEY = "mrr_sidebar_state"

interface UserProfile {
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
  role?: string | null
  is_creator?: boolean | null
}

function classNames(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ")
}

const ROUTE_MAP: Record<string, { href: string; icon: string; activeMatch?: (p: string) => boolean }> = {
  dashboard: {
    href: "/members/dashboard",
    icon: "fa-chart-line",
  },
  tools: {
    href: "/members/tools",
    icon: "fa-tools",
  },
  community: {
    href: "/members/community",
    icon: "fa-users",
    activeMatch: (p: string) => p.startsWith("/members/community"),
  },
  education: {
    href: "/members/education",
    icon: "fa-book",
  },
  support: {
    href: "/members/support",
    icon: "fa-life-ring",
  },
}

export function AppShell({
  children,
  userProfile,
  inboxUnreadCount = 0,
}: { children: ReactNode; userProfile: UserProfile; inboxUnreadCount?: number }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [hasInboxUnread, setHasInboxUnread] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const config = useShellConfig()

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === "closed") setSidebarOpen(false)
    } catch {}
    setMounted(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, sidebarOpen ? "open" : "closed")
    } catch {}
  }, [sidebarOpen, mounted])

  useEffect(() => {
    let alive = true

    const check = async () => {
      try {
        const res = await getInboxUnreadIndicator()
        if (alive) setHasInboxUnread(!!res?.hasUnread)
      } catch {
        // keep silent
      }
    }

    check()

    const onFocus = () => check()
    window.addEventListener("focus", onFocus)

    return () => {
      alive = false
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  useEffect(() => {
    const accent = config.brandAccentColor || "#6366f1" // fallback indigo
    document.documentElement.style.setProperty("--brand-accent", accent)
  }, [config.brandAccentColor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (avatarOpen) setAvatarOpen(false)
        else if (sidebarOpen) setSidebarOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [avatarOpen, sidebarOpen])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!avatarRef.current) return
      if (!avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
    }
    if (avatarOpen) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [avatarOpen])

  const toggleSidebar = () => setSidebarOpen((v) => !v)

  const menu = [
    ...config.memberNavigation
      .filter((item) => item.key in ROUTE_MAP) // Only include keys that exist in ROUTE_MAP
      .map((item) => ({
        key: item.key,
        label: item.label,
        href: ROUTE_MAP[item.key].href,
        icon: ROUTE_MAP[item.key].icon,
        activeMatch: ROUTE_MAP[item.key].activeMatch,
      })),
    // Admin link always appends last if user is creator
    ...(userProfile.is_creator === true
      ? [{ key: "admin", label: "Admin", href: "/admin/dashboard", icon: "fa-shield-halved", activeMatch: undefined }]
      : []),
  ]

  const isActive = (item: (typeof menu)[number]) =>
    item.activeMatch ? item.activeMatch(pathname) : pathname === item.href

  const getDisplayName = () => {
    return userProfile.full_name || userProfile.email || "Member"
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* HEADER */}
      <div id="header" className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              aria-label="Toggle sidebar"
              type="button"
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
                <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
                <div className="w-full h-0.5 bg-current transition-all duration-300"></div>
              </div>
            </button>

            <Link href="/members/dashboard" id="logo-section" className="flex items-center">
              {config.brandLogoUrl ? (
                <img
                  src={config.brandLogoUrl || "/placeholder.svg"}
                  alt={config.siteTitle || "Logo"}
                  className="h-12 w-auto"
                />
              ) : (
                <span className="text-xl font-bold text-gray-900">{config.siteTitle || "Platform"}</span>
              )}
            </Link>
          </div>

          {/* Right side: inbox, avatar */}
          <div id="header-user-menu" className="flex items-center space-x-4">
            {/* Bell => /members/inbox */}
            <Link
              href="/members/inbox"
              className="relative flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open Inbox"
            >
              <i className="fa-solid fa-bell text-lg"></i>
              <span className="text-sm font-medium">Inbox</span>

              {hasInboxUnread && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
            </Link>

            {/* Avatar + dropdown */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200" ref={avatarRef}>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">{getDisplayName()}</div>
                <div className="text-xs text-gray-500">{userProfile.role || "Member"}</div>
              </div>

              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="relative rounded-full focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={avatarOpen}
                aria-label="Open user menu"
                type="button"
              >
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url || "/placeholder.svg"}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[var(--brand-accent)]/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-accent)]/10 flex items-center justify-center text-[var(--brand-accent)] font-bold border-2 border-[var(--brand-accent)]/20">
                    {getInitials()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--brand-accent)] rounded-full border-2 border-white"></div>
              </button>

              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Toggle user menu"
                type="button"
              >
                <i className="fa-solid fa-chevron-down text-sm"></i>
              </button>

              {/* Dropdown */}
              {avatarOpen && (
                <div
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-6 top-14 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-[60]"
                >
                  <Link
                    href="/members/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Profile
                  </Link>
                  {config.billingLink ? (
                    <a
                      href={config.billingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setAvatarOpen(false)}
                    >
                      Billing
                    </a>
                  ) : (
                    <Link
                      href="/members/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setAvatarOpen(false)}
                    >
                      Account
                    </Link>
                  )}
                  <Link
                    href="/logout"
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        id="sidebar"
        className={classNames(
          "fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out will-change-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:-translate-x-full",
          !sidebarOpen && "pointer-events-none",
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          <div id="sidebar-main-menu" className="flex-1 py-6">
            <nav className="px-4 space-y-2">
              {menu.map((item) => {
                const active = isActive(item)
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={classNames(
                      "flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 group",
                      active
                        ? "text-white bg-[var(--brand-accent)] shadow-lg"
                        : "text-gray-600 hover:text-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/5",
                    )}
                  >
                    <i
                      className={classNames(
                        "fa-solid w-5 mr-3",
                        item.icon,
                        "text-gray-500", // Base color always applied
                        active && "text-white", // Override when active
                        !active && "group-hover:text-[var(--brand-accent)]", // Hover only when inactive
                      )}
                    />
                    <span>{item.label}</span>
                    {active ? (
                      <div className="ml-auto w-2 h-2 bg-white/30 rounded-full" />
                    ) : (
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-[var(--brand-accent)]/20 rounded-full" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div id="sidebar-bottom-section" className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                © {new Date().getFullYear()} {config.siteTitle || "Platform"}
              </div>
              {(config.siteTermsUrl || config.sitePrivacyUrl) && (
                <div className="flex items-center gap-2">
                  {config.siteTermsUrl && (
                    <a
                      href={config.siteTermsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[var(--brand-accent)] transition-colors"
                    >
                      Terms
                    </a>
                  )}
                  {config.siteTermsUrl && config.sitePrivacyUrl && <span className="text-gray-300">|</span>}
                  {config.sitePrivacyUrl && (
                    <a
                      href={config.sitePrivacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[var(--brand-accent)] transition-colors"
                    >
                      Privacy
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={classNames("mt-16 p-6 transition-all duration-300", sidebarOpen ? "ml-0 lg:ml-64" : "ml-0")}>
        {children}
      </div>
    </>
  )
}
