"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import React, { useEffect } from "react"
import { toast } from "sonner" // Importar Sonner

import { useGetAllReservas } from "../../hooks/useGetAllReservas" // Ajustar ruta
import { ReservaTable } from "../../types"
import { ChevronDown } from "lucide-react"

// Tipo para los rangos
type RangoType = "dia" | "semana" | "mes"

// Props que recibe el componente
interface WelcomeReservasProps {
  selectedRange: RangoType
  onRangeChange: (range: RangoType) => void
}

// Opciones del select con sus labels
const rangoOptions = [
  { value: "dia" as const, label: "Hoy" },
  { value: "semana" as const, label: "Últimos 7 días" },
  { value: "mes" as const, label: "Últimos 30 días" },
] as const

// Utilidades para generar CSV de reservas
const generateReservasCSV = (reservas: ReservaTable[]): string => {
  if (!reservas || reservas.length === 0) {
    throw new Error("No hay reservas para exportar")
  }

  // Definir headers en español
  const headers = [
    "ID Reserva",
    "Usuario",
    "Plaza",
    "Matrícula",
    "Fecha de Inicio",
    "Fecha de Fin",
    "Duración (días)",
  ]

  // Mapear datos de reservas a formato CSV
  const csvData = reservas.map((reserva) => {
    // Calcular duración en días
    const fechaInicio = new Date(reserva.fechaInicio)
    const fechaFin = new Date(reserva.fechaFin)
    const duracionMs = fechaFin.getTime() - fechaInicio.getTime()
    const duracionDias = Math.ceil(duracionMs / (1000 * 60 * 60 * 24))

    return {
      "ID Reserva": reserva.id || "N/A",
      Usuario: reserva.usuario || "N/A",
      Plaza: reserva.plaza || "N/A",
      Matrícula: reserva.matricula || "Sin matrícula",
      "Fecha de Inicio": fechaInicio.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Fecha de Fin": fechaFin.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Duración (días)": duracionDias > 0 ? duracionDias : "Mismo día",
    }
  })

  // Generar CSV
  const csvRows = [
    headers.join(","), // Header row
    ...csvData.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row]
          // Escapar valores que contienen comas o comillas
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

  // Cleanup
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const WelcomeReservas = ({
  selectedRange,
  onRangeChange,
}: WelcomeReservasProps) => {
  // Hook para obtener reservas
  const { getAllReservas, reservas, isLoading, error } = useGetAllReservas()

  // Mapeo de valores para mostrar texto amigable
  const rangeLabels = {
    dia: "Hoy",
    semana: "Últimos 7 días",
    mes: "Últimos 30 días",
  }

  // Cargar reservas al montar el componente
  useEffect(() => {
    getAllReservas()
  }, [])

  // Función de descarga de reportes
  const handleDownloadReport = async () => {
    try {
      console.log(
        "Iniciando descarga de reporte de reservas para:",
        selectedRange
      )
      console.log("Reservas disponibles:", reservas.length)

      // Si no hay reservas cargadas, cargarlas primero
      if (!reservas || reservas.length === 0) {
        const loadingToast = toast.loading("Cargando reservas...", {
          description: "Obteniendo datos de reservas",
        })

        await getAllReservas()

        toast.dismiss(loadingToast)

        // Verificar nuevamente después de cargar
        if (!reservas || reservas.length === 0) {
          toast.error("No hay datos", {
            description: "No se encontraron reservas para generar el reporte",
          })
          return
        }
      }

      // Mostrar loading para generación
      const generatingToast = toast.loading(
        "Generando reporte de reservas...",
        {
          description: "Preparando archivo CSV",
        }
      )

      // Verificar que tengamos reservas para procesar
      if (reservas.length === 0) {
        toast.dismiss(generatingToast)
        toast.error("No hay datos", {
          description: "No se encontraron reservas para generar el reporte",
        })
        return
      }

      // Generar estadísticas adicionales
      const totalReservas = reservas.length
      const reservasConMatricula = reservas.filter(
        (r) => r.matricula && r.matricula !== "Sin matrícula"
      ).length
      const plazasUnicas = new Set(reservas.map((r) => r.plaza)).size
      const usuariosUnicos = new Set(reservas.map((r) => r.usuario)).size

      // Calcular reservas por fecha (según el rango seleccionado)
      let reservasFiltradas = reservas

      if (selectedRange === "dia") {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const manana = new Date(hoy)
        manana.setDate(manana.getDate() + 1)

        reservasFiltradas = reservas.filter((r) => {
          const fechaInicio = new Date(r.fechaInicio)
          return fechaInicio >= hoy && fechaInicio < manana
        })
      } else if (selectedRange === "semana") {
        const hace7Dias = new Date()
        hace7Dias.setDate(hace7Dias.getDate() - 7)

        reservasFiltradas = reservas.filter((r) => {
          const fechaInicio = new Date(r.fechaInicio)
          return fechaInicio >= hace7Dias
        })
      } else if (selectedRange === "mes") {
        const hace30Dias = new Date()
        hace30Dias.setDate(hace30Dias.getDate() - 30)

        reservasFiltradas = reservas.filter((r) => {
          const fechaInicio = new Date(r.fechaInicio)
          return fechaInicio >= hace30Dias
        })
      }

      // Agregar resumen al inicio del CSV
      const resumenData = [
        { Métrica: "Período del reporte", Valor: rangeLabels[selectedRange] },
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
        { Métrica: "Total de reservas", Valor: totalReservas.toString() },
        {
          Métrica: `Reservas en ${rangeLabels[selectedRange].toLowerCase()}`,
          Valor: reservasFiltradas.length.toString(),
        },
        {
          Métrica: "Reservas con matrícula",
          Valor: reservasConMatricula.toString(),
        },
        { Métrica: "Plazas únicas utilizadas", Valor: plazasUnicas.toString() },
        { Métrica: "Usuarios únicos", Valor: usuariosUnicos.toString() },
        { Métrica: "", Valor: "" }, // Fila vacía como separador
      ]

      // Generar nombre de archivo
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
      const filename = `reporte_reservas_${selectedRange}_${timestamp}.csv`

      // Generar CSV con resumen + datos detallados
      const resumenCSV = resumenData
        .map((row) => `${row.Métrica},${row.Valor}`)
        .join("\n")

      // Usar las reservas filtradas según el rango para el reporte
      const reservasCSV = generateReservasCSV(reservasFiltradas)
      const finalCSV = resumenCSV + "\n" + reservasCSV

      // Descargar archivo
      downloadFile(finalCSV, filename, "text/csv")

      // Cerrar loading toast
      toast.dismiss(generatingToast)

      // Toast de éxito
      toast.success("Reporte generado", {
        description: `Se descargó "${filename}" con ${
          reservasFiltradas.length
        } reservas para ${rangeLabels[selectedRange].toLowerCase()}`,
        duration: 5000,
      })

      console.log("Reporte de reservas generado:", {
        filename,
        totalReservas: reservasFiltradas.length,
        rango: selectedRange,
        estadisticas: {
          conMatricula: reservasConMatricula,
          plazasUnicas,
          usuariosUnicos,
        },
      })
    } catch (error) {
      console.error("Error generando reporte de reservas:", error)
      toast.error("Error al generar reporte", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo generar el archivo de reservas",
        duration: 5000,
      })
    }
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Reservas</h1>

      <div className="flex flex-row gap-3 mt-4">
        {/* Select conectado al estado padre */}
        <Select
          value={selectedRange}
          onValueChange={(value: RangoType) => {
            console.log("🔄 Cambiando rango de reservas a:", value)
            onRangeChange(value)
          }}
        >
          <SelectTrigger className="w-46 h-9 rounded-full ring-0 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <div className="flex items-center gap-2">
              <Image
                src="/home/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
              <span className="font-semibold ml-2">
                <SelectValue>{rangeLabels[selectedRange]}</SelectValue>
              </span>
              <ChevronDown className="ml-auto h-4 w-4" /> {/* ← AGREGAR ESTO */}
            </div>
          </SelectTrigger>

          <SelectContent>
            {rangoOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                <span>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botón de descarga con funcionalidad completa */}
        <Button
          variant="outline"
          className="w-46 h-11 rounded-full"
          onClick={handleDownloadReport}
          disabled={isLoading}
        >
          <Image
            src="/home/file-download-02.svg"
            alt="download"
            width={20}
            height={20}
          />
          {isLoading ? "Cargando..." : "Descargar reporte"}
        </Button>
      </div>

      {/* Info de debug/estado */}
      {reservas.length > 0 && !isLoading && (
        <div className="mt-4 text-xs text-muted-foreground">
          {reservas.length} reservas disponibles para reporte
        </div>
      )}

      {error && <div className="mt-4 text-xs text-red-500">Error: {error}</div>}
    </div>
  )
}

export default WelcomeReservas
