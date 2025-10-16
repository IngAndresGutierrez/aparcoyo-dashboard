/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { MapPin, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

interface UserPlazasProps {
  userId: string
}

interface Plaza {
  id: string
  nombre: string
  direccion?: string
  tipo: "privada" | "inmediata"
  reservas: number
  activa?: boolean
}

const UserPlazas: React.FC<UserPlazasProps> = ({ userId }) => {
  const [plazas, setPlazas] = React.useState<Plaza[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchPlazas = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`🏢 Obteniendo plazas del usuario ${userId}...`)

        const response = await fetch(
          `https://kns.aparcoyo.com/apa/plazas/usuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(`📨 UserPlazas - Response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ UserPlazas - Plazas del usuario obtenidas:`, data)

        const plazasDelUsuario = data.data || data.plazas || data || []

        const plazasMapeadas = plazasDelUsuario.map((plaza: any) => ({
          id: plaza.id || plaza.uid,
          nombre: plaza.nombre || "Plaza sin nombre",
          direccion: plaza.direccion,
          descripcion: plaza.descripcion,
          tipo: plaza.tipo || "inmediata",
          precio: plaza.precio,
          reservas: plaza.reservas || plaza.totalReservas || 0,
          activa: plaza.activa !== false,
        }))

        console.log(`✅ Plazas mapeadas:`, plazasMapeadas)
        setPlazas(plazasMapeadas)
      } catch (err) {
        console.error("❌ Error al obtener plazas:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchPlazas()
    }
  }, [userId])

  const handleDeletePlaza = async (plaza: Plaza) => {
    // Toast de confirmación con Sonner
    toast(`¿Eliminar plaza "${plaza.nombre}"?`, {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Eliminar",
        onClick: async () => {
          await executeDelete(plaza)
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {
          toast.dismiss()
        },
      },
      duration: 10000,
    })
  }

  const executeDelete = async (plaza: Plaza) => {
    try {
      setDeletingId(plaza.id)

      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")

      const loadingToastId = toast.loading("Eliminando plaza...", {
        description: `Eliminando plaza "${plaza.nombre}"`,
      })

      console.log(`🗑️ Eliminando plaza: ${plaza.id}`)

      const response = await fetch(
        `https://kns.aparcoyo.com/apa/plazas/${plaza.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log(`📨 Delete response status: ${response.status}`)

      toast.dismiss(loadingToastId)

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Error desconocido" }))
        throw new Error(
          `Error ${response.status}: ${
            errorData.message || response.statusText
          }`
        )
      }

      // Actualizar estado local removiendo la plaza
      setPlazas((prevPlazas) => prevPlazas.filter((p) => p.id !== plaza.id))

      // Toast de éxito
      toast.success("Plaza eliminada correctamente", {
        description: `La plaza "${plaza.nombre}" ha sido eliminada`,
        duration: 4000,
      })

      console.log(`✅ Plaza ${plaza.id} eliminada exitosamente`)
    } catch (err) {
      console.error("❌ Error al eliminar plaza:", err)

      toast.error("Error al eliminar plaza", {
        description:
          err instanceof Error
            ? err.message
            : "Ha ocurrido un error inesperado",
        duration: 5000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent className="">
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <h2 className="text-xl font-semibold">Plazas publicadas</h2>
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500 text-sm font-medium mb-2">
              Error al cargar plazas
            </div>
            <div className="text-muted-foreground text-xs">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lg:w-110">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h2 className="text-xl font-semibold">
          {plazas.length} Plazas publicadas
        </h2>
      </CardHeader>

      <CardContent className="">
        {/* Vista mobile - Lista simple */}
        <div className="md:hidden space-y-3">
          {plazas.length > 0 ? (
            plazas.map((plaza) => (
              <div
                key={plaza.id}
                className="flex items-center space-x-3 p-3 border rounded-lg"
              >
                <div className="h-10 w-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{plaza.nombre}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant={
                        plaza.tipo === "privada" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {plaza.tipo === "privada"
                        ? "Plaza Privada"
                        : "Plaza Inmediata"}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">
                      {plaza.reservas} reservas
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay plazas publicadas
            </div>
          )}
        </div>

        {/* Vista desktop - Tabla completa */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plaza</TableHead>
                <TableHead className="text-center">Reservas</TableHead>
                <TableHead className="w-[50px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plazas.length > 0 ? (
                plazas.map((plaza) => (
                  <TableRow key={plaza.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {plaza.nombre}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                plaza.tipo === "privada"
                                  ? "secondary"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {plaza.tipo === "privada"
                                ? "Plaza Privada"
                                : "Plaza Inmediata"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="font-medium">{plaza.reservas}</span>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={deletingId === plaza.id}
                          >
                            {deletingId === plaza.id ? (
                              <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeletePlaza(plaza)}
                            className="text-red-600"
                            disabled={deletingId === plaza.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingId === plaza.id
                              ? "Eliminando..."
                              : "Eliminar plaza"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No hay plazas publicadas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserPlazas
