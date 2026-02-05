"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesPageForm } from "./sales-page-form"

export default function AdminSalesPagesPage() {
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
            <SalesPageForm pageType="main" />
          </TabsContent>
          <TabsContent value="founders" className="mt-6">
            <SalesPageForm pageType="founders" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
