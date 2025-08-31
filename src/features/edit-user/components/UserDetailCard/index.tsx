/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Upload, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

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
    confirmPassword: "",
  })

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken")

        console.log(
          `📡 Obteniendo detalles del usuario ${userId} con ruta de admin...`
        )
        console.log(
          `🔗 URL completa: https://aparcoyo-back.onrender.com/apa/usuarios/${userId}`
        )
        console.log(`🔑 Token presente:`, !!token)

        // 🔄 Probando con la ruta específica de admin que debería traer fecha
        const response = await fetch(
          `https://aparcoyo-back.onrender.com/apa/usuarios/${userId}`,
          {
            method: "GET", // Explicit GET method
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

        // 🔍 Debug completo del objeto usuario - buscando campos de fecha
        const userData = data.data || data
        console.log(
          `🔍 Estructura completa del usuario (ruta mi-perfil):`,
          JSON.stringify(userData, null, 2)
        )

        const dateFields = {
          fechaRegistro: userData.fechaRegistro,
          fechaCreacion: userData.fechaCreacion,
          createdAt: userData.createdAt,
          created_at: userData.created_at,
          dateCreated: userData.dateCreated,
          registro: userData.registro,
          timestamp: userData.timestamp,
          fecha: userData.fecha,
        }
        console.log(
          `📅 Campos de fecha encontrados:`,
          JSON.stringify(dateFields, null, 2)
        )
        console.log(
          `🗂️ Todas las propiedades del usuario:`,
          Object.keys(userData).join(", ")
        )
        setUsuario(userData)

        // Inicializar el formulario con los datos actuales
        setEditForm({
          nombre: userData.nombre || "",
          email: userData.email || "",
          password: "",
          confirmPassword: "",
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

  // ✅ Función para verificar si existe algún campo de fecha válido
  const hasValidDate = (usuario: UsuarioDetalle | null) => {
    if (!usuario) return false

    const possibleDateFields = [
      usuario.fechaRegistro,
      (usuario as any).fechaCreacion,
      (usuario as any).createdAt,
      (usuario as any).created_at,
      (usuario as any).dateCreated,
      (usuario as any).registro,
      (usuario as any).timestamp,
      (usuario as any).fecha,
    ]

    return possibleDateFields.some((field) => {
      if (!field) return false
      try {
        const date = new Date(field)
        return !isNaN(date.getTime()) && date.getFullYear() > 1900
      } catch {
        return false
      }
    })
  }

  // ✅ Función mejorada para formatear fechas con validación robusta
  const formatDate = (usuario: UsuarioDetalle | null) => {
    if (!usuario) return "Usuario no disponible"

    // 🔍 Intentar múltiples campos de fecha que el backend podría usar
    const possibleDateFields = [
      usuario.fechaRegistro,
      (usuario as any).fechaCreacion,
      (usuario as any).createdAt,
      (usuario as any).created_at,
      (usuario as any).dateCreated,
      (usuario as any).registro,
      (usuario as any).timestamp,
      (usuario as any).fecha,
    ]

    console.log(`🔍 Campos de fecha disponibles:`, possibleDateFields)

    for (const dateField of possibleDateFields) {
      if (dateField) {
        console.log(`✅ Usando campo de fecha:`, dateField)

        try {
          // Lista de posibles formatos que puede enviar el backend
          const possibleFormats = [
            dateField, // Formato original
            dateField.replace?.(/\//g, "-"), // Cambiar / por -
            dateField.split?.("T")[0], // Solo la fecha si viene con hora
          ]

          for (const format of possibleFormats) {
            if (!format) continue

            try {
              const date = new Date(format)

              // Verificar si la fecha es válida
              if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
                return date.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              }
            } catch (error) {
              continue
            }
          }
        } catch (error) {
          console.log(`❌ Error procesando fecha:`, dateField, error)
          continue
        }
      }
    }

    // Si ningún campo de fecha funcionó
    console.log("⚠️ No se encontró ninguna fecha válida en el usuario")
    return "Fecha no disponible"
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!usuario) {
      toast.error("Error: Datos de usuario no disponibles")
      return
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")

      const updateData: any = {
        nombre: editForm.nombre,
        email: editForm.email,
      }

      if (editForm.password) {
        updateData.password = editForm.password
      }

      // ✅ Toast de loading mientras se procesa
      toast.loading("Actualizando usuario...", {
        id: "update-user", // ID para poder actualizar este toast específico
      })

      const url = `https://aparcoyo-back.onrender.com/apa/usuarios/${usuario.uid}`

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Error ${response.status}: ${response.statusText} - ${errorText}`
        )
      }

      const updatedData = await response.json()

      setUsuario(updatedData.data || updatedData)
      setIsEditOpen(false)

      setEditForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }))

      // ✅ Toast de éxito elegante
      toast.success("Usuario actualizado correctamente", {
        id: "update-user", // Reemplaza el toast de loading
        description: "Los cambios se han guardado exitosamente",
        duration: 4000,
      })
    } catch (err) {
      console.error("❌ Error al actualizar usuario:", err)

      // ✅ Toast de error elegante
      toast.error("Error al actualizar usuario", {
        id: "update-user", // Reemplaza el toast de loading
        description:
          err instanceof Error
            ? err.message
            : "Ha ocurrido un error inesperado",
        duration: 5000,
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
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

        <Dialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalles del usuario</DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleEditSubmit}
              className="space-y-4"
            >
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {usuario.nombre?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Eliminar foto
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Subir foto
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="nombre"
                    className="text-sm"
                  >
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm"
                  >
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
                  <Label
                    htmlFor="password"
                    className="text-sm"
                  >
                    Cambiar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={editForm.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
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
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm"
                  >
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={editForm.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirmar contraseña"
                      className="mt-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-1 h-8 w-8 p-0"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                <Button type="submit">Guardar</Button>
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

          {/* Siempre mostrar fecha, con fallback si no existe */}
          {/* <div>
            <label className="text-sm font-medium text-muted-foreground">
              Fecha de registro
            </label>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasValidDate(usuario) ? formatDate(usuario) : "No registrada"}
            </p>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default UserDetails
