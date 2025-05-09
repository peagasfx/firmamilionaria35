import { Suspense } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import TransactionHistory from "@/components/transaction-history"

export default function HistoryPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1">
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <TransactionHistory />
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  )
}
