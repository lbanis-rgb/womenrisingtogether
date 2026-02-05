import { getPublicSalesPage } from "@/lib/sales-pages/getPublicSalesPage"
import { AdminSalesPagesClient } from "./admin-sales-pages-client"

export default async function AdminSalesPagesPage() {
  const salesPage = await getPublicSalesPage()
  return <AdminSalesPagesClient salesPage={salesPage} />
}
