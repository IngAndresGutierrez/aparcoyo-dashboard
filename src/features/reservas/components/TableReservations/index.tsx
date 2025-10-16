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
import { AlertCircle, RefreshCw, Search, X, Trash2 } from "lucide-react"
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

  // Estados para selección múltiple
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])

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

  // Limpiar selecciones cuando cambian los datos filtrados
  React.useEffect(() => {
    setSelectedRows([])
  }, [filteredReservas])

  // Funciones para manejo de selección
  const handleRowSelectionChange = (rowId: string, selected: boolean) => {
    setSelectedRows((prev) => {
      if (selected) {
        return [...prev, rowId]
      } else {
        return prev.filter((id) => id !== rowId)
      }
    })
  }

  const handleSelectAllChange = (selected: boolean) => {
    if (selected) {
      const currentPageIds = reservasPagina.map((reserva) => reserva.id)
      setSelectedRows(currentPageIds)
    } else {
      setSelectedRows([])
    }
  }

  // Función para mostrar el toast de confirmación múltiple
  const handleMultipleDelete = () => {
    if (selectedRows.length === 0) return

    const selectedCount = selectedRows.length

    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                ¿Eliminar reservas seleccionadas?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Esto cancelará las reservas de los usuarios involucrados. Si
                desean volver a aparcar, deberán realizar el proceso nuevamente.
                Las plazas y usuarios no serán eliminados.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Ten en cuenta que esta acción no se puede deshacer.
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
                    confirmMultipleDelete()
                  }}
                  className="flex-1"
                >
                  Eliminar {selectedCount} reservas
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
  const confirmMultipleDelete = async () => {
    const selectedReservas = allReservas.filter((reserva) =>
      selectedRows.includes(reserva.id)
    )

    toast.promise(
      async () => {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token")

        if (!token) {
          throw new Error(
            "No estás autenticado. Por favor, inicia sesión nuevamente."
          )
        }

        let successCount = 0
        let failedCount = 0
        let paymentRestrictedCount = 0
        const errors = []

        // Eliminar las reservas una por una para evitar conflictos
        for (const reserva of selectedReservas) {
          try {
            const response = await fetch(
              `https://kns.aparcoyo.com/apa/reservas/${reserva.id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            )

            if (response.ok) {
              successCount++
            } else {
              const errorData = await response
                .json()
                .catch(() => ({ message: response.statusText }))
              const errorMessage = errorData.message || response.statusText

              // Verificar si es error de pagos asociados
              if (
                errorMessage.includes("pagos") ||
                errorMessage.includes("payments")
              ) {
                paymentRestrictedCount++
              } else {
                failedCount++
                errors.push(`Reserva ${reserva.id}: ${errorMessage}`)
              }
            }
          } catch (error: any) {
            failedCount++
            errors.push(
              `Reserva ${reserva.id}: ${error?.message || "Error desconocido"}`
            )
          }
        }

        // Limpiar selecciones y refrescar datos
        setSelectedRows([])
        await getAllReservas()

        // Construir mensaje de resultado
        let resultMessage = ""

        if (successCount > 0) {
          resultMessage += `${successCount} reservas eliminadas exitosamente`
        }

        if (paymentRestrictedCount > 0) {
          if (resultMessage) resultMessage += ". "
          resultMessage += `${paymentRestrictedCount} reservas no se pudieron eliminar porque tienen pagos asociados`
        }

        if (failedCount > 0) {
          if (resultMessage) resultMessage += ". "
          resultMessage += `${failedCount} reservas fallaron por otros motivos`
          console.error("Errores en eliminación:", errors)
        }

        if (
          successCount === 0 &&
          (paymentRestrictedCount > 0 || failedCount > 0)
        ) {
          if (paymentRestrictedCount > 0 && failedCount === 0) {
            throw new Error(
              `No se pudieron eliminar las reservas porque tienen pagos asociados. Las reservas con pagos no pueden ser eliminadas.`
            )
          } else {
            throw new Error(
              `No se pudo eliminar ninguna reserva: ${
                errors[0] || "Error desconocido"
              }`
            )
          }
        }

        return resultMessage || "Proceso completado"
      },
      {
        loading: `Eliminando ${selectedReservas.length} reservas...`,
        success: (message) => message,
        error: (error) => `${error.message}`,
      }
    )
  }

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
          `https://kns.aparcoyo.com/apa/reservas/${reservationToDelete.id}`,
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

  // Paginación
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const reservasPagina = filteredReservas.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage)

  const allRowsSelected =
    reservasPagina.length > 0 &&
    reservasPagina.every((reserva) => selectedRows.includes(reserva.id))

  // Memorizar las columnas con los callbacks
  const columns = useMemo(
    () =>
      reservasColumns(
        handleEditReservation,
        handleRequestDelete,
        selectedRows,
        handleRowSelectionChange,
        handleSelectAllChange,
        allRowsSelected
      ),
    [handleEditReservation, selectedRows, allRowsSelected]
  )

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
      {/* Header con información, buscador y botón de eliminar múltiple */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {reservasPagina.length} de {filteredReservas.length}{" "}
            reservas
            {searchValue && ` para "${searchValue}"`}
            {filteredReservas.length !== allReservas.length &&
              ` (${allReservas.length} total)`}
          </div>

          {/* Botón de eliminar múltiple */}
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMultipleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar {selectedRows.length} reservas
            </Button>
          )}
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
                <TableRow
                  key={row.id}
                  className={
                    selectedRows.includes(row.original.id) ? "bg-muted/50" : ""
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`py-3 ${
                        cell.column.id === "select" ? "px-2" : "px-2"
                      } ${
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
