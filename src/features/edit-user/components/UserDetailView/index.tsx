/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { User } from "lucide-react"

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

        // Primero intentar GET individual
        const responseIndividual = await fetch(
          `https://kns.aparcoyo.com/apa/usuarios/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(`📨 Response status: ${responseIndividual.status}`)

        if (!responseIndividual.ok) {
          const errorText = await responseIndividual.text()
          console.error(`❌ Response error: ${errorText}`)
          throw new Error(
            `Error ${responseIndividual.status}: ${responseIndividual.statusText}`
          )
        }

        const dataIndividual = await responseIndividual.json()
        const usuarioIndividual = dataIndividual.data || dataIndividual

        console.log(`✅ Usuario obtenido (individual):`, usuarioIndividual)
        console.log(
          `🖼️ Foto del usuario (individual):`,
          usuarioIndividual?.foto
        )

        // Si no tiene foto, intentar obtenerla desde la lista
        if (!usuarioIndividual.foto) {
          console.log(`🔄 No hay foto en GET individual, consultando lista...`)

          try {
            const responseLista = await fetch(
              `https://kns.aparcoyo.com/apa/usuarios`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            )

            if (responseLista.ok) {
              const dataLista = await responseLista.json()
              const usuarios = dataLista.data || dataLista

              // Buscar el usuario en la lista
              const usuarioConFoto = Array.isArray(usuarios)
                ? usuarios.find((u: any) => u.uid === userId)
                : null

              if (usuarioConFoto?.foto) {
                console.log(`✅ Foto encontrada en lista:`, usuarioConFoto.foto)
                usuarioIndividual.foto = usuarioConFoto.foto
              } else {
                console.log(`⚠️ Usuario no encontrado en lista o sin foto`)
              }
            }
          } catch (err) {
            console.warn(`⚠️ Error al obtener lista (no crítico):`, err)
          }
        }

        setUsuario(usuarioIndividual)
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

  // Avatar con foto - construir URL ya que el GET individual no trae el campo foto
  const Avatar = () => {
    // Construir URL de foto basada en el patrón que usa el backend
    const fotoUrl =
      usuario.foto ||
      `https://kns.aparcoyo.com/apa/archivos/perfil/foto/${usuario.uid}`

    console.log("🖼️ Intentando cargar foto desde:", fotoUrl)
    console.log("📋 Usuario completo:", usuario)
    console.log("🆔 UID del usuario:", usuario.uid)
    console.log("📸 Campo foto del usuario:", usuario.foto)

    if (usuario.uid) {
      return (
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
          <img
            src={fotoUrl}
            alt={`Foto de ${usuario.nombre || usuario.email}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log("❌ Error al cargar la imagen desde:", fotoUrl)
              console.log("❌ Status de la imagen:", e.currentTarget.complete)
              const target = e.currentTarget
              target.style.display = "none"
              const parent = target.parentElement
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
            onLoad={() => {
              console.log("✅ Imagen cargada exitosamente desde:", fotoUrl)
            }}
          />
        </div>
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
