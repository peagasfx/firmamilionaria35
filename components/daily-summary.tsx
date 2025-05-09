"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatCurrency } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { DollarSign, TrendingUp } from "lucide-react"

// This would typically come from your API/database
const mockDailySummary = {
  today: {
    date: new Date(),
    totalAmount: 44500, // in cents
    completedTransactions: 3,
    pendingTransactions: 1,
  },
  // More historical data would be here
}

export default function DailySummary() {
  const isMobile = useIsMobile()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [summary] = useState(mockDailySummary)

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        {isMobile && <SidebarTrigger className="mr-2" />}
        <h1 className="text-2xl font-bold">Total do Dia</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selecione a Data</CardTitle>
            <CardDescription>Visualize o total de pagamentos por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Recebido</CardTitle>
              <CardDescription>
                {date?.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-10 w-10 text-green-500" />
                <div className="text-3xl font-bold">{formatCurrency(summary.today.totalAmount / 100)}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transações Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.today.completedTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.today.pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Resumo do Dia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de transações:</span>
                  <span className="font-medium">
                    {summary.today.completedTransactions + summary.today.pendingTransactions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de conclusão:</span>
                  <span className="font-medium">
                    {Math.round(
                      (summary.today.completedTransactions /
                        (summary.today.completedTransactions + summary.today.pendingTransactions)) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor médio:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      summary.today.totalAmount /
                        (summary.today.completedTransactions + summary.today.pendingTransactions) /
                        100,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
