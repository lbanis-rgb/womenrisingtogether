"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesPageForm } from "./sales-page-form"
import type { ActivePlanForSalesPage, SalesPageRow } from "./sales-page-actions"

export function AdminSalesPagesClient({
  mainSalesPage,
  foundersSalesPage,
  orderedPlans = [],
}: {
  mainSalesPage: SalesPageRow | null
  foundersSalesPage: SalesPageRow | null
  orderedPlans?: ActivePlanForSalesPage[]
}) {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Pages</h1>
        </div>

        <Tabs defaultValue="main" className="w-full">
          <TabsList>
            <TabsTrigger value="main">Main Sales Page</TabsTrigger>
            <TabsTrigger value="founders">Founders Sales Page</TabsTrigger>
          </TabsList>
          <TabsContent value="main" className="mt-6">
            <SalesPageForm pageType="main" salesPage={mainSalesPage} orderedPlans={orderedPlans} />
          </TabsContent>
          <TabsContent value="founders" className="mt-6">
            <SalesPageForm pageType="founders" salesPage={foundersSalesPage} orderedPlans={orderedPlans} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
