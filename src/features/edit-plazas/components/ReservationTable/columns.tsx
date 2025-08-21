// features/edit-plazas/components/PlazaReservationsTable.tsx
"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, ArrowUpDown, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { usePlaza } from "../../hooks/useTableReservas"


interface PlazaReservationsTableProps {
  plazaId: string
  onEditarReserva?: (reservaId: string) => void
  onEliminarReserva?: (reservaId: string) => void
}

function PlazaReservationsTable({
  plazaId,
  onEditarReserva,
  onEliminarReserva,
}: PlazaReservationsTableProps) {
  // Estados para ordenamiento local
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Hook para obtener datos de la plaza y reservas
  const {
    reservas,
    loading,
    error,
    editReserva,
    deleteReserva,
    sortReservas,
    refresh,
    totalReservas,
    reservasProgramadas,
    reservasConcluidas,
    reservasCanceladas,
  } = usePlaza(plazaId)

  // Función para manejar ordenamiento
  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc"
    setSortColumn(column)
    setSortDirection(newDirection)

    // Usar el ordenamiento del hook
    sortReservas({ column, direction: newDirection })
  }

  // Función para manejar editar reserva
  const handleEditarReserva = async (reservaId: string) => {
    try {
      // Si hay un callback personalizado, usarlo
      if (onEditarReserva) {
        onEditarReserva(reservaId)
        return
      }

      // Ejemplo de actualización - puedes personalizar según tus necesidades
      await editReserva(reservaId, {
        // estado: "cancelada" // ejemplo
      })
      console.log("Reserva editada exitosamente")
    } catch (error) {
      console.error("Error editando reserva:", error)
    }
  }

  // Función para manejar eliminar reserva
  const handleEliminarReserva = async (reservaId: string) => {
    try {
      // Confirmar eliminación
      const confirmed = window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")
      if (!confirmed) return

      // Si hay un callback personalizado, usarlo
      if (onEliminarReserva) {
        onEliminarReserva(reservaId)
        return
      }

      // Usar el hook para eliminar
      await deleteReserva(reservaId)
      console.log("Reserva eliminada exitosamente")
    } catch (error) {
      console.error("Error eliminando reserva:", error)
    }
  }

  // Función para obtener las iniciales del usuario
  const getIniciales = (nombre: string) => {
    return nombre
      .split(" ")
      .map((palabra) => palabra.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Función para obtener el color del badge según el estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "programado":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 hover:bg-blue-50"
          >
            Programado
          </Badge>
        )
      case "concluida":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-50 text-gray-700 hover:bg-gray-50"
          >
            Concluida
          </Badge>
        )
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  // Función para formatear precio
  const formatearPrecio = (precio: number) => {
    return `€${precio}`
  }

  // Estado de carga
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Cargando reservas...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Estado de error (sin usar Alert component)
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="border border-red-200 bg-red-50 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">Error al cargar las reservas: {error.message}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="ml-4"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sin reservas
  if (!reservas || reservas.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No hay reservas para esta plaza</p>
            <Button variant="outline" onClick={refresh}>
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {/* Header con estadísticas */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Reservas ({totalReservas || reservas.length})
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Programadas: {reservasProgramadas || 0}</span>
              <span>Concluidas: {reservasConcluidas || 0}</span>
              <span>Canceladas: {reservasCanceladas || 0}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="ml-2"
              >
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="text-left font-medium text-gray-600 py-3 px-6">
                  <button
                    onClick={() => handleSort("usuario")}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Reservado por
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-left font-medium text-gray-600 py-3 px-4">
                  <button
                    onClick={() => handleSort("fechaConfirmacion")}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Fecha de confirmación
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-left font-medium text-gray-600 py-3 px-4">
                  <button
                    onClick={() => handleSort("estado")}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Estado
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-left font-medium text-gray-600 py-3 px-4">
                  <button
                    onClick={() => handleSort("fechaReserva")}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Fecha de reserva
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-left font-medium text-gray-600 py-3 px-4">
                  <button
                    onClick={() => handleSort("precio")}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Pagado
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="text-left font-medium text-gray-600 py-3 px-4">
                  <button
                    onClick={() => handleSort("comision")}
                    className="flex items-center gap-2 hover:text-gray-900"
                  >
                    Comisión
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-12 py-3 px-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.map((reserva) => (
                <TableRow
                  key={reserva.id}
                  className="border-b hover:bg-gray-50"
                >
                  {/* Reservado por */}
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {reserva.usuario?.avatar ? (
                          <Image
                            src={reserva.usuario.avatar}
                            alt={reserva.usuario.nombre || 'Usuario'}
                            width={40}
                            height={40}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm font-medium">
                            {reserva.usuario?.iniciales ||
                              getIniciales(reserva.usuario?.nombre || 'NN')}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {reserva.usuario?.nombre || 'Sin nombre'}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {reserva.usuario?.email || 'Sin email'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Fecha de confirmación */}
                  <TableCell className="py-4 px-4">
                    <span className="text-gray-900 text-sm">
                      {reserva.fechaConfirmacion || 'N/A'}
                    </span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="py-4 px-4">
                    {getEstadoBadge(reserva.estado)}
                  </TableCell>

                  {/* Fecha de reserva */}
                  <TableCell className="py-4 px-4">
                    <div className="text-gray-900 text-sm">
                      <p>{reserva.fechaReserva || 'N/A'}</p>
                      <p className="text-gray-500 text-xs">
                        {reserva.horaInicio || 'N/A'} - {reserva.horaFin || 'N/A'}
                      </p>
                    </div>
                  </TableCell>

                  {/* Pagado */}
                  <TableCell className="py-4 px-4">
                    <span className="text-gray-900 text-sm font-medium">
                      {formatearPrecio(reserva.precio || 0)}
                    </span>
                  </TableCell>

                  {/* Comisión */}
                  <TableCell className="py-4 px-4">
                    <span className="text-gray-900 text-sm font-medium">
                      {formatearPrecio(reserva.comision || 0)}
                    </span>
                  </TableCell>

                  {/* Menú de opciones */}
                  <TableCell className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditarReserva(reserva.id)}
                          className="text-gray-700 cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar reserva
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEliminarReserva(reserva.id)}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Debug info - remover en producción */}
        <div className="m-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
          <strong>Debug API:</strong> Plaza ID: {plazaId} | 
          Reservas desde API: {reservas?.length || 0} |
          {loading && " Estado: Cargando... |"}
          {error && ` Error: ${error.message} |`}
          <br />
          <strong>Hook status:</strong> 
          Loading: {loading ? 'Sí' : 'No'} | 
          Error: {error ? 'Sí' : 'No'} | 
          Reservas: {reservas?.length || 0}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlazaReservationsTable