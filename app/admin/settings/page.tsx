"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"
import { updateSiteSettings, getDashboardDropdownData } from "./actions"

/**
 * IMPORTANT: This file is aligned to your actual `site_settings` table schema:
 * - brand_primary_color (text)
 * - brand_accent_color (text)
 * - brand_background_color (text)
 * - brand_logo_url (text)
 * - member_navigation (jsonb NOT NULL default [])
 * - site_title (text)
 * - meta_description (text)
 * - favicon_url (text)
 * - social_image_url (text)
 * - site_domain (text)
 * - upgrade_link (text)
 * - billing_link (text)
 * - created_at (timestamptz)
 * - updated_at (timestamptz)
 * - dashboard_settings (jsonb)
 *
 * The previous version used non-existent columns like:
 * - site_name, logo_url, primary_color, accent_color, meta_title, og_image_url, nav_visibility
 * which caused "schema cache" errors.
 */

interface NavigationItem {
  id: string
  label: string
  visible: boolean
  order: number
  locked?: boolean
}

interface DashboardSettings {
  header_image_url: string
  featured_tools: string[]
  featured_groups: string[]
  featured_content: string[]
  featured_experts: string[]
}

const DEFAULT_NAV_ITEMS: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", visible: true, order: 1, locked: true },
  { id: "course", label: "Course", visible: true, order: 2 },
  { id: "tools", label: "Tools", visible: true, order: 3 },
  { id: "community", label: "Community", visible: true, order: 4 },
  { id: "education", label: "Education", visible: true, order: 5 },
  { id: "support", label: "Support", visible: true, order: 6 },
]

interface SiteSettingsRowFromDb {
  id: number
  brand_primary_color: string | null
  brand_accent_color: string | null
  brand_background_color: string | null
  brand_logo_url: string | null
  member_navigation: unknown[] | null
  site_title: string | null
  meta_description: string | null
  favicon_url: string | null
  social_image_url: string | null
  site_domain: string | null
  upgrade_link: string | null
  billing_link: string | null
  // Add types for new columns
  site_terms_url?: string | null
  site_privacy_url?: string | null
  created_at: string | null
  updated_at: string | null
  dashboard_settings: DashboardSettings | null
}

const SINGLETON_ID = 1

