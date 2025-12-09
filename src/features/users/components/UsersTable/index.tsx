/* eslint-disable @next/next/no-img-element */
"use client"

import * as React from "react"
import { Camera } from "lucide-react"

import { useRef } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowData,
} from "@tanstack/react-table"
import {
  MoreHorizontal,
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
import { UsuarioTabla } from "../../types/table"
import { useUserActions } from "../../hooks/useChange"
import { useRouter } from "next/navigation"
import { useUpdateProfilePhoto } from "../../hooks/usePhoto"


const UserAvatar: React.FC<{
  userName?: string
  userEmail: string
  photoUrl?: string
}> = ({ userName, userEmail, photoUrl }) => {
  const [imageError, setImageError] = React.useState(false)

  const initial =
    userName?.charAt(0)?.toUpperCase() ||
    userEmail?.charAt(0)?.toUpperCase() ||
    "U"

  if (photoUrl && !imageError) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
        <img
          src={photoUrl}
          alt={userName || userEmail}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  return (
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
      <span className="text-blue-600 text-sm font-medium">{initial}</span>
    </div>
  )
}

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
  usuarios: UsuarioTabla[]
  searchTerm?: string
  estadoFilter?: "activo" | "inactivo" | "suspendido"
}

const UsersTable = ({
  usuarios: usuariosFromProps,
  searchTerm: initialSearchTerm = "",
  estadoFilter,
}: UsersTableProps) => {
  // Hooks para foto de perfil
  const { updatePhoto, isLoading: isUploadingPhoto } = useUpdateProfilePhoto()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedUserId, setSelectedUserId] = React.useState<
    string | number | null
  >(null)

  // Estados
  const [searchValue, setSearchValue] = React.useState(initialSearchTerm)
  const [filteredUsuarios, setFilteredUsuarios] = React.useState<
    UsuarioTabla[]
  >([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const router = useRouter()

  // Hook para acciones de usuario
  const {
    changeUserStatus,
    isLoading: isProcessing,
    error: actionError,
    success,
  } = useUserActions()


  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    userId: string | number,
    userName: string
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ]
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido", {
        description: "Solo se permiten imágenes JPG, PNG, GIF o WebP",
      })
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("Imagen muy grande", {
        description: "La imagen no puede superar los 5MB",
      })
      return
    }

    toast.promise(
      updatePhoto(userId, file).then((response) => {
        if (response) {
          const photoUrl =
            response.data?.foto ||
            response.data?.fotoPerfil ||
            response.data?.photoUrl ||
            response.data?.url

          console.log("🖼️ URL de foto extraída:", photoUrl)

          if (photoUrl) {
            setFilteredUsuarios((prev) =>
              prev.map((user) =>
                user.uid === userId ? { ...user, foto: photoUrl } : user
              )
            )
            console.log("✅ Estado actualizado con foto para usuario:", userId)
          } else {
            console.warn("⚠️ No se pudo extraer la URL de la foto")
          }
        }
        return response
      }),
      {
        loading: "Subiendo foto...",
        success: `La foto de ${userName} se actualizó correctamente`,
        error: (err) =>
          err instanceof Error ? err.message : "Error al subir foto",
      }
    )

    // Limpiar input
    if (event.target) {
      event.target.value = ""
    }
  }
  // ✅ Función para abrir el selector de archivo
  const openFileSelector = (userId: string | number) => {
    setSelectedUserId(userId)
    fileInputRef.current?.click()
  }

  
  React.useEffect(() => {
    console.log("📊 UsersTable - usuarios recibidos:", usuariosFromProps.length)
    setFilteredUsuarios(usuariosFromProps)
    setCurrentPage(1)
  }, [usuariosFromProps])

  
  const handleFilter = React.useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredUsuarios(usuariosFromProps)
        setCurrentPage(1)
        return
      }

      const search = searchTerm.toLowerCase().trim()
      const filtered = usuariosFromProps.filter(
        (usuario) =>
          usuario.nombre?.toLowerCase().includes(search) ||
          usuario.email?.toLowerCase().includes(search)
      )

      console.log("🔍 Filtrado por búsqueda:", {
        termino: searchTerm,
        total: usuariosFromProps.length,
        filtrados: filtered.length,
      })

      setFilteredUsuarios(filtered)
      setCurrentPage(1)
    },
    [usuariosFromProps]
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
    setFilteredUsuarios(usuariosFromProps)
    setCurrentPage(1)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  // Cambiar estado usuario
  // Cambiar estado usuario - SIN toasts
  const handleToggleUserStatus = async (
    userId: string | number,
    isCurrentlyActive: boolean
  ) => {
    try {
      await changeUserStatus(userId, isCurrentlyActive)

      const updateUserInList = (users: UsuarioTabla[]) =>
        users.map((user) =>
          user.uid === userId ? { ...user, isActive: !isCurrentlyActive } : user
        )

      setFilteredUsuarios((prev) => updateUserInList(prev))
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      throw error // ⬅️ Re-lanza el error para que lo capture el onClick
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

  // Columnas
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
              photoUrl={row.original.foto || undefined}
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
                disabled={isProcessing || isUploadingPhoto}
              >
                {isProcessing || isUploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => openFileSelector(row.original.uid)}
                disabled={isUploadingPhoto}
              >
                <Camera className="mr-2 h-4 w-4" />
                Cambiar foto
              </DropdownMenuItem>

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
                  toast.promise(
                    handleToggleUserStatus(
                      row.original.uid,
                      row.original.isActive
                    ),
                    {
                      loading: row.original.isActive
                        ? "Desactivando usuario..."
                        : "Activando usuario...",
                      success: `${row.original.nombre} ha sido ${
                        row.original.isActive ? "desactivado" : "activado"
                      } correctamente`,
                      error: "Hubo un problema. Inténtalo de nuevo.",
                    }
                  )
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
    [isProcessing, isUploadingPhoto, router]
  )

  // Table instance
  const table = useReactTable({
    data: usuariosPagina,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (usuariosFromProps.length === 0) {
    return (
      <div className="w-full">
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground text-sm mb-2">
            No hay usuarios disponibles
          </div>
          <div className="text-xs text-muted-foreground">
            Los datos se están cargando o no hay usuarios en el rango
            seleccionado
          </div>
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
          {filteredUsuarios.length !== usuariosFromProps.length &&
            ` (${usuariosFromProps.length} en total)`}
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
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
                    "No hay usuarios para mostrar"
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
          {filteredUsuarios.length !== usuariosFromProps.length &&
            ` (filtrados de ${usuariosFromProps.length})`}
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

      {/* ✅ Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          if (selectedUserId) {
            const usuario = filteredUsuarios.find(
              (u) => u.uid === selectedUserId
            )
            handlePhotoChange(e, selectedUserId, usuario?.nombre || "Usuario")
          }
        }}
      />
    </div>
  )
}

export default UsersTable
