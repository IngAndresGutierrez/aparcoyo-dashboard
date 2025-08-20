// features/edit-plazas/components/PlazaReservationsTable.tsx
"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, ArrowUpDown } from "lucide-react"
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

// Tipo para las reservas
interface Reserva {
  id: string
  usuario: {
    nombre: string
    email: string
    avatar?: string
    iniciales?: string
  }
  fechaConfirmacion: string
  estado: "programado" | "concluida" | "cancelada"
  fechaReserva: string
  horaInicio: string
  horaFin: string
  precio: number
  comision: number
}

interface PlazaReservationsTableProps {
  // Props para cuando se conecte al backend
  plazaId?: string
  reservas?: Reserva[]
  onEditarReserva?: (reservaId: string) => void
  onEliminarReserva?: (reservaId: string) => void
  onOrdenar?: (columna: string, direccion: "asc" | "desc") => void
}

function PlazaReservationsTable({
  plazaId = "plaza-001",
  reservas,
  onEditarReserva,
  onEliminarReserva,
  onOrdenar,
}: PlazaReservationsTableProps) {
  // Estados para ordenamiento
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Datos hardcodeados por ahora - se reemplazarán con props del backend
  const reservasData: Reserva[] = reservas || [
    {
      id: "reserva-1",
      usuario: {
        nombre: "Ammar Foley",
        email: "ammar.foley@gmail.com",
        iniciales: "AF",
      },
      fechaConfirmacion: "Jan 16, 2025",
      estado: "programado",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
    {
      id: "reserva-2",
      usuario: {
        nombre: "Pippa Wilkinson",
        email: "pippa@pippaw.com",
        iniciales: "PW",
      },
      fechaConfirmacion: "Jan 16, 2025",
      estado: "programado",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
    {
      id: "reserva-3",
      usuario: {
        nombre: "Olly Schroeder",
        email: "olly_s@icloud.com",
        iniciales: "OS",
      },
      fechaConfirmacion: "Jan 15, 2025",
      estado: "programado",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
    {
      id: "reserva-4",
      usuario: {
        nombre: "Mathilde Lewis",
        email: "mathilde@hey.com",
        iniciales: "ML",
      },
      fechaConfirmacion: "Jan 14, 2025",
      estado: "programado",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
    {
      id: "reserva-5",
      usuario: {
        nombre: "Julius Vaughan",
        email: "juliusvaughan@gmail.com",
        iniciales: "JV",
      },
      fechaConfirmacion: "Jan 14, 2025",
      estado: "programado",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
    {
      id: "reserva-6",
      usuario: {
        nombre: "Zaid Schwartz",
        email: "zaid@zaidstudio.com",
        iniciales: "ZS",
      },
      fechaConfirmacion: "Jan 14, 2025",
      estado: "concluida",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
    {
      id: "reserva-7",
      usuario: {
        nombre: "Julius Vaughan",
        email: "juliusvaughan@gmail.com",
        iniciales: "JV",
      },
      fechaConfirmacion: "Jan 14, 2025",
      estado: "concluida",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
    {
      id: "reserva-8",
      usuario: {
        nombre: "Pippa Wilkinson",
        email: "pippa@pippaw.com",
        iniciales: "PW",
      },
      fechaConfirmacion: "Jan 14, 2025",
      estado: "concluida",
      fechaReserva: "Jan 17, 2025",
      horaInicio: "2:30pm",
      horaFin: "6:30pm",
      precio: 12,
      comision: 1.49,
    },
  ]

  // Función para manejar ordenamiento
  const handleSort = (column: string) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc"
    setSortColumn(column)
    setSortDirection(newDirection)

    if (onOrdenar) {
      onOrdenar(column, newDirection)
    }
  }

  // Función para manejar editar reserva
  const handleEditarReserva = (reservaId: string) => {
    if (onEditarReserva) {
      onEditarReserva(reservaId)
    }
    console.log("Editar reserva:", reservaId)
  }

  // Función para manejar eliminar reserva
  const handleEliminarReserva = (reservaId: string) => {
    if (onEliminarReserva) {
      onEliminarReserva(reservaId)
    }
    console.log("Eliminar reserva:", reservaId)
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

  return (
    <Card className="w-full">
      <CardContent className="p-0">
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
              {reservasData.map((reserva) => (
                <TableRow
                  key={reserva.id}
                  className="border-b hover:bg-gray-50"
                >
                  {/* Reservado por */}
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {reserva.usuario.avatar ? (
                          <Image
                            src={reserva.usuario.avatar}
                            alt={reserva.usuario.nombre}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm font-medium">
                            {reserva.usuario.iniciales ||
                              getIniciales(reserva.usuario.nombre)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {reserva.usuario.nombre}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {reserva.usuario.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Fecha de confirmación */}
                  <TableCell className="py-4 px-4">
                    <span className="text-gray-900 text-sm">
                      {reserva.fechaConfirmacion}
                    </span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="py-4 px-4">
                    {getEstadoBadge(reserva.estado)}
                  </TableCell>

                  {/* Fecha de reserva */}
                  <TableCell className="py-4 px-4">
                    <div className="text-gray-900 text-sm">
                      <p>{reserva.fechaReserva}</p>
                      <p className="text-gray-500 text-xs">
                        {reserva.horaInicio} - {reserva.horaFin}
                      </p>
                    </div>
                  </TableCell>

                  {/* Pagado */}
                  <TableCell className="py-4 px-4">
                    <span className="text-gray-900 text-sm font-medium">
                      {formatearPrecio(reserva.precio)}
                    </span>
                  </TableCell>

                  {/* Comisión */}
                  <TableCell className="py-4 px-4">
                    <span className="text-gray-900 text-sm font-medium">
                      {formatearPrecio(reserva.comision)}
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
          <strong>Debug Tabla:</strong> Plaza ID: {plazaId} | Reservas
          mostradas: {reservasData.length}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlazaReservationsTable
