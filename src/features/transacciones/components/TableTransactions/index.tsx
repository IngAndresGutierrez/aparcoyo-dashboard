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
import { MoreHorizontal, Loader2 } from "lucide-react"

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
import { usePlatformStats } from "../../hooks/useTransaction"
import { Transaction } from "../../types/transaction"

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

// Función helper para formatear moneda
const formatCurrency = (amount: string) => {
  const numAmount = parseFloat(amount)
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(numAmount)
}

// Función para formatear fecha
const formatDate = (dateString: string) => {
  if (dateString === "Sin fecha") return "Sin fecha"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

// Función para obtener el color del estado
const getStatusColor = (estado: string) => {
  switch (estado.toLowerCase()) {
    case "completado":
      return "text-green-600 bg-green-50 border border-green-200"
    case "pendiente":
      return "text-yellow-600 bg-yellow-50 border border-yellow-200"
    case "cancelado":
      return "text-red-600 bg-red-50 border border-red-200"
    default:
      return "text-gray-600 bg-gray-50 border border-gray-200"
  }
}

// Datos de fallback para cuando carga o hay error
const fallbackData: Transaction[] = [
  {
    factura: "Factura N° ejemplo-123",
    importe: "3.50",
    fecha: "Sin fecha",
    estado: "completado",
    cliente: "Cliente de ejemplo",
    tipo: "Reserva de plaza",
  },
]

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: () => (
      <input
        type="checkbox"
        className="rounded"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="rounded"
        data-row-id={row.id}
      />
    ),
  },
  {
    accessorKey: "factura",
    header: "Factura n.º",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image
          src="/home/avatar-report.svg"
          alt="factura"
          width={10}
          height={10}
          className="w-6 h-6 rounded-full flex-shrink-0"
        />
        <span className="truncate text-sm font-medium max-w-[200px]">
          {row.original.factura}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "importe",
    header: "Importe",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-green-600">
        {formatCurrency(row.original.importe)}
      </span>
    ),
  },
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.fecha)}
      </span>
    ),
    meta: { responsive: true },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
          row.original.estado
        )}`}
      >
        {row.original.estado}
      </span>
    ),
    meta: { responsive: true },
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => (
      <span className="text-sm truncate block max-w-[150px]">
        {row.original.cliente}
      </span>
    ),
    meta: { responsive: true },
  },
  {
    id: "actions",
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
            onClick={() => console.log("Ver detalles:", row.original.factura)}
          >
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              console.log("Descargar factura:", row.original.factura)
            }
          >
            Descargar factura
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() =>
              console.log("Anular transacción:", row.original.factura)
            }
          >
            Anular transacción
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { responsive: true },
  },
]

const TransactionsTable = () => {
  const { loading, error, transactions, refetch } = usePlatformStats({
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  })

  // Usar datos reales o fallback
  const tableData = transactions.length > 0 ? transactions : fallbackData

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Mostrar 10 transacciones por página
      },
    },
  })

  return (
    <div className="w-full space-y-4">
      {/* Header con indicadores */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
          <p className="text-sm text-muted-foreground">
            {loading ? "Cargando..." : `${tableData.length} transacciones`}
          </p>
        </div>

        {/* Indicador de estado */}
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {error && (
            <button
              onClick={refetch}
              className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
            >
              Reintentar
            </button>
          )}
          <span className="text-xs">
            {transactions.length > 0 ? (
              <span className="text-green-600">✅ Datos reales</span>
            ) : (
              <span className="text-orange-600"></span>
            )}
          </span>
        </div>
      </div>

      {/* Tabla */}
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando transacciones...
                    </div>
                  ) : (
                    "No hay transacciones disponibles."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()} ({tableData.length} transacciones total)
        </div>

        <div className="flex items-center space-x-2">
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
    </div>
  )
}

export default TransactionsTable
