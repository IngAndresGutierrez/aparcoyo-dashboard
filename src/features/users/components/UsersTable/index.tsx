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
import { MoreHorizontal, User, Loader2 } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UsuarioTabla } from "../../types/table"
import { useUsuariosTabla } from "../../hooks/useTable"

// IMPORTAR EL HOOK Y TYPES

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

// Función helper para formatear fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// Función para obtener color del estado
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "activo":
      return "bg-green-100 text-green-800"
    case "inactivo":
      return "bg-gray-100 text-gray-800"
    case "suspendido":
      return "bg-red-100 text-red-800"
    default:
      return "bg-blue-100 text-blue-800"
  }
}

// COLUMNAS ACTUALIZADAS CON DATOS REALES
export const columns: ColumnDef<UsuarioTabla>[] = [
  {
    id: "select",
    header: () => <input type="checkbox" />,
    cell: () => <input type="checkbox" />,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "nombre",
    header: "Usuario",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <User className="w-3 h-3 text-blue-600" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-medium truncate block">
            {row.original.nombre || "Sin nombre"}
          </span>
          <span className="text-xs text-muted-foreground truncate block">
            {row.original.email}
          </span>
        </div>
      </div>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm truncate block max-w-[150px]">
        {row.original.email}
      </span>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "fechaRegistro",
    header: "Fecha de registro",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.fechaRegistro)}</span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "totalReservas",
    header: "Reservas hechas",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.totalReservas || 0}
      </span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "totalPlazas",
    header: "Plazas publicadas",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.totalPlazas || 0}
      </span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <Badge className={`text-xs ${getEstadoColor(row.original.estado)}`}>
        {row.original.estado || "activo"}
      </Badge>
    ),
    meta: { responsive: true }, // Ocultar en responsive
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
          <DropdownMenuItem>Ver perfil</DropdownMenuItem>
          <DropdownMenuItem>Editar usuario</DropdownMenuItem>
          <DropdownMenuItem>
            {row.original.estado === "activo" ? "Suspender" : "Activar"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            Eliminar usuario
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
]

interface UsersTableProps {
  searchTerm?: string
  estadoFilter?: "activo" | "inactivo" | "suspendido"
}

const UsersTable = ({ searchTerm, estadoFilter }: UsersTableProps) => {
  // USAR EL HOOK CON PARÁMETROS
  const { usuarios, loading, error, total, page, limit, fetchUsuarios } =
    useUsuariosTabla({
      page: 1,
      limit: 10,
      search: searchTerm,
      estado: estadoFilter,
      sortBy: "fechaRegistro",
      sortOrder: "desc",
    })

  const table = useReactTable({
    data: usuarios, // ← USAR DATOS REALES DEL BACKEND
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // Paginación manejada por el backend
    pageCount: Math.ceil(total / limit),
  })

  // Funciones de paginación
  const handlePreviousPage = () => {
    if (page > 1) {
      fetchUsuarios({
        page: page - 1,
        limit,
        search: searchTerm,
        estado: estadoFilter,
      })
    }
  }

  const handleNextPage = () => {
    if (page < Math.ceil(total / limit)) {
      fetchUsuarios({
        page: page + 1,
        limit,
        search: searchTerm,
        estado: estadoFilter,
      })
    }
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                {Array.from({ length: 7 }).map((_, index) => (
                  <TableHead
                    key={index}
                    className="px-2 py-3"
                  >
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className="py-3 px-2"
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Cargando usuarios...
          </span>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-md border p-8 text-center">
          <div className="text-red-500 text-sm font-medium mb-2">
            Error al cargar usuarios
          </div>
          <div className="text-muted-foreground text-sm mb-4">{error}</div>
          <Button
            onClick={() => fetchUsuarios({ page: 1, limit: 10 })}
            variant="outline"
            size="sm"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Información de resultados */}
      <div className="mb-4 text-sm text-muted-foreground">
        Mostrando {usuarios.length} de {total} usuarios
        {searchTerm && ` para "${searchTerm}"`}
        {estadoFilter && ` (${estadoFilter})`}
      </div>

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
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación mejorada */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Página {page} de {Math.ceil(total / limit)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page <= 1}
          >
            Atrás
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= Math.ceil(total / limit)}
          >
            Adelante
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UsersTable
