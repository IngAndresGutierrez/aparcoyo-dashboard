"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Car, Edit } from "lucide-react"

interface UserVehiculosProps {
  userId: string
}

interface Vehiculo {
  id: string
  matricula: string
  marca: string
  modelo: string
  año?: number
  color?: string
}

const UserVehiculos: React.FC<UserVehiculosProps> = ({ userId }) => {
  const [vehiculos, setVehiculos] = React.useState<Vehiculo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`🚗 Obteniendo vehículos del usuario autenticado...`)

        const response = await fetch(
          `https://aparcoyo-back.onrender.com/apa/vehiculos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(`📨 UserVehiculos - Response status: ${response.status}`)

        // Si es 404, probablemente no tenga vehículos - no es un error
        if (response.status === 404) {
          console.log("ℹ️ Usuario no tiene vehículos registrados")
          setVehiculos([])
          return
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ UserVehiculos - Vehículos obtenidos:`, data)

        // Ajustar según la estructura de respuesta de tu API
        setVehiculos(data.data || data.vehiculos || data || [])
      } catch (err) {
        console.error("❌ Error al obtener vehículos:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchVehiculos()
    }
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex items-center space-x-3"
              >
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
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
          <h3 className="text-lg font-semibold">Vehículos</h3>
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
          <div className="text-center py-4">
            <div className="text-red-500 text-sm font-medium mb-2">
              Error al cargar vehículos
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
        <h3 className="text-lg font-semibold">Vehículos</h3>
        <Button
          variant="outline"
          size="sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {vehiculos.length > 0 ? (
            vehiculos.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className="flex items-center space-x-3"
              >
                <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  <Car className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{vehiculo.matricula}</p>
                  <p className="text-xs text-muted-foreground">
                    {vehiculo.marca} {vehiculo.modelo}
                    {vehiculo.año && ` (${vehiculo.año})`}
                    {vehiculo.color && ` - ${vehiculo.color}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Car className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay vehículos registrados
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default UserVehiculos
