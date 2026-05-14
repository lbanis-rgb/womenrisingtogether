export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { Fragment, type ReactNode } from "react"
import { notFound } from "next/navigation"
import { getOptInPageBySlug } from "../actions"

const URL_IN_LINE =
  /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi

function hrefForUrlMatch(raw: string): string {
  const trimmed = raw.replace(/[.,;:!?)]+$/, "")
  if (trimmed.toLowerCase().startsWith("www.")) return `https://${trimmed}`
  return trimmed
}

function renderLineWithLinks(line: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = new RegExp(URL_IN_LINE.source, URL_IN_LINE.flags)
  let lastIndex = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(line)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(
        <Fragment key={`${keyPrefix}-t-${k++}`}>
          {line.slice(lastIndex, m.index)}
        </Fragment>,
      )
    }
    const raw = m[0]
    const href = hrefForUrlMatch(raw)
    nodes.push(
      <a
        key={`${keyPrefix}-a-${k++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-slate-800 underline decoration-slate-500 underline-offset-2 hover:text-slate-950 hover:decoration-slate-700"
      >
        {raw}
      </a>,
    )
    lastIndex = m.index + raw.length
  }
  if (lastIndex < line.length) {
    nodes.push(
      <Fragment key={`${keyPrefix}-t-${k++}`}>
        {line.slice(lastIndex)}
      </Fragment>,
    )
  }
  return nodes
}

function renderMessageWithLinks(message: string): ReactNode {
  const lines = message.split(/\n/)
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? <br /> : null}
      {renderLineWithLinks(line, `ln-${i}`)}
    </Fragment>
  ))
}

export default async function OptInConfirmPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const optInPage = await getOptInPageBySlug(slug)
  if (!optInPage) notFound()

  const brandLogoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL

  const message =
    (optInPage.confirmation_message as string | null) ||
    "Thank you for registering. Check your email to confirm your account."

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 sm:p-10 text-center">
        {brandLogoUrl && (
          <div className="flex justify-center mb-6">
            <img
              src={brandLogoUrl}
              alt="Brand Logo"
              className="h-10 w-auto max-w-[140px] object-contain"
            />
          </div>
        )}

        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          You&apos;re Almost Done
        </h1>

        <div className="mt-5 text-slate-600 text-base leading-7 text-center whitespace-pre-wrap">
          {renderMessageWithLinks(message)}
        </div>

        <a
          href="/login"
          className="mt-8 inline-block w-full rounded-xl bg-black text-white py-2.5 font-medium hover:opacity-90 transition"
        >
          Log In
        </a>
      </div>
    </div>
  )
}
