import { Suspense } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import PaymentInterface from "@/components/payment-interface"
import AppSidebar from "@/components/app-sidebar"

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1">
          <Suspense fallback={<div className="p-8">Loading...</div>}>
            <PaymentInterface />
          </Suspense>
        </main>
      </div>
    </SidebarProvider>
  )
}
