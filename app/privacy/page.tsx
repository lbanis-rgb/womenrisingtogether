import Image from "next/image"

export default function PrivacyPage() {
  const logoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || "/placeholder-logo.png"

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src={logoUrl || "/placeholder.svg"} alt="Logo" width={200} height={60} className="h-auto max-w-[200px]" />
        </div>

        {/* Privacy Policy Updated Date - LEFT justified */}
        <div className="mb-6">
          <p className="text-left font-bold">Privacy Policy Updated: January 1, 2025</p>
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-4 text-foreground">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>

          <p className="text-muted-foreground">[Placeholder content - Replace with actual privacy policy]</p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">3. Data Sharing and Disclosure</h2>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
              rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
              explicabo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">4. Data Security</h2>
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
              dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">5. Your Rights</h2>
            <p>
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia
              non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
            <p>
              Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid
              ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam
              nihil molestiae consequatur.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
