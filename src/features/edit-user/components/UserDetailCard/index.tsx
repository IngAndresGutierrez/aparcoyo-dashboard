"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Edit } from "lucide-react"

interface UserDetailsProps {
  userId: string
}

interface UsuarioDetalle {
  uid: string
  nombre: string
  email: string
  rol: string
  isActive: boolean
  fechaRegistro: string
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
  const [usuario, setUsuario] = React.useState<UsuarioDetalle | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`📡 Obteniendo detalles del usuario ${userId}...`)

        const response = await fetch(
          `https://aparcoyo-back.onrender.com/apa/usuarios/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(`📨 UserDetails - Response status: ${response.status}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ UserDetails - Usuario obtenido:`, data)

        setUsuario(data.data || data)
      } catch (err) {
        console.error("❌ Error al obtener detalles del usuario:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserDetails()
    }
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !usuario) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <div className="text-red-500 text-sm font-medium mb-2">
              Error al cargar detalles
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
        <h2 className="text-xl font-semibold">Detalles del usuario</h2>
        <Button
          variant="outline"
          size="sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="mt-1 text-sm">{usuario.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Fecha de registro
            </label>
            <p className="mt-1 text-sm">{formatDate(usuario.fechaRegistro)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Rol
            </label>
            <p className="mt-1 text-sm capitalize">{usuario.rol}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Estado
            </label>
            <p className="mt-1 text-sm">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  usuario.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {usuario.isActive ? "Activo" : "Inactivo"}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserDetails
