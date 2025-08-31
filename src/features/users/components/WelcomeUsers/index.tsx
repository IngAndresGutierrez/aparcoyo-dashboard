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
import React, { useEffect } from "react" // Agregar useEffect

import { toast } from "sonner" // Importar Sonner

import { UsuarioTabla } from "../../types/table" // Ajustar ruta
import { RangoEstadisticas } from "../../types/graphic" // Ajusta la ruta según tu estructura
import { useUsuariosTabla } from "../../hooks/useTable"

interface WelcomeUsersProps {
  rango: RangoEstadisticas
  onRangoChange: (rango: RangoEstadisticas) => void
}

// Opciones del select con sus labels
const rangoOptions = [
  { value: "dia" as const, label: "Último día", icon: "" },
  { value: "semana" as const, label: "Últimos 7 días", icon: "" },
  { value: "mes" as const, label: "Últimos 30 días", icon: "" },
] as const

// Utilidades para generar CSV
const generateUsersCSV = (users: UsuarioTabla[]): string => {
  if (!users || users.length === 0) {
    throw new Error("No hay usuarios para exportar")
  }

  // Definir headers en español
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

  // Mapear datos de usuarios a formato CSV
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

const WelcomeUsers = ({ rango, onRangoChange }: WelcomeUsersProps) => {
  // Hook para obtener usuarios (sin auto-fetch)
  const { usuarios, loading, fetchUsuarios } = useUsuariosTabla({}, false)

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios({
      limit: 50, // Cargar algunos usuarios iniciales
      sortBy: "fechaRegistro",
      sortOrder: "desc",
    })
  }, [])

  // Obtener el label actual basado en el rango seleccionado
  const currentRangoLabel =
    rangoOptions.find((option) => option.value === rango)?.label ||
    "Últimos 30 días"

  // Función de descarga de reportes
  const handleDownloadReport = async () => {
    try {
      console.log("Iniciando descarga de reporte de usuarios para:", rango)
      console.log("Usuarios disponibles:", usuarios.length)

      // Si no hay usuarios cargados, cargarlos primero
      if (!usuarios || usuarios.length === 0) {
        const loadingToast = toast.loading("Cargando usuarios...", {
          description: "Obteniendo datos de usuarios",
        })

        await fetchUsuarios({
          limit: 9999, // Traer todos los usuarios
          sortBy: "fechaRegistro",
          sortOrder: "desc",
        })

        toast.dismiss(loadingToast)

        // Verificar nuevamente después de cargar
        if (!usuarios || usuarios.length === 0) {
          toast.error("No hay datos", {
            description: "No se encontraron usuarios para generar el reporte",
          })
          return
        }
      }

      // Mostrar loading para generación
      const generatingToast = toast.loading(
        "Generando reporte de usuarios...",
        {
          description: "Preparando archivo CSV",
        }
      )

      // Si ya tenemos usuarios pero queremos todos para el reporte
      if (usuarios.length < 100) {
        // Asumir que menos de 100 significa que hay más
        await fetchUsuarios({
          limit: 9999, // Traer todos los usuarios
          sortBy: "fechaRegistro",
          sortOrder: "desc",
        })
      }

      // Verificar que tengamos usuarios para procesar
      if (usuarios.length === 0) {
        toast.dismiss(generatingToast)
        toast.error("No hay datos", {
          description: "No se encontraron usuarios para generar el reporte",
        })
        return
      }

      // Generar estadísticas adicionales
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

      // Agregar resumen al inicio del CSV
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
        { Métrica: "", Valor: "" }, // Fila vacía como separador
      ]

      // Generar nombre de archivo
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "")
      const filename = `reporte_usuarios_${rango}_${timestamp}.csv`

      // Generar CSV con resumen + datos detallados
      const resumenCSV = resumenData
        .map((row) => `${row.Métrica},${row.Valor}`)
        .join("\n")
      const usuariosCSV = generateUsersCSV(usuarios)
      const finalCSV = resumenCSV + "\n" + usuariosCSV

      // Descargar archivo
      downloadFile(finalCSV, filename, "text/csv")

      // Cerrar loading toast
      toast.dismiss(generatingToast)

      // Toast de éxito
      toast.success("Reporte generado", {
        description: `Se descargó "${filename}" con ${
          usuarios.length
        } usuarios para ${currentRangoLabel.toLowerCase()}`,
        duration: 5000,
      })

      console.log("Reporte de usuarios generado:", {
        filename,
        totalUsuarios: usuarios.length,
        rango,
        estadisticas: {
          activos: usuariosActivos,
          verificados: usuariosVerificados,
          totalReservas,
          totalPlazas,
        },
      })
    } catch (error) {
      console.error("Error generando reporte de usuarios:", error)
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
        {/* SELECT DINÁMICO CONECTADO */}
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

        {/* BOTÓN DE DESCARGA CON FUNCIONALIDAD */}
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

      {/* Info de debug/estado */}
      {usuarios.length > 0 && !loading && (
        <div className="mt-4 text-xs text-muted-foreground">
          {usuarios.length} usuarios disponibles para reporte
        </div>
      )}
    </div>
  )
}

export default WelcomeUsers
