import { getPublicSalesPageWithPlans } from "@/lib/sales-pages/getPublicSalesPage"
import { AdminSalesPagesClient } from "./admin-sales-pages-client"

export default async function AdminSalesPagesPage() {
  const { salesPage, orderedPlans } = await getPublicSalesPageWithPlans()
  return <AdminSalesPagesClient salesPage={salesPage} orderedPlans={orderedPlans} />
}
