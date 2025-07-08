"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
    <Sidebar className="w-67 mt-4">
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
        ? "bg-utility-brand text-brand-solid font-semibold"
        : "text-secondary hover:bg-blue-brand hover:text-brand-solid"
    }`}
                      >
                        <Image
                          src={item.icon}
                          alt={item.title}
                          width={20}
                          height={20}
                          className={`w-5 h-5 ${
                            isActive
                              ? "invert-[26%] sepia-[80%] saturate-[750%] hue-rotate-[210deg] brightness-[90%] contrast-[120%]"
                              : ""
                          }`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
          <div className="flex flex-row justify-center items-center">
            <Card className="mt-44 w-64 h-16 flex flex-row items-center border border-secondary-border">
              <div className="flex items-center">
                <Image
                  className="ml-3"
                  src="/home/avatar.svg"
                  alt="avatar"
                  width={40}
                  height={40}
                />
              </div>
              <div className="-ml-4">
                <p className="text-sm font-semibold">Kate Morrison</p>
                <p className="text-sm font-normal text-tertiary">
                  kate@aparcoyo.com
                </p>
              </div>
              <div>
                <Button
                  variant="ghost"
                  className="p-0 -mt-4 ml-2"
                >
                  <Image
                    src="/home/button-utility.svg"
                    alt="button"
                    width={32}
                    height={32}
                  />
                </Button>
              </div>
            </Card>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
