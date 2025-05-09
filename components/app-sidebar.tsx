"use client"

import { History, DollarSign, Menu, LogOut, User, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isActive = (path: string) => pathname === path

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return "U"

    const nameParts = user.user_metadata.full_name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center h-14 px-4">
        <h2 className="text-lg font-semibold">Firma Milionaria</h2>
      </SidebarHeader>

      <SidebarContent>
        {user && (
          <div className="px-4 py-2 mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Sessões</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/")} onClick={() => navigateTo("/")}>
                  <Menu />
                  <span>Gerar Pagamento</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/history")} onClick={() => navigateTo("/history")}>
                  <History />
                  <span>Histórico de PIX</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/daily")} onClick={() => navigateTo("/daily")}>
                  <DollarSign />
                  <span>Total do Dia</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/profile")} onClick={() => navigateTo("/profile")}>
                  <User />
                  <span>Meu Perfil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/settings")} onClick={() => navigateTo("/settings")}>
                  <Settings />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
