"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AI_MENTOR_CHAT_PREVIEW_SRC,
  AI_MENTOR_LIBRARY_PREVIEW_SRC,
  AI_MENTOR_STUDIO_ICON_SRC,
} from "@/lib/ai-mentors/assets"
import { getAiMentorsPageData } from "./actions"

type ModalType = "library" | null

function EmbedModal({
  title,
  iframeUrl,
  onClose,
}: {
  title: string
  iframeUrl: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative flex w-full max-w-[min(1200px,94vw)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ height: "min(850px, 92vh)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-gray-50">
          <iframe
            src={iframeUrl}
            title={title}
            className="h-full w-full rounded-b-2xl border-0"
            allow="clipboard-write; fullscreen"
          />
        </div>
      </div>
    </div>
  )
}

export default function AiMentorsPage() {
  const [pageTitle, setPageTitle] = useState("AI Mentors")
  const [isCreator, setIsCreator] = useState(false)
  const [configured, setConfigured] = useState(true)
  const [moduleUrl, setModuleUrl] = useState("https://www.aimentormodule.com")
  const [loading, setLoading] = useState(true)
  const [launchLoading, setLaunchLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true)
      const data = await getAiMentorsPageData()
      setPageTitle(data.pageTitle)
      setIsCreator(data.isCreator)
      setConfigured(data.configured)
      setModuleUrl(data.moduleUrl)
      setLoading(false)
    }

    loadPageData()
  }, [])

  const closeModal = () => {
    setActiveModal(null)
    setIframeUrl(null)
  }

  const adminLoginUrl = `${moduleUrl}/admin/login`

  const handleAccessLibrary = async () => {
    setError(null)

    if (!configured) {
      setError("The AI Mentor Library is not configured yet.")
      return
    }

    setLaunchLoading(true)

    try {
      const response = await fetch("/api/ai-mentors/launch", { method: "POST" })
      const data = (await response.json()) as { launchUrl?: string; error?: string }

      if (!response.ok || !data.launchUrl) {
        if (data.error === "AI Mentor Module is not configured.") {
          setError("The AI Mentor Library is not configured yet.")
        } else if (response.status === 401) {
          setError("We could not open the mentor library. Please sign in and try again.")
        } else {
          setError("We could not open the mentor library. Please try again.")
        }
        return
      }

      setIframeUrl(data.launchUrl)
      setActiveModal("library")
    } catch {
      setError("We could not open the mentor library. Please try again.")
    } finally {
      setLaunchLoading(false)
    }
  }

  const handleManageLibrary = () => {
    window.open(adminLoginUrl, "_blank", "noopener,noreferrer")
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8">
      <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{pageTitle}</h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
                Access guided AI mentor experiences designed to help you get clarity, take action, and move forward
                inside this community.
              </p>
            </div>
            <div className="flex shrink-0 items-center justify-center sm:justify-end">
              <div className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-indigo-100">
                <Image
                  src={AI_MENTOR_STUDIO_ICON_SRC}
                  alt=""
                  width={72}
                  height={72}
                  className="h-16 w-16 sm:h-[72px] sm:w-[72px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!configured && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The AI Mentor Library is not configured yet. Ask your site admin to add the required environment variables.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
        <div className="space-y-5">
          <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Your Mentor Library</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              Open your mentor library to choose from the AI mentors available with your current membership plan. Each
              mentor guides you through a focused experience.
            </p>
            <Button
              type="button"
              onClick={handleAccessLibrary}
              disabled={launchLoading}
              className="mt-6 w-full bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 sm:w-auto"
            >
              {launchLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Library...
                </>
              ) : (
                "Access the Mentor Library"
              )}
            </Button>
          </article>

          {isCreator && (
            <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md">
                <i className="fa-solid fa-shield-halved text-lg" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Mentor Library</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                As a site admin, you can manage mentor cards, categories, plan access, and Mentor Studio embeds from the
                AI Mentor Module admin area. Opens the AI Mentor Module admin in a new secure window.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleManageLibrary}
                className="mt-6 w-full border-gray-300 px-6 py-3 sm:w-auto"
              >
                Manage Mentor Library
              </Button>
            </article>
          )}
        </div>

        <aside className="rounded-2xl border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Preview the Mentor Experience</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
              Members can browse available mentors, open a guided experience, and continue inside a focused chat-style
              flow.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl pb-4">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-md ring-1 ring-black/5">
              <span className="absolute left-4 top-4 z-10 rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-medium text-white shadow-sm">
                Mentor Library
              </span>
              <Image
                src={AI_MENTOR_LIBRARY_PREVIEW_SRC}
                alt="AI mentor library preview"
                width={1400}
                height={900}
                className="h-auto w-full max-h-[300px] object-contain object-top sm:max-h-[340px]"
                priority
              />
            </div>

            <div className="relative -mt-8 ml-5 mr-1 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lg ring-1 ring-black/5 sm:-mt-10 sm:ml-8">
              <span className="absolute left-4 top-4 z-10 rounded-full bg-violet-600/90 px-3 py-1 text-xs font-medium text-white shadow-sm">
                Guided Mentor Chat
              </span>
              <Image
                src={AI_MENTOR_CHAT_PREVIEW_SRC}
                alt="AI mentor guided chat preview"
                width={1400}
                height={900}
                className="h-auto w-full max-h-[260px] object-contain object-top sm:max-h-[300px]"
              />
            </div>
          </div>
        </aside>
      </div>

      {activeModal === "library" && iframeUrl && (
        <EmbedModal title="Mentor Library" iframeUrl={iframeUrl} onClose={closeModal} />
      )}
    </div>
  )
}
