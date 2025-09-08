/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, RefreshCw, Search, X } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

import { useGetAllReservas } from "../../hooks/useGetAllReservas"
import { reservasColumns } from "./columns"
import { ReservaTable } from "../../types"
import EditReservationModal from "../ModalEditReservas"

// Función helper para obtener el estado de la reserva
const getReservaStatus = (fechaInicio: string, fechaFin: string) => {
  const now = new Date()
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)

  if (now < inicio) {
    return "Programada"
  } else if (now >= inicio && now <= fin) {
    return "Activa"
  } else {
    return "Finalizada"
  }
}

const ReservationsTable = () => {
  const { getAllReservas, reservas, isLoading, error } = useGetAllReservas()

  // Estados para búsqueda
  const [searchValue, setSearchValue] = React.useState("")
  const [allReservas, setAllReservas] = React.useState<ReservaTable[]>([])
  const [filteredReservas, setFilteredReservas] = React.useState<
    ReservaTable[]
  >([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  // Estados para el modal y confirmación
  const [selectedReservation, setSelectedReservation] =
    useState<ReservaTable | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reservationToDelete, setReservationToDelete] =
    useState<ReservaTable | null>(null)

  // Actualizar cuando llegan datos
  React.useEffect(() => {
    if (reservas?.length > 0) {
      setAllReservas(reservas)
      setFilteredReservas(reservas)
    }
  }, [reservas])

  // Función de filtrado para reservas
  const handleFilter = React.useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredReservas(allReservas)
        setCurrentPage(1)
        return
      }

      const search = searchTerm.toLowerCase().trim()
      const filtered = allReservas.filter((reserva) => {
        // Buscar en nombre del usuario
        const usuario = reserva.usuario as any
        const nombreUsuario = usuario?.nombre?.toLowerCase() || ""

        // Buscar en plaza (nombre o dirección)
        const plaza = reserva.plaza as any
        const nombrePlaza = (
          plaza?.nombre ||
          plaza?.direccion ||
          ""
        ).toLowerCase()

        // Buscar en matrícula
        const matricula = (reserva.matricula || "").toLowerCase()

        // Buscar en estado
        const estado = getReservaStatus(
          reserva.fechaInicio,
          reserva.fechaFin
        ).toLowerCase()

        return (
          nombreUsuario.includes(search) ||
          nombrePlaza.includes(search) ||
          matricula.includes(search) ||
          estado.includes(search)
        )
      })

      setFilteredReservas(filtered)
      setCurrentPage(1)
    },
    [allReservas]
  )

  // Manejar cambio de búsqueda con debounce
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
    setFilteredReservas(allReservas)
    setCurrentPage(1)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  // Cleanup del timeout
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Handler para abrir el modal de edición
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEditReservation = (reservation: ReservaTable) => {
    setSelectedReservation(reservation)
    setIsEditModalOpen(true)
  }

  // Handler para cerrar el modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedReservation(null)
  }

  // Handler para cuando se actualiza una reserva
  const handleUpdateReservation = (updatedReservation: any) => {
    console.log("Reserva actualizada:", updatedReservation)
    getAllReservas()
  }

  // Handler para solicitar eliminación (abre el dialog)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRequestDelete = (reservation: ReservaTable) => {
    console.log("🚨 CLICK EN ELIMINAR - Datos:", reservation)
    console.log("🚨 Abriendo dialog...")
    setReservationToDelete(reservation)
    setIsDeleteDialogOpen(true)
    console.log("🚨 Estado del dialog:", true)
  }

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!reservationToDelete) return

    const nombreUsuario =
      (reservationToDelete.usuario as any)?.nombre || "este usuario"

    // Cerrar el dialog
    setIsDeleteDialogOpen(false)
    setReservationToDelete(null)

    // Usar toast.promise para manejar el proceso completo
    toast.promise(
      async () => {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token")

        if (!token) {
          throw new Error(
            "No estás autenticado. Por favor, inicia sesión nuevamente."
          )
        }

        const response = await fetch(
          `https://aparcoyo-back.onrender.com/apa/reservas/${reservationToDelete.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("authToken")
            localStorage.removeItem("token")
            throw new Error(
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
            )
          } else {
            const errorData = await response.json()
            throw new Error(errorData.message || response.statusText)
          }
        }

        // Refrescar la tabla después de eliminar
        await getAllReservas()
        return `Reserva de ${nombreUsuario} eliminada`
      },
      {
        loading: `Eliminando reserva de ${nombreUsuario}...`,
        success: (message) => message,
        error: (error) => `Error: ${error.message}`,
      }
    )
  }

  // Memorizar las columnas con los callbacks
  const columns = useMemo(
    () => reservasColumns(handleEditReservation, handleRequestDelete),
    [handleEditReservation]
  )

  // Paginación
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const reservasPagina = filteredReservas.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage)

  const table = useReactTable({
    data: reservasPagina,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  useEffect(() => {
    getAllReservas()
  }, [])

  // Estado de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-72" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-md border p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-red-500">
                Error al cargar reservas
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => getAllReservas()}
              className="mt-4"
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
      {/* Header con información y buscador */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {reservasPagina.length} de {filteredReservas.length}{" "}
          reservas
          {searchValue && ` para "${searchValue}"`}
          {filteredReservas.length !== allReservas.length &&
            ` (${allReservas.length} total)`}
        </div>

        <div className="flex items-center gap-3">
          {/* Buscador */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar reservas..."
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

          {/* Botón actualizar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => getAllReservas()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tabla de reservas */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-muted-foreground px-4 py-3 ${
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
            {reservasPagina.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchValue ? (
                    <div>
                      <p>No se encontraron reservas para {searchValue}</p>
                      <Button
                        variant="link"
                        onClick={clearSearch}
                        className="mt-2"
                      >
                        Limpiar búsqueda
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <p>No hay reservas disponibles</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => getAllReservas()}
                      >
                        Actualizar datos
                      </Button>
                    </div>
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
      {filteredReservas.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, filteredReservas.length)} de{" "}
            {filteredReservas.length} reservas
            {filteredReservas.length !== allReservas.length &&
              ` (filtradas de ${allReservas.length})`}
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

      {/* Modal de editar reserva */}
      <EditReservationModal
        {...({
          isOpen: isEditModalOpen,
          onClose: handleCloseModal,
          reservationData: selectedReservation,
          onUpdate: handleUpdateReservation,
        } as any)}
      />

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la reserva de{" "}
              <span className="font-semibold">
                {(reservationToDelete?.usuario as any)?.nombre ||
                  "este usuario"}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ReservationsTable
