"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

// This would typically come from your API/database
const mockTransactions = [
  {
    id: "tx_123456",
    amount: 15000,
    status: "completed",
    createdAt: "2023-05-06T14:30:00Z",
    paidAt: "2023-05-06T14:32:15Z",
  },
  {
    id: "tx_123457",
    amount: 7500,
    status: "pending",
    createdAt: "2023-05-06T15:45:00Z",
    paidAt: null,
  },
  {
    id: "tx_123458",
    amount: 22000,
    status: "completed",
    createdAt: "2023-05-06T16:20:00Z",
    paidAt: "2023-05-06T16:25:30Z",
  },
  {
    id: "tx_123459",
    amount: 5000,
    status: "expired",
    createdAt: "2023-05-05T10:15:00Z",
    paidAt: null,
  },
  {
    id: "tx_123460",
    amount: 12500,
    status: "completed",
    createdAt: "2023-05-05T11:30:00Z",
    paidAt: "2023-05-05T11:35:45Z",
  },
]

export default function TransactionHistory() {
  const isMobile = useIsMobile()
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("pixTransactions") || "[]")
    setTransactions(storedTransactions)
  }, [])

  const getStatusIcon = (status: string) => {
    if (status === "completed") {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }

    return <Clock className="h-5 w-5 text-yellow-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        {isMobile && <SidebarTrigger className="mr-2" />}
        <h1 className="text-2xl font-bold">Histórico de PIX</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>Histórico de pagamentos PIX gerados e pagos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">ID</th>
                  <th className="text-left py-3 px-2">Data</th>
                  <th className="text-left py-3 px-2">Valor</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Pago em</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter((tx) => tx.status === "completed" || tx.status === "pending")
                  .map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm">{tx.id}</td>
                      <td className="py-3 px-2">{formatDate(tx.createdAt)}</td>
                      <td className="py-3 px-2">{formatCurrency(tx.amount / 100)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <span className="capitalize">
                            {tx.status === "completed" ? "Pago" : "Gerado"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">{tx.paidAt ? formatDate(tx.paidAt) : "-"}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}