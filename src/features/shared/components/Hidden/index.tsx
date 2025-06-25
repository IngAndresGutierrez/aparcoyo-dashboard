"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/shared/components/AppSidebar"
import ReduxProvider from "@/store/ReduxProvider"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"

  if (isLogin) {
    // Estructura mínima para /login
    return (
      <ReduxProvider>
        <main className="flex items-center justify-center min-h-screen w-full bg-white">
          {children}
        </main>
      </ReduxProvider>
    )
  }

  // Layout normal con sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 min-h-svh w-full">
        <SidebarTrigger />
        <ReduxProvider>{children}</ReduxProvider>
      </main>
    </SidebarProvider>
  )
}
