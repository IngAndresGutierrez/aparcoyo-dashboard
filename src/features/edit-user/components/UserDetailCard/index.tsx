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
import { Edit, Upload, Eye, EyeOff, Trash2 } from "lucide-react"
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
  foto?: string
}

const UserDetails: React.FC<UserDetailsProps> = ({ userId }) => {
  const [usuario, setUsuario] = React.useState<UsuarioDetalle | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  // 📸 Ref para el input file
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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
          `🔗 URL completa: https://kns.aparcoyo.com/apa/usuarios/${userId}`
        )
        console.log(`🔑 Token presente:`, !!token)

        const response = await fetch(
          `https://kns.aparcoyo.com/apa/usuarios/${userId}`,
          {
            method: "GET",
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
        console.log(
          `🔍 UserDetails - Estructura completa del usuario:`,
          JSON.stringify(userData, null, 2)
        )
        console.log(
          `📸 UserDetails - URL de la foto en userData:`,
          userData.foto
        )

        // 💾 Si el backend no devuelve la foto, intentar obtenerla del localStorage
        if (!userData.foto && userData.uid) {
          const savedFoto = localStorage.getItem(`foto_${userData.uid}`)
          console.log(
            `💾 UserDetails - Buscando foto en localStorage con key: foto_${userData.uid}`
          )
          console.log(
            `💾 UserDetails - Foto encontrada en localStorage:`,
            savedFoto
          )

          if (savedFoto) {
            userData.foto = savedFoto
            console.log(
              "✅ UserDetails - Foto recuperada del localStorage:",
              savedFoto
            )
          } else {
            console.log(
              "⚠️ UserDetails - No hay foto guardada en localStorage para este usuario"
            )
          }
        } else if (userData.foto) {
          console.log("✅ UserDetails - Foto viene del backend:", userData.foto)
        }

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

  // 📸 Función para subir foto de perfil
  const handleUploadPhoto = async (file: File) => {
    if (!usuario) {
      toast.error("Error: Usuario no disponible")
      return
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes")
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar 5MB")
      return
    }

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("authToken")

      const formData = new FormData()
      formData.append("foto", file) // ✅ Campo correcto confirmado

      toast.loading("Subiendo foto...", { id: "upload-photo" })

      const response = await fetch(
        `https://kns.aparcoyo.com/apa/usuarios/foto-perfil/${usuario.uid}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Error ${response.status}: ${response.statusText} - ${errorText}`
        )
      }

      const data = await response.json()
      console.log("✅ Foto actualizada - Respuesta completa:", data)
      console.log("✅ URL de la foto recibida:", data.data?.foto)

      const fotoUrl = data.data?.foto

      // 💾 Guardar la URL de la foto en localStorage como backup
      if (fotoUrl && usuario.uid) {
        localStorage.setItem(`foto_${usuario.uid}`, fotoUrl)
        console.log("💾 Foto guardada en localStorage")
      }

      // ⚠️ Actualizar el usuario con la URL de la foto que devuelve el backend
      setUsuario((prev) => {
        if (!prev) return prev

        return {
          ...prev,
          foto: fotoUrl, // ✅ Guardar la URL de la foto
          uid: prev.uid, // Mantener el uid
        }
      })

      toast.success("Foto actualizada correctamente", {
        id: "upload-photo",
        description: "Tu foto de perfil se ha actualizado",
        duration: 4000,
      })
    } catch (err: any) {
      console.error("❌ Error al subir foto:", err)

      let errorDescription = "No se pudo subir la foto"

      if (err.message.includes("401")) {
        errorDescription = "No tienes autorización"
      } else if (err.message.includes("413")) {
        errorDescription = "La imagen es demasiado grande"
      } else if (err.message.includes("415")) {
        errorDescription = "Formato de imagen no válido"
      }

      toast.error("Error al subir foto", {
        id: "upload-photo",
        description: errorDescription,
        duration: 5000,
      })
    }
  }

  // 🗑️ Función para eliminar foto de perfil (opcional)
  // 🗑️ Función para eliminar foto de perfil (desde el front)
  const handleDeletePhoto = () => {
    if (!usuario) return

    // Eliminar del localStorage
    localStorage.removeItem(`foto_${usuario.uid}`)

    // Actualizar el estado local
    setUsuario((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        foto: undefined,
      }
    })

    toast.success("Foto eliminada", {
      description: "La foto de perfil se ha eliminado",
      duration: 3000,
    })
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

    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.error = () => {}
    console.warn = () => {}

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

      toast.loading("Actualizando usuario...", {
        id: "update-user",
      })

      const url = `https://kns.aparcoyo.com/apa/usuarios/${usuario.uid}`

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
      const newUserData = updatedData.data || updatedData

      // Preservar la foto actual (manejada desde el front)
      setUsuario((prev) => ({
        ...newUserData,
        foto: prev?.foto,
      }))
      setIsEditOpen(false)

      setEditForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }))

      toast.success("Usuario actualizado correctamente", {
        id: "update-user",
        description: "Los cambios se han guardado exitosamente",
        duration: 4000,
      })
    } catch (err: any) {
      let errorTitle = "Error al actualizar usuario"
      let errorDescription = "Ha ocurrido un error inesperado"

      try {
        const errorString = String(err?.message || err || "")
        let backendData = null

        if (errorString.includes("{") && errorString.includes("}")) {
          const jsonMatch = errorString.match(/\{.*\}/)?.[0]
          if (jsonMatch) {
            try {
              backendData = JSON.parse(jsonMatch)
            } catch {}
          }
        }

        const statusCode =
          err?.status ||
          err?.statusCode ||
          (errorString.includes("400")
            ? 400
            : errorString.includes("401")
            ? 401
            : errorString.includes("403")
            ? 403
            : errorString.includes("404")
            ? 404
            : errorString.includes("500")
            ? 500
            : 0)

        let backendMessage = null
        if (backendData?.message) {
          if (Array.isArray(backendData.message)) {
            backendMessage = backendData.message[0]
          } else {
            backendMessage = backendData.message
          }
        }

        switch (statusCode) {
          case 400:
            errorTitle = "Datos inválidos"
            if (backendMessage) {
              errorDescription = backendMessage
            } else if (errorString.includes("contraseña")) {
              errorDescription =
                "La contraseña no cumple con los requisitos mínimos"
            } else {
              errorDescription = "Los datos proporcionados no son válidos"
            }
            break
          case 401:
            errorTitle = "Sin autorización"
            errorDescription =
              backendMessage || "No tienes permisos para realizar esta acción"
            break
          case 403:
            errorTitle = "Acceso denegado"
            errorDescription =
              backendMessage || "No tienes permisos para editar este usuario"
            break
          case 404:
            errorTitle = "Usuario no encontrado"
            errorDescription =
              backendMessage || "El usuario no existe en el sistema"
            break
          case 500:
            errorTitle = "Error del servidor"
            errorDescription =
              backendMessage ||
              "Error interno del servidor. Inténtalo más tarde"
            break
          default:
            if (backendMessage) {
              errorDescription = backendMessage
            }
        }
      } catch {
        errorTitle = "Error al actualizar usuario"
        errorDescription = "Ha ocurrido un error inesperado"
      }

      toast.error(errorTitle, {
        id: "update-user",
        description: errorDescription,
        duration: 6000,
      })
    } finally {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
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
              {/* Avatar Section con funcionalidad de upload */}
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={(usuario as any).foto || undefined}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      console.log("❌ Error cargando imagen del avatar")
                    }}
                    onLoad={() =>
                      console.log("✅ Imagen del avatar cargada correctamente")
                    }
                  />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {usuario.nombre?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Input file oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadPhoto(file)
                  }}
                />

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={handleDeletePhoto}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar foto
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="text-xs"
                    onClick={() => fileInputRef.current?.click()}
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
        </div>
      </CardContent>
    </Card>
  )
}

export default UserDetails
