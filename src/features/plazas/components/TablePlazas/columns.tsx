/* eslint-disable @next/next/no-img-element */
"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { MoreHorizontal, Loader2, Edit, Trash2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Plaza } from "../../types"
import { formatPrice, getInitial, formatPlazaType } from "../../utils"

// Extender la interfaz ColumnMeta para incluir la propiedad responsive
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    responsive?: boolean
  }
}

// PROPS NECESARIAS PARA LAS COLUMNAS
interface ColumnProps {
  onEliminarPlaza: (id: string, nombre: string) => Promise<void>
  deletingId: string | null
  onEditarPlaza?: (id: string) => void
}

export const createColumns = ({
  onEliminarPlaza,
  deletingId,
  onEditarPlaza,
}: ColumnProps): ColumnDef<Plaza>[] => [
  {
    id: "select",
    header: () => <input type="checkbox" />,
    cell: () => <input type="checkbox" />,
  },
  {
    accessorKey: "direccion",
    header: "Plaza",
    cell: ({ row }) => {
      const plaza = row.original
      // Obtener primera imagen del array archivos
      const primeraImagen = plaza.archivos?.[0]?.url

      console.log("🏠 Plaza:", {
        direccion: plaza.direccion,
        archivos: plaza.archivos,
        primeraImagen: primeraImagen,
      })

      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {primeraImagen ? (
              <img
                src={primeraImagen}
                alt={plaza.direccion}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log(
                    "❌ Error al cargar imagen de plaza:",
                    primeraImagen
                  )
                  // Fallback al ícono si la imagen falla
                  e.currentTarget.style.display = "none"
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    `
                  }
                }}
                onLoad={() => {
                  console.log("✅ Imagen de plaza cargada:", primeraImagen)
                }}
              />
            ) : (
              <Image
                src="/home/home-03.svg"
                alt="plaza"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">
              {plaza.direccion}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-500 capitalize">
                {formatPlazaType(plaza.tipo)}
              </span>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    header: "Reservas",
    cell: () => <span className="text-sm font-medium">0</span>,
  },
  {
    accessorKey: "precio",
    header: "Precio",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatPrice(row.original.precio)}
      </span>
    ),
    meta: { responsive: true },
  },
  {
    accessorKey: "disponibilidadDesde",
    header: "Fecha de publicación",
    cell: ({ row }) => {
      const fecha = row.original.disponibilidadDesde
      console.log("🔍 Debug fecha:", {
        fechaRaw: fecha,
        fechaParsed: new Date(fecha),
        fechaFormateada: new Date(fecha).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      if (!fecha) {
        return <span className="text-sm text-gray-400">Sin fecha</span>
      }

      try {
        const date = new Date(fecha)

        if (isNaN(date.getTime())) {
          return <span className="text-sm text-red-400">Fecha inválida</span>
        }

        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        )
      } catch {
        return <span className="text-sm text-red-400">Error en fecha</span>
      }
    },
    meta: { responsive: true },
  },
  {
    accessorKey: "propietario",
    header: "Propietario",
    cell: ({ row }) => {
      const propietario = row.original.propietario

      console.log("👤 Propietario:", {
        nombre: propietario.nombre,
        foto: propietario.foto,
      })

      return (
        <div className="flex items-center gap-2">
          {propietario.foto ? (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={propietario.foto}
                alt={propietario.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log(
                    "❌ Error al cargar foto de propietario:",
                    propietario.foto
                  )
                  // Fallback a inicial si falla la foto
                  e.currentTarget.style.display = "none"
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.className =
                      "w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                    parent.innerHTML = `
                      <span class="text-sm font-medium text-blue-600">
                        ${getInitial(propietario.nombre)}
                      </span>
                    `
                  }
                }}
                onLoad={() => {
                  console.log(
                    "✅ Foto de propietario cargada:",
                    propietario.foto
                  )
                }}
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {getInitial(propietario.nombre)}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {propietario.nombre}
            </span>
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {propietario.email}
            </span>
          </div>
        </div>
      )
    },
    meta: { responsive: true },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const plaza = row.original
      const isDeleting = deletingId === plaza.id

      const handleEditClick = () => {
        if (onEditarPlaza) {
          onEditarPlaza(plaza.id)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isDeleting}
              onClick={handleEditClick}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Editar plaza</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
              onClick={() => onEliminarPlaza(plaza.id, plaza.direccion)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar plaza</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    meta: { responsive: true },
  },
]

// VERSIÓN DE COMPATIBILIDAD
export const columns: ColumnDef<Plaza>[] = createColumns({
  onEliminarPlaza: async (id: string, nombre: string) => {
    console.log(
      `Función de eliminar no configurada para plaza ${id}: ${nombre}`
    )
  },
  deletingId: null,
})

export default createColumns
