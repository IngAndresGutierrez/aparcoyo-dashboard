"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Reserva } from "../../types"

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

export const reservasColumns: ColumnDef<Reserva>[] = [
  {
    id: "select",
    header: () => <input type="checkbox" />,
    cell: () => <input type="checkbox" />,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "plaza.direccion",
    header: "Plaza reservada",
    cell: ({ row }) => (
      <span className="text-sm truncate block ">
        {row.original.plaza.direccion}
      </span>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "usuario.nombre",
    header: "Reservado por",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image
          src="/home/avatar-report.svg"
          alt="avatar"
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="truncate text-sm">{row.original.usuario.nombre}</span>
      </div>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "fechaInicio",
    header: "Fecha de confirmación",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {new Date(row.original.fechaInicio).toLocaleString()}
      </span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "fechaFin",
    header: "Estado",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {new Date(row.original.fechaFin).toLocaleString()}
      </span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "plaza.precio",
    header: "Precio",
    cell: ({ row }) => (
      <span className="text-sm font-medium">${row.original.plaza.precio}</span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    id: "actions",
    cell: () => (
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
          <DropdownMenuItem>
            <span className="text-gray-700">Ver detalle</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Cancelar reserva
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
]
