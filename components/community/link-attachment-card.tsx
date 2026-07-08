type LinkAttachmentCardProps = {
  url: string
  className?: string
}

export function LinkAttachmentCard({ url, className = "" }: LinkAttachmentCardProps) {
  return (
    <div
      className={`flex min-w-0 max-w-full items-start gap-3 overflow-hidden rounded-lg bg-gray-50 p-3 ${className}`.trim()}
    >
      <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded bg-blue-100">
        <i className="fa-solid fa-link text-blue-600" aria-hidden="true" />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 break-all whitespace-normal text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
      >
        {url}
      </a>
    </div>
  )
}
