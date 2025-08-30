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
import { toast } from "sonner" // ✅ Agregar Sonner

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
  const [deletingId, setDeletingId] = React.useState<string | null>(null) // ✅ Estado para loading de eliminación

  React.useEffect(() => {
    const fetchPlazas = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`🏢 Obteniendo plazas del usuario ${userId}...`)

        // ✅ ENFOQUE OPTIMIZADO: Usar endpoint específico para el usuario
        const response = await fetch(
          `https://aparcoyo-back.onrender.com/apa/plazas/usuario/${userId}`,
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

        // Ya no necesitamos filtrar, el backend devuelve solo las plazas del usuario
        const plazasDelUsuario = data.data || data.plazas || data || []

        // Mapear a nuestra estructura
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


  // ✅ Implementar función de eliminar plaza
  const handleDeletePlaza = async (plazaId: string, plazaNombre: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la plaza "${plazaNombre}"?`
    )

    if (!confirmDelete) return

    try {
      setDeletingId(plazaId) // Mostrar loading

      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")

      // ✅ Toast de loading
      toast.loading("Eliminando plaza...", {
        id: `delete-plaza-${plazaId}`,
      })

      console.log(`🗑️ Eliminando plaza: ${plazaId}`)

      // ✅ Realizar petición DELETE a plazas (necesitamos confirmar el endpoint exacto)
      const response = await fetch(
        `https://aparcoyo-back.onrender.com/apa/plazas/${plazaId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      console.log(`📨 Delete response status: ${response.status}`)

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

      // ✅ Actualizar estado local removiendo la plaza
      setPlazas((prevPlazas) =>
        prevPlazas.filter((plaza) => plaza.id !== plazaId)
      )

      // ✅ Toast de éxito
      toast.success("Plaza eliminada correctamente", {
        id: `delete-plaza-${plazaId}`,
        description: `La plaza "${plazaNombre}" ha sido eliminada`,
        duration: 4000,
      })

      console.log(`✅ Plaza ${plazaId} eliminada exitosamente`)
    } catch (err) {
      console.error("❌ Error al eliminar plaza:", err)

      // ✅ Toast de error
      toast.error("Error al eliminar plaza", {
        id: `delete-plaza-${plazaId}`,
        description:
          err instanceof Error
            ? err.message
            : "Ha ocurrido un error inesperado",
        duration: 5000,
      })
    } finally {
      setDeletingId(null) // Quitar loading
    }
  }

  if (loading) {
    return (
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between pb-4 ">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 ">
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
    <Card className="w-140">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h2 className="text-xl font-semibold">
          {plazas.length} Plazas publicadas
        </h2>
      </CardHeader>

      <CardContent className="">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plaza</TableHead>
                <TableHead className="text-center">Reservas</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plazas.length > 0 ? (
                plazas.map((plaza) => (
                  <TableRow key={plaza.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {plaza.nombre}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                plaza.tipo === "privada"
                                  ? "default"
                                  : "secondary"
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
                            disabled={deletingId === plaza.id} // ✅ Deshabilitar durante eliminación
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
                            onClick={() =>
                              handleDeletePlaza(plaza.id, plaza.nombre)
                            }
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
