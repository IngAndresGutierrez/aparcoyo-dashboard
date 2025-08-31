/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import {
  eliminarPlazaService,
  verificarEliminacionPlazaService,
} from "../../services/plazas"

const UsersTablePlazas = () => {
  const router = useRouter()
  const { getAllPlazas, plazas, isLoading } = useGetAllPlazas()

  // Estado para controlar qué plaza se está eliminando
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // FUNCIÓN MEJORADA CON VERIFICACIÓN PREVIA
  const handleEliminarPlaza = async (id: string, direccion: string) => {
    // Validar que tengamos un ID válido
    if (!id) {
      toast.error("Error", {
        description: "ID de plaza no válido",
      })
      return
    }

    try {
      // STEP 1: VERIFICAR PRIMERO SI SE PUEDE ELIMINAR
      const verificacionToast = toast.loading("Verificando plaza...", {
        description: "Comprobando si la plaza puede ser eliminada",
      })

      const verificacion = await verificarEliminacionPlazaService(id)

      // Cerrar toast de verificación
      toast.dismiss(verificacionToast)

      if (!verificacion.puedeEliminar && verificacion.motivo) {
        // NO SE PUEDE ELIMINAR - MOSTRAR INFORMACIÓN CLARA
        toast.error("No se puede eliminar", {
          description: verificacion.motivo,
          duration: 8000,
          action: {
            label: "Ver detalles",
            onClick: () => {
              router.push(`/plazas/${id}`)
            },
          },
        })
        return
      }

      // SÍ SE PUEDE ELIMINAR (o no sabemos) - MOSTRAR CONFIRMACIÓN NORMAL
      toast("¿Eliminar plaza?", {
        description: `¿Estás seguro de que quieres eliminar "${direccion}"? Esta acción no se puede deshacer.`,
        action: {
          label: "Eliminar",
          onClick: async () => {
            await executeDelete(id, direccion)
          },
        },
        cancel: {
          label: "Cancelar",
          onClick: () => {
            // Toast se cierra automáticamente
          },
        },
        duration: 10000,
      })
    } catch (error: any) {
      console.error("Error al verificar plaza:", error)

      // Si la verificación falla, mostrar confirmación de todas formas
      toast("¿Eliminar plaza?", {
        description: `No se pudo verificar el estado de "${direccion}". ¿Continuar con la eliminación?`,
        action: {
          label: "Eliminar",
          onClick: async () => {
            await executeDelete(id, direccion)
          },
        },
        cancel: {
          label: "Cancelar",
          onClick: () => {},
        },
        duration: 10000,
      })
    }
  }

  // FUNCIÓN PARA EJECUTAR LA ELIMINACIÓN (SIN CAMBIOS)
  const executeDelete = async (id: string, direccion: string) => {
    try {
      setDeletingId(id) // Mostrar loading en esta plaza específica

      // TOAST DE LOADING
      const loadingToast = toast.loading("Eliminando plaza...", {
        description: `Eliminando "${direccion}"`,
      })

      console.log(`Iniciando eliminación de plaza:`, { id, direccion })

      // Llamar al servicio de eliminación
      const response = await eliminarPlazaService(id)

      console.log(`Plaza eliminada exitosamente:`, response.data)

      // CERRAR LOADING TOAST
      toast.dismiss(loadingToast)

      // TOAST DE ÉXITO
      toast.success("Plaza eliminada", {
        description: `"${direccion}" ha sido eliminada exitosamente`,
      })

      // Recargar la lista de plazas
      await getAllPlazas()
    } catch (error: any) {
      console.error("Error completo al eliminar plaza:", error)

      // MANEJO DE ERRORES CON SONNER
      if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status
        const data = error.response.data

        console.error(`Error del servidor:`, {
          status,
          data,
          headers: error.response.headers,
        })

        switch (status) {
          case 400:
            // Extraer el mensaje específico del servidor
            const serverMessage =
              data?.message || data?.msg || data?.error || "Petición inválida"
            console.error(`Mensaje del servidor (400):`, serverMessage)

            // MENSAJES ESPECÍFICOS CON SONNER
            if (
              serverMessage.includes("reservas activas") ||
              serverMessage.includes("reserva")
            ) {
              toast.error("No se puede eliminar", {
                description: `La plaza "${direccion}" tiene reservas activas. Cancela las reservas primero.`,
                duration: 8000,
                action: {
                  label: "Ver reservas",
                  onClick: () => {
                    // Opcional: navegar a ver las reservas
                    router.push(`/reservas?plazaId=${id}`)
                  },
                },
              })
            } else if (serverMessage.includes("dependencias")) {
              toast.error("No se puede eliminar", {
                description: `La plaza "${direccion}" tiene datos relacionados.`,
                duration: 6000,
              })
            } else {
              toast.error("Error al eliminar", {
                description: serverMessage,
                duration: 5000,
              })
            }
            break

          case 401:
            toast.error("Sin autorización", {
              description:
                "No tienes autorización para eliminar plazas. Verifica tu sesión.",
              duration: 5000,
            })
            break

          case 403:
            toast.error("Sin permisos", {
              description: "No tienes permisos para eliminar esta plaza.",
              duration: 5000,
            })
            break

          case 404:
            toast.error("Plaza no encontrada", {
              description: "La plaza no existe o ya fue eliminada.",
              duration: 5000,
            })
            break

          case 500:
            toast.error("Error del servidor", {
              description: "Error interno del servidor. Inténtalo más tarde.",
              duration: 5000,
            })
            break

          default:
            toast.error(`Error ${status}`, {
              description:
                data?.message || data?.msg || "Error desconocido del servidor",
              duration: 5000,
            })
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error(`Sin respuesta del servidor:`, error.request)
        toast.error("Error de conexión", {
          description:
            "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
          duration: 5000,
        })
      } else {
        // Algo más pasó
        console.error(`Error de configuración:`, error.message)
        toast.error("Error", {
          description: error.message,
          duration: 5000,
        })
      }
    } finally {
      setDeletingId(null) // Quitar loading
    }
  }

  // Función para manejar la navegación a editar
  const handleEditarPlaza = (id: string) => {
    console.log("Navegando a editar plaza con ID:", id)
    console.log("URL destino:", `/plazas/${id}`)

    // Navegar a tu página de edición
    router.push(`/plazas/${id}`)
  }

  // Crear columnas con AMBAS funciones (eliminar Y editar)
  const columns = createColumns({
    onEliminarPlaza: handleEliminarPlaza,
    deletingId,
    onEditarPlaza: handleEditarPlaza,
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

  // Debug para verificar que las funciones están conectadas
  useEffect(() => {
    console.log("Componente UsersTablePlazas montado")
    console.log("Función handleEditarPlaza:", handleEditarPlaza)
    console.log("Total de plazas:", plazas.length)
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
