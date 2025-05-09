"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function SettingsPage() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const [companyName, setCompanyName] = useState("Firma Milionaria")
  const [apiKeyPublic, setApiKeyPublic] = useState("")
  const [apiKeySecret, setApiKeySecret] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settingsId, setSettingsId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.from("settings").select("*").eq("user_id", user?.id).single()

      if (error) {
        console.error("Error loading settings:", error)
        return
      }

      if (data) {
        setSettingsId(data.id)
        setCompanyName(data.company_name || "Firma Milionaria")
        setApiKeyPublic(data.api_key_public || "")
        setApiKeySecret(data.api_key_secret || "")
        setWebhookUrl(data.webhook_url || "")
      }
    } catch (err) {
      console.error("Error loading settings:", err)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result

      if (settingsId) {
        // Update existing settings
        result = await supabase
          .from("settings")
          .update({
            company_name: companyName,
            api_key_public: apiKeyPublic,
            api_key_secret: apiKeySecret,
            webhook_url: webhookUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settingsId)
      } else {
        // Insert new settings
        result = await supabase.from("settings").insert({
          user_id: user?.id,
          company_name: companyName,
          api_key_public: apiKeyPublic,
          api_key_secret: apiKeySecret,
          webhook_url: webhookUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      if (result.error) {
        throw result.error
      }

      // If it was a new insert, reload to get the ID
      if (!settingsId) {
        await loadSettings()
      }

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso",
      })
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar as configurações")
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1">
          <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              {isMobile && <SidebarTrigger className="mr-2" />}
              <h1 className="text-2xl font-bold">Configurações</h1>
            </div>

            <Card className="max-w-2xl mx-auto mb-6">
              <CardHeader>
                <CardTitle>Configurações da Empresa</CardTitle>
                <CardDescription>Configure as informações da sua empresa e API de pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKeyPublic">Chave Pública da API</Label>
                    <Input
                      id="apiKeyPublic"
                      type="text"
                      value={apiKeyPublic}
                      onChange={(e) => setApiKeyPublic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKeySecret">Chave Secreta da API</Label>
                    <Input
                      id="apiKeySecret"
                      type="password"
                      value={apiKeySecret}
                      onChange={(e) => setApiKeySecret(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">URL do Webhook (opcional)</Label>
                    <Input
                      id="webhookUrl"
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://seu-site.com/api/webhook"
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Alert className="max-w-2xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>
                As chaves da API são usadas para gerar os QR codes PIX. Você pode obter suas chaves no painel da Clypt
                Payments.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
