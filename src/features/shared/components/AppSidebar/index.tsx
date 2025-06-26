import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"

import { usePathname } from "next/navigation"

// Menu items.
const items = [
  { title: "Inicio", url: "/", icon: "/home/home-03.svg" },
  { title: "Usuarios", url: "/usuarios", icon: "/home/users-01.svg" },
  { title: "Plazas", url: "/plazas", icon: "/home/home-line.svg" },
  { title: "Reservas", url: "/reservas", icon: "/home/ticket-02.svg" },
  {
    title: "Transacciones",
    url: "/transacciones",
    icon: "/home/switch-vertical-02.svg",
  },
  { title: "Reportes", url: "/reportes", icon: "/home/alert-triangle.svg" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Image
              className="mt-2"
              src="/login/logo.svg"
              alt="Logo"
              width={128}
              height={32}
            />
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-6">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = item.url === pathname

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors
    ${
      isActive
        ? "bg-[#EBF3FE] text-[#0E47E1] font-semibold"
        : "text-[#344054] hover:bg-blue-brand hover:text-[#0E47E1]"
    }`}
                      >
                        <Image
                          src={item.icon}
                          alt={item.title}
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
