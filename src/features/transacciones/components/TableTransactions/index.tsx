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

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

const data: Report[] = [
  {
    name: "Lily-Rose Chedjou",
    email: "lilyrose@gmail.com",
    date: "Jan 16, 2025",
    reservations: 12,
    listings: 1,
  },
  {
    name: "Caitlyn King",
    email: "hi@caitlynking.com",
    date: "Jan 16, 2025",
    reservations: 3,
    listings: 0,
  },
  {
    name: "Fleur Cook",
    email: "fleurcook@icloud.com",
    date: "Jan 15, 2025",
    reservations: 7,
    listings: 0,
  },
  {
    name: "Marco Kelly",
    email: "marco@marcokelly.co",
    date: "Jan 14, 2025",
    reservations: 2,
    listings: 0,
  },
  {
    name: "Lulu Meyers",
    email: "lulu@lulumeyers.com",
    date: "Jan 14, 2025",
    reservations: 1,
    listings: 0,
  },
  {
    name: "Mikey Lawrence",
    email: "m.lawrence@gmail.com",
    date: "Jan 14, 2025",
    reservations: 0,
    listings: 3,
  },
  {
    name: "Freya Browning",
    email: "hey@freyabrowning.com",
    date: "Jan 14, 2025",
    reservations: 0,
    listings: 0,
  },
]

export type Report = {
  name: string
  email: string
  date: string
  reservations: number
  listings: number
}

export const columns: ColumnDef<Report>[] = [
  {
    id: "select",
    header: () => <input type="checkbox" />,
    cell: () => <input type="checkbox" />,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "name",
    header: "Factura n.º",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image
          src="/home/avatar-report.svg"
          alt="avatar"
          width={10}
          height={10}
          className="w-6 h-6 rounded-full flex-shrink-0"
        />
        <span className="truncate text-sm">{row.original.name}</span>
      </div>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "email",
    header: "Importe",
    cell: ({ row }) => (
      <span className="text-sm truncate block max-w-[150px]">
        {row.original.email}
      </span>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => <span>{row.original.date}</span>,
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "reservations",
    header: "Estado",
    cell: ({ row }) => <span>{row.original.reservations}</span>,
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "listings",
    header: "Cliente",
    cell: ({ row }) => <span>{row.original.listings}</span>,
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
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Editar usuario</DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Eliminar usuario
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
]

const UsersTableTransactions = () => {
  const table = useReactTable({
    data,
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

export default UsersTableTransactions
