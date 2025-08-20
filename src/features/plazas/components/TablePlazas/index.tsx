/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation" // ← AGREGAR: import del router

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

import { useGetAllPlazas } from "../../hooks/useGetAllPlazas"
import { createColumns } from "./columns"
import { eliminarPlazaService } from "../../services/plazas"

const UsersTablePlazas = () => {
  const router = useRouter() // ← AGREGAR: inicializar el router
  const { getAllPlazas, plazas, isLoading } = useGetAllPlazas()

  // Estado para controlar qué plaza se está eliminando
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Función para eliminar plaza
  const handleEliminarPlaza = async (id: string, direccion: string) => {
    // Validar que tengamos un ID válido
    if (!id) {
      alert("Error: ID de plaza no válido")
      return
    }

    // Confirmación del usuario
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la plaza "${direccion}"?\n\nEsta acción no se puede deshacer.`
    )

    if (!confirmed) return

    try {
      setDeletingId(id) // Mostrar loading en esta plaza específica

      console.log(`🗑️ Iniciando eliminación de plaza:`, { id, direccion })

      // Llamar al servicio de eliminación
      const response = await eliminarPlazaService(id)

      console.log(`✅ Plaza eliminada exitosamente:`, response.data)

      // Mostrar mensaje de éxito
      alert("Plaza eliminada exitosamente")

      // Recargar la lista de plazas
      await getAllPlazas()
    } catch (error: any) {
      console.error("❌ Error completo al eliminar plaza:", error)

      // Manejo de errores específicos con más detalle
      if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status
        const data = error.response.data

        console.error(`❌ Error del servidor:`, {
          status,
          data,
          headers: error.response.headers,
        })

        switch (status) {
          case 400:
            // Extraer el mensaje específico del servidor
            const serverMessage =
              data?.message || data?.msg || data?.error || "Petición inválida"
            console.error(`❌ Mensaje del servidor (400):`, serverMessage)

            // Mostrar mensaje más específico según el contenido
            if (serverMessage.includes("reservas activas")) {
              alert(
                `No se puede eliminar la plaza "${direccion}" porque tiene reservas activas. Cancela las reservas primero.`
              )
            } else if (serverMessage.includes("dependencias")) {
              alert(
                `No se puede eliminar la plaza "${direccion}" porque tiene datos relacionados.`
              )
            } else {
              alert(`Error: ${serverMessage}`)
            }
            break
          case 401:
            alert(
              "Error 401 - No tienes autorización para eliminar plazas. Verifica tu sesión."
            )
            break
          case 403:
            alert("Error 403 - No tienes permisos para eliminar esta plaza.")
            break
          case 404:
            alert("Error 404 - La plaza no existe o ya fue eliminada.")
            break
          case 500:
            alert(
              "Error 500 - Error interno del servidor. Inténtalo más tarde."
            )
            break
          default:
            alert(
              `Error ${status}: ${
                data?.message || data?.msg || "Error desconocido del servidor"
              }`
            )
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error(`❌ Sin respuesta del servidor:`, error.request)
        alert(
          "Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet."
        )
      } else {
        // Algo más pasó
        console.error(`❌ Error de configuración:`, error.message)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setDeletingId(null) // Quitar loading
    }
  }

  // ← AGREGAR: Función para manejar la navegación a editar
  const handleEditarPlaza = (id: string) => {
    console.log("🔄 Navegando a editar plaza con ID:", id)
    console.log("🔄 URL destino:", `/plazas/${id}`)

    // Navegar a tu página de edición
    router.push(`/plazas/${id}`)
  }

  // ← MODIFICAR: Crear columnas con AMBAS funciones (eliminar Y editar)
  const columns = createColumns({
    onEliminarPlaza: handleEliminarPlaza,
    deletingId,
    onEditarPlaza: handleEditarPlaza, // ← AGREGAR esta línea
  })

  const table = useReactTable({
    data: plazas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    getAllPlazas()
  }, [])

  // ← AGREGAR: Debug para verificar que las funciones están conectadas
  useEffect(() => {
    console.log("🔍 Componente UsersTablePlazas montado")
    console.log("🔍 Función handleEditarPlaza:", handleEditarPlaza)
    console.log("🔍 Total de plazas:", plazas.length)
  }, [plazas])

  if (isLoading) {
    return (
      <div className="h-6">
        <Skeleton className="h-full" />
      </div>
    )
  }

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
            {plazas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron plazas
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

export default UsersTablePlazas
