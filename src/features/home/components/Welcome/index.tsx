/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

import Image from "next/image"
import React from "react"
import { TimeFilter, useMetrics } from "../../hooks/useMetrics"
import { useUser } from "@/features/login/hooks/useLoggoutUsers"

// Opciones del selector con labels amigables
const timeFilterOptions = [
  {
    value: "day" as TimeFilter,
    label: "Último día",
    icon: "/home/calendar.svg",
  },
  {
    value: "week" as TimeFilter,
    label: "Última semana",
    icon: "/home/calendar.svg",
  },
  {
    value: "month" as TimeFilter,
    label: "Últimos 30 días",
    icon: "/home/calendar.svg",
  },
]

// Utilidades para generar reportes CSV
const generateCSV = (data: any[]): string => {
  if (!data || data.length === 0) {
    throw new Error("No hay datos para exportar")
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ""
        })
        .join(",")
    ),
  ]

  return csvRows.join("\n")
}

const downloadFile = (
  content: string,
  filename: string,
  contentType: string
) => {
  const blob = new Blob([content], { type: contentType })
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const Welcome = () => {
  const { timeFilter, setTimeFilter, loading, metrics } = useMetrics()
  const { user, loading: userLoading, error: userError } = useUser() // Usar el hook completo

  // Obtener el nombre del usuario o mostrar un fallback apropiado
  const getUserName = () => {
    if (userLoading) return "Cargando..."
    if (userError && !user) return "Usuario"
    if (!user) return "Usuario"

    // Extraer el primer nombre si es un nombre completo
    const firstName = user.name.split(" ")[0]
    return firstName
  }

  // Obtener un saludo apropiado basado en el estado del usuario
  const getUserGreeting = () => {
    const name = getUserName()
    const hour = new Date().getHours()

    let greeting = "Bienvenida"
    if (hour < 12) greeting = "Buenos días"
    else if (hour < 18) greeting = "Buenas tardes"
    else greeting = "Buenas noches"

    return `${greeting}, ${name}`
  }

  // Obtener el label actual basado en el filtro seleccionado
  const getCurrentLabel = () => {
    const option = timeFilterOptions.find((opt) => opt.value === timeFilter)
    return option?.label || "Últimos 30 días"
  }

  // Función de descarga de reportes actualizada con datos del usuario
  const handleDownloadReport = () => {
    if (!metrics || loading) {
      toast.error("No hay datos", {
        description: loading
          ? "Espera a que terminen de cargar los datos"
          : "No hay métricas disponibles para descargar",
      })
      return
    }

    try {
      const loadingToast = toast.loading("Generando reporte...", {
        description: "Preparando datos para descarga",
      })

      // Incluir información del usuario en el reporte
      const reportData = {
        Período: getCurrentLabel(),
        "Generado por": user?.name || "Usuario no identificado",
        "Email del administrador": user?.email || "No disponible",
        "ID de usuario": user?.id || "No disponible",
        Rol: user?.role || "No especificado",
        "Estado del perfil": userError ? `Error: ${userError}` : "OK",
        "Fecha de generación": new Date().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        "Total de usuarios": metrics.users.value || 0,
        "Estado usuarios": metrics.users.error
          ? `Error: ${metrics.users.error}`
          : "OK",
        "Total de plazas": metrics.plazas.value || 0,
        "Estado plazas": metrics.plazas.error
          ? `Error: ${metrics.plazas.error}`
          : "OK",
        "Reservas activas": metrics.activeReservas.value || 0,
        "Estado reservas activas": metrics.activeReservas.error
          ? `Error: ${metrics.activeReservas.error}`
          : "OK",
        "Total de reservas": metrics.totalReservas.value || 0,
        "Estado total reservas": metrics.totalReservas.error
          ? `Error: ${metrics.totalReservas.error}`
          : "OK",
        "Porcentaje de plazas ocupadas":
          metrics.plazas.value > 0
            ? `${(
                (metrics.activeReservas.value / metrics.plazas.value) *
                100
              ).toFixed(1)}%`
            : "0%",
        "Promedio reservas por usuario":
          metrics.users.value > 0
            ? (metrics.totalReservas.value / metrics.users.value).toFixed(2)
            : "0",
      }

      const dataArray = Object.entries(reportData).map(([key, value]) => ({
        Métrica: key,
        Valor: value,
      }))

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
      const filename = `reporte_aparcoyo_${timeFilter}_${timestamp}.csv`

      const csvContent = generateCSV(dataArray)
      downloadFile(csvContent, filename, "text/csv")

      toast.dismiss(loadingToast)

      toast.success("Reporte descargado", {
        description: `Se ha descargado "${filename}" con las métricas para ${getCurrentLabel().toLowerCase()}`,
        duration: 5000,
      })

      console.log("📊 Reporte generado:", {
        filename,
        period: timeFilter,
        generatedBy: user?.name,
        userStatus: userError ? "error" : "ok",
        data: reportData,
      })
    } catch (error) {
      console.error("Error generando reporte:", error)
      toast.error("Error al generar reporte", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo generar el archivo de descarga",
        duration: 5000,
      })
    }
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">
        {getUserGreeting()}
        {userError && !user && (
          <span className="text-sm text-muted-foreground block mt-1">
            (Problema cargando perfil)
          </span>
        )}
      </h1>

      <div className="flex flex-row gap-3 mt-4">
        <Select
          value={timeFilter}
          onValueChange={(value: TimeFilter) => setTimeFilter(value)}
        >
          <SelectTrigger className="w-48 h-9 rounded-full border border-border [&>svg]:hidden">
            <div className="flex items-center gap-2">
              <Image
                src="/home/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
              <SelectValue>
                <span className="font-semibold ml-2">{getCurrentLabel()}</span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {timeFilterOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={option.icon}
                    alt="calendar"
                    width={16}
                    height={16}
                  />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="w-46 h-11 rounded-full"
          onClick={handleDownloadReport}
          disabled={loading}
        >
          <Image
            src="/home/file-download-02.svg"
            alt="download"
            width={20}
            height={20}
          />
          {loading ? "Cargando..." : "Descargar reporte"}
        </Button>
      </div>

      {/* Mostrar loading state */}
      {loading && (
        <div className="mt-4 text-sm text-muted-foreground">
          Cargando datos para {getCurrentLabel().toLowerCase()}...
        </div>
      )}

      {/* Mostrar preview de métricas disponibles */}
      {!loading && metrics && (
        <div className="mt-4 text-xs text-muted-foreground">
          Datos listos: {metrics.users.value} usuarios • {metrics.plazas.value}{" "}
          plazas • {metrics.totalReservas.value} reservas
          {userError && " • Perfil: datos parciales"}
        </div>
      )}
    </div>
  )
}

export default Welcome
