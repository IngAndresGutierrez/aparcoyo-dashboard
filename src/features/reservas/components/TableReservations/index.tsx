/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
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
import { AlertCircle, RefreshCw } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

import { useGetAllReservas } from "../../hooks/useGetAllReservas"
import { reservasColumns } from "./columns"
import { ReservaTable } from "../../types"
import EditReservationModal from "../ModalEditReservas"

const ReservationsTable = () => {
  const { getAllReservas, reservas, isLoading, error } = useGetAllReservas()

  // Estados para el modal y confirmación
  const [selectedReservation, setSelectedReservation] =
    useState<ReservaTable | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [reservationToDelete, setReservationToDelete] =
    useState<ReservaTable | null>(null)

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
    // Removido: toast.success("Reserva actualizada correctamente") - ya lo maneja el modal
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

  const table = useReactTable({
    data: reservas,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
          <Skeleton className="h-8 w-24" />
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
      {/* Header con información */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Reservas</h2>
          <p className="text-sm text-muted-foreground">
            {reservas.length} reserva{reservas.length !== 1 ? "s" : ""}{" "}
            encontrada{reservas.length !== 1 ? "s" : ""}
          </p>
        </div>
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
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-muted-foreground">
                      No hay reservas disponibles
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => getAllReservas()}
                    >
                      Actualizar datos
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {reservas.length > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Atrás
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Adelante
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
