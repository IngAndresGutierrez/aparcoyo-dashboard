"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  
  GalleryVerticalEnd,

} from "lucide-react"

import { NavProjects } from "../NavProjects"
import { NavUser } from "../NavUser"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/home/avatar.svg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],

  projects: [
    {
      name: "Inicio",
      url: "#",
      icon: "/home/home-03.svg",
    },
    {
      name: "Usuarios",
      url: "#",
      icon: "/home/users-01.svg",
    },
    {
      name: "Plazas",
      url: "#",
      icon: "/home/home-line.svg",
    },
    {
      name: "Reservas",
      url: "#",
      icon: "/home/ticket-02.svg",
    },
    {
      name: "Transacciones",
      url: "#",
      icon: "/home/switch-vertical-02.svg",
    },
    {
      name: "Reportes",
      url: "#",
      icon: "/home/alert-triangle.svg",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <Image
          className="ml-1 mt-4"
          src="/login/logo.svg"
          alt="logo"
          width={128}
          height={32}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
