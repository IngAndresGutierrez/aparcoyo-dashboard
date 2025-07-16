"use client"

import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import clsx from "clsx"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: string
    iconBlue?: string // si tienes versión azul del ícono, opcional
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = pathname === item.url

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  className={clsx(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-md transition-colors",
                    "hover:bg-blue-100 hover:text-blue-600",
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-muted-foreground"
                  )}
                >
                  <Image
                    src={isActive && item.iconBlue ? item.iconBlue : item.icon}
                    alt={item.name}
                    width={18}
                    height={18}
                    className={clsx(
                      "transition-colors",
                      isActive ? "grayscale-0" : "grayscale"
                    )}
                  />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