const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  header_image_url: "",
  featured_tools: [],
  featured_groups: [],
  featured_content: [],
  featured_experts: [],
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("branding")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingHeaderImage, setIsUploadingHeaderImage] = useState(false)
  const headerImageInputRef = useRef<HTMLInputElement>(null)

  // Branding state (UI variables; mapped to DB columns on save)
  const [siteName, setSiteName] = useState("My Membership Site") // maps to site_title
  const [logoUrl, setLogoUrl] = useState("") // maps to brand_logo_url
  const [primaryColor, setPrimaryColor] = useState("#3B82F6") // maps to brand_primary_color
  const [accentColor, setAccentColor] = useState("#10B981") // maps to brand_accent_color
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF") // maps to brand_background_color

  // SEO tab state (UI variables; mapped to DB columns on save)
  // siteName input in SEO tab maps to site_title
  const [metaTitle, setMetaTitle] = useState("") // kept only to avoid refactor; NOT saved (site_title is the title)
  const [metaDescription, setMetaDescription] = useState("") // maps to meta_description
  const [faviconUrl, setFaviconUrl] = useState("") // maps to favicon_url
  const [ogImageUrl, setOgImageUrl] = useState("") // maps to social_image_url

  const [siteDomain, setSiteDomain] = useState("")
  const [upgradeLink, setUpgradeLink] = useState("")
  const [billingLink, setBillingLink] = useState("")
  const [siteTermsUrl, setSiteTermsUrl] = useState("")
  const [sitePrivacyUrl, setSitePrivacyUrl] = useState("")

  const [toolOptions, setToolOptions] = useState<{ id: string; name: string }[]>([])
  const [groupOptions, setGroupOptions] = useState<{ id: string; name: string }[]>([])
  const [contentOptions, setContentOptions] = useState<
    { id: string; title: string; content_type: string; image_url: string | null }[]
  >([])
  const [expertOptions, setExpertOptions] = useState<{ id: string; name: string; title: string | null }[]>([])
  const [isLoadingDropdownData, setIsLoadingDropdownData] = useState(false)

  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(DEFAULT_DASHBOARD_SETTINGS)

  const supabase = getSupabaseBrowserClient()

  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_NAV_ITEMS)

  const fetchDropdownData = async () => {
    setIsLoadingDropdownData(true)
    const result = await getDashboardDropdownData()
    if (result.success && result.data) {
      setToolOptions(result.data.tools)
      setGroupOptions(result.data.groups)
      setContentOptions(result.data.contentItems)
      setExpertOptions(result.data.experts)
      // Update dashboard settings from server
      setDashboardSettings((prev) => ({
        ...prev,
        header_image_url: result.data!.dashboardSettings.header_image_url || "",
        featured_tools: result.data!.dashboardSettings.featured_tools || [],
        featured_groups: result.data!.dashboardSettings.featured_groups || [],
        featured_content: result.data!.dashboardSettings.featured_content || [],
        featured_experts: result.data!.dashboardSettings.featured_experts || [],
      }))
    }
    setIsLoadingDropdownData(false)
  }

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true)

      const { data, error } = await supabase.from("site_settings").select("*").eq("id", SINGLETON_ID).single()

      if (error) {
        // If fetch fails, still render UI with defaults
        // (No toast here; avoids spam on initial load if auth/session is warming)
        setIsLoading(false)
        return
      }

      const row = data as SiteSettingsRowFromDb

      // ✅ Correct DB → UI mapping
      setLogoUrl(row.brand_logo_url || "")
      setPrimaryColor(row.brand_primary_color || "#3B82F6")
      setAccentColor(row.brand_accent_color || "#10B981")
      setBackgroundColor(row.brand_background_color || "#FFFFFF")

      setSiteName(row.site_title || "My Membership Site")
      setMetaDescription(row.meta_description || "")
      setFaviconUrl(row.favicon_url || "")
      setOgImageUrl(row.social_image_url || "")

      setSiteDomain(row.site_domain || "")
      setUpgradeLink(row.upgrade_link || "")
      setBillingLink(row.billing_link || "")
      setSiteTermsUrl((row as any).site_terms_url || "")
      setSitePrivacyUrl((row as any).site_privacy_url || "")

      if (row.dashboard_settings) {
        const ds = row.dashboard_settings as any
        setDashboardSettings({
          header_image_url: ds.header_image_url || "",
          featured_tools: Array.isArray(ds.featured_tools) ? ds.featured_tools : [],
          featured_groups: Array.isArray(ds.featured_groups) ? ds.featured_groups : [],
          featured_content: Array.isArray(ds.featured_content) ? ds.featured_content : [],
          featured_experts: Array.isArray(ds.featured_experts) ? ds.featured_experts : [],
        })
      }

      // If empty, invalid, or using old format, seed with defaults
      const mn = row.member_navigation as unknown
      let loadedNavItems: NavigationItem[] = []

      if (Array.isArray(mn) && mn.length > 0) {
        // Check if it's the new format (has id, label, visible, order)
        const isNewFormat = mn.every(
          (item: any) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            typeof item.visible === "boolean" &&
            typeof item.order === "number",
        )

        if (isNewFormat) {
          loadedNavItems = (mn as NavigationItem[]).sort((a, b) => a.order - b.order)
        }
      }

      // If no valid items found, use defaults
      if (loadedNavItems.length === 0) {
        loadedNavItems = DEFAULT_NAV_ITEMS
      }

      setNavItems(loadedNavItems)

      setIsLoading(false)
    }

    fetchSettings()
    fetchDropdownData()
  }, [supabase])

  const showToastNotification = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  /**
   * ✅ BRANDING SAVE
   * Uses server action and correct DB columns.
   */
  const saveBrandingSettings = async () => {
    setIsSaving(true)

    const payload = {
      // ✅ correct columns
      brand_logo_url: logoUrl,
      brand_primary_color: primaryColor,
      brand_accent_color: accentColor,
      brand_background_color: backgroundColor,
    }

    const { success, error } = await updateSiteSettings(payload)

    if (error || !success) {
      showToastNotification(error || "Failed to save branding settings", "error")
    } else {
      showToastNotification("Branding settings saved successfully!")
    }
    setIsSaving(false)
  }

  /**
   * ✅ NAVIGATION SAVE
   * There is no `nav_visibility` column in your table.
   * We store this visibility object inside member_navigation as a typed wrapper.
   */
  const saveNavigationSettings = async () => {
    setIsSaving(true)

    const { success, error } = await updateSiteSettings({
      member_navigation: navItems,
    })

    if (error || !success) {
      showToastNotification(error || "Failed to save navigation settings", "error")
    } else {
      showToastNotification("Navigation settings saved successfully!")
    }
    setIsSaving(false)
  }

  /**
   * ✅ SEO SAVE
   * Uses server action and correct DB columns:
   * - site_title
   * - meta_description
   * - favicon_url
   * - social_image_url
   */
  const saveSeoSettings = async () => {
    setIsSaving(true)

    const { success, error } = await updateSiteSettings({
      site_title: siteName,
      meta_description: metaDescription,
      favicon_url: faviconUrl,
      social_image_url: ogImageUrl,
    })

    if (error || !success) {
      showToastNotification(error || "Failed to save SEO/Social settings", "error")
    } else {
      showToastNotification("SEO/Social settings saved successfully!")
    }
    setIsSaving(false)
  }

  const saveDomainSettings = async () => {
    setIsSaving(true)

    const { success, error } = await updateSiteSettings({
      site_domain: siteDomain,
      upgrade_link: upgradeLink,
      billing_link: billingLink,
      site_terms_url: siteTermsUrl,
      site_privacy_url: sitePrivacyUrl,
    })

    if (!success) {
      showToastNotification(error || "Failed to save domain settings", "error")
    } else {
      showToastNotification("Domain & links saved successfully!")
    }

    setIsSaving(false)
  }

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      showToastNotification("Please upload a JPG, PNG, or WebP image.", "error")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToastNotification("Image must be less than 5MB.", "error")
      return
    }

    setIsUploadingHeaderImage(true)

    try {
      const timestamp = Date.now()
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const fileName = `dashboard/dashboard-header-${timestamp}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("dashboard-assets")
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage.from("dashboard-assets").getPublicUrl(fileName)

      const publicUrl = publicUrlData.publicUrl

      setDashboardSettings((prev) => ({
        ...prev,
        header_image_url: publicUrl,
      }))

      showToastNotification("Header image uploaded successfully!")
    } catch (err: any) {
      showToastNotification(err.message || "Failed to upload image.", "error")
    } finally {
      setIsUploadingHeaderImage(false)
      // Reset file input
      if (headerImageInputRef.current) {
        headerImageInputRef.current.value = ""
      }
    }
  }

  const saveDashboardSettings = async () => {
    setIsSaving(true)

    const { success, error } = await updateSiteSettings({
      dashboard_settings: {
        header_image_url: dashboardSettings.header_image_url || null,
        featured_tools: dashboardSettings.featured_tools,
        featured_groups: dashboardSettings.featured_groups,
        featured_content: dashboardSettings.featured_content,
        featured_experts: dashboardSettings.featured_experts,
      },
    })

    if (!success) {
      showToastNotification(error || "Failed to save dashboard settings", "error")
    } else {
      showToastNotification("Dashboard settings saved successfully!")
    }

    setIsSaving(false)
  }

  const updateNavItemLabel = (itemId: string, newLabel: string) => {
    setNavItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, label: newLabel } : item)))
  }

  const toggleNavItem = (itemId: string) => {
    setNavItems((prev) =>
      prev.map((item) => (item.id === itemId && !item.locked ? { ...item, visible: !item.visible } : item)),
    )
  }

  const moveNavItem = (itemId: string, direction: "up" | "down") => {
    setNavItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const currentIndex = sorted.findIndex((item) => item.id === itemId)

      if (currentIndex === -1) return prev

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

      // Bounds check
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev

      // Don't allow swapping with locked items
      if (sorted[targetIndex].locked || sorted[currentIndex].locked) return prev

      // Swap order values
      const newItems = sorted.map((item, index) => {
        if (index === currentIndex) {
          return { ...item, order: sorted[targetIndex].order }
        }
        if (index === targetIndex) {
          return { ...item, order: sorted[currentIndex].order }
        }
        return item
      })

      // Re-normalize order values to be sequential (1, 2, 3...)
      return newItems.sort((a, b) => a.order - b.order).map((item, index) => ({ ...item, order: index + 1 }))
    })
  }

  const tabs = [
    { id: "branding", label: "Branding", icon: "palette" },
    { id: "navigation", label: "Navigation", icon: "menu" },
    { id: "seo", label: "SEO/Social", icon: "search" },
    { id: "domain", label: "Domain / Links", icon: "link" },
    { id: "dashboard", label: "Dashboard", icon: "layout" },
  ]

  if (isLoading || isLoadingDropdownData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  // Helper functions to check availability for select options
  const getAvailableTools = (currentIndex: number) => {
    const selectedTools = dashboardSettings.featured_tools.filter((_, index) => index !== currentIndex)
    return toolOptions.filter((tool) => !selectedTools.includes(tool.id))
  }

  const getAvailableGroups = (currentIndex: number) => {
    const selectedGroups = dashboardSettings.featured_groups.filter((_, index) => index !== currentIndex)
    return groupOptions.filter((group) => !selectedGroups.includes(group.id))
  }

  // Helper function to get available content items
  const getAvailableContent = (currentIndex: number) => {
    const selectedContent = dashboardSettings.featured_content.filter((_, index) => index !== currentIndex)
    return contentOptions.filter((content) => !selectedContent.includes(content.id))
  }

  const getAvailableExperts = (currentIndex: number) => {
    const selectedExperts = dashboardSettings.featured_experts.filter((_, index) => index !== currentIndex)
    return expertOptions.filter((expert) => !selectedExperts.includes(expert.id))
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
          <p className="text-gray-600">Customize your platform's appearance, behavior, and brand elements.</p>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 whitespace-nowrap focus:outline-none focus:text-blue-800 focus:border-blue-800"
                      : "py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap focus:outline-none focus:text-gray-700 focus:border-gray-300"
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div>
          {activeTab === "branding" && (
            <div role="tabpanel" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Color Palette</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-1">
                          Primary Color
                        </label>
                        <p className="text-xs text-gray-500">Used for buttons, links, key accents</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="primary-color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={primaryColor.toUpperCase()}
                          onChange={(e) => {
                            const hex = e.target.value
                            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                              setPrimaryColor(hex)
                            }
                          }}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label htmlFor="accent-color" className="block text-sm font-medium text-gray-700 mb-1">
                          Accent Color
                        </label>
                        <p className="text-xs text-gray-500">Secondary color for highlights and emphasis</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="accent-color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={accentColor.toUpperCase()}
                          onChange={(e) => {
                            const hex = e.target.value
                            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                              setAccentColor(hex)
                            }
                          }}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label htmlFor="background-color" className="block text-sm font-medium text-gray-700 mb-1">
                          Background Color
                        </label>
                        <p className="text-xs text-gray-500">Main background color for the site</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          id="background-color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={backgroundColor.toUpperCase()}
                          onChange={(e) => {
                            const hex = e.target.value
                            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                              setBackgroundColor(hex)
                            }
                          }}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3">Color Preview</p>
                    <div className="flex space-x-3">
                      <div
                        className="w-16 h-8 rounded-lg border border-gray-200"
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                      <div
                        className="w-16 h-8 rounded-lg border border-gray-200"
                        style={{ backgroundColor: accentColor }}
                      ></div>
                      <div
                        className="w-16 h-8 rounded-lg border border-gray-200"
                        style={{ backgroundColor: backgroundColor }}
                      ></div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Brand Logo</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="logo-url" className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Logo URL
                      </label>
                      <input
                        type="url"
                        id="logo-url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Used as the site's primary logo throughout the platform.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed">
                        <div className="flex items-center text-gray-400">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          <span>Upload logo file...</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Logo upload will be available in a future update.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Logo Preview</p>
                      <div className="w-full max-h-14 flex items-center">
                        {logoUrl ? (
                          <img
                            src={logoUrl || "/placeholder.svg"}
                            alt="Brand logo preview"
                            className="max-w-[200px] max-h-14 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-32 h-14 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 ${logoUrl ? "hidden" : ""}`}
                        >
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={saveBrandingSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Branding Settings"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "navigation" && (
            <div role="tabpanel" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Side Menu Labels</h3>
                  <div className="space-y-6">
                    {[...navItems]
                      .sort((a, b) => a.order - b.order)
                      .map((item, index, sortedArray) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                          <div className="flex flex-col gap-1 pt-7">
                            <button
                              type="button"
                              onClick={() => moveNavItem(item.id, "up")}
                              disabled={item.locked || index === 0 || sortedArray[index - 1]?.locked}
                              className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              ↑ Up
                            </button>
                            <button
                              type="button"
                              onClick={() => moveNavItem(item.id, "down")}
                              disabled={item.locked || index === sortedArray.length - 1}
                              className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              ↓ Down
                            </button>
                          </div>
                          <div className="flex-1">
                            <label htmlFor={`nav-${item.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              {item.id.charAt(0).toUpperCase() + item.id.slice(1)} Label
                            </label>
                            <input
                              type="text"
                              id={`nav-${item.id}`}
                              value={item.label}
                              onChange={(e) => updateNavItemLabel(item.id, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex flex-col items-end pt-7">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600">Visible in member sidebar</span>
                              <button
                                type="button"
                                onClick={() => toggleNavItem(item.id)}
                                disabled={item.locked}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  item.locked
                                    ? "bg-blue-400 cursor-not-allowed opacity-60"
                                    : item.visible
                                      ? "bg-blue-600"
                                      : "bg-gray-300"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    item.visible ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                            {item.locked && <p className="text-xs text-gray-500 mt-1">Dashboard is always visible</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    These labels update the left sidebar menu shown to members.
                  </p>
                </section>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={saveNavigationSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Navigation Settings"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div role="tabpanel" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">SEO & Social Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="site-title" className="block text-sm font-medium text-gray-700 mb-2">
                        Site Title
                      </label>
                      <input
                        type="text"
                        id="site-title"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="MRR Platform — Build, Launch, Grow"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="meta-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        id="meta-description"
                        rows={3}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Enter a compelling description of your platform..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      ></textarea>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">Aim for 140–160 characters.</p>
                        <span
                          className={metaDescription.length > 160 ? "text-sm text-red-500" : "text-sm text-gray-500"}
                        >
                          {metaDescription.length} characters
                        </span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="favicon-url" className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon URL
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="url"
                          id="favicon-url"
                          value={faviconUrl}
                          onChange={(e) => setFaviconUrl(e.target.value)}
                          placeholder="https://example.com/favicon.png"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="w-8 h-8 bg-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {faviconUrl ? (
                            <img
                              src={faviconUrl || "/placeholder.svg"}
                              alt="Favicon"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="og-image-url" className="block text-sm font-medium text-gray-700 mb-2">
                        Social Media Preview Image URL
                      </label>
                      <input
                        type="url"
                        id="og-image-url"
                        value={ogImageUrl}
                        onChange={(e) => setOgImageUrl(e.target.value)}
                        placeholder="https://example.com/social-image.jpg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="mt-4 w-full max-w-md h-32 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {ogImageUrl ? (
                          <img
                            src={ogImageUrl || "/placeholder.svg"}
                            alt="Social Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={saveSeoSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save SEO/Social Settings"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "domain" && (
            <div role="tabpanel" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Domain & Links Configuration</h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="site-domain" className="block text-sm font-medium text-gray-700 mb-2">
                        Site Domain
                      </label>
                      <input
                        type="url"
                        id="site-domain"
                        value={siteDomain}
                        onChange={(e) => setSiteDomain(e.target.value)}
                        placeholder="https://yourdomain.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-gray-500">Primary domain where this platform is hosted.</p>
                    </div>

                    <div>
                      <label htmlFor="upgrade-link" className="block text-sm font-medium text-gray-700 mb-2">
                        Upgrade Link
                      </label>
                      <input
                        type="url"
                        id="upgrade-link"
                        value={upgradeLink}
                        onChange={(e) => setUpgradeLink(e.target.value)}
                        placeholder="https://yourdomain.com/upgrade"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-gray-500">Used for upgrade prompts inside the app.</p>
                    </div>

                    <div>
                      <label htmlFor="billing-link" className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Link
                      </label>
                      <input
                        type="url"
                        id="billing-link"
                        value={billingLink}
                        onChange={(e) => setBillingLink(e.target.value)}
                        placeholder="https://yourdomain.com/billing"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-gray-500">Used for billing and subscription management links.</p>
                    </div>

                    <div>
                      <label htmlFor="site-terms-url" className="block text-sm font-medium text-gray-700 mb-2">
                        Terms of Service URL
                      </label>
                      <input
                        type="url"
                        id="site-terms-url"
                        value={siteTermsUrl}
                        onChange={(e) => setSiteTermsUrl(e.target.value)}
                        placeholder="https://example.com/terms"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-gray-500">Link to your Terms of Service page.</p>
                    </div>

                    <div>
                      <label htmlFor="site-privacy-url" className="block text-sm font-medium text-gray-700 mb-2">
                        Privacy Policy URL
                      </label>
                      <input
                        type="url"
                        id="site-privacy-url"
                        value={sitePrivacyUrl}
                        onChange={(e) => setSitePrivacyUrl(e.target.value)}
                        placeholder="https://example.com/privacy"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-2 text-sm text-gray-500">Link to your Privacy Policy page.</p>
                    </div>
                  </div>
                </section>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={saveDomainSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Domain & Links"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <div role="tabpanel" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-8">
                {/* Section 1: Dashboard Header Image */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Dashboard Header</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">This image appears at the top of the member dashboard.</p>
                    <div className="w-full h-[140px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {dashboardSettings.header_image_url ? (
                        <img
                          src={dashboardSettings.header_image_url || "/placeholder.svg"}
                          alt="Dashboard header preview"
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <div
                        className={`flex flex-col items-center justify-center text-gray-400 ${dashboardSettings.header_image_url ? "hidden" : ""}`}
                      >
                        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">Dashboard header preview (recommended: wide image)</span>
                      </div>
                    </div>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={headerImageInputRef}
                      onChange={handleHeaderImageUpload}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                    />
                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => headerImageInputRef.current?.click()}
                      disabled={isUploadingHeaderImage}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingHeaderImage ? "Uploading..." : "Upload image"}
                    </button>
                  </div>
                </section>

                <section className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Site Tools</h3>
                  <p className="text-sm text-gray-500 mb-6">Choose up to three tools to highlight on the dashboard.</p>
                  {isLoadingDropdownData ? (
                    <div className="text-gray-500 text-sm">Loading tools...</div>
                  ) : (
                    <div className="space-y-4">
                      {[0, 1, 2].map((index) => {
                        const availableTools = getAvailableTools(index)
                        const currentValue = dashboardSettings.featured_tools[index] || ""
                        // Include current selection in available options if it exists
                        const currentTool = toolOptions.find((t) => t.id === currentValue)
                        const options =
                          currentTool && !availableTools.find((t) => t.id === currentValue)
                            ? [currentTool, ...availableTools]
                            : availableTools

                        return (
                          <div key={index}>
                            <label
                              htmlFor={`tool-slot-${index}`}
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Tool Slot {index + 1}
                            </label>
                            <select
                              id={`tool-slot-${index}`}
                              value={currentValue}
                              onChange={(e) => {
                                const newTools = [...dashboardSettings.featured_tools]
                                // Ensure array has enough slots
                                while (newTools.length <= index) {
                                  newTools.push("")
                                }
                                newTools[index] = e.target.value
                                setDashboardSettings((prev) => ({
                                  ...prev,
                                  featured_tools: newTools,
                                }))
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                              <option value="">Select a tool…</option>
                              {options.map((tool) => (
                                <option key={tool.id} value={tool.id}>
                                  {tool.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <p className="mt-4 text-sm text-gray-500">
                    These tools appear in the Featured Tools section on the dashboard.
                  </p>
                </section>

                <section className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Groups</h3>
                  <p className="text-sm text-gray-500 mb-6">Highlight important or curated community groups.</p>
                  {isLoadingDropdownData ? (
                    <div className="text-gray-500 text-sm">Loading groups...</div>
                  ) : (
                    <div className="space-y-4">
                      {[0, 1, 2].map((index) => {
                        const availableGroups = getAvailableGroups(index)
                        const currentValue = dashboardSettings.featured_groups[index] || ""
                        // Include current selection in available options if it exists
                        const currentGroup = groupOptions.find((g) => g.id === currentValue)
                        const options =
                          currentGroup && !availableGroups.find((g) => g.id === currentValue)
                            ? [currentGroup, ...availableGroups]
                            : availableGroups

                        return (
                          <div key={index}>
                            <label
                              htmlFor={`group-slot-${index}`}
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Group Slot {index + 1}
                            </label>
                            <select
                              id={`group-slot-${index}`}
                              value={currentValue}
                              onChange={(e) => {
                                const newGroups = [...dashboardSettings.featured_groups]
                                // Ensure array has enough slots
                                while (newGroups.length <= index) {
                                  newGroups.push("")
                                }
                                newGroups[index] = e.target.value
                                setDashboardSettings((prev) => ({
                                  ...prev,
                                  featured_groups: newGroups,
                                }))
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                              <option value="">Select a group…</option>
                              {options.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <p className="mt-4 text-sm text-gray-500">Featured groups are promoted on the dashboard.</p>
                </section>

                {/* Featured Content Section */}
                <section className="pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Content</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select up to 3 content items to feature on the dashboard.
                  </p>
                  <div className="space-y-3">
                    {[0, 1, 2].map((index) => {
                      const selectedId = dashboardSettings.featured_content[index] || ""
                      const selectedContent = contentOptions.find((c) => c.id === selectedId)
                      const availableOptions = getAvailableContent(index)

                      return (
                        <div key={index} className="flex items-center gap-3">
                          {selectedContent?.image_url && (
                            <img
                              src={selectedContent.image_url || "/placeholder.svg"}
                              alt=""
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <select
                            value={selectedId}
                            onChange={(e) => {
                              const newValue = e.target.value
                              setDashboardSettings((prev) => {
                                const newContent = [...prev.featured_content]
                                if (newValue) {
                                  newContent[index] = newValue
                                } else {
                                  newContent.splice(index, 1)
                                }
                                return { ...prev, featured_content: newContent.filter(Boolean) }
                              })
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="">Select content…</option>
                            {availableOptions.map((content) => (
                              <option key={content.id} value={content.id}>
                                {content.title} ({content.content_type})
                              </option>
                            ))}
                            {selectedContent && !availableOptions.find((c) => c.id === selectedId) && (
                              <option value={selectedId}>
                                {selectedContent.title} ({selectedContent.content_type})
                              </option>
                            )}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    These appear in the Featured Content section on the member dashboard.
                  </p>
                </section>

                {/* Section 5: Featured Expert */}
                <section className="pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Experts</h3>
                  <p className="text-sm text-gray-500 mb-4">Select up to two featured experts.</p>
                  <div className="space-y-3">
                    {[0, 1].map((index) => {
                      const selectedId = dashboardSettings.featured_experts[index] || ""
                      const selectedExpert = expertOptions.find((e) => e.id === selectedId)
                      const availableOptions = getAvailableExperts(index)

                      return (
                        <div key={index} className="flex items-center gap-3">
                          <select
                            value={selectedId}
                            onChange={(e) => {
                              const newValue = e.target.value
                              setDashboardSettings((prev) => {
                                const newExperts = [...prev.featured_experts]
                                if (newValue) {
                                  newExperts[index] = newValue
                                } else {
                                  newExperts.splice(index, 1)
                                }
                                return { ...prev, featured_experts: newExperts.filter(Boolean) }
                              })
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          >
                            <option value="">Select an expert…</option>
                            {availableOptions.map((expert) => (
                              <option key={expert.id} value={expert.id}>
                                {expert.name}
                                {expert.title ? ` — ${expert.title}` : ""}
                              </option>
                            ))}
                            {selectedExpert && !availableOptions.find((e) => e.id === selectedId) && (
                              <option value={selectedId}>
                                {selectedExpert.name}
                                {selectedExpert.title ? ` — ${selectedExpert.title}` : ""}
                              </option>
                            )}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={saveDashboardSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Dashboard Settings"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`${toastType === "success" ? "bg-green-500" : "bg-red-500"} text-white px-6 py-3 rounded-lg shadow-lg`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {toastType === "success" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              <span>{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
