"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table"
import {
  MoreHorizontal,
  User,
  Loader2,
  Search,
  X,
  Edit,
  UserX,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useUserActions } from "../../hooks/useChange"
import { useRouter } from "next/navigation"

// Avatar simple
const UserAvatar: React.FC<{
  userName?: string
  userEmail: string
}> = ({ userName, userEmail }) => {
  return (
    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      {userName?.charAt(0)?.toUpperCase() ||
        userEmail?.charAt(0)?.toUpperCase() || (
          <User className="w-3 h-3 text-blue-600" />
        )}
    </div>
  )
}

// Extender la interfaz ColumnMeta
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Sin fecha"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Fecha inválida"

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "Error fecha"
  }
}

interface UsersTableProps {
  searchTerm?: string
  estadoFilter?: "activo" | "inactivo" | "suspendido"
}

const UsersTable = ({
  searchTerm: initialSearchTerm = "",
  estadoFilter,
}: UsersTableProps) => {
  // Estados
  const [searchValue, setSearchValue] = React.useState(initialSearchTerm)
  const [allUsuarios, setAllUsuarios] = React.useState<UsuarioTabla[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = React.useState<
    UsuarioTabla[]
  >([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const router = useRouter()

  // Hooks
  const {
    usuarios: initialUsuarios,
    loading,
    error,
    fetchUsuarios,
  } = useUsuariosTabla(
    {
      page: 1,
      limit: 1000,
      sortBy: "fechaRegistro",
      sortOrder: "desc",
    },
    false
  )

  const {
    changeUserStatus,
    isLoading: isProcessing,
    error: actionError,
    success,
  } = useUserActions()

  // Cargar usuarios inicialmente
  React.useEffect(() => {
    fetchUsuarios({
      page: 1,
      limit: 1000,
      sortBy: "fechaRegistro",
      sortOrder: "desc",
    })
  }, []) // Solo una vez

  // Actualizar cuando llegan datos
  React.useEffect(() => {
    if (initialUsuarios?.length > 0) {
      setAllUsuarios(initialUsuarios)
      setFilteredUsuarios(initialUsuarios)
    }
  }, [initialUsuarios])

  // Filtrar usuarios
  const handleFilter = React.useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredUsuarios(allUsuarios)
        setCurrentPage(1)
        return
      }

      const search = searchTerm.toLowerCase().trim()
      const filtered = allUsuarios.filter(
        (usuario) =>
          usuario.nombre?.toLowerCase().includes(search) ||
          usuario.email?.toLowerCase().includes(search)
      )

      setFilteredUsuarios(filtered)
      setCurrentPage(1)
    },
    [allUsuarios]
  )

  // Manejar cambio de búsqueda
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
    setFilteredUsuarios(allUsuarios)
    setCurrentPage(1)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  // Cambiar estado usuario - SIN llamar fetchUsuarios
  const handleToggleUserStatus = async (
    userId: string | number,
    isCurrentlyActive: boolean
  ) => {
    try {
      await changeUserStatus(userId, isCurrentlyActive)

      // Actualizar estado localmente en lugar de recargar desde servidor
      const updateUserInList = (users: UsuarioTabla[]) =>
        users.map((user) =>
          user.uid === userId ? { ...user, isActive: !isCurrentlyActive } : user
        )

      setAllUsuarios((prev) => updateUserInList(prev))
      setFilteredUsuarios((prev) => updateUserInList(prev))
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Cleanup
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
  const usuariosPagina = filteredUsuarios.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage)

  // Columnas - MEMOIZADAS
  const columns = React.useMemo<ColumnDef<UsuarioTabla>[]>(
    () => [
      {
        id: "select",
        header: () => <input type="checkbox" />,
        cell: () => <input type="checkbox" />,
      },
      {
        accessorKey: "nombre",
        header: "Usuario",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <UserAvatar
              userName={row.original.nombre}
              userEmail={row.original.email}
            />
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
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-sm truncate block max-w-[150px]">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "fechaRegistro",
        header: "Fecha de registro",
        cell: ({ row }) => {
          const formattedDate = formatDate(row.original.fechaRegistro)
          return (
            <span
              className={`text-sm ${
                formattedDate.includes("Error") ||
                formattedDate.includes("inválida") ||
                formattedDate.includes("Sin fecha")
                  ? "text-red-500 italic"
                  : ""
              }`}
            >
              {formattedDate}
            </span>
          )
        },
        meta: { responsive: true },
      },
      {
        accessorKey: "reservasHechas",
        header: "Reservas hechas",
        cell: ({ row }) => {
          const reservas =
            row.original.reservasHechas ?? row.original.totalReservas ?? 0
          return <span className="text-sm font-medium">{reservas}</span>
        },
        meta: { responsive: true },
      },
      {
        accessorKey: "plazasPublicadas",
        header: "Plazas publicadas",
        cell: ({ row }) => {
          const plazas =
            row.original.plazasPublicadas ?? row.original.totalPlazas ?? 0
          return <span className="text-sm font-medium">{plazas}</span>
        },
        meta: { responsive: true },
      },
      {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            className={`text-xs ${
              row.original.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.original.isActive ? "Activo" : "Inactivo"}
          </Badge>
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
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  if (!row.original.isActive) {
                    toast.error("Usuario inactivo", {
                      description: `No puedes editar a ${
                        row.original.nombre || "este usuario"
                      } porque está inactivo.`,
                      action: {
                        label: "Activar usuario",
                        onClick: () =>
                          handleToggleUserStatus(
                            row.original.uid,
                            row.original.isActive
                          ),
                      },
                      duration: 6000,
                    })
                    return
                  }
                  router.push(`/usuarios/${row.original.uid}`)
                  toast.success("Redirigiendo...", {
                    description: `Editando a ${row.original.nombre}`,
                    duration: 2000,
                  })
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar usuario
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const loadingToast = toast.loading(
                    row.original.isActive
                      ? "Desactivando usuario..."
                      : "Activando usuario...",
                    { description: "Por favor espera..." }
                  )
                  try {
                    await handleToggleUserStatus(
                      row.original.uid,
                      row.original.isActive
                    )
                    toast.dismiss(loadingToast)
                    toast.success(
                      row.original.isActive
                        ? "Usuario desactivado"
                        : "Usuario activado",
                      {
                        description: `${row.original.nombre} ha sido ${
                          row.original.isActive ? "desactivado" : "activado"
                        } correctamente`,
                        duration: 4000,
                      }
                    )
                  } catch (error) {
                    console.error("Error:", error)
                    toast.dismiss(loadingToast)
                    toast.error("Error al cambiar estado", {
                      description: "Hubo un problema. Inténtalo de nuevo.",
                      duration: 5000,
                    })
                  }
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Procesando...
                  </span>
                ) : row.original.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        meta: { responsive: true },
      },
    ],
    [isProcessing, router]
  )

  // Table instance - SIN paginación automática
  const table = useReactTable({
    data: usuariosPagina,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Solo esto es necesario
  })

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(7)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm">Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-md border p-8 text-center">
          <div className="text-red-500 text-sm font-medium mb-2">
            Error al cargar usuarios
          </div>
          <div className="text-muted-foreground text-sm mb-4">{error}</div>
          <Button
            onClick={() => fetchUsuarios({ page: 1, limit: 1000 })}
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
      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {actionError}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            ¡Usuario actualizado correctamente!
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {usuariosPagina.length} de {filteredUsuarios.length}{" "}
          usuarios
          {searchValue && ` para "${searchValue}"`}
          {estadoFilter && ` (${estadoFilter})`}
          {filteredUsuarios.length !== allUsuarios.length &&
            ` (${allUsuarios.length} total)`}
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
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
      </div>

      {/* Tabla */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
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
            {usuariosPagina.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchValue ? (
                    <div>
                      <p>No se encontraron usuarios para {searchValue}</p>
                      <Button
                        variant="link"
                        onClick={clearSearch}
                        className="mt-2"
                      >
                        Limpiar búsqueda
                      </Button>
                    </div>
                  ) : (
                    "No se encontraron usuarios"
                  )}
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

      {/* Paginación */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} -{" "}
          {Math.min(endIndex, filteredUsuarios.length)} de{" "}
          {filteredUsuarios.length} usuarios
          {filteredUsuarios.length !== allUsuarios.length &&
            ` (filtrados de ${allUsuarios.length})`}
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
    </div>
  )
}

export default UsersTable
