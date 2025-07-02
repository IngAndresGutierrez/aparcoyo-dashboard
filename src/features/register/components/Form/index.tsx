"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEmailRegister } from "../../hooks/useRegister"

const RegisterForm = () => {
  const [rol, setRol] = useState("")
  const [errors, setErrors] = useState({ general: "" })

  const {
    onClickEmailButtonRegister,
    isLoading,
    error: registerError,
  } = useEmailRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      rol: formData.get("rol")?.toString().trim() || "",
      documento: formData.get("documento")?.toString().trim() || "",
      nombre: formData.get("nombre")?.toString().trim() || "",
      telefono: formData.get("telefono")?.toString().trim() || "",
      email: formData.get("email")?.toString().trim() || "",
      password: formData.get("password")?.toString().trim() || "",
      direccion: formData.get("direccion")?.toString().trim() || "",
      isActive: true,
    }

    const camposVacios = Object.values(data).some((v) => v === "")
    if (camposVacios) {
      setErrors({ general: "Todos los campos son obligatorios." })
      return
    }

    setErrors({ general: "" })
    onClickEmailButtonRegister(data)
  }

  return (
    <div className="flex justify-center items-center flex-col p-6">
      <h1 className="text-3xl font-bold text-primary mb-2 -mt-1">Regístrate</h1>
      <p className="mb-4 text-tertiary font-normal text-base">
        Bienvenido, acá te puedes registrar
      </p>

      <form
        className="grid grid-cols-2 gap-4 w-full max-w-4xl"
        onSubmit={handleSubmit}
      >
        {/* ROL */}
        <div>
          <Label
            className="mb-2 text-secondary"
            htmlFor="rol"
          >
            Rol
          </Label>
          <Select
            name="rol"
            onValueChange={(value) => setRol(value)}
          >
            <SelectTrigger className="w-full h-11 text-placeholder focus-visible:ring-0">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="hidden"
            name="rol"
            value={rol}
          />
        </div>

        {/* DOCUMENTO */}
        <div>
          <Label
            className="mb-2 text-secondary"
            htmlFor="documento"
          >
            Documento
          </Label>
          <input
            id="documento"
            name="documento"
            placeholder="Ej: 123456789"
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
          />
        </div>

        {/* NOMBRE */}
        <div>
          <Label
            className="mb-2 text-secondary"
            htmlFor="nombre"
          >
            Nombre
          </Label>
          <input
            id="nombre"
            name="nombre"
            placeholder="Ej: Alejandro Gutiérrez"
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
          />
        </div>

        {/* TELÉFONO */}
        <div>
          <Label
            className="mb-2 text-secondary"
            htmlFor="telefono"
          >
            Teléfono
          </Label>
          <input
            id="telefono"
            name="telefono"
            placeholder="Ej: 3103456567"
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
          />
        </div>

        {/* EMAIL */}
        <div>
          <Label
            className="mb-2 text-secondary"
            htmlFor="email"
          >
            Email
          </Label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="correo@ejemplo.com"
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
          />
        </div>

        {/* PASSWORD */}
        <div>
          <Label
            className="mb-2 text-secondary"
            htmlFor="password"
          >
            Contraseña
          </Label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Tu contraseña"
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
          />
        </div>

        {/* DIRECCIÓN */}
        <div className="col-span-2">
          <Label
            className="mb-2 text-secondary"
            htmlFor="direccion"
          >
            Dirección
          </Label>
          <input
            id="direccion"
            name="direccion"
            placeholder="Calle 123 #45-67"
            className="h-11 w-full text-placeholder border shadow-xs rounded-md bg-transparent outline-none placeholder:text-sm pl-3"
          />
        </div>

        {/* MENSAJES DE ERROR */}
        {errors.general && (
          <p className="col-span-2 text-sm text-red-500 mt-2 text-right">
            {errors.general}
          </p>
        )}
        {registerError && (
          <p className="col-span-2 text-sm text-red-500 mt-2 text-right">
            Error al registrarse. Inténtalo de nuevo.
          </p>
        )}

        {/* BOTÓN */}
        <div className="col-span-2 flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-solid text-white px-6 py-2 rounded-md transition w-101 h-11 mt-1 cursor-pointer"
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default RegisterForm
