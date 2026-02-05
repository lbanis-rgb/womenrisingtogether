"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, MoreVertical, Pencil, Eye, Trash2, X, Check, ChevronRight, Clipboard } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser"
import {
  createPlan as createPlanAction,
  updatePlan as updatePlanAction,
  togglePlanActive,
  duplicatePlan as duplicatePlanAction,
  deletePlan as deletePlanAction,
  getPlanPermissions,
  togglePlanPermission,
} from "./actions"
import { Checkbox } from "@/components/ui/checkbox"

interface Plan {
  id: string
  name: string
  slug: string
  description: string
  is_free: boolean
  price: number
  currency: string
  billing: string
  most_popular: boolean
  active: boolean
  sort_order: number
  features: string[]
  payment_url?: string | null
  return_url?: string | null
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [siteDomain, setSiteDomain] = useState<string | null>(null)

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [nextPlanId, setNextPlanId] = useState(5)
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [showEditPlanModal, setShowEditPlanModal] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewPlan, setPreviewPlan] = useState<Plan | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Action menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Form state
  const [planName, setPlanName] = useState("")
  const [planSlug, setPlanSlug] = useState("")
  const [slugUserModified, setSlugUserModified] = useState(false)
  const [planDescription, setPlanDescription] = useState("")
  const [isFree, setIsFree] = useState(false)
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [billing, setBilling] = useState("Monthly")
  const [paymentUrl, setPaymentUrl] = useState("")
  const [features, setFeatures] = useState([""])
  const [mostPopular, setMostPopular] = useState(false)
  const [active, setActive] = useState(true)

  const [planPermissions, setPlanPermissions] = useState<Record<string, boolean>>({})
  const [loadingPermissions, setLoadingPermissions] = useState(false)

  const PERMISSIONS = [
    {
      key: "directory_listing",
      label: "Directory Listing",
      description: "Allow members to appear in the public directory",
    },
    {
      key: "create_groups",
      label: "Create Groups",
      description: "Create and manage private or public groups",
    },
    {
      key: "create_events",
      label: "Create Events",
      description: "Create and host community events",
    },
    {
      key: "offer_content",
      label: "Offer Content",
      description: "Publish posts, videos, or courses",
    },
    {
      key: "offer_services",
      label: "Offer Services",
      description: "Sell 1:1 or group services",
    },
    {
      key: "offer_products",
      label: "Offer Products",
      description: "Sell digital or physical products",
    },
  ]

  const fetchPlans = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      console.error("Supabase client not available")
      setError("Database connection unavailable")
      setIsLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from("plans")
      .select(
        "id, name, slug, description, is_free, price, currency, billing, most_popular, active, sort_order, features, payment_url, return_url",
      )
      .order("sort_order", { ascending: true })

    if (fetchError) {
      console.error("Error fetching plans:", fetchError)
      setError("Failed to load plans")
      setIsLoading(false)
      return
    }

    setPlans(data ?? [])
    setIsLoading(false)
  }

  // Fetch site domain once
  const fetchSiteDomain = async () => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return

    const { data, error } = await supabase.from("site_settings").select("site_domain").eq("id", 1).single()

    if (!error && data) {
      setSiteDomain(data.site_domain)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchSiteDomain()
  }, [])

  // Outside click for action menus
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (openMenuId == null) return
      const ref = menuRefs.current[openMenuId]
      const target = e.target as Node
      if (ref && !ref.contains(target)) setOpenMenuId(null)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [openMenuId])

  // Generate slug from name
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

  const handleNameChange = (value: string) => {
    setPlanName(value)
    if (!slugUserModified) setPlanSlug(generateSlug(value))
  }
  const handleSlugChange = (value: string) => {
    setSlugUserModified(true)
    setPlanSlug(generateSlug(value))
  }

  const addFeature = () => setFeatures([...features, ""])
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index))
  const updateFeature = (index: number, value: string) => {
    const f = [...features]
    f[index] = value
    setFeatures(f)
  }

  const resetForm = () => {
    setPlanName("")
    setPlanSlug("")
    setSlugUserModified(false)
    setPlanDescription("")
    setIsFree(false)
    setPrice("")
    setCurrency("USD")
    setBilling("Monthly")
    setPaymentUrl("")
    setFeatures([""])
    setMostPopular(false)
    setActive(true)
    setEditingPlanId(null)
    setFormError(null) // Ensure form errors are cleared on reset
    setPlanPermissions({}) // Clear permissions on reset
  }

  const validateForm = () => {
    if (!planName || !planSlug) {
      alert("Plan name and slug are required.")
      return false
    }
    if (!isFree) {
      if (!price || Number.parseFloat(price) <= 0) {
        alert("Price must be greater than 0 for paid plans.")
        return false
      }
      if (!paymentUrl) {
        alert("Payment URL is required for paid plans.")
        return false
      }
      try {
        new URL(paymentUrl)
      } catch {
        alert("Please enter a valid payment URL.")
        return false
      }
    }
    return true
  }

  const displayToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000) // Increased duration to 3 seconds
  }

  const copyRedirectUrl = (planId: string) => {
    if (!siteDomain) {
      displayToast("Site domain not configured")
      return
    }

    const redirectUrl = `https://${siteDomain}/reg?pid=${planId}`
    navigator.clipboard.writeText(redirectUrl)
    displayToast("Redirect URL copied")
  }

  // CRUD-ish helpers (non-functional for now, keeping for UI)
  const createPlan = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setFormError(null)

    // Calculate next sort_order (append to end)
    const maxSortOrder = plans.length > 0 ? Math.max(...plans.map((p) => p.sort_order)) : 0
    const nextSortOrder = maxSortOrder + 1

    // Filter out empty features
    const filteredFeatures = features.filter((f) => f.trim() !== "")

    const payload = {
      name: planName.trim(),
      slug: planSlug.trim(),
      description: planDescription.trim(),
      is_free: isFree,
      price: isFree ? 0 : Number.parseFloat(price) || 0,
      currency: currency,
      billing: billing,
      features: filteredFeatures,
      most_popular: false,
      active: true,
      sort_order: nextSortOrder,
      payment_url: paymentUrl,
    }

    const result = await createPlanAction(payload)

    if (!result.success) {
      console.error("Error creating plan:", result.error)
      setFormError(result.error || "Failed to create plan. Please try again.")
      setIsSubmitting(false)
      return
    }

    // Refresh plans list
    await fetchPlans()

    // Close modal and reset form
    setShowNewPlanModal(false)
    resetForm()
    setFormError(null)
    setIsSubmitting(false)

    // Show success toast
    displayToast("Plan created successfully!")
  }

  const openEditModal = (plan: Plan) => {
    setEditingPlanId(plan.id)
    setPlanName(plan.name)
    setPlanSlug(plan.slug)
    setPlanDescription(plan.description)
    setIsFree(plan.is_free)
    setPrice(plan.price.toString())
    setCurrency(plan.currency)
    setBilling(plan.billing)
    setPaymentUrl(plan.payment_url || "")
    setFeatures(plan.features.length > 0 ? plan.features : [""])
    setMostPopular(plan.most_popular)
    setActive(plan.active)
    setShowEditPlanModal(true)
    setFormError(null)
    loadPlanPermissions(plan.id)
  }

  const updatePlan = async () => {
    if (!validateForm()) return
    if (!editingPlanId) return

    const editingPlan = plans.find((p) => p.id === editingPlanId)
    if (!editingPlan) return

    setIsSubmitting(true)
    setFormError(null)

    const result = await updatePlanAction({
      id: editingPlanId,
      name: planName.trim(),
      slug: planSlug.trim(),
      description: planDescription.trim(),
      is_free: isFree,
      price: isFree ? 0 : Number.parseFloat(price) || 0,
      currency,
      billing: isFree ? "Free" : billing,
      features: features.map((f) => f.trim()).filter(Boolean),
      most_popular: mostPopular,
      active,
      sort_order: editingPlan.sort_order,
      payment_url: paymentUrl,
    })

    setIsSubmitting(false)

    if (!result.success) {
      setFormError(result.error || "Failed to update plan")
      return
    }

    // Refresh plans list
    await fetchPlans()

    setShowEditPlanModal(false)
    resetForm()
    setFormError(null)
    displayToast("Plan updated successfully!")
  }

  const showPreview = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return
    setPreviewPlan(plan)
    setShowPreviewModal(true)
  }

  const toggleActive = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return

    const newActiveState = !plan.active

    // Optimistic update
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, active: newActiveState } : p)))
    setOpenMenuId(null)

    // Call server action
    const result = await togglePlanActive(planId, newActiveState)

    if (!result.success) {
      // Revert on failure
      setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, active: !newActiveState } : p)))
      console.error("Failed to toggle plan active:", result.error)
    }
  }

  const duplicatePlan = async (planId: string) => {
    setOpenMenuId(null)

    const result = await duplicatePlanAction(planId)

    if (!result.success || !result.plan) {
      console.error("Failed to duplicate plan:", result.error)
      displayToast("Failed to duplicate plan")
      return
    }

    // Insert the new plan into local state
    setPlans((prev) => [...prev, result.plan!])
    displayToast("Plan duplicated successfully!")
  }

  const openDeleteModal = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (plan) {
      setPlanToDelete(plan)
      setDeleteError(null)
      setDeleteModalOpen(true)
      setOpenMenuId(null)
    }
  }

  const confirmDeletePlan = async () => {
    if (!planToDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    const result = await deletePlanAction(planToDelete.id)

    if (result.success) {
      // Remove from local state
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id))
      setDeleteModalOpen(false)
      setPlanToDelete(null)
    } else {
      setDeleteError(result.error || "Failed to delete plan")
    }

    setIsDeleting(false)
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setPlanToDelete(null)
    setDeleteError(null)
  }

  const loadPlanPermissions = async (planId: string) => {
    setLoadingPermissions(true)
    const result = await getPlanPermissions(planId)

    if (result.success && result.permissions) {
      // Normalize into lookup object keyed by permission_key
      const permissionsMap: Record<string, boolean> = {}
      result.permissions.forEach((perm) => {
        permissionsMap[perm.permission_key] = perm.enabled
      })
      setPlanPermissions(permissionsMap)
    } else {
      // On error, set all to false
      setPlanPermissions({})
    }

    setLoadingPermissions(false)
  }

  const handlePermissionToggle = async (permissionKey: string, currentValue: boolean) => {
    if (!editingPlanId) return

    const newValue = !currentValue

    // Optimistic update
    setPlanPermissions((prev) => ({
      ...prev,
      [permissionKey]: newValue,
    }))

    // Save to Supabase
    const result = await togglePlanPermission(editingPlanId, permissionKey, newValue)

    if (!result.success) {
      // Revert on error
      setPlanPermissions((prev) => ({
        ...prev,
        [permissionKey]: currentValue,
      }))
      console.error("Failed to toggle permission:", result.error)
    }
  }

  // ESC closes modals
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (showNewPlanModal) setShowNewPlanModal(false)
      if (showEditPlanModal) {
        setShowEditPlanModal(false)
        resetForm()
      }
      if (showPreviewModal) setShowPreviewModal(false)
      if (deleteModalOpen) cancelDelete()
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [showNewPlanModal, showEditPlanModal, showPreviewModal, deleteModalOpen])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
            <p className="text-gray-600 mt-1">Manage your subscription plans and pricing.</p>
          </div>
          <button
            onClick={() => setShowNewPlanModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Plan
          </button>
        </div>

        {/* Plans List */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redirect URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Loading plans...
                    </td>
                  </tr>
                )}
                {!isLoading && (error || plans.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No plans found
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !error &&
                  plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {plan.name}
                            {plan.most_popular && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ml-2">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 whitespace-normal break-words">{plan.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                        {plan.is_free ? "Free" : `$${plan.price}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{plan.billing}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {siteDomain ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Copy URL</span>
                            <button
                              onClick={() => copyRedirectUrl(plan.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              aria-label="Copy redirect URL"
                              title="Copy redirect URL"
                            >
                              <Clipboard className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400" title="Site domain not configured">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {plan.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className="relative inline-block"
                          ref={(el) => {
                            menuRefs.current[plan.id] = el
                          }}
                        >
                          <button
                            onClick={() => setOpenMenuId((prev) => (prev === plan.id ? null : plan.id))}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            aria-label={`Actions for ${plan.name}`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {openMenuId === plan.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                              <button
                                onClick={() => {
                                  openEditModal(plan)
                                  setOpenMenuId(null)
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Pencil className="w-4 h-4 mr-2 text-gray-400" />
                                Edit Plan
                              </button>
                              <button
                                onClick={() => {
                                  showPreview(plan.id)
                                  setOpenMenuId(null)
                                }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4 mr-2 text-gray-400" />
                                Preview
                              </button>
                              <button
                                onClick={() => toggleActive(plan.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Check className="w-4 h-4 mr-2 text-gray-400" />
                                {plan.active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => duplicatePlan(plan.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => openDeleteModal(plan.id)}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2 text-red-400" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => e.target === e.currentTarget && setShowNewPlanModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">New Plan</h2>
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{formError}</div>
              )}

              {/* Plan Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      id="planName"
                      value={planName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown on the sales page.</p>
                  </div>
                  <div>
                    <label htmlFor="planSlug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="planSlug"
                      value={planSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in URLs. Auto-suggest from name; editable.</p>
                  </div>
                  <div>
                    <label htmlFor="planDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="planDescription"
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="freePlan"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="freePlan" className="ml-2 text-sm text-gray-700">
                      Free plan
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              {!isFree && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="planPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          id="planPrice"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="planCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          id="planCurrency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="AUD">AUD</option>
                          <option value="CAD">CAD</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="planBilling" className="block text-sm font-medium text-gray-700 mb-1">
                        Billing
                      </label>
                      <select
                        id="planBilling"
                        value={billing}
                        onChange={(e) => setBilling(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Lifetime">Lifetime</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="paymentUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment URL
                      </label>
                      <input
                        type="url"
                        id="paymentUrl"
                        value={paymentUrl}
                        onChange={(e) => setPaymentUrl(e.target.value)}
                        placeholder="https://checkout.example.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Features */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Features</h3>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2"
                          aria-label="Remove feature"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFeature}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Feature
                </button>
              </div>

              {/* Display Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Display Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="mostPopular" className="text-sm font-medium text-gray-700">
                      Most Popular
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="mostPopular"
                        checked={mostPopular}
                        onChange={(e) => setMostPopular(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="activePlan" className="text-sm font-medium text-gray-700">
                      Active (visible on sales page)
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="activePlan"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={createPlan}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditPlanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => e.target === e.currentTarget && setShowEditPlanModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Plan</h2>
              <button
                onClick={() => {
                  setShowEditPlanModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Plan Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editPlanName" className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      id="editPlanName"
                      value={planName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shown on the sales page.</p>
                  </div>
                  <div>
                    <label htmlFor="editPlanSlug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="editPlanSlug"
                      value={planSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in URLs. Auto-suggest from name; editable.</p>
                  </div>
                  <div>
                    <label htmlFor="editPlanDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="editPlanDescription"
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editFreePlan"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="editFreePlan" className="ml-2 text-sm text-gray-700">
                      Free plan
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              {!isFree && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="editPlanPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <input
                          type="number"
                          id="editPlanPrice"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="editPlanCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          id="editPlanCurrency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="AUD">AUD</option>
                          <option value="CAD">CAD</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="editPlanBilling" className="block text-sm font-medium text-gray-700 mb-1">
                        Billing
                      </label>
                      <select
                        id="editPlanBilling"
                        value={billing}
                        onChange={(e) => setBilling(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Lifetime">Lifetime</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="editPaymentUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment URL
                      </label>
                      <input
                        type="url"
                        id="editPaymentUrl"
                        value={paymentUrl}
                        onChange={(e) => setPaymentUrl(e.target.value)}
                        placeholder="https://checkout.example.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Features */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Features</h3>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2"
                          aria-label="Remove feature"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFeature}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Feature
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Permissions</h3>
                {loadingPermissions ? (
                  <p className="text-sm text-gray-500">Loading permissions...</p>
                ) : (
                  <div className="space-y-4">
                    {PERMISSIONS.map((permission) => {
                      const isEnabled = planPermissions[permission.key] ?? false
                      return (
                        <div key={permission.key} className="flex items-start space-x-3">
                          <Checkbox
                            id={`permission-${permission.key}`}
                            checked={isEnabled}
                            onCheckedChange={() => handlePermissionToggle(permission.key, isEnabled)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`permission-${permission.key}`}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {permission.label}
                            </label>
                            <p className="text-xs text-gray-500 mt-0.5">{permission.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Display Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Display Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="editMostPopular" className="text-sm font-medium text-gray-700">
                      Most Popular
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="editMostPopular"
                        checked={mostPopular}
                        onChange={(e) => setMostPopular(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="editActivePlan" className="text-sm font-medium text-gray-700">
                      Active (visible on sales page)
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="editActivePlan"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditPlanModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updatePlan}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Preview Modal */}
      {showPreviewModal && previewPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => e.target === e.currentTarget && setShowPreviewModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Plan Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm ring-1 ring-black/5">
                {previewPlan.most_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{previewPlan.name}</h3>
                  <p className="text-gray-600 mb-4">{previewPlan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {previewPlan.is_free ? "Free" : `$${previewPlan.price}`}
                    </span>
                    {!previewPlan.is_free && (
                      <span className="text-gray-600 text-sm ml-1">
                        {previewPlan.billing === "Monthly"
                          ? "per month"
                          : previewPlan.billing === "Yearly"
                            ? "per year"
                            : "one-time"}
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {(previewPlan.features.length > 0
                    ? previewPlan.features
                    : ["Access to basic features", "Email support", "Regular updates", "Community access"]
                  ).map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                  Choose {previewPlan.name}
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={cancelDelete} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Plan</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-medium">"{planToDelete.name}"</span>?
            </p>
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              This action is permanent and cannot be undone.
            </p>

            {deleteError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlan}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-transform duration-300 ${
          showToast ? "translate-x-0" : "translate-x-[200%]"
        }`}
      >
        <div className="flex items-center">
          <Check className="w-5 h-5 mr-2" />
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  )
}
