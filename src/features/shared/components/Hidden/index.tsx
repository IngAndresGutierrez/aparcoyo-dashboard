"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/shared/components/AppSidebar"
import ReduxProvider from "@/store/ReduxProvider"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === "/login"

  return (
    <ReduxProvider>
      {isLogin ? (
        // Layout para página de login
        <main className="flex items-center justify-center min-h-screen w-full bg-white">
          {children}
        </main>
      ) : (
        // Layout general con sidebar
        <SidebarProvider>
          <AppSidebar />
          <main className="flex flex-1 min-h-svh w-full">{children}</main>
        </SidebarProvider>
      )}
    </ReduxProvider>
  )
}
