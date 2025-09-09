/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  Loader2,
  RefreshCw,
  Settings,
  Trash2,
  Search,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useReportes } from "@/features/reportes/hooks/useReportsTable"
import { Reporte } from "@/features/reportes/types/reports-table"
import ReporteDetailsModal from "@/features/reportes/components/ModalReports"

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

// Tipo para mostrar en la tabla
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

// Tipo para el filtro de estado
type EstadoFilter = "todos" | "pendiente" | "resuelto" | "cancelado"

interface UsersTableReportsProps {
  filtroFecha?: string
}

// Opciones para el filtro de estado
const estadoOptions = [
  { value: "todos" as const, label: "Estados" },
  { value: "pendiente" as const, label: "Pendiente" },
  { value: "resuelto" as const, label: "Resuelto" },
  { value: "cancelado" as const, label: "Cancelado" },
]

// Función para obtener color por estado
const getColorByEstado = (estado: string): string => {
  switch (estado) {
    case "todos":
      return "#6b7280" // gris
    case "pendiente":
      return "#d97706" // amarillo
    case "resuelto":
      return "#059669" // verde
    case "cancelado":
      return "#dc2626" // rojo
    default:
      return "#6b7280"
  }
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

const TableReports: React.FC<UsersTableReportsProps> = ({
  filtroFecha = "mes",
}) => {
  const { reportes, loading, error, refresh, getSummary } = useReportes()

  // Estados para búsqueda y filtros
  const [searchValue, setSearchValue] = React.useState("")
  const [estadoFilter, setEstadoFilter] = React.useState<EstadoFilter>("todos")
  const [allReportes, setAllReportes] = React.useState<ReportTableItem[]>([])
  const [filteredReportes, setFilteredReportes] = React.useState<
    ReportTableItem[]
  >([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  // Estados para selección múltiple
  const [selectedReportes, setSelectedReportes] = React.useState<Set<string>>(
    new Set()
  )
  const [isSelectAll, setIsSelectAll] = React.useState(false)

  // Estados para modal y eliminación
  const [selectedReporteId, setSelectedReporteId] = React.useState<
    string | null
  >(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [deletingReportId, setDeletingReportId] = React.useState<string | null>(
    null
  )

  // Transformar datos de reportes
  const tableData = React.useMemo(() => {
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

  // Actualizar cuando llegan datos
  React.useEffect(() => {
    if (tableData?.length > 0) {
      setAllReportes(tableData)
      setFilteredReportes(tableData)
    }
  }, [tableData])

  // Función de filtrado combinada (búsqueda + estado)
  const handleFilter = React.useCallback(
    (searchTerm: string, estado: EstadoFilter) => {
      let filtered = allReportes

      // Filtrar por estado primero
      if (estado !== "todos") {
        filtered = filtered.filter(
          (reporte) => reporte.estado.toLowerCase() === estado.toLowerCase()
        )
      }

      // Luego filtrar por búsqueda
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase().trim()
        filtered = filtered.filter((reporte) => {
          return (
            reporte.descripcion.toLowerCase().includes(search) ||
            reporte.categoriaLabel.toLowerCase().includes(search) ||
            reporte.usuario.toLowerCase().includes(search) ||
            reporte.estado.toLowerCase().includes(search)
          )
        })
      }

      setFilteredReportes(filtered)
      setCurrentPage(1)
    },
    [allReportes]
  )

  // Manejar cambio de búsqueda con debounce
  const handleSearchChange = (value: string) => {
    setSearchValue(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleFilter(value, estadoFilter)
    }, 300)
  }

  // Manejar cambio de filtro de estado
  const handleEstadoFilterChange = (estado: string) => {
    const newEstado = estado as EstadoFilter
    setEstadoFilter(newEstado)
    handleFilter(searchValue, newEstado)
  }

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchValue("")
    handleFilter("", estadoFilter)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  // Paginación
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const reportesPagina = filteredReportes.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredReportes.length / itemsPerPage)

  // Funciones para selección múltiple
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(reportesPagina.map((reporte) => reporte.id))
      setSelectedReportes(allIds)
      setIsSelectAll(true)
    } else {
      setSelectedReportes(new Set())
      setIsSelectAll(false)
    }
  }

  const handleSelectReporte = (reporteId: string, checked: boolean) => {
    const newSelected = new Set(selectedReportes)
    if (checked) {
      newSelected.add(reporteId)
    } else {
      newSelected.delete(reporteId)
      setIsSelectAll(false)
    }
    setSelectedReportes(newSelected)

    // Verificar si todos están seleccionados para actualizar el checkbox principal
    if (
      newSelected.size === reportesPagina.length &&
      reportesPagina.length > 0
    ) {
      setIsSelectAll(true)
    }
  }

  // Función para eliminar reportes seleccionados
  const handleDeleteSelected = async () => {
    if (selectedReportes.size === 0) {
      toast.error("No hay reportes seleccionados", {
        description: "Selecciona al menos un reporte para eliminar",
      })
      return
    }

    const selectedCount = selectedReportes.size

    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                ¿Eliminar {selectedCount} reportes?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.dismiss(t)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    toast.dismiss(t)
                    confirmDeleteSelected()
                  }}
                  className="flex-1"
                >
                  Eliminar reportes
                </Button>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      }
    )
  }

  // Función para confirmar eliminación múltiple
  const confirmDeleteSelected = async () => {
    const selectedReportesData = reportesPagina.filter((reporte) =>
      selectedReportes.has(reporte.id)
    )
    await executeDeleteMultiple(selectedReportesData)
  }

  // Función para ejecutar eliminación múltiple
  const executeDeleteMultiple = async (reportesToDelete: ReportTableItem[]) => {
    const totalReportes = reportesToDelete.length
    let deletedCount = 0
    let failedCount = 0

    const loadingToast = toast.loading(
      `Eliminando ${totalReportes} reporte${totalReportes > 1 ? "s" : ""}...`,
      {
        description: `Procesando eliminación masiva...`,
      }
    )

    try {
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

      // Eliminar uno por uno
      for (const reporte of reportesToDelete) {
        try {
          const response = await fetch(
            `https://aparcoyo-back.onrender.com/apa/reportes/${reporte.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (response.ok) {
            deletedCount++
          } else {
            failedCount++
            console.error(
              `Error eliminando reporte ${reporte.id}:`,
              response.status
            )
          }
        } catch (error) {
          failedCount++
          console.error(`Error de red eliminando reporte ${reporte.id}:`, error)
        }
      }

      toast.dismiss(loadingToast)

      if (deletedCount === totalReportes) {
        toast.success("Reportes eliminados", {
          description: `Se eliminaron exitosamente ${deletedCount} reporte${
            deletedCount > 1 ? "s" : ""
          }`,
          duration: 5000,
        })
      } else if (deletedCount > 0) {
        toast.warning("Eliminación parcial", {
          description: `Se eliminaron ${deletedCount} de ${totalReportes} reportes. ${failedCount} fallaron.`,
          duration: 7000,
        })
      } else {
        toast.error("Error en eliminación", {
          description: `No se pudo eliminar ningún reporte. Revisa tu conexión.`,
          duration: 5000,
        })
      }

      // Limpiar selecciones y refrescar
      setSelectedReportes(new Set())
      setIsSelectAll(false)
      refresh(filtroFecha)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Error de conexión", {
        description:
          "No se pudo conectar con el servidor para la eliminación masiva.",
        duration: 5000,
      })
    }
  }

  // Limpiar selecciones cuando cambie la página o filtros
  React.useEffect(() => {
    setSelectedReportes(new Set())
    setIsSelectAll(false)
  }, [currentPage, searchValue, estadoFilter])

  // Cleanup del timeout
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

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

  // Función para eliminar reporte individual o múltiples seleccionados
  const handleDeleteReporte = async (
    reporteId: string,
    descripcion: string
  ) => {
    // Si hay reportes seleccionados, eliminar todos los seleccionados
    if (selectedReportes.size > 0) {
      const selectedCount = selectedReportes.size

      toast.custom(
        (t) => (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  ¿Eliminar {selectedCount} reportes?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.dismiss(t)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      toast.dismiss(t)
                      const selectedReportesData = reportesPagina.filter(
                        (reporte) => selectedReportes.has(reporte.id)
                      )
                      executeDeleteMultiple(selectedReportesData)
                    }}
                    className="flex-1"
                  >
                    Eliminar reportes
                  </Button>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      )
      return
    }

    // Si no hay reportes seleccionados, eliminar solo el individual
    if (!reporteId) {
      toast.error("Error", {
        description: "ID de reporte no válido",
      })
      return
    }

    toast("¿Eliminar reporte?", {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar reporte",
        onClick: async () => {
          await executeDeleteReporte(reporteId, descripcion)
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
      duration: 10000,
    })
  }

  // Función para ejecutar la eliminación individual
  const executeDeleteReporte = async (
    reporteId: string,
    descripcion: string
  ) => {
    try {
      setDeletingReportId(reporteId)

      const loadingToast = toast.loading("Eliminando reporte...", {
        description: `Eliminando "${descripcion.substring(0, 50)}${
          descripcion.length > 50 ? "..." : ""
        }"`,
      })

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

      toast.dismiss(loadingToast)

      if (response.ok) {
        toast.success("Reporte eliminado", {
          description: `El reporte ha sido eliminado exitosamente`,
        })
        refresh(filtroFecha)
      } else if (response.status === 401) {
        toast.error("Sin autorización", {
          description:
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          duration: 5000,
        })
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
        toast.error(`Error ${response.status}`, {
          description:
            errorData?.message ||
            errorData?.msg ||
            "Error desconocido del servidor",
          duration: 5000,
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      toast.error("Error de conexión", {
        description:
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        duration: 5000,
      })
    } finally {
      setDeletingReportId(null)
    }
  }

  // Definir las columnas
  const columns: ColumnDef<ReportTableItem>[] = [
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={isSelectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedReportes.has(row.original.id)}
          onChange={(e) =>
            handleSelectReporte(row.original.id, e.target.checked)
          }
          className="rounded"
        />
      ),
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
              <DropdownMenuItem
                onClick={() => handleOpenModal(row.original.id)}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Resolver reporte</span>
              </DropdownMenuItem>

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

  const table = useReactTable({
    data: reportesPagina,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
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
      {/* Header con información, filtros y buscador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Mostrar botón de eliminar seleccionados cuando hay elementos seleccionados */}
          {selectedReportes.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar {selectedReportes.size} seleccionado
              {selectedReportes.size > 1 ? "s" : ""}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro por estado */}
          <Select
            value={estadoFilter}
            onValueChange={handleEstadoFilterChange}
          >
            <SelectTrigger className="w-35 !h-9">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              {estadoOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getColorByEstado(option.value),
                      }}
                    />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Buscador */}
          <div className="relative lg:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar reportes..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
              disabled={loading}
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Botón actualizar */}
        </div>
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
            {reportesPagina.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchValue || estadoFilter !== "todos" ? (
                    <div>
                      <p>
                        No se encontraron reportes
                        {searchValue && ` para "${searchValue}"`}
                        {estadoFilter !== "todos" &&
                          ` con estado "${estadoFilter}"`}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        {searchValue && (
                          <Button
                            variant="link"
                            onClick={clearSearch}
                          >
                            Limpiar búsqueda
                          </Button>
                        )}
                        {estadoFilter !== "todos" && (
                          <Button
                            variant="link"
                            onClick={() => handleEstadoFilterChange("todos")}
                          >
                            Mostrar todos
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    "No hay reportes disponibles"
                  )}
                </TableCell>
              </TableRow>
            ) : (
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredReportes.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, filteredReportes.length)} de{" "}
            {filteredReportes.length} reportes
            {filteredReportes.length !== allReportes.length &&
              ` (filtrados de ${allReportes.length})`}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
            >
              ← Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage >= totalPages}
            >
              Siguiente →
            </Button>
          </div>
        </div>
      )}

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

export default TableReports
