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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Trash2, MoreHorizontal, Calendar, Clock } from "lucide-react"
import { toast } from "sonner"

interface UserReservasProps {
  userId: string
}

interface Reserva {
  id: string
  plaza: {
    id: string
    nombre: string
    direccion?: string
    tipo: "privada" | "inmediata"
  }
  propietario: {
    id: string
    nombre: string
    email?: string
    avatar?: string
  }
  fechaInicio: string
  fechaFin: string
  estado: "pendiente" | "concluida" | "cancelada" | "activa"
  precio: number
  moneda: string
  matricula?: string
  vehiculo?: {
    id: string
    placa: string
  }
}

const UserReservas: React.FC<UserReservasProps> = ({ userId }) => {
  const [reservas, setReservas] = React.useState<Reserva[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchReservas = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`📅 Obteniendo reservas del usuario ${userId}...`)

        const response = await fetch(
          `https://kns.aparcoyo.com/apa/reservas/usuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(`📨 UserReservas - Response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ UserReservas - Reservas del usuario obtenidas:`, data)

        const reservasDelUsuario = data.data || data.reservas || data || []

        // Mapeo corregido con la estructura real del backend
        const reservasMapeadas = reservasDelUsuario.map((reserva: any) => ({
          id: reserva.id,
          plaza: {
            id: reserva.plaza?.id,
            nombre: reserva.plaza?.nombre || "Plaza sin nombre",
            direccion: reserva.plaza?.direccion,
            tipo: reserva.plaza?.tipo || "privada",
          },
          propietario: {
            id: reserva.plaza?.propietario?.uid,
            nombre: reserva.plaza?.propietario?.nombre || "Propietario",
            email: reserva.plaza?.propietario?.email || "",
            avatar: reserva.plaza?.propietario?.avatar,
          },
          fechaInicio: reserva.fechaInicio,
          fechaFin: reserva.fechaFin,
          estado: reserva.estado || "pendiente",
          precio: parseFloat(reserva.plaza?.precio) || 0,
          moneda: "$",
          matricula: reserva.matricula,
          vehiculo: reserva.vehiculo,
        }))

        console.log(`✅ Reservas mapeadas:`, reservasMapeadas)
        setReservas(reservasMapeadas)
      } catch (err) {
        console.error("❌ Error al obtener reservas:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchReservas()
    }
  }, [userId])

  const formatDate = (dateString: string) => {
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
      return "Error en fecha"
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""

      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estadoConfig = {
      pendiente: { label: "Pendiente", variant: "default" as const },
      concluida: { label: "Concluida", variant: "outline" as const },
      cancelada: { label: "Cancelada", variant: "destructive" as const },
      activa: { label: "Activa", variant: "default" as const },
    }

    const config =
      estadoConfig[estado as keyof typeof estadoConfig] ||
      estadoConfig.pendiente

    return (
      <Badge
        variant={config.variant}
        className="text-xs"
      >
        {config.label}
      </Badge>
    )
  }

  const handleDeleteReserva = async (reserva: Reserva) => {
    // Mostrar toast de confirmación con Sonner
    toast(`¿Eliminar reserva en ${reserva.plaza.nombre}?`, {
      description: "Esta acción no se puede deshacer",
      action: {
        label: "Eliminar",
        onClick: async () => {
          await executeDelete(reserva)
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

  const executeDelete = async (reserva: Reserva) => {
    try {
      setDeletingId(reserva.id)

      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")

      const loadingToastId = toast.loading("Eliminando reserva...", {
        description: `Eliminando reserva en ${reserva.plaza.nombre}`,
      })

      console.log(`🗑️ Eliminando reserva: ${reserva.id}`)

      const response = await fetch(
        `https://kns.aparcoyo.com/apa/reservas/${reserva.id}`,
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

      // Actualizar estado local removiendo la reserva
      setReservas((prevReservas) =>
        prevReservas.filter((r) => r.id !== reserva.id)
      )

      // Toast de éxito elegante
      toast.success("Reserva eliminada correctamente", {
        description: `La reserva en ${reserva.plaza.nombre} ha sido eliminada`,
        duration: 4000,
      })

      console.log(`✅ Reserva ${reserva.id} eliminada exitosamente`)
    } catch (err) {
      console.error("❌ Error al eliminar reserva:", err)

      toast.error("Error al eliminar reserva", {
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent>
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
                  <Skeleton className="h-6 w-16" />
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
          <h2 className="text-xl font-semibold">Reservas hechas</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500 text-sm font-medium mb-2">
              Error al cargar reservas
            </div>
            <div className="text-muted-foreground text-xs">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="lg:w-310 -mt-5">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h2 className="text-xl font-semibold">
          {reservas.length} Reservas hechas
        </h2>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plaza</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead className="hidden md:table-cell">
                  Fecha y hora
                </TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Precio</TableHead>
                <TableHead className="hidden md:table-cell w-[50px]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.length > 0 ? (
                reservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {reserva.plaza.nombre}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                reserva.plaza.tipo === "privada"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {reserva.plaza.tipo === "privada"
                                ? "Plaza Privada"
                                : "Plaza Inmediata"}
                            </Badge>
                          </div>
                          {reserva.matricula && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Vehículo: {reserva.matricula}
                            </p>
                          )}
                          {/* Mostrar información adicional en mobile */}
                          <div className="md:hidden mt-2 space-y-1">
                            <div className="flex items-center justify-between">
                              {getEstadoBadge(reserva.estado)}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDate(reserva.fechaInicio)}
                              </span>
                              {reserva.fechaInicio && reserva.fechaFin && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(reserva.fechaInicio)} -{" "}
                                  {formatTime(reserva.fechaFin)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                            {reserva.propietario.nombre.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {reserva.propietario.nombre}
                          </p>
                          {reserva.propietario.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {reserva.propietario.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(reserva.fechaInicio)}
                          </span>
                        </div>
                        {reserva.fechaInicio && reserva.fechaFin && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTime(reserva.fechaInicio)} -{" "}
                              {formatTime(reserva.fechaFin)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {getEstadoBadge(reserva.estado)}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <span className="font-medium">
                        {reserva.moneda}
                        {reserva.precio.toFixed(2)}
                      </span>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={deletingId === reserva.id}
                          >
                            {deletingId === reserva.id ? (
                              <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteReserva(reserva)}
                            className="text-red-600"
                            disabled={deletingId === reserva.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingId === reserva.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-8 text-muted-foreground md:hidden"
                  >
                    No hay reservas hechas
                  </TableCell>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground hidden md:table-cell"
                  >
                    No hay reservas hechas
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

export default UserReservas
