"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/browser"
import { Sparkles, User, CheckCircle2, Circle, X, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { usePlanPermissions } from "@/hooks/use-plan-permissions"
import { getDashboardData } from "./actions"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{
    first_name: string | null
    last_name: string | null
    full_name: string | null
    email: string | null
    avatar_url: string | null
    bio: string | null
    social_links: Record<string, string> | null
    role: string | null
    is_creator: boolean | null
  } | null>(null)
  const [isProfileSetupDismissed, setIsProfileSetupDismissed] = useState(false)

  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null)
  const [featuredTools, setFeaturedTools] = useState<any[]>([])
  const [featuredGroups, setFeaturedGroups] = useState<any[]>([])
  const [featuredContent, setFeaturedContent] = useState<any[]>([])
  const [siteUpdates, setSiteUpdates] = useState<any[]>([])
  const [featuredExperts, setFeaturedExperts] = useState<
    {
      id: string
      name: string
      title: string | null
      image_url: string | null
      bio: string | null
      slug: string | null
    }[]
  >([])
  const [brandPrimaryColor, setBrandPrimaryColor] = useState<string | null>(null)
  const [brandAccentColor, setBrandAccentColor] = useState<string | null>(null)
  const [brandBackgroundColor, setBrandBackgroundColor] = useState<string | null>(null)
  const [toolsNavLabel, setToolsNavLabel] = useState<string>("Tools")

  const supabase = createClient()
  const permissions = usePlanPermissions()

  const brandButtonStyle = {
    backgroundColor: "var(--btn-bg)",
    color: "#ffffff",
  }

  const applyBrandButton = (e: any) => {
    e.currentTarget.style.backgroundColor = brandPrimaryColor || ""
    e.currentTarget.style.color = "#ffffff"
  }

  const handleBrandHover = (e: any) => {
    e.currentTarget.style.backgroundColor = brandAccentColor || ""
  }

  const handleBrandLeave = (e: any) => {
    e.currentTarget.style.backgroundColor = brandPrimaryColor || ""
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, full_name, email, avatar_url, bio, social_links, role, is_creator")
        .eq("id", user.id)
        .single()

      setProfile(data ?? null)
    }

    loadProfile()
  }, [user, supabase])

  useEffect(() => {
    const loadDashboardData = async () => {
      const data = await getDashboardData()
      setHeaderImageUrl(data.headerImageUrl)
      setFeaturedTools(data.tools)
      setFeaturedGroups(data.groups)
      setFeaturedContent(data.featuredContent || [])
      setSiteUpdates(data.latestSiteUpdates || [])
      setFeaturedExperts(data.featuredExperts || [])
    }

    loadDashboardData()
  }, [])

  useEffect(() => {
    const dismissed = localStorage.getItem("dashboardProfileDismissed")
    if (dismissed === "true") setIsProfileSetupDismissed(true)
  }, [])

  useEffect(() => {
    const loadBrandColors = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("brand_primary_color, brand_accent_color, brand_background_color, member_navigation")
        .single()

      if (data) {
        if (data.brand_primary_color) setBrandPrimaryColor(data.brand_primary_color)
        if (data.brand_accent_color) setBrandAccentColor(data.brand_accent_color)
        if (data.brand_background_color) setBrandBackgroundColor(data.brand_background_color)

        if (data.member_navigation) {
          let parsedNav: Array<{ id?: string; label?: string }> = []

          if (typeof data.member_navigation === "string") {
            try {
              parsedNav = JSON.parse(data.member_navigation)
            } catch {
              parsedNav = []
            }
          } else if (Array.isArray(data.member_navigation)) {
            parsedNav = data.member_navigation
          }

          const toolsNavItem = parsedNav.find((item) => item.id === "tools")
          if (toolsNavItem?.label) {
            setToolsNavLabel(toolsNavItem.label)
          }
        }
      }
    }

    loadBrandColors()
  }, [supabase])

  const displayName = profile?.full_name || profile?.email || "there"

  const profileChecks = {
    name: !!(profile?.first_name || profile?.full_name),
    bio: !!profile?.bio,
    avatar: !!profile?.avatar_url,
    website:
      !!profile?.social_links &&
      typeof profile.social_links === "object" &&
      Object.keys(profile.social_links).length > 0,
  }
  const completedCount = Object.values(profileChecks).filter(Boolean).length
  const totalChecks = Object.keys(profileChecks).length
  const isProfileComplete = completedCount === totalChecks

  const tools = featuredTools

  const groups = featuredGroups

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!brandPrimaryColor || !brandAccentColor || !brandBackgroundColor) {
    return null
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Please Log In</h2>
        <p className="text-slate-600">You need to be logged in to view your dashboard.</p>
        <Link href="/login">
          <Button
            variant="default"
            className="text-white hover:bg-[var(--btn-bg-hover)] transition-colors"
            style={
              {
                ...brandButtonStyle,
                "--btn-bg": brandPrimaryColor,
                "--btn-bg-hover": brandAccentColor,
              } as React.CSSProperties
            }
          >
            Go to Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-full">
      <div className="relative w-full h-[140px] md:h-[200px] overflow-hidden rounded-b-2xl">
        <Image src={headerImageUrl"} alt="" fill className="object-cover" priority />
      </div>

      <div className="flex flex-col gap-8 px-6 py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayName}</h1>
        </div>

        {!isProfileComplete && !isProfileSetupDismissed && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-5 relative">
            <button
              onClick={() => {
                localStorage.setItem("dashboardProfileDismissed", "true")
                setIsProfileSetupDismissed(true)
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Dismiss profile setup"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-slate-900">Set Up Your Profile</h2>
                <p className="text-slate-600 text-sm">
                  Complete your profile so others can find you in the directory and connect with you.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {profileChecks.name ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
                <span className={profileChecks.name ? "text-slate-900" : "text-slate-500"}>Name</span>
              </div>
              <div className="flex items-center gap-3">
                {profileChecks.bio ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
                <span className={profileChecks.bio ? "text-slate-900" : "text-slate-500"}>Short bio</span>
              </div>
              <div className="flex items-center gap-3">
                {profileChecks.avatar ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
                <span className={profileChecks.avatar ? "text-slate-900" : "text-slate-500"}>Avatar photo</span>
              </div>
              <div className="flex items-center gap-3">
                {profileChecks.website ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
                <span className={profileChecks.website ? "text-slate-900" : "text-slate-500"}>
                  Social / website link
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-slate-500">
                Progress: {completedCount} of {totalChecks} complete
              </span>
              <Link href="/members/profile">
                <Button
                  size="sm"
                  variant="default"
                  className="text-white hover:bg-[var(--btn-bg-hover)] transition-colors"
                  style={
                    {
                      ...brandButtonStyle,
                      "--btn-bg": brandPrimaryColor,
                      "--btn-bg-hover": brandAccentColor,
                    } as React.CSSProperties
                  }
                >
                  Complete My Profile
                </Button>
              </Link>
            </div>
          </div>
        )}

        {featuredTools.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Featured {toolsNavLabel}</h2>
              <Link
                href="/members/tools"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hidden sm:block"
              >
                View all {toolsNavLabel.toLowerCase()}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, i) => (
                <div
                  key={tool.id || i}
                  className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="relative w-full h-44 md:h-48">
                    <Image src={tool.image_url || "/placeholder.svg"} alt={tool.name} fill className="object-cover" />
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{tool.short_description}</p>
                    <Link href="/members/tools" className="mt-auto pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full text-white hover:bg-[var(--btn-bg-hover)] transition-colors"
                        style={
                          {
                            ...brandButtonStyle,
                            "--btn-bg": brandPrimaryColor,
                            "--btn-bg-hover": brandAccentColor,
                          } as React.CSSProperties
                        }
                      >
                        Go to {toolsNavLabel}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Featured Groups</h3>
              </div>
            </div>

            {groups.length > 0 && (
              <div className="flex flex-col gap-3">
                {groups.map((group, i) => (
                  <div
                    key={group.id || i}
                    className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex items-center gap-3"
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      <Image
                        src={group.avatar_url || "/placeholder.svg"}
                        alt={group.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="font-semibold text-base text-slate-900 truncate">{group.name}</span>
                      <span className="text-sm text-slate-500 truncate">{group.description}</span>
                    </div>
                    <Link href={`/members/community/groups?group=${group.slug}`}>
                      <Button
                        variant="default"
                        size="sm"
                        className="shrink-0 text-white hover:bg-[var(--btn-bg-hover)] transition-colors"
                        style={
                          {
                            ...brandButtonStyle,
                            "--btn-bg": brandPrimaryColor,
                            "--btn-bg-hover": brandAccentColor,
                          } as React.CSSProperties
                        }
                      >
                        View Group
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Link href="/members/community/groups" className="mt-auto">
              <Button
                variant="default"
                size="sm"
                className="w-full text-white hover:bg-[var(--btn-bg-hover)] transition-colors"
                style={
                  {
                    ...brandButtonStyle,
                    "--btn-bg": brandPrimaryColor,
                    "--btn-bg-hover": brandAccentColor,
                  } as React.CSSProperties
                }
              >
                View All Groups
              </Button>
            </Link>
          </div>

          <div
            className="rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
            style={{ backgroundColor: brandBackgroundColor }}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Featured Content</h3>
            </div>

            <div className="flex flex-col gap-3">
              {featuredContent.length > 0 ? (
                featuredContent.map((item) => (
                  <Link
                    key={item.id}
                    href={`/members/education?content=${item.slug}`}
                    className="rounded-xl bg-white border border-slate-100 p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                      <Image
                        src={item.image_url || "/placeholder.svg?height=64&width=64&query=content"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="font-medium text-sm text-slate-900 truncate">{item.title}</span>
                      <span className="text-xs text-slate-500 line-clamp-2">{item.description}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-slate-500 text-center py-4">No featured content available</div>
              )}
            </div>

            <Link href="/members/education" className="mt-auto">
              <Button
                variant="default"
                className="text-white hover:bg-[var(--btn-bg-hover)] transition-colors"
                style={
                  {
                    ...brandButtonStyle,
                    "--btn-bg": brandPrimaryColor,
                    "--btn-bg-hover": brandAccentColor,
                  } as React.CSSProperties
                }
              >
                View All Content
              </Button>
            </Link>
          </div>
        </div>

        {featuredExperts.length > 0 && (
          <div className={featuredExperts.length === 2 ? "grid gap-4 sm:grid-cols-2" : ""}>
            {featuredExperts.map((expert) => (
              <div
                key={expert.id}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row gap-5"
              >
                <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={expert.image_url || "/placeholder.svg?height=128&width=128&query=expert"}
                    alt={expert.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Featured Expert
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{expert.name}</h4>
                  {expert.title && <p className="text-sm text-slate-500">{expert.title}</p>}
                  {expert.bio && <p className="text-sm text-slate-600 line-clamp-2">{expert.bio}</p>}
                  {expert.slug && (
                    <Link href={`/members/education?expert=${expert.slug}`} className="mt-auto pt-2">
                      <Button
                        variant="default"
                        className="text-white hover:bg-[var(--btn-bg-hover)] transition-colors"
                        style={
                          {
                            ...brandButtonStyle,
                            "--btn-bg": brandPrimaryColor,
                            "--btn-bg-hover": brandAccentColor,
                          } as React.CSSProperties
                        }
                      >
                        View Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className="rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
          style={{ backgroundColor: brandBackgroundColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Platform Updates</h3>
            </div>
            <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siteUpdates.map((item) => (
              <div key={item.id} className="rounded-xl bg-white border border-slate-100 p-4 flex flex-col gap-1">
                <span className="font-medium text-sm text-slate-900">{item.title}</span>
                <p className="text-sm text-slate-600 line-clamp-3">{item.body}</p>
              </div>
            ))}

            {siteUpdates.length === 0 && <div className="text-sm text-slate-500 col-span-full">No updates yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
