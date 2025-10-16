/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { User } from "lucide-react"
import Image from "next/image"

interface UserHeaderProps {
  userId: string
}

const UserHeader: React.FC<UserHeaderProps> = ({ userId }) => {
  const [usuario, setUsuario] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(`🔍 INICIANDO fetch para usuario: ${userId}`)

        const response = await fetch(
          `https://kns.aparcoyo.com/apa/usuarios/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(`📨 Response status: ${response.status}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Response error: ${errorText}`)
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ Usuario obtenido:`, data)
        console.log(`🖼️ Foto del usuario:`, data.data?.foto || data?.foto)

        setUsuario(data.data || data)
      } catch (err) {
        console.error("❌ Error completo:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        console.log("🏁 Finalizando fetch")
        setLoading(false)
      }
    }

    if (userId) {
      console.log(`🚀 useEffect ejecutado con userId: ${userId}`)
      fetchUser()
    } else {
      console.log("❌ No hay userId")
      setLoading(false)
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    )
  }

  if (error || !usuario) {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-xl font-bold">!</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Avatar con foto del campo 'foto'
  const Avatar = () => {
    if (usuario.foto) {
      return (
        <Image
          width={64}
          height={64}
          src={usuario.foto}
          alt={`Foto de ${usuario.nombre || usuario.email}`}
          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            console.log("❌ Error al cargar la imagen")
            e.currentTarget.style.display = "none"
            const parent = e.currentTarget.parentElement
            if (parent) {
              const initial =
                usuario.nombre?.charAt(0)?.toUpperCase() ||
                usuario.email?.charAt(0)?.toUpperCase() ||
                "U"
              parent.innerHTML = `
                <div class="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  ${initial}
                </div>
              `
            }
          }}
        />
      )
    }

    // Fallback: Avatar con inicial o ícono
    return (
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
        {usuario.nombre?.charAt(0)?.toUpperCase() ||
          usuario.email?.charAt(0)?.toUpperCase() || (
            <User className="h-8 w-8" />
          )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Avatar />
        <div>
          <h1 className="text-2xl font-bold">
            {usuario.nombre || "Sin nombre"}
          </h1>
          <p className="text-sm text-muted-foreground">{usuario.email}</p>
        </div>
      </div>
    </div>
  )
}

export default UserHeader
