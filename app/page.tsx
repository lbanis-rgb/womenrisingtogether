import { getPublicSalesPageWithPlans } from "@/lib/sales-pages/getPublicSalesPage"
import { MainSalesPage } from "@/components/MainSalesPage"

export default async function HomePage() {
  const { salesPage, orderedPlans } = await getPublicSalesPageWithPlans()
  return <MainSalesPage salesPage={salesPage} orderedPlans={orderedPlans} />
}
