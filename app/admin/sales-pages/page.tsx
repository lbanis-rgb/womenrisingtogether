"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-gray-600">Main Sales Page editor coming soon</p>
            </div>
          </TabsContent>
          <TabsContent value="founders" className="mt-6">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-gray-600">Founders Sales Page editor coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
