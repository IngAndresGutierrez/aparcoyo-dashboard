"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import React, { useEffect, useCallback } from "react"

import { toast } from "sonner"

import { UsuarioTabla } from "../../types/table"
import { RangoEstadisticas } from "../../types/graphic"
import { useUsuariosTabla } from "../../hooks/useTable"

interface WelcomeUsersProps {
  rango: RangoEstadisticas
  onRangoChange: (rango: RangoEstadisticas) => void
  onUsuariosChange: (usuarios: UsuarioTabla[]) => void
}

// ✅ CORREGIDO: Cambiar "Último día" por "Últimas 24 horas"
const rangoOptions = [
  { value: "dia" as const, label: "Últimas 24 horas", icon: "" },
  { value: "semana" as const, label: "Últimos 7 días", icon: "" },
  { value: "mes" as const, label: "Últimos 30 días", icon: "" },
] as const

// ✅ FUNCIÓN CORREGIDA con filtro de 24 horas
const calculateDateFilters = (rango: RangoEstadisticas) => {
  const now = new Date()
  const startDate = new Date()

  console.log("🚀 calculateDateFilters ejecutándose con rango:", rango)

  switch (rango) {
    case "dia":
      // ✅ CORREGIDO: Últimas 24 horas exactas (no desde las 00:00)
      startDate.setTime(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case "semana":
      startDate.setDate(now.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
      break
    case "mes":
      startDate.setDate(now.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
      break
    default:
      startDate.setDate(now.getDate() - 30)
      startDate.setHours(0, 0, 0, 0)
  }

  const result = {
    fechaInicio: startDate.toISOString(),
    fechaFin: now.toISOString(),
  }

  console.log("📅 calculateDateFilters resultado:", {
    rango,
    desde: startDate.toLocaleString("es-ES"),
    hasta: now.toLocaleString("es-ES"),
    fechaInicio: result.fechaInicio,
    fechaFin: result.fechaFin,
  })

  return result
}

// Utilidades para generar CSV
const generateUsersCSV = (users: UsuarioTabla[]): string => {
  if (!users || users.length === 0) {
    throw new Error("No hay usuarios para exportar")
  }

  const headers = [
    "Nombre",
    "Email",
    "Teléfono",
    "Fecha de Registro",
    "Estado",
    "Reservas Hechas",
    "Plazas Publicadas",
    "Última Actividad",
    "Verificado",
    "Rol",
    "Activo",
  ]

  const csvData = users.map((user) => ({
    Nombre: user.nombre || "N/A",
    Email: user.email || "N/A",
    Teléfono: user.telefono || "Sin teléfono",
    "Fecha de Registro": user.fechaRegistro
      ? new Date(user.fechaRegistro).toLocaleDateString("es-ES")
      : "N/A",
    Estado: user.estado || "N/A",
    "Reservas Hechas": user.reservasHechas || 0,
    "Plazas Publicadas": user.plazasPublicadas || 0,
    "Última Actividad": user.ultimaActividad
      ? new Date(user.ultimaActividad).toLocaleDateString("es-ES")
      : "Sin actividad reciente",
    Verificado: user.verificado ? "Sí" : "No",
    Rol: user.rol || "Usuario",
    Activo: user.isActive ? "Sí" : "No",
  }))

  const csvRows = [
    headers.join(","),
    ...csvData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row]
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

const WelcomeUsers = ({
  rango,
  onRangoChange,
  onUsuariosChange,
}: WelcomeUsersProps) => {
  console.log("🎯 WelcomeUsers render - rango:", rango)

  const { usuarios, loading, fetchUsuarios } = useUsuariosTabla({}, false)

  const fetchUsuariosConFiltros = useCallback(
    (rangoParam: RangoEstadisticas) => {
      console.log(
        "🔄 fetchUsuariosConFiltros ejecutándose con rango:",
        rangoParam
      )

      const dateRange = calculateDateFilters(rangoParam)

      fetchUsuarios({
        limit: 999,
        sortBy: "fechaRegistro",
        sortOrder: "desc",
        fechaInicio: dateRange.fechaInicio,
        fechaFin: dateRange.fechaFin,
      })
    },
    [fetchUsuarios]
  )

  useEffect(() => {
    console.log("⚡ useEffect ejecutándose - rango:", rango)
    fetchUsuariosConFiltros(rango)
  }, [rango, fetchUsuariosConFiltros])

  useEffect(() => {
    if (usuarios && usuarios.length > 0) {
      console.log("📤 Pasando usuarios al padre:", usuarios.length)
      onUsuariosChange(usuarios)
    }
  }, [usuarios, onUsuariosChange])

  const currentRangoLabel =
    rangoOptions.find((option) => option.value === rango)?.label ||
    "Últimos 30 días"

  const handleDownloadReport = async () => {
    try {
      console.log("📥 Iniciando descarga - rango:", rango)

      const dateRange = calculateDateFilters(rango)

      const loadingToast = toast.loading("Cargando usuarios...", {
        description: `Obteniendo usuarios de ${currentRangoLabel.toLowerCase()}`,
      })

      await fetchUsuarios({
        limit: 9999,
        sortBy: "fechaRegistro",
        sortOrder: "desc",
        fechaInicio: dateRange.fechaInicio,
        fechaFin: dateRange.fechaFin,
      })

      toast.dismiss(loadingToast)

      if (!usuarios || usuarios.length === 0) {
        toast.error("No hay datos", {
          description: `No se encontraron usuarios para ${currentRangoLabel.toLowerCase()}`,
        })
        return
      }

      const generatingToast = toast.loading(
        "Generando reporte de usuarios...",
        {
          description: "Preparando archivo CSV",
        }
      )

      const usuariosActivos = usuarios.filter((u) => u.isActive).length
      const usuariosVerificados = usuarios.filter((u) => u.verificado).length
      const totalReservas = usuarios.reduce(
        (sum, u) => sum + (u.reservasHechas || 0),
        0
      )
      const totalPlazas = usuarios.reduce(
        (sum, u) => sum + (u.plazasPublicadas || 0),
        0
      )

      const resumenData = [
        { Métrica: "Período del reporte", Valor: currentRangoLabel },
        {
          Métrica: "Fecha de generación",
          Valor: new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          Métrica: "Rango de fechas",
          Valor: `${new Date(dateRange.fechaInicio).toLocaleDateString(
            "es-ES"
          )} - ${new Date(dateRange.fechaFin).toLocaleDateString("es-ES")}`,
        },
        { Métrica: "Total de usuarios", Valor: usuarios.length.toString() },
        { Métrica: "Usuarios activos", Valor: usuariosActivos.toString() },
        {
          Métrica: "Usuarios verificados",
          Valor: usuariosVerificados.toString(),
        },
        {
          Métrica: "Total reservas realizadas",
          Valor: totalReservas.toString(),
        },
        { Métrica: "Total plazas publicadas", Valor: totalPlazas.toString() },
        { Métrica: "", Valor: "" },
      ]

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
      const filename = `reporte_usuarios_${rango}_${timestamp}.csv`

      const resumenCSV = resumenData
        .map((row) => `${row.Métrica},${row.Valor}`)
        .join("\n")
      const usuariosCSV = generateUsersCSV(usuarios)
      const finalCSV = resumenCSV + "\n" + usuariosCSV

      downloadFile(finalCSV, filename, "text/csv")

      toast.dismiss(generatingToast)

      toast.success("Reporte generado", {
        description: `Se descargó "${filename}" con ${
          usuarios.length
        } usuarios para ${currentRangoLabel.toLowerCase()}`,
        duration: 5000,
      })

      console.log("✅ Reporte generado:", {
        filename,
        totalUsuarios: usuarios.length,
        rango,
        dateRange,
      })
    } catch (error) {
      console.error("❌ Error en reporte:", error)
      toast.error("Error al generar reporte", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo generar el archivo de usuarios",
        duration: 5000,
      })
    }
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Usuarios</h1>

      <div className="flex flex-row gap-3 mt-4">
        <Select
          value={rango}
          onValueChange={onRangoChange}
        >
          <SelectTrigger className="w-46 h-9 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            <div className="flex items-center gap-2">
              <Image
                src="/home/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
              <SelectValue placeholder="Seleccionar período">
                <span className="font-semibold">{currentRangoLabel}</span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {rangoOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
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
    </div>
  )
}

export default WelcomeUsers
