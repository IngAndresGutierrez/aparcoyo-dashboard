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
import React, { useState, useEffect } from "react"
import { toast } from "sonner" // Importar Sonner
import { Transaction } from "../../types/transaction"
import { usePlatformStats } from "../../hooks/useTransaction"

// Tipo para los períodos de la UI
type PeriodType = "day" | "week" | "month"

// Tipo que espera el backend/hook
type BackendPeriodType = "daily" | "weekly" | "monthly" | "yearly"

// Función para mapear entre los dos tipos
const mapPeriodToBackend = (period: PeriodType): BackendPeriodType => {
  switch (period) {
    case "day":
      return "daily"
    case "week":
      return "weekly"
    case "month":
      return "monthly"
    default:
      return "monthly"
  }
}

// Opciones de período actualizadas
const periodOptions = [
  {
    value: "day" as const,
    label: "Hoy",
    icon: "/home/calendar.svg",
  },
  {
    value: "week" as const,
    label: "Últimos 7 días",
    icon: "/home/calendar.svg",
  },
  {
    value: "month" as const,
    label: "Últimos 30 días",
    icon: "/home/calendar.svg",
  },
]

// Utilidades para generar CSV de transacciones
const generateTransactionsCSV = (transactions: Transaction[]): string => {
  if (!transactions || transactions.length === 0) {
    throw new Error("No hay transacciones para exportar")
  }

  // Definir headers en español
  const headers = [
    "Número de Factura",
    "Importe",
    "Fecha",
    "Estado",
    "Cliente",
    "Tipo de Transacción",
    "Importe Numérico", // Para análisis
  ]

  // Mapear datos de transacciones a formato CSV
  const csvData = transactions.map((transaction) => {
    // Convertir importe a número para análisis
    const importeNumerico =
      typeof transaction.importe === "number"
        ? transaction.importe
        : parseFloat(
            String(transaction.importe || "0").replace(/[^\d.-]/g, "")
          ) || 0

    // Formatear fecha si es necesario
    const fechaFormateada = transaction.fecha
      ? new Date(transaction.fecha).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A"

    return {
      "Número de Factura": transaction.factura || "N/A",
      Importe: transaction.importe || "0",
      Fecha: fechaFormateada,
      Estado: transaction.estado || "N/A",
      Cliente: transaction.cliente || "N/A",
      "Tipo de Transacción": transaction.tipo || "N/A",
      "Importe Numérico": importeNumerico.toFixed(2),
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

const WelcomeTransactions = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("month")
  const { loading, transactions, statistics, fetchStatsByPeriod } =
    usePlatformStats({
      autoFetch: false, // ← Agregar esta línea
    })

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    fetchStatsByPeriod(mapPeriodToBackend(selectedPeriod))
  }, [selectedPeriod, fetchStatsByPeriod])

  // Manejar cambio de período
  const handlePeriodChange = async (period: string) => {
    const newPeriod = period as PeriodType
    setSelectedPeriod(newPeriod)
    console.log("🔄 Cambiando período de transacciones a:", newPeriod)
    await fetchStatsByPeriod(mapPeriodToBackend(newPeriod))
  }

  // Obtener el label actual basado en el período seleccionado
  const currentPeriodLabel =
    periodOptions.find((option) => option.value === selectedPeriod)?.label ||
    "Últimos 30 días"

  // Función de descarga de reportes
  const handleDownloadReport = async () => {
    try {
      console.log(
        "Iniciando descarga de reporte de transacciones para:",
        selectedPeriod
      )
      console.log("Transacciones disponibles:", transactions?.length || 0)

      // Si no hay transacciones cargadas, cargarlas primero
      if (!transactions || transactions.length === 0) {
        const loadingToast = toast.loading("Cargando transacciones...", {
          description: "Obteniendo datos de transacciones",
        })

        await fetchStatsByPeriod(mapPeriodToBackend(selectedPeriod))

        toast.dismiss(loadingToast)

        // Verificar nuevamente después de cargar
        if (!transactions || transactions.length === 0) {
          toast.error("No hay datos", {
            description:
              "No se encontraron transacciones para generar el reporte",
          })
          return
        }
      }

      // Mostrar loading para generación
      const generatingToast = toast.loading(
        "Generando reporte de transacciones...",
        {
          description: "Preparando archivo CSV",
        }
      )

      // Verificar que tengamos transacciones para procesar
      if (transactions.length === 0) {
        toast.dismiss(generatingToast)
        toast.error("No hay datos", {
          description:
            "No se encontraron transacciones para generar el reporte",
        })
        return
      }

      // Generar estadísticas adicionales
      const totalTransacciones = transactions.length

      // Calcular estadísticas financieras
      const importesNumericos = transactions.map((t) => {
        return typeof t.importe === "number"
          ? t.importe
          : parseFloat(String(t.importe || "0").replace(/[^\d.-]/g, "")) || 0
      })

      const totalImporte = importesNumericos.reduce(
        (sum, importe) => sum + importe,
        0
      )
      const importePromedio = totalImporte / totalTransacciones
      const importeMaximo = Math.max(...importesNumericos)
      const importeMinimo = Math.min(...importesNumericos)

      // Estadísticas por estado
      const estadosCounts = transactions.reduce((acc, t) => {
        const estado = t.estado || "Sin estado"
        acc[estado] = (acc[estado] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Estadísticas por tipo
      const tiposCounts = transactions.reduce((acc, t) => {
        const tipo = t.tipo || "Sin tipo"
        acc[tipo] = (acc[tipo] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const clientesUnicos = new Set(transactions.map((t) => t.cliente)).size

      // Agregar resumen al inicio del CSV
      const resumenData = [
        { Métrica: "Período del reporte", Valor: currentPeriodLabel },
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
          Métrica: "Total de transacciones",
          Valor: totalTransacciones.toString(),
        },
        {
          Métrica: "Importe total",
          Valor: `$${totalImporte.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
          })}`,
        },
        {
          Métrica: "Importe promedio",
          Valor: `$${importePromedio.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
          })}`,
        },
        {
          Métrica: "Importe máximo",
          Valor: `$${importeMaximo.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
          })}`,
        },
        {
          Métrica: "Importe mínimo",
          Valor: `$${importeMinimo.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
          })}`,
        },
        { Métrica: "Clientes únicos", Valor: clientesUnicos.toString() },
        { Métrica: "", Valor: "" }, // Fila vacía como separador
        { Métrica: "ESTADÍSTICAS POR ESTADO", Valor: "" },
        ...Object.entries(estadosCounts).map(([estado, count]) => ({
          Métrica: `Estado: ${estado}`,
          Valor: count.toString(),
        })),
        { Métrica: "", Valor: "" }, // Fila vacía como separador
        { Métrica: "ESTADÍSTICAS POR TIPO", Valor: "" },
        ...Object.entries(tiposCounts).map(([tipo, count]) => ({
          Métrica: `Tipo: ${tipo}`,
          Valor: count.toString(),
        })),
        { Métrica: "", Valor: "" }, // Fila vacía como separador
      ]

      // Agregar estadísticas de la plataforma si están disponibles
      if (statistics) {
        resumenData.push(
          { Métrica: "ESTADÍSTICAS DE PLATAFORMA", Valor: "" },
          {
            Métrica: "Ingresos brutos",
            Valor: `$${
              statistics.ingresosBrutos?.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
              }) || "0"
            }`,
          },
          {
            Métrica: "Pagos a propietarios",
            Valor: `$${
              statistics.pagosAPropietarios?.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
              }) || "0"
            }`,
          },
          {
            Métrica: "Comisiones generadas",
            Valor: `$${
              statistics.comisionesGeneradas?.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
              }) || "0"
            }`,
          },
          {
            Métrica: "Ingresos netos",
            Valor: `$${
              statistics.ingresosNetos?.toLocaleString("es-ES", {
                minimumFractionDigits: 2,
              }) || "0"
            }`,
          },
          {
            Métrica: "Cambio porcentual",
            Valor: `${statistics.percentageChange?.toFixed(2) || "0"}%`,
          },
          { Métrica: "", Valor: "" } // Fila vacía como separador
        )
      }

      // Generar nombre de archivo
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
      const filename = `reporte_transacciones_${selectedPeriod}_${timestamp}.csv`

      // Generar CSV con resumen + datos detallados
      const resumenCSV = resumenData
        .map((row) => `${row.Métrica},${row.Valor}`)
        .join("\n")

      const transaccionesCSV = generateTransactionsCSV(transactions)
      const finalCSV = resumenCSV + "\n" + transaccionesCSV

      // Descargar archivo
      downloadFile(finalCSV, filename, "text/csv")

      // Cerrar loading toast
      toast.dismiss(generatingToast)

      // Toast de éxito
      toast.success("Reporte generado", {
        description: `Se descargó "${filename}" con ${totalTransacciones} transacciones para ${currentPeriodLabel.toLowerCase()}`,
        duration: 5000,
      })

      console.log("Reporte de transacciones generado:", {
        filename,
        totalTransacciones,
        período: selectedPeriod,
        estadísticas: {
          totalImporte,
          importePromedio,
          clientesUnicos,
          estadosCounts,
          tiposCounts,
        },
      })
    } catch (error) {
      console.error("Error generando reporte de transacciones:", error)
      toast.error("Error al generar reporte", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudo generar el archivo de transacciones",
        duration: 5000,
      })
    }
  }

  return (
    <div className="-mt-14">
      <h1 className="font-semibold text-2xl">Transacciones</h1>

      <div className="flex flex-row gap-3 mt-4">
        {/* Select de período */}
        <Select
          value={selectedPeriod}
          onValueChange={handlePeriodChange}
          disabled={loading}
        >
          <SelectTrigger className="w-46 h-9 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Image
                  src="/home/calendar.svg"
                  alt="calendar"
                  width={20}
                  height={20}
                />
                <span className="font-semibold lg:-ml-1 -ml-1">
                  <SelectValue placeholder="Seleccionar período">
                    {currentPeriodLabel}
                  </SelectValue>
                </span>
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botón de descarga con funcionalidad completa */}
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
            className=""
          />
          {loading ? "Cargando..." : "Descargar reporte"}
        </Button>
      </div>

      {/* Info de debug/estado */}
      {transactions && transactions.length > 0 && !loading && (
        <div className="mt-4 text-xs text-muted-foreground">
          {transactions.length} transacciones disponibles para reporte
        </div>
      )}

      {/* Mostrar estadísticas básicas si están disponibles */}
      {statistics && !loading && (
        <div className="mt-4 text-xs text-muted-foreground">
          Ingresos netos: $
          {statistics.ingresosNetos?.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
          })}
          | Comisiones: $
          {statistics.comisionesGeneradas?.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
          })}
        </div>
      )}
    </div>
  )
}

export default WelcomeTransactions
