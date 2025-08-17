"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CreditCard, Edit } from "lucide-react"

interface UserCreditosProps {
  userId: string
}

interface CreditosInfo {
  disponibles: number
  gastados?: number
  total?: number
  moneda?: string
}

const UserCredits: React.FC<UserCreditosProps> = ({ userId }) => {
  const [creditos, setCreditos] = React.useState<CreditosInfo | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchCreditos = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`💰 Obteniendo créditos del usuario ${userId}...`)

        // Intentar obtener desde el endpoint principal del usuario
        const response = await fetch(
          `https://aparcoyo-back.onrender.com/apa/usuarios/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(`📨 UserCreditos - Response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ UserCreditos - Datos del usuario:`, data)

        const usuario = data.data || data

        // Buscar información de créditos en la respuesta
        const creditosData: CreditosInfo = {
          disponibles:
            usuario.creditos ||
            usuario.creditosDisponibles ||
            usuario.saldo ||
            35, // Default €35
          gastados: usuario.creditosGastados || 0,
          total: usuario.creditosTotal || usuario.creditos || 35,
          moneda: usuario.moneda || "€",
        }

        console.log(`💰 Créditos procesados:`, creditosData)
        setCreditos(creditosData)
      } catch (err) {
        console.error("❌ Error al obtener créditos:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchCreditos()
    }
  }, [userId])

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
            <div className="text-red-500 text-sm font-medium mb-2">
              Error al cargar créditos
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
        <h3 className="text-lg font-semibold">Créditos disponibles</h3>
        <Button
          variant="outline"
          size="sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-bold">
              {creditos.moneda || "€"}
              {creditos.disponibles}
            </p>
            {creditos.gastados !== undefined &&
              creditos.total !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {creditos.gastados} gastados de {creditos.total} total
                </p>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserCredits
