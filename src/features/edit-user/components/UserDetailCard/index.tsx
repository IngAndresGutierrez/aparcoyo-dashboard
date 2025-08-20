/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Upload, Eye, EyeOff } from "lucide-react"

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
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  
  // Estados para el formulario de edición
  const [editForm, setEditForm] = React.useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

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

        const userData = data.data || data
        setUsuario(userData)
        
        // Inicializar el formulario con los datos actuales
        setEditForm({
          nombre: userData.nombre || "",
          email: userData.email || "",
          password: "",
          confirmPassword: ""
        })
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que las contraseñas coincidan si se está cambiando
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken")
      
      // Preparar datos para enviar (solo incluir password si se está cambiando)
      const updateData: any = {
        nombre: editForm.nombre,
        email: editForm.email
      }
      
      if (editForm.password) {
        updateData.password = editForm.password
      }

      const response = await fetch(
        `https://aparcoyo-back.onrender.com/apa/usuarios/${userId}`,
        {
          method: "PUT", // o "PATCH" dependiendo de tu API
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData)
        }
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const updatedData = await response.json()
      
      // Actualizar el estado local
      setUsuario(updatedData.data || updatedData)
      setIsEditOpen(false)
      
      // Limpiar campos de contraseña
      setEditForm(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }))
      
      console.log("✅ Usuario actualizado correctamente")
      
    } catch (err) {
      console.error("❌ Error al actualizar usuario:", err)
      alert("Error al actualizar el usuario")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
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
        
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles del usuario</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {usuario.nombre?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex space-x-2">
                  <Button type="button" variant="ghost" size="sm" className="text-xs">
                    Eliminar foto
                  </Button>
                  <Button type="button" size="sm" className="text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Subir foto
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre" className="text-sm">
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm">
                    Cambiar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={editForm.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Cambiar contraseña"
                      className="mt-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm">
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={editForm.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirmar contraseña"
                      className="mt-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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