import { Suspense } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import DailySummary from "@/components/daily-summary"

export default function DailyPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1">
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <DailySummary />
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  )
}
