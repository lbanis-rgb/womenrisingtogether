import { createClient } from "@/lib/supabase/server"
import { MainSalesPage } from "@/components/MainSalesPage"
import type { SalesPageRow } from "@/app/admin/sales-pages/sales-page-actions"

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("public_sales_pages")
    .select("*")
    .eq("slug", "home")
    .maybeSingle()

  const salesPageData: SalesPageRow | null = data as SalesPageRow | null

  return <MainSalesPage data={salesPageData} />
}
