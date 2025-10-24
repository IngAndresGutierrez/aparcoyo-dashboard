/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Search, X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import { useGetAllPlazas } from "../../hooks/useGetAllPlazas"
import { createColumns } from "./columns"
import { eliminarPlazaService } from "../../services/plazas"

const UsersTablePlazas = () => {
  const router = useRouter()
  const { getAllPlazas, plazas: initialPlazas, isLoading } = useGetAllPlazas()

  // Estados para búsqueda local y paginación
  const [searchValue, setSearchValue] = React.useState("")
  const [allPlazas, setAllPlazas] = React.useState<any[]>([])
  const [filteredPlazas, setFilteredPlazas] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const itemsPerPage = 10
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  // Cargar plazas inicialmente
  React.useEffect(() => {
    getAllPlazas()
  }, [])

  // Actualizar cuando llegan datos
  React.useEffect(() => {
    if (initialPlazas?.length > 0) {
      console.log(
        "Cargadas",
        initialPlazas.length,
        "plazas para filtrado local"
      )
      setAllPlazas(initialPlazas)
      setFilteredPlazas(initialPlazas)
    }
  }, [initialPlazas])

  // Filtrar plazas localmente
  const handleFilter = React.useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredPlazas(allPlazas)
        setCurrentPage(1)
        return
      }

      const search = searchTerm.toLowerCase().trim()
      const filtered = allPlazas.filter(
        (plaza) =>
          plaza.direccion?.toLowerCase().includes(search) ||
          plaza.propietario?.nombre?.toLowerCase().includes(search) ||
          plaza.propietario?.email?.toLowerCase().includes(search) ||
          plaza.tipo?.toLowerCase().includes(search)
      )

      console.log(
        `Filtradas: ${filtered.length} plazas de ${allPlazas.length} para "${searchTerm}"`
      )
      setFilteredPlazas(filtered)
      setCurrentPage(1)
    },
    [allPlazas]
  )

  // Manejar cambio de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchValue(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleFilter(value)
    }, 300)
  }

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchValue("")
    setFilteredPlazas(allPlazas)
    setCurrentPage(1)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // FUNCIÓN MEJORADA CON VERIFICACIÓN PREVIA
  const handleEliminarPlaza = async (id: string, direccion: string) => {
    if (!id) {
      toast.error("Error", {
        description: "ID de plaza no válido",
      })
      return
    }

    // Confirmación directa sin verificación previa
    toast("¿Eliminar plaza?", {
      description: `¿Estás seguro de que quieres eliminar "${direccion}"? Esta acción no se puede deshacer.`,
      action: {
        label: "Eliminar",
        onClick: async () => {
          await executeDelete(id, direccion)
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
      duration: 10000,
    })
  }

  // FUNCIÓN PARA EJECUTAR LA ELIMINACIÓN - ACTUALIZADA para estado local
  const executeDelete = async (id: string, direccion: string) => {
    try {
      setDeletingId(id)

      const loadingToast = toast.loading("Eliminando plaza...", {
        description: `Eliminando "${direccion}"`,
      })

      console.log(`Iniciando eliminación de plaza:`, { id, direccion })

      const response = await eliminarPlazaService(id)
      console.log(`Plaza eliminada exitosamente:`, response.data)

      toast.dismiss(loadingToast)
      toast.success("Plaza eliminada", {
        description: `"${direccion}" ha sido eliminada exitosamente`,
      })

      // Actualizar estado local en lugar de recargar desde servidor
      const updatePlazasList = (plazas: any[]) =>
        plazas.filter((plaza) => plaza.id !== id)

      setAllPlazas((prev) => updatePlazasList(prev))
      setFilteredPlazas((prev) => updatePlazasList(prev))
    } catch (error: any) {
      console.error("Error completo al eliminar plaza:", error)

      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        console.error(`Error del servidor:`, { status, data })

        switch (status) {
          case 400:
            const serverMessage =
              data?.message || data?.msg || data?.error || "Petición inválida"

            if (
              serverMessage.includes("reservas activas") ||
              serverMessage.includes("reserva")
            ) {
              toast.error("No se puede eliminar", {
                description: `La plaza "${direccion}" tiene reservas activas. Cancela las reservas primero.`,
                duration: 8000,
                action: {
                  label: "Ver reservas",
                  onClick: () => {
                    router.push(`/reservas?plazaId=${id}`)
                  },
                },
              })
            } else if (serverMessage.includes("dependencias")) {
              toast.error("No se puede eliminar", {
                description: `La plaza "${direccion}" tiene datos relacionados.`,
                duration: 6000,
              })
            } else {
              toast.error("Error al eliminar", {
                description: serverMessage,
                duration: 5000,
              })
            }
            break

          case 401:
            toast.error("Sin autorización", {
              description:
                "No tienes autorización para eliminar plazas. Verifica tu sesión.",
              duration: 5000,
            })
            break

          case 403:
            toast.error("Sin permisos", {
              description: "No tienes permisos para eliminar esta plaza.",
              duration: 5000,
            })
            break

          case 404:
            toast.error("Plaza no encontrada", {
              description: "La plaza no existe o ya fue eliminada.",
              duration: 5000,
            })
            break

          case 500:
            toast.error("Error del servidor", {
              description: "Error interno del servidor. Inténtalo más tarde.",
              duration: 5000,
            })
            break

          default:
            toast.error(`Error ${status}`, {
              description:
                data?.message || data?.msg || "Error desconocido del servidor",
              duration: 5000,
            })
        }
      } else if (error.request) {
        toast.error("Error de conexión", {
          description:
            "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
          duration: 5000,
        })
      } else {
        toast.error("Error", {
          description: error.message,
          duration: 5000,
        })
      }
    } finally {
      setDeletingId(null)
    }
  }

  // Función para manejar la navegación a editar
  const handleEditarPlaza = (id: string) => {
    console.log("Navegando a editar plaza con ID:", id)
    router.push(`/plazas/${id}`)
  }

  // Paginación
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const plazasPagina = filteredPlazas.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredPlazas.length / itemsPerPage)

  // Crear columnas memoizadas
  const columns = React.useMemo(
    () =>
      createColumns({
        onEliminarPlaza: handleEliminarPlaza,
        deletingId,
        onEditarPlaza: handleEditarPlaza,
      }),
    [deletingId]
  )

  const table = useReactTable({
    data: plazasPagina,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(7)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm">Cargando plazas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header con información y buscador */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {plazasPagina.length} de {filteredPlazas.length} plazas
          {searchValue && ` para "${searchValue}"`}
          {filteredPlazas.length !== allPlazas.length &&
            ` (${allPlazas.length} total)`}
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar plazas..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLoading}
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
            {plazasPagina.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchValue ? (
                    <div>
                      <p>No se encontraron plazas para {searchValue}</p>
                      <Button
                        variant="link"
                        onClick={clearSearch}
                        className="mt-2"
                      >
                        Limpiar búsqueda
                      </Button>
                    </div>
                  ) : (
                    "No se encontraron plazas"
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
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} -{" "}
          {Math.min(endIndex, filteredPlazas.length)} de {filteredPlazas.length}{" "}
          plazas
          {filteredPlazas.length !== allPlazas.length &&
            ` (filtrados de ${allPlazas.length})`}
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
    </div>
  )
}

export default UsersTablePlazas
