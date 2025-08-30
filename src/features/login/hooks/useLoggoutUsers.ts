// hooks/useUser.ts - MAPEO CORRECTO
"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const BASE_URL = "https://aparcoyo-back.onrender.com/apa"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      const payload = JSON.parse(atob(token.split(".")[1]))
      const userId = payload.uid

      const response = await axios.get(
        `${BASE_URL}/usuarios/perfil/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      // MAPEO CORRECTO según la estructura real del servidor
      const serverData = response.data.data // Los datos están en data.data

      setUser({
        id: serverData.uid,
        name: serverData.nombre, // El servidor usa 'nombre'
        email: serverData.email, // Aquí está tu adminyo@gmail.com
        avatar: serverData.fotoPerfil || serverData.avatar,
        role: serverData.rol, // El servidor usa 'rol'
      })

      console.log("Usuario final mapeado:", {
        name: serverData.nombre,
        email: serverData.email,
        role: serverData.rol,
      })
    } catch (error) {
      console.error("Error obteniendo usuario:", error)
      setError("Error cargando perfil")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return { user, loading, error, refetch: fetchUser }
}
