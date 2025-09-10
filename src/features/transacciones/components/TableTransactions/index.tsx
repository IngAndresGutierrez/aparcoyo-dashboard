"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table"
import { Loader2, Search, X } from "lucide-react"

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
// Función corregida para formatear fecha
const formatDate = (dateString: string) => {
  if (dateString === "Sin fecha") return "Sin fecha"

  try {
    // Si la fecha viene en formato YYYY-MM-DD (sin hora),
    // la interpretamos como fecha local, no UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Separar los componentes de la fecha
      const [year, month, day] = dateString.split("-").map(Number)

      // Crear fecha local (mes - 1 porque Date usa 0-11 para meses)
      const date = new Date(year, month - 1, day)

      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    }

    // Para otros formatos de fecha, usar el comportamiento normal
    const date = new Date(dateString)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      throw new Error("Fecha inválida")
    }

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error al formatear fecha:", dateString, error)
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
]

const TransactionsTable = () => {
  const { loading, error, transactions, refetch } = usePlatformStats({
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  })

  // Estados para búsqueda
  const [searchValue, setSearchValue] = React.useState("")
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>(
    []
  )
  const [filteredTransactions, setFilteredTransactions] = React.useState<
    Transaction[]
  >([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  // Usar datos reales o fallback
  const tableData = transactions.length > 0 ? transactions : fallbackData

  // Actualizar cuando llegan datos
  React.useEffect(() => {
    if (tableData?.length > 0) {
      setAllTransactions(tableData)
      setFilteredTransactions(tableData)
    }
  }, [tableData])

  // Función de filtrado para transacciones
  const handleFilter = React.useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredTransactions(allTransactions)
        setCurrentPage(1)
        return
      }

      const search = searchTerm.toLowerCase().trim()
      const filtered = allTransactions.filter((transaction) => {
        // Buscar en número de factura
        const factura = (transaction.factura || "").toLowerCase()

        // Buscar en cliente
        const cliente = (transaction.cliente || "").toLowerCase()

        // Buscar en estado
        const estado = (transaction.estado || "").toLowerCase()

        // Buscar en tipo de transacción
        const tipo = (transaction.tipo || "").toLowerCase()

        // Buscar en importe (opcional)
        const importe = (transaction.importe || "").toString().toLowerCase()

        return (
          factura.includes(search) ||
          cliente.includes(search) ||
          estado.includes(search) ||
          tipo.includes(search) ||
          importe.includes(search)
        )
      })

      setFilteredTransactions(filtered)
      setCurrentPage(1)
    },
    [allTransactions]
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
    setFilteredTransactions(allTransactions)
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

  // Paginación
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const transaccionesPagina = filteredTransactions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  const table = useReactTable({
    data: transaccionesPagina,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div className="w-full space-y-4">
      {/* Header con indicadores y buscador */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Transacciones Recientes</h3>
          <div className="text-sm text-muted-foreground">
            Mostrando {transaccionesPagina.length} de{" "}
            {filteredTransactions.length} transacciones
            {searchValue && ` para "${searchValue}"`}
            {filteredTransactions.length !== allTransactions.length &&
              ` (${allTransactions.length} total)`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Buscador */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar transacciones..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
              disabled={loading}
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
          </div>
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
            {transaccionesPagina?.length ? (
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
                  ) : searchValue ? (
                    <div>
                      <p className="text-muted-foreground">
                        No se encontraron transacciones para {searchValue}
                      </p>
                      <Button
                        variant="link"
                        onClick={clearSearch}
                        className="mt-2"
                      >
                        Limpiar búsqueda
                      </Button>
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
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, filteredTransactions.length)} de{" "}
            {filteredTransactions.length} transacciones
            {filteredTransactions.length !== allTransactions.length &&
              ` (filtradas de ${allTransactions.length})`}
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
    </div>
  )
}

export default TransactionsTable
