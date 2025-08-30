/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  RowData,
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  Loader2,
  RefreshCw,
  Settings,
  Trash2,
} from "lucide-react" // ✨ AGREGADOS Settings y Trash2
import { toast } from "sonner" // ✨ IMPORTAR SONNER

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image"

import { useEffect } from "react"
import { useReportes } from "../../hooks/useReportsTable"
import { Reporte } from "../../types/reports-table"
import ReporteDetailsModal from "../ModalReports"

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

// Tipo para mostrar en la tabla (usando los datos reales de reportes)
export type ReportTableItem = {
  id: string
  descripcion: string
  categoria: string
  categoriaLabel: string
  estado: string
  fecha: string
  usuario: string
  respuestaAdmin: string | null
}

interface UsersTableReportsProps {
  filtroFecha?: string
}

// Función para transformar los reportes del API al formato de la tabla
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getEstadoColor = (estado: string) => {
  switch (estado.toLowerCase()) {
    case "pendiente":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "resuelto":
      return "text-green-600 bg-green-50 border-green-200"
    case "cancelado":
      return "text-red-600 bg-red-50 border-red-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

const UsersTableReports: React.FC<UsersTableReportsProps> = ({
  filtroFecha = "mes",
}) => {
  const { reportes, loading, error, refresh, getSummary } = useReportes()
  const [selectedReporteId, setSelectedReporteId] = React.useState<
    string | null
  >(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [deletingReportId, setDeletingReportId] = React.useState<string | null>(
    null
  )

  // Cargar datos cuando cambie el filtro
  useEffect(() => {
    getSummary(filtroFecha)
  }, [filtroFecha, getSummary])

  // Función para abrir el modal
  const handleOpenModal = (reporteId: string) => {
    setSelectedReporteId(reporteId)
    setIsModalOpen(true)
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReporteId(null)
  }

  // Función para refrescar después de actualizar
  const handleReporteUpdate = () => {
    refresh(filtroFecha)
  }

  // ✨ FUNCIÓN ACTUALIZADA CON SONNER
  const handleDeleteReporte = async (
    reporteId: string,
    descripcion: string
  ) => {
    // Validar que tengamos un ID válido
    if (!reporteId) {
      toast.error("Error", {
        description: "ID de reporte no válido",
      })
      return
    }

    // ✨ CONFIRMACIÓN ELEGANTE CON SONNER
    toast("¿Eliminar reporte?", {
      description: `¿Estás seguro de que quieres eliminar este reporte?\n\n"${descripcion.substring(
        0,
        80
      )}${
        descripcion.length > 80 ? "..." : ""
      }"\n\nEsta acción no se puede deshacer.`,
      action: {
        label: "Eliminar",
        onClick: async () => {
          await executeDeleteReporte(reporteId, descripcion)
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {
          // No hacer nada, el toast se cierra automáticamente
        },
      },
      duration: 10000, // 10 segundos para que el usuario tenga tiempo de leer
    })
  }

  // ✨ FUNCIÓN SEPARADA PARA EJECUTAR LA ELIMINACIÓN
  const executeDeleteReporte = async (
    reporteId: string,
    descripcion: string
  ) => {
    try {
      setDeletingReportId(reporteId) // Mostrar loading en este reporte específico

      // ✨ TOAST DE LOADING
      const loadingToast = toast.loading("Eliminando reporte...", {
        description: `Eliminando "${descripcion.substring(0, 50)}${
          descripcion.length > 50 ? "..." : ""
        }"`,
      })

      console.log(`🗑️ Iniciando eliminación de reporte:`, {
        reporteId,
        descripcion,
      })

      // 🔑 OBTENER TOKEN DINÁMICAMENTE
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token")

      if (!token) {
        toast.dismiss(loadingToast)
        toast.error("Sin autenticación", {
          description:
            "No estás autenticado. Por favor, inicia sesión nuevamente.",
          duration: 5000,
        })
        return
      }

      console.log("🔑 Usando token:", token.substring(0, 20) + "...")

      // Llamar al servicio de eliminación
      const response = await fetch(
        `https://aparcoyo-back.onrender.com/apa/reportes/${reporteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log("📡 DELETE Response status:", response.status)

      // ✨ CERRAR LOADING TOAST
      toast.dismiss(loadingToast)

      if (response.ok) {
        console.log("✅ Reporte eliminado exitosamente")

        // ✨ TOAST DE ÉXITO
        toast.success("Reporte eliminado", {
          description: `El reporte ha sido eliminado exitosamente`,
        })

        // Recargar la lista de reportes
        refresh(filtroFecha)
      } else if (response.status === 401) {
        // Token expirado o inválido
        toast.error("Sin autorización", {
          description:
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          duration: 5000,
        })
        // Limpiar token inválido
        localStorage.removeItem("authToken")
        localStorage.removeItem("token")
      } else if (response.status === 403) {
        toast.error("Sin permisos", {
          description: "No tienes permisos para eliminar este reporte.",
          duration: 5000,
        })
      } else if (response.status === 404) {
        toast.error("Reporte no encontrado", {
          description: "El reporte no existe o ya fue eliminado.",
          duration: 5000,
        })
      } else {
        const errorData = await response.json()
        console.error("❌ Error eliminando reporte:", errorData)

        toast.error(`Error ${response.status}`, {
          description:
            errorData?.message ||
            errorData?.msg ||
            "Error desconocido del servidor",
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error("❌ Error de red eliminando reporte:", error)

      toast.error("Error de conexión", {
        description:
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        duration: 5000,
      })
    } finally {
      setDeletingReportId(null) // Quitar loading
    }
  }

  // Definir las columnas dentro del componente para acceder a handleOpenModal
  const columns: ColumnDef<ReportTableItem>[] = [
    {
      id: "select",
      header: () => <input type="checkbox" />,
      cell: () => <input type="checkbox" />,
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image
            src="/home/avatar-report.svg"
            alt="avatar"
            width={10}
            height={10}
            className="w-6 h-6 rounded-full flex-shrink-0"
          />
          <span
            className="truncate text-sm max-w-[200px]"
            title={row.original.descripcion}
          >
            {row.original.descripcion}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.fecha)}</span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
            row.original.estado
          )}`}
        >
          {row.original.estado}
        </span>
      ),
      meta: { responsive: true },
    },
    {
      accessorKey: "categoriaLabel",
      header: "Categoría",
      cell: ({ row }) => (
        <span
          className="text-sm truncate block max-w-[150px]"
          title={row.original.categoriaLabel}
        >
          {row.original.categoriaLabel}
        </span>
      ),
      meta: { responsive: true },
    },
    {
      accessorKey: "usuario",
      header: "Reportado por",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.usuario}</span>
      ),
      meta: { responsive: true },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isDeleting = deletingReportId === row.original.id

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* ✨ ITEM RESOLVER REPORTE CON ICONO */}
              <DropdownMenuItem
                onClick={() => handleOpenModal(row.original.id)}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Resolver reporte</span>
              </DropdownMenuItem>

              {/* ✨ ITEM ELIMINAR CON ICONO */}
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                onClick={() =>
                  handleDeleteReporte(row.original.id, row.original.descripcion)
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar reporte</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      meta: { responsive: true },
    },
  ]

  // Los reportes vienen del summary
  const tableData = React.useMemo(() => {
    // Asegurarse de que reportes sea un array antes de hacer map
    if (!Array.isArray(reportes)) {
      return []
    }

    return reportes.map((reporte: Reporte) => ({
      id: reporte.id,
      descripcion: reporte.descripcion,
      categoria: reporte.categoria,
      categoriaLabel: reporte.categoriaLabel,
      estado: reporte.estado,
      fecha: reporte.fecha,
      usuario: reporte.usuario.nombre,
      respuestaAdmin: reporte.respuestaAdmin,
    }))
  }, [reportes])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Mostrar loading
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando reportes...</span>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600">
                <span className="font-medium">Error al cargar reportes:</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh(filtroFecha)}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header con botón refresh */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Reportes Detallados</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refresh(filtroFecha)}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-muted-foreground px-2 py-3 ${
                      header.column.columnDef.meta?.responsive
                        ? "hidden lg:table-cell"
                        : ""
                    }`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`py-3 px-2 ${
                        cell.column.columnDef.meta?.responsive
                          ? "hidden lg:table-cell"
                          : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay reportes disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación simplificada */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {reportes.length} reportes
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || loading}
          >
            Atrás
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || loading}
          >
            Adelante
          </Button>
        </div>
      </div>

      {/* Modal de detalles */}
      <ReporteDetailsModal
        reporteId={selectedReporteId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleReporteUpdate}
      />
    </div>
  )
}

export default UsersTableReports
