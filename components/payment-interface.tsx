"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { generatePixPayment} from "@/app/actions/payment"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Copy, Info } from "lucide-react"

export default function PaymentInterface() {
  const [amount, setAmount] = useState("")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [qrcodeImg, setQrcodeImg] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customerData, setCustomerData] = useState<any>(null)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const transactionIdRef = useRef<string | null>(null)

  const { toast } = useToast()
  const isMobile = useIsMobile()

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and one decimal point
    const value = e.target.value.replace(/[^0-9.,]/g, "")

    // Replace comma with dot for decimal
    const normalizedValue = value.replace(",", ".")

    // Ensure only one decimal point
    const parts = normalizedValue.split(".")
    if (parts.length > 2) {
      return
    }

    setAmount(value)
  }

  const saveTransactionToLocalStorage = (transaction: any) => {
    const existing = JSON.parse(localStorage.getItem("pixTransactions") || "[]")
    existing.push(transaction)
    localStorage.setItem("pixTransactions", JSON.stringify(existing))
  }


  const handleCopyPixCode = async () => {
    if (paymentData?.pix.qrcode) {
      try {
        await navigator.clipboard.writeText(paymentData.pix.qrcode)
        toast({
          title: "Código PIX copiado",
          description: "O código PIX foi copiado para a área de transferência",
        })
      } catch (err) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o código PIX automaticamente",
          variant: "destructive",
        })
      }
    }
  }

  const confirmPayment = async (manualCheck = false) => {
    try {
      const res = await fetch(`/api/paymentStatus?transactionId=${transactionIdRef.current}`)
      const result = await res.json()

      if (result.success && ["paid", "approved", "completed"].includes(result.status.toLowerCase())) {
        setPaymentConfirmed(true)

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }

        const existing = JSON.parse(localStorage.getItem("pixTransactions") || "[]")
        const updated = existing.map((tx: any) => {
          if (tx.id === transactionIdRef.current) {
            return {
              ...tx,
              status: "completed",
              paidAt: new Date().toISOString(),
            }
          }
          return tx
        })
        localStorage.setItem("pixTransactions", JSON.stringify(updated))

        toast({
          title: "Pagamento confirmado",
          description: "O pagamento foi confirmado com sucesso!",
          variant: "default",
        })
      } else if (manualCheck) {
        toast({
          title: "Pagamento ainda não confirmado",
          description: result.error || "O pagamento ainda não foi processado ou não foi aprovado.",
          variant: "destructive",
        })
      }
    } catch (error) {
      if (manualCheck) {
        toast({
          title: "Erro ao verificar pagamento",
          description: "Não foi possível consultar o status do pagamento.",
          variant: "destructive",
        })
      }
      console.error("Erro ao confirmar pagamento:", error)
    }
  }

  const resetPayment = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setPaymentData(null)
    setCustomerData(null)
    setPaymentConfirmed(false)
    setAmount("")
  }
  

  const generateQRCode = async () => {
    if (!amount) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor para gerar o PIX.",
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount.replace(",", "."))

    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setCustomerData(null)
    setPaymentConfirmed(false)

    try {
      const result = await generatePixPayment(amountValue)

      if (result.success && result.data) {
        setPaymentData(result.data)

        saveTransactionToLocalStorage({
          id: result.data.id,
          amount: result.data.amount,
          status: "pending",
          createdAt: new Date().toISOString(),
          paidAt: null,
        })
        setQrcodeImg(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    result.data.pix.qrcode
                  )}`)

        // Store customer data for display
        if (result.data.customer) {
          setCustomerData(result.data.customer)
        }

        pollingIntervalRef.current = setInterval(() => {
          confirmPayment(false)
        }, 5000)
        

        toast({
          title: "QR Code gerado com sucesso",
          description: `Valor: ${formatCurrency(amountValue)}`,
        })
      } else {
        setError(result.error || "Ocorreu um erro ao processar sua solicitação.")
        toast({
          title: "Erro ao gerar QR Code",
          description: result.error || "Ocorreu um erro ao processar sua solicitação.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Client-side error:", error)
      setError("Ocorreu um erro ao processar sua solicitação.")
      toast({
        title: "Erro ao gerar QR Code",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (paymentData?.id) {
      transactionIdRef.current = paymentData.id
    }
  }, [paymentData])
  

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        {isMobile && <SidebarTrigger className="mr-2" />}
        <h1 className="text-2xl font-bold">Firma Milionaria</h1>
      </div>

      <Alert className="mb-6" variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>Modo de Demonstração</AlertTitle>
        <AlertDescription>
          O sistema está usando dados fictícios de clientes para demonstração. Em produção, conecte à API de clientes
          para usar dados reais.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {!paymentData ? (
          <Card>
            <CardHeader>
              <CardTitle>Gerar Pagamento PIX</CardTitle>
              <CardDescription>Insira o valor da venda para gerar um QR Code PIX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Valor em Reais (R$)</Label>
                  <Input id="amount" type="text" placeholder="0,00" value={amount} onChange={handleAmountChange} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={generateQRCode} disabled={isLoading}>
                {isLoading ? "Gerando..." : "Gerar QR Code PIX"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>QR Code PIX</CardTitle>
              <CardDescription>Escaneie o código abaixo para realizar o pagamento</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {qrcodeImg ? (
                <div className="bg-white p-4 rounded-lg">
                  <Image
                    src={qrcodeImg || "/placeholder.svg"}
                    alt="QR Code PIX"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg w-[200px] h-[200px] flex items-center justify-center">
                  QR Code não disponível
                </div>
              )}

              <p className="mt-4 text-center font-medium">Valor: {formatCurrency(paymentData.amount / 100)}</p>

              {paymentData.pix.qrcode && (
                <div className="mt-4 w-full">
                  <Label htmlFor="pix-code" className="mb-2 block">
                    Código PIX Copia e Cola:
                  </Label>
                  <div className="flex">
                    <Input id="pix-code" value={paymentData.pix.qrcode} readOnly className="flex-1 text-xs" />
                    <Button variant="outline" className="ml-2" onClick={handleCopyPixCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {!paymentConfirmed ? (
                <Button className="w-full" onClick={() => confirmPayment(true)} variant="default">
                  Confirmar Pagamento
                </Button>
              ) : (
                <div className="w-full bg-green-100 text-green-800 p-3 rounded-md flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  <span>Pagamento confirmado com sucesso!</span>
                </div>
              )}
              <Button variant="outline" onClick={resetPayment} className="w-full">
                Novo Pagamento
              </Button>
            </CardFooter>
          </Card>
        )}

        {customerData && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
              <CardDescription>Informações do cliente utilizadas na transação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Informações Pessoais</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Nome:</span> {customerData.name}
                    </li>
                    <li>
                      <span className="font-medium">Email:</span> {customerData.email}
                    </li>
                    <li>
                      <span className="font-medium">Telefone:</span> {customerData.phone}
                    </li>
                    <li>
                      <span className="font-medium">CPF:</span> {customerData.document?.number}
                    </li>
                  </ul>
                </div>
                <div className="hidden">
                  <h3 className="font-medium mb-2">Endereço</h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Rua:</span> {customerData.address?.street}
                    </li>
                    <li>
                      <span className="font-medium">Número:</span> {customerData.address?.number}
                    </li>
                    <li>
                      <span className="font-medium">Bairro:</span> {customerData.address?.neighborhood}
                    </li>
                    <li>
                      <span className="font-medium">Cidade:</span> {customerData.address?.city}
                    </li>
                    <li>
                      <span className="font-medium">Estado:</span> {customerData.address?.state}
                    </li>
                    <li>
                      <span className="font-medium">CEP:</span> {customerData.address?.zipcode}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="md:col-span-2 mt-4">
            <CardHeader>
              <CardTitle>Erro na Integração</CardTitle>
              <CardDescription>Informações para solução de problemas</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro na API</AlertTitle>
                <AlertDescription>
                  <p>{error}</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
