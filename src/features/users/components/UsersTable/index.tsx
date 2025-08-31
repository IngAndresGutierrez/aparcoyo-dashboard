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

// Avatar simple sin fotos - solo con iniciales o ícono
const UserAvatar: React.FC<{
  userName?: string
  userEmail: string
}> = ({ userName, userEmail }) => {
  // Fallback con inicial o ícono
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

// FUNCIÓN ROBUSTA PARA FORMATEAR FECHA
const formatDate = (dateString: string | null | undefined): string => {
  console.log("Formateando fecha:", dateString, typeof dateString)

  if (!dateString) {
    return "Sin fecha"
  }

  try {
    // Limpiar la fecha si viene con caracteres extraños
    const cleanDateString = dateString.toString().trim()

    // Crear la fecha
    let date: Date

    // Verificar si es un timestamp
    if (!isNaN(Number(cleanDateString)) && cleanDateString.length > 10) {
      date = new Date(Number(cleanDateString))
    } else {
      date = new Date(cleanDateString)
    }

    console.log("Fecha parseada:", date, "isValid:", !isNaN(date.getTime()))

    // Verificar si es válida
    if (isNaN(date.getTime())) {
      console.warn("Fecha inválida después del parsing:", dateString)
      return "Fecha inválida"
    }

    // Formatear
    const formatted = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

    console.log("Fecha formateada:", formatted)
    return formatted
  } catch (error) {
    console.error("Error formateando fecha:", dateString, error)
    return "Error fecha"
  }
}

interface UsersTableProps {
  searchTerm?: string
  estadoFilter?: "activo" | "inactivo" | "suspendido"
}

const UsersTable = ({
  searchTerm: initialSearchTerm,
  estadoFilter,
}: UsersTableProps) => {
  // Estados para el buscador - REMOVEMOS currentPage porque el hook lo maneja
  const [searchValue, setSearchValue] = React.useState(initialSearchTerm || "")
  const [debouncedSearch, setDebouncedSearch] = React.useState(
    initialSearchTerm || ""
  )
  const router = useRouter()

  // Debounce para el buscador
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  // Hook para obtener usuarios - USAMOS EL PAGE DEL HOOK
  const { usuarios, loading, error, total, page, limit, fetchUsuarios } =
    useUsuariosTabla({
      page: 1, // ✅ Página inicial
      limit: 10,
      search: debouncedSearch,
      estado: estadoFilter,
      sortBy: "fechaRegistro",
      sortOrder: "desc",
    })

  // DEBUG: Ver datos de usuarios cuando carguen
  React.useEffect(() => {
    console.log("🔍 DEBUG PAGINACIÓN:")
    console.log("- Usuarios recibidos:", usuarios.length)
    console.log("- Total reportado:", total)
    console.log("- Página actual:", page)
    console.log("- Límite:", limit)
    console.log("- Loading:", loading)
    console.log(
      "- Usuarios (primeros 3):",
      usuarios.slice(0, 3).map((u) => u.email)
    )

    // 🔍 DEBUGGING TEMPORAL - Llamar método alternativo para comparar
    console.log("🧪 PROBANDO método alternativo...")
  }, [usuarios, total, page, limit, loading])

  // Refetch cuando cambia la búsqueda o el filtro
  React.useEffect(() => {
    console.log("🔍 REFETCH por cambio en búsqueda/filtro:", {
      debouncedSearch,
      estadoFilter,
    })
    fetchUsuarios({
      page: 1, // ✅ Reset a página 1 cuando cambia búsqueda
      limit: 10,
      search: debouncedSearch,
      estado: estadoFilter,
      sortBy: "fechaRegistro",
      sortOrder: "desc",
    })
  }, [debouncedSearch, estadoFilter, fetchUsuarios])

  // Hook para acciones de usuario
  const {
    changeUserStatus,
    isLoading: isProcessing,
    error: actionError,
    success,
  } = useUserActions()

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchValue("")
    setDebouncedSearch("")
  }

  // Función para cambiar estado de usuario
  const handleToggleUserStatus = async (
    userId: string | number,
    isCurrentlyActive: boolean
  ) => {
    try {
      await changeUserStatus(userId, isCurrentlyActive)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      await fetchUsuarios({
        page: page, // ✅ Usar el page del hook
        limit: 10,
        search: debouncedSearch,
        estado: undefined,
        sortBy: "fechaRegistro",
        sortOrder: "desc",
      })
    }
  }

  // COLUMNAS CORREGIDAS
  const columns: ColumnDef<UsuarioTabla>[] = [
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
        const fechaRegistro = row.original.fechaRegistro
        const formattedDate = formatDate(fechaRegistro)

        return (
          <span
            className={`text-sm ${
              formattedDate.includes("Error") ||
              formattedDate.includes("inválida") ||
              formattedDate.includes("Sin fecha")
                ? "text-red-500 italic"
                : ""
            }`}
            title={`Fecha original: ${fechaRegistro || "N/A"}`}
          >
            {formattedDate}
          </span>
        )
      },
      meta: { responsive: true },
    },
    {
      // CORREGIDO: usar reservasHechas (del endpoint de estadísticas)
      accessorKey: "reservasHechas",
      header: "Reservas hechas",
      cell: ({ row }) => {
        // Intentar ambos campos por compatibilidad
        const reservas =
          row.original.reservasHechas ?? row.original.totalReservas ?? 0
        return <span className="text-sm font-medium">{reservas}</span>
      },
      meta: { responsive: true },
    },
    {
      // CORREGIDO: usar plazasPublicadas (del endpoint de estadísticas)
      accessorKey: "plazasPublicadas",
      header: "Plazas publicadas",
      cell: ({ row }) => {
        // Intentar ambos campos por compatibilidad
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
                      onClick: () => {
                        handleToggleUserStatus(
                          row.original.uid,
                          row.original.isActive
                        )
                        toast.success("Activando usuario...", {
                          description: "Una vez activado, podrás editarlo",
                        })
                      },
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
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
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
  ]

  const table = useReactTable({
    data: usuarios, // ✅ Solo los datos de la página actual
    columns,
    getCoreRowModel: getCoreRowModel(),
    // ❌ QUITAR getPaginationRowModel() - el backend maneja la paginación
    manualPagination: true,
    pageCount: Math.ceil(total / 10),
  })

  // Funciones de paginación - USAR EL PAGE DEL HOOK
  const handlePreviousPage = () => {
    console.log(
      "🔙 ANTERIOR - Página actual:",
      page,
      "Búsqueda:",
      debouncedSearch
    )
    if (page > 1) {
      const newPage = page - 1
      console.log("🔙 Yendo a página:", newPage)
      fetchUsuarios({
        page: newPage,
        limit: 10,
        search: debouncedSearch,
        estado: estadoFilter,
        sortBy: "fechaRegistro",
        sortOrder: "desc",
      })
    } else {
      console.log("🔙 Ya estás en la primera página")
    }
  }

  const handleNextPage = () => {
    const totalPages = Math.ceil(total / 10)
    console.log(
      "▶️ SIGUIENTE - Página actual:",
      page,
      "Total páginas:",
      totalPages,
      "Búsqueda:",
      debouncedSearch
    )
    if (page < totalPages) {
      const newPage = page + 1
      console.log("▶️ Yendo a página:", newPage)
      fetchUsuarios({
        page: newPage,
        limit: 10,
        search: debouncedSearch,
        estado: estadoFilter,
        sortBy: "fechaRegistro",
        sortOrder: "desc",
      })
    } else {
      console.log("▶️ Ya estás en la última página")
    }
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="relative w-72">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

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
      {/* Mensajes de error o éxito */}
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

      {/* Header con información y buscador */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {usuarios.length} de {total} usuarios
          {debouncedSearch && ` para "${debouncedSearch}"`}
          {estadoFilter && ` (${estadoFilter})`}
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
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
                  {debouncedSearch ? (
                    <div>
                      <p>No se encontraron usuarios para {debouncedSearch}</p>
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
              // ✅ Renderizar DIRECTAMENTE los usuarios (no usar table.getRowModel())
              usuarios.map((usuario, index) => (
                <TableRow key={usuario.uid || index}>
                  <TableCell className="py-3 px-2">
                    <input type="checkbox" />
                  </TableCell>

                  <TableCell className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        userName={usuario.nombre}
                        userEmail={usuario.email}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {usuario.nombre || "Sin nombre"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate block">
                          {usuario.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 px-2">
                    <span className="text-sm truncate block max-w-[150px]">
                      {usuario.email}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 px-2 hidden lg:table-cell">
                    {(() => {
                      const formattedDate = formatDate(usuario.fechaRegistro)
                      return (
                        <span
                          className={`text-sm ${
                            formattedDate.includes("Error") ||
                            formattedDate.includes("inválida") ||
                            formattedDate.includes("Sin fecha")
                              ? "text-red-500 italic"
                              : ""
                          }`}
                          title={`Fecha original: ${
                            usuario.fechaRegistro || "N/A"
                          }`}
                        >
                          {formattedDate}
                        </span>
                      )
                    })()}
                  </TableCell>

                  <TableCell className="py-3 px-2 hidden lg:table-cell">
                    <span className="text-sm font-medium">
                      {usuario.reservasHechas ?? usuario.totalReservas ?? 0}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 px-2 hidden lg:table-cell">
                    <span className="text-sm font-medium">
                      {usuario.plazasPublicadas ?? usuario.totalPlazas ?? 0}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 px-2 hidden lg:table-cell">
                    <Badge
                      className={`text-xs ${
                        usuario.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {usuario.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 px-2 hidden lg:table-cell">
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
                            if (!usuario.isActive) {
                              toast.error("Usuario inactivo", {
                                description: `No puedes editar a ${
                                  usuario.nombre || "este usuario"
                                } porque está inactivo.`,
                                action: {
                                  label: "Activar usuario",
                                  onClick: () => {
                                    handleToggleUserStatus(
                                      usuario.uid,
                                      usuario.isActive
                                    )
                                    toast.success("Activando usuario...", {
                                      description:
                                        "Una vez activado, podrás editarlo",
                                    })
                                  },
                                },
                                duration: 6000,
                              })
                              return
                            }

                            router.push(`/usuarios/${usuario.uid}`)
                            toast.success("Redirigiendo...", {
                              description: `Editando a ${usuario.nombre}`,
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
                              usuario.isActive
                                ? "Desactivando usuario..."
                                : "Activando usuario...",
                              { description: "Por favor espera..." }
                            )

                            try {
                              await handleToggleUserStatus(
                                usuario.uid,
                                usuario.isActive
                              )

                              toast.dismiss(loadingToast)
                              toast.success(
                                usuario.isActive
                                  ? "Usuario desactivado"
                                  : "Usuario activado",
                                {
                                  description: `${usuario.nombre} ha sido ${
                                    usuario.isActive
                                      ? "desactivado"
                                      : "activado"
                                  } correctamente`,
                                  duration: 4000,
                                }
                              )
                              // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (error) {
                              toast.dismiss(loadingToast)
                              toast.error("Error al cambiar estado", {
                                description:
                                  "Hubo un problema. Inténtalo de nuevo.",
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
                          ) : usuario.isActive ? (
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación mejorada */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} de{" "}
          {total} usuarios
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page <= 1 || loading}
          >
            ← Anterior
          </Button>

          {/* Información de página */}
          <span className="text-sm text-muted-foreground px-3">
            Página {page} de {Math.ceil(total / 10)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= Math.ceil(total / 10) || loading}
          >
            Siguiente →
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UsersTable
