"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { MoreHorizontal, Loader2, Edit, Trash2 } from "lucide-react" // ✨ AGREGADOS Edit y Trash2
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
  // Agregar función de navegación opcional
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
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "direccion",
    header: "Plaza",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <Image
            src="/home/home-03.svg"
            alt="plaza"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-900">
            {row.original.direccion}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-500 capitalize">
              {formatPlazaType(row.original.tipo)}
            </span>
          </div>
        </div>
      </div>
    ),
    // Sin meta.responsive para que siempre sea visible
  },
  {
    header: "Reservas",
    cell: () => <span className="text-sm font-medium">0</span>,
    // Sin meta.responsive para que siempre sea visible
  },
  {
    accessorKey: "precio",
    header: "Precio",
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatPrice(row.original.precio)}
      </span>
    ),
    meta: { responsive: true }, // Ocultar en responsive
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
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    accessorKey: "propietario",
    header: "Propietario",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {getInitial(row.original.propietario.nombre)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {row.original.propietario.nombre}
          </span>
          <span className="text-xs text-gray-500 truncate max-w-[120px]">
            {row.original.propietario.email}
          </span>
        </div>
      </div>
    ),
    meta: { responsive: true }, // Ocultar en responsive
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const plaza = row.original
      const isDeleting = deletingId === plaza.id

      // Función para manejar la navegación a editar
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
            {/* ✨ ITEM EDITAR CON ICONO */}
            <DropdownMenuItem
              disabled={isDeleting}
              onClick={handleEditClick}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Editar plaza</span>
            </DropdownMenuItem>

            {/* ✨ ITEM ELIMINAR CON ICONO */}
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
    meta: { responsive: true }, // Ocultar en responsive
  },
]

// VERSIÓN DE COMPATIBILIDAD (si no quieres cambiar mucho código)
// Exporta las columnas por defecto sin funcionalidad de eliminar
export const columns: ColumnDef<Plaza>[] = createColumns({
  onEliminarPlaza: async (id: string, nombre: string) => {
    console.log(
      `Función de eliminar no configurada para plaza ${id}: ${nombre}`
    )
  },
  deletingId: null,
})

// EXPORTAR TAMBIÉN LA FUNCIÓN PARA BACKWARD COMPATIBILITY
export default createColumns
