"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Car, Edit } from "lucide-react"
import EditVehiculoModal from "../ModalVehicle"

interface UserVehiculosProps {
  userId: string
  isAdmin?: boolean
}

interface VehiculoLocal {
  id: string
  matricula?: string
  placa?: string
  marca: string
  modelo: string
  año?: number
  color?: string
  tipoVehiculo?: "auto" | "moto" | "camion" | "furgoneta"
  numeroMotor?: string
  numeroChasis?: string
  fechaRegistro?: string
  isActive?: boolean
  userId?: string
}

const UserVehiculos: React.FC<UserVehiculosProps> = ({
  userId,
  isAdmin = false,
}) => {
  const [vehiculos, setVehiculos] = React.useState<VehiculoLocal[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)

  const fetchVehiculos = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")

      // Decidir qué endpoint usar
      let url = `https://kns.aparcoyo.com/apa/vehiculos`
      if (isAdmin && userId) {
        url = `https://kns.aparcoyo.com/apa/vehiculos/admin/${userId}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Si es 404, probablemente no tenga vehículos - no es un error
      if (response.status === 404) {
        setVehiculos([])
        return
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Ajustar según la estructura de respuesta de tu API
      const vehiculosData = data.data || data.vehiculos || data || []
      setVehiculos(vehiculosData)
    } catch (err) {
      console.error("Error al obtener vehículos:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [userId, isAdmin])

  React.useEffect(() => {
    if (userId) {
      fetchVehiculos()
    }
  }, [userId, fetchVehiculos])

  // Manejar apertura del modal
  const handleEditClick = () => {
    setIsEditModalOpen(true)
  }

  // Manejar cierre del modal
  const handleModalClose = () => {
    setIsEditModalOpen(false)
  }

  // Manejar éxito en guardar
  const handleSaveSuccess = async () => {
    await fetchVehiculos()
  }

  // Convertir vehiculos locales a formato del modal
  const vehiculosParaModal = vehiculos.map((vehiculo) => ({
    id: vehiculo.id,
    userId: vehiculo.userId || userId,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    año: vehiculo.año || 0,
    placa: vehiculo.placa || vehiculo.matricula || "",
    color: vehiculo.color || "",
    tipoVehiculo: vehiculo.tipoVehiculo || "auto",
    numeroMotor: vehiculo.numeroMotor,
    numeroChasis: vehiculo.numeroChasis,
    fechaRegistro: vehiculo.fechaRegistro || new Date().toISOString(),
    isActive: vehiculo.isActive ?? true,
  }))

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
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchVehiculos}
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <h3 className="text-lg font-semibold">Vehículos</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditClick}
            disabled={loading}
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
                    <p className="font-medium text-sm">
                      {vehiculo.placa || vehiculo.matricula}
                    </p>
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

      {/* Modal de edición */}
      <EditVehiculoModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        vehiculos={vehiculosParaModal}
        userId={isAdmin ? userId : undefined}
        onSuccess={handleSaveSuccess}
      />
    </>
  )
}

export default UserVehiculos
