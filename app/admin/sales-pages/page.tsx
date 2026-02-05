import { getAdminSalesPagesWithPlans } from "@/lib/sales-pages/getPublicSalesPage"
import { AdminSalesPagesClient } from "./admin-sales-pages-client"

export default async function AdminSalesPagesPage() {
  const { mainSalesPage, foundersSalesPage, orderedPlans } = await getAdminSalesPagesWithPlans()
  return (
    <AdminSalesPagesClient
      mainSalesPage={mainSalesPage}
      foundersSalesPage={foundersSalesPage}
      orderedPlans={orderedPlans}
    />
  )
}
