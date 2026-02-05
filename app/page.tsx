import { getPublicSalesPage } from "@/lib/sales-pages/getPublicSalesPage"
import { MainSalesPage } from "@/components/MainSalesPage"

export default async function HomePage() {
  const salesPage = await getPublicSalesPage()
  return <MainSalesPage salesPage={salesPage} />
}
