/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { MoreHorizontal } from "lucide-react"

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
import { Reserva } from "../../types"
import { useGetAllReservas } from "../../hooks/useGetAllReservas"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

export const columns: ColumnDef<Reserva>[] = [
  {
    id: "select",
    header: () => <input type="checkbox" />,
    cell: () => <input type="checkbox" />,
  },
  {
    accessorKey: "plaza.direccion",
    header: "Plaza reservada",
    cell: ({ row }) => (
      <span className="text-sm truncate block max-w-[200px]">
        {row.original.plaza.direccion}
      </span>
    ),
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
  },
  {
    accessorKey: "fechaInicio",
    header: "Fecha de confirmacion",
    cell: ({ row }) => (
      <span>{new Date(row.original.fechaInicio).toLocaleString()}</span>
    ),
    meta: { responsive: true },
  },
  {
    accessorKey: "fechaFin",
    header: "Estado",
    cell: ({ row }) => (
      <span>{new Date(row.original.fechaFin).toLocaleString()}</span>
    ),
    meta: { responsive: true },
  },
  {
    accessorKey: "plaza.precio",
    header: "Precio",
    cell: ({ row }) => <span>${row.original.plaza.precio}</span>,
    meta: { responsive: true },
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
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Ver detalle</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Cancelar reserva
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { responsive: true },
  },
]

const ReservationsTable = () => {
  const { reservas, isLoading } = useGetAllReservas()

  const table = useReactTable<Reserva>({
    data: reservas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full">
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
            {table.getRowModel().rows.map((row) => (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
  )
}

export default ReservationsTable
