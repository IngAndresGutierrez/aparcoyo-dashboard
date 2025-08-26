"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import React, { useState, useEffect } from "react"
import { toast } from "sonner" // Importar Sonner
import { Reporte } from "../../types/reports-table"
import { useReportes } from "../../hooks/useReportsTable"

interface WelcomeReportsProps {
  onFilterChange: (filtro: string) => void
  loading?: boolean
}

// Opciones de filtro
const filterOptions = [
  {
    value: "dia",
    label: "Último día",
    displayLabel: "Últimas 24 horas",
  },
  {
    value: "semana",
    label: "Última semana",
    displayLabel: "Últimos 7 días",
  },
  {
    value: "mes",
    label: "Último mes",
    displayLabel: "Últimos 30 días",
  },
]

// Utilidades para generar CSV de reportes
const generateReportesCSV = (reportes: Reporte[]): string => {
  if (!reportes || reportes.length === 0) {
    throw new Error("No hay reportes para exportar")
  }

  // Definir headers en español
  const headers = [
    "ID del Reporte",
    "Usuario",
    "UID Usuario",
    "Descripción",
    "Categoría",
    "Estado",
    "Fecha de Creación",
    "Fecha de Resolución",
    "Respuesta del Admin",
    "Resuelto Por",
    "UID Resolutor",
    "Días para Resolución",
  ]

  // Mapear datos de reportes a formato CSV
  const csvData = reportes.map((reporte) => {
    // Calcular días para resolución si está resuelto
    let diasResolucion = ""
    if (reporte.resolvedAt) {
      const fechaCreacion = new Date(reporte.fecha)
      const fechaResolucion = new Date(reporte.resolvedAt)
      const diffMs = fechaResolucion.getTime() - fechaCreacion.getTime()
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      diasResolucion = diffDias.toString()
    }

    return {
      "ID del Reporte": reporte.id || "N/A",
      Usuario: reporte.usuario?.nombre || "N/A",
      "UID Usuario": reporte.usuario?.uid || "N/A",
      Descripción: reporte.descripcion || "Sin descripción",
      Categoría: reporte.categoriaLabel || reporte.categoria || "N/A",
      Estado: reporte.estado || "N/A",
      "Fecha de Creación": reporte.fecha
        ? new Date(reporte.fecha).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      "Fecha de Resolución": reporte.resolvedAt
        ? new Date(reporte.resolvedAt).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Sin resolver",
      "Respuesta del Admin": reporte.respuestaAdmin || "Sin respuesta",
      "Resuelto Por": reporte.resolvedBy?.nombre || "N/A",
      "UID Resolutor": reporte.resolvedBy?.uid || "N/A",
      "Días para Resolución": diasResolucion || "Sin resolver",
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

const WelcomeReports: React.FC<WelcomeReportsProps> = ({
  onFilterChange,
  loading: externalLoading = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("mes")
  const { reportes, metrics, loading, refresh } = useReportes()

  // Cargar datos iniciales
  useEffect(() => {
    refresh(selectedFilter)
  }, [])

  const handleFilterSelect = (value: string) => {
    setSelectedFilter(value)
    onFilterChange(value)
    // Actualizar datos con el nuevo filtro
    refresh(value)
  }

  const getCurrentLabel = () => {
    const current = filterOptions.find(
      (option) => option.value === selectedFilter
    )
    return current?.displayLabel || "Últimos 30 días"
  }

  // Función de descarga de reportes
  const handleDownloadReport = async () => {
    try {
      console.log(
        "Iniciando descarga de reporte de reportes para:",
        selectedFilter
      )
      console.log("Reportes disponibles:", reportes?.length || 0)

      // Si no hay reportes cargados, cargarlos primero
      if (!reportes || reportes.length === 0) {
        const loadingToast = toast.loading("Cargando reportes...", {
          description: "Obteniendo datos de reportes",
        })

        await refresh(selectedFilter)

        toast.dismiss(loadingToast)

        // Verificar nuevamente después de cargar
        if (!reportes || reportes.length === 0) {
          toast.error("No hay datos", {
            description: "No se encontraron reportes para generar el archivo",
          })
          return
        }
      }

      // Mostrar loading para generación
      const generatingToast = toast.loading(
        "Generando reporte de reportes...",
        {
          description: "Preparando archivo CSV",
        }
      )

      // Verificar que tengamos reportes para procesar
      if (reportes.length === 0) {
        toast.dismiss(generatingToast)
        toast.error("No hay datos", {
          description: "No se encontraron reportes para generar el archivo",
        })
        return
      }

      // Generar estadísticas adicionales
      const totalReportes = reportes.length

      // Estadísticas por estado
      const estadosCounts = reportes.reduce((acc, r) => {
        const estado = r.estado || "Sin estado"
        acc[estado] = (acc[estado] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Estadísticas por categoría
      const categoriasCounts = reportes.reduce((acc, r) => {
        const categoria = r.categoriaLabel || r.categoria || "Sin categoría"
        acc[categoria] = (acc[categoria] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Calcular tiempos de resolución
      const reportesResueltos = reportes.filter((r) => r.resolvedAt)
      const tiemposResolucion = reportesResueltos.map((r) => {
        const fechaCreacion = new Date(r.fecha)
        const fechaResolucion = new Date(r.resolvedAt!)
        const diffMs = fechaResolucion.getTime() - fechaCreacion.getTime()
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      })

      const tiempoPromedioResolucion =
        tiemposResolucion.length > 0
          ? Math.round(
              tiemposResolucion.reduce((sum, tiempo) => sum + tiempo, 0) /
                tiemposResolucion.length
            )
          : 0

      const usuariosUnicos = new Set(
        reportes.map((r) => r.usuario?.uid).filter(Boolean)
      ).size
      const adminResolvers = new Set(
        reportes.filter((r) => r.resolvedBy).map((r) => r.resolvedBy!.uid)
      ).size

      // Agregar resumen al inicio del CSV
      const resumenData = [
        { Métrica: "Período del reporte", Valor: getCurrentLabel() },
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
        { Métrica: "Total de reportes", Valor: totalReportes.toString() },
        {
          Métrica: "Reportes resueltos",
          Valor: reportesResueltos.length.toString(),
        },
        {
          Métrica: "Tiempo promedio de resolución (días)",
          Valor: tiempoPromedioResolucion.toString(),
        },
        {
          Métrica: "Usuarios únicos que reportaron",
          Valor: usuariosUnicos.toString(),
        },
        {
          Métrica: "Admins que resolvieron reportes",
          Valor: adminResolvers.toString(),
        },
        { Métrica: "", Valor: "" }, // Fila vacía como separador
      ]

      // Agregar métricas del sistema si están disponibles
      if (metrics) {
        resumenData.push(
          { Métrica: "MÉTRICAS DEL SISTEMA", Valor: "" },
          {
            Métrica: "Total reportes (sistema)",
            Valor: metrics.totalReportes.toString(),
          },
          {
            Métrica: "Reportes pendientes",
            Valor: metrics.pendientes.toString(),
          },
          {
            Métrica: "Reportes resueltos (sistema)",
            Valor: metrics.resueltos.toString(),
          },
          {
            Métrica: "Reportes cancelados",
            Valor: metrics.cancelados.toString(),
          },
          { Métrica: "", Valor: "" } // Fila vacía como separador
        )
      }

      // Agregar estadísticas por estado
      resumenData.push(
        { Métrica: "ESTADÍSTICAS POR ESTADO", Valor: "" },
        ...Object.entries(estadosCounts).map(([estado, count]) => ({
          Métrica: `Estado: ${estado}`,
          Valor: count.toString(),
        })),
        { Métrica: "", Valor: "" } // Fila vacía como separador
      )

      // Agregar estadísticas por categoría
      resumenData.push(
        { Métrica: "ESTADÍSTICAS POR CATEGORÍA", Valor: "" },
        ...Object.entries(categoriasCounts).map(([categoria, count]) => ({
          Métrica: `Categoría: ${categoria}`,
          Valor: count.toString(),
        })),
        { Métrica: "", Valor: "" } // Fila vacía como separador
      )

      // Generar nombre de archivo
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
      const filename = `reporte_reportes_${selectedFilter}_${timestamp}.csv`

      // Generar CSV con resumen + datos detallados
      const resumenCSV = resumenData
        .map((row) => `${row.Métrica},${row.Valor}`)
        .join("\n")

      const reportesCSV = generateReportesCSV(reportes)
      const finalCSV = resumenCSV + "\n" + reportesCSV

      // Descargar archivo
      downloadFile(finalCSV, filename, "text/csv")

      // Cerrar loading toast
      toast.dismiss(generatingToast)

      // Toast de éxito
      toast.success("Reporte generado", {
        description: `Se descargó "${filename}" con ${totalReportes} reportes para ${getCurrentLabel().toLowerCase()}`,
        duration: 5000,
      })

      console.log("Reporte de reportes generado:", {
        filename,
        totalReportes,
        filtro: selectedFilter,
        estadísticas: {
          resueltos: reportesResueltos.length,
          tiempoPromedioResolucion,
          usuariosUnicos,
          adminResolvers,
          estadosCounts,
          categoriasCounts,
        },
      })
    } catch (error) {
      console.error("Error generando reporte de reportes:", error)
      toast.error("Error al generar reporte", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo generar el archivo de reportes",
        duration: 5000,
      })
    }
  }

  const isLoading = loading || externalLoading

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Reportes</h1>

      <div className="flex flex-row gap-3 mt-4 ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-46 h-11 rounded-full flex items-center gap-2"
              disabled={isLoading}
            >
              <Image
                src="/home/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
              />
              <span className="font-semibold">{getCurrentLabel()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48"
          >
            {filterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleFilterSelect(option.value)}
                className={`flex items-center gap-2 p-3 ${
                  selectedFilter === option.value ? "bg-accent" : ""
                }`}
              >
                <Image
                  src="/home/calendar.svg"
                  alt="calendar"
                  width={16}
                  height={16}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.displayLabel}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          className="w-46 h-11 rounded-full flex items-center gap-2"
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
      {reportes && reportes.length > 0 && !isLoading && (
        <div className="mt-4 text-xs text-muted-foreground">
          {reportes.length} reportes disponibles para descarga
        </div>
      )}

      {/* Mostrar métricas básicas si están disponibles */}
      {metrics && !isLoading && (
        <div className="mt-4 text-xs text-muted-foreground">
          Pendientes: {metrics.pendientes} | Resueltos: {metrics.resueltos} |
          Cancelados: {metrics.cancelados}
        </div>
      )}
    </div>
  )
}

export default WelcomeReports
