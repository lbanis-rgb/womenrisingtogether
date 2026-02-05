"use server"

import { createClient } from "@/lib/supabase/server"
import type { SalesPageRow } from "@/app/admin/sales-pages/sales-page-actions"

/**
 * Load the main public sales page from public_sales_pages (slug = "home").
 * Single source of truth for "/" and admin View Page preview.
 * Server-only; do not call from client.
 */
export async function getPublicSalesPage(): Promise<SalesPageRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("public_sales_pages")
    .select("*")
    .eq("slug", "home")
    .maybeSingle()

  return data as SalesPageRow | null
}
