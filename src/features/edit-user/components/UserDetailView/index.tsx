/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2 } from "lucide-react"

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
        const token = localStorage.getItem('token') || localStorage.getItem('authToken')
        
        console.log(`🔍 INICIANDO fetch para usuario: ${userId}`)
        console.log(`🔑 Token disponible: ${token ? 'SÍ' : 'NO'}`)
        console.log(`🔗 URL: https://aparcoyo-back.onrender.com/apa/usuarios/${userId}`)
        
        const response = await fetch(`https://aparcoyo-back.onrender.com/apa/usuarios/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log(`📨 Response status: ${response.status}`)
        console.log(`📨 Response OK: ${response.ok}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Response error: ${errorText}`)
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`✅ Usuario obtenido:`, data)
        
        setUsuario(data.data || data)
      } catch (err) {
        console.error('❌ Error completo:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        console.log('🏁 Finalizando fetch')
        setLoading(false)
      }
    }

    if (userId) {
      console.log(`🚀 useEffect ejecutado con userId: ${userId}`)
      fetchUser()
    } else {
      console.log('❌ No hay userId')
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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {/* Avatar con inicial */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {usuario.nombre?.charAt(0)?.toUpperCase() || usuario.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        
        {/* Información del usuario */}
        <div>
          <h1 className="text-2xl font-bold">{usuario.nombre || 'Sin nombre'}</h1>
          <p className="text-sm text-muted-foreground">{usuario.email}</p>
        </div>
      </div>

      {/* Botón eliminar */}
      <Button variant="destructive" size="sm">
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar
      </Button>
    </div>
  )
}

export default UserHeader