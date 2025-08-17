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
import { MapPin, Edit, Trash2, MoreHorizontal } from "lucide-react"

interface UserReservasProps {
  userId: string
}

interface Reserva {
  id: string
  plaza: {
    id: string
    nombre: string
    tipo: "privada" | "inmediata"
  }
  propietario: {
    id: string
    nombre: string
    email: string
    avatar?: string
  }
  fechaConfirmacion: string
  estado: "programado" | "concluida" | "cancelada" | "activa"
  precio: number
  moneda?: string
}

const UserReservas: React.FC<UserReservasProps> = ({ userId }) => {
  const [reservas, setReservas] = React.useState<Reserva[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchReservas = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`📅 Obteniendo reservas del usuario ${userId}...`)

        // 🔄 OBTENER TODAS LAS RESERVAS Y FILTRAR POR USUARIO
        const response = await fetch(
          `https://aparcoyo-back.onrender.com/apa/reservas`,
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
        console.log(`✅ UserReservas - Todas las reservas obtenidas:`, data)

        // Obtener todas las reservas
        const todasLasReservas = data.data || data.reservas || data || []

        // Filtrar solo las reservas que pertenecen al usuario actual
        const reservasDelUsuario = todasLasReservas.filter(
          (reserva: any) =>
            reserva.usuarioId === userId ||
            reserva.clienteId === userId ||
            reserva.usuario === userId
        )

        console.log(
          `🎯 Reservas filtradas para usuario ${userId}:`,
          reservasDelUsuario
        )

        // Mapear a nuestra estructura
        const reservasMapeadas = reservasDelUsuario.map((reserva: any) => ({
          id: reserva.id || reserva.uid,
          plaza: {
            id: reserva.plazaId || reserva.plaza?.id,
            nombre:
              reserva.plaza?.nombre ||
              reserva.nombrePlaza ||
              "Plaza sin nombre",
            tipo: reserva.plaza?.tipo || reserva.tipoPlaza || "privada",
          },
          propietario: {
            id: reserva.propietarioId || reserva.propietario?.id,
            nombre:
              reserva.propietario?.nombre ||
              reserva.nombrePropietario ||
              "Propietario",
            email: reserva.propietario?.email || reserva.emailPropietario || "",
            avatar: reserva.propietario?.avatar,
          },
          fechaConfirmacion:
            reserva.fechaConfirmacion ||
            reserva.fechaCreacion ||
            reserva.createdAt,
          estado: reserva.estado || "programado",
          precio: reserva.precio || reserva.total || 12,
          moneda: reserva.moneda || "€",
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
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getEstadoBadge = (estado: string) => {
    const estadoConfig = {
      programado: { label: "Programado", variant: "default" as const },
      concluida: { label: "Concluida", variant: "secondary" as const },
      cancelada: { label: "Cancelada", variant: "destructive" as const },
      activa: { label: "Activa", variant: "default" as const },
    }

    const config =
      estadoConfig[estado as keyof typeof estadoConfig] ||
      estadoConfig.programado

    return (
      <Badge
        variant={config.variant}
        className="text-xs"
      >
        {config.label}
      </Badge>
    )
  }

  const handleEditReserva = (reservaId: string) => {
    console.log(`✏️ Editar reserva: ${reservaId}`)
    // Aquí iría la lógica para editar
  }

  const handleDeleteReserva = (reservaId: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar esta reserva?`
    )

    if (confirmDelete) {
      console.log(`🗑️ Eliminar reserva: ${reservaId}`)
      // Aquí iría la lógica para eliminar
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <h2 className="text-xl font-semibold">Reservas hechas</h2>
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
              Error al cargar reservas
            </div>
            <div className="text-muted-foreground text-xs">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h2 className="text-xl font-semibold">
          {reservas.length} Reservas hechas
        </h2>
        <Button
          variant="outline"
          size="sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plaza</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Fecha de confirmación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.length > 0 ? (
                reservas.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-gray-500" />
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {reserva.propietario.nombre.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {reserva.propietario.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {reserva.propietario.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatDate(reserva.fechaConfirmacion)}
                      </span>
                    </TableCell>
                    <TableCell>{getEstadoBadge(reserva.estado)}</TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {reserva.moneda}
                        {reserva.precio}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditReserva(reserva.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar reserva
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteReserva(reserva.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
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
