"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CreditCard, Edit, RefreshCw } from "lucide-react"
import EditCreditosModal from "../ModalEditCredits"
import { useBalance } from "../../hooks/useCredits"

interface UserCreditosProps {
  userId: string
  isAdmin?: boolean // Para saber si es vista de admin
}

interface CreditosInfo {
  disponibles: number
  gastados?: number
  total?: number
  moneda: string
}

const UserCredits: React.FC<UserCreditosProps> = ({
  userId,
  isAdmin = false,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)

  // Usar el hook para obtener el balance
  const { balance, loading, error, refetch } = useBalance(userId)

  // Procesar los datos del balance para el formato que espera el componente
  const creditos: CreditosInfo | null = React.useMemo(() => {
    if (!balance) return null

    return {
      disponibles: parseFloat(balance.data.balance),
      moneda: "€", // Puedes ajustar esto según tu lógica
      // Opcional: si tienes más datos en el futuro
      // gastados: balance.data.gastados,
      // total: balance.data.total,
    }
  }, [balance])

  // Manejar apertura del modal
  const handleEditClick = () => {
    console.log("🖱️ UserCredits - Click en editar", {
      creditosActuales: creditos?.disponibles,
      userId,
      isAdmin,
    })
    setIsEditModalOpen(true)
  }

  // Manejar cierre del modal
  const handleModalClose = () => {
    console.log("❌ UserCredits - Cerrando modal")
    setIsEditModalOpen(false)
  }

  // Manejar éxito en guardar
  const handleSaveSuccess = async (nuevoCredito: number) => {
    console.log("✅ UserCredits - Créditos actualizados:", nuevoCredito)

    // Refrescar los datos desde el servidor
    await refetch()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-16" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !creditos) {
    const is401Error =
      error?.includes("401") || error?.includes("Sin autorización")

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <h3 className="text-lg font-semibold">Créditos disponibles</h3>
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
            <div
              className={`text-sm font-medium mb-2 ${
                is401Error ? "text-amber-500" : "text-red-500"
              }`}
            >
              {is401Error
                ? "Sin permisos para ver créditos"
                : "Error al cargar créditos"}
            </div>
            <div className="text-muted-foreground text-xs mb-3">
              {is401Error
                ? "Necesitas permisos de administrador para acceder a esta función"
                : error}
            </div>
            {!is401Error && (
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <h3 className="text-lg font-semibold">Créditos disponibles</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              title="Actualizar balance"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              disabled={loading}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {creditos.moneda}
                {creditos.disponibles}
              </p>
              {creditos.gastados !== undefined &&
                creditos.total !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {creditos.gastados} gastados de {creditos.total} total
                  </p>
                )}
              <p className="text-xs text-muted-foreground mt-1">
                Balance actualizado:{" "}
                {balance ? new Date().toLocaleTimeString() : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edición de créditos */}
      <EditCreditosModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        creditosActuales={creditos?.disponibles || 0}
        moneda={creditos?.moneda || "€"}
        userId={userId} // Siempre pasar el userId (el modal ya maneja la lógica)
        onSuccess={handleSaveSuccess}
      />
    </>
  )
}

export default UserCredits
