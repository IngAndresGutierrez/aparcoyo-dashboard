"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
    header: "Usuario",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image
          src="/home/avatar-report.svg"
          alt="avatar"
          width={10}
          height={10}
          className="w-8 h-8 rounded-full"
        />
        <span>{row.original.name}</span>
      </div>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.email}</span>,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "date",
    header: "Fecha de registro",
    cell: ({ row }) => <span>{row.original.date}</span>,
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "reservations",
    header: "Reservas hechas",
    cell: ({ row }) => <span>{row.original.reservations}</span>,
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "listings",
    header: "Plazas publicadas",
    cell: ({ row }) => <span>{row.original.listings}</span>,
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
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

const UsersTable = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className={`text-muted-foreground ${
                      header.column.columnDef.meta?.responsive
                        ? "hidden md:table-cell"
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
                    className={`py-3 ${
                      cell.column.columnDef.meta?.responsive
                        ? "hidden md:table-cell"
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

export default UsersTable