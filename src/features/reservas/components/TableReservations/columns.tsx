/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import {
  MoreHorizontal,
  Clock,
  User,
  Car,
  MapPin,
  Edit2,
  Trash2,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ReservaTable } from "../../types"

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

// Función helper para formatear fechas
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }
}

// Función para calcular el estado de la reserva
const getReservaStatus = (fechaInicio: string, fechaFin: string) => {
  const now = new Date()
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)

  if (now < inicio) {
    return { status: "Programada", color: "bg-blue-100 text-blue-800" }
  } else if (now >= inicio && now <= fin) {
    return { status: "Activa", color: "bg-green-100 text-green-800" }
  } else {
    return { status: "Finalizada", color: "bg-gray-100 text-gray-800" }
  }
}

// Función que retorna las columnas y recibe callbacks
export const reservasColumns = (
  onEditReservation?: (reservation: ReservaTable) => void,
  onDeleteReservation?: (reservation: ReservaTable) => void
): ColumnDef<ReservaTable>[] => [
  {
    id: "select",
    header: () => <input type="checkbox" />,
    cell: () => <input type="checkbox" />,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => {
      // El usuario es un objeto, acceder a .nombre
      const usuario = row.original.usuario as any
      const nombreUsuario = usuario?.nombre || "Sin nombre"

      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <span className="truncate text-sm font-medium">{nombreUsuario}</span>
        </div>
      )
    },
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "plaza",
    header: "Plaza",
    cell: ({ row }) => {
      // La plaza es un objeto, acceder a .nombre
      const plaza = row.original.plaza as any
      const nombrePlaza = plaza?.nombre || plaza?.direccion || "Sin plaza"

      return (
        <div className="flex items-start gap-2 max-w-[120px]">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm leading-tight break-words whitespace-normal">
            {nombrePlaza}
          </span>
        </div>
      )
    },
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "matricula",
    header: "Matrícula",
    cell: ({ row }) => {
      // La matrícula SÍ es un string (pero con valor "string" de prueba)
      const matricula = row.original.matricula

      return (
        <div className="flex items-start gap-2 max-w-[100px]">
          <Car className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm font-mono font-medium bg-gray-100 px-2 py-1 rounded leading-tight break-words whitespace-normal">
            {matricula === "string" ? "ABC-123" : matricula}
          </span>
        </div>
      )
    },
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "fechaInicio",
    header: "Fecha Inicio",
    cell: ({ row }) => {
      const { date, time } = formatDate(row.original.fechaInicio)
      return (
        <div className="text-sm">
          <div className="font-medium">{date}</div>
          <div className="text-gray-500 text-xs">{time}</div>
        </div>
      )
    },
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "fechaFin",
    header: "Fecha Fin",
    cell: ({ row }) => {
      const { date, time } = formatDate(row.original.fechaFin)
      return (
        <div className="text-sm">
          <div className="font-medium">{date}</div>
          <div className="text-gray-500 text-xs">{time}</div>
        </div>
      )
    },
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const { status, color } = getReservaStatus(
        row.original.fechaInicio,
        row.original.fechaFin
      )
      return (
        <Badge className={`${color} text-xs`}>
          <Clock className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      )
    },
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onEditReservation?.(row.original)}
            className="cursor-pointer"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            <span className="text-gray-700">Editar reserva</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDeleteReservation?.(row.original)}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar reserva
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
]
