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
import React, { useEffect } from "react" // Agregar useEffect
import { toast } from "sonner" // Importar Sonner
import { useGetAllPlazas } from "../../hooks/useGetAllPlazas" // Hook real
import { Plaza } from "../../types" // Tipo Plaza
import { ChevronDown } from "lucide-react"

// Tipo para los rangos
type RangoType = "dia" | "semana" | "mes"

// Props que recibe el componente
interface WelcomePlazasProps {
  selectedRange: RangoType
  onRangeChange: (range: RangoType) => void
}

// Utilidades para generar CSV de plazas
const generatePlazasCSV = (plazas: Plaza[]): string => {
  if (!plazas || plazas.length === 0) {
    throw new Error("No hay plazas para exportar")
  }

  // Definir headers en español
  const headers = [
    "ID",
    "Dirección",
    "Tipo",
    "Precio",
    "Propietario",
    "Email Propietario",
    "Teléfono Propietario",
    "Disponible Desde",
    "Disponible Hasta",
    "Estado",
    "Fecha Creación",
    "Latitud",
    "Longitud",
    "Archivos",
  ]

  // Mapear datos de plazas a formato CSV
  const csvData = plazas.map((plaza) => ({
    ID: plaza.id,
    Dirección: plaza.direccion || "N/A",
    Tipo: plaza.tipo || "N/A",
    Precio: plaza.precio ? `${plaza.precio.toLocaleString()}` : "N/A",
    Propietario: plaza.propietario?.nombre || "N/A",
    "Email Propietario": plaza.propietario?.email || "N/A",
    "Teléfono Propietario": plaza.propietario?.telefono || "Sin teléfono",
    "Disponible Desde": plaza.disponibilidadDesde
      ? new Date(plaza.disponibilidadDesde).toLocaleDateString("es-ES")
      : "N/A",
    "Disponible Hasta": plaza.disponibilidadHasta
      ? new Date(plaza.disponibilidadHasta).toLocaleDateString("es-ES")
      : "Sin límite",
    Estado: plaza.isActive ? "Activa" : "Inactiva",
    "Fecha Creación": plaza.createAt
      ? new Date(plaza.createAt).toLocaleDateString("es-ES")
      : "N/A",
    Latitud: plaza.lat || "N/A",
    Longitud: plaza.lng || "N/A",
    Archivos: plaza.archivos?.length || 0,
  }))

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

const WelcomePlazas = ({
  selectedRange,
  onRangeChange,
}: WelcomePlazasProps) => {
  // Hook para obtener plazas (hook real)
  const { getAllPlazas, plazas, isLoading } = useGetAllPlazas()

  // Cargar plazas al montar el componente
  useEffect(() => {
    getAllPlazas()
  }, [])

  // Mapeo de valores para mostrar texto amigable
  const rangeLabels = {
    dia: "Hoy",
    semana: "Últimos 7 días",
    mes: "Últimos 30 días",
  }

  // Función de descarga de reportes
  const handleDownloadReport = async () => {
    try {
      console.log(
        "Iniciando descarga de reporte de plazas para:",
        selectedRange
      )
      console.log("Plazas disponibles:", plazas.length)

      // Si no hay plazas cargadas, cargarlas primero
      if (!plazas || plazas.length === 0) {
        const loadingToast = toast.loading("Cargando plazas...", {
          description: "Obteniendo datos de plazas",
        })

        await getAllPlazas()
        toast.dismiss(loadingToast)

        // Verificar nuevamente después de cargar
        if (!plazas || plazas.length === 0) {
          toast.error("No hay datos", {
            description: "No se encontraron plazas para generar el reporte",
          })
          return
        }
      }

      // Mostrar loading para generación
      const generatingToast = toast.loading("Generando reporte de plazas...", {
        description: "Preparando archivo CSV",
      })

      // Verificar que tengamos plazas para procesar
      if (plazas.length === 0) {
        toast.dismiss(generatingToast)
        toast.error("No hay datos", {
          description: "No se encontraron plazas para generar el reporte",
        })
        return
      }

      // Generar estadísticas adicionales
      const plazasActivas = plazas.filter((p) => p.isActive).length
      const plazasInactivas = plazas.length - plazasActivas
      const precioPromedio = plazas
        .filter((p) => p.precio)
        .reduce((sum, p, _, arr) => sum + p.precio / arr.length, 0)
      const totalArchivos = plazas.reduce(
        (sum, p) => sum + (p.archivos?.length || 0),
        0
      )

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
        { Métrica: "Total de plazas", Valor: plazas.length.toString() },
        { Métrica: "Plazas activas", Valor: plazasActivas.toString() },
        { Métrica: "Plazas inactivas", Valor: plazasInactivas.toString() },
        { Métrica: "Total archivos", Valor: totalArchivos.toString() },
        {
          Métrica: "Precio promedio",
          Valor: `$${Math.round(precioPromedio).toLocaleString()}`,
        },
        { Métrica: "", Valor: "" }, // Fila vacía como separador
      ]

      // Generar nombre de archivo
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
      const filename = `reporte_plazas_${selectedRange}_${timestamp}.csv`

      // Generar CSV con resumen + datos detallados
      const resumenCSV = resumenData
        .map((row) => `${row.Métrica},${row.Valor}`)
        .join("\n")
      const plazasCSV = generatePlazasCSV(plazas)
      const finalCSV = resumenCSV + "\n" + plazasCSV

      // Descargar archivo
      downloadFile(finalCSV, filename, "text/csv")

      // Cerrar loading toast
      toast.dismiss(generatingToast)

      // Toast de éxito
      toast.success("Reporte generado", {
        description: `Se descargó "${filename}" con ${
          plazas.length
        } plazas para ${rangeLabels[selectedRange].toLowerCase()}`,
        duration: 5000,
      })

      console.log("Reporte de plazas generado:", {
        filename,
        totalPlazas: plazas.length,
        rango: selectedRange,
        estadisticas: {
          activas: plazasActivas,
          inactivas: plazasInactivas,
          totalArchivos,
          precioPromedio: Math.round(precioPromedio),
        },
      })
    } catch (error) {
      console.error("Error generando reporte de plazas:", error)
      toast.error("Error al generar reporte", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo generar el archivo de plazas",
        duration: 5000,
      })
    }
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Plazas</h1>

      <div className="flex flex-row gap-3 mt-4">
        {/* Select conectado al estado padre */}
        <Select
          value={selectedRange}
          onValueChange={(value: RangoType) => {
            console.log("Cambiando rango a:", value)
            onRangeChange(value)
          }}
        >
          <SelectTrigger className="w-46 h-9 rounded-full ring-0 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Image
                  src="/home/calendar.svg"
                  alt="calendar"
                  width={20}
                  height={20}
                />
                <SelectValue>
                  <span className="font-semibold lg:ml-2">
                    {rangeLabels[selectedRange]}
                  </span>
                </SelectValue>
              </div>
              <ChevronDown className="h-4 w-4" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Hoy</SelectItem>
            <SelectItem value="semana">Últimos 7 días</SelectItem>
            <SelectItem value="mes">Últimos 30 días</SelectItem>
          </SelectContent>
        </Select>

        {/* Botón para descargar reporte CON FUNCIONALIDAD */}
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
      {plazas.length > 0 && !isLoading && (
        <div className="mt-4 text-xs text-muted-foreground">
          {plazas.length} plazas disponibles para reporte
        </div>
      )}
    </div>
  )
}

export default WelcomePlazas
